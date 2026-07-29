import { Product, SizeStock, ProductColor } from '../types';

export interface SplitProductData {
  metadata: {
    id: string;
    sku?: string;
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    name: string;
    brand: string;
    category: 'men' | 'women' | 'kids';
    subcategory: string;
    price: number;
    originalPrice: number;
    discountPercent: number;
    rating: number;
    reviewsCount: number;
    isBestSeller?: boolean;
    isNewArrival?: boolean;
    isFeatured?: boolean;
    isLimitedStock?: boolean;
    isTrending?: boolean;
    status?: 'active' | 'hidden' | 'out_of_stock';
    inStock: boolean;
    createdAt?: string;
    updatedAt?: string;
    thumbnailURL?: string;
    material?: string;
    collectionTags?: string[];
  };
  gallery: {
    id: string;
    images: string[];
    hasParts?: boolean;
    partCount?: number;
  };
  galleryParts: { id: string; images: string[] }[];
  variants: {
    id: string;
    sizes: string[];
    sizeStocks?: SizeStock[];
    colors: ProductColor[];
  };
  aiMetadata: {
    id: string;
    description: string;
    material?: string;
    collectionTags?: string[];
  };
}

/**
 * Estimates the size of any object in KB.
 */
export function estimateObjectSizeKb(obj: any): number {
  try {
    const str = JSON.stringify(obj);
    return str ? str.length / 1024 : 0;
  } catch (e) {
    return 0;
  }
}

/**
 * Splits a full product into lightweight metadata and separate sub-collections/parts.
 * Enforces the 500 KB limit by automatically splitting any oversized images/arrays.
 */
export function splitProduct(p: Product): SplitProductData {
  // Filter out any oversized Base64 image data strings to save Firebase and Firestore storage size.
  // The guidelines specify: "Never store image data inside Firestore documents."
  const sanitizedImages = (p.images || []).filter((img) => {
    if (img && img.startsWith('data:image/') && img.length > 50 * 1024) {
      console.warn(`Filtering out base64 image on product ${p.id} due to size constraints.`);
      return false; // Skip massive inline base64 images
    }
    return true;
  });

  const thumbnailURL = sanitizedImages.length > 0 ? sanitizedImages[0] : (p.images?.[0] || '');

  const metadata = {
    id: p.id,
    sku: p.sku || '',
    slug: p.slug || '',
    metaTitle: p.metaTitle || '',
    metaDescription: p.metaDescription || '',
    ogImage: p.ogImage || '',
    name: p.name || '',
    brand: p.brand || '',
    category: p.category || 'men',
    subcategory: p.subcategory || '',
    price: p.price || 0,
    originalPrice: p.originalPrice || 0,
    discountPercent: p.discountPercent || 0,
    rating: p.rating || 0,
    reviewsCount: p.reviewsCount || 0,
    isBestSeller: !!p.isBestSeller,
    isNewArrival: !!p.isNewArrival,
    isFeatured: !!p.isFeatured,
    isLimitedStock: !!p.isLimitedStock,
    isTrending: !!p.isTrending,
    status: p.status || 'active',
    inStock: !!p.inStock,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
    thumbnailURL,
    description: p.description || '',
    material: p.material || '',
    collectionTags: p.collectionTags || [],
    sizes: p.sizes || [],
    sizeStocks: p.sizeStocks || [],
    colors: p.colors || [],
    images: sanitizedImages,
  };

  const variants = {
    id: p.id,
    sizes: p.sizes || [],
    sizeStocks: p.sizeStocks || [],
    colors: p.colors || [],
  };

  const aiMetadata = {
    id: p.id,
    description: p.description || '',
    material: p.material || '',
    collectionTags: p.collectionTags || [],
  };

  // Partition images so no gallery document exceeds 400 KB
  const galleryParts: { id: string; images: string[] }[] = [];
  const mainImages: string[] = [];
  
  let currentChunk: string[] = [];
  let currentChunkSizeKb = 0;

  for (const img of sanitizedImages) {
    const imgSizeKb = img.length / 1024;
    
    if (currentChunkSizeKb + imgSizeKb > 400) {
      if (mainImages.length === 0) {
        mainImages.push(...currentChunk);
      } else {
        galleryParts.push({
          id: `${p.id}_gallery_part${galleryParts.length + 1}`,
          images: currentChunk,
        });
      }
      currentChunk = [img];
      currentChunkSizeKb = imgSizeKb;
    } else {
      currentChunk.push(img);
      currentChunkSizeKb += imgSizeKb;
    }
  }

  if (currentChunk.length > 0) {
    if (mainImages.length === 0) {
      mainImages.push(...currentChunk);
    } else {
      galleryParts.push({
        id: `${p.id}_gallery_part${galleryParts.length + 1}`,
        images: currentChunk,
      });
    }
  }

  const gallery = {
    id: p.id,
    images: mainImages,
    hasParts: galleryParts.length > 0,
    partCount: galleryParts.length,
  };

  return {
    metadata,
    gallery,
    galleryParts,
    variants,
    aiMetadata,
  };
}

/**
 * Stitches a product's split segments back together transparently for downstream application views.
 */
export function stitchProduct(
  metadata: any,
  gallery?: any,
  variants?: any,
  aiMetadata?: any,
  galleryPartsMap: Record<string, any> = {}
): Product {
  if (!metadata) {
    return {} as Product;
  }

  // 1. IMAGES
  let images: string[] = [];
  if (gallery && Array.isArray(gallery.images)) {
    images = [...gallery.images];
  } else if (metadata && Array.isArray(metadata.images)) {
    images = [...metadata.images];
  }

  if (gallery?.hasParts && gallery.partCount > 0) {
    for (let i = 1; i <= gallery.partCount; i++) {
      const partId = `${metadata.id}_gallery_part${i}`;
      const partDoc = galleryPartsMap[partId];
      if (partDoc && Array.isArray(partDoc.images)) {
        images.push(...partDoc.images);
      }
    }
  }

  if (images.length === 0 && metadata.thumbnailURL) {
    images = [metadata.thumbnailURL];
  }

  // 2. VARIANTS (sizes, sizeStocks, colors)
  const sizes = (variants && Array.isArray(variants.sizes)) ? variants.sizes : (metadata.sizes || []);
  const sizeStocks = (variants && Array.isArray(variants.sizeStocks)) ? variants.sizeStocks : (metadata.sizeStocks || []);
  const colors = (variants && Array.isArray(variants.colors)) ? variants.colors : (metadata.colors || []);

  // 3. AI METADATA (description, material, collectionTags)
  const description = (aiMetadata && typeof aiMetadata.description === 'string') ? aiMetadata.description : (metadata.description || '');
  const material = (aiMetadata && typeof aiMetadata.material === 'string') ? aiMetadata.material : (metadata.material || '');
  const collectionTags = (aiMetadata && Array.isArray(aiMetadata.collectionTags)) ? aiMetadata.collectionTags : (metadata.collectionTags || []);

  return {
    ...metadata,
    images,
    sizes,
    sizeStocks,
    colors,
    description,
    material,
    collectionTags,
  };
}
