import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Image as ImageIcon,
  Sliders,
  RotateCcw,
  Save,
  Check,
  Eye,
  Search,
  Monitor,
  Smartphone,
  ChevronDown,
  Star,
  Layers,
  ZoomIn
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { HeroContent, Product } from '../../types';
import { AdminImageSelector } from '../Common/UniversalImageSystem';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80';

export const HeroImageSettingsCard: React.FC = () => {
  const { heroContent, updateHeroContent, products, showToast } = useStore();

  // Local state for Hero Product / Shoe Image settings
  const [mode, setMode] = useState<'product' | 'custom'>(heroContent?.heroImageMode || 'custom');
  const [selectedProductId, setSelectedProductId] = useState<string>(heroContent?.heroProductId || '');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(heroContent?.heroProductImageIndex || 0);
  const [customImageUrl, setCustomImageUrl] = useState<string>(
    heroContent?.customHeroImageUrl || heroContent?.heroImage || DEFAULT_FALLBACK_IMAGE
  );

  const [fit, setFit] = useState<'cover' | 'contain'>(heroContent?.heroImageFit || 'cover');
  const [position, setPosition] = useState<'center' | 'top' | 'bottom' | 'left' | 'right'>(
    heroContent?.heroImagePosition || 'center'
  );
  const [scale, setScale] = useState<number>(heroContent?.heroImageScale || 100);

  const [enabled, setEnabled] = useState<boolean>(heroContent?.heroImageEnabled !== false);
  const [desktopVisible, setDesktopVisible] = useState<boolean>(heroContent?.heroImageDesktopVisible !== false);
  const [mobileVisible, setMobileVisible] = useState<boolean>(heroContent?.heroImageMobileVisible !== false);

  const [productSearch, setProductSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when heroContent updates from Firestore
  useEffect(() => {
    if (heroContent) {
      setMode(heroContent.heroImageMode || 'custom');
      setSelectedProductId(heroContent.heroProductId || '');
      setSelectedImageIndex(heroContent.heroProductImageIndex || 0);
      setCustomImageUrl(heroContent.customHeroImageUrl || heroContent.heroImage || DEFAULT_FALLBACK_IMAGE);
      setFit(heroContent.heroImageFit || 'cover');
      setPosition(heroContent.heroImagePosition || 'center');
      setScale(heroContent.heroImageScale || 100);
      setEnabled(heroContent.heroImageEnabled !== false);
      setDesktopVisible(heroContent.heroImageDesktopVisible !== false);
      setMobileVisible(heroContent.heroImageMobileVisible !== false);
    }
  }, [heroContent]);

  // Filter catalog products by search query
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    if (!productSearch.trim()) return products.slice(0, 30);
    const q = productSearch.toLowerCase();
    return products.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.id?.toLowerCase().includes(q)
    ).slice(0, 30);
  }, [products, productSearch]);

  // Get currently selected product object
  const selectedProduct = useMemo(() => {
    if (!selectedProductId || !Array.isArray(products)) return null;
    return products.find((p) => p.id === selectedProductId) || null;
  }, [selectedProductId, products]);

  // Product images array
  const productImages = useMemo(() => {
    if (!selectedProduct) return [];
    if (Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0) {
      return selectedProduct.images;
    }
    if (selectedProduct.imageUrl) return [selectedProduct.imageUrl];
    if ((selectedProduct as any).image) return [(selectedProduct as any).image];
    return [];
  }, [selectedProduct]);

  // Compute the image URL to preview live
  const previewImageUrl = useMemo(() => {
    if (mode === 'product' && selectedProduct) {
      if (productImages[selectedImageIndex]) {
        return productImages[selectedImageIndex];
      }
      if (productImages[0]) return productImages[0];
    }
    if (mode === 'custom' && customImageUrl) {
      return customImageUrl;
    }
    return DEFAULT_FALLBACK_IMAGE;
  }, [mode, selectedProduct, productImages, selectedImageIndex, customImageUrl]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated: HeroContent = {
        ...(heroContent || {
          badge: 'Marudhar Fashion Point',
          headlineMain: 'Walk in Style.',
          headlineHighlight: 'Royal Comfort & Authentic Fashion.',
          subtitle: 'Exclusive lineup of high-grade athletic sneakers, royal leather loafers & party wear.',
          heroImage: previewImageUrl,
          stat1Number: '15,000+',
          stat1Label: 'Happy Families Served',
          stat2Number: '100%',
          stat2Label: 'Fit & Size Guarantee',
          stat3Number: '4.9★',
          stat3Label: 'Google Customer Rating',
          primaryBtnText: 'Shop Now',
          primaryBtnLink: '#products',
        }),
        heroImage: previewImageUrl,
        heroImageMode: mode,
        heroProductId: mode === 'product' ? selectedProductId : '',
        heroProductImageIndex: mode === 'product' ? selectedImageIndex : 0,
        customHeroImageUrl: mode === 'custom' ? customImageUrl : (heroContent?.customHeroImageUrl || ''),
        heroImageFit: fit,
        heroImagePosition: position,
        heroImageScale: scale,
        heroImageEnabled: enabled,
        heroImageDesktopVisible: desktopVisible,
        heroImageMobileVisible: mobileVisible,
      };

      await updateHeroContent(updated);
      showToast('Hero shoe/product visual settings saved successfully!', 'success');
    } catch (err) {
      console.error('Failed to save hero visual settings:', err);
      showToast('Failed to save hero visual settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (window.confirm('Reset hero section visual to default shoe image?')) {
      setMode('custom');
      setSelectedProductId('');
      setSelectedImageIndex(0);
      setCustomImageUrl(DEFAULT_FALLBACK_IMAGE);
      setFit('cover');
      setPosition('center');
      setScale(100);
      setEnabled(true);
      setDesktopVisible(true);
      setMobileVisible(true);

      try {
        const updated: HeroContent = {
          ...(heroContent || {}),
          heroImage: DEFAULT_FALLBACK_IMAGE,
          heroImageMode: 'custom',
          heroProductId: '',
          heroProductImageIndex: 0,
          customHeroImageUrl: DEFAULT_FALLBACK_IMAGE,
          heroImageFit: 'cover',
          heroImagePosition: 'center',
          heroImageScale: 100,
          heroImageEnabled: true,
          heroImageDesktopVisible: true,
          heroImageMobileVisible: true,
        };
        await updateHeroContent(updated);
        showToast('Hero visual reset to default image', 'info');
      } catch (err) {
        console.error('Reset error:', err);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden space-y-6 p-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-1.5 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>HOMEPAGE HERO VISUAL CONTROL</span>
          </div>
          <h2 className="text-xl font-black text-neutral-900 font-serif-heading">
            Hero Product / Shoe Image Control
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Full admin control over the large hero showcase visual. Choose a live catalog shoe or upload a custom visual.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Hero Visual'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Controls & Settings */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* 1. Source Mode Selection */}
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80">
            <label className="text-xs font-black uppercase tracking-wider text-neutral-700 block mb-3">
              1. Choose Hero Visual Source
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('product')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  mode === 'product'
                    ? 'bg-emerald-500/10 border-[#0B8F63] text-[#0B8F63] ring-2 ring-[#0B8F63]/20 shadow-sm'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${mode === 'product' ? 'bg-[#0B8F63] text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs block">Select Catalog Product</span>
                  <span className="text-[10px] text-neutral-500">Pick any live shoe with price & photos</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('custom')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  mode === 'custom'
                    ? 'bg-emerald-500/10 border-[#0B8F63] text-[#0B8F63] ring-2 ring-[#0B8F63]/20 shadow-sm'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${mode === 'custom' ? 'bg-[#0B8F63] text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs block">Custom Image / Upload</span>
                  <span className="text-[10px] text-neutral-500">Upload graphic or paste direct URL</span>
                </div>
              </button>
            </div>
          </div>

          {/* Mode A: Catalog Product Selector */}
          {mode === 'product' && (
            <div className="bg-white p-4.5 rounded-2xl border border-neutral-200 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#0B8F63]" />
                  <span>Select Product from Catalog</span>
                </label>
                {selectedProduct && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Selected: {selectedProduct.name} (₹{selectedProduct.price})
                  </span>
                )}
              </div>

              {/* Product search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name or category..."
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-[#0B8F63] focus:bg-white transition-colors"
                />
              </div>

              {/* Product Selection List */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-neutral-100 rounded-xl p-1 bg-neutral-50/50">
                {filteredProducts.map((p) => {
                  const isSelected = p.id === selectedProductId;
                  const thumb = (p.images && p.images[0]) || p.imageUrl || (p as any).image;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProductId(p.id);
                        setSelectedImageIndex(0);
                      }}
                      className={`p-2 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-100/70 border border-[#0B8F63] text-emerald-950 font-bold shadow-xs'
                          : 'hover:bg-white border border-transparent text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={thumb || DEFAULT_FALLBACK_IMAGE}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover bg-neutral-200 shrink-0 border border-neutral-200"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="text-xs truncate font-semibold">{p.name}</p>
                          <p className="text-[10px] text-neutral-500 truncate">{p.category} • ₹{p.price}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#0B8F63] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* If Selected Product has Multiple Photos, Choose Photo */}
              {selectedProduct && productImages.length > 0 && (
                <div className="pt-2 border-t border-neutral-100">
                  <label className="text-[11px] font-bold text-neutral-700 block mb-2">
                    Select Which Photo of this Product to Display: ({productImages.length} available)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {productImages.map((imgUrl, idx) => {
                      const isImgActive = idx === selectedImageIndex;
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative w-16 h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                            isImgActive
                              ? 'border-[#0B8F63] ring-2 ring-[#0B8F63]/30 scale-105'
                              : 'border-neutral-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[9px] px-1 rounded">
                            #{idx + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode B: Custom Image Upload / URL */}
          {mode === 'custom' && (
            <div className="bg-white p-4.5 rounded-2xl border border-neutral-200 space-y-3">
              <AdminImageSelector
                value={customImageUrl}
                onChange={(url) => setCustomImageUrl(url)}
                label="Custom Hero Shoe Image Visual"
                description="Upload a high-resolution transparent or studio shoe photo, or paste a web URL."
              />
            </div>
          )}

          {/* 2. Sizing, Fit & Alignment Controls */}
          <div className="bg-neutral-50 p-4.5 rounded-2xl border border-neutral-200/80 space-y-4">
            <label className="text-xs font-black uppercase tracking-wider text-neutral-700 block">
              2. Sizing, Alignment & Frame Fit
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              
              {/* Fit Mode */}
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Image Fit</label>
                <select
                  value={fit}
                  onChange={(e) => setFit(e.target.value as any)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-2 font-medium outline-none focus:border-[#0B8F63]"
                >
                  <option value="cover">Cover (Fill Container)</option>
                  <option value="contain">Contain (Full Shoe Visible)</option>
                </select>
              </div>

              {/* Position */}
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Focal Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as any)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-2 font-medium outline-none focus:border-[#0B8F63]"
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>

              {/* Scale / Zoom */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-neutral-700">Zoom / Scale</label>
                  <span className="font-mono text-emerald-800 font-bold">{scale}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="130"
                  step="5"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full accent-[#0B8F63] cursor-pointer"
                />
              </div>

            </div>
          </div>

          {/* 3. Visibility Toggles */}
          <div className="bg-neutral-50 p-4.5 rounded-2xl border border-neutral-200/80 space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-neutral-700 block">
              3. Visibility & Device Display
            </label>

            <div className="flex flex-wrap items-center gap-5 text-xs">
              <label className="flex items-center gap-2 font-bold text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="rounded text-[#0B8F63] w-4 h-4"
                />
                <span>Enable Hero Showcase Image</span>
              </label>

              <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={desktopVisible}
                  onChange={(e) => setDesktopVisible(e.target.checked)}
                  className="rounded text-[#0B8F63] w-4 h-4"
                />
                <Monitor className="w-3.5 h-3.5 text-neutral-500" />
                <span>Show on Desktop</span>
              </label>

              <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mobileVisible}
                  onChange={(e) => setMobileVisible(e.target.checked)}
                  className="rounded text-[#0B8F63] w-4 h-4"
                />
                <Smartphone className="w-3.5 h-3.5 text-neutral-500" />
                <span>Show on Mobile</span>
              </label>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Live Interactive Preview */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-[#051C13] rounded-3xl p-5 border border-emerald-900/50 shadow-xl text-white flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Storefront Preview</span>
                </span>
                <span className="bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30 text-[10px] text-emerald-300">
                  {enabled ? 'Active on Website' : 'Disabled / Hidden'}
                </span>
              </div>

              {/* Preview Card Frame */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-950 border border-white/15 shadow-inner flex items-center justify-center">
                
                {enabled ? (
                  <img
                    src={previewImageUrl}
                    alt="Hero Preview"
                    style={{ transform: `scale(${scale / 100})` }}
                    className={`w-full h-full ${
                      fit === 'contain' ? 'object-contain' : 'object-cover'
                    } ${
                      position === 'top'
                        ? 'object-top'
                        : position === 'bottom'
                        ? 'object-bottom'
                        : position === 'left'
                        ? 'object-left'
                        : position === 'right'
                        ? 'object-right'
                        : 'object-center'
                    } transition-all duration-300`}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center p-4 text-neutral-400 text-xs">
                    <p className="font-bold text-neutral-300">Hero Image Disabled</p>
                    <p className="text-[11px] mt-1">Left headline will expand to full container width.</p>
                  </div>
                )}

                {/* Badge Overlay */}
                {enabled && (
                  <>
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-amber-300 border border-white/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{mode === 'product' && selectedProduct ? 'Catalog Showcase' : 'Marudhar Verified'}</span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10">
                      <span className="truncate pr-2">
                        {mode === 'product' && selectedProduct ? selectedProduct.name : 'Exclusive Footwear'}
                      </span>
                      <span className="bg-emerald-500 text-neutral-950 font-black px-2 py-0.2 rounded-full text-[10px] shrink-0">
                        {mode === 'product' && selectedProduct ? `₹${selectedProduct.price}` : 'Royal Comfort'}
                      </span>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Preview Status & Quick Action */}
            <div className="mt-4 pt-3 border-t border-emerald-900/40 text-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-200/80">
                <span>Display Fit: <strong className="text-white capitalize">{fit}</strong></span>
                <span>Zoom: <strong className="text-white">{scale}%</strong></span>
                <span>Focal: <strong className="text-white capitalize">{position}</strong></span>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Publishing Changes...' : 'Publish Hero Changes to Website'}</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
