import { AdminNavConfig, AdminNavGroupConfig, AdminNavItemConfig } from '../types/adminNav';

export const DEFAULT_ADMIN_NAV_CONFIG: AdminNavConfig = {
  groups: [
    {
      id: 'daily_operations',
      label: 'Daily Operations',
      icon: '⭐',
      collapsed: false,
      visible: true,
      items: [
        { id: 'orders', label: 'Orders & Tracking', iconName: 'Package', visible: true, locked: true },
        { id: 'open_box_delivery', label: 'Open Box Delivery', iconName: 'PackageCheck', visible: true },
        { id: 'products', label: 'Products & Stock', iconName: 'Boxes', visible: true, locked: true },
        { id: 'customer_crm', label: 'Customer CRM', iconName: 'Users', visible: true },
        { id: 'coupons', label: 'Coupons & Promotions', iconName: 'Ticket', visible: true },
        { id: 'whatsapp_templates', label: 'WhatsApp Templates', iconName: 'MessageSquare', visible: true },
      ],
    },
    {
      id: 'marketing_growth',
      label: 'Marketing & Growth',
      icon: '📣',
      collapsed: false,
      visible: true,
      items: [
        { id: 'marketing', label: 'Marketing & Campaigns', iconName: 'Megaphone', visible: true },
        { id: 'ai_marketing_growth', label: 'AI Marketing & Growth', iconName: 'Sparkles', visible: true },
        { id: 'reviews', label: 'Customer Reviews', iconName: 'Star', visible: true },
        { id: 'spin_wheel', label: 'Spin the Wheel', iconName: 'Sparkles', visible: true },
        { id: 'lucky_box', label: 'Lucky Box (Scratch Card)', iconName: 'Gift', visible: true },
        { id: 'order_celebration', label: 'Order Success Celebration', iconName: 'PartyPopper', visible: true },
        { id: 'engagement_analytics', label: 'Reward Analytics', iconName: 'TrendingUp', visible: true },
        { id: 'instagram', label: 'Social Media Center', iconName: 'Share2', visible: true },
        { id: 'instagram_reels', label: 'Instagram Reels', iconName: 'Instagram', visible: true },
        { id: 'ai_pet_shoe', label: 'AI Pet Shoe Mascot', iconName: 'Sparkles', visible: true },
        { id: 'trending_shoes', label: '🔥 Trending Shoes Manager', iconName: 'Flame', visible: true },
        { id: 'price_point_699', label: '🔥 ₹699 Collection Manager', iconName: 'Zap', visible: true },
      ],
    },
    {
      id: 'payments_business',
      label: 'Payments & Business',
      icon: '💰',
      collapsed: false,
      visible: true,
      items: [
        { id: 'payment_settings', label: 'Payment & UPI Setup', iconName: 'CreditCard', visible: true },
        { id: 'reports', label: 'Sales & Reports', iconName: 'TrendingUp', visible: true },
        { id: 'overview', label: 'Catalog Analytics', iconName: 'LayoutDashboard', visible: true },
      ],
    },
    {
      id: 'website_config',
      label: 'Website & Configuration',
      icon: '⚙️',
      collapsed: false,
      visible: true,
      items: [
        { id: 'logo_customization', label: 'Logo Customization', iconName: 'Image', visible: true },
        { id: 'themes_studio', label: 'Global Theme Studio', iconName: 'Palette', visible: true },
        { id: 'website_configuration', label: 'Store Identity & Config', iconName: 'Sliders', visible: true },
        { id: 'website_design', label: 'Design & UI Customizer', iconName: 'Paintbrush', visible: true },
        { id: 'visual_builder', label: 'Visual Website Builder', iconName: 'Layout', visible: true },
        { id: 'product_card_designer', label: 'Product Card Designer', iconName: 'Sparkles', visible: true },
        { id: 'product_feed_settings', label: 'Product Feed Settings', iconName: 'Sliders', visible: true },
        { id: 'categories', label: 'Categories & Highlights', iconName: 'Layers', visible: true },
        { id: 'homepage', label: 'Store Info & Contact', iconName: 'Home', visible: true },
        { id: 'about_us', label: 'About Us Manager', iconName: 'Heart', visible: true },
        { id: 'top_announcement_bar', label: 'Top Announcement Bar', iconName: 'Layers', visible: true },
        { id: 'seo_local_business', label: 'SEO & Local Business', iconName: 'Search', visible: true },
        { id: 'store_management', label: 'Nearby Stores & Outlets', iconName: 'MapPin', visible: true },
      ],
    },
    {
      id: 'administration',
      label: 'Administration & Security',
      icon: '👥',
      collapsed: false,
      visible: true,
      items: [
        { id: 'nav_customizer', label: 'Customize Admin Menu', iconName: 'SlidersHorizontal', visible: true, locked: true },
        { id: 'admin_management', label: 'Multi Admin & RBAC', iconName: 'ShieldCheck', visible: true, locked: true },
        { id: 'audit', label: 'Audit & Security Logs', iconName: 'FileText', visible: true, locked: true },
        { id: 'backups', label: 'Backup & Disaster Recovery', iconName: 'Database', visible: true },
        { id: 'settings', label: '2FA & Security Settings', iconName: 'Settings', visible: true, locked: true },
        { id: 'sound', label: 'Sound Settings', iconName: 'Volume2', visible: true },
        { id: 'versions', label: 'Version History & Rollbacks', iconName: 'History', visible: true },
        { id: 'password', label: 'Change Password', iconName: 'KeyRound', visible: true },
      ],
    },
  ],
};

