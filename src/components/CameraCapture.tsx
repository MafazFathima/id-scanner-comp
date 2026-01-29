// src> Component>CameraCapture.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, Circle, Component } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void; // Base64 image data
  onCancel: () => void;
  onError?: (error: Error) => void;
}

export function CameraCapture({ onCapture, onCancel, onError }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    
    // Cleanup function - runs when component unmounts
    return () => {
      console.log('🔴 CameraCapture: Cleaning up camera...');
      stopCamera();
    };
  }, []);

  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('🔴 Tab hidden: Stopping camera...');
        stopCamera();
      }
    };

    const handleBeforeUnload = () => {
      console.log('🔴 Page unloading: Stopping camera...');
      stopCamera();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      console.log('📹 Starting camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsReady(true);
        console.log('✅ Camera started successfully');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
      console.error('❌ Camera access error:', error);
    }
  };

  const stopCamera = () => {
    console.log('🛑 stopCamera called, stream exists:', !!stream);
    
    // Stop the stream tracks first
    if (stream) {
      console.log('🛑 Stopping camera stream...');
      const tracks = stream.getTracks();
      console.log('🛑 Total tracks to stop:', tracks.length);
      
      tracks.forEach(track => {
        console.log(`🛑 Stopping track: ${track.kind}, readyState: ${track.readyState}`);
        track.stop();
        console.log(`✅ Track stopped: ${track.kind}, new readyState: ${track.readyState}`);
      });
    }
    
    // Clear the video element completely
    if (videoRef.current) {
      console.log('🛑 Clearing video element...');
      const videoElement = videoRef.current;
      
      // Pause the video
      videoElement.pause();
      
      // Remove the source
      videoElement.srcObject = null;
      
      // Clear src attribute as well
      videoElement.src = '';
      
      // Remove all event listeners
      videoElement.onloadedmetadata = null;
      videoElement.onloadeddata = null;
      
      // Force a load to clear any buffered data
      videoElement.load();
      
      console.log('✅ Video element cleared');
    }
    
    // Clear state
    setStream(null);
    setIsReady(false);
    
    console.log('✅ Camera stopped completely');
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const base64Image = canvas.toDataURL('image/jpeg', 0.95);

    console.log('📸 Image captured, stopping camera immediately...');
console.log('📸 FULL Base64 Image:\n', base64Image);

    setIsCaptured(true);
    
    // Stop camera IMMEDIATELY - don't wait
    stopCamera();
    
    // Then call onCapture after a small delay to ensure cleanup is done
    setTimeout(() => {
      onCapture(base64Image);
    }, 200);
  };

//   const stopCamera = () => {
//     if (stream) {
//       console.log('🛑 Stopping camera stream...');
//       stream.getTracks().forEach(track => {
//         console.log(`🛑 Stopping track: ${track.kind}, readyState: ${track.readyState}`);
//         track.stop();
//         console.log(`✅ Track stopped: ${track.kind}, readyState: ${track.readyState}`);
//       });
      
//       // Clear the video element
//       if (videoRef.current) {
//         videoRef.current.srcObject = null;
//         videoRef.current.pause();
//         // Remove all event listeners
//         videoRef.current.onloadedmetadata = null;
//       }
      
//       setStream(null);
//       setIsReady(false);
//       console.log('✅ Camera stopped completely');
//     } else {
//       console.log('ℹ️ No stream to stop');
//     }
//   };

//   const captureImage = () => {
//     if (!videoRef.current || !canvasRef.current) return;

//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const context = canvas.getContext('2d');

//     if (!context) return;

//     // Set canvas dimensions to match video
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     // Draw video frame to canvas
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     // Convert to base64
//     const base64Image = canvas.toDataURL('image/jpeg', 0.95);

//     setIsCaptured(true);
    
//     // Stop camera immediately after capture
//     console.log('📸 Image captured, stopping camera...');
    
//     // Stop the stream before calling onCapture
//     setTimeout(() => {
//       stopCamera();
//       onCapture(base64Image);
//     }, 100);
//   };

  const handleCancel = () => {
    console.log('❌ User cancelled, stopping camera...');
    stopCamera();
    onCancel();
  };

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-lg)',
        gap: 'var(--spacing-lg)',
        color: 'white',
      }}>
        <Camera size={64} color="#ef4444" />
        <div style={{ textAlign: 'center' }}>
          <h2>Camera Access Error</h2>
          <p style={{ color: '#999' }}>{error}</p>
        </div>
        <button
          onClick={handleCancel}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{
    minHeight: '100vh',     
  width: '100%',         
  maxWidth: '100%',
  backgroundColor: '#000',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflowX: 'hidden',
  overflowY: 'auto',    
  paddingBottom: '80px',  
    }}>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100vh',
          objectFit: 'cover',
        }}
      />

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'var(--spacing-lg)',
      }}>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
          }}>
            {isReady ? '📸 Camera Ready' : '⏳ Initializing...'}
          </div>
          <button
            onClick={handleCancel}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
            }}
          >
            <X size={24} color="white" />
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            aspectRatio: '1.586',
            border: '3px solid #10b981',
            borderRadius: 'var(--radius-lg)',
            position: 'relative',
            boxShadow: '0 0 40px rgba(16, 185, 129, 0.6)',
          }}>
            {[
              { top: '-3px', left: '-3px', borderTop: true, borderLeft: true },
              { top: '-3px', right: '-3px', borderTop: true, borderRight: true },
              { bottom: '-3px', left: '-3px', borderBottom: true, borderLeft: true },
              { bottom: '-3px', right: '-3px', borderBottom: true, borderRight: true },
            ].map((pos, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: '32px',
                  height: '32px',
                  borderColor: 'white',
                  borderWidth: '4px',
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
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-lg)',
          marginBottom: '60px',
        }}>
          <div style={{
            textAlign: 'center',
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
          }}>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              Position ID within the frame
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              Ensure all corners are visible
            </p>
          </div>

          <button
            onClick={captureImage}
            disabled={!isReady}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              backgroundColor: isReady ? 'white' : 'rgba(255, 255, 255, 0.3)',
              border: '4px solid white',
              borderRadius: '50%',
              cursor: isReady ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Circle 
              size={40} 
              fill={isReady ? 'var(--color-primary)' : '#666'} 
              color={isReady ? 'var(--color-primary)' : '#666'}
            />
          </button>
        </div>
      </div>
    </div>
  );
}