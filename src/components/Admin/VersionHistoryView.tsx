import React from 'react';
import { History, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';

export const VersionHistoryView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-neutral-900 text-base">Real-Time Single Source of Truth Active</h3>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Direct Firestore Architecture
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              All administrative changes (products, stock status, pricing, hero banners, and settings) save directly to Firestore and synchronize instantly across all connected web clients in real-time.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
        <h4 className="font-bold text-neutral-800 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          System Architecture Highlights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-600">
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-1">
            <span className="font-bold text-neutral-900 block text-sm">⚡ Instant Save</span>
            <p>Admin edits are persisted straight to live Firestore collections without staging buffers.</p>
          </div>
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-1">
            <span className="font-bold text-neutral-900 block text-sm">🔄 Real-Time Push</span>
            <p>Active customers receive real-time updates via Firestore snapshot listeners without refreshing.</p>
          </div>
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-1">
            <span className="font-bold text-neutral-900 block text-sm">🔒 Atomic Partitioning</span>
            <p>Split collection schemas maintain optimal document sizes under 500 KB limit for ultra-fast performance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
