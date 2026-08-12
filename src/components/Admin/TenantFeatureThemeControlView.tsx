import React, { useState, useEffect } from 'react';
import {
  Globe,
  Palette,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Copy,
  CheckCircle2,
  XCircle,
  Eye,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Sparkles,
  Layers,
  Settings,
  Lock,
  Unlock,
  Building2,
  User,
  Mail,
  AlertTriangle,
  Layout,
  CheckSquare,
  Square,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { Tenant, AdminUser } from '../../types';
import { FEATURE_CATEGORIES, FEATURE_REGISTRY, FeatureCategory, getFeaturesByCategory } from '../../lib/featureRegistry';
import { THEME_PRESETS, TenantThemeConfig, getDefaultThemeConfig } from '../../lib/themePresets';
import {
  getTenantFeatureSettings,
  saveTenantFeatureSettings,
  getTenantThemeSettings,
  saveTenantThemeSettings,
  copyTenantConfiguration,
  bulkUpdateTenantFeatures,
  TenantFeatureSettings,
} from '../../lib/tenantFeatureService';
import { buildWebsiteUrl, buildAdminLoginUrl } from '../../lib/platformConfig';

interface TenantFeatureThemeControlViewProps {
  tenants: Tenant[];
  admins: AdminUser[];
  currentUser: AdminUser | null;
  onRefresh: () => void;
}

export const TenantFeatureThemeControlView: React.FC<TenantFeatureThemeControlViewProps> = ({
  tenants,
  admins,
  currentUser,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
  const [tenantFeatureMap, setTenantFeatureMap] = useState<Record<string, TenantFeatureSettings>>({});
  const [tenantThemeMap, setTenantThemeMap] = useState<Record<string, TenantThemeConfig>>({});
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeModalTenant, setActiveModalTenant] = useState<Tenant | null>(null);
  const [modalType, setModalType] = useState<'theme' | 'features' | 'copy' | 'preview' | 'config_json' | null>(null);

  // Form states inside modals
  const [editingTheme, setEditingTheme] = useState<TenantThemeConfig | null>(null);
  const [editingFeatures, setEditingFeatures] = useState<Record<string, boolean>>({});
  const [editingPlatformLocked, setEditingPlatformLocked] = useState<Record<string, boolean>>({});
  const [activeCategoryTab, setActiveCategoryTab] = useState<FeatureCategory>('store');

  // Copy config state
  const [copySourceTenantId, setCopySourceTenantId] = useState<string>('');
  const [copyOptions, setCopyOptions] = useState({
    copyTheme: true,
    copyFeatures: true,
    copyStorefrontConfig: true,
    copyMarketingConfig: true,
    copyPaymentConfig: false,
  });

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAllTenantConfigs = async () => {
    setLoading(true);
    const featMap: Record<string, TenantFeatureSettings> = {};
    const thmMap: Record<string, TenantThemeConfig> = {};

    await Promise.all(
      tenants.map(async (t) => {
        featMap[t.id] = await getTenantFeatureSettings(t.id);
        thmMap[t.id] = await getTenantThemeSettings(t.id);
      })
    );

    setTenantFeatureMap(featMap);
    setTenantThemeMap(thmMap);
    setLoading(false);
  };

  useEffect(() => {
    if (tenants.length > 0) {
      loadAllTenantConfigs();
    } else {
      setLoading(false);
    }
  }, [tenants]);

  const filteredTenants = tenants.filter(
    (t) =>
      (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.ownerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectTenant = (id: string) => {
    setSelectedTenantIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllTenants = () => {
    if (selectedTenantIds.length === filteredTenants.length) {
      setSelectedTenantIds([]);
    } else {
      setSelectedTenantIds(filteredTenants.map((t) => t.id));
    }
  };

  // Modal Openers
  const openThemeEditor = (tenant: Tenant) => {
    setActiveModalTenant(tenant);
    setEditingTheme(tenantThemeMap[tenant.id] || getDefaultThemeConfig('modern_light'));
    setModalType('theme');
  };

  const openFeatureEditor = (tenant: Tenant) => {
    setActiveModalTenant(tenant);
    const curr = tenantFeatureMap[tenant.id];
    setEditingFeatures(curr ? curr.features : {});
    setEditingPlatformLocked(curr && curr.platformLocked ? curr.platformLocked : {});
    setModalType('features');
  };

  const openThemePreview = (tenant: Tenant) => {
    setActiveModalTenant(tenant);
    setEditingTheme(tenantThemeMap[tenant.id] || getDefaultThemeConfig('modern_light'));
    setModalType('preview');
  };

  const openConfigJson = (tenant: Tenant) => {
    setActiveModalTenant(tenant);
    setModalType('config_json');
  };

  // Save Handlers
  const handleSaveTheme = async () => {
    if (!activeModalTenant || !editingTheme) return;
    try {
      await saveTenantThemeSettings(activeModalTenant.id, editingTheme, currentUser?.email || 'Super Admin');
      showToast('success', `Theme configuration saved for ${activeModalTenant.name}`);
      setModalType(null);
      loadAllTenantConfigs();
    } catch (e: any) {
      showToast('error', `Failed to save theme: ${e.message}`);
    }
  };

  const handleSaveFeatures = async () => {
    if (!activeModalTenant) return;
    try {
      await saveTenantFeatureSettings(
        activeModalTenant.id,
        {
          features: editingFeatures,
          platformLocked: editingPlatformLocked,
        },
        currentUser?.email || 'Super Admin'
      );
      showToast('success', `Feature flags saved for ${activeModalTenant.name}`);
      setModalType(null);
      loadAllTenantConfigs();
    } catch (e: any) {
      showToast('error', `Failed to save feature flags: ${e.message}`);
    }
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = THEME_PRESETS[presetId];
    if (preset && editingTheme) {
      setEditingTheme({
        ...preset,
        id: editingTheme.id,
        name: editingTheme.name,
      });
      showToast('info', `Preset "${preset.name}" loaded. Click Save to apply.`);
    }
  };

  const handleExecuteCopyConfig = async () => {
    if (!copySourceTenantId) {
      showToast('error', 'Select a source tenant first.');
      return;
    }
    if (selectedTenantIds.length === 0) {
      showToast('error', 'Select at least one destination tenant.');
      return;
    }

    try {
      const res = await copyTenantConfiguration(
        copySourceTenantId,
        selectedTenantIds,
        copyOptions,
        currentUser?.email || 'Super Admin'
      );
      if (res.success) {
        showToast('success', `Configuration safely copied to ${res.copiedCount} tenants!`);
        setModalType(null);
        loadAllTenantConfigs();
      } else {
        showToast('error', `Errors occurred during copy: ${res.errors.join(', ')}`);
      }
    } catch (e: any) {
      showToast('error', `Copy failed: ${e.message}`);
    }
  };

  const handleBulkEnableAllInCategory = (cat: FeatureCategory, enable: boolean) => {
    const catFeats = getFeaturesByCategory(cat);
    setEditingFeatures((prev) => {
      const next = { ...prev };
      catFeats.forEach((f) => {
        next[f.id] = enable;
      });
      return next;
    });
  };

  return (
    <div className="space-y-6 text-white animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-2xl animate-bounce ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-300'
              : 'bg-blue-950/90 border-blue-500/50 text-blue-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{toast.msg}</span>
          </div>
          <button onClick={() => setToast(null)}>
            <XCircle className="w-4 h-4 hover:opacity-80" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                TENANT FEATURE & THEME CONTROL
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Per-Tenant Autonomous Branding, Independent Themes, and Complete Enterprise Feature Governance
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalType('copy')}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-amber-500/30 font-bold text-xs rounded-xl flex items-center gap-2 transition"
          >
            <Copy className="w-4 h-4" /> Copy Config
          </button>
          <button
            onClick={loadAllTenantConfigs}
            disabled={loading}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 font-bold text-xs rounded-xl flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Live States
          </button>
        </div>
      </div>

      {/* Filter and Bulk Bar */}
      <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search websites by name, ID, owner..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-amber-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={selectAllTenants}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 hover:text-white"
          >
            {selectedTenantIds.length === filteredTenants.length && filteredTenants.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-amber-400" />
            ) : (
              <Square className="w-4 h-4 text-neutral-500" />
            )}
            <span>Select All ({selectedTenantIds.length}/{filteredTenants.length})</span>
          </button>
          {selectedTenantIds.length > 0 && (
            <span className="text-amber-400 font-mono font-bold">
              {selectedTenantIds.length} tenants selected for bulk actions
            </span>
          )}
        </div>
      </div>

      {/* Tenants Table / Grid */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/50 text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                <th className="p-4 w-10 text-center">Sel</th>
                <th className="p-4">Website & Tenant ID</th>
                <th className="p-4">Owner Email</th>
                <th className="p-4">Status</th>
                <th className="p-4">Current Theme</th>
                <th className="p-4">Active Features</th>
                <th className="p-4">Last Updated</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-xs">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-500 font-bold">
                    No website tenants found matching query.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const isSelected = selectedTenantIds.includes(tenant.id);
                  const featSettings = tenantFeatureMap[tenant.id];
                  const themeSettings = tenantThemeMap[tenant.id] || getDefaultThemeConfig('modern_light');

                  const enabledCount = featSettings
                    ? Object.values(featSettings.features).filter(Boolean).length
                    : FEATURE_REGISTRY.filter((f) => f.defaultEnabled).length;
                  const totalCount = FEATURE_REGISTRY.length;

                  return (
                    <tr key={tenant.id} className={`hover:bg-neutral-900/40 transition ${isSelected ? 'bg-amber-500/5' : ''}`}>
                      <td className="p-4 text-center">
                        <button onClick={() => toggleSelectTenant(tenant.id)}>
                          {isSelected ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4 text-neutral-600" />}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>{tenant.name}</span>
                        </div>
                        <div className="text-[10px] font-mono text-neutral-500 flex items-center gap-1.5 mt-0.5">
                          <span>ID: {tenant.id}</span>
                          <span>•</span>
                          <span className="text-sky-400">{tenant.slug}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-neutral-300">
                        {tenant.ownerEmail || 'Unassigned'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            tenant.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                          {tenant.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-neutral-700 shrink-0"
                            style={{ backgroundColor: themeSettings.primaryColor }}
                          />
                          <span className="font-bold text-neutral-200">{themeSettings.name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono">
                        <span className="text-amber-400 font-bold">{enabledCount}</span>
                        <span className="text-neutral-500"> / {totalCount} ON</span>
                      </td>
                      <td className="p-4 text-neutral-400 text-[10px] font-mono">
                        {featSettings?.updatedAt
                          ? new Date(featSettings.updatedAt).toLocaleDateString()
                          : 'Default'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={buildWebsiteUrl(tenant.slug || tenant.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg border border-neutral-800 transition"
                            title="Open Storefront"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => openThemePreview(tenant)}
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-sky-400 rounded-lg border border-neutral-800 transition"
                            title="Preview Theme"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openThemeEditor(tenant)}
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-400 rounded-lg border border-neutral-800 transition"
                            title="Theme Controls"
                          >
                            <Palette className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openFeatureEditor(tenant)}
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-emerald-400 rounded-lg border border-neutral-800 transition"
                            title="Feature Controls"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openConfigJson(tenant)}
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-purple-400 rounded-lg border border-neutral-800 transition"
                            title="Raw JSON Config"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* THEME EDITOR MODAL */}
      {modalType === 'theme' && activeModalTenant && editingTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-400" />
                  Per-Tenant Theme Configurator
                </h3>
                <p className="text-xs text-neutral-400 font-mono">
                  Website: {activeModalTenant.name} ({activeModalTenant.id})
                </p>
              </div>
              <button onClick={() => setModalType(null)} className="p-2 text-neutral-400 hover:text-white rounded-xl">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Presets Quick-Select */}
              <div className="space-y-2">
                <label className="text-neutral-400 font-bold uppercase tracking-wider block">
                  Load Theme Preset Template (Applies to this tenant only)
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(THEME_PRESETS).map((pKey) => {
                    const preset = THEME_PRESETS[pKey];
                    return (
                      <button
                        key={pKey}
                        onClick={() => handleApplyPreset(pKey)}
                        className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-200 font-bold flex items-center gap-2 transition"
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primaryColor }} />
                        {preset.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Controls */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider block">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingTheme.primaryColor}
                      onChange={(e) => setEditingTheme({ ...editingTheme, primaryColor: e.target.value })}
                      className="w-10 h-10 bg-transparent rounded cursor-pointer"
                    />
                    <span className="font-mono text-white">{editingTheme.primaryColor}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider block">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingTheme.secondaryColor}
                      onChange={(e) => setEditingTheme({ ...editingTheme, secondaryColor: e.target.value })}
                      className="w-10 h-10 bg-transparent rounded cursor-pointer"
                    />
                    <span className="font-mono text-white">{editingTheme.secondaryColor}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider block">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingTheme.accentColor}
                      onChange={(e) => setEditingTheme({ ...editingTheme, accentColor: e.target.value })}
                      className="w-10 h-10 bg-transparent rounded cursor-pointer"
                    />
                    <span className="font-mono text-white">{editingTheme.accentColor}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider block">Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingTheme.backgroundColor}
                      onChange={(e) => setEditingTheme({ ...editingTheme, backgroundColor: e.target.value })}
                      className="w-10 h-10 bg-transparent rounded cursor-pointer"
                    />
                    <span className="font-mono text-white">{editingTheme.backgroundColor}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider block">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingTheme.textColor}
                      onChange={(e) => setEditingTheme({ ...editingTheme, textColor: e.target.value })}
                      className="w-10 h-10 bg-transparent rounded cursor-pointer"
                    />
                    <span className="font-mono text-white">{editingTheme.textColor}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider block">Border Radius</label>
                  <input
                    type="text"
                    value={editingTheme.borderRadius}
                    onChange={(e) => setEditingTheme({ ...editingTheme, borderRadius: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                    placeholder="e.g. 16px"
                  />
                </div>
              </div>

              {/* Styles Selectors */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider block">Button Style</label>
                  <select
                    value={editingTheme.buttonStyle}
                    onChange={(e) => setEditingTheme({ ...editingTheme, buttonStyle: e.target.value as any })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="rounded">Rounded</option>
                    <option value="pill">Pill (Capsule)</option>
                    <option value="square">Square</option>
                    <option value="sharp">Sharp Minimal</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider block">Card Style</label>
                  <select
                    value={editingTheme.cardStyle}
                    onChange={(e) => setEditingTheme({ ...editingTheme, cardStyle: e.target.value as any })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="bordered">Bordered</option>
                    <option value="shadow">Soft Shadow</option>
                    <option value="flat">Flat Minimal</option>
                    <option value="glass">Glassmorphism</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider block">Storefront Theme</label>
                  <select
                    value={editingTheme.storefrontTheme}
                    onChange={(e) => setEditingTheme({ ...editingTheme, storefrontTheme: e.target.value as any })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                    <option value="auto">Auto / System</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
              <button
                onClick={() => activeModalTenant && openThemePreview(activeModalTenant)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-sky-400 border border-neutral-800 rounded-xl font-bold transition flex items-center gap-2 text-xs"
              >
                <Eye className="w-4 h-4" /> Live Theme Preview
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalType(null)}
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTheme}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
                >
                  Save Theme to Tenant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE CONTROL MODAL */}
      {modalType === 'features' && activeModalTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  Per-Tenant Enterprise Feature Control
                </h3>
                <p className="text-xs text-neutral-400 font-mono">
                  Website: {activeModalTenant.name} ({activeModalTenant.id})
                </p>
              </div>
              <button onClick={() => setModalType(null)} className="p-2 text-neutral-400 hover:text-white rounded-xl">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1 p-2 bg-neutral-900/80 border-b border-neutral-800 overflow-x-auto scrollbar-none text-xs">
              {FEATURE_CATEGORIES.map((cat) => {
                const isActive = activeCategoryTab === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategoryTab(cat.key)}
                    className={`px-3 py-2 font-bold rounded-xl whitespace-nowrap transition ${
                      isActive ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Feature Toggles List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="flex justify-between items-center mb-2">
                <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                  Category: {FEATURE_CATEGORIES.find((c) => c.key === activeCategoryTab)?.description}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkEnableAllInCategory(activeCategoryTab, true)}
                    className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold rounded-lg text-[10px]"
                  >
                    Enable All in Category
                  </button>
                  <button
                    onClick={() => handleBulkEnableAllInCategory(activeCategoryTab, false)}
                    className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold rounded-lg text-[10px]"
                  >
                    Disable All in Category
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getFeaturesByCategory(activeCategoryTab).map((feat) => {
                  const isEnabled = editingFeatures[feat.id] !== undefined ? editingFeatures[feat.id] : feat.defaultEnabled;
                  const isLocked = editingPlatformLocked[feat.id] || false;

                  return (
                    <div
                      key={feat.id}
                      className={`p-4 border rounded-2xl transition flex flex-col justify-between ${
                        isEnabled ? 'bg-neutral-900/80 border-emerald-500/30' : 'bg-neutral-950 border-neutral-800 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-sm">{feat.name}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => setEditingFeatures({ ...editingFeatures, [feat.id]: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                          </label>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">{feat.description}</p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[10px]">
                        <span className="font-mono text-neutral-500">ID: {feat.id}</span>
                        <button
                          onClick={() => setEditingPlatformLocked({ ...editingPlatformLocked, [feat.id]: !isLocked })}
                          className={`flex items-center gap-1 font-bold ${isLocked ? 'text-amber-400' : 'text-neutral-500 hover:text-white'}`}
                        >
                          {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          <span>{isLocked ? 'Platform Locked' : 'Tenant Changeable'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
              <span className="text-xs text-neutral-400 font-mono">
                {Object.values(editingFeatures).filter(Boolean).length} features enabled
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalType(null)}
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFeatures}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
                >
                  Save Features to Tenant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COPY CONFIGURATION MODAL */}
      {modalType === 'copy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Copy className="w-5 h-5 text-amber-400" />
                Copy Configuration Between Tenants
              </h3>
              <button onClick={() => setModalType(null)} className="p-2 text-neutral-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-[11px] leading-relaxed">
                <strong>SAFE COPY GUARANTEE:</strong> Copying configuration copies only theme styling, feature toggles, and layout settings. Products, orders, customers, staff accounts, and payment secrets are <strong>NEVER</strong> copied.
              </div>

              <div className="space-y-2">
                <label className="text-neutral-400 font-bold uppercase tracking-wider block">Source Website (Copy From)</label>
                <select
                  value={copySourceTenantId}
                  onChange={(e) => setCopySourceTenantId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white font-bold outline-none"
                >
                  <option value="">-- Select Source Tenant --</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-neutral-400 font-bold uppercase tracking-wider block">
                  Destination Tenants ({selectedTenantIds.length} Selected)
                </label>
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl font-mono text-neutral-300 max-h-28 overflow-y-auto">
                  {selectedTenantIds.length === 0 ? (
                    <span className="text-rose-400">No destination tenants selected in table checkbox!</span>
                  ) : (
                    selectedTenantIds.map((id) => <div key={id}>• {id}</div>)
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-neutral-400 font-bold uppercase tracking-wider block">Select Configuration Modules to Copy</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-3 bg-neutral-900 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={copyOptions.copyTheme}
                      onChange={(e) => setCopyOptions({ ...copyOptions, copyTheme: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span className="font-bold text-white">Theme & Styling</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 bg-neutral-900 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={copyOptions.copyFeatures}
                      onChange={(e) => setCopyOptions({ ...copyOptions, copyFeatures: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span className="font-bold text-white">Feature Toggles</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 bg-neutral-900 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={copyOptions.copyStorefrontConfig}
                      onChange={(e) => setCopyOptions({ ...copyOptions, copyStorefrontConfig: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span className="font-bold text-white">Storefront Banners</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 bg-neutral-900 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={copyOptions.copyMarketingConfig}
                      onChange={(e) => setCopyOptions({ ...copyOptions, copyMarketingConfig: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span className="font-bold text-white">Marketing Widgets</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 flex justify-end gap-3">
              <button onClick={() => setModalType(null)} className="px-5 py-2 bg-neutral-900 text-neutral-300 font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button
                onClick={handleExecuteCopyConfig}
                disabled={!copySourceTenantId || selectedTenantIds.length === 0}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg disabled:opacity-50"
              >
                Execute Configuration Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THEME PREVIEW MODAL */}
      {modalType === 'preview' && activeModalTenant && editingTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-sky-400" />
                Live Storefront Theme Simulator: {activeModalTenant.name}
              </h3>
              <button onClick={() => setModalType(null)} className="p-2 text-neutral-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-6" style={{ backgroundColor: editingTheme.backgroundColor, color: editingTheme.textColor }}>
              {/* Simulated Header */}
              <div className="p-4 rounded-2xl border flex justify-between items-center" style={{ borderColor: editingTheme.secondaryColor }}>
                <span className="font-black text-lg" style={{ fontFamily: editingTheme.headingFont }}>{activeModalTenant.name}</span>
                <div className="flex gap-4 text-xs font-bold">
                  <span>Home</span>
                  <span>Products</span>
                  <span>About</span>
                  <span>Contact</span>
                </div>
              </div>

              {/* Simulated Hero */}
              <div
                className="p-8 rounded-3xl text-center space-y-3"
                style={{
                  backgroundColor: editingTheme.primaryColor,
                  color: '#ffffff',
                  borderRadius: editingTheme.borderRadius,
                }}
              >
                <h2 className="text-2xl font-black" style={{ fontFamily: editingTheme.headingFont }}>
                  Welcome to {activeModalTenant.name}
                </h2>
                <p className="text-xs opacity-80 max-w-md mx-auto">
                  Experience modern shopping with customized per-tenant styling and instant checkout.
                </p>
                <button
                  className="px-6 py-2.5 font-bold text-xs shadow-lg transition"
                  style={{
                    backgroundColor: editingTheme.accentColor,
                    color: '#000000',
                    borderRadius: editingTheme.borderRadius,
                  }}
                >
                  Shop Collection
                </button>
              </div>

              {/* Simulated Product Card */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-4 border rounded-2xl space-y-3"
                  style={{ borderColor: editingTheme.secondaryColor, borderRadius: editingTheme.borderRadius }}
                >
                  <div className="h-28 bg-neutral-200/20 rounded-xl flex items-center justify-center font-bold text-xs opacity-50">
                    Product Image
                  </div>
                  <h4 className="font-bold text-sm">Sample Premium Sneakers</h4>
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-black text-amber-500">₹2,499</span>
                    <button
                      className="px-3 py-1.5 text-xs font-bold text-white"
                      style={{ backgroundColor: editingTheme.primaryColor, borderRadius: editingTheme.borderRadius }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex justify-end">
              <button onClick={() => setModalType(null)} className="px-6 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
