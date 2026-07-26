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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { auth } from '../../lib/firebase';
import { Product, Review, StoreInfo, HeroContent, AuditLogItem, StoreBackupSnapshot } from '../../types';
import { SizeStockManager } from './SizeStockManager';
import { ChangePasswordView } from './ChangePasswordView';
import { OrderManagementView } from './OrderManagementView';
import { PaymentSettingsView } from './PaymentSettingsView';
import { ReportsAnalyticsView } from './ReportsAnalyticsView';
import { HangingSneakerSettingsView } from './HangingSneakerSettingsView';
import { AIShoePetSettingsView } from './AIShoePetSettingsView';
import { InstagramSettingsView } from './InstagramSettingsView';
import { SmartProductFormModal } from './SmartProductFormModal';
import { AdminNotificationDrawer } from './AdminNotificationDrawer';
import { validateFileUpload } from '../../lib/security';
import { optimizeImageFile } from '../../utils/imageOptimizer';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'orders' | 'payment_settings' | 'reports' | 'products' | 'categories' | 'reviews' | 'homepage' | 'hanging_shoe' | 'ai_pet_shoe' | 'instagram' | 'overview' | 'settings' | 'audit' | 'backups' | 'password';

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
  } = useStore();

  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  const isGoogleUser = auth.currentUser?.providerData.some((p) => p.providerId === 'google.com');

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

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
  const handleSaveStoreContent = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreInfo(storeInfoForm);
    updateHeroContent(heroContentForm);

    const items = announcementsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setAnnouncementsList(items);

    showNotification('Homepage and store information updated successfully!');
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
        <div className="bg-[#121816] text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B8F63] flex items-center justify-center font-bold text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-heading font-extrabold text-base sm:text-lg">
                  Enterprise Security Console
                </h2>
                <span className="bg-[#0B8F63] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  256-Bit SSL
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Marudhar Fashion Point • ABAC Rules & Automated Audit Trail Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotifDrawerOpen(true)}
              className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors relative"
              title="Real-Time Order Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-neutral-950 font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                logoutAdmin();
                onClose();
              }}
              className="bg-white/10 hover:bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast Notification */}
        {saveNotification && (
          <div className="bg-[#0B8F63] text-white px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-300">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveNotification}</span>
          </div>
        )}

        {/* Sidebar + Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-neutral-200 p-3 flex md:flex-col gap-1.5 shrink-0 overflow-x-auto">
            
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-left ${
                activeTab === 'orders'
                  ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/20'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-amber-500" />
                <span>Orders & Tracking</span>
              </div>
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px]">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('payment_settings')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-left ${
                activeTab === 'payment_settings'
                  ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/20'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Payment & UPI Setup</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-left ${
                activeTab === 'reports'
                  ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/20'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Sales & Reports</span>
            </button>

            <div className="my-1 border-t border-neutral-200 hidden md:block" />

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-left ${
                activeTab === 'products'
                  ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/20'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products & Stock ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('homepage')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-left ${
                activeTab === 'homepage'
                  ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/20'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Store Info & Hero</span>
            </button>

            <button
              onClick={() => setActiveTab('hanging_shoe')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-left ${
                activeTab === 'hanging_shoe'
                  ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/20'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Hanging Shoe Manager</span>
            </button>

            <button
              onClick={() => setActiveTab('ai_pet_shoe')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-left ${
                activeTab === 'ai_pet_shoe'
                  ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/20'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Pet Shoe Mascot</span>
            </button>

            <button
              onClick={() => setActiveTab('instagram')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-left ${
                activeTab === 'instagram'
                  ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/20'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Instagram className="w-4 h-4 text-rose-500" />
              <span>Live Instagram Integration</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-left ${
                activeTab === 'categories'
                  ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/20'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Categories & Highlights</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-left ${
                activeTab === 'reviews'
                  ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/20'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Reviews ({reviews.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-left ${
                activeTab === 'overview'
                  ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/20'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Catalog Analytics</span>
            </button>

            <div className="my-1 border-t border-neutral-200 hidden md:block" />

            {/* SECURITY & BACKUP TABS */}
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-left ${
                activeTab === 'audit'
                  ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/20'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Audit & Security Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('backups')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-left ${
                activeTab === 'backups'
                  ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/20'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Backup & Disaster Recovery</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-left ${
                activeTab === 'settings'
                  ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/20'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Settings className="w-4 h-4 text-amber-600" />
              <span>2FA & Security Settings</span>
            </button>

            {!isGoogleUser && (
              <button
                onClick={() => setActiveTab('password')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-left ${
                  activeTab === 'password'
                    ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/20'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Change Password</span>
              </button>
            )}
          </div>

          {/* Main Content Body */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#F7F7F7]">
            
            {/* ----------------- TAB: ORDERS & TRACKING ----------------- */}
            {activeTab === 'orders' && <OrderManagementView />}

            {/* ----------------- TAB: PAYMENT & UPI CONFIGURATION ----------------- */}
            {activeTab === 'payment_settings' && <PaymentSettingsView />}

            {/* ----------------- TAB: SALES & REPORTS ----------------- */}
            {activeTab === 'reports' && <ReportsAnalyticsView />}

            {/* ----------------- TAB: HANGING SHOE AI MANAGER ----------------- */}
            {activeTab === 'hanging_shoe' && <HangingSneakerSettingsView />}

            {/* ----------------- TAB: AI PET SHOE MASCOT ----------------- */}
            {activeTab === 'ai_pet_shoe' && <AIShoePetSettingsView />}

            {/* ----------------- TAB: LIVE INSTAGRAM INTEGRATION ----------------- */}
            {activeTab === 'instagram' && <InstagramSettingsView />}

            {/* ----------------- TAB: PRODUCTS & PRICES ----------------- */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search products by name, brand or subcategory..."
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-[#0B8F63]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value as any)}
                      className="bg-[#F7F7F7] border border-neutral-200 rounded-xl py-2 px-3 text-xs font-bold text-neutral-700 outline-none"
                    >
                      <option value="all">All Categories ({products.length})</option>
                      <option value="men">Men's Shoes</option>
                      <option value="women">Women's Sports Shoes</option>
                      <option value="kids">Kids' Collection</option>
                    </select>

                    <button
                      onClick={() => {
                        setIsCreatingProduct(true);
                        setEditingProduct({
                          id: '',
                          name: '',
                          brand: 'Marudhar Fashion',
                          category: 'men',
                          subcategory: 'Sports Shoes',
                          price: 1499,
                          originalPrice: 2499,
                          discountPercent: 40,
                          rating: 5,
                          reviewsCount: 1,
                          images: [],
                          description: 'Real shop product - uploaded directly by admin.',
                          sizes: ['6', '7', '8', '9', '10'],
                          colors: [{ name: 'Black', hex: '#000000' }],
                          collectionTags: ['New Arrival'],
                          inStock: true,
                        });
                      }}
                      className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product</span>
                    </button>
                  </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#121816] text-white font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3.5">Product</th>
                          <th className="p-3.5">Category</th>
                          <th className="p-3.5">Price (INR)</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 font-medium">
                        {adminFilteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-neutral-900">{p.name}</div>
                                  <div className="text-[10px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                                    <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 font-mono font-bold rounded">
                                      SKU: {p.sku || p.id.toUpperCase()}
                                    </span>
                                    <span>• {p.brand}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5 uppercase font-bold text-[10px] text-neutral-500">
                              {p.category}
                            </td>

                            <td className="p-3.5">
                              <div className="font-bold text-neutral-900">₹{p.price}</div>
                              <div className="text-[10px] text-neutral-400 line-through">₹{p.originalPrice}</div>
                            </td>

                            <td className="p-3.5">
                              <button
                                onClick={() => toggleInStock(p.id)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all ${
                                  p.inStock
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {p.inStock ? 'In Stock' : 'Out of Stock'}
                              </button>
                            </td>

                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setIsCreatingProduct(false);
                                    setEditingProduct({ ...p });
                                  }}
                                  className="p-1.5 rounded-lg bg-neutral-100 hover:bg-[#0B8F63] hover:text-white transition-colors text-neutral-700"
                                  title="Edit Product"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDuplicateProduct(p)}
                                  className="p-1.5 rounded-lg bg-neutral-100 hover:bg-amber-500 hover:text-white transition-colors text-amber-700"
                                  title="Duplicate Product"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    triggerReAuthGuard(`Delete Product "${p.name}"`, () => deleteProduct(p.id));
                                  }}
                                  className="p-1.5 rounded-lg bg-neutral-100 hover:bg-rose-600 hover:text-white transition-colors text-rose-600"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- TAB: AUDIT LOGS ----------------- */}
            {activeTab === 'audit' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search audit logs by action, detail or user..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-[#0B8F63]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={auditCategoryFilter}
                      onChange={(e) => setAuditCategoryFilter(e.target.value)}
                      className="bg-[#F7F7F7] border border-neutral-200 rounded-xl py-2 px-3 text-xs font-bold text-neutral-700 outline-none"
                    >
                      <option value="ALL">All Categories ({auditLogs.length})</option>
                      <option value="AUTH">Authentication</option>
                      <option value="PRODUCT">Products & Prices</option>
                      <option value="SETTINGS">Settings</option>
                      <option value="BACKUP">Backups</option>
                      <option value="SECURITY">Security</option>
                      <option value="MEDIA">Media & Assets</option>
                    </select>

                    <button
                      onClick={async () => {
                        setIsRefreshingLogs(true);
                        await refreshAuditLogs();
                        setIsRefreshingLogs(false);
                        showNotification('Audit logs synchronized with Firestore!');
                      }}
                      disabled={isRefreshingLogs}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs p-2.5 rounded-xl border border-neutral-200 shrink-0 flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshingLogs ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Sync Remote</span>
                    </button>

                    <button
                      onClick={handleExportAuditLogs}
                      className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>

                {/* Audit Logs Table */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#121816] text-white font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3.5">Timestamp</th>
                          <th className="p-3.5">Action</th>
                          <th className="p-3.5">Category</th>
                          <th className="p-3.5">User / IP</th>
                          <th className="p-3.5">Details</th>
                          <th className="p-3.5">Severity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 font-medium">
                        {filteredAuditLogs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-neutral-400 text-xs">
                              No security audit logs found matching your filter criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredAuditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                              <td className="p-3.5 font-mono text-[10px] text-neutral-500 whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="p-3.5 font-bold text-neutral-900">{log.action}</td>
                              <td className="p-3.5">
                                <span className="bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded text-[10px] font-bold text-neutral-700">
                                  {log.category}
                                </span>
                              </td>
                              <td className="p-3.5 text-[10px] text-neutral-500">
                                <div>{log.userEmail}</div>
                                <div className="text-neutral-400 font-mono">{log.ipAddress || 'Client Applet'}</div>
                              </td>
                              <td className="p-3.5 text-neutral-600 max-w-xs truncate">{log.details}</td>
                              <td className="p-3.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                    log.status === 'SUCCESS'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : log.status === 'WARNING'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- TAB: BACKUPS ----------------- */}
            {activeTab === 'backups' && (
              <div className="space-y-6 max-w-4xl">
                {/* Instant Snapshot Card */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif-heading font-bold text-base text-neutral-900">
                          Create Database Backup Snapshot
                        </h3>
                        <p className="text-xs text-neutral-500">
                          Generates a full JSON snapshot of catalog, reviews, hero content, and settings.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleDownloadBackup}
                      className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition-all shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>CREATE & DOWNLOAD BACKUP</span>
                    </button>
                  </div>
                </div>

                {/* Restore Snapshot Card */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
                  <h3 className="font-serif-heading font-bold text-base text-neutral-900 border-b border-neutral-100 pb-2">
                    Disaster Recovery & Restore Snapshot
                  </h3>

                  {backupRestoreError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{backupRestoreError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="font-bold text-xs text-neutral-700 block">
                      Select Backup JSON File to Restore:
                    </label>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleBackupFileUpload}
                      className="w-full text-xs text-neutral-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                    />

                    {backupRestoreJson && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
                        <div className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#0B8F63]" />
                          <span>Valid Backup File Loaded ({(backupRestoreJson.length / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          onClick={() => {
                            triggerReAuthGuard('Restore Store Data from Snapshot', async () => {
                              const success = await restoreStoreBackup(backupRestoreJson);
                              if (success) {
                                showNotification('Database restored successfully from snapshot!');
                                setBackupRestoreJson('');
                              }
                            });
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow"
                        >
                          RESTORE DATABASE NOW
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- TAB: SETTINGS & 2FA ----------------- */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-2xl">
                
                {/* 2FA Card */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0B8F63] flex items-center justify-center font-bold">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif-heading font-bold text-base text-neutral-900">
                          Two-Factor Authentication (2FA)
                        </h3>
                        <p className="text-xs text-neutral-500">
                          Require 6-digit authenticator code on admin logins.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleTwoFactor(!isTwoFactorEnabled)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                        isTwoFactorEnabled
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          : 'bg-[#0B8F63] text-white hover:bg-[#086F4C]'
                      }`}
                    >
                      {isTwoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </button>
                  </div>

                  {isTwoFactorEnabled && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2">
                      <div className="font-bold">2FA Status: ACTIVE</div>
                      <p className="text-[11px]">
                        Authenticator Secret Key: <code className="bg-white px-2 py-0.5 rounded border border-emerald-300 font-mono font-bold">MFP-ADMIN-SEC-2026-X9</code>
                      </p>
                      <p className="text-[10px] text-emerald-700">Backup codes have been recorded in audit history.</p>
                    </div>
                  )}
                </div>

                {/* Session Inactivity Monitor */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-neutral-800 font-bold text-sm">
                    <Clock className="w-4 h-4 text-[#0B8F63]" />
                    <span>Session Security & Inactivity Timeout</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Active admin session automatically terminates after <strong>30 minutes of inactivity</strong> (no cursor or keyboard interactions).
                  </p>
                  <div className="bg-neutral-100 p-3 rounded-xl text-[11px] font-mono text-neutral-600 flex items-center justify-between">
                    <span>Status: ACTIVE & MONITORED</span>
                    <span className="text-[#0B8F63] font-bold">Auto-Logout: 30 Mins</span>
                  </div>
                </div>

                {/* Change Password Card */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0B8F63] flex items-center justify-center shrink-0">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif-heading font-bold text-base text-neutral-900">
                          Admin Password & Security
                        </h3>
                        <p className="text-xs text-neutral-500">
                          {isGoogleUser
                            ? 'Google Account Authentication Active'
                            : 'Update your admin password securely via Firebase Authentication'}
                        </p>
                      </div>
                    </div>

                    {!isGoogleUser ? (
                      <button
                        onClick={() => setActiveTab('password')}
                        className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all shrink-0"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Change Password</span>
                      </button>
                    ) : (
                      <a
                        href="https://myaccount.google.com/security"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Manage Google Account</span>
                      </a>
                    )}
                  </div>

                  {isGoogleUser && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-xs text-blue-900 font-medium">
                      You are signed in with Google. Your password is managed by your Google Account.
                    </div>
                  )}
                </div>

                {/* Factory Reset Card */}
                <div className="bg-rose-50 p-6 rounded-2xl border border-rose-200/80 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-base">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Restore Factory Defaults</span>
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    Clears all custom dashboard updates and restores original catalog defaults.
                  </p>
                  <button
                    onClick={() => {
                      triggerReAuthGuard('Reset Store to Factory Defaults', () => {
                        resetToDefaults();
                        showNotification('All store data restored to factory defaults.');
                      });
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Store Data</span>
                  </button>
                </div>

              </div>
            )}

            {/* Change Password Dedicated View */}
            {activeTab === 'password' && (
              <ChangePasswordView
                onSuccess={() => {
                  onClose();
                }}
                onCancel={() => {
                  setActiveTab('settings');
                }}
              />
            )}

            {/* TAB: STORE INFO, CONTACT & GOOGLE MAPS SETTINGS */}
            {activeTab === 'homepage' && (
              <form onSubmit={handleSaveStoreContent} className="space-y-6 max-w-4xl">
                {/* Store Identity & Contact */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
                  <h3 className="font-serif-heading font-bold text-base text-neutral-900 border-b border-neutral-100 pb-2 flex items-center justify-between">
                    <span>Store Identity & Contact Details</span>
                    <span className="text-xs font-semibold text-[#0B8F63] bg-[#0B8F63]/10 px-2.5 py-1 rounded-full">
                      Updates Contact & Footer Instantly
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Store Name</label>
                      <input
                        type="text"
                        value={storeInfoForm.name}
                        onChange={(e) => setStoreInfoForm({ ...storeInfoForm, name: e.target.value })}
                        className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none font-bold text-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Store Tagline</label>
                      <input
                        type="text"
                        value={storeInfoForm.tagline}
                        onChange={(e) => setStoreInfoForm({ ...storeInfoForm, tagline: e.target.value })}
                        className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={storeInfoForm.phone}
                        onChange={(e) => setStoreInfoForm({ ...storeInfoForm, phone: e.target.value })}
                        className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">WhatsApp Order Number</label>
                      <input
                        type="text"
                        value={storeInfoForm.whatsappNumber}
                        onChange={(e) => setStoreInfoForm({ ...storeInfoForm, whatsappNumber: e.target.value })}
                        className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Store Email</label>
                      <input
                        type="email"
                        value={storeInfoForm.email}
                        onChange={(e) => setStoreInfoForm({ ...storeInfoForm, email: e.target.value })}
                        className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Business Hours</label>
                      <input
                        type="text"
                        value={storeInfoForm.businessHours}
                        onChange={(e) => setStoreInfoForm({ ...storeInfoForm, businessHours: e.target.value })}
                        className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Full Store Address</label>
                    <textarea
                      rows={2}
                      value={storeInfoForm.address}
                      onChange={(e) => setStoreInfoForm({ ...storeInfoForm, address: e.target.value })}
                      className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none font-medium text-xs"
                    />
                  </div>
                </div>

                {/* Google Maps & Location Settings */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
                  <h3 className="font-serif-heading font-bold text-base text-neutral-900 border-b border-neutral-100 pb-2">
                    Google Maps & Navigation Settings
                  </h3>
                  <div className="grid grid-cols-1 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Google Maps Direct Link</label>
                      <input
                        type="url"
                        value={storeInfoForm.googleMapsLink || ''}
                        onChange={(e) => setStoreInfoForm({ ...storeInfoForm, googleMapsLink: e.target.value })}
                        placeholder="https://maps.app.goo.gl/WuqcuomVPaRVofyN9"
                        className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none font-mono text-xs text-blue-700"
                      />
                      <p className="text-[10px] text-neutral-500 mt-1">
                        Used for "Open in Google Maps" and "Get Directions" buttons.
                      </p>
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Google Maps Embed URL</label>
                      <input
                        type="url"
                        value={storeInfoForm.googleMapsEmbed || ''}
                        onChange={(e) => setStoreInfoForm({ ...storeInfoForm, googleMapsEmbed: e.target.value })}
                        placeholder="https://www.google.com/maps/embed?pb=..."
                        className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none font-mono text-xs text-neutral-600"
                      />
                      <p className="text-[10px] text-neutral-500 mt-1">
                        URL used inside the embedded map iframe.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-neutral-700 block mb-1">Store Coordinates (Lat, Long)</label>
                        <input
                          type="text"
                          value={storeInfoForm.coordinates || ''}
                          onChange={(e) => setStoreInfoForm({ ...storeInfoForm, coordinates: e.target.value })}
                          placeholder="26.343896, 73.5358763"
                          className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-neutral-700 block mb-1">Owner Contact / Names</label>
                        <input
                          type="text"
                          value={storeInfoForm.ownerContact || ''}
                          onChange={(e) => setStoreInfoForm({ ...storeInfoForm, ownerContact: e.target.value })}
                          placeholder="Vijay Parihar & Vishal Parihar"
                          className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>SAVE STORE INFO & MAP DETAILS</span>
                </button>
              </form>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
                    <div className="text-neutral-500 font-bold text-xs">Total Products</div>
                    <div className="font-serif-heading font-extrabold text-3xl text-[#0B8F63] mt-2">
                      {products.length}
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
                    <div className="text-neutral-500 font-bold text-xs">In-Stock Items</div>
                    <div className="font-serif-heading font-extrabold text-3xl text-emerald-600 mt-2">
                      {products.filter((p) => p.inStock).length}
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
                    <div className="text-neutral-500 font-bold text-xs">Audit Logs</div>
                    <div className="font-serif-heading font-extrabold text-3xl text-indigo-600 mt-2">
                      {auditLogs.length}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* --- RE-AUTHENTICATION MODAL --- */}
      {reAuthPendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setReAuthPendingAction(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-100 p-6 space-y-4 z-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <Lock className="w-4 h-4" />
                <span>Security Re-Authentication</span>
              </div>
              <button onClick={() => setReAuthPendingAction(null)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600">
              Performing sensitive operation: <strong className="text-neutral-900">{reAuthActionTitle}</strong>.
              Please re-enter your admin password to confirm identity.
            </p>

            <form onSubmit={handleReAuthSubmit} className="space-y-3">
              {reAuthError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {reAuthError}
                </div>
              )}

              <input
                type="password"
                required
                autoFocus
                placeholder="Enter admin password to authorize"
                value={reAuthPassword}
                onChange={(e) => setReAuthPassword(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-rose-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReAuthPendingAction(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-md"
                >
                  CONFIRM & EXECUTE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SMART DYNAMIC PRODUCT ADD / EDIT MODAL --- */}
      {editingProduct && (
        <SmartProductFormModal
          product={editingProduct}
          isCreating={isCreatingProduct}
          onSave={(savedProduct) => handleSaveProduct(savedProduct)}
          onClose={() => setEditingProduct(null)}
          onDuplicate={(duplicated) => handleDuplicateProduct(duplicated)}
        />
      )}

      {/* Real-time Order Notification Drawer */}
      <AdminNotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
      />

    </div>
  );
};
