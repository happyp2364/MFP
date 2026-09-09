import { WebsiteDesignSettings, ResponsiveDevice } from '../types/websiteDesign';

export interface DesignDiffItem {
  id: string;
  keyPath: string; // e.g., 'header.height' or 'layout.sections.categories.desktop.paddingTop'
  category: 'header' | 'cards' | 'categoryCards' | 'buttons' | 'icons' | 'sections' | 'productCards' | 'floatingActions' | 'layout_order' | 'layout_visibility' | 'layout_responsive';
  label: string; // e.g. "Header Height"
  oldValue: any;
  newValue: any;
  unit?: string; // "px", "%", "cols", etc.
  affectedArea: string; // e.g. "header", "product-card", "category-card", "button", "section-spacing", "grid-gap", "floating-action", or "section-{id}"
  affectedAreaLabel: string; // e.g. "Header", "Product Cards", "Category Cards", "Action Buttons", etc.
  device: 'desktop' | 'tablet' | 'mobile' | 'all';
  humanDescription: string; // e.g. "Header height increased from 64px → 72px."
}

/**
 * Maps property keypaths to human friendly labels and affected DOM area identifiers
 */
const PROPERTY_METADATA: Record<string, { label: string; unit: string; affectedArea: string; affectedAreaLabel: string; category: DesignDiffItem['category'] }> = {
  // Header
  'header.height': { label: 'Header Height', unit: 'px', affectedArea: 'header', affectedAreaLabel: 'Header', category: 'header' },
  'header.horizontalPadding': { label: 'Header Side Padding', unit: 'px', affectedArea: 'header', affectedAreaLabel: 'Header', category: 'header' },
  'header.verticalPadding': { label: 'Header Vertical Padding', unit: 'px', affectedArea: 'header', affectedAreaLabel: 'Header', category: 'header' },
  'header.logoWidth': { label: 'Logo Width', unit: 'px', affectedArea: 'header-logo', affectedAreaLabel: 'Brand Logo', category: 'header' },
  'header.logoHeight': { label: 'Logo Height', unit: 'px', affectedArea: 'header-logo', affectedAreaLabel: 'Brand Logo', category: 'header' },
  'header.navGap': { label: 'Header Navigation Gap', unit: 'px', affectedArea: 'header', affectedAreaLabel: 'Header Navigation', category: 'header' },
  'header.iconSize': { label: 'Header Icon Size', unit: 'px', affectedArea: 'header', affectedAreaLabel: 'Header Icons', category: 'header' },
  'header.buttonHeight': { label: 'Header CTA Button Height', unit: 'px', affectedArea: 'header-button', affectedAreaLabel: 'Header CTA Button', category: 'header' },
  'header.buttonRadius': { label: 'Header CTA Button Radius', unit: 'px', affectedArea: 'header-button', affectedAreaLabel: 'Header CTA Button', category: 'header' },

  // General Cards
  'cards.borderRadius': { label: 'General Card Radius', unit: 'px', affectedArea: 'card', affectedAreaLabel: 'General Cards', category: 'cards' },
  'cards.padding': { label: 'General Card Padding', unit: 'px', affectedArea: 'card', affectedAreaLabel: 'General Cards', category: 'cards' },
  'cards.imageRadius': { label: 'General Card Image Radius', unit: 'px', affectedArea: 'card', affectedAreaLabel: 'General Cards', category: 'cards' },
  'cards.gap': { label: 'General Card Gap', unit: 'px', affectedArea: 'card', affectedAreaLabel: 'General Cards', category: 'cards' },

  // Category Cards
  'categoryCards.borderRadius': { label: 'Category Card Radius', unit: 'px', affectedArea: 'category-card', affectedAreaLabel: 'Category Cards', category: 'categoryCards' },
  'categoryCards.height': { label: 'Category Card Height', unit: 'px', affectedArea: 'category-card', affectedAreaLabel: 'Category Cards', category: 'categoryCards' },
  'categoryCards.imageSize': { label: 'Category Image Scale', unit: '%', affectedArea: 'category-card', affectedAreaLabel: 'Category Cards', category: 'categoryCards' },
  'categoryCards.gap': { label: 'Category Grid Gap', unit: 'px', affectedArea: 'category-card', affectedAreaLabel: 'Category Cards', category: 'categoryCards' },
  'categoryCards.padding': { label: 'Category Card Padding', unit: 'px', affectedArea: 'category-card', affectedAreaLabel: 'Category Cards', category: 'categoryCards' },

  // Buttons
  'buttons.borderRadius': { label: 'Button Radius', unit: 'px', affectedArea: 'button', affectedAreaLabel: 'Action Buttons', category: 'buttons' },
  'buttons.height': { label: 'Button Height', unit: 'px', affectedArea: 'button', affectedAreaLabel: 'Action Buttons', category: 'buttons' },
  'buttons.horizontalPadding': { label: 'Button Side Padding', unit: 'px', affectedArea: 'button', affectedAreaLabel: 'Action Buttons', category: 'buttons' },
  'buttons.iconSize': { label: 'Button Icon Size', unit: 'px', affectedArea: 'button', affectedAreaLabel: 'Action Buttons', category: 'buttons' },

  // Icons
  'icons.globalSize': { label: 'Global Icon Size', unit: 'px', affectedArea: 'icon', affectedAreaLabel: 'Website Icons', category: 'icons' },
  'icons.headerSize': { label: 'Header Icon Size', unit: 'px', affectedArea: 'header', affectedAreaLabel: 'Header Icons', category: 'icons' },
  'icons.productSize': { label: 'Product Card Icon Size', unit: 'px', affectedArea: 'product-card', affectedAreaLabel: 'Product Card Icons', category: 'icons' },
  'icons.categorySize': { label: 'Category Card Icon Size', unit: 'px', affectedArea: 'category-card', affectedAreaLabel: 'Category Card Icons', category: 'icons' },
  'icons.actionSize': { label: 'Action Icon Size', unit: 'px', affectedArea: 'button', affectedAreaLabel: 'Action Icons', category: 'icons' },
  'icons.floatingActionSize': { label: 'Floating Action Icon Size', unit: 'px', affectedArea: 'floating-action', affectedAreaLabel: 'Floating Action Buttons', category: 'icons' },

  // Section Spacing
  'sections.sectionSpacing': { label: 'Section Spacing', unit: 'px', affectedArea: 'section-spacing', affectedAreaLabel: 'Section Spacing', category: 'sections' },
  'sections.topSpacing': { label: 'Section Top Spacing', unit: 'px', affectedArea: 'section-spacing', affectedAreaLabel: 'Section Spacing', category: 'sections' },
  'sections.bottomSpacing': { label: 'Section Bottom Spacing', unit: 'px', affectedArea: 'section-spacing', affectedAreaLabel: 'Section Spacing', category: 'sections' },
  'sections.contentPadding': { label: 'Container Side Padding', unit: 'px', affectedArea: 'container-width', affectedAreaLabel: 'Content Container', category: 'sections' },
  'sections.gridGap': { label: 'Product Grid Gap', unit: 'px', affectedArea: 'grid-gap', affectedAreaLabel: 'Product Grid Gap', category: 'sections' },
  'sections.headingSpacing': { label: 'Heading Bottom Spacing', unit: 'px', affectedArea: 'section-spacing', affectedAreaLabel: 'Section Headings', category: 'sections' },

  // Product Cards
  'productCards.borderRadius': { label: 'Product Card Radius', unit: 'px', affectedArea: 'product-card', affectedAreaLabel: 'Product Cards', category: 'productCards' },
  'productCards.imageRadius': { label: 'Product Image Radius', unit: 'px', affectedArea: 'product-image', affectedAreaLabel: 'Product Images', category: 'productCards' },
  'productCards.padding': { label: 'Product Card Inner Padding', unit: 'px', affectedArea: 'product-card', affectedAreaLabel: 'Product Cards', category: 'productCards' },
  'productCards.gap': { label: 'Product Card Elements Gap', unit: 'px', affectedArea: 'product-card', affectedAreaLabel: 'Product Cards', category: 'productCards' },

  // Floating Actions
  'floatingActions.size': { label: 'WhatsApp / Action Hub Size', unit: 'px', affectedArea: 'floating-action', affectedAreaLabel: 'Floating Action Buttons', category: 'floatingActions' },
  'floatingActions.iconSize': { label: 'Floating Action Icon Size', unit: 'px', affectedArea: 'floating-action', affectedAreaLabel: 'Floating Action Buttons', category: 'floatingActions' },
  'floatingActions.gap': { label: 'Floating Action Stack Gap', unit: 'px', affectedArea: 'floating-action', affectedAreaLabel: 'Floating Action Buttons', category: 'floatingActions' },
};

