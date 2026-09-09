import React, { useState, useMemo } from 'react';
import {
  GripVertical,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  MoveUp,
  MoveDown,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Undo,
  Redo,
  Save,
  Sparkles,
  Layout,
  Maximize2,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Columns,
  MapPin,
  ListFilter,
} from 'lucide-react';
import { useWebsiteDesign } from '../../context/WebsiteDesignContext';
import { ResponsiveDevice, SectionResponsiveConfig } from '../../types/websiteDesign';
import { calculateDesignDiffs, DesignDiffItem } from '../../utils/designDiffUtils';
import { PreviewToolbar, PreviewMode } from './Preview/PreviewToolbar';
import { LiveWebsitePreviewCanvas } from './Preview/LiveWebsitePreviewCanvas';
import { ChangeListDrawer } from './Preview/ChangeListDrawer';

interface VisualWebsiteBuilderProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const SECTION_ICONS: Record<string, string> = {
  hero: '🖼️',
  trending_shoes: '🔥',
  price_point_699: '🏷️',
  categories: '📦',
  featured_products: '⭐',
  best_sellers: '🏆',
  trending_products: '⚡',
  trending_collections: '🎨',
  new_arrivals: '✨',
  reviews: '💬',
  about: '📖',
  contact: '📍',
  instagram: '📸',
  social: '🌐',
};

