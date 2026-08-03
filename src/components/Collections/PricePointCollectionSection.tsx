import React, { useState, useMemo } from 'react';
import {
  Flame,
  Zap,
  ShoppingBag,
  Heart,
  Star,
  Eye,
  Check,
  ShieldCheck,
  Tag,
  ArrowRight,
  Percent,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductVariant } from '../../types';

interface PricePointCollectionSectionProps {
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product, size: string, color: string, variant?: ProductVariant) => void;
  onBuyNow?: (product: Product, size: string, color: string, quantity?: number, variant?: ProductVariant) => void;
  onToggleWishlist?: (product: Product) => void;
  wishlistIds?: string[];
  alreadyDisplayedProductIds?: string[];
}

export const PricePointCollectionSection: React.FC<PricePointCollectionSectionProps> = ({
  onQuickView,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds = [],
  alreadyDisplayedProductIds = [],
}) => {
  const { pricePointConfig, products } = useStore();
  const config = pricePointConfig;

  // Selected sizes for individual products
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

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

  // Filter products specifically for Footwear / Shoes under configured price point
  const displayProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // Filter 1: Footwear only (exclude clothing)
    let shoeProducts = products.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      const sub = (p.subcategory || '').toLowerCase();
      const name = (p.name || '').toLowerCase();

      // Explicitly reject obvious clothing
      if (
        cat.includes('clothing') ||
        cat.includes('apparel') ||
        sub.includes('shirt') ||
        sub.includes('jeans') ||
        sub.includes('t-shirt') ||
        sub.includes('jacket') ||
        sub.includes('dress')
      ) {
        return false;
      }

      // Must match footwear criteria or general product list
      return (
        cat.includes('men') ||
        cat.includes('women') ||
        cat.includes('footwear') ||
        cat.includes('shoes') ||
        sub.includes('shoe') ||
        sub.includes('sneaker') ||
        sub.includes('footwear') ||
        sub.includes('boot') ||
        name.includes('shoe') ||
        name.includes('sneaker') ||
        name.includes('loafer') ||
        name.includes('slide') ||
        name.includes('boot') ||
        name.includes('running')
      );
    });

    if (shoeProducts.length === 0) shoeProducts = products;

    // Filter 2: Out of Stock check
    if (config.excludeOutofStock) {
      shoeProducts = shoeProducts.filter((p) => p.inStock !== false);
    }

    // Filter 3: Deduplication if enabled
    if (config.preventDuplicateHomepageItems && alreadyDisplayedProductIds.length > 0) {
      const deduped = shoeProducts.filter((p) => !alreadyDisplayedProductIds.includes(p.id));
      if (deduped.length >= 2) {
        shoeProducts = deduped;
      }
    }

    // Filter 4: Apply Source logic
    const limitPrice = config.priceLimit || 699;
    let filtered: Product[] = [];

    switch (config.source) {
      case 'price_limit':
        filtered = shoeProducts.filter((p) => p.price <= limitPrice);
        // If not enough products strictly <= limit, sort ascending by price
        if (filtered.length === 0) {
          filtered = [...shoeProducts].sort((a, b) => a.price - b.price);
        }
        break;

      case 'manual':
        if (config.selectedProductIds && config.selectedProductIds.length > 0) {
          filtered = config.selectedProductIds
            .map((id) => shoeProducts.find((p) => p.id === id))
            .filter((p): p is Product => Boolean(p));
        } else {
          filtered = shoeProducts;
        }
        break;

      case 'featured':
        filtered = shoeProducts.filter((p) => p.isFeatured || p.price <= limitPrice);
        break;

      case 'collection':
        filtered = shoeProducts.filter(
          (p) =>
            p.price <= limitPrice ||
            p.collectionTags?.some((t) => ['budget', 'value', 'college', 'bestseller'].includes(t.toLowerCase()))
        );
        break;

      case 'ai_recommended':
      default:
        filtered = [...shoeProducts]
          .filter((p) => p.price <= limitPrice + 300)
          .sort((a, b) => a.price - b.price);
        break;
    }

    // Deduplicate within this section itself
    const uniqueMap = new Map<string, Product>();
    filtered.forEach((p) => uniqueMap.set(p.id, p));
    const uniqueList = Array.from(uniqueMap.values());

    const max = config.maxProducts || 8;
    return uniqueList.slice(0, max);
  }, [
    products,
    config.source,
    config.priceLimit,
    config.selectedProductIds,
    config.maxProducts,
    config.excludeOutofStock,
    config.preventDuplicateHomepageItems,
    alreadyDisplayedProductIds,
  ]);

  if (!isScheduled || displayProducts.length === 0) {
    return null;
  }

  const formatINR = (val: number) => `₹${Math.round(val).toLocaleString('en-IN')}`;

  const calculateDiscount = (price: number, orig: number) => {
    if (!orig || orig <= price) return null;
    return Math.round(((orig - price) / orig) * 100);
  };

  // Background style classes
  const bgThemeClasses = {
    obsidian_emerald:
      'bg-gradient-to-br from-neutral-950 via-neutral-900 to-emerald-950 text-white border-y border-emerald-900/30',
    midnight_purple:
      'bg-gradient-to-br from-neutral-950 via-slate-950 to-indigo-950 text-white border-y border-indigo-900/30',
    cream_gold:
      'bg-gradient-to-br from-amber-50/90 via-orange-50/30 to-amber-100/50 text-neutral-900 border-y border-amber-200/60',
    clean_white:
      'bg-white text-neutral-900 border-y border-neutral-200',
  }[config.backgroundStyle || 'obsidian_emerald'];

  // Card style classes
  const cardStyleClasses = {
    neon_glass:
      'bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-[#0B8F63]/30 rounded-3xl hover:border-[#0B8F63]/50',
    minimalist_glow:
      'bg-white/15 backdrop-blur-md border border-white/25 shadow-lg rounded-3xl hover:shadow-2xl',
    luxury_dark_gold:
      'bg-neutral-900/90 border border-amber-500/30 shadow-2xl rounded-3xl hover:border-amber-500/60',
  }[config.cardStyle || 'neon_glass'];

  const isDarkBg = config.backgroundStyle !== 'clean_white' && config.backgroundStyle !== 'cream_gold';

  return (
    <section
      id="price-point-699-section"
      className={`relative py-12 sm:py-16 md:py-20 overflow-hidden transition-all duration-500 ${bgThemeClasses}`}
    >
      {/* Background Ambient Glow Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#0B8F63]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-widest uppercase mb-3">
              <Zap className="w-4 h-4 fill-emerald-400 text-emerald-400 animate-pulse" />
              <span>{config.badgeLabel || 'UNBEATABLE VALUE'}</span>
            </div>
            
            <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {config.sectionTitle || '🔥 Starting at ₹699'}
            </h2>
            <p className={`mt-2 text-sm sm:text-base max-w-xl ${isDarkBg ? 'text-neutral-300' : 'text-neutral-600'}`}>
              {config.subtitle || 'Premium Shoes Under ₹699'}
            </p>
          </div>

          {/* Quick Filter Tag / Counter Pill */}
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2 text-xs font-bold ${
              isDarkBg ? 'bg-white/10 border-white/20 text-white' : 'bg-neutral-100 border-neutral-300 text-neutral-800'
            }`}>
              <Tag className="w-4 h-4 text-[#0B8F63]" />
              <span>Max Price: <strong className="text-[#0B8F63] text-sm">₹{config.priceLimit || 699}</strong></span>
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID / SHOWCASE DECK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product, idx) => {
            const isWishlisted = wishlistIds.includes(product.id);
            const discountPercent = calculateDiscount(product.price, product.originalPrice) || product.discountPercent;
            const currentSelectedSize = selectedSizes[product.id] || product.sizes?.[0] || '8';
            const isHovered = hoveredProductId === product.id;

            return (
              <div
                key={product.id}
                onMouseEnter={() => setHoveredProductId(product.id)}
                onMouseLeave={() => setHoveredProductId(null)}
                className={`group relative p-5 flex flex-col justify-between transition-all duration-500 ${cardStyleClasses} ${
                  config.enableAnimation
                    ? 'hover:-translate-y-2 hover:scale-[1.02]'
                    : ''
                }`}
              >
                {/* Top Overlay Badges */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                      Under ₹{config.priceLimit || 699}
                    </span>

                    {/* Wishlist Button */}
                    <button
                      onClick={() => onToggleWishlist?.(product)}
                      className={`p-2 rounded-full transition-all cursor-pointer ${
                        isWishlisted
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                          : isDarkBg
                          ? 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      }`}
                      title="Add to Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Shoe Floating Showcase Canvas */}
                  <div className="relative my-2 h-48 sm:h-52 flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-transparent to-black/10">
                    
                    {/* Background Radial Glow */}
                    <div className="absolute inset-0 bg-[#0B8F63]/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

                    {/* Shoe Image with floating 3D animation */}
                    <img
                      src={
                        product.images?.[0] ||
                        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={product.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className={`w-full h-40 sm:h-44 object-contain filter drop-shadow-[0_15px_20px_rgba(0,0,0,0.35)] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 ${
                        config.enableAnimation ? 'animate-[float_6s_ease-in-out_infinite]' : ''
                      }`}
                      style={{ animationDelay: `${idx * 0.4}s` }}
                    />

                    {/* Floor Reflection Shadow */}
                    <div className="w-2/3 h-3 bg-black/40 rounded-[100%] blur-sm opacity-60 group-hover:scale-110 transition-all duration-500" />

                    {/* Discount Badge */}
                    {discountPercent ? (
                      <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md uppercase">
                        {discountPercent}% OFF
                      </div>
                    ) : null}
                  </div>

                  {/* Brand & Name */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDarkBg ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {product.brand || 'MBH Footwear'}
                      </span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{product.rating || 4.8}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold line-clamp-1 group-hover:text-[#0B8F63] transition-colors">
                      {product.name}
                    </h3>
                  </div>
                </div>

                {/* Bottom Price & Action Controls */}
                <div className="mt-4 space-y-3 pt-3 border-t border-white/10">
                  
                  {/* Price Row */}
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black tracking-tight text-[#0B8F63]">
                        {formatINR(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className={`text-xs line-through font-bold ${isDarkBg ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          {formatINR(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                      In Stock
                    </span>
                  </div>

                  {/* Quick Size Swatches */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none">
                      <span className={`text-[10px] font-bold shrink-0 ${isDarkBg ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        Size:
                      </span>
                      <div className="flex gap-1">
                        {product.sizes.slice(0, 4).map((sz) => (
                          <button
                            key={sz}
                            onClick={() => setSelectedSizes({ ...selectedSizes, [product.id]: sz })}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
                              currentSelectedSize === sz
                                ? 'bg-[#0B8F63] text-white shadow-sm'
                                : isDarkBg
                                ? 'bg-white/10 hover:bg-white/20 text-neutral-300'
                                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Primary CTA Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        onBuyNow?.(product, currentSelectedSize, product.colors?.[0]?.name || 'Standard')
                      }
                      className="btn-liquid-base btn-liquid-emerald w-full text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>BUY NOW</span>
                    </button>

                    <button
                      onClick={() =>
                        onAddToCart?.(product, currentSelectedSize, product.colors?.[0]?.name || 'Standard')
                      }
                      className={`btn-liquid-base w-full font-extrabold text-xs py-2.5 px-3 rounded-xl border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isDarkBg
                          ? 'btn-liquid-ghost text-white'
                          : 'btn-liquid-dark text-white'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>ADD</span>
                    </button>
                  </div>

                  {/* Quick View Link */}
                  <div className="text-center pt-1">
                    <button
                      onClick={() => onQuickView?.(product)}
                      className="text-[11px] font-bold text-neutral-400 hover:text-[#0B8F63] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Quick Details</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
