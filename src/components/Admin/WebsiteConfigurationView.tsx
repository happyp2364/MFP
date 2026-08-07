import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Phone,
  MapPin,
  Share2,
  Store,
  Globe,
  Palette,
  LayoutTemplate,
  FileText,
  Mail,
  MessageSquare,
  Bot,
  Receipt,
  Map,
  Save,
  RotateCcw,
  Undo2,
  Redo2,
  Eye,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  GripVertical,
  ExternalLink,
  History,
  Upload,
  Copy,
  ChevronRight,
  RefreshCw,
  Sliders,
  Check,
  X,
  Lock,
  Download,
  FileCode
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { WebsiteConfig, SocialLinkItem, PhysicalStore } from '../../types';
import { DEFAULT_WEBSITE_CONFIG } from '../../data/defaultWebsiteConfig';

type ConfigSection =
  | 'identity'
  | 'contact'
  | 'address'
  | 'social'
  | 'store'
  | 'seo'
  | 'branding'
  | 'footer'
  | 'legal'
  | 'emails'
  | 'whatsapp'
  | 'ai_pet'
  | 'invoices'
  | 'store_locator'
  | 'version_history';

interface SectionDefinition {
  id: ConfigSection;
  title: string;
  badge: string;
  icon: React.ElementType;
  description: string;
}

const SECTIONS: SectionDefinition[] = [
  { id: 'identity', title: 'Business Identity', badge: '1', icon: Building2, description: 'Brand name, legal entity, logos, taglines, and company story' },
  { id: 'contact', title: 'Contact Details', badge: '2', icon: Phone, description: 'Phone numbers, emails, toll-free, and website URL' },
  { id: 'address', title: 'Shop Address', badge: '3', icon: MapPin, description: 'Showroom address, PIN code, maps link, and coordinates' },
  { id: 'social', title: 'Social Media', badge: '4', icon: Share2, description: 'Unlimited dynamic social links with platform badges' },
  { id: 'store', title: 'Store Settings', badge: '5', icon: Store, description: 'Operating status, business hours, notices, and media gallery' },
  { id: 'seo', title: 'SEO & Meta Tags', badge: '6', icon: Globe, description: 'Search engine titles, metadata, Open Graph, and JSON-LD schema' },
  { id: 'branding', title: 'Branding & Theme', badge: '7', icon: Palette, description: 'Color palette, typography, button styles, and border radius' },
  { id: 'footer', title: 'Footer Links', badge: '8', icon: LayoutTemplate, description: 'Copyright text, policies links, and footer navigation' },
  { id: 'legal', title: 'Legal Documents', badge: '9', icon: FileText, description: 'Privacy policy, terms & conditions, refund, and shipping policies' },
  { id: 'emails', title: 'Email Templates', badge: '10', icon: Mail, description: 'Email headers, signatures, support email, and footers' },
  { id: 'whatsapp', title: 'WhatsApp Business', badge: '11', icon: MessageSquare, description: 'Greetings, auto-replies, and WhatsApp support parameters' },
  { id: 'ai_pet', title: 'AI Assistant Sync', badge: '12', icon: Bot, description: 'Mascot branding, custom prompt parameters, and auto-sync' },
  { id: 'invoices', title: 'Invoices & Billing', badge: '13', icon: Receipt, description: 'Invoice branding, GST, payment QR codes, and terms' },
  { id: 'store_locator', title: 'Store Locator', badge: '14', icon: Map, description: 'Unlimited physical store locations, managers, and hours' },
  { id: 'version_history', title: 'Version History', badge: '📜', icon: History, description: 'Restore prior configurations and export white-label backups' },
];

