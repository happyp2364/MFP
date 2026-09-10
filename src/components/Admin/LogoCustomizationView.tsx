import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Trash2,
  Save,
  Eye,
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  Maximize2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useLogoCustomization } from '../../context/LogoCustomizationContext';
import { DEFAULT_MARUDHAR_LOGO_SVG } from '../../constants/defaultLogo';
import { optimizeImageFile } from '../../utils/imageOptimizer';

export const LogoCustomizationView: React.FC = () => {
  const {
    logoConfig,
    draftLogoConfig,
    hasUnsavedChanges,
    updateDraftLogoConfig,
    saveLogoConfig,
    resetToDefaultLogo,
    removeLogo,
  } = useLogoCustomization();

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setErrorMessage('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    try {
      let dataUrl = '';
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        dataUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      } else {
        dataUrl = await optimizeImageFile(file, { maxWidth: 800, maxHeight: 800, quality: 0.9 });
      }

      if (dataUrl) {
        updateDraftLogoConfig({
          logoUrl: dataUrl,
          logoVisibility: true,
          logoType: draftLogoConfig.logoType === 'text' ? 'both' : draftLogoConfig.logoType,
        });
      }
    } catch (err) {
      console.error('Failed to process image upload:', err);
      setErrorMessage('Could not process image file. Please try a different image.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage('');
    try {
      await saveLogoConfig();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      setErrorMessage('Failed to save logo changes to database. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentLogoSrc = draftLogoConfig.logoUrl || DEFAULT_MARUDHAR_LOGO_SVG;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header & Overview */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 text-[#0B8F63] border border-emerald-200/60">
              <ImageIcon className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-serif-heading font-extrabold text-neutral-900">
              Logo Customization
            </h1>
            {hasUnsavedChanges && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-300">
                Unsaved Changes
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500">
            Customize, upload, resize, and manage your website header logo with real-time preview & fallback protection.
          </p>
        </div>

        {/* Global Save / Revert Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateDraftLogoConfig(logoConfig)}
            disabled={!hasUnsavedChanges || isSaving}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Revert</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0B8F63] hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-700/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving Changes...' : 'Save Logo'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#0B8F63] shrink-0" />
          <span>Logo customization saved successfully! Customer header is now updated live.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Upload & Sizing Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Logo File Upload & Quick Actions */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-neutral-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#0B8F63]" />
              <span>Logo Upload & Replacement</span>
            </h2>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#0B8F63] bg-emerald-50/50'
                  : 'border-neutral-300 hover:border-[#0B8F63] bg-neutral-50/50 hover:bg-neutral-100/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-100/80 text-[#0B8F63] flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-neutral-800">
                Click to upload or drag & drop new logo image
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                Supports PNG, JPG, WEBP, SVG (Max 5MB)
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Replace Image</span>
              </button>

              <button
                onClick={() => resetToDefaultLogo()}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-[#0B8F63] border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                title="Restore official Marudhar Fashion Point emblem"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Reset to Default Logo</span>
              </button>

              <button
                onClick={() => removeLogo()}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1.5 ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Image</span>
              </button>
            </div>
          </div>

          {/* Card 2: Display Mode & Visibility */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-neutral-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#0B8F63]" />
              <span>Display Mode & Layout</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'both', label: 'Image + Name', desc: 'Shows logo & text' },
                { id: 'image', label: 'Image Only', desc: 'Shows logo image' },
                { id: 'text', label: 'Text Only', desc: 'Shows brand name' },
                { id: 'icon', label: 'Emblem Only', desc: 'Shows icon badge' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => updateDraftLogoConfig({ logoType: mode.id as any })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    draftLogoConfig.logoType === mode.id
                      ? 'border-[#0B8F63] bg-emerald-50/80 text-[#0B8F63] font-bold shadow-xs'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <p className="text-xs font-extrabold">{mode.label}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{mode.desc}</p>
                </button>
              ))}
            </div>

            {/* Visibility Toggles */}
            <div className="space-y-3 pt-2 border-t border-neutral-100">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-neutral-800">Show Header Logo Image</span>
                  <p className="text-[11px] text-neutral-400">Display the graphical logo in website header</p>
                </div>
                <input
                  type="checkbox"
                  checked={draftLogoConfig.logoVisibility}
                  onChange={(e) => updateDraftLogoConfig({ logoVisibility: e.target.checked })}
                  className="w-4 h-4 accent-[#0B8F63] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-neutral-800">Show Brand Name Text Beside Logo</span>
                  <p className="text-[11px] text-neutral-400">Display 'Marudhar Fashion Point' text next to image</p>
                </div>
                <input
                  type="checkbox"
                  checked={draftLogoConfig.showBrandNameBesideLogo}
                  onChange={(e) => updateDraftLogoConfig({ showBrandNameBesideLogo: e.target.checked })}
                  className="w-4 h-4 accent-[#0B8F63] rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Card 3: Sizing & Dimension Controls */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-neutral-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0B8F63]" />
              <span>Logo Sizing & Scaling</span>
            </h2>

            {/* Desktop Logo Width */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Desktop Width</span>
                </span>
                <span className="text-xs font-extrabold text-[#0B8F63] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {draftLogoConfig.logoWidthDesktop}px
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={300}
                step={5}
                value={draftLogoConfig.logoWidthDesktop}
                onChange={(e) => updateDraftLogoConfig({ logoWidthDesktop: Number(e.target.value) })}
                className="w-full accent-[#0B8F63] cursor-pointer"
              />
            </div>

            {/* Mobile Logo Width */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Mobile Width</span>
                </span>
                <span className="text-xs font-extrabold text-[#0B8F63] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {draftLogoConfig.logoWidthMobile}px
                </span>
              </div>
              <input
                type="range"
                min={30}
                max={200}
                step={5}
                value={draftLogoConfig.logoWidthMobile}
                onChange={(e) => updateDraftLogoConfig({ logoWidthMobile: Number(e.target.value) })}
                className="w-full accent-[#0B8F63] cursor-pointer"
              />
            </div>

            {/* Object Fit Selection */}
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">Image Scaling Mode</span>
              <select
                value={draftLogoConfig.objectFit}
                onChange={(e) => updateDraftLogoConfig({ objectFit: e.target.value as any })}
                className="px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#0B8F63]"
              >
                <option value="contain">Contain (Preserve Aspect Ratio)</option>
                <option value="cover">Cover (Fill Container)</option>
                <option value="fill">Fill (Stretch)</option>
              </select>
            </div>
          </div>

          {/* Card 4: Brand Text Customization */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-neutral-900">Brand Name & Fallback Text</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Brand Header Title
                </label>
                <input
                  type="text"
                  value={draftLogoConfig.brandNameText}
                  onChange={(e) => updateDraftLogoConfig({ brandNameText: e.target.value })}
                  placeholder="Marudhar Fashion Point"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#0B8F63]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={draftLogoConfig.taglineText}
                  onChange={(e) => updateDraftLogoConfig({ taglineText: e.target.value })}
                  placeholder="Style for Every Step."
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#0B8F63]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Header Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card: Current Active Logo Raw Preview */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-neutral-900">Current Logo Asset</h2>
              <span className="text-[10px] text-neutral-400 uppercase font-bold">Transparent Grid</span>
            </div>

            {/* Transparency Preview Box */}
            <div className="w-full h-40 rounded-2xl border border-neutral-200 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px] bg-neutral-50 flex items-center justify-center p-4 relative overflow-hidden">
              <img
                src={currentLogoSrc}
                alt={draftLogoConfig.brandNameText}
                style={{
                  width: `${draftLogoConfig.logoWidthDesktop}px`,
                  maxHeight: '120px',
                  objectFit: draftLogoConfig.objectFit,
                }}
                className="transition-all duration-300 drop-shadow-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_MARUDHAR_LOGO_SVG;
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium px-1">
              <span>Width: {draftLogoConfig.logoWidthDesktop}px</span>
              <span>Type: {draftLogoConfig.logoUrl.startsWith('data:image/svg') ? 'SVG Emblem' : 'Uploaded Image'}</span>
            </div>
          </div>

          {/* Card: Interactive Website Header Live Preview */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-neutral-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#0B8F63]" />
                <span>Live Header Preview</span>
              </h2>

              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    previewMode === 'desktop'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    previewMode === 'mobile'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Mock Header Frame */}
            <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-sm bg-neutral-100">
              {/* Browser bar header */}
              <div className="bg-neutral-900 text-white px-3 py-1.5 flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-neutral-400 ml-1">marudharfashionpoint.com</span>
                </div>
                <span className="text-emerald-400 font-bold">Header Live Mock</span>
              </div>

              {/* Rendered Navbar Simulation */}
              <div className={`mx-auto bg-white transition-all duration-300 ${previewMode === 'mobile' ? 'max-w-[340px] border-x border-neutral-200' : 'w-full'}`}>
                <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between gap-3">
                  
                  {/* Navbar Brand Logo Block */}
                  <div className="flex items-center gap-2 min-w-0">
                    {draftLogoConfig.logoVisibility && (draftLogoConfig.logoType === 'both' || draftLogoConfig.logoType === 'image' || draftLogoConfig.logoType === 'icon') && (
                      <img
                        src={currentLogoSrc}
                        alt={draftLogoConfig.brandNameText}
                        style={{
                          width: previewMode === 'mobile' ? `${draftLogoConfig.logoWidthMobile}px` : `${draftLogoConfig.logoWidthDesktop}px`,
                          maxHeight: '42px',
                          objectFit: draftLogoConfig.objectFit,
                        }}
                        className="transition-all duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_MARUDHAR_LOGO_SVG;
                        }}
                      />
                    )}

                    {(draftLogoConfig.showBrandNameBesideLogo || draftLogoConfig.logoType === 'text') && (
                      <div className="min-w-0">
                        <span className="font-serif-heading font-black text-xs sm:text-sm text-neutral-900 block truncate">
                          {draftLogoConfig.brandNameText}
                        </span>
                        <span className="text-[9px] font-bold text-[#0B8F63] block truncate -mt-0.5">
                          {draftLogoConfig.taglineText}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Header Dummy Nav / Actions */}
                  {previewMode === 'desktop' ? (
                    <div className="flex items-center gap-4 text-xs font-bold text-neutral-600">
                      <span className="hover:text-[#0B8F63]">Home</span>
                      <span className="hover:text-[#0B8F63]">Footwear</span>
                      <span className="hover:text-[#0B8F63]">Collections</span>
                      <span className="px-3 py-1 rounded-xl bg-[#0B8F63] text-white text-xs font-extrabold">
                        Cart (0)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-lg bg-[#0B8F63] text-white text-[10px] font-extrabold">
                        Cart (0)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[#0B8F63]" />
                <span>Fallback Protection Active</span>
              </p>
              <p className="text-neutral-600 leading-relaxed">
                If custom logo image fails to load or becomes unreachable, system automatically falls back to the official Marudhar emblem or text title.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
