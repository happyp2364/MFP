export interface ShopImageItem {
  id: string;
  filename: string;
  title: string;
  caption: string;
  category: 'shop_outside' | 'shop_inside' | 'promotional_banner' | 'brand_emblem' | 'branding' | 'merchandise' | 'team';
  url: string;
  fallbackUrl: string;
  aspectRatio: '16:9' | '4:3' | '1:1' | '3:4' | '21:9';
  recommendedPlacements: string[];
}

/**
 * AUTHENTIC REAL MARUDHAR FASHION POINT SHOP PHOTOGRAPHS
 * Classified and categorized for smart placement across the application.
 */
export const REAL_MARUDHAR_SHOP_IMAGES: ShopImageItem[] = [
  {
    id: 'marudhar_logo',
    filename: 'marudhar logo.png',
    title: 'Marudhar Boot House Official Logo',
    caption: 'Official emblem featuring shopping bag, sneaker icon and tagline: Marudhar Boot House - The Brand of Pipar.',
    category: 'branding',
    url: '/images/shop/marudhar_logo.png',
    fallbackUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="%230a0a0a"><rect width="400" height="400" rx="24" fill="%230a0a0a"/><rect x="100" y="80" width="200" height="200" rx="16" fill="none" stroke="white" stroke-width="8"/><path d="M160 80V60C160 48.95 168.95 40 180 40H220C231.05 40 240 48.95 240 60V80" fill="none" stroke="white" stroke-width="8"/><path d="M140 160L180 120H220L260 160V220H140V160Z" fill="none" stroke="white" stroke-width="6"/><path d="M160 210C180 190 220 190 240 210" fill="none" stroke="white" stroke-width="6"/><text x="200" y="320" fill="white" font-family="sans-serif" font-size="22" font-weight="900" text-anchor="middle" letter-spacing="2">MARUDHAR</text><text x="200" y="350" fill="white" font-family="sans-serif" font-size="18" font-weight="800" text-anchor="middle" letter-spacing="1">BOOT HOUSE</text><text x="200" y="375" fill="%23d4af37" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="2">THE BRAND OF PIPAR</text></svg>',
    aspectRatio: '1:1',
    recommendedPlacements: ['Site Navigation Header', 'Footer Brand Emblem', 'Store Locator Signboard']
  },
  {
    id: 'shop_exterior_pipar_front',
    filename: '20241225_164346.jpg',
    title: 'Marudhar Boot House Main Exterior & Signboard',
    caption: 'Real outdoor view of Marudhar Boot House in Pipar City Main Market featuring overhead Hindi signboard and store entrance.',
    category: 'shop_outside',
    url: '/images/shop/shop_exterior_pipar_front.jpg',
    fallbackUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="none"><rect width="800" height="600" fill="%23171717"/><rect x="100" y="60" width="600" height="120" fill="%23854d0e" rx="12"/><text x="400" y="115" fill="white" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">मरुधर बूट हाऊस - पीपाड़ शहर</text><text x="400" y="150" fill="%23fef08a" font-family="sans-serif" font-size="16" text-anchor="middle">मनपसंद जूतों का एकमात्र शोरूम • Contact: 9782482250</text><rect x="140" y="220" width="520" height="320" fill="%23262626" rx="16" stroke="%23ca8a04" stroke-width="4"/><text x="400" y="380" fill="%23e5e5e5" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">Main Store Front • Jojri Nadi Road</text></svg>',
    aspectRatio: '4:3',
    recommendedPlacements: ['Store Locator Page', 'About Us Main Storefront', 'Showroom Gallery (Exterior)']
  },
  {
    id: 'banner_vijay_parihar_branded_shoes',
    filename: 'IMG-20241015-WA0026.jpg',
    title: 'Branded Footwear Destination Banner with Viju Bhai',
    caption: 'Official promotional banner featuring founder Vijay Parihar, Pipar City shop address near Jojri River, contact 9782482250, and top shoe collections.',
    category: 'promotional_banner',
    url: '/images/shop/banner_vijay_parihar_branded_shoes.jpg',
    fallbackUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500" viewBox="0 0 1200 500" fill="none"><rect width="1200" height="500" fill="%2309090b"/><text x="600" y="200" fill="%23eab308" font-family="sans-serif" font-size="42" font-weight="900" text-anchor="middle">मरुधर बूट हाऊस</text><text x="600" y="270" fill="white" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">ब्रांडेड जूतों का एकमात्र स्थान... प्रो. विजय परिहार</text><text x="600" y="330" fill="%23a1a1aa" font-family="sans-serif" font-size="20" text-anchor="middle">पता : जोजरी नदी के पास मिस्त्री मार्केट पीपाड़ शहर | Call: 9782482250</text></svg>',
    aspectRatio: '21:9',
    recommendedPlacements: ['Homepage Special Store Section', 'Visit Us Location Banner', 'About Us Store Experience']
  },
  {
    id: 'banner_nike_campus_action_brands',
    filename: 'IMG-20241015-WA0025.jpg',
    title: 'Authorized Partner Brands Banner',
    caption: 'Wide promotional banner showcasing partner footwear brands: Nike, Lakhani Shoes, Action, Hitway, Campus, JQR Sports, and MBH emblem.',
    category: 'promotional_banner',
    url: '/images/shop/banner_nike_campus_action_brands.jpg',
    fallbackUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400" fill="none"><rect width="1200" height="400" fill="%2318181b"/><text x="600" y="160" fill="%23fbbf24" font-family="sans-serif" font-size="36" font-weight="900" text-anchor="middle">MARUDHAR BOOT HOUSE</text><text x="600" y="230" fill="white" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">Nike • Campus • Action • Lakhani • Hitway • JQR Sports</text></svg>',
    aspectRatio: '21:9',
    recommendedPlacements: ['Homepage Featured Brands Banner', 'Product Feed Top Banner', 'Category Page Header']
  },
  {
    id: 'banner_mbh_wooden_emblem_heritage',
    filename: 'IMG_20241018_104207.jpg',
    title: 'Marudhar Boot House Wooden Heritage Emblem',
    caption: 'Classic wooden panel emblem with MBH monogram surrounded by wheat ears wreath.',
    category: 'brand_emblem',
    url: '/images/shop/banner_mbh_wooden_emblem_heritage.jpg',
    fallbackUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="500" viewBox="0 0 1000 500" fill="none"><rect width="1000" height="500" fill="%231c1917"/><rect x="150" y="150" width="700" height="200" fill="%2344403c" rx="20" stroke="%23d97706" stroke-width="6"/><text x="500" y="270" fill="%23fef3c7" font-family="serif" font-size="40" font-weight="900" text-anchor="middle">MARUDHAR BOOT HOUSE</text></svg>',
    aspectRatio: '16:9',
    recommendedPlacements: ['About Us Heritage Header', 'Brand Story Banner']
  },
  {
    id: 'signboard_neon_marudhar_footwear',
    filename: 'Logo_for_my_footwear_shop_name_Marudhar_Foot_We.jpg',
    title: 'Marudhar Foot Wear Neon Signboard',
    caption: 'Illuminated red & blue glowing neon shoe signboard set against a dark brick background.',
    category: 'branding',
    url: '/images/shop/signboard_neon_marudhar_footwear.jpg',
    fallbackUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%230c0a09"/><text x="300" y="320" fill="%23ef4444" font-family="sans-serif" font-size="32" font-weight="900" text-anchor="middle">MARUDHAR FOOT WEAR</text></svg>',
    aspectRatio: '1:1',
    recommendedPlacements: ['About Us Night View Showcase', 'Showroom Gallery (Branding)']
  },
  {
    id: 'merchandise_viju_bhai_print',
    filename: 'IMG_20231109_173309.jpg',
    title: 'Custom Marudhar Boot House Branding Print',
    caption: 'Official store merchandise print featuring Viju Bhai, Nike swoosh, phone 9782482250, and Instagram handle @Marudhar_Boot_House.',
    category: 'merchandise',
    url: '/images/shop/merchandise_viju_bhai_print.jpg',
    fallbackUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="none"><rect width="600" height="800" fill="%23f5f5f5"/><text x="300" y="380" fill="%2318181b" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle">मरुधर बूट हाऊस पीपाड़ शहर</text><text x="300" y="420" fill="%23991b1b" font-family="sans-serif" font-size="28" font-weight="900" text-anchor="middle">विजु भाई • 9782482250</text></svg>',
    aspectRatio: '3:4',
    recommendedPlacements: ['About Us Viju Bhai Profile', 'Showroom Gallery (Merchandise)']
  },
  {
    id: 'shop_interior_illuminated_walkthrough',
    filename: 'IMG_20231106_184625.jpg',
    title: 'Illuminated Showroom Interior Walkthrough',
    caption: 'Full interior view of Marudhar Boot House with LED strip lighting entrance, green carpet aisle, overhead Hindi banner, and organized footwear racks.',
    category: 'shop_inside',
    url: '/images/shop/shop_interior_illuminated_walkthrough.jpg',
    fallbackUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="none"><rect width="600" height="800" fill="%230f172a"/><rect x="50" y="80" width="500" height="100" fill="%23854d0e" rx="12"/><text x="300" y="140" fill="white" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle">मरुधर बूट हाऊस - प्रो. विजय परिहार</text><rect x="250" y="240" width="100" height="500" fill="%2315803d"/><text x="300" y="450" fill="%23fef08a" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">Store Interior & Footwear Racks</text></svg>',
    aspectRatio: '3:4',
    recommendedPlacements: ['Homepage Store Walkthrough Section', 'About Us Showroom Interior', 'Showroom Gallery (Interior)']
  },
  {
    id: 'owners_vijay_parihar_viju_bhai_team',
    filename: 'InShot_20251201_135107937.jpg',
    title: 'Founder Viju Bhai (Vijay Parihar) & Leadership Team',
    caption: 'Real photograph of founder Viju Bhai (Vijay Parihar) and store leadership representing Marudhar Fashion Point.',
    category: 'team',
    url: '/images/shop/owners_vijay_parihar_viju_bhai_team.jpg',
    fallbackUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="none"><rect width="600" height="800" fill="%231e1b4b"/><text x="300" y="400" fill="%23fef08a" font-family="sans-serif" font-size="26" font-weight="bold" text-anchor="middle">Viju Bhai (Vijay Parihar) & Team</text></svg>',
    aspectRatio: '3:4',
    recommendedPlacements: ['About Us Owners & Team Section', 'Showroom Gallery (Team)']
  }
];

export const getShopImageById = (id: string): ShopImageItem | undefined => {
  return REAL_MARUDHAR_SHOP_IMAGES.find((img) => img.id === id);
};

export const getShopImagesByCategory = (category: ShopImageItem['category']): ShopImageItem[] => {
  return REAL_MARUDHAR_SHOP_IMAGES.filter((img) => img.category === category);
};
