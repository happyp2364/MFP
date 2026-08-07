import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { PlatformFeature, PlatformReleaseVersion, Tenant } from '../types';
import { saveTenant } from './adminService';
import { recordAuditLog } from './firebase';

export const CURRENT_PLATFORM_VERSION = 'v2.5.0';

export const DEFAULT_PLATFORM_FEATURES: PlatformFeature[] = [
  {
    id: 'feat_spin_wheel',
    name: 'Interactive Gamified Spin & Win Wheel',
    description: 'Gamified lead capture and discount coupon wheel widget for storefront visitors.',
    versionIntroduced: 'v2.4.0',
    releaseDate: '2026-07-15',
    status: 'Stable',
    category: 'Marketing',
    disabledByDefault: true,
  },
  {
    id: 'feat_scratch_card',
    name: 'Scratch & Win Reward Cards',
    description: 'Post-purchase and pop-up scratch card rewards to boost customer retention.',
    versionIntroduced: 'v2.4.0',
    releaseDate: '2026-07-20',
    status: 'Stable',
    category: 'Marketing',
    disabledByDefault: true,
  },
  {
    id: 'feat_ai_marketing',
    name: 'AI Marketing & Automated Growth Assistant',
    description: 'Gemini-powered ad copy generator, social media captions, and growth campaigns.',
    versionIntroduced: 'v2.5.0',
    releaseDate: '2026-08-01',
    status: 'Beta',
    category: 'AI & SEO',
    disabledByDefault: true,
  },
  {
    id: 'feat_open_box_delivery',
    name: 'Open Box Delivery Verification',
    description: 'Allow customers and delivery agents to verify items before accepting COD deliveries.',
    versionIntroduced: 'v2.3.0',
    releaseDate: '2026-06-10',
    status: 'Stable',
    category: 'Fulfillment',
    disabledByDefault: true,
  },
  {
    id: 'feat_whatsapp_templates',
    name: 'WhatsApp Automated Broadcasts & Alerts',
    description: 'Automated order status updates and abandoned cart recovery over WhatsApp Business API.',
    versionIntroduced: 'v2.4.0',
    releaseDate: '2026-07-05',
    status: 'Stable',
    category: 'Sales',
    disabledByDefault: true,
  },
  {
    id: 'feat_seo_assistant',
    name: 'AI SEO Assistant & Real-Time Content Auditor',
    description: 'Real-time meta tags optimization, schema markup generator, and keyword scoring.',
    versionIntroduced: 'v2.5.0',
    releaseDate: '2026-08-03',
    status: 'Beta',
    category: 'AI & SEO',
    disabledByDefault: true,
  },
  {
    id: 'feat_customer_crm',
    name: 'Customer Intelligence CRM & LTV Analytics',
    description: 'Customer lifetime value prediction, RFM segmentation, and custom tags.',
    versionIntroduced: 'v2.5.0',
    releaseDate: '2026-08-05',
    status: 'Stable',
    category: 'Analytics',
    disabledByDefault: true,
  },
  {
    id: 'feat_celebration_effects',
    name: 'Order Celebration Effects & Audio Feedback',
    description: 'Confetti fireworks, victory soundscapes, and celebratory animations upon checkout.',
    versionIntroduced: 'v2.2.0',
    releaseDate: '2026-05-18',
    status: 'Stable',
    category: 'Customer Experience',
    disabledByDefault: true,
  },
  {
    id: 'feat_product_feed',
    name: 'Google & Meta Dynamic Product Feed Exporter',
    description: 'Automated XML/JSON product feed generator for Google Shopping and Instagram Shops.',
    versionIntroduced: 'v2.4.0',
    releaseDate: '2026-07-28',
    status: 'Stable',
    category: 'Sales',
    disabledByDefault: true,
  },
  {
    id: 'feat_price_point_filter',
    name: 'Smart Price-Point Tier Filtering',
    description: 'Quick budget-based navigation buttons (Under ₹999, Under ₹1999) for rapid catalog browsing.',
    versionIntroduced: 'v2.1.0',
    releaseDate: '2026-04-12',
    status: 'Stable',
    category: 'Customer Experience',
    disabledByDefault: true,
  },
];

