import { HomepagePreset, HomepageSection } from '../types';
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  FLOATING_SNEAKER_DEFAULT_SECTION,
  MBH_SHOE_CAROUSEL_DEFAULT_SECTION,
} from './defaultHomepagePresets';

export const MARKETPLACE_PRESETS: HomepagePreset[] = [
  // 0. MBH Premium Shoe Carousel
  {
    id: 'mkt_mbh_shoe_carousel',
    name: '👟 MBH Premium Shoe Carousel',
    description: 'Ultra-luxurious 3D floating shoe carousel showcase with glassmorphic cards, customizable badges, interactive slides, and original MBH branding.',
    previewColor: '#faf8f5',
    badge: 'NEW 3D HERO',
    category: 'Sneakers',
    tags: ['Sneakers', '3D Showcase', 'Glassmorphism', 'MBH Luxury', 'Carousel'],
    config: {
      name: 'MBH Premium Shoe Carousel Showcase',
      presetName: 'MBH Premium Shoe Carousel',
      themeMode: 'glassmorphic',
      sections: [
        MBH_SHOE_CAROUSEL_DEFAULT_SECTION,
        ...DEFAULT_HOMEPAGE_SECTIONS.filter((s) => s.type !== 'hero_banner' && s.type !== 'floating_sneaker' && s.type !== 'mbh_shoe_carousel'),
      ],
    },
  },
  // 1. Premium Marketplace Elite
  {
    id: 'mkt_premium_marketplace_elite',
    name: '👑 Premium Marketplace Elite',
    description: 'Original luxury marketplace storefront inspired by modern international footwear UX. Clean off-white canvas, large whitespace, rounded glassmorphic cards, footwear category strip, collapsible filters, and luxury product cards.',
    previewColor: '#f8fafc',
    badge: 'LUXURY ELITE',
    category: 'Footwear Marketplace',
    tags: ['Footwear', 'Luxury', 'Marketplace', 'Minimal', 'Modern', 'Elite'],
    config: {
      name: 'Premium Marketplace Elite Storefront',
      presetName: 'Premium Marketplace Elite',
      themeMode: 'luxury',
      sections: [
        FLOATING_SNEAKER_DEFAULT_SECTION,
        ...DEFAULT_HOMEPAGE_SECTIONS.filter((s) => s.type !== 'hero_banner' && s.type !== 'floating_sneaker'),
      ],
    },
  },
  // 1. Premium Floating Sneaker
  {
    id: 'mkt_floating_sneaker',
    name: '👟 Premium Floating Sneaker Glass Hero',
    description: 'Ultra-modern footwear hero with 3D centerpiece floating shoe, glassmorphic floating badges, and high-contrast background typography.',
    previewColor: '#f4f2ee',
    badge: '3D SHOWCASE',
    category: 'Sneakers',
    tags: ['Sneakers', 'Glassmorphism', '3D Showcase', 'Luxury', 'Trending'],
    config: {
      name: 'Premium Floating Sneaker Glass Showcase',
      presetName: 'Premium Floating Sneaker',
      themeMode: 'glassmorphic',
      sections: [
        FLOATING_SNEAKER_DEFAULT_SECTION,
        ...DEFAULT_HOMEPAGE_SECTIONS.filter((s) => s.type !== 'hero_banner' && s.type !== 'floating_sneaker'),
      ],
    },
  },

  // 2. Luxury Sneaker Showcase
  {
    id: 'mkt_luxury_sneaker_dark',
    name: '👟 Luxury Sneaker Night Edition',
    description: 'Dark luxury backdrop featuring neon accents, floating air-cushioned shoes, and flash coupon tickers.',
    previewColor: '#09090b',
    badge: 'DARK LUXURY',
    category: 'Sneakers',
    tags: ['Sneakers', 'Dark Mode', 'Luxury', 'Neon Premium'],
    config: {
      name: 'Luxury Sneaker Night Edition',
      presetName: 'Luxury Sneaker Night Edition',
      themeMode: 'dark',
      sections: [
        {
          ...FLOATING_SNEAKER_DEFAULT_SECTION,
          styling: {
            ...FLOATING_SNEAKER_DEFAULT_SECTION.styling,
            bgColor: '#09090b',
            textColor: '#ffffff',
            accentColor: '#10b981',
          },
          contentData: {
            ...FLOATING_SNEAKER_DEFAULT_SECTION.contentData,
            backgroundWord: 'AIRPRO',
            smallHeading: '2026 DARK EDITION • MARUDHAR ATHLETICS',
            mainHeading: 'AIR GLIDE NIGHTSHADE',
            ctaBgColor: '#10b981',
            ctaTextColor: '#000000',
          },
        },
        ...DEFAULT_HOMEPAGE_SECTIONS.filter((s) => s.type !== 'hero_banner' && s.type !== 'floating_sneaker'),
      ],
    },
  },

  // 3. Modern Fashion
  {
    id: 'mkt_modern_fashion',
    name: '👗 Modern Fashion & Runway',
    description: 'High-fashion editorial layout with split banners, category grids, and seasonal collections.',
    previewColor: '#fafaf9',
    badge: 'FASHION',
    category: 'Fashion',
    tags: ['Fashion', 'Modern', 'Boutique', 'Lifestyle'],
    config: {
      name: 'Modern Fashion Runway',
      presetName: 'Modern Fashion',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 4. Premium Boutique
  {
    id: 'mkt_premium_boutique',
    name: '💎 Premium Handcrafted Boutique',
    description: 'Soft cream background with rose-gold accents, artisan story blocks, and curated product collections.',
    previewColor: '#fff8f6',
    badge: 'BOUTIQUE',
    category: 'Boutique',
    tags: ['Boutique', 'Luxury', 'Elegant', 'Women'],
    config: {
      name: 'Premium Handcrafted Boutique',
      presetName: 'Premium Boutique',
      themeMode: 'luxury',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 5. Luxury Leather
  {
    id: 'mkt_luxury_leather',
    name: '👞 Royal Burnished Leather Studio',
    description: 'Deep amber and cognac leather tones, showcasing Italian loafers and genuine leather boots.',
    previewColor: '#1c1917',
    badge: 'LEATHER',
    category: 'Luxury Leather',
    tags: ['Luxury Leather', 'Black & Gold', 'Men', 'Luxury'],
    config: {
      name: 'Royal Burnished Leather Studio',
      presetName: 'Luxury Leather',
      themeMode: 'luxury',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 6. Minimal White
  {
    id: 'mkt_minimal_white',
    name: '⚪ Minimal Pure White Studio',
    description: 'A pure, unadorned white layout with spacious padding, crisp typography, and subtle border dividers.',
    previewColor: '#ffffff',
    badge: 'MINIMAL',
    category: 'Minimal White',
    tags: ['Minimal White', 'Minimal', 'Apple Inspired'],
    config: {
      name: 'Minimal Pure White Studio',
      presetName: 'Minimal White',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 7. Black Luxury
  {
    id: 'mkt_black_luxury',
    name: '🖤 Black Luxury & Gold Accents',
    description: 'Jet black canvas paired with metallic gold highlights and high-contrast product cards.',
    previewColor: '#000000',
    badge: 'BLACK GOLD',
    category: 'Black & Gold',
    tags: ['Black & Gold', 'Dark Mode', 'Luxury', 'Dark Premium'],
    config: {
      name: 'Black Luxury & Gold',
      presetName: 'Black Luxury',
      themeMode: 'dark',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 8. Apple Inspired
  {
    id: 'mkt_apple_inspired',
    name: '🍏 Apple Inspired Ultra-Clean',
    description: 'Product-first design with smooth blur overlays, rounded pills, and bold display headings.',
    previewColor: '#f5f5f7',
    badge: 'APPLE STYLE',
    category: 'Apple Inspired',
    tags: ['Apple Inspired', 'Minimal White', 'Modern', 'Future Tech'],
    config: {
      name: 'Apple Inspired Ultra-Clean',
      presetName: 'Apple Inspired',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 9. Editorial Fashion
  {
    id: 'mkt_editorial_fashion',
    name: '📰 Editorial Fashion Magazine',
    description: 'Vogue-style typography, asymmetric grid layouts, and full-bleed image storytelling.',
    previewColor: '#f7f6f2',
    badge: 'MAGAZINE',
    category: 'Magazine',
    tags: ['Magazine', 'Fashion', 'Editorial', 'Boutique'],
    config: {
      name: 'Editorial Fashion Magazine',
      presetName: 'Editorial Fashion',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 10. Sports Collection
  {
    id: 'mkt_sports_collection',
    name: '⚡ High Performance Sports Store',
    description: 'Aggressive athletic styling with emerald neon banners, speed tickers, and cushion sole callouts.',
    previewColor: '#052e16',
    badge: 'SPORTS',
    category: 'Sports',
    tags: ['Sports', 'Sneakers', 'Trending', 'Dark Mode'],
    config: {
      name: 'High Performance Sports Store',
      presetName: 'Sports Collection',
      themeMode: 'dark',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 11. Running Shoes
  {
    id: 'mkt_running_shoes',
    name: '🏃 Marathon & Trail Running',
    description: 'Engineered for athletes: breathability indicators, cloud foam soles, and runner reviews.',
    previewColor: '#0f172a',
    badge: 'RUNNING',
    category: 'Sneakers',
    tags: ['Sneakers', 'Sports', 'Trending'],
    config: {
      name: 'Marathon & Trail Running',
      presetName: 'Running Shoes',
      themeMode: 'dark',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 12. Lifestyle
  {
    id: 'mkt_lifestyle_everyday',
    name: '☕ Casual Everyday Lifestyle',
    description: 'Warm earth tones, daily walk sneakers, and comfortable casual footwear showcases.',
    previewColor: '#f5f5f4',
    badge: 'LIFESTYLE',
    category: 'Lifestyle',
    tags: ['Lifestyle', 'Modern', 'Seasonal'],
    config: {
      name: 'Casual Everyday Lifestyle',
      presetName: 'Lifestyle',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 13. Festival Sale
  {
    id: 'mkt_festival_sale',
    name: '🎉 Grand Festive Utsav Sale',
    description: 'Vibrant celebratory banner, live countdown timer, and festival gift vouchers.',
    previewColor: '#881337',
    badge: 'FESTIVAL',
    category: 'Festival',
    tags: ['Festival', 'Trending', 'Colorful', 'Offer Landing'],
    config: {
      name: 'Grand Festive Utsav Sale',
      presetName: 'Festival Sale',
      themeMode: 'festival',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 14. Diwali Royal Utsav
  {
    id: 'mkt_diwali_royal',
    name: '🪔 Shubh Diwali Royal Gold Special',
    description: 'Rich royal maroon & gold aesthetics with handcrafted jutti highlights and festive coupon discounts.',
    previewColor: '#450a0a',
    badge: 'DIWALI',
    category: 'Festival',
    tags: ['Festival', 'Wedding', 'Black & Gold', 'Luxury'],
    config: {
      name: 'Shubh Diwali Royal Gold Special',
      presetName: 'Diwali',
      themeMode: 'festival',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 15. Holi Vibrant Color Splash
  {
    id: 'mkt_holi_colors',
    name: '🎨 Holi Color Splash Celebration',
    description: 'Bright multi-color gradient hero with festival discounts and washable outdoor sneakers.',
    previewColor: '#581c87',
    badge: 'HOLI',
    category: 'Festival',
    tags: ['Festival', 'Colorful', 'Seasonal'],
    config: {
      name: 'Holi Color Splash Celebration',
      presetName: 'Holi',
      themeMode: 'festival',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 16. Raksha Bandhan
  {
    id: 'mkt_rakhi_special',
    name: '🎁 Raksha Bandhan Gift Box Edition',
    description: 'Sibling footwear gift sets, customizable greeting packaging, and instant coupon codes.',
    previewColor: '#831843',
    badge: 'RAKHI',
    category: 'Festival',
    tags: ['Festival', 'Boutique', 'Seasonal'],
    config: {
      name: 'Raksha Bandhan Gift Box Edition',
      presetName: 'Raksha Bandhan',
      themeMode: 'festival',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 17. Independence Day
  {
    id: 'mkt_independence_day',
    name: '🇮🇳 Swadeshi Pride 15th August Special',
    description: 'Celebrating Indian craftsmanship, direct Pipar City factory prices, and free shipping.',
    previewColor: '#064e3b',
    badge: 'FREEDOM SALE',
    category: 'Festival',
    tags: ['Festival', 'Corporate', 'Seasonal'],
    config: {
      name: 'Swadeshi Pride 15th August Special',
      presetName: 'Independence Day',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 18. Republic Day
  {
    id: 'mkt_republic_day',
    name: '🇮🇳 Republic Day Special Savings',
    description: 'Tricolor patriotic accents, top-rated formal shoes, and open box delivery guarantee.',
    previewColor: '#0284c7',
    badge: '26TH JAN',
    category: 'Festival',
    tags: ['Festival', 'Corporate', 'Seasonal'],
    config: {
      name: 'Republic Day Special Savings',
      presetName: 'Republic Day',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 19. Christmas Holiday Magic
  {
    id: 'mkt_christmas_magic',
    name: '🎄 Merry Christmas Winter Gala',
    description: 'Emerald green & deep crimson winter theme with holiday gift cards and snow particle effects.',
    previewColor: '#064e3b',
    badge: 'CHRISTMAS',
    category: 'Christmas',
    tags: ['Christmas', 'Winter', 'Festival', 'Seasonal'],
    config: {
      name: 'Merry Christmas Winter Gala',
      presetName: 'Christmas',
      themeMode: 'festival',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 20. New Year Midnight Sparkle
  {
    id: 'mkt_new_year',
    name: '🎆 New Year Midnight Gala 2026',
    description: 'Glamorous champagne and obsidian gold theme for party footwear and formal leather.',
    previewColor: '#09090b',
    badge: 'NEW YEAR 2026',
    category: 'New Year',
    tags: ['New Year', 'Black & Gold', 'Dark Mode'],
    config: {
      name: 'New Year Midnight Gala 2026',
      presetName: 'New Year',
      themeMode: 'dark',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 21. Monsoon Collection
  {
    id: 'mkt_monsoon_splash',
    name: '🌧️ Monsoon Splash & Waterproof Footwear',
    description: 'Waterproof rubber soles, quick-dry sandals, and anti-slip rainy day grip collection.',
    previewColor: '#0c4a6e',
    badge: 'MONSOON',
    category: 'Monsoon Collection',
    tags: ['Monsoon Collection', 'Seasonal', 'Sports'],
    config: {
      name: 'Monsoon Splash & Waterproof Footwear',
      presetName: 'Monsoon Collection',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 22. Wedding Collection
  {
    id: 'mkt_wedding_royal',
    name: '👑 Royal Wedding & Bride Groom Couture',
    description: 'Gilded embroidery, velvet loafers, hand-embroidered zari juttis, and bridal footwear.',
    previewColor: '#450a0a',
    badge: 'WEDDING',
    category: 'Wedding',
    tags: ['Wedding Collection', 'Wedding', 'Luxury', 'Black & Gold'],
    config: {
      name: 'Royal Wedding & Bride Groom Couture',
      presetName: 'Wedding Collection',
      themeMode: 'luxury',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 23. Kids Collection
  {
    id: 'mkt_kids_fun',
    name: '🎈 Kids & Junior Playtime Footwear',
    description: 'Vibrant, durable, lightweight sneakers and easy-wear Velcro shoes for school and sports.',
    previewColor: '#0284c7',
    badge: 'KIDS',
    category: 'Kids',
    tags: ['Kids Collection', 'Kids', 'Colorful', 'Retail'],
    config: {
      name: 'Kids & Junior Playtime Footwear',
      presetName: 'Kids Collection',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 24. Women's Collection
  {
    id: 'mkt_womens_couture',
    name: '👠 Women’s Royal Heels & Ethnic Mojris',
    description: 'Chic stilettos, embroidered wedges, block heels, and daily comfort ethnic flats.',
    previewColor: '#831843',
    badge: 'WOMEN',
    category: 'Fashion',
    tags: ["Women's Collection", 'Fashion', 'Boutique', 'Elegant'],
    config: {
      name: "Women's Royal Heels & Ethnic Mojris",
      presetName: "Women's Collection",
      themeMode: 'luxury',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 25. Men's Collection
  {
    id: 'mkt_mens_executive',
    name: '💼 Men’s Executive & Formal Shoes',
    description: 'Oxford dress shoes, monk straps, Chelsea boots, and genuine leather slip-ons.',
    previewColor: '#1c1917',
    badge: 'MEN',
    category: 'Fashion',
    tags: ["Men's Collection", 'Fashion', 'Corporate', 'Luxury Leather'],
    config: {
      name: "Men's Executive & Formal Shoes",
      presetName: "Men's Collection",
      themeMode: 'luxury',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 26. Luxury Glass
  {
    id: 'mkt_luxury_glass',
    name: '🔮 Glassmorphic Luxury Studio',
    description: 'Frosted backdrop panels, glowing blur circles, and glass card controls.',
    previewColor: '#1e1b4b',
    badge: 'GLASSMORPHISM',
    category: 'Glassmorphism',
    tags: ['Luxury Glass', 'Glassmorphism', 'Future Tech', 'Dark Mode'],
    config: {
      name: 'Glassmorphic Luxury Studio',
      presetName: 'Luxury Glass',
      themeMode: 'glassmorphic',
      sections: [
        FLOATING_SNEAKER_DEFAULT_SECTION,
        ...DEFAULT_HOMEPAGE_SECTIONS.filter((s) => s.type !== 'hero_banner' && s.type !== 'floating_sneaker'),
      ],
    },
  },

  // 27. Dynamic Video Hero
  {
    id: 'mkt_video_hero',
    name: '🎥 Dynamic Motion Video Showcase',
    description: 'HD auto-playing video backdrop with title overlay and direct product purchase drawer.',
    previewColor: '#0f172a',
    badge: 'VIDEO',
    category: 'Modern',
    tags: ['Dynamic Video Hero', 'Modern', 'Lifestyle'],
    config: {
      name: 'Dynamic Motion Video Showcase',
      presetName: 'Dynamic Video Hero',
      themeMode: 'dark',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 28. Magazine Layout
  {
    id: 'mkt_magazine_runway',
    name: '📰 Runway Lookbook Magazine Layout',
    description: 'High-contrast typography blocks, story articles, and editorial product carousels.',
    previewColor: '#fafaf9',
    badge: 'MAGAZINE',
    category: 'Magazine',
    tags: ['Magazine Layout', 'Magazine', 'Fashion', 'Editorial'],
    config: {
      name: 'Runway Lookbook Magazine Layout',
      presetName: 'Magazine Layout',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 29. Split Screen
  {
    id: 'mkt_split_screen',
    name: '⚖️ Dual Split-Screen Spotlight',
    description: '50/50 dual hero split for Men vs Women or Sports vs Luxury.',
    previewColor: '#18181b',
    badge: 'SPLIT SCREEN',
    category: 'Modern',
    tags: ['Split Screen', 'Modern', 'Minimal'],
    config: {
      name: 'Dual Split-Screen Spotlight',
      presetName: 'Split Screen',
      themeMode: 'dark',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 30. Parallax Landing
  {
    id: 'mkt_parallax_landing',
    name: '🌌 Deep Space Parallax Landing',
    description: 'Multi-layered scrolling depth effect with glowing floating shoes and particle effects.',
    previewColor: '#030712',
    badge: 'PARALLAX',
    category: 'Modern',
    tags: ['Parallax Landing', 'Future Tech', 'Modern'],
    config: {
      name: 'Deep Space Parallax Landing',
      presetName: 'Parallax Landing',
      themeMode: 'dark',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 31. 3D Showcase
  {
    id: 'mkt_3d_showcase',
    name: '🌐 Interactive 3D Orbit Showcase',
    description: 'Interactive product rotation angle controls, exploded cushion view, and specs popups.',
    previewColor: '#09090b',
    badge: '3D ORBIT',
    category: '3D Showcase',
    tags: ['3D Showcase', 'Glassmorphism', 'Future Tech'],
    config: {
      name: 'Interactive 3D Orbit Showcase',
      presetName: '3D Showcase',
      themeMode: 'glassmorphic',
      sections: [
        FLOATING_SNEAKER_DEFAULT_SECTION,
        ...DEFAULT_HOMEPAGE_SECTIONS.filter((s) => s.type !== 'hero_banner' && s.type !== 'floating_sneaker'),
      ],
    },
  },

  // 32. AI Creative
  {
    id: 'mkt_ai_creative',
    name: '✨ AI Generated Creative Matrix',
    description: 'Dynamic neural layout optimized for personal conversion based on trending buyer behavior.',
    previewColor: '#312e81',
    badge: 'AI CREATIVE',
    category: 'AI Generated',
    tags: ['AI Creative', 'AI Generated', 'Future Tech'],
    config: {
      name: 'AI Generated Creative Matrix',
      presetName: 'AI Creative',
      themeMode: 'glassmorphic',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 33. Neon Premium
  {
    id: 'mkt_neon_premium',
    name: '⚡ Cyber Neon Streetwear',
    description: 'Cyberpunk neon cyan & magenta highlights, street culture sneakers, and limited drops.',
    previewColor: '#020617',
    badge: 'NEON STREET',
    category: 'Dark Mode',
    tags: ['Neon Premium', 'Dark Mode', 'Future Tech'],
    config: {
      name: 'Cyber Neon Streetwear',
      presetName: 'Neon Premium',
      themeMode: 'dark',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 34. Dark Premium
  {
    id: 'mkt_dark_premium',
    name: '🖤 Obsidian Dark Premium',
    description: 'Deep matte dark backdrop with soft white text and gold border highlights.',
    previewColor: '#09090b',
    badge: 'DARK PREMIUM',
    category: 'Dark Mode',
    tags: ['Dark Premium', 'Black & Gold', 'Luxury'],
    config: {
      name: 'Obsidian Dark Premium',
      presetName: 'Dark Premium',
      themeMode: 'dark',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 35. Elegant White
  {
    id: 'mkt_elegant_white',
    name: '✨ Pearl Elegant White',
    description: 'Pristine ivory layout with soft gold accents and delicate serifs.',
    previewColor: '#fafaf9',
    badge: 'ELEGANT',
    category: 'Elegant',
    tags: ['Elegant White', 'Minimal White', 'Boutique'],
    config: {
      name: 'Pearl Elegant White',
      presetName: 'Elegant White',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 36. Gradient Luxury
  {
    id: 'mkt_gradient_luxury',
    name: '🌈 Aurora Gradient Luxury',
    description: 'Vibrant sunset aurora gradient hero with smooth backdrop blur and high-conversion buttons.',
    previewColor: '#2e1065',
    badge: 'GRADIENT',
    category: 'Colorful',
    tags: ['Gradient Luxury', 'Colorful', 'Modern'],
    config: {
      name: 'Aurora Gradient Luxury',
      presetName: 'Gradient Luxury',
      themeMode: 'glassmorphic',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 37. Interactive Collection
  {
    id: 'mkt_interactive_collection',
    name: '🎛️ Interactive Filter Collection',
    description: 'Instant multi-tag filter grid for quick category exploration without full page reloads.',
    previewColor: '#f1f5f9',
    badge: 'INTERACTIVE',
    category: 'Modern',
    tags: ['Interactive Collection', 'Retail', 'Modern'],
    config: {
      name: 'Interactive Filter Collection',
      presetName: 'Interactive Collection',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 38. Premium Carousel
  {
    id: 'mkt_premium_carousel',
    name: '🎠 Infinite Multi-Banner Carousel',
    description: 'Seamless auto-sliding hero banners highlighting active offers, new arrivals, and reviews.',
    previewColor: '#0f172a',
    badge: 'CAROUSEL',
    category: 'Modern',
    tags: ['Premium Carousel', 'Modern', 'Retail'],
    config: {
      name: 'Infinite Multi-Banner Carousel',
      presetName: 'Premium Carousel',
      themeMode: 'dark',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 39. Brand Story
  {
    id: 'mkt_brand_story',
    name: '📜 Pipar City Craftsmanship Heritage',
    description: 'Rich narrative layout sharing our store legacy since 1998 with artisan spotlight cards.',
    previewColor: '#fffbeb',
    badge: 'HERITAGE',
    category: 'Corporate',
    tags: ['Brand Story', 'Corporate', 'Minimal'],
    config: {
      name: 'Pipar City Craftsmanship Heritage',
      presetName: 'Brand Story',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 40. Limited Edition Drop
  {
    id: 'mkt_limited_edition',
    name: '🔥 Limited Edition Hype Drop',
    description: 'Urgency countdown ticker, stock remaining indicator, and exclusive VIP release access.',
    previewColor: '#18181b',
    badge: 'LIMITED DROP',
    category: 'Sneakers',
    tags: ['Limited Edition', 'Sneakers', 'Trending'],
    config: {
      name: 'Limited Edition Hype Drop',
      presetName: 'Limited Edition',
      themeMode: 'dark',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 41. Mega Flash Sale Express
  {
    id: 'mkt_flash_sale_express',
    name: '⚡ Mega Flash Sale 24H Express',
    description: 'High-urgency deal banners, instant copy coupon chips, and best seller quick buy grid.',
    previewColor: '#991b1b',
    badge: 'FLASH SALE',
    category: 'Trending',
    tags: ['Flash Sale', 'Trending', 'Retail'],
    config: {
      name: 'Mega Flash Sale 24H Express',
      presetName: 'Flash Sale',
      themeMode: 'festival',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 42. Offer Landing Spotlight
  {
    id: 'mkt_offer_landing',
    name: '🏷️ Deal Spotlight Landing Page',
    description: 'Focused single-promotion landing layout optimized for ad campaigns and social traffic.',
    previewColor: '#1e3a8a',
    badge: 'OFFER PAGE',
    category: 'Retail',
    tags: ['Offer Landing', 'Retail', 'Seasonal'],
    config: {
      name: 'Deal Spotlight Landing Page',
      presetName: 'Offer Landing',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 43. Fresh New Arrivals Studio
  {
    id: 'mkt_new_arrivals_studio',
    name: '✨ Fresh New Season Arrivals',
    description: 'Focusing on this week’s factory drops with video highlights and customer reviews.',
    previewColor: '#fafafa',
    badge: 'NEW ARRIVALS',
    category: 'Modern',
    tags: ['New Arrivals', 'Fashion', 'Modern'],
    config: {
      name: 'Fresh New Season Arrivals',
      presetName: 'New Arrivals',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 44. Trending Products
  {
    id: 'mkt_trending_products',
    name: '📈 India’s Most Wanted Footwear',
    description: 'Data-driven trending product showcase based on real order volume in Pipar City & pan-India.',
    previewColor: '#f8fafc',
    badge: 'TRENDING NOW',
    category: 'Trending',
    tags: ['Trending Products', 'Retail', 'Lifestyle'],
    config: {
      name: 'India’s Most Wanted Footwear',
      presetName: 'Trending Products',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 45. All-Time Best Sellers
  {
    id: 'mkt_best_sellers_gold',
    name: '🏆 All-Time Best Sellers Gold Edition',
    description: 'Highlighting our top 10 rated footwear models with verified buyer badges.',
    previewColor: '#111827',
    badge: 'TOP RATED',
    category: 'Retail',
    tags: ['Best Sellers', 'Retail', 'Corporate'],
    config: {
      name: 'All-Time Best Sellers Gold Edition',
      presetName: 'Best Sellers',
      themeMode: 'dark',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 46. Premium Curated Collections
  {
    id: 'mkt_curated_collections',
    name: '📦 Premium Curated Capsule Collections',
    description: 'Handpicked sets: Office Formal, Weekend Casual, Gym Sports, and Royal Wedding.',
    previewColor: '#f5f5f4',
    badge: 'CAPSULES',
    category: 'Boutique',
    tags: ['Premium Collections', 'Luxury', 'Boutique'],
    config: {
      name: 'Premium Curated Capsule Collections',
      presetName: 'Premium Collections',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 47. Designer Curated Picks
  {
    id: 'mkt_designer_picks',
    name: '🎨 Master Craftsman Designer Picks',
    description: 'Exclusive artisanal footwear selected personally by our master cobblers.',
    previewColor: '#292524',
    badge: 'DESIGNER',
    category: 'Boutique',
    tags: ['Designer Picks', 'Fashion', 'Boutique'],
    config: {
      name: 'Master Craftsman Designer Picks',
      presetName: 'Designer Picks',
      themeMode: 'luxury',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 48. Classic Vintage Luxury
  {
    id: 'mkt_classic_vintage',
    name: '📜 Classic Vintage Leather Heritage',
    description: 'Old-world charm, hand-burnished patinas, brass buckles, and traditional crafting heritage.',
    previewColor: '#451a03',
    badge: 'VINTAGE',
    category: 'Luxury Leather',
    tags: ['Classic Luxury', 'Luxury Leather', 'Elegant'],
    config: {
      name: 'Classic Vintage Leather Heritage',
      presetName: 'Classic Luxury',
      themeMode: 'luxury',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 49. Future Tech Cyberstore
  {
    id: 'mkt_future_tech',
    name: '🚀 Future Tech Cyberstore 2030',
    description: 'Futuristic glassmorphism UI with particle grid animations and AI footwear recommendations.',
    previewColor: '#030712',
    badge: 'FUTURE TECH',
    category: 'Glassmorphism',
    tags: ['Future Tech', 'Glassmorphism', 'AI Generated'],
    config: {
      name: 'Future Tech Cyberstore 2030',
      presetName: 'Future Tech',
      themeMode: 'glassmorphic',
      sections: [
        FLOATING_SNEAKER_DEFAULT_SECTION,
        ...DEFAULT_HOMEPAGE_SECTIONS.filter((s) => s.type !== 'hero_banner' && s.type !== 'floating_sneaker'),
      ],
    },
  },

  // 50. Minimalist Architectural Grid
  {
    id: 'mkt_minimal_architectural',
    name: '📐 Minimalist Architectural Grid',
    description: 'Strict grid alignments, monospaced typography, and subtle monochromatic tones.',
    previewColor: '#f4f4f5',
    badge: 'GRID ARCHITECTURE',
    category: 'Minimal White',
    tags: ['Minimal Luxury', 'Minimal White', 'Modern'],
    config: {
      name: 'Minimalist Architectural Grid',
      presetName: 'Minimal Luxury',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 51. Summer Breeze Vacation
  {
    id: 'mkt_summer_breeze',
    name: '☀️ Summer Breeze & Resort Sandals',
    description: 'Lightweight breathable loafers, canvas slip-ons, and beach resort sandals.',
    previewColor: '#0ea5e9',
    badge: 'SUMMER',
    category: 'Summer',
    tags: ['Summer', 'Lifestyle', 'Colorful'],
    config: {
      name: 'Summer Breeze & Resort Sandals',
      presetName: 'Summer Breeze',
      themeMode: 'light',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },

  // 52. Winter Cozy Velvet
  {
    id: 'mkt_winter_cozy',
    name: '❄️ Winter Cozy Boots & Velvet Loafers',
    description: 'Fur-lined winter boots, warm velvet loafers, and cold-weather leather footwear.',
    previewColor: '#1e293b',
    badge: 'WINTER',
    category: 'Winter',
    tags: ['Winter', 'Luxury Leather', 'Seasonal'],
    config: {
      name: 'Winter Cozy Boots & Velvet Loafers',
      presetName: 'Winter Cozy',
      themeMode: 'dark',
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
  },
];

export const MARKETPLACE_CATEGORIES = [
  'All',
  'Favorites',
  'Saved / Custom',
  'Sneakers',
  'Luxury',
  'Fashion',
  'Boutique',
  'Luxury Leather',
  'Minimal White',
  'Black & Gold',
  'Apple Inspired',
  'Sports',
  'Festival',
  'Wedding',
  'Kids',
  'Glassmorphism',
  'Magazine',
  'Modern',
  'Dark Mode',
  'Elegant',
  'Colorful',
  'Seasonal',
  'Summer',
  'Winter',
  'Monsoon Collection',
  'AI Generated',
  'Trending',
] as const;
