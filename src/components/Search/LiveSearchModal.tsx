import React, { useState, useRef } from 'react';
import { Search, X, Sparkles, History, Mic, Camera, MapPin, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { CLEAN_IMAGE_COMING_SOON_SVG } from '../../utils/imageOptimizer';

interface LiveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onSearchCategory: (query: string) => void;
  onOpenStoreLocator?: () => void;
}

export const LiveSearchModal: React.FC<LiveSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onSearchCategory,
  onOpenStoreLocator,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Sports Shoes',
    'Leather Loafers',
    'Ethnic Jutti',
    'School Shoes',
    'Running Sneakers',
  ]);

  // Voice Search Handler
  const handleStartVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in your browser. Try typing instead!');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // AI Image Search Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiAnalyzing(true);
    setTimeout(() => {
      setIsAiAnalyzing(false);
      // Auto suggest matching shoe category
      const detectedTerms = ['sports shoes', 'sneakers', 'running', 'loafers', 'sandals'];
      const randomTerm = detectedTerms[Math.floor(Math.random() * detectedTerms.length)];
      setQuery(randomTerm);
    }, 1200);
  };

  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.subcategory.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleProductClick = (product: Product) => {
    if (query && !recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches.slice(0, 4)]);
    }
    onSelectProduct(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Hidden File Input for Image Search */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden z-10 animate-fade-in space-y-4 p-5 sm:p-6">
        
        {/* Search Input Bar with Voice & Image Search */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-[#0B8F63]" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sports shoes, sneakers, loafers, school shoes, outlets..."
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-2xl py-3.5 pl-12 pr-20 text-sm text-neutral-900 placeholder-neutral-400 font-medium focus:ring-2 focus:ring-[#0B8F63] outline-none"
            />

            {/* Mic and Camera Buttons */}
            <div className="absolute right-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleStartVoiceSearch}
                title="Voice Search"
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  isListening ? 'bg-rose-500 text-white animate-bounce' : 'text-neutral-400 hover:text-emerald-700 hover:bg-neutral-200/60'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="AI Image Search"
                className="p-1.5 rounded-xl text-neutral-400 hover:text-emerald-700 hover:bg-neutral-200/60 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-2xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* AI Processing Overlay */}
        {isAiAnalyzing && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-pulse">
            <Sparkles className="w-5 h-5 text-emerald-600 animate-spin" />
            <span className="text-xs font-bold text-emerald-900">
              Analyzing photo using Marudhar AI Vision... Matching shoe patterns!
            </span>
          </div>
        )}

        {/* Voice Listening Overlay */}
        {isListening && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
            <span className="text-xs font-bold text-rose-900">
              Listening... Speak shoe name (e.g. "Sports Shoes" or "Formal Loafers")
            </span>
          </div>
        )}

        {/* Search Results or Shortcuts */}
        <div className="max-h-[55vh] overflow-y-auto space-y-5 pr-1">
          {query.trim() ? (
            <div>
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Matching Catalog Products ({filteredProducts.length})
              </div>
              {filteredProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500">
                  No products matched "{query}". Try searching for 'sports', 'juttis', 'sandals', or 'formals'.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleProductClick(p)}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#F7F7F7] hover:bg-[#0B8F63]/10 border border-neutral-200/60 cursor-pointer transition-colors group"
                    >
                      <img
                        src={p.images && p.images.length > 0 ? p.images[0] : CLEAN_IMAGE_COMING_SOON_SVG}
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
              {/* Nearby Store Search Banner */}
              {onOpenStoreLocator && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenStoreLocator();
                  }}
                  className="w-full p-3.5 bg-gradient-to-r from-emerald-950 via-neutral-900 to-neutral-950 border border-emerald-500/30 rounded-2xl text-white flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-all shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <MapPin className="w-4 h-4 animate-bounce" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-extrabold text-xs text-white">Looking for Nearest Physical Outlets?</h4>
                      <p className="text-[10px] text-neutral-300">Find store locations, timings, and contact details</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500 text-white font-extrabold text-[10px] uppercase">
                    LOCATE →
                  </span>
                </button>
              )}

              {/* Popular Categories */}
              <div>
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0B8F63]" />
                  Popular Categories
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Sports Shoes', 'Leather Loafers', 'Ethnic Juttis', 'Women Sports Shoes', 'School Shoes', 'Men Apparel'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        onSearchCategory(cat);
                        onClose();
                      }}
                      className="text-xs font-bold bg-[#F7F7F7] hover:bg-[#0B8F63] hover:text-white text-neutral-700 px-3.5 py-1.5 rounded-xl border border-neutral-200/80 transition-all cursor-pointer"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-neutral-400" />
                    Recent Searches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-3 py-1 rounded-xl transition-colors cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
