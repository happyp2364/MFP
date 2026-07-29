import React, { useState } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface HeroSectionProps {
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  const { storeInfo } = useStore();

  const shopName = storeInfo?.name || 'Marudhar Fashion Point';
  const tagline = storeInfo?.tagline || 'Royal Comfort & Authentic Fashion';
  const subtitle =
    'Discover Marudhar Fashion Point\'s exclusive lineup of athletic sneakers, royal leather loafers, women\'s sports shoes, and durable footwear.';
  
  const bannerImage = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80';

  const [imgSrc, setImgSrc] = useState(bannerImage);
  const [heroImgLoading, setHeroImgLoading] = useState(true);

  const handleImgError = () => {
    setImgSrc('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80');
    setHeroImgLoading(false);
  };

  const handleShopNow = () => {
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onExploreClick();
    }
  };

  return (
    <section
      id="hero"
      className="relative bg-[#072419] text-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden z-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(11,143,99,0.15),transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-20">
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left relative z-20">
          <div className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-amber-300 text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-inner">
            {shopName}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white font-serif-heading drop-shadow-sm">
            {tagline}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
            {subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 relative z-30">
            <button
              onClick={handleShopNow}
              className="inline-flex items-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black px-8 py-4 rounded-xl shadow-lg hover:shadow-amber-400/20 active:scale-[0.97] transition-all text-sm sm:text-base cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-neutral-950" />
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center relative z-10">
          <div className="relative w-full max-w-lg aspect-[4/3] sm:aspect-[1/1] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-neutral-900/80 flex items-center justify-center">
            {heroImgLoading && (
              <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              </div>
            )}
            <img
              src={imgSrc}
              alt={shopName}
              loading="eager"
              fetchPriority="high"
              onLoad={() => setHeroImgLoading(false)}
              onError={handleImgError}
              className={`w-full h-full object-cover object-center transition-all duration-300 ${heroImgLoading ? 'scale-105 blur-md opacity-30' : 'scale-100 blur-0 opacity-100'}`}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

