import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Sparkles, Footprints, History } from 'lucide-react';
import { Product } from '../../types';
import { CLEAN_IMAGE_COMING_SOON_SVG } from '../../utils/imageOptimizer';

interface LiveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onSearchCategory: (query: string) => void;
}

export const LiveSearchModal: React.FC<LiveSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onSearchCategory,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Sneakers',
    'Leather Loafers',
    'Ethnic Jutti',
    'School Shoes',
    'Running Shoes',
  ]);

  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.subcategory.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleRecentClick = (term: string) => {
    setQuery(term);
  };

  const handleProductClick = (product: Product) => {
    if (query && !recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches.slice(0, 4)]);
    }
    onSelectProduct(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden z-10 animate-in zoom-in-95 duration-200 space-y-4 p-5 sm:p-6">
        
        {/* Search Input Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-[#0B8F63]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sports shoes, sneakers, loafers, heels, school shoes, shirts..."
            className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-neutral-900 placeholder-neutral-400 font-medium focus:ring-2 focus:ring-[#0B8F63] outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 p-1 text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="absolute right-4 p-1 text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Content Results or Suggestions */}
        <div className="max-h-[60vh] overflow-y-auto space-y-5 pr-1">
          {query.trim() ? (
            <div>
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Live Products Found ({filteredProducts.length})
              </div>
              {filteredProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500">
                  No products matched "{query}". Try searching for 'sports', 'jettis', 'sandals', or 'formals'.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleProductClick(p)}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#F7F7F7] hover:bg-[#0B8F63]/10 border border-neutral-200/60 cursor-pointer transition-colors group"
                    >
                      <img                         src={p.images && p.images.length > 0 ? p.images[0] : CLEAN_IMAGE_COMING_SOON_SVG}
                        alt={p.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = CLEAN_IMAGE_COMING_SOON_SVG;
                        }}
                        className="w-12 h-12 rounded-xl object-cover bg-white shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-neutral-900 group-hover:text-[#0B8F63] truncate">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-medium">
                          {p.category.toUpperCase()} • ₹{p.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Category Shortcuts */}
              <div>
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0B8F63]" />
                  Popular Categories
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Running Shoes', 'Leather Loafers', 'Ethnic Juttis', 'Women Sports Shoes', 'School Shoes', 'Men Shirts & Jeans'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        onSearchCategory(cat);
                        onClose();
                      }}
                      className="text-xs font-bold bg-[#F7F7F7] hover:bg-[#0B8F63] hover:text-white text-neutral-700 px-3.5 py-1.5 rounded-xl border border-neutral-200/80 transition-all"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              <div>
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#0B8F63]" />
                  Recent Searches
                </div>
                <div className="space-y-1">
                  {recentSearches.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRecentClick(term)}
                      className="w-full text-left py-1.5 px-3 rounded-lg text-xs font-medium text-neutral-600 hover:bg-neutral-100 flex items-center justify-between transition-colors"
                    >
                      <span>{term}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
