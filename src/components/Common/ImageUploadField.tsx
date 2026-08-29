import React, { useState, useRef, useId } from 'react';
import { Upload, Image as ImageIcon, Trash2, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { optimizeImageFile } from '../../utils/imageOptimizer';

export interface ImageUploadFieldProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  onRemove?: () => void;
  label?: string;
  description?: string;
  placeholder?: string;
  maxSizeBytes?: number; // default 8MB
  maxWidth?: number; // default 1200
  maxHeight?: number; // default 1200
  quality?: number; // default 0.85
  aspectRatio?: 'square' | 'video' | 'auto' | 'banner';
  disabled?: boolean;
  compact?: boolean;
  className?: string;
  allowUrlFallback?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value = '',
  onChange,
  onRemove,
  label = 'Upload Image',
  description = 'Supports PNG, JPG, JPEG, WEBP, GIF, SVG (Auto-optimized for speed)',
  placeholder = 'Click or drag photo here to upload',
  maxSizeBytes = 8 * 1024 * 1024,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85,
  aspectRatio = 'square',
  disabled = false,
  compact = false,
  className = '',
  allowUrlFallback = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const uniqueId = useId().replace(/:/g, '_');
  const inputId = `image-upload-${uniqueId}`;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerFilePicker = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setErrorMessage(null);
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!file.type.startsWith('image/') && !validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Unsupported image format. Please choose PNG, JPG, WEBP, GIF, or SVG.');
      return;
    }

    // Validate raw size
    if (file.size > maxSizeBytes) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max size is ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB.`);
      return;
    }

    setIsUploading(true);
    try {
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          onChange(result);
          setIsUploading(false);
        };
        reader.onerror = () => {
          setErrorMessage('Failed to read SVG file.');
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } else {
        const optimizedDataUrl = await optimizeImageFile(file, {
          maxWidth,
          maxHeight,
          quality,
          enhance: true,
        });
        onChange(optimizedDataUrl);
        setIsUploading(false);
      }
    } catch (err: any) {
      console.error('Image processing failed:', err);
      setErrorMessage('Failed to process and optimize image. Please try another file.');
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    // Always clear the input value so selecting the same file again triggers onChange
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMessage(null);
    if (onRemove) {
      onRemove();
    } else {
      onChange('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyManualUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!manualUrl.trim()) return;
    onChange(manualUrl.trim());
    setShowUrlInput(false);
    setManualUrl('');
  };

  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'banner'
      ? 'aspect-[21/9]'
      : aspectRatio === 'auto'
      ? 'min-h-[140px]'
      : 'aspect-square max-h-48';

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Info */}
      {(label || description) && (
        <div className="flex items-center justify-between">
          <div>
            {label && <label htmlFor={inputId} className="block text-xs font-bold text-neutral-800">{label}</label>}
            {description && <p className="text-[11px] text-neutral-500">{description}</p>}
          </div>
          {allowUrlFallback && (
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
            >
              {showUrlInput ? 'Hide URL Box' : 'Paste Direct URL'}
            </button>
          )}
        </div>
      )}

      {/* Manual URL Input Box */}
      {showUrlInput && (
        <div className="flex gap-2 p-2 bg-neutral-50 rounded-xl border border-neutral-200">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={handleApplyManualUrl}
            className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800"
          >
            Apply
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        id={inputId}
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,image/*"
        onChange={handleFileInputChange}
        disabled={disabled || isUploading}
        className="sr-only hidden"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Main Upload / Preview Area */}
      {value ? (
        <div className={`relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 group shadow-xs ${aspectClass}`}>
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-contain bg-neutral-900/5"
            referrerPolicy="no-referrer"
          />

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
            <button
              type="button"
              onClick={handleTriggerFilePicker}
              disabled={disabled || isUploading}
              className="px-3 py-2 bg-white text-neutral-900 rounded-xl text-xs font-bold shadow-md hover:bg-neutral-100 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Replace this image"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Replace Image</span>
            </button>

            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="px-3 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Remove this image"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>

          {/* Bottom badge */}
          <div className="absolute bottom-2 left-2 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-900/80 text-white backdrop-blur-xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{value.startsWith('data:') ? 'Optimized Local Image' : 'Image Ready'}</span>
            </span>
          </div>
        </div>
      ) : (
        <div
          onClick={handleTriggerFilePicker}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTriggerFilePicker(e as any);
            }
          }}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
              : 'border-neutral-300 hover:border-emerald-500 bg-neutral-50/70 hover:bg-emerald-50/20'
          } ${compact ? 'py-4' : 'py-6'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <span className="text-xs font-bold text-emerald-800">Optimizing & Processing Image...</span>
              <span className="text-[10px] text-neutral-500">Auto-compressing for ultra-fast loading</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-800 block">
                  {placeholder}
                </span>
                <span className="text-[11px] text-neutral-500 mt-0.5 block">
                  Supports PNG, JPG, WEBP, GIF, SVG (Up to 8MB)
                </span>
              </div>
              <button
                type="button"
                className="mt-1 px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs pointer-events-none"
              >
                Choose Photo from Device
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
