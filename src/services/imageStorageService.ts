/**
 * Enterprise Image Storage Service for Marudhar Fashion Point
 * 
 * ARCHITECTURAL MANDATE:
 * Product images are ALWAYS persistently stored in Cloudinary CDN.
 * Product Firestore documents store ONLY lightweight HTTPS Cloudinary URLs.
 * NEVER store base64, data URIs, or raw binary payloads in Firestore.
 */

import { auth } from '../lib/firebase';
import { optimizeImageFile } from '../utils/imageOptimizer';

export interface StorageUploadOptions {
  folder?: string;
  filename?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface StorageUploadResult {
  url: string;
  source: 'cloudinary' | 'existing_url' | 'dev_fallback';
  publicId?: string;
}

/**
 * Checks if a URL is hosted on Cloudinary.
 */
export function isCloudinaryUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.trim().startsWith('https://res.cloudinary.com/') || url.trim().startsWith('http://res.cloudinary.com/');
}

/**
 * Checks if a string is already an external or static asset URL (not inline base64/data URI).
 */
export function isStorageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('data:application/')) {
    return false;
  }
  // Cloudinary URLs, external HTTPS URLs, or official static catalog assets
  return (
    trimmed.startsWith('https://res.cloudinary.com/') ||
    trimmed.startsWith('http://res.cloudinary.com/') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://')
  );
}

/**
 * Uploads an image (File, Blob, or base64 data URI) to Cloudinary via the server-side API.
 * The server securely signs the request with CLOUDINARY_API_SECRET without exposing it to the client.
 * Returns a permanent, optimized HTTPS Cloudinary delivery URL.
 */
export async function uploadImageToStorage(
  imageSource: File | Blob | string,
  options: StorageUploadOptions = {}
): Promise<string> {
  const {
    folder = 'products',
    filename = 'prod',
    maxWidth = 1400,
    maxHeight = 1400,
    quality = 0.85,
  } = options;

  // 1. If it's already a persistent Cloudinary or external URL, do not re-upload
  if (typeof imageSource === 'string' && isStorageUrl(imageSource)) {
    return imageSource.trim();
  }

  // 2. Client-side optimization: Convert File/Blob/URL to optimized WebP data URI
  let optimizedDataUrl = '';

  if (imageSource instanceof File) {
    optimizedDataUrl = await optimizeImageFile(imageSource, {
      maxWidth,
      maxHeight,
      quality,
      enhance: true,
    });
  } else if (imageSource instanceof Blob) {
    const file = new File([imageSource], `${filename}.jpg`, { type: imageSource.type || 'image/jpeg' });
    optimizedDataUrl = await optimizeImageFile(file, {
      maxWidth,
      maxHeight,
      quality,
      enhance: true,
    });
  } else if (typeof imageSource === 'string') {
    const trimmed = imageSource.trim();

    // If it's an old local /uploads/... URL, attempt to fetch it for migration to Cloudinary
    if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
      try {
        const fetchRes = await fetch(trimmed);
        if (fetchRes.ok) {
          const blob = await fetchRes.blob();
          const file = new File([blob], `${filename}.webp`, { type: blob.type || 'image/webp' });
          optimizedDataUrl = await optimizeImageFile(file, { maxWidth, maxHeight, quality, enhance: true });
        } else {
          // If local file is unreadable, preserve string to prevent data loss
          console.warn('[ImageStorage] Could not fetch local file for migration:', trimmed);
          return trimmed;
        }
      } catch (e) {
        console.warn('[ImageStorage] Local image migration fetch failed:', e);
        return trimmed;
      }
    } else {
      optimizedDataUrl = trimmed;
    }
  } else {
    throw new Error('Unsupported image input format.');
  }

  if (!optimizedDataUrl || !optimizedDataUrl.startsWith('data:')) {
    throw new Error('Failed to generate optimized image payload for upload.');
  }

  const cleanPrefix = filename.replace(/[^a-zA-Z0-9_\-]/g, '').substring(0, 30) || 'prod';

  // 3. Acquire Firebase Auth ID token if administrator is signed in
  let idToken = '';
  try {
    if (auth?.currentUser) {
      idToken = await auth.currentUser.getIdToken();
    }
  } catch (authErr) {
    console.warn('[ImageStorage] Could not retrieve Firebase ID token:', authErr);
  }

  // 4. Send upload request to the secure server-side Cloudinary upload endpoint
  try {
    const response = await fetch('/api/cloudinary-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({
        image: optimizedDataUrl,
        folder,
        filename: cleanPrefix,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = result?.error || `Image upload failed (HTTP ${response.status}).`;
      console.error('[ImageStorage] Cloudinary upload endpoint error:', errorMsg);
      throw new Error(errorMsg);
    }

    if (result && result.url) {
      return result.url;
    }

    throw new Error('Upload server did not return a valid image URL.');
  } catch (uploadErr: any) {
    console.error('[ImageStorage] Cloudinary upload failed:', uploadErr);
    throw new Error(
      uploadErr?.message || 'Product image upload failed. Please check your internet connection or try again.'
    );
  }
}

