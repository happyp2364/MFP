import React, { useState, useMemo } from 'react';
import {
  Globe,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Plus,
  ExternalLink,
  Eye,
  UserCheck,
  Building2,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  Archive,
  RefreshCw,
  Sliders,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Clock,
  Sparkles,
  Server,
  FileText,
  ChevronLeft,
  ChevronRight,
  Mail,
  Edit3,
  Activity,
  Copy,
  Share2,
  Link2,
  UserPlus,
  Power,
  Crown,
  ArrowRightLeft,
  ShieldCheck,
} from 'lucide-react';
import { Tenant, AdminUser } from '../../types';
import { getWebsiteUrl, getAdminLoginUrl, sanitizeSlug, isValidSlug, isSlugAvailable } from '../../lib/tenantIsolation';
import { transferTenantOwnership } from '../../lib/adminService';
import { ProvisionWebsiteModal } from './ProvisionWebsiteModal';
import { buildWebsiteUrl, buildAdminLoginUrl, getPlatformConfig } from '../../lib/platformConfig';

interface WebsiteDirectoryManagerProps {
  tenants: Tenant[];
  currentUser: AdminUser | null;
  onUpdateTenant: (tenant: Tenant) => Promise<void>;
  onDeleteTenant?: (tenantId: string) => Promise<void>;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  triggerSuperAdminVerification: (title: string, desc: string, details: string, callback: () => void) => void;
}

