import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  Star,
  Pin,
  Eye,
  Check,
  Zap,
  Copy,
  Trash2,
  Edit2,
  Download,
  Upload,
  Clock,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  FolderPlus,
  Filter,
} from 'lucide-react';
import { HomepagePreset, HomepageConfig } from '../../../types';
import { MARKETPLACE_PRESETS, MARKETPLACE_CATEGORIES } from '../../../data/marketplacePresets';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { SaveTemplateModal } from './SaveTemplateModal';
import { ScheduleTemplateModal } from './ScheduleTemplateModal';

interface TemplateMarketplaceViewProps {
  currentConfig: HomepageConfig;
  onApplyPreset: (config: Partial<HomepageConfig>) => void;
  onOpenAIGenerator: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const TemplateMarketplaceView: React.FC<TemplateMarketplaceViewProps> = ({
  currentConfig,
  onApplyPreset,
  onOpenAIGenerator,
  showToast,
}) => {
  // State for search and category
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [displayCount, setDisplayCount] = useState(12);

  // Favorites & Pins stored in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mkt_preset_favorites') || '[]');
    } catch {
      return [];
    }
  });

  const [pinned, setPinned] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mkt_preset_pinned') || '[]');
    } catch {
      return [];
    }
  });

  // Custom user templates saved locally
  const [customPresets, setCustomPresets] = useState<HomepagePreset[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mkt_custom_presets') || '[]');
    } catch {
      return [];
    }
  });

  // Modals state
  const [previewingPreset, setPreviewingPreset] = useState<HomepagePreset | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [schedulingPreset, setSchedulingPreset] = useState<HomepagePreset | null>(null);

  // Persist Favorites, Pins, Custom Presets
  useEffect(() => {
    localStorage.setItem('mkt_preset_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('mkt_preset_pinned', JSON.stringify(pinned));
  }, [pinned]);

  useEffect(() => {
    localStorage.setItem('mkt_custom_presets', JSON.stringify(customPresets));
  }, [customPresets]);

  // Combine default marketplace + custom presets
  const allPresets = useMemo(() => {
    return [...customPresets, ...MARKETPLACE_PRESETS];
  }, [customPresets]);

  // Toggle Favorite
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle Pin
  const togglePin = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPinned((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Duplicate Template
  const handleDuplicate = (preset: HomepagePreset, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const duplicated: HomepagePreset = {
      ...preset,
      id: `custom_copy_${Date.now()}`,
      name: `${preset.name} (Copy)`,
      isCustom: true,
      category: 'Saved / Custom',
      createdAt: new Date().toISOString(),
    };
    setCustomPresets((prev) => [duplicated, ...prev]);
    showToast(`Duplicated "${preset.name}" into Custom Presets`, 'success');
  };

  // Delete Custom Preset
  const handleDeleteCustom = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCustomPresets((prev) => prev.filter((p) => p.id !== id));
    showToast('Deleted custom template', 'info');
  };

  // Save new custom template from current draft
  const handleSaveCustomPreset = (newPreset: HomepagePreset) => {
    setCustomPresets((prev) => [newPreset, ...prev]);
    showToast(`Saved "${newPreset.name}" to Template Marketplace!`, 'success');
  };

  // Export Preset JSON
  const handleExportPresetJSON = (preset: HomepagePreset, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const dataStr =
        'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(preset, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `homepage_template_${preset.name.toLowerCase().replace(/\s+/g, '_')}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`Exported "${preset.name}" as JSON`, 'success');
    } catch {
      showToast('Export failed', 'error');
    }
  };

  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Import Preset JSON
  const handleImportPresetJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported && imported.name && imported.config) {
          const newCustom: HomepagePreset = {
            id: `custom_import_${Date.now()}`,
            name: imported.name || 'Imported Preset',
            description: imported.description || 'Imported from JSON',
            previewColor: imported.previewColor || '#0B8F63',
            badge: imported.badge || 'IMPORTED',
            category: 'Saved / Custom',
            isCustom: true,
            config: imported.config,
            createdAt: new Date().toISOString(),
          };
          setCustomPresets((prev) => [newCustom, ...prev]);
          showToast(`Successfully imported template: "${newCustom.name}"`, 'success');
        } else {
          showToast('Invalid preset JSON file format', 'error');
        }
      } catch {
        showToast('Error parsing JSON file', 'error');
      } finally {
        if (jsonFileInputRef.current) jsonFileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Schedule Confirm
  const handleScheduleConfirm = (presetId: string, startDate: string) => {
    showToast(`Scheduled template activation for ${new Date(startDate).toLocaleString()}`, 'success');
  };

  // Filtered & Sorted Presets
  const filteredPresets = useMemo(() => {
    let result = allPresets;

    // Filter by Category
    if (selectedCategory === 'Favorites') {
      result = result.filter((p) => favorites.includes(p.id));
    } else if (selectedCategory === 'Saved / Custom') {
      result = result.filter((p) => p.isCustom);
    } else if (selectedCategory !== 'All') {
      result = result.filter(
        (p) =>
          p.category === selectedCategory ||
          p.tags?.includes(selectedCategory)
      );
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.badge.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort pinned items to the top
    return result.sort((a, b) => {
      const aPinned = pinned.includes(a.id) ? 1 : 0;
      const bPinned = pinned.includes(b.id) ? 1 : 0;
      return bPinned - aPinned;
    });
  }, [allPresets, selectedCategory, searchQuery, favorites, pinned]);

  const visiblePresets = useMemo(() => {
    return filteredPresets.slice(0, displayCount);
  }, [filteredPresets, displayCount]);

  return (
    <div className="space-y-6">
      {/* Marketplace Header Bar */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-black rounded-full border border-amber-500/30 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Homepage Template Marketplace
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Enterprise Storefront Template Gallery
            </h2>
            <p className="text-xs text-neutral-400 font-medium max-w-2xl">
              Select from over <span className="text-amber-400 font-bold">50+ production-grade presets</span> or generate custom luxury themes with AI. Every template is 100% editable.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenAIGenerator}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Sparkles className="w-4 h-4 fill-amber-300" /> ✨ Generate with AI
            </button>

            <button
              type="button"
              onClick={() => setIsSaveModalOpen(true)}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <FolderPlus className="w-4 h-4 text-amber-400" /> Save Draft as Template
            </button>

            <input
              ref={jsonFileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportPresetJSON}
              className="sr-only hidden"
              tabIndex={-1}
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => jsonFileInputRef.current?.click()}
              className="px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Import JSON
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="mt-6 pt-4 border-t border-neutral-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-neutral-400">
          <div>
            <span className="block font-black text-lg text-white">{allPresets.length}</span>
            <span>Total Presets</span>
          </div>
          <div>
            <span className="block font-black text-lg text-amber-400">{favorites.length}</span>
            <span>Favorites</span>
          </div>
          <div>
            <span className="block font-black text-lg text-indigo-400">{customPresets.length}</span>
            <span>My Custom Templates</span>
          </div>
          <div>
            <span className="block font-black text-lg text-emerald-400">100%</span>
            <span>Fully Editable Sections</span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 50+ templates, tags, categories..."
              className="w-full pl-9 pr-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-semibold bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Scroll Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {MARKETPLACE_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setDisplayCount(12);
                }}
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-full whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 shadow-md scale-105'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {cat === 'Favorites' ? '⭐ Favorites' : cat === 'Saved / Custom' ? '📁 Custom Saved' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Cards Gallery Grid */}
      {visiblePresets.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
          <Filter className="w-8 h-8 text-neutral-400 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
            No templates match your search filter
          </h3>
          <p className="text-xs text-neutral-500">
            Try resetting your search query or selecting a different category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {visiblePresets.map((preset) => {
            const isFav = favorites.includes(preset.id);
            const isPin = pinned.includes(preset.id);
            const isActiveCurrent = currentConfig.presetName === preset.name;

            return (
              <div
                key={preset.id}
                className={`group bg-white dark:bg-neutral-900 border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between hover:shadow-xl ${
                  isActiveCurrent
                    ? 'border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/20'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                }`}
              >
                {/* Preset Header Visual Banner */}
                <div
                  className="h-32 px-5 py-4 flex flex-col justify-between relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.01]"
                  style={{ backgroundColor: preset.previewColor }}
                >
                  {/* Glass Backdrop Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Top Badges & Actions */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-wider border border-white/20">
                        {preset.badge || 'PRESET'}
                      </span>
                      {isActiveCurrent && (
                        <span className="px-2.5 py-1 bg-amber-400 text-neutral-950 text-[10px] font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                          <Check className="w-3 h-3" /> ACTIVE DRAFT
                        </span>
                      )}
                    </div>

                    {/* Star & Pin Icons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => togglePin(preset.id, e)}
                        className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                          isPin
                            ? 'bg-amber-400 text-neutral-950 shadow-md scale-110'
                            : 'bg-black/30 text-white/80 hover:text-white hover:bg-black/50'
                        }`}
                        title="Pin Template"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(preset.id, e)}
                        className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                          isFav
                            ? 'bg-amber-400 text-neutral-950 shadow-md scale-110'
                            : 'bg-black/30 text-white/80 hover:text-white hover:bg-black/50'
                        }`}
                        title="Favorite Template"
                      >
                        <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-neutral-950' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Preset Title Overlay */}
                  <div className="relative z-10 space-y-0.5">
                    <h3 className="text-base font-black text-white drop-shadow-md truncate">
                      {preset.name}
                    </h3>
                    <p className="text-[11px] text-white/80 font-medium truncate">
                      {preset.category || 'Preset'} • {preset.config.sections?.length || 0} Sections
                    </p>
                  </div>
                </div>

                {/* Preset Content Description */}
                <div className="p-5 flex-1 space-y-3">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>

                  {/* Category Tags */}
                  <div className="flex flex-wrap gap-1">
                    {preset.tags?.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-bold rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons Toolbar */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900/80 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* Live Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewingPreset(preset)}
                      className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                      title="Live Device Preview"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>

                    {/* Schedule Button */}
                    <button
                      type="button"
                      onClick={() => setSchedulingPreset(preset)}
                      className="p-1.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl transition-colors"
                      title="Schedule Activation"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>

                    {/* Export JSON Button */}
                    <button
                      type="button"
                      onClick={(e) => handleExportPresetJSON(preset, e)}
                      className="p-1.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl transition-colors"
                      title="Export JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {/* Duplicate Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDuplicate(preset, e)}
                      className="p-1.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl transition-colors"
                      title="Duplicate Template"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Custom Preset */}
                    {preset.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCustom(preset.id, e)}
                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/50 dark:text-red-400 rounded-xl transition-colors"
                        title="Delete Custom Template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* One-Click Apply Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      await onApplyPreset(preset.config);
                    }}
                    className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-neutral-950 text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all transform active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" /> Apply
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination / Load More Button */}
      {filteredPresets.length > displayCount && (
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => setDisplayCount((prev) => prev + 12)}
            className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black rounded-2xl shadow-lg transition-all"
          >
            Load More Templates ({filteredPresets.length - displayCount} Remaining)
          </button>
        </div>
      )}

      {/* Live Preview Simulator Modal */}
      <TemplatePreviewModal
        isOpen={Boolean(previewingPreset)}
        onClose={() => setPreviewingPreset(null)}
        preset={previewingPreset}
        onApply={async (cfg) => {
          await onApplyPreset(cfg);
        }}
      />

      {/* Save Template Modal */}
      <SaveTemplateModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentConfig={currentConfig}
        onSaveTemplate={handleSaveCustomPreset}
      />

      {/* Schedule Template Modal */}
      <ScheduleTemplateModal
        isOpen={Boolean(schedulingPreset)}
        onClose={() => setSchedulingPreset(null)}
        preset={schedulingPreset}
        onScheduleConfirm={handleScheduleConfirm}
      />
    </div>
  );
};
