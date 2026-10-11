/**
 * TutorLink Design System Theme
 * Matching Figma High-Fidelity Prototype
 */

export const theme = {
  colors: {
    // Role-specific primary accents
    tutee: '#4F46E5', // Primary Indigo
    tuteeLight: '#EEF2FF',
    tuteeDark: '#4338CA',

    tutor: '#14B8A6', // Tutor Teal
    tutorLight: '#CCFBF1',
    tutorDark: '#0F766E',

    parent: '#FB7185', // Parent Coral
    parentLight: '#FFE4E6',
    parentDark: '#E11D48',

    // Ratings & Badges
    amber: '#F59E0B',
    amberLight: '#FEF3C7',

    // Neutrals
    text: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    cardBackground: '#F3F4F6',
    surface: '#FFFFFF',
    background: '#F8FAFC',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // Status colors
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    info: '#3B82F6',
  },

  // Role metadata helper
  roles: {
    tutee: {
      name: 'Student / Tutee',
      primary: '#4F46E5',
      primaryLight: '#EEF2FF',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      activeTab: 'text-[#4F46E5] bg-indigo-50',
      tagline: 'Find the perfect peer tutor',
    },
    tutor: {
      name: 'Peer Tutor',
      primary: '#14B8A6',
      primaryLight: '#CCFBF1',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
      activeTab: 'text-[#14B8A6] bg-teal-50',
      tagline: 'Share skills and earn',
    },
    parent: {
      name: 'Parent',
      primary: '#FB7185',
      primaryLight: '#FFE4E6',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      activeTab: 'text-[#FB7185] bg-rose-50',
      tagline: 'Support their learning journey',
    },
  },

  radii: {
    card: '16px', // 16px rounded corners per design system
    button: '16px',
    pill: '9999px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },

  shadows: {
    card: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
    cardHover: '0 10px 25px -3px rgba(0, 0, 0, 0.08)',
    button: '0 4px 14px 0 rgba(79, 70, 229, 0.25)',
  },

  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
} as const;

export type UserRole = 'tutee' | 'tutor' | 'parent';
