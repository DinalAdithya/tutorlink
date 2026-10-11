/**
 * Reusable Action Buttons matching Figma design system
 * 16px corner radii, filled primary, outlined secondary
 */
import React from 'react';
import { theme, UserRole } from '../theme';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  role?: UserRole;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  role = 'tutee',
  fullWidth = true,
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const roleColor = theme.colors[role];

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        backgroundColor: disabled || loading ? '#9CA3AF' : roleColor,
        borderRadius: theme.radii.button,
      }}
      className={`py-3.5 px-6 font-semibold text-white shadow-sm hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer ${
        fullWidth ? 'w-full' : ''
      } ${disabled || loading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? (
        <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  role?: UserRole;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  role = 'tutee',
  fullWidth = true,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const roleColor = theme.colors[role];

  return (
    <button
      {...props}
      disabled={disabled}
      style={{
        borderColor: disabled ? '#E5E7EB' : roleColor,
        color: disabled ? '#9CA3AF' : roleColor,
        borderRadius: theme.radii.button,
      }}
      className={`py-3.5 px-6 font-semibold border-2 bg-white hover:bg-slate-50 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
};
