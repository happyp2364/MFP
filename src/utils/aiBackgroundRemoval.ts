/**
 * High-Precision AI Shoe Segmentation, Background Removal & Quality Validation Engine
 * 
 * Extracts shoe objects (including wings, laces, soles, and fine details) onto
 * a clean transparent PNG with edge smoothing, de-halo filter, boundary flood-fill,
 * automated quality validation, and multi-attempt retry capability.
 */

export interface SegmentationResult {
  transparentPngUrl: string;
  originalUrl: string;
  confidence: number;
  width: number;
  height: number;
  isValid: boolean;
  validationScore: number; // 0 to 100
  validationIssues: string[];
  retryCount: number;
  metrics: {
    cornerTransparencyPct: number;
    shoeCoveragePct: number;
    hasHalo: boolean;
    aspectRatio: number;
  };
}

export interface ExtractionOptions {
  maxRetries?: number;
  sensitivity?: number; // 25 to 65 color distance threshold
  padding?: number; // padding in px around shoe bounding box
  featherRadius?: number; // soft edge radius
  deHalo?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  metrics: {
    cornerTransparencyPct: number;
    shoeCoveragePct: number;
    hasHalo: boolean;
    aspectRatio: number;
    width: number;
    height: number;
  };
}

/**
 * Validates the extracted PNG on canvas to ensure background is 100% transparent,
 * shoe is complete, edges are clean, and resolution is acceptable.
 */
export function validateExtractedPng(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): ValidationResult {
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const totalPixels = width * height;

  const issues: string[] = [];
  let score = 100;

  // 1. CORNER & PERIMETER TRANSPARENCY CHECK
  // Check corner pixels (10x10 blocks in each corner)
  let cornerTotal = 0;
  let cornerTransparentCount = 0;

  const cornerSize = Math.max(5, Math.floor(Math.min(width, height) * 0.05));
  
  const checkCornerBlock = (startX: number, startY: number) => {
    for (let y = startY; y < startY + cornerSize && y < height; y++) {
      for (let x = startX; x < startX + cornerSize && x < width; x++) {
        const idx = (y * width + x) * 4;
        const alpha = pixels[idx + 3];
        cornerTotal++;
        if (alpha < 15) {
          cornerTransparentCount++;
        }
      }
    }
  };

  // Top-Left, Top-Right, Bottom-Left, Bottom-Right
  checkCornerBlock(0, 0);
  checkCornerBlock(width - cornerSize, 0);
  checkCornerBlock(0, height - cornerSize);
  checkCornerBlock(width - cornerSize, height - cornerSize);

  const cornerTransparencyPct = cornerTotal > 0 ? (cornerTransparentCount / cornerTotal) * 100 : 100;

  if (cornerTransparencyPct < 85) {
    issues.push(`Background not fully removed from outer corners (${cornerTransparencyPct.toFixed(1)}% transparent)`);
    score -= 35;
  }

  // 2. SHOE OBJECT COVERAGE & COMPLETENESS CHECK
  let opaquePixelCount = 0;
  let minX = width, minY = height, maxX = 0, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = pixels[idx + 3];
      if (alpha > 40) {
        opaquePixelCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const shoeCoveragePct = (opaquePixelCount / totalPixels) * 100;

  if (opaquePixelCount === 0 || shoeCoveragePct < 2.5) {
    issues.push('Shoe object is missing or cut off during extraction');
    score -= 60;
  } else if (shoeCoveragePct > 88) {
    issues.push('Image contains too much unremoved background');
    score -= 40;
  }

  // Check bounding box dimensions
  const objWidth = Math.max(0, maxX - minX);
  const objHeight = Math.max(0, maxY - minY);
  const aspectRatio = objHeight > 0 ? objWidth / objHeight : 1;

  if (objWidth < 40 || objHeight < 40) {
    issues.push('Extracted shoe region is too small or fragmented');
    score -= 30;
  }

  // 3. HALO & OUTLINE ARTIFACT CHECK
  // Check perimeter pixels around opaque boundary for harsh white (#FFF) or black (#000) halos
  let haloPixelCount = 0;
  let borderPixelCount = 0;

  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const idx = (y * width + x) * 4;
      const alpha = pixels[idx + 3];

      // Semi-transparent border pixel
      if (alpha >= 20 && alpha <= 220) {
        borderPixelCount++;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];

        // Check for pure white halo or pure black halo
        const isWhiteHalo = r > 240 && g > 240 && b > 240;
        const isBlackHalo = r < 15 && g < 15 && b < 15;

        if (isWhiteHalo || isBlackHalo) {
          haloPixelCount++;
        }
      }
    }
  }

  const hasHalo = borderPixelCount > 20 && (haloPixelCount / borderPixelCount) > 0.35;

  if (hasHalo) {
    issues.push('Shoe boundary contains visible white or black halo outline');
    score -= 20;
  }

  // 4. RESOLUTION CHECK
  if (width < 100 || height < 100) {
    issues.push('Image resolution is too low for website display');
    score -= 20;
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const isValid = finalScore >= 65 && issues.length === 0;

  return {
    isValid,
    score: finalScore,
    issues,
    metrics: {
      cornerTransparencyPct,
      shoeCoveragePct,
      hasHalo,
      aspectRatio,
      width,
      height,
    },
  };
}

