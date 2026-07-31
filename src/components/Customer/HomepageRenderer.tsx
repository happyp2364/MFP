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
  Tag,
  Gift,
  Zap,
  Instagram,
  Heart,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { HomepageConfig, HomepageSection, Product } from '../../types';
import { ProductCard } from '../Products/ProductCard';

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
  const { homepageConfig, products, reviews } = useStore();
  const config = previewConfig || homepageConfig;

  if (!config || !Array.isArray(config.sections) || config.sections.length === 0) {
    return null; // Fallback to standard app homepage if empty
  }

  // Filter only enabled sections
  const activeSections = config.sections.filter((s) => s.enabled);

  return (
    <div className="w-full space-y-8 pb-12">
      {activeSections.map((section) => (
        <SectionItem
          key={section.id}
          section={section}
          products={products}
          reviews={reviews}
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
  onSelectProduct?: (p: Product) => void;
  onNavigateCategory?: (cat: string) => void;
}

const SectionItem: React.FC<SectionItemProps> = ({
  section,
  products,
  reviews,
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
      const cats = data.categories || ['Sarees', 'Kurtis', 'Lehengas', 'Jewelry', 'Menswear'];
      return (
        <div style={sectionStyle} className="w-full">
          <div className={containerClass}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-neutral-900">{section.title}</h2>
              {section.subtitle && <p className="text-xs text-neutral-500 mt-1">{section.subtitle}</p>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {cats.map((cat: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => onNavigateCategory && onNavigateCategory(cat)}
                  className="group relative h-48 rounded-2xl overflow-hidden bg-neutral-900 cursor-pointer shadow-md hover:shadow-xl transition-all"
                >
                  <img
                    src={`https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=400&sig=${idx}`}
                    alt={cat}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">{cat}</h3>
                      <span className="text-[10px] font-semibold text-neutral-300 uppercase tracking-wider">Explore Collection →</span>
                    </div>
                  </div>
                </div>
              ))}
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