export const DEFAULT_PLATFORM_VERSIONS: PlatformReleaseVersion[] = [
  {
    version: 'v2.5.0',
    releaseName: 'Enterprise AI & Feature Governance Release',
    releaseDate: '2026-08-07',
    description: 'Introduces Enterprise Feature Release System, AI Marketing & SEO Assistant, Customer CRM, and Website Slug Routing.',
    featuresIntroduced: ['feat_ai_marketing', 'feat_seo_assistant', 'feat_customer_crm'],
    changelogNotes: [
      'Added Platform Feature Release & Version Management Registry.',
      'Implemented Super Admin bulk feature enablement, disablement, and rollback capabilities.',
      'Added Website URL Generator & Slug Management with unique /<slug> routing.',
      'All new platform features are strictly disabled by default for all websites.',
      'Integrated real-time Firestore persistence for all feature flags.',
    ],
    isCurrentMajor: true,
  },
  {
    version: 'v2.4.0',
    releaseName: 'Growth, Gamification & Multi-Channel Release',
    releaseDate: '2026-07-15',
    description: 'Introduces Spin & Win, Scratch Cards, WhatsApp Broadcasts, and Dynamic Product Feed export.',
    featuresIntroduced: ['feat_spin_wheel', 'feat_scratch_card', 'feat_whatsapp_templates', 'feat_product_feed'],
    changelogNotes: [
      'Added gamified conversion widgets for storefront lead capture.',
      'Integrated WhatsApp Business API template manager.',
      'Added automated XML feed exports for Google Shopping and Facebook Catalog.',
    ],
  },
  {
    version: 'v2.3.0',
    releaseName: 'Fulfillment & Open-Box Verification Release',
    releaseDate: '2026-06-10',
    description: 'Introduces Open Box Delivery for COD safety and courier integration.',
    featuresIntroduced: ['feat_open_box_delivery'],
    changelogNotes: [
      'Added open-box inspection workflow for high-value orders.',
      'Enhanced delivery OTP verification system.',
    ],
  },
  {
    version: 'v2.0.0',
    releaseName: 'Multi-Tenant Enterprise Architecture Core',
    releaseDate: '2026-05-01',
    description: 'Full multi-tenant database isolation, white-label store management, and RBAC.',
    featuresIntroduced: ['feat_celebration_effects', 'feat_price_point_filter'],
    changelogNotes: [
      'Built strict multi-tenant Firestore query isolation engine.',
      'Introduced Super Admin management console.',
    ],
  },
];

/**
 * Checks whether a feature is explicitly enabled for a given website (tenant).
 * Returns false if tenant is null or feature is disabled or missing in tenant.enabledFeatures.
 */
export function isFeatureEnabledForTenant(tenant: Tenant | null | undefined, featureId: string): boolean {
  if (!tenant) return false;
  if (!tenant.enabledFeatures || !Array.isArray(tenant.enabledFeatures)) {
    return false; // Default: disabled for all websites unless explicitly enabled
  }
  return tenant.enabledFeatures.includes(featureId);
}

/**
 * Fetches the Feature Registry from Firestore collection 'platform_features'.
 * Seeds with default features if collection is empty.
 */
export async function fetchFeatureRegistry(): Promise<PlatformFeature[]> {
  try {
    const colRef = collection(db, 'platform_features');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      // Seed default features into Firestore
      for (const feat of DEFAULT_PLATFORM_FEATURES) {
        await setDoc(doc(db, 'platform_features', feat.id), feat);
      }
      return DEFAULT_PLATFORM_FEATURES;
    }
    const features: PlatformFeature[] = [];
    snap.forEach((docSnap) => {
      features.push(docSnap.data() as PlatformFeature);
    });
    return features.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.warn('Failed to fetch platform features from Firestore, falling back to defaults:', err);
    return DEFAULT_PLATFORM_FEATURES;
  }
}

/**
 * Saves or updates a feature definition in Firestore 'platform_features'
 */
export async function saveFeatureToRegistry(feature: PlatformFeature): Promise<void> {
  const docRef = doc(db, 'platform_features', feature.id);
  await setDoc(docRef, feature, { merge: true });
  recordAuditLog(
    'Platform Feature Registered/Updated',
    'SETTINGS',
    `Registered feature "${feature.name}" (${feature.id}) introduced in ${feature.versionIntroduced}`,
    'SUCCESS'
  );
}

/**
 * Deletes a feature from Firestore registry
 */
export async function deleteFeatureFromRegistry(featureId: string): Promise<void> {
  const docRef = doc(db, 'platform_features', featureId);
  await deleteDoc(docRef);
  recordAuditLog(
    'Platform Feature Removed',
    'SETTINGS',
    `Removed feature "${featureId}" from platform registry`,
    'SUCCESS'
  );
}

/**
 * Enables a feature for a single website
 */
