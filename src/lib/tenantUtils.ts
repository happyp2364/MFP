import { AdminUser } from '../types';

export const SUPER_ADMIN_EMAILS = [
  'vpcreation2002@gmail.com',
  'vishalpparihar2002@gmail.com',
];

export interface TenantInfo {
  id: string;
  name: string;
  domain?: string;
  isActive: boolean;
}

export const KNOWN_TENANTS: TenantInfo[] = [
  {
    id: 'tenant-masrudharfashionpoint',
    name: 'Marudhar Fashion Point (Main Store)',
    domain: 'marudharfashionpoint.com',
    isActive: true,
  },
  {
    id: 'tenant-happy-shoes',
    name: 'Happy Shoes Outlet',
    domain: 'happyshoes.store',
    isActive: true,
  },
  {
    id: 'tenant-urban-sneakers',
    name: 'Urban Sneakers Store',
    domain: 'urbansneakers.in',
    isActive: true,
  },
];

/**
 * Normalizes tenant/website IDs for deterministic matching.
 * Examples:
 *   "masrudharfashionpoint" -> "tenant-masrudharfashionpoint"
 *   "tenant-masrudharfashionpoint" -> "tenant-masrudharfashionpoint"
 *   "  HAPPY-SHOES  " -> "tenant-happy-shoes"
 */
export function normalizeTenantId(tenantId?: string | null): string {
  if (!tenantId) return 'tenant-masrudharfashionpoint';
  const clean = String(tenantId).trim().toLowerCase();
  if (!clean) return 'tenant-masrudharfashionpoint';
  if (clean.startsWith('tenant-')) {
    return clean;
  }
  return `tenant-${clean}`;
}

/**
 * Get current website tenant ID
 */
export function getCurrentTenantId(): string {
  return 'tenant-masrudharfashionpoint';
}

/**
 * Helper to determine if an admin user has Super Admin authority.
 */
export function isSuperAdminUser(user: AdminUser | null | { email?: string; roleId?: string }): boolean {
  if (!user) return false;
  if (user.roleId === 'super_admin') return true;
  const email = (user.email || '').toLowerCase().trim();
  return SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === email);
}

/**
 * Normalizes raw admin document from Firestore or input state
 * to ensure all fields are guaranteed safe and non-undefined.
 */
export function normalizeAdminUser(rawAdmin: any): AdminUser {
  if (!rawAdmin || typeof rawAdmin !== 'object') {
    return {
      uid: `admin_${Date.now()}`,
      id: `admin_${Date.now()}`,
      name: 'Admin User',
      email: '',
      roleId: 'admin',
      role: 'admin',
      roleName: 'Administrator',
      assignedWebsiteId: 'tenant-masrudharfashionpoint',
      websiteId: 'tenant-masrudharfashionpoint',
      status: 'active',
      permissions: [],
      customPermissions: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      deviceInfo: 'Web Browser',
      loginHistory: [],
      phoneNumber: '',
      username: '',
      isLoggedIn: false,
    };
  }

  const rawUid = rawAdmin.uid || rawAdmin.id || `admin_${Date.now()}`;
  const rawId = rawAdmin.id || rawAdmin.uid || rawUid;
  const rawEmail = typeof rawAdmin.email === 'string' ? rawAdmin.email.trim().toLowerCase() : '';
  
  let rawName = typeof rawAdmin.name === 'string' ? rawAdmin.name.trim() : '';
  if (!rawName && typeof rawAdmin.displayName === 'string') {
    rawName = rawAdmin.displayName.trim();
  }
  if (!rawName && rawEmail) {
    rawName = rawEmail.split('@')[0] || 'Admin User';
  }
  if (!rawName) {
    rawName = 'Admin User';
  }

  const rawRoleId = typeof rawAdmin.roleId === 'string' && rawAdmin.roleId.trim()
    ? rawAdmin.roleId.trim()
    : typeof rawAdmin.role === 'string' && rawAdmin.role.trim()
    ? rawAdmin.role.trim()
    : 'admin';

  let rawRoleName = typeof rawAdmin.roleName === 'string' && rawAdmin.roleName.trim()
    ? rawAdmin.roleName.trim()
    : '';

  if (!rawRoleName) {
    if (rawRoleId === 'super_admin') {
      rawRoleName = 'Super Admin';
    } else {
      rawRoleName = rawRoleId
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
    }
  }

  const assignedWebsite = normalizeTenantId(rawAdmin.assignedWebsiteId || rawAdmin.websiteId || 'tenant-masrudharfashionpoint');

  let status: 'active' | 'disabled' | 'pending_activation' = 'active';
  if (rawAdmin.status === 'disabled') {
    status = 'disabled';
  } else if (rawAdmin.status === 'pending_activation') {
    status = 'pending_activation';
  } else {
    status = 'active';
  }

  return {
    uid: String(rawUid),
    id: String(rawId),
    name: rawName,
    email: rawEmail,
    roleId: rawRoleId,
    role: rawRoleId,
    roleName: rawRoleName,
    assignedWebsiteId: assignedWebsite,
    websiteId: assignedWebsite,
    status,
    permissions: Array.isArray(rawAdmin.permissions) ? rawAdmin.permissions : [],
    customPermissions:
      typeof rawAdmin.customPermissions === 'object' && rawAdmin.customPermissions !== null
        ? rawAdmin.customPermissions
        : {},
    createdAt: typeof rawAdmin.createdAt === 'string' && rawAdmin.createdAt ? rawAdmin.createdAt : new Date().toISOString(),
    updatedAt: typeof rawAdmin.updatedAt === 'string' && rawAdmin.updatedAt ? rawAdmin.updatedAt : new Date().toISOString(),
    createdBy: typeof rawAdmin.createdBy === 'string' && rawAdmin.createdBy ? rawAdmin.createdBy : 'system',
    lastLogin: typeof rawAdmin.lastLogin === 'string' && rawAdmin.lastLogin ? rawAdmin.lastLogin : undefined,
    deviceInfo: typeof rawAdmin.deviceInfo === 'string' && rawAdmin.deviceInfo ? rawAdmin.deviceInfo : 'Web Browser',
    loginHistory: Array.isArray(rawAdmin.loginHistory) ? rawAdmin.loginHistory : [],
    phoneNumber: typeof rawAdmin.phoneNumber === 'string' ? rawAdmin.phoneNumber : '',
    username: typeof rawAdmin.username === 'string' ? rawAdmin.username : '',
    isLoggedIn: Boolean(rawAdmin.isLoggedIn),
    forceLoggedOutAt: typeof rawAdmin.forceLoggedOutAt === 'string' ? rawAdmin.forceLoggedOutAt : undefined,
  };
}

/**
 * Validates whether an admin user has authorization to access/manage
 * a specific target tenant.
 */
export function validateTenantAccess(
  adminUser: AdminUser | null,
  targetTenantId: string
): boolean {
  if (!adminUser) return false;
  if (isSuperAdminUser(adminUser)) return true;

  const normalizedUserTenant = normalizeTenantId(
    adminUser.assignedWebsiteId || adminUser.websiteId || 'tenant-masrudharfashionpoint'
  );
  const normalizedTarget = normalizeTenantId(targetTenantId);

  return normalizedUserTenant === normalizedTarget;
}
