import React from 'react';
import { X, Sparkles, ArrowRight, Layers, Smartphone, Save, RotateCcw } from 'lucide-react';
import { DesignDiffItem } from '../../../utils/designDiffUtils';

interface ChangeListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  diffs: DesignDiffItem[];
  activeDiffId?: string | null;
  onSelectDiff: (diff: DesignDiffItem) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
}

export const ChangeListDrawer: React.FC<ChangeListDrawerProps> = ({
  isOpen,
  onClose,
  diffs,
  activeDiffId,
  onSelectDiff,
  onSave,
  onReset,
  isSaving,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-neutral-900 text-white h-full shadow-2xl border-l border-neutral-800 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-black text-white">Unsaved Changes List</h3>
              <p className="text-xs text-neutral-400">
                {diffs.length} modification{diffs.length === 1 ? '' : 's'} in current local draft
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {diffs.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs">
              No unsaved changes detected. Draft matches saved layout.
            </div>
          ) : (
            diffs.map((diff, index) => {
              const isSelected = activeDiffId === diff.id;
              return (
                <div
                  key={diff.id || index}
                  onClick={() => onSelectDiff(diff)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                      : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-neutral-800 text-amber-400">
                      #{index + 1}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3 h-3 text-emerald-400" />
                      {diff.affectedAreaLabel}
                    </span>
                  </div>

                  <div className="text-xs font-black text-white">{diff.label}</div>

                  {/* Before vs After pill */}
                  <div className="flex items-center justify-between text-xs font-mono bg-neutral-900 p-2 rounded-xl border border-neutral-800">
                    <div className="text-neutral-400">
                      <span className="text-[9px] text-neutral-500 block uppercase font-sans">Before</span>
                      <span className="line-through text-rose-300 font-bold">
                        {String(diff.oldValue)}{diff.unit || ''}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    <div className="text-right">
                      <span className="text-[9px] text-emerald-400 block uppercase font-sans">After</span>
                      <span className="text-emerald-300 font-extrabold">
                        {String(diff.newValue)}{diff.unit || ''}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-300 font-medium italic">
                    "{diff.humanDescription}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-neutral-800/60">
                    <span className="capitalize flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-amber-400" />
                      Device: {diff.device}
                    </span>
                    <span className="text-amber-400 font-bold hover:underline">
                      Focus Preview →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Discard / Reset</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || diffs.length === 0}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#0B8F63] hover:bg-[#097A54] transition-all shadow-lg shadow-[#0B8F63]/30 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
