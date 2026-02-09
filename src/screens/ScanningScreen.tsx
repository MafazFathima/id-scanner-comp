// src/screens/ScanningScreen.tsx - UPDATED with Unified ID Extraction
import React, { useEffect, useState } from 'react';
import { NavigationBar } from '../components/NavigationBar';
import { Loader2, CheckCircle, AlertCircle, RotateCcw, Zap, Barcode } from 'lucide-react';
import { CameraCapture } from '../components/CameraCapture';
// ⚡ CHANGE 1: Updated import to use new unified service
import { extractIDData } from '../services/idExtractionService';
import type { IDScanResult, DualSideScanResult } from '../services/idExtractionService';
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

type ProcessingStep = 
  | 'capture-front'      
  | 'transition'         
  | 'capture-back'      
  | 'processing'         
  | 'complete';         

export function ScanningScreen({ 
  onComplete, 
  onCancel, 
  mode = 'camera',
  documentType,
  requiresBackScan = true,
}: ScanningScreenProps) {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('capture-front');
  const [currentSide, setCurrentSide] = useState<ScanSide>('front');
  
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Position FRONT side in frame');
  const [error, setError] = useState<string | null>(null);
 
  const [cameraKey, setCameraKey] = useState<number>(0);
  const [showCamera, setShowCamera] = useState<boolean>(true);

  const handleImageCapture = async (imageBase64: string) => {
    console.log(`📸 ${currentSide.toUpperCase()} side captured, size:`, imageBase64.length);

    setShowCamera(false);
    
    if (currentSide === 'front') {
      setFrontImage(imageBase64);
      
      if (requiresBackScan) {
        console.log('✅ Front captured. Preparing for back side...');
        setStatus('Front side captured!');
        setCurrentStep('transition');
        await delay(2000);
        
        console.log('🔄 Switching to back side...');
        setCurrentSide('back');
        setCameraKey(prev => prev + 1);
        setShowCamera(true);
        setCurrentStep('capture-back');
        setStatus('Position BACK side in frame');
      } else {
        console.log('✅ Front captured. Starting extraction...');
        setCurrentStep('processing');
        await processBothSides(imageBase64, null);
      }
    } else {
      setBackImage(imageBase64);
      console.log('✅ Both sides captured. Starting extraction...');
      setCurrentStep('processing');
      await processBothSides(frontImage!, imageBase64);
    }
  };

  const processBothSides = async (frontImg: string, backImg: string | null) => {
    try {
      setStatus('Preparing extraction...');
      setProgress(10);
      await delay(300);

      setStatus('Analyzing images...');
      setProgress(20);
      await delay(300);

      const imagesToProcess = backImg ? [frontImg, backImg] : [frontImg];
      
      // ⚡ CHANGE 2: Updated status message to reflect unified extraction
      setStatus('Running barcode + OCR extraction...');
      setProgress(30);
      await delay(300);

      setStatus(`Processing ${imagesToProcess.length} image(s)...`);
      setProgress(40);
      await delay(300);

      // ⚡ CHANGE 3: Using unified extraction service
      console.log(`🔍 Starting unified extraction (Barcode + OCR)...`);
      console.log('📊 Image sizes:', imagesToProcess.map(img => img.length));

      const result: DualSideScanResult = await extractIDData(imagesToProcess);
      
      // ⚡ CHANGE 4: Updated logging to show extraction method
      console.log('✅ Extraction complete:', result);
      console.log('📋 Front data extracted:', {
        name: result.frontData.fullName,
        dob: result.frontData.dateOfBirth,
        sex: result.frontData.sex || 'NOT DETECTED',
        height: result.frontData.height || 'NOT DETECTED',
        eyeColor: result.frontData.eyeColor || 'NOT DETECTED',
        method: result.frontData.extractionMethod?.toUpperCase() || 'UNKNOWN',
        confidence: `${(result.frontData.confidence * 100).toFixed(1)}%`,
      });
      
      if (result.backData) {
        console.log('📋 Back data extracted:', {
          name: result.backData.fullName,
          sex: result.backData.sex || 'NOT DETECTED',
          height: result.backData.height || 'NOT DETECTED',
          eyeColor: result.backData.eyeColor || 'NOT DETECTED',
          method: result.backData.extractionMethod?.toUpperCase() || 'UNKNOWN',
          confidence: `${(result.backData.confidence * 100).toFixed(1)}%`,
        });
      }
      
      setProgress(70);
      // ⚡ CHANGE 5: Updated status to show actual extraction method
      const methodLabel = result.frontData.extractionMethod === 'barcode' ? 'PDF417 Barcode' :
                         result.frontData.extractionMethod === 'ocr' ? 'OCR' : 'Combined';
      setStatus(`Extracted via ${methodLabel}...`);
      await delay(300);

      if (backImg) {
        setProgress(85);
        setStatus('Processing back side...');
        await delay(300);
      }

      setProgress(95);
      setStatus('Validating information...');
      await delay(300);

      setProgress(100);
      setStatus('Scan complete!');
      await delay(500);

      const completeResult: CompleteScanResultData = {
        documentType,
        frontImage: frontImg,
        frontData: result.frontData,
        backImage: backImg || undefined,
        backData: result.backData,
      };

      console.log('📦 Sending result to parent component');
      console.log(`✅ Combined confidence: ${(result.combinedConfidence * 100).toFixed(1)}%`);
      console.log('📊 Extraction methods:', {
        front: result.frontData.extractionMethod,
        back: result.backData?.extractionMethod || 'N/A',
      });
      
      setCurrentStep('complete');
      await delay(500);
      onComplete(completeResult);

    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setStatus('Processing failed');
      setProgress(0);
      console.error('❌ Processing error:', error);
      console.error('❌ Error stack:', error.stack);
    }
  };

  const handleCameraError = (error: Error) => {
    setError(error.message);
    setStatus('Camera error occurred');
    console.error('❌ Camera error:', error);
  };

  const handleRetry = () => {
    console.log('🔄 Retrying scan...');

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

  if (currentStep === 'capture-front' && showCamera) {
    return (
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '70px',
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: '#3b82f6',
          padding: '2px',
          textAlign: 'center',
          color: 'white',
          fontWeight: 600,
          fontSize: '16px',
        }}>
          📄 Scan FRONT side of document
        </div>

        <div style={{ 
          paddingTop: '0',
          height: '100vh',
          width: '100vw',
        }} key={`camera-front-${cameraKey}`}>
          <CameraCapture
            onCapture={handleImageCapture}
            onCancel={onCancel}
            onError={handleCameraError}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'transition') {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '22px 48px',
          backgroundColor: '#10b981',
          borderRadius: 'var(--radius-xl)',
          color: 'white',
          textAlign: 'center',
          maxWidth: '85%',
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

  if (currentStep === 'capture-back' && showCamera) {
    return (
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '80px',
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: '#8b5cf6',
          padding: '4px',
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

        <div style={{ 
          paddingTop: '0',
          height: '100vh',
          width: '100vw',
        }} key={`camera-back-${cameraKey}`}>
          <CameraCapture
            onCapture={handleImageCapture}
            onCancel={onCancel}
            onError={handleCameraError}
          />
        </div>
      </div>
    );
  }

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

        <div style={{
          padding: '6px 12px',
          backgroundColor: '#6366f1',
          borderRadius: 'var(--radius-md)',
          color: 'white',
          fontWeight: 600,
          fontSize: '18px',
          textAlign: 'center',
          marginBottom:'96px',
        }}>
          Processing {backImage ? 'BOTH sides' : 'document'}
        </div>

        <div style={{
          width: '100%',
          maxWidth: '400px',
          position: 'relative',
          marginTop: '-82px',
        }}>

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
          marginBottom:'12px'
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
                {/* ⚡ CHANGE 6: Updated message */}
                {backImage 
                  ? '⚡ Smart extraction active' 
                  : '🔒 Secure processing'
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
