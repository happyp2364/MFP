import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Flame,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Zap,
  Eye,
  Star,
  Heart,
  Check,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductVariant } from '../../types';

interface TrendingShoesSectionProps {
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product, size: string, color: string, variant?: ProductVariant) => void;
  onBuyNow?: (product: Product, size: string, color: string, quantity?: number, variant?: ProductVariant) => void;
  onToggleWishlist?: (product: Product) => void;
  wishlistIds?: string[];
}

export const TrendingShoesSection: React.FC<TrendingShoesSectionProps> = ({
  onQuickView,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds = [],
}) => {
  const { trendingShoesConfig, products } = useStore();
  const config = trendingShoesConfig;

  // Active product index in showcase
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Check schedule validity
  const isScheduled = useMemo(() => {
    if (!config.enabled) return false;
    const now = new Date().getTime();
    if (config.scheduleStart) {
      const start = new Date(config.scheduleStart).getTime();
      if (now < start) return false;
    }
    if (config.scheduleEnd) {
      const end = new Date(config.scheduleEnd).getTime();
      if (now > end) return false;
    }
    return true;
  }, [config.enabled, config.scheduleStart, config.scheduleEnd]);

  // Filter products according to collection source
  const collectionProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    let filtered: Product[] = [];

    switch (config.source) {
      case 'newest':
        filtered = [...products].sort((a: any, b: any) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        break;

      case 'bestsellers':
        filtered = products.filter((p: any) => p.isBestSeller);
        if (filtered.length === 0) filtered = products;
        break;

      case 'trending':
        filtered = products.filter((p: any) => p.isTrending || p.isBestSeller);
        if (filtered.length === 0) filtered = products;
        break;

      case 'featured':
        filtered = products.filter((p: any) => p.isFeatured);
        if (filtered.length === 0) filtered = products;
        break;

      case 'rating':
        filtered = [...products].sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
        break;

      case 'manual':
        if (config.selectedProductIds && config.selectedProductIds.length > 0) {
          filtered = config.selectedProductIds
            .map((id: any) => products.find((p: any) => p.id === id))
            .filter((p: any): p is Product => Boolean(p));
        } else {
          filtered = products;
        }
        break;

      case 'seasonal':
        filtered = products.filter((p: any) =>
          p.collectionTags?.some((tag: any) =>
            ['college', 'sports', 'festive', 'summer', 'winter', 'running', 'bestseller'].includes(
              (tag || '').toLowerCase()
            )
          )
        );
        if (filtered.length === 0) filtered = products;
        break;

      case 'ai_recommended':
      default:
        filtered = [...products].sort((a: any, b: any) => (b.rating || 0) * (b.reviewsCount || 1) - (a.rating || 0) * (a.reviewsCount || 1));
        break;
    }

    const limit = config.maxProducts || 8;
    return filtered.slice(0, limit);
  }, [products, config.source, config.selectedProductIds, config.maxProducts]);

  // Active current shoe
  const currentShoe = collectionProducts[activeIndex] || collectionProducts[0];

  // Set default size and color when active shoe changes
  useEffect(() => {
    if (currentShoe) {
      setSelectedSize(currentShoe.sizes?.[0] || '8');
      setSelectedColor(currentShoe.colors?.[0]?.name || 'Standard');
      setActiveImageIndex(0);
    }
  }, [currentShoe?.id]);

  // Auto-play interval if animation enabled
  useEffect(() => {
    if (!config.enableAnimation || isHovered || collectionProducts.length <= 1) return;

    const intervalMs = config.transitionSpeed === 'fast' ? 3000 : config.transitionSpeed === 'smooth' ? 6000 : 4500;

    const timer = setInterval(() => {
      setActiveIndex((prev: any) => (prev + 1) % collectionProducts.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [config.enableAnimation, config.transitionSpeed, isHovered, collectionProducts.length]);

  if (!isScheduled || collectionProducts.length === 0 || !currentShoe) {
    return null;
  }

  const isWishlisted = wishlistIds.includes(currentShoe.id);

  // Background Theme Styles
  const bgThemeClasses = ({
    dark_glass:
      'bg-gradient-to-br from-neutral-950 via-neutral-900 to-emerald-950 text-white border-y border-emerald-900/40',
    premium_cream:
      'bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-100/60 text-neutral-900 border-y border-amber-200/60',
    neon_emerald:
      'bg-gradient-to-br from-emerald-950 via-neutral-950 to-neutral-900 text-white border-y border-emerald-500/30',
    clean_white:
      'bg-white text-neutral-900 border-y border-neutral-200/80',
  } as any)[config.backgroundStyle || 'dark_glass'];

  // Card Style
  const cardStyleClasses = ({
    '3d_glass':
      'bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl',
    floating_showcase:
      'bg-white/15 backdrop-blur-md border border-white/30 shadow-2xl rounded-3xl hover:shadow-[#0B8F63]/20 transition-all duration-500',
    elevated_modern:
      'bg-white/80 backdrop-blur-sm border border-neutral-200 shadow-xl rounded-3xl text-neutral-900',
  } as any)[config.cardStyle || 'floating_showcase'];

  const isDarkBg = config.backgroundStyle === 'dark_glass' || config.backgroundStyle === 'neon_emerald';

  const formatINR = (val: number) => {
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  const calculateDiscount = (price: number, orig: number) => {
    if (!orig || orig <= price) return null;
    const diff = orig - price;
    return Math.round((diff / orig) * 100);
  };

  const discountVal = calculateDiscount(currentShoe.price, currentShoe.originalPrice) || currentShoe.discountPercent;

  return (
    <section
      id="trending-shoes-section"
      className={`relative py-12 sm:py-16 md:py-20 overflow-hidden transition-colors duration-700 ${bgThemeClasses}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Ambient Glow FX */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#0B8F63]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B8F63]/10 border border-[#0B8F63]/20 text-[#0B8F63] text-xs font-extrabold tracking-widest uppercase mb-3">
              <Flame className="w-4 h-4 fill-[#0B8F63] animate-pulse" />
              <span>{config.badgeLabel || 'COLLEGE FAVOURITES'}</span>
            </div>
            <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {config.sectionTitle || '🔥 Trending Shoes Collection'}
            </h2>
            <p className={`mt-2 text-sm sm:text-base max-w-xl ${isDarkBg ? 'text-neutral-300' : 'text-neutral-600'}`}>
              {config.subtitle || 'Discover our most popular college sports shoes.'}
            </p>
          </div>

          {/* Slider Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() =>
                setActiveIndex((prev: any) => (prev === 0 ? collectionProducts.length - 1 : prev - 1))
              }
              aria-label="Previous Shoe"
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isDarkBg
                  ? 'border-white/20 hover:bg-white/20 text-white'
                  : 'border-neutral-300 hover:bg-neutral-100 text-neutral-800'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className={`text-xs font-bold px-2 ${isDarkBg ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {activeIndex + 1} / {collectionProducts.length}
            </span>
            <button
              onClick={() => setActiveIndex((prev: any) => (prev + 1) % collectionProducts.length)}
              aria-label="Next Shoe"
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isDarkBg
                  ? 'border-white/20 hover:bg-white/20 text-white'
                  : 'border-neutral-300 hover:bg-neutral-100 text-neutral-800'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Showcase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* HERO STAGE: Active Shoe Presentation (7 cols on lg) */}
          <div className={`lg:col-span-7 p-6 sm:p-8 lg:p-10 relative overflow-hidden transition-all duration-700 ${cardStyleClasses}`}>
            
            {/* Top Badges */}
            <div className="flex items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  {currentShoe.subcategory || currentShoe.brand || 'College Sports'}
                </span>
                {discountVal ? (
                  <span className="text-xs font-black bg-rose-600 text-white px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                    {discountVal}% OFF
                  </span>
                ) : null}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => onToggleWishlist?.(currentShoe)}
                className={`p-2.5 rounded-full transition-all cursor-pointer ${
                  isWishlisted
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                    : isDarkBg
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
                title="Add to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* SHOE FLOATING SHOWCASE DISPLAY */}
            <div className="relative my-4 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[360px] group">
              
              {/* Radial Backdrop Spotlight behind active shoe */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B8F63]/30 via-transparent to-transparent rounded-full blur-2xl transform scale-90 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

              {/* Main Floating Shoe Image */}
              <img
                key={currentShoe.images?.[activeImageIndex] || currentShoe.id}
                src={currentShoe.images?.[activeImageIndex] || currentShoe.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'}
                alt={currentShoe.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                className={`w-full max-w-sm sm:max-w-md lg:max-w-lg h-56 sm:h-72 lg:h-80 object-contain filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.45)] transform group-hover:scale-105 group-hover:-translate-y-3 transition-all duration-700 ${
                  config.enableAnimation ? 'animate-[float_5s_ease-in-out_infinite]' : ''
                }`}
              />

              {/* Floor Glass Reflection Effect */}
              <div className="w-3/4 h-6 bg-gradient-to-r from-transparent via-black/40 to-transparent rounded-[100%] blur-md mt-2 opacity-70 group-hover:opacity-90 group-hover:scale-110 transition-all duration-700" />
            </div>

            {/* Image Gallery Swatches if shoe has multiple images */}
            {currentShoe.images && currentShoe.images.length > 1 && (
              <div className="flex items-center justify-center gap-2 mb-6">
                {currentShoe.images.slice(0, 5).map((img: any, i: any) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === i
                        ? 'border-[#0B8F63] scale-105 shadow-md'
                        : isDarkBg
                        ? 'border-white/20 opacity-60 hover:opacity-100'
                        : 'border-neutral-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}

            {/* PRODUCT METADATA */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDarkBg ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {currentShoe.brand || 'MBH Footwear'}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
                    {currentShoe.name}
                  </h3>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-2xl">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-extrabold text-amber-500">
                    {currentShoe.rating || 4.9}
                  </span>
                  <span className={`text-[10px] font-medium ${isDarkBg ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    ({currentShoe.reviewsCount || 84})
                  </span>
                </div>
              </div>

              {/* Price Row (Indian Rupees Only) */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B8F63]">
                  {formatINR(currentShoe.price)}
                </span>
                {currentShoe.originalPrice > currentShoe.price && (
                  <span className={`text-lg line-through font-bold ${isDarkBg ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    {formatINR(currentShoe.originalPrice)}
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  Inclusive of All Taxes
                </span>
              </div>

              {/* Size Selector Swatches */}
              {currentShoe.sizes && currentShoe.sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className={isDarkBg ? 'text-neutral-300' : 'text-neutral-700'}>
                      Select UK/IN Size:
                    </span>
                    <span className="text-[#0B8F63] hover:underline cursor-pointer">
                      Size Guide
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentShoe.sizes.map((sz: any) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedSize === sz
                            ? 'bg-[#0B8F63] text-white shadow-md shadow-[#0B8F63]/30 scale-105'
                            : isDarkBg
                            ? 'bg-white/10 hover:bg-white/20 text-white'
                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                        }`}
                      >
                        UK {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => onBuyNow?.(currentShoe, selectedSize, selectedColor)}
                  className="btn-liquid-base btn-liquid-emerald w-full text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <Zap className="w-4 h-4 fill-white group-hover:scale-125 transition-transform" />
                  <span>⚡ BUY NOW — {formatINR(currentShoe.price)}</span>
                </button>

                <button
                  onClick={() => onAddToCart?.(currentShoe, selectedSize, selectedColor)}
                  className={`btn-liquid-base w-full font-extrabold text-sm py-3.5 px-6 rounded-2xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isDarkBg
                      ? 'btn-liquid-ghost text-white'
                      : 'btn-liquid-dark text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO BAG</span>
                </button>
              </div>

              {/* Quick View Link */}
              <div className="flex items-center justify-between text-xs font-semibold pt-2">
                <button
                  onClick={() => onQuickView?.(currentShoe)}
                  className="flex items-center gap-1.5 text-neutral-400 hover:text-[#0B8F63] transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Quick 360° View Details</span>
                </button>

                <div className="flex items-center gap-2 text-[11px] text-emerald-500 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Original MBH Guarantee</span>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT DECK: Interactive Thumbnails Grid & Cards (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-base font-extrabold uppercase tracking-wider ${isDarkBg ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Collection Highlights ({collectionProducts.length})
              </h3>
              <span className="text-xs font-semibold text-[#0B8F63]">
                Click to preview
              </span>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-700">
              {collectionProducts.map((shoe: any, idx: any) => {
                const isActive = idx === activeIndex;
                const shoeDisc = calculateDiscount(shoe.price, shoe.originalPrice);

                return (
                  <div
                    key={shoe.id}
                    onClick={() => setActiveIndex(idx)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 group ${
                      isActive
                        ? 'bg-[#0B8F63]/15 border-[#0B8F63] ring-2 ring-[#0B8F63]/30 shadow-lg scale-[1.02]'
                        : isDarkBg
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        : 'bg-white border-neutral-200 hover:bg-neutral-50 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-100/10 shrink-0 flex items-center justify-center p-1">
                      <img
                        src={shoe.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'}
                        alt={shoe.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                      {isActive && (
                        <div className="absolute top-1 left-1 bg-[#0B8F63] text-white p-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase text-amber-500 truncate">
                          {shoe.brand || 'MBH'}
                        </span>
                        {shoeDisc ? (
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.2 rounded">
                            {shoeDisc}% OFF
                          </span>
                        ) : null}
                      </div>

                      <h4 className="text-sm font-bold truncate group-hover:text-[#0B8F63] transition-colors">
                        {shoe.name}
                      </h4>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-black text-[#0B8F63]">
                          {formatINR(shoe.price)}
                        </span>
                        {shoe.originalPrice > shoe.price && (
                          <span className={`text-xs line-through ${isDarkBg ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            {formatINR(shoe.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <button
                        onClick={(e: any) => {
                          e.stopPropagation();
                          onQuickView?.(shoe);
                        }}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isDarkBg ? 'hover:bg-white/20 text-neutral-300' : 'hover:bg-neutral-200 text-neutral-600'
                        }`}
                        title="Quick View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
