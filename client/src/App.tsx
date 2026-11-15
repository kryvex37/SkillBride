import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { NotificationDrawer } from './components/common/NotificationDrawer';

// Pages
import { BrowseProjectsPage } from './pages/student/BrowseProjectsPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { PortfolioManagementPage } from './pages/student/PortfolioManagementPage';
import { MyApplicationsPage } from './pages/student/MyApplicationsPage';
import { RecommendationsPage } from './pages/student/RecommendationsPage';
import { ClientDashboardPage } from './pages/client/ClientDashboardPage';
import { PublishProjectPage } from './pages/client/PublishProjectPage';
import { ProjectApplicationsPage } from './pages/client/ProjectApplicationsPage';
import { ClientProfilePage } from './pages/client/ClientProfilePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { LandingPage } from './pages/public/LandingPage';
import { AboutPage } from './pages/public/AboutPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';

// Quick icons
import { MessageSquare, Settings as SettingsIcon, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const { user, isAuthenticated, switchDemoAccount } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('browse');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [navigationMeta, setNavigationMeta] = useState<any>(null);

  const handleNavigate = (tab: string, meta?: any) => {
    setCurrentTab(tab);
    if (meta) setNavigationMeta(meta);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col">
      {/* Top Academic Capstone Evaluation Quick-Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 z-50 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-white">SkillBridge SE331 Capstone</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">Active Mode: <strong className="text-emerald-400 capitalize">{user?.role || 'Guest'}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] hidden md:inline">1-Click Role Switcher:</span>
          <button
            onClick={() => switchDemoAccount('student')}
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition ${
              user?.role === 'student' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            Student (Akmal)
          </button>
          <button
            onClick={() => switchDemoAccount('client')}
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition ${
              user?.role === 'client' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            Client (HAV Marcus)
          </button>
          <button
            onClick={() => switchDemoAccount('admin')}
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition ${
              user?.role === 'admin' ? 'bg-rose-500 text-white font-extrabold' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      <div className="flex flex-1 relative">
        {/* Fixed / Collapsible Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={handleNavigate}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        {/* Main Workspace Body */}
        <main className="flex-1 lg:pl-64 flex flex-col min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
            {/* View Switching */}
            {currentTab === 'browse' && (
              <BrowseProjectsPage toggleMobileMenu={() => setMobileSidebarOpen(true)} />
            )}

            {currentTab === 'landing' && (
              <LandingPage
                onExplore={() => handleNavigate('browse')}
                onLogin={() => handleNavigate('login')}
                onRegister={() => handleNavigate('register')}
              />
            )}

            {currentTab === 'login' && (
              <LoginPage
                onSuccess={() => handleNavigate(user?.role === 'client' ? 'client-dashboard' : 'browse')}
                onGoToRegister={() => handleNavigate('register')}
                onGoToForgot={() => handleNavigate('forgot')}
              />
            )}

            {currentTab === 'register' && (
              <RegisterPage
                onSuccess={() => handleNavigate(user?.role === 'client' ? 'client-dashboard' : 'browse')}
                onGoToLogin={() => handleNavigate('login')}
              />
            )}

            {currentTab === 'forgot' && (
              <ForgotPasswordPage onGoToLogin={() => handleNavigate('login')} />
            )}

            {currentTab === 'about' && (
              <AboutPage />
            )}

            {/* Student Views */}
            {currentTab === 'student-dashboard' && (
              <StudentDashboardPage onNavigate={handleNavigate} />
            )}

            {currentTab === 'student-profile' && (
              <StudentProfilePage />
            )}

            {currentTab === 'my-portfolio' && (
              <PortfolioManagementPage />
            )}

            {currentTab === 'my-proposals' && (
              <MyApplicationsPage />
            )}

            {currentTab === 'recommendations' && (
              <RecommendationsPage />
            )}

            {/* Client Views */}
            {currentTab === 'client-dashboard' && (
              <ClientDashboardPage onNavigate={handleNavigate} />
            )}

            {currentTab === 'publish-project' && (
              <PublishProjectPage onSuccess={() => handleNavigate('client-dashboard')} />
            )}

            {(currentTab === 'project-applicants' || currentTab === 'client-candidates') && (
              <ProjectApplicationsPage initialProjectId={navigationMeta?.projectId} />
            )}

            {currentTab === 'client-profile' && (
              <ClientProfilePage />
            )}

            {/* Admin Views */}
            {(currentTab === 'admin-overview' ||
              currentTab === 'admin-users' ||
              currentTab === 'admin-projects' ||
              currentTab === 'admin-reviews' ||
              currentTab === 'admin-reports') && (
              <AdminDashboardPage />
            )}

            {/* Messages / Communication */}
            {currentTab === 'messages' && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm max-w-2xl mx-auto text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Direct Collaboration Messaging</h2>
                <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-6">
                  Communicate in real time with clients and students once an application proposal is accepted or under review.
                </p>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left w-full text-xs flex flex-col gap-2">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Recent Thread: HAV Solutions GmbH</span>
                    <span className="text-emerald-600 font-bold">Active</span>
                  </div>
                  <p className="text-slate-500 italic">"Hi Akmal, we loved your portfolio! Looking forward to reviewing the first Figma wireframe."</p>
                </div>
              </div>
            )}

            {/* Settings */}
            {currentTab === 'settings' && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm max-w-2xl mx-auto flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Account Preferences & Settings</h2>
                  <p className="text-xs text-slate-500 mt-1">Manage notifications, display preferences, and university account credentials.</p>
                </div>
                <div className="flex flex-col gap-4 text-xs">
                  <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">Email Notifications</span>
                      <span className="text-slate-400">Receive email alerts when clients review or accept your bids</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-emerald-600" />
                  </label>
                  <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">Smart Match Recommendations</span>
                      <span className="text-slate-400">Receive algorithmic project recommendations matching your skill profile</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-emerald-600" />
                  </label>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* In-App Notification Drawer */}
      <NotificationDrawer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
