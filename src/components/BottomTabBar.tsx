/**
 * Role-Based Bottom Tab Bar matching Figma design system
 */
import React from 'react';
import {
  Home,
  Search,
  Calendar,
  User,
  Clock,
  Inbox,
  TrendingUp,
} from 'lucide-react';
import { theme, UserRole } from '../theme';

interface BottomTabBarProps {
  role: UserRole;
  activeTab: string;
  onTabChange: (tabName: string) => void;
  badgeCounts?: Record<string, number>;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  role,
  activeTab,
  onTabChange,
  badgeCounts = {},
}) => {
  const roleColor = theme.colors[role];

  // Define tabs per role matching specifications
  const tabs = React.useMemo(() => {
    switch (role) {
      case 'tutor':
        return [
          { id: 'Dashboard', label: 'Home', icon: Home },
          { id: 'Requests', label: 'Requests', icon: Inbox },
          { id: 'Availability', label: 'Availability', icon: Clock },
          { id: 'Profile', label: 'Profile', icon: User },
        ];
      case 'parent':
        return [
          { id: 'Home', label: 'Home', icon: Home },
          { id: 'Progress', label: 'Progress', icon: TrendingUp },
          { id: 'Sessions', label: 'Sessions', icon: Calendar },
          { id: 'Profile', label: 'Profile', icon: User },
        ];
      case 'tutee':
      default:
        return [
          { id: 'Home', label: 'Home', icon: Home },
          { id: 'Search', label: 'Search', icon: Search },
          { id: 'Sessions', label: 'Sessions', icon: Calendar },
          { id: 'Profile', label: 'Profile', icon: User },
        ];
    }
  }, [role]);

  return (
    <nav className="w-full bg-white border-t border-slate-100 px-3 py-1.5 flex items-center justify-around shrink-0 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] select-none">
      {tabs.map((tab) => {
        const isHomeDashboardMatch =
          (tab.id.toLowerCase() === 'home' && activeTab.toLowerCase() === 'dashboard') ||
          (tab.id.toLowerCase() === 'dashboard' && activeTab.toLowerCase() === 'home');
        const isActive =
          activeTab.toLowerCase() === tab.id.toLowerCase() || isHomeDashboardMatch;
        const Icon = tab.icon;
        const count = badgeCounts[tab.id];

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer relative ${
              isActive ? 'opacity-100 scale-105' : 'text-slate-400 hover:text-slate-600 opacity-80'
            }`}
            style={{
              color: isActive ? roleColor : undefined,
              backgroundColor: isActive ? `${roleColor}14` : 'transparent',
            }}
          >
            <div className="relative">
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              {count && count > 0 ? (
                <span
                  className="absolute -top-1.5 -right-2 text-[10px] font-bold text-white px-1.5 py-0.2 rounded-full min-w-4 text-center leading-4"
                  style={{ backgroundColor: roleColor }}
                >
                  {count}
                </span>
              ) : null}
            </div>
            <span
              className={`text-[11px] mt-1 font-medium ${
                isActive ? 'font-bold' : ''
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
