import { HomepageConfig, HomepagePreset, HomepageSection, HomepageSectionType } from '../types';

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  {
    id: 'sec_announcements',
    type: 'announcements',
    title: 'Store Announcement Bar',
    subtitle: 'Free Express Shipping Across India',
    enabled: true,
    visibleDevices: ['desktop', 'tablet', 'mobile'],
    styling: {
      bgColor: '#0B8F63',
      textColor: '#FFFFFF',
      paddingTop: 8,
      paddingBottom: 8,
      fullWidth: true,
    },
    contentData: {
      messages: [
        '✨ FREE Express Delivery Across India on Orders Above ₹999!',
        '⚡ Flash Offer: Extra 10% OFF on UPI & Online Payments (Code: MARUDHAR10)',
        '📦 Open Box Delivery Available - Inspect Before Payment!',
        '🏬 Visit Us: Railway Station Road, Pipar City, Jodhpur, Rajasthan',
      ],
      speed: 18,
    },
  },
  {
    id: 'sec_hero_banner',
    type: 'hero_banner',
    title: 'Marudhar Royal Footwear Collection',
    subtitle: 'Crafted for Royalty, Engineered for Supreme Comfort',
    enabled: true,
    visibleDevices: ['desktop', 'tablet', 'mobile'],
    styling: {
      bgColor: '#0F172A',
      bgGradient: 'from-neutral-900 via-neutral-900/90 to-[#0B8F63]/20',
      textColor: '#FFFFFF',
      accentColor: '#0B8F63',
      paddingTop: 48,
      paddingBottom: 48,
      fullWidth: true,
      animation: 'fade',
    },
    contentData: {
      badge: '👑 Royal Edition • Direct from Pipar City',
      heading: 'Step into Royalty & Unmatched Elegance',
      description: 'Explore handcrafted leather loafers, high-performance running sneakers, and Rajasthani zari juttis engineered with air-cushioned comfort.',
      ctaText: 'Explore Collection',
      ctaLink: 'products',
      secondaryCtaText: 'Watch Video Tour',
      secondaryCtaLink: 'about',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
      tagBadges: ['100% Genuine Leather', 'Air Glide Cushioning', 'Free Shipping'],
    },
  },
  {
    id: 'sec_quick_categories',
    type: 'quick_category_icons',
    title: 'Explore Categories',
    subtitle: 'Find your perfect pair in seconds',
    enabled: true,
    visibleDevices: ['desktop', 'tablet', 'mobile'],
    styling: {
      bgColor: '#FFFFFF',
      textColor: '#0F172A',
      paddingTop: 24,
      paddingBottom: 24,
      borderRadius: 16,
    },
    contentData: {
      categories: [
        { id: 'men', name: "Men's Shoes", icon: '👞', categoryFilter: 'men', count: '120+ Styles' },
        { id: 'women', name: "Women's Footwear", icon: '👠', categoryFilter: 'women', count: '95+ Styles' },
        { id: 'kids', name: "Kids & Junior", icon: '👟', categoryFilter: 'kids', count: '60+ Styles' },
        { id: 'accessories', name: 'Accessories & Care', icon: '🧦', categoryFilter: 'accessories', count: '40+ Items' },
        { id: 'juttis', name: 'Royal Juttis', icon: '👑', categoryFilter: 'all', collectionFilter: 'royal', count: 'Handcrafted' },
      ],
    },
  },
  {
    id: 'sec_countdown_timer',
    type: 'countdown_timer',
    title: '⚡ Festival Flash Sale Ending Soon!',
    subtitle: 'Get Up to 50% OFF + Extra 10% Instant UPI Discount',
    enabled: true,
    visibleDevices: ['desktop', 'tablet', 'mobile'],
    styling: {
      bgColor: '#991B1B',
      bgGradient: 'from-amber-600 via-rose-700 to-red-900',
      textColor: '#FFFFFF',
      paddingTop: 20,
      paddingBottom: 20,
      borderRadius: 16,
      shadow: 'lg',
    },
    contentData: {
      targetDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      code: 'FESTIVE50',
      couponDiscount: '50% OFF',
      ctaText: 'Claim Discount Now',
      ctaLink: 'products',
    },
  },
  {
    id: 'sec_best_sellers',
    type: 'best_sellers',
    title: 'Best Sellers in Store',
    subtitle: 'Customer Favorites in Pipar City & Across India',
    enabled: true,
    visibleDevices: ['desktop', 'tablet', 'mobile'],
    styling: {
      bgColor: '#F8FAFC',
      textColor: '#0F172A',
      paddingTop: 32,
      paddingBottom: 32,
    },
    contentData: {
      limit: 8,
      badgeText: '🔥 HOT DEMAND',
      showQuickBuy: true,
    },
  },
  {
    id: 'sec_category_cards',
    type: 'categories',
    title: 'Shop by Family & Gender',
    subtitle: 'Curated footwear crafted for every step of life',
    enabled: true,
    visibleDevices: ['desktop', 'tablet', 'mobile'],
    styling: {
      bgColor: '#FFFFFF',
      textColor: '#0F172A',
      paddingTop: 32,
      paddingBottom: 32,
    },
    contentData: {},
  },
  {
    id: 'sec_offer_cards',
    type: 'offer_cards',
    title: 'Exclusive Deals & Bundles',
    subtitle: 'Limited-time seasonal promotions',
    enabled: true,
    visibleDevices: ['desktop', 'tablet', 'mobile'],
    styling: {
      bgColor: '#FFFFFF',
      textColor: '#0F172A',
      paddingTop: 24,
      paddingBottom: 24,
    },
    contentData: {
      offers: [
        {
          id: 'off_1',
          title: 'ONE 8 Royal Leather Loafers',
          badge: 'FLAT 30% OFF',
          description: 'Handcrafted burnished leather with memory foam insoles.',
          code: 'ROYAL30',
          image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
          bgColor: 'from-amber-900 to-neutral-900',
        },
        {
          id: 'off_2',
          title: 'AirGlide Flyknit Sports Shoes',
          badge: 'BUY 1 GET 1 AT 40% OFF',
          description: 'Responsive cushion soles for sports & daily fitness.',
          code: 'SPORT40',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
          bgColor: 'from-emerald-900 to-slate-900',
        },
      ],
    },
  },
  {
    id: 'sec_new_arrivals',
    type: 'new_arrivals',
    title: 'New Season Arrivals',
    subtitle: 'Fresh drops straight from our craft unit',
    enabled: true,
    visibleDevices: ['desktop', 'tablet', 'mobile'],
    styling: {
      bgColor: '#F8FAFC',
      textColor: '#0F172A',
      paddingTop: 32,
      paddingBottom: 32,
    },
    contentData: {
      limit: 8,
      badgeText: '✨ JUST IN',
    },
  },
  {
    id: 'sec_open_box',
    type: 'open_box_delivery',
    title: 'Open Box Delivery Guarantee',
    subtitle: 'Inspect & try your shoes before paying delivery executive',
    enabled: true,
    visibleDevices: ['desktop', 'tablet', 'mobile'],
    styling: {
      bgColor: '#F0FDF4',
      bgGradient: 'from-emerald-50 via-teal-50 to-emerald-100',
      textColor: '#065F46',
      paddingTop: 24,
      paddingBottom: 24,
      borderRadius: 20,
    },
    contentData: {
      heading: '100% Risk-Free Shopping in Pipar City & All India',
      description: 'Our Open Box Delivery service lets you open the parcel, inspect the shoes, verify fit & leather finish before handing payment to delivery person.',
      badges: ['Inspect Before Pay', 'Zero Hassle Returns', 'Direct Factory Quality'],
    },
  },
  {
    id: 'sec_coupons',
    type: 'coupons',
    title: 'Active Store Coupons',
    subtitle: 'Copy coupon code at checkout for instant savings',
    enabled: true,
    visibleDevices: ['desktop', 'tablet', 'mobile'],
    styling: {
      bgColor: '#FFFFFF',
      textColor: '#0F172A',
      paddingTop: 24,
      paddingBottom: 24,
    },
    contentData: {
      coupons: [
        { code: 'MARUDHAR10', title: '10% Instant UPI Discount', minSpend: '₹499', badge: 'POPULAR' },
        { code: 'WELCOME200', title: '₹200 Flat Off on First Purchase', minSpend: '₹1,200', badge: 'NEW USER' },
        { code: 'ROYAL500', title: '₹500 OFF on Genuine Leather Loafers', minSpend: '₹2,500', badge: 'LEATHER' },
      ],
    },
  },
  {
    id: 'sec_why_choose_us',
    type: 'why_choose_us',
    title: 'Why Shop at Marudhar Fashion Point?',
    subtitle: 'Pipar City’s most trusted footwear destination since 1998',
    enabled: true,
    visibleDevices: ['desktop', 'tablet', 'mobile'],
    styling: {
      bgColor: '#FFFFFF',
      textColor: '#0F172A',
      paddingTop: 32,
      paddingBottom: 32,
    },
    contentData: {
      features: [
        { icon: '🛡️', title: '100% Authentic Quality', desc: 'Hand-inspected pairs with high-grade breathable uppers & durable outsoles.' },
        { icon: '🚚', title: 'Lightning Express Shipping', desc: 'Dispatched within 24 hours directly from Pipar City, Jodhpur.' },
        { icon: '📦', title: 'Open Box Inspection', desc: 'Check shoe size and quality before completing Cash on Delivery.' },
        { icon: '💬', title: 'Direct WhatsApp Support', desc: 'Instant sizing assistance & order tracking via live WhatsApp chat.' },
      ],
    },
  },
  {
    id: 'sec_customer_reviews',
    type: 'customer_reviews',
    title: 'Loved by 50,000+ Happy Customers',
    subtitle: 'Real reviews from Pipar City, Jodhpur & across India',
    enabled: true,
    visibleDevices: ['desktop', 'tablet', 'mobile'],
    styling: {
      bgColor: '#F8FAFC',
      textColor: '#0F172A',
      paddingTop: 32,
      paddingBottom: 32,
    },
    contentData: {},
  },
  {
    id: 'sec_instagram_feed',
    type: 'instagram_feed',
    title: 'Follow Us on Instagram',
    subtitle: '@marudhar_fashion_point • Tag #MarudharStyle to get featured',
    enabled: true,
    visibleDevices: ['desktop', 'tablet', 'mobile'],
    styling: {
      bgColor: '#FFFFFF',
      textColor: '#0F172A',
      paddingTop: 32,
      paddingBottom: 32,
    },
    contentData: {
      postLimit: 8,
    },
  },
  {
    id: 'sec_faqs',
    type: 'faqs',
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about sizing, shipping & returns',
    enabled: true,
    visibleDevices: ['desktop', 'tablet', 'mobile'],
    styling: {
      bgColor: '#F8FAFC',
      textColor: '#0F172A',
      paddingTop: 32,
      paddingBottom: 32,
    },
    contentData: {
      faqs: [
        { q: 'How do I choose the correct shoe size?', a: 'We follow standard Indian/UK sizing (Size 6 to 11). You can also click our Size Guide on product pages or message us on WhatsApp for exact foot length measurements.' },
        { q: 'What is Open Box Delivery?', a: 'When the delivery partner arrives, you can open the box, check the shoes for finish and fitting, and then make payment or accept delivery.' },
        { q: 'How long does shipping take from Pipar City?', a: 'Orders inside Rajasthan deliver in 1-2 days. Metro cities take 2-4 days. Track live updates via SMS & WhatsApp.' },
        { q: 'Can I exchange my shoes if size does not fit?', a: 'Yes! We provide easy 7-day hassle-free size replacements with doorstep pickup.' },
      ],
    },
  },
  {
    id: 'sec_about_store',
    type: 'about_store',
    title: 'Our Story & Pipar City Legacy',
    subtitle: 'Generations of trusted footwear craftsmanship',
    enabled: true,
    visibleDevices: ['desktop', 'tablet', 'mobile'],
    styling: {
      bgColor: '#FFFFFF',
      textColor: '#0F172A',
      paddingTop: 32,
      paddingBottom: 32,
    },
    contentData: {},
  },
];

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  id: 'homepage_default',
  name: 'Marudhar Royal Storefront',
  presetName: 'Marudhar Royal Default',
  themeMode: 'light',
  sections: DEFAULT_HOMEPAGE_SECTIONS,
  updatedAt: new Date().toISOString(),
  updatedBy: 'System Admin',
};

