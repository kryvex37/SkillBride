import React, { useState } from 'react';
import { Briefcase, Lock, Mail, ArrowRight, UserCheck, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface LoginPageProps {
  onSuccess: () => void;
  onGoToRegister: () => void;
  onGoToForgot: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onGoToRegister,
  onGoToForgot
}) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('akmalnsrllh@gmail.com');
  const [password, setPassword] = useState('student123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please provide both email and password', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login({ email: email.trim(), password });
      if (res.success) {
        showToast(`Welcome back, ${res.user.first_name}!`, 'success');
        onSuccess();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (type: 'student' | 'client' | 'admin') => {
    if (type === 'student') {
      setEmail('akmalnsrllh@gmail.com');
      setPassword('student123');
    } else if (type === 'client') {
      setEmail('contact@hav-design.de');
      setPassword('client123');
    } else if (type === 'admin') {
      setEmail('admin@skillbridge.edu');
      setPassword('admin123');
    }
    showToast(`Loaded ${type} demo credentials`, 'info');
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl flex flex-col gap-6">
      {/* Brand Header */}
      <div className="text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md mb-3">
          <Briefcase className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Welcome to SkillBridge
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Sign in to access your student or client dashboard
        </p>
      </div>

      {/* 1-Click Evaluation Presets */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col gap-2 text-xs">
        <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
          Quick Demo Logins (1-Click Fill):
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handleFillDemo('student')}
            className="py-1.5 px-2 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-xl font-bold transition text-slate-700 shadow-2xs"
          >
            🎓 Student
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('client')}
            className="py-1.5 px-2 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-xl font-bold transition text-slate-700 shadow-2xs"
          >
            💼 Client
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('admin')}
            className="py-1.5 px-2 bg-white hover:bg-rose-50 hover:text-rose-700 border border-slate-200 rounded-xl font-bold transition text-slate-700 shadow-2xs"
          >
            🛡️ Admin
          </button>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-slate-900 block mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              placeholder="e.g. akmalnsrllh@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-900">Password</label>
            <button
              type="button"
              onClick={onGoToForgot}
              className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting ? 'Signing In...' : 'Sign In to SkillBridge'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Switch to Register */}
      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
        Don't have an account?{' '}
        <button
          onClick={onGoToRegister}
          className="font-bold text-emerald-600 hover:text-emerald-700"
        >
          Create an account
        </button>
      </div>
    </div>
  );
};
