/**
 * AvatarImage Component
 * Guaranteed zero broken images with inline SVG anime avatar fallback
 */
import React, { useState } from 'react';
import { getAnimeAvatar } from '../utils/avatars';

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt: string;
  fallbackName?: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  src,
  alt,
  fallbackName,
  className = '',
  ...props
}) => {
  const fallbackSrc = getAnimeAvatar(fallbackName || alt);
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallbackSrc);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        // Instant failover to self-contained vector SVG if any network error happens
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
      className={`object-cover ${className}`}
    />
  );
};
