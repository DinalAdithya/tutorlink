/**
 * Profile & Multi-Role Service for TutorLink
 * Manages user personal profiles, multi-role lifecycle (tutee, tutor, parent),
 * role switching, tutorProfiles collection synchronization, and account deletion.
 */
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from 'firebase/auth';
import { auth, db, isFirebaseConfigured, handleFirestoreError, OperationType } from './firebase';
import { User, UserRole, TutorProfile } from '../types';
import { generateInitials } from './auth';
import { getAnimeAvatar } from '../utils/avatars';

const STORAGE_KEY_AUTH_USER = 'tutorlink_current_user';
const STORAGE_KEY_USERS_DB = 'tutorlink_users_db';
const STORAGE_KEY_CUSTOM_TUTORS = 'tutorlink_custom_tutors';

function isDemoUid(uid: string): boolean {
  return /^(user|tutor|parent)_/.test(uid);
}

function getLocalUsersDb(): Record<string, User> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS_DB);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalUsersDb(data: Record<string, User>): void {
  try {
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save local users db', e);
  }
}

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    }
  } catch (e) {
    console.error('Failed to update stored user', e);
  }
}

function getStoredCustomTutors(): Record<string, TutorProfile> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_TUTORS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredCustomTutors(map: Record<string, TutorProfile>): void {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_TUTORS, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to save custom tutors', err);
  }
}

/**
 * Normalizes user data ensuring multi-role schema adherence:
 * roles: ("tutee" | "tutor" | "parent")[]
 * activeRole: "tutee" | "tutor" | "parent"
 */
export function normalizeUser(raw: any): User {
  const roleFallback: UserRole = raw.role || 'tutee';
  const roles: UserRole[] = Array.isArray(raw.roles) && raw.roles.length > 0
    ? Array.from(new Set(raw.roles)) as UserRole[]
    : [roleFallback];

  let activeRole: UserRole = raw.activeRole || roleFallback;
  if (!roles.includes(activeRole)) {
    activeRole = roles[0];
  }

  const name = raw.name || 'TutorLink User';
  const avatarInitials = raw.avatarInitials || generateInitials(name);

  return {
    uid: raw.uid,
    name,
    email: raw.email || '',
    roles,
    activeRole,
    role: activeRole, // backward compatibility
    bio: raw.bio || '',
    phone: raw.phone || '',
    university: raw.university || '',
    degree: raw.degree || '',
    yearOfStudy: raw.yearOfStudy || '',
    avatarInitials,
    avatarUrl: raw.avatarUrl || getAnimeAvatar(name),
    linkedChildUid: raw.linkedChildUid,
    linkedChildName: raw.linkedChildName,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

/**
 * Fetch user profile from Firestore or local storage
 */
export async function getProfile(uid: string): Promise<User | null> {
  if (
    isFirebaseConfigured &&
    db &&
    !isDemoUid(uid) &&
    auth?.currentUser?.uid === uid
  ) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const normalized = normalizeUser(snap.data());
        setStoredUser(normalized);
        return normalized;
      }
    } catch (err) {
      console.warn(`Could not read Firestore profile users/${uid}; falling back to local profile data.`, err);
    }
  }

  // Fallback to local storage
  const current = getStoredUser();
  if (current && current.uid === uid) {
    return normalizeUser(current);
  }

  const usersDb = getLocalUsersDb();
  if (usersDb[uid]) {
    return normalizeUser(usersDb[uid]);
  }

  return null;
}

/**
 * Updates personal details with validation
 */
