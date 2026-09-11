/**
 * Enterprise Product Types Utilities
 * 
 * Provides robust helpers for managing, querying, and normalizing multiple product types
 * with 100% backward compatibility for legacy single-string `productType` and `subcategory`.
 */

export interface ProductTypeCompatible {
  productTypes?: string[];
  productType?: string;
  subcategory?: string;
}

/**
 * Normalizes product types from any product object.
 * Returns a clean array of strings, or empty array if none specified.
 */
export function getProductTypes(product?: ProductTypeCompatible | null): string[] {
  if (!product) return [];

  if (Array.isArray(product.productTypes) && product.productTypes.length > 0) {
    const valid = product.productTypes.map((t) => (typeof t === 'string' ? t.trim() : '')).filter(Boolean);
    if (valid.length > 0) return valid;
  }

  if (typeof product.productType === 'string' && product.productType.trim()) {
    return [product.productType.trim()];
  }

  if (typeof product.subcategory === 'string' && product.subcategory.trim()) {
    return [product.subcategory.trim()];
  }

  return [];
}

/**
 * Returns the primary (first) product type for compact displays,
 * breadcrumbs, or legacy systems expecting a single string.
 */
export function getPrimaryProductType(product?: ProductTypeCompatible | null): string {
  const types = getProductTypes(product);
  return types[0] || '';
}

/**
 * Checks if a product matches a specific product type (case-insensitive).
 */
export function matchesProductType(product: ProductTypeCompatible | null | undefined, targetType: string): boolean {
  if (!product || !targetType) return false;
  const types = getProductTypes(product);
  const normalizedTarget = targetType.trim().toLowerCase();
  return types.some((t) => t.toLowerCase() === normalizedTarget);
}

/**
 * Checks if a product matches any of the given product types.
 */
export function matchesAnyProductType(
  product: ProductTypeCompatible | null | undefined,
  targetTypes: string[]
): boolean {
  if (!product || !targetTypes || targetTypes.length === 0) return true;
  const types = getProductTypes(product);
  const targetLowerSet = new Set(targetTypes.map((t) => t.trim().toLowerCase()));
  return types.some((t) => targetLowerSet.has(t.toLowerCase()));
}

/**
 * Checks if search query matches any product type.
 */
export function matchesQueryProductTypes(
  product: ProductTypeCompatible | null | undefined,
  searchQuery: string
): boolean {
  if (!product || !searchQuery.trim()) return false;
  const q = searchQuery.trim().toLowerCase();
  const types = getProductTypes(product);
  return types.some((t) => t.toLowerCase().includes(q));
}
