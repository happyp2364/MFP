import { Product, SizeStock, ProductColor } from '../types';

export interface SplitProductData {
  metadata: {
    id: string;
    name: string;
    brand: string;
    price: number;
    discount: number;
    gender: 'men' | 'women' | 'kids';
    category: 'men' | 'women' | 'kids';
    subCategory: string;
    thumbnailURL: string;
    stock: boolean;
    sizes: string[];
    status: 'active' | 'hidden' | 'out_of_stock';
    rating: number;
    createdAt: string;
    updatedAt: string;
  };
  gallery: {
    id: string;
    images: string[];
  };
  variants: {
    id: string;
    sizes: string[];
    sizeStocks: SizeStock[];
    colors: ProductColor[];
  };
  reviews: {
    id: string;
    reviews: any[];
  };
  ai: {
    id: string;
    description: string;
    material: string;
    collectionTags: string[];
  };
  seo: {
    id: string;
    sku: string;
    slug: string;
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
  };
  statistics: {
    id: string;
    rating: number;
    reviewsCount: number;
    originalPrice: number;
    isBestSeller: boolean;
    isNewArrival: boolean;
    isFeatured: boolean;
    isLimitedStock: boolean;
    isTrending: boolean;
  };
  related: {
    id: string;
    relatedProductIds: string[];
  };
  shipping: {
    id: string;
    shippingWeight: number;
    shippingDimensions: {
      length: number;
      width: number;
      height: number;
    };
    estimatedDelivery: string;
  };
}

/**
 * Estimates the size of any object in bytes in a browser-safe and Node-safe way.
 */
export function estimateObjectSizeBytes(obj: any): number {
  try {
    const str = JSON.stringify(obj);
    if (!str) return 0;
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(str).length;
    }
    return str.length;
  } catch (e) {
    return 0;
  }
}

/**
 * Estimates the size of any object in KB.
 */
export function estimateObjectSizeKb(obj: any): number {
  return estimateObjectSizeBytes(obj) / 1024;
}

/**
 * Calculates and enforces document size limits before writing to Firestore.
 * If any document exceeds 400 KB, it automatically stops and throws a detailed error.
 */
export function verifyDocumentSize(collectionName: string, docId: string, data: any): void {
  const sizeBytes = estimateObjectSizeBytes(data);
  if (sizeBytes > 400 * 1024) {
    const report: string[] = [];
    Object.entries(data).forEach(([key, val]) => {
      const fieldSize = estimateObjectSizeBytes({ [key]: val });
      if (fieldSize > 5 * 1024) {
        report.push(`"${key}" (${(fieldSize / 1024).toFixed(2)} KB)`);
      }
    });
    const errMsg = `BLOCKED WRITE: Document "${docId}" in collection "${collectionName}" exceeds 400 KB. Size: ${(sizeBytes / 1024).toFixed(2)} KB. Oversized fields: ${report.join(', ')}`;
    console.error(errMsg);
    throw new Error(errMsg);
  }
}

/**
 * Normalizes and splits a full product into separate structured records.
 * Filters out all base64 and binary image assets, and keeps the document slim.
 */
