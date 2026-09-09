import React, { useState, useMemo } from 'react';
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
  Undo,
  Redo,
} from 'lucide-react';
import { WebsiteDesignSettings, ResponsiveDevice } from '../../types/websiteDesign';
import { calculateDesignDiffs, DesignDiffItem } from '../../utils/designDiffUtils';
import { PreviewToolbar, PreviewMode } from './Preview/PreviewToolbar';
import { LiveWebsitePreviewCanvas } from './Preview/LiveWebsitePreviewCanvas';
import { ChangeListDrawer } from './Preview/ChangeListDrawer';

export const DesignCustomizerPanel: React.FC<{ showToast?: (msg: string, type: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const {
    websiteDesignSettings,
    draftDesignSettings,
    updateDraftDesignSettings,
    saveWebsiteDesignSettings,
    resetSectionDesign,
    resetAllDesign,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useWebsiteDesign();

  const { currentAdminUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'header' | 'categories' | 'products' | 'buttons' | 'icons' | 'sections'>('header');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live Preview System States
  const [selectedDevice, setSelectedDevice] = useState<ResponsiveDevice>('desktop');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('live');
  const [showAffectedArea, setShowAffectedArea] = useState<boolean>(true);
  const [isDiffDrawerOpen, setIsDiffDrawerOpen] = useState<boolean>(false);
  const [selectedDiff, setSelectedDiff] = useState<DesignDiffItem | null>(null);

  // Helper to check if current draft differs from saved
  const hasUnsavedChanges = JSON.stringify(draftDesignSettings) !== JSON.stringify(websiteDesignSettings);

  // Dynamic Diffs calculation
  const diffs = useMemo(() => {
    return calculateDesignDiffs(websiteDesignSettings, draftDesignSettings, selectedDevice);
  }, [websiteDesignSettings, draftDesignSettings, selectedDevice]);

  // Target area mapping for active tab
  const tabAreaMapping: Record<string, string> = {
    header: 'header',
    categories: 'category-card',
    products: 'product-card',
    buttons: 'button',
    icons: 'icon',
    sections: 'section-spacing',
  };

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

    // Auto set active diff for prompt information panel if available
    const keyPath = `${section}.${field}`;
    const matched = diffs.find((d) => d.keyPath === keyPath);
    if (matched) setSelectedDiff(matched);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveWebsiteDesignSettings(draftDesignSettings, currentAdminUser?.email || 'Admin');
      setIsSaving(false);
      setSavedSuccess(true);
      setSelectedDiff(null);
      setIsDiffDrawerOpen(false);
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
      setSelectedDiff(null);
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
                Website Design Customizer & Live Preview
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
            <span>You have {diffs.length} unsaved design changes in draft. Click <strong>Save Design</strong> to apply permanently.</span>
          </div>
        )}
      </div>

      {/* PROMINENT LIVE PREVIEW TOOLBAR */}
      <PreviewToolbar
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        selectedDevice={selectedDevice}
        setSelectedDevice={setSelectedDevice}
        showAffectedArea={showAffectedArea}
        setShowAffectedArea={setShowAffectedArea}
        diffCount={diffs.length}
        onOpenDiffDrawer={() => setIsDiffDrawerOpen(true)}
        hasUnsavedChanges={hasUnsavedChanges}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReset={handleResetAll}
        onSave={handleSave}
        isSaving={isSaving}
      />

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

      {/* SPLIT LAYOUT: LEFT SLIDER CONTROLS + RIGHT LIVE PREVIEW CANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Customizer Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm space-y-6">
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
                  <span>Reset</span>
                </button>
              </div>

              <div className="space-y-4">
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

                {/* Button Radius */}
                <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-neutral-800">Header Button Corner Radius</label>
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {draftDesignSettings.header.buttonRadius}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="36"
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
                  <h3 className="text-base font-bold text-neutral-900">Category Card Styling</h3>
                  <p className="text-xs text-neutral-500">Configure corner radii, card height, and grid spacing.</p>
                </div>
                <button
                  onClick={() => handleResetSection('categoryCards')}
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Border Radius */}
                <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-neutral-800">Border Radius</label>
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {draftDesignSettings.categoryCards.borderRadius}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="48"
                    step="2"
                    value={draftDesignSettings.categoryCards.borderRadius}
                    onChange={(e) => handleSliderChange('categoryCards', 'borderRadius', Number(e.target.value))}
                    className="w-full accent-amber-800 cursor-pointer"
                  />
                </div>

                {/* Card Height */}
                <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-neutral-800">Card Height</label>
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {draftDesignSettings.categoryCards.height}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="140"
                    max="400"
                    step="10"
                    value={draftDesignSettings.categoryCards.height}
                    onChange={(e) => handleSliderChange('categoryCards', 'height', Number(e.target.value))}
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
                  <p className="text-xs text-neutral-500">Corner rounding for product card containers and images.</p>
                </div>
                <button
                  onClick={() => handleResetSection('productCards')}
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Border Radius */}
                <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-neutral-800">Card Border Radius</label>
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {draftDesignSettings.productCards.borderRadius}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="2"
                    value={draftDesignSettings.productCards.borderRadius}
                    onChange={(e) => handleSliderChange('productCards', 'borderRadius', Number(e.target.value))}
                    className="w-full accent-amber-800 cursor-pointer"
                  />
                </div>

                {/* Image Radius */}
                <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-neutral-800">Product Image Radius</label>
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {draftDesignSettings.productCards.imageRadius}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="36"
                    step="2"
                    value={draftDesignSettings.productCards.imageRadius}
                    onChange={(e) => handleSliderChange('productCards', 'imageRadius', Number(e.target.value))}
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
                  <h3 className="text-base font-bold text-neutral-900">Button Corner Radius & Dimensions</h3>
                  <p className="text-xs text-neutral-500">Pill shape vs square buttons across store.</p>
                </div>
                <button
                  onClick={() => handleResetSection('buttons')}
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Button Radius */}
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
                    min="32"
                    max="64"
                    step="2"
                    value={draftDesignSettings.buttons.height}
                    onChange={(e) => handleSliderChange('buttons', 'height', Number(e.target.value))}
                    className="w-full accent-amber-800 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ICONS & FLOATING */}
          {activeTab === 'icons' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Icons & Floating Actions</h3>
                  <p className="text-xs text-neutral-500">Size scale for icons and WhatsApp floating hub.</p>
                </div>
                <button
                  onClick={() => handleResetSection('icons')}
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Floating Size */}
                <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-neutral-800">WhatsApp Hub Size</label>
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {draftDesignSettings.floatingActions.size}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="36"
                    max="72"
                    step="2"
                    value={draftDesignSettings.floatingActions.size}
                    onChange={(e) => handleSliderChange('floatingActions', 'size', Number(e.target.value))}
                    className="w-full accent-amber-800 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SECTIONS */}
          {activeTab === 'sections' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Global Section & Grid Spacing</h3>
                  <p className="text-xs text-neutral-500">Vertical padding and grid gap between product cards.</p>
                </div>
                <button
                  onClick={() => handleResetSection('sections')}
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="space-y-4">
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

                {/* Grid Gap */}
                <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-neutral-800">Product Grid Gap</label>
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {draftDesignSettings.sections.gridGap}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="48"
                    step="2"
                    value={draftDesignSettings.sections.gridGap}
                    onChange={(e) => handleSliderChange('sections', 'gridGap', Number(e.target.value))}
                    className="w-full accent-amber-800 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REAL LIVE WEBSITE PREVIEW CANVAS (7 cols) */}
        <div className="lg:col-span-7">
          <LiveWebsitePreviewCanvas
            savedSettings={websiteDesignSettings}
            draftSettings={draftDesignSettings}
            previewMode={previewMode}
            selectedDevice={selectedDevice}
            showAffectedArea={showAffectedArea}
            activeDiff={selectedDiff}
            totalDiffsCount={diffs.length}
            onOpenDiffDrawer={() => setIsDiffDrawerOpen(true)}
            selectedSectionId={tabAreaMapping[activeTab]}
          />
        </div>
      </div>

      {/* CHANGE LIST DRAWER */}
      <ChangeListDrawer
        isOpen={isDiffDrawerOpen}
        onClose={() => setIsDiffDrawerOpen(false)}
        diffs={diffs}
        activeDiffId={selectedDiff?.id}
        onSelectDiff={(diff) => {
          setSelectedDiff(diff);
          setIsDiffDrawerOpen(false);
        }}
        onSave={handleSave}
        onReset={handleResetAll}
        isSaving={isSaving}
      />
    </div>
  );
};
