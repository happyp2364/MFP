import React, { useState, useEffect, useRef } from 'react';
import {
  Instagram,
  Play,
  Heart,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Volume2,
  Share2,
  Smartphone,
  Flame,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { InstagramReelItem } from '../../types';

export const InstagramPhoneReelSection: React.FC = () => {
  const { socialMediaConfig, products, setSelectedProduct } = useStore();

  const isEnabled = socialMediaConfig?.instagramReelsPhoneEnabled !== false;
  const sectionTitle = socialMediaConfig?.instagramReelsPhoneTitle || 'See Us on Instagram • मरुधर फैशन पॉइंट ऑन इंस्टाग्राम';
  const sectionSubtitle = socialMediaConfig?.instagramReelsPhoneSubtitle || 'Latest looks, new arrivals & store moments — follow us on Instagram @marudharfashionpoint';
  const accountHandle = socialMediaConfig?.instagramReelsPhoneAccountHandle || '@marudharfashionpoint';
  const accountUrl = socialMediaConfig?.instagramReelsPhoneAccountUrl || 'https://www.instagram.com/marudharfashionpoint/';

  // Filter only enabled reels, or use default fallback reels
  const reels: InstagramReelItem[] = React.useMemo(() => {
    const list = socialMediaConfig?.instagramReelsList;
    if (Array.isArray(list) && list.length > 0) {
      const active = list.filter((r) => r.enabled !== false);
      if (active.length > 0) {
        return active.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      }
    }
    return [
      {
        id: 'reel_1',
        reelUrl: accountUrl,
        title: 'Royal Wedding Mojari Showcase',
        caption: 'Pure royal craftsmanship from Rajasthan. Handcrafted leather mojaris crafted for grand celebrations! 👑✨',
        thumbnailUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
        viewsCount: '48.2K',
        likesCount: '3.4K',
        featured: true,
        enabled: true,
        displayOrder: 1,
      },
      {
        id: 'reel_2',
        reelUrl: accountUrl,
        title: 'High-Impact Air Sole Sneakers Test',
        caption: 'Lightweight, ultra-cushioned sports running sneakers. Walking 10,000 steps feeling like clouds! 👟⚡',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
        viewsCount: '62.5K',
        likesCount: '4.8K',
        featured: false,
        enabled: true,
        displayOrder: 2,
      },
      {
        id: 'reel_3',
        reelUrl: accountUrl,
        title: 'Pipar City Main Store Walkthrough',
        caption: 'Come visit our Pipar City showroom! Discover thousands of sneakers, loafers and party wear in person. 🏬🔥',
        thumbnailUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
        viewsCount: '35.1K',
        likesCount: '2.9K',
        featured: false,
        enabled: true,
        displayOrder: 3,
      },
      {
        id: 'reel_4',
        reelUrl: accountUrl,
        title: 'Flat ₹699 Mega Bonanza Drop',
        caption: 'Best-selling ₹699 sneakers collection live! High-performance sneakers at honest family pricing. 👟💥',
        thumbnailUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
        viewsCount: '51.8K',
        likesCount: '4.1K',
        featured: false,
        enabled: true,
        displayOrder: 4,
      },
    ];
  }, [socialMediaConfig?.instagramReelsList, accountUrl]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep index within bounds
  useEffect(() => {
    if (activeIndex >= reels.length) {
      setActiveIndex(0);
    }
  }, [reels.length, activeIndex]);

  // Auto advance reels
  useEffect(() => {
    if (isPaused || reels.length <= 1) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reels.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, reels.length]);

  if (!isEnabled || reels.length === 0) {
    return null;
  }

  const currentReel = reels[activeIndex] || reels[0];
  const taggedProduct = currentReel?.taggedProductId
    ? products.find((p) => p.id === currentReel.taggedProductId)
    : null;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % reels.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + reels.length) % reels.length);
  };

  const handleOpenReel = (url?: string) => {
    const target = url || currentReel.reelUrl || accountUrl;
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="instagram-reels-showcase"
      className="py-14 sm:py-20 bg-gradient-to-b from-[#071F17] via-[#051710] to-neutral-950 text-white relative overflow-hidden border-t border-b border-emerald-900/40"
    >
      {/* Background Decorative Lighting */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-md">
            <Instagram className="w-3.5 h-3.5 text-rose-400" />
            <span>Trending Reels & Viral Drops</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black font-serif-heading text-white tracking-tight">
            {sectionTitle}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-emerald-100/80 leading-relaxed font-normal">
            {sectionSubtitle}
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-300">
            <span className="font-bold text-amber-400">{accountHandle}</span>
            <span>•</span>
            <span className="text-emerald-300">Official Store Channel</span>
            <span>•</span>
            <span className="text-neutral-400">Pipar City, Rajasthan</span>
          </div>
        </div>

        {/* Main Grid: Phone Mockup Display + Interactive Reels Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: Realistic Phone Mockup Display */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            {/* Outer Phone Shell */}
            <div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="relative w-full max-w-[290px] sm:max-w-[320px] aspect-[9/18.5] bg-neutral-900 rounded-[44px] p-2.5 sm:p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-[4px] border-neutral-700/80 ring-1 ring-white/20 transition-all duration-300 hover:shadow-emerald-500/20 group"
            >
              {/* Inner Gloss / Metallic Edge Highlight */}
              <div className="absolute inset-1 rounded-[38px] border border-white/15 pointer-events-none z-30" />

              {/* Top Dynamic Island / Speaker Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-center px-2 gap-1.5 shadow-md">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-blue-950" />
                </div>
                <div className="w-2.5 h-1 rounded-full bg-neutral-900" />
              </div>

              {/* Phone Screen Area */}
              <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-black flex flex-col justify-between select-none">
                
                {/* Reel Media / Thumbnail */}
                <div className="absolute inset-0 z-10">
                  <img
                    src={currentReel.thumbnailUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'}
                    alt={currentReel.title || 'Instagram Reel'}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';
                    }}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Dark Vignette Overlay for Reel look */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />
                </div>

                {/* Top Status Bar Inside Screen */}
                <div className="relative z-20 pt-8 px-4 flex items-center justify-between text-[11px] font-semibold text-white/90">
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                    <Instagram className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-[10px] font-bold">Reels</span>
                  </div>

                  <span className="text-[10px] bg-emerald-500/80 text-neutral-950 font-black px-2 py-0.5 rounded-full">
                    {activeIndex + 1} / {reels.length}
                  </span>
                </div>

                {/* Center Play Button Overlay */}
                <div className="relative z-20 flex-1 flex items-center justify-center">
                  <button
                    onClick={() => handleOpenReel(currentReel.reelUrl)}
                    className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-xl active:scale-95 transition-all group-hover:scale-110 cursor-pointer"
                    aria-label="Play Reel on Instagram"
                  >
                    <Play className="w-7 h-7 fill-white text-white translate-x-0.5" />
                  </button>
                </div>

                {/* Screen Controls: Prev / Next Arrows */}
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm border border-white/20 transition-all active:scale-90"
                  aria-label="Previous Reel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm border border-white/20 transition-all active:scale-90"
                  aria-label="Next Reel"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Bottom Reel Caption & Interaction Overlay */}
                <div className="relative z-20 p-4 space-y-2">
                  
                  {/* Account Header */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shrink-0">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                        <Instagram className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <span className="text-xs font-black text-white drop-shadow truncate">
                      {accountHandle}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20 shrink-0" />
                  </div>

                  {/* Reel Caption */}
                  <p className="text-xs text-white/95 font-medium line-clamp-2 leading-snug drop-shadow-md">
                    {currentReel.caption || currentReel.title}
                  </p>

                  {/* Display metadata: Likes & Views only if configured by admin */}
                  {(currentReel.viewsCount || currentReel.likesCount) && (
                    <div className="flex items-center gap-3 text-[11px] font-bold text-amber-300 pt-1">
                      {currentReel.viewsCount && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{currentReel.viewsCount} Views</span>
                        </div>
                      )}
                      {currentReel.likesCount && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                          <span>{currentReel.likesCount}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tagged Shoe Order CTA if attached to Reel */}
                  {taggedProduct && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(taggedProduct);
                      }}
                      className="w-full mt-1.5 py-1.5 px-2.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-white font-bold text-[11px] flex items-center justify-between gap-1 shadow-sm transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <ShoppingBag className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{taggedProduct.name}</span>
                      </span>
                      <span className="text-amber-400 font-black shrink-0">₹{taggedProduct.price} • View</span>
                    </button>
                  )}

                  {/* Direct "Watch on Instagram" CTA inside phone */}
                  <button
                    onClick={() => handleOpenReel(currentReel.reelUrl)}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer"
                  >
                    <span>Watch Full Reel on Instagram</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Bottom Home Indicator Bar */}
                <div className="relative z-30 pb-2 flex justify-center">
                  <div className="w-24 h-1 bg-white/60 rounded-full" />
                </div>

              </div>
            </div>

            {/* Indicator Dots Below Phone */}
            <div className="flex items-center gap-2 mt-5">
              {reels.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? 'w-7 bg-amber-400'
                      : 'w-2 bg-emerald-900 hover:bg-emerald-700'
                  }`}
                  aria-label={`Go to reel ${idx + 1}`}
                />
              ))}
            </div>

          </div>

          {/* RIGHT: High-Impact Information & Reel List Selector */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Account Profile Card */}
            <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-3xl p-5 sm:p-6 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-1 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
                    <div className="w-14 h-14 rounded-full bg-neutral-900 flex items-center justify-center">
                      <Instagram className="w-7 h-7 text-rose-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white font-serif-heading">
                        {accountHandle}
                      </h3>
                      <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    </div>
                    <p className="text-xs text-emerald-200/80 mt-0.5">
                      Marudhar Fashion Point • Official Store Instagram
                    </p>
                    <p className="text-[11px] text-amber-400/90 font-semibold mt-1">
                      Official Store Footwear Videos • Daily New Drops & Stories
                    </p>
                  </div>
                </div>

                {/* Big Follow Button */}
                <a
                  href={accountUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-black text-sm px-6 py-3 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Follow on Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              </div>
            </div>

            {/* Quick Reel Selector List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Featured Videos • Tap to Preview on Phone</span>
                </span>
                <span className="text-[11px] text-neutral-400">
                  {reels.length} Reels Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reels.map((reel, idx) => {
                  const isCurrent = idx === activeIndex;
                  return (
                    <div
                      key={reel.id || idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 group ${
                        isCurrent
                          ? 'bg-emerald-900/60 border-amber-400 shadow-md scale-[1.02]'
                          : 'bg-neutral-900/60 hover:bg-neutral-900 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Reel Thumbnail Preview */}
                      <div className="relative w-14 h-18 rounded-xl overflow-hidden shrink-0 bg-neutral-950">
                        <img
                          src={reel.thumbnailUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80'}
                          alt={reel.title || 'Reel'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80';
                          }}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className={`w-4 h-4 ${isCurrent ? 'fill-amber-400 text-amber-400' : 'fill-white text-white'}`} />
                        </div>
                      </div>

                      {/* Reel Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                            {reel.title || `Reel #${idx + 1}`}
                          </span>
                          {reel.featured && (
                            <span className="bg-amber-400 text-neutral-950 text-[9px] font-black px-1.5 rounded shrink-0">
                              Viral
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-neutral-300 line-clamp-1 mt-0.5">
                          {reel.caption}
                        </p>

                        {(reel.viewsCount || reel.likesCount) && (
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-emerald-300/80 font-semibold">
                            {reel.viewsCount && <span>{reel.viewsCount} views</span>}
                            {reel.viewsCount && reel.likesCount && <span>•</span>}
                            {reel.likesCount && <span className="text-rose-400">{reel.likesCount} likes</span>}
                          </div>
                        )}
                      </div>

                      {/* Indicator Arrow */}
                      <div className="text-neutral-500 group-hover:text-amber-400 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Offline Store & Social Trust Bar */}
            <div className="p-4 rounded-2xl bg-neutral-950/60 border border-emerald-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-200">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Tag <strong className="text-white">@marudharfashionpoint</strong> in your reels to get featured!</span>
              </div>

              <a
                href={accountUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-amber-300 hover:text-amber-200 underline underline-offset-2 flex items-center gap-1 shrink-0"
              >
                <span>View All on Instagram</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
