// src>App.tsx
/**
 * Demo Application
 * Shows SDK implementation examples
 */

import React, { useState } from 'react';
import { IDScanner } from './sdk/IDScanner';
import type { SDKConfig } from './sdk/types';

export default function App() {
  const SHOW_SDK_DEBUG = false;

  const [selectedDemo, setSelectedDemo] = useState<'default' | 'custom' | 'embedded'>('default');

  // Default configuration
  const defaultConfig: Partial<SDKConfig> = {
    appName: 'Universal ID Scanner',
    features: {
      showWelcome: true,
      enableHistory: true,
      enableUpload: true,
      enableCamera: true,
    }
  };

  // Custom branded configuration
  const customConfig: Partial<SDKConfig> = {
    appName: 'AcmeCorp Verify',
    theme: {
      colors: {
        primary: '#8b5cf6',
        primaryHover: '#7c3aed',
        success: '#10b981',
        background: '#fafafa',
        surface: '#ffffff',
      },
      spacing: {
        xs: '6px',
        sm: '10px',
        md: '14px',
        lg: '20px',
      },
      radius: {
        md: '6px',
        lg: '10px',
      },
    },
    features: {
      showWelcome: true,
      enableHistory: true,
      enableUpload: true,
      enableCamera: true,
      enableExport: true,
      enableShare: true,
    },
  };

  // Embedded configuration (no welcome screen)
  const embeddedConfig: Partial<SDKConfig> = {
    appName: 'Quick Scan',
    features: {
      showWelcome: false,
      enableHistory: false,
      enableUpload: true,
      enableCamera: true,
    },
    theme: {
      colors: {
        primary: '#0ea5e9',
        success: '#22c55e',
      },
    },
  };

  const configs = {
    default: defaultConfig,
    custom: customConfig,
    embedded: embeddedConfig,
  };

  return (
    // <div style={{ position: 'relative', minHeight: '100vh' }}>
   <div style={{
  position: 'relative',
  minHeight: '100vh',
  overflowX: 'hidden',
}}>


      {/* Demo Selector */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '12px 20px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <span style={{ 
          color: 'white', 
          fontSize: '14px',
          fontWeight: 600,
        }}>
          SDK Demo:
        </span>
        {(['default', 'custom', 'embedded'] as const).map((demo) => (
          <button
            key={demo}
            onClick={() => setSelectedDemo(demo)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              backgroundColor: selectedDemo === demo ? '#2563eb' : '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontWeight: selectedDemo === demo ? 600 : 400,
              transition: 'all 0.2s ease',
            }}
          >
            {demo === 'default' ? 'Default Theme' : demo === 'custom' ? 'Custom Brand' : 'Embedded Mode'}
          </button>
        ))}
      </div>

      {/* SDK Component */}
      <div style={{ paddingTop: '40px' }}>

        <IDScanner
          key={selectedDemo}
          config={configs[selectedDemo]}
          callbacks={{
            // onScanComplete: (data) => {
            //   console.log('✅ Scan completed:', data);
            //   alert(`Scan successful!\n\nName: ${data.data.fullName}\nID: ${data.data.idNumber}\nConfidence: ${(data.confidence * 100).toFixed(1)}%`);
            // },
            onScanComplete: (data) => {
  console.log('✅ Scan completed:', data);

  const fullName = (data as any).fullName ?? (data as any).data?.fullName ?? 'N/A';
  const idNumber = (data as any).idNumber ?? (data as any).data?.idNumber ?? 'N/A';
  const confidence = (data as any).confidence ?? (data as any).data?.confidence ?? 0;

  alert(`Scan successful!\n\nName: ${fullName}\nID: ${idNumber}\nConfidence: ${(confidence * 100).toFixed(1)}%`);
},

            onScanError: (error) => {
              console.error('❌ Scan error:', error);
            },
            onScanStart: () => {
              console.log('🎬 Scan started');
            },
            onNavigate: (screen) => {
              console.log('🧭 Navigated to:', screen);
            },
            onExport: (data, format) => {
              console.log('📤 Export requested:', format, data);
              alert(`Exporting data as ${format.toUpperCase()}`);
            },
            onShare: (data) => {
              console.log('📱 Share requested:', data);
              alert('Sharing scan results...');
            },
            onCopy: (data) => {
              console.log('📋 Copy requested:', data);
              alert('Data copied to clipboard!');
            },
          }}
          embedded={selectedDemo === 'embedded'}
          initialScreen={selectedDemo === 'embedded' ? 'scan' : 'welcome'}
          showDebug={true}
        />
      </div>

      {/* Info Panel */}
      {SHOW_SDK_DEBUG && (
      <div style={{
        position: 'fixed',
        bottom: '60px',
        right: '20px',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderRadius: '8px',
        color: 'white',
        fontSize: '12px',
        maxWidth: '280px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{ fontWeight: 600, marginBottom: '8px' }}>
          📦 SDK Configuration Active
        </div>
        <div style={{ opacity: 0.8, lineHeight: 1.6 }}>
          {selectedDemo === 'default' && '• Default theme and features\n• Full functionality enabled\n• Welcome screen shown'}
          {selectedDemo === 'custom' && '• Purple custom branding\n• Modified spacing & radius\n• All features enabled'}
          {selectedDemo === 'embedded' && '• Minimal embedded mode\n• No welcome screen\n• Quick scan only'}
        </div>
        <div style={{ 
          marginTop: '12px', 
          paddingTop: '12px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: '11px',
          opacity: 0.7,
        }}>
          Check browser console for callbacks
        </div>
      </div>
        )} 
    </div>
    
  );
}
