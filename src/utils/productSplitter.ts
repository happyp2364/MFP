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
  shippingDoc?: any,
  fallbackProduct?: Product
): Product {
  const defaultImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80';

  if (!metadata || !metadata.id) {
    if (fallbackProduct) return fallbackProduct;
    return {
      id: `fallback-${Date.now()}`,
      name: 'Product',
      brand: 'Marudhar Fashion',
      category: 'men',
      subcategory: 'Footwear',
      price: 999,
      originalPrice: 1299,
      discountPercent: 23,
      rating: 4.5,
      reviewsCount: 1,
      images: [defaultImage],
      description: '',
      sizes: ['7', '8', '9', '10'],
      sizeStocks: [],
      colors: [{ name: 'Standard', hex: '#000000' }],
      isBestSeller: false,
      isNewArrival: true,
      isFeatured: true,
      isLimitedStock: false,
      isTrending: false,
      status: 'active',
      collectionTags: ['New'],
      material: 'Premium Material',
      inStock: true,
      sku: '',
      slug: '',
      metaTitle: '',
      metaDescription: '',
      ogImage: defaultImage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Resolve images array with robust fallbacks
  let images: string[] = [];
  if (gallery?.images && Array.isArray(gallery.images) && gallery.images.length > 0) {
    images = gallery.images;
  } else if (metadata.thumbnailURL) {
    images = [metadata.thumbnailURL];
  } else if (metadata.images && Array.isArray(metadata.images) && metadata.images.length > 0) {
    images = metadata.images;
  } else if (fallbackProduct?.images && fallbackProduct.images.length > 0) {
    images = fallbackProduct.images;
  } else {
    images = [defaultImage];
  }

  // Resolve sizes array
  let sizes: string[] = [];
  if (variants?.sizes && Array.isArray(variants.sizes) && variants.sizes.length > 0) {
    sizes = variants.sizes;
  } else if (metadata.sizes && Array.isArray(metadata.sizes) && metadata.sizes.length > 0) {
    sizes = metadata.sizes;
  } else if (fallbackProduct?.sizes && fallbackProduct.sizes.length > 0) {
    sizes = fallbackProduct.sizes;
  } else {
    sizes = ['7', '8', '9', '10'];
  }

  // Resolve colors array
  let colors: any[] = [];
  if (variants?.colors && Array.isArray(variants.colors) && variants.colors.length > 0) {
    colors = variants.colors;
  } else if (metadata.colors && Array.isArray(metadata.colors) && metadata.colors.length > 0) {
    colors = metadata.colors;
  } else if (fallbackProduct?.colors && fallbackProduct.colors.length > 0) {
    colors = fallbackProduct.colors;
  } else {
    colors = [{ name: 'Standard', hex: '#000000' }];
  }

  return {
    id: metadata.id,
    sku: seoDoc?.sku || metadata.sku || fallbackProduct?.sku || '',
    slug: seoDoc?.slug || metadata.slug || fallbackProduct?.slug || '',
    metaTitle: seoDoc?.metaTitle || metadata.metaTitle || fallbackProduct?.metaTitle || '',
    metaDescription: seoDoc?.metaDescription || metadata.metaDescription || fallbackProduct?.metaDescription || '',
    ogImage: seoDoc?.ogImage || metadata.ogImage || fallbackProduct?.ogImage || images[0] || defaultImage,
    name: metadata.name || fallbackProduct?.name || 'Product',
    brand: metadata.brand || fallbackProduct?.brand || 'Marudhar Fashion',
    category: metadata.category || metadata.gender || fallbackProduct?.category || 'men',
    subcategory: metadata.subCategory || metadata.subcategory || fallbackProduct?.subcategory || 'Footwear',
    price: metadata.price ?? fallbackProduct?.price ?? 999,
    originalPrice: statisticsDoc?.originalPrice ?? metadata.originalPrice ?? fallbackProduct?.originalPrice ?? metadata.price ?? 1299,
    discountPercent: metadata.discount ?? fallbackProduct?.discountPercent ?? 0,
    rating: statisticsDoc?.rating ?? metadata.rating ?? fallbackProduct?.rating ?? 4.5,
    reviewsCount: statisticsDoc?.reviewsCount ?? fallbackProduct?.reviewsCount ?? 0,
    images,
    description: aiDoc?.description || metadata.description || fallbackProduct?.description || '',
    sizes,
    sizeStocks: variants?.sizeStocks || fallbackProduct?.sizeStocks || [],
    colors,
    isBestSeller: statisticsDoc?.isBestSeller ?? fallbackProduct?.isBestSeller ?? false,
    isNewArrival: statisticsDoc?.isNewArrival ?? fallbackProduct?.isNewArrival ?? false,
    isFeatured: statisticsDoc?.isFeatured ?? fallbackProduct?.isFeatured ?? false,
    isLimitedStock: statisticsDoc?.isLimitedStock ?? fallbackProduct?.isLimitedStock ?? false,
    isTrending: statisticsDoc?.isTrending ?? fallbackProduct?.isTrending ?? false,
    status: metadata.status || fallbackProduct?.status || 'active',
    collectionTags: aiDoc?.collectionTags || metadata.collectionTags || fallbackProduct?.collectionTags || [],
    material: aiDoc?.material || metadata.material || fallbackProduct?.material || '',
    inStock: metadata.stock ?? metadata.inStock ?? fallbackProduct?.inStock ?? true,
    createdAt: metadata.createdAt || fallbackProduct?.createdAt || new Date().toISOString(),
    updatedAt: metadata.updatedAt || fallbackProduct?.updatedAt || new Date().toISOString(),
  };
}
