import { db } from '../db/connection.js';

interface SkillRow {
  skill_id: number;
  skill_name: string;
  category: string;
  is_mandatory?: number;
  proficiency?: string;
  years_of_experience?: number;
}

export class RecommendationService {
  /**
   * Recommends projects for a student based on skill matching, proficiency & experience level
   */
  static getRecommendedProjectsForStudent(studentUserId: number, limit: number = 10) {
    // 1. Get student profile and skills
    const profileStmt = db.prepare('SELECT id, experience_level FROM student_profiles WHERE user_id = ?');
    const profile = profileStmt.get(studentUserId) as { id: number; experience_level: string } | undefined;

    if (!profile) return [];

    const studentSkillsStmt = db.prepare(`
      SELECT s.id as skill_id, LOWER(s.name) as skill_name, s.name as original_name, ss.proficiency, ss.years_of_experience
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.student_profile_id = ?
    `);
    const studentSkills = studentSkillsStmt.all(profile.id) as any[];

    if (studentSkills.length === 0) {
      // If student has no skills recorded yet, return latest open projects
      const fallbackStmt = db.prepare(`
        SELECT p.*, u.first_name || ' ' || u.last_name as client_name, cp.company_name as client_company,
               cp.is_verified as client_verified,
               (SELECT COUNT(*) FROM applications WHERE project_id = p.id) as proposals_count
        FROM projects p
        JOIN users u ON p.client_id = u.id
        LEFT JOIN client_profiles cp ON cp.user_id = u.id
        WHERE p.status = 'open'
        ORDER BY p.created_at DESC
        LIMIT ?
      `);
      const fallbackProjects = fallbackStmt.all(limit) as any[];
      return fallbackProjects.map(proj => ({
        ...proj,
        matchPercentage: 0,
        matchingSkills: [],
        missingSkills: [],
        required_skills: this.getProjectSkills(proj.id)
      }));
    }

    const studentSkillMap = new Map<string, { proficiency: string; years: number }>();
    studentSkills.forEach(s => {
      studentSkillMap.set(s.skill_name.trim(), {
        proficiency: s.proficiency,
        years: s.years_of_experience
      });
    });

    // 2. Fetch all open projects
    const openProjectsStmt = db.prepare(`
      SELECT p.*, u.first_name || ' ' || u.last_name as client_name, cp.company_name as client_company,
             cp.is_verified as client_verified,
             (SELECT COUNT(*) FROM applications WHERE project_id = p.id) as proposals_count
      FROM projects p
      JOIN users u ON p.client_id = u.id
      LEFT JOIN client_profiles cp ON cp.user_id = u.id
      WHERE p.status = 'open'
    `);
    const openProjects = openProjectsStmt.all() as any[];

    const scoredProjects: any[] = [];

    for (const proj of openProjects) {
      const projSkills = this.getProjectSkills(proj.id);
      if (projSkills.length === 0) continue;

      const matchingSkills: any[] = [];
      const missingSkills: any[] = [];

      let rawScore = 0;
      let totalWeight = 0;

      for (const reqSkill of projSkills) {
        const normName = reqSkill.name.toLowerCase().trim();
        const weight = reqSkill.is_mandatory ? 1.5 : 1.0;
        totalWeight += weight;

        if (studentSkillMap.has(normName)) {
          const studentData = studentSkillMap.get(normName)!;
          // Proficiency multiplier
          let profMultiplier = 1.0;
          if (studentData.proficiency === 'expert') profMultiplier = 1.15;
          else if (studentData.proficiency === 'advanced') profMultiplier = 1.1;
          else if (studentData.proficiency === 'beginner') profMultiplier = 0.85;

          rawScore += weight * profMultiplier;
          matchingSkills.push({
            name: reqSkill.name,
            proficiency: studentData.proficiency
          });
        } else {
          missingSkills.push(reqSkill.name);
        }
      }

      // Experience level adjustment
      let expBonus = 0;
      if (proj.experience_level === profile.experience_level) {
        expBonus = 5;
      }

      const matchPercent = Math.min(100, Math.round(((rawScore / totalWeight) * 95) + expBonus));

      scoredProjects.push({
        ...proj,
        matchPercentage: matchPercent,
        matchingSkills,
        missingSkills,
        required_skills: projSkills
      });
    }

    // Sort descending by match percentage, then newest
    scoredProjects.sort((a, b) => b.matchPercentage - a.matchPercentage || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return scoredProjects.slice(0, limit);
  }

  /**
   * BONUS CHALLENGE:
   * Candidate Student Matcher for Clients
   * Given a project, returns ranked students with match %, matching skills, and missing skills.
   */
  static getRankedCandidateStudentsForProject(projectId: number) {
    const projectStmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    const project = projectStmt.get(projectId) as any;
    if (!project) return [];

    const reqSkills = this.getProjectSkills(projectId);
    if (reqSkills.length === 0) return [];

    // Get all students
    const studentsStmt = db.prepare(`
      SELECT u.id as user_id, u.first_name, u.last_name, u.email, u.avatar_url,
             sp.id as profile_id, sp.university, sp.department, sp.experience_level, sp.bio, sp.github_url, sp.linkedin_url
      FROM users u
      JOIN student_profiles sp ON sp.user_id = u.id
      WHERE u.role = 'student' AND u.status = 'active'
    `);
    const students = studentsStmt.all() as any[];

    const candidates: any[] = [];

    for (const student of students) {
      const studentSkillsStmt = db.prepare(`
        SELECT s.id as skill_id, LOWER(s.name) as skill_name, s.name as original_name, ss.proficiency, ss.years_of_experience
        FROM student_skills ss
        JOIN skills s ON ss.skill_id = s.id
        WHERE ss.student_profile_id = ?
      `);
      const studentSkills = studentSkillsStmt.all(student.profile_id) as any[];

      const studentSkillMap = new Map<string, any>();
      studentSkills.forEach(s => {
        studentSkillMap.set(s.skill_name.trim(), s);
      });

      const matchingSkills: any[] = [];
      const missingSkills: any[] = [];

      let matchingCount = 0;

      for (const req of reqSkills) {
        const norm = req.name.toLowerCase().trim();
        if (studentSkillMap.has(norm)) {
          const matchData = studentSkillMap.get(norm);
          matchingCount++;
          matchingSkills.push({
            name: req.name,
            proficiency: matchData.proficiency,
            years: matchData.years_of_experience
          });
        } else {
          missingSkills.push(req.name);
        }
      }

      // Formula: (Number of matching required skills / Total required skills) * 100
      let matchPercentage = Math.round((matchingCount / reqSkills.length) * 100);

      // Proficiency and Experience bonus
      if (matchingCount > 0 && student.experience_level === project.experience_level) {
        matchPercentage = Math.min(100, matchPercentage + 5);
      }

      // Check if student has already applied
      const appCheckStmt = db.prepare('SELECT id, status FROM applications WHERE project_id = ? AND student_id = ?');
      const existingApplication = appCheckStmt.get(projectId, student.user_id) as any;

      candidates.push({
        student: {
          id: student.user_id,
          name: `${student.first_name} ${student.last_name}`,
          email: student.email,
          avatar_url: student.avatar_url,
          university: student.university,
          department: student.department,
          experience_level: student.experience_level,
          bio: student.bio,
          github_url: student.github_url,
          linkedin_url: student.linkedin_url
        },
        matchPercentage,
        matchingSkills,
        missingSkills,
        totalRequiredSkills: reqSkills.length,
        hasApplied: !!existingApplication,
        applicationStatus: existingApplication ? existingApplication.status : null
      });
    }

    // Rank highest match first
    candidates.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return candidates;
  }

  private static getProjectSkills(projectId: number): any[] {
    const stmt = db.prepare(`
      SELECT s.id, s.name, s.category, prs.is_mandatory
      FROM project_required_skills prs
      JOIN skills s ON prs.skill_id = s.id
      WHERE prs.project_id = ?
    `);
    return stmt.all(projectId) as any[];
  }
}
