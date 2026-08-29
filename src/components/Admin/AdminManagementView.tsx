import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  ShieldAlert,
  Search,
  Filter,
  Edit2,
  Lock,
  Unlock,
  Trash2,
  LogOut,
  History,
  KeyRound,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Sparkles,
  Shield,
  FileSpreadsheet,
  Globe,
  Building2,
} from 'lucide-react';
import {
  AdminUser,
  AdminRole,
  AdminPermissionMatrix,
  AuditLogItem,
} from '../../types';
import {
  BUILTIN_ROLES,
  ADMIN_MODULE_LIST,
} from '../../lib/adminPermissions';
import {
  fetchAdminUsers,
  fetchAdminRoles,
  saveAdminUser,
  toggleAdminStatus,
  deleteAdminUser,
  forceLogoutAdminUser,
  saveCustomRole,
  deleteCustomRole,
  sendAdminPasswordResetEmail,
} from '../../lib/adminService';
import {
  normalizeAdminUser,
  isSuperAdminUser,
  normalizeTenantId,
  KNOWN_TENANTS,
  SUPER_ADMIN_EMAILS,
} from '../../lib/tenantUtils';
import { recordAuditLog } from '../../lib/firebase';
import { CreateAdminModal } from './CreateAdminModal';
import { EditAdminPermissionsModal } from './EditAdminPermissionsModal';
import { CustomRoleModal } from './CustomRoleModal';
import { LoginHistoryModal } from './LoginHistoryModal';

interface AdminManagementViewProps {
  currentUser: AdminUser | null;
  auditLogs?: AuditLogItem[];
  onRefreshAuditLogs?: () => void;
}

