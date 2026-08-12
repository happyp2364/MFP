import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Search,
  Building2,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  Lock,
  Unlock,
  Filter,
  Layers,
  Save,
  Check,
  RotateCcw,
  ShieldAlert,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { Tenant, AdminUser } from '../../types';
import {
  FEATURE_CATEGORIES,
  FEATURE_REGISTRY,
  FeatureCategory,
  getFeaturesByCategory,
  getDefaultFeatureConfig,
} from '../../lib/featureRegistry';
import {
  getTenantFeatureSettings,
  saveTenantFeatureSettings,
  TenantFeatureSettings,
} from '../../lib/tenantFeatureService';
import { buildWebsiteUrl } from '../../lib/platformConfig';

interface TenantFeatureManagerProps {
  tenants: Tenant[];
  currentUser: AdminUser | null;
  onRefresh?: () => void;
}

export const TenantFeatureManager: React.FC<TenantFeatureManagerProps> = ({
  tenants,
  currentUser,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Feature state for the selected tenant
  const [tenantFeatureData, setTenantFeatureData] = useState<TenantFeatureSettings>({
    features: getDefaultFeatureConfig(),
    platformLocked: {},
    tenantAdminCanControl: {},
    updatedAt: new Date().toISOString(),
  });

  // Feature counts map for list view
  const [tenantFeatureCounts, setTenantFeatureCounts] = useState<Record<string, number>>({});
  const [loadingTenantFeatures, setLoadingTenantFeatures] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Active category tab in feature detail pane
  const [activeCategory, setActiveCategory] = useState<FeatureCategory>('store');

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Pre-load feature counts for all tenants
  const loadFeatureCounts = async () => {
    const counts: Record<string, number> = {};
    await Promise.all(
      tenants.map(async (t) => {
        try {
          const res = await getTenantFeatureSettings(t.id);
          const enabledCount = Object.values(res.features).filter(Boolean).length;
          counts[t.id] = enabledCount;
        } catch {
          counts[t.id] = FEATURE_REGISTRY.filter((f) => f.defaultEnabled).length;
        }
      })
    );
    setTenantFeatureCounts(counts);
  };

  useEffect(() => {
    if (tenants.length > 0) {
      loadFeatureCounts();
      if (!selectedTenant) {
        setSelectedTenant(tenants[0]);
      }
    }
  }, [tenants]);

  // Load feature details when selected tenant changes
  useEffect(() => {
    if (!selectedTenant) return;

    let isMounted = true;
    setLoadingTenantFeatures(true);

    getTenantFeatureSettings(selectedTenant.id)
      .then((data) => {
        if (isMounted) {
          setTenantFeatureData(data);
          setLoadingTenantFeatures(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          showToast('error', `Failed loading features for ${selectedTenant.name}: ${err.message}`);
          setLoadingTenantFeatures(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedTenant]);

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.ownerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.slug || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || (t.status || 'active').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Handle single feature toggle
  const handleToggleFeature = (featureId: string, enabled: boolean) => {
    setTenantFeatureData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [featureId]: enabled,
      },
    }));
  };

  // Handle locking/unlocking feature from tenant modification
  const handleTogglePlatformLock = (featureId: string, locked: boolean) => {
    setTenantFeatureData((prev) => ({
      ...prev,
      platformLocked: {
        ...(prev.platformLocked || {}),
        [featureId]: locked,
      },
    }));
  };

  // Enable/Disable all features in active category
  const handleBulkCategoryToggle = (enable: boolean) => {
    const categoryFeatures = getFeaturesByCategory(activeCategory);
    setTenantFeatureData((prev) => {
      const nextFeatures = { ...prev.features };
      categoryFeatures.forEach((f) => {
        nextFeatures[f.id] = enable;
      });
      return {
        ...prev,
        features: nextFeatures,
      };
    });
  };

  // Reset to default configuration for selected tenant
  const handleResetToDefaults = () => {
    setTenantFeatureData((prev) => ({
      ...prev,
      features: getDefaultFeatureConfig(),
    }));
    showToast('info', 'Reset features to default configuration. Click Save to persist.');
  };

  // Save changes to Firestore scoped to current selected tenantId
  const handleSaveTenantFeatures = async () => {
    if (!selectedTenant) return;

    setIsSaving(true);
    try {
      const actorEmail = currentUser?.email || 'Super Admin';
      await saveTenantFeatureSettings(
        selectedTenant.id,
        {
          features: tenantFeatureData.features,
          platformLocked: tenantFeatureData.platformLocked,
        },
        actorEmail
      );

      // Update count badge
      const activeCount = Object.values(tenantFeatureData.features).filter(Boolean).length;
      setTenantFeatureCounts((prev) => ({
        ...prev,
        [selectedTenant.id]: activeCount,
      }));

      showToast('success', `Successfully saved feature settings for [${selectedTenant.name}] (${selectedTenant.id})`);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showToast('error', `Failed to save feature settings: ${err.message || String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const activeFeaturesInCategory = getFeaturesByCategory(activeCategory);
  const totalFeatures = FEATURE_REGISTRY.length;
  const currentTenantEnabledCount = Object.values(tenantFeatureData.features).filter(Boolean).length;

  return (
    <div className="space-y-6 text-white animate-in fade-in duration-200">
      {/* Toast Alert */}
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
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)}>
            <XCircle className="w-4 h-4 hover:opacity-80" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">TENANT FEATURE MANAGER</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Granular per-tenant feature toggling, platform locks, and strict tenant-scoped isolation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadFeatureCounts}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 font-bold text-xs rounded-xl flex items-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh List
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Tenant List, Right Feature Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Tenant List Selector (4 Cols) */}
        <div className="lg:col-span-4 bg-neutral-950 border border-neutral-800 rounded-3xl p-4 flex flex-col space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-neutral-400 tracking-wider">
                Websites & Tenants ({filteredTenants.length})
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tenant name, ID, or slug..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-amber-500 outline-none"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-1 p-1 bg-neutral-900/80 rounded-xl text-[10px] font-bold">
              {['all', 'active', 'suspended'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex-1 py-1 rounded-lg uppercase tracking-wider transition ${
                    statusFilter === status
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Tenants Scroll List */}
          <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1">
            {filteredTenants.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-xs">No matching tenants found.</div>
            ) : (
              filteredTenants.map((t) => {
                const isSelected = selectedTenant?.id === t.id;
                const activeCount = tenantFeatureCounts[t.id] ?? 0;

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTenant(t)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-lg'
                        : 'bg-neutral-900/50 border-neutral-800/80 text-neutral-300 hover:bg-neutral-900 hover:border-neutral-700'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <Building2
                          className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-400' : 'text-neutral-500'}`}
                        />
                        <span className="font-bold text-xs truncate text-white">{t.name}</span>
                      </div>
                      <div className="text-[10px] font-mono text-neutral-500 truncate">
                        ID: <span className="text-neutral-400">{t.id}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md font-mono text-[10px] font-bold text-amber-400">
                        {activeCount}/{totalFeatures}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Tenant Feature Configurator Panel (8 Cols) */}
        <div className="lg:col-span-8 bg-neutral-950 border border-neutral-800 rounded-3xl p-6 flex flex-col space-y-6">
          {!selectedTenant ? (
            <div className="p-12 text-center text-neutral-500 space-y-2">
              <Building2 className="w-10 h-10 mx-auto text-neutral-700" />
              <p className="text-xs">Select a website tenant from the left panel to configure its feature toggles.</p>
            </div>
          ) : (
            <>
              {/* Active Tenant Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">{selectedTenant.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        selectedTenant.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {selectedTenant.status || 'Active'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 mt-1 flex flex-wrap items-center gap-3">
                    <span>
                      Tenant ID: <strong className="text-amber-400">{selectedTenant.id}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Owner: <strong className="text-neutral-300">{selectedTenant.ownerEmail || 'Unassigned'}</strong>
                    </span>
                    <span>•</span>
                    <a
                      href={buildWebsiteUrl(selectedTenant.slug || selectedTenant.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 hover:underline flex items-center gap-1"
                    >
                      Storefront <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleResetToDefaults}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
                  </button>
                  <button
                    onClick={handleSaveTenantFeatures}
                    disabled={isSaving || loadingTenantFeatures}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save Changes for Tenant</span>
                  </button>
                </div>
              </div>

              {/* Feature Category Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1.5 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-x-auto scrollbar-none text-xs">
                {FEATURE_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`px-3.5 py-2 font-bold rounded-xl whitespace-nowrap transition ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Category Helper Bar */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-neutral-400 text-[11px] font-medium">
                  {FEATURE_CATEGORIES.find((c) => c.key === activeCategory)?.description}
                </span>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <button
                    onClick={() => handleBulkCategoryToggle(true)}
                    className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition"
                  >
                    Enable All ({activeCategory})
                  </button>
                  <button
                    onClick={() => handleBulkCategoryToggle(false)}
                    className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition"
                  >
                    Disable All ({activeCategory})
                  </button>
                </div>
              </div>

              {/* Feature Cards Grid */}
              {loadingTenantFeatures ? (
                <div className="p-12 text-center text-neutral-500 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
                  <p className="text-xs">Fetching feature flags for {selectedTenant.name}...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeFeaturesInCategory.map((feat) => {
                    const isEnabled = Boolean(tenantFeatureData.features[feat.id]);
                    const isLocked = Boolean(tenantFeatureData.platformLocked?.[feat.id]);

                    return (
                      <div
                        key={feat.id}
                        className={`p-4 border rounded-2xl transition-all flex flex-col justify-between space-y-3 ${
                          isEnabled
                            ? 'bg-neutral-900/90 border-emerald-500/30'
                            : 'bg-neutral-950 border-neutral-800/80 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold text-sm text-white block">{feat.name}</span>
                              <span className="text-[10px] font-mono text-neutral-500">
                                ID: {feat.id}
                              </span>
                            </div>

                            {/* Main Toggle */}
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={(e) => handleToggleFeature(feat.id, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-10 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                            </label>
                          </div>

                          <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                            {feat.description}
                          </p>
                        </div>

                        {/* Footer details & Platform Lock button */}
                        <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[10px]">
                          <span className="text-neutral-500">
                            Default: {feat.defaultEnabled ? 'Enabled' : 'Disabled'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleTogglePlatformLock(feat.id, !isLocked)}
                            className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-md transition ${
                              isLocked
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'text-neutral-500 hover:text-white'
                            }`}
                            title={
                              isLocked
                                ? 'Platform Locked: Tenant admin cannot override'
                                : 'Lock this feature to prevent tenant admin overrides'
                            }
                          >
                            {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            <span>{isLocked ? 'Platform Locked' : 'Allow Tenant Admin'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Status Footer */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono">
                <div>
                  Active Features:{' '}
                  <strong className="text-emerald-400">{currentTenantEnabledCount}</strong> /{' '}
                  {totalFeatures}
                </div>
                {tenantFeatureData.updatedAt && (
                  <div>
                    Last Updated:{' '}
                    <span className="text-neutral-300">
                      {new Date(tenantFeatureData.updatedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
