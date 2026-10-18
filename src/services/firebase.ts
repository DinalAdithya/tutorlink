/**
 * Firebase Service Initialization & Error Handling
 * Compliant with Firebase Skill Guidelines
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { firebaseEnv } from './firebaseEnv';
import { initializePlatformAuth } from './firebaseAuth';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

const firebaseConfig = {
  apiKey: firebaseEnv.apiKey,
  authDomain: firebaseEnv.authDomain,
  projectId: firebaseEnv.projectId,
  storageBucket: firebaseEnv.storageBucket,
  messagingSenderId: firebaseEnv.messagingSenderId,
  appId: firebaseEnv.appId,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your-api-key'
);

let appInstance: ReturnType<typeof initializeApp> | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    authInstance = initializePlatformAuth(appInstance);
    dbInstance = getFirestore(appInstance);
  } catch (err) {
    console.warn('Firebase initialization error, running in demo fallback mode:', err);
  }
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;

/**
 * Standardized Firestore error handler mandated by the security skill
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuth = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: currentAuth?.uid ?? null,
      email: currentAuth?.email ?? null,
      emailVerified: currentAuth?.emailVerified ?? null,
      isAnonymous: currentAuth?.isAnonymous ?? null,
      tenantId: currentAuth?.tenantId ?? null,
      providerInfo: currentAuth?.providerData?.map(p => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validates connection to Firestore at app start if configured
 */
export async function testConnection(): Promise<boolean> {
  if (!dbInstance || !isFirebaseConfigured) return false;
  try {
    await getDocFromServer(doc(dbInstance, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline / check configuration.');
    }
    return false;
  }
}
