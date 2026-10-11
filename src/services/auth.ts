/**
 * Authentication Service
 * Firebase Auth (Email/Password) + Firestore Users collection
 * with resilient offline/demo fallback and multi-role support
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, handleFirestoreError, OperationType } from './firebase';
import { User, UserRole, TutorProfile } from '../types';
import { normalizeUser } from './profile';

const STORAGE_KEY_AUTH_USER = 'tutorlink_current_user';
const STORAGE_KEY_USERS_DB = 'tutorlink_users_db';
const STORAGE_KEY_CUSTOM_TUTORS = 'tutorlink_custom_tutors';

/**
 * Pre-configured Sinhala demo user accounts with full profile details
 */
export const SEED_USERS: Record<string, User> = {
  tutor_kavindu: {
    uid: 'tutor_kavindu',
    name: 'Kavindu Perera',
    email: 'kavindu.p@mrt.ac.lk',
    roles: ['tutor'],
    activeRole: 'tutor',
    role: 'tutor',
    bio: 'Moratuwa Engineering undergraduate specializing in A/L Combined Maths calculus and vectors. Patient and structured approach.',
    phone: '+94 77 234 5678',
    university: 'University of Moratuwa',
    degree: 'B.Sc. (Hons) in Engineering',
    yearOfStudy: 'Level 2 Undergraduate',
    avatarInitials: 'KP',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  parent_malani: {
    uid: 'parent_malani',
    name: 'Malani Jayawardena',
    email: 'malani.j@family.lk',
    roles: ['parent'],
    activeRole: 'parent',
    role: 'parent',
    bio: 'Parent of Senuri Dias. Actively supporting peer tutoring and academic schedules.',
    phone: '+94 71 890 1234',
    university: '',
    degree: '',
    yearOfStudy: '',
    linkedChildName: 'Senuri Dias',
    linkedChildUid: 'user_senuri',
    avatarInitials: 'MJ',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  user_senuri: {
    uid: 'user_senuri',
    name: 'Senuri Dias',
    email: 'senuri.dias@school.lk',
    roles: ['tutee'],
    activeRole: 'tutee',
    role: 'tutee',
    bio: 'A/L Physical Science student looking for peer guidance in Combined Mathematics and Chemistry.',
    phone: '+94 76 543 2109',
    university: 'Visakha Vidyalaya Colombo',
    degree: 'GCE Advanced Level (Physical Science)',
    yearOfStudy: 'Grade 12',
    avatarInitials: 'SD',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
};

/**
 * Helper to determine user role from email address and/or explicit selection
 */
export function inferRole(email: string, preferredRole?: UserRole): UserRole {
  const lower = email.toLowerCase().trim();

  if (
    lower === 'kavindu.p@mrt.ac.lk' ||
    lower.includes('kavindu') ||
    lower.includes('thisal') ||
    lower.includes('sanduni') ||
    lower.includes('tutor') ||
    lower.endsWith('mrt.ac.lk')
  ) {
    return 'tutor';
  }

  if (
    lower === 'malani.j@family.lk' ||
    lower.includes('malani') ||
    lower.includes('parent') ||
    lower.includes('family.lk')
  ) {
    return 'parent';
  }

  if (
    lower === 'senuri.dias@school.lk' ||
    lower === 'senuri.dias@uni.lk' ||
    lower.includes('senuri') ||
    lower.includes('student') ||
    lower.includes('tutee')
  ) {
    return 'tutee';
  }

  if (preferredRole) {
    return preferredRole;
  }

  return 'tutee';
}

function getLocalUsersDb(): Record<string, User> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS_DB);
    const parsed: Record<string, any> = raw ? JSON.parse(raw) : {};

    // Merge seed users and normalize all users
    const merged: Record<string, User> = {};
    for (const [k, v] of Object.entries({ ...SEED_USERS, ...parsed })) {
      merged[k] = normalizeUser(v);
    }
    return merged;
  } catch {
    return { ...SEED_USERS };
  }
}

function saveLocalUsersDb(db: Record<string, User>) {
  try {
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save local users', e);
  }
}

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (!raw) return null;
    return normalizeUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

function setStoredUser(user: User | null) {
  try {
    if (user) {
      const normalized = normalizeUser(user);
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(normalized));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    }
  } catch (e) {
    console.error('Failed to set stored user', e);
  }
}

