import { Product } from '../types';

/**
 * Returns a URL-friendly slug for a product.
 * If product.slug is missing, falls back to sanitized product.name or product.id.
 */
export function getProductSlug(product: Product): string {
  if (!product) return '';
  if (product.slug && product.slug.trim().length > 0) {
    return product.slug.trim().toLowerCase();
  }
  if (product.name && product.name.trim().length > 0) {
    return product.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  return (product.id || '').trim().toLowerCase();
}

/**
 * Returns a standardized SKU for a product or variant.
 */
export function getProductSKU(product: Product): string {
  if (!product) return '';
  if (pSKU(product)) return pSKU(product);
  return `SKU-${(product.id || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
}

function pSKU(product: Product): string {
  return product.sku && product.sku.trim().length > 0 ? product.sku.trim() : '';
}

/**
 * Generates the full canonical route for a product detail page.
 * Format: /product/[slug] or /product/[id]
 */
export function getProductDetailUrl(product: Product): string {
  const slugOrId = getProductSlug(product);
  return `/product/${slugOrId}`;
}

export const getProductUrl = getProductDetailUrl;

/**
 * Finds a product from an array of products by comparing target string against:
 * 1. product.id
 * 2. product.slug
 * 3. product.sku
 * 4. sanitized versions of above
 */
export function findProductBySlugOrId(products: Product[], targetSlugOrId: string): Product | undefined {
  if (!targetSlugOrId) return undefined;
  
  let cleanTarget = '';
  try {
    cleanTarget = decodeURIComponent(targetSlugOrId).trim().toLowerCase();
  } catch (e) {
    cleanTarget = (targetSlugOrId || '').trim().toLowerCase();
  }

  // Strip leading slashes if any
  cleanTarget = cleanTarget.replace(/^\/+(products?\/)?/, '');

  return products.find((p) => {
    const id = (p.id || '').trim().toLowerCase();
    const slug = (getProductSlug(p) || '').toLowerCase();
    const sku = (getProductSKU(p) || '').toLowerCase();

    return (
      id === cleanTarget ||
      slug === cleanTarget ||
      sku === cleanTarget ||
      (id.length > 0 && cleanTarget.endsWith(id)) ||
      (slug.length > 0 && slug.endsWith(`-${cleanTarget}`)) ||
      (cleanTarget.length > 0 && cleanTarget.includes(id))
    );
  });
}
