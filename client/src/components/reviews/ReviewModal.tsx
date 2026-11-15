import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { reviewApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

interface ReviewModalProps {
  projectId: number;
  projectTitle: string;
  revieweeId: number;
  revieweeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  projectId,
  projectTitle,
  revieweeId,
  revieweeName,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { showToast } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      showToast('Please select a star rating', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await reviewApi.create({
        project_id: projectId,
        reviewee_id: revieweeId,
        rating,
        comment: comment.trim()
      });

      if (res.data.success) {
        showToast('⭐ Thank you! Your review has been published.', 'success');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit review';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              Rating & Review
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Review {revieweeName}
            </h3>
            <p className="text-xs text-slate-400 truncate max-w-xs">
              Project: {projectTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Star selector */}
          <div className="flex flex-col items-center gap-1.5 py-2">
            <span className="text-xs font-semibold text-slate-600">Overall Rating</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-300 hover:scale-110 transition"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700">
              {rating === 5 ? '5 Stars - Outstanding!' :
               rating === 4 ? '4 Stars - Very Good' :
               rating === 3 ? '3 Stars - Satisfactory' :
               rating === 2 ? '2 Stars - Needs Improvement' : '1 Star - Unsatisfactory'}
            </span>
          </div>

          {/* Written feedback */}
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">
              Written Feedback
            </label>
            <textarea
              rows={4}
              required
              placeholder="Share details of your experience, communication, quality of work, and timeliness..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting...' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
