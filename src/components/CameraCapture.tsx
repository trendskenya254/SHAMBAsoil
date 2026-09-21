import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, RefreshCw, CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';
import { compressImage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

interface CameraCaptureProps {
  onPhotosCaptured: (photos: { dataUrl: string; position_type: string }[]) => void;
  onCancel?: () => void;
  maxPhotos?: number;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onPhotosCaptured,
  onCancel,
  maxPhotos = 3
}) => {
  const { language } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<{ dataUrl: string; position_type: string }[]>([]);
  const [currentPosition, setCurrentPosition] = useState<'surface' | 'close_up' | 'profile'>('surface');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Start live camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        throw new Error('Camera device access not supported by browser.');
      }
    } catch (err: any) {
      console.warn('Could not start live camera feed, falling back to file input:', err);
      setCameraError('Live video stream not accessible. Use the gallery or native camera picker below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    // Attempt auto-start camera
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const takeSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const rawUrl = canvas.toDataURL('image/jpeg', 0.85);
        const compressed = await compressImage(rawUrl);

        const newPhotos = [...capturedPhotos, { dataUrl: compressed, position_type: currentPosition }];
        setCapturedPhotos(newPhotos);

        // Advance suggested position
        if (currentPosition === 'surface') setCurrentPosition('close_up');
        else if (currentPosition === 'close_up') setCurrentPosition('profile');
      }
    } catch (e) {
      console.error('Error taking snapshot:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      const newItems: { dataUrl: string; position_type: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        if (capturedPhotos.length + newItems.length >= maxPhotos) break;
        const compressed = await compressImage(files[i]);
        newItems.push({
          dataUrl: compressed,
          position_type: i === 0 ? currentPosition : 'close_up'
        });
      }
      setCapturedPhotos(prev => [...prev, ...newItems]);
    } catch (err: any) {
      alert('Failed to process uploaded photo: ' + err.message);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (idx: number) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleConfirm = () => {
    stopCamera();
    onPhotosCaptured(capturedPhotos);
  };

  return (
    <div className="bg-stone-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-stone-800">
      {/* Top Header */}
      <div className="p-4 bg-stone-950/80 flex items-center justify-between border-b border-stone-800">
        <div>
          <h3 className="font-bold text-sm sm:text-base font-display text-white">
            {language === 'sw' ? 'Piga Picha ya Udongo' : 'Capture Soil Photo'}
          </h3>
          <p className="text-xs text-stone-400">
            {language === 'sw'
              ? `Picha zilizochukuliwa: ${capturedPhotos.length}/${maxPhotos}`
              : `Photos captured: ${capturedPhotos.length}/${maxPhotos}`}
          </p>
        </div>
        {onCancel && (
          <button
            id="camera-cancel-btn"
            onClick={() => {
              stopCamera();
              onCancel();
            }}
            className="p-2 text-stone-400 hover:text-white rounded-full bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Viewport Area */}
      <div className="relative bg-black min-h-[340px] sm:min-h-[420px] flex items-center justify-center overflow-hidden">
        {cameraActive ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover max-h-[460px]"
            />
            {/* Alignment and Framing Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
              <div className="w-64 h-64 sm:w-80 sm:h-80 border-2 border-dashed border-emerald-400/70 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br" />
                <div className="absolute inset-x-0 bottom-3 text-center">
                  <span className="text-[11px] bg-black/75 px-3 py-1 rounded-full text-emerald-200 border border-emerald-500/30">
                    {language === 'sw' ? 'Weka udongo ndani ya duara' : 'Align soil inside frame'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center max-w-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-stone-800 text-stone-400 mx-auto flex items-center justify-center">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-sm text-stone-300">
              {cameraError || (language === 'sw' ? 'Kamera haipatikani moja kwa moja.' : 'Live camera is currently inactive.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                id="camera-retry-btn"
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {language === 'sw' ? 'Jaribu Kamera Tena' : 'Retry Camera'}
              </button>
              <button
                id="camera-select-file-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                {language === 'sw' ? 'Chagua Picha' : 'Choose File'}
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden file input for native camera / gallery upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          id="native-camera-input"
        />
      </div>

      {/* Position Type Selector */}
      <div className="p-3 bg-stone-950/60 border-t border-stone-800 flex items-center justify-center gap-2 text-xs">
        <span className="text-stone-400 hidden sm:inline">{language === 'sw' ? 'Aina ya Picha:' : 'Photo perspective:'}</span>
        {(['surface', 'close_up', 'profile'] as const).map(type => (
          <button
            key={type}
            id={`pos-type-${type}`}
            onClick={() => setCurrentPosition(type)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              currentPosition === type
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            {type === 'surface' ? (language === 'sw' ? 'Uso wa Udongo' : 'Soil Surface') :
             type === 'close_up' ? (language === 'sw' ? 'Picha ya Karibu' : 'Close-up Crumb') :
             (language === 'sw' ? 'Ndani ya Shimo (Profile)' : 'Pit Profile')}
          </button>
        ))}
      </div>

      {/* Thumbnails of captured photos */}
      {capturedPhotos.length > 0 && (
        <div className="p-3 bg-stone-900 border-t border-stone-800 flex items-center gap-3 overflow-x-auto">
          {capturedPhotos.map((photo, index) => (
            <div key={index} className="relative group flex-shrink-0">
              <img
                src={photo.dataUrl}
                alt={`Soil Sample ${index + 1}`}
                className="w-16 h-16 object-cover rounded-xl border border-stone-700 ring-2 ring-emerald-500/50"
              />
              <button
                id={`remove-photo-${index}`}
                onClick={() => removePhoto(index)}
                className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow-md hover:bg-red-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <span className="absolute bottom-1 left-1 text-[9px] bg-black/80 px-1 rounded text-stone-200">
                {photo.position_type}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Action Controls */}
      <div className="p-4 bg-stone-950 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="camera-browse-btn"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            {language === 'sw' ? 'Kutoka Kwenye Simu' : 'Browse Gallery'}
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {cameraActive && (
            <button
              id="camera-snap-btn"
              disabled={isProcessing || capturedPhotos.length >= maxPhotos}
              onClick={takeSnapshot}
              className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Camera className="w-5 h-5" />
              {language === 'sw' ? 'Piga Picha' : 'Snap Photo'}
            </button>
          )}

          <button
            id="camera-confirm-btn"
            disabled={capturedPhotos.length === 0}
            onClick={handleConfirm}
            className="flex-1 sm:flex-none px-6 py-3 bg-white text-stone-900 hover:bg-stone-100 disabled:opacity-40 font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            {language === 'sw'
              ? `Tumia (${capturedPhotos.length})`
              : `Proceed (${capturedPhotos.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};
