import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, recordAuditLog } from './firebase';
import { HomepageConfig, HomepageVersion, ActiveThemeDoc } from '../types';
import { DEFAULT_HOMEPAGE_CONFIG } from '../data/defaultHomepagePresets';

const ACTIVE_CONFIG_DOC = 'active';

/**
 * Constructs the Active Theme Document matching Requirement 11
 */
export function buildActiveThemeDocument(config: HomepageConfig, authorEmail?: string): ActiveThemeDoc {
  const heroSec = config.sections?.find((s) => s.type === 'hero_banner' || s.type === 'floating_sneaker');
  const annSec = config.sections?.find((s) => s.type === 'announcements');

  return {
    themeId: config.id || `theme_${Date.now()}`,
    presetName: config.presetName || config.name || 'Default Luxury Preset',
    themeMode: config.themeMode || 'light',
    colors: {
      primary: heroSec?.styling?.accentColor || '#d97706',
      secondary: '#0F172A',
      background: heroSec?.styling?.bgColor || '#ffffff',
      accent: heroSec?.styling?.accentColor || '#d97706',
      textColor: heroSec?.styling?.textColor || '#0F172A',
      cardBg: '#1e293b',
    },
    fonts: {
      headingFont: 'Playfair Display',
      bodyFont: 'Plus Jakarta Sans',
      scaleRatio: 1.25,
    },
    layout: {
      containerWidth: 'max-w-7xl',
      borderRadius: heroSec?.styling?.borderRadius || 16,
      spacing: 'relaxed',
    },
    hero: {
      heroType: heroSec?.type || 'hero_banner',
      title: heroSec?.title || config.name,
      subtitle: heroSec?.subtitle || '',
      bgGradient: heroSec?.styling?.bgGradient || '',
    },
    cards: {
      style: 'glassmorphic',
      borderRadius: 16,
      shadow: heroSec?.styling?.shadow || 'xl',
    },
    buttons: {
      style: 'filled',
      borderRadius: 12,
    },
    banners: {
      topAnnouncementEnabled: annSec?.enabled ?? true,
      bannerStyle: 'classic',
    },
    updatedAt: new Date().toISOString(),
    updatedBy: authorEmail || config.updatedBy || 'System Admin',
  };
}

/**
 * Fetch Homepage Config & Theme from Firestore
 */
export async function fetchHomepageConfigFromFirestore(): Promise<HomepageConfig> {
  try {
    const docRef = doc(db, 'homepage_config', ACTIVE_CONFIG_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as HomepageConfig;
      if (data && Array.isArray(data.sections) && data.sections.length > 0) {
        console.log('[Theme Logger] Theme Loaded:', data.presetName || data.name);
        return data;
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `homepage_config/${ACTIVE_CONFIG_DOC}`);
  }

  // Fallback to local storage or DEFAULT_HOMEPAGE_CONFIG
  const local = localStorage.getItem('mfp_homepage_config');
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
        console.log('[Theme Logger] Theme Loaded (LocalStorage Cache):', parsed.presetName || parsed.name);
        return parsed;
      }
    } catch (e) {
      console.warn('LocalStorage homepage config parse note:', e);
    }
  }

  console.log('[Theme Logger] Theme Loaded (Default Fallback)');
  return DEFAULT_HOMEPAGE_CONFIG;
}

let activeUnsubscribeFn: (() => void) | null = null;

/**
 * Subscribe to real-time changes on active Homepage Config & Active Theme
 */
export function subscribeToHomepageConfig(onUpdate: (config: HomepageConfig) => void): () => void {
  // Prevent duplicate listeners (Requirement 6 & 14)
  if (activeUnsubscribeFn) {
    console.log('[Theme Logger] Cleaning up previous duplicate theme listener');
    activeUnsubscribeFn();
    activeUnsubscribeFn = null;
  }

  const docRef = doc(db, 'homepage_config', ACTIVE_CONFIG_DOC);
  console.log('[Theme Logger] Theme Listener Updated (Subscribed)');

  const unsub = onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as HomepageConfig;
        if (data && Array.isArray(data.sections) && data.sections.length > 0) {
          localStorage.setItem('mfp_homepage_config', JSON.stringify(data));
          console.log('[Theme Logger] Theme Sync Success:', data.presetName || data.name);
          onUpdate(data);
        }
      }
    },
    (err) => {
      console.warn('[Theme Logger] Homepage realtime listener notice:', err.message);
    }
  );

  activeUnsubscribeFn = unsub;

  return () => {
    console.log('[Theme Logger] Theme Listener Unsubscribed');
    if (activeUnsubscribeFn === unsub) {
      unsub();
      activeUnsubscribeFn = null;
    }
  };
}

