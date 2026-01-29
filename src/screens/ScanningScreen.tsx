// src/screens/ScanningScreen.tsx - HYBRID VERSION (Textract + PDF417)
import React, { useEffect, useState } from 'react';
import { NavigationBar } from '../components/NavigationBar';
import { Loader2, CheckCircle, AlertCircle, RotateCcw, Zap } from 'lucide-react';
import { CameraCapture } from '../components/CameraCapture';
import { hybridScanService } from '../services/hybridScanService';
import type { HybridScanResult, ScanMethod } from '../methods/types/scanResults';
import type { DocumentType, ScanSide, ScanProgress } from '../sdk/types';
import { Button } from '../components/Button';

interface ScanningScreenProps {
  onComplete: (scanData: CompleteScanResultData) => void;
  onCancel: () => void;
  mode?: 'camera' | 'upload';
  documentType: DocumentType;
  requiresBackScan?: boolean;
}

interface CompleteScanResultData {
  documentType: DocumentType;
  frontImage: string;
  frontData: HybridScanResult;
  backImage?: string;
  backData?: HybridScanResult;
}

type ProcessingStep = 'capture' | 'processing' | 'transition' | 'complete';

export function ScanningScreen({ 
  onComplete, 
  onCancel, 
  mode = 'camera',
  documentType,
  requiresBackScan = true,
}: ScanningScreenProps) {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('capture');
  const [currentSide, setCurrentSide] = useState<ScanSide>('front');
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    documentType,
    currentSide: 'front',
    isComplete: false,
  });
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  
  // Hybrid scan specific states
  const [currentScanMethod, setCurrentScanMethod] = useState<ScanMethod | null>(null);
  const [scanMethodsProgress, setScanMethodsProgress] = useState({
    textract: 0,
    pdf417: 0,
  });
  
  // Camera control states
  const [cameraKey, setCameraKey] = useState<number>(0);
  const [showCamera, setShowCamera] = useState<boolean>(true);

  const handleImageCapture = async (imageBase64: string) => {
    console.log(`📸 ${currentSide.toUpperCase()} side captured, size:`, imageBase64.length);
    setCapturedImage(imageBase64);
    
    setShowCamera(false);
    setCurrentStep('processing');
    
    await processImageWithHybridScan(imageBase64, currentSide);
  };

  const processImageWithHybridScan = async (imageBase64: string, side: ScanSide) => {
    try {
      setStatus(`Analyzing ${side} side with AI...`);
      setProgress(10);
      await delay(300);

      setStatus('Preparing image for multi-method scanning...');
      setProgress(20);
      await delay(300);

      // Run hybrid scan (both Textract and PDF417)
      setStatus('🔍 Scanning with OCR (Textract)...');
      setProgress(30);
      
      setStatus('📊 Scanning barcode (PDF417)...');
      setProgress(40);

      console.log('🔄 Starting hybrid scan (Textract + PDF417)...');
      
      const hybridResult = await hybridScanService.scanWithBothMethods(
        imageBase64,
        {
          runInParallel: true, // Run both simultaneously for speed
          onProgress: (method, methodProgress) => {
            // Update progress for individual methods
            setScanMethodsProgress(prev => ({
              ...prev,
              [method]: methodProgress,
            }));
            setCurrentScanMethod(method);
            
            // Update overall progress (average of both)
            const avgProgress = (scanMethodsProgress.textract + scanMethodsProgress.pdf417) / 2;
            setProgress(Math.min(85, 40 + (avgProgress * 0.45)));
          },
        }
      );

      console.log('✅ Hybrid scan complete:', hybridResult);

      setProgress(90);
      setStatus('Comparing scan results...');
      await delay(500);

      setProgress(95);
      setStatus(`Selected best method: ${hybridResult.selectedMethod.toUpperCase()}`);
      await delay(500);

      setProgress(100);
      setStatus(`${side.charAt(0).toUpperCase() + side.slice(1)} side scan complete!`);
      
      // Update scan progress
      const updatedProgress: ScanProgress = {
        ...scanProgress,
        ...(side === 'front' 
          ? { frontImage: imageBase64, frontData: hybridResult }
          : { backImage: imageBase64, backData: hybridResult }
        ),
      };

      setScanProgress(updatedProgress);

      // Check if we need to scan the back
      if (side === 'front' && requiresBackScan) {
        console.log('✅ Front scan complete. Preparing for back scan...');
        await delay(1000);
        setStatus('Get ready to scan the BACK side');
        setCurrentStep('transition');
        await delay(2000);
        
        console.log('🔄 Switching to back side, remounting camera...');
        setCurrentSide('back');
        setCameraKey(prev => prev + 1);
        setShowCamera(true);
        setCurrentStep('capture');
        setCapturedImage(null);
        setProgress(0);
        setError(null);
        setCurrentScanMethod(null);
        setScanMethodsProgress({ textract: 0, pdf417: 0 });
        setStatus('Position BACK side in frame');
        
      } else {
        // All scans complete
        console.log('✅ All scans complete!');
        setCurrentStep('complete');
        await delay(500);

        const completeResult: CompleteScanResultData = {
          documentType,
          frontImage: updatedProgress.frontImage!,
          frontData: updatedProgress.frontData as HybridScanResult,
          backImage: updatedProgress.backImage,
          backData: updatedProgress.backData as HybridScanResult,
        };

        console.log('📦 Sending complete result:', completeResult);
        onComplete(completeResult);
      }

    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setStatus('Processing failed');
      console.error('❌ Processing error:', error);
    }
  };

  const handleCameraError = (error: Error) => {
    setError(error.message);
    setStatus('Camera error occurred');
    console.error('❌ Camera error:', error);
  };

  const handleRetry = () => {
    console.log(`🔄 Retrying ${currentSide} side scan...`);
    setCameraKey(prev => prev + 1);
    setShowCamera(true);
    setCurrentStep('capture');
    setCapturedImage(null);
    setProgress(0);
    setError(null);
    setCurrentScanMethod(null);
    setScanMethodsProgress({ textract: 0, pdf417: 0 });
    setStatus(`Position ${currentSide.toUpperCase()} side in frame`);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      hybridScanService.cleanup();
    };
  }, []);

  // Step 1: Show camera capture
  if (currentStep === 'capture' && showCamera) {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: currentSide === 'front' ? '#3b82f6' : '#8b5cf6',
          padding: '16px',
          textAlign: 'center',
          color: 'white',
          fontWeight: 600,
          fontSize: '16px',
        }}>
          {currentSide === 'front' ? '📄 Scan FRONT side of document' : '📄 Scan BACK side of document'}
          {scanProgress.frontImage && currentSide === 'back' && (
            <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.9 }}>
              ✓ Front side completed
            </div>
          )}
        </div>

        <div style={{ paddingTop: '60px' }} key={`camera-${currentSide}-${cameraKey}`}>
          <CameraCapture
            onCapture={handleImageCapture}
            onCancel={onCancel}
            onError={handleCameraError}
          />
        </div>
      </div>
    );
  }

  // Step 2: Show transition message
  if (currentStep === 'transition') {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        maxWidth: '100%',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-lg)',
        gap: 'var(--spacing-2xl)',
      }}>
        <div style={{
          padding: '24px 48px',
          backgroundColor: '#8b5cf6',
          borderRadius: 'var(--radius-xl)',
          color: 'white',
          textAlign: 'center',
        }}>
          <CheckCircle size={48} color="white" style={{ marginBottom: '16px' }} />
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Front Side Complete!</h2>
          <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
            Preparing to scan back side...
          </p>
        </div>
      </div>
    );
  }

  // Step 3 & 4: Show processing screen with method indicators
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100%',
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {capturedImage && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `url(${capturedImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(10px) brightness(0.3)',
        }} />
      )}

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)',
      }} />

      <NavigationBar 
        transparent 
        onClose={onCancel}
      />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-lg)',
        gap: 'var(--spacing-2xl)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Side indicator with hybrid scan badge */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
        }}>
          <div style={{
            padding: '12px 24px',
            backgroundColor: currentSide === 'front' ? '#3b82f6' : '#8b5cf6',
            borderRadius: 'var(--radius-lg)',
            color: 'white',
            fontWeight: 600,
            fontSize: '18px',
            textAlign: 'center',
          }}>
            Processing {currentSide.toUpperCase()} side
            {scanProgress.frontImage && currentSide === 'back' && (
              <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.9 }}>
                ✓ Front side verified
              </div>
            )}
          </div>

          {/* Hybrid scan indicator */}
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'rgba(251, 191, 36, 0.2)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(251, 191, 36, 0.4)',
          }}>
            <Zap size={16} color="#fbbf24" />
            <span style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 600 }}>
              Hybrid AI Scan (OCR + Barcode)
            </span>
          </div>

          {/* Method progress indicators */}
          {currentScanMethod && (
            <div style={{
              display: 'flex',
              gap: '12px',
              fontSize: '12px',
              color: 'white',
            }}>
              <div style={{ opacity: currentScanMethod === 'textract' ? 1 : 0.5 }}>
                📄 OCR: {scanMethodsProgress.textract}%
              </div>
              <div style={{ opacity: currentScanMethod === 'pdf417' ? 1 : 0.5 }}>
                📊 Barcode: {scanMethodsProgress.pdf417}%
              </div>
            </div>
          )}
        </div>

        <div style={{
          width: '100%',
          maxWidth: '400px',
          aspectRatio: '1.586',
          border: `3px solid ${currentSide === 'front' ? '#3b82f6' : '#8b5cf6'}`,
          borderRadius: 'var(--radius-lg)',
          position: 'relative',
          boxShadow: `0 0 40px ${currentSide === 'front' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(139, 92, 246, 0.6)'}`,
          overflow: 'hidden',
          backgroundColor: '#1a1a1a',
        }}>

          {capturedImage && (
            <img 
              src={capturedImage} 
              alt={`Captured ID ${currentSide}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          )}

          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '3px',
              backgroundColor: currentSide === 'front' ? '#3b82f6' : '#8b5cf6',
              boxShadow: `0 0 20px ${currentSide === 'front' ? 'rgba(59, 130, 246, 0.9)' : 'rgba(139, 92, 246, 0.9)'}`,
              top: `${progress}%`,
              transition: 'top 0.5s ease',
            }}
          />

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
                width: '28px',
                height: '28px',
                borderColor: 'white',
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

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-lg)',
          width: '100%',
          maxWidth: '400px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
          }}>
            {error ? (
              <AlertCircle 
                size={28} 
                color="#ef4444"
              />
            ) : currentStep === 'complete' ? (
              <CheckCircle 
                size={28} 
                color="#10b981"
              />
            ) : (
              <Loader2 
                size={28} 
                color="white" 
                style={{ animation: 'spin 1s linear infinite' }}
              />
            )}
            <p style={{ 
              margin: 0, 
              color: error ? '#ef4444' : 'white',
              fontSize: '18px',
              fontWeight: 600,
            }}>
              {status}
            </p>
          </div>

          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: error ? '#ef4444' : (currentSide === 'front' ? '#3b82f6' : '#8b5cf6'),
              transition: 'width 0.5s ease',
              boxShadow: error ? '0 0 10px rgba(239, 68, 68, 0.8)' : `0 0 10px ${currentSide === 'front' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(139, 92, 246, 0.8)'}`,
            }} />
          </div>

          <p className="caption" style={{ 
            margin: 0, 
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px',
          }}>
            {progress}% complete
          </p>

          {error && (
            <Button 
              variant="secondary" 
              icon={<RotateCcw size={18} />}
              onClick={handleRetry}
            >
              Retry {currentSide} side
            </Button>
          )}

          {!error && requiresBackScan && (
            <div style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-md)',
              width: '100%',
            }}>
              <p className="caption" style={{ 
                margin: 0, 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '13px',
                textAlign: 'center',
              }}>
                {scanProgress.frontImage 
                  ? '📋 Preparing to scan back side...' 
                  : '⚡ Using AI hybrid scan for maximum accuracy'
                }
              </p>
            </div>
          )}
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