export function sanitizeAdminNavConfig(raw: any): AdminNavConfig {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.groups)) {
    return DEFAULT_ADMIN_NAV_CONFIG;
  }

  // Collect all item IDs currently in raw
  const existingItemIds = new Set<string>();
  const sanitizedGroups: AdminNavGroupConfig[] = [];

  raw.groups.forEach((g: any) => {
    if (!g || typeof g !== 'object' || typeof g.id !== 'string') return;

    const items: AdminNavItemConfig[] = [];
    if (Array.isArray(g.items)) {
      g.items.forEach((it: any) => {
        if (!it || typeof it !== 'object' || typeof it.id !== 'string') return;

        existingItemIds.add(it.id);

        items.push({
          id: it.id,
          label: typeof it.label === 'string' ? it.label : it.id,
          iconName: typeof it.iconName === 'string' ? it.iconName : 'Sliders',
          visible: typeof it.visible === 'boolean' ? it.visible : true,
          locked: typeof it.locked === 'boolean' ? it.locked : false,
        });
      });
    }

    sanitizedGroups.push({
      id: g.id,
      label: typeof g.label === 'string' ? g.label : g.id,
      icon: typeof g.icon === 'string' ? g.icon : '📁',
      collapsed: typeof g.collapsed === 'boolean' ? g.collapsed : false,
      visible: typeof g.visible === 'boolean' ? g.visible : true,
      items,
    });
  });

  // Ensure default groups exist if user cleared them
  DEFAULT_ADMIN_NAV_CONFIG.groups.forEach((defGroup) => {
    let group = sanitizedGroups.find((sg) => sg.id === defGroup.id);
    if (!group) {
      group = { ...defGroup, items: [] };
      sanitizedGroups.push(group);
    }

    // Append any default items that are missing from raw config
    defGroup.items.forEach((defItem) => {
      if (!existingItemIds.has(defItem.id)) {
        group!.items.push({ ...defItem });
        existingItemIds.add(defItem.id);
      }
    });
  });

  return {
    groups: sanitizedGroups,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
    updatedBy: typeof raw.updatedBy === 'string' ? raw.updatedBy : undefined,
  };
}
