import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Terminal, Clock, FileText, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const SaveMetricsDebugger: React.FC = () => {
  const { lastSaveMetrics } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!lastSaveMetrics) return null;

  const { writeTimeMs, docsUpdated, fieldsUpdated } = lastSaveMetrics;

  return (
    <div className="mt-4 border border-amber-500/20 bg-amber-500/5 rounded-2xl overflow-hidden shadow-sm animate-fade-in text-xs">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-amber-800 dark:text-amber-300 font-semibold hover:bg-amber-500/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Firestore CMS Write metrics (Smart Save Debugger)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-200 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-500" />
            {writeTimeMs} ms
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="p-4 border-t border-amber-500/10 bg-amber-500/5 space-y-3 font-mono text-neutral-700 dark:text-neutral-300">
          <div className="flex items-center justify-between text-[11px] border-b border-amber-500/10 pb-2">
            <span className="text-neutral-500">Operation Status:</span>
            <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              SUCCESS (OPTIMIZED)
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] text-neutral-500 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Target Documents Updated ({docsUpdated.length}):</span>
            </div>
            
            {docsUpdated.length === 0 ? (
              <div className="text-neutral-500 italic pl-4">No documents written (No changes detected).</div>
            ) : (
              <ul className="space-y-1.5 pl-4">
                {docsUpdated.map((docPath) => {
                  const fields = fieldsUpdated[docPath] || [];
                  return (
                    <li key={docPath} className="flex flex-col gap-0.5">
                      <span className="text-amber-800 dark:text-amber-400 font-semibold">
                        📄 {docPath}
                      </span>
                      {fields.length > 0 && (
                        <span className="text-neutral-500 text-[10px] pl-4">
                          Fields: {fields.map(f => `\`${f}\``).join(', ')}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
