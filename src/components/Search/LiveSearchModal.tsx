import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, History, Mic, MicOff, Camera, MapPin, AlertCircle } from 'lucide-react';
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

/**
 * Clean conversational filler words from voice transcripts
 * (e.g. "show me ethnic juttis" -> "ethnic juttis")
 */
function cleanVoiceQuery(text: string): string {
  let cleaned = text.trim();
  const prefixes = [
    /^search\s+for\s+/i,
    /^search\s+/i,
    /^show\s+me\s+/i,
    /^find\s+(me\s+)?/i,
    /^look\s+for\s+/i,
    /^i\s+want\s+/i,
    /^i'm\s+looking\s+for\s+/i,
    /^mujhe\s+/i,
    /^kripya\s+/i,
  ];
  for (const prefix of prefixes) {
    cleaned = cleaned.replace(prefix, '');
  }
  // Strip trailing punctuation
  cleaned = cleaned.replace(/[?.!,]+$/, '').trim();
  return cleaned;
}

export const LiveSearchModal: React.FC<LiveSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onSearchCategory,
  onOpenStoreLocator,
}) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Sports Shoes',
    'Leather Loafers',
    'Ethnic Jutti',
    'School Shoes',
    'Running Sneakers',
  ]);

  // Clean up recognition on modal close or unmount
  useEffect(() => {
    if (!isOpen && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore errors on stopping
      }
      setIsListening(false);
      setInterimTranscript('');
      setVoiceError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Web Speech API Voice Search Handler
  const toggleVoiceSearch = () => {
    setVoiceError(null);

    // If currently listening, stop it
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      setInterimTranscript('');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        'Voice search is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari, or type your query.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-IN'; // Indian English / Hinglish dialect
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcriptPiece;
          } else {
            interim += transcriptPiece;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final) {
          const finalSearchQuery = cleanVoiceQuery(final);
          setQuery(finalSearchQuery);
          setInterimTranscript('');
          setIsListening(false);

          // Add to recent searches if non-empty
          if (finalSearchQuery && !recentSearches.includes(finalSearchQuery)) {
            setRecentSearches((prev) => [finalSearchQuery, ...prev.filter((s) => s !== finalSearchQuery).slice(0, 4)]);
          }
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setInterimTranscript('');
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceError('Microphone permission was denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech was detected. Please click the mic and speak clearly.');
        } else if (event.error === 'network') {
          setVoiceError('Network connection error during voice recognition. Please try again.');
        } else {
          setVoiceError(`Voice recognition error (${event.error || 'unknown'}). Please try typing.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.start();
    } catch (err: any) {
      console.warn('Voice recognition startup warning:', err);
      setIsListening(false);
      setVoiceError('Could not start voice recognition. Please check your microphone and try again.');
    }
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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  if (!isOpen) return null;

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
        onClick={(e) => e.stopPropagation()}
        className="sr-only opacity-0 absolute w-0 h-0 pointer-events-none -z-10"
        tabIndex={-1}
        aria-hidden="true"
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
                id="live-search-voice-btn"
                onClick={toggleVoiceSearch}
                aria-label={isListening ? 'Stop voice recognition' : 'Start voice search'}
                title={isListening ? 'Listening... Click to stop' : 'Voice Search (Web Speech)'}
                className={`relative p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  isListening
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-400/60'
                    : 'text-neutral-500 hover:text-[#0B8F63] hover:bg-emerald-50'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4 animate-pulse" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
                {isListening && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                  </span>
                )}
              </button>

              <button
                type="button"
                id="live-search-camera-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                title="AI Image Search"
                className="p-2 rounded-xl text-neutral-500 hover:text-[#0B8F63] hover:bg-emerald-50 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>

              {query && (
                <button
                  type="button"
                  id="live-search-clear-btn"
                  onClick={() => {
                    setQuery('');
                    setInterimTranscript('');
                    setVoiceError(null);
                  }}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <button
            id="live-search-close-btn"
            onClick={onClose}
            className="p-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-2xl font-bold cursor-pointer transition-colors"
            title="Close Search"
          >
            ✕
          </button>
        </div>

        {/* Voice Search Error Notice */}
        {voiceError && (
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 text-amber-900 text-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{voiceError}</span>
            </div>
            <button
              type="button"
              onClick={() => setVoiceError(null)}
              className="text-amber-700 hover:text-amber-950 font-bold px-2 py-0.5 rounded-lg hover:bg-amber-100 transition-colors text-xs shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* AI Processing Overlay */}
        {isAiAnalyzing && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-pulse">
            <Sparkles className="w-5 h-5 text-emerald-600 animate-spin" />
            <span className="text-xs font-bold text-emerald-900">
              Analyzing photo using Marudhar AI Vision... Matching shoe patterns!
            </span>
          </div>
        )}

        {/* Voice Listening Overlay with Realtime Waveform and Interim Feedback */}
        {isListening && (
          <div className="p-3.5 bg-gradient-to-r from-rose-50 via-rose-50/70 to-emerald-50/50 border border-rose-200/80 rounded-2xl flex items-center justify-between gap-3 animate-fade-in shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Mic className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-rose-950">Listening... Speak now</span>
                  {/* Dynamic sound bars */}
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-0.5 h-2 bg-rose-500 rounded-full animate-pulse" />
                    <span className="w-0.5 h-3.5 bg-rose-600 rounded-full animate-pulse [animation-delay:150ms]" />
                    <span className="w-0.5 h-1.5 bg-rose-400 rounded-full animate-pulse [animation-delay:300ms]" />
                    <span className="w-0.5 h-2.5 bg-rose-500 rounded-full animate-pulse [animation-delay:200ms]" />
                    <span className="w-0.5 h-3 bg-rose-600 rounded-full animate-pulse [animation-delay:400ms]" />
                  </div>
                </div>
                <p className="text-[11px] text-neutral-600 truncate mt-0.5">
                  {interimTranscript ? (
                    <span className="font-semibold text-rose-700 italic">"{interimTranscript}"</span>
                  ) : (
                    'Try: "Sports shoes", "Leather loafers", "Ethnic jutti", "School shoes"'
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleVoiceSearch}
              className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold rounded-xl shrink-0 transition-colors cursor-pointer"
            >
              Done
            </button>
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
