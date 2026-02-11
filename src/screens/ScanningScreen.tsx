import { useState } from 'react';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { CameraCapture } from '../components/CameraCapture';
import { NavigationBar } from '../components/NavigationBar';
import { Button } from '../components/Button';
import { extractIDData } from '../services/idExtractionService';
import type { IDScanResult } from '../services/idExtractionService';
import type { DocumentType, ScanSide } from '../sdk/types';

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

type ProcessingStep = 'capture-front' | 'capture-back' | 'processing';

export function ScanningScreen({
  onComplete,
  onCancel,
  documentType,
  requiresBackScan = true,
}: ScanningScreenProps) {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('capture-front');
  const [currentSide, setCurrentSide] = useState<ScanSide>('front');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Position FRONT side in frame');
  const [error, setError] = useState<string | null>(null);
  const [cameraKey, setCameraKey] = useState(0);

  const processImages = async (frontImg: string, backImg: string | null) => {
    try {
      setCurrentStep('processing');
      setError(null);
      setStatus('Extracting the data..');
      setProgress(40);

      const images = backImg ? [frontImg, backImg] : [frontImg];
      const result = await extractIDData(images);

      setStatus('Received API response');
      setProgress(100);

      onComplete({
        documentType,
        frontImage: frontImg,
        frontData: result.frontData,
        backImage: backImg || undefined,
        backData: result.backData,
      });
    } catch (err) {
      const e = err as Error;
      setError(e.message || 'Processing failed');
      setStatus('Processing failed');
      setProgress(0);
    }
  };

  const handleImageCapture = async (imageBase64: string) => {
    if (currentSide === 'front') {
      setFrontImage(imageBase64);
      if (requiresBackScan) {
        setCurrentSide('back');
        setCurrentStep('capture-back');
        setStatus('Position BACK side in frame');
        setCameraKey((prev) => prev + 1);
        return;
      }
      await processImages(imageBase64, null);
      return;
    }

    if (frontImage) {
      await processImages(frontImage, imageBase64);
    }
  };

  const handleCameraError = (cameraError: Error) => {
    setError(cameraError.message);
    setStatus('Camera error occurred');
  };

  const handleRetry = () => {
    setFrontImage(null);
    setCurrentSide('front');
    setCurrentStep('capture-front');
    setStatus('Position FRONT side in frame');
    setProgress(0);
    setError(null);
    setCameraKey((prev) => prev + 1);
  };

  if (currentStep === 'capture-front' || currentStep === 'capture-back') {
    return (
      <div style={{ position: 'fixed', inset: 0 }}>
        <div
          style={{
            position: 'absolute',
            top: '72px',
            left: 0,
            right: 0,
            zIndex: 1000,
            textAlign: 'center',
            color: 'white',
            fontWeight: 600,
            padding: '6px',
            backgroundColor: currentStep === 'capture-front' ? '#2563eb' : '#7c3aed',
          }}
        >
          Scan {currentStep === 'capture-front' ? 'FRONT' : 'BACK'} side
        </div>
        <div style={{ height: '100vh', width: '100vw' }} key={`camera-${cameraKey}`}>
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
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#000',
        color: 'white',
        position: 'relative',
      }}
    >
      <NavigationBar transparent onClose={onCancel} />

      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
          gap: '16px',
        }}
      >
        {error ? <AlertCircle size={28} color="#ef4444" /> : <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />}

        <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: error ? '#ef4444' : '#fff' }}>
          {status}
        </p>

        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            height: '6px',
            borderRadius: '4px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: error ? '#ef4444' : '#6366f1',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {error && (
          <Button variant="secondary" icon={<RotateCcw size={18} />} onClick={handleRetry}>
            Retry scan
          </Button>
        )}
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