export function generateInitials(name: string): string {
  if (!name || !name.trim()) return 'TL';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Register a new user with email, password, full name, and selected starting role.
 * User starts with roles = [role], activeRole = role.
 */
export async function registerUser(
  email: string,
  pass: string,
  name: string,
  startingRole: UserRole
): Promise<User> {
  const initials = generateInitials(name);
  const now = new Date().toISOString();

  const newUser: User = {
    uid: '',
    name,
    email,
    roles: [startingRole],
    activeRole: startingRole,
    role: startingRole,
    avatarInitials: initials,
    createdAt: now,
  };

  if (isFirebaseConfigured && auth && db) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;
      newUser.uid = fbUser.uid;

      try {
        await setDoc(doc(db, 'users', fbUser.uid), newUser);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
      }

      // If registered with tutor role, create initial tutorProfiles doc with verified = false
      if (startingRole === 'tutor') {
        const tutorProfile: TutorProfile = {
          uid: fbUser.uid,
          name: newUser.name,
          headline: `${newUser.name} • Peer Tutor`,
          bio: 'Passionate peer tutor ready to help students achieve academic excellence.',
          subjects: ['Combined Maths', 'Physics'],
          qualifications: 'Undergraduate Peer Tutor',
          experience: 'Peer mentoring',
          rating: 5.0,
          reviewCount: 0,
          completedSessions: 0,
          verified: false, // Must be false at creation
          responseTime: 'Usually responds in 15 min',
          tags: ['Patient', 'Exam Focus'],
          avatarInitials: newUser.avatarInitials,
        };
        try {
          await setDoc(doc(db, 'tutorProfiles', fbUser.uid), tutorProfile);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `tutorProfiles/${fbUser.uid}`);
        }
      }

      setStoredUser(newUser);
      return newUser;
    } catch (err) {
      console.error('Firebase registration error:', err);
      throw err;
    }
  }

  // Demo Fallback Mode
  const prefix = startingRole === 'tutor' ? 'tutor_' : startingRole === 'parent' ? 'parent_' : 'user_';
  const demoUid = prefix + Math.random().toString(36).substring(2, 9);
  newUser.uid = demoUid;

  const usersDb = getLocalUsersDb();
  usersDb[demoUid] = newUser;
  saveLocalUsersDb(usersDb);
  setStoredUser(newUser);

  if (startingRole === 'tutor') {
    const customTutorsRaw = localStorage.getItem(STORAGE_KEY_CUSTOM_TUTORS);
    const customTutors: Record<string, TutorProfile> = customTutorsRaw ? JSON.parse(customTutorsRaw) : {};
    customTutors[demoUid] = {
      uid: demoUid,
      name: newUser.name,
      headline: `${newUser.name} • Peer Tutor`,
      bio: 'Passionate peer tutor ready to help students achieve academic excellence.',
      subjects: ['Combined Maths', 'Physics'],
      qualifications: 'Undergraduate Peer Tutor',
      experience: 'Peer mentoring',
      rating: 5.0,
      reviewCount: 0,
      completedSessions: 0,
      verified: false,
      responseTime: 'Usually responds in 15 min',
      tags: ['Patient', 'Exam Focus'],
      avatarInitials: newUser.avatarInitials,
    };
    localStorage.setItem(STORAGE_KEY_CUSTOM_TUTORS, JSON.stringify(customTutors));
  }

  return newUser;
}

/**
 * Sign in existing user with email and password
 */
