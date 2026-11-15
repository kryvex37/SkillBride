import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Users, 
  Building2, 
  FileText, 
  MessageSquare, 
  Bell, 
  Settings, 
  HelpCircle, 
  Rocket, 
  ChevronDown, 
  LogOut, 
  User as UserIcon,
  Sparkles,
  ShieldAlert,
  FolderKanban,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  mobileOpen,
  setMobileOpen
}) => {
  const { user, logout, switchDemoAccount } = useAuth();
  const { unreadCount, setIsOpen: openNotificationModal } = useNotifications();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#F8FAFC] border-r border-[#E2E8F0] flex flex-col justify-between py-6 px-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col gap-6">
        {/* Brand Logo */}
        <div className="flex items-center justify-between px-2">
          <div 
            onClick={() => handleNav('browse')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                SkillBridge<span className="text-emerald-600">.</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
                Campus Talent
              </span>
            </div>
          </div>
        </div>

        {/* User Card Pill */}
        <div className="relative">
          <div
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center justify-between p-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/80 transition cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={user?.first_name || 'User'}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {user ? `${user.first_name} ${user.last_name}` : 'Akmal Nasrulloh'}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {user ? user.email : 'akmalnsrllh@gmail.com'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </div>

          {/* Quick Demo Switcher & Account Dropdown */}
          {userDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Role (Demo)
              </div>
              <button
                onClick={() => { switchDemoAccount('student'); setUserDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between"
              >
                <span>Student (Akmal)</span>
                {user?.role === 'student' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
              <button
                onClick={() => { switchDemoAccount('client'); setUserDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between"
              >
                <span>Client (HAV / Marcus)</span>
                {user?.role === 'client' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
              <button
                onClick={() => { switchDemoAccount('admin'); setUserDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between"
              >
                <span>Admin (University)</span>
                {user?.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={() => { logout(); setUserDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex flex-col gap-5">
          {/* MENU section */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-slate-400 px-3 uppercase tracking-wider mb-1">
              MENU
            </span>

            {/* Find Project (Primary active item in screenshot) */}
            <button
              onClick={() => handleNav('browse')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                currentTab === 'browse'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Search className={`w-4 h-4 ${currentTab === 'browse' ? 'text-slate-900' : 'text-slate-500'}`} />
              <span>Find Project</span>
            </button>

            {/* Recommendations / Find Freelancers */}
            {user?.role === 'student' ? (
              <button
                onClick={() => handleNav('recommendations')}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  currentTab === 'recommendations'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Smart Match</span>
              </button>
            ) : user?.role === 'client' ? (
              <button
                onClick={() => handleNav('client-candidates')}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  currentTab === 'client-candidates'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Candidate Matcher</span>
              </button>
            ) : (
              <button
                onClick={() => handleNav('admin-overview')}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  currentTab === 'admin-overview'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span>Admin Overview</span>
              </button>
            )}

            {/* Student/Client specific workflow links */}
            {user?.role === 'student' && (
              <>
                <button
                  onClick={() => handleNav('student-dashboard')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    currentTab === 'student-dashboard'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => handleNav('my-proposals')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    currentTab === 'my-proposals'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>My Proposal</span>
                </button>

                <button
                  onClick={() => handleNav('my-portfolio')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    currentTab === 'my-portfolio'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <FolderKanban className="w-4 h-4 text-slate-500" />
                  <span>My Portfolio</span>
                </button>

                <button
                  onClick={() => handleNav('student-profile')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    currentTab === 'student-profile'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <span>Skill Profile</span>
                </button>
              </>
            )}

            {user?.role === 'client' && (
              <>
                <button
                  onClick={() => handleNav('client-dashboard')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    currentTab === 'client-dashboard'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span>My Projects</span>
                </button>

                <button
                  onClick={() => handleNav('publish-project')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    currentTab === 'publish-project'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Post a Project</span>
                </button>

                <button
                  onClick={() => handleNav('client-profile')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    currentTab === 'client-profile'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <span>Company Profile</span>
                </button>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => handleNav('admin-users')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    currentTab === 'admin-users'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Users Directory</span>
                </button>

                <button
                  onClick={() => handleNav('admin-projects')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    currentTab === 'admin-projects'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  <span>Project Moderation</span>
                </button>

                <button
                  onClick={() => handleNav('admin-reviews')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    currentTab === 'admin-reviews'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <span>Review Moderation</span>
                </button>

                <button
                  onClick={() => handleNav('admin-reports')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    currentTab === 'admin-reports'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Reports Queue</span>
                </button>
              </>
            )}

            {/* Message & Notification */}
            <button
              onClick={() => handleNav('messages')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                currentTab === 'messages'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span>Message</span>
            </button>

            <button
              onClick={() => openNotificationModal(true)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 transition"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-slate-500" />
                <span>Notification</span>
              </div>
              {unreadCount > 0 && (
                <span className="bg-emerald-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* PREFERENCES section */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-slate-400 px-3 uppercase tracking-wider mb-1">
              PREFERENCES
            </span>

            <button
              onClick={() => handleNav('settings')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                currentTab === 'settings'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => handleNav('about')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                currentTab === 'about'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Help & About</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Plus Plan Card (Exact match to reference image) */}
      <div className="mt-6">
        <div className="relative rounded-2xl p-4 bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 rounded-full opacity-60"></div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Rocket className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-900">Plus Plan</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
            Get exclusive access to the Freelancer Plus group and competitor bids for any projects.
          </p>
          <button
            onClick={() => handleNav('settings')}
            className="text-xs font-semibold text-slate-900 hover:text-emerald-700 flex items-center gap-1 transition group"
          >
            <span>Upgrade Now</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
