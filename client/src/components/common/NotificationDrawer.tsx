import React from 'react';
import { X, Bell, Check, ExternalLink, Clock } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationDrawer: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { 
    isOpen, 
    setIsOpen, 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  if (!isOpen) return null;

  const handleItemClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link && onNavigate) {
      if (notification.link.includes('applications')) {
        onNavigate('my-proposals');
      } else if (notification.link.includes('profile')) {
        onNavigate('student-profile');
      } else if (notification.link.includes('browse')) {
        onNavigate('browse');
      } else if (notification.link.includes('candidates')) {
        onNavigate('client-candidates');
      }
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs animate-fade-in">
      <div 
        className="fixed inset-0"
        onClick={() => setIsOpen(false)}
      ></div>

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Notifications</h3>
              <span className="text-xs text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 p-1.5 transition"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <Bell className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No notifications yet</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                You will receive updates here when clients view your proposals, update statuses, or leave reviews.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                  notif.is_read
                    ? 'bg-white border-slate-100 hover:border-slate-200'
                    : 'bg-emerald-50/40 border-emerald-100 hover:border-emerald-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    )}
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {notif.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-4">
                  {notif.message}
                </p>
                {notif.link && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 pl-4 mt-0.5">
                    <span>View details</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
