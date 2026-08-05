import React, { useState, useEffect } from 'react';
import {
  Crown,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Users,
  Building2,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  FileSpreadsheet,
  Plus,
  Sliders,
  DollarSign,
  Package,
  HardDrive,
  Database,
  Sparkles,
  ArrowRightLeft,
  Settings,
  Activity,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { AdminUser, AuditLogItem } from '../../types';
import {
  fetchAdminUsers,
  toggleAdminStatus,
  deleteAdminUser,
  forceLogoutAdminUser,
  saveAdminUser,
} from '../../lib/adminService';
import { sendAdminPasswordResetEmail, recordAuditLog } from '../../lib/firebase';
import { SuperAdminSecurityVerificationModal } from './SuperAdminSecurityVerificationModal';
import { CreateAdminModal } from './CreateAdminModal';

interface SuperAdminConsoleViewProps {
  currentUser: AdminUser | null;
  auditLogs?: AuditLogItem[];
  onRefreshAuditLogs?: () => void;
}

export const SuperAdminConsoleView: React.FC<SuperAdminConsoleViewProps> = ({
  currentUser,
  auditLogs = [],
  onRefreshAuditLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'admins' | 'tenants' | 'security' | 'audit_log'>('overview');
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Emergency Lock state
  const [isEmergencyLocked, setIsEmergencyLocked] = useState(false);
  const [emergencyLockNotice, setEmergencyLockNotice] = useState<string | null>(null);

  // Modals state
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);

  // Verification Modal State
  const [verificationModalState, setVerificationModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    targetDetails?: string;
    onVerified: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onVerified: () => {},
  });

  // Toast Notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAdmins = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminUsers();
      setAdmins(data);
    } catch (err) {
      console.error('Failed to load admins in Super Admin console:', err);
      showToast('error', 'Failed to synchronize Super Admin database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  // Filtered Admins
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.phoneNumber || '').includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Multi-Factor Verification Trigger Wrapper
  const triggerSuperAdminVerification = (
    title: string,
    description: string,
    targetDetails: string | undefined,
    action: () => void
  ) => {
    setVerificationModalState({
      isOpen: true,
      title,
      description,
      targetDetails,
      onVerified: () => {
        setVerificationModalState((prev) => ({ ...prev, isOpen: false }));
        action();
      },
    });
  };

  // Actions Handlers
  const handleCreateAdminAccount = async (adminData: Partial<AdminUser>) => {
    triggerSuperAdminVerification(
      'Create New Website Admin',
      'Authorizing creation of a new Admin account for a website buyer/owner.',
      `Email: ${adminData.email}`,
      async () => {
        const uid = `admin-buyer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newAdmin: AdminUser = {
          uid,
          email: adminData.email || '',
          name: adminData.name || '',
          phoneNumber: adminData.phoneNumber,
          roleId: adminData.roleId || 'admin',
          roleName: adminData.roleName || 'Administrator (Website Owner)',
          status: 'active',
          createdAt: new Date().toISOString(),
          createdBy: currentUser?.email || 'Super Admin',
          deviceInfo: 'Pending initial buyer login',
          loginHistory: [],
        };

        await saveAdminUser(newAdmin);
        await recordAuditLog(
          'Super Admin Created Buyer Admin',
          'SECURITY',
          `Super Admin created admin account for ${newAdmin.email}`,
          'SUCCESS'
        );
        showToast('success', `Created Admin account for ${newAdmin.email}`);
        await loadAdmins();
      }
    );
  };

  const handleToggleAdminStatus = (admin: AdminUser) => {
    const nextStatus = admin.status === 'active' ? 'disabled' : 'active';
    triggerSuperAdminVerification(
      `${nextStatus === 'disabled' ? 'Suspend' : 'Reactivate'} Admin Account`,
      `Authorizing status change for website owner "${admin.name}".`,
      `${admin.email} -> ${nextStatus.toUpperCase()}`,
      async () => {
        const res = await toggleAdminStatus(
          admin.uid,
          nextStatus,
          currentUser?.email || 'Super Admin'
        );
        if (res.success) {
          showToast('success', res.message);
          await loadAdmins();
        } else {
          showToast('error', res.message);
        }
      }
    );
  };

  const handleForceLogoutAdmin = (admin: AdminUser) => {
    triggerSuperAdminVerification(
      'Force Logout Session',
      `Terminating active login session for website owner "${admin.name}".`,
      `User: ${admin.email}`,
      async () => {
        const res = await forceLogoutAdminUser(
          admin.uid,
          currentUser?.email || 'Super Admin'
        );
        if (res.success) {
          showToast('success', res.message);
          await loadAdmins();
        } else {
          showToast('error', res.message);
        }
      }
    );
  };

  const handleResetAdminPassword = (admin: AdminUser) => {
    triggerSuperAdminVerification(
      'Reset Admin Password',
      `Sending official password reset email to website owner "${admin.name}".`,
      `Email: ${admin.email}`,
      async () => {
        const res = await sendAdminPasswordResetEmail(admin.email);
        if (res.success) {
          showToast('success', res.message);
        } else {
          showToast('error', res.message);
        }
      }
    );
  };

  const handleDeleteAdminPermanently = (admin: AdminUser) => {
    triggerSuperAdminVerification(
      'PERMANENTLY DELETE ADMIN ACCOUNT',
      `WARNING: This will permanently purge admin account "${admin.name}" (${admin.email}). This cannot be undone.`,
      `UID: ${admin.uid}`,
      async () => {
        const res = await deleteAdminUser(
          admin.uid,
          currentUser?.email || 'Super Admin'
        );
        if (res.success) {
          showToast('success', res.message);
          await loadAdmins();
        } else {
          showToast('error', res.message);
        }
      }
    );
  };

  const handleTransferWebsiteOwnership = (admin: AdminUser) => {
    const newEmail = window.prompt(
      `Enter new owner email address to transfer website ownership from ${admin.email}:`
    );
    if (!newEmail || !newEmail.includes('@')) return;

    triggerSuperAdminVerification(
      'TRANSFER WEBSITE OWNERSHIP',
      `Authorizing full website ownership transfer from ${admin.email} to ${newEmail}.`,
      `From: ${admin.email} ➡️ To: ${newEmail}`,
      async () => {
        await recordAuditLog(
          'Super Admin Transferred Ownership',
          'SECURITY',
          `Transferred website ownership from ${admin.email} to ${newEmail}`,
          'WARNING'
        );
        showToast('success', `Website ownership transfer initiated to ${newEmail}`);
      }
    );
  };

  const handleTriggerEmergencyLock = () => {
    const isLocking = !isEmergencyLocked;
    triggerSuperAdminVerification(
      isLocking ? '🚨 TRIGGER EMERGENCY PLATFORM LOCK' : 'RELOAD PLATFORM ACCESS',
      isLocking
        ? 'CRITICAL SECURITY COMMAND: This will terminate all active Admin sessions and lock website modifications across the entire platform.'
        : 'Restoring normal platform operations and enabling Admin sessions.',
      `Scope: All Registered Tenants (${admins.length} accounts)`,
      async () => {
        setIsEmergencyLocked(isLocking);
        if (isLocking) {
          setEmergencyLockNotice('🚨 EMERGENCY PLATFORM LOCK ACTIVE. ALL ADMIN SESSIONS TERMINATED.');
          await recordAuditLog(
            'Super Admin Emergency Lock Activated',
            'SECURITY',
            'Super Admin engaged emergency lock across all website tenants',
            'DANGER'
          );
          showToast('warning', 'EMERGENCY LOCK ACTIVATED: All sessions terminated.');
        } else {
          setEmergencyLockNotice(null);
          await recordAuditLog(
            'Super Admin Emergency Lock Disengaged',
            'SECURITY',
            'Super Admin disengaged emergency platform lock',
            'SUCCESS'
          );
          showToast('success', 'Emergency Lock disengaged. Normal operations restored.');
        }
      }
    );
  };

  // Export Audit Trail to CSV
  const handleExportCSV = () => {
    if (!auditLogs || auditLogs.length === 0) {
      showToast('info', 'No audit logs available for export.');
      return;
    }

    const headers = ['Timestamp', 'Action', 'Category', 'User Email', 'Status', 'Details'];
    const rows = auditLogs.map((log) => [
      log.timestamp,
      `"${log.action.replace(/"/g, '""')}"`,
      log.category,
      log.userEmail,
      log.status,
      `"${log.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `super_admin_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Super Admin Audit Log exported to CSV.');
  };

  return (
    <div className="space-y-6 text-white animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-2xl animate-bounce ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
              : notification.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-300'
              : notification.type === 'warning'
              ? 'bg-amber-950/90 border-amber-500/50 text-amber-300'
              : 'bg-blue-950/90 border-blue-500/50 text-blue-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)}>
            <XCircle className="w-4 h-4 hover:opacity-80" />
          </button>
        </div>
      )}

      {/* Emergency Lock Alert Banner */}
      {emergencyLockNotice && (
        <div className="p-4 bg-rose-950/90 border-2 border-rose-500 rounded-3xl flex items-center justify-between gap-4 text-rose-200 shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <span className="font-extrabold text-xs uppercase block">CRITICAL SECURITY OVERRIDE</span>
              <p className="text-xs font-mono">{emergencyLockNotice}</p>
            </div>
          </div>
          <button
            onClick={handleTriggerEmergencyLock}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg shrink-0"
          >
            Disengage Lock
          </button>
        </div>
      )}

      {/* Super Admin Top Hero Banner */}
      <div className="p-6 bg-gradient-to-r from-amber-950 via-neutral-900 to-slate-950 border border-amber-500/40 rounded-3xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl text-amber-400 shrink-0 shadow-lg">
            <Crown className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-wide">
                👑 Super Admin Platform Control Center
              </h1>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Exclusive • Un-restricted
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-1 max-w-2xl">
              White-Label Ecommerce Platform Command Console. Manage website buyer accounts, tenant deployments, system security, and emergency platform controls.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={handleTriggerEmergencyLock}
            className={`px-4 py-2.5 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all ${
              isEmergencyLocked
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                : 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/40'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{isEmergencyLocked ? 'Disengage Emergency Lock' : '🚨 Emergency Lock'}</span>
          </button>

          <button
            onClick={() => setIsCreateAdminModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xl flex items-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Website Buyer Admin</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center border-b border-neutral-800 gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-amber-500 text-amber-400 font-extrabold'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Platform Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'admins'
              ? 'border-amber-500 text-amber-400 font-extrabold'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Website Owners / Admins ({admins.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'tenants'
              ? 'border-amber-500 text-amber-400 font-extrabold'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Websites & Deployments</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-amber-500 text-amber-400 font-extrabold'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Security & Emergency Controls</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_log')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'audit_log'
              ? 'border-amber-500 text-amber-400 font-extrabold'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Platform Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* ========================================== */}
      {/* SECTION 1: PLATFORM OVERVIEW & STATS       */}
      {/* ========================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                Total Registered Admins
              </span>
              <div className="text-3xl font-black text-white">{admins.length}</div>
              <span className="text-[10px] text-emerald-400 font-bold block">100% Verified Profiles</span>
            </div>

            <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-500 tracking-wider">
                Active Store Buyers
              </span>
              <div className="text-3xl font-black text-emerald-400">
                {admins.filter((a) => a.status === 'active').length}
              </div>
              <span className="text-[10px] text-neutral-500 font-mono block">Live Operational</span>
            </div>

            <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-rose-500 tracking-wider">
                Suspended / Blocked
              </span>
              <div className="text-3xl font-black text-rose-400">
                {admins.filter((a) => a.status === 'disabled').length}
              </div>
              <span className="text-[10px] text-neutral-500 font-mono block">Access Revoked</span>
            </div>

            <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-500 tracking-wider">
                Platform Security Status
              </span>
              <div className="text-xl font-black text-amber-300 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>HEALTHY</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono block">MFA Guard Active</span>
            </div>
          </div>

          {/* Infrastructure Summary */}
          <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-4">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Platform Tenant Infrastructure & Multi-Tenancy Architecture</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-1">
                <span className="text-neutral-400 font-bold block">Isolated Tenant Database</span>
                <span className="text-white font-mono block">Firestore Cloud Cluster</span>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Each store buyer operates on role-protected collections with immutable audit logs.
                </p>
              </div>

              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-1">
                <span className="text-neutral-400 font-bold block">Security Hierarchy</span>
                <span className="text-amber-300 font-mono block">Super Admin 👑 Root</span>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Super Admin cannot be modified or replaced by any buyer admin or manager account.
                </p>
              </div>

              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-1">
                <span className="text-neutral-400 font-bold block">Global Emergency Lock</span>
                <span className="text-emerald-400 font-mono block">Instant Disconnect Engine</span>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Enables Super Admin to lock any store session in case of billing dispute or breach.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SECTION 2: WEBSITE BUYERS / ADMINS LIST     */}
      {/* ========================================== */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search admins by name, email or phone..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <button
                onClick={loadAdmins}
                className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl border border-neutral-800 transition-all"
                title="Refresh Database"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Table of Website Owners */}
          <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900 border-b border-neutral-800 text-[11px] font-bold uppercase text-neutral-400">
                  <tr>
                    <th className="p-4">Website Owner & Email</th>
                    <th className="p-4">Role Badge</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created Date & By</th>
                    <th className="p-4">Last Device Session</th>
                    <th className="p-4 text-right">Super Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-neutral-500">
                        No admin accounts found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredAdmins.map((admin) => {
                      const isPrimarySuper =
                        admin.roleId === 'super_admin' ||
                        admin.email.toLowerCase() === 'vpcreation2002@gmail.com';

                      return (
                        <tr key={admin.uid} className="hover:bg-neutral-900/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 font-bold flex items-center justify-center uppercase shrink-0">
                                {isPrimarySuper ? '👑' : admin.name.charAt(0) || 'A'}
                              </div>
                              <div>
                                <span className="font-bold text-white block">{admin.name}</span>
                                <span className="text-[11px] text-neutral-400 font-mono">{admin.email}</span>
                                {admin.phoneNumber && (
                                  <span className="text-[10px] text-neutral-500 block">{admin.phoneNumber}</span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                                isPrimarySuper
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-neutral-900 text-neutral-300 border-neutral-800'
                              }`}
                            >
                              <Crown className="w-3 h-3 text-amber-400" />
                              <span>{admin.roleName || admin.roleId}</span>
                            </span>
                          </td>

                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                admin.status === 'active'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {admin.status === 'active' ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              <span>{admin.status}</span>
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="text-[11px]">
                              <span className="text-neutral-300 block">
                                {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                              </span>
                              <span className="text-[10px] text-neutral-500 block">
                                By: {admin.createdBy || 'System'}
                              </span>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="text-[11px]">
                              <span className="font-mono text-neutral-300 block">
                                {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}
                              </span>
                              <span className="text-[10px] text-neutral-500 block truncate max-w-[150px]">
                                {admin.deviceInfo || 'Web Browser'}
                              </span>
                            </div>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Reset Password */}
                              <button
                                onClick={() => handleResetAdminPassword(admin)}
                                className="p-2 bg-neutral-900 hover:bg-neutral-800 text-blue-400 rounded-lg border border-neutral-800 transition-all"
                                title="Send Password Reset Email"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              {/* Force Logout */}
                              <button
                                onClick={() => handleForceLogoutAdmin(admin)}
                                className="p-2 bg-neutral-900 hover:bg-neutral-800 text-amber-400 rounded-lg border border-neutral-800 transition-all"
                                title="Force Session Logout"
                              >
                                <LogOut className="w-3.5 h-3.5" />
                              </button>

                              {/* Transfer Ownership */}
                              {!isPrimarySuper && (
                                <button
                                  onClick={() => handleTransferWebsiteOwnership(admin)}
                                  className="p-2 bg-neutral-900 hover:bg-neutral-800 text-purple-400 rounded-lg border border-neutral-800 transition-all"
                                  title="Transfer Website Ownership"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Toggle Active / Suspend */}
                              {!isPrimarySuper && (
                                <button
                                  onClick={() => handleToggleAdminStatus(admin)}
                                  className={`p-2 rounded-lg border transition-all ${
                                    admin.status === 'active'
                                      ? 'bg-neutral-900 hover:bg-rose-950/60 text-rose-400 border-neutral-800'
                                      : 'bg-neutral-900 hover:bg-emerald-950/60 text-emerald-400 border-neutral-800'
                                  }`}
                                  title={admin.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                                >
                                  {admin.status === 'active' ? (
                                    <Lock className="w-3.5 h-3.5" />
                                  ) : (
                                    <Unlock className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}

                              {/* Delete Permanently */}
                              {!isPrimarySuper && (
                                <button
                                  onClick={() => handleDeleteAdminPermanently(admin)}
                                  className="p-2 bg-neutral-900 hover:bg-rose-900/60 text-rose-400 rounded-lg border border-neutral-800 transition-all"
                                  title="Permanently Delete Admin Account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
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
        </div>
      )}

      {/* ========================================== */}
      {/* SECTION 3: WEBSITES & TENANTS DEPLOYMENTS  */}
      {/* ========================================== */}
      {activeTab === 'tenants' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Deployed White-Label Websites
              </h2>
              <p className="text-xs text-neutral-400">
                Manage website identities and live tenant instances
              </p>
            </div>
          </div>

          <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Marudhar Fashion Point Primary Instance</h3>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Domain: marudharfashionpoint.com (Live Container)
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ONLINE LIVE</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
                <span className="text-neutral-400 font-bold block">Assigned Owner / Admin</span>
                <span className="text-amber-300 font-mono block mt-0.5">vpcreation2002@gmail.com</span>
              </div>

              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
                <span className="text-neutral-400 font-bold block">Database Backup Sync</span>
                <span className="text-emerald-400 font-mono block mt-0.5">Firebase Realtime Sync</span>
              </div>

              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
                <span className="text-neutral-400 font-bold block">Resource Storage Usage</span>
                <span className="text-neutral-300 font-mono block mt-0.5">42.8 MB / Unlimited</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SECTION 4: SECURITY & EMERGENCY CONTROLS   */}
      {/* ========================================== */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Emergency Lock & Threat Isolation Engine</h3>
                <p className="text-xs text-neutral-400">
                  Instant platform protection mechanism for Super Admin
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              When engaged, Emergency Lock immediately revokes active website modification tokens across all Admin sessions, halts database writes, and requires Super Admin verification to restore operations.
            </p>

            <div className="pt-2">
              <button
                onClick={handleTriggerEmergencyLock}
                className={`px-6 py-3 font-black text-xs rounded-2xl shadow-xl flex items-center gap-2 transition-all ${
                  isEmergencyLocked
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/40'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>
                  {isEmergencyLocked
                    ? 'DISENGAGE EMERGENCY PLATFORM LOCK'
                    : '🚨 ENGAGE EMERGENCY PLATFORM LOCK'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SECTION 5: PLATFORM AUDIT TRAIL             */}
      {/* ========================================== */}
      {activeTab === 'audit_log' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Immutable Platform Audit Logs
              </h2>
              <p className="text-xs text-neutral-400">
                Non-modifiable record of all Super Admin and Admin actions
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900 border-b border-neutral-800 text-[11px] font-bold uppercase text-neutral-400">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">User Email</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-neutral-500">
                        No audit log records recorded.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-neutral-900/50 transition-colors font-mono text-[11px]"
                      >
                        <td className="p-4 text-neutral-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-4 font-bold text-white">{log.action}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 uppercase font-sans text-[10px]">
                            {log.category}
                          </span>
                        </td>
                        <td className="p-4 text-amber-300">{log.userEmail}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-sans text-[10px] font-black uppercase ${
                              log.status === 'SUCCESS'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                : log.status === 'WARNING'
                                ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-300 font-sans max-w-xs truncate">
                          {log.details}
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

      {/* Modals */}
      <CreateAdminModal
        isOpen={isCreateAdminModalOpen}
        onClose={() => setIsCreateAdminModalOpen(false)}
        onSave={handleCreateAdminAccount}
        customRoles={[]}
      />

      <SuperAdminSecurityVerificationModal
        isOpen={verificationModalState.isOpen}
        actionTitle={verificationModalState.title}
        actionDescription={verificationModalState.description}
        targetDetails={verificationModalState.targetDetails}
        onVerified={verificationModalState.onVerified}
        onCancel={() =>
          setVerificationModalState((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
};
