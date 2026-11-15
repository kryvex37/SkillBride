import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Ban, 
  Check, 
  TrendingUp, 
  Star,
  Search,
  MessageSquare
} from 'lucide-react';
import { adminApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'projects' | 'reviews' | 'reports'>('overview');
  const [overviewData, setOverviewData] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // User Filter
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ovRes, uRes, revRes, repRes] = await Promise.all([
        adminApi.getOverview(),
        adminApi.getUsers(),
        adminApi.getReviews(),
        adminApi.getReports()
      ]);

      if (ovRes.data.success) setOverviewData(ovRes.data.data);
      if (uRes.data.success) setUsersList(uRes.data.data);
      if (revRes.data.success) setReviewsList(revRes.data.data);
      if (repRes.data.success) setReportsList(repRes.data.data);
    } catch {
      showToast('Failed to load administrative data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await adminApi.toggleUserStatus(userId, newStatus);
      showToast(`User status set to ${newStatus}`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update user status', 'error');
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to permanently delete this project listing?')) return;
    try {
      await adminApi.deleteProject(projectId);
      showToast('Project removed by admin', 'info');
      loadData();
    } catch {
      showToast('Failed to delete project', 'error');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to remove this review?')) return;
    try {
      await adminApi.deleteReview(reviewId);
      showToast('Review removed', 'info');
      loadData();
    } catch {
      showToast('Failed to delete review', 'error');
    }
  };

  const handleResolveReport = async (reportId: number, status: 'resolved' | 'dismissed') => {
    try {
      await adminApi.resolveReport(reportId, status, `Reviewed and ${status} by administrator.`);
      showToast(`Report marked as ${status}`, 'success');
      loadData();
    } catch {
      showToast('Failed to resolve report', 'error');
    }
  };

  const metrics = overviewData?.metrics || {
    totalStudents: 0,
    totalClients: 0,
    totalProjects: 0,
    totalApplications: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingReports: 0
  };

  const filteredUsers = usersList.filter(u => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const term = userSearch.toLowerCase();
      return (
        u.first_name.toLowerCase().includes(term) ||
        u.last_name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
            Superuser Control Center
          </span>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
            Platform Administration Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            SE331 Capstone Project evaluation console: User governance, project moderation, review oversight & dispute resolution.
          </p>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeSection === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSection('users')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeSection === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Users ({usersList.length})
          </button>
          <button
            onClick={() => setActiveSection('reviews')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeSection === 'reviews' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reviews ({reviewsList.length})
          </button>
          <button
            onClick={() => setActiveSection('reports')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSection === 'reports' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Reports ({metrics.pendingReports})</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: OVERVIEW & ANALYTICS */}
      {activeSection === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Total Students</span>
              <span className="text-2xl font-extrabold text-slate-900">{metrics.totalStudents}</span>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Registered Clients</span>
              <span className="text-2xl font-extrabold text-slate-900">{metrics.totalClients}</span>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Total Projects</span>
              <span className="text-2xl font-extrabold text-slate-900">{metrics.totalProjects}</span>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Total Applications</span>
              <span className="text-2xl font-extrabold text-slate-900">{metrics.totalApplications}</span>
            </div>
          </div>

          {/* Charts & Analytics Visual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-900">Projects by Category</h3>
              <div className="flex flex-col gap-3">
                {overviewData?.categoryStats?.map((c: any, i: number) => {
                  const pct = Math.round((c.count / (metrics.totalProjects || 1)) * 100);
                  return (
                    <div key={i} className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>{c.category}</span>
                        <span>{c.count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.max(8, pct)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Application Funnel Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-900">Application Pipeline Status</h3>
              <div className="flex flex-col gap-3">
                {overviewData?.applicationStats?.map((a: any, i: number) => {
                  const pct = Math.round((a.count / (metrics.totalApplications || 1)) * 100);
                  return (
                    <div key={i} className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between font-semibold text-slate-700 capitalize">
                        <span>{a.status.replace('_', ' ')}</span>
                        <span>{a.count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.max(8, pct)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Registrations Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Registrations</h3>
              <button
                onClick={() => setActiveSection('users')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                View all users →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="py-3 px-6">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-6">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overviewData?.recentUsers?.map((u: any) => (
                    <tr key={u.id}>
                      <td className="py-3 px-6 font-bold text-slate-900">
                        {u.first_name} {u.last_name}
                        <span className="text-slate-400 font-normal block">{u.email}</span>
                      </td>
                      <td className="py-3 px-4 capitalize font-semibold text-slate-700">
                        {u.role}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-slate-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: USERS DIRECTORY */}
      {activeSection === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          {/* Controls */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="client">Clients</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <span className="text-xs text-slate-400 font-medium">
              Showing {filteredUsers.length} users
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-3.5 px-6">User Details</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Affiliation / Company</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={u.first_name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{u.first_name} {u.last_name}</span>
                          <span className="text-slate-400 text-[11px]">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 capitalize font-bold text-slate-800">
                      {u.role}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {u.role === 'student' ? (u.university || 'State University') : (u.company_name || 'Client Venture')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            u.status === 'active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend Account' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: REVIEWS MODERATION */}
      {activeSection === 'reviews' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">User Reviews Moderation Queue</h3>
            <p className="text-xs text-slate-500">Monitor peer reviews and eliminate abusive or fraudulent evaluations.</p>
          </div>

          <div className="divide-y divide-slate-100">
            {reviewsList.map((rev) => (
              <div key={rev.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50">
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rev.reviewer_name}</span>
                    <span className="text-slate-400">reviewed</span>
                    <span className="font-bold text-emerald-700">{rev.reviewee_name}</span>
                    <div className="flex items-center text-amber-400 ml-2">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 my-1">
                    "{rev.comment}"
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Project: {rev.project_title} • {new Date(rev.created_at).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteReview(rev.id)}
                  className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Review</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: REPORTS QUEUE */}
      {activeSection === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Reported Content Queue</h3>
            <p className="text-xs text-slate-500">Resolve disputes and policy violations reported by members.</p>
          </div>

          <div className="divide-y divide-slate-100">
            {reportsList.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No reports submitted at this time.
              </div>
            ) : (
              reportsList.map((rep) => (
                <div key={rep.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50">
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold uppercase text-[10px]">
                        {rep.reported_type}
                      </span>
                      <span className="font-bold text-slate-900">{rep.reason}</span>
                      <span className="text-slate-400">• By {rep.reporter_name}</span>
                    </div>
                    {rep.details && (
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs my-1">
                        "{rep.details}"
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400">
                      Status: <strong className="capitalize text-slate-700">{rep.status}</strong> • {new Date(rep.created_at).toLocaleString()}
                    </span>
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'resolved')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'dismissed')}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