/**
 * Calculates a complete list of diff items comparing saved vs draft configuration.
 */
export function calculateDesignDiffs(
  savedSettings: WebsiteDesignSettings,
  draftSettings: WebsiteDesignSettings,
  activeDevice?: ResponsiveDevice
): DesignDiffItem[] {
  const diffs: DesignDiffItem[] = [];

  if (!savedSettings || !draftSettings) return diffs;

  // 1. Compare design token sections
  const sectionsToCheck: Array<keyof Omit<WebsiteDesignSettings, 'layout' | 'updatedAt' | 'updatedBy'>> = [
    'header',
    'cards',
    'categoryCards',
    'buttons',
    'icons',
    'sections',
    'productCards',
    'floatingActions',
  ];

  sectionsToCheck.forEach((secKey) => {
    const savedSec = savedSettings[secKey] || {};
    const draftSec = draftSettings[secKey] || {};

    Object.keys(draftSec).forEach((field) => {
      const savedVal = (savedSec as any)[field];
      const draftVal = (draftSec as any)[field];

      if (savedVal !== undefined && draftVal !== undefined && savedVal !== draftVal) {
        const keyPath = `${secKey}.${field}`;
        const meta = PROPERTY_METADATA[keyPath] || {
          label: `${secKey} ${field}`,
          unit: typeof draftVal === 'number' ? 'px' : '',
          affectedArea: secKey,
          affectedAreaLabel: secKey,
          category: secKey as any,
        };

        const isNumeric = typeof savedVal === 'number' && typeof draftVal === 'number';
        let verb = 'changed';
        if (isNumeric) {
          verb = draftVal > savedVal ? 'increased' : 'reduced';
        }

        const unitStr = meta.unit ? meta.unit : '';
        const humanDesc = `${meta.label} ${verb} from ${savedVal}${unitStr} → ${draftVal}${unitStr}.`;

        diffs.push({
          id: keyPath,
          keyPath,
          category: meta.category,
          label: meta.label,
          oldValue: savedVal,
          newValue: draftVal,
          unit: meta.unit,
          affectedArea: meta.affectedArea,
          affectedAreaLabel: meta.affectedAreaLabel,
          device: 'all',
          humanDescription: humanDesc,
        });
      }
    });
  });

  // 2. Compare layout section reordering
  const savedOrder = savedSettings.layout?.homeSectionOrder || [];
  const draftOrder = draftSettings.layout?.homeSectionOrder || [];

  if (JSON.stringify(savedOrder) !== JSON.stringify(draftOrder)) {
    // Find section that moved most significantly
    let movedSectionName = 'Sections';
    let movedSecId = '';

    for (let i = 0; i < draftOrder.length; i++) {
      const id = draftOrder[i];
      const oldIdx = savedOrder.indexOf(id);
      if (oldIdx !== -1 && oldIdx !== i) {
        const secMeta = draftSettings.layout?.sections[id];
        movedSectionName = secMeta?.name || id;
        movedSecId = id;
        break;
      }
    }

    diffs.push({
      id: 'layout.homeSectionOrder',
      keyPath: 'layout.homeSectionOrder',
      category: 'layout_order',
      label: 'Section Order',
      oldValue: savedOrder,
      newValue: draftOrder,
      affectedArea: movedSecId ? `section-${movedSecId}` : 'homepage-sections',
      affectedAreaLabel: movedSectionName,
      device: 'all',
      humanDescription: `Homepage section order reordered (${movedSectionName} re-positioned).`,
    });
  }

  // 3. Compare section visibility & responsive configs
  const savedSections = savedSettings.layout?.sections || {};
  const draftSections = draftSettings.layout?.sections || {};

  Object.keys(draftSections).forEach((secId) => {
    const savedSec = savedSections[secId];
    const draftSec = draftSections[secId];

    if (!savedSec || !draftSec) return;

    // Visibility toggle
    if (savedSec.visible !== draftSec.visible) {
      const stateStr = draftSec.visible ? 'now visible' : 'now hidden';
      diffs.push({
        id: `layout.sections.${secId}.visible`,
        keyPath: `layout.sections.${secId}.visible`,
        category: 'layout_visibility',
        label: `${draftSec.name} Visibility`,
        oldValue: savedSec.visible ? 'Visible' : 'Hidden',
        newValue: draftSec.visible ? 'Visible' : 'Hidden',
        affectedArea: `section-${secId}`,
        affectedAreaLabel: draftSec.name,
        device: 'all',
        humanDescription: `${draftSec.name} is ${stateStr} in draft.`,
      });
    }

    // Responsive settings (desktop, tablet, mobile)
    const devices: ResponsiveDevice[] = ['desktop', 'tablet', 'mobile'];
    devices.forEach((dev) => {
      const savedResp = savedSec[dev] || {};
      const draftResp = draftSec[dev] || {};

      Object.keys(draftResp).forEach((respKey) => {
        const oldVal = (savedResp as any)[respKey];
        const newVal = (draftResp as any)[respKey];

        if (oldVal !== undefined && newVal !== undefined && oldVal !== newVal) {
          const keyPath = `layout.sections.${secId}.${dev}.${respKey}`;
          let unit = '';
          if (['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'marginTop', 'marginBottom', 'gap', 'borderRadius'].includes(respKey)) {
            unit = 'px';
          } else if (respKey === 'gridColumns') {
            unit = ' cols';
          }

          const devLabel = dev.charAt(0).toUpperCase() + dev.slice(1);
          const isNum = typeof oldVal === 'number' && typeof newVal === 'number';
          let verb = 'changed';
          if (isNum) {
            verb = newVal > oldVal ? 'increased' : 'reduced';
          }

          const humanDesc = `${draftSec.name} ${respKey} (${devLabel}) ${verb} from ${oldVal}${unit} → ${newVal}${unit}.`;

          diffs.push({
            id: keyPath,
            keyPath,
            category: 'layout_responsive',
            label: `${draftSec.name} ${respKey} (${devLabel})`,
            oldValue: oldVal,
            newValue: newVal,
            unit,
            affectedArea: `section-${secId}`,
            affectedAreaLabel: draftSec.name,
            device: dev,
            humanDescription: humanDesc,
          });
        }
      });
    });
  });

  return diffs;
}