export async function enableFeatureForWebsite(tenant: Tenant, featureId: string): Promise<Tenant> {
  const current = tenant.enabledFeatures || [];
  if (current.includes(featureId)) return tenant;

  const updatedFeatures = [...current, featureId];
  const pending = (tenant.pendingUpdates || []).filter((id) => id !== featureId);

  const updatedTenant: Tenant = {
    ...tenant,
    enabledFeatures: updatedFeatures,
    pendingUpdates: pending,
    updatedAt: new Date().toISOString(),
  };

  await saveTenant(updatedTenant);
  recordAuditLog(
    'Feature Enabled for Website',
    'SETTINGS',
    `Enabled feature "${featureId}" for website "${tenant.name}" (${tenant.id})`,
    'SUCCESS'
  );

  return updatedTenant;
}

/**
 * Enables a feature for selected websites (bulk action)
 */
export async function enableFeatureForSelectedWebsites(
  tenants: Tenant[],
  selectedTenantIds: string[],
  featureId: string
): Promise<Tenant[]> {
  const updatedList: Tenant[] = [];

  for (const t of tenants) {
    if (selectedTenantIds.includes(t.id)) {
      const updated = await enableFeatureForWebsite(t, featureId);
      updatedList.push(updated);
    } else {
      updatedList.push(t);
    }
  }

  recordAuditLog(
    'Bulk Feature Rollout',
    'SETTINGS',
    `Enabled feature "${featureId}" for ${selectedTenantIds.length} selected websites`,
    'SUCCESS'
  );

  return updatedList;
}

/**
 * Enables a feature globally for all websites
 */
export async function enableFeatureForAllWebsites(
  tenants: Tenant[],
  featureId: string
): Promise<Tenant[]> {
  const updatedList: Tenant[] = [];

  for (const t of tenants) {
    const updated = await enableFeatureForWebsite(t, featureId);
    updatedList.push(updated);
  }

  recordAuditLog(
    'Global Feature Rollout',
    'SETTINGS',
    `Globally enabled feature "${featureId}" for ALL (${tenants.length}) websites`,
    'SUCCESS'
  );

  return updatedList;
}

/**
 * Disables a feature for a single website
 */
export async function disableFeatureForWebsite(tenant: Tenant, featureId: string): Promise<Tenant> {
  const current = tenant.enabledFeatures || [];
  if (!current.includes(featureId)) return tenant;

  const updatedFeatures = current.filter((id) => id !== featureId);
  const updatedTenant: Tenant = {
    ...tenant,
    enabledFeatures: updatedFeatures,
    updatedAt: new Date().toISOString(),
  };

  await saveTenant(updatedTenant);
  recordAuditLog(
    'Feature Disabled for Website',
    'SETTINGS',
    `Disabled feature "${featureId}" for website "${tenant.name}" (${tenant.id})`,
    'SUCCESS'
  );

  return updatedTenant;
}

/**
 * Disables a feature for selected websites
 */
export async function disableFeatureForSelectedWebsites(
  tenants: Tenant[],
  selectedTenantIds: string[],
  featureId: string
): Promise<Tenant[]> {
  const updatedList: Tenant[] = [];

  for (const t of tenants) {
    if (selectedTenantIds.includes(t.id)) {
      const updated = await disableFeatureForWebsite(t, featureId);
      updatedList.push(updated);
    } else {
      updatedList.push(t);
    }
  }

  recordAuditLog(
    'Bulk Feature Disablement',
    'SETTINGS',
    `Disabled feature "${featureId}" for ${selectedTenantIds.length} selected websites`,
    'SUCCESS'
  );

  return updatedList;
}

/**
 * Disables a feature globally for all websites
 */
export async function disableFeatureForAllWebsites(
  tenants: Tenant[],
  featureId: string
): Promise<Tenant[]> {
  const updatedList: Tenant[] = [];

  for (const t of tenants) {
    const updated = await disableFeatureForWebsite(t, featureId);
    updatedList.push(updated);
  }

  recordAuditLog(
    'Global Feature Disablement',
    'SETTINGS',
    `Globally disabled feature "${featureId}" across ALL websites`,
    'SUCCESS'
  );

  return updatedList;
}

/**
 * Rollback feature deployment: disables feature across targeted or all websites
 */
export async function rollbackFeature(
  tenants: Tenant[],
  featureId: string,
  targetTenantIds?: string[]
): Promise<Tenant[]> {
  const idsToProcess = targetTenantIds && targetTenantIds.length > 0
    ? targetTenantIds
    : tenants.map((t) => t.id);

  const result = await disableFeatureForSelectedWebsites(tenants, idsToProcess, featureId);

  recordAuditLog(
    'Feature Rollback Executed',
    'SECURITY',
    `Emergency Rollback executed for feature "${featureId}" across ${idsToProcess.length} websites`,
    'SUCCESS'
  );

  return result;
}

