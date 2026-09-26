import { ProductTemplate, SizeStock, ProductColor, ProductVariant } from '../types';

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
 * Normalizes any legacy or current Firestore product template structure into a consistent ProductTemplate object,
 * ensuring sizes, sizeStocks, colors, and variants are correctly mapped without data loss.
 */
export function normalizeProductTemplate(rawTemplate: any): ProductTemplate {
  if (!rawTemplate) {
    return {
      id: `tpl_${Date.now()}`,
      name: 'Untitled Template',
      category: 'men',
      productTypes: [],
      brand: 'Marudhar Fashion',
      description: '',
      sizes: [],
      sizeStocks: [],
      colors: [],
      variants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const productTypes = getProductTypes(rawTemplate);
  const sizes = Array.isArray(rawTemplate.sizes) ? rawTemplate.sizes.map(String).filter(Boolean) : [];
  const sizeStocks: SizeStock[] = Array.isArray(rawTemplate.sizeStocks)
    ? rawTemplate.sizeStocks.map((st: any) => ({
        size: String(st.size || ''),
        isAvailable: st.isAvailable !== false,
        inStock: st.inStock !== false,
        stockQuantity: Number(st.stockQuantity ?? st.stock ?? 10),
        price: st.price !== undefined ? Number(st.price) : undefined,
      }))
    : [];

  const colors: ProductColor[] = Array.isArray(rawTemplate.colors)
    ? rawTemplate.colors.map((c: any) => ({
        id: String(c.id || Math.random().toString(36).substring(2, 7)),
        name: String(c.name || 'Color'),
        hexCode: String(c.hexCode || c.hex || '#000000'),
        images: Array.isArray(c.images) ? c.images : (c.image ? [c.image] : []),
        sizes: Array.isArray(c.sizes) ? c.sizes : undefined,
      }))
    : [];

  const variants: ProductVariant[] = Array.isArray(rawTemplate.variants)
    ? rawTemplate.variants.map((v: any) => ({
        id: String(v.id || Math.random().toString(36).substring(2, 7)),
        color: String(v.color || ''),
        size: String(v.size || ''),
        stock: Number(v.stock ?? v.stockQuantity ?? 10),
        images: Array.isArray(v.images) ? v.images : (v.image ? [v.image] : []),
        sku: String(v.sku || ''),
      }))
    : [];

  return {
    id: String(rawTemplate.id || `tpl_${Date.now()}`),
    name: String(rawTemplate.name || rawTemplate.title || 'Untitled Template').trim(),
    descriptionPreview: String(rawTemplate.descriptionPreview || rawTemplate.shortDescription || rawTemplate.description || '').substring(0, 160).trim(),
    category: ['men', 'women', 'kids'].includes(rawTemplate.category) ? rawTemplate.category : 'men',
    productTypes,
    subcategory: rawTemplate.subcategory || productTypes[0] || '',
    brand: String(rawTemplate.brand || 'Marudhar Fashion').trim(),
    description: String(rawTemplate.description || '').trim(),
    shortDescription: String(rawTemplate.shortDescription || '').trim(),
    material: String(rawTemplate.material || '').trim(),
    fitGuide: String(rawTemplate.fitGuide || '').trim(),
    careInstructions: String(rawTemplate.careInstructions || '').trim(),
    features: Array.isArray(rawTemplate.features) ? rawTemplate.features.map(String).filter(Boolean) : [],
    collectionTags: Array.isArray(rawTemplate.collectionTags) ? rawTemplate.collectionTags.map(String).filter(Boolean) : [],
    metaTitle: String(rawTemplate.metaTitle || '').trim(),
    metaDescription: String(rawTemplate.metaDescription || '').trim(),
    sizeMode: ['standard', 'free_size', 'no_size'].includes(rawTemplate.sizeMode) ? rawTemplate.sizeMode : (rawTemplate.sizes?.length === 1 && rawTemplate.sizes[0] === 'Free Size' ? 'free_size' : (rawTemplate.sizes?.length === 0 ? 'no_size' : 'standard')),
    sizes,
    sizeStocks,
    colors,
    variants,
    createdAt: rawTemplate.createdAt || new Date().toISOString(),
    updatedAt: rawTemplate.updatedAt || new Date().toISOString(),
    createdBy: rawTemplate.createdBy,
  };
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
