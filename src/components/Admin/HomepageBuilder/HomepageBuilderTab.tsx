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
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { HomepageSection, HomepageConfig } from '../../../types';
import { HOMEPAGE_PRESETS, DEFAULT_HOMEPAGE_CONFIG } from '../../../data/defaultHomepagePresets';
import { SectionEditorModal } from './SectionEditorModal';
import { SectionLibraryModal } from './SectionLibraryModal';
import { AILayoutGeneratorModal } from './AILayoutGeneratorModal';
import { VersionHistoryModal } from './VersionHistoryModal';
import { HomepageRenderer } from '../../Customer/HomepageRenderer';

export const HomepageBuilderTab: React.FC = () => {
  const { homepageConfig, updateHomepageConfig, showToast } = useStore();

  const [localConfig, setLocalConfig] = useState<HomepageConfig>(() => JSON.parse(JSON.stringify(homepageConfig)));
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'builder' | 'desktop' | 'tablet' | 'mobile'>('builder');
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize when global config updates from Firestore
  React.useEffect(() => {
    if (homepageConfig) {
      setLocalConfig(JSON.parse(JSON.stringify(homepageConfig)));
    }
  }, [homepageConfig]);

  const handleApplyPreset = (presetId: string) => {
    const preset = HOMEPAGE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    if (window.confirm(`Apply "${preset.name}" preset layout? Any unsaved edits will be replaced.`)) {
      setLocalConfig((prev) => ({
        ...prev,
        ...preset.config,
        name: preset.name,
        presetName: preset.id,
        sections: preset.config.sections || prev.sections,
      }));
      showToast(`Applied ${preset.name} preset! Click "Publish Homepage" to go live.`, 'info');
    }
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

      {/* Preset Selector & Mode Tabs */}
      <div className="bg-neutral-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Preset Badges */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-1">Presets:</span>
          {HOMEPAGE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset.id)}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg border border-neutral-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.previewColor }} />
              {preset.name}
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-neutral-300">{preset.badge}</span>
            </button>
          ))}
        </div>

        {/* Simulator Device Switcher */}
        <div className="flex bg-neutral-800 p-1 rounded-xl border border-neutral-700">
          {[
            { id: 'builder', label: 'Canvas', icon: Layers },
            { id: 'desktop', label: 'Desktop', icon: Monitor },
            { id: 'tablet', label: 'Tablet', icon: Tablet },
            { id: 'mobile', label: 'Mobile', icon: Smartphone },
          ].map((mode) => {
            const IconComp = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setPreviewDevice(mode.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  previewDevice === mode.id
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CANVAS BUILDER MODE */}
      {previewDevice === 'builder' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" /> Active Homepage Sections ({localConfig.sections.length})
            </h3>
            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Section
            </button>
          </div>

          {/* Section List */}
          <div className="space-y-3">
            {localConfig.sections.map((sec, index) => (
              <div
                key={sec.id || index}
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
        <div className="bg-neutral-900 p-6 rounded-2xl flex justify-center items-center overflow-x-auto min-h-[600px]">
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