export async function loginUser(
  email: string,
  pass: string,
  preferredRole?: UserRole
): Promise<User> {
  const targetRole = inferRole(email, preferredRole);

  if (isFirebaseConfigured && auth && db) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;

      let userProfile: User | null = null;
      try {
        const snap = await getDoc(doc(db, 'users', fbUser.uid));
        if (snap.exists()) {
          userProfile = normalizeUser(snap.data());
          // If user selects a preferred role and holds it in roles, switch to it
          if (preferredRole && userProfile.roles.includes(preferredRole) && userProfile.activeRole !== preferredRole) {
            userProfile.activeRole = preferredRole;
            userProfile.role = preferredRole;
            await updateDoc(doc(db, 'users', fbUser.uid), { activeRole: preferredRole });
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}`);
      }

      if (!userProfile) {
        // Fallback user profile if Firestore doc was missing
        userProfile = {
          uid: fbUser.uid,
          name: fbUser.displayName || email.split('@')[0],
          email,
          roles: [targetRole],
          activeRole: targetRole,
          role: targetRole,
          avatarInitials: generateInitials(fbUser.displayName || email.split('@')[0]),
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', fbUser.uid), userProfile);
      }

      setStoredUser(userProfile);
      return userProfile;
    } catch (err) {
      console.error('Firebase sign-in error:', err);
      throw err;
    }
  }

  // Demo Fallback Mode
  const usersDb = getLocalUsersDb();
  const lowerEmail = email.toLowerCase().trim();

  // 1. Match by email
  let existing = Object.values(usersDb).find((u) => u.email.toLowerCase() === lowerEmail);

  // 2. Persona shortcuts / aliases
  if (!existing) {
    if (lowerEmail === 'kavindu' || lowerEmail === 'tutor' || lowerEmail === 'tutor@tutorlink.lk') {
      existing = usersDb['tutor_kavindu'];
    } else if (lowerEmail === 'malani' || lowerEmail === 'parent' || lowerEmail === 'parent@tutorlink.lk') {
      existing = usersDb['parent_malani'];
    } else if (lowerEmail === 'senuri' || lowerEmail === 'student' || lowerEmail === 'tutee' || lowerEmail === 'student@tutorlink.lk') {
      existing = usersDb['user_senuri'];
    }
  }

  if (existing) {
    const normalized = normalizeUser(existing);
    if (preferredRole && normalized.roles.includes(preferredRole)) {
      normalized.activeRole = preferredRole;
      normalized.role = preferredRole;
    }
    usersDb[normalized.uid] = normalized;
    saveLocalUsersDb(usersDb);
    setStoredUser(normalized);
    return normalized;
  }

  // 3. Fallback mock profile
  const prefix = targetRole === 'tutor' ? 'tutor_' : targetRole === 'parent' ? 'parent_' : 'user_';
  const demoUid = prefix + Math.random().toString(36).substring(2, 9);
  const rawName = email.split('@')[0].replace(/[._-]/g, ' ');
  const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const fallbackUser: User = {
    uid: demoUid,
    name: formattedName,
    email,
    roles: [targetRole],
    activeRole: targetRole,
    role: targetRole,
    avatarInitials: generateInitials(formattedName),
    createdAt: new Date().toISOString(),
  };

  usersDb[demoUid] = fallbackUser;
  saveLocalUsersDb(usersDb);
  setStoredUser(fallbackUser);

  return fallbackUser;
}

/**
 * Log out current user
 */
export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signout error:', err);
    }
  }
  setStoredUser(null);
}

/**
 * Get current authenticated user profile
 */
export function getCurrentUser(): User | null {
  return getStoredUser();
}

/**
 * Update active role
 */
export async function switchUserRole(uid: string, newRole: UserRole): Promise<User> {
  const current = getStoredUser();
  if (!current) throw new Error('No user logged in');

  // If user does not yet have newRole enabled, enable it automatically for convenience
  let updatedRoles = current.roles;
  if (!updatedRoles.includes(newRole)) {
    updatedRoles = [...updatedRoles, newRole];
  }

  const updated: User = {
    ...current,
    roles: updatedRoles,
    activeRole: newRole,
    role: newRole,
  };

  setStoredUser(updated);

  const usersDb = getLocalUsersDb();
  if (usersDb[uid]) {
    usersDb[uid] = updated;
    saveLocalUsersDb(usersDb);
  }

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        roles: updatedRoles,
        activeRole: newRole,
        role: newRole,
      });
    } catch (err) {
      console.warn('Could not sync role to Firestore:', err);
    }
  }

  return updated;
}

/**
 * Listen to auth state transitions
 */
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  // Fire initial state immediately
  callback(getStoredUser());

  if (isFirebaseConfigured && auth && db) {
    const currentDb = db;
    const unsub = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (!fbUser) {
        setStoredUser(null);
        callback(null);
      } else {
        try {
          const snap = await getDoc(doc(currentDb, 'users', fbUser.uid));
          if (snap.exists()) {
            const user = normalizeUser(snap.data());
            setStoredUser(user);
            callback(user);
          }
        } catch {
          // Keep existing local user
        }
      }
    });
    return unsub;
  }

  return () => {};
}
