/**
 * VerifiedBadge Component
 * Displays blue verified shield/check icon for verified tutors
 */
import React from 'react';
import { BadgeCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  size?: number;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ size = 18, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center text-indigo-600 ${className}`}
      title="University Verified Tutor"
    >
      <BadgeCheck className="w-4.5 h-4.5 fill-indigo-600 text-white" style={{ width: size, height: size }} />
    </span>
  );
};
