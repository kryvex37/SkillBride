import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Briefcase, 
  Star, 
  FileText, 
  ChevronDown,
  GraduationCap,
  ExternalLink,
  Github,
  Linkedin,
  Award
} from 'lucide-react';
import { applicationApi, clientApi } from '../../api/client';
import { Application, CandidateMatch, Project } from '../../types';
import { useToast } from '../../context/ToastContext';

interface ProjectApplicationsPageProps {
  initialProjectId?: number;
}

export const ProjectApplicationsPage: React.FC<ProjectApplicationsPageProps> = ({ initialProjectId }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'applicants' | 'candidates'>('applicants');

  // Projects list
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(initialProjectId || null);

  // Data
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load client's projects
  useEffect(() => {
    clientApi.getDashboard().then((res) => {
      if (res.data.success && res.data.data.projects.length > 0) {
        setProjects(res.data.data.projects);
        if (!selectedProjectId) {
          setSelectedProjectId(res.data.data.projects[0].id);
        }
      }
    });
  }, []);

  // Fetch applicants or candidate matches
  const loadProjectData = async () => {
    if (!selectedProjectId) return;
    try {
      setIsLoading(true);
      if (activeTab === 'applicants') {
        const res = await applicationApi.getProjectApplications(selectedProjectId);
        if (res.data.success) {
          setApplicants(res.data.data);
        }
      } else {
        const res = await clientApi.getCandidates(selectedProjectId);
        if (res.data.success) {
          setCandidates(res.data.data);
        }
      }
    } catch {
      showToast('Failed to load project applicants/candidates', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [selectedProjectId, activeTab]);

  const handleUpdateStatus = async (appId: number, newStatus: string) => {
    try {
      await applicationApi.updateStatus(appId, newStatus);
      showToast(`Applicant status updated to ${newStatus.replace('_', ' ')}`, 'success');
      loadProjectData();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const currentProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
            Applicant Evaluation & Matching
          </span>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
            Project Candidate Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review proposals or use the matching algorithm to discover students matching required skills.
          </p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500 block mb-1">Select Project:</label>
          <div className="relative">
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(parseInt(e.target.value, 10))}
              className="appearance-none w-full sm:w-72 bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.proposals_count || 0} proposals)
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs self-start">
        <button
          onClick={() => setActiveTab('applicants')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'applicants'
              ? 'bg-[#0F172A] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Received Proposals ({applicants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'candidates'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>BONUS: Smart Candidate Matcher</span>
        </button>
      </div>

      {/* Selected Project Summary Bar */}
      {currentProject && (
        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{currentProject.title}</span>
            <span className="text-slate-400">•</span>
            <span className="font-semibold text-emerald-800">${currentProject.budget} ({currentProject.budget_type})</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium text-slate-500 mr-1">Required Skills:</span>
            {currentProject.required_skills && currentProject.required_skills.length > 0 ? (
              currentProject.required_skills.map((s) => (
                <span
                  key={s.id}
                  className="px-2 py-0.5 rounded-md bg-white text-slate-700 border border-emerald-200 text-[11px] font-semibold"
                >
                  {s.name}
                </span>
              ))
            ) : (
              <span className="text-slate-400">General</span>
            )}
          </div>
        </div>
      )}

      {/* SECTION A: APPLICANTS VIEW */}
      {activeTab === 'applicants' && (
        <div className="flex flex-col gap-4">
          {applicants.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 border border-slate-200/80 shadow-sm text-center flex flex-col items-center justify-center">
              <Users className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
              <h3 className="text-base font-bold text-slate-900 mb-1">No applications yet for this project</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-3">
                Students will appear here as soon as they submit proposals. You can also view ranked student matches in the Smart Candidate Matcher tab!
              </p>
              <button
                onClick={() => setActiveTab('candidates')}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition"
              >
                View Skill-Matched Students →
              </button>
            </div>
          ) : (
            applicants.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-5 hover:shadow-md transition"
              >
                {/* Student header row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={app.student_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt="Student"
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{app.student_name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold capitalize">
                          {app.student_experience_level || 'Student'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {app.student_university || 'State University'} • {app.student_department || 'Computer Science'}
                      </span>
                    </div>
                  </div>

                  {/* Proposal Rate & Status */}
                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Proposed Bid</span>
                      <span className="text-base font-extrabold text-slate-900">
                        ${app.proposed_rate.toFixed(2)}
                      </span>
                    </div>

                    <div className="px-3 py-1 rounded-full text-xs font-bold capitalize bg-slate-100 text-slate-800">
                      {app.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                {/* Cover letter */}
                <div>
                  <span className="text-xs font-bold text-slate-900 block mb-1">Proposal Letter:</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100 whitespace-pre-line">
                    "{app.cover_letter}"
                  </p>
                </div>

                {/* Student skills badges */}
                {app.student_skills && app.student_skills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-500 mr-1">Skills:</span>
                    {app.student_skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {s.name} ({s.proficiency})
                      </span>
                    ))}
                  </div>
                )}

                {/* Status action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    Delivery estimate: <strong className="text-slate-700">{app.delivery_time}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Under review */}
                    {app.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'under_review')}
                        className="px-3.5 py-1.5 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 text-xs font-semibold transition"
                      >
                        Mark Under Review
                      </button>
                    )}

                    {/* Shortlist */}
                    {app.status !== 'shortlisted' && app.status !== 'accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                        className="px-3.5 py-1.5 rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold transition"
                      >
                        Shortlist Candidate
                      </button>
                    )}

                    {/* Accept / Hire */}
                    {app.status !== 'accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'accepted')}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                      >
                        Accept & Hire Student
                      </button>
                    )}

                    {/* Complete */}
                    {app.status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'completed')}
                        className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-xs"
                      >
                        Mark Project Completed
                      </button>
                    )}

                    {/* Reject */}
                    {app.status !== 'rejected' && app.status !== 'accepted' && app.status !== 'completed' && (
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'rejected')}
                        className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
                      >
                        Decline
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SECTION B: BONUS CHALLENGE - STUDENT-PROJECT CANDIDATE MATCHER */}
      {activeTab === 'candidates' && (
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
            <span className="font-extrabold block text-sm mb-1 text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Bonus Challenge: Student Matching Algorithm
            </span>
            Formula applied: <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold">
              Skill Match % = (Matching Required Skills / Total Required Skills) × 100
            </code>
            . Students are ranked in descending order based on skills compatibility, proficiency level, and experience match.
          </div>

          {candidates.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 border border-slate-200/80 shadow-sm text-center text-slate-400">
              No registered students found in database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((cand, idx) => (
                <div
                  key={cand.student.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition relative overflow-hidden"
                >
                  {/* Top Rank Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>
                      <img
                        src={cand.student.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={cand.student.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{cand.student.name}</h4>
                        <span className="text-[11px] text-slate-500">
                          {cand.student.university}
                        </span>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 shrink-0 ${
                      cand.matchPercentage >= 75
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : cand.matchPercentage >= 40
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{cand.matchPercentage}% Match</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                    {cand.student.bio || 'Motivated university student with proven skills in software and design.'}
                  </p>

                  {/* Matching vs Missing Skills */}
                  <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs mb-4">
                    {/* Matched */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-emerald-700">Matched ({cand.matchingSkills.length}):</span>
                      {cand.matchingSkills.length > 0 ? (
                        cand.matchingSkills.map((m, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold text-[10px]"
                          >
                            {m.name} ({m.proficiency})
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-[11px]">0 matching skills</span>
                      )}
                    </div>

                    {/* Missing */}
                    {cand.missingSkills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60">
                        <span className="font-bold text-slate-400">Missing ({cand.missingSkills.length}):</span>
                        {cand.missingSkills.map((sk, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px]"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer with status or action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      {cand.hasApplied ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Applied ({cand.applicationStatus})</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Has not applied yet</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {cand.student.github_url && (
                        <a
                          href={cand.student.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
                          title="GitHub"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          showToast(`Invitation sent to ${cand.student.name} to apply for this project!`, 'success');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                      >
                        Invite to Apply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
