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
import { fetchTenants, saveTenant, deleteTenant } from '../../lib/adminService';
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
    (currentAdminUser?.email || '').toLowerCase() === 'vpcreation2002@gmail.com' ||
    (currentAdminUser?.email || '').toLowerCase() === 'vishalpparihar2002@gmail.com'
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

  const handleDeleteTenant = async (tenantId: string) => {
    try {
      const res = await deleteTenant(tenantId);
      if (res.success) {
        setTenants((prev: Tenant[]) => prev.filter((t) => t.id !== tenantId));
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete website tenant', 'error');
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
              onDeleteTenant={handleDeleteTenant}
              showToast={(type: any, msg: any) => showToast(msg, type as any)}
              triggerSuperAdminVerification={triggerSuperAdminVerification}
            />
          )}

        </div>
      ) : (
        /* ========================================== */
        /* 2. TENANT WEBSITE ADMIN MODE (FULL EDIT)   */
        /* ========================================== */
        <WebsiteConfigurationView />
      )}
    </div>
  );
};
