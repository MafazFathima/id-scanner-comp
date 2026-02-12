// src/components/CameraCapture.tsx
import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  onError?: (error: Error) => void;
}

export function CameraCapture({ onCapture, onCancel, onError }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCamera();
      }
    };

    const handleBeforeUnload = () => {
      stopCamera();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true);
        };
      }
    } catch (err) {
      const error = err as Error;
      onError?.(error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
      videoRef.current.load();
    }
    
    setIsReady(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || !overlayRef.current || !isReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const videoRect = video.getBoundingClientRect();
    const overlayRect = overlayRef.current.getBoundingClientRect();

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    const displayWidth = videoRect.width;
    const displayHeight = videoRect.height;

    const videoAspect = videoWidth / videoHeight;
    const displayAspect = displayWidth / displayHeight;

    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    if (videoAspect > displayAspect) {
      scale = displayHeight / videoHeight;
      const scaledWidth = videoWidth * scale;
      offsetX = (scaledWidth - displayWidth) / 2;
    } else {
      scale = displayWidth / videoWidth;
      const scaledHeight = videoHeight * scale;
      offsetY = (scaledHeight - displayHeight) / 2;
    }

    let cropX = (overlayRect.left - videoRect.left + offsetX) / scale;
    let cropY = (overlayRect.top - videoRect.top + offsetY) / scale;
    let cropW = overlayRect.width / scale;
    let cropH = overlayRect.height / scale;

    cropX = Math.max(0, cropX);
    cropY = Math.max(0, cropY);
    cropW = Math.min(videoWidth - cropX, cropW);
    cropH = Math.min(videoHeight - cropY, cropH);

    if (cropW <= 0 || cropH <= 0) return;

    canvas.width = Math.round(cropW);
    canvas.height = Math.round(cropH);

    ctx.drawImage(
      video,
      Math.round(cropX),
      Math.round(cropY),
      Math.round(cropW),
      Math.round(cropH),
      0,
      0,
      canvas.width,
      canvas.height
    );

    const image = canvas.toDataURL('image/jpeg', 0.95);
    
    stopCamera();
    
    setTimeout(() => {
      onCapture(image);
    }, 100);
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <button
        onClick={handleCancel}
        style={{
          position: 'absolute',
          top: '15vh',
          right: 16,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <X color="white" size={20} />
      </button>

      <div
        ref={overlayRef}
        style={{
          position: 'absolute',
          top: window.innerWidth > 768 ? '45%' : '37%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(85vw, 420px)',
          aspectRatio: '1.586',
          border: '2.5px solid #2563eb',
          borderRadius: 12,
          boxShadow: '0 0 40px rgba(37, 99, 235, 0.5)',
          pointerEvents: 'none',
        }}
      />

      <button
        onClick={captureImage}
        disabled={!isReady}
        style={{
          position: 'absolute',
          bottom: 90,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: '4px solid white',
          background: isReady ? '#2563eb' : '#6b7280',
          cursor: isReady ? 'pointer' : 'not-allowed',
        }}
      />
    </div>
  );
}