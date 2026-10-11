/**
 * Core Domain & Navigation Types for TutorLink
 */
import { UserRole } from './theme';

export type { UserRole };

export interface User {
  uid: string;
  name: string;
  email: string;
  roles: UserRole[];
  activeRole: UserRole;
  bio?: string;
  phone?: string;
  university?: string;
  degree?: string;
  yearOfStudy?: string;
  avatarInitials: string;
  avatarUrl?: string;
  linkedChildUid?: string;
  linkedChildName?: string;
  createdAt: string;
  /** Deprecated single-role alias for backward compatibility */
  role?: UserRole;
}

export interface TutorProfile {
  uid: string;
  name: string;
  headline?: string;
  bio?: string;
  subjects: string[];
  hourlyRate?: number;
  qualifications: string;
  experience: string;
  rating: number;
  reviewCount: number;
  completedSessions: number;
  verified: boolean;
  responseTime?: string;
  tags?: string[];
  avatarUrl?: string;
  avatarInitials?: string;
}

export interface AvailabilitySlot {
  id: string;
  tutorUid: string;
  day: string; // 'Monday', 'Tuesday', or '2026-03-24'
  start: string; // e.g. '9:00 AM'
  end: string;   // e.g. '11:30 AM'
  enabled: boolean;
}

export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  tuteeUid: string;
  tuteeName: string;
  tutorUid: string;
  tutorName: string;
  tutorAvatar?: string;
  subject: string;
  notes?: string;
  date: string;
  time: string;
  durationMins: number;
  price: number;
  status: BookingStatus;
  meetingLink?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId?: string;
  tutorUid: string;
  tuteeUid: string;
  tuteeName: string;
  stars: number;
  text: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reviewId: string;
  reportedBy: string;
  reason: string;
  createdAt: string;
}

export interface SavedTutor {
  id: string;
  tuteeUid: string;
  tutorUid: string;
  savedAt: string;
}

export * from './types/notifications';

// Navigation screen types
export type RootScreen =
  | 'RoleSelector'
  | 'Auth'
  | 'TuteeTab'
  | 'TutorTab'
  | 'ParentTab';

export type TuteeTab = 'Home' | 'Search' | 'Sessions' | 'Profile';
export type TutorTab = 'Dashboard' | 'Requests' | 'Availability' | 'Profile';
export type ParentTab = 'Home' | 'Progress' | 'Sessions' | 'Profile';
