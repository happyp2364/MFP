import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser, AdminRole, AdminModule, AdminAction } from '../types';
import { fetchAdminUsers, fetchAdminRoles } from '../lib/adminService';
import { hasAdminPermission, getEffectivePermissions, BUILTIN_ROLES } from '../lib/adminPermissions';

interface PermissionContextType {
  adminUsers: AdminUser[];
  adminRoles: AdminRole[];
  refreshAdminRBAC: () => Promise<void>;
  checkPermission: (user: AdminUser | null, module: AdminModule, action: AdminAction) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);

  const refreshAdminRBAC = async () => {
    try {
      const [users, roles] = await Promise.all([
        fetchAdminUsers(),
        fetchAdminRoles(),
      ]);
      setAdminUsers(users);
      setAdminRoles(roles);
    } catch (e) {
      console.warn('Failed to fetch RBAC data', e);
    }
  };

  useEffect(() => {
    refreshAdminRBAC();
  }, []);

  const checkPermission = (user: AdminUser | null, module: AdminModule, action: AdminAction): boolean => {
    if (!user) return false;
    const perms = getEffectivePermissions(user, adminRoles);
    return hasAdminPermission(perms, module, action);
  };

  return (
    <PermissionContext.Provider
      value={{
        adminUsers,
        adminRoles,
        refreshAdminRBAC,
        checkPermission,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) throw new Error('usePermission must be used within PermissionProvider');
  return context;
};
