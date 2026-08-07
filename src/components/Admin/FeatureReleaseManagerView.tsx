import React, { useState, useEffect } from 'react';
import {
  Layers,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Search,
  Filter,
  BarChart3,
  FileText,
  ShieldAlert,
  Sliders,
  Globe,
  ArrowRight,
  Download,
  Copy,
  Check,
  Undo2,
  Lock,
  ChevronRight,
  Crown,
  Sparkles,
  Server,
  Tag,
} from 'lucide-react';
import { Tenant, PlatformFeature } from '../../types';
import {
  DEFAULT_PLATFORM_FEATURES,
  DEFAULT_PLATFORM_VERSIONS,
  CURRENT_PLATFORM_VERSION,
  fetchFeatureRegistry,
  saveFeatureToRegistry,
  deleteFeatureFromRegistry,
  enableFeatureForWebsite,
  enableFeatureForSelectedWebsites,
  enableFeatureForAllWebsites,
  disableFeatureForWebsite,
  disableFeatureForSelectedWebsites,
  disableFeatureForAllWebsites,
  rollbackFeature,
  updateWebsitePlatformVersion,
  bulkUpdateWebsitePlatformVersion,
  calculateFeatureUsage,
  generateReleaseNotes,
} from '../../lib/featureReleaseService';

interface FeatureReleaseManagerViewProps {
  tenants: Tenant[];
  onUpdateTenants: () => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  isSuperAdmin?: boolean;
}

