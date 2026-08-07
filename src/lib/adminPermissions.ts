import {
  AdminModule,
  AdminAction,
  AdminModulePermissions,
  AdminPermissionMatrix,
  AdminRole,
  AdminUser,
} from '../types';

export interface ModuleDefinition {
  key: AdminModule;
  label: string;
  category: 'core' | 'catalog' | 'sales' | 'marketing' | 'settings' | 'security';
  description: string;
}

export const ADMIN_MODULE_LIST: ModuleDefinition[] = [
  { key: 'dashboard', label: 'Dashboard Overview', category: 'core', description: 'Store statistics, sales summary, and real-time alerts' },
  { key: 'products', label: 'Products Catalog', category: 'catalog', description: 'Product creation, variants, pricing, and images' },
  { key: 'inventory', label: 'Inventory & Stock', category: 'catalog', description: 'Size-wise stock levels, stock toggles, and alerts' },
  { key: 'orders', label: 'Orders Management', category: 'sales', description: 'Customer orders, dispatch status, invoices, and tracking' },
  { key: 'customers', label: 'Customer Profiles', category: 'sales', description: 'Customer directory, address book, and order histories' },
  { key: 'coupons', label: 'Coupons & Discounts', category: 'marketing', description: 'Promo codes, flash sales, and cart discount rules' },
  { key: 'reviews', label: 'Customer Reviews', category: 'sales', description: 'Product ratings, customer testimonials, and moderation' },
  { key: 'categories', label: 'Categories & Highlights', category: 'catalog', description: 'Product categories, subcategories, and homepage highlights' },
  { key: 'brands', label: 'Brands & Collections', category: 'catalog', description: 'Brand catalog management and collection tagging' },
  { key: 'payments', label: 'Payment Settings', category: 'settings', description: 'UPI IDs, QR codes, COD rules, and gateway credentials' },
  { key: 'reports', label: 'Sales Reports', category: 'core', description: 'Financial statements, revenue exports, and tax summaries' },
  { key: 'analytics', label: 'Store Analytics', category: 'core', description: 'Traffic, conversion rates, and engagement insights' },
  { key: 'website_settings', label: 'Website Settings', category: 'settings', description: 'Store name, address, operating hours, and policies' },
  { key: 'theme', label: 'Theme & Customization', category: 'settings', description: 'Store colors, typography, and visual presets' },
  { key: 'hero', label: 'Hero Banners', category: 'settings', description: 'Homepage main banner, slides, and call-to-actions' },
  { key: 'announcements', label: 'Announcements', category: 'settings', description: 'Top announcement bar text, timers, and alerts' },
  { key: 'ai_features', label: 'AI Features & Mascot', category: 'settings', description: 'Flying Mascot configuration and AI shoe extraction' },
  { key: 'marketing', label: 'Marketing & Campaigns', category: 'marketing', description: 'Email, push, and promotional campaigns' },
  { key: 'whatsapp_templates', label: 'WhatsApp Templates', category: 'marketing', description: 'Automated WhatsApp messaging templates and options' },
  { key: 'google_drive_backup', label: 'Google Drive & Backups', category: 'security', description: 'Store backups, database snapshots, and restoration' },
  { key: 'admin_management', label: 'Admin Management & RBAC', category: 'security', description: 'Multi-admin creation, role assignment, permissions & activity logs' },
  { key: 'website_configuration', label: 'Website Configuration', category: 'settings', description: 'White-label store identity, contact, address, social media, SEO, branding, emails, and legal policies' },
  { key: 'super_admin_console', label: 'Super Admin Platform Control Center', category: 'security', description: 'Master control center for website buyer directory, tenant management, and emergency platform lock' },
];

export const FULL_PERMISSIONS: AdminModulePermissions = {
  read: true,
  create: true,
  edit: true,
  delete: true,
  export: true,
};

export const READ_ONLY_PERMISSIONS: AdminModulePermissions = {
  read: true,
  create: false,
  edit: false,
  delete: false,
  export: false,
};