export async function updateProfile(uid: string, data: Partial<User>): Promise<User> {
  const current = await getProfile(uid);
  if (!current) {
    throw new Error('User not found');
  }

  // Validation
  if (data.name !== undefined && !data.name.trim()) {
    throw new Error('Full name is required');
  }

  if (data.phone && data.phone.trim()) {
    const cleanPhone = data.phone.trim();
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
    if (!phoneRegex.test(cleanPhone)) {
      throw new Error('Please enter a valid phone number (e.g. +94 77 123 4567 or 0771234567)');
    }
  }

  const updatedName = data.name !== undefined ? data.name.trim() : current.name;
  const updatedInitials = generateInitials(updatedName);

  const updated: User = {
    ...current,
    ...data,
    name: updatedName,
    avatarInitials: updatedInitials,
    role: current.activeRole,
  };

  const shouldSyncToFirebase = isFirebaseConfigured && !isDemoUid(uid);
  if (shouldSyncToFirebase && !db) {
    throw new Error('Firebase is configured but Firestore is unavailable. Check the app configuration and try again.');
  }
  if (shouldSyncToFirebase && auth?.currentUser?.uid !== uid) {
    throw new Error('Your Firebase sign-in has expired or changed. Sign out and sign in again before updating your profile.');
  }

  if (shouldSyncToFirebase && db) {
    try {
      await setDoc(doc(db, 'users', uid), {
        uid,
        name: updated.name,
        email: updated.email,
        roles: updated.roles,
        activeRole: updated.activeRole,
        role: updated.activeRole,
        avatarInitials: updated.avatarInitials,
        createdAt: updated.createdAt,
        bio: updated.bio || '',
        phone: updated.phone || '',
        university: updated.university || '',
        degree: updated.degree || '',
        yearOfStudy: updated.yearOfStudy || '',
        ...(updated.avatarUrl ? { avatarUrl: updated.avatarUrl } : {}),
        ...(updated.linkedChildUid ? { linkedChildUid: updated.linkedChildUid } : {}),
        ...(updated.linkedChildName ? { linkedChildName: updated.linkedChildName } : {}),
      }, { merge: true });
    } catch (err) {
      const code =
        err !== null && typeof err === 'object' && 'code' in err &&
        typeof err.code === 'string'
          ? err.code
          : '';
      console.error(`Could not update Firestore profile users/${uid}.`, err);
      if (code === 'permission-denied') {
        throw new Error('Firebase denied the profile update. Check that the published Firestore rules allow the signed-in user to update their own users document.');
      }
      if (code === 'unavailable' || code === 'deadline-exceeded') {
        throw new Error('Could not reach Firestore to save your profile. Check your internet connection and try again.');
      }
      throw new Error(err instanceof Error ? err.message : 'Could not save your profile to Firebase.');
    }
  }

  // If user has tutor role, sync tutor profile name and avatar
  if (updated.roles.includes('tutor')) {
    const customTutors = getStoredCustomTutors();
    if (customTutors[uid]) {
      customTutors[uid] = {
        ...customTutors[uid],
        name: updated.name,
        avatarInitials: updated.avatarInitials,
        bio: updated.bio || customTutors[uid].bio,
      };
      saveStoredCustomTutors(customTutors);
    }

    if (shouldSyncToFirebase && db) {
      try {
        await updateDoc(doc(db, 'tutorProfiles', uid), {
          name: updated.name,
          avatarInitials: updated.avatarInitials,
        });
      } catch (err) {
        console.warn(`Could not sync tutor profile details for tutorProfiles/${uid}.`, err);
      }
    }
  }

  // Save locally only after the cloud profile write has succeeded.
  const usersDb = getLocalUsersDb();
  usersDb[uid] = updated;
  saveLocalUsersDb(usersDb);
  setStoredUser(updated);

  return updated;
}

/**
 * Enables an extra role for the user
 * - "tutee": one-tap add
 * - "tutor": creates tutorProfiles document with verified=false
 * - "parent": links a child via code
 */
export async function enableRole(
  uid: string,
  role: UserRole,
  extraData?: {
    subjects?: string[];
    qualifications?: string;
    experience?: string;
    hourlyRate?: number;
    headline?: string;
    bio?: string;
    linkCode?: string;
    childUid?: string;
    childName?: string;
  }
): Promise<User> {
  const current = (await getProfile(uid)) || getStoredUser();
  if (!current) throw new Error('User not found');

  const newRoles: UserRole[] = current.roles.includes(role)
    ? current.roles
    : [...current.roles, role];

  const updatedUser: User = {
    ...current,
    roles: newRoles,
    activeRole: role, // automatically switch to newly enabled role
    role: role,
  };

  // If enabling tutor role, create tutorProfiles doc with verified = false
  if (role === 'tutor') {
    const defaultHeadline = `${current.name} • Peer Tutor`;
    const tutorProfileDoc: TutorProfile = {
      uid: current.uid,
      name: current.name,
      headline: extraData?.headline || defaultHeadline,
      bio: extraData?.bio || current.bio || 'Dedicated peer tutor offering high-quality academic support.',
      subjects: extraData?.subjects && extraData.subjects.length > 0
        ? extraData.subjects
        : ['Combined Maths', 'Physics'],
      qualifications: extraData?.qualifications?.trim() || 'Undergraduate Peer Tutor',
      experience: extraData?.experience?.trim() || '1+ years peer tutoring and mentoring',
      hourlyRate: extraData?.hourlyRate,
      rating: 5.0,
      reviewCount: 0,
      completedSessions: 0,
      verified: false, // Critical rule: verified is always false at creation
      responseTime: 'Usually responds in 15 min',
      tags: ['Patient', 'Exam Focus', 'Peer Guidance'],
      avatarUrl: current.avatarUrl || getAnimeAvatar(current.name),
      avatarInitials: current.avatarInitials,
    };

    // Save to local custom tutors
    const customTutors = getStoredCustomTutors();
    customTutors[uid] = tutorProfileDoc;
    saveStoredCustomTutors(customTutors);

    // Save to Firestore tutorProfiles collection
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'tutorProfiles', uid), tutorProfileDoc, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `tutorProfiles/${uid}`);
      }
    }
  }

  // If enabling parent role, link child details if provided
  if (role === 'parent') {
    if (extraData?.childName) {
      updatedUser.linkedChildName = extraData.childName;
      updatedUser.linkedChildUid = extraData.childUid || 'user_senuri';
    } else {
      updatedUser.linkedChildName = 'Senuri Dias';
      updatedUser.linkedChildUid = 'user_senuri';
    }
  }

  // Save user changes locally
  const usersDb = getLocalUsersDb();
  usersDb[uid] = updatedUser;
  saveLocalUsersDb(usersDb);
  setStoredUser(updatedUser);

  // Sync to Firestore
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        roles: updatedUser.roles,
        activeRole: updatedUser.activeRole,
        role: updatedUser.activeRole,
        ...(updatedUser.linkedChildName ? {
          linkedChildName: updatedUser.linkedChildName,
          linkedChildUid: updatedUser.linkedChildUid,
        } : {}),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  }

  return updatedUser;
}

