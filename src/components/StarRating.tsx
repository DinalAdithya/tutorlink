/**
 * StarRating Component
 * Displays amber star ratings matching Figma design system
 */
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
  showText?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  reviewCount,
  size = 14,
  showText = true,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1 text-xs font-bold text-amber-500 ${className}`}>
      <Star
        className="fill-amber-400 text-amber-400"
        style={{ width: size, height: size }}
      />
      {showText && <span>{rating.toFixed(1)}</span>}
      {reviewCount !== undefined && (
        <span className="text-slate-400 font-normal">({reviewCount})</span>
      )}
    </div>
  );
};