export const AdminManagementView: React.FC<AdminManagementViewProps> = ({
  currentUser,
  auditLogs = [],
  onRefreshAuditLogs,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'accounts' | 'roles' | 'activity_log'>('accounts');
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [customRoles, setCustomRoles] = useState<AdminRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tenantFilter, setTenantFilter] = useState('all');

  const isSuperAdmin = isSuperAdminUser(currentUser);
  const currentTenantId = normalizeTenantId(
    currentUser?.assignedWebsiteId || currentUser?.websiteId || 'tenant-masrudharfashionpoint'
  );

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdminForEdit, setSelectedAdminForEdit] = useState<AdminUser | null>(null);

  const [isCustomRoleModalOpen, setIsCustomRoleModalOpen] = useState(false);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<AdminRole | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedAdminForHistory, setSelectedAdminForHistory] = useState<AdminUser | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(
    null
  );

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedUsers, fetchedRoles] = await Promise.all([
        fetchAdminUsers(),
        fetchAdminRoles(),
      ]);
      // Normalize all loaded admins
      const normalizedAdmins = fetchedUsers.map((u) => normalizeAdminUser(u));
      setAdmins(normalizedAdmins);
      setCustomRoles(fetchedRoles);
      if (onRefreshAuditLogs) {
        onRefreshAuditLogs();
      }
    } catch (err) {
      console.error('Failed to load admin management data:', err);
      showToast('error', 'Failed to synchronize admin database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const allRoles = useMemo(() => {
    const roles = [...BUILTIN_ROLES, ...customRoles];
    if (!isSuperAdmin) {
      return roles.filter((r) => r.id !== 'super_admin');
    }
    return roles;
  }, [customRoles, isSuperAdmin]);

  // Scoped & Filtered Admins (Strict Tenant Isolation & Super Admin Hiding)
  const filteredAdmins = useMemo(() => {
    const term = (searchTerm || '').trim().toLowerCase();

    return admins.filter((rawAdmin) => {
      const admin = normalizeAdminUser(rawAdmin);

      // 1. Tenant Admin Isolation: Completely hide Super Admin records from Tenant Admins
      if (!isSuperAdmin) {
        if (
          admin.roleId === 'super_admin' ||
          SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === (admin.email || '').toLowerCase())
        ) {
          return false;
        }

        // Must belong to the same tenant
        const adminTenant = normalizeTenantId(admin.assignedWebsiteId || admin.websiteId);
        if (adminTenant !== currentTenantId) {
          return false;
        }
      }

      // 2. Super Admin Tenant Filter
      if (isSuperAdmin && tenantFilter !== 'all') {
        const normalizedTargetTenant = normalizeTenantId(tenantFilter);
        const adminTenant = normalizeTenantId(admin.assignedWebsiteId || admin.websiteId);
        if (adminTenant !== normalizedTargetTenant) {
          return false;
        }
      }

      // 3. Role Filter
      if (roleFilter !== 'all' && admin.roleId !== roleFilter) {
        return false;
      }

      // 4. Status Filter
      if (statusFilter !== 'all' && admin.status !== statusFilter) {
        return false;
      }

      // 5. Search Term Filter (Defensively guarded against undefined)
      if (term) {
        const nameMatch = (admin.name || '').toLowerCase().includes(term);
        const emailMatch = (admin.email || '').toLowerCase().includes(term);
        const roleMatch = (admin.roleName || admin.roleId || '').toLowerCase().includes(term);
        const tenantMatch = (admin.assignedWebsiteId || admin.websiteId || '').toLowerCase().includes(term);
        const phoneMatch = (admin.phoneNumber || '').toLowerCase().includes(term);

        if (!nameMatch && !emailMatch && !roleMatch && !tenantMatch && !phoneMatch) {
          return false;
        }
      }

      return true;
    });
  }, [admins, isSuperAdmin, currentTenantId, tenantFilter, roleFilter, statusFilter, searchTerm]);

  // Admin Actions Handlers
  const handleCreateAdmin = async (adminData: Partial<AdminUser>) => {
    const currentAdminEmail = currentUser?.email || 'admin@marudharfashionpoint.com';
    const uid = adminData.uid || `admin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const targetTenant = isSuperAdmin
      ? normalizeTenantId(adminData.assignedWebsiteId || adminData.websiteId || 'tenant-masrudharfashionpoint')
      : currentTenantId;

    const newAdmin: AdminUser = normalizeAdminUser({
      ...adminData,
      uid,
      id: uid,
      assignedWebsiteId: targetTenant,
      websiteId: targetTenant,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentAdminEmail,
      status: adminData.status || 'active',
      deviceInfo: 'Pending initial login',
      loginHistory: [],
    });

    await saveAdminUser(newAdmin);
    await recordAuditLog(
      'New Admin Account Created',
      'SECURITY',
      `Created new admin account for ${newAdmin.email || newAdmin.name} with role "${newAdmin.roleName}" on website "${newAdmin.assignedWebsiteId}"`,
      'SUCCESS'
    );
    showToast('success', `Admin account created for ${newAdmin.email || newAdmin.name}`);
    await loadData();
  };

  const handleUpdateAdminPermissions = async (
    uid: string,
    updatedRole: { roleId: string; roleName: string; customPermissions?: Partial<AdminPermissionMatrix> }
  ) => {
    const target = admins.find((a) => a.uid === uid);
    if (!target) return;

    const updated: AdminUser = normalizeAdminUser({
      ...target,
      roleId: updatedRole.roleId,
      role: updatedRole.roleId,
      roleName: updatedRole.roleName,
      customPermissions: updatedRole.customPermissions,
      updatedAt: new Date().toISOString(),
    });

    await saveAdminUser(updated);
    showToast('success', `Permissions updated for ${target.email || target.name}`);
    await loadData();
  };

  const handleToggleStatus = async (rawAdmin: AdminUser) => {
    const admin = normalizeAdminUser(rawAdmin);
    const nextStatus = admin.status === 'active' ? 'disabled' : 'active';
    const currentAdminEmail = currentUser?.email || 'admin';

    const res = await toggleAdminStatus(admin.uid, nextStatus, currentAdminEmail);
    if (res.success) {
      showToast('success', res.message);
      await loadData();
    } else {
      showToast('error', res.message);
    }
  };

  const handleForceLogout = async (rawAdmin: AdminUser) => {
    const admin = normalizeAdminUser(rawAdmin);
    const currentAdminEmail = currentUser?.email || 'admin';
    const res = await forceLogoutAdminUser(admin.uid, currentAdminEmail);
    if (res.success) {
      showToast('success', res.message);
      await loadData();
    } else {
      showToast('error', res.message);
    }
  };

  const handleResetPassword = async (rawAdmin: AdminUser) => {
    const admin = normalizeAdminUser(rawAdmin);
    const res = await sendAdminPasswordResetEmail(admin.email);
    if (res.success) {
      showToast('success', res.message);
    } else {
      showToast('error', res.message);
    }
  };

  const handleDeleteAdmin = async (rawAdmin: AdminUser) => {
    const admin = normalizeAdminUser(rawAdmin);
    if (
      !window.confirm(
        `Are you sure you want to permanently delete admin account "${admin.name}" (${admin.email})?`
      )
    ) {
      return;
    }

    const currentAdminEmail = currentUser?.email || 'admin';
    const res = await deleteAdminUser(admin.uid, currentAdminEmail);
    if (res.success) {
      showToast('success', res.message);
      await loadData();
    } else {
      showToast('error', res.message);
    }
  };

  const handleSaveCustomRole = async (role: AdminRole) => {
    await saveCustomRole(role);
    showToast('success', `Custom role "${role.name}" saved.`);
    await loadData();
  };

  const handleDeleteCustomRole = async (roleId: string) => {
    if (!window.confirm('Delete this custom role preset?')) return;
    const currentAdminEmail = currentUser?.email || 'admin';
    const res = await deleteCustomRole(roleId, currentAdminEmail);
    if (res.success) {
      showToast('success', res.message);
      await loadData();
    } else {
      showToast('error', res.message);
    }
  };

  // Export Audit Logs to CSV
  const handleExportLogsCSV = () => {
    if (!auditLogs || auditLogs.length === 0) {
      showToast('info', 'No activity logs to export.');
      return;
    }

    const headers = ['Timestamp', 'Action', 'Category', 'User Email', 'Status', 'Details', 'IP Address'];
    const rows = auditLogs.map((log) => [
      log.timestamp || '',
      `"${(log.action || '').replace(/"/g, '""')}"`,
      log.category || '',
      log.userEmail || '',
      log.status || '',
      `"${(log.details || '').replace(/"/g, '""')}"`,
      log.ipAddress || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `admin_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Audit log exported to CSV successfully.');
  };

  return (
    <div className="space-y-6 text-white animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-xl animate-bounce ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
              : notification.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-300'
              : 'bg-amber-950/90 border-amber-500/50 text-amber-300'
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

      {/* Top Banner Header */}
      <div className="p-6 bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-neutral-800 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-wide">
                Multi Admin Management & RBAC System
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {isSuperAdmin ? 'Super Admin Mode' : 'Tenant Admin Mode'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {isSuperAdmin
                ? 'Global multi-tenant governance with full role-based access control across all websites'
                : `Managing team administrators and staff for ${KNOWN_TENANTS.find((t) => t.id === currentTenantId)?.name || 'current website'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={loadData}
            className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          {isSuperAdmin && (
            <button
              onClick={() => {
                setSelectedRoleForEdit(null);
                setIsCustomRoleModalOpen(true);
              }}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/20 flex items-center gap-2 transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>New Custom Role</span>
            </button>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Admin</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center border-b border-neutral-800 gap-2">
        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === 'accounts'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Admin Accounts ({filteredAdmins.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('roles')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === 'roles'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Roles & Permission Matrix ({allRoles.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('activity_log')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === 'activity_log'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Activity Log ({auditLogs.length})</span>
        </button>
      </div>

      {/* ========================================== */}
      {/* SUB-TAB 1: ADMIN ACCOUNTS LIST & CONTROLS  */}
      {/* ========================================== */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-6">
          {/* Stat Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Visible Admins</span>
              <div className="text-2xl font-black text-white mt-1">{filteredAdmins.length}</div>
            </div>

            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-emerald-500 tracking-wider">Active Admins</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {filteredAdmins.filter((a) => a.status === 'active').length}
              </div>
            </div>

            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-rose-500 tracking-wider">Disabled Accounts</span>
              <div className="text-2xl font-black text-rose-400 mt-1">
                {filteredAdmins.filter((a) => a.status === 'disabled').length}
              </div>
            </div>

            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-amber-500 tracking-wider">Available Roles</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{allRoles.length}</div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search admins by name, email, website or role..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              {/* Tenant selector for Super Admin */}
              {isSuperAdmin && (
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <select
                    value={tenantFilter}
                    onChange={(e) => setTenantFilter(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Websites / Tenants</option>
                    {KNOWN_TENANTS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Roles</option>
                  {allRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

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
          </div>

          {/* Admins Table */}
          <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900 border-b border-neutral-800 text-[11px] font-bold uppercase text-neutral-400">
                  <tr>
                    <th className="p-4">Admin Name & Email</th>
                    <th className="p-4">Role Badge</th>
                    <th className="p-4">Assigned Website</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Last Login & Device</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-neutral-500">
                        No admin accounts found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAdmins.map((admin) => {
                      const isSuper = isSuperAdminUser(admin);
                      const adminInitial = (admin.name || admin.email || 'A').charAt(0).toUpperCase();
                      const tenantDef = KNOWN_TENANTS.find(
                        (t) => t.id === normalizeTenantId(admin.assignedWebsiteId || admin.websiteId)
                      );

                      return (
                        <tr key={admin.uid} className="hover:bg-neutral-900/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 font-bold flex items-center justify-center uppercase shrink-0">
                                {adminInitial}
                              </div>
                              <div>
                                <span className="font-bold text-white block">{admin.name || 'Admin User'}</span>
                                <span className="text-[11px] text-neutral-400 font-mono">{admin.email || 'No email registered'}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                                isSuper
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-neutral-900 text-neutral-300 border-neutral-800'
                              }`}
                            >
                              <Shield className="w-3 h-3 text-amber-400" />
                              <span>{admin.roleName || admin.roleId}</span>
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                              <div>
                                <span className="font-medium text-neutral-300 block text-[11px]">
                                  {tenantDef?.name || admin.assignedWebsiteId || 'Default Website'}
                                </span>
                                <span className="text-[10px] text-neutral-500 font-mono block">
                                  {normalizeTenantId(admin.assignedWebsiteId || admin.websiteId)}
                                </span>
                              </div>
                            </div>
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
                              <span className="font-mono text-neutral-300 block">
                                {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}
                              </span>
                              <span className="text-[10px] text-neutral-500 block truncate max-w-[180px]">
                                {admin.deviceInfo || 'Web Browser'}
                              </span>
                            </div>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Permissions Button */}
                              <button
                                onClick={() => {
                                  setSelectedAdminForEdit(admin);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-2 bg-neutral-900 hover:bg-neutral-800 text-amber-300 rounded-lg border border-neutral-800 transition-all"
                                title="Edit Role & Permissions Matrix"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                              </button>

                              {/* View Login History */}
                              <button
                                onClick={() => {
                                  setSelectedAdminForHistory(admin);
                                  setIsHistoryModalOpen(true);
                                }}
                                className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-800 transition-all"
                                title="View Session History & Device Info"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>

                              {/* Force Logout */}
                              <button
                                onClick={() => handleForceLogout(admin)}
                                className="p-2 bg-neutral-900 hover:bg-neutral-800 text-amber-400 rounded-lg border border-neutral-800 transition-all"
                                title="Force Logout Session"
                              >
                                <LogOut className="w-3.5 h-3.5" />
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => handleResetPassword(admin)}
                                className="p-2 bg-neutral-900 hover:bg-neutral-800 text-blue-400 rounded-lg border border-neutral-800 transition-all"
                                title="Send Reset Password Email"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Active/Disable */}
                              <button
                                onClick={() => handleToggleStatus(admin)}
                                className={`p-2 rounded-lg border transition-all ${
                                  admin.status === 'active'
                                    ? 'bg-neutral-900 hover:bg-rose-950/60 text-rose-400 border-neutral-800'
                                    : 'bg-neutral-900 hover:bg-emerald-950/60 text-emerald-400 border-neutral-800'
                                }`}
                                title={admin.status === 'active' ? 'Disable Account' : 'Enable Account'}
                              >
                                {admin.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                              </button>

                              {/* Delete Admin */}
                              <button
                                onClick={() => handleDeleteAdmin(admin)}
                                className="p-2 bg-neutral-900 hover:bg-rose-900/50 text-rose-400 rounded-lg border border-neutral-800 transition-all disabled:opacity-30"
                                disabled={isSuper}
                                title={isSuper ? 'Cannot delete Super Admin' : 'Delete Admin Account'}
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
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SUB-TAB 2: ROLES & PERMISSIONS MATRIX      */}
      {/* ========================================== */}
      {activeSubTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Role Definitions & Presets</h2>
              <p className="text-xs text-neutral-400">View built-in roles or create custom system roles</p>
            </div>
            {isSuperAdmin && (
              <button
                onClick={() => {
                  setSelectedRoleForEdit(null);
                  setIsCustomRoleModalOpen(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Custom Role</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allRoles.map((role) => (
              <div
                key={role.id}
                className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white">{role.name}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        role.isSystemPreset
                          ? 'bg-neutral-800 text-neutral-400'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {role.isSystemPreset ? 'System Preset' : 'Custom Role'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">{role.description}</p>
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-neutral-500">
                    Modules Granted:{' '}
                    <strong className="text-amber-300 font-mono">
                      {
                        Object.values(role.permissions || {}).filter(
                          (p) => p && (p.read || p.create || p.edit || p.delete || p.export)
                        ).length
                      }
                    </strong>{' '}
                    / {ADMIN_MODULE_LIST.length}
                  </span>

                  {!role.isSystemPreset && isSuperAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedRoleForEdit(role);
                          setIsCustomRoleModalOpen(true);
                        }}
                        className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-300 rounded-lg transition-all"
                        title="Edit Custom Role"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomRole(role.id)}
                        className="p-1.5 bg-neutral-900 hover:bg-rose-950 text-rose-400 rounded-lg transition-all"
                        title="Delete Custom Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SUB-TAB 3: ADMINISTRATIVE AUDIT LOGS       */}
      {/* ========================================== */}
      {activeSubTab === 'activity_log' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Administrative Audit Logs</h2>
              <p className="text-xs text-neutral-400">Track all operational and security actions across store sessions</p>
            </div>
            <button
              onClick={handleExportLogsCSV}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Log (CSV)</span>
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
                    <th className="p-4">Admin Email</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-neutral-500">
                        No audit log entries recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-900/50 transition-colors font-mono text-[11px]">
                        <td className="p-4 text-neutral-400">{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</td>
                        <td className="p-4 font-bold text-white">{log.action || 'Action'}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 uppercase font-sans text-[10px]">
                            {log.category || 'GENERAL'}
                          </span>
                        </td>
                        <td className="p-4 text-amber-300">{log.userEmail || 'System'}</td>
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
                            {log.status || 'INFO'}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-300 font-sans max-w-xs truncate">{log.details || ''}</td>
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
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateAdmin}
        customRoles={customRoles}
        currentUser={currentUser}
      />

      <EditAdminPermissionsModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAdminForEdit(null);
        }}
        adminUser={selectedAdminForEdit}
        customRoles={customRoles}
        onSave={handleUpdateAdminPermissions}
      />

      <CustomRoleModal
        isOpen={isCustomRoleModalOpen}
        onClose={() => {
          setIsCustomRoleModalOpen(false);
          setSelectedRoleForEdit(null);
        }}
        roleToEdit={selectedRoleForEdit}
        onSaveRole={handleSaveCustomRole}
      />

      <LoginHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedAdminForHistory(null);
        }}
        adminUser={selectedAdminForHistory}
      />
    </div>
  );
};
