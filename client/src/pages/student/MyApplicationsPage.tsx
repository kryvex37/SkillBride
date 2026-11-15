import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Eye, 
  Star, 
  AlertCircle,
  History,
  Building2,
  DollarSign
} from 'lucide-react';
import { applicationApi } from '../../api/client';
import { Application } from '../../types';
import { ReviewModal } from '../../components/reviews/ReviewModal';
import { useToast } from '../../context/ToastContext';

export const MyApplicationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status History Modal State
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Review Modal State
  const [reviewApp, setReviewApp] = useState<Application | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const res = await applicationApi.getMyApplications();
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch {
      showToast('Failed to load applications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (appId: number) => {
    if (!confirm('Are you sure you want to withdraw this application? This cannot be undone.')) return;
    try {
      await applicationApi.updateStatus(appId, 'withdrawn', 'Application withdrawn by student');
      showToast('Application withdrawn successfully', 'info');
      fetchApplications();
    } catch (err: any) {
      showToast('Failed to withdraw application', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Hired / Accepted
          </span>
        );
      case 'shortlisted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Shortlisted
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Under Review
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Declined
          </span>
        );
      case 'withdrawn':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
            Withdrawn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            <Clock className="w-3 h-3 text-slate-400" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
            Application Tracker
          </span>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
            My Submitted Proposals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status updates, client reviews, and application timeline histories.
          </p>
        </div>
        <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700">
          Total Proposals: <span className="text-slate-900 font-extrabold">{applications.length}</span>
        </div>
      </div>

      {/* Applications Table / Cards */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200/80 shadow-sm text-center flex flex-col items-center justify-center">
          <FileText className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No proposals submitted yet</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Discover open client projects in the Find Projects tab and submit your proposal!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Project Title & Client</th>
                  <th className="py-4 px-4">Proposed Rate</th>
                  <th className="py-4 px-4">Applied Date</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">
                          {app.project_title}
                        </span>
                        <div className="flex items-center gap-2 text-slate-500 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.client_company || app.client_name}</span>
                          <span>•</span>
                          <span>{app.delivery_time}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">
                      ${app.proposed_rate.toFixed(2)}
                      <span className="text-[11px] font-normal text-slate-400 block">
                        Client budget: ${app.project_budget}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium">
                      {new Date(app.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Timeline / Details Button */}
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setIsHistoryModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 transition"
                          title="View application timeline"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>Timeline</span>
                        </button>

                        {/* Completed Project -> Review Client Button */}
                        {app.status === 'completed' && (
                          <button
                            onClick={() => {
                              setReviewApp(app);
                              setIsReviewModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1 transition shadow-xs"
                          >
                            <Star className="w-3.5 h-3.5 fill-white" />
                            <span>Review Client</span>
                          </button>
                        )}

                        {/* Withdraw button if pending */}
                        {['pending', 'under_review'].includes(app.status) && (
                          <button
                            onClick={() => handleWithdraw(app.id)}
                            className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status History Timeline Modal */}
      {isHistoryModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 lg:p-8 flex flex-col gap-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                  Status History & Cover Letter
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedApp.project_title}
                </h3>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                ✕
              </button>
            </div>

            {/* Cover letter quote */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Your Submitted Proposal:</span>
              <p className="text-slate-600 leading-relaxed italic whitespace-pre-line">
                "{selectedApp.cover_letter}"
              </p>
            </div>

            {/* Timeline */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-900">Status Update Timeline</span>
              <div className="relative pl-6 flex flex-col gap-4 border-l-2 border-emerald-100 ml-2">
                {selectedApp.history && selectedApp.history.length > 0 ? (
                  selectedApp.history.map((h, i) => (
                    <div key={h.id || i} className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 capitalize">
                          {h.new_status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(h.created_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {h.note || `Changed by ${h.changed_by_name}`}
                      </p>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Initial submission recorded.</span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && reviewApp && (
        <ReviewModal
          projectId={reviewApp.project_id}
          projectTitle={reviewApp.project_title || ''}
          revieweeId={reviewApp.student_id === reviewApp.project_budget ? 0 : 5 /* client id */}
          revieweeName={reviewApp.client_company || reviewApp.client_name || 'Client'}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={fetchApplications}
        />
      )}
    </div>
  );
};
