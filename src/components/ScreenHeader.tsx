/**
 * ScreenHeader Component
 * Matches Figma prototype header layout with TutorLink wordmark and actions
 * Includes quick-switch menu entry when user holds more than one role.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Bell,
  SlidersHorizontal,
  MoreHorizontal,
  GraduationCap,
  ChevronDown,
  Check,
  Repeat,
} from 'lucide-react';
import { theme, UserRole } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  showWordmark?: boolean;
  onBack?: () => void;
  rightAction?: 'bell' | 'filter' | 'more' | 'none';
  onRightAction?: () => void;
  role?: UserRole;
  notificationCount?: number;
  onRoleSwitched?: (newRole: UserRole) => void;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showWordmark = true,
  onBack,
  rightAction = 'bell',
  onRightAction,
  role: overrideRole,
  notificationCount: overrideNotificationCount,
  onRoleSwitched,
}) => {
  const { user, role: contextRole, switchRole } = useAuth();
  const { unreadCount, openNotificationCenter } = useNotifications();
  const currentRole: UserRole = overrideRole || user?.activeRole || contextRole || 'tutee';
  const roleColor = theme.colors[currentRole];

  const effectiveNotificationCount =
    overrideNotificationCount !== undefined ? overrideNotificationCount : unreadCount;

  const [isSwitchMenuOpen, setIsSwitchMenuOpen] = useState(false);
  const switchMenuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switchMenuRef.current && !switchMenuRef.current.contains(event.target as Node)) {
        setIsSwitchMenuOpen(false);
      }
    }
    if (isSwitchMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSwitchMenuOpen]);

  const handleQuickSwitch = async (targetRole: UserRole) => {
    if (targetRole === currentRole) {
      setIsSwitchMenuOpen(false);
      return;
    }
    try {
      await switchRole(targetRole);
      onRoleSwitched?.(targetRole);
    } finally {
      setIsSwitchMenuOpen(false);
    }
  };

  const hasMultipleRoles = Boolean(user && user.roles && user.roles.length > 1);

  const roleLabels: Record<UserRole, { label: string; badge: string }> = {
    tutee: { label: 'Student', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    tutor: { label: 'Peer Tutor', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
    parent: { label: 'Parent', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  return (
    <header className="px-5 pt-3 pb-3 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        {onBack ? (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition active:scale-95 shrink-0 cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : null}

        <div className="min-w-0">
          {showWordmark && !title && (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                style={{ backgroundColor: roleColor }}
              >
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Tutor<span style={{ color: roleColor }}>Link</span>
              </span>
            </div>
          )}

          {title && (
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-900 leading-tight truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {!title && subtitle && (
            <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Role Switcher (Shown ONLY when user holds > 1 role) */}
        {hasMultipleRoles && user && (
          <div className="relative" ref={switchMenuRef}>
            <button
              onClick={() => setIsSwitchMenuOpen(!isSwitchMenuOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition shadow-2xs cursor-pointer ${
                roleLabels[currentRole].badge
              }`}
              title="Switch role"
              aria-label="Quick role switcher"
            >
              <Repeat className="w-3 h-3 opacity-70" />
              <span>{roleLabels[currentRole].label}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Quick Switch Dropdown Menu */}
            {isSwitchMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  Active Mode
                </div>
                <div className="space-y-1">
                  {user.roles.map((r) => {
                    const isActive = r === currentRole;
                    return (
                      <button
                        key={r}
                        onClick={() => handleQuickSwitch(r)}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          isActive
                            ? 'bg-slate-100 text-slate-900 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: theme.colors[r] }}
                          />
                          <span>{roleLabels[r].label}</span>
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 text-slate-800" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Existing header action buttons */}
        {rightAction === 'bell' && (
          <button
            onClick={onRightAction || openNotificationCenter}
            className="w-10 h-10 rounded-full border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 transition relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {effectiveNotificationCount > 0 ? (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            ) : null}
          </button>
        )}

        {rightAction === 'filter' && (
          <button
            onClick={onRightAction}
            className="w-10 h-10 rounded-full border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer"
            aria-label="Filter"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        )}

        {rightAction === 'more' && (
          <button
            onClick={onRightAction}
            className="w-10 h-10 rounded-full border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};
