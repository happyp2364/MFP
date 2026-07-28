import React, { useState } from 'react';
import {
  X,
  LayoutDashboard,
  Package,
  Layers,
  Star,
  Home,
  Settings,
  Plus,
  Trash2,
  Edit,
  RotateCcw,
  LogOut,
  Save,
  CheckCircle2,
  AlertTriangle,
  Search,
  ShieldCheck,
  ShieldAlert,
  Download,
  Upload,
  Database,
  FileText,
  Clock,
  KeyRound,
  Smartphone,
  RefreshCw,
  Lock,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Bell,
  CreditCard,
  TrendingUp,
  Instagram,
  ExternalLink,
  Share2,
  Copy,
  Megaphone,
  History,
  Eye,
  Globe,
  UploadCloud,
  Terminal,
  Check,
  XCircle,
  Palette,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { auth } from '../../lib/firebase';
import { Product, Review, StoreInfo, HeroContent, AuditLogItem, StoreBackupSnapshot, PublishProgressState, PublishResult } from '../../types';
import { SizeStockManager } from './SizeStockManager';
import { ChangePasswordView } from './ChangePasswordView';
import { OrderManagementView } from './OrderManagementView';
import { PaymentSettingsView } from './PaymentSettingsView';
import { ReportsAnalyticsView } from './ReportsAnalyticsView';
import { InstagramSettingsView } from './InstagramSettingsView';
import { MarketingCenterView } from './MarketingCenterView';
import { VersionHistoryView } from './VersionHistoryView';
import { HeroSectionManagerView } from './HeroSectionManagerView';
import { WebsiteMoodManagerView } from './WebsiteMoodManagerView';
import { SmartProductFormModal } from './SmartProductFormModal';
import { ProductsManagerView } from './ProductsManagerView';
import { ReviewsManagerView } from './ReviewsManagerView';
import { AdminNotificationDrawer } from './AdminNotificationDrawer';
import { validateFileUpload } from '../../lib/security';
import { optimizeImageFile } from '../../utils/imageOptimizer';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'orders' | 'marketing' | 'payment_settings' | 'reports' | 'products' | 'categories' | 'reviews' | 'homepage' | 'hero_v2' | 'hanging_shoe' | 'ai_pet_shoe' | 'instagram' | 'mood_engine' | 'overview' | 'settings' | 'audit' | 'backups' | 'password' | 'versions';

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const {
    products,
    reviews,
    storeInfo,
    heroContent,
    announcements,
    categoryHighlights,
    trendingCollections,
    auditLogs,
    orders,
    notifications,
    isTwoFactorEnabled,
    logoutAdmin,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleInStock,
    addReview,
    updateReview,
    deleteReview,
    updateStoreInfo,
    updateHeroContent,
    setAnnouncementsList,
    updateCategoryHighlight,
    updateTrendingCollection,
    resetToDefaults,
    changeAdminPassword,
    toggleTwoFactor,
    verifyReAuthentication,
    refreshAuditLogs,
    createStoreBackup,
    restoreStoreBackup,
    
    
    lastPublishedAt,
    lastPublishedBy,
    publishedVersions,
    previewMode,
    restorePublishedVersion,
    togglePreviewMode,
    
  } = useStore();

  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  // Publish Modal State
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishSummary, setPublishSummary] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState<PublishProgressState | null>(null);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const isGoogleUser = auth.currentUser?.providerData.some((p) => p.providerId === 'google.com');

  const unreadNotifCount = notifications.filter((n) => !n.read).length;


  const handleClosePublishModal = () => {
    if (isPublishing) return; // do not close while actively publishing
    setPublishModalOpen(false);
    setPublishSummary('');
    setPublishProgress(null);
    setPublishResult(null);
    setPublishError(null);
  };


  // Search & Filters for Products
  const [adminSearch, setAdminSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'men' | 'women' | 'kids'>('all');

  // Product & Review Edit Modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isCreatingReview, setIsCreatingReview] = useState(false);
  const [imageInputUrl, setImageInputUrl] = useState('');
  const [isOptimizingImage, setIsOptimizingImage] = useState(false);

  // Forms
  const [storeInfoForm, setStoreInfoForm] = useState<StoreInfo>({ ...storeInfo });
  const [heroContentForm, setHeroContentForm] = useState<HeroContent>({ ...heroContent });
  const [announcementsText, setAnnouncementsText] = useState(announcements.join('\n'));
  const [newPassword, setNewPassword] = useState('');

  // Audit Logs Search & Filter
  const [auditSearch, setAuditSearch] = useState('');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>('ALL');
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);

  // Re-Authentication Modal State
  const [reAuthPendingAction, setReAuthPendingAction] = useState<(() => void) | null>(null);
  const [reAuthPassword, setReAuthPassword] = useState('');
  const [reAuthError, setReAuthError] = useState('');
  const [reAuthActionTitle, setReAuthActionTitle] = useState('');

  // Backup file upload state
  const [backupRestoreJson, setBackupRestoreJson] = useState('');
  const [backupRestoreError, setBackupRestoreError] = useState('');

  const showNotification = (msg: string) => {
    setSaveNotification(msg);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  // Re-Authentication Guard
  const triggerReAuthGuard = (title: string, action: () => void) => {
    setReAuthActionTitle(title);
    setReAuthPendingAction(() => action);
    setReAuthPassword('');
    setReAuthError('');
  };

  const handleReAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyReAuthentication(reAuthPassword)) {
      if (reAuthPendingAction) {
        reAuthPendingAction();
      }
      setReAuthPendingAction(null);
      setReAuthPassword('');
      setReAuthError('');
    } else {
      setReAuthError('Invalid password. Re-authentication failed.');
    }
  };

  // Handle Save Store Info & Hero
  const handleSaveStoreContent = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStoreInfo(storeInfoForm);
    await updateHeroContent(heroContentForm);

    const items = announcementsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    await setAnnouncementsList(items);

    showNotification('✅ Homepage and store information synchronized live with Firebase!');
  };

  // Duplicate Product Handler
  const handleDuplicateProduct = (p: Product) => {
    const randomSuffix = Math.floor(Math.random() * 1000);
    const newSku = `${p.sku || 'MFP'}-COPY-${randomSuffix}`;
    const newSlug = `${p.slug || 'product'}-copy-${randomSuffix}`;
    const duplicatedProduct: Product = {
      ...p,
      id: '',
      sku: newSku,
      slug: newSlug,
      name: `${p.name} (Copy)`,
    };
    setIsCreatingProduct(true);
    setEditingProduct(duplicatedProduct);
  };

  // Save Product
  const handleSaveProduct = (updatedProd?: Product) => {
    const prodToSave = updatedProd || editingProduct;
    if (!prodToSave) return;

    if (isCreatingProduct) {
      const { id, ...rest } = prodToSave;
      addProduct(rest);
      showNotification('New product added successfully!');
    } else {
      updateProduct(prodToSave.id, prodToSave);
      showNotification(`Product "${prodToSave.name}" updated successfully!`);
    }

    setEditingProduct(null);
    setIsCreatingProduct(false);
  };

  // Save Review
  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    if (isCreatingReview) {
      const { id, ...rest } = editingReview;
      addReview(rest);
      showNotification('New review added successfully!');
    } else {
      updateReview(editingReview.id, editingReview);
      showNotification('Review updated successfully!');
    }

    setEditingReview(null);
    setIsCreatingReview(false);
  };

  // Filtered Products for Admin
  const adminFilteredProducts = products.filter((p) => {
    if (selectedCategoryFilter !== 'all' && p.category !== selectedCategoryFilter) return false;
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    if (auditCategoryFilter !== 'ALL' && log.category !== auditCategoryFilter) return false;
    if (auditSearch.trim()) {
      const q = auditSearch.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.userEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Export Audit Logs
  const handleExportAuditLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `marudhar_security_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Backup Creation
  const handleDownloadBackup = async () => {
    const snapshot = await createStoreBackup();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `marudhar_store_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification('Store database backup snapshot generated & downloaded!');
  };

  // Backup File Upload
  const handleBackupFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFileUpload(file);
    // Allow json for backup restores
    if (!file.name.endsWith('.json')) {
      setBackupRestoreError('Invalid file type. Please upload a valid JSON backup snapshot file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setBackupRestoreJson(content);
        setBackupRestoreError('');
      } catch (err) {
        setBackupRestoreError('Failed to read file content.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/80 backdrop-blur-2xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Main Admin Panel Container */}
      <div className="relative w-full max-w-6xl bg-[#F8FAFC]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden z-10 animate-in zoom-in-95 duration-200 h-[92vh] flex flex-col">
        
        {/* Top Admin Header Bar */}
        <div className="bg-[#121816] text-white p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B8F63] flex items-center justify-center font-bold text-white shadow-md shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-heading font-extrabold text-base sm:text-lg">
                  Enterprise CMS & Security Console
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 bg-[#0B8F63] text-white">
                  🟢 Live
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Marudhar Fashion Point • Real-Time CMS Active
              </p>
            </div>
          </div>

          {/* CMS Global Action Bar */}
          <div className="flex items-center flex-wrap gap-2">

          </div>
        </div>

        {/* CMS Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-[#0F172A] text-slate-300 flex flex-col shrink-0 overflow-y-auto hidden md:flex">
            <div className="p-4 border-b border-slate-700/50">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Store Management</h3>
              <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'orders' ? 'bg-[#0B8F63] text-white' : 'hover:bg-slate-800'}`}><Package className="w-4 h-4" /> Orders</button>
              <button onClick={() => setActiveTab('products')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'products' ? 'bg-[#0B8F63] text-white' : 'hover:bg-slate-800'}`}><LayoutDashboard className="w-4 h-4" /> Products</button>
              <button onClick={() => setActiveTab('reviews')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'reviews' ? 'bg-[#0B8F63] text-white' : 'hover:bg-slate-800'}`}><Star className="w-4 h-4" /> Reviews</button>
              <button onClick={() => setActiveTab('marketing')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'marketing' ? 'bg-[#0B8F63] text-white' : 'hover:bg-slate-800'}`}><Megaphone className="w-4 h-4" /> Marketing</button>
              <button onClick={() => setActiveTab('reports')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'reports' ? 'bg-[#0B8F63] text-white' : 'hover:bg-slate-800'}`}><TrendingUp className="w-4 h-4" /> Reports</button>
            </div>
            
            <div className="p-4 border-b border-slate-700/50">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Website Settings</h3>
              <button onClick={() => setActiveTab('hero_v2')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'hero_v2' ? 'bg-[#0B8F63] text-white' : 'hover:bg-slate-800'}`}><Sparkles className="w-4 h-4" /> Hero Engine</button>
              <button onClick={() => setActiveTab('mood_engine')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'mood_engine' ? 'bg-[#0B8F63] text-white' : 'hover:bg-slate-800'}`}><Palette className="w-4 h-4" /> Mood Engine</button>
              <button onClick={() => setActiveTab('payment_settings')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'payment_settings' ? 'bg-[#0B8F63] text-white' : 'hover:bg-slate-800'}`}><CreditCard className="w-4 h-4" /> Payments</button>
                                          <button onClick={() => setActiveTab('instagram')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'instagram' ? 'bg-[#0B8F63] text-white' : 'hover:bg-slate-800'}`}><Instagram className="w-4 h-4" /> Instagram</button>
            </div>
          </div>
          
          {/* Main Workspace */}
          <div className="flex-1 bg-white overflow-y-auto relative">
            <div className="absolute top-4 right-4">
               <button onClick={onClose} className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-full text-neutral-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6">
              {activeTab === 'orders' && <OrderManagementView />}
              {activeTab === 'reports' && <ReportsAnalyticsView />}
              {activeTab === 'marketing' && <MarketingCenterView />}
              {activeTab === 'payment_settings' && <PaymentSettingsView />}
              {activeTab === 'hero_v2' && <HeroSectionManagerView />}
              {activeTab === 'mood_engine' && <WebsiteMoodManagerView />}
                                          {activeTab === 'instagram' && <InstagramSettingsView />}
              
              {/* Product management and other views that might exist inline. For simplicity, we just put a placeholder if we miss something, but the app usually had inline product management. */}
              {activeTab === 'products' && <ProductsManagerView />}
              {activeTab === 'reviews' && <ReviewsManagerView />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