/**
 * Disables an extra role.
 * Cannot disable their last remaining role.
 * If tutor role is disabled, hides tutor from search.
 */
export async function disableRole(uid: string, roleToDisable: UserRole): Promise<User> {
  const current = (await getProfile(uid)) || getStoredUser();
  if (!current) throw new Error('User not found');

  if (current.roles.length <= 1) {
    throw new Error('You cannot disable your only remaining role.');
  }

  if (!current.roles.includes(roleToDisable)) {
    return current;
  }

  const newRoles = current.roles.filter((r) => r !== roleToDisable);
  let newActiveRole = current.activeRole;

  // If currently active role is the one being disabled, switch to first remaining
  if (newActiveRole === roleToDisable) {
    newActiveRole = newRoles[0];
  }

  const updatedUser: User = {
    ...current,
    roles: newRoles,
    activeRole: newActiveRole,
    role: newActiveRole,
  };

  // If disabling tutor role, hide tutor from public search
  if (roleToDisable === 'tutor') {
    const customTutors = getStoredCustomTutors();
    if (customTutors[uid]) {
      // Keep existing bookings, mark profile as hidden
      (customTutors[uid] as any).hidden = true;
      saveStoredCustomTutors(customTutors);
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'tutorProfiles', uid), { hidden: true });
      } catch {
        // Ignore if document not present
      }
    }
  }

  // Save locally
  const usersDb = getLocalUsersDb();
  usersDb[uid] = updatedUser;
  saveLocalUsersDb(usersDb);
  setStoredUser(updatedUser);

  // Sync to Firestore
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        roles: newRoles,
        activeRole: newActiveRole,
        role: newActiveRole,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  }

  return updatedUser;
}

/**
 * Switches the active role and saves to Firestore & localStorage
 */
export async function setActiveRole(uid: string, targetRole: UserRole): Promise<User> {
  const current = (await getProfile(uid)) || getStoredUser();
  if (!current) throw new Error('User not found');

  if (!current.roles.includes(targetRole)) {
    throw new Error(`Role "${targetRole}" is not enabled for your account.`);
  }

  const updatedUser: User = {
    ...current,
    activeRole: targetRole,
    role: targetRole,
  };

  // Save locally
  const usersDb = getLocalUsersDb();
  usersDb[uid] = updatedUser;
  saveLocalUsersDb(usersDb);
  setStoredUser(updatedUser);

  // Sync to Firestore
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        activeRole: targetRole,
        role: targetRole,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  }

  return updatedUser;
}

/**
 * Fetch tutor profile data for this user
 */
export async function getTutorProfileData(uid: string): Promise<TutorProfile | null> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'tutorProfiles', uid));
      if (snap.exists()) {
        return snap.data() as TutorProfile;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `tutorProfiles/${uid}`);
    }
  }

  const customTutors = getStoredCustomTutors();
  return customTutors[uid] || null;
}

/**
 * Updates tutor details (subjects, qualifications, experience, hourly rate)
 * Users can NEVER set verified to true!
 */
