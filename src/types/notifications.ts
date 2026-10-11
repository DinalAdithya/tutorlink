/**
 * Notification Types
 */
export type NotificationType = 'session_request' | 'session_accepted' | 'session_declined' | 'system';

export interface AppNotification {
  id: string;
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
  read: boolean;
  createdAt: string;
}
