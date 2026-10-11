/**
 * Bookings Service
 * Handles booking requests, acceptance with external meeting links,
 * status transitions, and Firestore synchronization.
 */
import { Booking, BookingStatus } from '../types';
import { ANIME_AVATARS } from '../utils/avatars';
import { isValidMeetingUrl } from './linking';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from './firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { sendNotification } from './notifications';

export { isValidMeetingUrl };

const STORAGE_KEY_BOOKINGS = 'tutorlink_bookings_db';

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'booking_1',
    tuteeUid: 'user_senuri',
    tuteeName: 'Senuri Dias',
    tutorUid: 'tutor_kavindu',
    tutorName: 'Kavindu Perera',
    tutorAvatar: ANIME_AVATARS.kavindu,
    subject: 'Combined Maths',
    notes: 'Derivatives & integration past-paper review',
    date: 'Today',
    time: '5:30 PM',
    durationMins: 60,
    price: 24,
    status: 'accepted',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    createdAt: '2026-03-23T10:00:00Z',
  },
  {
    id: 'booking_2',
    tuteeUid: 'user_senuri',
    tuteeName: 'Senuri Dias',
    tutorUid: 'tutor_thisal',
    tutorName: 'Thisal Jayawardena',
    tutorAvatar: ANIME_AVATARS.thisal,
    subject: 'Chemistry',
    notes: 'Organic reaction mechanisms & stoichiometry practice',
    date: 'Tomorrow',
    time: '4:00 PM',
    durationMins: 45,
    price: 20,
    status: 'pending',
    createdAt: '2026-03-24T08:00:00Z',
  },
  {
    id: 'booking_3',
    tuteeUid: 'user_chamod',
    tuteeName: 'Chamod Silva',
    tutorUid: 'tutor_kavindu',
    tutorName: 'Kavindu Perera',
    tutorAvatar: ANIME_AVATARS.kavindu,
    subject: 'Pure Maths',
    notes: 'Trigonometry identities and circle theorems',
    date: 'Tomorrow',
    time: '5:00 PM',
    durationMins: 45,
    price: 24,
    status: 'pending',
    createdAt: '2026-03-24T09:00:00Z',
  },
];

function getStoredBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read bookings from storage', e);
  }
  // Initialize with samples
  saveStoredBookings(INITIAL_BOOKINGS);
  return INITIAL_BOOKINGS;
}

function saveStoredBookings(bookings: Booking[]) {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to write bookings to storage', e);
  }
}

/**
 * Read bookings for a specific user role
 */
export async function getBookingsForUser(userUid: string, role: string): Promise<Booking[]> {
  const all = getStoredBookings();
  if (role === 'tutor') {
    return all.filter((b) => b.tutorUid === userUid || b.tutorUid === 'tutor_kavindu');
  }
  return all;
}

/**
 * Create a new tutoring session booking
 * Integrity rule: a user can never book their own tutor profile
 */
