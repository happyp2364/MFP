import React, { useState } from 'react';
import { useWebsiteDesign } from '../../context/WebsiteDesignContext';
import { useAuth } from '../../context/AuthContext';
import {
  Paintbrush,
  RotateCcw,
  Save,
  Check,
  Layout,
  Sliders,
  Sparkles,
  Maximize2,
  Box,
  Square,
  SquareCheck,
  Smartphone,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { WebsiteDesignSettings } from '../../types/websiteDesign';

export const DesignCustomizerPanel: React.FC<{ showToast?: (msg: string, type: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const {
    websiteDesignSettings,
    draftDesignSettings,
    updateDraftDesignSettings,
    saveWebsiteDesignSettings,
    resetSectionDesign,
    resetAllDesign,
  } = useWebsiteDesign();

  const { currentAdminUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'header' | 'categories' | 'products' | 'buttons' | 'icons' | 'sections'>('header');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Helper to check if current draft differs from saved
  const hasUnsavedChanges = JSON.stringify(draftDesignSettings) !== JSON.stringify(websiteDesignSettings);

  const handleSliderChange = (
    section: keyof WebsiteDesignSettings,
    field: string,
    value: number
  ) => {
    const updated = {
      ...draftDesignSettings,
      [section]: {
        ...(draftDesignSettings[section] as any),
        [field]: value,
      },
    };
    updateDraftDesignSettings(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveWebsiteDesignSettings(draftDesignSettings, currentAdminUser?.email || 'Admin');
      setIsSaving(false);
      setSavedSuccess(true);
      if (showToast) showToast('Website design settings saved & applied live!', 'success');
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      setIsSaving(false);
      if (showToast) showToast('Failed to save design settings.', 'error');
    }
  };

  const handleResetSection = (section: keyof WebsiteDesignSettings) => {
    resetSectionDesign(section);
    if (showToast) showToast(`Reset ${section} settings to defaults.`, 'info');
  };

  const handleResetAll = async () => {
    if (window.confirm('Are you sure you want to reset ALL design settings to default values?')) {
      await resetAllDesign(currentAdminUser?.email || 'Admin');
      if (showToast) showToast('All design settings reset to default!', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <Paintbrush className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-amber-100 font-serif-heading">
                Website Design Customizer & Tokens
              </h2>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Adjust header dimensions, card radii, button scales, and section spacing live across desktop and mobile.
              </p>
            </div>
          </div>

          {/* Global Action Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleResetAll}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
                savedSuccess
                  ? 'bg-emerald-500 text-white'
                  : hasUnsavedChanges
                  ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-amber-400/20 active:scale-95'
                  : 'bg-white/20 text-white/60 cursor-not-allowed'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved Live!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Design' : 'Up to Date'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {hasUnsavedChanges && (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>You have unsaved design changes. Changes are reflected in live preview locally. Click <strong>Save Design</strong> to apply permanently.</span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-neutral-200/80 pb-2">
        <button
          onClick={() => setActiveTab('header')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'header'
              ? 'bg-amber-900 text-white shadow-md'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Header Layout</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'bg-amber-900 text-white shadow-md'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Category Cards</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-amber-900 text-white shadow-md'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          <Square className="w-4 h-4" />
          <span>Product Cards</span>
        </button>

        <button
          onClick={() => setActiveTab('buttons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'buttons'
              ? 'bg-amber-900 text-white shadow-md'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          <SquareCheck className="w-4 h-4" />
          <span>Buttons & Controls</span>
        </button>

        <button
          onClick={() => setActiveTab('icons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'icons'
              ? 'bg-amber-900 text-white shadow-md'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Icons & Sizes</span>
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'sections'
              ? 'bg-amber-900 text-white shadow-md'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          <Maximize2 className="w-4 h-4" />
          <span>Section Spacing</span>
        </button>
      </div>

      {/* Main Form Body */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm space-y-6">
        
        {/* TAB 1: HEADER */}
        {activeTab === 'header' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Header Dimensions & Spacing</h3>
                <p className="text-xs text-neutral-500">Fine-tune header height, padding, logo dimensions, and nav gaps.</p>
              </div>
              <button
                onClick={() => handleResetSection('header')}
                className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Header</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Header Height */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Header Height</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.header.height}px
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  step="2"
                  value={draftDesignSettings.header.height}
                  onChange={(e) => handleSliderChange('header', 'height', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
                <p className="text-[11px] text-neutral-500">Compact top navigation bar height on desktop & mobile.</p>
              </div>

              {/* Header Vertical Padding */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Vertical Padding (Top/Bottom)</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.header.verticalPadding}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={draftDesignSettings.header.verticalPadding}
                  onChange={(e) => handleSliderChange('header', 'verticalPadding', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
                <p className="text-[11px] text-neutral-500">Controls empty space above and below header elements.</p>
              </div>

              {/* Logo Width */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Logo Icon Width</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.header.logoWidth}px
                  </span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="80"
                  step="2"
                  value={draftDesignSettings.header.logoWidth}
                  onChange={(e) => handleSliderChange('header', 'logoWidth', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>

              {/* Logo Height */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Logo Icon Height</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.header.logoHeight}px
                  </span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="80"
                  step="2"
                  value={draftDesignSettings.header.logoHeight}
                  onChange={(e) => handleSliderChange('header', 'logoHeight', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>

              {/* Navigation Gap */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Navigation Link Gap</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.header.navGap}px
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="60"
                  step="2"
                  value={draftDesignSettings.header.navGap}
                  onChange={(e) => handleSliderChange('header', 'navGap', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>

              {/* Header Icon Size */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Header Utilities Icon Size</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.header.iconSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="36"
                  step="1"
                  value={draftDesignSettings.header.iconSize}
                  onChange={(e) => handleSliderChange('header', 'iconSize', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>

              {/* WhatsApp Button Height */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Header WhatsApp Button Height</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.header.buttonHeight}px
                  </span>
                </div>
                <input
                  type="range"
                  min="28"
                  max="60"
                  step="2"
                  value={draftDesignSettings.header.buttonHeight}
                  onChange={(e) => handleSliderChange('header', 'buttonHeight', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>

              {/* WhatsApp Button Radius */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Header WhatsApp Button Radius</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.header.buttonRadius}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={draftDesignSettings.header.buttonRadius}
                  onChange={(e) => handleSliderChange('header', 'buttonRadius', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORY CARDS */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Category & Collection Cards</h3>
                <p className="text-xs text-neutral-500">Customize corner radius and padding for green-accented collection cards.</p>
              </div>
              <button
                onClick={() => handleResetSection('categoryCards')}
                className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Categories</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Card Border Radius */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Card Corner Radius</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.categoryCards.borderRadius}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="2"
                  value={draftDesignSettings.categoryCards.borderRadius}
                  onChange={(e) => handleSliderChange('categoryCards', 'borderRadius', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
                <p className="text-[11px] text-neutral-500">Sets the rounded corner curvature for all category & collection cards.</p>
              </div>

              {/* Category Cards Gap */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Category Grid Gap</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.categoryCards.gap}px
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="48"
                  step="2"
                  value={draftDesignSettings.categoryCards.gap}
                  onChange={(e) => handleSliderChange('categoryCards', 'gap', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCT CARDS */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Product Cards Styling</h3>
                <p className="text-xs text-neutral-500">Configure product card corner radius, image box radius, and internal padding.</p>
              </div>
              <button
                onClick={() => handleResetSection('productCards')}
                className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Product Cards</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Card Radius */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Product Card Corner Radius</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.productCards.borderRadius}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="36"
                  step="2"
                  value={draftDesignSettings.productCards.borderRadius}
                  onChange={(e) => handleSliderChange('productCards', 'borderRadius', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>

              {/* Product Image Radius */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Inner Product Image Radius</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.productCards.imageRadius}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="32"
                  step="2"
                  value={draftDesignSettings.productCards.imageRadius}
                  onChange={(e) => handleSliderChange('productCards', 'imageRadius', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>

              {/* Product Card Padding */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Product Card Padding</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.productCards.padding}px
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="32"
                  step="2"
                  value={draftDesignSettings.productCards.padding}
                  onChange={(e) => handleSliderChange('productCards', 'padding', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>

              {/* Product Grid Gap */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Product Grid Gap</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.productCards.gap}px
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="48"
                  step="2"
                  value={draftDesignSettings.productCards.gap}
                  onChange={(e) => handleSliderChange('productCards', 'gap', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BUTTONS */}
        {activeTab === 'buttons' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Button Tokens & Radii</h3>
                <p className="text-xs text-neutral-500">Control global button corner radii, height, and padding across the app.</p>
              </div>
              <button
                onClick={() => handleResetSection('buttons')}
                className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Buttons</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Button Border Radius */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Button Corner Radius</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.buttons.borderRadius}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="36"
                  step="2"
                  value={draftDesignSettings.buttons.borderRadius}
                  onChange={(e) => handleSliderChange('buttons', 'borderRadius', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>

              {/* Button Height */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Button Height</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.buttons.height}px
                  </span>
                </div>
                <input
                  type="range"
                  min="28"
                  max="64"
                  step="2"
                  value={draftDesignSettings.buttons.height}
                  onChange={(e) => handleSliderChange('buttons', 'height', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>

              {/* Button Horizontal Padding */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Horizontal Button Padding</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.buttons.horizontalPadding}px
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="48"
                  step="2"
                  value={draftDesignSettings.buttons.horizontalPadding}
                  onChange={(e) => handleSliderChange('buttons', 'horizontalPadding', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ICONS */}
        {activeTab === 'icons' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Icon Sizing Tokens</h3>
                <p className="text-xs text-neutral-500">Adjust icon scale for header, products, categories, and floating actions.</p>
              </div>
              <button
                onClick={() => handleResetSection('icons')}
                className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Icons</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Header Icons */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Header Icon Size</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.icons.headerSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="32"
                  step="1"
                  value={draftDesignSettings.icons.headerSize}
                  onChange={(e) => handleSliderChange('icons', 'headerSize', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>

              {/* Product Icons */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Product Card Icon Size</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-[#0B8F63]/10 text-[#0B8F63] px-2 py-0.5 rounded">
                    {draftDesignSettings.icons.productSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="28"
                  step="1"
                  value={draftDesignSettings.icons.productSize}
                  onChange={(e) => handleSliderChange('icons', 'productSize', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>

              {/* Floating Action Icons */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Floating Button Icon Size</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.icons.floatingActionSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="36"
                  step="1"
                  value={draftDesignSettings.icons.floatingActionSize}
                  onChange={(e) => handleSliderChange('icons', 'floatingActionSize', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SECTION SPACING */}
        {activeTab === 'sections' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Global Section & Content Spacing</h3>
                <p className="text-xs text-neutral-500">Control vertical padding between homepage sections and content margins.</p>
              </div>
              <button
                onClick={() => handleResetSection('sections')}
                className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Spacing</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Spacing */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Section Top Spacing</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.sections.topSpacing}px
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="96"
                  step="4"
                  value={draftDesignSettings.sections.topSpacing}
                  onChange={(e) => handleSliderChange('sections', 'topSpacing', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>

              {/* Bottom Spacing */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Section Bottom Spacing</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.sections.bottomSpacing}px
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="96"
                  step="4"
                  value={draftDesignSettings.sections.bottomSpacing}
                  onChange={(e) => handleSliderChange('sections', 'bottomSpacing', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>

              {/* Content Padding */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-800">Container Side Padding</label>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {draftDesignSettings.sections.contentPadding}px
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="48"
                  step="2"
                  value={draftDesignSettings.sections.contentPadding}
                  onChange={(e) => handleSliderChange('sections', 'contentPadding', Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