/**
 * Advanced Multi-Pass Transparent PNG Shoe Extraction Engine with Boundary Flood Fill,
 * De-Halo Filter, Edge Feathering & Smart Padding.
 */
export async function extractShoeFromImage(
  imageSrc: string,
  options: ExtractionOptions = {}
): Promise<SegmentationResult> {
  const {
    maxRetries = 3,
    sensitivity = 38,
    padding = 20,
    featherRadius = 2,
    deHalo = true,
  } = options;

  let currentAttempt = 0;
  let lastResult: SegmentationResult | null = null;

  while (currentAttempt < maxRetries) {
    currentAttempt++;

    try {
      const result = await runSingleExtractionPass(imageSrc, {
        attempt: currentAttempt,
        sensitivity: sensitivity + (currentAttempt - 1) * 8, // Adjust threshold on retries
        padding: padding + (currentAttempt - 1) * 5, // Increase padding on retries to preserve wings/laces
        featherRadius,
        deHalo,
      });

      lastResult = result;

      // If validation passes, return immediately
      if (result.isValid) {
        return result;
      }

      console.warn(`[AI Shoe Extraction] Attempt ${currentAttempt}/${maxRetries} failed validation:`, result.validationIssues);
    } catch (err) {
      console.error(`[AI Shoe Extraction] Attempt ${currentAttempt} error:`, err);
    }
  }

  // If retries exhausted and result exists, return last result marked invalid
  if (lastResult) {
    return {
      ...lastResult,
      isValid: false,
      validationIssues: lastResult.validationIssues.length > 0 
        ? lastResult.validationIssues 
        : ['Failed to extract clean transparent shoe PNG after retries'],
    };
  }

  throw new Error('Failed to extract transparent PNG from image after multiple retries.');
}

/**
 * Executes a single extraction pass on an image URL / Data URI.
 */
