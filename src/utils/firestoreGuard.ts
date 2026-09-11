/**
 * Firestore Document Size & Architecture Guard
 * 
 * Enforces the strict rule:
 * NO PRODUCT FIRESTORE WRITE MAY CONTAIN INLINE BASE64/BINARY IMAGE DATA.
 * 
 * Firestore has a hard limit of 1,048,576 bytes (1 MiB) per document.
 * This guard ensures documents are well below this ceiling and never contain
 * embedded image binaries.
 */

export const FIRESTORE_DOCUMENT_LIMIT_BYTES = 1048576; // 1 MiB
export const SAFE_PRODUCT_DOCUMENT_LIMIT_BYTES = 512000; // 500 KiB safe ceiling

/**
 * Accurately estimates UTF-8 byte size of any serialized JavaScript object/document.
 */
export function estimateDocumentSize(data: any): number {
  if (data === null || data === undefined) return 0;
  try {
    const jsonString = JSON.stringify(data);
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(jsonString).length;
    }
    // Fallback for older JS engines
    return unescape(encodeURIComponent(jsonString)).length;
  } catch (err) {
    console.warn('[Firestore Guard] Failed to serialize for size estimation:', err);
    return 0;
  }
}

/**
 * Deeply scans an object or array to check if any field contains an inline base64 / data URI image.
 */
export function findInlineImageData(
  obj: any,
  currentPath = ''
): { found: boolean; path: string; preview: string; byteLength: number } | null {
  if (!obj) return null;

  if (typeof obj === 'string') {
    const trimmed = obj.trim();
    // Detect data URI image scheme
    if (trimmed.startsWith('data:image/') || trimmed.startsWith('data:application/')) {
      return {
        found: true,
        path: currentPath || 'root',
        preview: trimmed.substring(0, 40) + '...',
        byteLength: trimmed.length,
      };
    }
    // Detect raw base64 string without data prefix that exceeds 1024 chars
    if (
      trimmed.length > 1024 &&
      !trimmed.startsWith('http://') &&
      !trimmed.startsWith('https://') &&
      !trimmed.startsWith('/') &&
      /^[A-Za-z0-9+/=]{100,}/.test(trimmed)
    ) {
      return {
        found: true,
        path: currentPath || 'root',
        preview: trimmed.substring(0, 40) + '...',
        byteLength: trimmed.length,
      };
    }
    return null;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const result = findInlineImageData(obj[i], `${currentPath}[${i}]`);
      if (result) return result;
    }
    return null;
  }

  if (typeof obj === 'object') {
    for (const [key, val] of Object.entries(obj)) {
      const fieldPath = currentPath ? `${currentPath}.${key}` : key;
      const result = findInlineImageData(val, fieldPath);
      if (result) return result;
    }
    return null;
  }

  return null;
}

/**
 * Asserts that a product payload is lightweight and safe for Firestore persistence.
 * Throws a clear descriptive error if validation fails.
 */
export function assertSafeFirestoreProduct(product: any): void {
  if (!product) {
    throw new Error('Cannot save empty product document to Firestore.');
  }

  // 1. Invariant Check: No inline base64 or data URI image data
  const inlineCheck = findInlineImageData(product);
  if (inlineCheck) {
    console.error('[Firestore Guard] Prohibited inline image found:', inlineCheck);
    throw new Error(
      `Product could not be saved because inline image data was detected at "${inlineCheck.path}". ` +
      `Product documents must only contain lightweight cloud storage URLs, not raw image data.`
    );
  }

  // 2. Document Size Check: Conservative threshold well below 1 MiB
  const docBytes = estimateDocumentSize(product);
  if (docBytes > SAFE_PRODUCT_DOCUMENT_LIMIT_BYTES) {
    const sizeKb = Math.round(docBytes / 1024);
    const limitKb = Math.round(SAFE_PRODUCT_DOCUMENT_LIMIT_BYTES / 1024);
    console.error(`[Firestore Guard] Document size ${sizeKb} KB exceeds safe threshold of ${limitKb} KB.`);
    throw new Error(
      `Product data is too large to save (${sizeKb} KB exceeds ${limitKb} KB safe limit). ` +
      `Images must be stored separately from product data.`
    );
  }
}

/**
 * Strips any stray base64 data URIs from a product object, replacing them with a safe fallback URL.
 * Useful for normalizing legacy data loaded from cache or Firestore.
 */
export function sanitizeProductImageUrls<T extends Record<string, any>>(product: T): T {
  if (!product) return product;
  const clone = JSON.parse(JSON.stringify(product));

  const fallback = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80';

  if (Array.isArray(clone.images)) {
    clone.images = clone.images.map((img: any) => {
      if (typeof img === 'string' && (img.startsWith('data:image/') || img.length > 2000)) {
        return fallback;
      }
      return img;
    });
  }

  if (typeof clone.ogImage === 'string' && (clone.ogImage.startsWith('data:image/') || clone.ogImage.length > 2000)) {
    clone.ogImage = clone.images?.[0] || fallback;
  }

  if (Array.isArray(clone.variants)) {
    clone.variants = clone.variants.map((variant: any) => {
      if (Array.isArray(variant.images)) {
        variant.images = variant.images.map((img: any) => {
          if (typeof img === 'string' && (img.startsWith('data:image/') || img.length > 2000)) {
            return fallback;
          }
          return img;
        });
      }
      return variant;
    });
  }

  return clone;
}
