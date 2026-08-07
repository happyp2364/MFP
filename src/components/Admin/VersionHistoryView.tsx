import React, { useState, useEffect } from 'react';
import { History, CheckCircle2, Zap, ShieldCheck, Lock, Sliders, FileText, Sparkles, Layers, Crown } from 'lucide-react';
import {
  CURRENT_PLATFORM_VERSION,
  DEFAULT_PLATFORM_FEATURES,
  DEFAULT_PLATFORM_VERSIONS,
  fetchFeatureRegistry,
  generateReleaseNotes,
} from '../../lib/featureReleaseService';
import { PlatformFeature } from '../../types';

export const VersionHistoryView: React.FC = () => {
  const [features, setFeatures] = useState<PlatformFeature[]>(DEFAULT_PLATFORM_FEATURES);
  const [selectedVersion, setSelectedVersion] = useState<string>('all');

  useEffect(() => {
    fetchFeatureRegistry().then((res) => setFeatures(res)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Platform Version Banner */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-neutral-900 text-base">Website Platform Release Baseline</h3>
              <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {CURRENT_PLATFORM_VERSION}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Your store is running on the latest Enterprise Multi-Tenant Platform Build. Features are governed by Super Admin release flags stored in Firestore.
            </p>
          </div>
        </div>

        <div className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-right shrink-0">
          <span className="text-[10px] text-neutral-400 font-bold uppercase block">Governance Mode</span>
          <span className="text-xs font-bold text-neutral-800 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-amber-500" /> Super Admin Controlled
          </span>
        </div>
      </div>

      {/* Governance Rules for Website Admins */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
          <Lock className="w-4 h-4 text-amber-600" />
          <span>Platform Feature Release Policy</span>
        </div>
        <p className="text-xs text-amber-900/80 leading-relaxed">
          <strong>Website Admins cannot enable new platform features.</strong> Every new platform feature is disabled by default across all websites to protect store stability and guarantee backward compatibility. To enable or test new features for this website, please contact the Super Administrator.
        </p>
      </div>

      {/* Enabled vs Available Features */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
        <h4 className="font-bold text-neutral-800 text-sm flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600" />
          Registered Platform Features & Default Statuses
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((feat) => (
            <div key={feat.id} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-xs">{feat.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-neutral-200 text-neutral-700">
                  {feat.versionIntroduced}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">{feat.description}</p>
              <div className="flex items-center justify-between pt-1 text-[10px]">
                <span className="text-neutral-400 font-mono">{feat.id}</span>
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Disabled by Default
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automated Release Notes */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <h4 className="font-bold text-neutral-800 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-600" />
            Automated Platform Release Notes
          </h4>

          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="text-xs font-mono border border-neutral-300 rounded-lg px-2.5 py-1 text-neutral-700 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Releases</option>
            {DEFAULT_PLATFORM_VERSIONS.map((v) => (
              <option key={v.version} value={v.version}>
                {v.version} - {v.releaseName}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-neutral-900 text-neutral-200 p-5 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
          {generateReleaseNotes(selectedVersion === 'all' ? undefined : selectedVersion, features)}
        </div>
      </div>

      {/* Architecture Highlights */}
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