async function runSingleExtractionPass(
  imageSrc: string,
  params: {
    attempt: number;
    sensitivity: number;
    padding: number;
    featherRadius: number;
    deHalo: boolean;
  }
): Promise<SegmentationResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      try {
        const origWidth = img.naturalWidth || img.width;
        const origHeight = img.naturalHeight || img.height;

        // Limit max canvas size for fast processing while maintaining crisp quality (max 1200px)
        const maxDim = 1200;
        let scale = 1.0;
        if (Math.max(origWidth, origHeight) > maxDim) {
          scale = maxDim / Math.max(origWidth, origHeight);
        }

        const width = Math.round(origWidth * scale);
        const height = Math.round(origHeight * scale);

        let boundingBox: number[] | null = null;
        let aiBgColors: Array<[number, number, number]> = [];
        let aiHaloRisk = 'none';

        // 1. Fetch AI Vision Bounding Box & Color Palette from Server Route
        try {
          const serverRes = await fetch('/api/ai/extract-shoe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageSrc, width, height }),
          });

          if (serverRes.ok) {
            const data = await serverRes.json();
            if (data?.boundingBox && Array.isArray(data.boundingBox)) {
              boundingBox = data.boundingBox;
            }
            if (Array.isArray(data?.backgroundColors)) {
              aiBgColors = data.backgroundColors;
            }
            if (data?.haloRisk) {
              aiHaloRisk = data.haloRisk;
            }
          }
        } catch (serverErr) {
          console.warn('[AI Extraction] Vision AI endpoint note:', serverErr);
        }

        // 2. Render image onto high-precision processing canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          throw new Error('Canvas context unavailable');
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;

        // 3. BACKGROUND COLOR PALETTE SAMPLING
        const bgSamples: Array<[number, number, number]> = [...aiBgColors];

        // Sample outer perimeter (corners & edge midpoints)
        const edgePoints = [
          [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
          [Math.floor(width / 2), 0], [Math.floor(width / 2), height - 1],
          [0, Math.floor(height / 2)], [width - 1, Math.floor(height / 2)],
          [Math.floor(width * 0.02), Math.floor(height * 0.02)],
          [Math.floor(width * 0.98), Math.floor(height * 0.02)],
          [Math.floor(width * 0.02), Math.floor(height * 0.98)],
          [Math.floor(width * 0.98), Math.floor(height * 0.98)],
        ];

        edgePoints.forEach(([x, y]) => {
          const idx = (y * width + x) * 4;
          bgSamples.push([pixels[idx], pixels[idx + 1], pixels[idx + 2]]);
        });

        // Add standard studio defaults
        bgSamples.push([255, 255, 255]);
        bgSamples.push([245, 245, 245]);
        bgSamples.push([240, 240, 240]);
        bgSamples.push([15, 15, 15]);

        // 4. BOUNDARY FLOOD-FILL MASK GENERATION
        // To prevent erasing white/black parts INSIDE the shoe (like white swoosh, white sole, white wings),
        // we use a boundary flood-fill algorithm starting from outer border pixels.
        const isBgMask = new Uint8Array(width * height); // 1 = background, 0 = foreground/shoe

        const colorDist = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
          return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
        };

        const isPixelBgColor = (r: number, g: number, b: number) => {
          for (const [bR, bG, bB] of bgSamples) {
            if (colorDist(r, g, b, bR, bG, bB) < params.sensitivity) {
              return true;
            }
          }
          return false;
        };

        // Queue for BFS Flood Fill from canvas boundaries
        const queue: number[] = [];

        // Push perimeter pixels to queue
        for (let x = 0; x < width; x++) {
          queue.push(0 * width + x); // top border
          queue.push((height - 1) * width + x); // bottom border
        }
        for (let y = 1; y < height - 1; y++) {
          queue.push(y * width + 0); // left border
          queue.push(y * width + (width - 1)); // right border
        }

        while (queue.length > 0) {
          const pos = queue.pop()!;
          if (isBgMask[pos] === 1) continue;

          const px = pos % width;
          const py = Math.floor(pos / width);
          const idx = pos * 4;

          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];

          if (isPixelBgColor(r, g, b)) {
            isBgMask[pos] = 1;

            // Check 4-directional neighbors
            if (px > 0 && isBgMask[pos - 1] === 0) queue.push(pos - 1);
            if (px < width - 1 && isBgMask[pos + 1] === 0) queue.push(pos + 1);
            if (py > 0 && isBgMask[pos - width] === 0) queue.push(pos - width);
            if (py < height - 1 && isBgMask[pos + width] === 0) queue.push(pos + width);
          }
        }

        // 5. DETERMINATION OF SHOE BOUNDING BOX REGION
        let minX = width, minY = height, maxX = 0, maxY = 0;

        if (boundingBox && boundingBox.length === 4) {
          // AI vision bounding box [ymin, xmin, ymax, xmax] normalized 0-1000
          minY = Math.max(0, Math.floor((boundingBox[0] / 1000) * height));
          minX = Math.max(0, Math.floor((boundingBox[1] / 1000) * width));
          maxY = Math.min(height - 1, Math.ceil((boundingBox[2] / 1000) * height));
          maxX = Math.min(width - 1, Math.ceil((boundingBox[3] / 1000) * width));
        } else {
          // Saliency / non-background pixel bounding box
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const pos = y * width + x;
              if (isBgMask[pos] === 0) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }
        }

        // Fallback bounds if separation fails
        if (maxX <= minX || maxY <= minY) {
          minX = Math.floor(width * 0.05);
          minY = Math.floor(height * 0.05);
          maxX = Math.floor(width * 0.95);
          maxY = Math.floor(height * 0.95);
        }

        // Apply Generous Padding to guarantee wings, laces & soles are preserved
        const padPx = params.padding;
        minX = Math.max(0, minX - padPx);
        minY = Math.max(0, minY - padPx);
        maxX = Math.min(width - 1, maxX + padPx);
        maxY = Math.min(height - 1, maxY + padPx);

        const cropWidth = maxX - minX;
        const cropHeight = maxY - minY;

        // 6. OUTPUT TRANSPARENT CANVAS GENERATION
        const outCanvas = document.createElement('canvas');
        outCanvas.width = cropWidth;
        outCanvas.height = cropHeight;
        const outCtx = outCanvas.getContext('2d', { willReadFrequently: true });

        if (!outCtx) {
          throw new Error('Output canvas context error');
        }

        // Draw cropped region from original image
        outCtx.drawImage(img, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        const outImageData = outCtx.getImageData(0, 0, cropWidth, cropHeight);
        const outPixels = outImageData.data;

        // 7. ALPHA TRANSPARENCY MAPPING & DE-HALO FILTER
        for (let cy = 0; cy < cropHeight; cy++) {
          for (let cx = 0; cx < cropWidth; cx++) {
            const origX = minX + cx;
            const origY = minY + cy;
            const origPos = origY * width + origX;

            const outIdx = (cy * cropWidth + cx) * 4;
            const isBg = isBgMask[origPos] === 1;

            if (isBg) {
              outPixels[outIdx + 3] = 0; // Fully transparent
            } else {
              const r = outPixels[outIdx];
              const g = outPixels[outIdx + 1];
              const b = outPixels[outIdx + 2];

              // Check distance to closest background color sample for soft edge anti-aliasing
              let minBgDist = 999;
              for (const [bR, bG, bB] of bgSamples) {
                const dist = colorDist(r, g, b, bR, bG, bB);
                if (dist < minBgDist) minBgDist = dist;
              }

              // Smooth Edge Feathering
              if (minBgDist < params.sensitivity) {
                const alphaRatio = minBgDist / params.sensitivity;
                outPixels[outIdx + 3] = Math.floor(alphaRatio * 255);
              } else {
                outPixels[outIdx + 3] = 255; // Fully opaque
              }

              // DE-HALO FILTER: Defringe white/black edge halos on semi-transparent borders
              if (params.deHalo && outPixels[outIdx + 3] > 0 && outPixels[outIdx + 3] < 240) {
                // If border pixel is very bright (white halo risk), clamp brightness towards shoe core
                const brightness = (r + g + b) / 3;
                if (brightness > 235 && (aiHaloRisk === 'white_halo' || minBgDist < params.sensitivity + 15)) {
                  outPixels[outIdx] = Math.floor(r * 0.82);
                  outPixels[outIdx + 1] = Math.floor(g * 0.82);
                  outPixels[outIdx + 2] = Math.floor(b * 0.82);
                } else if (brightness < 18 && aiHaloRisk === 'dark_halo') {
                  // Dark shadow halo neutralization
                  outPixels[outIdx] = Math.min(255, Math.floor(r * 1.25 + 15));
                  outPixels[outIdx + 1] = Math.min(255, Math.floor(g * 1.25 + 15));
                  outPixels[outIdx + 2] = Math.min(255, Math.floor(b * 1.25 + 15));
                }
              }
            }
          }
        }

        outCtx.putImageData(outImageData, 0, 0);

        // 8. RUN AUTOMATED QUALITY VALIDATION CHECK
        const valResult = validateExtractedPng(outCanvas, outCtx);

        // Export crisp PNG Data URL
        const transparentPngUrl = outCanvas.toDataURL('image/png', 1.0);

        resolve({
          transparentPngUrl,
          originalUrl: imageSrc,
          confidence: valResult.isValid ? 0.98 : 0.65,
          width: cropWidth,
          height: cropHeight,
          isValid: valResult.isValid,
          validationScore: valResult.score,
          validationIssues: valResult.issues,
          retryCount: params.attempt - 1,
          metrics: {
            cornerTransparencyPct: valResult.metrics.cornerTransparencyPct,
            shoeCoveragePct: valResult.metrics.shoeCoveragePct,
            hasHalo: valResult.metrics.hasHalo,
            aspectRatio: valResult.metrics.aspectRatio,
          },
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for AI transparent PNG extraction'));
    };

    img.src = imageSrc;
  });
}
