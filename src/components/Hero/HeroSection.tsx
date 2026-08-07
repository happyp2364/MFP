import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Truck, RefreshCw, Sparkles, Zap, Star, CheckCircle, PackageCheck, Flame } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { getPlatformConfig } from '../../lib/platformConfig';

interface HeroSectionProps {
  onExploreClick: () => void;
}

interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaActionId?: string;
  accentColor: string;
  priceTag?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  const { storeInfo } = useStore();
  const platform = getPlatformConfig();

  const shopName = storeInfo?.name || platform.platformDisplayName;

  const slides: HeroSlide[] = [
    {
      id: 'slide-1',
      badge: '👑 Royal Collection 2026',
      title: storeInfo?.tagline || 'Royal Comfort & Authentic Indian Fashion',
      subtitle: `Discover ${shopName}'s exclusive lineup of athletic sneakers, royal leather loafers, bridal footwear, and durable everyday shoes.`,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Explore Royal Range',
      ctaActionId: 'products',
      accentColor: 'from-emerald-500/20 to-amber-500/20',
      priceTag: 'From ₹499'
    },
    {
      id: 'slide-2',
      badge: '🔥 Flat ₹699 Mega Store',
      title: 'Unbeatable ₹699 Footwear Bonanza',
      subtitle: 'High-performance running sneakers, cushioned air-sole trainers, and daily comfort walking shoes at flat ₹699!',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Shop ₹699 Deals',
      ctaActionId: 'price_699_collection',
      accentColor: 'from-amber-500/20 to-rose-500/20',
      priceTag: 'Flat ₹699'
    },
    {
      id: 'slide-3',
      badge: '⚡ Sports & Athletic Edition',
      title: 'Ultimate Cushion Soles & Sport Trainers',
      subtitle: 'Lightweight, breathable, and ultra-durable athletic sneakers engineered for all-day comfort and workout agility.',
      image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'View Trending Shoes',
      ctaActionId: 'trending_shoes_section',
      accentColor: 'from-cyan-500/20 to-emerald-500/20',
      priceTag: 'Save up to 40%'
    },
    {
      id: 'slide-4',
      badge: '✨ Wedding & Festive Special',
      title: 'Bridal Heels, Mojaris & Royal Wear',
      subtitle: 'Handcrafted elegance designed for grand Indian weddings, festive celebrations, and royal traditional ceremonies.',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Shop Wedding Wear',
      ctaActionId: 'products',
      accentColor: 'from-purple-500/20 to-amber-500/20',
      priceTag: 'New Arrivals'
    }
  ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  // Auto-play slide timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
      setImgLoading(true);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const currentSlide = slides[currentSlideIndex];

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    setImgLoading(true);
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setImgLoading(true);
  };

  const handleCtaClick = (sectionId?: string) => {
    const targetId = sectionId || 'products';
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onExploreClick();
    }
  };

  return (
    <div className="relative bg-[#051C13] text-white overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.accentColor} transition-all duration-700 pointer-events-none opacity-40`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(11,143,99,0.25),transparent_65%)] pointer-events-none" />

      <section
        id="hero"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left relative z-20">
            
            {/* Top Store Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentSlide.badge}</span>
              {currentSlide.priceTag && (
                <span className="bg-amber-400 text-neutral-950 px-2 py-0.2 rounded-full text-[10px] font-black ml-1">
                  {currentSlide.priceTag}
                </span>
              )}
            </div>

            {/* Slide Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white font-serif-heading drop-shadow-md min-h-[1.2em] transition-all duration-300">
              {currentSlide.title}
            </h1>

            {/* Slide Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {currentSlide.subtitle}
            </p>

            {/* CTA Buttons & Slide Nav */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 relative z-30">
              <button
                onClick={() => handleCtaClick(currentSlide.ctaActionId)}
                className="inline-flex items-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black px-7 py-3.5 rounded-2xl shadow-xl hover:shadow-amber-400/25 active:scale-[0.97] transition-all text-sm sm:text-base cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-neutral-950" />
                <span>{currentSlide.ctaText}</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              <button
                onClick={() => handleCtaClick('price_699_collection')}
                className="inline-flex items-center gap-2 bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 border border-emerald-500/40 font-bold px-5 py-3.5 rounded-2xl shadow-md transition-all text-sm cursor-pointer"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>₹699 Store</span>
              </button>
            </div>

            {/* Quick Filter Tags Row */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs">
              <span className="text-emerald-300/70 font-semibold mr-1">Popular Quick Links:</span>
              {[
                { label: '👟 Sneakers', tag: 'products' },
                { label: '👞 Loafers', tag: 'products' },
                { label: '👠 Party Heels', tag: 'products' },
                { label: '🔥 ₹699 Deals', tag: 'price_699_collection' },
                { label: '⭐ Customer Reviews', tag: 'reviews' },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCtaClick(chip.tag)}
                  className="bg-emerald-950/60 hover:bg-emerald-800/60 border border-emerald-600/30 text-emerald-200 hover:text-white px-2.5 py-1 rounded-xl text-[11px] font-medium transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>

          </div>

          {/* Right Hero Showcase Card & Controls */}
          <div className="lg:col-span-5 flex flex-col items-center relative z-20">
            <div className="relative w-full max-w-md lg:max-w-none aspect-[4/3] sm:aspect-[1/1] rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-neutral-950/90 flex items-center justify-center group">
              
              {imgLoading && (
                <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                </div>
              )}

              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                loading="eager"
                fetchPriority="high"
                onLoad={() => setImgLoading(false)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80';
                  setImgLoading(false);
                }}
                className={`w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105 ${
                  imgLoading ? 'scale-105 blur-md opacity-30' : 'scale-100 blur-0 opacity-100'
                }`}
                referrerPolicy="no-referrer"
              />

              {/* Gradient Overlay & Badge on image */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />

              <div className="absolute top-4 left-4 z-20">
                <span className="bg-black/60 backdrop-blur-md text-amber-300 border border-white/20 text-[11px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Verified Quality Standard</span>
                </span>
              </div>

              {/* Slide controls overlay */}
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all opacity-80 group-hover:opacity-100 active:scale-95 z-30"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all opacity-80 group-hover:opacity-100 active:scale-95 z-30"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Bottom Caption on image */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-white text-xs font-semibold">
                <span className="truncate pr-2">{currentSlide.badge}</span>
                <span className="bg-emerald-500/90 text-neutral-950 font-black px-2.5 py-0.5 rounded-full text-[11px] shrink-0">
                  {currentSlide.priceTag || 'Original'}
                </span>
              </div>

            </div>

            {/* Slide Dots Indicator */}
            <div className="flex items-center gap-2 mt-4">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentSlideIndex(idx);
                    setImgLoading(true);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlideIndex
                      ? 'w-8 bg-amber-400'
                      : 'w-2 bg-emerald-800 hover:bg-emerald-600'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* Trust Highlights Bar Below Hero */}
      <div className="border-t border-emerald-900/60 bg-[#03140d] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center sm:text-left">
          
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-950/40 border border-emerald-900/30">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Free Express Shipping</div>
              <div className="text-[10px] text-emerald-300/70">On orders above ₹999</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-950/40 border border-emerald-900/30">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 text-amber-400 flex items-center justify-center shrink-0">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Open Box Delivery</div>
              <div className="text-[10px] text-amber-300/70">Verify before payment</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-950/40 border border-emerald-900/30">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Easy 7-Day Exchange</div>
              <div className="text-[10px] text-emerald-300/70">Hassle-free size swap</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-950/40 border border-emerald-900/30">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">100% Genuine Quality</div>
              <div className="text-[10px] text-amber-300/70">Authentic certified footwear</div>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 p-2 rounded-xl bg-emerald-950/40 border border-emerald-900/30">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">4.9★ Customer Rating</div>
              <div className="text-[10px] text-emerald-300/70">15,000+ Happy Buyers</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};


