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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { HangingSneakerConfig } from '../../types';
import { validateFileUpload } from '../../lib/security';
import { optimizeImageFile } from '../../utils/imageOptimizer';

export const HangingSneakerSettingsView: React.FC = () => {
  const { hangingSneakerConfig, updateHangingSneakerConfig } = useStore();

  const defaultConfig: HangingSneakerConfig = {
    enabled: true,
    imageUri: '',
    laceLength: 240,
    sizePx: 250,
    positionRight: 14,
    positionTop: 0,
    swingSpeedSec: 9.5,
    enablePhysicsAnimation: true,
  };

  const current = hangingSneakerConfig || defaultConfig;

  // Local Form State
  const [enabled, setEnabled] = useState<boolean>(current.enabled ?? true);
  const [useCustomImage, setUseCustomImage] = useState<boolean>(Boolean(current.imageUri));
  const [imageUri, setImageUri] = useState<string>(current.imageUri || '');
  const [laceLength, setLaceLength] = useState<number>(current.laceLength ?? 240);
  const [sizePx, setSizePx] = useState<number>(current.sizePx ?? 250);
  const [positionRight, setPositionRight] = useState<number>(current.positionRight ?? 14);
  const [positionTop, setPositionTop] = useState<number>(current.positionTop ?? 0);
  const [swingSpeedSec, setSwingSpeedSec] = useState<number>(current.swingSpeedSec ?? 9.5);
  const [enablePhysicsAnimation, setEnablePhysicsAnimation] = useState<boolean>(
    current.enablePhysicsAnimation ?? true
  );

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state if remote store updates and user isn't saving
  useEffect(() => {
    if (saveStatus === 'SAVING') return;
    const cfg = hangingSneakerConfig || defaultConfig;
    setEnabled(cfg.enabled ?? true);
    setUseCustomImage(Boolean(cfg.imageUri));
    setImageUri(cfg.imageUri || '');
    setLaceLength(cfg.laceLength ?? 240);
    setSizePx(cfg.sizePx ?? 250);
    setPositionRight(cfg.positionRight ?? 14);
    setPositionTop(cfg.positionTop ?? 0);
    setSwingSpeedSec(cfg.swingSpeedSec ?? 9.5);
    setEnablePhysicsAnimation(cfg.enablePhysicsAnimation ?? true);
  }, [hangingSneakerConfig]);

  // Handle Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const valResult = validateFileUpload(file);
    if (!valResult.valid) {
      setErrorMessage(valResult.error || 'Invalid file format or size');
      return;
    }

    setIsUploading(true);
    try {
      const optimizedUri = await optimizeImageFile(file, { maxWidth: 1024, maxHeight: 1024, quality: 0.88 });
      setImageUri(optimizedUri);
      setUseCustomImage(true);
    } catch (err: any) {
      setErrorMessage('Failed to process image: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveCustomImage = () => {
    setImageUri('');
    setUseCustomImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Reset to Built-in Signature Original Sneaker
  const handleResetToBuiltin = () => {
    setEnabled(true);
    setUseCustomImage(false);
    setImageUri('');
    setLaceLength(240);
    setSizePx(250);
    setPositionRight(14);
    setPositionTop(0);
    setSwingSpeedSec(9.5);
    setEnablePhysicsAnimation(true);
  };

  // Apply Presets
  const applyPreset = (preset: 'hero' | 'compact' | 'dramatic') => {
    if (preset === 'hero') {
      setLaceLength(260);
      setSizePx(260);
      setPositionRight(14);
      setPositionTop(0);
      setSwingSpeedSec(9.5);
    } else if (preset === 'compact') {
      setLaceLength(180);
      setSizePx(190);
      setPositionRight(8);
      setPositionTop(10);
      setSwingSpeedSec(7.5);
    } else if (preset === 'dramatic') {
      setLaceLength(320);
      setSizePx(280);
      setPositionRight(16);
      setPositionTop(0);
      setSwingSpeedSec(12);
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
      enablePhysicsAnimation,
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-neutral-900 to-neutral-950 text-white border border-emerald-500/30 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Hanging Signature Sneaker Manager
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Interactive
              </span>
            </h2>
            <p className="text-xs text-neutral-300 mt-0.5">
              Customize the hanging photorealistic sneaker position, swing physics, scale, and custom upload.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetToBuiltin}
          type="button"
          className="px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-xs font-medium text-neutral-200 border border-neutral-700 transition flex items-center gap-1.5 self-end sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reset Signature Defaults</span>
        </button>
      </div>

      {/* Save Notification Alerts */}
      {saveStatus === 'SUCCESS' && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-medium">
            Hanging sneaker configuration updated & synchronized across storefront!
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Enable Toggle */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-semibold flex items-center gap-2 text-neutral-900 dark:text-white">
                <Eye className="w-4 h-4 text-emerald-500" />
                Enable Hanging Sneaker
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Display hanging high-top sneaker overlay on desktop header.
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
                <Activity className="w-4 h-4 text-emerald-500" />
                Physics Pendulum Swing
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Enable multi-axis pendulum swing & interactive click-kick physics.
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
        </div>

        {/* Sneaker Source Selection: Built-In 3D Vector vs Custom Image */}
        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                Sneaker Graphic Source
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Choose between Marudhar's built-in photorealistic leather high-top sneaker or upload a custom brand sneaker photo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Option 1: Built-In Original Luxury High-Top */}
            <button
              type="button"
              onClick={() => {
                setUseCustomImage(false);
              }}
              className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3 ${
                !useCustomImage
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/30'
                  : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-[#0B8F63] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow">
                3D
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  Built-in Original Luxury High-Top
                  {!useCustomImage && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">
                  Photorealistic tumbled leather upper, light grey suede overlays, metallic gold aglets, and forest green accents.
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
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/30'
                  : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  Custom Uploaded Sneaker Image
                  {useCustomImage && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">
                  Upload a PNG/JPEG product image of your own original sneaker. Hanging suspension laces will automatically attach.
                </p>
              </div>
            </button>
          </div>

          {/* Upload Custom Image Panel */}
          {useCustomImage && (
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3 animate-fade-in mt-3">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-emerald-500" />
                Upload Custom High-Top Sneaker Photo
              </label>

              {imageUri ? (
                <div className="flex items-center gap-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <div className="w-20 h-20 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center overflow-hidden p-1 shadow-inner shrink-0">
                    <img src={imageUri} alt="Sneaker preview" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Image Loaded & Optimized
                    </p>
                    <p className="text-[11px] text-neutral-500">Transparent background PNG recommended for best results.</p>
                    <button
                      type="button"
                      onClick={handleRemoveCustomImage}
                      className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 pt-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove Custom Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors bg-neutral-50/50 dark:bg-neutral-900/30">
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
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      {isUploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      {isUploading ? 'Optimizing photo...' : 'Click to select sneaker photo'}
                    </span>
                    <span className="text-[11px] text-neutral-400">PNG, JPG or WebP (Max 5MB)</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dimension & Position Controls */}
        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                Dimensions, Laces & Position Tuning
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Adjust suspension lace length, shoe scale, and screen placement.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-neutral-400 hidden sm:inline">Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset('hero')}
                className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:border-emerald-500"
              >
                Hero Drop
              </button>
              <button
                type="button"
                onClick={() => applyPreset('compact')}
                className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:border-emerald-500"
              >
                Compact
              </button>
              <button
                type="button"
                onClick={() => applyPreset('dramatic')}
                className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:border-emerald-500"
              >
                Dramatic
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lace Length */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <label className="text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-emerald-500" />
                  Lace Suspension Length
                </label>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{laceLength}px</span>
              </div>
              <input
                type="range"
                min={120}
                max={380}
                step={5}
                value={laceLength}
                onChange={(e) => setLaceLength(Number(e.target.value))}
                className="w-full accent-[#0B8F63]"
              />
              <p className="text-[11px] text-neutral-400">Controls how far down the sneaker hangs from top navbar.</p>
            </div>

            {/* Sneaker Size / Scale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <label className="text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                  Sneaker Size / Scale
                </label>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{sizePx}px</span>
              </div>
              <input
                type="range"
                min={140}
                max={340}
                step={5}
                value={sizePx}
                onChange={(e) => setSizePx(Number(e.target.value))}
                className="w-full accent-[#0B8F63]"
              />
              <p className="text-[11px] text-neutral-400">Adjust overall rendering scale and width.</p>
            </div>

            {/* Position Right Offset */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <label className="text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-emerald-500" />
                  Right Offset (Rem)
                </label>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{positionRight}rem</span>
              </div>
              <input
                type="range"
                min={2}
                max={32}
                step={1}
                value={positionRight}
                onChange={(e) => setPositionRight(Number(e.target.value))}
                className="w-full accent-[#0B8F63]"
              />
              <p className="text-[11px] text-neutral-400">Horizontal distance from right edge of screen.</p>
            </div>

            {/* Swing Speed Duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <label className="text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  Pendulum Swing Speed
                </label>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{swingSpeedSec}s / cycle</span>
              </div>
              <input
                type="range"
                min={4}
                max={18}
                step={0.5}
                value={swingSpeedSec}
                onChange={(e) => setSwingSpeedSec(Number(e.target.value))}
                className="w-full accent-[#0B8F63]"
              />
              <p className="text-[11px] text-neutral-400">
                Slower seconds = smooth, heavy luxury swing. Faster = energetic movement.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Changes synchronize in real-time across client devices.</span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0B8F63] to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Sneaker Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
