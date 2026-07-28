import React, { useState } from 'react';
import { Clock, RotateCcw, ShieldCheck, CheckCircle2, History, AlertCircle, ArrowRight, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PublishedVersionHistory } from '../../types';

export const VersionHistoryView: React.FC = () => {
  const {
    publishedVersions,
    lastPublishedAt,
    lastPublishedBy,
    hasPendingDraft,
    pendingDraftCount,
    restorePublishedVersion,
    publishWebsite,
  } = useStore();

  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [expandedVerId, setExpandedVerId] = useState<string | null>(null);

  const handleRollback = async (ver: PublishedVersionHistory) => {
    if (window.confirm(`Are you sure you want to restore Version ${ver.versionNumber}? This will load version ${ver.versionNumber} into your active Draft workspace.`)) {
      setRestoringId(ver.id);
      await restorePublishedVersion(ver.id);
      setRestoringId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Status */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0B8F63]/10 text-[#0B8F63] flex items-center justify-center font-bold">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-neutral-900 text-base">Global Draft & Version Control System</h3>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                hasPendingDraft ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {hasPendingDraft ? `🟡 Draft Changes Pending (${pendingDraftCount})` : '🟢 Live (Synced)'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Every global publish creates an immutable version snapshot. You can preview, restore, or compare any past version at any time.
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-neutral-500 bg-neutral-50 p-3 rounded-xl border border-neutral-200 w-full md:w-auto">
          <div className="font-bold text-neutral-800">Latest Live Release</div>
          <div className="text-[11px] font-mono text-neutral-600 mt-0.5">
            {lastPublishedAt ? new Date(lastPublishedAt).toLocaleString() : 'Initial Version'}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">By: {lastPublishedBy || 'System Admin'}</div>
        </div>
      </div>

      {/* Version History List */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <h4 className="font-bold text-neutral-800 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0B8F63]" />
            Published Release Log ({publishedVersions.length} versions recorded)
          </h4>
        </div>

        {publishedVersions.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm">
            <AlertCircle className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            No previous version snapshots stored yet. Click "🚀 Publish Website" in the admin header to create your first version snapshot.
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {publishedVersions.map((ver, idx) => {
              const isCurrentLive = idx === 0 && !hasPendingDraft;
              const isExpanded = expandedVerId === ver.id;

              return (
                <div key={ver.id} className="p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        idx === 0 ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {ver.versionNumber || `v1.${publishedVersions.length - idx}`}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 text-sm">
                            Version {ver.versionNumber || `v1.${publishedVersions.length - idx}`}
                          </span>
                          {idx === 0 && (
                            <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-emerald-200">
                              LATEST PUBLISHED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 mt-0.5">{ver.summary || 'Global CMS publish release'}</p>
                        <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-1 font-mono">
                          <span>📅 {new Date(ver.publishedAt).toLocaleString()}</span>
                          <span>👤 {ver.publishedBy}</span>
                          <span>📝 {ver.changeCount || 1} modified items</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setExpandedVerId(isExpanded ? null : ver.id)}
                        className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-white text-neutral-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Inspect Snapshot</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleRollback(ver)}
                        disabled={restoringId === ver.id}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{restoringId === ver.id ? 'Restoring...' : 'Restore to Draft'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Snapshot Details */}
                  {isExpanded && ver.data && (
                    <div className="mt-4 p-4 bg-neutral-100/80 rounded-xl border border-neutral-200 text-xs space-y-3 animate-in fade-in duration-150">
                      <h5 className="font-bold text-neutral-800 text-xs uppercase tracking-wider text-[11px]">
                        Snapshot Data Summary (Version {ver.versionNumber}):
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-neutral-700">
                        <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                          <span className="text-neutral-400 block text-[10px]">Total Products</span>
                          <span className="font-bold text-neutral-900 text-sm">{ver.data.products?.length || 0}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                          <span className="text-neutral-400 block text-[10px]">Customer Reviews</span>
                          <span className="font-bold text-neutral-900 text-sm">{ver.data.reviews?.length || 0}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                          <span className="text-neutral-400 block text-[10px]">Store Name</span>
                          <span className="font-bold text-neutral-900 text-xs truncate block">{ver.data.storeInfo?.name || 'Marudhar'}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                          <span className="text-neutral-400 block text-[10px]">Announcements</span>
                          <span className="font-bold text-neutral-900 text-sm">{ver.data.announcements?.length || 0} items</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
