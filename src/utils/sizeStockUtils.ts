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

/**
 * Ensures a product always returns a valid array of SizeStock items.
 * If sizeStocks is missing or empty, it populates from product.sizes.
 */
export function normalizeProductSizeStocks(product: Product): SizeStock[] {
  if (product.sizeStocks && product.sizeStocks.length > 0) {
    return product.sizeStocks;
  }

  // Fallback generation from product.sizes
  if (product.sizes && product.sizes.length > 0) {
    return product.sizes.map((sz, idx) => ({
      size: sz,
      isAvailable: true,
      inStock: product.inStock,
      stockQuantity: product.inStock ? 12 - (idx % 5) : 0,
      system: 'Custom',
    }));
  }

  // Default fallback if sizes array is also empty
  return [
    { size: '7', isAvailable: true, inStock: product.inStock, stockQuantity: product.inStock ? 10 : 0, system: 'Custom' },
    { size: '8', isAvailable: true, inStock: product.inStock, stockQuantity: product.inStock ? 8 : 0, system: 'Custom' },
    { size: '9', isAvailable: true, inStock: product.inStock, stockQuantity: product.inStock ? 15 : 0, system: 'Custom' },
    { size: '10', isAvailable: true, inStock: false, stockQuantity: 0, system: 'Custom' },
  ];
}

/**
 * Checks if a product has zero available in-stock sizes or product.inStock is false.
 */
export function isProductCompletelyOutOfStock(product: Product): boolean {
  if (!product.inStock) return true;
  const stocks = normalizeProductSizeStocks(product);
  const availableInStock = stocks.filter((s) => s.isAvailable && s.inStock && s.stockQuantity > 0);
  return availableInStock.length === 0;
}

/**
 * Returns the first available and in-stock size string for a product, or first size.
 */
export function getFirstAvailableInStockSize(product: Product): string {
  const stocks = normalizeProductSizeStocks(product);
  const availableInStock = stocks.find((s) => s.isAvailable && s.inStock && s.stockQuantity > 0);
  if (availableInStock) return availableInStock.size;

  const firstAvailable = stocks.find((s) => s.isAvailable);
  if (firstAvailable) return firstAvailable.size;

  return stocks[0]?.size || 'Standard';
}

/**
 * Get detailed SizeStock info for a selected size string.
 */
export function getSizeStockInfo(product: Product, size: string): SizeStock | undefined {
  const stocks = normalizeProductSizeStocks(product);
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
