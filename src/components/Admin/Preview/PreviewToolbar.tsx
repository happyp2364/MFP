import React from 'react';
import {
  Eye,
  Columns,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  MapPin,
  ListFilter,
  Save,
  RotateCcw,
  Undo,
  Redo,
  CheckCircle2,
} from 'lucide-react';
import { ResponsiveDevice } from '../../../types/websiteDesign';

export type PreviewMode = 'live' | 'before_after' | 'changes_only';

interface PreviewToolbarProps {
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  selectedDevice: ResponsiveDevice;
  setSelectedDevice: (device: ResponsiveDevice) => void;
  showAffectedArea: boolean;
  setShowAffectedArea: (show: boolean) => void;
  diffCount: number;
  onOpenDiffDrawer: () => void;
  hasUnsavedChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onSave: () => void;
  isSaving: boolean;
  compact?: boolean;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  previewMode,
  setPreviewMode,
  selectedDevice,
  setSelectedDevice,
  showAffectedArea,
  setShowAffectedArea,
  diffCount,
  onOpenDiffDrawer,
  hasUnsavedChanges,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onSave,
  isSaving,
  compact = false,
}) => {
  return (
    <div className="bg-neutral-900 text-white rounded-2xl p-3 sm:p-4 shadow-xl border border-neutral-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
      {/* Left: View Mode Tabs */}
      <div className="flex items-center gap-1.5 bg-neutral-800/80 p-1 rounded-xl border border-neutral-700/60 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setPreviewMode('live')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
            previewMode === 'live'
              ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/30'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-700/50'
          }`}
          title="Live draft website view"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>👁 Live Preview</span>
        </button>

        <button
          type="button"
          onClick={() => setPreviewMode('before_after')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
            previewMode === 'before_after'
              ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/30'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-700/50'
          }`}
          title="Compare last saved state (Before) with draft (After)"
        >
          <Columns className="w-3.5 h-3.5" />
          <span>↔ Before / After</span>
        </button>

        <button
          type="button"
          onClick={() => setPreviewMode('changes_only')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
            previewMode === 'changes_only'
              ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/30'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-700/50'
          }`}
          title="Focus exclusively on changed website components"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>✨ Changes Only</span>
        </button>
      </div>

      {/* Middle: Device Switcher & Affected Area Toggle */}
      <div className="flex items-center flex-wrap gap-2 justify-center">
        {/* Devices */}
        <div className="flex items-center bg-neutral-800/80 p-1 rounded-xl border border-neutral-700/60">
          <button
            type="button"
            onClick={() => setSelectedDevice('desktop')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
              selectedDevice === 'desktop'
                ? 'bg-neutral-700 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Desktop 1440px viewport"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
            <span className="text-[10px] text-neutral-400 ml-0.5">(1440px)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedDevice('tablet')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
              selectedDevice === 'tablet'
                ? 'bg-neutral-700 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Tablet 768px viewport"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
            <span className="text-[10px] text-neutral-400 ml-0.5">(768px)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedDevice('mobile')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
              selectedDevice === 'mobile'
                ? 'bg-neutral-700 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Mobile 390px viewport"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
            <span className="text-[10px] text-neutral-400 ml-0.5">(390px)</span>
          </button>
        </div>

        {/* Affected Area Toggle */}
        <button
          type="button"
          onClick={() => setShowAffectedArea(!showAffectedArea)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all border ${
            showAffectedArea
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/10'
              : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
          }`}
          title="Highlight affected components and dim unrelated elements"
        >
          <MapPin className={`w-3.5 h-3.5 ${showAffectedArea ? 'animate-bounce text-amber-400' : ''}`} />
          <span>📍 Show Affected Area</span>
        </button>
      </div>

      {/* Right: Unsaved Changes Badge, Undo/Redo, Save */}
      <div className="flex items-center justify-end gap-2 shrink-0">
        {/* Unsaved Changes Button */}
        {diffCount > 0 ? (
          <button
            type="button"
            onClick={onOpenDiffDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-amber-950 font-black tracking-tight hover:bg-amber-300 transition-all shadow-md active:scale-95 cursor-pointer"
            title="Click to view all unsaved changes list"
          >
            <span className="w-2 h-2 rounded-full bg-amber-950 animate-ping" />
            <span>{diffCount} Unsaved Change{diffCount > 1 ? 's' : ''}</span>
            <ListFilter className="w-3.5 h-3.5 ml-0.5" />
          </button>
        ) : (
          <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold text-[11px] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>All Changes Saved</span>
          </span>
        )}

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 bg-neutral-800 p-0.5 rounded-xl border border-neutral-700">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-700"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-700"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Save Layout Button */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-extrabold transition-all shadow-md ${
            hasUnsavedChanges
              ? 'bg-[#0B8F63] hover:bg-[#097A54] text-white shadow-[#0B8F63]/30 active:scale-95'
              : 'bg-neutral-800 text-neutral-500 border border-neutral-700/60 cursor-not-allowed'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save Layout'}</span>
        </button>
      </div>
    </div>
  );
};
