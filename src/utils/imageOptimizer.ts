/**
 * Image Processing & Canvas Optimization Utility
 * Handles client-side compression, image enhancement (contrast, brightness, sharpness),
 * and clean "Image Coming Soon" SVG placeholders without showing stock/fake products.
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  enhance?: boolean;
}

/**
 * Optimizes an uploaded File (from input or camera) using HTML5 Canvas.
 * Resizes, enhances visual contrast & brightness subtly without altering product details,
 * and compresses to lightweight WebP/JPEG data URL for fast Firestore & mobile rendering.
 */
export async function optimizeImageFile(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.85, enhance = true } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Calculate target aspect ratio dimensions
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            // Fallback if canvas 2D context isn't available
            resolve(e.target?.result as string);
            return;
          }

          // High quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Optional subtle CSS filter enhancement on Canvas context prior to drawing
          if (enhance) {
            // Contrast +4%, Brightness +2%, Saturation +5% for crisp, professional appearance
            ctx.filter = 'contrast(104%) brightness(102%) saturate(105%)';
          }

          // Draw the original real product image onto canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Reset filter
          ctx.filter = 'none';

          // Export as optimized WebP if browser supported, else JPEG
          let optimizedDataUrl = '';
          try {
            optimizedDataUrl = canvas.toDataURL('image/webp', quality);
            if (!optimizedDataUrl.startsWith('data:image/webp')) {
              optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
            }
          } catch {
            optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(optimizedDataUrl);
        } catch (err) {
          console.warn('Canvas optimization error, returning raw file result:', err);
          resolve(e.target?.result as string);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image file for processing.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validates whether an image URL is accessible and non-broken
 */
export function checkImageAccessible(url: string): Promise<boolean> {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Clean SVG Placeholder Data URI - Displays a neutral badge saying "Real Image Coming Soon"
 * strictly avoiding fake stock photos or misleading shoe pictures.
 */
export const CLEAN_IMAGE_COMING_SOON_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23F3F4F6"/><rect x="2" y="2" width="596" height="596" rx="24" stroke="%23E5E7EB" stroke-width="4" stroke-dasharray="8 8"/><circle cx="300" cy="240" r="56" fill="%230B8F63" fill-opacity="0.1"/><path d="M280 220H320M300 200V240M270 255L285 240L300 255L315 240L330 255" stroke="%230B8F63" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><rect x="180" y="320" width="240" height="32" rx="16" fill="%230B8F63"/><text x="300" y="341" fill="white" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="1">REAL PRODUCT IMAGE COMING SOON</text><text x="300" y="390" fill="%236B7280" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Store Product Catalog</text><text x="300" y="415" fill="%239CA3AF" font-family="sans-serif" font-size="11" text-anchor="middle">Authentic In-Store Inventory</text></svg>`;
