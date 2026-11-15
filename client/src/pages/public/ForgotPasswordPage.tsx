import React, { useState } from 'react';
import { Briefcase, Mail, ArrowLeft, Send } from 'lucide-react';
import { authApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const ForgotPasswordPage: React.FC<{ onGoToLogin: () => void }> = ({ onGoToLogin }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsSubmitting(true);
      await authApi.forgotPassword({ email });
      setSubmitted(true);
      showToast('Password reset link generated and dispatched!', 'success');
    } catch {
      showToast('Request failed. Check email address.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl flex flex-col gap-6">
      <div className="text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white mb-2">
          <Briefcase className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Reset Your Password</h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your registered email and we'll dispatch password recovery steps.
        </p>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center flex flex-col gap-3">
          <p className="text-xs font-semibold text-emerald-900 leading-relaxed">
            Recovery instructions have been sent to <strong>{email}</strong>. For this demo university project, you can log in directly using our 1-click test credentials.
          </p>
          <button
            onClick={onGoToLogin}
            className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
          >
            Return to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Sending...' : 'Send Recovery Instructions'}</span>
          </button>
        </form>
      )}

      <div className="text-center pt-2 border-t border-slate-100">
        <button
          onClick={onGoToLogin}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>
      </div>
    </div>
  );
};
