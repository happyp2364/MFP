import { db, recordAuditLog } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDefaultFeatureConfig, FEATURE_REGISTRY } from './featureRegistry';
import { getDefaultThemeConfig, TenantThemeConfig } from './themePresets';

export interface TenantFeatureSettings {
  features: Record<string, boolean>; // featureId -> enabled
  platformLocked?: Record<string, boolean>; // featureId -> locked by super admin
  tenantAdminCanControl?: Record<string, boolean>; // featureId -> can tenant admin toggle it
  updatedAt: string;
  updatedBy?: string;
}

/**
 * Fetch feature configuration for a specific tenant (/websites/{tenantId}/settings/features)
 */
export async function getTenantFeatureSettings(tenantId: string): Promise<TenantFeatureSettings> {
  if (!tenantId) {
    return { features: getDefaultFeatureConfig(), updatedAt: new Date().toISOString() };
  }

  try {
    const docRef = doc(db, 'websites', tenantId, 'settings', 'features');
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as Partial<TenantFeatureSettings>;
      return {
        features: { ...getDefaultFeatureConfig(), ...(data.features || {}) },
        platformLocked: data.platformLocked || {},
        tenantAdminCanControl: data.tenantAdminCanControl || {},
        updatedAt: data.updatedAt || new Date().toISOString(),
        updatedBy: data.updatedBy,
      };
    }
  } catch (err) {
    console.warn(`Failed to read features for tenant ${tenantId}, using defaults:`, err);
  }

  return {
    features: getDefaultFeatureConfig(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Save feature configuration for a specific tenant
 */
export async function saveTenantFeatureSettings(
  tenantId: string,
  settings: Partial<TenantFeatureSettings>,
  actorEmail: string
): Promise<void> {
  if (!tenantId) throw new Error('Tenant ID required');

  const current = await getTenantFeatureSettings(tenantId);
  const updated: TenantFeatureSettings = {
    features: { ...current.features, ...(settings.features || {}) },
    platformLocked: { ...current.platformLocked, ...(settings.platformLocked || {}) },
    tenantAdminCanControl: { ...current.tenantAdminCanControl, ...(settings.tenantAdminCanControl || {}) },
    updatedAt: new Date().toISOString(),
    updatedBy: actorEmail,
  };

  const docRef = doc(db, 'websites', tenantId, 'settings', 'features');
  await setDoc(docRef, updated, { merge: true });

  await recordAuditLog(
    'Tenant Feature Settings Updated',
    'SECURITY',
    `Updated feature toggles for website tenant [${tenantId}] by ${actorEmail}`,
    'SUCCESS'
  );
}

/**
 * Fetch theme configuration for a specific tenant (/websites/{tenantId}/settings/theme)
 */
export async function getTenantThemeSettings(tenantId: string): Promise<TenantThemeConfig> {
  if (!tenantId) {
    return getDefaultThemeConfig('modern_light');
  }

  try {
    const docRef = doc(db, 'websites', tenantId, 'settings', 'theme');
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as TenantThemeConfig;
      return {
        ...getDefaultThemeConfig('modern_light'),
        ...data,
      };
    }
  } catch (err) {
    console.warn(`Failed to read theme for tenant ${tenantId}, using defaults:`, err);
  }

  return getDefaultThemeConfig('modern_light');
}

/**
 * Save theme configuration for a specific tenant
 */
export async function saveTenantThemeSettings(
  tenantId: string,
  themeConfig: Partial<TenantThemeConfig>,
  actorEmail: string
): Promise<void> {
  if (!tenantId) throw new Error('Tenant ID required');

  const current = await getTenantThemeSettings(tenantId);
  const updated: TenantThemeConfig = {
    ...current,
    ...themeConfig,
    updatedAt: new Date().toISOString(),
  };

  const docRef = doc(db, 'websites', tenantId, 'settings', 'theme');
  await setDoc(docRef, updated, { merge: true });

  await recordAuditLog(
    'Tenant Theme Settings Updated',
    'SETTINGS',
    `Updated theme settings for website tenant [${tenantId}] by ${actorEmail}`,
    'SUCCESS'
  );
}

/**
 * Copy configuration from Source Tenant -> Destination Tenants.
 * ONLY copies configuration documents, NEVER copies products, orders, customers, or credentials!
 */
export async function copyTenantConfiguration(
  sourceTenantId: string,
  targetTenantIds: string[],
  options: {
    copyTheme?: boolean;
    copyFeatures?: boolean;
    copyStorefrontConfig?: boolean;
    copyMarketingConfig?: boolean;
    copyPaymentConfig?: boolean;
    copyAdminModules?: boolean;
  },
  actorEmail: string
): Promise<{ success: boolean; copiedCount: number; errors: string[] }> {
  const errors: string[] = [];
  let copiedCount = 0;

  for (const targetId of targetTenantIds) {
    if (targetId === sourceTenantId) continue;

    try {
      // 1. Copy Theme
      if (options.copyTheme) {
        const theme = await getTenantThemeSettings(sourceTenantId);
        await saveTenantThemeSettings(targetId, theme, actorEmail);
      }

      // 2. Copy Feature Settings
      if (options.copyFeatures) {
        const features = await getTenantFeatureSettings(sourceTenantId);
        await saveTenantFeatureSettings(targetId, features, actorEmail);
      }

      // 3. Copy Storefront Configuration (hero_content, top_announcement_bar, website_config)
      if (options.copyStorefrontConfig) {
        const docsToCopy = ['hero_content', 'top_announcement_bar', 'website_config'];
        for (const docName of docsToCopy) {
          const srcRef = doc(db, 'websites', sourceTenantId, 'settings', docName);
          const snap = await getDoc(srcRef);
          if (snap.exists()) {
            const destRef = doc(db, 'websites', targetId, 'settings', docName);
            await setDoc(destRef, snap.data(), { merge: true });
          }
        }
      }

      // 4. Copy Marketing Configuration (spin_wheel, scratch_win, whatsapp_templates)
      if (options.copyMarketingConfig) {
        const docsToCopy = ['spin_wheel', 'scratch_win', 'whatsapp_templates'];
        for (const docName of docsToCopy) {
          const srcRef = doc(db, 'websites', sourceTenantId, 'settings', docName);
          const snap = await getDoc(srcRef);
          if (snap.exists()) {
            const destRef = doc(db, 'websites', targetId, 'settings', docName);
            await setDoc(destRef, snap.data(), { merge: true });
          }
        }
      }

      // 5. Copy Payment Config (payment_settings, button_theme)
      if (options.copyPaymentConfig) {
        const docsToCopy = ['payment_settings', 'button_theme'];
        for (const docName of docsToCopy) {
          const srcRef = doc(db, 'websites', sourceTenantId, 'settings', docName);
          const snap = await getDoc(srcRef);
          if (snap.exists()) {
            // Filter out merchant secret keys or private accounts if present
            const data = snap.data();
            delete data.merchantSecret;
            delete data.apiKey;
            const destRef = doc(db, 'websites', targetId, 'settings', docName);
            await setDoc(destRef, data, { merge: true });
          }
        }
      }

      copiedCount++;
    } catch (e: any) {
      errors.push(`Failed copying to ${targetId}: ${e.message || String(e)}`);
    }
  }

  await recordAuditLog(
    'Tenant Configuration Copy',
    'SECURITY',
    `Copied configuration from [${sourceTenantId}] to ${targetTenantIds.length} tenants by ${actorEmail}`,
    'SUCCESS'
  );

  return { success: errors.length === 0, copiedCount, errors };
}

/**
 * Bulk feature update for multiple tenants
 */
export async function bulkUpdateTenantFeatures(
  tenantIds: string[],
  featureUpdates: Record<string, boolean>,
  actorEmail: string
): Promise<void> {
  for (const tid of tenantIds) {
    await saveTenantFeatureSettings(tid, { features: featureUpdates }, actorEmail);
  }
}
