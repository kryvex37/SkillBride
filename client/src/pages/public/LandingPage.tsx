import React from 'react';
import { 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Users, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Globe,
  TrendingUp,
  GraduationCap
} from 'lucide-react';

interface LandingPageProps {
  onExplore: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onExplore,
  onLogin,
  onRegister
}) => {
  return (
    <div className="flex flex-col gap-16 py-4">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold self-start">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Official University Student Freelance Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            Bridging Campus Talent With <span className="text-emerald-400">Real-World</span> Opportunities.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            SkillBridge empowers university students to showcase technical and creative portfolios, land paid freelance contracts, and build verified reputations while giving businesses affordable, high-quality solutions.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onExplore}
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>Find Projects Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onRegister}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-sm font-semibold transition"
            >
              Join as a Student or Client
            </button>
          </div>
        </div>

        {/* Floating Metrics Pill */}
        <div className="hidden lg:flex absolute right-12 bottom-12 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-900 flex items-center justify-center font-extrabold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-300 block">Placement Match Rate</span>
              <span className="text-lg font-extrabold text-white">96.8% Successful</span>
            </div>
          </div>
          <div className="text-[11px] text-emerald-300 font-semibold border-t border-white/10 pt-2">
            Powered by Automated Skill Engine
          </div>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Verified Students', val: '4,500+' },
          { label: 'Completed Projects', val: '1,280+' },
          { label: 'Client Satisfaction', val: '4.9 / 5.0' },
          { label: 'Partner Universities', val: '35+' }
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block mb-1">{item.val}</span>
            <span className="text-xs font-semibold text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* How SkillBridge Works */}
      <div className="flex flex-col gap-8 text-center max-w-4xl mx-auto">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
            Simple & Transparent Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How SkillBridge Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            A frictionless ecosystem for students to earn and clients to receive exceptional digital work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold flex items-center justify-center">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Create Skill Profile</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Students build a professional skill identity, list technical and creative badges, and upload portfolio case studies.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold flex items-center justify-center">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Algorithm Matching</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Clients post job requests with required skills. Our matching algorithm automatically scores compatibility and ranks top candidates.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold flex items-center justify-center">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Deliver & Review</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Collaborate through tracked milestones. Upon project completion, both parties submit verified 5-star ratings and written reviews.
            </p>
          </div>
        </div>
      </div>

      {/* Dual Value Proposition: Students vs Clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* For Students */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Benefits for Students</h3>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Earn real income while studying with flexible project timelines.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Build an authentic portfolio of client-approved production work.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Gain smart skill recommendations tailored to your university major.</span>
              </li>
            </ul>
          </div>
          <button
            onClick={onExplore}
            className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Browse Open Student Projects
          </button>
        </div>

        {/* For Clients */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Benefits for Clients</h3>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Access verified university students with cutting-edge tech skills.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Highly affordable rates compared to traditional agency retainers.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Algorithm-driven candidate ranking cuts hiring time from days to minutes.</span>
              </li>
            </ul>
          </div>
          <button
            onClick={onRegister}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
          >
            Post a Project for Students
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-8 pb-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <span>© 2026 SkillBridge Platform. Software Engineering Design Capstone (SE331).</span>
        <div className="flex items-center gap-4">
          <button onClick={onExplore} className="hover:text-slate-700">Browse Projects</button>
          <button onClick={onLogin} className="hover:text-slate-700">Account Login</button>
          <button onClick={onRegister} className="hover:text-slate-700">Register</button>
        </div>
      </footer>
    </div>
  );
};
