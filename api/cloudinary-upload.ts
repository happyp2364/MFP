import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Allowed MIME types for footwear & catalog images
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB limit

// Firebase public web API key used for server-side ID token verification
const FIREBASE_WEB_API_KEY = 'AIzaSyAb77CaagNScI4jcImWZEEg7tQ2chU8YH0';

/**
 * Validates whether the request comes from an authenticated administrator.
 */
async function verifyAdminAuth(req: any): Promise<{ authorized: boolean; email?: string; error?: string }> {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  const authHeader = req.headers?.authorization || req.headers?.Authorization;

  // In non-production local development without auth header, permit for developer testing
  if (!isProduction && !authHeader) {
    return { authorized: true, email: 'local-dev@marudharfashion.internal' };
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Missing or invalid Authorization header. Admin sign-in is required.' };
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return { authorized: false, error: 'Empty Bearer token.' };
  }

  // Verify Firebase ID Token via Google Identity Toolkit lookup
  try {
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      }
    );

    if (!verifyRes.ok) {
      const errBody: any = await verifyRes.json().catch(() => ({}));
      return {
        authorized: false,
        error: errBody?.error?.message || 'Administrator authentication expired or invalid. Please re-login.',
      };
    }

    const userData: any = await verifyRes.json();
    const user = userData.users?.[0];
    if (!user) {
      return { authorized: false, error: 'User associated with token not found.' };
    }

    return { authorized: true, email: user.email };
  } catch (err: any) {
    // If network to Google Identity fails in local development, permit with fallback
    if (!isProduction) {
      console.warn('[Cloudinary Auth] Dev fallback: token verification bypassed due to local network state.');
      return { authorized: true, email: 'dev-fallback@marudharfashion.internal' };
    }
    return { authorized: false, error: 'Failed to verify admin credentials with authentication service.' };
  }
}

/**
 * Vercel Serverless Function & Express Route Handler
 * Enterprise Cloudinary Persistent Image Upload
 */
