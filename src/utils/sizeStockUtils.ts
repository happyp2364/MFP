import { Product, SizeStock } from '../types';

export const SIZE_PRESETS = {
  UK_FOOTWEAR: ['UK 5', 'UK 5.5', 'UK 6', 'UK 6.5', 'UK 7', 'UK 7.5', 'UK 8', 'UK 8.5', 'UK 9', 'UK 9.5', 'UK 10', 'UK 11'],
  EU_FOOTWEAR: ['EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45'],
  US_FOOTWEAR: ['US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
  CLOTHING_ALPHA: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'],
  CLOTHING_WAIST: ['28', '30', '32', '34', '36', '38', '40', '42'],
  KIDS_AGE: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y'],
  KIDS_SHOES: ['C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13', '1', '2', '3', '4', '5'],
  NUMERIC_STANDARD: ['5', '5.5', '6', '6.5', '7', '8', '9', '10'],
};

function sortSizeStocks(stocks: SizeStock[]): SizeStock[] {
  return stocks.sort((a, b) => {
    const numA = parseFloat(a.size.replace(/[^0-9.]/g, ''));
    const numB = parseFloat(b.size.replace(/[^0-9.]/g, ''));
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.size.localeCompare(b.size, undefined, { numeric: true, sensitivity: 'base' });
  });
}

/**
 * Canonical helper to retrieve available product sizes and stocks based ONLY on stored inventory data.
 */
export function normalizeProductSizeStocks(product: Product, selectedColor?: string): SizeStock[] {
  if (!product) return [];

  // 1. If variants are present, filter/map based on selectedColor and master allowed sizes
  if (product.variants && product.variants.length > 0) {
    const targetColor = selectedColor ? selectedColor.trim().toLowerCase() : null;
    const matchingVariants = product.variants.filter((v) => {
      if (!v || !v.size) return false;
      if (v.status === 'hidden') return false;
      if (targetColor) {
        return typeof v.color === 'string' && v.color.trim().toLowerCase() === targetColor;
      }
      return true;
    });

    if (matchingVariants.length > 0) {
      // Get master allowed sizes from product.sizeStocks or product.sizes if available
      const allowedSizes = new Set<string>();
      if (product.sizeStocks && product.sizeStocks.length > 0) {
        product.sizeStocks.forEach(ss => {
          if (ss && ss.isAvailable && ss.size) allowedSizes.add(ss.size.trim().toLowerCase());
        });
      } else if (product.sizes && product.sizes.length > 0) {
        product.sizes.forEach(sz => {
          if (sz && typeof sz === 'string' && sz.trim() !== '') allowedSizes.add(sz.trim().toLowerCase());
        });
      }

      const map = new Map<string, SizeStock>();
      matchingVariants.forEach(v => {
        const sizeKey = v.size.trim();
        const lowerKey = sizeKey.toLowerCase();

        // If master allowed sizes are explicitly defined on the product, ensure this variant size is in them
        if (allowedSizes.size > 0 && !allowedSizes.has(lowerKey)) {
          return;
        }

        const stock = typeof v.stock === 'number' ? v.stock : 0;
        const inStock = stock > 0 && v.status !== 'out_of_stock';
        const isAvailable = v.status !== 'hidden';

        map.set(lowerKey, {
          size: sizeKey,
          isAvailable,
          inStock,
          stockQuantity: stock,
          system: 'Custom',
        });
      });

      if (map.size > 0) {
        return sortSizeStocks(Array.from(map.values()));
      }
    }
  }

  // 2. Product-level sizeStocks
  if (product.sizeStocks && product.sizeStocks.length > 0) {
    const valid = product.sizeStocks.filter(s => s && s.size && s.isAvailable);
    if (valid.length > 0) {
      return sortSizeStocks(valid.map(s => ({ ...s, size: s.size.trim() })));
    }
  }

  // 3. Product-level sizes array
  if (product.sizes && product.sizes.length > 0) {
    const validSizes = product.sizes
      .filter(sz => typeof sz === 'string' && sz.trim() !== '')
      .map(sz => sz.trim());
    
    if (validSizes.length > 0) {
      const uniqueSizes = Array.from(new Set(validSizes));
      const stocks: SizeStock[] = uniqueSizes.map(sz => ({
        size: sz,
        isAvailable: true,
        inStock: product.inStock,
        stockQuantity: product.inStock ? 10 : 0,
        system: 'Custom',
      }));
      return sortSizeStocks(stocks);
    }
  }

  // 4. Return empty array [] when no real size inventory exists rather than inventing defaults (Rule 8)
  return [];
}

export function getAvailableProductSizes(product: Product, selectedColor?: string): SizeStock[] {
  return normalizeProductSizeStocks(product, selectedColor);
}

/**
 * Checks if a product has zero available in-stock sizes or product.inStock is false.
 */
export function isProductCompletelyOutOfStock(product: Product, selectedColor?: string): boolean {
  if (!product.inStock) return true;
  const stocks = normalizeProductSizeStocks(product, selectedColor);
  if (stocks.length === 0) return !product.inStock;
  const availableInStock = stocks.filter((s) => s.isAvailable && s.inStock && s.stockQuantity > 0);
  return availableInStock.length === 0;
}

/**
 * Returns the first available and in-stock size string for a product, or first size.
 */
export function getFirstAvailableInStockSize(product: Product, selectedColor?: string): string {
  const stocks = normalizeProductSizeStocks(product, selectedColor);
  if (stocks.length === 0) return product.sizes?.[0] || 'Standard';
  const availableInStock = stocks.find((s) => s.isAvailable && s.inStock && s.stockQuantity > 0);
  if (availableInStock) return availableInStock.size;

  const firstAvailable = stocks.find((s) => s.isAvailable);
  if (firstAvailable) return firstAvailable.size;

  return stocks[0]?.size || 'Standard';
}

/**
 * Get detailed SizeStock info for a selected size string.
 */
export function getSizeStockInfo(product: Product, size: string, selectedColor?: string): SizeStock | undefined {
  const stocks = normalizeProductSizeStocks(product, selectedColor);
  return stocks.find((s) => s.size.trim().toLowerCase() === size.trim().toLowerCase());
}

/**
 * Helper to update product.sizes string array based on sizeStocks array
 */
export function syncSizesFromSizeStocks(sizeStocks: SizeStock[]): string[] {
  return sizeStocks
    .filter((s) => s.isAvailable)
    .map((s) => s.size);
}
