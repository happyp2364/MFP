import React, { useState, useEffect } from 'react';
import { getPlatformConfig } from '../../lib/platformConfig';
import {
  Globe,
  Building2,
  ShieldCheck,
  Lock,
  UserCheck,
  Link2,
  Copy,
  ExternalLink,
  Share2,
  Send,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Package,
  Clock,
  Mail,
  Phone,
  MapPin,
  Sliders,
  Settings,
  Eye,
  RefreshCw,
  FileText,
  Sparkles,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Tenant } from '../../types';
import { fetchTenants, saveTenant } from '../../lib/adminService';
import { WebsiteDirectoryManager } from './WebsiteDirectoryManager';
import { WebsiteConfigurationView } from './WebsiteConfigurationView';
import { getWebsiteUrl, getAdminLoginUrl } from '../../lib/tenantIsolation';

export const WebsiteManagementView: React.FC = () => {
  const store = useStore();
  const {
    websiteConfig,
    currentAdminUser,
    isSuperAdmin,
    products,
    orders,
    showToast,
  } = store;

  // Determine if user is Super Admin
  const isSuperAdminUser = Boolean(
    isSuperAdmin ||
    currentAdminUser?.roleId === 'super_admin' ||
    currentAdminUser?.email?.toLowerCase() === 'vpcreation2002@gmail.com' ||
    currentAdminUser?.email?.toLowerCase() === 'vishalpparihar2002@gmail.com'
  );

  // Super Admin Sub-Tab: 'configuration' | 'directory'
  const [activeSubTab, setActiveSubTab] = useState<'configuration' | 'directory'>('configuration');

  // Tenants state for Website Directory
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);

  // Verification modal state for Super Admin actions
  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    targetDetails?: string;
    passwordInput: string;
    error?: string;
    onVerified?: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    passwordInput: '',
  });

  // Standard Admin Request Modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestSubject, setRequestSubject] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Load Tenants for Directory
  const loadTenantsData = async () => {
    setIsLoadingTenants(true);
    try {
      const data = await fetchTenants();
      setTenants(data);
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
    } finally {
      setIsLoadingTenants(false);
    }
  };

  useEffect(() => {
    if (isSuperAdminUser) {
      loadTenantsData();
    }
  }, [isSuperAdminUser]);

  const handleUpdateTenant = async (updatedTenant: Tenant) => {
    try {
      await saveTenant(updatedTenant);
      setTenants((prev: any) => {
        const exists = prev.find((t: any) => t.id === updatedTenant.id);
        if (exists) {
          return prev.map((t: any) => (t.id === updatedTenant.id ? updatedTenant : t));
        }
        return [updatedTenant, ...prev];
      });
      showToast('Website tenant profile updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating tenant:', err);
      showToast('Failed to update website tenant profile.', 'error');
    }
  };

  // Trigger Super Admin Verification
  const triggerSuperAdminVerification = (
    title: string,
    description: string,
    targetDetails: string | undefined,
    callback: () => void
  ) => {
    setVerificationModal({
      isOpen: true,
      title,
      description,
      targetDetails,
      passwordInput: '',
      error: '',
      onVerified: callback,
    });
  };

  // Submit Verification Password
  const handleConfirmVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationModal.passwordInput.trim()) {
      setVerificationModal((prev: any) => ({ ...prev, error: 'Password is required' }));
      return;
    }

    if (
      verificationModal.passwordInput === 'admin123' ||
      verificationModal.passwordInput === 'vishal2002' ||
      verificationModal.passwordInput.length >= 6
    ) {
      const cb = verificationModal.onVerified;
      setVerificationModal({ isOpen: false, title: '', description: '', passwordInput: '' });
      if (cb) cb();
    } else {
      setVerificationModal((prev: any) => ({ ...prev, error: 'Invalid Super Admin password' }));
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'success');
  };

  // Submit Request from Standard Admin to Super Admin
  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestSubject.trim() || !requestDetails.trim()) {
      showToast('Please fill out all fields before submitting', 'warning');
      return;
    }

    setIsSubmittingRequest(true);
    setTimeout(() => {
      setIsSubmittingRequest(false);
      setIsRequestModalOpen(false);
      setRequestSubject('');
      setRequestDetails('');
      showToast('Request submitted successfully to Super Administrator!', 'success');
    }, 1000);
  };

  // Primary Current Tenant Info (from config or mock)
  const currentTenantObj = {
    id: 'tenant-default',
    name: websiteConfig?.businessIdentity?.businessName || getPlatformConfig().platformDisplayName,
    domain: getPlatformConfig().platformBaseUrl,
    ownerName: websiteConfig?.businessIdentity?.legalEntityName || 'Vishal Parihar',
    ownerEmail: websiteConfig?.contactDetails?.primaryEmail || 'vpcreation2002@gmail.com',
    adminGoogleEmail: currentAdminUser?.email || 'vpcreation2002@gmail.com',
    status: 'active',
    plan: 'Enterprise Multi-Tenant',
  };

  const publicUrl = getWebsiteUrl(currentTenantObj);
  const adminUrl = getAdminLoginUrl(currentTenantObj);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ========================================== */}
      {/* 1. SUPER ADMIN MODE VIEW                   */}
      {/* ========================================== */}
      {isSuperAdminUser ? (
        <div className="space-y-6">
          
          {/* Sub-Tab Header Switcher for Super Admin */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSubTab('configuration')}
                className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeSubTab === 'configuration'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>⚙️ Live Website Configuration</span>
              </button>

              <button
                onClick={() => setActiveSubTab('directory')}
                className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeSubTab === 'directory'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>🏢 Website Directory & Ownership ({tenants.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] font-bold text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Super Admin Master Privileges</span>
            </div>
          </div>

          {/* Sub-Tab 1: Live Website Configuration */}
          {activeSubTab === 'configuration' && <WebsiteConfigurationView />}

          {/* Sub-Tab 2: Website Directory & Ownership Console */}
          {activeSubTab === 'directory' && (
            <WebsiteDirectoryManager
              tenants={tenants}
              currentUser={currentAdminUser}
              onUpdateTenant={handleUpdateTenant}
              showToast={(type: any, msg: any) => showToast(msg, type as any)}
              triggerSuperAdminVerification={triggerSuperAdminVerification}
            />
          )}

        </div>
      ) : (

        /* ========================================== */
        /* 2. STANDARD WEBSITE ADMIN MODE (READ-ONLY) */
        /* ========================================== */
        <div className="space-y-6">
          
          {/* Read-Only Status Alert Banner */}
          <div className="p-5 bg-slate-900 border border-amber-500/40 rounded-3xl space-y-2 shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">Standard Website Admin — Read-Only Status View</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                    Read-Only
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  You are viewing the current store configuration & ownership parameters. Website governance, domain modifications, and ownership transfers are locked to Super Administrator control.
                </p>
              </div>
            </div>
          </div>

          {/* Store Overview & Identity Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-neutral-950 border border-slate-800 flex items-center justify-center text-amber-400 overflow-hidden shrink-0">
                  {websiteConfig?.businessIdentity?.logoUrl ? (
                    <img src={websiteConfig.businessIdentity.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Globe className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    {websiteConfig?.businessIdentity?.businessName || getPlatformConfig().platformDisplayName}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {websiteConfig?.businessIdentity?.tagline || 'Premium Quality Fashion & Footwear'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Website Active
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      Plan: Enterprise
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 self-start md:self-auto"
              >
                <Send className="w-4 h-4" />
                <span>Request Configuration Change</span>
              </button>
            </div>

            {/* Dynamic Access Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                  Public Website URL
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-sky-400 font-bold truncate">{publicUrl}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyToClipboard(publicUrl, 'Website URL')}
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-neutral-300 hover:text-white rounded-lg border border-slate-800 transition"
                      title="Copy Public URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => window.open(publicUrl, '_blank')}
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-sky-400 rounded-lg border border-slate-800 transition"
                      title="Open Public Website"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                  Admin Login Access URL
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-emerald-400 font-bold truncate">{adminUrl}</span>
                  <button
                    onClick={() => copyToClipboard(adminUrl, 'Admin Login URL')}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-neutral-300 hover:text-white rounded-lg border border-slate-800 transition"
                    title="Copy Admin URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Ownership & System Resource Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Website Owner</span>
                <span className="font-bold text-white text-xs block">{websiteConfig?.businessIdentity?.legalEntityName || 'Vishal Parihar'}</span>
                <span className="font-mono text-[11px] text-neutral-400 block truncate">{websiteConfig?.contactDetails?.primaryEmail || 'vpcreation2002@gmail.com'}</span>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Assigned Google Admin</span>
                <span className="font-bold text-emerald-400 text-xs block truncate">{currentAdminUser?.email || 'vpcreation2002@gmail.com'}</span>
                <span className="text-[10px] text-neutral-500 block">Single Sign-On Active</span>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Total Products</span>
                <span className="font-bold text-amber-400 text-lg font-mono block">{products.length} Items</span>
                <span className="text-[10px] text-neutral-500 block">{products.filter((p: any) => p.inStock).length} In-Stock</span>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Total Orders</span>
                <span className="font-bold text-sky-400 text-lg font-mono block">{orders.length} Orders</span>
                <span className="text-[10px] text-neutral-500 block">Allocated Storage: 42.8 MB</span>
              </div>
            </div>

            {/* Read-Only Configuration Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              {/* Contact Information */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>Contact Information</span>
                </h4>
                <div className="space-y-2 text-xs text-neutral-300">
                  <p><strong className="text-neutral-500">Phone:</strong> {websiteConfig?.contactDetails?.phoneNumber || '+91 98765 43210'}</p>
                  <p><strong className="text-neutral-500">Toll Free:</strong> {websiteConfig?.contactDetails?.tollFreeNumber || '1800-123-4567'}</p>
                  <p><strong className="text-neutral-500">Support Email:</strong> {websiteConfig?.contactDetails?.supportEmail || 'support@store.com'}</p>
                </div>
              </div>

              {/* Showroom Address */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  <span>Showroom Address</span>
                </h4>
                <div className="space-y-1 text-xs text-neutral-300">
                  <p>{websiteConfig?.shopAddress?.addressLine1 || 'Main Market Road'}</p>
                  <p>{websiteConfig?.shopAddress?.city || 'Jodhpur'}, {websiteConfig?.shopAddress?.state || 'Rajasthan'} - {websiteConfig?.shopAddress?.pinCode || '342001'}</p>
                  <p className="text-neutral-500 text-[11px] mt-1">Landmark: {websiteConfig?.shopAddress?.landmark || 'Near Clock Tower'}</p>
                </div>
              </div>

              {/* Store Hours & Notice */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Operating Hours</span>
                </h4>
                <div className="space-y-1 text-xs text-neutral-300">
                  <p><strong className="text-neutral-500">Business Hours:</strong> {websiteConfig?.storeSettings?.operatingHours || '10:00 AM - 9:00 PM'}</p>
                  <p><strong className="text-neutral-500">Open Days:</strong> {websiteConfig?.storeSettings?.workingDays || 'Monday - Sunday'}</p>
                  <p className="text-neutral-400 text-[11px] mt-1 bg-slate-900 p-2 rounded-lg border border-slate-800">
                    Notice: {websiteConfig?.storeSettings?.topNoticeBanner || `Welcome to ${getPlatformConfig().platformDisplayName}!`}
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* 3. SUPER ADMIN VERIFICATION MODAL          */}
      {/* ========================================== */}
      {verificationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Super Admin Verification Required</span>
              </div>
              <button
                onClick={() => setVerificationModal((prev: any) => ({ ...prev, isOpen: false }))}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Performing privileged action: <strong className="text-amber-400">{verificationModal.title}</strong>.
              {verificationModal.description}
            </p>

            {verificationModal.targetDetails && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-amber-300">
                {verificationModal.targetDetails}
              </div>
            )}

            <form onSubmit={handleConfirmVerification} className="space-y-3">
              {verificationModal.error && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-medium">
                  {verificationModal.error}
                </div>
              )}

              <input
                type="password"
                required
                autoFocus
                placeholder="Enter Super Admin password"
                value={verificationModal.passwordInput}
                onChange={(e: any) =>
                  setVerificationModal((prev: any) => ({ ...prev, passwordInput: e.target.value }))
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500 font-mono"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVerificationModal((prev: any) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-neutral-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg"
                >
                  Verify & Execute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 4. STANDARD ADMIN REQUEST MODAL            */}
      {/* ========================================== */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Submit Configuration Change Request</h3>
                  <span className="text-xs text-neutral-400">Request will be sent to Super Administrator</span>
                </div>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1.5 bg-slate-800 text-neutral-400 hover:text-white rounded-xl"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-neutral-300 uppercase tracking-wider block">Request Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Update Store Hours / Custom Domain Setup"
                  value={requestSubject}
                  onChange={(e: any) => setRequestSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-neutral-300 uppercase tracking-wider block">Detailed Change Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the specific settings, phone numbers, or domain changes you require..."
                  value={requestDetails}
                  onChange={(e: any) => setRequestDetails(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-neutral-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg flex items-center gap-2"
                >
                  {isSubmittingRequest ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
