import React, { useState } from 'react';
import { Filter, ArrowUpDown, Grid, SearchX, Footprints, Sparkles, Tag } from 'lucide-react';
import { Product, FilterState, GenderCategory } from '../../types';
import { ProductCard } from './ProductCard';
import { ProductFilterSidebar } from './ProductFilterSidebar';

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
  onBuyNow?: (product: Product, size: string, color: string) => void;
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <section id="products" className="py-16 sm:py-20 bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Gender Category Tabs */}
        <div className="space-y-6 mb-10">
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
                Showing <strong className="text-neutral-900 font-extrabold">{products.length}</strong> Products
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

        {/* Main Grid + Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar - One fixed left sidebar */}
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

          {/* Products Grid (4 desktop, 2 tablet, 1 mobile as requested) */}
          <div className="lg:col-span-9">
            {products.length === 0 ? (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {products.map((product) => (
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
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
