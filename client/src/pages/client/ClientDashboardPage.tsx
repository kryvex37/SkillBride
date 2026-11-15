import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  CheckCircle2, 
  Clock, 
  Plus, 
  MoreVertical, 
  ExternalLink,
  PauseCircle,
  PlayCircle,
  Trash2,
  FileText,
  Star,
  Sparkles
} from 'lucide-react';
import { clientApi, projectApi } from '../../api/client';
import { Project } from '../../types';
import { useToast } from '../../context/ToastContext';

interface ClientDashboardPageProps {
  onNavigate: (tab: string, meta?: any) => void;
}

export const ClientDashboardPage: React.FC<ClientDashboardPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await clientApi.getDashboard();
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch {
      showToast('Failed to load client dashboard', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (projectId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'open' ? 'paused' : 'open';
    try {
      await projectApi.updateStatus(projectId, newStatus);
      showToast(`Project status changed to ${newStatus}`, 'success');
      loadData();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project listing?')) return;
    try {
      await projectApi.delete(projectId);
      showToast('Project deleted', 'info');
      loadData();
    } catch {
      showToast('Failed to delete project', 'error');
    }
  };

  const stats = dashboardData?.stats || {
    totalProjects: 0,
    activeProjects: 0,
    totalApplications: 0,
    totalHired: 0
  };

  const projects: Project[] = dashboardData?.projects || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
            Client Portal
          </span>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
            Client Dashboard & Projects
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your project requests, evaluate student applicants, and discover top campus talent.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('publish-project')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Post a New Project</span>
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-slate-500">Published Projects</span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{stats.totalProjects}</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-slate-500">Active Listings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{stats.activeProjects}</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-slate-500">Student Proposals</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{stats.totalApplications}</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-slate-500">Hired Students</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{stats.totalHired}</span>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Posted Projects</h2>
            <p className="text-xs text-slate-500">Click on any project to review applicant proposals or run the AI candidate matcher.</p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center">
            <Briefcase className="w-12 h-12 mb-2 stroke-1 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No projects posted yet</p>
            <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
              Publish your first project request and start receiving competitive proposals from university talent.
            </p>
            <button
              onClick={() => onNavigate('publish-project')}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
            >
              Post a Project Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Project Title & Category</th>
                  <th className="py-4 px-4">Budget</th>
                  <th className="py-4 px-4">Proposals</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{proj.title}</span>
                        <div className="flex items-center gap-2 text-slate-500 mt-0.5">
                          <span>{proj.category}</span>
                          <span>•</span>
                          <span className="capitalize">{proj.experience_level}</span>
                          <span>•</span>
                          <span>{new Date(proj.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">
                      ${proj.budget.toFixed(2)}
                      <span className="text-[11px] font-normal text-slate-400 block capitalize">
                        {proj.budget_type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-800">
                        {proj.proposals_count || 0}
                      </span>
                      <span className="text-slate-400 ml-1">applicants</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                        proj.status === 'open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        proj.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        proj.status === 'completed' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {proj.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Review Applicants */}
                        <button
                          onClick={() => onNavigate('project-applicants', { projectId: proj.id })}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Applicants ({proj.proposals_count || 0})</span>
                        </button>

                        {/* Candidate Matcher Shortcut */}
                        <button
                          onClick={() => onNavigate('client-candidates', { projectId: proj.id })}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition"
                          title="View skill-matched candidates"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Match</span>
                        </button>

                        {/* Pause / Open Toggle */}
                        {proj.status !== 'completed' && (
                          <button
                            onClick={() => handleToggleStatus(proj.id, proj.status)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            title={proj.status === 'open' ? 'Pause project' : 'Open project'}
                          >
                            {proj.status === 'open' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(proj.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
