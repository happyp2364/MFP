import React, { useState, useEffect } from 'react';
import { Sliders, Globe, Mail, ShieldCheck, CheckCircle2, Save, RefreshCw, Link as LinkIcon, Image, Sparkles, Building } from 'lucide-react';
import {
  PlatformConfig,
  getPlatformConfig,
  savePlatformConfig,
  subscribePlatformConfig,
  buildWebsiteUrl,
} from '../../lib/platformConfig';

interface PlatformConfigManagerViewProps {
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  isSuperAdmin?: boolean;
}

export const PlatformConfigManagerView: React.FC<PlatformConfigManagerViewProps> = ({
  showToast,
  isSuperAdmin = true,
}) => {
  const [config, setConfig] = useState<PlatformConfig>(getPlatformConfig());
  const [sampleSlug, setSampleSlug] = useState<string>('happy-footwear');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const unsub = subscribePlatformConfig((newConfig) => {
      setConfig(newConfig);
    });
    return () => unsub();
  }, []);

  const handleChange = (field: keyof PlatformConfig, value: string) => {
    setConfig((prev) => {
      const updated = { ...prev, [field]: value };
      setHasChanges(true);
      return updated;
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isSuperAdmin) {
      showToast('error', 'Super Admin privileges required to edit Platform Configuration.');
      return;
    }

    setIsSaving(true);
    try {
      // Normalize base URL
      let cleanBaseUrl = config.platformBaseUrl.trim();
      if (cleanBaseUrl && !cleanBaseUrl.startsWith('http://') && !cleanBaseUrl.startsWith('https://')) {
        cleanBaseUrl = `https://${cleanBaseUrl}`;
      }
      cleanBaseUrl = cleanBaseUrl.replace(/\/+$/, '');

      const updatedConfig = {
        ...config,
        platformBaseUrl: cleanBaseUrl,
      };

      await savePlatformConfig(updatedConfig);
      setConfig(updatedConfig);
      setHasChanges(false);
      showToast('success', 'Centralized Platform Configuration saved successfully!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to save Platform Configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const generatedPreview = buildWebsiteUrl(sampleSlug, config);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-neutral-900 text-base">Centralized Platform Configuration</h3>
              <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                Live Dynamic Sync
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Configure global platform branding, default domain endpoints, support email, and base URL resolution. All website URLs across multi-tenant stores are dynamically computed from this base URL.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={isSaving || !hasChanges}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all shrink-0"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Config...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Controls */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-5">
          <h4 className="font-bold text-neutral-800 text-sm flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Building className="w-4 h-4 text-amber-600" />
            Platform Identity & Global Parameters
          </h4>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            
            {/* 1. Platform Name */}
            <div>
              <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1.5">
                Platform Name *
              </label>
              <input
                type="text"
                required
                value={config.platformName}
                onChange={(e) => handleChange('platformName', e.target.value)}
                placeholder="e.g. NWD Platform"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-neutral-900 font-bold text-xs focus:border-amber-500 focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-neutral-400 mt-1">Short technical identifier for backend operations and platform headers.</p>
            </div>

            {/* 2. Platform Display Name */}
            <div>
              <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1.5">
                Platform Display Name *
              </label>
              <input
                type="text"
                required
                value={config.platformDisplayName}
                onChange={(e) => handleChange('platformDisplayName', e.target.value)}
                placeholder="e.g. NWD Multi-Store Enterprise Platform"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-neutral-900 font-bold text-xs focus:border-amber-500 focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-neutral-400 mt-1">Full human-readable title presented in Super Admin console and reports.</p>
            </div>

            {/* 3. Platform Base URL */}
            <div>
              <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1.5">
                Platform Base URL *
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={config.platformBaseUrl}
                  onChange={(e) => handleChange('platformBaseUrl', e.target.value)}
                  placeholder="https://nwd-phi.vercel.app"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pl-10 pr-3.5 text-amber-700 font-mono text-xs focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">
                Root endpoint used to compute every tenant website URL (<code className="font-mono bg-neutral-100 px-1 rounded">platformBaseUrl + "/" + websiteSlug</code>).
              </p>
            </div>

            {/* 4. Platform Support Email */}
            <div>
              <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1.5">
                Platform Support Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={config.platformSupportEmail}
                  onChange={(e) => handleChange('platformSupportEmail', e.target.value)}
                  placeholder="support@nwd-phi.vercel.app"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pl-10 pr-3.5 text-neutral-900 font-mono text-xs focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">Default contact email for automated alerts, verification notifications, and store inquiries.</p>
            </div>

            {/* 5. Platform Logo */}
            <div>
              <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1.5">
                Platform Logo URL *
              </label>
              <div className="relative">
                <Image className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={config.platformLogo}
                  onChange={(e) => handleChange('platformLogo', e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pl-10 pr-3.5 text-neutral-900 font-mono text-xs focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">Branding image URL displayed across administrative control panels and white-label portals.</p>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSaving || !hasChanges}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>Save Platform Config</span>
              </button>
            </div>
          </form>
        </div>

        {/* Dynamic Live URL Preview & Rules */}
        <div className="space-y-6">
          
          <div className="bg-neutral-900 text-white rounded-2xl p-6 border border-neutral-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Dynamic Website URL Generator Test
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Verify how store website URLs are dynamically constructed from the centralized Platform Base URL parameter:
            </p>

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-neutral-400 block mb-1 uppercase">
                  Test Website Slug:
                </label>
                <input
                  type="text"
                  value={sampleSlug}
                  onChange={(e) => setSampleSlug(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Platform Base URL:</span>
                  <span className="font-mono text-neutral-300">{config.platformBaseUrl || 'https://nwd-phi.vercel.app'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Website Slug:</span>
                  <span className="font-mono text-neutral-300">/{sampleSlug || 'happy-footwear'}</span>
                </div>
                <div className="pt-2 border-t border-neutral-800 flex items-center gap-2 text-xs">
                  <LinkIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-emerald-400 truncate font-mono">
                    {generatedPreview}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-neutral-800/60 rounded-xl text-[11px] text-neutral-300 space-y-1">
              <span className="font-bold text-amber-400 block">Strict Compliance Rule:</span>
              <p>
                No component or module is allowed to use hardcoded project names or domain strings. All URLs are computed dynamically as <code className="text-amber-300 font-mono">platformBaseUrl + "/" + websiteSlug</code>.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-3">
            <h5 className="font-bold text-neutral-900 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Super Admin Governance
            </h5>
            <ul className="text-xs text-neutral-600 space-y-2 list-disc pl-4">
              <li>Changes are saved directly to Firestore under <code className="bg-neutral-100 px-1 rounded font-mono text-[11px]">settings/platform_config</code>.</li>
              <li>Connected clients automatically synchronize platform configuration changes in real time.</li>
              <li>Provides backward compatibility across white-label store instances.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
