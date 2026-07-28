import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface HeroSectionProps {
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  const { heroContent, storeInfo } = useStore();

  const shopName = storeInfo?.name || 'Marudhar Fashion Point';
  const tagline = heroContent?.headlineHighlight || storeInfo?.tagline || 'Style for Every Step';
  const subtitle =
    heroContent?.subtitle ||
    'Discover Marudhar Fashion Point\'s exclusive lineup of athletic sneakers, royal leather loafers, women\'s sports shoes, and durable footwear.';
  const bannerImage =
    heroContent?.heroImage ||
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80';
  const buttonText = heroContent?.primaryBtnText || 'Shop Now';

  const handleShopNow = () => {
    if (heroContent?.primaryBtnLink === '#categories') {
      onExploreClick();
      return;
    }
    const cleanId = heroContent?.primaryBtnLink?.startsWith('#')
      ? heroContent.primaryBtnLink.slice(1)
      : heroContent?.primaryBtnLink || 'products';
    const el = document.getElementById(cleanId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onExploreClick();
    }
  };

  return (
    <section
      id="hero"
      className="relative bg-[#072419] text-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden transition-opacity duration-300"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Content Column */}
        <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
          {/* Shop Name Badge */}
          <div className="inline-block px-3.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-amber-300 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            {shopName}
          </div>

          {/* Main Tagline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white font-serif-heading">
            {tagline}
          </h1>

          {/* Short Subtitle */}
          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
            {subtitle}
          </p>

          {/* Shop Now CTA Button */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <button
              onClick={handleShopNow}
              className="inline-flex items-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold px-7 py-3.5 rounded-xl shadow-md hover:shadow-amber-400/20 active:scale-[0.98] transition-all text-sm sm:text-base cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-neutral-950" />
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Clean Banner Image */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-lg aspect-[4/3] sm:aspect-[1/1] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-neutral-900">
            <img
              src={bannerImage}
              alt={shopName}
              loading="eager"
              fetchPriority="high"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

      </div>
    </section>
  );
};
