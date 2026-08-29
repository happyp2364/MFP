import React, { useRef } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface MobileScrollableCategoriesProps {
  onSelectCategory?: (categoryKey: string) => void;
  activeCategory?: string;
}

export const MobileScrollableCategories: React.FC<MobileScrollableCategoriesProps> = ({
  onSelectCategory,
  activeCategory,
}) => {
  const { mobileCategories } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const enabledCategories = mobileCategories.filter((c) => c.enabled !== false);

  if (enabledCategories.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-neutral-50/80 border-b border-neutral-200/60 py-3.5 px-3 sm:px-6 relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto relative group/container">
        
        {/* Left Scroll Button (Visible on sm+ screens) */}
        <button
          onClick={() => scroll('left')}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-neutral-200 text-neutral-700 items-center justify-center hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover/container:opacity-100 cursor-pointer"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Horizontal Scroll Track */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto scrollbar-none px-1 py-1 snap-x snap-mandatory touch-pan-x scroll-smooth"
        >
          {enabledCategories.map((cat) => {
            const isActive = activeCategory === cat.categoryKey;
            
            // Soft pastel background default fallback if not set
            const bgStyle = cat.backgroundColor || '#F3F4F6';

            // High resolution front-view image
            const displayImage =
              cat.image ||
              (cat.images && cat.images.length > 0 ? cat.images[0] : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80');

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory && onSelectCategory(cat.categoryKey)}
                className={`flex flex-col shrink-0 snap-start cursor-pointer group focus:outline-none transition-all duration-300 active:scale-95 text-left`}
              >
                {/* Premium Front-View Card */}
                <div
                  style={{ backgroundColor: bgStyle }}
                  className={`w-[124px] sm:w-[138px] aspect-[4/5] rounded-[22px] p-2.5 relative flex flex-col justify-between overflow-hidden transition-all duration-300 border ${
                    isActive
                      ? 'border-emerald-600 ring-2 ring-emerald-500/80 shadow-lg scale-[1.02]'
                      : 'border-black/5 hover:border-emerald-500/40 shadow-xs hover:shadow-md'
                  }`}
                >
                  {/* Top Badge (e.g. HOT, NEW, % OFF) */}
                  <div className="flex items-center justify-between w-full z-10">
                    {cat.badge ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-xs border border-white/60 ${
                          cat.badgeColor || 'bg-rose-500 text-white'
                        }`}
                      >
                        {cat.badge}
                      </span>
                    ) : (
                      <span />
                    )}

                    {/* Small Sparkle or Category Detail Indicator */}
                    <span className="w-5 h-5 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center text-neutral-600 group-hover:text-emerald-600 transition-colors">
                      <Sparkles className="w-2.5 h-2.5" />
                    </span>
                  </div>

                  {/* Front-View Large Product Image */}
                  <div className="relative my-auto w-full h-[65%] flex items-center justify-center overflow-hidden">
                    <img
                      src={displayImage}
                      alt={cat.name}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';
                      }}
                      className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                  </div>

                  {/* Bottom Footer: Category Title & Right Arrow Icon */}
                  <div className="mt-auto pt-1 flex items-end justify-between gap-1 z-10 border-t border-black/5">
                    <span className="text-[11px] sm:text-xs font-black text-neutral-900 group-hover:text-emerald-700 truncate leading-tight flex-1">
                      {cat.name}
                    </span>

                    <div className="w-5 h-5 rounded-full bg-white shadow-xs flex items-center justify-center text-neutral-800 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                </div>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button (Visible on sm+ screens) */}
        <button
          onClick={() => scroll('right')}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-neutral-200 text-neutral-700 items-center justify-center hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover/container:opacity-100 cursor-pointer"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};