export const FeatureReleaseManagerView: React.FC<FeatureReleaseManagerViewProps> = ({
  tenants,
  onUpdateTenants,
  showToast,
  isSuperAdmin = true,
}) => {
  const [activeTab, setActiveTab] = useState<'registry' | 'websites' | 'analytics' | 'release_notes'>('registry');
  const [features, setFeatures] = useState<PlatformFeature[]>(DEFAULT_PLATFORM_FEATURES);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [isNewFeatureModalOpen, setIsNewFeatureModalOpen] = useState<boolean>(false);
  const [isRolloutModalOpen, setIsRolloutModalOpen] = useState<boolean>(false);
  const [selectedFeatureForRollout, setSelectedFeatureForRollout] = useState<PlatformFeature | null>(null);
  const [rolloutTargetType, setRolloutTargetType] = useState<'single' | 'selected' | 'all'>('single');
  const [singleTargetTenantId, setSingleTargetTenantId] = useState<string>('');
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);

  // Rollback modal state
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState<boolean>(false);
  const [selectedFeatureForRollback, setSelectedFeatureForRollback] = useState<PlatformFeature | null>(null);

  // New Feature form state
  const [newFeature, setNewFeature] = useState<Partial<PlatformFeature>>({
    id: '',
    name: '',
    description: '',
    versionIntroduced: CURRENT_PLATFORM_VERSION,
    releaseDate: new Date().toISOString().split('T')[0],
    status: 'Beta',
    category: 'Marketing',
    disabledByDefault: true,
  });

  // Release Notes filter
  const [releaseNotesVersionFilter, setReleaseNotesVersionFilter] = useState<string>('all');
  const [copiedReleaseNotes, setCopiedReleaseNotes] = useState<boolean>(false);

  // Load Firestore feature registry
  useEffect(() => {
    loadRegistry();
  }, []);

  const loadRegistry = async () => {
    setLoading(true);
    try {
      const reg = await fetchFeatureRegistry();
      setFeatures(reg);
    } catch {
      setFeatures(DEFAULT_PLATFORM_FEATURES);
    } finally {
      setLoading(false);
    }
  };

  // Filter features
  const filteredFeatures = features.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || f.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Create or Update Feature in Registry
  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeature.id || !newFeature.name || !newFeature.description) {
      showToast('error', 'Please fill in all required feature fields');
      return;
    }

    const cleanId = newFeature.id.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
    const featureToSave: PlatformFeature = {
      id: cleanId.startsWith('feat_') ? cleanId : `feat_${cleanId}`,
      name: newFeature.name.trim(),
      description: newFeature.description.trim(),
      versionIntroduced: newFeature.versionIntroduced || CURRENT_PLATFORM_VERSION,
      releaseDate: newFeature.releaseDate || new Date().toISOString().split('T')[0],
      status: (newFeature.status as any) || 'Beta',
      category: (newFeature.category as any) || 'Marketing',
      disabledByDefault: true, // Always disabled by default for all websites
    };

    try {
      await saveFeatureToRegistry(featureToSave);
      showToast('success', `Feature "${featureToSave.name}" saved to platform registry`);
      setIsNewFeatureModalOpen(false);
      setNewFeature({
        id: '',
        name: '',
        description: '',
        versionIntroduced: CURRENT_PLATFORM_VERSION,
        releaseDate: new Date().toISOString().split('T')[0],
        status: 'Beta',
        category: 'Marketing',
        disabledByDefault: true,
      });
      loadRegistry();
    } catch (err) {
      showToast('error', 'Failed to save feature to registry');
    }
  };

  // Execute Feature Rollout
  const handleExecuteRollout = async (actionType: 'enable' | 'disable') => {
    if (!selectedFeatureForRollout) return;

    try {
      if (rolloutTargetType === 'single') {
        if (!singleTargetTenantId) {
          showToast('error', 'Please select a target website');
          return;
        }
        const tenant = tenants.find((t) => t.id === singleTargetTenantId);
        if (!tenant) return;

        if (actionType === 'enable') {
          await enableFeatureForWebsite(tenant, selectedFeatureForRollout.id);
          showToast('success', `Enabled "${selectedFeatureForRollout.name}" for ${tenant.name}`);
        } else {
          await disableFeatureForWebsite(tenant, selectedFeatureForRollout.id);
          showToast('info', `Disabled "${selectedFeatureForRollout.name}" for ${tenant.name}`);
        }
      } else if (rolloutTargetType === 'selected') {
        if (selectedTenantIds.length === 0) {
          showToast('error', 'Please select at least one website');
          return;
        }
        if (actionType === 'enable') {
          await enableFeatureForSelectedWebsites(tenants, selectedTenantIds, selectedFeatureForRollout.id);
          showToast('success', `Enabled feature for ${selectedTenantIds.length} websites`);
        } else {
          await disableFeatureForSelectedWebsites(tenants, selectedTenantIds, selectedFeatureForRollout.id);
          showToast('info', `Disabled feature for ${selectedTenantIds.length} websites`);
        }
      } else if (rolloutTargetType === 'all') {
        if (actionType === 'enable') {
          await enableFeatureForAllWebsites(tenants, selectedFeatureForRollout.id);
          showToast('success', `Globally rolled out "${selectedFeatureForRollout.name}" to ALL websites`);
        } else {
          await disableFeatureForAllWebsites(tenants, selectedFeatureForRollout.id);
          showToast('info', `Globally disabled "${selectedFeatureForRollout.name}" across ALL websites`);
        }
      }

      setIsRolloutModalOpen(false);
      onUpdateTenants();
    } catch (err) {
      showToast('error', 'Failed to execute feature rollout action');
    }
  };

  // Execute Emergency Rollback
  const handleExecuteRollback = async () => {
    if (!selectedFeatureForRollback) return;
    try {
      await rollbackFeature(tenants, selectedFeatureForRollback.id);
      showToast('success', `Emergency Rollback executed for "${selectedFeatureForRollback.name}" across all websites`);
      setIsRollbackModalOpen(false);
      onUpdateTenants();
    } catch {
      showToast('error', 'Failed to execute feature rollback');
    }
  };

  // Copy Release Notes to Clipboard
  const handleCopyReleaseNotes = () => {
    const text = generateReleaseNotes(
      releaseNotesVersionFilter === 'all' ? undefined : releaseNotesVersionFilter,
      features
    );
    navigator.clipboard.writeText(text);
    setCopiedReleaseNotes(true);
    showToast('success', 'Release Notes copied to clipboard!');
    setTimeout(() => setCopiedReleaseNotes(false), 2000);
  };

  // Feature Analytics calculation
  const usageAnalytics = calculateFeatureUsage(features, tenants);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shrink-0 shadow-inner">
            <Sliders className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-white tracking-tight">Platform Feature Release & Version Governance</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wide flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" /> Super Admin Only
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              Centralized feature flag control, website version upgrades, staged rollout management, and automated release notes generation. All features are strictly disabled by default for new websites.
            </p>
          </div>
        </div>

        {/* Global Controls & Current Platform Tag */}
        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-2xl text-right">
            <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wider">Current Platform Baseline</span>
            <span className="text-sm font-black text-amber-400 font-mono">{CURRENT_PLATFORM_VERSION}</span>
          </div>

          {isSuperAdmin && (
            <button
              onClick={() => setIsNewFeatureModalOpen(true)}
              className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs shadow-lg flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Feature</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('registry')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'registry'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Feature Registry ({features.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('websites')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'websites'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Websites & Version Matrix ({tenants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'analytics'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Feature Adoption Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('release_notes')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'release_notes'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Automated Release Notes</span>
        </button>
      </div>

      {/* TAB 1: FEATURE REGISTRY & ROLLOUT MATRIX */}
      {activeTab === 'registry' && (
        <div className="space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search features by name, ID, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-10 pr-4 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-xl px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="AI & SEO">AI & SEO</option>
                <option value="Fulfillment">Fulfillment</option>
                <option value="Analytics">Analytics</option>
                <option value="Customer Experience">Customer Experience</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-xl px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Beta">Beta</option>
                <option value="Stable">Stable</option>
                <option value="Deprecated">Deprecated</option>
              </select>
            </div>
          </div>

          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeatures.map((feat) => {
              const usage = usageAnalytics.find((u) => u.featureId === feat.id);
              const enabledPct = usage ? usage.adoptionPercentage : 0;

              return (
                <div
                  key={feat.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white text-sm">{feat.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              feat.status === 'Stable'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : feat.status === 'Beta'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {feat.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-neutral-800 text-neutral-400 font-mono">
                            {feat.category}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-amber-400/80 block mt-0.5">{feat.id}</span>
                      </div>

                      <span className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 text-neutral-400 rounded-xl font-mono text-[10px] shrink-0">
                        {feat.versionIntroduced}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed">{feat.description}</p>
                  </div>

                  {/* Disabled by Default Banner & Adoption Bar */}
                  <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-400" /> Default: <strong className="text-amber-300">Disabled for all websites</strong>
                      </span>
                      <span className="text-neutral-300 font-bold font-mono">
                        {usage ? `${usage.enabledCount} / ${usage.totalWebsites}` : '0'} Websites ({enabledPct}%)
                      </span>
                    </div>

                    <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${enabledPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions for Super Admin */}
                  {isSuperAdmin && (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedFeatureForRollout(feat);
                            setRolloutTargetType('single');
                            setIsRolloutModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                        >
                          <Globe className="w-3.5 h-3.5 text-amber-400" />
                          <span>Rollout Control</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedFeatureForRollback(feat);
                            setIsRollbackModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                          title="Emergency Rollback feature from websites"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          <span>Rollback</span>
                        </button>
                      </div>

                      <button
                        onClick={async () => {
                          if (confirm(`Are you sure you want to remove "${feat.name}" from the platform registry?`)) {
                            await deleteFeatureFromRegistry(feat.id);
                            showToast('info', `Removed "${feat.name}" from registry`);
                            loadRegistry();
                          }
                        }}
                        className="text-[11px] text-neutral-500 hover:text-rose-400 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: WEBSITES & VERSION MATRIX */}
      {activeTab === 'websites' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl space-y-4">
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Website Feature & Version Assignment</h3>
              <p className="text-xs text-neutral-400">View and update specific feature flags enabled per website instance.</p>
            </div>

            <button
              onClick={() => onUpdateTenants()}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition-all"
              title="Refresh Website Matrix"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400 font-mono text-[10px] uppercase border-b border-neutral-800">
                <tr>
                  <th className="p-4">Website / Store</th>
                  <th className="p-4">Slug / Domain</th>
                  <th className="p-4">Platform Version</th>
                  <th className="p-4">Enabled Features</th>
                  <th className="p-4">Health Status</th>
                  {isSuperAdmin && <th className="p-4 text-right">Super Admin Control</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {tenants.map((t) => {
                  const enabledCount = (t.enabledFeatures || []).length;
                  const curVersion = t.platformVersion || t.version || CURRENT_PLATFORM_VERSION;

                  return (
                    <tr key={t.id} className="hover:bg-neutral-850/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-xs">{t.name}</div>
                        <span className="text-[10px] font-mono text-neutral-500">ID: {t.id}</span>
                      </td>

                      <td className="p-4 font-mono text-[11px] text-amber-300">
                        {t.slug ? `/${t.slug}` : t.domain}
                      </td>

                      <td className="p-4">
                        <select
                          value={curVersion}
                          disabled={!isSuperAdmin}
                          onChange={async (e) => {
                            const newVer = e.target.value;
                            await updateWebsitePlatformVersion(t, newVer);
                            showToast('success', `Updated platform version to ${newVer} for ${t.name}`);
                            onUpdateTenants();
                          }}
                          className="bg-neutral-950 border border-neutral-800 text-amber-400 font-mono text-xs rounded-lg px-2.5 py-1 focus:border-amber-500 focus:outline-none"
                        >
                          {DEFAULT_PLATFORM_VERSIONS.map((v) => (
                            <option key={v.version} value={v.version}>
                              {v.version} ({v.releaseName})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-md font-mono text-[10px] font-bold">
                            {enabledCount} / {features.length} Enabled
                          </span>
                          {enabledCount === 0 && (
                            <span className="text-[10px] text-neutral-500 italic">No custom features enabled (Core Baseline)</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Operational
                        </span>
                      </td>

                      {isSuperAdmin && (
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedFeatureForRollout(features[0] || null);
                              setSingleTargetTenantId(t.id);
                              setRolloutTargetType('single');
                              setIsRolloutModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl font-bold text-xs transition-all"
                          >
                            Manage Features
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FEATURE ADOPTION ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block">Total Registered Features</span>
              <span className="text-2xl font-black text-white font-mono">{features.length}</span>
              <p className="text-[10px] text-neutral-500">Across Marketing, AI, Fulfillment & Sales</p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block">Total Active Websites</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{tenants.length}</span>
              <p className="text-[10px] text-neutral-500">Isolated white-label store instances</p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block">Default Security Policy</span>
              <span className="text-lg font-black text-emerald-400 flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-5 h-5" /> Strict Opt-In
              </span>
              <p className="text-[10px] text-neutral-500">Features disabled by default for all sites</p>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" /> Feature Adoption Breakdown
            </h3>

            <div className="space-y-4">
              {usageAnalytics.map((u) => (
                <div key={u.featureId} className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-white font-bold">{u.featureName}</strong>
                      <span className="text-[10px] font-mono text-amber-400/80 ml-2">({u.featureId})</span>
                    </div>
                    <span className="font-mono text-amber-300 font-bold">
                      {u.enabledCount} / {u.totalWebsites} Websites ({u.adoptionPercentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 via-emerald-500 to-sky-500 h-full transition-all duration-500"
                      style={{ width: `${u.adoptionPercentage}%` }}
                    />
                  </div>

                  {/* List enabled store names */}
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 flex-wrap pt-1">
                    <span className="text-neutral-500 font-bold">Enabled on:</span>
                    {u.enabledTenantNames.length > 0 ? (
                      u.enabledTenantNames.map((name) => (
                        <span key={name} className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md text-emerald-300">
                          {name}
                        </span>
                      ))
                    ) : (
                      <span className="text-neutral-600 italic">None (Disabled across platform)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUTOMATED RELEASE NOTES */}
      {activeTab === 'release_notes' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" /> Automated Platform Release Notes
              </h3>
              <p className="text-xs text-neutral-400">Dynamically compiled release documentation generated from feature registry metadata.</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={releaseNotesVersionFilter}
                onChange={(e) => setReleaseNotesVersionFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-2 font-mono focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Version History</option>
                {DEFAULT_PLATFORM_VERSIONS.map((v) => (
                  <option key={v.version} value={v.version}>
                    Release {v.version} ({v.releaseName})
                  </option>
                ))}
              </select>

              <button
                onClick={handleCopyReleaseNotes}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                {copiedReleaseNotes ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                <span>{copiedReleaseNotes ? 'Copied!' : 'Copy Markdown'}</span>
              </button>
            </div>
          </div>

          {/* Rendered Markdown Preview */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 font-mono text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
            {generateReleaseNotes(
              releaseNotesVersionFilter === 'all' ? undefined : releaseNotesVersionFilter,
              features
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTER NEW FEATURE */}
      {isNewFeatureModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" /> Register New Platform Feature
              </h3>
              <button
                onClick={() => setIsNewFeatureModalOpen(false)}
                className="text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFeature} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1">
                  Feature ID (Slug) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. feat_ai_marketing or feat_spin_wheel"
                  value={newFeature.id}
                  onChange={(e) => setNewFeature({ ...newFeature, id: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-amber-300 font-mono text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1">
                  Feature Display Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Marketing Assistant"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Explain capability and purpose..."
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Version Introduced
                  </label>
                  <input
                    type="text"
                    value={newFeature.versionIntroduced}
                    onChange={(e) => setNewFeature({ ...newFeature, versionIntroduced: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newFeature.category}
                    onChange={(e) => setNewFeature({ ...newFeature, category: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-white text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="AI & SEO">AI & SEO</option>
                    <option value="Fulfillment">Fulfillment</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Customer Experience">Customer Experience</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Feature will be registered with status <strong>Disabled by Default</strong> for all existing and future websites.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFeatureModalOpen(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow"
                >
                  Save Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ROLLOUT CONTROL (ENABLE / DISABLE FOR ONE, SELECTED, ALL) */}
      {isRolloutModalOpen && selectedFeatureForRollout && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-black text-white text-base">Feature Rollout Control</h3>
                <p className="text-xs text-amber-400 font-mono">{selectedFeatureForRollout.name}</p>
              </div>
              <button onClick={() => setIsRolloutModalOpen(false)} className="text-neutral-500 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Target Scope Selection */}
              <div>
                <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Select Rollout Scope
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'single', label: 'One Website' },
                    { id: 'selected', label: 'Selected Websites' },
                    { id: 'all', label: 'All Websites' },
                  ].map((scope) => (
                    <button
                      key={scope.id}
                      type="button"
                      onClick={() => setRolloutTargetType(scope.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                        rolloutTargetType === scope.id
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {scope.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Single Website Picker */}
              {rolloutTargetType === 'single' && (
                <div>
                  <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Select Target Website
                  </label>
                  <select
                    value={singleTargetTenantId}
                    onChange={(e) => setSingleTargetTenantId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Choose a website --</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (/{t.slug || t.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Multi-Select Website Checkboxes */}
              {rolloutTargetType === 'selected' && (
                <div className="space-y-2">
                  <label className="block font-bold text-neutral-300 uppercase tracking-wider">
                    Select Websites ({selectedTenantIds.length} selected)
                  </label>
                  <div className="max-h-48 overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-2">
                    {tenants.map((t) => {
                      const isChecked = selectedTenantIds.includes(t.id);
                      return (
                        <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:text-white text-neutral-300">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTenantIds([...selectedTenantIds, t.id]);
                              } else {
                                setSelectedTenantIds(selectedTenantIds.filter((id) => id !== t.id));
                              }
                            }}
                            className="rounded bg-neutral-900 border-neutral-700 text-amber-500 focus:ring-0"
                          />
                          <span className="font-bold">{t.name}</span>
                          <span className="text-[10px] font-mono text-neutral-500">(/{t.slug || t.id})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Websites Warning */}
              {rolloutTargetType === 'all' && (
                <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl text-amber-300 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> Global Platform Action
                  </span>
                  <p className="text-[11px] text-amber-200/80">
                    This action will apply to ALL {tenants.length} active websites on the platform.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsRolloutModalOpen(false)}
                  className="px-4 py-2 font-bold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteRollout('disable')}
                  className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold rounded-xl"
                >
                  Disable Feature
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteRollout('enable')}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow"
                >
                  Enable Feature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EMERGENCY ROLLBACK */}
      {isRollbackModalOpen && selectedFeatureForRollback && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-rose-800/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400 border-b border-rose-900/50 pb-3">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-black text-white text-base">Emergency Feature Rollback</h3>
                <p className="text-xs text-rose-300 font-mono">{selectedFeatureForRollback.name}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Rollback will immediately disable feature <strong className="text-amber-300 font-mono">{selectedFeatureForRollback.id}</strong> across websites. Existing website functionality will remain completely intact without disruption.
            </p>

            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-200 text-[11px] space-y-1">
              <span className="font-bold block text-rose-300">Rollback Checklist:</span>
              <ul className="list-disc ml-4 space-y-0.5">
                <li>Feature flag set to false for target stores</li>
                <li>Audit trail entry recorded in Firestore security logs</li>
                <li>Zero downtime backward compatibility preserved</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRollbackModalOpen(false)}
                className="px-4 py-2 font-bold text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRollback}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl shadow-lg flex items-center gap-2"
              >
                <Undo2 className="w-4 h-4" />
                <span>Confirm Emergency Rollback</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
