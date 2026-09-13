import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  Zap, 
  Stethoscope, 
  UserCheck, 
  Calendar, 
  ShieldAlert,
  ArrowRight,
  BellRing,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useFavorites } from '../context/FavoritesContext';
import { CategoryId } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateCategory?: (category: CategoryId) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigateCategory
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll,
    pushPermission,
    requestPushPermission,
    simulateSavedProviderAlert
  } = useNotifications();

  const { favorites } = useFavorites();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'saved'>('all');

  if (!isOpen) return null;

  const savedProvidersCount = favorites.filter(
    (f) => f.category === 'vets' || f.category === 'trainers' || f.category === 'farriers'
  ).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'saved') return n.category === 'vets' || n.category === 'trainers';
    return true;
  });

  const handleNotificationClick = (id: string, targetCategory?: CategoryId) => {
    markAsRead(id);
    if (targetCategory && onNavigateCategory) {
      onNavigateCategory(targetCategory);
      onClose();
    }
  };

  const getCategoryIcon = (category: string, type: string) => {
    if (category === 'vets') return <Stethoscope className="w-4 h-4 text-teal-600" />;
    if (category === 'trainers') return <UserCheck className="w-4 h-4 text-purple-600" />;
    if (type === 'availability') return <Calendar className="w-4 h-4 text-amber-600" />;
    return <ShieldAlert className="w-4 h-4 text-rose-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden relative z-10 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        
        {/* Modal Header */}
        <div className="bg-[#1B4A72] text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0 relative">
              <Bell className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#1B4A72]">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight leading-tight">
                  Push Notification Center
                </h3>
                <span className="bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Real-Time
                </span>
              </div>
              <p className="text-xs text-sky-200 font-medium">
                Live alerts when your saved vets or trainers update availability
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-sky-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Close Notification Center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Browser Push Permission Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-3.5 border-b border-sky-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <BellRing className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-100">
                Native Web Push Alerts: {pushPermission === 'granted' ? 'Active' : 'Not Enabled'}
              </p>
              <p className="text-[11px] text-sky-200">
                {pushPermission === 'granted'
                  ? 'Browser notifications enabled for saved vets & trainers'
                  : 'Enable browser push to receive instant desktop & mobile alerts'}
              </p>
            </div>
          </div>

          {pushPermission !== 'granted' ? (
            <button
              onClick={() => requestPushPermission()}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer uppercase tracking-wider"
            >
              Enable Web Push
            </button>
          ) : (
            <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2.5 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Permission Granted</span>
            </span>
          )}
        </div>

        {/* Quick Simulation Trigger Bar */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2.5 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600 shrink-0 fill-amber-500" />
            <span className="font-bold text-amber-950">
              {savedProvidersCount > 0 
                ? `Monitoring ${savedProvidersCount} Saved Provider${savedProvidersCount > 1 ? 's' : ''}`
                : 'Save vets or trainers to customize alerts'}
            </span>
          </div>

          <button
            onClick={() => simulateSavedProviderAlert()}
            className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-[11px] px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 border border-amber-400/30 shrink-0"
            title="Simulate an instant alert from a saved vet or trainer"
          >
            <span>Test Saved Alert</span>
            <ArrowRight className="w-3 h-3 text-amber-400" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            All Alerts ({notifications.length})
          </button>

          <button
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'unread'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="bg-slate-950 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Saved Vets & Trainers
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2 bg-slate-50 flex-1 custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center space-y-2 bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800">No Notifications in this view</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Click "Test Saved Alert" above to trigger a simulated availability update from a saved equine provider!
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 group relative ${
                  !notif.read
                    ? 'bg-white border-amber-300 shadow-sm ring-1 ring-amber-400/50'
                    : 'bg-white/80 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {!notif.read && (
                  <span className="absolute top-3 left-2 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                )}

                <div 
                  className="flex items-start gap-3 min-w-0 pl-2 cursor-pointer flex-1"
                  onClick={() => handleNotificationClick(notif.id, notif.targetCategory)}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    notif.category === 'vets' ? 'bg-teal-50 border-teal-200' : 'bg-purple-50 border-purple-200'
                  }`}>
                    {getCategoryIcon(notif.category, notif.type)}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-extrabold text-xs text-slate-900 hover:text-teal-700 transition-colors">
                        {notif.title}
                      </span>
                      {notif.urgency === 'urgent' && (
                        <span className="bg-rose-100 text-rose-800 font-black text-[9px] px-1.5 py-0.2 rounded-md uppercase flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                          <span>Urgent</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3 pt-0.5 text-[10px] text-slate-400 font-bold">
                      <span className="text-teal-700 font-black">{notif.providerName}</span>
                      <span>•</span>
                      <span>{notif.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Individual Actions */}
                <div className="flex items-center gap-1 shrink-0 pt-1">
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-teal-700 hover:text-teal-800 font-extrabold flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-teal-600" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-slate-500 hover:text-rose-600 font-bold text-[11px] cursor-pointer"
              >
                Clear All
              </button>
            )}

            <button
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