export async function updateTutorProfileData(
  uid: string,
  data: Partial<Omit<TutorProfile, 'verified'>>
): Promise<TutorProfile> {
  const existing = await getTutorProfileData(uid);
  const customTutors = getStoredCustomTutors();

  const updated: TutorProfile = {
    uid,
    name: data.name || existing?.name || 'Peer Tutor',
    headline: data.headline || existing?.headline || 'Peer Tutor',
    bio: data.bio || existing?.bio || '',
    subjects: data.subjects && data.subjects.length > 0 ? data.subjects : existing?.subjects || ['Combined Maths'],
    qualifications: data.qualifications || existing?.qualifications || 'Undergraduate Peer Tutor',
    experience: data.experience || existing?.experience || 'Peer tutoring',
    hourlyRate: data.hourlyRate !== undefined ? data.hourlyRate : existing?.hourlyRate,
    rating: existing?.rating || 5.0,
    reviewCount: existing?.reviewCount || 0,
    completedSessions: existing?.completedSessions || 0,
    // Critical: verified state is preserved, user cannot set it to true
    verified: existing?.verified || false,
    responseTime: existing?.responseTime || 'Usually responds in 15 min',
    tags: existing?.tags || ['Patient', 'Exam Focus'],
    avatarUrl: existing?.avatarUrl,
    avatarInitials: existing?.avatarInitials,
  };

  customTutors[uid] = updated;
  saveStoredCustomTutors(customTutors);

  if (isFirebaseConfigured && db) {
    try {
      // Strip verified so user write cannot modify it
      const { verified: _ignore, ...safePayload } = updated;
      await updateDoc(doc(db, 'tutorProfiles', uid), safePayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tutorProfiles/${uid}`);
    }
  }

  return updated;
}

/**
 * Changes user password with reauthentication
 */
export async function changeUserPassword(
  uid: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  if (!isFirebaseConfigured || !auth) {
    throw new Error('Password changes require a Firebase account. Demo accounts do not have a cloud password.');
  }

  const firebaseUser = auth.currentUser;
  if (!firebaseUser || firebaseUser.uid !== uid) {
    throw new Error('Your Firebase sign-in has expired. Sign out and sign in again before changing your password.');
  }

  if (!firebaseUser.email || !firebaseUser.providerData.some((provider) => provider.providerId === 'password')) {
    throw new Error('This account does not use an email-and-password sign-in, so its password cannot be changed here.');
  }

  try {
    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
    await reauthenticateWithCredential(firebaseUser, credential);
    await updatePassword(firebaseUser, newPassword);
  } catch (error) {
    const code =
      error !== null && typeof error === 'object' && 'code' in error &&
      typeof error.code === 'string'
        ? error.code
        : '';

    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      throw new Error('Current password is incorrect.');
    }
    if (code === 'auth/weak-password') {
      throw new Error('New password is too weak. Please use at least 6 characters.');
    }
    if (code === 'auth/requires-recent-login') {
      throw new Error('For security, sign out and sign in again, then retry changing your password.');
    }
    if (code === 'auth/network-request-failed') {
      throw new Error('Could not reach Firebase. Check your internet connection and try again.');
    }
    if (code === 'auth/too-many-requests') {
      throw new Error('Too many attempts. Wait a while before trying again.');
    }
    if (code === 'auth/operation-not-allowed') {
      throw new Error('Email/password sign-in is disabled for this Firebase project.');
    }
    throw new Error(error instanceof Error ? error.message : 'Password update failed.');
  }
}

/**
 * Delete account: removes profile doc, tutorProfiles doc, and Firebase Auth account
 * Handles auth/requires-recent-login with clear error guidance.
 */
export async function deleteAccount(uid: string, currentPasswordForReauth?: string): Promise<void> {
  if (isFirebaseConfigured && auth?.currentUser) {
    const user = auth.currentUser;

    if (currentPasswordForReauth && user.email) {
      try {
        const credential = EmailAuthProvider.credential(user.email, currentPasswordForReauth);
        await reauthenticateWithCredential(user, credential);
      } catch (err: any) {
        if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
          throw new Error('Incorrect password. Please verify your current password.');
        }
      }
    }

    if (db) {
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch {
        // Proceed with deletion
      }

      try {
        await deleteDoc(doc(db, 'tutorProfiles', uid));
      } catch {
        // Proceed
      }
    }

    try {
      await deleteUser(user);
    } catch (err: any) {
      if (err?.code === 'auth/requires-recent-login') {
        throw new Error(
          'Security notice: Deleting your account requires a recent sign-in. Please log out and sign in again before deleting your account.'
        );
      }
      throw new Error(err?.message || 'Could not delete user account.');
    }
  }

  // Clean local state
  const usersDb = getLocalUsersDb();
  delete usersDb[uid];
  saveLocalUsersDb(usersDb);

  const customTutors = getStoredCustomTutors();
  delete customTutors[uid];
  saveStoredCustomTutors(customTutors);

  setStoredUser(null);
}
