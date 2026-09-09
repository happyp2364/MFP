import React from 'react';
import { Sparkles, ArrowRight, Layers, Smartphone, CheckCircle2 } from 'lucide-react';
import { DesignDiffItem } from '../../../utils/designDiffUtils';

interface ChangeSummaryPanelProps {
  activeDiff?: DesignDiffItem | null;
  totalDiffsCount: number;
  onOpenAllChanges: () => void;
  className?: string;
}

export const ChangeSummaryPanel: React.FC<ChangeSummaryPanelProps> = ({
  activeDiff,
  totalDiffsCount,
  onOpenAllChanges,
  className = '',
}) => {
  if (!activeDiff && totalDiffsCount === 0) {
    return (
      <div className={`bg-neutral-900/90 backdrop-blur-md text-white rounded-2xl p-4 border border-neutral-800 shadow-xl ${className}`}>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>No Unsaved Changes</span>
        </div>
        <p className="text-[11px] text-neutral-400 mt-1">
          The live preview matches the current saved website layout and design tokens.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-neutral-950/95 backdrop-blur-lg text-white rounded-2xl p-4 border border-neutral-800 shadow-2xl space-y-3 ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <h4 className="text-xs font-black text-amber-300 tracking-wider uppercase">
            ✨ What Changed?
          </h4>
        </div>
        {totalDiffsCount > 0 && (
          <button
            type="button"
            onClick={onOpenAllChanges}
            className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2"
          >
            View All ({totalDiffsCount})
          </button>
        )}
      </div>

      {activeDiff ? (
        <div className="space-y-2.5 text-xs">
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
              Property
            </span>
            <div className="text-sm font-black text-white">{activeDiff.label}</div>
          </div>

          {/* Before vs After comparison */}
          <div className="bg-neutral-900/90 rounded-xl p-2.5 border border-neutral-800 flex items-center justify-between gap-3">
            <div className="flex-1">
              <span className="text-[9px] font-extrabold text-neutral-400 uppercase block">Before</span>
              <span className="font-mono text-xs font-extrabold text-rose-300 line-through">
                {String(activeDiff.oldValue)}{activeDiff.unit || ''}
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />

            <div className="flex-1 text-right">
              <span className="text-[9px] font-extrabold text-emerald-400 uppercase block">After (Draft)</span>
              <span className="font-mono text-sm font-black text-emerald-300">
                {String(activeDiff.newValue)}{activeDiff.unit || ''}
              </span>
            </div>
          </div>

          {/* Human readable description */}
          <p className="text-[11px] text-neutral-300 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg font-medium leading-relaxed">
            "{activeDiff.humanDescription}"
          </p>

          {/* Meta details */}
          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
            <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
              <span className="text-neutral-500 font-bold block">Applies To:</span>
              <span className="font-extrabold text-neutral-200 capitalize flex items-center gap-1 mt-0.5">
                <Smartphone className="w-3 h-3 text-amber-400" />
                {activeDiff.device === 'all' ? 'Desktop, Tablet & Mobile' : activeDiff.device}
              </span>
            </div>

            <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
              <span className="text-neutral-500 font-bold block">Affects:</span>
              <span className="font-extrabold text-emerald-300 flex items-center gap-1 mt-0.5 truncate">
                <Layers className="w-3 h-3 text-emerald-400 shrink-0" />
                {activeDiff.affectedAreaLabel}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-neutral-400 py-1">
          <p className="font-medium text-neutral-300">
            {totalDiffsCount} unsaved configuration change{totalDiffsCount > 1 ? 's' : ''} in draft.
          </p>
          <button
            type="button"
            onClick={onOpenAllChanges}
            className="mt-2 w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all text-center"
          >
            Click to inspect all {totalDiffsCount} changes
          </button>
        </div>
      )}
    </div>
  );
};