/**
 * Save Homepage Config to Firestore & record Version Entry
 */
export async function saveHomepageConfigToFirestore(
  config: HomepageConfig,
  authorEmail?: string,
  note?: string
): Promise<boolean> {
  const themeName = config.presetName || config.name || 'Custom Theme';
  console.log('[Theme Logger] Theme Save Initiated:', themeName);

  if (!config || !Array.isArray(config.sections) || config.sections.length === 0) {
    console.error('[Theme Logger] Validation error: Attempted to save empty/invalid theme config');
    return false;
  }

  try {
    const now = new Date().toISOString();
    const updatedConfig: HomepageConfig = {
      ...config,
      updatedAt: now,
      updatedBy: authorEmail || 'Admin User',
    };

    // 1. Save to active homepage_config document
    const docRef = doc(db, 'homepage_config', ACTIVE_CONFIG_DOC);
    await setDoc(docRef, updatedConfig);

    // 2. Build and save active theme document to theme/active (Requirement 11)
    const activeThemeDoc = buildActiveThemeDocument(updatedConfig, authorEmail);
    const themeRef = doc(db, 'theme', 'active');
    await setDoc(themeRef, activeThemeDoc);

    // Save to local storage for immediate cache
    localStorage.setItem('mfp_homepage_config', JSON.stringify(updatedConfig));
    localStorage.setItem('mfp_active_theme', JSON.stringify(activeThemeDoc));

    // 3. Save version history snapshot
    const versionId = `ver_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const versionRef = doc(db, 'homepage_versions', versionId);
    const versionDoc: HomepageVersion = {
      id: versionId,
      config: updatedConfig,
      createdAt: now,
      createdBy: authorEmail || 'Admin User',
      note: note || `Updated layout with ${updatedConfig.sections.length} sections (${themeName})`,
    };
    await setDoc(versionRef, versionDoc);

    recordAuditLog(
      'Homepage Layout & Theme Published',
      'SETTINGS',
      `Published theme preset "${themeName}" with ${updatedConfig.sections.length} active sections.`,
      'SUCCESS'
    );

    console.log('[Theme Logger] Theme Saved Successfully:', themeName);
    return true;
  } catch (err) {
    console.error('[Theme Logger] Theme Save Failed:', err);
    handleFirestoreError(err, OperationType.WRITE, `homepage_config/${ACTIVE_CONFIG_DOC}`);
    return false;
  }
}

/**
 * Fetch Homepage Version History
 */
export async function fetchHomepageVersionsFromFirestore(): Promise<HomepageVersion[]> {
  try {
    const q = query(collection(db, 'homepage_versions'), orderBy('createdAt', 'desc'), limit(25));
    const snap = await getDocs(q);
    const versions: HomepageVersion[] = [];
    snap.forEach((d) => {
      versions.push(d.data() as HomepageVersion);
    });
    return versions;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'homepage_versions');
    return [];
  }
}

/**
 * Rollback to a previous Homepage Version
 */
export async function rollbackHomepageVersionInFirestore(
  versionId: string,
  authorEmail?: string
): Promise<boolean> {
  try {
    const versionRef = doc(db, 'homepage_versions', versionId);
    const snap = await getDoc(versionRef);
    if (!snap.exists()) return false;

    const versionDoc = snap.data() as HomepageVersion;
    if (versionDoc && versionDoc.config) {
      return await saveHomepageConfigToFirestore(
        versionDoc.config,
        authorEmail,
        `Restored version from ${new Date(versionDoc.createdAt).toLocaleString('en-IN')}`
      );
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `homepage_versions/${versionId}`);
  }
  return false;
}

/**
 * Call AI API to generate homepage layout
 */
export async function generateAIHomepageLayout(prompt: string, currentTheme: string = 'light'): Promise<HomepageConfig | null> {
  try {
    const res = await fetch('/api/ai/generate-homepage-layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, currentTheme }),
    });
    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();
    if (data.success && data.config) {
      return data.config as HomepageConfig;
    }
  } catch (err) {
    console.warn('AI Layout endpoint call note:', err);
  }
  return null;
}

/**
 * Call AI API to generate or rewrite section content
 */
export async function generateAISectionContent(sectionType: string, prompt: string) {
  try {
    const res = await fetch('/api/ai/generate-section-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionType, prompt }),
    });
    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();
    if (data.success && data.result) {
      return data.result;
    }
  } catch (err) {
    console.warn('AI Section content endpoint call note:', err);
  }
  return null;
}
