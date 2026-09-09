import React, { useState } from 'react';
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
} from 'lucide-react';
import { useWebsiteDesign } from '../../context/WebsiteDesignContext';
import { ResponsiveDevice, SectionResponsiveConfig } from '../../types/websiteDesign';

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

  const [selectedDevice, setSelectedDevice] = useState<ResponsiveDevice>('desktop');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
      showToast?.('Website design and layout reset to default.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Layout className="w-5 h-5 text-[#0B8F63]" />
              Visual Website Layout & Builder
            </h2>
            {hasUnsavedChanges && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wide border border-amber-300">
                Unsaved Changes
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Reorder homepage sections, toggle visibility, and customize responsive spacing visually.
          </p>
        </div>

        {/* Action Controls & Devices */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Device Tabs */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200">
            <button
              onClick={() => setSelectedDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDevice === 'desktop'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setSelectedDevice('tablet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDevice === 'tablet'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button
              onClick={() => setSelectedDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDevice === 'mobile'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 rounded-xl text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed border border-neutral-200"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 rounded-xl text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed border border-neutral-200"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Save & Reset */}
          <button
            onClick={handleResetAll}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-[#0B8F63] hover:bg-[#097A54] transition-all shadow-md shadow-[#0B8F63]/20 flex items-center gap-1.5 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Layout'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Reordering List + Right Section Properties Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Reorderable Sections List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">
                Homepage Sections Order
              </h3>
              <p className="text-[11px] text-neutral-500">
                Drag or use arrows to reorder. Toggle visibility or lock sections.
              </p>
            </div>
            <span className="text-xs font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
              {homeSectionOrder.length} Sections
            </span>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
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
                  onClick={() => setSelectedSectionId(secId)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0B8F63]/5 border-[#0B8F63] shadow-sm'
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

        {/* Right Column: Selected Section Property Customizer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-6">
          {selectedSection ? (
            <>
              {/* Selected Section Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{SECTION_ICONS[selectedSection.id] || '📄'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-neutral-900 tracking-tight">
                        {selectedSection.name}
                      </h3>
                      {selectedSection.locked && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500">
                      Configuring visual attributes for{' '}
                      <span className="font-extrabold text-[#0B8F63] capitalize">{selectedDevice} view</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSectionVisibility(selectedSection.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selectedSection.visible
                        ? 'bg-emerald-50 text-[#0B8F63] border border-emerald-200'
                        : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                    }`}
                  >
                    {selectedSection.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{selectedSection.visible ? 'Visible' : 'Hidden'}</span>
                  </button>
                </div>
              </div>

              {/* Property Group 1: Container Width & Alignment */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-[#0B8F63]" />
                  Container Width & Alignment
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Width selector */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 mb-1.5 block">
                      Container Width
                    </label>
                    <select
                      value={currentDeviceConfig.width}
                      onChange={(e) =>
                        updateSectionResponsiveConfig(selectedSection.id, selectedDevice, {
                          width: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold text-neutral-800 bg-neutral-50 border border-neutral-200 focus:outline-none focus:border-[#0B8F63]"
                    >
                      <option value="full">Full Width (100%)</option>
                      <option value="wide">Wide Container (1280px)</option>
                      <option value="standard">Standard Container (1024px)</option>
                      <option value="compact">Compact Container (800px)</option>
                    </select>
                  </div>

                  {/* Horizontal Align */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 mb-1.5 block">
                      Horizontal Alignment
                    </label>
                    <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                      {[
                        { id: 'left', label: 'Left', icon: AlignLeft },
                        { id: 'center', label: 'Center', icon: AlignCenter },
                        { id: 'right', label: 'Right', icon: AlignRight },
                      ].map((align) => {
                        const IconComponent = align.icon;
                        const active = currentDeviceConfig.horizontalAlign === align.id;
                        return (
                          <button
                            key={align.id}
                            onClick={() =>
                              updateSectionResponsiveConfig(selectedSection.id, selectedDevice, {
                                horizontalAlign: align.id as any,
                              })
                            }
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                              active ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                            <span>{align.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Group 2: Padding & Spacing */}
              <div className="space-y-4 pt-2 border-t border-neutral-100">
                <h4 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#0B8F63]" />
                  Section Padding (Inner Spacing)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

              {/* Property Group 3: Margins & Section Gap */}
              <div className="space-y-4 pt-2 border-t border-neutral-100">
                <h4 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-[#0B8F63]" />
                  Section Margin & Grid Spacing
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 mb-1 block">
                      Grid Columns ({currentDeviceConfig.gridColumns})
                    </label>
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
                    <label className="text-[11px] font-bold text-neutral-600 mb-1 block">
                      Grid Gap ({currentDeviceConfig.gap}px)
                    </label>
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

                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 mb-1 block">
                      Corner Radius ({currentDeviceConfig.borderRadius}px)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={currentDeviceConfig.borderRadius}
                      onChange={(e) =>
                        updateSectionResponsiveConfig(selectedSection.id, selectedDevice, {
                          borderRadius: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#0B8F63]"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-neutral-400">Select a section from the left list to customize.</div>
          )}
        </div>
      </div>
    </div>
  );
};
