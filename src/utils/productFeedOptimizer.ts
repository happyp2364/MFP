import { Product } from '../types';

export interface ProductFeedConfig {
  sortBy?: 'priority' | 'price_asc' | 'price_desc' | 'newest' | string;
  inStockOnly?: boolean;
}

/**
 * Enterprise-grade deduplication for products.
 * Deduplicates by ID, SKU, Slug, or Barcode to ensure product lists never contain duplicates.
 */
export function deduplicateProducts(products: Product[], config?: ProductFeedConfig): Product[] {
  if (!Array.isArray(products)) return [];

  const seenIds = new Set<string>();
  const seenSkus = new Set<string>();
  const seenSlugs = new Set<string>();
  const seenBarcodes = new Set<string>();

  return products.filter((p) => {
    if (!p) return false;

    // 1. Check ID (Firestore document id)
    if (p.id) {
      if (seenIds.has(p.id)) return false;
    }

    // 2. Check SKU
    if (p.sku && typeof p.sku === 'string' && p.sku.trim() !== '') {
      const formattedSku = p.sku.trim().toLowerCase();
      if (seenSkus.has(formattedSku)) return false;
    }

    // 3. Check Slug
    if (p.slug && typeof p.slug === 'string' && p.slug.trim() !== '') {
      const formattedSlug = p.slug.trim().toLowerCase();
      if (seenSlugs.has(formattedSlug)) return false;
    }

    // 4. Check Barcode (custom field if present)
    const barcode = (p as any).barcode;
    if (barcode && String(barcode).trim() !== '') {
      const formattedBarcode = String(barcode).trim().toLowerCase();
      if (seenBarcodes.has(formattedBarcode)) return false;
    }

    // If none of the attributes have been seen, we mark them all as seen and keep the product
    if (p.id) seenIds.add(p.id);
    if (p.sku && typeof p.sku === 'string' && p.sku.trim() !== '') seenSkus.add(p.sku.trim().toLowerCase());
    if (p.slug && typeof p.slug === 'string' && p.slug.trim() !== '') seenSlugs.add(p.slug.trim().toLowerCase());
    if (barcode && String(barcode).trim() !== '') seenBarcodes.add(String(barcode).trim().toLowerCase());

    return true;
  });
}

/**
 * Calculates a priority score for a product based on Admin weights & flags.
 */
export function scoreProduct(p: Product, config?: ProductFeedConfig): number {
  if (!p) return 0;
  let score = 0;

  const isFeatured = p.isFeatured || (p as any).featured;
  const isBestSeller = p.isBestSeller || (p as any).bestseller;

  // 1. Featured / Bestseller boost
  if (isFeatured) score += 50;
  if (isBestSeller) score += 30;

  // 2. Stock Availability
  const totalStock = Array.isArray(p.variants)
    ? p.variants.reduce((acc, v) => acc + (v.stock || 0), 0)
    : (p as any).stock ?? (p.inStock ? 10 : 0);

  if (totalStock > 0) {
    score += 20;
  } else if (config?.inStockOnly) {
    return -1; // Exclude out-of-stock items if flag is active
  }

  // 3. Discount Percentage Boost
  if (p.originalPrice && p.price && p.originalPrice > p.price) {
    const discountPercent = ((p.originalPrice - p.price) / p.originalPrice) * 100;
    score += Math.min(discountPercent, 30);
  }

  return score;
}

/**
 * Sorts products using a smart mix algorithm based on score and selected sort criteria.
 */
export function sortProductsWithSmartMix(
  products: Product[],
  configOrSortBy?: ProductFeedConfig | string,
  sortByOverride?: string
): Product[] {
  if (!Array.isArray(products)) return [];
  const deduped = deduplicateProducts(products);

  let sortBy = 'featured';
  let config: ProductFeedConfig | undefined = undefined;

  if (typeof configOrSortBy === 'string') {
    sortBy = configOrSortBy;
  } else if (configOrSortBy) {
    config = configOrSortBy;
    if (sortByOverride) {
      sortBy = sortByOverride;
    } else if (config.sortBy) {
      sortBy = config.sortBy;
    }
  }

  const list = [...deduped];

  if (sortBy === 'price_asc' || sortBy === 'price-low') {
    return list.sort((a, b) => (a.price || 0) - (b.price || 0));
  }
  if (sortBy === 'price_desc' || sortBy === 'price-high') {
    return list.sort((a, b) => (b.price || 0) - (a.price || 0));
  }
  if (sortBy === 'newest') {
    return list.reverse();
  }

  // Default smart mix / priority scoring
  return list.sort((a, b) => scoreProduct(b, config) - scoreProduct(a, config));
}
