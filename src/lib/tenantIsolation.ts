import { buildWebsiteUrl, buildAdminLoginUrl } from './platformConfig';

export const DEFAULT_TENANT_ID = 'nwd_store_001';

/**
 * Clean & Sanitize Website Slug: Lowercase, letters, numbers, and single hyphens only
 */
export function sanitizeSlug(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates website slug rules:
 * - Lowercase letters, numbers, hyphens only
 * - Length between 3 and 50 chars
 * - Not a reserved system path
 */
export function isValidSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) return { valid: false, error: 'Website slug is required' };
  const clean = sanitizeSlug(slug);
  if (clean.length < 3) return { valid: false, error: 'Slug must be at least 3 characters long' };
  if (clean.length > 50) return { valid: false, error: 'Slug cannot exceed 50 characters' };
  const regex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!regex.test(clean)) {
    return { valid: false, error: 'Slug must contain only lowercase letters, numbers, and hyphens' };
  }
  const reservedPaths = ['admin', 'api', 'assets', 'static', 'login', 'dashboard', 'auth', 'settings', 'store-locator', 'product'];
  if (reservedPaths.includes(clean)) {
    return { valid: false, error: `"${clean}" is a reserved system path name` };
  }
  return { valid: true };
}

/**
 * Checks platform-wide uniqueness of a website slug
 */
export function isSlugAvailable(
  slug: string,
  existingTenants: { id: string; slug?: string }[],
  currentTenantId?: string
): boolean {
  const clean = sanitizeSlug(slug);
  if (!clean) return false;
  const validation = isValidSlug(clean);
  if (!validation.valid) return false;

  return !existingTenants.some(
    (t) => t.id !== currentTenantId && (t.slug === clean || t.id === clean)
  );
}

/**
 * Dynamically resolves current websiteId from URL path or search query param
 * E.g. https://nwdstore.in/abc-shoes -> resolves to tenant with slug "abc-shoes"
 */
export function resolveCurrentWebsiteFromUrl(tenants?: { id: string; slug?: string }[]): string {
  if (typeof window === 'undefined') return getCurrentTenantId();

  try {
    const params = new URLSearchParams(window.location.search);
    const queryWebsiteId = params.get('websiteId') || params.get('slug') || params.get('tenantId');
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const rawPathSlug = pathSegments.length > 0 ? pathSegments[0].toLowerCase() : null;
    const reserved = ['admin', 'api', 'assets', 'static', 'login', 'dashboard', 'auth', 'settings', 'store-locator', 'product'];
    const pathSlug = rawPathSlug && !reserved.includes(rawPathSlug) ? rawPathSlug : null;

    const targetIdentifier = queryWebsiteId || pathSlug;

    if (targetIdentifier && tenants && tenants.length > 0) {
      const matched = tenants.find(
        (t) => t.slug === targetIdentifier || t.id === targetIdentifier
      );
      if (matched) {
        localStorage.setItem(
          'nwd_website_config_live',
          JSON.stringify({ websiteId: matched.id, slug: matched.slug })
        );
        return matched.id;
      }
    }

    if (targetIdentifier) {
      localStorage.setItem(
        'nwd_website_config_live',
        JSON.stringify({ websiteId: targetIdentifier, slug: targetIdentifier })
      );
      return targetIdentifier;
    }
  } catch {
    // Fallback on error
  }

  return getCurrentTenantId();
}

/**
 * Returns the currently active websiteId (tenantId) from localStorage or default
 */
export function getCurrentTenantId(): string {
  try {
    const saved = localStorage.getItem('nwd_website_config_live');
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
 * Returns the currently active website slug from localStorage if available
 */
export function getCurrentTenantSlug(): string | null {
  try {
    const saved = localStorage.getItem('nwd_website_config_live');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.slug) return parsed.slug;
    }
  } catch {
    // Fallback
  }
  return null;
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
 * Dynamically constructs the Website Public URL based on tenant config & platform base URL
 * Format: platformBaseUrl + "/" + websiteSlug
 */
export function getWebsiteUrl(tenant: { id: string; slug?: string; domain?: string; customDomain?: string; websiteUrl?: string }): string {
  if (tenant.customDomain) return `https://${tenant.customDomain}`;
  const slug = tenant.slug || tenant.id;
  return buildWebsiteUrl(slug);
}

/**
 * Dynamically constructs the Website Admin Login URL based on tenant config & platform base URL
 */
export function getAdminLoginUrl(tenant: { id: string; slug?: string; domain?: string; customDomain?: string; adminLoginUrl?: string }): string {
  if (tenant.customDomain) return `https://${tenant.customDomain}?admin=true`;
  const slug = tenant.slug || tenant.id;
  return buildAdminLoginUrl(slug);
}
