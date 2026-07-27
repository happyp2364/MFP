import React from 'react';
import { Filter, X, RefreshCw, Check } from 'lucide-react';
import { FilterState, GenderCategory } from '../../types';

interface ProductFilterSidebarProps {
  filterState: FilterState;
  onUpdateFilter: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  availableSubcategories: string[];
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({
  filterState,
  onUpdateFilter,
  onResetFilters,
  availableSubcategories,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const SIZES_LIST = ['6', '7', '8', '9', '10', '11', '36', '37', '38', '39', '40', 'S', 'M', 'L', 'XL'];
  const COLORS_LIST = [
    { name: 'Black', hex: '#111827' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Green', hex: '#0B8F63' },
    { name: 'Brown', hex: '#8B4513' },
    { name: 'Red', hex: '#DC2626' },
    { name: 'Blue', hex: '#2563EB' },
    { name: 'Gold', hex: '#D4AF37' },
  ];

  const handleSubcategoryToggle = (sub: string) => {
    const exists = filterState.subcategories.includes(sub);
    const updated = exists
      ? filterState.subcategories.filter((item) => item !== sub)
      : [...filterState.subcategories, sub];
    onUpdateFilter({ subcategories: updated });
  };

  const handleSizeToggle = (sz: string) => {
    const exists = filterState.sizes.includes(sz);
    const updated = exists
      ? filterState.sizes.filter((item) => item !== sz)
      : [...filterState.sizes, sz];
    onUpdateFilter({ sizes: updated });
  };

  const handleColorToggle = (colorName: string) => {
    const exists = filterState.colors.includes(colorName);
    const updated = exists
      ? filterState.colors.filter((item) => item !== colorName)
      : [...filterState.colors, colorName];
    onUpdateFilter({ colors: updated });
  };

  const filterContent = (
    <div className="space-y-6 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-2 font-extrabold text-neutral-900 text-base">
          <Filter className="w-5 h-5 text-[#0B8F63]" />
          <span>Filter Products</span>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-neutral-500 hover:text-[#0B8F63] flex items-center gap-1 font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Gender Category */}
      <div className="space-y-2">
        <label className="font-bold text-neutral-800 text-xs uppercase tracking-wider block">
          Category
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {(['all', 'men', 'women', 'kids'] as GenderCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => onUpdateFilter({ category: cat })}
              className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                filterState.category === cat
                  ? 'bg-[#0B8F63] text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Badge Filter */}
      <div className="space-y-2">
        <label className="font-bold text-neutral-800 text-xs uppercase tracking-wider block">
          Collections & Badges
        </label>
        <div className="space-y-1.5">
          {[
            { id: 'all', label: 'All Products' },
            { id: 'bestsellers', label: '⭐ Best Sellers' },
            { id: 'new', label: '✨ New Arrivals' },
            { id: 'limited', label: '🔥 Limited Stock' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onUpdateFilter({ badgeFilter: item.id as any })}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                filterState.badgeFilter === item.id
                  ? 'bg-[#0B8F63]/10 text-[#0B8F63] font-bold'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <span>{item.label}</span>
              {filterState.badgeFilter === item.id && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategories */}
      {availableSubcategories.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-neutral-100">
          <label className="font-bold text-neutral-800 text-xs uppercase tracking-wider block">
            Subcategory
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
            {availableSubcategories.map((sub) => {
              const isChecked = filterState.subcategories.includes(sub);
              return (
                <label
                  key={sub}
                  className="flex items-center gap-2 text-xs text-neutral-700 hover:text-neutral-900 cursor-pointer py-1"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleSubcategoryToggle(sub)}
                    className="rounded text-[#0B8F63] focus:ring-[#0B8F63] w-4 h-4 accent-[#0B8F63]"
                  />
                  <span>{sub}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Slider */}
      <div className="space-y-2.5 pt-2 border-t border-neutral-100">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-neutral-800 uppercase tracking-wider">
            Max Price
          </label>
          <span className="font-bold text-[#0B8F63]">
            ₹{filterState.priceRange[1].toLocaleString('en-IN')}
          </span>
        </div>
        <input
          type="range"
          min="500"
          max="5000"
          step="100"
          value={filterState.priceRange[1]}
          onChange={(e) =>
            onUpdateFilter({ priceRange: [filterState.priceRange[0], Number(e.target.value)] })
          }
          className="w-full accent-[#0B8F63] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-400 font-medium">
          <span>₹500</span>
          <span>₹5,000+</span>
        </div>
      </div>

      {/* Color Filter */}
      <div className="space-y-2.5 pt-2 border-t border-neutral-100">
        <label className="font-bold text-neutral-800 text-xs uppercase tracking-wider block">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {COLORS_LIST.map((col) => {
            const isSelected = filterState.colors.includes(col.name);
            return (
              <button
                key={col.name}
                onClick={() => handleColorToggle(col.name)}
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                  isSelected ? 'ring-2 ring-offset-2 ring-[#0B8F63] scale-110' : 'border-neutral-300'
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              >
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 ${
                      col.name === 'White' || col.name === 'Gold' ? 'text-neutral-900' : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Selector */}
      <div className="space-y-2.5 pt-2 border-t border-neutral-100">
        <label className="font-bold text-neutral-800 text-xs uppercase tracking-wider block">
          Available Sizes
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SIZES_LIST.map((sz) => {
            const isSelected = filterState.sizes.includes(sz);
            return (
              <button
                key={sz}
                onClick={() => handleSizeToggle(sz)}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-[#0B8F63] text-white border-[#0B8F63]'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Mobile Drawer Wrapper
  if (isOpenMobile) {
    return (
      <div className="fixed inset-0 z-50 flex lg:hidden">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCloseMobile} />
        <div className="relative w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-left duration-300">
          <div className="flex items-center justify-between pb-4 mb-4 border-b">
            <span className="font-serif-heading font-bold text-lg">Filters</span>
            <button onClick={onCloseMobile} className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          {filterContent}
          <button
            onClick={onCloseMobile}
            className="w-full mt-6 bg-[#0B8F63] text-white font-bold py-3 rounded-xl shadow-md text-xs"
          >
            Apply Filters
          </button>
        </div>
      </div>
    );
  }

  // Desktop Sidebar
  return (
    <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm sticky top-28">
      {filterContent}
    </div>
  );
};
