import { CartItem, Product, ProductVariant } from '../types';

/**
 * Resolves the unit price for a CartItem, checking for independent variant pricing.
 */
export function getCartItemPrice(item: CartItem): number {
  if (!item || !item.product) return 0;
  return item.selectedVariant ? item.selectedVariant.price : (item.product.price || 0);
}

/**
 * Resolves the unit price for a given product and its selected size and color.
 */
export function getProductPrice(product: Product, size?: string, color?: string): number {
  if (!product) return 0;
  if (product.variants && product.variants.length > 0 && color) {
    const targetColor = String(color).trim().toLowerCase();
    const targetSize = size !== undefined && size !== null ? String(size) : undefined;
    const matchingVariant = product.variants.find(
      (v) => v && typeof v.color === 'string' && v.color.trim().toLowerCase() === targetColor && (!targetSize || String(v.size) === targetSize)
    );
    if (matchingVariant && matchingVariant.price !== undefined) {
      return matchingVariant.price;
    }
  }
  return product.price || 0;
}

/**
 * Resolves the original price for a given product and its selected size and color.
 */
export function getProductOriginalPrice(product: Product, size?: string, color?: string): number {
  if (!product) return 0;
  if (product.variants && product.variants.length > 0 && color) {
    const targetColor = String(color).trim().toLowerCase();
    const targetSize = size !== undefined && size !== null ? String(size) : undefined;
    const matchingVariant = product.variants.find(
      (v) => v && typeof v.color === 'string' && v.color.trim().toLowerCase() === targetColor && (!targetSize || String(v.size) === targetSize)
    );
    if (matchingVariant && matchingVariant.originalPrice !== undefined) {
      return matchingVariant.originalPrice;
    }
  }
  return product.originalPrice || 0;
}

/**
 * Resolves the original price for a CartItem, checking for independent variant original pricing.
 */
export function getCartItemOriginalPrice(item: CartItem): number {
  if (!item || !item.product) return 0;
  return item.selectedVariant ? item.selectedVariant.originalPrice : (item.product.originalPrice || 0);
}

/**
 * Resolves the SKU for a CartItem, checking for independent variant SKU.
 */
export function getCartItemSKU(item: CartItem): string {
  if (!item || !item.product) return '';
  if (item.selectedVariant && item.selectedVariant.sku) {
    return item.selectedVariant.sku;
  }
  return item.product.sku || '';
}

/**
 * Resolves the Barcode for a CartItem, checking for independent variant barcode.
 */
export function getCartItemBarcode(item: CartItem): string {
  if (!item || !item.product) return '';
  if (item.selectedVariant && item.selectedVariant.barcode) {
    return item.selectedVariant.barcode;
  }
  return '';
}

export function getProductImage(product: Product, color?: string): string {
  if (!product) return '';
  if (product.variants && product.variants.length > 0 && color) {
    const targetColor = String(color).trim().toLowerCase();
    const matchingColorVar = product.variants.find(
      (v) => v && typeof v.color === 'string' && v.color.trim().toLowerCase() === targetColor && v.images && Array.isArray(v.images) && v.images.length > 0
    );
    if (matchingColorVar && matchingColorVar.images && matchingColorVar.images.length > 0) {
      return matchingColorVar.images[0];
    }
  }
  return product.images?.[0] || '';
}

/**
 * Resolves the primary image for a CartItem, checking if the selected variant has custom color-specific images.
 */
export function getCartItemImage(item: CartItem): string {
  if (!item || !item.product) return '';
  if (item.selectedVariant && item.selectedVariant.images && Array.isArray(item.selectedVariant.images) && item.selectedVariant.images.length > 0) {
    return item.selectedVariant.images[0];
  }
  // Try to find if any variant has images for this color
  if (item.product.variants && item.product.variants.length > 0 && item.selectedColor) {
    const targetColor = String(item.selectedColor).trim().toLowerCase();
    const matchingColorVar = item.product.variants.find(
      (v) => v && typeof v.color === 'string' && v.color.trim().toLowerCase() === targetColor && v.images && Array.isArray(v.images) && v.images.length > 0
    );
    if (matchingColorVar && matchingColorVar.images && matchingColorVar.images.length > 0) {
      return matchingColorVar.images[0];
    }
  }
  return item.product.images?.[0] || '';
}

/**
 * Automatically groups product variants by color name.
 */
export function groupVariantsByColor(variants: ProductVariant[]): Record<string, ProductVariant[]> {
  const groups: Record<string, ProductVariant[]> = {};
  if (!variants || !Array.isArray(variants)) return groups;
  for (const v of variants) {
    if (v && v.color) {
      if (!groups[v.color]) {
        groups[v.color] = [];
      }
      groups[v.color].push(v);
    }
  }
  return groups;
}

/**
 * Resolves the complete image gallery for a given product and selected color.
 */
export function getImagesForSelectedColor(product: Product, color?: string): string[] {
  if (!product) return [];
  const targetColor = (color || product.colors?.[0]?.name || '').trim().toLowerCase();

  // 1. Check variants for matching color with images
  if (product.variants && product.variants.length > 0 && targetColor) {
    const matchingVariant = product.variants.find(
      (v) => v && typeof v.color === 'string' && v.color.trim().toLowerCase() === targetColor && v.images && Array.isArray(v.images) && v.images.length > 0
    );
    if (matchingVariant && matchingVariant.images && matchingVariant.images.length > 0) {
      return matchingVariant.images;
    }
  }

  // 2. Check product.colors array for color-specific image/images
  if (product.colors && product.colors.length > 0 && targetColor) {
    const matchingColorObj = product.colors.find(
      (c: any) => c && c.name && typeof c.name === 'string' && c.name.trim().toLowerCase() === targetColor
    );
    if (matchingColorObj) {
      if ((matchingColorObj as any).images && Array.isArray((matchingColorObj as any).images) && (matchingColorObj as any).images.length > 0) {
        return (matchingColorObj as any).images;
      }
      if ((matchingColorObj as any).image && typeof (matchingColorObj as any).image === 'string' && (matchingColorObj as any).image.trim() !== '') {
        return [(matchingColorObj as any).image];
      }
    }
  }

  // 3. Fallback to primary product images if available
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images;
  }

  return [];
}

/**
 * Auto-generates a SKU following the convention (e.g., brand-color-size or CPM-BLK-08)
 */
export function generateAutoSKU(productName: string, color: string, size: string): string {
  const cleanName = productName.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const cleanColor = color.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const cleanSize = size.padStart(2, '0').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${cleanName}-${cleanColor}-${cleanSize}`;
}

/**
 * Auto-generates a mock or placeholder barcode for a variant
 */
export function generateAutoBarcode(productId: string, color: string, size: string): string {
  const cleanId = productId.substring(0, 4).toUpperCase();
  const cleanColor = color.substring(0, 2).toUpperCase();
  const cleanSize = size.replace(/[^0-9]/g, '');
  return `890${cleanId}${cleanColor}${cleanSize}`.padEnd(13, '0').substring(0, 13);
}
