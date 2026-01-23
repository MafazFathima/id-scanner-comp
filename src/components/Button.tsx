import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  children, 
  onClick, 
  fullWidth = false,
  disabled = false,
  icon
}: ButtonProps) {
  const baseStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-xs)',
    padding: 'var(--spacing-md) var(--spacing-lg)',
    borderRadius: 'var(--radius-lg)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: 600,
    fontSize: '16px',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'var(--font-family)',
  };

  const variantStyles = variant === 'primary' ? {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-text-inverse)',
  } : {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
  };

  const hoverStyles = {
    backgroundColor: variant === 'primary' 
      ? 'var(--color-primary-hover)' 
      : 'var(--color-border)',
  };

  return (
    <button
      style={{ ...baseStyles, ...variantStyles }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = hoverStyles.backgroundColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = variantStyles.backgroundColor;
        }
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
}
