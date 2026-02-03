import React from 'react';
import { Shield, Menu } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showMenu?: boolean;
}

export function Header({ title = 'Universal ID Scanner', showMenu = true }: HeaderProps) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--spacing-xs) var(--spacing-lg)',
      paddingTop: 'var(--spacing-xxl)',
      backgroundColor: 'var(--color-background)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-primary)',
        }}>
          <Shield size={24} color="var(--color-text-inverse)" />
        </div>
        <h2 style={{ margin: 0 }}>{title}</h2>
      </div>
      {showMenu && (
        <button style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          borderRadius: 'var(--radius-md)',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Menu size={24} color="var(--color-text-primary)" />
        </button>
      )}
    </header>
  );
}
