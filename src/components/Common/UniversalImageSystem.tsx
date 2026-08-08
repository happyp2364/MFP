import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Camera, Link2, Sparkles, Image as ImageIcon, Trash2, RotateCcw, 
  Loader2, AlertCircle, CheckCircle2, FileImage, ShieldCheck
} from 'lucide-react';

// Default Coming Soon SVG (Fallback)
export const CLEAN_IMAGE_COMING_SOON_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23F3F4F6"/><rect x="2" y="2" width="596" height="596" rx="24" stroke="%23E5E7EB" stroke-width="4" stroke-dasharray="8 8"/><circle cx="300" cy="240" r="56" fill="%230B8F63" fill-opacity="0.1"/><path d="M280 220H320M300 200V240M270 255L285 240L300 255L315 240L330 255" stroke="%230B8F63" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><rect x="180" y="320" width="240" height="32" rx="16" fill="%230B8F63"/><text x="300" y="341" fill="white" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="1">REAL PRODUCT IMAGE COMING SOON</text><text x="300" y="390" fill="%236B7280" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Store Inventory</text><text x="300" y="415" fill="%239CA3AF" font-family="sans-serif" font-size="11" text-anchor="middle">Authentic In-Store Inventory</text></svg>`;

export interface ImageMetaData {
  width: number;
  height: number;
  sizeBytes?: number;
  mimeType?: string;
}

/**
 * Validates an image URL robustly.
 * Handles HTTPS check, format regex, and loads the image in memory to check accessibility and dimensions.
 * Gracefully handles CORS headers for size checks.
 */
export function validateImageUrl(url: string): Promise<{ isValid: boolean; meta?: ImageMetaData; error?: string }> {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return Promise.resolve({ isValid: false, error: 'URL is empty' });
  }

  const trimmed = url.trim();

  // Basic regex check for valid URL or base64 data URL
  if (trimmed.startsWith('data:image/')) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Estimate base64 size: roughly 3/4 of string length
        const sizeBytes = Math.round((trimmed.length * 3) / 4);
        const mimeType = trimmed.split(';')[0].split(':')[1];
        resolve({
          isValid: true,
          meta: {
            width: img.naturalWidth,
            height: img.naturalHeight,
            sizeBytes,
            mimeType,
          }
        });
      };
      img.onerror = () => {
        resolve({ isValid: false, error: 'Invalid base64 image data' });
      };
      img.src = trimmed;
    });
  }

  // Check URL prefix and structure
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      return Promise.resolve({ isValid: false, error: 'Insecure URL (HTTPS is required)' });
    }
  } catch {
    return Promise.resolve({ isValid: false, error: 'Malformed URL format' });
  }

  // Run async loading and metadata lookup
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timeout = setTimeout(() => {
      img.src = '';
      resolve({ isValid: false, error: 'Connection timeout' });
    }, 10000);

    img.onload = async () => {
      clearTimeout(timeout);
      
      const meta: ImageMetaData = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };

      // Try fetching headers to determine content-length / content-type (silently bypass CORS blocks)
      try {
        const response = await fetch(trimmed, { method: 'HEAD', mode: 'cors' }).catch(() => null);
        if (response && response.ok) {
          const length = response.headers.get('content-length');
          const type = response.headers.get('content-type');
          if (length) meta.sizeBytes = parseInt(length, 10);
          if (type) meta.mimeType = type;
        }
      } catch {
        // Silently skip CORS blocked head requests
      }

      resolve({ isValid: true, meta });
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve({ isValid: false, error: 'Image file does not exist or host is unreachable' });
    };

    img.src = trimmed;
  });
}

/**
 * Universal safe Image renderer that handles load/error states eleganty,
 * avoiding blank spaces or broken browser image icons.
 */
interface UniversalImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
  className?: string;
}

