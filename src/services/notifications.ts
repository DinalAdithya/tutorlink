/**
 * Notifications Service
 * Handles notification creation, retrieval, status updates, and Firestore sync.
 * Used for alerting tutors on new session requests and alerting students on tutor acceptance.
 */
import { AppNotification, NotificationType } from '../types';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { triggerDeviceNotification } from './nativeNotifications';

const STORAGE_KEY_NOTIFICATIONS = 'tutorlink_notifications_db';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_init_1',
    recipientUid: 'tutor_kavindu',
    senderUid: 'user_senuri',
    senderName: 'Senuri Dias',
    recipientRole: 'tutor',
    type: 'session_request',
    title: 'New Session Request',
    message: 'Senuri Dias sent you a request for Combined Maths.',
    bookingId: 'booking_2',
    subject: 'Combined Maths',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'notif_init_2',
    recipientUid: 'user_senuri',
    senderUid: 'tutor_kavindu',
    senderName: 'Kavindu Perera',
    recipientRole: 'tutee',
    type: 'session_accepted',
    title: 'Session Request Accepted!',
    message: 'Kavindu Perera accepted your Combined Maths session request.',
    bookingId: 'booking_1',
    subject: 'Combined Maths',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

function getStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read notifications from localStorage', e);
  }
  saveStoredNotifications(INITIAL_NOTIFICATIONS);
  return INITIAL_NOTIFICATIONS;
}

function saveStoredNotifications(notifications: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to write notifications to localStorage', e);
  }
}

/**
 * Send a notification to a user (stored locally and synced to Firestore)
 */
export async function sendNotification(payload: {
  recipientUid: string;
  senderUid: string;
  senderName: string;
  recipientRole?: 'tutee' | 'tutor' | 'parent';
  type: NotificationType;
  title: string;
  message: string;
  bookingId?: string;
  subject?: string;
  meetingLink?: string;
}): Promise<AppNotification> {
  const notif: AppNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    recipientUid: payload.recipientUid,
    senderUid: payload.senderUid,
    senderName: payload.senderName,
    recipientRole: payload.recipientRole,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    bookingId: payload.bookingId,
    subject: payload.subject,
    meetingLink: payload.meetingLink,
    read: false,
    createdAt: new Date().toISOString(),
  };

  // Local sync
  const all = getStoredNotifications();
  all.unshift(notif);
  saveStoredNotifications(all);

  // Firestore sync if live
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'notifications', notif.id), notif);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${notif.id}`);
    }
  }

  // Trigger both native Expo notification and in-app pop-up window
  triggerDeviceNotification(notif).catch(() => {});

  return notif;
}

/**
 * Get all notifications for a given user UID
 */
export async function getNotificationsForUser(userUid: string): Promise<AppNotification[]> {
  const all = getStoredNotifications();
  // Filter for matching recipient or default test recipients
  let localForUser = all.filter(
    (n) =>
      n.recipientUid === userUid ||
      (userUid === 'tutor_kavindu' && n.recipientRole === 'tutor') ||
      (userUid === 'user_senuri' && n.recipientRole === 'tutee')
  );

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'notifications'), where('recipientUid', '==', userUid));
      const snap = await getDocs(q);
      const remoteList = snap.docs.map((d) => d.data() as AppNotification);
      if (remoteList.length > 0) {
        // Merge with local deduplicated
        const mergedMap = new Map<string, AppNotification>();
        remoteList.forEach((n) => mergedMap.set(n.id, n));
        localForUser.forEach((n) => {
          if (!mergedMap.has(n.id)) mergedMap.set(n.id, n);
        });
        localForUser = Array.from(mergedMap.values());
      }
    } catch (err) {
      // Non-blocking fallback to local
      console.warn('Could not fetch notifications from Firestore:', err);
    }
  }

  return localForUser.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Mark a specific notification as read
 */
export async function markNotificationAsRead(notifId: string): Promise<void> {
  const all = getStoredNotifications();
  const idx = all.findIndex((n) => n.id === notifId);
  if (idx !== -1) {
    all[idx].read = true;
    saveStoredNotifications(all);
  }

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${notifId}`);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tutorlink_notification_updated'));
  }
}

/**
 * Mark all notifications for a user as read
 */
export async function markAllNotificationsAsRead(userUid: string): Promise<void> {
  const all = getStoredNotifications();
  let modified = false;
  all.forEach((n) => {
    if (n.recipientUid === userUid || (!n.recipientUid && n.read === false)) {
      n.read = true;
      modified = true;
    }
  });
  if (modified) {
    saveStoredNotifications(all);
  }

  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientUid', '==', userUid),
        where('read', '==', false)
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.forEach((d) => {
        batch.update(d.ref, { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Could not mark all as read in Firestore:', err);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tutorlink_notification_updated'));
  }
}
