export type UserRole = 'student' | 'client' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'deactivated';
export type ExperienceLevel = 'entry' | 'intermediate' | 'expert';
export type BudgetType = 'hourly' | 'fixed';
export type ProjectType = 'one-time' | 'ongoing';
export type ProjectStatus = 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'paused';
export type ApplicationStatus = 'pending' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn' | 'completed';
export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone?: string;
  status: UserStatus;
  profile?: any;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
}

export interface StudentSkill {
  student_skill_id: number;
  skill_id: number;
  name: string;
  category: string;
  proficiency: SkillProficiency;
  years_of_experience: number;
}

export interface PortfolioItem {
  id: number;
  student_profile_id: number;
  title: string;
  description: string;
  project_url?: string;
  github_url?: string;
  image_url?: string;
  technologies?: string;
  created_at: string;
}

export interface Project {
  id: number;
  client_id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  budget_type: BudgetType;
  project_type: ProjectType;
  experience_level: ExperienceLevel;
  deadline?: string;
  status: ProjectStatus;
  additional_requirements?: string;
  location: string;
  created_at: string;
  updated_at: string;
  client_name?: string;
  client_avatar?: string;
  client_company?: string;
  client_location?: string;
  client_verified?: boolean;
  proposals_count?: number;
  has_applied?: boolean;
  required_skills?: Array<{ id: number; name: string; category?: string; is_mandatory: number }>;
  matchPercentage?: number;
  matchingSkills?: any[];
  missingSkills?: string[];
}

export interface Application {
  id: number;
  project_id: number;
  student_id: number;
  cover_letter: string;
  proposed_rate: number;
  delivery_time: string;
  relevant_experience?: string;
  portfolio_item_ids?: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  project_title?: string;
  project_category?: string;
  project_budget?: number;
  project_budget_type?: string;
  project_status?: string;
  client_name?: string;
  client_company?: string;
  client_location?: string;
  student_name?: string;
  student_email?: string;
  student_avatar?: string;
  student_university?: string;
  student_department?: string;
  student_experience_level?: string;
  student_bio?: string;
  student_skills?: Array<{ name: string; proficiency: string; years_of_experience: number }>;
  history?: Array<{
    id: number;
    previous_status: string;
    new_status: string;
    note: string;
    changed_by_name: string;
    created_at: string;
  }>;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: number;
  created_at: string;
}

export interface ReviewItem {
  id: number;
  project_id: number;
  reviewer_id: number;
  reviewee_id: number;
  reviewer_role: 'student' | 'client';
  rating: number;
  comment?: string;
  created_at: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
  project_title?: string;
}

export interface CandidateMatch {
  student: {
    id: number;
    name: string;
    email: string;
    avatar_url: string;
    university: string;
    department: string;
    experience_level: string;
    bio: string;
    github_url: string;
    linkedin_url: string;
  };
  matchPercentage: number;
  matchingSkills: Array<{ name: string; proficiency: string; years: number }>;
  missingSkills: string[];
  totalRequiredSkills: number;
  hasApplied: boolean;
  applicationStatus: string | null;
}