export const VisualWebsiteBuilder: React.FC<VisualWebsiteBuilderProps> = ({ showToast }) => {
  const {
    websiteDesignSettings,
    draftDesignSettings,
    reorderHomeSections,
    toggleSectionVisibility,
    toggleSectionLock,
    updateSectionResponsiveConfig,
    saveWebsiteDesignSettings,
    resetAllDesign,
    hasUnsavedChanges,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useWebsiteDesign();

  // Preview State
  const [selectedDevice, setSelectedDevice] = useState<ResponsiveDevice>('desktop');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('hero');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('live');
  const [showAffectedArea, setShowAffectedArea] = useState<boolean>(true);
  const [isDiffDrawerOpen, setIsDiffDrawerOpen] = useState<boolean>(false);
  const [activeDiff, setActiveDiff] = useState<DesignDiffItem | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Dynamic Diffs Calculation between saved vs draft
  const diffs = useMemo(() => {
    return calculateDesignDiffs(websiteDesignSettings, draftDesignSettings, selectedDevice);
  }, [websiteDesignSettings, draftDesignSettings, selectedDevice]);

  const layout = draftDesignSettings.layout;
  if (!layout) {
    return <div className="p-8 text-center text-neutral-500">Loading Layout Builder...</div>;
  }

  const { homeSectionOrder, sections } = layout;

  const selectedSection = sections[selectedSectionId] || sections[homeSectionOrder[0]];
  const currentDeviceConfig: SectionResponsiveConfig =
    selectedSection ? selectedSection[selectedDevice] : layout.sections.hero.desktop;

  // Reorder up/down helper
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= homeSectionOrder.length) return;

    const currentId = homeSectionOrder[index];
    const targetId = homeSectionOrder[targetIndex];

    const currentSec = sections[currentId];
    const targetSec = sections[targetId];

    if (currentSec?.locked || targetSec?.locked) {
      showToast?.('One or both of these sections are locked and cannot be moved.', 'info');
      return;
    }

    const newOrder = [...homeSectionOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    reorderHomeSections(newOrder);
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    const sec = sections[homeSectionOrder[index]];
    if (sec?.locked) {
      e.preventDefault();
      showToast?.('Locked sections cannot be moved.', 'info');
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const draggedSec = sections[homeSectionOrder[draggedIndex]];
    const targetSec = sections[homeSectionOrder[index]];

    if (draggedSec?.locked || targetSec?.locked) return;

    const newOrder = [...homeSectionOrder];
    const [moved] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, moved);

    reorderHomeSections(newOrder);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveWebsiteDesignSettings();
      setActiveDiff(null);
      setIsDiffDrawerOpen(false);
      showToast?.('Website Visual Layout saved successfully!', 'success');
    } catch (err) {
      showToast?.('Failed to save layout configuration.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetAll = async () => {
    if (window.confirm('Reset all website layout and design settings back to Marudhar Fashion Point defaults?')) {
      await resetAllDesign();
      setActiveDiff(null);
      showToast?.('Website design and layout reset to default.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Layout className="w-5 h-5 text-[#0B8F63]" />
              Visual Website Builder & Live Preview
            </h2>
            {hasUnsavedChanges && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wide border border-amber-300">
                {diffs.length} Unsaved Draft Change{diffs.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Reorder homepage sections, toggle visibility, customize responsive spacing, and inspect live preview changes.
          </p>
        </div>
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

      {/* MAIN TWO-COLUMN LAYOUT: LEFT CONTROLS + RIGHT LIVE PREVIEW CANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Section Order List & Selected Section Customizer (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section Reorder List */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">
                  Homepage Section Order
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Drag or use arrows to reorder. Toggle visibility or lock sections.
                </p>
              </div>
              <span className="text-xs font-bold text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-full">
                {homeSectionOrder.length} Sections
              </span>
            </div>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {homeSectionOrder.map((secId, idx) => {
                const sec = sections[secId];
                if (!sec) return null;

                const isSelected = selectedSectionId === secId;
                const isLocked = sec.locked;
                const isVisible = sec.visible;

                return (
                  <div
                    key={secId}
                    draggable={!isLocked}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      setSelectedSectionId(secId);
                      // Match diff if available
                      const matchingDiff = diffs.find((d) => d.affectedArea === `section-${secId}`);
                      if (matchingDiff) setActiveDiff(matchingDiff);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B8F63]/5 border-[#0B8F63] shadow-sm ring-1 ring-[#0B8F63]'
                        : isVisible
                        ? 'bg-white border-neutral-200 hover:border-neutral-300'
                        : 'bg-neutral-50 border-neutral-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-neutral-400 hover:text-neutral-600 cursor-grab active:cursor-grabbing p-1">
                        <GripVertical className="w-4 h-4" />
                      </span>

                      <span className="text-base">{SECTION_ICONS[secId] || '📄'}</span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-neutral-900 truncate">{sec.name}</span>
                          {isLocked && (
                            <span className="p-0.5 text-amber-600" title="Locked section">
                              <Lock className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono">#{idx + 1}</span>
                      </div>
                    </div>

                    {/* Move & Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSection(idx, 'up');
                        }}
                        disabled={idx === 0 || isLocked}
                        className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSection(idx, 'down');
                        }}
                        disabled={idx === homeSectionOrder.length - 1 || isLocked}
                        className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSectionLock(secId);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isLocked ? 'text-amber-600 bg-amber-50' : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                        title={isLocked ? 'Unlock Section' : 'Lock Section'}
                      >
                        {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSectionVisibility(secId);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isVisible ? 'text-[#0B8F63] bg-emerald-50' : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                        title={isVisible ? 'Hide Section' : 'Show Section'}
                      >
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Section Properties Customizer */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-5">
            {selectedSection ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{SECTION_ICONS[selectedSection.id] || '📄'}</span>
                    <div>
                      <h3 className="text-sm font-black text-neutral-900">{selectedSection.name}</h3>
                      <p className="text-[11px] text-neutral-500">
                        Configuring responsive settings for <strong className="capitalize">{selectedDevice}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Padding Controls */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider">
                    Responsive Padding
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600">Top ({currentDeviceConfig.paddingTop}px)</label>
                      <input
                        type="range"
                        min="0"
                        max="120"
                        value={currentDeviceConfig.paddingTop}
                        onChange={(e) =>
                          updateSectionResponsiveConfig(selectedSection.id, selectedDevice, {
                            paddingTop: Number(e.target.value),
                          })
                        }
                        className="w-full accent-[#0B8F63]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-600">Bottom ({currentDeviceConfig.paddingBottom}px)</label>
                      <input
                        type="range"
                        min="0"
                        max="120"
                        value={currentDeviceConfig.paddingBottom}
                        onChange={(e) =>
                          updateSectionResponsiveConfig(selectedSection.id, selectedDevice, {
                            paddingBottom: Number(e.target.value),
                          })
                        }
                        className="w-full accent-[#0B8F63]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-600">Left ({currentDeviceConfig.paddingLeft}px)</label>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={currentDeviceConfig.paddingLeft}
                        onChange={(e) =>
                          updateSectionResponsiveConfig(selectedSection.id, selectedDevice, {
                            paddingLeft: Number(e.target.value),
                          })
                        }
                        className="w-full accent-[#0B8F63]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-600">Right ({currentDeviceConfig.paddingRight}px)</label>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={currentDeviceConfig.paddingRight}
                        onChange={(e) =>
                          updateSectionResponsiveConfig(selectedSection.id, selectedDevice, {
                            paddingRight: Number(e.target.value),
                          })
                        }
                        className="w-full accent-[#0B8F63]"
                      />
                    </div>
                  </div>
                </div>

                {/* Grid & Gap Controls */}
                <div className="space-y-3 pt-2 border-t border-neutral-100">
                  <h4 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider">
                    Grid Columns & Gap
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600">Grid Columns ({currentDeviceConfig.gridColumns})</label>
                      <input
                        type="range"
                        min="1"
                        max="6"
                        value={currentDeviceConfig.gridColumns}
                        onChange={(e) =>
                          updateSectionResponsiveConfig(selectedSection.id, selectedDevice, {
                            gridColumns: Number(e.target.value),
                          })
                        }
                        className="w-full accent-[#0B8F63]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-600">Grid Gap ({currentDeviceConfig.gap}px)</label>
                      <input
                        type="range"
                        min="0"
                        max="60"
                        value={currentDeviceConfig.gap}
                        onChange={(e) =>
                          updateSectionResponsiveConfig(selectedSection.id, selectedDevice, {
                            gap: Number(e.target.value),
                          })
                        }
                        className="w-full accent-[#0B8F63]"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-neutral-400">Select a section to customize.</div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: REAL LIVE WEBSITE PREVIEW CANVAS (7 cols) */}
        <div className="lg:col-span-7">
          <LiveWebsitePreviewCanvas
            savedSettings={websiteDesignSettings}
            draftSettings={draftDesignSettings}
            previewMode={previewMode}
            selectedDevice={selectedDevice}
            showAffectedArea={showAffectedArea}
            activeDiff={activeDiff}
            totalDiffsCount={diffs.length}
            onOpenDiffDrawer={() => setIsDiffDrawerOpen(true)}
            selectedSectionId={selectedSectionId}
          />
        </div>
      </div>

      {/* CHANGE LIST DRAWER */}
      <ChangeListDrawer
        isOpen={isDiffDrawerOpen}
        onClose={() => setIsDiffDrawerOpen(false)}
        diffs={diffs}
        activeDiffId={activeDiff?.id}
        onSelectDiff={(diff) => {
          setActiveDiff(diff);
          setIsDiffDrawerOpen(false);
        }}
        onSave={handleSave}
        onReset={handleResetAll}
        isSaving={isSaving}
      />
    </div>
  );
};
