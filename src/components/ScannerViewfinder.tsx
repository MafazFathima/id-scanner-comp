import React from 'react';
import { Scan } from 'lucide-react';

export function ScannerViewfinder() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '3 / 2',
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '2px dashed var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Corner Guides */}
      <div style={{
        position: 'absolute',
        top: 'var(--spacing-md)',
        left: 'var(--spacing-md)',
        width: '32px',
        height: '32px',
        borderTop: '3px solid var(--color-primary)',
        borderLeft: '3px solid var(--color-primary)',
        borderRadius: '4px 0 0 0',
      }} />
      <div style={{
        position: 'absolute',
        top: 'var(--spacing-md)',
        right: 'var(--spacing-md)',
        width: '32px',
        height: '32px',
        borderTop: '3px solid var(--color-primary)',
        borderRight: '3px solid var(--color-primary)',
        borderRadius: '0 4px 0 0',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 'var(--spacing-md)',
        left: 'var(--spacing-md)',
        width: '32px',
        height: '32px',
        borderBottom: '3px solid var(--color-primary)',
        borderLeft: '3px solid var(--color-primary)',
        borderRadius: '0 0 0 4px',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 'var(--spacing-md)',
        right: 'var(--spacing-md)',
        width: '32px',
        height: '32px',
        borderBottom: '3px solid var(--color-primary)',
        borderRight: '3px solid var(--color-primary)',
        borderRadius: '0 0 4px 0',
      }} />
      
      {/* Center Icon */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
      }}>
        <Scan size={48} color="var(--color-text-secondary)" strokeWidth={1.5} />
        <p className="caption" style={{ margin: 0 }}>Position ID within frame</p>
      </div>
    </div>
  );
}
