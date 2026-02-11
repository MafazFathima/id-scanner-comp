// src/components/CameraCapture.tsx - ENHANCED FOR BARCODE SCANNING
import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, Circle, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  onError?: (error: Error) => void;
}

export function CameraCapture({ onCapture, onCancel, onError }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureFrameRef = useRef<HTMLDivElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actualResolution, setActualResolution] = useState<string>('');
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalHeight = document.body.style.height;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.height = '100vh';
    document.body.style.width = '100vw';
    
    startCamera();
    
    return () => {
      console.log('🔴 CameraCapture: Cleaning up camera...');
      stopCamera();
      
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.height = originalHeight;
      document.body.style.width = '';
    };
  }, []);

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

  // ✅ ENHANCED: Better resolution strategy with focus controls
  const startCamera = async () => {
    try {
      console.log('📹 Starting camera with enhanced settings...');
      
      let mediaStream: MediaStream | null = null;
      
      // ✅ FIX: Request higher resolutions with better constraints
      const resolutions = [
        { 
          width: 3840, 
          height: 2160, 
          label: '4K (Ideal for barcodes)',
          constraints: {
            video: {
              facingMode: 'environment',
              width: { ideal: 3840, min: 1920 },
              height: { ideal: 2160, min: 1080 },
              // ✅ CRITICAL: Request manual focus mode for better barcode scanning
              focusMode: 'continuous',
              // ✅ Request higher frame rate for steadier capture
              frameRate: { ideal: 30 },
            }
          }
        },
        { 
          width: 1920, 
          height: 1080, 
          label: '1080p (Good)',
          constraints: {
            video: {
              facingMode: 'environment',
              width: { ideal: 1920, min: 1280 },
              height: { ideal: 1080, min: 720 },
              focusMode: 'continuous',
              frameRate: { ideal: 30 },
            }
          }
        },
        { 
          width: 1280, 
          height: 720, 
          label: '720p (Minimum)',
          constraints: {
            video: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 },
              focusMode: 'continuous',
              frameRate: { ideal: 30 },
            }
          }
        },
      ];

      let achievedResolution = '';
      
      for (const res of resolutions) {
        try {
          console.log(`📹 Attempting ${res.label}...`);
          mediaStream = await navigator.mediaDevices.getUserMedia(res.constraints);
          achievedResolution = res.label;
          console.log(`✅ ${res.label} acquired!`);
          break;
        } catch (err) {
          console.log(`⚠️ ${res.label} not available, trying next...`);
        }
      }

      // Fallback to any available camera
      if (!mediaStream) {
        console.log('⚠️ Using fallback camera settings...');
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        achievedResolution = 'Default';
      }

      if (videoRef.current && mediaStream) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('✅ Video metadata loaded');
              resolve();
            };
          }
        });
        
        setIsReady(true);
        
        // Get actual resolution and settings
        const track = mediaStream.getVideoTracks()[0];
        const settings = track.getSettings();
        const capabilities = track.getCapabilities?.();
        
        const width = settings.width || 0;
        const height = settings.height || 0;
        const resLabel = `${width}x${height}`;
        const megapixels = ((width * height) / 1000000).toFixed(1);
        
        setActualResolution(resLabel);
        
        console.log(`✅ Camera started: ${resLabel} (${megapixels}MP)`);
        console.log('📊 Camera settings:', {
          resolution: resLabel,
          megapixels,
          focusMode: settings.focusMode || 'not reported',
          frameRate: settings.frameRate || 'not reported',
          facingMode: settings.facingMode || 'not reported',
        });
        
        // ✅ QUALITY WARNING: Alert if resolution is too low
        if (width < 1920) {
          const warning = width < 1280 
            ? '⚠️ Low resolution - barcode detection may fail'
            : '⚠️ Moderate resolution - use good lighting';
          setQualityWarning(warning);
          console.warn(warning, `Got ${width}x${height}`);
        } else {
          setQualityWarning(null);
        }
        
        if (capabilities) {
          console.log('📱 Camera capabilities:', {
            maxWidth: capabilities.width?.max,
            maxHeight: capabilities.height?.max,
            supportsFocusMode: !!capabilities.focusMode,
          });
        }
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
    
    if (videoRef.current) {
      console.log('🛑 Clearing video element...');
      const videoElement = videoRef.current;
      videoElement.pause();
      videoElement.srcObject = null;
      videoElement.src = '';
      videoElement.onloadedmetadata = null;
      videoElement.onloadeddata = null;
      videoElement.load();
      console.log('✅ Video element cleared');
    }
    setStream(null);
    setIsReady(false);
    
    console.log('✅ Camera stopped completely');
  };

  // ✅ ENHANCED: Better image capture with quality validation
  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    console.log('📸 === CAPTURE DEBUG START ===');
    console.log('📺 Video state:', {
      readyState: video.readyState,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      currentTime: video.currentTime,
      paused: video.paused,
      ended: video.ended
    });

    // ✅ Use actual video dimensions
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = video.videoWidth;
    let sourceHeight = video.videoHeight;

    const videoRect = video.getBoundingClientRect();
    const frameRect = captureFrameRef.current?.getBoundingClientRect();

    if (frameRect && videoRect.width > 0 && videoRect.height > 0 && video.videoWidth > 0 && video.videoHeight > 0) {
      const scale = Math.max(videoRect.width / video.videoWidth, videoRect.height / video.videoHeight);
      const displayedWidth = video.videoWidth * scale;
      const displayedHeight = video.videoHeight * scale;
      const overflowX = (displayedWidth - videoRect.width) / 2;
      const overflowY = (displayedHeight - videoRect.height) / 2;

      const frameLeft = frameRect.left - videoRect.left;
      const frameTop = frameRect.top - videoRect.top;

      sourceX = Math.max(0, (frameLeft + overflowX) / scale);
      sourceY = Math.max(0, (frameTop + overflowY) / scale);
      sourceWidth = Math.min(video.videoWidth - sourceX, frameRect.width / scale);
      sourceHeight = Math.min(video.videoHeight - sourceY, frameRect.height / scale);
    }

    canvas.width = Math.max(1, Math.round(sourceWidth));
    canvas.height = Math.max(1, Math.round(sourceHeight));

    console.log('🎨 Canvas dimensions set:', {
      width: canvas.width,
      height: canvas.height,
      megapixels: ((canvas.width * canvas.height) / 1000000).toFixed(2)
    });

    // ✅ CRITICAL: Use highest quality settings
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    context.drawImage(
      video,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Validate canvas has actual image data
    const imageData = context.getImageData(0, 0, Math.min(100, canvas.width), Math.min(100, canvas.height));
    const pixels = imageData.data;
    let nonZeroPixels = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] > 0 || pixels[i+1] > 0 || pixels[i+2] > 0) {
        nonZeroPixels++;
      }
    }
    
    console.log('🖼️ Canvas has image data:', {
      totalPixelsSampled: pixels.length / 4,
      nonZeroPixels: nonZeroPixels,
      percentageNonZero: ((nonZeroPixels / (pixels.length / 4)) * 100).toFixed(2) + '%'
    });

    // ✅ CRITICAL: Use 0.95 quality (was 0.95, keeping it high)
    const base64Image = canvas.toDataURL('image/jpeg', 0.99);

    const imageSizeKB = Math.round((base64Image.length * 0.75) / 1024);
    
    console.log('📦 Base64 image details:', {
      totalLength: base64Image.length,
      base64DataLength: base64Image.split(',')[1]?.length || 0,
      estimatedFileSizeKB: imageSizeKB,
      resolution: `${canvas.width}x${canvas.height}`,
      megapixels: ((canvas.width * canvas.height) / 1000000).toFixed(2),
      mimeType: base64Image.split(',')[0],
      firstChars: base64Image.substring(0, 100),
      lastChars: base64Image.substring(base64Image.length - 100)
    });

    // ✅ QUALITY CHECK: Warn if image is too small
    if (imageSizeKB < 150) {
      console.warn(`⚠️ Image quality may be too low: ${imageSizeKB}KB (recommend >200KB)`);
    }

    if (canvas.width < 1920) {
      console.warn(`⚠️ Resolution lower than ideal: ${canvas.width}x${canvas.height} (recommend 1920x1080+)`);
    }

    // Validate image loads correctly
    const testImg = new Image();
    testImg.onload = () => {
      console.log('✅ Base64 image is valid and loadable:', {
        width: testImg.width,
        height: testImg.height,
        naturalWidth: testImg.naturalWidth,
        naturalHeight: testImg.naturalHeight
      });
    };
    testImg.onerror = (err) => {
      console.error('❌ Base64 image failed to load!', err);
    };
    testImg.src = base64Image;

    console.log('📸 === CAPTURE DEBUG END ===');

    setIsCaptured(true);
    stopCamera();

    setTimeout(() => {
      onCapture(base64Image);
    }, 200);
  };

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
      height: '100vh',
      width: '100vw',
      maxWidth: '100%',
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden',
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
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: 'clamp(16px, 4vw, 24px)',
        paddingTop: 'clamp(106px, 12vh, 120px)',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'clamp(12px, 2.5vh, 20px)',
        }}>
          <div style={{
            padding: '8px 12px',
            backgroundColor: qualityWarning ? 'rgba(245, 158, 11, 0.8)' : 'rgba(0, 0, 0, 0.5)',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            fontWeight: 600,
          }}>
            {isReady ? `📸 ${actualResolution}` : '⏳ Initializing...'}
          </div>
          <button
            onClick={handleCancel}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
            }}
          >
            <X size={24} color="white" />
          </button>
        </div>

        {/* ✅ QUALITY WARNING BANNER */}
        {qualityWarning && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            backgroundColor: 'rgba(245, 158, 11, 0.9)',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '12px',
          }}>
            <AlertCircle size={18} />
            <span>{qualityWarning}</span>
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          flex: 1,
        }}>
          <div
          ref={captureFrameRef}
          style={{
            width: 'min(85vw, 400px)',
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
                  width: 'clamp(24px, 6vw, 32px)',
                  height: 'clamp(24px, 6vw, 32px)',
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
          gap: 'clamp(12px, 3vh, 20px)',
          paddingTop: 'clamp(16px, 3vh, 24px)',
          paddingBottom: 'max(60px, env(safe-area-inset-bottom))',
        }}>
          {/* ✅ ENHANCED TIPS */}
          <div style={{
            textAlign: 'center',
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            maxWidth: '90%',
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              fontWeight: 600 
            }}>
              Position ID within the frame
            </p>
            <p style={{ 
              margin: '6px 0 0 0', 
              fontSize: 'clamp(12px, 3vw, 13px)',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
              lineHeight: 1.4
            }}>
              💡 Bright lighting • Hold steady • Flat surface<br/>
              🎯 Barcode clearly visible • No glare or shadows
            </p>
          </div>

          <button
            onClick={captureImage}
            disabled={!isReady}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'clamp(70px, 18vw, 80px)',
              height: 'clamp(70px, 18vw, 80px)',
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
