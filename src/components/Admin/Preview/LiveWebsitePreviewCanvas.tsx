import React, { useRef, useEffect } from 'react';
import {
  WebsiteDesignSettings,
  ResponsiveDevice,
} from '../../../types/websiteDesign';
import { PreviewMode } from './PreviewToolbar';
import { ChangeSummaryPanel } from './ChangeSummaryPanel';
import { DesignDiffItem } from '../../../utils/designDiffUtils';
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  Star,
  Sparkles,
  ArrowRight,
  Eye,
  Lock,
  Phone,
  MessageCircle,
  MapPin,
  Instagram,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';

interface LiveWebsitePreviewCanvasProps {
  savedSettings: WebsiteDesignSettings;
  draftSettings: WebsiteDesignSettings;
  previewMode: PreviewMode;
  selectedDevice: ResponsiveDevice;
  showAffectedArea: boolean;
  activeDiff?: DesignDiffItem | null;
  totalDiffsCount: number;
  onOpenDiffDrawer: () => void;
  selectedSectionId?: string;
  className?: string;
}

export const LiveWebsitePreviewCanvas: React.FC<LiveWebsitePreviewCanvasProps> = ({
  savedSettings,
  draftSettings,
  previewMode,
  selectedDevice,
  showAffectedArea,
  activeDiff,
  totalDiffsCount,
  onOpenDiffDrawer,
  selectedSectionId,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Device width mapping for the container frame
  const deviceContainerWidths: Record<ResponsiveDevice, string> = {
    desktop: 'max-w-[1280px]',
    tablet: 'max-w-[768px]',
    mobile: 'max-w-[390px]',
  };

  // Target area identifier from active diff or selected section
  const targetArea = activeDiff?.affectedArea || (selectedSectionId ? `section-${selectedSectionId}` : null);

  // Scroll target element into view when activeDiff changes
  useEffect(() => {
    if (targetArea && containerRef.current) {
      const el = containerRef.current.querySelector(`[data-preview-area="${targetArea}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [targetArea]);

  // Helper to construct inline styles for a set of design settings
  const getInlineDesignStyles = (settings: WebsiteDesignSettings): React.CSSProperties => {
    return {
      '--p-header-height': `${settings.header.height}px`,
      '--p-header-pad-x': `${settings.header.horizontalPadding}px`,
      '--p-header-pad-y': `${settings.header.verticalPadding}px`,
      '--p-logo-width': `${settings.header.logoWidth}px`,
      '--p-logo-height': `${settings.header.logoHeight}px`,
      '--p-nav-gap': `${settings.header.navGap}px`,
      '--p-header-icon-size': `${settings.header.iconSize}px`,
      '--p-header-btn-height': `${settings.header.buttonHeight}px`,
      '--p-header-btn-radius': `${settings.header.buttonRadius}px`,

      '--p-card-radius': `${settings.cards.borderRadius}px`,
      '--p-card-padding': `${settings.cards.padding}px`,
      '--p-card-img-radius': `${settings.cards.imageRadius}px`,
      '--p-card-gap': `${settings.cards.gap}px`,

      '--p-cat-radius': `${settings.categoryCards.borderRadius}px`,
      '--p-cat-height': `${settings.categoryCards.height}px`,
      '--p-cat-img-size': `${settings.categoryCards.imageSize}%`,
      '--p-cat-gap': `${settings.categoryCards.gap}px`,
      '--p-cat-padding': `${settings.categoryCards.padding}px`,

      '--p-btn-radius': `${settings.buttons.borderRadius}px`,
      '--p-btn-height': `${settings.buttons.height}px`,
      '--p-btn-pad-x': `${settings.buttons.horizontalPadding}px`,
      '--p-btn-icon-size': `${settings.buttons.iconSize}px`,

      '--p-sec-spacing': `${settings.sections.sectionSpacing}px`,
      '--p-sec-top-spacing': `${settings.sections.topSpacing}px`,
      '--p-sec-bottom-spacing': `${settings.sections.bottomSpacing}px`,
      '--p-grid-gap': `${settings.sections.gridGap}px`,
      '--p-heading-spacing': `${settings.sections.headingSpacing}px`,

      '--p-prod-radius': `${settings.productCards.borderRadius}px`,
      '--p-prod-img-radius': `${settings.productCards.imageRadius}px`,
      '--p-prod-padding': `${settings.productCards.padding}px`,
      '--p-prod-gap': `${settings.productCards.gap}px`,

      '--p-floating-size': `${settings.floatingActions.size}px`,
      '--p-floating-icon-size': `${settings.floatingActions.iconSize}px`,
      '--p-floating-gap': `${settings.floatingActions.gap}px`,
    } as React.CSSProperties;
  };

  // Render mock single site view
  const renderSiteFrame = (
    settings: WebsiteDesignSettings,
    titleLabel?: string,
    isBeforeView = false
  ) => {
    const layout = settings.layout;
    const sectionOrder = layout?.homeSectionOrder || [
      'hero',
      'trending_shoes',
      'categories',
      'featured_products',
      'best_sellers',
      'reviews',
    ];
    const sectionsDict = layout?.sections || {};

    const styleVars = getInlineDesignStyles(settings);

    return (
      <div
        style={styleVars}
        className="bg-neutral-50 border border-neutral-200 rounded-2xl shadow-xl overflow-hidden flex flex-col text-neutral-900 transition-all font-sans relative"
      >
        {/* Frame Top Header */}
        <div className="bg-neutral-900 text-white px-4 py-2 border-b border-neutral-800 flex items-center justify-between text-[11px] font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="ml-2 font-mono text-neutral-400">
              {titleLabel || (isBeforeView ? 'BEFORE (Saved Settings)' : 'LIVE DRAFT PREVIEW')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono text-[10px] uppercase">
              {selectedDevice}
            </span>
          </div>
        </div>

        {/* WEBSITE HEADER BAR */}
        <header
          data-preview-area="header"
          className={`bg-white border-b border-neutral-200 sticky top-0 z-30 transition-all ${
            shouldHighlight('header') ? getHighlightClasses('HEADER BAR') : shouldDim('header') ? 'opacity-40 grayscale' : ''
          }`}
          style={{
            height: 'var(--p-header-height)',
            paddingLeft: 'var(--p-header-pad-x)',
            paddingRight: 'var(--p-header-pad-x)',
            paddingTop: 'var(--p-header-pad-y)',
            paddingBottom: 'var(--p-header-pad-y)',
          }}
        >
          <div className="h-full max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Logo */}
            <div
              data-preview-area="header-logo"
              className={`flex items-center gap-2 font-extrabold text-neutral-900 tracking-tight transition-all ${
                shouldHighlight('header-logo') ? getHighlightClasses('BRAND LOGO') : ''
              }`}
            >
              <div
                className="bg-[#0B8F63] rounded-lg flex items-center justify-center text-white font-serif font-black text-xs shrink-0"
                style={{
                  width: 'var(--p-logo-width)',
                  height: 'var(--p-logo-height)',
                }}
              >
                MFP
              </div>
              <span className="text-xs sm:text-sm font-black text-[#0B8F63] hidden sm:inline">
                Marudhar Fashion Point
              </span>
            </div>

            {/* Nav gap simulated */}
            <div
              className="hidden md:flex items-center text-xs font-extrabold text-neutral-700"
              style={{ gap: 'var(--p-nav-gap)' }}
            >
              <span className="text-[#0B8F63] border-b-2 border-[#0B8F63]">Home</span>
              <span className="hover:text-[#0B8F63] cursor-pointer">Shop All</span>
              <span className="hover:text-[#0B8F63] cursor-pointer">Footwear</span>
              <span className="hover:text-[#0B8F63] cursor-pointer">Offers</span>
            </div>

            {/* Actions & WhatsApp Header Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100"
                style={{ fontSize: 'var(--p-header-icon-size)' }}
              >
                <Search style={{ width: 'var(--p-header-icon-size)', height: 'var(--p-header-icon-size)' }} />
              </button>

              <button
                type="button"
                className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100"
                style={{ fontSize: 'var(--p-header-icon-size)' }}
              >
                <ShoppingBag style={{ width: 'var(--p-header-icon-size)', height: 'var(--p-header-icon-size)' }} />
              </button>

              {/* WhatsApp CTA */}
              <div
                data-preview-area="header-button"
                className={`transition-all ${shouldHighlight('header-button') ? getHighlightClasses('HEADER CTA BUTTON') : ''}`}
              >
                <button
                  type="button"
                  className="bg-[#0B8F63] text-white font-bold text-[11px] px-3 flex items-center gap-1.5 shadow-sm hover:bg-[#097A54] transition-all"
                  style={{
                    height: 'var(--p-header-btn-height)',
                    borderRadius: 'var(--p-header-btn-radius)',
                  }}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp Order</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* SECTION STACK */}
        <div className="flex-1 space-y-6 p-4 sm:p-6 overflow-y-auto max-h-[800px] scroll-smooth">
          {sectionOrder.map((secId, index) => {
            const sec = sectionsDict[secId];
            if (!sec) return null;

            const isVisible = sec.visible;
            const respConfig = sec[selectedDevice] || sec.desktop;
            const isAreaHighlighted = shouldHighlight(`section-${secId}`);

            return (
              <div
                key={`${secId}-${index}`}
                data-preview-area={`section-${secId}`}
                className={`relative rounded-2xl border transition-all ${
                  !isVisible
                    ? 'bg-neutral-100/70 border-dashed border-neutral-300 opacity-60 p-4'
                    : 'bg-white border-neutral-200/80 shadow-sm p-4'
                } ${
                  isAreaHighlighted
                    ? getHighlightClasses(sec.name)
                    : shouldDim(`section-${secId}`)
                    ? 'opacity-40 grayscale-[30%]'
                    : ''
                }`}
                style={{
                  paddingTop: `${respConfig.paddingTop}px`,
                  paddingBottom: `${respConfig.paddingBottom}px`,
                  paddingLeft: `${respConfig.paddingLeft}px`,
                  paddingRight: `${respConfig.paddingRight}px`,
                  marginTop: `${respConfig.marginTop}px`,
                  marginBottom: `${respConfig.marginBottom}px`,
                  borderRadius: `${respConfig.borderRadius}px`,
                }}
              >
                {/* Draft Hidden Section Banner */}
                {!isVisible && (
                  <div className="mb-2 p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-700" />
                      Section hidden in draft layout ({sec.name})
                    </span>
                    <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded-md font-mono">
                      Hidden
                    </span>
                  </div>
                )}

                {/* Section Header */}
                <div className="flex items-center justify-between mb-3 border-b border-neutral-100 pb-2">
                  <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0B8F63]" />
                    {sec.name}
                  </h3>
                  <span className="text-[10px] text-neutral-400 font-mono">#{index + 1}</span>
                </div>

                {/* Section Mock Content */}
                {renderSectionContent(secId, settings, respConfig)}
              </div>
            );
          })}
        </div>

        {/* FLOATING ACTION HUB PREVIEW */}
        <div
          data-preview-area="floating-action"
          className={`fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 transition-all ${
            shouldHighlight('floating-action') ? getHighlightClasses('FLOATING ACTIONS') : ''
          }`}
          style={{ gap: 'var(--p-floating-gap)' }}
        >
          <div
            className="rounded-full bg-[#0B8F63] text-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-all"
            style={{
              width: 'var(--p-floating-size)',
              height: 'var(--p-floating-size)',
            }}
          >
            <MessageCircle
              style={{
                width: 'var(--p-floating-icon-size)',
                height: 'var(--p-floating-icon-size)',
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Helper for rendering component content based on section ID
  const renderSectionContent = (secId: string, settings: WebsiteDesignSettings, respConfig: any) => {
    switch (secId) {
      case 'hero':
        return (
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-md">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wide border border-emerald-400/30 inline-block">
                NEW SEASON COLLECTION 2026
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-serif-heading tracking-tight leading-tight">
                Authentic Rajasthani Footwear & Juttis
              </h2>
              <p className="text-xs text-emerald-100/80">
                Handcrafted premium leather footwear, bridal Punjabi juttis, and casual sneakers.
              </p>

              <div
                data-preview-area="button"
                className={`pt-2 transition-all ${shouldHighlight('button') ? getHighlightClasses('ACTION BUTTONS') : ''}`}
              >
                <button
                  type="button"
                  className="bg-amber-400 text-amber-950 font-black text-xs px-5 shadow-lg hover:bg-amber-300 transition-all flex items-center gap-2"
                  style={{
                    height: 'var(--p-btn-height)',
                    borderRadius: 'var(--p-btn-radius)',
                    paddingLeft: 'var(--p-btn-pad-x)',
                    paddingRight: 'var(--p-btn-pad-x)',
                  }}
                >
                  <span>EXPLORE COLLECTION</span>
                  <ArrowRight
                    style={{
                      width: 'var(--p-btn-icon-size)',
                      height: 'var(--p-btn-icon-size)',
                    }}
                  />
                </button>
              </div>
            </div>

            <div className="w-32 h-32 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 text-3xl font-serif font-black shrink-0">
              👠
            </div>
          </div>
        );

      case 'categories':
        return (
          <div
            data-preview-area="category-card"
            className={`grid gap-4 transition-all ${
              shouldHighlight('category-card') ? getHighlightClasses('CATEGORY CARDS') : ''
            }`}
            style={{
              gridTemplateColumns: `repeat(${respConfig.gridColumns || 3}, minmax(0, 1fr))`,
              gap: 'var(--p-cat-gap)',
            }}
          >
            {[
              { title: 'Men Footwear', emoji: '👞', color: 'from-amber-100 to-amber-200' },
              { title: 'Women Bridal Juttis', emoji: '👠', color: 'from-rose-100 to-rose-200' },
              { title: 'Kids & School Shoes', emoji: '👟', color: 'from-emerald-100 to-emerald-200' },
            ].map((cat, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${cat.color} border border-neutral-200 flex flex-col justify-between p-4 shadow-sm transition-all hover:scale-[1.02]`}
                style={{
                  height: 'var(--p-cat-height)',
                  borderRadius: 'var(--p-cat-radius)',
                  padding: 'var(--p-cat-padding)',
                }}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <div>
                  <h4 className="text-xs font-black text-neutral-900">{cat.title}</h4>
                  <p className="text-[10px] text-neutral-600 font-medium mt-0.5">Shop 120+ Items →</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'trending_shoes':
      case 'featured_products':
      case 'best_sellers':
      case 'trending_products':
      case 'new_arrivals':
      case 'price_point_699':
        return (
          <div
            data-preview-area="product-card"
            className={`grid transition-all ${
              shouldHighlight('product-card') ? getHighlightClasses('PRODUCT CARDS') : ''
            }`}
            style={{
              gridTemplateColumns: `repeat(${respConfig.gridColumns || 4}, minmax(0, 1fr))`,
              gap: 'var(--p-grid-gap)',
            }}
          >
            {[
              { name: 'Royal Velvet Embroidered Jutti', price: '₹1,299', oldPrice: '₹2,499', badge: 'BESTSELLER', image: '✨' },
              { name: 'Pure Leather Formal Loafers', price: '₹1,899', oldPrice: '₹3,299', badge: 'HOT', image: '👞' },
              { name: 'Classic Air White Sneakers', price: '₹699', oldPrice: '₹1,299', badge: '₹699 SALE', image: '👟' },
              { name: 'Ethno Gold Bridal Mojari', price: '₹2,199', oldPrice: '₹3,999', badge: 'NEW', image: '👠' },
            ]
              .slice(0, respConfig.gridColumns || 4)
              .map((prod, i) => (
                <div
                  key={i}
                  className="bg-white border border-neutral-200 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
                  style={{
                    borderRadius: 'var(--p-prod-radius)',
                    padding: 'var(--p-prod-padding)',
                    gap: 'var(--p-prod-gap)',
                  }}
                >
                  <div
                    data-preview-area="product-image"
                    className={`bg-neutral-100 flex items-center justify-center text-2xl relative overflow-hidden h-28 transition-all ${
                      shouldHighlight('product-image') ? getHighlightClasses('PRODUCT IMAGE') : ''
                    }`}
                    style={{ borderRadius: 'var(--p-prod-img-radius)' }}
                  >
                    <span>{prod.image}</span>
                    <span className="absolute top-2 left-2 bg-[#0B8F63] text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                      {prod.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h5 className="text-[11px] font-bold text-neutral-900 truncate">{prod.name}</h5>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-black text-[#0B8F63]">{prod.price}</span>
                      <span className="text-[10px] text-neutral-400 line-through">{prod.oldPrice}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full bg-[#0B8F63] text-white font-bold text-[10px] py-1.5 rounded-lg flex items-center justify-center gap-1"
                    style={{ borderRadius: 'var(--p-btn-radius)' }}
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>ADD TO CART</span>
                  </button>
                </div>
              ))}
          </div>
        );

      default:
        return (
          <div className="bg-neutral-100 rounded-xl p-4 text-center text-xs text-neutral-500 font-medium">
            Standard content view for {secId}. Customized via responsive spacing tokens.
          </div>
        );
    }
  };

  // Helper: check if area should be highlighted
  const shouldHighlight = (areaName: string): boolean => {
    if (!showAffectedArea) return false;
    if (!targetArea) return true; // highlight all if mode active but no specific selection
    return targetArea === areaName || targetArea.includes(areaName) || areaName.includes(targetArea);
  };

  // Helper: check if area should be dimmed
  const shouldDim = (areaName: string): boolean => {
    if (!showAffectedArea || !targetArea) return false;
    return !shouldHighlight(areaName);
  };

  // Highlight CSS utility
  const getHighlightClasses = (label: string) => {
    return `ring-4 ring-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-[1.01] z-20 relative before:content-['[_${label}_]'] before:absolute before:-top-3 before:left-3 before:bg-amber-500 before:text-amber-950 before:text-[9px] before:font-black before:px-2 before:py-0.5 before:rounded-md before:shadow-md before:z-30`;
  };

  return (
    <div className={`space-y-4 ${className}`} ref={containerRef}>
      {/* Dynamic Summary Panel overlay if diffs exist */}
      <ChangeSummaryPanel
        activeDiff={activeDiff}
        totalDiffsCount={totalDiffsCount}
        onOpenAllChanges={onOpenDiffDrawer}
      />

      {/* Render Canvas Based on Preview Mode */}
      <div className={`w-full mx-auto ${deviceContainerWidths[selectedDevice]} transition-all duration-300`}>
        {previewMode === 'before_after' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-t-xl uppercase tracking-wider flex items-center justify-between">
                <span>BEFORE (Last Saved State)</span>
                <span className="text-[10px] font-mono text-rose-500">Firestore Config</span>
              </div>
              {renderSiteFrame(savedSettings, 'BEFORE (SAVED CONFIG)', true)}
            </div>

            <div>
              <div className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-t-xl uppercase tracking-wider flex items-center justify-between">
                <span>AFTER (Current Local Draft)</span>
                <span className="text-[10px] font-mono text-emerald-500">Unsaved Local Draft</span>
              </div>
              {renderSiteFrame(draftSettings, 'AFTER (LOCAL DRAFT)', false)}
            </div>
          </div>
        ) : (
          renderSiteFrame(draftSettings, 'LIVE WEBSITE DRAFT PREVIEW', false)
        )}
      </div>
    </div>
  );
};