export const HOMEPAGE_PRESETS: HomepagePreset[] = [
  {
    id: 'preset_marudhar_royal',
    name: '👑 Marudhar Royal Heritage',
    description: 'Traditional Rajasthan elegance with gold accents, rich jutti highlights, and high-trust badges.',
    previewColor: '#0F172A',
    badge: 'DEFAULT',
    config: {
      name: 'Marudhar Royal Heritage',
      presetName: 'Marudhar Royal Heritage',
      themeMode: 'luxury',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },
  {
    id: 'preset_nike_athletic',
    name: '⚡ Nike Athletic Performance',
    description: 'High-energy dark athletic layout with bold typography, flash sale tickers, and action sliders.',
    previewColor: '#000000',
    badge: 'SPORTS',
    config: {
      name: 'Athletic Sports Edition',
      presetName: 'Nike Athletic Performance',
      themeMode: 'dark',
      sections: DEFAULT_HOMEPAGE_SECTIONS.map((sec) => {
        if (sec.type === 'hero_banner') {
          return {
            ...sec,
            title: 'UNLEASH YOUR PEAK SPEED',
            subtitle: 'AirGlide Flyknit Technology • Responsive Energy Return',
            styling: {
              ...sec.styling,
              bgColor: '#000000',
              bgGradient: 'from-black via-zinc-900 to-emerald-950',
              accentColor: '#10B981',
            },
            contentData: {
              ...sec.contentData,
              heading: 'UNSTOPPABLE SPEED & AIR CUSHIONING',
              badge: '⚡ PERFORMANCE 2026',
            },
          };
        }
        return sec;
      }),
    },
  },
  {
    id: 'preset_apple_minimal',
    name: '🍏 Apple Ultra-Minimalist',
    description: 'Clean off-white canvas with high-contrast display typography, airy negative space, and sleek cards.',
    previewColor: '#F8FAFC',
    badge: 'CLEAN',
    config: {
      name: 'Ultra-Minimalist Studio',
      presetName: 'Apple Ultra-Minimalist',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS.map((sec) => ({
        ...sec,
        styling: {
          ...sec.styling,
          bgColor: sec.styling.bgColor === '#0F172A' ? '#FFFFFF' : sec.styling.bgColor,
          textColor: sec.styling.bgColor === '#0F172A' ? '#0F172A' : sec.styling.textColor,
        },
      })),
    },
  },
  {
    id: 'preset_festive_rakhi',
    name: '🎉 Festive Celebration (Raksha Bandhan / Diwali)',
    description: 'Festive red-gold theme with countdown timers, gift voucher blocks, and royal festive collections.',
    previewColor: '#881337',
    badge: 'FESTIVAL',
    config: {
      name: 'Festival Celebration Layout',
      presetName: 'Festive Celebration',
      themeMode: 'festival',
      sections: DEFAULT_HOMEPAGE_SECTIONS.map((sec) => {
        if (sec.type === 'hero_banner') {
          return {
            ...sec,
            title: 'Festive & Wedding Dhamaka Collection',
            subtitle: 'Handcrafted Zari Juttis & Designer Formal Shoes',
            styling: {
              ...sec.styling,
              bgColor: '#881337',
              bgGradient: 'from-rose-950 via-red-900 to-amber-900',
              accentColor: '#F59E0B',
            },
            contentData: {
              ...sec.contentData,
              heading: 'Gift Royal Footwear This Festive Season',
              badge: '✨ FESTIVAL SPECIAL • UP TO 50% OFF',
            },
          };
        }
        return sec;
      }),
    },
  },
  {
    id: 'preset_flipkart_deals',
    name: '🏷️ Flipkart Mega Savings Grid',
    description: 'High-density e-commerce layout with deal tickers, coupon cards, and category icon strips.',
    previewColor: '#1E40AF',
    badge: 'HIGH CONVERSION',
    config: {
      name: 'Flipkart Style Mega Deals',
      presetName: 'Flipkart Mega Savings Grid',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },
];

export const SECTION_CATALOG_ITEMS: {
  type: HomepageSectionType;
  title: string;
  category: 'Banners & Media' | 'Product Displays' | 'Promotions & Deals' | 'Content & Story' | 'Trust & Reviews';
  description: string;
  icon: string;
  defaultSection: HomepageSection;
}[] = [
  {
    type: 'hero_banner',
    title: 'Hero Banner / Poster',
    category: 'Banners & Media',
    description: 'Large hero poster with title, CTA buttons, background image/video and badges.',
    icon: '🖼️',
    defaultSection: DEFAULT_HOMEPAGE_SECTIONS[1],
  },
  {
    type: 'slider',
    title: 'Interactive Hero Slider',
    category: 'Banners & Media',
    description: 'Multi-slide image banner with smooth auto-play and touch swiping.',
    icon: '🎞️',
    defaultSection: {
      id: 'sec_slider_new',
      type: 'slider',
      title: 'Trending Banner Carousel',
      subtitle: 'Swipe to explore latest offers',
      enabled: true,
      visibleDevices: ['desktop', 'tablet', 'mobile'],
      styling: { bgColor: '#FFFFFF', paddingTop: 24, paddingBottom: 24 },
      contentData: {
        slides: [
          { title: 'AirGlide Knit Running Series', subtitle: 'Ultra-lightweight mesh', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80', cta: 'Shop Now' },
          { title: 'Handcrafted Royal Leather Loafers', subtitle: 'Memory foam insoles', image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1200&q=80', cta: 'Explore Loafers' },
        ],
      },
    },
  },
  {
    type: 'video_banner',
    title: 'Video Showcase Banner',
    category: 'Banners & Media',
    description: 'HD video background or embedded MP4 product showcase.',
    icon: '🎥',
    defaultSection: {
      id: 'sec_video_new',
      type: 'video_banner',
      title: 'Craftsmanship in Motion',
      subtitle: 'Behind the scenes at Pipar City workshop',
      enabled: true,
      visibleDevices: ['desktop', 'tablet', 'mobile'],
      styling: { bgColor: '#0F172A', textColor: '#FFFFFF', paddingTop: 32, paddingBottom: 32 },
      contentData: {
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-shoes-being-tied-41586-large.mp4',
        heading: 'Handcrafted with Passion & Precision',
        description: 'See how genuine leather and modern soles come together.',
      },
    },
  },
  {
    type: 'best_sellers',
    title: 'Best Sellers Carousel',
    category: 'Product Displays',
    description: 'Auto-scrolling product carousel highlighting top customer choices.',
    icon: '🔥',
    defaultSection: DEFAULT_HOMEPAGE_SECTIONS[4],
  },
  {
    type: 'new_arrivals',
    title: 'New Arrivals Showcase',
    category: 'Product Displays',
    description: 'Fresh products grid or carousel with New badges.',
    icon: '✨',
    defaultSection: DEFAULT_HOMEPAGE_SECTIONS[7],
  },
  {
    type: 'countdown_timer',
    title: 'Flash Sale Countdown Timer',
    category: 'Promotions & Deals',
    description: 'High-urgency ticker with live countdown timer and discount coupon.',
    icon: '⏳',
    defaultSection: DEFAULT_HOMEPAGE_SECTIONS[3],
  },
  {
    type: 'coupons',
    title: 'Store Coupon Strip',
    category: 'Promotions & Deals',
    description: '1-click copyable coupon codes for instant customer discount.',
    icon: '🎟️',
    defaultSection: DEFAULT_HOMEPAGE_SECTIONS[9],
  },
  {
    type: 'open_box_delivery',
    title: 'Open Box Delivery Banner',
    category: 'Trust & Reviews',
    description: 'Highlights risk-free inspection before payment.',
    icon: '📦',
    defaultSection: DEFAULT_HOMEPAGE_SECTIONS[8],
  },
  {
    type: 'why_choose_us',
    title: 'Why Choose Us / Features',
    category: 'Trust & Reviews',
    description: '4-column grid displaying key value propositions and guarantees.',
    icon: '🛡️',
    defaultSection: DEFAULT_HOMEPAGE_SECTIONS[10],
  },
  {
    type: 'faqs',
    title: 'Accordion FAQs',
    category: 'Content & Story',
    description: 'Frequently asked questions with expandable accordion items.',
    icon: '❓',
    defaultSection: DEFAULT_HOMEPAGE_SECTIONS[13],
  },
];
