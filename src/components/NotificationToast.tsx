/**
 * Toast Notification Banner
 * Pops up temporarily at the top when a session request is submitted or accepted
 */
import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Video, X } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationToastProps {
  onOpenCenter?: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onOpenCenter }) => {
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  useEffect(() => {
    const handleNotifCreated = (e: any) => {
      if (e.detail) {
        setActiveToast(e.detail);
        // Automatically hide after 6 seconds
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 6000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('tutorlink_notification_created', handleNotifCreated);
    return () => {
      window.removeEventListener('tutorlink_notification_created', handleNotifCreated);
    };
  }, []);

  if (!activeToast) return null;

  const isAccepted = activeToast.type === 'session_accepted';

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center pointer-events-none animate-in slide-in-from-top duration-300">
      <div
        onClick={() => {
          onOpenCenter?.();
          setActiveToast(null);
        }}
        className="pointer-events-auto max-w-sm w-full bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/60 flex items-start gap-3 cursor-pointer hover:bg-slate-850 transition"
      >
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isAccepted ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'
          }`}
        >
          {isAccepted ? <CheckCircle2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-xs text-slate-100">{activeToast.title}</h5>
            <span className="text-[10px] text-slate-400">Just now</span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-tight">
            {activeToast.message}
          </p>
          {activeToast.meetingLink && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-1">
              <Video className="w-3 h-3" /> Live meeting attached
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveToast(null);
          }}
          className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