export default async function handler(req: any, res: any) {
  // Enforce HTTP POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // 1. Verify administrator authentication
    const authResult = await verifyAdminAuth(req);
    if (!authResult.authorized) {
      return res.status(401).json({ error: authResult.error || 'Unauthorized: Admin access required.' });
    }

    // 2. Parse request payload
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Invalid JSON request body.' });
      }
    }
    body = body || {};

    const { image, folder, filename } = body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'No image data provided. An image data URI or base64 string is required.' });
    }

    // 3. Inspect and validate image format and size
    let mimeType = 'image/webp';
    let rawBase64 = image;
    let dataUri = image;

    if (image.startsWith('data:')) {
      const match = image.match(/^data:([a-zA-Z0-9\/\+\.\-]+);base64,(.+)$/);
      if (!match || !match[1] || !match[2]) {
        return res.status(400).json({ error: 'Malformed image data URI format.' });
      }
      mimeType = match[1].toLowerCase();
      rawBase64 = match[2];
    } else {
      // Raw base64 string
      dataUri = `data:${mimeType};base64,${rawBase64}`;
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return res.status(400).json({
        error: `Unsupported image MIME type: "${mimeType}". Allowed types: JPEG, PNG, WebP, GIF, SVG.`,
      });
    }

    // Estimate payload size from base64
    const approxByteSize = Math.round((rawBase64.length * 3) / 4);
    if (approxByteSize > MAX_IMAGE_BYTES) {
      return res.status(400).json({
        error: `Image exceeds maximum allowed size of 15 MB. Uploaded size is ~${(approxByteSize / (1024 * 1024)).toFixed(1)} MB.`,
      });
    }

    // 4. Sanitize folder and public ID
    // Use consistent clean folder structure: marudhar-fashion-point/products[/subfolder]
    let targetFolder = 'marudhar-fashion-point/products';
    if (folder && typeof folder === 'string') {
      const cleanSub = folder
        .replace(/[^a-zA-Z0-9_\-\/]/g, '')
        .replace(/\.\./g, '')
        .replace(/^\/+|\/+$/g, '');
      if (cleanSub && cleanSub !== 'products') {
        targetFolder = `marudhar-fashion-point/products/${cleanSub}`;
      }
    }

    const cleanFilename = (filename && typeof filename === 'string')
      ? filename.replace(/[^a-zA-Z0-9_\-]/g, '').substring(0, 30)
      : 'prod';
    const uniquePublicId = `${cleanFilename}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    // 5. Check Cloudinary Environment Variables
    const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
    const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
    const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

    // If Cloudinary keys are missing in production: strictly fail with clear action
    if (!cloudName || !apiKey || !apiSecret) {
      if (isProduction) {
        return res.status(503).json({
          error: 'Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing from production environment variables. Please configure them in Vercel.',
        });
      }

      // Local container development fallback (only when keys are not configured in local preview)
      console.warn('[Cloudinary Upload] Cloudinary keys not found in local environment. Using local development fallback.');
      try {
        const uploadsBaseDir = path.join(process.cwd(), 'public', 'uploads', 'products');
        if (!fs.existsSync(uploadsBaseDir)) {
          fs.mkdirSync(uploadsBaseDir, { recursive: true });
        }
        const localFileName = `${uniquePublicId}.webp`;
        const localFilePath = path.join(uploadsBaseDir, localFileName);
        const buffer = Buffer.from(rawBase64, 'base64');
        await fs.promises.writeFile(localFilePath, buffer);

        return res.status(200).json({
          success: true,
          url: `/uploads/products/${localFileName}`,
          public_id: uniquePublicId,
          format: 'webp',
          bytes: buffer.length,
          isDevFallback: true,
          warning: 'Stored locally in dev container. Configure Cloudinary credentials for permanent cloud persistence.',
        });
      } catch (localErr: any) {
        return res.status(500).json({ error: localErr?.message || 'Failed to save image in local dev fallback.' });
      }
    }

    // 6. Generate Cloudinary Signature
    // Cloudinary requires signing sorted parameters: folder, public_id, timestamp
    const timestamp = Math.floor(Date.now() / 1000);
    const signParams: Record<string, string> = {
      folder: targetFolder,
      public_id: uniquePublicId,
      timestamp: timestamp.toString(),
    };

    const sortedKeys = Object.keys(signParams).sort();
    const stringToSign = sortedKeys.map((k) => `${k}=${signParams[k]}`).join('&') + apiSecret;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    // 7. Execute upload to Cloudinary REST API
    const uploadPayload = {
      file: dataUri,
      api_key: apiKey,
      timestamp,
      folder: targetFolder,
      public_id: uniquePublicId,
      signature,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadPayload),
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    const cloudData: any = await cloudRes.json().catch(() => ({}));

    if (!cloudRes.ok) {
      const errMsg = cloudData?.error?.message || `Cloudinary upload failed with HTTP status ${cloudRes.status}`;
      console.error('[Cloudinary Upload] API error from Cloudinary:', errMsg);
      return res.status(cloudRes.status >= 400 && cloudRes.status < 600 ? cloudRes.status : 502).json({
        error: `Cloudinary error: ${errMsg}`,
      });
    }

    // 8. Derive optimized CDN delivery URL (f_auto,q_auto)
    // Cloudinary dynamic transformation automatically serves AVIF/WebP and optimizes quality
    const secureUrl: string = cloudData.secure_url || cloudData.url;
    let optimizedUrl = secureUrl;
    if (secureUrl.includes('/image/upload/')) {
      optimizedUrl = secureUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
    }

    return res.status(200).json({
      success: true,
      url: optimizedUrl,
      raw_url: secureUrl,
      public_id: cloudData.public_id,
      format: cloudData.format || 'webp',
      bytes: cloudData.bytes,
      width: cloudData.width,
      height: cloudData.height,
    });
  } catch (error: any) {
    console.error('[Cloudinary Upload] Unexpected error:', error);
    const isTimeout = error.name === 'AbortError';
    return res.status(500).json({
      error: isTimeout
        ? 'Image upload to Cloudinary timed out. Please check your internet connection or use a smaller image.'
        : (error?.message || 'Internal server error while processing image upload.'),
    });
  }
}
