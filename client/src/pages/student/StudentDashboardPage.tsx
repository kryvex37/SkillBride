import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  TrendingUp, 
  ArrowRight,
  FileText,
  Star,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentApi, applicationApi } from '../../api/client';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ProjectDetailModal } from '../../components/projects/ProjectDetailModal';
import { ApplyModal } from '../../components/projects/ApplyModal';
import { Project } from '../../types';

export const StudentDashboardPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Project[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const [profRes, recRes, appsRes] = await Promise.all([
        studentApi.getProfile(),
        studentApi.getRecommendations(),
        applicationApi.getMyApplications()
      ]);

      if (profRes.data.success) setProfileData(profRes.data.data);
      if (recRes.data.success) setRecommendations(recRes.data.data.slice(0, 4));
      if (appsRes.data.success) setRecentApplications(appsRes.data.data.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = profileData?.stats || {
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    completedProjects: 0,
    averageRating: null
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 block">
              Student Career Dashboard
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-2">
              Welcome back, {user?.first_name || 'Akmal'}! 👋
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Discover real-world client projects, expand your university portfolio, and turn your academic knowledge into professional freelance earnings.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-lg">
              {profileData?.profile_completed || 90}%
            </div>
            <div>
              <span className="text-xs text-slate-300 block">Profile Strength</span>
              <span className="text-sm font-bold text-white">All Star Profile</span>
              <button
                onClick={() => onNavigate('student-profile')}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 block font-semibold mt-0.5"
              >
                Complete profile →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Key Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-slate-500">Total Proposals</span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {stats.totalApplications}
            </span>
            <span className="text-xs text-slate-400">submitted</span>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-slate-500">In Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {stats.pendingApplications}
            </span>
            <span className="text-xs text-amber-600 font-semibold">active</span>
          </div>
        </div>

        {/* Accepted / Hired */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-slate-500">Accepted & Hired</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {stats.acceptedApplications}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">contracts</span>
          </div>
        </div>

        {/* Completed Projects / Reviews */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-slate-500">Client Rating</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {stats.averageRating ? `${stats.averageRating}` : '5.0'}
            </span>
            <span className="text-xs text-slate-400">
              ({stats.completedProjects || 1} completed)
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recommended Projects & Recent Application Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended for Your Skills (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Recommended For Your Skills
              </h2>
            </div>
            <button
              onClick={() => onNavigate('recommendations')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
            >
              <span>View all recommendations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map((proj) => (
              <ProjectCard
                key={proj.id}
                project={proj}
                onViewDetails={(p) => { setSelectedProject(p); setIsDetailOpen(true); }}
                onApply={(p) => { setSelectedProject(p); setIsApplyOpen(true); }}
                isGridView={true}
              />
            ))}
          </div>
        </div>

        {/* Recent Applications Sidebar (1 Col) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-slate-900">
              Recent Proposals
            </h2>
            <button
              onClick={() => onNavigate('my-proposals')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
            >
              See all
            </button>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col gap-3">
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No proposals submitted yet. Start browsing to find your first client!
              </div>
            ) : (
              recentApplications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => onNavigate('my-proposals')}
                  className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition cursor-pointer flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">
                      {app.project_title}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                      app.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'shortlisted' ? 'bg-indigo-100 text-indigo-800' :
                      app.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{app.client_company || app.client_name}</span>
                    <span className="font-semibold text-slate-700">${app.proposed_rate}</span>
                  </div>
                </div>
              ))
            )}

            <button
              onClick={() => onNavigate('browse')}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition mt-2 shadow-xs"
            >
              Explore New Opportunities
            </button>
          </div>
        </div>
      </div>

      <ProjectDetailModal
        project={selectedProject}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onApply={(p) => { setSelectedProject(p); setIsApplyOpen(true); }}
        isStudent={true}
      />

      <ApplyModal
        project={selectedProject}
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onSuccess={loadDashboard}
      />
    </div>
  );
};
