// src>screen>ERrorScreen.tsx
import React from 'react';
import { NavigationBar } from '../components/NavigationBar';
import { Button } from '../components/Button';
import { XCircle, AlertTriangle, RotateCcw, Camera } from 'lucide-react';

interface ErrorScreenProps {
  onRetry: () => void;
  onBack: () => void;
  errorType?: 'scan-failed' | 'no-id-detected' | 'poor-quality';
}

export function ErrorScreen({ onRetry, onBack, errorType = 'scan-failed' }: ErrorScreenProps) {
  const errorContent = {
    'scan-failed': {
      icon: <XCircle size={68} color="var(--color-error)" />,
      title: 'Scan Failed',
      description: 'We couldn\'t process the ID. Please try again with better lighting and positioning.',
    },
    'no-id-detected': {
      icon: <AlertTriangle size={68} color="#f59e0b" />,
      title: 'No ID Detected',
      description: 'We couldn\'t detect an ID in the image. Make sure the entire document is visible.',
    },
    'poor-quality': {
      icon: <AlertTriangle size={68} color="#f59e0b" />,
      title: 'Image Quality Too Low',
      description: 'The image is too blurry or dark. Please ensure good lighting and hold steady.',
    },
  };

  const content = errorContent[errorType];

  return (
    <div style={{
      minHeight: '100vh',
      // maxHeight: '100vh'!,
      // height: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
      // overflow: 'hidden'!,
       overflow: 'auto',
      //  paddingBottom: '0' 
    }}>
      <div style={{marginTop:'var(--spacing-md)'}}>
      <NavigationBar title="Scan Error" onBack={onBack} />
</div>

<main style={{
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  paddingRight: 'var(--spacing-lg)',
  paddingLeft: 'var(--spacing-lg)',
  paddingTop: 'var(--spacing-md)', // Add top padding
  paddingBottom: 'var(--spacing-md)', // Add bottom padding
  gap: 'var(--spacing-md)', // Consistent gap
  justifyContent: 'space-between', // Distribute space evenly
  overflow: 'hidden', // Changed from 'auto' to 'hidden'
  minHeight: 0, // Important for flex children
}}>

        {/* Error Icon */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          //  marginTop: '10px',
            overflow: 'auto',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-surface)',
          }}>
            {content.icon}
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            textAlign: 'center',
          }}>
            <h1 style={{ margin: 0 }}>{content.title}</h1>
            <p style={{ 
              margin: 0, 
              color: 'var(--color-text-secondary)',
              maxWidth: '300px',
            }}>
              {content.description}
            </p>
          </div>
        </div>

        {/* Tips */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)',
          padding: 'var(--spacing-md)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          <h2 style={{ margin: 0 }}>Tips for Better Results</h2>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-xs)',
          }}>
            <li className="caption">Use bright, even lighting</li>
            <li className="caption">Place ID on a dark, flat surface</li>
            <li className="caption">Hold camera steady and parallel</li>
            <li className="caption">Avoid shadows and glare</li>
            <li className="caption">Ensure all text is in focus</li>
          </ul>
        </div>

{/* <div style={{ flex: 2, minHeight: '16px' }} /> */}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-xs)',
          // marginBottom: '0',
          //  marginTop: 'auto',
           flexShrink: 0,
        }}>
          <Button 
            variant="primary" 
            fullWidth 
            icon={<RotateCcw size={20} />}
            onClick={onRetry}
          >
            Try Again
          </Button>
          <Button 
            variant="secondary" 
            fullWidth 
            icon={<Camera size={20} />}
            onClick={onBack}
          >
            Back to Scan Options
          </Button>
        </div>
      </main>
    </div>
  );
}
