/**
 * Tutor Profiles Service
 * Sinhala peer tutor profiles with anime avatars
 * Supports dynamic tutor registration, persistent local & Firestore storage,
 * and comprehensive student search.
 */
import { TutorProfile, User } from '../types';
import { ANIME_AVATARS, getAnimeAvatar } from '../utils/avatars';
import { isFirebaseConfigured, db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

export const STORAGE_KEY_CUSTOM_TUTORS = 'tutorlink_custom_tutors';
const STORAGE_KEY_USERS_DB = 'tutorlink_users_db';
const STORAGE_KEY_AUTH_USER = 'tutorlink_current_user';

export const SAMPLE_TUTORS: TutorProfile[] = [
  {
    uid: 'tutor_kavindu',
    name: 'Kavindu Perera',
    headline: 'Combined Maths mentor • University of Moratuwa Eng',
    bio: 'I turn complex calculus and trigonometry into intuitive, visual proofs. My sessions focus on past-paper techniques and confidence building.',
    subjects: ['Combined Maths', 'Calculus', 'Algebra', 'A/L Maths'],
    qualifications: 'Moratuwa Engineering Undergraduate, Island Top 50 A/L',
    experience: '3 years peer tutoring, 240+ sessions completed',
    rating: 4.9,
    reviewCount: 128,
    completedSessions: 240,
    verified: true,
    responseTime: 'Usually responds in 12 min',
    tags: ['Visual proofs', 'Past paper focus', 'Patient'],
    avatarUrl: ANIME_AVATARS.kavindu,
    avatarInitials: 'KP',
  },
  {
    uid: 'tutor_thisal',
    name: 'Thisal Jayawardena',
    headline: 'Chemistry & Biology mentor • Faculty of Medicine',
    bio: 'Passionate about organic chemistry reaction pathways and cell biology. Breaking down tricky mechanisms into memorable everyday analogies.',
    subjects: ['Chemistry', 'Organic Chemistry', 'Biology', 'A/L Science'],
    qualifications: 'Medical Student, 3A* District Rank',
    experience: '2 years university mentor & school tutor',
    rating: 4.8,
    reviewCount: 94,
    completedSessions: 180,
    verified: true,
    responseTime: 'Usually responds in 20 min',
    tags: ['Concept breakdown', 'Practice questions', 'Friendly'],
    avatarUrl: ANIME_AVATARS.thisal,
    avatarInitials: 'TJ',
  },
  {
    uid: 'tutor_sanduni',
    name: 'Sanduni Senanayake',
    headline: 'English Literature & Essay writing guide • UOC',
    bio: 'Critical thinking strategist and literature analyst. Let us elevate your essays, structure sharp arguments, and refine your authentic voice.',
    subjects: ['English Lit', 'Essay Writing', 'General English', 'IELTS'],
    qualifications: 'English Honors candidate, University of Colombo',
    experience: 'Writing center editor, guided 40+ university applicants',
    rating: 4.9,
    reviewCount: 65,
    completedSessions: 110,
    verified: true,
    responseTime: 'Usually responds in 15 min',
    tags: ['Essay structuring', 'Grammar polish', 'Supportive'],
    avatarUrl: ANIME_AVATARS.sanduni,
    avatarInitials: 'SS',
  },
  {
    uid: 'tutor_dinuka',
    name: 'Dinuka Silva',
    headline: 'Physics & Applied Mechanics tutor',
    bio: 'Mechanics and electricity made clear with interactive simulations and real-world examples. No rote memorization, just solid fundamentals.',
    subjects: ['Physics', 'Mechanics', 'Applied Maths'],
    qualifications: 'Mechanical Engineering Student',
    experience: 'Physics Olympiad medalist & high school tutor',
    rating: 4.7,
    reviewCount: 42,
    completedSessions: 85,
    verified: true,
    responseTime: 'Usually responds in 30 min',
    tags: ['Simulations', 'Step-by-step', 'Fundamentals'],
    avatarUrl: ANIME_AVATARS.dinuka,
    avatarInitials: 'DS',
  },
];

function getStoredCustomTutors(): Record<string, TutorProfile> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_TUTORS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredCustomTutors(map: Record<string, TutorProfile>) {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_TUTORS, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to save custom tutors to localStorage', err);
  }
}

/**
 * Creates or updates a tutor's public searchable profile
 */
export async function upsertTutorProfile(
  profileData: Partial<TutorProfile> & { uid: string; name: string }
): Promise<TutorProfile> {
  const customMap = getStoredCustomTutors();
  const existing = customMap[profileData.uid] || SAMPLE_TUTORS.find((s) => s.uid === profileData.uid);

  const fullProfile: TutorProfile = {
    uid: profileData.uid,
    name: profileData.name || existing?.name || 'Peer Tutor',
    headline:
      profileData.headline ||
      existing?.headline ||
      `${profileData.name} • Peer Tutor & Mentor`,
    bio:
      profileData.bio ||
      existing?.bio ||
      'Dedicated peer tutor ready to help students master core syllabus concepts, tackle past papers, and build academic confidence.',
    subjects:
      profileData.subjects && profileData.subjects.length > 0
        ? profileData.subjects
        : existing?.subjects || ['Combined Maths', 'Physics'],
    qualifications:
      profileData.qualifications ||
      existing?.qualifications ||
      'Undergraduate Peer Mentor • Top A/L Achievement',
    experience:
      profileData.experience ||
      existing?.experience ||
      '1+ years peer mentoring & study groups',
    rating: existing?.rating || 5.0,
    reviewCount: existing?.reviewCount || 1,
    completedSessions: existing?.completedSessions || 0,
    verified: true,
    responseTime: profileData.responseTime || existing?.responseTime || 'Usually responds in 15 min',
    tags: profileData.tags || existing?.tags || ['Patient', 'Exam Focus', 'Concept Clarity'],
    avatarUrl: profileData.avatarUrl || existing?.avatarUrl || getAnimeAvatar(profileData.name),
    avatarInitials: profileData.avatarInitials || existing?.avatarInitials,
  };

  customMap[profileData.uid] = fullProfile;
  saveStoredCustomTutors(customMap);

  // Sync with Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'tutors', profileData.uid), fullProfile, { merge: true });
    } catch (err) {
      console.warn('Could not sync tutor profile to Firestore', err);
    }
  }

  return fullProfile;
}

