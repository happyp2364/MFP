/**
 * Centralized Site URL & Public Domain Configuration
 * 
 * Official Production Domain:
 * https://marudhar-fashion-point-1.vercel.app
 */

export const PUBLIC_SITE_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PUBLIC_SITE_URL)
    ? String(import.meta.env.VITE_PUBLIC_SITE_URL).trim().replace(/\/$/, '')
    : 'https://marudhar-fashion-point-1.vercel.app'
) || 'https://marudhar-fashion-point-1.vercel.app';

/**
 * Returns the sanitized public origin for customer-facing links.
 * Normalizes old unpurchased domains (marudharfashionpoint.com) and local/preview origins
 * to ensure customer links on WhatsApp or SMS open reliably.
 */
export function getPublicSiteUrl(customOrigin?: string): string {
  if (customOrigin && typeof customOrigin === 'string') {
    const trimmed = customOrigin.trim().replace(/\/$/, '');
    if (
      trimmed.includes('marudharfashionpoint.com') ||
      trimmed.includes('marudharfashion.com') ||
      trimmed.includes('localhost') ||
      trimmed.includes('127.0.0.1') ||
      trimmed.includes('0.0.0.0')
    ) {
      return PUBLIC_SITE_URL;
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
  }

  // If in browser context
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin.trim().replace(/\/$/, '');
    // If the browser origin is localhost or the unresolvable custom domain, fallback to Vercel
    if (
      origin.includes('marudharfashionpoint.com') ||
      origin.includes('marudharfashion.com') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('0.0.0.0')
    ) {
      return PUBLIC_SITE_URL;
    }
    // If on vercel.app or any valid public origin
    if (origin.startsWith('https://') || origin.startsWith('http://')) {
      return origin;
    }
  }

  return PUBLIC_SITE_URL;
}

/**
 * Generates an absolute public URL for an order payment page (/pay/:orderId)
 */
export function getPublicOrderPaymentUrl(orderId: string, customOrigin?: string): string {
  const cleanId = (orderId || '').replace(/^#/, '').trim();
  const base = getPublicSiteUrl(customOrigin);
  return `${base}/pay/${encodeURIComponent(cleanId)}`;
}

/**
 * Sanitizes any URL intended for customers, preventing dead .com links or localhost
 */
export function sanitizePublicCustomerUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') {
    return PUBLIC_SITE_URL;
  }
  let clean = url.trim();
  
  // Replace old domain variations (with or without protocol)
  clean = clean.replace(/https?:\/\/(www\.)?marudharfashionpoint\.com/gi, PUBLIC_SITE_URL);
  clean = clean.replace(/https?:\/\/(www\.)?marudharfashion\.com/gi, PUBLIC_SITE_URL);
  clean = clean.replace(/(www\.)?marudharfashionpoint\.com/gi, PUBLIC_SITE_URL);
  clean = clean.replace(/(www\.)?marudharfashion\.com/gi, PUBLIC_SITE_URL);
  
  // Replace local dev URLs
  clean = clean.replace(/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/gi, PUBLIC_SITE_URL);
  clean = clean.replace(/^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/gi, PUBLIC_SITE_URL);

  // Fix any duplicate protocol prefixes
  clean = clean.replace(/^https?:\/\/https?:\/\//i, 'https://');
  
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `${PUBLIC_SITE_URL}${clean.startsWith('/') ? '' : '/'}${clean}`;
  }
  
  return clean;
}