export function splitProduct(p: Product): SplitProductData {
  // Sanitize images to filter out base64, binaries, blobs, or large arrays
  const sanitizedImages = (p.images || []).filter((img) => {
    if (!img) return false;
    // Check if the image starts with data: or contains base64/blob
    if (img.startsWith('data:') || img.includes(';base64,') || img.startsWith('blob:')) {
      console.warn(`Stripped base64/blob image from product ${p.id}`);
      return false;
    }
    // Check if string is excessively large
    if (img.length > 2048) {
      console.warn(`Stripped oversized image URL from product ${p.id}`);
      return false;
    }
    return true;
  });

  const thumbnailURL = sanitizedImages[0] || (p as any).thumbnailURL || (p as any).ogImage || '';

  // Main product document strictly contains only the 15 required fields
  const metadata: SplitProductData['metadata'] = {
    id: p.id,
    name: p.name || '',
    brand: p.brand || '',
    price: p.price || 0,
    discount: p.discountPercent || 0,
    gender: p.category || 'men',
    category: p.category || 'men',
    subCategory: p.subcategory || '',
    thumbnailURL,
    stock: p.inStock ?? true,
    sizes: p.sizes || [],
    status: p.status || 'active',
    rating: p.rating || 0,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
  };

  const gallery: SplitProductData['gallery'] = {
    id: p.id,
    images: sanitizedImages,
  };

  const variants: SplitProductData['variants'] = {
    id: p.id,
    sizes: p.sizes || [],
    sizeStocks: p.sizeStocks || [],
    colors: p.colors || [],
  };

  const reviews: SplitProductData['reviews'] = {
    id: p.id,
    reviews: [], // Default empty or mapped if reviews list exists
  };

  const ai: SplitProductData['ai'] = {
    id: p.id,
    description: p.description || '',
    material: p.material || '',
    collectionTags: p.collectionTags || [],
  };

  const seo: SplitProductData['seo'] = {
    id: p.id,
    sku: p.sku || '',
    slug: p.slug || '',
    metaTitle: p.metaTitle || '',
    metaDescription: p.metaDescription || '',
    ogImage: p.ogImage || '',
  };

  const statistics: SplitProductData['statistics'] = {
    id: p.id,
    rating: p.rating || 0,
    reviewsCount: p.reviewsCount || 0,
    originalPrice: p.originalPrice || p.price || 0,
    isBestSeller: !!p.isBestSeller,
    isNewArrival: !!p.isNewArrival,
    isFeatured: !!p.isFeatured,
    isLimitedStock: !!p.isLimitedStock,
    isTrending: !!p.isTrending,
  };

  const related: SplitProductData['related'] = {
    id: p.id,
    relatedProductIds: p.collectionTags ? [p.id] : [], // Simple related array
  };

  const shipping: SplitProductData['shipping'] = {
    id: p.id,
    shippingWeight: 1.2,
    shippingDimensions: { length: 32, width: 22, height: 12 },
    estimatedDelivery: '3-5 business days',
  };

  // Perform Size Enforcement validation on every single document before return
  verifyDocumentSize('products', metadata.id, metadata);
  verifyDocumentSize('product_gallery', gallery.id, gallery);
  verifyDocumentSize('product_variants', variants.id, variants);
  verifyDocumentSize('product_reviews', reviews.id, reviews);
  verifyDocumentSize('product_ai', ai.id, ai);
  verifyDocumentSize('product_seo', seo.id, seo);
  verifyDocumentSize('product_statistics', statistics.id, statistics);
  verifyDocumentSize('product_related', related.id, related);
  verifyDocumentSize('product_shipping', shipping.id, shipping);

  return {
    metadata,
    gallery,
    variants,
    reviews,
    ai,
    seo,
    statistics,
    related,
    shipping,
  };
}

/**
 * Stitches a product's split segments back together transparently for downstream application views.
 */
export function stitchProduct(
  metadata: any,
  gallery?: any,
  variants?: any,
  reviewsDoc?: any,
  aiDoc?: any,
  seoDoc?: any,
  statisticsDoc?: any,
  relatedDoc?: any,
  shippingDoc?: any
): Product {
  const images = gallery?.images || (metadata?.thumbnailURL ? [metadata.thumbnailURL] : []);

  return {
    id: metadata.id,
    sku: seoDoc?.sku || '',
    slug: seoDoc?.slug || '',
    metaTitle: seoDoc?.metaTitle || '',
    metaDescription: seoDoc?.metaDescription || '',
    ogImage: seoDoc?.ogImage || '',
    name: metadata.name || '',
    brand: metadata.brand || '',
    category: metadata.category || 'men',
    subcategory: metadata.subCategory || '',
    price: metadata.price || 0,
    originalPrice: statisticsDoc?.originalPrice || metadata.price || 0,
    discountPercent: metadata.discount || 0,
    rating: metadata.rating || 0,
    reviewsCount: statisticsDoc?.reviewsCount || 0,
    images: images,
    description: aiDoc?.description || '',
    sizes: metadata.sizes || variants?.sizes || [],
    sizeStocks: variants?.sizeStocks || [],
    colors: variants?.colors || [],
    isBestSeller: statisticsDoc?.isBestSeller ?? false,
    isNewArrival: statisticsDoc?.isNewArrival ?? false,
    isFeatured: statisticsDoc?.isFeatured ?? false,
    isLimitedStock: statisticsDoc?.isLimitedStock ?? false,
    isTrending: statisticsDoc?.isTrending ?? false,
    status: metadata.status || 'active',
    collectionTags: aiDoc?.collectionTags || [],
    material: aiDoc?.material || '',
    inStock: metadata.stock ?? true,
    createdAt: metadata.createdAt,
    updatedAt: metadata.updatedAt,
  };
}
