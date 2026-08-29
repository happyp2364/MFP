import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Star,
  Clock,
  CheckCircle,
  Truck,
  ShieldCheck,
  PackageCheck,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  Tag,
  Gift,
  Zap,
  Instagram,
  Heart,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { HomepageConfig, HomepageSection, Product } from '../../types';
import { ProductCard } from '../Products/ProductCard';
import { TrendingShoesSection } from '../Collections/TrendingShoesSection';
import { PricePointCollectionSection } from '../Collections/PricePointCollectionSection';

interface HomepageRendererProps {
  previewConfig?: HomepageConfig;
  onSelectProduct?: (product: Product) => void;
  onNavigateCategory?: (category: string) => void;
}

export const HomepageRenderer: React.FC<HomepageRendererProps> = ({
  previewConfig,
  onSelectProduct,
  onNavigateCategory,
}) => {
  const { homepageConfig, products, reviews, categoryHighlights } = useStore();
  const config = previewConfig || homepageConfig;

  if (!config || !Array.isArray(config.sections) || config.sections.length === 0) {
    return null; // Fallback to standard app homepage if empty
  }

  // Filter only enabled sections
  const activeSections = config.sections.filter((s) => s.enabled);

  return (
    <div className="w-full space-y-8 pb-12">
      {activeSections.map((section, idx) => (
        <SectionItem
          key={`${section.id}-${idx}`}
          section={section}
          products={products}
          reviews={reviews}
          categoryHighlights={categoryHighlights}
          onSelectProduct={onSelectProduct}
          onNavigateCategory={onNavigateCategory}
        />
      ))}
    </div>
  );
};

interface SectionItemProps {
  section: HomepageSection;
  products: Product[];
  reviews: any[];
  categoryHighlights?: any[];
  onSelectProduct?: (p: Product) => void;
  onNavigateCategory?: (cat: string) => void;
}

function getCategoryCoverImage(catItem: any, products: Product[]): string {
  // 1. Admin cover uploaded
  if (
    catItem.image &&
    typeof catItem.image === 'string' &&
    catItem.image.trim() !== '' &&
    !catItem.image.includes('photo-1617038260897')
  ) {
    return catItem.image;
  }

  const catFilter = (catItem.categoryFilter || catItem.title || catItem.name || '').toLowerCase();
  const subFilter = (catItem.subcategoryFilter || '').toLowerCase();

  const matchingProducts = products.filter((p) => {
    const pCat = (p.category || '').toLowerCase();
    const pSub = (p.subcategory || '').toLowerCase();
    const pName = (p.name || '').toLowerCase();

    if (subFilter && pSub.includes(subFilter)) return true;
    if (catFilter && (pCat.includes(catFilter) || pSub.includes(catFilter) || pName.includes(catFilter))) return true;
    return false;
  });

  // 2. Highest selling product
  if (matchingProducts.length > 0) {
    const sorted = [...matchingProducts].sort(
      (a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0)
    );
    if (sorted[0]?.images?.[0]) return sorted[0].images[0];

    // 3. Featured product
    const featured = matchingProducts.find((p) => p.isBestSeller || p.isFeatured || p.isTrending);
    if (featured?.images?.[0]) return featured.images[0];

    if (matchingProducts[0]?.images?.[0]) return matchingProducts[0].images[0];
  }

  // Check overall store products matching footwear category/gender
  if (catFilter.includes('women')) {
    const wShoe = products.find((p) => p.category === 'women' && p.images?.length);
    if (wShoe?.images[0]) return wShoe.images[0];
  }
  if (catFilter.includes('kid')) {
    const kShoe = products.find((p) => p.category === 'kids' && p.images?.length);
    if (kShoe?.images[0]) return kShoe.images[0];
  }

  // 4. AI Footwear Cover by category
  if (catFilter.includes('run') || catFilter.includes('sport')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80';
  }
  if (catFilter.includes('sneak') || catFilter.includes('casual')) {
    return 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80';
  }
  if (catFilter.includes('women')) {
    return 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80';
  }
  if (catFilter.includes('kid') || catFilter.includes('school')) {
    return 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80';
  }
  if (catFilter.includes('loaf') || catFilter.includes('formal') || catFilter.includes('leather')) {
    return 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80';
  }
  if (catFilter.includes('slide') || catFilter.includes('slipper') || catFilter.includes('sandal') || catFilter.includes('croc')) {
    return 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80';
  }

  return 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80';
}

