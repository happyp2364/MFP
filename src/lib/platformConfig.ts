import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export interface PlatformConfig {
  platformName: string;
  platformDisplayName: string;
  platformBaseUrl: string;
  platformSupportEmail: string;
  platformSupportWhatsApp: string;
  platformLogo: string;
  platformFavicon: string;
}

export const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  platformName: 'NWD',
  platformDisplayName: 'NWD Platform',
  platformBaseUrl: 'https://nwd.vercel.app',
  platformSupportEmail: 'support@nwd.vercel.app',
  platformSupportWhatsApp: '919829012345',
  platformLogo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=120&q=80',
  platformFavicon: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=32&h=32&q=80',
};

const STORAGE_KEY = 'platform_config_live';

let cachedPlatformConfig: PlatformConfig = (() => {
  try {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      return { ...DEFAULT_PLATFORM_CONFIG, ...JSON.parse(saved) };
    }
  } catch {
    // Ignore error
  }
  return DEFAULT_PLATFORM_CONFIG;
})();

export function getPlatformConfig(): PlatformConfig {
  return cachedPlatformConfig;
}

export function savePlatformConfigToLocal(config: PlatformConfig): void {
  cachedPlatformConfig = { ...config };
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
  } catch {
    // Ignore error
  }
}

export async function savePlatformConfig(config: Partial<PlatformConfig>): Promise<PlatformConfig> {
  const updated: PlatformConfig = {
    ...getPlatformConfig(),
    ...config,
  };
  savePlatformConfigToLocal(updated);

  try {
    const ref = doc(db, 'settings', 'platform_config');
    await setDoc(ref, updated, { merge: true });
  } catch (err) {
    console.warn('Failed to sync Platform Config to Firestore:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('platformConfigUpdated', { detail: updated }));
  }

  return updated;
}

export function subscribePlatformConfig(onUpdate: (config: PlatformConfig) => void): () => void {
  onUpdate(getPlatformConfig());

  const ref = doc(db, 'settings', 'platform_config');
  const unsubFirestore = onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<PlatformConfig>;
        const merged = { ...DEFAULT_PLATFORM_CONFIG, ...data };
        savePlatformConfigToLocal(merged);
        onUpdate(merged);
      }
    },
    (err) => {
      console.warn('Platform config snapshot error:', err);
    }
  );

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<PlatformConfig>;
    if (custom.detail) {
      onUpdate(custom.detail);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('platformConfigUpdated', handleCustomEvent);
  }

  return () => {
    unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('platformConfigUpdated', handleCustomEvent);
    }
  };
}

/**
 * Builds a website URL dynamically using Platform Configuration.
 * Format: platformBaseUrl + "/" + websiteSlug
 * Example: https://nwd.vercel.app/happy-footwear
 */
export function buildWebsiteUrl(websiteSlug: string, customConfig?: Partial<PlatformConfig>): string {
  const config = { ...getPlatformConfig(), ...customConfig };
  let baseUrl = (config.platformBaseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://nwd.vercel.app')).trim();
  baseUrl = baseUrl.replace(/\/+$/, '');
  const cleanSlug = (websiteSlug || '').trim().replace(/^\/+/, '');
  return cleanSlug ? `${baseUrl}/${cleanSlug}` : baseUrl;
}

/**
 * Builds an admin login URL dynamically using Platform Configuration.
 */
export function buildAdminLoginUrl(websiteSlug: string, customConfig?: Partial<PlatformConfig>): string {
  const webUrl = buildWebsiteUrl(websiteSlug, customConfig);
  return `${webUrl}?admin=true`;
}
