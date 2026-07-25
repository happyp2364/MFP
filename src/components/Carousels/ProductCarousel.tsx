import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../Products/ProductCard';

interface ProductCarouselProps {
  title: string;
  subtitle: string;
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  autoSlide?: boolean;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitle,
  products,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  autoSlide = true,
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!autoSlide || isPaused) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
        if (carouselRef.current.scrollLeft >= maxScroll - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [autoSlide, isPaused]);

  if (products.length === 0) return null;

  return (
    <div
      className="py-12 bg-white border-y border-neutral-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Carousel Header */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0B8F63] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{subtitle}</span>
            </div>
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-neutral-900">
              {title}
            </h2>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-[#0B8F63] hover:text-[#0B8F63] flex items-center justify-center transition-all shadow-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-[#0B8F63] hover:text-[#0B8F63] flex items-center justify-center transition-all shadow-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Scroll Container */}
        <div
          ref={carouselRef}
          className="flex items-stretch gap-6 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth"
        >
          {products.map((product) => (
            <div key={product.id} className="w-[280px] sm:w-[300px] shrink-0">
              <ProductCard
                product={product}
                onQuickView={onQuickView}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlistIds.includes(product.id)}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