const isCategoryVisible = (catItem: any) => {
  if (catItem.enabled === false || catItem.hidden === true) return false;
  const now = new Date().getTime();
  if (catItem.scheduleStart) {
    const start = new Date(catItem.scheduleStart).getTime();
    if (!isNaN(start) && now < start) return false;
  }
  if (catItem.scheduleEnd) {
    const end = new Date(catItem.scheduleEnd).getTime();
    if (!isNaN(end) && now > end) return false;
  }
  return true;
};

const SectionItem: React.FC<SectionItemProps> = ({
  section,
  products,
  reviews,
  categoryHighlights = [],
  onSelectProduct,
  onNavigateCategory,
}) => {
  const styling = section.styling || {};
  const data = section.contentData || {};

  const sectionStyle: React.CSSProperties = {
    backgroundColor: styling.bgColor || 'transparent',
    color: styling.textColor || 'inherit',
    paddingTop: `${styling.paddingTop ?? 32}px`,
    paddingBottom: `${styling.paddingBottom ?? 32}px`,
  };

  const containerClass = styling.fullWidth ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6';

  switch (section.type) {
    case 'mbh_shoe_carousel':
      return (
        <MBHShoeCarouselHeroSection
          section={section}
          products={products}
          onSelectProduct={onSelectProduct}
          onNavigateCategory={onNavigateCategory}
        />
      );

    case 'trending_shoes':
    case 'trending_shoes_collection':
      return <TrendingShoesSection onQuickView={onSelectProduct} />;

    case 'price_point_699':
    case 'price_699_collection':
      return <PricePointCollectionSection onQuickView={onSelectProduct} />;

    case 'floating_sneaker':
      return <FloatingSneakerHeroSection section={section} onNavigateCategory={onNavigateCategory} />;

    case 'hero_banner':
    case 'slider':
    case 'image_carousel': {
      const slides = data.slides || data.items || [];
      return (
        <div style={sectionStyle} className="w-full">
          <div className={containerClass}>
            {slides.length > 0 ? (
              <HeroCarousel slides={slides} />
            ) : (
              <div className="bg-neutral-900 text-white rounded-3xl p-8 sm:p-16 text-center space-y-4">
                <span className="px-3 py-1 bg-amber-400 text-black text-xs font-bold rounded-full uppercase tracking-wider">
                  Diwali Special
                </span>
                <h1 className="text-3xl sm:text-5xl font-black">{section.title}</h1>
                <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto">{section.subtitle}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'featured_products':
    case 'trending_products':
    case 'new_arrivals':
    case 'best_sellers': {
      const limit = data.limit || 8;
      const filteredCat = data.category;
      let items = products;
      if (filteredCat && filteredCat !== 'ALL') {
        items = items.filter((p) => p.category?.toLowerCase() === filteredCat.toLowerCase());
      }
      const displayProducts = items.slice(0, limit);

      return (
        <div style={sectionStyle} className="w-full">
          <div className={containerClass}>
            {/* Header */}
            <div className="flex items-end justify-between mb-6 pb-2 border-b border-neutral-200">
              <div>
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight">{section.title}</h2>
                {section.subtitle && <p className="text-xs sm:text-sm text-neutral-500 mt-1">{section.subtitle}</p>}
              </div>
              {data.viewAllLink && (
                <button
                  onClick={() => onNavigateCategory && onNavigateCategory(data.category || 'ALL')}
                  className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {displayProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={(p) => onSelectProduct && onSelectProduct(p)}
                  onToggleWishlist={() => {}}
                  isWishlisted={false}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'flash_sale':
    case 'countdown_timer': {
      const targetDate = data.targetDate ? new Date(data.targetDate) : new Date(Date.now() + 86400000 * 2);
      const displayProducts = products.slice(0, data.limit || 4);

      return (
        <div style={sectionStyle} className="w-full bg-gradient-to-r from-neutral-900 via-rose-950 to-neutral-900 text-white rounded-3xl my-4">
          <div className={`${containerClass} py-8`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
              <div className="space-y-1 text-center md:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-black text-xs font-black rounded-full uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 fill-black" /> {data.badgeText || 'FLASH SALE'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{section.title}</h2>
                <p className="text-xs text-neutral-300">{section.subtitle}</p>
              </div>

              <CountdownClock targetDate={targetDate} />
            </div>

            {/* Flash Sale Products */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {displayProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={(p) => onSelectProduct && onSelectProduct(p)}
                  onToggleWishlist={() => {}}
                  isWishlisted={false}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'categories': {
      const rawItems = data.categoryItems || data.items || data.categories || categoryHighlights || [];
      const normalizedItems = rawItems.map((item: any, idx: number) => {
        if (typeof item === 'string') {
          const found = categoryHighlights?.find((c: any) => c.title === item || c.id === item);
          if (found) return found;
          return {
            id: `cat_${idx}`,
            title: item,
            subtitle: 'Explore Footwear Collection',
            categoryFilter: item,
            buttonText: 'Explore Collection →',
            enabled: true,
          };
        }
        return item;
      });

      const visibleItems = normalizedItems.filter(isCategoryVisible);

      return (
        <div style={sectionStyle} className="w-full">
          <div className={containerClass}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-neutral-900">{section.title || 'Shop by Family & Gender'}</h2>
              {section.subtitle && <p className="text-xs text-neutral-500 mt-1">{section.subtitle}</p>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {visibleItems.map((cat: any, idx: number) => {
                const coverImage = getCategoryCoverImage(cat, products);
                const btnLabel = cat.buttonText || 'Explore Collection →';
                const filterValue = cat.categoryFilter || cat.subcategoryFilter || cat.title || cat.name || 'all';

                return (
                  <div
                    key={cat.id || idx}
                    onClick={() => onNavigateCategory && onNavigateCategory(filterValue)}
                    className="group relative h-56 rounded-2xl overflow-hidden bg-neutral-900 cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 border border-black/10 flex flex-col justify-end p-4"
                  >
                    <img
                      src={coverImage}
                      alt={cat.title || cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity group-hover:opacity-90" />

                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10">
                      {cat.featured && (
                        <span className="px-2 py-0.5 bg-amber-400 text-neutral-950 font-black text-[9px] rounded-full uppercase tracking-wider shadow-sm">
                          FEATURED
                        </span>
                      )}
                      {cat.trending && (
                        <span className="px-2 py-0.5 bg-rose-500 text-white font-black text-[9px] rounded-full uppercase tracking-wider shadow-sm">
                          HOT
                        </span>
                      )}
                      {cat.newBadge && (
                        <span className="px-2 py-0.5 bg-emerald-500 text-white font-black text-[9px] rounded-full uppercase tracking-wider shadow-sm">
                          NEW
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 space-y-1">
                      <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors leading-tight">
                        {cat.title || cat.name}
                      </h3>
                      {cat.subtitle && (
                        <p className="text-[11px] text-neutral-300 font-medium line-clamp-1 opacity-90">
                          {cat.subtitle}
                        </p>
                      )}
                      <div className="pt-1 flex items-center justify-between text-[10px] font-bold text-amber-300 group-hover:translate-x-1 transition-transform">
                        <span>{btnLabel}</span>
                        {cat.itemCount && (
                          <span className="text-neutral-400 font-mono font-normal">{cat.itemCount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    case 'offer_cards': {
      const offers = data.items || [];
      return (
        <div style={sectionStyle} className="w-full">
          <div className={containerClass}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offers.map((offer: any, idx: number) => (
                <div
                  key={offer.id || idx}
                  className="relative rounded-2xl overflow-hidden shadow-lg h-52 bg-neutral-900 text-white flex items-center p-6 sm:p-8"
                >
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                  />
                  <div className="relative z-10 space-y-2 max-w-xs">
                    <span className="px-2.5 py-1 bg-amber-400 text-black font-extrabold text-[10px] rounded-md uppercase tracking-wider">
                      Special Offer
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black">{offer.title}</h3>
                    <p className="text-xs text-neutral-200">{offer.subtitle}</p>
                    {offer.buttonText && (
                      <button
                        onClick={() => onNavigateCategory && onNavigateCategory('ALL')}
                        className="mt-2 px-4 py-1.5 bg-white text-black font-bold text-xs rounded-lg hover:bg-amber-300 transition-colors"
                      >
                        {offer.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'customer_reviews': {
      const displayReviews = reviews.slice(0, data.limit || 6);
      return (
        <div style={sectionStyle} className="w-full bg-neutral-50 py-8">
          <div className={containerClass}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-neutral-900">{section.title}</h2>
              {section.subtitle && <p className="text-xs text-neutral-500 mt-1">{section.subtitle}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {displayReviews.map((rev: any, idx: number) => (
                <div key={rev.id || idx} className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-700 italic">"{rev.comment || 'Absoluelty stunning saree! High quality silk with gorgeous gold zari.'}"</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                      {(rev.userName || 'Customer')[0]}
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-neutral-900">{rev.userName || 'Verified Buyer'}</span>
                      <span className="block text-[10px] text-emerald-600 font-semibold">Verified Purchase</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'why_choose_us': {
      const badges = data.items || [
        { title: 'Free Express Shipping', desc: 'Across 25,000+ pincodes in India', icon: 'truck' },
        { title: '100% Genuine Quality', desc: 'Authentic handcrafted sarees', icon: 'shield' },
        { title: 'Open Box Delivery', desc: 'Inspect before handover at delivery', icon: 'package' },
        { title: 'WhatsApp Ordering', desc: 'Direct 1-click WhatsApp checkout', icon: 'phone' },
      ];
      return (
        <div style={sectionStyle} className="w-full border-y border-neutral-200 bg-white">
          <div className={containerClass}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {badges.map((item: any, idx: number) => (
                <div key={idx} className="flex flex-col items-center text-center space-y-2 p-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                    {item.icon === 'truck' ? (
                      <Truck className="w-6 h-6" />
                    ) : item.icon === 'shield' ? (
                      <ShieldCheck className="w-6 h-6" />
                    ) : item.icon === 'package' ? (
                      <PackageCheck className="w-6 h-6" />
                    ) : (
                      <PhoneCall className="w-6 h-6" />
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900">{item.title}</h4>
                  <p className="text-[11px] text-neutral-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'faqs': {
      const faqs = data.faqs || [];
      return <FaqAccordion faqs={faqs} title={section.title} subtitle={section.subtitle} />;
    }

    default:
      return null;
  }
};

const HeroCarousel: React.FC<{ slides: any[] }> = ({ slides }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const slide = slides[current] || slides[0];
  if (!slide) return null;

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[420px] sm:h-[500px] bg-neutral-900 text-white flex items-center">
      <img
        src={slide.imageUrl}
        alt={slide.title}
        className="absolute inset-0 w-full h-full object-cover opacity-60 transition-all duration-700"
      />
      <div className="relative z-10 p-6 sm:p-12 max-w-2xl space-y-4">
        {slide.badgeText && (
          <span className="inline-block px-3.5 py-1 bg-amber-400 text-black font-extrabold text-xs rounded-full uppercase tracking-wider">
            {slide.badgeText}
          </span>
        )}
        <h1 className="text-3xl sm:text-5xl font-black leading-tight drop-shadow-md">{slide.title}</h1>
        <p className="text-sm sm:text-base text-neutral-200">{slide.subtitle}</p>
        {slide.buttonText && (
          <button className="mt-4 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2">
            {slide.buttonText} <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                current === i ? 'bg-amber-400 w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CountdownClock: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, targetDate.getTime() - now);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-2 text-center">
      <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 min-w-[50px]">
        <span className="block text-xl font-black text-amber-300">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="block text-[9px] font-bold text-neutral-300 uppercase">Hours</span>
      </div>
      <span className="text-xl font-bold text-white">:</span>
      <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 min-w-[50px]">
        <span className="block text-xl font-black text-amber-300">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="block text-[9px] font-bold text-neutral-300 uppercase">Mins</span>
      </div>
      <span className="text-xl font-bold text-white">:</span>
      <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 min-w-[50px]">
        <span className="block text-xl font-black text-amber-300">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="block text-[9px] font-bold text-neutral-300 uppercase">Secs</span>
      </div>
    </div>
  );
};

const FaqAccordion: React.FC<{ faqs: any[]; title?: string; subtitle?: string }> = ({ faqs, title, subtitle }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-neutral-900">{title || 'Frequently Asked Questions'}</h2>
        {subtitle && <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>}
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 text-left font-bold text-sm text-neutral-900 flex items-center justify-between hover:bg-neutral-50"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-600" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>
              {isOpen && (
                <div className="p-4 pt-0 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 bg-neutral-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FloatingSneakerHeroSection: React.FC<{
  section: HomepageSection;
  onNavigateCategory?: (cat: string) => void;
}> = ({ section, onNavigateCategory }) => {
  const data = section.contentData || {};
  const styling = section.styling || {};

  const mainImage =
    data.mainImage ||
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80';
  const secondaryImages = data.secondaryImages || [
    mainImage,
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80',
  ];

  const [activeImage, setActiveImage] = useState(mainImage);
  const [activeTab, setActiveTab] = useState(data.navLabels?.[0] || 'Overview');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setActiveImage(mainImage);
  }, [mainImage]);

  const bgWord = (data.backgroundWord || 'SPORT').toUpperCase();
  const smallHeading = data.smallHeading || '2026 EDITION • MARUDHAR LUXURY';
  const mainHeading = data.mainHeading || 'AIR GLIDE PRO RUNNER';
  const description =
    data.description ||
    'Engineered with responsive cloud-foam cushioning, ultra-breathable flyknit weave, and polished burnished leather accents.';
  const ctaText = data.ctaText || 'EXPLORE & BUY NOW';
  const ctaStyle = data.ctaStyle || 'filled';

  const rot = data.productRotation ?? -12;
  const scale = data.productScale ?? 1.05;
  const posY = data.productPositionY ?? -10;

  const enableFloating = data.enableFloatingAnimation ?? true;
  const enableHoverZoom = data.enableHoverZoom ?? true;
  const enableSoftGlow = data.enableSoftGlow ?? true;
  const enableReflection = data.enableReflection ?? true;

  const floatingBadges = data.floatingBadges || [
    { title: 'Ultralight Cushioning', value: '320g', position: 'top-left' },
    { title: 'Air Flow Soles', value: '98% Breathable', position: 'bottom-right' },
    { title: 'Open Box Guarantee', value: 'Inspect & Pay', position: 'top-right' },
  ];

  const navLabels = data.navLabels || ['Overview', 'Tech Specs', 'Size Guide', 'Reviews'];
  const productTags = data.productTags || ['🔥 HOT DROP', 'LIMITED EDITION', 'FREE SHIPPING'];

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden my-4 shadow-2xl transition-all border border-black/10 select-none"
      style={{
        backgroundColor: styling.bgColor || '#f4f2ee',
      }}
    >
      {/* Big Background Display Typography Word */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0">
        <span
          className="font-black text-[18vw] lg:text-[210px] tracking-widest uppercase leading-none opacity-[0.08] text-neutral-900 select-none transition-transform duration-700"
          style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
        >
          {bgWord}
        </span>
      </div>

      {/* Top Glassmorphic Navigation Bar */}
      <div className="relative z-20 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-black/5 bg-white/30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-neutral-900 text-white font-black text-xs flex items-center justify-center shadow-md">
            M
          </span>
          <span className="text-xs font-black tracking-widest text-neutral-900 uppercase">
            MARUDHAR LUXURY SNEAKERS
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-black/5 p-1 rounded-full border border-black/5">
          {navLabels.map((lbl: string) => (
            <button
              key={lbl}
              onClick={() => setActiveTab(lbl)}
              className={`px-3.5 py-1 text-[11px] font-bold rounded-full transition-all ${
                activeTab === lbl
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:text-black hover:bg-white/40'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {productTags.slice(0, 2).map((tag: string, i: number) => (
            <span
              key={i}
              className="px-2.5 py-0.5 bg-amber-400/90 text-neutral-950 font-extrabold text-[10px] rounded-full uppercase tracking-wider shadow-2xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="relative z-10 px-6 sm:px-12 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN: Headings & CTA */}
        <div className="lg:col-span-5 space-y-6 text-neutral-900">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 text-white text-[11px] font-extrabold rounded-full uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {smallHeading}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-neutral-900 uppercase">
              {mainHeading}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium max-w-md">
              {description}
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigateCategory && onNavigateCategory('ALL')}
              className={`px-8 py-4 text-xs sm:text-sm font-black uppercase tracking-wider rounded-2xl shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2.5 ${
                ctaStyle === 'glass'
                  ? 'bg-white/60 text-neutral-900 border border-white/80 backdrop-blur-md hover:bg-white'
                  : ctaStyle === 'outline'
                  ? 'bg-transparent text-neutral-900 border-2 border-neutral-900 hover:bg-neutral-900 hover:text-white'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Secondary Thumbnail Gallery */}
          <div className="pt-4 border-t border-black/5 space-y-2">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
              Colorways & Angle Showcase
            </span>
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {secondaryImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white shadow-xs ${
                    activeImage === img
                      ? 'border-neutral-900 ring-2 ring-amber-400/50 scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Floating Sneaker Showcase */}
        <div
          className="lg:col-span-7 relative flex flex-col items-center justify-center min-h-[380px] sm:min-h-[460px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Radial Soft Glow Ring */}
          {enableSoftGlow && (
            <div className="absolute w-[280px] sm:w-[380px] h-[280px] sm:h-[380px] bg-amber-400/20 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" />
          )}

          {/* Floating Shoe Image */}
          <div
            className={`relative transition-all duration-700 ease-out cursor-pointer ${
              enableFloating ? 'animate-bounce' : ''
            }`}
            style={{
              transform: `rotate(${rot}deg) scale(${
                isHovered && enableHoverZoom ? scale * 1.08 : scale
              }) translateY(${posY}px)`,
            }}
          >
            <img
              src={activeImage}
              alt={mainHeading}
              className="max-h-[300px] sm:max-h-[420px] w-auto object-contain filter drop-shadow-2xl transition-all duration-500"
            />
          </div>

          {/* Soft Floor Shadow */}
          <div
            className="w-48 sm:w-64 h-5 bg-black/25 rounded-[100%] blur-md mt-4 transition-all duration-500"
            style={{
              transform: isHovered ? 'scale(0.85)' : 'scale(1)',
              opacity: isHovered ? 0.4 : 0.6,
            }}
          />

          {/* Floor Reflection */}
          {enableReflection && (
            <div className="w-64 sm:w-80 h-12 overflow-hidden opacity-15 pointer-events-none -mt-3 blur-[1px]">
              <img
                src={activeImage}
                alt="Reflection"
                className="w-full object-contain transform scale-y-[-1] rotate-180"
              />
            </div>
          )}

          {/* Floating Glass Badges */}
          {floatingBadges[0] && (
            <div className="absolute top-4 left-2 sm:left-6 bg-white/60 backdrop-blur-md border border-white/80 p-3 rounded-2xl shadow-xl space-y-0.5 animate-pulse">
              <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                {floatingBadges[0].title}
              </span>
              <span className="block text-xs font-black text-neutral-900">
                {floatingBadges[0].value}
              </span>
            </div>
          )}

          {floatingBadges[1] && (
            <div className="absolute bottom-12 right-2 sm:right-6 bg-white/60 backdrop-blur-md border border-white/80 p-3 rounded-2xl shadow-xl space-y-0.5">
              <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                {floatingBadges[1].title}
              </span>
              <span className="block text-xs font-black text-amber-600">
                {floatingBadges[1].value}
              </span>
            </div>
          )}

          {floatingBadges[2] && (
            <div className="hidden sm:block absolute top-8 right-8 bg-neutral-900/80 backdrop-blur-md border border-white/20 p-2.5 px-3.5 rounded-2xl shadow-xl text-white">
              <span className="block text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                {floatingBadges[2].title}
              </span>
              <span className="block text-xs font-bold">{floatingBadges[2].value}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MBHShoeCarouselHeroSection: React.FC<{
  section: HomepageSection;
  products?: Product[];
  onSelectProduct?: (p: Product) => void;
  onNavigateCategory?: (cat: string) => void;
}> = ({ section, products = [], onSelectProduct, onNavigateCategory }) => {
  const data = section.contentData || {};
  const styling = section.styling || {};
  const { showToast } = useStore();

  const slides = Array.isArray(data.slides) && data.slides.length > 0
    ? data.slides
    : [
        {
          id: 'slide_1',
          productName: 'MBH Aura Glide 3D Flyknit',
          collection: '2026 LUXURY RUNNER',
          price: 2999,
          originalPrice: 5999,
          discountText: '50% OFF',
          description: 'Engineered with responsive cloud cushioning, ultra-breathable flyknit weave, and signature brass heel counter accents.',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
          buyNowText: '⚡ BUY NOW',
          buyNowLink: '/products',
          viewDetailsText: 'VIEW DETAILS',
          showWishlist: true,
          floatingBadges: [
            { title: 'Ultralight Flyknit', value: '280g' },
            { title: 'Glass Air Cushion', value: 'Cloud Feel' },
            { title: 'Open Box Guarantee', value: 'Try & Pay' },
          ],
        },
      ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState<Record<number, boolean>>({});

  // Touch Gesture State
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const activeSlide = slides[currentIndex] || slides[0];

  // AutoPlay Effect
  const autoPlay = data.autoPlay ?? true;
  const autoPlayInterval = (data.autoPlayInterval || 5) * 1000;

  useEffect(() => {
    if (!autoPlay || isHovered || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, isHovered, slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleToggleWishlist = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted((prev) => {
      const next = !prev[idx];
      showToast(
        next ? `Added "${activeSlide.productName}" to Wishlist` : `Removed from Wishlist`,
        'success'
      );
      return { ...prev, [idx]: next };
    });
  };

  const handleBuyNow = () => {
    const linked = products.find(
      (p) =>
        p.id === activeSlide.productId ||
        p.name.toLowerCase() === activeSlide.productName.toLowerCase()
    );
    if (linked && onSelectProduct) {
      onSelectProduct(linked);
    } else if (onNavigateCategory) {
      onNavigateCategory('ALL');
    }
  };

  const handleViewDetails = () => {
    const linked = products.find(
      (p) =>
        p.id === activeSlide.productId ||
        p.name.toLowerCase() === activeSlide.productName.toLowerCase()
    );
    if (linked && onSelectProduct) {
      onSelectProduct(linked);
    } else if (onNavigateCategory) {
      onNavigateCategory('ALL');
    }
  };

  // Animation Toggles
  const enableFloating = data.enableFloating ?? true;
  const enableSoftRotation = data.enableSoftRotation ?? true;
  const enableHoverZoom = data.enableHoverZoom ?? true;
  const enableGlassReflection = data.enableGlassReflection ?? true;
  const enableSoftGlow = data.enableSoftGlow ?? true;

  const bgWord = (data.backgroundWord || 'MBH').toUpperCase();
  const themeMode = data.themeMode || 'cream_white';

  const isDark = themeMode === 'obsidian_dark';
  const isGold = themeMode === 'royal_gold';

  const containerBg = isDark
    ? 'bg-neutral-950 text-white'
    : isGold
    ? 'bg-gradient-to-br from-amber-950 via-neutral-900 to-amber-900 text-white'
    : 'bg-[#FAF8F5] text-neutral-900';

  const glassCardBg =
    isDark || isGold
      ? 'bg-neutral-900/60 backdrop-blur-xl border-white/10 text-white'
      : 'bg-white/60 backdrop-blur-xl border-black/10 text-neutral-900';

  const floatingBadges = activeSlide.floatingBadges || [
    { title: 'Ultralight Cushioning', value: '280g' },
    { title: 'Air Flow Soles', value: '98% Breathable' },
    { title: 'Open Box Guarantee', value: 'Try & Pay' },
  ];

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden my-4 shadow-2xl transition-all border border-black/10 select-none ${containerBg}`}
      style={{
        backgroundColor: styling.bgColor || undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Big Display Background Typography Word */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0">
        <span
          className={`font-black text-[22vw] lg:text-[240px] tracking-widest uppercase leading-none select-none transition-transform duration-700 ${
            isDark || isGold ? 'opacity-[0.06] text-amber-300' : 'opacity-[0.07] text-neutral-900'
          }`}
          style={{ transform: isHovered ? 'scale(1.06)' : 'scale(1)' }}
        >
          {bgWord}
        </span>
      </div>

      {/* Top Glassmorphic Navigation Bar */}
      <div
        className={`relative z-20 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 border-b ${
          isDark || isGold ? 'border-white/10 bg-black/40' : 'border-black/5 bg-white/40'
        } backdrop-blur-md`}
      >
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-amber-500 text-black font-black text-xs flex items-center justify-center shadow-md">
            MBH
          </span>
          <span className="text-xs font-black tracking-widest uppercase">
            MARUDHAR FASHION POINT
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
          <Sparkles className="w-4 h-4" />
          <span>{data.headerBadge || '3D LUXURY SHOE SHOWCASE'}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-400 text-neutral-950 font-black text-[10px] rounded-full uppercase tracking-wider shadow-sm">
            {activeSlide.discountText || '50% OFF'}
          </span>
        </div>
      </div>

      {/* Main Showcase Grid */}
      <div className="relative z-10 px-6 sm:px-12 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[520px]">
        {/* LEFT COLUMN: Product Details & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-extrabold rounded-full uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            {activeSlide.collection || '2026 MBH FOOTWEAR'}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none uppercase">
              {activeSlide.productName}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium max-w-md">
              {activeSlide.description}
            </p>
          </div>

          {/* Pricing Block */}
          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              ₹{activeSlide.price?.toLocaleString('en-IN')}
            </span>
            {activeSlide.originalPrice && (
              <span className="text-sm font-bold text-neutral-400 line-through">
                ₹{activeSlide.originalPrice?.toLocaleString('en-IN')}
              </span>
            )}
            {activeSlide.originalPrice && activeSlide.price && (
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold rounded-md border border-emerald-500/20">
                SAVE {Math.round(((activeSlide.originalPrice - activeSlide.price) / activeSlide.originalPrice) * 100)}%
              </span>
            )}
          </div>

          {/* CTA & Actions Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleBuyNow}
              className="px-7 py-3.5 bg-amber-500 text-neutral-950 hover:bg-amber-400 text-xs sm:text-sm font-black uppercase tracking-wider rounded-2xl shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{activeSlide.buyNowText || '⚡ BUY NOW'}</span>
            </button>

            <button
              onClick={handleViewDetails}
              className={`px-5 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-2xl border transition-all flex items-center gap-2 ${
                isDark || isGold
                  ? 'border-white/20 text-white hover:bg-white/10'
                  : 'border-neutral-900/20 text-neutral-900 hover:bg-neutral-900/5'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{activeSlide.viewDetailsText || 'VIEW DETAILS'}</span>
            </button>

            {activeSlide.showWishlist !== false && (
              <button
                onClick={(e) => handleToggleWishlist(currentIndex, e)}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isWishlisted[currentIndex]
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-105'
                    : isDark || isGold
                    ? 'border-white/20 text-white hover:bg-white/10'
                    : 'border-black/10 text-neutral-800 hover:bg-black/5'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted[currentIndex] ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          {/* Carousel Slide Thumbnails */}
          {slides.length > 1 && (
            <div className="pt-4 border-t border-black/5 dark:border-white/10 space-y-2">
              <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest block">
                CAROUSEL SHOE SLIDES ({currentIndex + 1} / {slides.length})
              </span>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {slides.map((slide: any, idx: number) => (
                  <button
                    key={slide.id || idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white shadow-xs ${
                      currentIndex === idx
                        ? 'border-amber-500 ring-2 ring-amber-400/50 scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.productName}
                      className="w-full h-full object-contain p-1"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CENTER COLUMN: 3D Floating Shoe Visual */}
        <div className="lg:col-span-7 relative flex flex-col items-center justify-center min-h-[380px] sm:min-h-[440px]">
          {/* Soft Radial Ambient Glow */}
          {enableSoftGlow && (
            <div className="absolute w-[280px] sm:w-[380px] h-[280px] sm:h-[380px] bg-amber-500/20 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" />
          )}

          {/* Carousel Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/70 dark:bg-black/70 backdrop-blur-md border border-white/40 shadow-xl hover:scale-110 active:scale-95 transition-all text-neutral-900 dark:text-white"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/70 dark:bg-black/70 backdrop-blur-md border border-white/40 shadow-xl hover:scale-110 active:scale-95 transition-all text-neutral-900 dark:text-white"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Floating Shoe Image Container */}
          <div
            className={`relative transition-all duration-700 ease-out cursor-pointer ${
              enableFloating ? 'animate-bounce' : ''
            }`}
            style={{
              transform: `rotate(${enableSoftRotation ? -10 : 0}deg) scale(${
                isHovered && enableHoverZoom ? 1.08 : 1.0
              })`,
            }}
            onClick={handleViewDetails}
          >
            <img
              key={activeSlide.image}
              src={activeSlide.image}
              alt={activeSlide.productName}
              className="max-h-[290px] sm:max-h-[400px] w-auto object-contain filter drop-shadow-2xl transition-all duration-500"
              loading="lazy"
            />
          </div>

          {/* Floor Soft Shadow */}
          <div
            className="w-48 sm:w-64 h-5 bg-black/30 rounded-[100%] blur-md mt-4 transition-all duration-500 pointer-events-none"
            style={{
              transform: isHovered ? 'scale(0.85)' : 'scale(1)',
              opacity: isHovered ? 0.3 : 0.6,
            }}
          />

          {/* Floor Glass Reflection */}
          {enableGlassReflection && (
            <div className="w-64 sm:w-80 h-12 overflow-hidden opacity-15 pointer-events-none -mt-3 blur-[1px]">
              <img
                src={activeSlide.image}
                alt="Reflection"
                className="w-full object-contain transform scale-y-[-1] rotate-180"
              />
            </div>
          )}

          {/* Glassmorphic Floating Badges */}
          {floatingBadges[0] && (
            <div className={`absolute top-2 left-2 sm:left-6 ${glassCardBg} p-3 rounded-2xl shadow-xl space-y-0.5 border`}>
              <span className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {floatingBadges[0].title}
              </span>
              <span className="block text-xs font-black text-amber-500">
                {floatingBadges[0].value}
              </span>
            </div>
          )}

          {floatingBadges[1] && (
            <div className={`absolute bottom-12 right-2 sm:right-6 ${glassCardBg} p-3 rounded-2xl shadow-xl space-y-0.5 border`}>
              <span className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {floatingBadges[1].title}
              </span>
              <span className="block text-xs font-black text-amber-500">
                {floatingBadges[1].value}
              </span>
            </div>
          )}

          {floatingBadges[2] && (
            <div className="hidden sm:block absolute top-6 right-8 bg-neutral-900/80 backdrop-blur-md border border-white/20 p-2.5 px-3.5 rounded-2xl shadow-xl text-white">
              <span className="block text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                {floatingBadges[2].title}
              </span>
              <span className="block text-xs font-bold">{floatingBadges[2].value}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
