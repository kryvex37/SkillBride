import React, { useState } from 'react';
import { X, Send, DollarSign, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { Project } from '../../types';
import { applicationApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

interface ApplyModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  project,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { showToast } = useToast();
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState<number | string>(project?.budget || 20);
  const [deliveryTime, setDeliveryTime] = useState('7 days');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync default rate when project changes
  React.useEffect(() => {
    if (project) {
      setProposedRate(project.budget);
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      showToast('Please provide a cover letter explaining why you are a great fit.', 'warning');
      return;
    }
    if (!proposedRate || Number(proposedRate) <= 0) {
      showToast('Please specify a valid proposed rate.', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await applicationApi.apply({
        project_id: project.id,
        cover_letter: coverLetter.trim(),
        proposed_rate: parseFloat(String(proposedRate)),
        delivery_time: deliveryTime.trim(),
        relevant_experience: relevantExperience.trim()
      });

      if (res.data.success) {
        showToast('🎉 Your proposal has been submitted successfully!', 'success');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit application';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 lg:p-8 flex flex-col gap-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Submit Proposal
            </span>
            <h2 className="text-lg lg:text-xl font-bold text-slate-900">
              {project.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Rate and Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                Your Proposed Rate ($ {project.budget_type === 'hourly' ? '/ hr' : 'Fixed'})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Client budget: ${project.budget} ({project.budget_type})
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                Estimated Delivery Time
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 5 days, 2 weeks"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">
              Cover Letter & Proposal Note <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Introduce yourself, outline your approach to solving this project, and highlight why your skills make you the ideal choice..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-none"
            />
          </div>

          {/* Relevant Experience */}
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">
              Relevant Experience or Project Links (Optional)
            </label>
            <input
              type="text"
              placeholder="Mention relevant coursework, previous projects, or links..."
              value={relevantExperience}
              onChange={(e) => setRelevantExperience(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold transition shadow-sm flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Proposal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
