import { getAuth, type Auth } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';

export function initializePlatformAuth(app: FirebaseApp): Auth {
  return getAuth(app);
}
