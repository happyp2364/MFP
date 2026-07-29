import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { One8BurgundyShoeGraphic } from '../Decorative/One8BurgundyShoeGraphic';

interface HeroSectionProps {
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  const { heroContent, storeInfo, hangingSneakerConfig } = useStore();

  const shopName = storeInfo?.name || 'Marudhar Fashion Point';
  const tagline = heroContent?.headlineHighlight || storeInfo?.tagline || 'Style for Every Step';
  const subtitle =
    heroContent?.subtitle ||
    'Discover Marudhar Fashion Point\'s exclusive lineup of athletic sneakers, royal leather loafers, women\'s sports shoes, and durable footwear.';
  
  const bannerImage =
    heroContent?.heroImage ||
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80';
  
  const buttonText = heroContent?.primaryBtnText || 'Shop Now';

  // State to track if the hero image failed to load
  const [imgSrc, setImgSrc] = useState(bannerImage);
  const [heroImgLoading, setHeroImgLoading] = useState(true);

  useEffect(() => {
    setImgSrc(bannerImage);
    setHeroImgLoading(true);
  }, [bannerImage]);

  const handleImgError = () => {
    // Beautiful, guaranteed to load fallback image from Unsplash
    setImgSrc('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80');
    setHeroImgLoading(false);
  };

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

  // Hanging Sneaker parameters from Firestore Live Config
  const hsEnabled = hangingSneakerConfig?.enabled ?? true;
  const hsImageUri = hangingSneakerConfig?.imageUri || '';
  const hsLaceLength = hangingSneakerConfig?.laceLength ?? 220;
  const hsSizePx = hangingSneakerConfig?.sizePx ?? 260;
  const hsPositionRight = hangingSneakerConfig?.positionRight ?? 10;
  const hsPositionTop = hangingSneakerConfig?.positionTop ?? 160;
  const hsSwingSpeedSec = hangingSneakerConfig?.swingSpeedSec ?? 7.0;
  const hsSwingAngleDeg = hangingSneakerConfig?.swingAngleDeg ?? 4.0;
  const hsBaseRotationDeg = hangingSneakerConfig?.baseRotationDeg ?? -18;
  const hsEnablePhysicsAnimation = hangingSneakerConfig?.enablePhysicsAnimation ?? true;
  const hsEnableShineEffect = hangingSneakerConfig?.enableShineEffect ?? true;

  // Track if custom hanging shoe image has failure to load
  const [customHangingShoeError, setCustomHangingShoeError] = useState(false);
  useEffect(() => {
    setCustomHangingShoeError(false);
  }, [hsImageUri]);

  const showCustomHangingImage = hsImageUri && !customHangingShoeError;

  return (
    <section
      id="hero"
      className="relative bg-[#072419] text-white py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden transition-opacity duration-300 z-10"
    >
      {/* Background radial gradient decoration for luxury feel */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(11,143,99,0.15),transparent_60%)] pointer-events-none" />

      {/* Dynamic swing-shoe style injection */}
      {hsEnabled && (
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes swing-shoe {
            0% { transform: rotate(${-hsSwingAngleDeg}deg); }
            50% { transform: rotate(${hsSwingAngleDeg}deg); }
            100% { transform: rotate(${-hsSwingAngleDeg}deg); }
          }
        `}} />
      )}

      {/* Live Swinging Hanging Sneaker */}
      {hsEnabled && (
        <div
          className="absolute hidden xl:flex flex-col items-center select-none pointer-events-none transition-all duration-500"
          style={{
            right: `${hsPositionRight}px`,
            top: `0px`,
            width: `${hsSizePx}px`,
            zIndex: 25,
          }}
        >
          {/* Hanging Rope/Lace */}
          <div
            className="w-[1.5px] bg-gradient-to-b from-neutral-500/80 to-amber-300/60 shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            style={{ height: `${hsLaceLength}px` }}
          />

          {/* Swinging Assembly container */}
          <div
            style={{
              animation: hsEnablePhysicsAnimation ? `swing-shoe ${hsSwingSpeedSec}s ease-in-out infinite` : 'none',
              transformOrigin: 'top center',
            }}
            className="flex flex-col items-center"
          >
            {/* Knot connector decoration */}
            <div className="w-3 h-3 rounded-full bg-amber-400 border border-neutral-900 shadow-sm -mt-1.5 z-30" />

            {/* Shoe Model Layer */}
            {showCustomHangingImage ? (
              <img                 src={hsImageUri}
                alt="Hanging Sneaker"
                onError={() => setCustomHangingShoeError(true)}
                style={{
                  width: `${hsSizePx}px`,
                  transform: `rotate(${hsBaseRotationDeg}deg)`,
                }}
                className="h-auto object-contain filter drop-shadow-[0_25px_30px_rgba(0,0,0,0.6)]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div style={{ transform: `rotate(${hsBaseRotationDeg}deg)` }}>
                <One8BurgundyShoeGraphic width={hsSizePx} enableShine={hsEnableShineEffect} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-20">
        
        {/* Left Content Column */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left relative z-20">
          {/* Shop Name Badge */}
          <div className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-amber-300 text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-inner">
            {shopName}
          </div>

          {/* Main Tagline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white font-serif-heading drop-shadow-sm">
            {tagline}
          </h1>

          {/* Short Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
            {subtitle}
          </p>

          {/* Shop Now CTA Button - elevated z-index for absolute clickability */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 relative z-30">
            <button
              onClick={handleShopNow}
              className="inline-flex items-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black px-8 py-4 rounded-xl shadow-lg hover:shadow-amber-400/20 active:scale-[0.97] transition-all text-sm sm:text-base cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-neutral-950" />
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Clean Banner Image */}
        <div className="lg:col-span-5 flex justify-center relative z-10">
          <div className="relative w-full max-w-lg aspect-[4/3] sm:aspect-[1/1] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-neutral-900/80 flex items-center justify-center">
            {heroImgLoading && (
              <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              </div>
            )}
            <img               src={imgSrc}
              alt={shopName}
              loading="eager"
              fetchPriority="high"
              onLoad={() => setHeroImgLoading(false)}
              onError={handleImgError}
              className={`w-full h-full object-cover object-center transition-all duration-500 ${heroImgLoading ? 'scale-105 blur-md opacity-30' : 'scale-100 blur-0 opacity-100'}`}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

      </div>
    </section>
  );
};
