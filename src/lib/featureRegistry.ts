export type FeatureCategory =
  | 'store'
  | 'orders'
  | 'customer'
  | 'marketing'
  | 'website'
  | 'payment'
  | 'delivery'
  | 'social'
  | 'analytics'
  | 'admin_tools'
  | 'rewards';

export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  defaultEnabled: boolean;
  dependencies?: string[];
  adminVisibility?: boolean;
  storefrontVisibility?: boolean;
  tenantAdminCanControl?: boolean;
}

export const FEATURE_CATEGORIES: { key: FeatureCategory; label: string; description: string }[] = [
  { key: 'store', label: 'Store & Catalog', description: 'Product catalog, reviews, search, and variants' },
  { key: 'orders', label: 'Orders & Checkout', description: 'Order tracking, cancellations, checkout flows' },
  { key: 'customer', label: 'Customer CRM', description: 'Customer accounts, loyalty, and CRM insights' },
  { key: 'marketing', label: 'Marketing & Growth', description: 'Coupons, flash sales, WhatsApp marketing, AI growth' },
  { key: 'website', label: 'Website & Layout', description: 'Homepage sections, banners, store locators, testimonials' },
  { key: 'payment', label: 'Payments & Gateway', description: 'UPI, Payment QR, COD, gateway integrations' },
  { key: 'delivery', label: 'Shipping & Delivery', description: 'Delivery tracking, open box delivery, pincode checks' },
  { key: 'social', label: 'Social & Messaging', description: 'WhatsApp support, Instagram feeds, social sharing' },
  { key: 'analytics', label: 'Analytics & Reports', description: 'Sales reports, traffic analytics, customer insights' },
  { key: 'admin_tools', label: 'Admin Tools', description: 'Product designer, SEO manager, collection manager' },
  { key: 'rewards', label: 'Gamification & Rewards', description: 'Spin the Wheel, Scratch Cards, Lucky Box, Celebrations' },
];

