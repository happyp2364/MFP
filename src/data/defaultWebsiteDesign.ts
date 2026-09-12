import { WebsiteDesignSettings, PageSectionConfig, WebsiteLayoutConfig, SectionResponsiveConfig } from '../types/websiteDesign';
import { THEMES_REGISTRY } from './themesRegistry';

const createDefaultSectionConfig = (id: string, name: string, locked = false): PageSectionConfig => ({
  id,
  name,
  visible: true,
  locked,
  desktop: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    marginTop: 0,
    marginBottom: 16,
    width: 'wide',
    horizontalAlign: 'center',
    textAlign: 'center',
    gridColumns: 4,
    gap: 20,
    borderRadius: 16,
  },
  tablet: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
    marginTop: 0,
    marginBottom: 12,
    width: 'wide',
    horizontalAlign: 'center',
    textAlign: 'center',
    gridColumns: 3,
    gap: 16,
    borderRadius: 12,
  },
  mobile: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    paddingRight: 8,
    marginTop: 0,
    marginBottom: 8,
    width: 'full',
    horizontalAlign: 'center',
    textAlign: 'center',
    gridColumns: 2,
    gap: 12,
    borderRadius: 12,
  },
});

export const DEFAULT_LAYOUT_CONFIG: WebsiteLayoutConfig = {
  homeSectionOrder: [
    'hero',
    'trending_shoes',
    'price_point_699',
    'categories',
    'featured_products',
    'best_sellers',
    'trending_products',
    'trending_collections',
    'new_arrivals',
    'reviews',
    'about',
    'contact',
    'instagram',
    'social',
  ],
  sections: {
    hero: createDefaultSectionConfig('hero', 'Hero Banner Section', true),
    trending_shoes: createDefaultSectionConfig('trending_shoes', '🔥 Trending Shoes Collection'),
    price_point_699: createDefaultSectionConfig('price_point_699', '🔥 ₹699 Shoe Collection'),
    categories: createDefaultSectionConfig('categories', 'Family Category Cards'),
    featured_products: createDefaultSectionConfig('featured_products', 'Featured Collection Carousel'),
    best_sellers: createDefaultSectionConfig('best_sellers', 'Best Sellers Carousel'),
    trending_products: createDefaultSectionConfig('trending_products', 'Trending Products Carousel'),
    trending_collections: createDefaultSectionConfig('trending_collections', 'Trending Collections Grid'),
    new_arrivals: createDefaultSectionConfig('new_arrivals', 'New Season Arrivals Carousel'),
    reviews: createDefaultSectionConfig('reviews', 'Customer Reviews & Testimonials'),
    about: createDefaultSectionConfig('about', 'About Us Storytelling'),
    contact: createDefaultSectionConfig('contact', 'Contact & Store Locator'),
    instagram: createDefaultSectionConfig('instagram', 'Instagram Feed'),
    social: createDefaultSectionConfig('social', 'Social Follow CTA'),
  },
};

export const DEFAULT_WEBSITE_DESIGN_SETTINGS: WebsiteDesignSettings = {
  header: {
    height: 64,
    horizontalPadding: 16,
    verticalPadding: 8,
    logoWidth: 38,
    logoHeight: 38,
    navGap: 28,
    iconSize: 20,
    buttonHeight: 38,
    buttonRadius: 12,
  },
  cards: {
    borderRadius: 20,
    padding: 16,
    imageRadius: 16,
    gap: 20,
  },
  categoryCards: {
    borderRadius: 20,
    height: 280,
    imageSize: 100,
    gap: 20,
    padding: 16,
  },
  buttons: {
    borderRadius: 14,
    height: 42,
    horizontalPadding: 20,
    iconSize: 18,
  },
  icons: {
    globalSize: 20,
    headerSize: 20,
    productSize: 18,
    categorySize: 18,
    actionSize: 20,
    floatingActionSize: 24,
  },
  sections: {
    sectionSpacing: 48,
    topSpacing: 48,
    bottomSpacing: 48,
    contentPadding: 16,
    gridGap: 24,
    headingSpacing: 12,
  },
  productCards: {
    borderRadius: 18,
    imageRadius: 14,
    padding: 12,
    gap: 16,
  },
  floatingActions: {
    size: 52,
    iconSize: 24,
    gap: 12,
  },
  layout: DEFAULT_LAYOUT_CONFIG,
};

