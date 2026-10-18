import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';

const { getReactNativePersistence } = require('firebase/auth') as {
  getReactNativePersistence: (
    storage: typeof AsyncStorage
  ) => { readonly type: 'LOCAL' | 'SESSION' | 'NONE' | 'COOKIE' };
};

export function initializePlatformAuth(app: FirebaseApp): Auth {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'auth/already-initialized'
    ) {
      return getAuth(app);
    }
    throw error;
  }
}
