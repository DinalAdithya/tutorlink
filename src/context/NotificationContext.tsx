/**
 * Notifications Context
 * Global state for notifications, unread count badge, and notification center modal
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification } from '../types';
import { useAuth } from './AuthContext';
import {
  getNotificationsForUser,
  markNotificationAsRead as serviceMarkRead,
  markAllNotificationsAsRead as serviceMarkAllRead,
} from '../services/notifications';
import { NotificationCenterModal } from '../components/NotificationCenterModal';
import { NotificationToast } from '../components/NotificationToast';
import { NativeNotificationPopup } from '../components/NativeNotificationPopup';
import { setupNativeNotifications } from '../services/nativeNotifications';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isCenterOpen: boolean;
  openNotificationCenter: () => void;
  closeNotificationCenter: () => void;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isCenterOpen, setIsCenterOpen] = useState(false);

  const effectiveUid = user?.uid || (role === 'tutor' ? 'tutor_kavindu' : 'user_senuri');

  const fetchNotifications = useCallback(async () => {
    try {
      const list = await getNotificationsForUser(effectiveUid);
      setNotifications(list);
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  }, [effectiveUid]);

  useEffect(() => {
    setupNativeNotifications();
    fetchNotifications();

    const handleUpdated = () => {
      fetchNotifications();
    };

    window.addEventListener('tutorlink_notification_created', handleUpdated);
    window.addEventListener('tutorlink_notification_updated', handleUpdated);

    return () => {
      window.removeEventListener('tutorlink_notification_created', handleUpdated);
      window.removeEventListener('tutorlink_notification_updated', handleUpdated);
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const openNotificationCenter = () => setIsCenterOpen(true);
  const closeNotificationCenter = () => setIsCenterOpen(false);

  const markAsRead = async (id: string) => {
    await serviceMarkRead(id);
    await fetchNotifications();
  };

  const markAllAsRead = async () => {
    await serviceMarkAllRead(effectiveUid);
    await fetchNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isCenterOpen,
        openNotificationCenter,
        closeNotificationCenter,
        refreshNotifications: fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}

      {/* Real-time Pop-up Toast for immediate notification feedback */}
      <NotificationToast onOpenCenter={openNotificationCenter} />

      {/* React Native Modal Pop-up Window for Session Requests & Acceptances */}
      <NativeNotificationPopup
        onAction={(notif, action) => {
          if (action === 'view') {
            openNotificationCenter();
          }
        }}
      />

      {/* Full Notification Center Dialog */}
      <NotificationCenterModal
        isOpen={isCenterOpen}
        onClose={closeNotificationCenter}
        notifications={notifications}
        currentRole={role}
        currentUid={effectiveUid}
        onRefresh={fetchNotifications}
      />
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
};
