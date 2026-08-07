export const DEFAULT_TENANT_ID = 'mfp_store_001';

/**
 * Returns the currently active websiteId (tenantId) from localStorage or default
 */
export function getCurrentTenantId(): string {
  try {
    const saved = localStorage.getItem('mfp_website_config_live');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.websiteId) return parsed.websiteId;
      if (parsed?.tenantId) return parsed.tenantId;
    }
  } catch {
    // Fallback to default tenant
  }
  return DEFAULT_TENANT_ID;
}

/**
 * Automatically scopes a document payload with websiteId & tenantId
 */
export function scopeDoc<T extends Record<string, any>>(
  data: T,
  websiteId?: string
): T & { websiteId: string; tenantId: string } {
  const activeTenantId = websiteId || getCurrentTenantId();
  return {
    ...data,
    websiteId: activeTenantId,
    tenantId: activeTenantId,
  };
}

/**
 * Checks if a given document belongs to the active tenant
 */
export function isDocAllowedForTenant(
  docWebsiteId?: string | null,
  targetWebsiteId?: string | null,
  isSuperAdmin?: boolean
): boolean {
  if (isSuperAdmin) return true;
  const currentId = targetWebsiteId || getCurrentTenantId();
  if (!docWebsiteId) return true; // Legacy fallback documents
  return docWebsiteId === currentId;
}

/**
 * Filters an array of tenant documents to ensure strict isolation
 */
export function filterDocsByTenant<T extends { websiteId?: string; tenantId?: string }>(
  docs: T[],
  targetWebsiteId?: string | null,
  isSuperAdmin?: boolean
): T[] {
  if (isSuperAdmin) return docs;
  const activeId = targetWebsiteId || getCurrentTenantId();
  return docs.filter((doc) => {
    const docId = doc.websiteId || doc.tenantId;
    if (!docId) return true; // Include un-scoped legacy documents on current website
    return docId === activeId;
  });
}

/**
 * Verifies if a user role and website assignment allows accessing a target website/tenant
 */
export function validateTenantAccess(
  userRole?: string | null,
  userWebsiteId?: string | null,
  targetWebsiteId?: string | null,
  userEmail?: string | null
): boolean {
  const normalizedEmail = (userEmail || '').toLowerCase();
  const isSuper =
    userRole === 'super_admin' ||
    normalizedEmail === 'vpcreation2002@gmail.com' ||
    normalizedEmail === 'vishalpparihar2002@gmail.com';

  if (isSuper) return true;

  const target = targetWebsiteId || getCurrentTenantId();
  const userTenant = userWebsiteId || DEFAULT_TENANT_ID;

  return userTenant === target;
}

/**
 * Dynamically constructs the Website Public URL based on tenant config & current runtime host
 */
export function getWebsiteUrl(tenant: { id: string; domain?: string; customDomain?: string; websiteUrl?: string }): string {
  if (tenant.websiteUrl) return tenant.websiteUrl;
  if (tenant.customDomain) return `https://${tenant.customDomain}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://marudharfashionpoint.com';
  return `${origin}?websiteId=${tenant.id}`;
}

/**
 * Dynamically constructs the Website Admin Login URL based on tenant config & current runtime host
 */
export function getAdminLoginUrl(tenant: { id: string; domain?: string; customDomain?: string; adminLoginUrl?: string }): string {
  if (tenant.adminLoginUrl) return tenant.adminLoginUrl;
  if (tenant.customDomain) return `https://${tenant.customDomain}/admin`;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://marudharfashionpoint.com';
  return `${origin}?admin=true&websiteId=${tenant.id}`;
}