/**
 * Updates Platform Version for a website
 */
export async function updateWebsitePlatformVersion(tenant: Tenant, version: string): Promise<Tenant> {
  const updatedTenant: Tenant = {
    ...tenant,
    platformVersion: version,
    version: version,
    updatedAt: new Date().toISOString(),
  };

  await saveTenant(updatedTenant);
  recordAuditLog(
    'Website Version Updated',
    'SETTINGS',
    `Updated platform version for website "${tenant.name}" (${tenant.id}) to ${version}`,
    'SUCCESS'
  );

  return updatedTenant;
}

/**
 * Bulk updates Platform Version for selected or all websites
 */
export async function bulkUpdateWebsitePlatformVersion(
  tenants: Tenant[],
  selectedTenantIds: string[],
  version: string
): Promise<Tenant[]> {
  const updatedList: Tenant[] = [];

  for (const t of tenants) {
    if (selectedTenantIds.includes(t.id)) {
      const updated = await updateWebsitePlatformVersion(t, version);
      updatedList.push(updated);
    } else {
      updatedList.push(t);
    }
  }

  recordAuditLog(
    'Bulk Platform Version Update',
    'SETTINGS',
    `Updated platform version to ${version} for ${selectedTenantIds.length} websites`,
    'SUCCESS'
  );

  return updatedList;
}

/**
 * Calculates Feature Adoption Analytics across all websites
 */
export interface FeatureUsageAnalytics {
  featureId: string;
  featureName: string;
  category: string;
  status: string;
  versionIntroduced: string;
  enabledCount: number;
  totalWebsites: number;
  adoptionPercentage: number;
  enabledTenantNames: string[];
  disabledTenantNames: string[];
}

export function calculateFeatureUsage(
  features: PlatformFeature[],
  tenants: Tenant[]
): FeatureUsageAnalytics[] {
  const total = tenants.length || 1;

  return features.map((feat) => {
    const enabledTenants = tenants.filter((t) =>
      (t.enabledFeatures || []).includes(feat.id)
    );
    const disabledTenants = tenants.filter(
      (t) => !(t.enabledFeatures || []).includes(feat.id)
    );

    const count = enabledTenants.length;
    const percentage = Math.round((count / total) * 100);

    return {
      featureId: feat.id,
      featureName: feat.name,
      category: feat.category,
      status: feat.status,
      versionIntroduced: feat.versionIntroduced,
      enabledCount: count,
      totalWebsites: tenants.length,
      adoptionPercentage: percentage,
      enabledTenantNames: enabledTenants.map((t) => t.name),
      disabledTenantNames: disabledTenants.map((t) => t.name),
    };
  });
}

/**
 * Generates automated Release Notes for a given platform version or all versions
 */
export function generateReleaseNotes(
  targetVersion?: string,
  featuresList: PlatformFeature[] = DEFAULT_PLATFORM_FEATURES
): string {
  const versions = targetVersion
    ? DEFAULT_PLATFORM_VERSIONS.filter((v) => v.version === targetVersion)
    : DEFAULT_PLATFORM_VERSIONS;

  let markdown = `# Enterprise Platform Release Notes & Feature Changelog\n\n`;
  markdown += `**Current Platform Version:** \`${CURRENT_PLATFORM_VERSION}\`  \n`;
  markdown += `**Generated On:** ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}  \n\n`;
  markdown += `---\n\n`;

  versions.forEach((ver) => {
    markdown += `## 🚀 Release Version ${ver.version} - ${ver.releaseName}\n`;
    markdown += `**Release Date:** ${ver.releaseDate} | **Status:** ${ver.isCurrentMajor ? '🟢 Active Platform Baseline' : '📦 Archived Version'}\n\n`;
    markdown += `*${ver.description}*\n\n`;

    markdown += `### 💡 Features Introduced in ${ver.version}:\n`;
    const verFeatures = featuresList.filter((f) => f.versionIntroduced === ver.version);
    if (verFeatures.length > 0) {
      verFeatures.forEach((f) => {
        markdown += `- **${f.name}** (\`${f.id}\`) - *${f.category}*\n`;
        markdown += `  - **Description:** ${f.description}\n`;
        markdown += `  - **Status:** ${f.status} | **Default State:** Disabled by Default (Requires Super Admin Release)\n`;
      });
    } else {
      markdown += `- Core architecture stability, security updates, and performance patches.\n`;
    }

    markdown += `\n### 📝 Version Changelog Highlights:\n`;
    ver.changelogNotes.forEach((note) => {
      markdown += `- ${note}\n`;
    });

    markdown += `\n---\n\n`;
  });

  return markdown;
}
