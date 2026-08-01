import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Filter, ArrowUpDown, Grid, SearchX, Footprints, Sparkles, Tag, ArrowUp, Loader2, Check } from 'lucide-react';
import { Product, FilterState, GenderCategory } from '../../types';
import { ProductCard } from './ProductCard';
import { ProductFilterSidebar } from './ProductFilterSidebar';
import { useStore } from '../../context/StoreContext';

interface ProductGridProps {
  products: Product[];
  filterState: FilterState;
  onUpdateFilter: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  availableSubcategories: string[];
  wishlistIds: string[];
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onBuyNow?: (product: Product, size: string, color: string, quantity: number) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  filterState,
  onUpdateFilter,
  onResetFilters,
  availableSubcategories,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onBuyNow,
}) => {
  const { productFeedConfig } = useStore();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [pagingMode, setPagingMode] = useState<'numeric' | 'load-more' | 'infinite'>('numeric');
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fallback feed configurations
  const config = productFeedConfig || {
    productsPerPage: 12,
    infiniteScroll: false,
    loadMoreButton: true,
    maxHomepageProducts: 32,
    maxCategoryProducts: 100,
  };

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterState, pagingMode]);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine active filtering state to apply limits
  const hasActiveFilters = 
    filterState.category !== 'all' || 
    filterState.subcategories.length > 0 || 
    filterState.colors.length > 0 || 
    filterState.sizes.length > 0 || 
    filterState.badgeFilter !== 'all' || 
    filterState.collection || 
    filterState.searchQuery;

  // Deduplicate products to guarantee absolutely no duplicates appear in the feed
  const uniqueProducts = useMemo(() => {
    const seen = new Set<string>();
    return products.filter((p) => {
      if (!p || !p.id) return false;
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [products]);

  const maxAllowedProducts = hasActiveFilters 
    ? (config.maxCategoryProducts || 120)
    : (config.maxHomepageProducts || 40);

  const allowedFilteredProducts = uniqueProducts.slice(0, maxAllowedProducts);

  // Pagination Calculations
  const itemsPerPage = config.productsPerPage || 12;
  const totalPages = Math.ceil(allowedFilteredProducts.length / itemsPerPage);

  const visibleProducts = useMemo(() => {
    if (pagingMode === 'numeric') {
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return allowedFilteredProducts.slice(start, end);
    } else {
      // progressive load
      return allowedFilteredProducts.slice(0, currentPage * itemsPerPage);
    }
  }, [pagingMode, currentPage, itemsPerPage, allowedFilteredProducts]);

  const hasMore = pagingMode !== 'numeric' && visibleProducts.length < allowedFilteredProducts.length;

  // Infinite Scroll Trigger Observer
  useEffect(() => {
    if (pagingMode !== 'infinite' || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [pagingMode, hasMore]);

  const progressPercent = Math.min(
    100,
    Math.round((visibleProducts.length / allowedFilteredProducts.length) * 100)
  );

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const scrollToTop = () => {
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section id="products" className="py-16 sm:py-20 bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Gender Category Tabs */}
        <div className="space-y-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0B8F63] px-3 py-1 rounded-full bg-[#0B8F63]/10 inline-block mb-2">
                Curated Fashion & Footwear
              </span>
              <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-neutral-900">
                Explore Our Collection
              </h2>
            </div>

            {/* Gender Category Switcher */}
            <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'men', label: 'Men' },
                { id: 'women', label: 'Women' },
                { id: 'kids', label: 'Kids' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onUpdateFilter({ category: cat.id as GenderCategory })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    filterState.category === cat.id
                      ? 'bg-[#0B8F63] text-white shadow-md'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Controls Bar: Mobile Filter Button, Search Count, Sort Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-[#0B8F63]/10 text-[#0B8F63] font-bold text-xs px-4 py-2.5 rounded-xl border border-[#0B8F63]/20 hover:bg-[#0B8F63] hover:text-white transition-all"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>

              <span className="text-xs text-neutral-600 font-semibold">
                Showing <strong className="text-neutral-900 font-extrabold">{allowedFilteredProducts.length}</strong> Premium Products
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <ArrowUpDown className="w-4 h-4 text-[#0B8F63]" />
              <span className="font-semibold text-neutral-500 hidden sm:inline">Sort By:</span>
              <select
                value={filterState.sortBy}
                onChange={(e) => onUpdateFilter({ sortBy: e.target.value as any })}
                className="bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0B8F63] outline-none cursor-pointer"
              >
                <option value="featured">Featured / Best Matches</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Arrivals</option>
                <option value="discount">Biggest Discounts</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Filter Chips to prevent endless scrolling & find products instantly */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
          <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider shrink-0">Quick Options:</span>
          {[
            { label: '🔥 Best Sellers', active: filterState.badgeFilter === 'bestsellers', onClick: () => onUpdateFilter({ badgeFilter: 'bestsellers' }) },
            { label: '✨ New Arrivals', active: filterState.badgeFilter === 'new', onClick: () => onUpdateFilter({ badgeFilter: 'new' }) },
            { label: '🎟️ Limited Stock', active: filterState.badgeFilter === 'limited', onClick: () => onUpdateFilter({ badgeFilter: 'limited' }) },
            { label: '💰 Under ₹1,500', active: filterState.priceRange[1] === 1500, onClick: () => onUpdateFilter({ priceRange: [500, 1500] }) },
            { label: '💸 Under ₹2,000', active: filterState.priceRange[1] === 2000, onClick: () => onUpdateFilter({ priceRange: [500, 2000] }) },
            { label: '🏷️ Under ₹2,500', active: filterState.priceRange[1] === 2500, onClick: () => onUpdateFilter({ priceRange: [500, 2500] }) },
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (chip.active) {
                  onUpdateFilter({ badgeFilter: 'all', priceRange: [500, 5000] });
                } else {
                  chip.onClick();
                }
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                chip.active
                  ? 'bg-[#0B8F63] text-white shadow-sm'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-350'
              }`}
            >
              <span>{chip.label}</span>
              {chip.active && <Check className="w-3 h-3 text-white" />}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-[10px] font-black uppercase text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full border border-red-200 transition-colors shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Main Grid + Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <ProductFilterSidebar
              filterState={filterState}
              onUpdateFilter={onUpdateFilter}
              onResetFilters={onResetFilters}
              availableSubcategories={availableSubcategories}
            />
          </div>

          {/* Mobile / Tablet Filter Drawer */}
          {mobileFiltersOpen && (
            <ProductFilterSidebar
              filterState={filterState}
              onUpdateFilter={onUpdateFilter}
              onResetFilters={onResetFilters}
              availableSubcategories={availableSubcategories}
              isOpenMobile={true}
              onCloseMobile={() => setMobileFiltersOpen(false)}
            />
          )}

          {/* Products Grid */}
          <div className="lg:col-span-9">
            {allowedFilteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/80 shadow-sm space-y-4 my-8">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto">
                  <SearchX className="w-8 h-8 text-[#0B8F63]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif-heading font-bold text-xl text-neutral-900">
                    No products found
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto">
                    We couldn't find any products matching your active filters. Try adjusting your category or resetting search parameters.
                  </p>
                </div>
                <button
                  onClick={onResetFilters}
                  className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={onQuickView}
                      onToggleWishlist={onToggleWishlist}
                      isWishlisted={wishlistIds.includes(product.id)}
                      onAddToCart={onAddToCart}
                      onBuyNow={onBuyNow}
                    />
                  ))}
                </div>

                {/* Progress & Pagination Controls */}
                <div id="product-feed-pagination" className="pt-8 border-t border-neutral-200/60 flex flex-col items-center justify-center gap-5">
                  <div className="text-xs font-bold text-neutral-600 flex items-center gap-1.5">
                    <span>You are viewing</span>
                    <span className="text-neutral-900 font-extrabold">{visibleProducts.length}</span>
                    <span>of</span>
                    <span className="text-neutral-900 font-extrabold">{allowedFilteredProducts.length}</span>
                    <span>products</span>
                  </div>

                  {/* Progressive indicator bar */}
                  <div className="w-48 bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#0B8F63] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* 🔢 Numeric Pagination Controls */}
                  {pagingMode === 'numeric' && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1.5 pt-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          scrollToTop();
                        }}
                        className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              setCurrentPage(pageNum);
                              scrollToTop();
                            }}
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              currentPage === pageNum
                                ? 'bg-[#0B8F63] text-white shadow-md'
                                : 'bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                          scrollToTop();
                        }}
                        className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  )}

                  {/* Safety Limit Notice */}
                  {products.length > maxAllowedProducts && (
                    <p className="text-[10px] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 font-semibold max-w-md text-center">
                      * Store optimization limits applied ({maxAllowedProducts} products max). Please use search filters to narrow down products.
                    </p>
                  )}

                  {/* Load More Trigger Button */}
                  {pagingMode === 'load-more' && hasMore && (
                    <button
                      onClick={handleLoadMore}
                      className="flex items-center gap-2 bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <span>Load More Products</span>
                    </button>
                  )}

                  {/* Infinite Scroll trigger node */}
                  {pagingMode === 'infinite' && hasMore && (
                    <div ref={observerTarget} className="flex items-center justify-center py-4 w-full">
                      <Loader2 className="w-5 h-5 text-[#0B8F63] animate-spin" />
                      <span className="text-xs text-neutral-500 font-bold ml-2">Loading next premium products...</span>
                    </div>
                  )}

                  {/* Pagination Style Selector (Toggles between Numeric, Load More, and Endless Infinite scroll) */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 border-t border-neutral-200/50 pt-6 mt-4 w-full">
                    <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest mr-1">Feed Navigation Style:</span>
                    <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200">
                      {[
                        { id: 'numeric', label: '🔢 Pages' },
                        { id: 'load-more', label: '🔘 Load More' },
                        { id: 'infinite', label: '♾️ Infinite' },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => {
                            setPagingMode(mode.id as any);
                            setCurrentPage(1);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            pagingMode === mode.id
                              ? 'bg-white text-neutral-950 shadow-sm border border-neutral-250/50'
                              : 'text-neutral-500 hover:text-neutral-800'
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Floating Back To Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-[#0B8F63] hover:bg-[#086F4C] text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center border border-[#0B8F63]/20"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </section>
  );
};
