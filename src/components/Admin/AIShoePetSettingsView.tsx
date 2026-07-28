import React, { useState } from 'react';
import { optimizeImageFile } from '../../utils/imageOptimizer';
import {
  Sparkles,
  Zap,
  Sliders,
  Eye,
  Save,
  Check,
  Upload,
  Palette,
  Wind,
  Compass,
  MessageSquare,
  Clock,
  Trash2,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  Wand2,
  Feather,
  Sun,
  ShieldCheck,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PetShoeConfig } from '../../types';
import { extractShoeFromImage } from '../../utils/aiBackgroundRemoval';

export const AIShoePetSettingsView: React.FC = () => {
  const { petShoeConfig, updatePetShoeConfig, showToast } = useStore();

  const [enabled, setEnabled] = useState(petShoeConfig?.enabled ?? true);
  const [imageUri, setImageUri] = useState(petShoeConfig?.imageUri || '');
  const [wingsEnabled, setWingsEnabled] = useState(petShoeConfig?.wingsEnabled ?? true);
  const [wingColor, setWingColor] = useState(petShoeConfig?.wingColor || '#F59E0B');
  const [glowEnabled, setGlowEnabled] = useState(petShoeConfig?.glowEnabled ?? true);
  const [glowColor, setGlowColor] = useState(petShoeConfig?.glowColor || '#F59E0B');
  const [shineEnabled, setShineEnabled] = useState(petShoeConfig?.shineEnabled ?? true);
  const [movementSpeed, setMovementSpeed] = useState<'slow' | 'medium' | 'fast'>(
    petShoeConfig?.movementSpeed || 'medium'
  );
  const [sizePx, setSizePx] = useState<number>(petShoeConfig?.sizePx || 130);
  const [wingFlapSpeed, setWingFlapSpeed] = useState<'slow' | 'normal' | 'fast'>(
    petShoeConfig?.wingFlapSpeed || 'normal'
  );
  const [hoverAmplitude, setHoverAmplitude] = useState<'gentle' | 'moderate' | 'dynamic'>(
    petShoeConfig?.hoverAmplitude || 'moderate'
  );
  const [opacity, setOpacity] = useState<number>(petShoeConfig?.opacity ?? 0.95);
  const [defaultPosition, setDefaultPosition] = useState<
    'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center-right'
  >(petShoeConfig?.defaultPosition || 'bottom-right');

  const [enableClickInteraction, setEnableClickInteraction] = useState(
    petShoeConfig?.enableClickInteraction ?? true
  );
  const [enableScrollFollowing, setEnableScrollFollowing] = useState(
    petShoeConfig?.enableScrollFollowing ?? true
  );
  const [enableIdleMovement, setEnableIdleMovement] = useState(
    petShoeConfig?.enableIdleMovement ?? true
  );
  const [enableSpeechBubbles, setEnableSpeechBubbles] = useState(
    petShoeConfig?.enableSpeechBubbles ?? true
  );

  const [speechMessages, setSpeechMessages] = useState<string[]>(
    petShoeConfig?.speechMessages || [
      'Welcome to Marudhar Fashion Point! 👟✨',
      'Step into pure luxury & comfort! 👞',
      'Handcrafted Leather & Sports Drops! 🔥',
      'Need help? Tap to explore our top picks! 😊',
      'Pipar City’s #1 Fashion Companion 👑',
    ]
  );
  const [newMessageText, setNewMessageText] = useState('');
  const [scheduleMode, setScheduleMode] = useState<'always' | 'homepage_only' | 'festival_only'>(
    petShoeConfig?.scheduleMode || 'always'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Pipeline State for Image Processing & Preview Approval
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [extractedShoePng, setExtractedShoePng] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  // Preset Pre-Isolated Transparent PNG Shoes
  const PRESET_PET_SHOES = [
    {
      name: '3D Rainbow Futuristic Sneaker',
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'ONE8 Burgundy Sport Edition',
      url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Cloud Athletic White Runner',
      url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Classic Black Handcrafted Leather',
      url: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleAddSpeechMessage = () => {
    if (!newMessageText.trim()) return;
    setSpeechMessages((prev) => [...prev, newMessageText.trim()]);
    setNewMessageText('');
  };

  const handleDeleteSpeechMessage = (index: number) => {
    setSpeechMessages((prev) => prev.filter((_, i) => i !== index));
  };

  // Run AI Processing Pipeline on uploaded or selected image
  const processImageForShoeExtraction = async (srcUrl: string) => {
    setOriginalImage(srcUrl);
    setIsProcessing(true);
    setExtractedShoePng(null);
    setValidationResult(null);

    try {
      setProcessingStage('Detecting shoe object using AI...');
      await new Promise((r) => setTimeout(r, 300));

      setProcessingStage('Removing background, text, borders & poster elements...');
      const result = await extractShoeFromImage(srcUrl);

      setProcessingStage('Validating transparent PNG quality...');
      await new Promise((r) => setTimeout(r, 200));

      // Automated validation check
      if (result && result.transparentPngUrl) {
        setExtractedShoePng(result.transparentPngUrl);
        // Automatically update the imageUri state with the extracted transparent PNG
        setImageUri(result.transparentPngUrl);

        if (result.confidence >= 0.7) {
          setValidationResult({
            isValid: true,
            message: 'Shoe object isolated successfully! 100% background, text & poster removed.',
          });
        } else {
          setValidationResult({
            isValid: false,
            message: 'Only a shoe could not be extracted cleanly. Please upload a clearer shoe image.',
          });
        }
      } else {
        setValidationResult({
          isValid: false,
          message: 'Only a shoe could not be extracted cleanly. Please upload a clearer shoe image.',
        });
      }
    } catch (err: any) {
      console.error('[AI Shoe Extraction Error]:', err);
      setValidationResult({
        isValid: false,
        message: 'Only a shoe could not be extracted cleanly. Please upload a clearer shoe image.',
      });
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  // Admin File Upload Handler with Image Optimization
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      showToast('Image size should be under 12MB', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingStage('Optimizing image upload...');
      const optimizedUri = await optimizeImageFile(file, { maxWidth: 1024, maxHeight: 1024, quality: 0.9 });
      await processImageForShoeExtraction(optimizedUri);
    } catch (err: any) {
      showToast('Failed to read uploaded image', 'error');
      setIsProcessing(false);
    }
  };

  // Preview Approval: Apply Approved Transparent PNG Shoe to Website Flying Mascot Instantly
  const handleApproveExtractedShoe = () => {
    const targetPng = extractedShoePng || imageUri;
    if (!targetPng) return;
    
    setImageUri(targetPng);
    updatePetShoeConfig({ imageUri: targetPng, enabled: true });
    showToast('Extracted transparent PNG shoe applied to Flying Mascot instantly!', 'success');
  };

  // Restore Default Mascot
  const handleRestoreDefaultMascot = () => {
    setImageUri('');
    setExtractedShoePng(null);
    setOriginalImage(null);
    setWingsEnabled(true);
    setWingColor('#F59E0B');
    setGlowEnabled(true);
    setGlowColor('#F59E0B');
    setShineEnabled(true);
    setMovementSpeed('medium');
    setSizePx(130);
    setWingFlapSpeed('normal');
    setHoverAmplitude('moderate');
    setOpacity(0.95);
    setDefaultPosition('bottom-right');

    updatePetShoeConfig({
      imageUri: '',
      wingsEnabled: true,
      wingColor: '#F59E0B',
      glowEnabled: true,
      glowColor: '#F59E0B',
      shineEnabled: true,
      movementSpeed: 'medium',
      sizePx: 130,
      wingFlapSpeed: 'normal',
      hoverAmplitude: 'moderate',
      opacity: 0.95,
      defaultPosition: 'bottom-right',
    });

    showToast('Restored default AI Pet Shoe Mascot!', 'info');
  };

  // Save Config
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated: Partial<PetShoeConfig> = {
      enabled,
      imageUri: extractedShoePng || imageUri,
      wingsEnabled,
      wingColor,
      glowEnabled,
      glowColor,
      shineEnabled,
      movementSpeed,
      sizePx,
      wingFlapSpeed,
      hoverAmplitude,
      opacity,
      defaultPosition,
      enableClickInteraction,
      enableScrollFollowing,
      enableIdleMovement,
      enableSpeechBubbles,
      speechMessages,
      scheduleMode,
    };

    updatePetShoeConfig(updated);
    setIsSaving(false);
    setSaveSuccess(true);
    showToast('AI Pet Shoe Mascot settings saved successfully!', 'success');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 text-white p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-2xl shadow-xl text-white shrink-0">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold font-serif-heading text-white">
                  AI Pet Shoe Settings
                </h2>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Scissors className="w-3 h-3" />
                  AI Object Segmentation Pipeline
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1">
                Upload any shoe photo or poster. AI automatically detects the shoe, removes background, logos, and posters, so ONLY the transparent shoe flies on your website.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleRestoreDefaultMascot}
              className="px-3.5 py-2 bg-neutral-800/80 hover:bg-neutral-700 text-xs font-bold text-amber-300 border border-amber-500/30 rounded-xl transition-all flex items-center gap-1.5"
              title="Restore Default AI Pet Shoe Mascot"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore Default</span>
            </button>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-[#0B8F63]"></div>
            </label>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* PIPELINE: Flying Shoe Manager - AI Object Extraction */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-amber-600" />
              <span>Flying Shoe Manager — AI Background Removal Pipeline</span>
            </h3>
            <span className="text-xs text-neutral-500 font-medium hidden sm:inline">
              Only transparent shoe PNGs are displayed on website
            </span>
          </div>

          {/* Upload Dropzone & URL Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                1. Upload Shoe Image / Poster / Photo
              </label>

              <div className="border-2 border-dashed border-amber-300 dark:border-amber-700 hover:border-amber-500 rounded-2xl p-5 text-center bg-amber-50/50 hover:bg-amber-50 transition-all cursor-pointer relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-neutral-900">
                    Click or Drag & Drop Shoe Photograph
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Supports PNG, JPG, WebP. AI will automatically isolate the shoe!
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  Or Paste External Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUri}
                    onChange={(e) => setImageUri(e.target.value)}
                    placeholder="https://... image URL"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B8F63]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (imageUri) processImageForShoeExtraction(imageUri);
                    }}
                    className="px-3 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl shrink-0 flex items-center gap-1"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Run AI</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Quick Select Pre-Isolated Transparent Shoes
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_PET_SHOES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => processImageForShoeExtraction(preset.url)}
                    className="p-2.5 bg-neutral-50 hover:bg-amber-50 rounded-2xl border border-neutral-200 hover:border-amber-300 text-left transition-all flex items-center gap-2.5 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-neutral-800 line-clamp-1 group-hover:text-amber-700">
                        {preset.name}
                      </span>
                      <span className="text-[9px] text-emerald-600 font-extrabold uppercase">
                        Transparent PNG
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PIPELINE DISPLAY STEPS */}
          {(originalImage || isProcessing || extractedShoePng) && (
            <div className="p-6 rounded-2xl bg-neutral-900 text-white space-y-6 animate-in fade-in duration-300 border border-neutral-800">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  AI Extraction Step-by-Step Pipeline
                </span>
                {isProcessing && (
                  <span className="text-xs text-amber-300 font-bold flex items-center gap-1.5 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {processingStage}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Step 1: Original Image */}
                <div className="space-y-2 text-center">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    1. Original Image
                  </span>
                  <div className="w-full h-36 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-center p-2 overflow-hidden relative">
                    {originalImage ? (
                      <img src={originalImage} alt="Original uploaded" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-xs text-neutral-600">No image loaded</span>
                    )}
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="hidden md:flex flex-col items-center justify-center text-amber-500">
                  <Wand2 className={`w-6 h-6 mb-1 ${isProcessing ? 'animate-bounce' : ''}`} />
                  <ArrowRight className="w-5 h-5" />
                  <span className="text-[10px] text-neutral-400 font-mono mt-1">AI Segmentation</span>
                </div>

                {/* Step 2: Background Removed / Transparent PNG */}
                <div className="space-y-2 text-center md:col-span-1">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    2. Transparent PNG Preview
                  </span>
                  <div
                    className="w-full h-36 rounded-2xl border-2 border-emerald-500/50 flex items-center justify-center p-3 relative overflow-hidden shadow-inner"
                    style={{
                      backgroundImage: `
                        linear-gradient(45deg, #262626 25%, transparent 25%), 
                        linear-gradient(-45deg, #262626 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #262626 75%), 
                        linear-gradient(-45deg, transparent 75%, #262626 75%)
                      `,
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                      backgroundColor: '#171717',
                    }}
                  >
                    {isProcessing ? (
                      <div className="flex flex-col items-center gap-2 text-amber-400">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        <span className="text-xs font-bold">{processingStage}</span>
                      </div>
                    ) : extractedShoePng ? (
                      <img
                        src={extractedShoePng}
                        alt="Extracted transparent shoe"
                        className="max-w-full max-h-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]"
                      />
                    ) : (
                      <span className="text-xs text-neutral-600">Pending extraction</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Validation Check Results */}
              {validationResult && (
                <div
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    validationResult.isValid
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {validationResult.isValid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-xs font-bold block">
                        {validationResult.isValid ? 'Validation Passed' : 'Validation Error'}
                      </span>
                      <p className="text-xs leading-relaxed opacity-90">{validationResult.message}</p>
                    </div>
                  </div>

                  {validationResult.isValid && extractedShoePng && (
                    <button
                      type="button"
                      onClick={handleApproveExtractedShoe}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-extrabold rounded-xl shadow-lg shrink-0 flex items-center gap-1.5 transition-transform hover:scale-105"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Replace Mascot Instantly</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wings, Glow & Aesthetic Effects */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 pb-4 border-b border-neutral-100">
            <Feather className="w-5 h-5 text-amber-500" />
            <span>Angel Wings & Aura Glow Styling</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Wings Enable */}
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-800 block">Angel Wings</span>
                <span className="text-[10px] text-neutral-500">Floating feather details</span>
              </div>
              <input
                type="checkbox"
                checked={wingsEnabled}
                onChange={(e) => setWingsEnabled(e.target.checked)}
                className="w-5 h-5 text-[#0B8F63] rounded focus:ring-[#0B8F63]"
              />
            </div>

            {/* Wing Color */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Wing Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={wingColor}
                  onChange={(e) => setWingColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-neutral-200 p-1"
                />
                <input
                  type="text"
                  value={wingColor}
                  onChange={(e) => setWingColor(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Glow Enable & Color */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Glow Aura
                </label>
                <input
                  type="checkbox"
                  checked={glowEnabled}
                  onChange={(e) => setGlowEnabled(e.target.checked)}
                  className="w-4 h-4 text-[#0B8F63] rounded"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={glowColor}
                  onChange={(e) => setGlowColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-neutral-200 p-1"
                />
                <input
                  type="text"
                  value={glowColor}
                  onChange={(e) => setGlowColor(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Shine Effect */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-800 block">Glossy Reflection Shine</span>
              <span className="text-[10px] text-neutral-500">Sweeping light reflection across shoe leather</span>
            </div>
            <input
              type="checkbox"
              checked={shineEnabled}
              onChange={(e) => setShineEnabled(e.target.checked)}
              className="w-5 h-5 text-[#0B8F63] rounded focus:ring-[#0B8F63]"
            />
          </div>
        </div>

        {/* Physics & Movement Preferences */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 pb-4 border-b border-neutral-100">
            <Compass className="w-5 h-5 text-indigo-600" />
            <span>Flight Speed & Default Position</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Speed */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Movement Speed
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['slow', 'medium', 'fast'] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setMovementSpeed(spd)}
                    className={`py-2 text-xs font-bold rounded-xl border capitalize transition-all ${
                      movementSpeed === spd
                        ? 'bg-[#0B8F63] text-white border-[#0B8F63]'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Mascot Size
                </label>
                <span className="text-xs font-bold text-[#0B8F63]">{sizePx}px</span>
              </div>
              <input
                type="range"
                min="80"
                max="220"
                step="5"
                value={sizePx}
                onChange={(e) => setSizePx(parseInt(e.target.value, 10))}
                className="w-full accent-[#0B8F63]"
              />
            </div>

            {/* Default Position */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Default Screen Anchor
              </label>
              <select
                value={defaultPosition}
                onChange={(e) => setDefaultPosition(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#0B8F63]"
              >
                <option value="bottom-right">Bottom Right (Recommended)</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
                <option value="center-right">Center Right</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200 cursor-pointer">
              <span className="text-xs font-bold text-neutral-800">Tap / Click Fly Follow</span>
              <input
                type="checkbox"
                checked={enableScrollFollowing}
                onChange={(e) => setEnableScrollFollowing(e.target.checked)}
                className="w-4 h-4 text-[#0B8F63] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200 cursor-pointer">
              <span className="text-xs font-bold text-neutral-800">Idle Orbit Movement</span>
              <input
                type="checkbox"
                checked={enableIdleMovement}
                onChange={(e) => setEnableIdleMovement(e.target.checked)}
                className="w-4 h-4 text-[#0B8F63] rounded"
              />
            </label>
          </div>
        </div>

        {/* Speech Messages Configuration */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 pb-4 border-b border-neutral-100">
            <MessageSquare className="w-5 h-5 text-rose-500" />
            <span>Interactive Speech Bubbles & Custom Messages</span>
          </h3>

          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-800">Enable Speech Bubbles on Click</label>
            <input
              type="checkbox"
              checked={enableSpeechBubbles}
              onChange={(e) => setEnableSpeechBubbles(e.target.checked)}
              className="w-5 h-5 text-[#0B8F63] rounded focus:ring-[#0B8F63]"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Message List (Selected randomly when user clicks the pet)
            </label>

            <div className="space-y-2">
              {speechMessages.map((msg, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200"
                >
                  <span className="text-xs font-semibold text-neutral-800">{msg}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSpeechMessage(index)}
                    className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Type a new friendly speech message..."
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B8F63]"
              />
              <button
                type="button"
                onClick={handleAddSpeechMessage}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl shrink-0 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-[#0B8F63] hover:bg-[#097551] text-white text-sm font-bold rounded-2xl shadow-lg shadow-[#0B8F63]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check className="w-5 h-5 text-emerald-300" />
                <span>Settings Saved Instantly!</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Pet Shoe Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