export const UniversalImage: React.FC<UniversalImageProps> = ({
  src,
  fallbackSrc = CLEAN_IMAGE_COMING_SOON_SVG,
  className = '',
  alt = 'Product image',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setCurrentSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
      setIsLoading(false);
    };
  }, [src, fallbackSrc]);

  return (
    <div className={`relative overflow-hidden bg-neutral-100/50 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50/80 animate-pulse">
          <Loader2 className="w-5 h-5 text-[#0B8F63] animate-spin" />
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        referrerPolicy="no-referrer"
        {...props}
      />
    </div>
  );
};

/**
 * Presets of gorgeous fashion/footwear images from Unsplash to offer quick selection.
 */
const FASHION_PRESETS = [
  { name: 'Red Running Shoe', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
  { name: 'Casual White Sneaker', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80' },
  { name: 'Yellow Athletic Trainer', url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80' },
  { name: 'Classic Dark Sneaker', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
  { name: 'Formal Men Leather', url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80' },
  { name: 'Light Pink Women Run', url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80' },
  { name: 'Retro Orange Sneaker', url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Blue Kids Light Shoe', url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Promo Fashion Banner', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Customer Review Avatar', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
];

/**
 * AI simulation generation database based on prompt matching.
 */
const AI_SIM_IMAGES = [
  { keywords: ['red', 'sport', 'run'], url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['white', 'casual', 'leather'], url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['yellow', 'neon', 'gym'], url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['blue', 'kids', 'boy'], url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['banner', 'header', 'shop', 'sale'], url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['avatar', 'man', 'user', 'profile'], url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
  { keywords: ['avatar', 'women', 'girl'], url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
  { keywords: ['owner', 'seller', 'boutique'], url: 'https://images.unsplash.com/photo-1581375074612-d1fd0e661aeb?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['logo', 'brand', 'badge'], url: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=400&q=400' },
  { keywords: ['coupon', 'gift', 'ticket'], url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80' },
];

interface AdminImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
  onSaveConfig?: (meta: { imageUrl: string; lastUpdated: string; updatedBy: string; imageSource: string }) => void;
  defaultValue?: string;
  label?: string;
  description?: string;
}

export const AdminImageSelector: React.FC<AdminImageSelectorProps> = ({
  value,
  onChange,
  onSaveConfig,
  defaultValue = CLEAN_IMAGE_COMING_SOON_SVG,
  label = "Image URL Settings",
  description = "Support for pasting direct URLs, uploading files, capturing with camera, or generating with AI."
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'upload' | 'camera' | 'ai' | 'preset'>('url');
  const [urlInput, setUrlInput] = useState(value);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; meta?: ImageMetaData; error?: string } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync state when incoming prop value changes
  useEffect(() => {
    setUrlInput(value);
    setValidationResult(null);
  }, [value]);

  // Real-time URL Change / Validation debounce
  useEffect(() => {
    if (!urlInput || urlInput === value) {
      setValidationResult(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsValidating(true);
      const res = await validateImageUrl(urlInput);
      setValidationResult(res);
      setIsValidating(false);

      if (res.isValid) {
        onChange(urlInput);
        if (onSaveConfig) {
          onSaveConfig({
            imageUrl: urlInput,
            lastUpdated: new Date().toISOString(),
            updatedBy: 'Admin Portal',
            imageSource: 'Pasted URL',
          });
        }
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [urlInput]);

  // Handle standard local file upload converting to base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setUrlInput(dataUrl);
      onChange(dataUrl);
      
      if (onSaveConfig) {
        onSaveConfig({
          imageUrl: dataUrl,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Admin Portal',
          imageSource: 'Uploaded File',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Start Video Stream for Capture
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      setCameraError('Failed to access device camera. Please check permissions or upload instead.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setUrlInput(dataUrl);
        onChange(dataUrl);
        
        if (onSaveConfig) {
          onSaveConfig({
            imageUrl: dataUrl,
            lastUpdated: new Date().toISOString(),
            updatedBy: 'Admin Portal',
            imageSource: 'Camera Capture',
          });
        }
        stopCamera();
      }
    }
  };

  // AI Prompt Simulator
  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);

    setTimeout(() => {
      const query = (aiPrompt || '').toLowerCase();
      // Look for a matching simulator image
      const match = AI_SIM_IMAGES.find((item) => 
        item.keywords.some((kw) => query.includes(kw))
      );

      const resolvedUrl = match ? match.url : FASHION_PRESETS[Math.floor(Math.random() * FASHION_PRESETS.length)].url;
      
      setUrlInput(resolvedUrl);
      onChange(resolvedUrl);

      if (onSaveConfig) {
        onSaveConfig({
          imageUrl: resolvedUrl,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Admin AI Engine',
          imageSource: 'AI Generated Image',
        });
      }

      setIsGeneratingAi(false);
    }, 1500);
  };

  // Reset to original default
  const handleRestoreDefault = () => {
    setUrlInput(defaultValue);
    onChange(defaultValue);

    if (onSaveConfig) {
      onSaveConfig({
        imageUrl: defaultValue,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'Admin Reset',
        imageSource: 'Restored Default',
      });
    }
  };

  // Remove completely
  const handleRemoveImage = () => {
    setUrlInput('');
    onChange('');

    if (onSaveConfig) {
      onSaveConfig({
        imageUrl: '',
        lastUpdated: new Date().toISOString(),
        updatedBy: 'Admin Action',
        imageSource: 'Removed Image',
      });
    }
  };

  const getReadableSize = (bytes?: number) => {
    if (!bytes) return 'Unknown Size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
      <div>
        <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#0B8F63]" />
          <span>{label}</span>
        </h4>
        <p className="text-[11px] text-neutral-500 mt-0.5">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Control Column */}
        <div className="md:col-span-7 space-y-4">
          
          {/* Selector Tabs */}
          <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200 overflow-x-auto no-scrollbar">
            {[
              { id: 'url', label: 'Paste URL', icon: Link2 },
              { id: 'upload', label: 'Upload', icon: Upload },
              { id: 'camera', label: 'Camera', icon: Camera },
              { id: 'ai', label: 'AI Gen', icon: Sparkles },
              { id: 'preset', label: 'Presets', icon: FileImage },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id !== 'camera') stopCamera();
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel */}
          <div className="min-h-24 bg-neutral-50 p-4 rounded-xl border border-neutral-150 flex flex-col justify-center">
            
            {/* TAB: URL Paste */}
            {activeTab === 'url' && (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-white border border-neutral-200 rounded-xl py-2 px-3 text-xs pr-8 font-medium outline-none focus:ring-2 focus:ring-[#0B8F63]"
                  />
                  {isValidating && (
                    <div className="absolute right-2.5 top-2.5">
                      <Loader2 className="w-4 h-4 text-[#0B8F63] animate-spin" />
                    </div>
                  )}
                </div>

                {/* Validation Banner */}
                {urlInput && (
                  <div className="pt-1.5">
                    {validationResult ? (
                      validationResult.isValid ? (
                        <div className="flex items-start gap-2 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-100 p-2.5 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-bold">Image URL Verified Successfully</span>
                            <div className="flex gap-2.5 text-[10px] text-emerald-600">
                              <span>Dims: <strong>{validationResult.meta?.width} x {validationResult.meta?.height} px</strong></span>
                              <span>•</span>
                              <span>Size: <strong>{getReadableSize(validationResult.meta?.sizeBytes)}</strong></span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 text-[11px] bg-red-50 text-red-800 border border-red-100 p-2.5 rounded-xl">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-bold">Invalid Image URL</span>
                            <span className="block text-[10px] text-red-600 font-medium">Reason: {validationResult.error}</span>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 bg-neutral-100 p-2.5 rounded-xl">
                        <Loader2 className="w-3.5 h-3.5 text-[#0B8F63] animate-spin" />
                        <span>Validating image URL online...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Local Upload */}
            {activeTab === 'upload' && (
              <div className="text-center space-y-3">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-xl p-4 cursor-pointer hover:border-[#0B8F63] transition-colors bg-white">
                  <Upload className="w-6 h-6 text-neutral-400 mb-1" />
                  <span className="text-xs font-bold text-neutral-700">Choose Image File</span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">Supports PNG, JPG, WEBP, GIF, SVG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* TAB: Camera Capture */}
            {activeTab === 'camera' && (
              <div className="text-center space-y-3">
                {cameraError && (
                  <div className="p-2.5 bg-red-50 border border-red-100 text-red-800 text-[10px] rounded-lg font-bold">
                    {cameraError}
                  </div>
                )}
                {cameraActive ? (
                  <div className="relative rounded-lg overflow-hidden border bg-black aspect-video max-h-48 mx-auto flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#0B8F63] text-white text-xs font-bold rounded-lg shadow-md"
                    >
                      Capture Photo
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Activate Camera</span>
                  </button>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {/* TAB: AI Generation */}
            {activeTab === 'ai' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. elegant red running shoes for men"
                    className="w-full bg-white border border-neutral-200 rounded-xl py-2 px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-[#0B8F63]"
                  />
                  <button
                    type="button"
                    disabled={isGeneratingAi || !aiPrompt.trim()}
                    onClick={handleAiGenerate}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 disabled:opacity-50"
                  >
                    {isGeneratingAi ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>Gen</span>
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 font-medium">
                  Enter visual details like "red sporty sneaker" or "avatar profile" for realistic matching!
                </p>
              </div>
            )}

            {/* TAB: Choose Preset */}
            {activeTab === 'preset' && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 max-h-36 overflow-y-auto p-1">
                {FASHION_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUrlInput(preset.url);
                      onChange(preset.url);
                      if (onSaveConfig) {
                        onSaveConfig({
                          imageUrl: preset.url,
                          lastUpdated: new Date().toISOString(),
                          updatedBy: 'Admin Presets',
                          imageSource: 'Selected Preset',
                        });
                      }
                    }}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-neutral-200 hover:border-[#0B8F63] transition-colors bg-white flex items-center justify-center p-0.5"
                    title={preset.name}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover rounded-md" referrerPolicy="no-referrer" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/70 text-[8px] text-white py-0.5 text-center truncate px-1 group-hover:bg-black font-semibold">
                      {preset.name}
                    </div>
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Quick Utility Options (Reset, Remove) */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleRestoreDefault}
              className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-bold py-2 px-3 rounded-lg border border-neutral-200 flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore Default</span>
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold py-2 px-3 rounded-lg border border-red-100 flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove Image</span>
            </button>
          </div>

        </div>

        {/* Right Preview Column */}
        <div className="md:col-span-5 flex flex-col items-center justify-center bg-neutral-50 rounded-2xl border border-neutral-200 p-4">
          <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-2 block text-center">
            Live Safe Preview
          </span>

          <div className="w-full aspect-square max-h-40 rounded-xl overflow-hidden border border-neutral-200 bg-white relative shadow-inner">
            <UniversalImage
              src={value || defaultValue}
              alt="Live Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-3 text-center space-y-1">
            <span className="text-[9px] font-extrabold text-neutral-400 block uppercase">Image Status</span>
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-neutral-700">
              {value ? (
                value.startsWith('data:') ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Local Optimized Base64</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Online URL Loaded</span>
                  </>
                )
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-neutral-500">No Image Configured</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