export const NO_PERMISSIONS: AdminModulePermissions = {
  read: false,
  create: false,
  edit: false,
  delete: false,
  export: false,
};

export function createFullPermissionMatrix(): AdminPermissionMatrix {
  const matrix = {} as AdminPermissionMatrix;
  ADMIN_MODULE_LIST.forEach((m) => {
    matrix[m.key] = { ...FULL_PERMISSIONS };
  });
  return matrix;
}

export function createNoPermissionMatrix(): AdminPermissionMatrix {
  const matrix = {} as AdminPermissionMatrix;
  ADMIN_MODULE_LIST.forEach((m) => {
    matrix[m.key] = { ...NO_PERMISSIONS };
  });
  return matrix;
}

// Built-In Preset Roles
export const BUILTIN_ROLES: AdminRole[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full un-restricted administrative control over all store features, settings, and admin management.',
    isSystemPreset: true,
    permissions: createFullPermissionMatrix(),
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full operational access to store catalog, orders, settings, and reports. Restricted from deleting Super Admins and accessing Super Admin modules.',
    isSystemPreset: true,
    permissions: (() => {
      const p = createFullPermissionMatrix();
      p.super_admin_console = { ...NO_PERMISSIONS };
      p.admin_management = { ...NO_PERMISSIONS };
      return p;
    })(),
  },
  {
    id: 'inventory_manager',
    name: 'Inventory Manager',
    description: 'Manages products, stock levels, categories, and brands.',
    isSystemPreset: true,
    permissions: (() => {
      const p = createNoPermissionMatrix();
      p.dashboard = { ...READ_ONLY_PERMISSIONS };
      p.products = { ...FULL_PERMISSIONS };
      p.inventory = { ...FULL_PERMISSIONS };
      p.categories = { ...FULL_PERMISSIONS };
      p.brands = { ...FULL_PERMISSIONS };
      return p;
    })(),
  },
  {
    id: 'order_manager',
    name: 'Order Manager',
    description: 'Processes customer orders, manages dispatch status, customer directory, and order communication.',
    isSystemPreset: true,
    permissions: (() => {
      const p = createNoPermissionMatrix();
      p.dashboard = { ...READ_ONLY_PERMISSIONS };
      p.orders = { ...FULL_PERMISSIONS };
      p.customers = { read: true, create: false, edit: true, delete: false, export: true };
      p.inventory = { read: true, create: false, edit: true, delete: false, export: false };
      p.whatsapp_templates = { read: true, create: false, edit: true, delete: false, export: false };
      return p;
    })(),
  },
  {
    id: 'marketing_manager',
    name: 'Marketing Manager',
    description: 'Handles coupons, flash sales, promotional hero banners, marketing campaigns, and customer reviews.',
    isSystemPreset: true,
    permissions: (() => {
      const p = createNoPermissionMatrix();
      p.dashboard = { ...READ_ONLY_PERMISSIONS };
      p.coupons = { ...FULL_PERMISSIONS };
      p.marketing = { ...FULL_PERMISSIONS };
      p.hero = { ...FULL_PERMISSIONS };
      p.announcements = { ...FULL_PERMISSIONS };
      p.reviews = { ...FULL_PERMISSIONS };
      p.analytics = { read: true, create: false, edit: false, delete: false, export: true };
      p.whatsapp_templates = { ...FULL_PERMISSIONS };
      return p;
    })(),
  },
  {
    id: 'finance_manager',
    name: 'Finance Manager',
    description: 'Access to financial statements, payment configurations, sales analytics, and transaction reports.',
    isSystemPreset: true,
    permissions: (() => {
      const p = createNoPermissionMatrix();
      p.dashboard = { read: true, create: false, edit: false, delete: false, export: true };
      p.payments = { ...FULL_PERMISSIONS };
      p.reports = { ...FULL_PERMISSIONS };
      p.analytics = { ...FULL_PERMISSIONS };
      p.orders = { read: true, create: false, edit: false, delete: false, export: true };
      return p;
    })(),
  },
  {
    id: 'customer_support',
    name: 'Customer Support',
    description: 'Read-only access to products and orders with ability to update order delivery notes and moderate reviews.',
    isSystemPreset: true,
    permissions: (() => {
      const p = createNoPermissionMatrix();
      p.dashboard = { ...READ_ONLY_PERMISSIONS };
      p.orders = { read: true, create: false, edit: true, delete: false, export: false };
      p.customers = { read: true, create: false, edit: false, delete: false, export: false };
      p.products = { read: true, create: false, edit: false, delete: false, export: false };
      p.reviews = { read: true, create: false, edit: true, delete: false, export: false };
      return p;
    })(),
  },
];

