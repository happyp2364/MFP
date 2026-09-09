import { Product } from '../types';
import { PUBLIC_SITE_URL, getPublicSiteUrl, sanitizePublicCustomerUrl } from './siteUrl';
export { PUBLIC_SITE_URL, getPublicSiteUrl, sanitizePublicCustomerUrl };

/**
 * Converts a string into a clean, URL-safe slug
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Ensures every product has a valid, unique Product ID (SKU).
 * Fallback format: MFP-{CATEGORY_LETTER}-{PRODUCT_ID_SHORT}
 */
export function getProductSKU(product: Product): string {
  if (product.sku && product.sku.trim()) {
    return product.sku.trim().toUpperCase();
  }
  const categoryCode = (product.category || 'M').charAt(0).toUpperCase();
  const cleanId = (product.id || '01').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `MFP-${categoryCode}-${cleanId}`;
}

/**
 * Ensures every product has a unique public URL slug.
 * Fallback: slugified name + clean ID
 */
export function getProductSlug(product: Product): string {
  if (product.slug && product.slug.trim()) {
    return slugify(product.slug);
  }
  const nameSlug = slugify(product.name || 'product');
  const cleanId = (product.id || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return nameSlug ? `${nameSlug}-${cleanId}` : cleanId || 'product';
}

/**
 * Constructs the canonical public URL for a product
 */
export function getProductUrl(product: Product, customOrigin?: string): string {
  const origin = getPublicSiteUrl(customOrigin);
  // Use product.slug if present, else product.id (Firebase Document ID), else getProductSlug
  const productIdOrSlug = product.slug?.trim() || product.id?.trim() || getProductSlug(product);
  return sanitizePublicCustomerUrl(`${origin}/product/${productIdOrSlug}`);
}

/**
 * Resolves a clean, public HTTPS URL for a product image.
 * CRITICAL REQUIREMENTS:
 * 1. First use the product's actual primary image from existing product data (product.images[0]).
 * 2. If it is a Firebase Storage or public HTTPS image, use that real public URL directly.
 * 3. If multiple product images exist, use the actual primary product image (index 0).
 * 4. NEVER replace a valid real product image with Unsplash or demo images.
 * 5. NEVER put base64 image data (e.g. data:image/...) or internal blobs into WhatsApp.
 * 6. If only internal base64/data image exists, proxies via the clean endpoint:
 *    /api/product-image/:id
 * 7. If a product genuinely has no image, returns null so the image line is omitted.
 */
export function getPublicProductImageUrl(
  product: Product,
  selectedVariantImage?: string,
  preferredOrigin: string = PUBLIC_SITE_URL
): string | null {
  if (!product) return null;

  const isSafePublicUrl = (url?: string | null): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed.startsWith('data:') || trimmed.includes(';base64,')) return false;
    if (trimmed.startsWith('blob:')) return false;
    return trimmed.startsWith('https://') || trimmed.startsWith('http://');
  };

  // 1. Check selected variant image if provided (color/variant specific real image)
  if (isSafePublicUrl(selectedVariantImage)) {
    return sanitizePublicCustomerUrl(selectedVariantImage!.trim());
  }

  // 2. Primary check: Product's actual primary image from existing product data/schema
  // (index 0 is authoritative primary photo in Firebase/schema)
  if (Array.isArray(product.images) && product.images.length > 0) {
    for (const img of product.images) {
      if (isSafePublicUrl(img)) {
        return sanitizePublicCustomerUrl(img.trim());
      }
      // If it's a relative path starting with /
      if (typeof img === 'string' && img.startsWith('/') && !img.startsWith('//')) {
        return sanitizePublicCustomerUrl(`${preferredOrigin}${img}`);
      }
    }
  }

  // 3. Check product's meta ogImage
  if (isSafePublicUrl(product.ogImage)) {
    return sanitizePublicCustomerUrl(product.ogImage!.trim());
  }

  // 4. If product has real image data that happens to be base64/data:image/,
  // proxy it through our server endpoint so WhatsApp receives a clean HTTPS URL
  const hasEmbeddedImageData = Boolean(
    (selectedVariantImage && selectedVariantImage.trim().length > 0) ||
    (Array.isArray(product.images) && product.images.some(img => typeof img === 'string' && img.trim().length > 0)) ||
    (product.ogImage && product.ogImage.trim().length > 0)
  );

  const productId = (product.id || '').trim();
  if (hasEmbeddedImageData && productId) {
    const origin = getPublicSiteUrl(preferredOrigin);
    return sanitizePublicCustomerUrl(`${origin}/api/product-image/${encodeURIComponent(productId)}`);
  }

  // 5. Product genuinely has no image -> return null (omit Product Image line)
  return null;
}

/**
 * Checks whether a customer value is real and non-placeholder.
 * Rejects "undefined", "null", "N/A", "Customer", "Valued Customer", "Address Provided", etc.
 */
export function isValidCustomerValue(val?: string | null): boolean {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  const invalidValues = [
    'undefined',
    'null',
    'n/a',
    'na',
    'customer',
    'valued customer',
    'whatsapp shopper',
    'whatsapp customer',
    'address provided',
    'will be confirmed on whatsapp',
    'none',
    '-'
  ];
  return !invalidValues.includes(lower);
}

/**
 * Strips HTML entities (such as &#x20;, &nbsp;, &amp;) and unwanted base64 blobs,
 * normalizing spaces, lines, and formatting for WhatsApp text.
 */
export function sanitizeWhatsAppText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/&#x20;/gi, ' ')
    .replace(/&#32;/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    // Remove accidental data:image or base64 strings
    .replace(/data:image\/[a-zA-Z+.-]+;base64,[A-Za-z0-9+/=]+/g, '')
    // Normalize old unpurchased domains to production Vercel domain
    .replace(/https?:\/\/(www\.)?marudharfashionpoint\.com/gi, PUBLIC_SITE_URL)
    .replace(/https?:\/\/(www\.)?marudharfashion\.com/gi, PUBLIC_SITE_URL)
    .replace(/(www\.)?marudharfashionpoint\.com/gi, PUBLIC_SITE_URL)
    .replace(/(www\.)?marudharfashion\.com/gi, PUBLIC_SITE_URL)
    // Normalize excessive multiple empty lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Matches a product by Firebase ID, slug, or SKU with full decoder support
 */
export function findProductBySlugOrId(products: Product[], targetSlugOrId: string): Product | undefined {
  if (!targetSlugOrId) return undefined;
  
  let cleanTarget = '';
  try {
    cleanTarget = decodeURIComponent(targetSlugOrId).trim().toLowerCase();
  } catch (e) {
    cleanTarget = targetSlugOrId.trim().toLowerCase();
  }

  // Strip leading slashes if any
  cleanTarget = cleanTarget.replace(/^\/+(products?\/)?/, '');

  return products.find((p) => {
    const id = (p.id || '').trim().toLowerCase();
    const slug = getProductSlug(p).toLowerCase();
    const sku = getProductSKU(p).toLowerCase();

    return (
      id === cleanTarget ||
      slug === cleanTarget ||
      sku === cleanTarget ||
      (id.length > 0 && cleanTarget.endsWith(id)) ||
      (slug.length > 0 && slug.endsWith(`-${cleanTarget}`)) ||
      (cleanTarget.length > 0 && cleanTarget.includes(id))
    );
  });
}