export const WebsiteDirectoryManager: React.FC<WebsiteDirectoryManagerProps> = ({
  tenants,
  currentUser,
  onUpdateTenant,
  onDeleteTenant,
  showToast,
  triggerSuperAdminVerification,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Website for Details Drawer
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Google Admin / Owner Assignment Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningTenant, setAssigningTenant] = useState<Tenant | null>(null);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [ownerNameInput, setOwnerNameInput] = useState('');
  const [ownerEmailInput, setOwnerEmailInput] = useState('');

  // Provision Website Modal (Super Admin)
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);

  // Generate / Edit Website URL Modal
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlTenant, setUrlTenant] = useState<Tenant | null>(null);
  const [slugInput, setSlugInput] = useState('');
  const [customDomainInput, setCustomDomainInput] = useState('');

  // Share Modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharingTenant, setSharingTenant] = useState<Tenant | null>(null);

  // Dedicated Secure Transfer Ownership Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTenant, setTransferTenant] = useState<Tenant | null>(null);
  const [transferNewOwnerName, setTransferNewOwnerName] = useState('');
  const [transferNewOwnerEmail, setTransferNewOwnerEmail] = useState('');
  const [transferNewOwnerGoogleEmail, setTransferNewOwnerGoogleEmail] = useState('');
  const [transferNewOwnerPhone, setTransferNewOwnerPhone] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [transferDisclaimerChecked, setTransferDisclaimerChecked] = useState(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  // Security Check: Normal Admin cannot view Website Directory
  const isSuperAdmin =
    currentUser?.roleId === 'super_admin' ||
    currentUser?.email?.toLowerCase() === 'vpcreation2002@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'vishalpparihar2002@gmail.com';

  if (!isSuperAdmin) {
    return (
      <div className="p-12 text-center bg-neutral-950 border border-neutral-800 rounded-3xl space-y-4">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black text-white">Access Denied: Super Admin Restricted</h2>
        <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
          The Website Directory & Ownership Management console is restricted exclusively to Super Administrator profiles. Normal store administrators cannot view website directories, manage ownership, or inspect external URLs.
        </p>
      </div>
    );
  }

  // Filtered & Searched Tenants
  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const matchSearch =
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tenant.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tenant.ownerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tenant.adminGoogleEmail || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || tenant.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tenants, searchTerm, statusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage) || 1;
  const paginatedTenants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTenants.slice(start, start + itemsPerPage);
  }, [filteredTenants, currentPage]);

  // Helper to copy text with feedback
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('success', `${label} copied to clipboard!`);
  };

  // Share functionality
  const handleShareWebsite = async (tenant: Tenant) => {
    const webUrl = getWebsiteUrl(tenant);
    if (navigator.share) {
      try {
        await navigator.share({
          title: tenant.name,
          text: `Check out ${tenant.name}`,
          url: webUrl,
        });
        showToast('success', 'Shared successfully!');
      } catch (err) {
        // Fallback to share modal
        setSharingTenant(tenant);
        setIsShareModalOpen(true);
      }
    } else {
      setSharingTenant(tenant);
      setIsShareModalOpen(true);
    }
  };

  // Handle Owner & Google Admin Change Submission
  const handleSaveOwnership = async () => {
    if (!assigningTenant) return;

    const updatedTenant: Tenant = {
      ...assigningTenant,
      ownerName: ownerNameInput.trim() || assigningTenant.ownerName,
      ownerEmail: ownerEmailInput.trim() || assigningTenant.ownerEmail,
      adminGoogleEmail: googleEmailInput.trim() || undefined,
      adminLoginStatus: googleEmailInput.trim() ? 'pending_activation' : undefined,
    };

    triggerSuperAdminVerification(
      'Update Website Ownership',
      `Updating owner & admin details for "${assigningTenant.name}"`,
      `Owner: ${ownerNameInput} (${ownerEmailInput}) | Admin: ${googleEmailInput}`,
      async () => {
        try {
          await onUpdateTenant(updatedTenant);
          showToast('success', `Ownership successfully updated for ${assigningTenant.name}`);
          setIsAssignModalOpen(false);
          setAssigningTenant(null);
        } catch (err) {
          showToast('error', 'Failed to update website ownership');
        }
      }
    );
  };

  // Open Transfer Ownership Modal
  const openTransferModal = (tenant: Tenant) => {
    setTransferTenant(tenant);
    setTransferNewOwnerName(tenant.ownerName || '');
    setTransferNewOwnerEmail(tenant.ownerEmail || '');
    setTransferNewOwnerGoogleEmail(tenant.adminGoogleEmail || tenant.ownerEmail || '');
    setTransferNewOwnerPhone('');
    setTransferReason('');
    setTransferDisclaimerChecked(false);
    setIsTransferModalOpen(true);
  };

  // Execute Transfer Ownership with Firestore update & Notification trigger
  const handleExecuteTransferOwnership = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTenant) return;
    if (!transferNewOwnerName.trim() || !transferNewOwnerEmail.trim()) {
      showToast('error', 'New Owner Name and Email address are required');
      return;
    }
    if (!transferDisclaimerChecked) {
      showToast('warning', 'Please check the disclaimer to authorize legal ownership transfer');
      return;
    }

    triggerSuperAdminVerification(
      'Transfer Website Ownership',
      `Transferring primary legal ownership and admin access for website "${transferTenant.name}"`,
      `Target Owner: ${transferNewOwnerName} (${transferNewOwnerEmail})`,
      async () => {
        setIsSubmittingTransfer(true);
        try {
          const updated = await transferTenantOwnership(transferTenant, {
            ownerName: transferNewOwnerName.trim(),
            ownerEmail: transferNewOwnerEmail.trim(),
            adminGoogleEmail: transferNewOwnerGoogleEmail.trim() || transferNewOwnerEmail.trim(),
            ownerPhone: transferNewOwnerPhone.trim(),
            transferReason: transferReason.trim(),
          });
          await onUpdateTenant(updated);
          showToast('success', `Ownership of "${transferTenant.name}" successfully transferred to ${transferNewOwnerName}! Notification dispatched.`);
          setIsTransferModalOpen(false);
          setTransferTenant(null);
          setTransferReason('');
          setTransferDisclaimerChecked(false);
        } catch (err) {
          console.error('Transfer ownership error:', err);
          showToast('error', 'Failed to transfer website ownership.');
        } finally {
          setIsSubmittingTransfer(false);
        }
      }
    );
  };

  // Handle URL & Custom Domain Update
  const handleSaveDomain = async () => {
    if (!urlTenant) return;

    const cleanSlug = sanitizeSlug(slugInput);
    if (cleanSlug) {
      const valid = isValidSlug(cleanSlug);
      if (!valid.valid) {
        showToast('error', valid.error || 'Invalid Website Slug format');
        return;
      }
      const avail = isSlugAvailable(cleanSlug, tenants, urlTenant.id);
      if (!avail) {
        showToast('error', `Website Slug "${cleanSlug}" is already taken by another store`);
        return;
      }
    }

    const cleanDomain = customDomainInput.trim().replace(/^https?:\/\//, '');
    const webUrl = cleanDomain ? `https://${cleanDomain}` : cleanSlug ? buildWebsiteUrl(cleanSlug) : undefined;
    const adminUrl = cleanDomain ? `https://${cleanDomain}?admin=true` : cleanSlug ? buildAdminLoginUrl(cleanSlug) : undefined;

    const updatedTenant: Tenant = {
      ...urlTenant,
      slug: cleanSlug || urlTenant.slug,
      customDomain: cleanDomain || undefined,
      websiteUrl: webUrl,
      adminLoginUrl: adminUrl,
    };

    triggerSuperAdminVerification(
      'Generate / Update Website URL & Slug',
      `Configuring dynamic URL for "${urlTenant.name}"`,
      `Slug: /${cleanSlug || urlTenant.slug || 'none'} | Domain: ${cleanDomain || 'Default Dynamic URL'}`,
      async () => {
        try {
          await onUpdateTenant(updatedTenant);
          showToast('success', `Website URL & Slug updated for ${urlTenant.name}`);
          setIsUrlModalOpen(false);
          setUrlTenant(null);
        } catch (err) {
          showToast('error', 'Failed to update website URL');
        }
      }
    );
  };

  // Handle Website Status Actions
  const handleStatusChange = (tenant: Tenant, newStatus: Tenant['status']) => {
    const actionLabel =
      newStatus === 'suspended'
        ? 'Suspend'
        : newStatus === 'archived'
        ? 'Archive'
        : newStatus === 'active'
        ? 'Activate'
        : 'Update Status';

    triggerSuperAdminVerification(
      `${actionLabel} Website`,
      `Are you sure you want to change status to "${newStatus}" for website "${tenant.name}"?`,
      `Website ID: ${tenant.id} | Target Status: ${newStatus}`,
      async () => {
        try {
          await onUpdateTenant({ ...tenant, status: newStatus });
          showToast('success', `Website status updated to ${newStatus}`);
        } catch (err) {
          showToast('error', 'Failed to update website status');
        }
      }
    );
  };

  // Handle Permanent Delete
  const handleDeleteWebsite = (tenant: Tenant) => {
    triggerSuperAdminVerification(
      'DELETE WEBSITE PERMANENTLY',
      `CRITICAL ACTION: Permanently delete website "${tenant.name}" (${tenant.id})`,
      'This will revoke all domain configurations and remove tenant access.',
      async () => {
        try {
          if (onDeleteTenant) {
            await onDeleteTenant(tenant.id);
          } else {
            await onUpdateTenant({ ...tenant, status: 'archived' });
          }
          showToast('success', `Website ${tenant.name} archived / deleted successfully`);
        } catch (err) {
          showToast('error', 'Failed to delete website');
        }
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <span>Website Directory & Ownership Console</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Enterprise multi-tenant website governance, dynamic URL management, and owner bindings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, name, slug, domain, owner..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 w-64"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-xl p-1 text-xs">
            {['all', 'active', 'draft', 'maintenance', 'suspended', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg font-bold uppercase text-[10px] transition-all ${
                  statusFilter === status
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Create Website URL Button (Super Admin Only) */}
          {isSuperAdmin && (
            <button
              onClick={() => setIsProvisionModalOpen(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Website URL</span>
            </button>
          )}
        </div>
      </div>

      {/* Website Directory Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Logo</th>
                <th className="p-4">Website Name & ID</th>
                <th className="p-4">Owner Name & Email</th>
                <th className="p-4">Website URL (Dynamic)</th>
                <th className="p-4">Admin Login URL</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Super Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {paginatedTenants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-neutral-500 font-bold">
                    No websites match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedTenants.map((tenant) => {
                  const webUrl = getWebsiteUrl(tenant);
                  const adminUrl = getAdminLoginUrl(tenant);

                  return (
                    <tr key={tenant.id} className="hover:bg-neutral-900/40 transition-colors">
                      {/* Logo */}
                      <td className="p-4">
                        <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                          {tenant.logoUrl ? (
                            <img src={tenant.logoUrl} alt={tenant.name} className="w-full h-full object-cover" />
                          ) : (
                            <Globe className="w-5 h-5 text-amber-400" />
                          )}
                        </div>
                      </td>

                      {/* Business Name & ID */}
                      <td className="p-4">
                        <span className="font-bold text-white block max-w-[180px] truncate" title={tenant.name}>
                          {tenant.name}
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono block truncate">
                          ID: {tenant.id}
                        </span>
                      </td>

                      {/* Owner Name & Email */}
                      <td className="p-4">
                        <span className="font-bold text-neutral-200 block">
                          {tenant.ownerName || 'Primary Admin'}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono block truncate max-w-[160px]" title={tenant.ownerEmail}>
                          {tenant.ownerEmail || tenant.adminGoogleEmail || 'No email assigned'}
                        </span>
                      </td>

                      {/* Website URL */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-sky-400 truncate max-w-[180px]" title={webUrl}>
                            {webUrl}
                          </span>
                          <button
                            onClick={() => copyToClipboard(webUrl, 'Website URL')}
                            title="Copy Website URL"
                            className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded border border-neutral-800 transition"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Admin Login URL */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-emerald-400 truncate max-w-[180px]" title={adminUrl}>
                            {adminUrl}
                          </span>
                          <button
                            onClick={() => copyToClipboard(adminUrl, 'Admin Login URL')}
                            title="Copy Admin Login URL"
                            className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded border border-neutral-800 transition"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 border ${
                          tenant.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                            : tenant.status === 'draft'
                            ? 'bg-neutral-900 text-neutral-400 border-neutral-800'
                            : tenant.status === 'maintenance'
                            ? 'bg-amber-950 text-amber-400 border-amber-500/30'
                            : tenant.status === 'suspended'
                            ? 'bg-rose-950 text-rose-400 border-rose-500/30'
                            : 'bg-purple-950 text-purple-400 border-purple-500/30'
                        }`}>
                          {tenant.status}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="p-4 text-neutral-400 font-mono text-[11px]">
                        {new Date(tenant.createdAt || Date.now()).toLocaleDateString()}
                      </td>

                      {/* Quick Actions (Super Admin Only) */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Open Website */}
                          <button
                            onClick={() => window.open(webUrl, '_blank')}
                            title="Open Website"
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-sky-400 border border-neutral-800 rounded-lg transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {/* Share Website */}
                          <button
                            onClick={() => handleShareWebsite(tenant)}
                            title="Share Website URL"
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-purple-400 border border-neutral-800 rounded-lg transition-all"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Configure URL / Domain */}
                          <button
                            onClick={() => {
                              setUrlTenant(tenant);
                              setSlugInput(tenant.slug || sanitizeSlug(tenant.name));
                              setCustomDomainInput(tenant.customDomain || '');
                              setIsUrlModalOpen(true);
                            }}
                            title="Generate / Edit Custom Domain & Website Slug URL"
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-neutral-800 rounded-lg transition-all"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Transfer Ownership */}
                          <button
                            onClick={() => openTransferModal(tenant)}
                            title="Transfer Primary Website Ownership"
                            className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition-all"
                          >
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                          </button>

                          {/* View Details */}
                          <button
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setIsDrawerOpen(true);
                            }}
                            title="View Full Website Details"
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-blue-400 border border-neutral-800 rounded-lg transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Change / Assign Owner */}
                          <button
                            onClick={() => {
                              setAssigningTenant(tenant);
                              setOwnerNameInput(tenant.ownerName || '');
                              setOwnerEmailInput(tenant.ownerEmail || '');
                              setGoogleEmailInput(tenant.adminGoogleEmail || '');
                              setIsAssignModalOpen(true);
                            }}
                            title="Assign or Change Owner"
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-800 rounded-lg transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Suspend / Restore */}
                          <button
                            onClick={() => {
                              const nextStatus = tenant.status === 'active' ? 'suspended' : 'active';
                              handleStatusChange(tenant, nextStatus);
                            }}
                            title={tenant.status === 'active' ? 'Suspend Website' : 'Activate Website'}
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-rose-400 border border-neutral-800 rounded-lg transition-all"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Archive / Delete */}
                          <button
                            onClick={() => handleDeleteWebsite(tenant)}
                            title="Archive or Delete Website"
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-500 hover:text-rose-400 border border-neutral-800 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Pagination Bar */}
        <div className="p-4 bg-neutral-900/50 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>
            Showing page {currentPage} of {totalPages} ({filteredTenants.length} total websites)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl disabled:opacity-40 hover:bg-neutral-800 transition-all text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-mono font-bold text-white">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl disabled:opacity-40 hover:bg-neutral-800 transition-all text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* SECTION 1: WEBSITE DETAILS DRAWER          */}
      {/* ========================================== */}
      {isDrawerOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-neutral-950 border-l border-neutral-800 h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{selectedTenant.name}</h3>
                  <span className="text-xs text-neutral-400 font-mono">Website ID: {selectedTenant.id}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setSelectedTenant(null);
                }}
                className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs">

              {/* Website URL & Dynamic Links */}
              <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
                <h4 className="font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-sky-400" />
                  <span>Website URL & Login Links</span>
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-neutral-950 rounded-xl flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-neutral-500 block font-bold">Public Website URL</span>
                      <span className="font-mono text-sky-400 font-bold">{getWebsiteUrl(selectedTenant)}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(getWebsiteUrl(selectedTenant), 'Website URL')}
                      className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg border border-neutral-800 transition flex items-center gap-1 font-bold text-[10px]"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>

                  <div className="p-3 bg-neutral-950 rounded-xl flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-neutral-500 block font-bold">Admin Login URL</span>
                      <span className="font-mono text-emerald-400 font-bold">{getAdminLoginUrl(selectedTenant)}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(getAdminLoginUrl(selectedTenant), 'Admin Login URL')}
                      className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg border border-neutral-800 transition flex items-center gap-1 font-bold text-[10px]"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Business Information */}
              <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
                <h4 className="font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Business Information</span>
                </h4>
                <div className="grid grid-cols-2 gap-4 text-neutral-300">
                  <div>
                    <span className="text-neutral-500 block">Category</span>
                    <span className="font-bold text-white">{selectedTenant.businessCategory || 'E-Commerce / Retail'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Plan Tier</span>
                    <span className="font-bold uppercase text-emerald-400">{selectedTenant.plan}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Database Size</span>
                    <span className="font-bold text-white font-mono">{selectedTenant.databaseSize} MB</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Status</span>
                    <span className="font-bold uppercase text-amber-400">{selectedTenant.status}</span>
                  </div>
                </div>
              </div>

              {/* Owner & Admin Information */}
              <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    <span>Owner & Admin Information</span>
                  </h4>
                  <button
                    onClick={() => openTransferModal(selectedTenant)}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl font-extrabold text-[11px] transition-all flex items-center gap-1.5"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Transfer Ownership</span>
                  </button>
                </div>
                <div className="space-y-2 text-neutral-300">
                  <div className="flex justify-between p-2.5 bg-neutral-950 rounded-xl">
                    <span className="text-neutral-500">Owner Name</span>
                    <span className="font-bold text-white">{selectedTenant.ownerName || 'Primary Owner'}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-neutral-950 rounded-xl">
                    <span className="text-neutral-500">Owner Email</span>
                    <span className="font-bold text-amber-300 font-mono">{selectedTenant.ownerEmail}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-neutral-950 rounded-xl">
                    <span className="text-neutral-500">Google Admin Email</span>
                    <span className="font-bold text-emerald-400 font-mono">{selectedTenant.adminGoogleEmail || 'Not Assigned'}</span>
                  </div>
                </div>
              </div>

              {/* Website Statistics */}
              <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
                <h4 className="font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>Website Statistics</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-neutral-950 rounded-xl flex items-center justify-between">
                    <span className="text-neutral-500">Total Products</span>
                    <span className="font-bold text-white font-mono">{selectedTenant.statistics?.totalProducts || 128}</span>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-xl flex items-center justify-between">
                    <span className="text-neutral-500">Total Orders</span>
                    <span className="font-bold text-white font-mono">{selectedTenant.statistics?.totalOrders || 45}</span>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-xl flex items-center justify-between">
                    <span className="text-neutral-500">Gross Revenue</span>
                    <span className="font-bold text-amber-400 font-mono">${selectedTenant.statistics?.totalRevenue || '12,450'}</span>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-xl flex items-center justify-between">
                    <span className="text-neutral-500">Total Customers</span>
                    <span className="font-bold text-white font-mono">{selectedTenant.statistics?.totalCustomers || 84}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SECTION 2: ASSIGN / CHANGE OWNER MODAL     */}
      {/* ========================================== */}
      {isAssignModalOpen && assigningTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Website Ownership & Admin Setup</h3>
                  <span className="text-xs text-neutral-400">Website: {assigningTenant.name}</span>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="text-neutral-400 font-bold uppercase tracking-wider block">Owner Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vishal Parihar"
                  value={ownerNameInput}
                  onChange={(e) => setOwnerNameInput(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-neutral-400 font-bold uppercase tracking-wider block">Owner Email Address</label>
                <input
                  type="email"
                  placeholder="owner@store.com"
                  value={ownerEmailInput}
                  onChange={(e) => setOwnerEmailInput(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-neutral-400 font-bold uppercase tracking-wider block">Google Admin Email (SSO)</label>
                <input
                  type="email"
                  placeholder="admin.store@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOwnership}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg transition-all"
                >
                  Save Ownership Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SECTION 3: GENERATE / CUSTOM DOMAIN MODAL  */}
      {/* ========================================== */}
      {isUrlModalOpen && urlTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
                  <Link2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Generate Website URL & Domain</h3>
                  <span className="text-xs text-neutral-400">Website: {urlTenant.name}</span>
                </div>
              </div>
              <button
                onClick={() => setIsUrlModalOpen(false)}
                className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-neutral-300 leading-relaxed">
                Configure a custom domain or rely on dynamic runtime URL generation. Future-ready architecture allows attaching custom domains without database migrations.
              </p>

              <div className="space-y-2">
                <label className="text-neutral-400 font-bold uppercase tracking-wider block">Website Slug (URL Path)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-neutral-500 font-mono text-xs">/</span>
                  <input
                    type="text"
                    placeholder="e.g. abc-shoes"
                    value={slugInput}
                    onChange={(e) => setSlugInput(sanitizeSlug(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-neutral-400 font-bold uppercase tracking-wider block">Custom Domain (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. store.abcshoes.com"
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="p-4 bg-sky-950/20 border border-sky-900/30 rounded-2xl text-sky-300 space-y-1">
                <span className="font-bold block">Generated URLs Preview:</span>
                <p className="font-mono text-[11px] text-sky-400 truncate">
                  Public URL: {customDomainInput ? `https://${customDomainInput.trim()}` : slugInput ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${slugInput.trim()}` : `${typeof window !== 'undefined' ? window.location.origin : ''}?websiteId=${urlTenant.id}`}
                </p>
                <p className="font-mono text-[11px] text-emerald-400 truncate">
                  Admin Login URL: {customDomainInput ? `https://${customDomainInput.trim()}/admin` : slugInput ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${slugInput.trim()}?admin=true` : `${typeof window !== 'undefined' ? window.location.origin : ''}?admin=true&websiteId=${urlTenant.id}`}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsUrlModalOpen(false)}
                  className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDomain}
                  className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl shadow-lg transition-all"
                >
                  Save URL Config
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SECTION 4: SHARE WEBSITE MODAL             */}
      {/* ========================================== */}
      {isShareModalOpen && sharingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Share Website</h3>
                  <span className="text-xs text-neutral-400">{sharingTenant.name}</span>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="text-neutral-400 font-bold uppercase tracking-wider block">Website Public URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getWebsiteUrl(sharingTenant)}
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sky-400 font-mono text-xs focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(getWebsiteUrl(sharingTenant), 'Website URL')}
                    className="px-4 py-3 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-xl transition shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-neutral-400 font-bold uppercase tracking-wider block">Admin Login URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getAdminLoginUrl(sharingTenant)}
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-emerald-400 font-mono text-xs focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(getAdminLoginUrl(sharingTenant), 'Admin Login URL')}
                    className="px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SECTION 5: SECURE TRANSFER OWNERSHIP MODAL */}
      {/* ========================================== */}
      {isTransferModalOpen && transferTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-neutral-950 border border-amber-500/40 rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
            
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>Transfer Website Ownership</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-black">
                      Super Admin
                    </span>
                  </h3>
                  <span className="text-xs text-neutral-400">Target Website: <strong className="text-amber-300">{transferTenant.name}</strong></span>
                </div>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransferOwnership} className="space-y-4 text-xs">
              
              {/* Current Owner Banner */}
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Current Owner</span>
                  <span className="font-bold text-white">{transferTenant.ownerName || 'Unassigned Owner'}</span>
                </div>
                <span className="font-mono text-amber-400 text-[11px] font-bold">{transferTenant.ownerEmail || 'No email registered'}</span>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider block text-[11px]">New Owner Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={transferNewOwnerName}
                    onChange={(e) => setTransferNewOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider block text-[11px]">New Owner Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="newowner@example.com"
                    value={transferNewOwnerEmail}
                    onChange={(e) => setTransferNewOwnerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider block text-[11px]">Google Admin Email (SSO)</label>
                  <input
                    type="email"
                    placeholder="newowner.admin@gmail.com"
                    value={transferNewOwnerGoogleEmail}
                    onChange={(e) => setTransferNewOwnerGoogleEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider block text-[11px]">New Owner Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={transferNewOwnerPhone}
                    onChange={(e) => setTransferNewOwnerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Reason / Notes */}
              <div className="space-y-1.5">
                <label className="text-neutral-400 font-bold uppercase tracking-wider block text-[11px]">Transfer Reason / Authorization Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Official acquisition, business restructuring, or legal ownership transfer request..."
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white outline-none focus:border-amber-500"
                />
              </div>

              {/* Legal Disclaimer Checkbox */}
              <label className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={transferDisclaimerChecked}
                  onChange={(e) => setTransferDisclaimerChecked(e.target.checked)}
                  className="mt-0.5 rounded border-amber-500/50 bg-neutral-950 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-[11px] text-amber-200 leading-snug">
                  I confirm that I am authorized as Super Administrator to execute this legal ownership transfer for <strong>{transferTenant.name}</strong>. Firestore database records and system notifications will be updated immediately.
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTransfer}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg flex items-center gap-2"
                >
                  {isSubmittingTransfer ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Transferring...</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      <span>Authorize & Transfer Ownership</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Provision Website / URL Modal */}
      <ProvisionWebsiteModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        existingTenants={tenants}
        onProvision={async (tenantData) => {
          const newId = tenantData.slug ? `tenant-${tenantData.slug}` : `tenant-${Date.now()}`;
          const webUrl = tenantData.websiteUrl || (tenantData.slug ? buildWebsiteUrl(tenantData.slug) : undefined);
          const adminUrl = tenantData.adminLoginUrl || (tenantData.slug ? buildAdminLoginUrl(tenantData.slug) : undefined);
          const config = getPlatformConfig();
          const platformHost = (() => {
            try { return new URL(config.platformBaseUrl).hostname; } catch { return 'platform.app'; }
          })();

          const newTenant: Tenant = {
            id: newId,
            slug: tenantData.slug,
            name: tenantData.name || 'Untitled Website',
            domain: tenantData.domain || `${tenantData.slug || newId}.${platformHost}`,
            websiteUrl: webUrl,
            adminLoginUrl: adminUrl,
            ownerEmail: tenantData.ownerEmail || 'owner@example.com',
            adminGoogleEmail: tenantData.adminGoogleEmail || tenantData.ownerEmail || 'owner@example.com',
            ownerName: tenantData.name ? `${tenantData.name} Owner` : 'Store Owner',
            ownerId: `owner-${Date.now()}`,
            status: tenantData.status || 'active',
            plan: tenantData.plan || 'free',
            createdAt: new Date().toISOString(),
            databaseSize: 0,
          };

          try {
            await onUpdateTenant(newTenant);
            const generatedUrl = buildWebsiteUrl(newTenant.slug || newTenant.id);
            showToast('success', `Website URL created for "${newTenant.name}" (${generatedUrl})`);
            setIsProvisionModalOpen(false);
          } catch (err) {
            showToast('error', 'Failed to provision website');
          }
        }}
      />

    </div>
  );
};
