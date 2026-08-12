export interface TenantThemeConfig {
  id: string;
  name: string;
  presetId?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  buttonStyle: 'rounded' | 'pill' | 'square' | 'sharp';
  cardStyle: 'bordered' | 'shadow' | 'flat' | 'glass';
  borderRadius: string; // e.g., '12px'
  fontFamily: string;
  headingFont: string;
  bodyFont: string;
  headerStyle: 'minimal' | 'centered' | 'expanded';
  footerStyle: 'simple' | 'multi_column' | 'brand';
  navigationStyle: 'top' | 'sticky' | 'floating';
  productCardStyle: 'classic' | 'modern' | 'minimal' | 'compact';
  productGridStyle: 'grid_3' | 'grid_4' | 'bento';
  bannerStyle: 'hero_slider' | 'split' | 'minimal';
  heroStyle: 'gradient' | 'image' | 'video_bg';
  badgeStyle: 'pill' | 'square' | 'subtle';
  modalStyle: 'centered' | 'bottom_sheet' | 'fullscreen';
  adminTheme: 'light' | 'dark' | 'system';
  storefrontTheme: 'light' | 'dark' | 'auto';
  customCssVariables?: Record<string, string>;
  updatedAt?: string;
}

export const THEME_PRESETS: Record<string, TenantThemeConfig> = {
  modern_light: {
    id: 'modern_light',
    name: 'Modern Light',
    presetId: 'modern_light',
    primaryColor: '#0f172a',
    secondaryColor: '#3b82f6',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    buttonStyle: 'rounded',
    cardStyle: 'bordered',
    borderRadius: '16px',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    headingFont: 'Plus Jakarta Sans, sans-serif',
    bodyFont: 'Plus Jakarta Sans, sans-serif',
    headerStyle: 'minimal',
    footerStyle: 'multi_column',
    navigationStyle: 'sticky',
    productCardStyle: 'modern',
    productGridStyle: 'grid_4',
    bannerStyle: 'hero_slider',
    heroStyle: 'gradient',
    badgeStyle: 'pill',
    modalStyle: 'centered',
    adminTheme: 'dark',
    storefrontTheme: 'light',
  },
  luxury_dark: {
    id: 'luxury_dark',
    name: 'Luxury Dark',
    presetId: 'luxury_dark',
    primaryColor: '#d97706',
    secondaryColor: '#f59e0b',
    accentColor: '#e11d48',
    backgroundColor: '#09090b',
    textColor: '#f8fafc',
    buttonStyle: 'sharp',
    cardStyle: 'glass',
    borderRadius: '8px',
    fontFamily: 'Playfair Display, serif',
    headingFont: 'Playfair Display, serif',
    bodyFont: 'Plus Jakarta Sans, sans-serif',
    headerStyle: 'centered',
    footerStyle: 'brand',
    navigationStyle: 'top',
    productCardStyle: 'classic',
    productGridStyle: 'grid_3',
    bannerStyle: 'split',
    heroStyle: 'image',
    badgeStyle: 'subtle',
    modalStyle: 'centered',
    adminTheme: 'dark',
    storefrontTheme: 'dark',
  },
  minimal: {
    id: 'minimal',
    name: 'Ultra Minimal',
    presetId: 'minimal',
    primaryColor: '#18181b',
    secondaryColor: '#71717a',
    accentColor: '#000000',
    backgroundColor: '#fafafa',
    textColor: '#18181b',
    buttonStyle: 'square',
    cardStyle: 'flat',
    borderRadius: '4px',
    fontFamily: 'Inter, sans-serif',
    headingFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    headerStyle: 'minimal',
    footerStyle: 'simple',
    navigationStyle: 'top',
    productCardStyle: 'minimal',
    productGridStyle: 'grid_4',
    bannerStyle: 'minimal',
    heroStyle: 'gradient',
    badgeStyle: 'square',
    modalStyle: 'centered',
    adminTheme: 'dark',
    storefrontTheme: 'light',
  },
  sports_bold: {
    id: 'sports_bold',
    name: 'Sports & Athletic',
    presetId: 'sports_bold',
    primaryColor: '#dc2626',
    secondaryColor: '#0284c7',
    accentColor: '#eab308',
    backgroundColor: '#0f172a',
    textColor: '#ffffff',
    buttonStyle: 'pill',
    cardStyle: 'shadow',
    borderRadius: '24px',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    headingFont: 'Plus Jakarta Sans, sans-serif',
    bodyFont: 'Plus Jakarta Sans, sans-serif',
    headerStyle: 'expanded',
    footerStyle: 'multi_column',
    navigationStyle: 'sticky',
    productCardStyle: 'compact',
    productGridStyle: 'bento',
    bannerStyle: 'hero_slider',
    heroStyle: 'video_bg',
    badgeStyle: 'pill',
    modalStyle: 'fullscreen',
    adminTheme: 'dark',
    storefrontTheme: 'dark',
  },
  fashion_boutique: {
    id: 'fashion_boutique',
    name: 'Fashion Boutique',
    presetId: 'fashion_boutique',
    primaryColor: '#be185d',
    secondaryColor: '#9333ea',
    accentColor: '#f43f5e',
    backgroundColor: '#fff1f2',
    textColor: '#4c0519',
    buttonStyle: 'rounded',
    cardStyle: 'bordered',
    borderRadius: '18px',
    fontFamily: 'Playfair Display, serif',
    headingFont: 'Playfair Display, serif',
    bodyFont: 'Plus Jakarta Sans, sans-serif',
    headerStyle: 'centered',
    footerStyle: 'brand',
    navigationStyle: 'sticky',
    productCardStyle: 'modern',
    productGridStyle: 'grid_3',
    bannerStyle: 'split',
    heroStyle: 'image',
    badgeStyle: 'pill',
    modalStyle: 'centered',
    adminTheme: 'light',
    storefrontTheme: 'light',
  },
};

export function getDefaultThemeConfig(presetId: string = 'modern_light'): TenantThemeConfig {
  const preset = THEME_PRESETS[presetId] || THEME_PRESETS.modern_light;
  return {
    ...preset,
    id: preset.id,
    updatedAt: new Date().toISOString(),
  };
}
