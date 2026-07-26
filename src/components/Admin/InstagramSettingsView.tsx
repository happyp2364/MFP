import React, { useState } from 'react';
import {
  Instagram,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Key,
  Globe,
  Grid,
  LayoutList,
  Columns,
  Eye,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
  Info,
  Sliders,
  Check,
  XCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { InstagramConfig } from '../../types';

export const InstagramSettingsView: React.FC = () => {
  const { instagramConfig, updateInstagramConfig } = useStore();

  const [enabled, setEnabled] = useState(instagramConfig.enabled ?? true);
  const [username, setUsername] = useState(instagramConfig.username || 'marudhar_fashion_point');
  const [displayName, setDisplayName] = useState(instagramConfig.displayName || 'Marudhar Fashion Point');
  const [accessToken, setAccessToken] = useState(instagramConfig.accessToken || '');
  const [appId, setAppId] = useState(instagramConfig.appId || '');
  const [postLimit, setPostLimit] = useState<number>(instagramConfig.postLimit || 8);
  const [layout, setLayout] = useState<'grid' | 'carousel' | 'masonry'>(instagramConfig.layout || 'grid');
  const [showBio, setShowBio] = useState(instagramConfig.showBio ?? true);
  const [showStats, setShowStats] = useState(instagramConfig.showStats ?? true);
  const [autoRefreshMinutes, setAutoRefreshMinutes] = useState(instagramConfig.autoRefreshMinutes || 30);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; profile?: any } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Test Access Token with Meta API
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/instagram/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: accessToken.trim() }),
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Connected successfully!' : 'Connection failed'),
        profile: data.profile,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to reach backend test endpoint.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Save Settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updated: Partial<InstagramConfig> = {
        enabled,
        username: username.trim().replace(/^@/, ''),
        displayName: displayName.trim(),
        accessToken: accessToken.trim(),
        appId: appId.trim(),
        postLimit,
        layout,
        showBio,
        showStats,
        autoRefreshMinutes,
      };

      await updateInstagramConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save instagram settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect Meta Instagram Graph API?')) {
      setAccessToken('');
      await updateInstagramConfig({ accessToken: '' });
      setTestResult(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white p-6 sm:p-8 rounded-3xl border border-neutral-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-2xl shadow-lg text-white shrink-0">
              <Instagram className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-serif-heading text-white">
                  Live Instagram Integration
                </h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Meta Graph API Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Display live Instagram feed, profile bio, followers count, and latest posts for{' '}
                <strong className="text-amber-400 font-semibold">@{username}</strong>.
              </p>
            </div>
          </div>

          <a
            href={`https://www.instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 shrink-0"
          >
            <span>View @{username} on Instagram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Toggle & Connection Status */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <span>Show Instagram Section on Website</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Enable or disable the live Instagram profile and posts section on the homepage.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-[#0B8F63]"></div>
            </label>
          </div>

          {/* Profile Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Instagram Handle / Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400 font-bold text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="marudhar_fashion_point"
                  required
                  className="w-full pl-8 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-semibold text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B8F63]"
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1.5">
                Official profile handle. Direct link will point to instagram.com/{username}.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Display Title
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Marudhar Fashion Point"
                required
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-semibold text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B8F63]"
              />
              <p className="text-[11px] text-neutral-500 mt-1.5">
                Store branding title shown on the Instagram header card.
              </p>
            </div>
          </div>
        </div>

        {/* Meta Instagram Graph API Access Token Configuration */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <span>Meta Instagram Graph API Authentication</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Enter your Long-Lived Access Token to fetch live posts directly from Meta's API servers.
              </p>
            </div>

            {accessToken ? (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Token Configured
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-600" />
                Smart Live Engine
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Instagram Graph API Access Token
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="EAA..."
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-mono text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B8F63]"
              />
              <p className="text-[11px] text-neutral-500 mt-1.5">
                Tokens are encrypted server-side and never exposed to website visitors. If left empty, the website automatically displays live profile information for @{username}.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Meta App ID (Optional)
              </label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1029384756..."
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-mono text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B8F63]"
              />
            </div>

            {/* Test Connection Button */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 text-amber-400 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing Meta API Connection...' : 'Test Meta Connection'}</span>
              </button>

              {accessToken && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors border border-rose-200"
                >
                  Disconnect Token
                </button>
              )}
            </div>

            {/* Test Result Message */}
            {testResult && (
              <div
                className={`p-4 rounded-2xl text-xs border ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold text-sm">{testResult.message}</p>
                    {testResult.profile && (
                      <div className="mt-2 text-xs space-y-1 text-emerald-900">
                        <p>• Verified Profile: @{testResult.profile.username}</p>
                        <p>• Followers: {testResult.profile.followersCount}</p>
                        <p>• Posts Count: {testResult.profile.postsCount}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Display & Layout Settings */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 pb-4 border-b border-neutral-100">
            <Sliders className="w-5 h-5 text-purple-600" />
            <span>Feed Layout & Display Preferences</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Number of Posts */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Number of Posts to Display
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[4, 6, 8, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPostLimit(num)}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                      postLimit === num
                        ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-md shadow-[#0B8F63]/20'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {num} Posts
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Style */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Layout Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLayout('grid')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    layout === 'grid'
                      ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-md shadow-[#0B8F63]/20'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span>Responsive Grid</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLayout('carousel')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    layout === 'carousel'
                      ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-md shadow-[#0B8F63]/20'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                  <span>Carousel Slider</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLayout('masonry')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    layout === 'masonry'
                      ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-md shadow-[#0B8F63]/20'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <Columns className="w-4 h-4" />
                  <span>Masonry Staggered</span>
                </button>
              </div>
            </div>
          </div>

          {/* Display Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-100/80 transition-colors">
              <span className="text-xs font-bold text-neutral-800">Show Profile Biography (Bio)</span>
              <input
                type="checkbox"
                checked={showBio}
                onChange={(e) => setShowBio(e.target.checked)}
                className="w-4 h-4 text-[#0B8F63] rounded focus:ring-[#0B8F63]"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-100/80 transition-colors">
              <span className="text-xs font-bold text-neutral-800">Show Followers & Post Counts</span>
              <input
                type="checkbox"
                checked={showStats}
                onChange={(e) => setShowStats(e.target.checked)}
                className="w-4 h-4 text-[#0B8F63] rounded focus:ring-[#0B8F63]"
              />
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
            <span>Last synced: {instagramConfig.lastSyncedAt ? new Date(instagramConfig.lastSyncedAt).toLocaleString() : 'Just now'}</span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-[#0B8F63] hover:bg-[#097551] text-white text-sm font-bold rounded-2xl shadow-lg shadow-[#0B8F63]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check className="w-5 h-5 text-emerald-300" />
                <span>Instagram Settings Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{isSaving ? 'Saving Settings...' : 'Save Instagram Settings'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
