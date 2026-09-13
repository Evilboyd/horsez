import React, { useEffect } from 'react';
import { Bell, X, ArrowRight, Zap, Stethoscope, UserCheck, Calendar, ShieldAlert } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { CategoryId } from '../types';

interface NotificationToastProps {
  onNavigateCategory?: (category: CategoryId) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onNavigateCategory }) => {
  const { activeToast, dismissToast, markAsRead } = useNotifications();

  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 8000);
    return () => clearTimeout(timer);
  }, [activeToast, dismissToast]);

  if (!activeToast) return null;

  const handleAction = () => {
    markAsRead(activeToast.id);
    if (activeToast.targetCategory && onNavigateCategory) {
      onNavigateCategory(activeToast.targetCategory);
    }
    dismissToast();
  };

  const getCategoryIcon = () => {
    if (activeToast.category === 'vets') return <Stethoscope className="w-5 h-5 text-teal-400" />;
    if (activeToast.category === 'trainers') return <UserCheck className="w-5 h-5 text-purple-400" />;
    if (activeToast.type === 'availability') return <Calendar className="w-5 h-5 text-amber-400" />;
    return <ShieldAlert className="w-5 h-5 text-rose-400" />;
  };

  return (
    <div className="fixed top-16 right-3 sm:right-6 z-50 max-w-md w-[calc(100vw-1.5rem)] animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-amber-400/50 relative overflow-hidden backdrop-blur-md">
        {/* Glow effect */}
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              {getCategoryIcon()}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Zap className="w-3 h-3 text-slate-950 fill-slate-950" />
                  <span>Push Alert</span>
                </span>
                <span className="text-[10px] text-teal-300 font-extrabold bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-500/30">
                  {activeToast.providerName}
                </span>
              </div>

              <h4 className="font-extrabold text-xs text-white tracking-tight leading-snug">
                {activeToast.title}
              </h4>

              <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                {activeToast.message}
              </p>
            </div>
          </div>

          <button
            onClick={dismissToast}
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Dismiss Toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Button Footer */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
            <Bell className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Saved Provider Update</span>
          </span>

          <button
            onClick={handleAction}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer uppercase tracking-wider"
          >
            <span>View Update</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
