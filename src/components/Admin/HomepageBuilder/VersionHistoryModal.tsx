import React, { useState, useEffect } from 'react';
import { X, History, RotateCcw, Clock, User, Check, Loader2 } from 'lucide-react';
import { HomepageVersion } from '../../../types';
import { useStore } from '../../../context/StoreContext';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  onRestoreSuccess,
}) => {
  const { fetchHomepageVersionsList, rollbackHomepageVersion } = useStore();
  const [versions, setVersions] = useState<HomepageVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchHomepageVersionsList()
        .then((v) => setVersions(v))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, fetchHomepageVersionsList]);

  if (!isOpen) return null;

  const handleRestore = async (versionId: string) => {
    if (!window.confirm('Are you sure you want to restore this homepage version? This will replace the active live layout.')) return;
    setRestoringId(versionId);
    try {
      const ok = await rollbackHomepageVersion(versionId);
      if (ok) {
        onRestoreSuccess();
        onClose();
      }
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8 border border-neutral-200">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Homepage Version History</h3>
              <p className="text-xs text-neutral-400">View and restore previous published layout snapshots</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-neutral-500 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" /> Loading version history...
            </div>
          ) : versions.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-sm">
              No version history snapshots found. Changes are saved automatically when published.
            </div>
          ) : (
            versions.map((ver) => (
              <div
                key={ver.id}
                className="p-4 border border-neutral-200 rounded-xl hover:border-emerald-300 bg-neutral-50/50 flex items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">
                      {ver.config?.name || 'Homepage Layout'}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                      {ver.config?.sections?.length || 0} Sections
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600">{ver.note || 'Layout Update'}</p>
                  <div className="flex items-center gap-4 text-[11px] text-neutral-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(ver.createdAt).toLocaleString('en-IN')}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {ver.createdBy}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={restoringId === ver.id}
                  onClick={() => handleRestore(ver.id)}
                  className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 hover:border-emerald-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                >
                  {restoringId === ver.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" /> Restore
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
