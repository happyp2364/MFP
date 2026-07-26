import { Product } from '../types';

/**
 * Converts a string into a clean, URL-safe slug
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Ensures every product has a valid, unique Product ID (SKU).
 * Fallback format: MFP-{CATEGORY_LETTER}-{PRODUCT_ID_SHORT}
 */
export function getProductSKU(product: Product): string {
  if (product.sku && product.sku.trim()) {
    return product.sku.trim().toUpperCase();
  }
  const categoryCode = (product.category || 'M').charAt(0).toUpperCase();
  const cleanId = (product.id || '01').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `MFP-${categoryCode}-${cleanId}`;
}

/**
 * Ensures every product has a unique public URL slug.
 * Fallback: slugified name + clean ID
 */
export function getProductSlug(product: Product): string {
  if (product.slug && product.slug.trim()) {
    return slugify(product.slug);
  }
  const nameSlug = slugify(product.name || 'product');
  const cleanId = (product.id || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return nameSlug ? `${nameSlug}-${cleanId}` : cleanId || 'product';
}

/**
 * Constructs the canonical public URL for a product
 */
export function getProductUrl(product: Product, customOrigin?: string): string {
  const origin = customOrigin || (typeof window !== 'undefined' ? window.location.origin : 'https://marudharfashionpoint.com');
  const slug = getProductSlug(product);
  return `${origin}/product/${slug}`;
}

/**
 * Matches a product by slug, ID, or SKU
 */
export function findProductBySlugOrId(products: Product[], targetSlugOrId: string): Product | undefined {
  if (!targetSlugOrId) return undefined;
  const cleanTarget = targetSlugOrId.trim().toLowerCase();

  return products.find((p) => {
    const slug = getProductSlug(p).toLowerCase();
    const id = (p.id || '').toLowerCase();
    const sku = getProductSKU(p).toLowerCase();

    return slug === cleanTarget || id === cleanTarget || sku === cleanTarget || slug.endsWith(`-${cleanTarget}`);
  });
}
