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
  Activity
} from 'lucide-react';
import { Tenant, AdminUser } from '../../types';

interface WebsiteDirectoryManagerProps {
  tenants: Tenant[];
  currentUser: AdminUser | null;
  onUpdateTenant: (tenant: Tenant) => Promise<void>;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  triggerSuperAdminVerification: (title: string, desc: string, details: string, callback: () => void) => void;
}

export const WebsiteDirectoryManager: React.FC<WebsiteDirectoryManagerProps> = ({
  tenants,
  currentUser,
  onUpdateTenant,
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

  // Google Admin Assignment Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningTenant, setAssigningTenant] = useState<Tenant | null>(null);
  const [googleEmailInput, setGoogleEmailInput] = useState('');

  // Security Check: Normal Admin cannot view Website Directory
  const isSuperAdmin = currentUser?.roleId === 'super_admin' || currentUser?.email?.toLowerCase() === 'vpcreation2002@gmail.com';

  if (!isSuperAdmin) {
    return (
      <div className="p-12 text-center bg-neutral-950 border border-neutral-800 rounded-3xl space-y-4">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black text-white">Access Denied: Super Admin Restricted</h2>
        <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
          The Website Directory & Google Admin Assignment console is restricted exclusively to Super Administrator profiles. Normal store administrators cannot view website directories or assign root Google emails.
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

  // Handle Google Admin Assignment submission
  const handleSaveGoogleEmail = async () => {
    if (!assigningTenant) return;
    if (googleEmailInput && !googleemailValid(googleEmailInput)) {
      showToast('error', 'Please enter a valid Google email address.');
      return;
    }

    const updatedTenant: Tenant = {
      ...assigningTenant,
      adminGoogleEmail: googleEmailInput.trim() || undefined,
      adminLoginStatus: googleEmailInput.trim() ? 'pending_activation' : undefined,
    };

    triggerSuperAdminVerification(
      'Assign Google Admin Email',
      `Assigning Google Workspace email to website "${assigningTenant.name}"`,
      `Email: ${googleEmailInput || 'None (Removed)'}`,
      async () => {
        try {
          await onUpdateTenant(updatedTenant);
          showToast('success', `Google admin email successfully updated for ${assigningTenant.name}`);
          setIsAssignModalOpen(false);
          setAssigningTenant(null);
        } catch (err) {
          showToast('error', 'Failed to update Google admin assignment');
        }
      }
    );
  };

  const googleemailValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <span>Website Directory & Google Admin Assignment</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Enterprise multi-tenant website governance, status controls, and Google Workspace admin binding.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search business, ID, email, owner..."
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
        </div>
      </div>

      {/* Website Directory Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Website Logo</th>
                <th className="p-4">Business Name</th>
                <th className="p-4">Website ID</th>
                <th className="p-4">Category</th>
                <th className="p-4">Owner Name</th>
                <th className="p-4">Admin Google Email</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4">Last Login</th>
                <th className="p-4">Version</th>
                <th className="p-4">Health</th>
                <th className="p-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {paginatedTenants.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-12 text-center text-neutral-500 font-bold">
                    No websites match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-neutral-900/40 transition-colors">
                    {/* Website Logo */}
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                        {tenant.logoUrl ? (
                          <img src={tenant.logoUrl} alt={tenant.name} className="w-full h-full object-cover" />
                        ) : (
                          <Globe className="w-5 h-5 text-amber-400" />
                        )}
                      </div>
                    </td>

                    {/* Business Name */}
                    <td className="p-4">
                      <span className="font-bold text-white block max-w-[180px] truncate" title={tenant.name}>
                        {tenant.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono block truncate" title={tenant.domain}>
                        {tenant.domain}
                      </span>
                    </td>

                    {/* Website ID */}
                    <td className="p-4 font-mono text-[11px] text-neutral-300">
                      {tenant.id}
                    </td>

                    {/* Business Category */}
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-neutral-300 text-[10px] font-semibold">
                        {tenant.businessCategory || 'E-Commerce / Retail'}
                      </span>
                    </td>

                    {/* Owner Name */}
                    <td className="p-4 font-bold text-neutral-200">
                      {tenant.ownerName || 'Primary Admin'}
                    </td>

                    {/* Admin Google Email */}
                    <td className="p-4">
                      {tenant.adminGoogleEmail ? (
                        <div className="space-y-0.5">
                          <span className="font-mono text-[11px] text-amber-300 block truncate max-w-[170px]" title={tenant.adminGoogleEmail}>
                            {tenant.adminGoogleEmail}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            tenant.adminLoginStatus === 'active'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                          }`}>
                            {tenant.adminLoginStatus === 'active' ? 'Active' : 'Pending Activation'}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAssigningTenant(tenant);
                            setGoogleEmailInput('');
                            setIsAssignModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" /> Assign Email
                        </button>
                      )}
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

                    {/* Last Login */}
                    <td className="p-4 text-neutral-400 font-mono text-[11px]">
                      {tenant.lastLogin ? new Date(tenant.lastLogin).toLocaleDateString() : 'Never'}
                    </td>

                    {/* Version */}
                    <td className="p-4 font-mono text-neutral-300 text-[11px]">
                      {tenant.version || 'v2.4.0'}
                    </td>

                    {/* Health Status */}
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        {tenant.healthStatus || 'Operational'}
                      </span>
                    </td>

                    {/* Quick Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => window.open(`https://${tenant.domain}`, '_blank')}
                          title="Open Website"
                          className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-lg transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setIsDrawerOpen(true);
                          }}
                          title="View Details"
                          className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-blue-400 border border-neutral-800 rounded-lg transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setAssigningTenant(tenant);
                            setGoogleEmailInput(tenant.adminGoogleEmail || '');
                            setIsAssignModalOpen(true);
                          }}
                          title="Assign Admin Google Email"
                          className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-800 rounded-lg transition-all"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const nextStatus = tenant.status === 'active' ? 'suspended' : 'active';
                            triggerSuperAdminVerification(
                              `${nextStatus === 'suspended' ? 'Suspend' : 'Restore'} Website`,
                              `Updating status for ${tenant.name}`,
                              `Domain: ${tenant.domain}`,
                              async () => {
                                await onUpdateTenant({ ...tenant, status: nextStatus });
                                showToast('success', `Website status updated to ${nextStatus}`);
                              }
                            );
                          }}
                          title="Suspend / Restore"
                          className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-rose-400 border border-neutral-800 rounded-lg transition-all"
                        >
                          {tenant.status === 'active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => {
                            showToast('info', `Archive/Delete action simulated for ${tenant.name} (Non-destructive UI stub).`);
                          }}
                          title="Archive / Delete"
                          className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-500 border border-neutral-800 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
      {/* SECTION 3: WEBSITE DETAILS DRAWER          */}
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
                  <span className="text-xs text-neutral-400 font-mono">{selectedTenant.domain} (ID: {selectedTenant.id})</span>
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
                <h4 className="font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>Owner & Admin Information</span>
                </h4>
                <div className="space-y-2 text-neutral-300">
                  <div className="flex justify-between p-2 bg-neutral-950 rounded-xl">
                    <span className="text-neutral-500">Owner Name</span>
                    <span className="font-bold text-white">{selectedTenant.ownerName || 'Primary Owner'}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-neutral-950 rounded-xl">
                    <span className="text-neutral-500">Owner Email</span>
                    <span className="font-bold text-amber-300 font-mono">{selectedTenant.ownerEmail}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-neutral-950 rounded-xl">
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

              {/* Enabled Features & Theme */}
              <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
                <h4 className="font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Configuration & Features</span>
                </h4>
                <div className="space-y-2 text-neutral-300">
                  <div className="flex justify-between p-2 bg-neutral-950 rounded-xl">
                    <span className="text-neutral-500">Current Theme</span>
                    <span className="font-bold text-white">{selectedTenant.currentTheme || 'MBH 3D Glass Luxury'}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-neutral-950 rounded-xl">
                    <span className="text-neutral-500">Language</span>
                    <span className="font-bold text-white">{selectedTenant.language || 'English (IN)'}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-neutral-950 rounded-xl">
                    <span className="text-neutral-500">Physical Store Count</span>
                    <span className="font-bold text-white">{selectedTenant.physicalStoreCount || 2} Outlets</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
                <h4 className="font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-400" />
                  <span>Contact Information</span>
                </h4>
                <div className="space-y-2 text-neutral-300">
                  <div className="flex justify-between p-2 bg-neutral-950 rounded-xl">
                    <span className="text-neutral-500">Support Phone</span>
                    <span className="font-mono text-white">{selectedTenant.contactInfo?.phone || '+91 98765 43210'}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-neutral-950 rounded-xl">
                    <span className="text-neutral-500">Support Email</span>
                    <span className="font-mono text-white">{selectedTenant.contactInfo?.email || selectedTenant.ownerEmail}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-neutral-950 rounded-xl">
                    <span className="text-neutral-500">Headquarters</span>
                    <span className="text-white text-right max-w-[240px]">{selectedTenant.contactInfo?.address || 'Marudhar Complex, Jodhpur, Rajasthan'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SECTION 4: GOOGLE ADMIN ASSIGNMENT MODAL   */}
      {/* ========================================== */}
      {isAssignModalOpen && assigningTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Google Admin Assignment</h3>
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
              <p className="text-neutral-300 leading-relaxed">
                Super Admins can assign or change the authorized Google Workspace email for this tenant. Password authentication is disabled; admins must authenticate via Google Single Sign-On (SSO).
              </p>

              <div className="space-y-2">
                <label className="text-neutral-400 font-bold uppercase tracking-wider block">Google Email Address</label>
                <input
                  type="email"
                  placeholder="admin.store@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-2xl text-amber-400/90 space-y-1">
                <span className="font-bold block">Security Rule Notice:</span>
                <p className="text-[11px] text-amber-400/80">
                  If the assigned email has never logged into this website instance, its status will be automatically set to <span className="font-bold underline">Pending Activation</span> until first Google SSO authentication.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGoogleEmail}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg transition-all"
                >
                  Save Google Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
