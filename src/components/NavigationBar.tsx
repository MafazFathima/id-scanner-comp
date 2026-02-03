import React, { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';

interface NavigationBarProps {
  title?: string;
  onBack?: () => void;
  onClose?: () => void;
  transparent?: boolean;
}

export function NavigationBar({ title, onBack, onClose, transparent = false }: NavigationBarProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 'var(--spacing-md)',
      // paddingRight: 'var(--spacing-xl)',
      // paddingBottom: 'var(--spacing-xs)',
      paddingLeft: 'var(--spacing-sm)',
      backgroundColor: transparent ? 'transparent' : 'var(--color-background)',
      borderBottom: transparent ? 'none' : '1px solid var(--color-border)',
      minHeight: '64px',
    }}>
      <div style={{ width: '40px' }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              // alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              border: 'none',
              backgroundColor: transparent ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
              cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = transparent ? 'rgba(0, 0, 0, 0.7)' : 'var(--color-surface)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = transparent ? 'rgba(0, 0, 0, 0.5)' : 'transparent'}
          >
            <ArrowLeft size={24} color={transparent ? 'var(--color-text-inverse)' : 'var(--color-text-primary)'} />
          </button>
        )}
      </div>
      
      {title && (
        <h2 style={{ 
          margin: 0, 
          flex: 1, 
          textAlign: 'center',
          color: transparent ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
        }}>
          {title}
        </h2>
      )}
      
      <div style={{ width: '40px' }}>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              border: 'none',
              backgroundColor: transparent ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
              cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = transparent ? 'rgba(0, 0, 0, 0.7)' : 'var(--color-surface)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = transparent ? 'rgba(0, 0, 0, 0.5)' : 'transparent'}
          >
            <X size={24} color={transparent ? 'var(--color-text-inverse)' : 'var(--color-text-primary)'} />
          </button>
        )}
      </div>
    </div>
  );
}
