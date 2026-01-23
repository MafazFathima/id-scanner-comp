import React from 'react';

interface StatusBadgeProps {
  text: string;
  type?: 'success' | 'info';
}

export function StatusBadge({ text, type = 'info' }: StatusBadgeProps) {
  const color = type === 'success' ? 'var(--color-success)' : 'var(--color-primary)';
  
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--spacing-xs)',
      padding: '6px var(--spacing-sm)',
      backgroundColor: `${color}15`,
      borderRadius: 'var(--radius-md)',
      border: `1px solid ${color}30`,
    }}>
      <div style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: color,
      }} />
      <span className="caption" style={{ 
        color: color,
        fontWeight: 600,
      }}>
        {text}
      </span>
    </div>
  );
}