/**
 * Validates and merges incoming design settings with defaults to prevent missing/invalid values.
 */
export function sanitizeWebsiteDesignSettings(rawSettings: any): WebsiteDesignSettings {
  if (!rawSettings || typeof rawSettings !== 'object') {
    return { ...DEFAULT_WEBSITE_DESIGN_SETTINGS };
  }

  const safeNumber = (val: any, fallback: number, min = 0, max = 500): number => {
    const num = Number(val);
    if (isNaN(num) || num < min || num > max) return fallback;
    return num;
  };

  const defaults = DEFAULT_WEBSITE_DESIGN_SETTINGS;

  return {
    activeThemeId: typeof rawSettings.activeThemeId === 'string' && THEMES_REGISTRY[rawSettings.activeThemeId] ? rawSettings.activeThemeId : 'local',
    header: {
      height: safeNumber(rawSettings.header?.height, defaults.header.height, 40, 160),
      horizontalPadding: safeNumber(rawSettings.header?.horizontalPadding, defaults.header.horizontalPadding, 0, 80),
      verticalPadding: safeNumber(rawSettings.header?.verticalPadding, defaults.header.verticalPadding, 0, 60),
      logoWidth: safeNumber(rawSettings.header?.logoWidth, defaults.header.logoWidth, 20, 120),
      logoHeight: safeNumber(rawSettings.header?.logoHeight, defaults.header.logoHeight, 20, 120),
      navGap: safeNumber(rawSettings.header?.navGap, defaults.header.navGap, 8, 80),
      iconSize: safeNumber(rawSettings.header?.iconSize, defaults.header.iconSize, 12, 48),
      buttonHeight: safeNumber(rawSettings.header?.buttonHeight, defaults.header.buttonHeight, 24, 72),
      buttonRadius: safeNumber(rawSettings.header?.buttonRadius, defaults.header.buttonRadius, 0, 36),
    },
    cards: {
      borderRadius: safeNumber(rawSettings.cards?.borderRadius, defaults.cards.borderRadius, 0, 48),
      padding: safeNumber(rawSettings.cards?.padding, defaults.cards.padding, 0, 64),
      imageRadius: safeNumber(rawSettings.cards?.imageRadius, defaults.cards.imageRadius, 0, 48),
      gap: safeNumber(rawSettings.cards?.gap, defaults.cards.gap, 0, 64),
    },
    categoryCards: {
      borderRadius: safeNumber(rawSettings.categoryCards?.borderRadius, defaults.categoryCards.borderRadius, 0, 48),
      height: safeNumber(rawSettings.categoryCards?.height, defaults.categoryCards.height, 120, 600),
      imageSize: safeNumber(rawSettings.categoryCards?.imageSize, defaults.categoryCards.imageSize, 50, 100),
      gap: safeNumber(rawSettings.categoryCards?.gap, defaults.categoryCards.gap, 0, 64),
      padding: safeNumber(rawSettings.categoryCards?.padding, defaults.categoryCards.padding, 0, 64),
    },
    buttons: {
      borderRadius: safeNumber(rawSettings.buttons?.borderRadius, defaults.buttons.borderRadius, 0, 48),
      height: safeNumber(rawSettings.buttons?.height, defaults.buttons.height, 24, 80),
      horizontalPadding: safeNumber(rawSettings.buttons?.horizontalPadding, defaults.buttons.horizontalPadding, 0, 64),
      iconSize: safeNumber(rawSettings.buttons?.iconSize, defaults.buttons.iconSize, 12, 48),
    },
    icons: {
      globalSize: safeNumber(rawSettings.icons?.globalSize, defaults.icons.globalSize, 12, 64),
      headerSize: safeNumber(rawSettings.icons?.headerSize, defaults.icons.headerSize, 12, 64),
      productSize: safeNumber(rawSettings.icons?.productSize, defaults.icons.productSize, 12, 64),
      categorySize: safeNumber(rawSettings.icons?.categorySize, defaults.icons.categorySize, 12, 64),
      actionSize: safeNumber(rawSettings.icons?.actionSize, defaults.icons.actionSize, 12, 64),
      floatingActionSize: safeNumber(rawSettings.icons?.floatingActionSize, defaults.icons.floatingActionSize, 16, 72),
    },
    sections: {
      sectionSpacing: safeNumber(rawSettings.sections?.sectionSpacing, defaults.sections.sectionSpacing, 0, 120),
      topSpacing: safeNumber(rawSettings.sections?.topSpacing, defaults.sections.topSpacing, 0, 120),
      bottomSpacing: safeNumber(rawSettings.sections?.bottomSpacing, defaults.sections.bottomSpacing, 0, 120),
      contentPadding: safeNumber(rawSettings.sections?.contentPadding, defaults.sections.contentPadding, 0, 64),
      gridGap: safeNumber(rawSettings.sections?.gridGap, defaults.sections.gridGap, 0, 64),
      headingSpacing: safeNumber(rawSettings.sections?.headingSpacing, defaults.sections.headingSpacing, 0, 64),
    },
    productCards: {
      borderRadius: safeNumber(rawSettings.productCards?.borderRadius, defaults.productCards.borderRadius, 0, 48),
      imageRadius: safeNumber(rawSettings.productCards?.imageRadius, defaults.productCards.imageRadius, 0, 48),
      padding: safeNumber(rawSettings.productCards?.padding, defaults.productCards.padding, 0, 64),
      gap: safeNumber(rawSettings.productCards?.gap, defaults.productCards.gap, 0, 64),
    },
    floatingActions: {
      size: safeNumber(rawSettings.floatingActions?.size, defaults.floatingActions.size, 24, 96),
      iconSize: safeNumber(rawSettings.floatingActions?.iconSize, defaults.floatingActions.iconSize, 12, 48),
      gap: safeNumber(rawSettings.floatingActions?.gap, defaults.floatingActions.gap, 0, 48),
    },
    layout: (() => {
      const rawLayout = rawSettings.layout;
      const homeSectionOrder = Array.isArray(rawLayout?.homeSectionOrder) && rawLayout.homeSectionOrder.length > 0
        ? rawLayout.homeSectionOrder.filter((id: any) => typeof id === 'string')
        : [...defaults.layout!.homeSectionOrder];

      // Ensure missing default sections are appended
      defaults.layout!.homeSectionOrder.forEach((id) => {
        if (!homeSectionOrder.includes(id)) {
          homeSectionOrder.push(id);
        }
      });

      const rawSections = rawLayout?.sections && typeof rawLayout.sections === 'object' ? rawLayout.sections : {};
      const sanitizedSections: Record<string, PageSectionConfig> = {};

      Object.keys(defaults.layout!.sections).forEach((sectionId) => {
        const defaultSec = defaults.layout!.sections[sectionId];
        const rawSec = rawSections[sectionId] || {};

        const sanitizeResponsive = (rawResp: any, defResp: SectionResponsiveConfig): SectionResponsiveConfig => ({
          paddingTop: safeNumber(rawResp?.paddingTop, defResp.paddingTop, 0, 200),
          paddingBottom: safeNumber(rawResp?.paddingBottom, defResp.paddingBottom, 0, 200),
          paddingLeft: safeNumber(rawResp?.paddingLeft, defResp.paddingLeft, 0, 200),
          paddingRight: safeNumber(rawResp?.paddingRight, defResp.paddingRight, 0, 200),
          marginTop: safeNumber(rawResp?.marginTop, defResp.marginTop, 0, 200),
          marginBottom: safeNumber(rawResp?.marginBottom, defResp.marginBottom, 0, 200),
          width: ['full', 'wide', 'standard', 'compact'].includes(rawResp?.width) ? rawResp.width : defResp.width,
          horizontalAlign: ['left', 'center', 'right', 'stretch'].includes(rawResp?.horizontalAlign) ? rawResp.horizontalAlign : defResp.horizontalAlign,
          textAlign: ['left', 'center', 'right'].includes(rawResp?.textAlign) ? rawResp.textAlign : defResp.textAlign,
          gridColumns: safeNumber(rawResp?.gridColumns, defResp.gridColumns, 1, 12),
          gap: safeNumber(rawResp?.gap, defResp.gap, 0, 100),
          borderRadius: safeNumber(rawResp?.borderRadius, defResp.borderRadius, 0, 80),
        });

        sanitizedSections[sectionId] = {
          id: sectionId,
          name: rawSec.name || defaultSec.name,
          visible: typeof rawSec.visible === 'boolean' ? rawSec.visible : defaultSec.visible,
          locked: typeof rawSec.locked === 'boolean' ? rawSec.locked : defaultSec.locked,
          desktop: sanitizeResponsive(rawSec.desktop, defaultSec.desktop),
          tablet: sanitizeResponsive(rawSec.tablet, defaultSec.tablet),
          mobile: sanitizeResponsive(rawSec.mobile, defaultSec.mobile),
        };
      });

      return {
        homeSectionOrder,
        sections: sanitizedSections,
      };
    })(),
    updatedAt: rawSettings.updatedAt || undefined,
    updatedBy: rawSettings.updatedBy || undefined,
  };
}

