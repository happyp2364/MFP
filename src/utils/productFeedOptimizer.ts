import { Product, ProductFeedConfig } from '../types';

/**
 * Deduplicates an array of products based on:
 * - Product ID
 * - SKU
 * - Slug
 * - Barcode
 */
export function deduplicateProducts(products: Product[], config?: ProductFeedConfig): Product[] {
  if (config && config.duplicateDetection === false) {
    return products;
  }

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
    if (p.sku && p.sku.trim() !== '') {
      const formattedSku = p.sku.trim().toLowerCase();
      if (seenSkus.has(formattedSku)) return false;
    }

    // 3. Check Slug
    if (p.slug && p.slug.trim() !== '') {
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
    if (p.sku && p.sku.trim() !== '') seenSkus.add(p.sku.trim().toLowerCase());
    if (p.slug && p.slug.trim() !== '') seenSlugs.add(p.slug.trim().toLowerCase());
    if (barcode && String(barcode).trim() !== '') seenBarcodes.add(String(barcode).trim().toLowerCase());

    return true;
  });
}

/**
 * Calculates a priority score for a product based on Admin weights & flags.
 */
export function scoreProduct(p: Product, config: ProductFeedConfig): number {
  let score = 0;

  if (p.isFeatured && config.featuredPriority !== undefined) {
    score += config.featuredPriority * 10;
  }
  if (p.isTrending && config.trendingPriority !== undefined) {
    score += config.trendingPriority * 10;
  }
  if (p.isBestSeller && config.bestSellerPriority !== undefined) {
    score += config.bestSellerPriority * 10;
  }
  if (p.isNewArrival && config.recentlyAddedPriority !== undefined) {
    score += config.recentlyAddedPriority * 10;
  }

  // Handle randomization if enabled (makes feed discoverable but stable within session)
  if (config.randomization && p.id) {
    const hash = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    score += (hash % 10);
  }

  return score;
}

/**
 * Sorts and ranks products by smart mix score (if 'featured') or standard metrics.
 */
export function sortProductsWithSmartMix(
  products: Product[],
  config: ProductFeedConfig,
  sortBy: string
): Product[] {
  const sorted = [...products];

  if (sortBy === 'featured') {
    return sorted.sort((a, b) => {
      const scoreA = scoreProduct(a, config);
      const scoreB = scoreProduct(b, config);
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      // Fallback to name comparison to keep sort stable
      return a.name.localeCompare(b.name);
    });
  }

  return sorted;
}
