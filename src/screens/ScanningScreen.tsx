import React, { useEffect, useState } from 'react';
import { NavigationBar } from '../components/NavigationBar';
import { Loader2 } from 'lucide-react';

interface ScanningScreenProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function ScanningScreen({ onComplete, onCancel }: ScanningScreenProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing camera...');

  useEffect(() => {
    const steps = [
      { time: 500, progress: 20, status: 'Camera ready' },
      { time: 1000, progress: 40, status: 'Detecting document...' },
      { time: 1500, progress: 60, status: 'Capturing image...' },
      { time: 2000, progress: 80, status: 'Processing data...' },
      { time: 2500, progress: 95, status: 'Validating information...' },
      { time: 3000, progress: 100, status: 'Scan complete!' },
    ];

    steps.forEach(({ time, progress: p, status: s }) => {
      setTimeout(() => {
        setProgress(p);
        setStatus(s);
        if (p === 100) {
          setTimeout(() => onComplete(), 500);
        }
      }, time);
    });
  }, [onComplete]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Camera View Simulation */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)',
      }} />

      <NavigationBar 
        transparent 
        onClose={onCancel}
      />

      {/* Scanning Frame */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-lg)',
        gap: 'var(--spacing-lg)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* ID Card Frame */}
        <div style={{
          width: '100%',
          maxWidth: '340px',
          aspectRatio: '1.586',
          border: '3px solid var(--color-primary)',
          borderRadius: 'var(--radius-lg)',
          position: 'relative',
          boxShadow: '0 0 30px rgba(37, 99, 235, 0.5)',
        }}>
          {/* Scanning Line Animation */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '3px',
              backgroundColor: 'var(--color-primary)',
              boxShadow: '0 0 20px rgba(37, 99, 235, 0.8)',
              top: `${progress}%`,
              transition: 'top 0.5s ease',
            }}
          />

          {/* Corner Markers */}
          {[
            { top: '-2px', left: '-2px', borderTop: true, borderLeft: true },
            { top: '-2px', right: '-2px', borderTop: true, borderRight: true },
            { bottom: '-2px', left: '-2px', borderBottom: true, borderLeft: true },
            { bottom: '-2px', right: '-2px', borderBottom: true, borderRight: true },
          ].map((pos, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '24px',
                height: '24px',
                borderColor: 'var(--color-text-inverse)',
                borderWidth: '3px',
                borderStyle: 'solid',
                borderTop: pos.borderTop ? undefined : 'none',
                borderRight: pos.borderRight ? undefined : 'none',
                borderBottom: pos.borderBottom ? undefined : 'none',
                borderLeft: pos.borderLeft ? undefined : 'none',
                ...pos,
              }}
            />
          ))}
        </div>

        {/* Status Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-md)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
          }}>
            <Loader2 
              size={24} 
              color="var(--color-text-inverse)" 
              style={{ animation: 'spin 1s linear infinite' }}
            />
            <p style={{ 
              margin: 0, 
              color: 'var(--color-text-inverse)',
              fontSize: '18px',
              fontWeight: 600,
            }}>
              {status}
            </p>
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '200px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: 'var(--color-primary)',
              transition: 'width 0.5s ease',
              boxShadow: '0 0 10px rgba(37, 99, 235, 0.8)',
            }} />
          </div>

          <p className="caption" style={{ 
            margin: 0, 
            color: 'rgba(255, 255, 255, 0.7)',
          }}>
            {progress}% complete
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
