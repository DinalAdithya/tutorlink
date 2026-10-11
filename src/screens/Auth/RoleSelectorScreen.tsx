/**
 * RoleSelectorScreen
 * Replicates the Figma 'Role Selector.png' high-fidelity prototype
 * Sets user role directly in AuthContext when any card is pressed
 */
import React from 'react';
import { BookOpen, GraduationCap, Users, ArrowRight } from 'lucide-react';
import { UserRole, theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';

interface RoleSelectorScreenProps {
  onSelectRole?: (role: UserRole) => void;
  onGoToLogin?: () => void;
}

export const RoleSelectorScreen: React.FC<RoleSelectorScreenProps> = ({
  onSelectRole,
  onGoToLogin,
}) => {
  const { setRole } = useAuth();

  const handleRoleCardPress = (role: UserRole) => {
    // Correctly sets the user role in the AuthContext
    setRole(role);
    // Trigger navigation callback if provided
    onSelectRole?.(role);
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-6 relative overflow-hidden bg-white select-none">
      {/* Decorative Pastel Background Blobs matching Figma */}
      <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-indigo-50/70 pointer-events-none blur-xl" />
      <div className="absolute top-0 -right-10 w-36 h-36 rounded-full bg-rose-50/60 pointer-events-none blur-xl" />
      <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-teal-50/70 pointer-events-none blur-xl" />

      {/* Header & Logo */}
      <div className="relative z-10 flex flex-col items-center mt-2">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-[#4F46E5] flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            Tutor<span className="text-[#4F46E5]">Link</span>
          </span>
        </div>

        {/* Hero Title & Subtitle */}
        <h1 className="text-[28px] font-extrabold text-slate-900 text-center leading-[1.2] px-2 tracking-tight">
          Find the right help, or offer yours
        </h1>
        <p className="text-sm text-slate-500 text-center mt-3 max-w-xs leading-relaxed">
          A trusted student community for learning, teaching, and growing together.
        </p>
      </div>

      {/* 3 Distinct Role Option Cards */}
      <div className="relative z-10 space-y-4 my-6">
        {/* 1. Student Card */}
        <button
          type="button"
          onClick={() => handleRoleCardPress('tutee')}
          className="w-full bg-white rounded-2xl p-4.5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.08)] hover:shadow-md hover:border-indigo-100 transition-all active:scale-[0.98] text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                I’m a Student looking for help
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Find the perfect peer tutor
              </p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#4F46E5] text-white flex items-center justify-center shadow-sm group-hover:translate-x-0.5 transition-transform shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* 2. Tutor Card */}
        <button
          type="button"
          onClick={() => handleRoleCardPress('tutor')}
          className="w-full bg-white rounded-2xl p-4.5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(20,184,166,0.08)] hover:shadow-md hover:border-teal-100 transition-all active:scale-[0.98] text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#CCFBF1] flex items-center justify-center text-[#14B8A6] shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                I’m a Tutor offering help
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Share skills and earn
              </p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#14B8A6] text-white flex items-center justify-center shadow-sm group-hover:translate-x-0.5 transition-transform shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* 3. Parent Card */}
        <button
          type="button"
          onClick={() => handleRoleCardPress('parent')}
          className="w-full bg-white rounded-2xl p-4.5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(251,113,133,0.08)] hover:shadow-md hover:border-rose-100 transition-all active:scale-[0.98] text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE4E6] flex items-center justify-center text-[#FB7185] shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                I’m a Parent
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Support their learning journey
              </p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#FB7185] text-white flex items-center justify-center shadow-sm group-hover:translate-x-0.5 transition-transform shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Footer & Direct Sign In Link */}
      <div className="relative z-10 flex flex-col items-center text-center mt-auto pt-2">
        {onGoToLogin && (
          <button
            type="button"
            onClick={onGoToLogin}
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 mb-3 transition cursor-pointer"
          >
            Already have an account? <span className="text-[#4F46E5] underline">Sign in</span>
          </button>
        )}

        <p className="text-[11px] text-slate-400 font-medium tracking-tight">
          Safe, student-first tutoring • Built for every learning style
        </p>
      </div>
    </div>
  );
};