export const FEATURE_REGISTRY: FeatureDefinition[] = [
  // CATEGORY: STORE
  { id: 'products', name: 'Products & Stock', description: 'Core product catalog management and inventory tracking', category: 'store', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'categories', name: 'Categories & Taxonomy', description: 'Hierarchical product category navigation', category: 'store', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'variants', name: 'Product Variants', description: 'Size, color, material, and option variants', category: 'store', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'product_reviews', name: 'Product Reviews', description: 'Customer ratings, photos, and verified reviews', category: 'store', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'wishlist', name: 'Wishlist & Favorites', description: 'Allow customers to save favorite items', category: 'store', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'product_search', name: 'Product Search', description: 'Instant search bar with auto-suggestions', category: 'store', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'product_filters', name: 'Product Filters', description: 'Filter by price, brand, rating, and availability', category: 'store', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'product_recommendations', name: 'Product Recommendations', description: 'AI-assisted related items and cross-sells', category: 'store', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'recently_viewed', name: 'Recently Viewed', description: 'Track items recently viewed by current customer', category: 'store', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'product_comparison', name: 'Product Comparison', description: 'Side-by-side product attribute comparison', category: 'store', defaultEnabled: false, adminVisibility: true, storefrontVisibility: true },

  // CATEGORY: ORDERS
  { id: 'orders_tracking', name: 'Orders & Tracking', description: 'Order lifecycle processing and live status tracking', category: 'orders', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'checkout', name: 'Checkout System', description: 'Multi-step cart checkout with address auto-fill', category: 'orders', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'guest_checkout', name: 'Guest Checkout', description: 'Allow purchases without creating an explicit account', category: 'orders', defaultEnabled: true, adminVisibility: false, storefrontVisibility: true },
  { id: 'order_cancellation', name: 'Order Cancellation', description: 'Self-service customer order cancellation before shipment', category: 'orders', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'returns', name: 'Returns & Refunds', description: 'Return requests and automated refund workflows', category: 'orders', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'open_box_delivery', name: 'Open Box Delivery', description: 'Inspection upon delivery verification badge', category: 'orders', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'order_notifications', name: 'Order Notifications', description: 'Automated SMS and email updates for order status', category: 'orders', defaultEnabled: true, adminVisibility: true, storefrontVisibility: false },

  // CATEGORY: CUSTOMER
  { id: 'customer_crm', name: 'Customer CRM', description: 'Customer profiles, lifetime value, and order history', category: 'customer', defaultEnabled: true, adminVisibility: true, storefrontVisibility: false },
  { id: 'customer_accounts', name: 'Customer Accounts', description: 'Google Sign-In and email user registration', category: 'customer', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'guest_customers', name: 'Guest Customers Management', description: 'Track guest buyer inquiries and orders', category: 'customer', defaultEnabled: true, adminVisibility: true, storefrontVisibility: false },
  { id: 'customer_loyalty', name: 'Customer Loyalty Points', description: 'Reward points earned per purchase', category: 'customer', defaultEnabled: false, adminVisibility: true, storefrontVisibility: true },

  // CATEGORY: MARKETING
  { id: 'marketing_campaigns', name: 'Marketing & Campaigns', description: 'Broad promotional campaign banners and banners', category: 'marketing', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'ai_marketing', name: 'AI Marketing & Growth', description: 'Automated AI product description and campaign generation', category: 'marketing', defaultEnabled: true, adminVisibility: true, storefrontVisibility: false },
  { id: 'coupons', name: 'Coupons & Promotions', description: 'Percentage and flat amount discount coupons', category: 'marketing', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'offers', name: 'Flash Sale & Offers', description: 'Limited-time offer countdown timers', category: 'marketing', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'lucky_box', name: 'Lucky Box', description: 'Surprise discount reveal popups', category: 'marketing', defaultEnabled: true, dependencies: ['coupons'], adminVisibility: true, storefrontVisibility: true },
  { id: 'spin_wheel', name: 'Spin the Wheel', description: 'Gamified fortune wheel for discount coupons', category: 'marketing', defaultEnabled: true, dependencies: ['coupons'], adminVisibility: true, storefrontVisibility: true },
  { id: 'scratch_card', name: 'Scratch Card', description: 'Interactive scratch and win card popups', category: 'marketing', defaultEnabled: true, dependencies: ['coupons'], adminVisibility: true, storefrontVisibility: true },
  { id: 'referral_system', name: 'Referral System', description: 'Refer-a-friend dual reward discount codes', category: 'marketing', defaultEnabled: false, adminVisibility: true, storefrontVisibility: true },
  { id: 'affiliate_system', name: 'Affiliate System', description: 'Affiliate commission links and tracking', category: 'marketing', defaultEnabled: false, adminVisibility: true, storefrontVisibility: false },
  { id: 'whatsapp_marketing', name: 'WhatsApp Marketing', description: 'Bulk WhatsApp campaign broadcasts', category: 'marketing', defaultEnabled: true, dependencies: ['whatsapp_social'], adminVisibility: true, storefrontVisibility: false },
  { id: 'sms_marketing', name: 'SMS Marketing', description: 'Transactional and marketing SMS notifications', category: 'marketing', defaultEnabled: false, adminVisibility: true, storefrontVisibility: false },
  { id: 'email_marketing', name: 'Email Marketing', description: 'Newsletter subscriber management and email blasts', category: 'marketing', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },

  // CATEGORY: WEBSITE
  { id: 'homepage', name: 'Homepage Builder', description: 'Dynamic layout sections, hero banners, and collections', category: 'website', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'about_us', name: 'About Us Page', description: 'Brand story and company history page', category: 'website', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'contact', name: 'Contact & Inquiry Page', description: 'Inquiry forms with Gmail integration', category: 'website', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'store_locator', name: 'Store Locator & Map', description: 'Physical store directory with Google Maps integration', category: 'website', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'announcement_bar', name: 'Announcement Bar', description: 'Top announcement message strip', category: 'website', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'hero_banner', name: 'Hero Banner Slider', description: 'Main hero showcase carousel', category: 'website', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'trending_products', name: 'Trending Products Section', description: 'Curated trending collection grid', category: 'website', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'testimonials', name: 'Testimonials & Reviews', description: 'Customer quotes and social proof widgets', category: 'website', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },

  // CATEGORY: PAYMENT
  { id: 'payment_upi', name: 'UPI Direct Payment', description: 'Direct Google Pay, PhonePe, and Paytm UPI payments', category: 'payment', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'payment_gateway', name: 'Online Payment Gateway', description: 'Razorpay / Stripe credit card and net banking', category: 'payment', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'payment_cod', name: 'Cash on Delivery', description: 'Allow COD for eligible pincodes', category: 'payment', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'payment_qr', name: 'Payment QR Code', description: 'Display dynamic merchant UPI QR code at checkout', category: 'payment', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },

  // CATEGORY: DELIVERY
  { id: 'shipping', name: 'Shipping & Delivery Charges', description: 'Flat rate, tiered, and location-based shipping fees', category: 'delivery', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'pincode_serviceability', name: 'Pincode Serviceability Check', description: 'Instant pincode delivery verification widget', category: 'delivery', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },

  // CATEGORY: SOCIAL
  { id: 'whatsapp_social', name: 'WhatsApp Chat & Support', description: 'Floating WhatsApp support widget for customers', category: 'social', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'instagram_feed', name: 'Instagram Feed Widget', description: 'Embedded live Instagram shoppable feed', category: 'social', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
  { id: 'social_sharing', name: 'Social Sharing Buttons', description: 'One-click product share buttons', category: 'social', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },

  // CATEGORY: ANALYTICS
  { id: 'sales_reports', name: 'Sales Reports', description: 'Detailed breakdown of sales, revenue, and tax', category: 'analytics', defaultEnabled: true, adminVisibility: true, storefrontVisibility: false },
  { id: 'revenue_analytics', name: 'Revenue Analytics', description: 'Interactive revenue charts and order growth trends', category: 'analytics', defaultEnabled: true, adminVisibility: true, storefrontVisibility: false },
  { id: 'customer_analytics', name: 'Customer Analytics', description: 'Repeat buyer rates and average order value metrics', category: 'analytics', defaultEnabled: true, adminVisibility: true, storefrontVisibility: false },

  // CATEGORY: ADMIN_TOOLS
  { id: 'product_card_designer', name: 'Product Card Designer', description: 'Customize storefront product card badges and layout', category: 'admin_tools', defaultEnabled: true, adminVisibility: true, storefrontVisibility: false },
  { id: 'seo_manager', name: 'SEO & Local Business Config', description: 'Meta tags, structured data, and Google Search indexation', category: 'admin_tools', defaultEnabled: true, adminVisibility: true, storefrontVisibility: false },
  { id: 'trending_shoes_manager', name: 'Hero Shoe / Feature Showcase', description: 'Specialized 3D / hero showcase item manager', category: 'admin_tools', defaultEnabled: true, adminVisibility: true, storefrontVisibility: false },

  // CATEGORY: REWARDS
  { id: 'order_celebration', name: 'Order Success Celebration', description: 'Confetti and victory animation on successful payment', category: 'rewards', defaultEnabled: true, adminVisibility: true, storefrontVisibility: true },
];

export function getAllFeatures(): FeatureDefinition[] {
  return FEATURE_REGISTRY;
}

export function getFeaturesByCategory(category: FeatureCategory): FeatureDefinition[] {
  return FEATURE_REGISTRY.filter((f) => f.category === category);
}

export function getFeatureById(featureId: string): FeatureDefinition | undefined {
  return FEATURE_REGISTRY.find((f) => f.id === featureId);
}

export function getDefaultFeatureConfig(): Record<string, boolean> {
  const config: Record<string, boolean> = {};
  FEATURE_REGISTRY.forEach((f) => {
    config[f.id] = f.defaultEnabled;
  });
  return config;
}

export function checkFeatureDependencies(
  featureId: string,
  enabledMap: Record<string, boolean>
): { satisfied: boolean; missing: string[] } {
  const feat = getFeatureById(featureId);
  if (!feat || !feat.dependencies || feat.dependencies.length === 0) {
    return { satisfied: true, missing: [] };
  }

  const missing: string[] = [];
  for (const depId of feat.dependencies) {
    if (!enabledMap[depId]) {
      const depFeat = getFeatureById(depId);
      missing.push(depFeat ? depFeat.name : depId);
    }
  }

  return { satisfied: missing.length === 0, missing };
}
