import React from 'react';
import { useIsDesktop } from '../hooks/useMediaQuery';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'mobile' | 'content' | 'wide' | 'full';
  padding?: boolean;
}

export function ResponsiveContainer({ 
  children, 
  maxWidth = 'content',
  padding = true 
}: ResponsiveContainerProps) {
  const isDesktop = useIsDesktop();

  const maxWidthMap = {
    mobile: '480px',
    content: '640px',
    wide: '1200px',
    full: '100%',
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: isDesktop ? maxWidthMap[maxWidth] : '100%',
      margin: '0 auto',
      padding: padding ? (isDesktop ? '0 var(--spacing-xl)' : '0 var(--spacing-lg)') : '0',
    }}>
      {children}
    </div>
  );
}