export async function createBooking(payload: {
  tuteeUid: string;
  tuteeName: string;
  tutorUid: string;
  tutorName: string;
  tutorAvatar?: string;
  subject: string;
  notes?: string;
  date?: string;
  time?: string;
  durationMins?: number;
  price?: number;
}): Promise<Booking> {
  if (payload.tuteeUid && payload.tutorUid && payload.tuteeUid === payload.tutorUid) {
    throw new Error('Integrity rule: You cannot book your own tutor profile.');
  }

  const newBooking: Booking = {
    id: `booking_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    tuteeUid: payload.tuteeUid,
    tuteeName: payload.tuteeName,
    tutorUid: payload.tutorUid,
    tutorName: payload.tutorName,
    tutorAvatar: payload.tutorAvatar,
    subject: payload.subject,
    notes: payload.notes || 'Peer tutoring session',
    date: payload.date || 'Tomorrow',
    time: payload.time || '4:00 PM',
    durationMins: payload.durationMins || 60,
    price: payload.price ?? 20,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const bookings = getStoredBookings();
  bookings.unshift(newBooking);
  saveStoredBookings(bookings);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'bookings', newBooking.id), newBooking);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `bookings/${newBooking.id}`);
    }
  }

  // Notify the tutor about the incoming session request
  try {
    await sendNotification({
      recipientUid: payload.tutorUid,
      senderUid: payload.tuteeUid,
      senderName: payload.tuteeName,
      recipientRole: 'tutor',
      type: 'session_request',
      title: 'New Session Request',
      message: `${payload.tuteeName} requested a ${payload.subject} session (${newBooking.date} at ${newBooking.time}).`,
      bookingId: newBooking.id,
      subject: payload.subject,
    });
  } catch (notifErr) {
    console.warn('Failed to send session request notification to tutor:', notifErr);
  }

  return newBooking;
}

/**
 * Accept a pending booking and optionally set an external meeting link (Zoom / Google Meet)
 */
export async function acceptBooking(
  bookingId: string,
  meetingLink?: string
): Promise<Booking> {
  const cleanLink = meetingLink?.trim();

  // Validate https URL if provided
  if (cleanLink && !isValidMeetingUrl(cleanLink)) {
    throw new Error('Invalid meeting URL. Link must start with https://');
  }

  const bookings = getStoredBookings();
  const targetIndex = bookings.findIndex((b) => b.id === bookingId);
  if (targetIndex === -1) {
    throw new Error(`Booking with ID ${bookingId} not found`);
  }

  const existingBooking = bookings[targetIndex];
  const updated: Booking = {
    ...existingBooking,
    status: 'accepted',
    meetingLink: cleanLink || undefined,
  };

  bookings[targetIndex] = updated;
  saveStoredBookings(bookings);

  // Sync to Firestore if live Firebase is active
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'accepted',
        meetingLink: cleanLink || null,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  }

  // Notify the student that their session request was accepted
  try {
    await sendNotification({
      recipientUid: existingBooking.tuteeUid,
      senderUid: existingBooking.tutorUid,
      senderName: existingBooking.tutorName,
      recipientRole: 'tutee',
      type: 'session_accepted',
      title: 'Session Request Accepted!',
      message: `${existingBooking.tutorName} accepted your ${existingBooking.subject} session (${existingBooking.date} at ${existingBooking.time}).`,
      bookingId: existingBooking.id,
      subject: existingBooking.subject,
      meetingLink: cleanLink || existingBooking.meetingLink,
    });
  } catch (notifErr) {
    console.warn('Failed to send session accepted notification to student:', notifErr);
  }

  return updated;
}

/**
 * Decline a pending booking
 */
export async function declineBooking(bookingId: string): Promise<Booking> {
  const bookings = getStoredBookings();
  const targetIndex = bookings.findIndex((b) => b.id === bookingId);
  if (targetIndex === -1) {
    throw new Error(`Booking with ID ${bookingId} not found`);
  }

  const updated: Booking = {
    ...bookings[targetIndex],
    status: 'declined',
  };

  bookings[targetIndex] = updated;
  saveStoredBookings(bookings);

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: 'declined' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  }

  return updated;
}

/**
 * Add, update, or clear a meeting link on an existing session
 */
export async function updateMeetingLink(
  bookingId: string,
  meetingLink: string
): Promise<Booking> {
  const cleanLink = meetingLink.trim();

  // If a link is provided (non-empty), validate that it's https
  if (cleanLink && !isValidMeetingUrl(cleanLink)) {
    throw new Error('Invalid meeting URL. Link must start with https://');
  }

  const bookings = getStoredBookings();
  const targetIndex = bookings.findIndex((b) => b.id === bookingId);
  if (targetIndex === -1) {
    throw new Error(`Booking with ID ${bookingId} not found`);
  }

  const updated: Booking = {
    ...bookings[targetIndex],
    meetingLink: cleanLink ? cleanLink : undefined, // Empty string clears the link
  };

  bookings[targetIndex] = updated;
  saveStoredBookings(bookings);

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        meetingLink: cleanLink ? cleanLink : null,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  }

  return updated;
}
