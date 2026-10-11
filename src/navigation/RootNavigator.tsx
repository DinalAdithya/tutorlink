/**
 * Root Navigation Controller
 * Manages multi-role based tab routing & auth navigation
 * Resets navigation stack to role's tab navigator when switching active roles.
 */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../theme';
import { RoleSelectorScreen } from '../screens/Auth/RoleSelectorScreen';
import { AuthScreen } from '../screens/Auth/AuthScreen';
import {
  TuteeHomeScreen,
  TuteeSearchScreen,
  TuteeSessionsScreen,
} from '../screens/Tutee/TuteePlaceholderScreens';
import {
  TutorDashboardScreen,
  TutorRequestsScreen,
  TutorAvailabilityScreen,
} from '../screens/Tutor/TutorPlaceholderScreens';
import {
  ParentDashboardScreen,
  ParentProgressScreen,
  ParentSessionDetailScreen,
} from '../screens/Parent/ParentPlaceholderScreens';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { BottomTabBar } from '../components/BottomTabBar';

export const RootNavigator: React.FC = () => {
  const { user, role, switchRole, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'RoleSelector' | 'Auth' | 'Main'>('RoleSelector');
  const [authRole, setAuthRole] = useState<UserRole>('tutee');
  const [activeTab, setActiveTab] = useState<string>('Home');
  const [selectedTutorForSearch, setSelectedTutorForSearch] = useState<any>(null);

  // Handle Role Selection from entry screen
  const handleSelectRole = (selectedRole: UserRole) => {
    setAuthRole(selectedRole);
    setCurrentScreen('Auth');
  };

  const handleGoToLogin = () => {
    setCurrentScreen('Auth');
  };

  const handleLogout = async () => {
    await logout();
    setCurrentScreen('RoleSelector');
    setActiveTab('Home');
  };

  const handleRoleSwitched = (newRole: UserRole) => {
    // Reset navigation stack to that role's root tab
    setActiveTab('Home');
  };

  // If user is not logged in, show Auth / RoleSelector flow
  if (!user) {
    if (currentScreen === 'Auth') {
      return (
        <AuthScreen
          initialRole={authRole}
          onBack={() => setCurrentScreen('RoleSelector')}
          onSuccess={() => {
            setCurrentScreen('Main');
            setActiveTab('Home');
          }}
        />
      );
    }
    return (
      <RoleSelectorScreen
        onSelectRole={handleSelectRole}
        onGoToLogin={handleGoToLogin}
      />
    );
  }

  // Active Role Routing
  const effectiveRole: UserRole = user?.activeRole || user?.role || authRole;

  // Render role-specific tab content
  const renderTabContent = () => {
    if (effectiveRole === 'tutee') {
      switch (activeTab) {
        case 'Search':
          return (
            <TuteeSearchScreen
              initialSelectedTutor={selectedTutorForSearch}
              onBookingCreated={() => setActiveTab('Sessions')}
            />
          );
        case 'Sessions':
          return <TuteeSessionsScreen />;
        case 'Profile':
          return (
            <ProfileScreen
              onLogout={handleLogout}
              onRoleSwitched={handleRoleSwitched}
            />
          );
        case 'Home':
        default:
          return (
            <TuteeHomeScreen
              onNavigateToSearch={() => {
                setSelectedTutorForSearch(null);
                setActiveTab('Search');
              }}
              onSelectTutor={(tutor) => {
                setSelectedTutorForSearch(tutor);
                setActiveTab('Search');
              }}
            />
          );
      }
    }

    if (effectiveRole === 'tutor') {
      switch (activeTab) {
        case 'Requests':
          return <TutorRequestsScreen />;
        case 'Availability':
          return <TutorAvailabilityScreen />;
        case 'Profile':
          return (
            <ProfileScreen
              onLogout={handleLogout}
              onRoleSwitched={handleRoleSwitched}
            />
          );
        case 'Dashboard':
        case 'Home':
        default:
          return (
            <TutorDashboardScreen
              onNavigateToRequests={() => setActiveTab('Requests')}
              onNavigateToAvailability={() => setActiveTab('Availability')}
            />
          );
      }
    }

    if (effectiveRole === 'parent') {
      switch (activeTab) {
        case 'Progress':
          return <ParentProgressScreen />;
        case 'Sessions':
          return <ParentSessionDetailScreen />;
        case 'Profile':
          return (
            <ProfileScreen
              onLogout={handleLogout}
              onRoleSwitched={handleRoleSwitched}
            />
          );
        case 'Home':
        default:
          return (
            <ParentDashboardScreen
              onNavigateToProgress={() => setActiveTab('Progress')}
              onNavigateToSessionDetail={() => setActiveTab('Sessions')}
            />
          );
      }
    }

    return <TuteeHomeScreen onNavigateToSearch={() => setActiveTab('Search')} />;
  };

  return (
    <div className="flex-1 flex flex-col relative h-full overflow-hidden">
      {/* Tab Screen Content */}
      <main className="flex-1 flex flex-col overflow-y-auto min-h-0">
        {renderTabContent()}
      </main>

      {/* Role-Specific Bottom Tab Bar */}
      <BottomTabBar
        role={effectiveRole}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        badgeCounts={effectiveRole === 'tutor' ? { Requests: 3 } : undefined}
      />
    </div>
  );
};
