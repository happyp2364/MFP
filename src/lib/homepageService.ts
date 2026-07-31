import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, recordAuditLog } from './firebase';
import { HomepageConfig, HomepageVersion } from '../types';
import { DEFAULT_HOMEPAGE_CONFIG } from '../data/defaultHomepagePresets';

const ACTIVE_CONFIG_DOC = 'active';

/**
 * Fetch Homepage Config from Firestore
 */
export async function fetchHomepageConfigFromFirestore(): Promise<HomepageConfig> {
  try {
    const docRef = doc(db, 'homepage_config', ACTIVE_CONFIG_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as HomepageConfig;
      if (data && Array.isArray(data.sections) && data.sections.length > 0) {
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
      return JSON.parse(local);
    } catch (e) {
      console.warn('LocalStorage homepage config parse note:', e);
    }
  }

  return DEFAULT_HOMEPAGE_CONFIG;
}

/**
 * Subscribe to real-time changes on active Homepage Config
 */
export function subscribeToHomepageConfig(onUpdate: (config: HomepageConfig) => void): () => void {
  const docRef = doc(db, 'homepage_config', ACTIVE_CONFIG_DOC);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as HomepageConfig;
        if (data && Array.isArray(data.sections)) {
          localStorage.setItem('mfp_homepage_config', JSON.stringify(data));
          onUpdate(data);
        }
      }
    },
    (err) => {
      console.warn('Homepage realtime listener notice:', err.message);
    }
  );
}

/**
 * Save Homepage Config to Firestore & record Version Entry
 */
export async function saveHomepageConfigToFirestore(
  config: HomepageConfig,
  authorEmail?: string,
  note?: string
): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    const updatedConfig: HomepageConfig = {
      ...config,
      updatedAt: now,
      updatedBy: authorEmail || 'Admin User',
    };

    // 1. Save to active document
    const docRef = doc(db, 'homepage_config', ACTIVE_CONFIG_DOC);
    await setDoc(docRef, updatedConfig);

    // Save to local storage for immediate cache
    localStorage.setItem('mfp_homepage_config', JSON.stringify(updatedConfig));

    // 2. Save version history snapshot
    const versionId = `ver_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const versionRef = doc(db, 'homepage_versions', versionId);
    const versionDoc: HomepageVersion = {
      id: versionId,
      config: updatedConfig,
      createdAt: now,
      createdBy: authorEmail || 'Admin User',
      note: note || `Updated layout with ${updatedConfig.sections.length} sections (${updatedConfig.name})`,
    };
    await setDoc(versionRef, versionDoc);

    recordAuditLog(
      'Homepage Layout Published',
      'SETTINGS',
      `Published homepage "${updatedConfig.name}" with ${updatedConfig.sections.length} active sections.`,
      'SUCCESS'
    );

    return true;
  } catch (err) {
    console.error('Error saving homepage config:', err);
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
