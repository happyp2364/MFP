import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Save,
  RotateCcw,
  Eye,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Edit3,
  Copy,
  Trash2,
  Check,
  Monitor,
  Smartphone,
  Tablet,
  History,
  Wand2,
  Layers,
  Palette,
  Loader2,
  ExternalLink,
  Download,
  Upload,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { HomepageSection, HomepageConfig } from '../../../types';
import { HOMEPAGE_PRESETS, DEFAULT_HOMEPAGE_CONFIG } from '../../../data/defaultHomepagePresets';
import { SectionEditorModal } from './SectionEditorModal';
import { SectionLibraryModal } from './SectionLibraryModal';
import { AILayoutGeneratorModal } from './AILayoutGeneratorModal';
import { VersionHistoryModal } from './VersionHistoryModal';
import { HomepageRenderer } from '../../Customer/HomepageRenderer';
import { TemplateMarketplaceView } from './TemplateMarketplaceView';

export const HomepageBuilderTab: React.FC = () => {
  const { homepageConfig, updateHomepageConfig, showToast } = useStore();

  const [localConfig, setLocalConfig] = useState<HomepageConfig>(() => JSON.parse(JSON.stringify(homepageConfig)));
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'canvas' | 'simulator'>('marketplace');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize when global config updates from Firestore
  React.useEffect(() => {
    if (homepageConfig) {
      setLocalConfig(JSON.parse(JSON.stringify(homepageConfig)));
    }
  }, [homepageConfig]);

  const handleApplyMarketplaceConfig = async (cfg: Partial<HomepageConfig>) => {
    const themeName = cfg.presetName || cfg.name || 'Marketplace Preset';
    console.log('[Theme Logger] Theme Applied via Preset:', themeName);

    const targetConfig: HomepageConfig = {
      ...localConfig,
      ...cfg,
      id: `hp_${Date.now()}`,
      name: cfg.name || localConfig.name || 'Custom Theme',
      presetName: cfg.presetName || cfg.name || 'Custom Preset',
      sections: cfg.sections ? JSON.parse(JSON.stringify(cfg.sections)) : localConfig.sections,
      updatedAt: new Date().toISOString(),
    };

    if (!targetConfig.sections || targetConfig.sections.length === 0) {
      showToast('Cannot apply empty preset layout', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Save to Firestore FIRST (Requirement 2 & 8)
      const success = await updateHomepageConfig(
        targetConfig,
        `Applied Preset: "${targetConfig.presetName || targetConfig.name}"`
      );

      if (success) {
        // 2. Only after successful Firestore write, update local canvas state
        setLocalConfig(targetConfig);
        setActiveTab('canvas');
        console.log('[Theme Logger] Theme Sync Success');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyPreset = async (presetId: string) => {
    const preset = HOMEPAGE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    if (window.confirm(`Apply "${preset.name}" preset layout live? This will update your store theme.`)) {
      const targetConfig: HomepageConfig = {
        ...localConfig,
        ...preset.config,
        name: preset.name,
        presetName: preset.id,
        sections: preset.config.sections || localConfig.sections,
      };
      await handleApplyMarketplaceConfig(targetConfig);
    }
  };

  const handleExportPreset = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(localConfig, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `homepage_preset_${(localConfig.name || 'custom').toLowerCase().replace(/\s+/g, '_')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Exported homepage preset JSON', 'success');
    } catch (e) {
      showToast('Failed to export preset JSON', 'error');
    }
  };

  const handleImportPreset = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported && Array.isArray(imported.sections)) {
          setLocalConfig(imported);
          showToast('Successfully imported homepage preset layout!', 'success');
        } else {
          showToast('Invalid preset JSON file format', 'error');
        }
      } catch (err) {
        showToast('Error parsing JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= localConfig.sections.length) return;

    const updated = [...localConfig.sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);

    setLocalConfig((prev) => ({ ...prev, sections: updated }));
  };

  const handleToggleSectionEnabled = (id: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
      ),
    }));
  };

  const handleDuplicateSection = (sec: HomepageSection) => {
    const duplicated: HomepageSection = {
      ...JSON.parse(JSON.stringify(sec)),
      id: `sec_${sec.type}_${Date.now()}`,
      title: `${sec.title} (Copy)`,
    };
    setLocalConfig((prev) => ({
      ...prev,
      sections: [...prev.sections, duplicated],
    }));
    showToast('Section duplicated', 'info');
  };

  const handleDeleteSection = (id: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      sections: prev.sections.filter((sec) => sec.id !== id),
    }));
    showToast('Section removed', 'info');
  };

  const handleSaveSection = (updatedSection: HomepageSection) => {
    setLocalConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => (sec.id === updatedSection.id ? updatedSection : sec)),
    }));
    setEditingSection(null);
    showToast('Section changes saved locally', 'info');
  };

  const handleAddSection = (newSection: HomepageSection) => {
    setLocalConfig((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    showToast(`Added ${newSection.title} to homepage`, 'info');
  };

  const handlePublishHomepage = async () => {
    setIsSaving(true);
    try {
      const success = await updateHomepageConfig(
        localConfig,
        `Published ${localConfig.sections.length} sections (${localConfig.name})`
      );
      if (success) {
        showToast('Homepage published and live synced to all customer devices!', 'success');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-emerald-600" /> AI Dynamic Homepage Experience Builder
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Drag, edit, reorder, and customize your customer homepage in real time with Gemini AI assistance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4" /> AI Experience Designer
          </button>

          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <History className="w-4 h-4" /> Version History
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handlePublishHomepage}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save & Publish Live
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary View Tab Bar */}
      <div className="bg-neutral-900 text-white p-2 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'marketplace'
                ? 'bg-amber-500 text-neutral-950 shadow-md scale-105'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> 🏠 Template Marketplace (50+)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('canvas')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'canvas'
                ? 'bg-amber-500 text-neutral-950 shadow-md scale-105'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> 🛠️ Canvas Editor ({localConfig.sections.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'simulator'
                ? 'bg-amber-500 text-neutral-950 shadow-md scale-105'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" /> 👁️ Device Simulator
          </button>
        </div>

        {/* Quick Active Config Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/80 rounded-xl border border-neutral-700/80 text-xs text-neutral-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white truncate max-w-[200px]">
            {localConfig.name || 'Custom Draft'}
          </span>
          <span className="text-[10px] bg-neutral-700 px-2 py-0.5 rounded font-extrabold text-amber-400">
            {localConfig.sections.length} Sections
          </span>
        </div>
      </div>

      {/* VIEW RENDERER */}
      {activeTab === 'marketplace' ? (
        <TemplateMarketplaceView
          currentConfig={localConfig}
          onApplyPreset={handleApplyMarketplaceConfig}
          onOpenAIGenerator={() => setIsAiModalOpen(true)}
          showToast={showToast}
        />
      ) : activeTab === 'canvas' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <div>
              <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" /> Active Homepage Sections ({localConfig.sections.length})
              </h3>
              <p className="text-xs text-neutral-500">Reorder, enable/disable, edit content, or duplicate sections.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-neutral-950 text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Section
            </button>
          </div>

          {/* Section List */}
          <div className="space-y-3">
            {localConfig.sections.map((sec, index) => (
              <div
                key={`${sec.id || 'sec'}-${index}`}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  sec.enabled
                    ? 'bg-white border-neutral-200 shadow-xs hover:border-emerald-300'
                    : 'bg-neutral-100/70 border-neutral-200 opacity-60'
                }`}
              >
                {/* Drag Handle & Info */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5 text-neutral-400">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveSection(index, 'up')}
                      className="p-1 hover:text-emerald-600 disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === localConfig.sections.length - 1}
                      onClick={() => handleMoveSection(index, 'down')}
                      className="p-1 hover:text-emerald-600 disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="w-7 h-7 bg-neutral-100 text-neutral-700 font-extrabold text-xs rounded-xl flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-neutral-900 truncate">{sec.title || sec.type}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                        {sec.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 truncate mt-0.5">{sec.subtitle || 'Custom homepage section'}</p>
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Enable Switch */}
                  <label className="flex items-center gap-1.5 cursor-pointer mr-2">
                    <input
                      type="checkbox"
                      checked={sec.enabled}
                      onChange={() => handleToggleSectionEnabled(sec.id)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-neutral-600">
                      {sec.enabled ? 'Live' : 'Hidden'}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setEditingSection(sec)}
                    className="p-2 bg-neutral-100 hover:bg-emerald-50 text-neutral-700 hover:text-emerald-700 rounded-xl transition-colors"
                    title="Edit Section Content & Style"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicateSection(sec)}
                    className="p-2 bg-neutral-100 hover:bg-purple-50 text-neutral-700 hover:text-purple-700 rounded-xl transition-colors"
                    title="Duplicate Section"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSection(sec.id)}
                    className="p-2 bg-neutral-100 hover:bg-rose-50 text-neutral-700 hover:text-rose-600 rounded-xl transition-colors"
                    title="Delete Section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* LIVE SIMULATOR DEVICE PREVIEW MODE */
        <div className="bg-neutral-900 p-6 rounded-2xl flex flex-col items-center gap-4 min-h-[600px]">
          <div className="flex items-center gap-2 bg-neutral-800 p-1.5 rounded-xl border border-neutral-700">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                previewDevice === 'desktop' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" /> Desktop (1440px)
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('tablet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                previewDevice === 'tablet' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Tablet className="w-4 h-4" /> Tablet (768px)
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                previewDevice === 'mobile' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Mobile (375px)
            </button>
          </div>

          <div
            className={`bg-white transition-all duration-300 overflow-hidden shadow-2xl rounded-3xl border-8 border-neutral-800 ${
              previewDevice === 'mobile'
                ? 'w-[375px] h-[750px] overflow-y-auto'
                : previewDevice === 'tablet'
                ? 'w-[768px] h-[800px] overflow-y-auto'
                : 'w-full max-w-6xl min-h-[700px]'
            }`}
          >
            <div className="p-2 bg-neutral-100 border-b border-neutral-200 text-center text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Live Preview Simulator ({previewDevice.toUpperCase()})
            </div>
            <HomepageRenderer previewConfig={localConfig} />
          </div>
        </div>
      )}

      {/* Modals */}
      {editingSection && (
        <SectionEditorModal
          section={editingSection}
          isOpen={!!editingSection}
          onClose={() => setEditingSection(null)}
          onSave={handleSaveSection}
        />
      )}

      <SectionLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onAddSection={handleAddSection}
      />

      <AILayoutGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyLayout={(genConfig) => {
          setLocalConfig(genConfig);
          showToast('Applied AI Generated Layout!', 'success');
        }}
      />

      <VersionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRestoreSuccess={() => {
          showToast('Restored homepage layout snapshot!', 'success');
        }}
      />
    </div>
  );
};