/**
 * Ensures an image reference is converted to a lightweight Cloud Storage URL.
 * If already a URL, returns immediately. If a data URI or local path, uploads to Cloudinary.
 */
export async function ensureStorageUrl(
  img: string | undefined | null,
  folder = 'products'
): Promise<string> {
  if (!img) return '';
  if (isStorageUrl(img)) return img;
  return await uploadImageToStorage(img, { folder });
}

/**
 * Scans a product's images and variant images, converting any inline base64 data URIs
 * or legacy local files into uploaded Cloudinary URLs in parallel.
 * 
 * Guarantees that the returned product contains ZERO inline base64 image strings.
 */
export async function processProductImagesForStorage<T extends Record<string, any>>(
  product: T
): Promise<T> {
  if (!product) return product;
  const processed: any = { ...product };

  // 1. Process main product images array
  if (Array.isArray(processed.images) && processed.images.length > 0) {
    const uploadTasks = processed.images.map(async (img: string, idx: number) => {
      if (typeof img === 'string' && !isStorageUrl(img)) {
        return await uploadImageToStorage(img, {
          folder: 'products',
          filename: `main_${idx}`,
        });
      }
      return img;
    });
    processed.images = await Promise.all(uploadTasks);
  }

  // Also sync primary image field
  if (Array.isArray(processed.images) && processed.images.length > 0) {
    processed.image = processed.images[0];
  } else if (typeof processed.image === 'string' && !isStorageUrl(processed.image)) {
    processed.image = await uploadImageToStorage(processed.image, {
      folder: 'products',
      filename: 'primary',
    });
  }

  // 2. Process Open Graph / WhatsApp Preview image
  if (typeof processed.ogImage === 'string' && !isStorageUrl(processed.ogImage)) {
    processed.ogImage = await uploadImageToStorage(processed.ogImage, {
      folder: 'products/og',
      filename: 'og_preview',
    });
  }

  // 3. Process Product Variants color gallery images
  if (Array.isArray(processed.variants) && processed.variants.length > 0) {
    const variantTasks = processed.variants.map(async (variant: any, vIdx: number) => {
      if (Array.isArray(variant.images) && variant.images.length > 0) {
        const vUploadTasks = variant.images.map(async (vImg: string, imgIdx: number) => {
          if (typeof vImg === 'string' && !isStorageUrl(vImg)) {
            return await uploadImageToStorage(vImg, {
              folder: 'products/variants',
              filename: `var_${vIdx}_${imgIdx}`,
            });
          }
          return vImg;
        });
        const cleanVariantImages = await Promise.all(vUploadTasks);
        return {
          ...variant,
          images: cleanVariantImages,
        };
      }
      return variant;
    });

    processed.variants = await Promise.all(variantTasks);
  }

  return processed as T;
}
