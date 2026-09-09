/**
 * Safe LocalStorage & SessionStorage wrapper.
 * Prevents runtime crashes in restricted browser environments:
 * - Incognito / Private browsing modes
 * - Android WebView / WhatsApp in-app browser with cookies/storage disabled
 * - Third-party storage security restrictions (DOMException: Access is denied)
 * - Server-side rendering (SSR) environments
 */

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(key, value);
    } catch {
      // Silently ignore quota / security errors
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem(key);
    } catch {
      // Silently ignore errors
    }
  },
  getJSON: <T>(key: string, fallback: T): T => {
    try {
      const raw = safeStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  setJSON: <T>(key: string, value: T): void => {
    try {
      safeStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently ignore errors
    }
  },
};
