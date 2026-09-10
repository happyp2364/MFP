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
      const scrollAmount = direction === 'left' ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-neutral-50/90 border-b border-neutral-200/60 py-2.5 px-3 sm:px-6 relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto relative group/container">
        
        {/* Left Scroll Button (Visible on sm+ screens) */}
        <button
          onClick={() => scroll('left')}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-7 h-7 rounded-full bg-white shadow-md border border-neutral-200 text-neutral-700 items-center justify-center hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover/container:opacity-100 cursor-pointer"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Horizontal Scroll Track */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3.5 sm:gap-5 overflow-x-auto scrollbar-none px-1 py-0.5 snap-x snap-mandatory touch-pan-x scroll-smooth"
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
                className="flex flex-col items-center shrink-0 snap-start cursor-pointer group focus:outline-none transition-all duration-300 active:scale-95 text-center w-[72px] sm:w-[84px]"
              >
                {/* Round Circle Avatar Container */}
                <div
                  style={{ backgroundColor: bgStyle }}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full relative flex items-center justify-center overflow-hidden transition-all duration-300 ${
                    isActive
                      ? 'ring-2 ring-emerald-500 ring-offset-2 scale-105 shadow-md border-2 border-emerald-600'
                      : 'border-2 border-neutral-200/90 hover:border-emerald-400 hover:scale-105 shadow-2xs'
                  }`}
                >
                  {/* Top Badge (e.g. HOT, NEW, % OFF) */}
                  {cat.badge && (
                    <span
                      className={`absolute top-0 right-0 z-10 px-1 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider shadow-2xs border border-white ${
                        cat.badgeColor || 'bg-rose-500 text-white'
                      }`}
                    >
                      {cat.badge}
                    </span>
                  )}

                  {/* Front-View Product Image */}
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
                    className="w-full h-full object-cover p-0.5 rounded-full group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                </div>

                {/* Bottom Category Name Underneath */}
                <span
                  className={`mt-1.5 text-[11px] sm:text-xs font-bold leading-tight line-clamp-1 w-full transition-colors ${
                    isActive ? 'text-emerald-700 font-extrabold' : 'text-neutral-800 group-hover:text-emerald-600'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button (Visible on sm+ screens) */}
        <button
          onClick={() => scroll('right')}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-7 h-7 rounded-full bg-white shadow-md border border-neutral-200 text-neutral-700 items-center justify-center hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover/container:opacity-100 cursor-pointer"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};