/**
 * Automatically discovers any tutor accounts created in usersDb
 * and ensures they have a public searchable TutorProfile.
 */
function syncRegisteredTutorsFromUsersDb(): void {
  try {
    const customMap = getStoredCustomTutors();
    let updated = false;

    // Check users database
    const usersRaw = localStorage.getItem(STORAGE_KEY_USERS_DB);
    const usersDb: Record<string, User> = usersRaw ? JSON.parse(usersRaw) : {};

    // Also check currently logged-in user
    const currentRaw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (currentRaw) {
      const currentUser: User = JSON.parse(currentRaw);
      if (currentUser?.uid) {
        usersDb[currentUser.uid] = currentUser;
      }
    }

    Object.values(usersDb).forEach((u) => {
      const hasTutorRole = Array.isArray(u.roles)
        ? u.roles.includes('tutor')
        : (u.activeRole === 'tutor' || u.role === 'tutor');

      if (hasTutorRole && u.uid) {
        if (!customMap[u.uid] && !SAMPLE_TUTORS.some((s) => s.uid === u.uid)) {
          customMap[u.uid] = {
            uid: u.uid,
            name: u.name || 'Peer Tutor',
            headline: `${u.name} • Peer Tutor & Mentor`,
            bio: u.bio || 'Dedicated peer tutor ready to help students master core syllabus concepts, tackle past papers, and build academic confidence.',
            subjects: ['Combined Maths', 'Physics'],
            qualifications: 'Undergraduate Peer Mentor • Top A/L Achievement',
            experience: '1+ years peer mentoring & study groups',
            rating: 5.0,
            reviewCount: 0,
            completedSessions: 0,
            verified: false,
            responseTime: 'Usually responds in 15 min',
            tags: ['Patient', 'Exam Focus', 'Concept Clarity'],
            avatarUrl: u.avatarUrl || getAnimeAvatar(u.name || 'Tutor'),
            avatarInitials: u.avatarInitials,
          };
          updated = true;
        }
      }
    });

    if (updated) {
      saveStoredCustomTutors(customMap);
    }
  } catch (err) {
    console.error('Error auto-syncing tutors from users db', err);
  }
}

/**
 * Fetch all available tutors, merging custom/registered tutors and sample profiles
 */
export async function getTutors(): Promise<TutorProfile[]> {
  // 1. Ensure any registered tutor in the app is synced into the custom directory
  syncRegisteredTutorsFromUsersDb();

  const customMap = getStoredCustomTutors();

  // 2. Fetch from Firestore if configured (check tutorProfiles collection)
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'tutorProfiles'));
      snap.forEach((docSnap) => {
        const data = docSnap.data() as TutorProfile;
        if (data.uid) {
          customMap[data.uid] = data;
        }
      });
      saveStoredCustomTutors(customMap);
    } catch (err) {
      console.warn('Could not fetch tutorProfiles from Firestore', err);
    }
  }

  // Check active users in db to filter out tutors who disabled tutor role
  let disabledTutorUids = new Set<string>();
  try {
    const usersRaw = localStorage.getItem(STORAGE_KEY_USERS_DB);
    if (usersRaw) {
      const usersDb: Record<string, User> = JSON.parse(usersRaw);
      Object.values(usersDb).forEach((u) => {
        if (Array.isArray(u.roles) && !u.roles.includes('tutor')) {
          disabledTutorUids.add(u.uid);
        }
      });
    }
  } catch {}

  // 3. Merge: custom/user-created tutors first, followed by sample tutors (without duplicates)
  const merged: TutorProfile[] = [];
  const existingUids = new Set<string>();

  for (const t of Object.values(customMap)) {
    // If hidden or user disabled their tutor role, don't show in search
    if ((t as any).hidden || disabledTutorUids.has(t.uid)) {
      continue;
    }
    merged.push(t);
    existingUids.add(t.uid);
  }

  for (const sample of SAMPLE_TUTORS) {
    if (!existingUids.has(sample.uid) && !disabledTutorUids.has(sample.uid)) {
      merged.push(sample);
      existingUids.add(sample.uid);
    }
  }

  return merged;
}

/**
 * Get single tutor by uid
 */
export async function getTutorById(uid: string): Promise<TutorProfile | null> {
  const tutors = await getTutors();
  const found = tutors.find((t) => t.uid === uid);
  return found || null;
}
