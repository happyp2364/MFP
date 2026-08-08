/**
 * Enterprise Security Utility
 * Platform Security Hardening Suite
 */

// 1. XSS & Input Sanitization
export const sanitizeString = (input: string | null | undefined, maxLength: number = 1000): string => {
  if (!input) return '';
  
  // Trim and cap length
  let cleaned = String(input).trim().slice(0, maxLength);
  
  // Strip malicious script/style/iframe/object tags & event handlers
  cleaned = cleaned
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
    
  return cleaned;
};

export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  const clean = sanitizeString(email, 120).toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(clean) ? clean : '';
};

export const sanitizePhone = (phone: string): string => {
  if (!phone) return '';
  // Keep only digits, plus, spaces, dashes
  return phone.replace(/[^\d+\s-]/g, '').slice(0, 20);
};

export const sanitizePrice = (price: number | string): number => {
  const num = typeof price === 'number' ? price : parseFloat(String(price));
  if (isNaN(num) || num < 0) return 0;
  return Math.min(Math.round(num * 100) / 100, 1000000); // capped at 1,000,000 INR
};

// 2. File Upload Security Validation
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFileName?: string;
}

export const validateFileUpload = (file: File): FileValidationResult => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB max
  const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
  ];
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];

  if (!file) {
    return { isValid: false, error: 'No file selected.' };
  }

  // Size Check
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of 5 MB.`,
    };
  }

  // MIME Type Check
  if (!ALLOWED_MIME_TYPES.includes((file.type || '').toLowerCase())) {
    return {
      isValid: false,
      error: `Invalid file type (${file.type}). Only JPG, PNG, WEBP, and SVG images are permitted.`,
    };
  }

  // Extension Check
  const extIndex = file.name.lastIndexOf('.');
  if (extIndex === -1) {
    return { isValid: false, error: 'File lacks a valid extension.' };
  }
  const ext = file.name.slice(extIndex).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      isValid: false,
      error: `Extension ${ext} is not allowed. Supported formats: JPG, PNG, WEBP, SVG.`,
    };
  }

  // Sanitize Filename (prevent path traversal / script injection in filenames)
  const baseName = file.name.slice(0, extIndex);
  const safeBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
  const sanitizedFileName = `${safeBaseName}_${Date.now()}${ext}`;

  return {
    isValid: true,
    sanitizedFileName,
  };
};

// 3. Client Rate Limiter
class RateLimiter {
  private timestamps: Map<string, number[]> = new Map();

  /**
   * Checks if an action key has exceeded the allowed limit within a time window.
   */
  isRateLimited(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = (this.timestamps.get(key) || []).filter((ts) => now - ts < windowMs);

    if (attempts.length >= maxAttempts) {
      return true; // Rate limit exceeded
    }

    attempts.push(now);
    this.timestamps.set(key, attempts);
    return false;
  }

  getRemainingWaitSeconds(key: string, windowMs: number = 60000): number {
    const now = Date.now();
    const attempts = (this.timestamps.get(key) || []).filter((ts) => now - ts < windowMs);
    if (attempts.length === 0) return 0;
    const oldestAttempt = attempts[0];
    const timePassed = now - oldestAttempt;
    return Math.max(1, Math.ceil((windowMs - timePassed) / 1000));
  }
}

export const securityRateLimiter = new RateLimiter();

// 4. Random CSRF / Nonce Token Generator
export const generateSecurityToken = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