/**
 * Applies the design configuration settings directly to CSS variables on document.documentElement.
 */
export function applyWebsiteDesignTokens(settings: WebsiteDesignSettings) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Header
  root.style.setProperty('--mfp-header-height', `${settings.header.height}px`);
  root.style.setProperty('--mfp-header-padding-y', `${settings.header.verticalPadding}px`);
  root.style.setProperty('--mfp-header-padding-x', `${settings.header.horizontalPadding}px`);
  root.style.setProperty('--mfp-logo-width', `${settings.header.logoWidth}px`);
  root.style.setProperty('--mfp-logo-height', `${settings.header.logoHeight}px`);
  root.style.setProperty('--mfp-nav-gap', `${settings.header.navGap}px`);
  root.style.setProperty('--mfp-icon-header-size', `${settings.header.iconSize}px`);
  root.style.setProperty('--mfp-whatsapp-btn-height', `${settings.header.buttonHeight}px`);
  root.style.setProperty('--mfp-whatsapp-btn-radius', `${settings.header.buttonRadius}px`);

  // Cards
  root.style.setProperty('--mfp-card-radius', `${settings.cards.borderRadius}px`);
  root.style.setProperty('--mfp-card-padding', `${settings.cards.padding}px`);
  root.style.setProperty('--mfp-card-image-radius', `${settings.cards.imageRadius}px`);
  root.style.setProperty('--mfp-card-gap', `${settings.cards.gap}px`);

  // Category Cards
  root.style.setProperty('--mfp-category-radius', `${settings.categoryCards.borderRadius}px`);
  root.style.setProperty('--mfp-category-height', `${settings.categoryCards.height}px`);
  root.style.setProperty('--mfp-category-image-size', `${settings.categoryCards.imageSize}%`);
  root.style.setProperty('--mfp-category-gap', `${settings.categoryCards.gap}px`);
  root.style.setProperty('--mfp-category-padding-x', `${settings.categoryCards.padding}px`);

  // Buttons
  root.style.setProperty('--mfp-button-radius', `${settings.buttons.borderRadius}px`);
  root.style.setProperty('--mfp-button-height', `${settings.buttons.height}px`);
  root.style.setProperty('--mfp-button-padding-x', `${settings.buttons.horizontalPadding}px`);
  root.style.setProperty('--mfp-button-icon-size', `${settings.buttons.iconSize}px`);

  // Icons
  root.style.setProperty('--mfp-icon-global-size', `${settings.icons.globalSize}px`);
  root.style.setProperty('--mfp-icon-header-size', `${settings.icons.headerSize}px`);
  root.style.setProperty('--mfp-icon-[#0B8F63]', `${settings.icons.productSize}px`);
  root.style.setProperty('--mfp-icon-product-size', `${settings.icons.productSize}px`);
  root.style.setProperty('--mfp-icon-category-size', `${settings.icons.categorySize}px`);
  root.style.setProperty('--mfp-icon-action-size', `${settings.icons.actionSize}px`);
  root.style.setProperty('--mfp-icon-floating-size', `${settings.icons.floatingActionSize}px`);

  // Sections & Spacing
  root.style.setProperty('--mfp-section-top-spacing', `${settings.sections.topSpacing}px`);
  root.style.setProperty('--mfp-section-bottom-spacing', `${settings.sections.bottomSpacing}px`);
  root.style.setProperty('--mfp-content-padding-x', `${settings.sections.contentPadding}px`);
  root.style.setProperty('--mfp-grid-gap', `${settings.sections.gridGap}px`);
  root.style.setProperty('--mfp-heading-spacing', `${settings.sections.headingSpacing}px`);

  // Product Cards
  root.style.setProperty('--mfp-product-card-radius', `${settings.productCards.borderRadius}px`);
  root.style.setProperty('--mfp-product-image-radius', `${settings.productCards.imageRadius}px`);
  root.style.setProperty('--mfp-product-card-padding', `${settings.productCards.padding}px`);
  root.style.setProperty('--mfp-product-card-gap', `${settings.productCards.gap}px`);

  // Floating Actions
  root.style.setProperty('--mfp-floating-btn-size', `${settings.floatingActions.size}px`);
  root.style.setProperty('--mfp-floating-icon-size', `${settings.floatingActions.iconSize}px`);
  root.style.setProperty('--mfp-floating-btn-gap', `${settings.floatingActions.gap}px`);

  // Global Theme System (Seasonal, Festival, Nature, Weather)
  const activeThemeId = settings.activeThemeId && THEMES_REGISTRY[settings.activeThemeId] ? settings.activeThemeId : 'local';
  const theme = THEMES_REGISTRY[activeThemeId] || THEMES_REGISTRY['local'];
  root.setAttribute('data-theme', activeThemeId);

  root.style.setProperty('--theme-background', theme.colors.background);
  root.style.setProperty('--theme-surface', theme.colors.surface);
  root.style.setProperty('--theme-surface-secondary', theme.colors.surfaceSecondary);
  root.style.setProperty('--theme-text', theme.colors.text);
  root.style.setProperty('--theme-text-muted', theme.colors.textMuted);
  root.style.setProperty('--theme-primary', theme.colors.primary);
  root.style.setProperty('--theme-primary-hover', theme.colors.primaryHover);
  root.style.setProperty('--theme-secondary', theme.colors.secondary);
  root.style.setProperty('--theme-accent', theme.colors.accent);
  root.style.setProperty('--theme-border', theme.colors.border);
  root.style.setProperty('--theme-card', theme.colors.card);
  root.style.setProperty('--theme-card-hover', theme.colors.cardHover);
  root.style.setProperty('--theme-button', theme.colors.button);
  root.style.setProperty('--theme-button-text', theme.colors.buttonText);
  root.style.setProperty('--theme-badge', theme.colors.badge);
  root.style.setProperty('--theme-badge-text', theme.colors.badgeText);
  root.style.setProperty('--theme-font-heading', theme.fonts.heading);
  root.style.setProperty('--theme-font-body', theme.fonts.body);
}
