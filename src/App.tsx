/**
 * TutorLink Main Application Entry
 * Phase 1 Foundation: Navigation, Theme, Role Routing, Auth
 */
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { PhoneFrame } from './components/PhoneFrame';
import { RootNavigator } from './navigation/RootNavigator';
import { testConnection } from './services/firebase';

const MainAppContent: React.FC = () => {
  const { role, switchRole } = useAuth();

  useEffect(() => {
    // Validate connection to Firestore if configured (as mandated by Firebase integration guidelines)
    testConnection();
  }, []);

  return (
    <PhoneFrame activeRole={role} onQuickSwitchRole={switchRole}>
      <RootNavigator />
    </PhoneFrame>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainAppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
