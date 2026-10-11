/**
 * Availability & Reviews Services
 * Sinhala peer tutor reviews and schedules
 */
import { AvailabilitySlot, Review } from '../types';

export const SAMPLE_AVAILABILITY: AvailabilitySlot[] = [
  { id: 'slot_1', tutorUid: 'tutor_kavindu', day: 'Tuesday', start: '9:00 AM', end: '11:30 AM', enabled: true },
  { id: 'slot_2', tutorUid: 'tutor_kavindu', day: 'Tuesday', start: '2:00 PM', end: '4:00 PM', enabled: true },
  { id: 'slot_3', tutorUid: 'tutor_kavindu', day: 'Tuesday', start: '5:30 PM', end: '6:30 PM', enabled: true },
  { id: 'slot_4', tutorUid: 'tutor_kavindu', day: 'Wednesday', start: '3:00 PM', end: '6:00 PM', enabled: true },
  { id: 'slot_5', tutorUid: 'tutor_kavindu', day: 'Thursday', start: '4:00 PM', end: '7:00 PM', enabled: true },
];

export const SAMPLE_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    tutorUid: 'tutor_kavindu',
    tuteeUid: 'user_tharindu',
    tuteeName: 'Tharindu Weerakkody',
    stars: 5,
    text: 'Kavindu helped me finally master integration by parts and feel confident for my upcoming term test.',
    createdAt: '2 weeks ago',
  },
  {
    id: 'rev_2',
    tutorUid: 'tutor_kavindu',
    tuteeUid: 'user_senuri',
    tuteeName: 'Senuri Dias',
    stars: 5,
    text: 'Explains complex problems in multiple clear visual ways until it truly clicks. Very patient tutor!',
    createdAt: '1 month ago',
  },
];

export async function getTutorAvailability(tutorUid: string): Promise<AvailabilitySlot[]> {
  return SAMPLE_AVAILABILITY.filter((s) => s.tutorUid === tutorUid || tutorUid === 'current_user');
}

export async function getTutorReviews(tutorUid: string): Promise<Review[]> {
  return SAMPLE_REVIEWS.filter((r) => r.tutorUid === tutorUid || tutorUid === 'current_user');
}

/**
 * Add a review for a tutor
 * Integrity rule: a user can never review themselves
 */
export async function addTutorReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  if (review.tuteeUid && review.tutorUid && review.tuteeUid === review.tutorUid) {
    throw new Error('Integrity rule: You cannot review your own tutor profile.');
  }

  const newReview: Review = {
    ...review,
    id: `rev_${Date.now()}`,
    createdAt: 'Just now',
  };

  SAMPLE_REVIEWS.unshift(newReview);
  return newReview;
}
