/**
 * Auth Context Provider for TutorLink
 * Multi-role state management & navigation coordination
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import {
  getCurrentUser,
  subscribeToAuth,
  loginUser,
  registerUser,
  logoutUser,
} from '../services/auth';
import { getProfile, setActiveRole as serviceSetActiveRole } from '../services/profile';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  selectedRoleForSignup: UserRole;
  setSelectedRoleForSignup: (role: UserRole) => void;
  setRole: (role: UserRole) => void;
  login: (email: string, pass: string, role?: UserRole) => Promise<User>;
  register: (email: string, pass: string, name: string, role: UserRole) => Promise<User>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
  refreshUser: () => Promise<User | null>;
  updateUserState: (updatedUser: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRoleForSignup, setSelectedRoleForSignup] = useState<UserRole>('tutee');

  useEffect(() => {
    const unsub = subscribeToAuth((updatedUser) => {
      setUser(updatedUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshUser = async (): Promise<User | null> => {
    if (!user) return null;
    const fresh = await getProfile(user.uid);
    if (fresh) {
      setUser(fresh);
    }
    return fresh;
  };

  const updateUserState = (updatedUser: User | null) => {
    setUser(updatedUser);
  };

  const login = async (email: string, pass: string, preferredRole?: UserRole) => {
    setLoading(true);
    try {
      const targetRole = preferredRole || selectedRoleForSignup;
      const u = await loginUser(email, pass, targetRole);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string, role: UserRole) => {
    setLoading(true);
    try {
      const u = await registerUser(email, pass, name, role);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (newRole: UserRole) => {
    if (!user) {
      setSelectedRoleForSignup(newRole);
      return;
    }
    // Update activeRole in Firestore and localStorage
    const updated = await serviceSetActiveRole(user.uid, newRole);
    setUser({ ...updated });
  };

  const setRole = (newRole: UserRole) => {
    setSelectedRoleForSignup(newRole);
    if (user) {
      switchRole(newRole);
    }
  };

  const effectiveRole: UserRole = user?.activeRole || user?.role || selectedRoleForSignup;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: effectiveRole,
        loading,
        selectedRoleForSignup,
        setSelectedRoleForSignup,
        setRole,
        login,
        register,
        logout,
        switchRole,
        refreshUser,
        updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