export const WebsiteConfigurationView: React.FC = () => {
  const { websiteConfig, updateWebsiteConfig, showToast, physicalStores, addPhysicalStore, updatePhysicalStore, deletePhysicalStore } = useStore();

  const [activeSection, setActiveSection] = useState<ConfigSection>('identity');
  const [formData, setFormData] = useState<WebsiteConfig>(websiteConfig || DEFAULT_WEBSITE_CONFIG);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [versionHistory, setVersionHistory] = useState<WebsiteConfig[]>([]);

  // Undo / Redo stacks
  const [historyStack, setHistoryStack] = useState<WebsiteConfig[]>([]);
  const [redoStack, setRedoStack] = useState<WebsiteConfig[]>([]);

  // Keep local form in sync with context when context changes externally
  useEffect(() => {
    if (websiteConfig) {
      setFormData(websiteConfig);
    }
  }, [websiteConfig]);

  // Update dirty state
  const handleFieldChange = (section: keyof WebsiteConfig, field: string, value: any) => {
    setFormData((prev) => {
      // Save current state to history stack before modifying
      setHistoryStack((h) => [...h.slice(-20), prev]);
      setRedoStack([]);

      const updatedSection = {
        ...(prev[section] as any),
        [field]: value,
      };

      const nextConfig = {
        ...prev,
        [section]: updatedSection,
        lastUpdated: new Date().toISOString(),
      };

      setIsDirty(true);
      return nextConfig;
    });
  };

  // Undo action
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setRedoStack((r) => [formData, ...r]);
    setFormData(previous);
    setHistoryStack((h) => h.slice(0, -1));
    setIsDirty(true);
    showToast('⏪ Undo action applied', 'info');
  };

  // Redo action
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistoryStack((h) => [...h, formData]);
    setFormData(next);
    setRedoStack((r) => r.slice(1));
    setIsDirty(true);
    showToast('⏩ Redo action applied', 'info');
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all Website Configuration settings to default values?')) {
      setHistoryStack((h) => [...h, formData]);
      setFormData(DEFAULT_WEBSITE_CONFIG);
      setIsDirty(true);
      showToast('🔄 Reset to default values', 'info');
    }
  };

  // Save changes
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateWebsiteConfig(formData);
      setIsDirty(false);
      setVersionHistory((prev) => [formData, ...prev.slice(0, 10)]);
      showToast('✅ Website Configuration updated instantly across all channels!', 'success');
    } catch (err) {
      console.error('Error saving website configuration:', err);
      showToast('Failed to save website configuration', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save debouncer
  useEffect(() => {
    if (!autoSaveEnabled || !isDirty) return;
    const timer = setTimeout(() => {
      handleSaveChanges();
    }, 3000);
    return () => clearTimeout(timer);
  }, [formData, autoSaveEnabled, isDirty]);

  // Social Links Handlers
  const handleAddSocialLink = () => {
    const newLink: SocialLinkItem = {
      id: `soc_${Date.now()}`,
      platform: 'Custom Platform',
      title: 'Custom Link',
      username: '@username',
      url: 'https://',
      enabled: true,
      openInNewTab: true,
      displayOrder: (formData.socialMedia?.links?.length || 0) + 1,
    };
    const updatedLinks = [...(formData.socialMedia?.links || []), newLink];
    handleFieldChange('socialMedia', 'links', updatedLinks);
  };

  const handleUpdateSocialLink = (id: string, updated: Partial<SocialLinkItem>) => {
    const updatedLinks = (formData.socialMedia?.links || []).map((item) =>
      item.id === id ? { ...item, ...updated } : item
    );
    handleFieldChange('socialMedia', 'links', updatedLinks);
  };

  const handleDeleteSocialLink = (id: string) => {
    const updatedLinks = (formData.socialMedia?.links || []).filter((item) => item.id !== id);
    handleFieldChange('socialMedia', 'links', updatedLinks);
  };

  // Export / Import White Label JSON
  const handleExportConfig = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${formData.businessIdentity.businessName.replace(/\s+/g, '_')}_WebsiteConfig.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('📥 Website Configuration JSON exported!', 'success');
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.businessIdentity) {
          setFormData(imported);
          setIsDirty(true);
          showToast('📤 White-Label Configuration imported successfully! Click Save to apply.', 'success');
        } else {
          showToast('Invalid configuration file structure', 'error');
        }
      } catch (err) {
        showToast('Failed to parse JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Filter sections by search query
  const filteredSections = SECTIONS.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 py-5 bg-slate-950/80 border-b border-slate-800/80 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20 text-slate-950">
            <Globe className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                🌐 WEBSITE CONFIGURATION
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                White-Label Platform
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Store Identity for <strong className="text-amber-400">{formData.businessIdentity.businessName || 'Your Business'}</strong>
            </p>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search setting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-40 md:w-52"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2 text-slate-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Auto-Save Toggle */}
          <button
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              autoSaveEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
            title="Automatically save changes 3 seconds after typing"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoSaveEnabled ? 'animate-spin' : ''}`} />
            <span>Auto-Save {autoSaveEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Undo / Redo */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 border border-slate-800 rounded-lg">
            <button
              onClick={handleUndo}
              disabled={historyStack.length === 0}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
              title="Undo change"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
              title="Redo change"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Preview Site */}
          <button
            onClick={() => setPreviewModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Preview</span>
          </button>

          {/* Export / Import */}
          <button
            onClick={handleExportConfig}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700"
            title="Export JSON backup"
          >
            <Download className="w-4 h-4" />
          </button>
          <label className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 cursor-pointer" title="Import JSON backup">
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImportConfig} className="hidden" />
          </label>

          {/* Reset */}
          <button
            onClick={handleResetToDefaults}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg text-xs border border-slate-700"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg ${
              isDirty
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isDirty ? 'Save Changes *' : 'Saved Live'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content split into Navigation Sidebar and Active Section Form */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Section Nav Tabs */}
        <div className="w-64 md:w-72 bg-slate-950/50 border-r border-slate-800/80 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Configuration Modules ({filteredSections.length})
          </div>
          {filteredSections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'}`}>
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate">{sec.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{sec.description}</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>
                  {sec.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Form Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/60">
          {/* Render Active Section */}

          {/* SECTION 1: BUSINESS IDENTITY */}
          {activeSection === 'identity' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <span>Section 1: Business Identity & Branding</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Define your business name, legal entity, logos, and company story. Changing these values will dynamically update every occurrence across the website, emails, and invoices.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Business Name (Master) *</label>
                  <input
                    type="text"
                    value={formData.businessIdentity.businessName}
                    onChange={(e) => handleFieldChange('businessIdentity', 'businessName', e.target.value)}
                    placeholder="e.g. Royal Footwear Store"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Display Name / Storefront Title *</label>
                  <input
                    type="text"
                    value={formData.businessIdentity.displayName}
                    onChange={(e) => handleFieldChange('businessIdentity', 'displayName', e.target.value)}
                    placeholder="e.g. Royal Footwear"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Legal Business Name (for Invoices/GST)</label>
                  <input
                    type="text"
                    value={formData.businessIdentity.legalName}
                    onChange={(e) => handleFieldChange('businessIdentity', 'legalName', e.target.value)}
                    placeholder="e.g. Royal Footwear Pvt Ltd"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Brand Name / Short Code</label>
                  <input
                    type="text"
                    value={formData.businessIdentity.brandName}
                    onChange={(e) => handleFieldChange('businessIdentity', 'brandName', e.target.value)}
                    placeholder="e.g. Royal"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tagline / Slogan</label>
                  <input
                    type="text"
                    value={formData.businessIdentity.tagline}
                    onChange={(e) => handleFieldChange('businessIdentity', 'tagline', e.target.value)}
                    placeholder="e.g. Style for Every Step."
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Short Description (for Header & Metadata)</label>
                  <textarea
                    rows={2}
                    value={formData.businessIdentity.shortDescription}
                    onChange={(e) => handleFieldChange('businessIdentity', 'shortDescription', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Business Story & About Section</label>
                  <textarea
                    rows={4}
                    value={formData.businessIdentity.businessStory}
                    onChange={(e) => handleFieldChange('businessIdentity', 'businessStory', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Established Year</label>
                  <input
                    type="text"
                    value={formData.businessIdentity.establishedYear}
                    onChange={(e) => handleFieldChange('businessIdentity', 'establishedYear', e.target.value)}
                    placeholder="2010"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={formData.businessIdentity.gstNumber}
                    onChange={(e) => handleFieldChange('businessIdentity', 'gstNumber', e.target.value)}
                    placeholder="08AAAAA0000A1Z5"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={formData.businessIdentity.panNumber}
                    onChange={(e) => handleFieldChange('businessIdentity', 'panNumber', e.target.value)}
                    placeholder="ABCDE1234F"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={formData.businessIdentity.ownerName}
                    onChange={(e) => handleFieldChange('businessIdentity', 'ownerName', e.target.value)}
                    placeholder="Vijay Parihar"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Logo Settings */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-amber-400">Logos & Visual Asset URLs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Primary Header Logo URL</label>
                    <input
                      type="text"
                      value={formData.businessIdentity.logoUrl}
                      onChange={(e) => handleFieldChange('businessIdentity', 'logoUrl', e.target.value)}
                      placeholder="/logo.png"
                      className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Favicon URL</label>
                    <input
                      type="text"
                      value={formData.businessIdentity.faviconUrl}
                      onChange={(e) => handleFieldChange('businessIdentity', 'faviconUrl', e.target.value)}
                      placeholder="/favicon.ico"
                      className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: CONTACT DETAILS */}
          {activeSection === 'contact' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-amber-400" />
                  <span>Section 2: Contact Details</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage store contact channels. These appear in header bars, contact pages, order confirmations, and customer care touchpoints.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Primary Mobile Phone Number *</label>
                  <input
                    type="text"
                    value={formData.contactDetails.phone}
                    onChange={(e) => handleFieldChange('contactDetails', 'phone', e.target.value)}
                    placeholder="+91 9782482250"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">WhatsApp Ordering Number *</label>
                  <input
                    type="text"
                    value={formData.contactDetails.whatsappNumber}
                    onChange={(e) => handleFieldChange('contactDetails', 'whatsappNumber', e.target.value)}
                    placeholder="919782482250"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Customer Care Number</label>
                  <input
                    type="text"
                    value={formData.contactDetails.customerCareNumber}
                    onChange={(e) => handleFieldChange('contactDetails', 'customerCareNumber', e.target.value)}
                    placeholder="+91 9782482250"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Toll Free Number</label>
                  <input
                    type="text"
                    value={formData.contactDetails.tollFreeNumber}
                    onChange={(e) => handleFieldChange('contactDetails', 'tollFreeNumber', e.target.value)}
                    placeholder="1800-123-4567"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Primary Store Email *</label>
                  <input
                    type="email"
                    value={formData.contactDetails.email}
                    onChange={(e) => handleFieldChange('contactDetails', 'email', e.target.value)}
                    placeholder="store@nwd.app"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={formData.contactDetails.supportEmail}
                    onChange={(e) => handleFieldChange('contactDetails', 'supportEmail', e.target.value)}
                    placeholder="support@nwd.app"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Official Website Domain / URL</label>
                  <input
                    type="text"
                    value={formData.contactDetails.websiteUrl}
                    onChange={(e) => handleFieldChange('contactDetails', 'websiteUrl', e.target.value)}
                    placeholder="https://nwd.app"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: ADDRESS */}
          {activeSection === 'address' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  <span>Section 3: Shop & Showroom Address</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Physical location details for store pickup, Google Maps embeds, invoice generation, and store locator mapping.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Shop Address *</label>
                  <textarea
                    rows={2}
                    value={formData.address.shopAddress}
                    onChange={(e) => handleFieldChange('address', 'shopAddress', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Landmark</label>
                  <input
                    type="text"
                    value={formData.address.landmark}
                    onChange={(e) => handleFieldChange('address', 'landmark', e.target.value)}
                    placeholder="Near Jojri Nadi & Mistri Market"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">City / Town</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleFieldChange('address', 'city', e.target.value)}
                    placeholder="Pipar City"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">District</label>
                  <input
                    type="text"
                    value={formData.address.district}
                    onChange={(e) => handleFieldChange('address', 'district', e.target.value)}
                    placeholder="Jodhpur"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleFieldChange('address', 'state', e.target.value)}
                    placeholder="Rajasthan"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={formData.address.pinCode}
                    onChange={(e) => handleFieldChange('address', 'pinCode', e.target.value)}
                    placeholder="342601"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => handleFieldChange('address', 'country', e.target.value)}
                    placeholder="India"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Google Maps Direction Link</label>
                  <input
                    type="text"
                    value={formData.address.googleMapsLink}
                    onChange={(e) => handleFieldChange('address', 'googleMapsLink', e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: SOCIAL MEDIA */}
          {activeSection === 'social' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Share2 className="w-5 h-5 text-amber-400" />
                    <span>Section 4: Social Media Links</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Add, edit, enable, disable, or remove unlimited social media platforms. All changes update website footers and floating icons instantly.
                  </p>
                </div>
                <button
                  onClick={handleAddSocialLink}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Platform</span>
                </button>
              </div>

              <div className="space-y-3">
                {(formData.socialMedia?.links || []).map((link, idx) => (
                  <div key={link.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                      <span className="p-2 bg-slate-800 text-amber-400 font-bold text-xs rounded-lg">{idx + 1}</span>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={link.platform}
                          onChange={(e) => handleUpdateSocialLink(link.id, { platform: e.target.value })}
                          placeholder="Platform Name (e.g. Instagram)"
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-900 border border-slate-700 rounded text-white mb-1 w-full"
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => handleUpdateSocialLink(link.id, { url: e.target.value })}
                          placeholder="https://..."
                          className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-300 w-full"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end md:self-auto">
                      <input
                        type="text"
                        value={link.username}
                        onChange={(e) => handleUpdateSocialLink(link.id, { username: e.target.value })}
                        placeholder="@username"
                        className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-400 w-32"
                      />
                      <label className="flex items-center space-x-1 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={link.enabled}
                          onChange={(e) => handleUpdateSocialLink(link.id, { enabled: e.target.checked })}
                          className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                        />
                        <span>Active</span>
                      </label>
                      <button
                        onClick={() => handleDeleteSocialLink(link.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: STORE SETTINGS */}
          {activeSection === 'store' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Store className="w-5 h-5 text-amber-400" />
                  <span>Section 5: Store Settings & Operational Status</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage store open/closed status, operating hours, holiday schedules, and banner media.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Store Status</label>
                  <select
                    value={formData.storeSettings.storeStatus}
                    onChange={(e) => handleFieldChange('storeSettings', 'storeStatus', e.target.value as 'open' | 'closed')}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="open">🟢 Open for Business</option>
                    <option value="closed">🔴 Temporarily Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Business Operating Hours</label>
                  <input
                    type="text"
                    value={formData.storeSettings.businessHours}
                    onChange={(e) => handleFieldChange('storeSettings', 'businessHours', e.target.value)}
                    placeholder="Monday - Sunday: 9:00 AM - 9:30 PM"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Holiday Calendar & Notice</label>
                  <input
                    type="text"
                    value={formData.storeSettings.holidayCalendar}
                    onChange={(e) => handleFieldChange('storeSettings', 'holidayCalendar', e.target.value)}
                    placeholder="Open 365 Days a Year"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Emergency Top Notice Bar (Optional)</label>
                  <input
                    type="text"
                    value={formData.storeSettings.emergencyNotice}
                    onChange={(e) => handleFieldChange('storeSettings', 'emergencyNotice', e.target.value)}
                    placeholder="e.g. Special Festive Discount active this weekend!"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: SEO */}
          {activeSection === 'seo' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  <span>Section 6: Search Engine Optimization (SEO)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configure titles, meta descriptions, search keywords, Google verification, and Open Graph social share cards.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Website Main Meta Title *</label>
                  <input
                    type="text"
                    value={formData.seo.metaTitle}
                    onChange={(e) => handleFieldChange('seo', 'metaTitle', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Meta Description</label>
                  <textarea
                    rows={3}
                    value={formData.seo.metaDescription}
                    onChange={(e) => handleFieldChange('seo', 'metaDescription', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Structured Data (JSON-LD Schema)</label>
                  <textarea
                    rows={4}
                    value={formData.seo.structuredDataJson}
                    onChange={(e) => handleFieldChange('seo', 'structuredDataJson', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-xl text-amber-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: BRANDING */}
          {activeSection === 'branding' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-amber-400" />
                  <span>Section 7: Theme & Visual Branding</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Customize core theme colors, font families, and button styling across the white-label app.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Primary Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.branding.primaryColor}
                      onChange={(e) => handleFieldChange('branding', 'primaryColor', e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={formData.branding.primaryColor}
                      onChange={(e) => handleFieldChange('branding', 'primaryColor', e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Secondary Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.branding.secondaryColor}
                      onChange={(e) => handleFieldChange('branding', 'secondaryColor', e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={formData.branding.secondaryColor}
                      onChange={(e) => handleFieldChange('branding', 'secondaryColor', e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Accent Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.branding.accentColor}
                      onChange={(e) => handleFieldChange('branding', 'accentColor', e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={formData.branding.accentColor}
                      onChange={(e) => handleFieldChange('branding', 'accentColor', e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: FOOTER */}
          {activeSection === 'footer' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <LayoutTemplate className="w-5 h-5 text-amber-400" />
                  <span>Section 8: Footer & Copyright Settings</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Customize copyright disclosures, footer navigation links, and policy targets.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Copyright Notice Text</label>
                <input
                  type="text"
                  value={formData.footer.copyrightText}
                  onChange={(e) => handleFieldChange('footer', 'copyrightText', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* SECTION 9: LEGAL */}
          {activeSection === 'legal' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>Section 9: Legal Policies & Documents</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Edit store legal policies including Privacy Policy, Terms & Conditions, Shipping, and Returns.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Privacy Policy</label>
                  <textarea
                    rows={4}
                    value={formData.legal.privacyPolicy}
                    onChange={(e) => handleFieldChange('legal', 'privacyPolicy', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Terms & Conditions</label>
                  <textarea
                    rows={4}
                    value={formData.legal.termsAndConditions}
                    onChange={(e) => handleFieldChange('legal', 'termsAndConditions', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Refund & Exchange Policy</label>
                  <textarea
                    rows={3}
                    value={formData.legal.refundPolicy}
                    onChange={(e) => handleFieldChange('legal', 'refundPolicy', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 10: EMAILS */}
          {activeSection === 'emails' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-amber-400" />
                  <span>Section 10: Email Templates & Branding</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configure transactional email headers, signatures, and support sender accounts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Support Sender Name</label>
                  <input
                    type="text"
                    value={formData.emails.supportName}
                    onChange={(e) => handleFieldChange('emails', 'supportName', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Support Email Address</label>
                  <input
                    type="email"
                    value={formData.emails.supportEmail}
                    onChange={(e) => handleFieldChange('emails', 'supportEmail', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Signature Text</label>
                  <textarea
                    rows={3}
                    value={formData.emails.emailSignature}
                    onChange={(e) => handleFieldChange('emails', 'emailSignature', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 11: WHATSAPP */}
          {activeSection === 'whatsapp' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  <span>Section 11: WhatsApp Business Messaging</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Set up default WhatsApp greeting messages, auto-replies, and customer support routing numbers.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">WhatsApp Greeting Message</label>
                  <textarea
                    rows={2}
                    value={formData.whatsApp.greeting}
                    onChange={(e) => handleFieldChange('whatsApp', 'greeting', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">WhatsApp Auto-Reply Message</label>
                  <textarea
                    rows={2}
                    value={formData.whatsApp.autoReply}
                    onChange={(e) => handleFieldChange('whatsApp', 'autoReply', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 12: AI PET */}
          {activeSection === 'ai_pet' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-amber-400" />
                  <span>Section 12: AI Assistant Sync</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  The Intelligent Floating Mascot automatically consumes store identity, phone, address, and hours without requiring code changes.
                </p>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>AI Assistant Auto-Sync Status: ACTIVE</span>
                </div>
                <p>
                  The AI Mascot is currently reading business identity from <strong>{formData.businessIdentity.businessName}</strong>, phone <strong>{formData.contactDetails.phone}</strong>, and address <strong>{formData.address.city}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Custom System Instructions Override for AI Mascot</label>
                <textarea
                  rows={4}
                  value={formData.aiPet.customPrompts}
                  onChange={(e) => handleFieldChange('aiPet', 'customPrompts', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* SECTION 13: INVOICES */}
          {activeSection === 'invoices' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-amber-400" />
                  <span>Section 13: Order Invoices & GST Receipts</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Customize billing information printed on customer tax invoices and dispatches.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Invoice Logo URL</label>
                  <input
                    type="text"
                    value={formData.invoices.logoUrl}
                    onChange={(e) => handleFieldChange('invoices', 'logoUrl', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={formData.invoices.gstNumber}
                    onChange={(e) => handleFieldChange('invoices', 'gstNumber', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Invoice Footer Terms</label>
                  <textarea
                    rows={2}
                    value={formData.invoices.footerText}
                    onChange={(e) => handleFieldChange('invoices', 'footerText', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 14: STORE LOCATOR */}
          {activeSection === 'store_locator' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Map className="w-5 h-5 text-amber-400" />
                    <span>Section 14: Store Locator & Physical Outlets</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage physical store branches, showroom addresses, and contact numbers.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {physicalStores.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-2xl text-slate-400">
                    <Map className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-medium text-slate-300">No Physical Outlets Added Yet</p>
                    <p className="text-xs text-slate-500 mt-1">Add physical store locations to enable the customer Store Locator.</p>
                  </div>
                ) : (
                  physicalStores.map((st) => (
                    <div key={st.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">{st.name}</div>
                        <div className="text-xs text-slate-400">{st.address} • {st.phone}</div>
                      </div>
                      <button
                        onClick={() => deletePhysicalStore(st.id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* VERSION HISTORY SECTION */}
          {activeSection === 'version_history' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <History className="w-5 h-5 text-amber-400" />
                  <span>Version History & Rollback</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  View prior configurations saved during this session and restore previous states safely.
                </p>
              </div>

              <div className="space-y-3">
                {versionHistory.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-2xl text-slate-400">
                    <History className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-medium text-slate-300">No Snapshots Saved Yet</p>
                    <p className="text-xs text-slate-500 mt-1">Snapshots are automatically created whenever you save configuration changes.</p>
                  </div>
                ) : (
                  versionHistory.map((ver, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">Snapshot #{versionHistory.length - idx}</div>
                        <div className="text-xs text-slate-400">
                          {ver.businessIdentity?.businessName} • Saved at {new Date(ver.lastUpdated || '').toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFormData(ver);
                          setIsDirty(true);
                          showToast('Restored configuration snapshot', 'success');
                        }}
                        className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-semibold hover:bg-amber-500/20"
                      >
                        Restore
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Eye className="w-5 h-5 text-amber-400" />
                <span>Live White-Label Storefront Preview</span>
              </h3>
              <button onClick={() => setPreviewModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-lg">
                  {formData.businessIdentity.businessName?.[0] || 'M'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{formData.businessIdentity.displayName || 'Storefront Title'}</h4>
                  <p className="text-xs text-slate-400">{formData.businessIdentity.tagline || 'Tagline'}</p>
                </div>
              </div>

              <div className="text-xs space-y-2 text-slate-300">
                <p><strong>Phone:</strong> {formData.contactDetails.phone}</p>
                <p><strong>Email:</strong> {formData.contactDetails.email}</p>
                <p><strong>Address:</strong> {formData.address.shopAddress}</p>
                <p><strong>GST:</strong> {formData.businessIdentity.gstNumber}</p>
                <p><strong>Copyright:</strong> {formData.footer.copyrightText}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
