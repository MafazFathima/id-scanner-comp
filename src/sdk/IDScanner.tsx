/**
 * Main SDK Component
 * Entry point for the Universal ID Scanner SDK
 */

import React from 'react';
import { SDKProvider, useSDK } from './context';
import type { SDKConfig, SDKCallbacks, SDKScreen } from './types';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { ScanningScreen } from '../screens/ScanningScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { ErrorScreen } from '../screens/ErrorScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ThemeInjector } from './ThemeInjector';

interface IDScannerProps {
  config?: Partial<SDKConfig>;
  callbacks?: SDKCallbacks;
  initialScreen?: SDKScreen;
  embedded?: boolean;
  showDebug?: boolean;
}

/**
 * Main SDK Component - Use this in your application
 * 
 * @example
 * ```tsx
 * import { IDScanner } from 'universal-id-scanner';
 * 
 * function App() {
 *   return (
 *     <IDScanner
 *       config={{
 *         appName: 'My App',
 *         theme: {
 *           colors: {
 *             primary: '#ff0000',
 *           }
 *         }
 *       }}
 *       callbacks={{
 *         onScanComplete: (data) => console.log(data),
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export function IDScanner({ 
  config, 
  callbacks, 
  initialScreen = 'welcome',
  embedded = false,
  showDebug = false,
}: IDScannerProps) {
  return (
    <SDKProvider config={config} callbacks={callbacks} initialScreen={initialScreen}>
      <ThemeInjector />
      <IDScannerContent embedded={embedded} showDebug={showDebug} />
    </SDKProvider>
  );
}

function IDScannerContent({ embedded, showDebug }: { embedded: boolean; showDebug: boolean }) {
  const { currentScreen, navigate, callbacks, config } = useSDK();

  const handleGetStarted = () => navigate('scan');
  const handleBackToWelcome = () => navigate('welcome');
  const handleStartScan = () => {
    callbacks.onScanStart?.();
    navigate('scanning');
  };
  const handleUploadImage = () => {
    callbacks.onScanStart?.();
    navigate('scanning');
  };
  const handleScanComplete = () => {
    // Mock data - in real implementation, this would come from scan
    const mockResult = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      documentType: "Driver's License",
      confidence: 0.99,
      verified: true,
      data: {
        fullName: 'JOHN MICHAEL SMITH',
        idNumber: 'D1234-5678-9012-34',
        dateOfBirth: 'January 15, 1990',
        expirationDate: 'December 31, 2027',
        address: '123 Main Street, San Francisco, CA 94102',
      },
      metadata: {
        processingTime: 1.8,
        imageQuality: 0.95,
        documentState: 'California',
        documentCountry: 'USA',
      },
    };
    callbacks.onScanComplete?.(mockResult);
    navigate('results');
  };
  const handleScanError = () => navigate('error');
  const handleNewScan = () => navigate('scan');
  const handleViewHistory = () => navigate('history');
  const handleSelectScan = (scanId: string) => {
    navigate('results');
  };

  const containerStyle: React.CSSProperties = embedded ? {
    width: '100%',
    height: '100%',
    position: 'relative',
  } : {
    minHeight: '100vh',
    width: '100%',
  };

  const renderScreen = () => {
    // Check feature flags
    if (currentScreen === 'welcome' && !config.features?.showWelcome) {
      navigate('scan');
      return null;
    }

    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
      
      case 'scan':
        return (
          <ScanScreen
            onBack={handleBackToWelcome}
            onStartScan={config.features?.enableCamera ? handleStartScan : undefined}
            onUploadImage={config.features?.enableUpload ? handleUploadImage : undefined}
            onViewHistory={config.features?.enableHistory ? handleViewHistory : undefined}
          />
        );
      
      case 'scanning':
        return (
          <ScanningScreen
            onComplete={handleScanComplete}
            onCancel={() => navigate('scan')}
          />
        );
      
      case 'results':
        return (
          <ResultsScreen
            onBack={() => navigate('scan')}
            onNewScan={handleNewScan}
          />
        );
      
      case 'error':
        return (
          <ErrorScreen
            onRetry={handleStartScan}
            onBack={() => navigate('scan')}
            errorType="poor-quality"
          />
        );
      
      case 'history':
        return (
          <HistoryScreen
            onSelectScan={handleSelectScan}
            onNewScan={handleNewScan}
          />
        );
      
      default:
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div style={containerStyle}>
      {renderScreen()}
      {showDebug && <DebugPanel />}
    </div>
  );
}

function DebugPanel() {
  const { currentScreen, navigate, theme, config } = useSDK();
  const screens: SDKScreen[] = ['welcome', 'scan', 'scanning', 'results', 'error', 'history'];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
      flexWrap: 'wrap',
      zIndex: 9999,
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    }}>
      <div style={{
        padding: '4px 8px',
        fontSize: '11px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        borderRadius: '4px',
        fontWeight: 600,
      }}>
        SDK Debug
      </div>
      {screens.map((screen) => (
        <button
          key={screen}
          onClick={() => navigate(screen)}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            backgroundColor: currentScreen === screen ? theme.colors?.primary : theme.colors?.secondary,
            color: theme.colors?.textInverse,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            textTransform: 'capitalize',
            fontWeight: currentScreen === screen ? 600 : 400,
          }}
        >
          {screen}
        </button>
      ))}
    </div>
  );
}
