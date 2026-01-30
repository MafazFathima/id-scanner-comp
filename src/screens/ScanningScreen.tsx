// src/screens/ScanningScreen.tsx - MODIFIED: Single API call for both sides
import React, { useEffect, useState } from 'react';
import { NavigationBar } from '../components/NavigationBar';
import { Loader2, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { CameraCapture } from '../components/CameraCapture';
import { scanIDWithTextract } from '../services/textractService';
import type { IDScanResult, DualSideScanResult } from '../services/textractService';
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
  frontData: IDScanResult;
  backImage?: string;
  backData?: IDScanResult;
}

// CHANGED: New processing steps to reflect single API call workflow
type ProcessingStep = 
  | 'capture-front'      // Capturing front side
  | 'transition'         // Transition between front and back
  | 'capture-back'       // Capturing back side
  | 'processing'         // Processing BOTH sides with single API call
  | 'complete';          // All done

export function ScanningScreen({ 
  onComplete, 
  onCancel, 
  mode = 'camera',
  documentType,
  requiresBackScan = true,
}: ScanningScreenProps) {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('capture-front');
  const [currentSide, setCurrentSide] = useState<ScanSide>('front');
  
  // CHANGED: Store both images before processing
  // We collect both images first, then make ONE API call
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Position FRONT side in frame');
  const [error, setError] = useState<string | null>(null);
  
  // Camera remounting controls
  const [cameraKey, setCameraKey] = useState<number>(0);
  const [showCamera, setShowCamera] = useState<boolean>(true);

  /**
   * CHANGED: Handle image capture for either front or back
   * Now we just store the image and move to the next step
   * No API call is made until we have both images (or just front if back not required)
   */
  const handleImageCapture = async (imageBase64: string) => {
    console.log(`📸 ${currentSide.toUpperCase()} side captured, size:`, imageBase64.length);
    
    // Hide camera immediately
    setShowCamera(false);
    
    if (currentSide === 'front') {
      // Store front image
      setFrontImage(imageBase64);
      
      if (requiresBackScan) {
        // Show transition message, then switch to back capture
        console.log('✅ Front captured. Preparing for back side...');
        setStatus('Front side captured!');
        setCurrentStep('transition');
        await delay(2000);
        
        // Switch to back side
        console.log('🔄 Switching to back side...');
        setCurrentSide('back');
        setCameraKey(prev => prev + 1);
        setShowCamera(true);
        setCurrentStep('capture-back');
        setStatus('Position BACK side in frame');
      } else {
        // No back side required, process immediately
        console.log('✅ Front captured. Processing with single API call...');
        setCurrentStep('processing');
        await processBothSides(imageBase64, null);
      }
    } else {
      // Store back image
      setBackImage(imageBase64);
      
      // CHANGED: Now we have both images, make the SINGLE API call
      console.log('✅ Both sides captured. Processing with single API call...');
      setCurrentStep('processing');
      await processBothSides(frontImage!, imageBase64);
    }
  };

  /**
   * CHANGED: New function to process BOTH sides with a SINGLE API call
   * This is the key change - we send both images to Textract at once
   * 
   * @param frontImg - Base64 encoded front image
   * @param backImg - Base64 encoded back image (optional)
   */
  const processBothSides = async (frontImg: string, backImg: string | null) => {
    try {
      setStatus('Processing both sides...');
      setProgress(10);
      await delay(300);

      setStatus('Preparing images for processing...');
      setProgress(20);
      await delay(300);

      // CHANGED: Prepare array of images
      // If backImg is null, we only send the front image
      const imagesToProcess = backImg ? [frontImg, backImg] : [frontImg];
      
      setStatus('Encoding image data...');
      setProgress(30);
      await delay(300);

      setStatus(`Sending ${imagesToProcess.length} image(s) to AWS Textract...`);
      setProgress(40);
      await delay(300);

      console.log(`🔍 Calling AWS Textract with ${imagesToProcess.length} image(s)...`);
      
      // CHANGED: SINGLE API CALL for both front and back
      // This is the most important change - one call instead of two
      const result: DualSideScanResult = await scanIDWithTextract(imagesToProcess);
      
      console.log('✅ Textract response received:', result);
      
      setProgress(70);
      setStatus('Extracting data from front side...');
      await delay(300);

      if (backImg) {
        setProgress(85);
        setStatus('Extracting data from back side...');
        await delay(300);
      }

      setProgress(95);
      setStatus('Validating extracted information...');
      await delay(300);

      setProgress(100);
      setStatus('Scan complete!');
      await delay(500);

      // CHANGED: Prepare complete result with data from both sides
      const completeResult: CompleteScanResultData = {
        documentType,
        frontImage: frontImg,
        frontData: result.frontData,
        backImage: backImg || undefined,
        backData: result.backData,
      };

      console.log('📦 Sending complete result:', completeResult);
      console.log(`✅ Combined confidence: ${(result.combinedConfidence * 100).toFixed(1)}%`);
      
      setCurrentStep('complete');
      await delay(500);
      onComplete(completeResult);

    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setStatus('Processing failed');
      setProgress(0);
      console.error('❌ Processing error:', error);
    }
  };

  const handleCameraError = (error: Error) => {
    setError(error.message);
    setStatus('Camera error occurred');
    console.error('❌ Camera error:', error);
  };

  /**
   * CHANGED: Retry logic now depends on which side failed
   * If processing failed, we retry from the beginning
   */
  const handleRetry = () => {
    console.log('🔄 Retrying scan...');
    
    // Reset everything
    setFrontImage(null);
    setBackImage(null);
    setCurrentSide('front');
    setCameraKey(prev => prev + 1);
    setShowCamera(true);
    setCurrentStep('capture-front');
    setProgress(0);
    setError(null);
    setStatus('Position FRONT side in frame');
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // RENDER: Front side capture
  if (currentStep === 'capture-front' && showCamera) {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: '#3b82f6',
          padding: '16px',
          textAlign: 'center',
          color: 'white',
          fontWeight: 600,
          fontSize: '16px',
        }}>
          📄 Scan FRONT side of document
        </div>

        <div style={{ paddingTop: '60px' }} key={`camera-front-${cameraKey}`}>
          <CameraCapture
            onCapture={handleImageCapture}
            onCancel={onCancel}
            onError={handleCameraError}
          />
        </div>
      </div>
    );
  }

  // RENDER: Transition message between front and back
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
          backgroundColor: '#10b981',
          borderRadius: 'var(--radius-xl)',
          color: 'white',
          textAlign: 'center',
        }}>
          <CheckCircle size={48} color="white" style={{ marginBottom: '16px' }} />
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Front Side Captured!</h2>
          <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
            Get ready to scan the back side...
          </p>
        </div>
      </div>
    );
  }

  // RENDER: Back side capture
  if (currentStep === 'capture-back' && showCamera) {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: '#8b5cf6',
          padding: '16px',
          textAlign: 'center',
          color: 'white',
          fontWeight: 600,
          fontSize: '16px',
        }}>
          📄 Scan BACK side of document
          <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.9 }}>
            ✓ Front side captured
          </div>
        </div>

        <div style={{ paddingTop: '60px' }} key={`camera-back-${cameraKey}`}>
          <CameraCapture
            onCapture={handleImageCapture}
            onCancel={onCancel}
            onError={handleCameraError}
          />
        </div>
      </div>
    );
  }

  // RENDER: Processing screen (shown while making the single API call)
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
      {/* Background - Show most recent captured image */}
      {(backImage || frontImage) && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `url(${backImage || frontImage})`,
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
        {/* CHANGED: Status indicator shows we're processing both sides at once */}
        <div style={{
          padding: '12px 24px',
          backgroundColor: '#6366f1',
          borderRadius: 'var(--radius-lg)',
          color: 'white',
          fontWeight: 600,
          fontSize: '18px',
          textAlign: 'center',
        }}>
          Processing {backImage ? 'BOTH sides' : 'document'}
          {backImage && (
            <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.9 }}>
              ✓ Using single API call
            </div>
          )}
        </div>

        {/* Document preview with dual-side indicator if both images exist */}
        <div style={{
          width: '100%',
          maxWidth: '400px',
          position: 'relative',
        }}>
          {/* Front image preview */}
          <div style={{
            aspectRatio: '1.586',
            border: '3px solid #3b82f6',
            borderRadius: 'var(--radius-lg)',
            position: 'relative',
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)',
            overflow: 'hidden',
            backgroundColor: '#1a1a1a',
            marginBottom: backImage ? '12px' : '0',
          }}>
            {frontImage && (
              <img 
                src={frontImage} 
                alt="Captured ID front"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            )}
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              padding: '4px 12px',
              backgroundColor: 'rgba(59, 130, 246, 0.9)',
              borderRadius: '4px',
              color: 'white',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              FRONT
            </div>
          </div>

          {/* Back image preview (if exists) */}
          {backImage && (
            <div style={{
              aspectRatio: '1.586',
              border: '3px solid #8b5cf6',
              borderRadius: 'var(--radius-lg)',
              position: 'relative',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)',
              overflow: 'hidden',
              backgroundColor: '#1a1a1a',
            }}>
              <img 
                src={backImage} 
                alt="Captured ID back"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                padding: '4px 12px',
                backgroundColor: 'rgba(139, 92, 246, 0.9)',
                borderRadius: '4px',
                color: 'white',
                fontSize: '12px',
                fontWeight: 600,
              }}>
                BACK
              </div>
            </div>
          )}
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
              backgroundColor: error ? '#ef4444' : '#6366f1',
              transition: 'width 0.5s ease',
              boxShadow: error ? '0 0 10px rgba(239, 68, 68, 0.8)' : '0 0 10px rgba(99, 102, 241, 0.8)',
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
              Retry scan
            </Button>
          )}

          {!error && (
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
                {backImage 
                  ? '⚡ Processing both sides in a single API call' 
                  : '🔒 All processing happens securely'
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