// Utility: Calculate effective permission matrix for an admin user
export function getEffectivePermissions(
  user: AdminUser | null,
  customRoles: AdminRole[] = []
): AdminPermissionMatrix {
  if (!user) {
    return createNoPermissionMatrix();
  }

  // Super Admin always gets 100% full permissions across all modules
  if (user.roleId === 'super_admin' || user.email === 'vpcreation2002@gmail.com' || user.email === 'vishalpparihar2002@gmail.com') {
    return createFullPermissionMatrix();
  }

  // Find matching role definition (built-in or custom)
  const allRoles = [...BUILTIN_ROLES, ...customRoles];
  const roleDef = allRoles.find((r) => r.id === user.roleId);
  const baseMatrix: AdminPermissionMatrix = roleDef
    ? JSON.parse(JSON.stringify(roleDef.permissions))
    : createNoPermissionMatrix();

  // Apply custom per-user overrides if defined
  if (user.customPermissions) {
    Object.entries(user.customPermissions).forEach(([mKey, perms]) => {
      if (perms) {
        const modKey = mKey as AdminModule;
        baseMatrix[modKey] = {
          ...(baseMatrix[modKey] || NO_PERMISSIONS),
          ...perms,
        };
      }
    });
  }

  return baseMatrix;
}

// Utility: Check if a user has a specific module action permission
export function hasAdminPermission(
  permissions: AdminPermissionMatrix | null,
  module: AdminModule,
  action: AdminAction
): boolean {
  if (!permissions) return false;
  const mod = permissions[module];
  if (!mod) return false;
  return Boolean(mod[action]);
}

// Map Admin Dashboard tab names to corresponding AdminModule
export function mapTabToModule(tab: string): AdminModule {
  switch (tab) {
    case 'overview':
      return 'dashboard';
    case 'products':
      return 'products';
    case 'open_box_delivery':
      return 'products';
    case 'categories':
      return 'categories';
    case 'reviews':
      return 'reviews';
    case 'orders':
      return 'orders';
    case 'coupons':
      return 'coupons';
    case 'marketing':
      return 'marketing';
    case 'whatsapp_templates':
      return 'whatsapp_templates';
    case 'spin_wheel':
    case 'scratch_and_win':
    case 'lucky_box':
    case 'order_celebration':
      return 'marketing';
    case 'engagement_analytics':
    case 'reports':
      return 'reports';
    case 'payment_settings':
      return 'payments';
    case 'homepage':
    case 'top_announcement_bar':
      return 'hero';
    case 'ai_pet_shoe':
      return 'ai_features';
    case 'instagram':
      return 'marketing';
    case 'settings':
      return 'website_settings';
    case 'audit':
    case 'backups':
      return 'google_drive_backup';
    case 'admin_management':
      return 'admin_management';
    case 'website_configuration':
      return 'website_configuration';
    case 'super_admin_console':
      return 'super_admin_console';
    default:
      return 'dashboard';
  }
}

// Utility to get current browser/device summary
export function getDeviceInfo(): string {
  if (typeof window === 'undefined' || !navigator) {
    return 'Web Client Browser';
  }
  const ua = navigator.userAgent;
  let browser = 'Browser';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';

  let os = 'Desktop';
  if (ua.includes('Android')) os = 'Android Mobile';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS Mobile';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} on ${os}`;
}
