import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Save,
  CheckCircle2,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  RotateCcw,
  Sliders,
  Move,
  Activity,
  Layers,
  Eye,
  Info,
  RotateCw,
  Wand2,
  Scissors,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { HangingSneakerConfig } from '../../types';
import { validateFileUpload } from '../../lib/security';
import { optimizeImageFile } from '../../utils/imageOptimizer';
import { extractShoeFromImage } from '../../utils/aiBackgroundRemoval';

export const HangingSneakerSettingsView: React.FC = () => {
  const { hangingSneakerConfig, updateHangingSneakerConfig } = useStore();

  const defaultConfig: HangingSneakerConfig = {
    enabled: true,
    imageUri: '',
    laceLength: 220,
    sizePx: 260,
    positionRight: 10,
    positionTop: 160,
    swingSpeedSec: 7.0,
    swingAngleDeg: 4.0,
    baseRotationDeg: -18,
    enablePhysicsAnimation: true,
  };

  const current = hangingSneakerConfig || defaultConfig;

  // Local Form State
  const [enabled, setEnabled] = useState<boolean>(current.enabled ?? true);
  const [useCustomImage, setUseCustomImage] = useState<boolean>(Boolean(current.imageUri));
  const [imageUri, setImageUri] = useState<string>(current.imageUri || '');
  const [laceLength, setLaceLength] = useState<number>(current.laceLength ?? 220);
  const [sizePx, setSizePx] = useState<number>(current.sizePx ?? 260);
  const [positionRight, setPositionRight] = useState<number>(current.positionRight ?? 10);
  const [positionTop, setPositionTop] = useState<number>(current.positionTop ?? 160);
  const [swingSpeedSec, setSwingSpeedSec] = useState<number>(current.swingSpeedSec ?? 7.0);
  const [swingAngleDeg, setSwingAngleDeg] = useState<number>(current.swingAngleDeg ?? 4.0);
  const [baseRotationDeg, setBaseRotationDeg] = useState<number>(current.baseRotationDeg ?? -18);
  const [enablePhysicsAnimation, setEnablePhysicsAnimation] = useState<boolean>(
    current.enablePhysicsAnimation ?? true
  );
  const [enableShineEffect, setEnableShineEffect] = useState<boolean>(current.enableShineEffect ?? true);

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [aiProcessingStage, setAiProcessingStage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state if remote store updates
  useEffect(() => {
    if (saveStatus === 'SAVING') return;
    const cfg = hangingSneakerConfig || defaultConfig;
    setEnabled(cfg.enabled ?? true);
    setUseCustomImage(Boolean(cfg.imageUri));
    setImageUri(cfg.imageUri || '');
    setLaceLength(cfg.laceLength ?? 220);
    setSizePx(cfg.sizePx ?? 260);
    setPositionRight(cfg.positionRight ?? 10);
    setPositionTop(cfg.positionTop ?? 160);
    setSwingSpeedSec(cfg.swingSpeedSec ?? 7.0);
    setSwingAngleDeg(cfg.swingAngleDeg ?? 4.0);
    setBaseRotationDeg(cfg.baseRotationDeg ?? -18);
    setEnablePhysicsAnimation(cfg.enablePhysicsAnimation ?? true);
    setEnableShineEffect(cfg.enableShineEffect ?? true);
  }, [hangingSneakerConfig]);

  // Handle Image Upload & AI Background Removal
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const valResult = validateFileUpload(file);
    if (!valResult.isValid) {
      setErrorMessage(valResult.error || 'Invalid file format or size');
      return;
    }

    setIsUploading(true);
    setAiProcessingStage('Preparing image...');
    try {
      const optimizedUri = await optimizeImageFile(file, { maxWidth: 1024, maxHeight: 1024, quality: 0.9 });
      
      setAiProcessingStage('AI Detecting Shoe & Isolating Object (Removing Poster, Text & Rocks)...');
      const segResult = await extractShoeFromImage(optimizedUri);
      
      setImageUri(segResult.transparentPngUrl);
      setUseCustomImage(true);
    } catch (err: any) {
      setErrorMessage('Failed to extract shoe: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
      setAiProcessingStage('');
    }
  };

  const handleRemoveCustomImage = () => {
    setImageUri('');
    setUseCustomImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Reset to ONE 8 Burgundy Reference Sneaker
  const handleResetToBuiltin = () => {
    setEnabled(true);
    setUseCustomImage(false);
    setImageUri('');
    setLaceLength(220);
    setSizePx(260);
    setPositionRight(10);
    setPositionTop(160);
    setSwingSpeedSec(7.0);
    setSwingAngleDeg(4.0);
    setBaseRotationDeg(-18);
    setEnablePhysicsAnimation(true);
    setEnableShineEffect(true);
  };

  // Apply Presets
  const applyPreset = (preset: 'hero' | 'compact' | 'subtle') => {
    if (preset === 'hero') {
      setLaceLength(220);
      setSizePx(260);
      setPositionRight(10);
      setPositionTop(160);
      setSwingSpeedSec(7.0);
      setSwingAngleDeg(4.0);
      setBaseRotationDeg(-18);
    } else if (preset === 'compact') {
      setLaceLength(180);
      setSizePx(200);
      setPositionRight(6);
      setPositionTop(120);
      setSwingSpeedSec(6.0);
      setSwingAngleDeg(3.0);
      setBaseRotationDeg(-12);
    } else if (preset === 'subtle') {
      setLaceLength(250);
      setSizePx(280);
      setPositionRight(12);
      setPositionTop(200);
      setSwingSpeedSec(8.0);
      setSwingAngleDeg(3.5);
      setBaseRotationDeg(-22);
    }
  };

  // Submit Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('SAVING');
    setErrorMessage(null);

    const newConfig: HangingSneakerConfig = {
      enabled,
      imageUri: useCustomImage ? imageUri : '',
      laceLength,
      sizePx,
      positionRight,
      positionTop,
      swingSpeedSec,
      swingAngleDeg,
      baseRotationDeg,
      enablePhysicsAnimation,
      enableShineEffect,
      colorTheme: 'ONE8_BURGUNDY',
    };

    try {
      await updateHangingSneakerConfig(newConfig);
      setSaveStatus('SUCCESS');
      setTimeout(() => setSaveStatus('IDLE'), 3000);
    } catch (err: any) {
      setSaveStatus('ERROR');
      setErrorMessage(err?.message || 'Failed to update hanging sneaker configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-neutral-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-amber-950/90 via-neutral-900 to-neutral-950 text-white border border-amber-500/30 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Hanging Decorative Shoe Manager
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ONE 8 Edition
              </span>
            </h2>
            <p className="text-xs text-neutral-300 mt-0.5">
              Customize position, scale, swing angle, physics speed, and replace image for the hero hanging shoe.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetToBuiltin}
          type="button"
          className="px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-xs font-medium text-neutral-200 border border-neutral-700 transition flex items-center gap-1.5 self-end sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Reset ONE 8 Defaults</span>
        </button>
      </div>

      {/* Save Notification Alerts */}
      {saveStatus === 'SUCCESS' && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-medium">
            Hanging shoe configuration updated & synchronized across storefront!
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Master Toggle & Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Active Enable Toggle */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-semibold flex items-center gap-2 text-neutral-900 dark:text-white">
                <Eye className="w-4 h-4 text-amber-500" />
                Enable Hanging Shoe
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Display hanging shoe in Hero section.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                enabled ? 'bg-[#0B8F63]' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Physics Swing Toggle */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-semibold flex items-center gap-2 text-neutral-900 dark:text-white">
                <Activity className="w-4 h-4 text-amber-500" />
                Pendulum Swing
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Subtle swinging motion (3°–5°, 6–8s).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnablePhysicsAnimation(!enablePhysicsAnimation)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                enablePhysicsAnimation ? 'bg-[#0B8F63]' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  enablePhysicsAnimation ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Luxury Studio Shine Toggle */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-semibold flex items-center gap-2 text-neutral-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Studio Shine Sweep
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Soft gloss reflection moving across shoe.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnableShineEffect(!enableShineEffect)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                enableShineEffect ? 'bg-[#0B8F63]' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  enableShineEffect ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sneaker Graphic Source Selection */}
        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                Shoe Graphic Source
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Choose between the reference ONE 8 burgundy wine leather sneaker or upload your custom product photo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Option 1: Reference ONE 8 Burgundy Leather Shoe */}
            <button
              type="button"
              onClick={() => {
                setUseCustomImage(false);
              }}
              className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3 ${
                !useCustomImage
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-950 dark:text-amber-100 ring-2 ring-amber-500/30'
                  : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-[#58111A] text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow">
                ONE8
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  Reference ONE 8 Burgundy Leather Shoe
                  {!useCustomImage && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">
                  Rich burgundy leather finish, white woven laces, gum sole, double-loop infinity stitching, and gold foil signature stamp.
                </p>
              </div>
            </button>

            {/* Option 2: Custom Uploaded Image */}
            <button
              type="button"
              onClick={() => {
                setUseCustomImage(true);
              }}
              className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3 ${
                useCustomImage
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-950 dark:text-amber-100 ring-2 ring-amber-500/30'
                  : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  Custom Uploaded Product Photo
                  {useCustomImage && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">
                  Upload your own high-resolution product photograph. The image will be displayed exactly as uploaded with white hanging laces.
                </p>
              </div>
            </button>
          </div>

          {/* Upload Custom Image Panel */}
          {useCustomImage && (
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3 animate-fade-in mt-3">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-amber-500" />
                AI Shoe Object Extraction & Transparent PNG Preview
              </label>

              {imageUri ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  {/* Checkered pattern box to clearly show transparency */}
                  <div
                    className="w-28 h-28 rounded-xl border border-neutral-300 dark:border-neutral-700 flex items-center justify-center overflow-hidden p-2 shadow-inner shrink-0 relative"
                    style={{
                      backgroundImage: `
                        linear-gradient(45deg, #e5e7eb 25%, transparent 25%), 
                        linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #e5e7eb 75%), 
                        linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
                      `,
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    }}
                  >
                    <img src={imageUri} alt="Extracted transparent shoe" className="max-w-full max-h-full object-contain filter drop-shadow-md" />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-emerald-600 text-[9px] font-bold text-white uppercase tracking-wider">
                      PNG
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> AI Background Removed (Transparent PNG)
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      Only the shoe object is displayed with zero background or poster frame. The original shoe texture, stitching, leather grain, and soles are preserved 100%.
                    </p>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsUploading(true);
                          setAiProcessingStage('AI Segmenting Shoe & Clearing Background...');
                          try {
                            const res = await extractShoeFromImage(imageUri);
                            setImageUri(res.transparentPngUrl);
                          } catch (err: any) {
                            setErrorMessage('AI Extraction error: ' + (err?.message || 'Failed'));
                          } finally {
                            setIsUploading(false);
                            setAiProcessingStage('');
                          }
                        }}
                        disabled={isUploading}
                        className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Wand2 className="w-3.5 h-3.5" /> Re-run AI Extraction
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveCustomImage}
                        className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Custom Photo
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-6 text-center hover:border-amber-500 transition-colors bg-neutral-50/50 dark:bg-neutral-900/30">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    id="sneaker-upload-input"
                  />
                  <label
                    htmlFor="sneaker-upload-input"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      {isUploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      {isUploading ? (aiProcessingStage || 'AI Extracting Shoe Object...') : 'Click to Upload Any Shoe Photograph'}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      AI will automatically isolate the shoe and remove backgrounds/text. (PNG, JPG, WebP)
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dimension, Angle, Speed & Position Tuning */}
        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                Position, Size, Swing Speed & Rotation Controls
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Fine-tune placement, scale, base tilt rotation, swing cycle speed, and swing amplitude.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-neutral-400 hidden sm:inline">Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset('hero')}
                className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:border-amber-500"
              >
                Hero Corner
              </button>
              <button
                type="button"
                onClick={() => applyPreset('compact')}
                className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:border-amber-500"
              >
                Compact Right
              </button>
              <button
                type="button"
                onClick={() => applyPreset('subtle')}
                className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:border-amber-500"
              >
                Subtle Luxury
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Offset (px) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <label className="text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-amber-500" />
                  Top Position (Vertical Offset)
                </label>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{positionTop}px</span>
              </div>
              <input
                type="range"
                min={40}
                max={360}
                step={10}
                value={positionTop}
                onChange={(e) => setPositionTop(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
              <p className="text-[11px] text-neutral-400">Position 35%–45% down from top edge inside hero viewport.</p>
            </div>

            {/* Right Offset (rem) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <label className="text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-amber-500" />
                  Right Offset (Horizontal Distance)
                </label>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{positionRight}rem</span>
              </div>
              <input
                type="range"
                min={2}
                max={24}
                step={1}
                value={positionRight}
                onChange={(e) => setPositionRight(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
              <p className="text-[11px] text-neutral-400">Spacing from right screen margin to avoid covering text.</p>
            </div>

            {/* Shoe Size / Scale (px) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <label className="text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  Shoe Size / Scale
                </label>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{sizePx}px</span>
              </div>
              <input
                type="range"
                min={150}
                max={340}
                step={5}
                value={sizePx}
                onChange={(e) => setSizePx(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
              <p className="text-[11px] text-neutral-400">Width on desktop view (automatically scales down for mobile).</p>
            </div>

            {/* Base Tilt Rotation Angle (Deg) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <label className="text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-amber-500" />
                  Base Tilt Angle
                </label>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{baseRotationDeg}°</span>
              </div>
              <input
                type="range"
                min={-40}
                max={10}
                step={1}
                value={baseRotationDeg}
                onChange={(e) => setBaseRotationDeg(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
              <p className="text-[11px] text-neutral-400">Natural gravity hanging tilt angle (-18° recommended).</p>
            </div>

            {/* Swing Speed (Seconds per cycle) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <label className="text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-500" />
                  Swing Speed (Cycle Duration)
                </label>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{swingSpeedSec}s / cycle</span>
              </div>
              <input
                type="range"
                min={4.0}
                max={12.0}
                step={0.5}
                value={swingSpeedSec}
                onChange={(e) => setSwingSpeedSec(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
              <p className="text-[11px] text-neutral-400">Subtle slow movement recommended: 6s–8s per full cycle.</p>
            </div>

            {/* Swing Angle (Degrees) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <label className="text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  Swing Angle Amplitude
                </label>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{swingAngleDeg}°</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={10.0}
                step={0.5}
                value={swingAngleDeg}
                onChange={(e) => setSwingAngleDeg(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
              <p className="text-[11px] text-neutral-400">Subtle premium movement recommended: 3°–5° swing angle.</p>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Settings apply in real-time to the storefront hero section.</span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Hanging Shoe Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
