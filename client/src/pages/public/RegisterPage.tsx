import React, { useState } from 'react';
import { Briefcase, GraduationCap, Lock, Mail, User, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface RegisterPageProps {
  onSuccess: () => void;
  onGoToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onGoToLogin
}) => {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [role, setRole] = useState<'student' | 'client'>('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student extras
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');

  // Client extras
  const [companyName, setCompanyName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      showToast('Please fill out all mandatory fields', 'warning');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        role,
        university: university.trim(),
        department: department.trim(),
        student_id: studentId.trim(),
        company_name: companyName.trim()
      });

      if (res.success) {
        showToast('Registration successful! Welcome to SkillBridge.', 'success');
        onSuccess();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-6 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl flex flex-col gap-6">
      <div className="text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md mb-2">
          <Briefcase className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Join SkillBridge Platform
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Connect with clients or hire skilled university students
        </p>
      </div>

      {/* Role Selector Toggle */}
      <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => setRole('student')}
          className={`py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            role === 'student'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-emerald-600" />
          <span>I'm a University Student</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('client')}
          className={`py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            role === 'client'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span>I'm a Client / Business</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Names */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">First Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Akmal"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">Last Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Nasrulloh"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-xs font-bold text-slate-900 block mb-1">Email Address *</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              placeholder="name@university.edu or email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-xs font-bold text-slate-900 block mb-1">Password (min 6 characters) *</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Create a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        {/* Student Specific Fields */}
        {role === 'student' && (
          <div className="flex flex-col gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <span className="text-xs font-bold text-emerald-900">Student Affiliation Details</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">University Name</label>
                <input
                  type="text"
                  placeholder="e.g. Stanford University"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Department / Major</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none font-medium"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Student ID Number</label>
              <input
                type="text"
                placeholder="e.g. STU-99214"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none font-medium"
              />
            </div>
          </div>
        )}

        {/* Client Specific Fields */}
        {role === 'client' && (
          <div className="flex flex-col gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <span className="text-xs font-bold text-indigo-900">Business / Client Profile</span>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Company or Project Name</label>
              <input
                type="text"
                placeholder="e.g. HAV Solutions GmbH or Freelance Venture"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none font-medium"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
        Already have an account?{' '}
        <button
          onClick={onGoToLogin}
          className="font-bold text-emerald-600 hover:text-emerald-700"
        >
          Sign in here
        </button>
      </div>
    </div>
  );
};
