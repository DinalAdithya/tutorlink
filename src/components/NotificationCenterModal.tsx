/**
 * Notification Center Modal
 * Displays real-time alerts for incoming session requests and tutor acceptance
 */
import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink,
  Check,
  Video,
  Sparkles,
} from 'lucide-react';
import { AppNotification } from '../types';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../services/notifications';
import { theme, UserRole } from '../theme';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  currentRole: UserRole;
  currentUid: string;
  onNotificationClick?: (notif: AppNotification) => void;
  onRefresh?: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  currentRole,
  currentUid,
  onNotificationClick,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const roleColor = theme.colors[currentRole];

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayed = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(currentUid);
    onRefresh?.();
  };

  const handleItemClick = async (notif: AppNotification) => {
    if (!notif.read) {
      await markNotificationAsRead(notif.id);
      onRefresh?.();
    }
    onNotificationClick?.(notif);
  };

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: roleColor }}
            >
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Notifications</h3>
                {unreadCount > 0 && (
                  <span
                    className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: roleColor }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Session requests, acceptances & meeting links
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar & Actions */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-800 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                filter === 'unread'
                  ? 'bg-white text-slate-800 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {displayed.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-700">No notifications</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {filter === 'unread'
                  ? "You're all caught up! No unread notifications."
                  : 'When students request sessions or tutors accept them, you will see alerts here.'}
              </p>
            </div>
          ) : (
            displayed.map((notif) => {
              const isAccepted = notif.type === 'session_accepted';
              const isRequest = notif.type === 'session_request';

              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3 rounded-2xl transition cursor-pointer mb-1 ${
                    !notif.read ? 'bg-indigo-50/50 hover:bg-indigo-50/80' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white ${
                        isAccepted
                          ? 'bg-emerald-500 shadow-emerald-500/20'
                          : isRequest
                          ? 'bg-indigo-600 shadow-indigo-600/20'
                          : 'bg-slate-600'
                      }`}
                    >
                      {isAccepted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isRequest ? (
                        <Calendar className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs truncate ${
                            !notif.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {formatTimestamp(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-0.5 leading-snug break-words">
                        {notif.message}
                      </p>

                      {/* Attached Meeting Link Badge */}
                      {notif.meetingLink && (
                        <div className="mt-2 flex items-center gap-2">
                          <a
                            href={notif.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold hover:bg-teal-100 transition"
                          >
                            <Video className="w-3 h-3 text-teal-600" />
                            <span>Join Meeting Room</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        </div>
                      )}
                    </div>

                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Real-time notifications powered by TutorLink
          </p>
        </div>
      </div>
    </div>
  );
};
