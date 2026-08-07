import React, { useState } from 'react';
import {
  Sparkles,
  Save,
  RotateCcw,
  Layout,
  Eye,
  Sliders,
  Palette,
  Layers,
  Zap,
  CheckCircle2,
  Tv,
  Smartphone,
  Info,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCardDesignerConfig, DEFAULT_PRODUCT_CARD_CONFIG, Product } from '../../types';
import { ProductCard } from '../Products/ProductCard';

// Sample product for live admin preview
const SAMPLE_PREVIEW_PRODUCT: Product = {
  id: 'sample-preview-product-1',
  name: 'MBH Royal Velvet Designer Sneakers',
  brand: 'ROYAL LUXURY',
  price: 2499,
  originalPrice: 4999,
  category: 'men',
  subcategory: 'Premium Footwear',
  material: 'Italian Leather & Velvet',
  description: 'Handcrafted luxury sneakers featuring high-density foam cushioning, gold-embossed accents, and breathability.',
  images: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
  ],
  colors: [
    { name: 'Royal Crimson', hex: '#DC2626' },
    { name: 'Midnight Black', hex: '#171717' },
    { name: 'Emerald Gold', hex: '#059669' },
  ],
  sizes: ['7 UK', '8 UK', '9 UK', '10 UK'],
  sizeStocks: [
    { size: '7 UK', stockQuantity: 12, inStock: true, isAvailable: true },
    { size: '8 UK', stockQuantity: 24, inStock: true, isAvailable: true },
    { size: '9 UK', stockQuantity: 8, inStock: true, isAvailable: true },
    { size: '10 UK', stockQuantity: 0, inStock: false, isAvailable: true },
  ],
  variants: [
    {
      id: 'var-crimson',
      color: 'Royal Crimson',
      size: '8 UK',
      price: 2499,
      originalPrice: 4999,
      stock: 24,
      sku: 'MBH-RC-8',
      barcode: '8901234567891',
      colorCode: '#DC2626',
      discount: 50,
      lowStockLimit: 5,
      status: 'active',
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin',
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
      ],
    },
    {
      id: 'var-black',
      color: 'Midnight Black',
      size: '8 UK',
      price: 2499,
      originalPrice: 4999,
      stock: 15,
      sku: 'MBH-MB-8',
      barcode: '8901234567892',
      colorCode: '#171717',
      discount: 50,
      lowStockLimit: 5,
      status: 'active',
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin',
      images: [
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
      ],
    },
    {
      id: 'var-emerald',
      color: 'Emerald Gold',
      size: '8 UK',
      price: 2699,
      originalPrice: 5299,
      stock: 10,
      sku: 'MBH-EG-8',
      barcode: '8901234567893',
      colorCode: '#059669',
      discount: 49,
      lowStockLimit: 5,
      status: 'active',
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin',
      images: [
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800',
      ],
    },
  ],
  rating: 4.9,
  reviewsCount: 148,
  isBestSeller: true,
  isNewArrival: true,
  isFeatured: true,
  discountPercent: 50,
  collectionTags: ['luxury', 'bestseller'],
  inStock: true,
  createdAt: new Date().toISOString(),
};

export const ProductCardDesignerSettingsView: React.FC = () => {
  const { productCardConfig, updateProductCardConfig, showToast } = useStore();

  const [workingConfig, setWorkingConfig] = useState<ProductCardDesignerConfig>(() => ({
    ...DEFAULT_PRODUCT_CARD_CONFIG,
    ...(productCardConfig || {}),
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [dummyWishlist, setDummyWishlist] = useState(true);

  // Apply Presets
  const applyPreset = (presetName: 'mbh_3d_glass' | 'luxury_elevated' | 'minimal_clean' | 'borderless_modern') => {
    switch (presetName) {
      case 'mbh_3d_glass':
        setWorkingConfig({
          ...DEFAULT_PRODUCT_CARD_CONFIG,
          cardStyle: 'mbh_3d_glass',
          cornerRadius: 'rounded-2xl',
          borderStyle: 'border-glass',
          shadowIntensity: 'shadow-lg',
          backgroundTheme: 'bg-glass',
          badgeStyle: 'glass',
          enableGlowEffect: true,
          enableLiftOnHover: true,
          enableScaleOnHover: true,
          enableImageZoom: true,
        });
        showToast('Applied MBH 3D Glass Preset', 'info');
        break;
      case 'luxury_elevated':
        setWorkingConfig({
          ...DEFAULT_PRODUCT_CARD_CONFIG,
          cardStyle: 'luxury_elevated',
          cornerRadius: 'rounded-2xl',
          borderStyle: 'border-thin',
          shadowIntensity: 'shadow-2xl',
          backgroundTheme: 'bg-cream',
          fontFamily: 'serif',
          badgeStyle: 'solid',
          enableGlowEffect: false,
          enableLiftOnHover: true,
          enableImageZoom: true,
        });
        showToast('Applied Luxury Elevated Preset', 'info');
        break;
      case 'minimal_clean':
        setWorkingConfig({
          ...DEFAULT_PRODUCT_CARD_CONFIG,
          cardStyle: 'minimal_clean',
          cornerRadius: 'rounded-xl',
          borderStyle: 'border-thin',
          shadowIntensity: 'shadow-sm',
          backgroundTheme: 'bg-white',
          badgeStyle: 'outline',
          enableGlowEffect: false,
          enableLiftOnHover: false,
          enableScaleOnHover: false,
        });
        showToast('Applied Minimal Clean Preset', 'info');
        break;
      case 'borderless_modern':
        setWorkingConfig({
          ...DEFAULT_PRODUCT_CARD_CONFIG,
          cardStyle: 'borderless_modern',
          cornerRadius: 'rounded-3xl',
          borderStyle: 'border-none',
          shadowIntensity: 'shadow-md',
          backgroundTheme: 'bg-white',
          badgeStyle: 'pill',
          enableGlowEffect: true,
          enableScaleOnHover: true,
        });
        showToast('Applied Borderless Modern Preset', 'info');
        break;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateProductCardConfig(workingConfig);
    setIsSaving(false);
  };

  const handleResetToDefault = () => {
    setWorkingConfig(DEFAULT_PRODUCT_CARD_CONFIG);
    showToast('Reset to default card settings', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-emerald-950 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-black tracking-tight">Premium Product Card Designer</h2>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-neutral-300 max-w-2xl">
            Customize 3D glassmorphic cards, variant switching animations, hover effects, quick actions, and custom button colors used across all pages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefault}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#0B8F63] hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Designer Settings'}
          </button>
        </div>
      </div>

      {/* Preset Quick Selection Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
          <Layout className="w-4 h-4 text-[#0B8F63]" />
          <span>Quick Style Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => applyPreset('mbh_3d_glass')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
              workingConfig.cardStyle === 'mbh_3d_glass'
                ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-sm'
                : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            ✨ MBH 3D Glass
          </button>
          <button
            onClick={() => applyPreset('luxury_elevated')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
              workingConfig.cardStyle === 'luxury_elevated'
                ? 'bg-amber-900 text-white border-amber-900 shadow-sm'
                : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            🏛️ Luxury Elevated
          </button>
          <button
            onClick={() => applyPreset('minimal_clean')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
              workingConfig.cardStyle === 'minimal_clean'
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            ⚪ Minimal Clean
          </button>
          <button
            onClick={() => applyPreset('borderless_modern')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
              workingConfig.cardStyle === 'borderless_modern'
                ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            🔳 Borderless Modern
          </button>
        </div>
      </div>

      {/* Main Designer Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customization Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Geometry & Aesthetics */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#0B8F63]" />
                <h3 className="font-extrabold text-sm text-neutral-900">Card Geometry & Aesthetics</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Card Style Preset</label>
                <select
                  value={workingConfig.cardStyle}
                  onChange={(e) =>
                    setWorkingConfig({ ...workingConfig, cardStyle: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-semibold text-neutral-800 bg-neutral-50 focus:ring-2 focus:ring-[#0B8F63]"
                >
                  <option value="mbh_3d_glass">MBH 3D Glassmorphic</option>
                  <option value="luxury_elevated">Luxury Elevated</option>
                  <option value="minimal_clean">Minimal Clean</option>
                  <option value="borderless_modern">Borderless Modern</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Corner Radius</label>
                <select
                  value={workingConfig.cornerRadius}
                  onChange={(e) =>
                    setWorkingConfig({ ...workingConfig, cornerRadius: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-semibold text-neutral-800 bg-neutral-50 focus:ring-2 focus:ring-[#0B8F63]"
                >
                  <option value="rounded-xl">Rounded XL (12px)</option>
                  <option value="rounded-2xl">Rounded 2XL (16px)</option>
                  <option value="rounded-3xl">Rounded 3XL (24px)</option>
                  <option value="rounded-full">Pill Full Rounded</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Image Aspect Ratio</label>
                <select
                  value={workingConfig.aspectRatio}
                  onChange={(e) =>
                    setWorkingConfig({ ...workingConfig, aspectRatio: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-semibold text-neutral-800 bg-neutral-50 focus:ring-2 focus:ring-[#0B8F63]"
                >
                  <option value="aspect-square">1:1 Square</option>
                  <option value="aspect-[4/5]">4:5 Portrait</option>
                  <option value="aspect-[3/4]">3:4 Tall</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Shadow Intensity</label>
                <select
                  value={workingConfig.shadowIntensity}
                  onChange={(e) =>
                    setWorkingConfig({ ...workingConfig, shadowIntensity: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-semibold text-neutral-800 bg-neutral-50 focus:ring-2 focus:ring-[#0B8F63]"
                >
                  <option value="shadow-sm">Soft Subtle (sm)</option>
                  <option value="shadow-md">Medium Depth (md)</option>
                  <option value="shadow-lg">Large Depth (lg)</option>
                  <option value="shadow-2xl">Ultra Deep (2xl)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Font Family</label>
                <select
                  value={workingConfig.fontFamily}
                  onChange={(e) =>
                    setWorkingConfig({ ...workingConfig, fontFamily: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-semibold text-neutral-800 bg-neutral-50 focus:ring-2 focus:ring-[#0B8F63]"
                >
                  <option value="sans">Modern Sans-Serif</option>
                  <option value="serif">Luxury Serif</option>
                  <option value="mono">Tech Monospace</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Animation Speed</label>
                <select
                  value={workingConfig.animationSpeed}
                  onChange={(e) =>
                    setWorkingConfig({ ...workingConfig, animationSpeed: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-semibold text-neutral-800 bg-neutral-50 focus:ring-2 focus:ring-[#0B8F63]"
                >
                  <option value="fast">Fast (200ms)</option>
                  <option value="normal">Normal Smooth (350ms)</option>
                  <option value="slow">Slow Cinematic (500ms)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feature & Element Toggles */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#0B8F63]" />
                <h3 className="font-extrabold text-sm text-neutral-900">Card Elements & Display Toggles</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { key: 'showBrand', label: 'Brand Name' },
                { key: 'showRating', label: 'Star Rating & Reviews' },
                { key: 'showDiscountTag', label: 'Discount % Tag' },
                { key: 'showBadges', label: 'Badges (Best Seller, etc)' },
                { key: 'showColorSwatches', label: 'Color Swatches' },
                { key: 'showSizeSelector', label: 'Size Selector' },
                { key: 'showStockStatus', label: 'Stock Status Indicator' },
                { key: 'showWishlist', label: 'Wishlist Heart' },
                { key: 'showQuickView', label: 'Quick View Eye' },
                { key: 'showShareButton', label: 'Share Link Button' },
                { key: 'showCompareButton', label: 'Compare Button' },
                { key: 'showBuyNow', label: 'Buy Now Button' },
                { key: 'showAddToCart', label: 'Add to Bag Button' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={Boolean((workingConfig as any)[key])}
                    onChange={(e) =>
                      setWorkingConfig({ ...workingConfig, [key]: e.target.checked })
                    }
                    className="w-4 h-4 text-[#0B8F63] rounded border-neutral-300 focus:ring-[#0B8F63]"
                  />
                  <span className="font-semibold text-neutral-800">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Animation & Hover Effects */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#0B8F63]" />
                <h3 className="font-extrabold text-sm text-neutral-900">Hover & Transition FX</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { key: 'enableLiftOnHover', label: 'Lift Card On Hover' },
                { key: 'enableScaleOnHover', label: 'Scale Card On Hover' },
                { key: 'enableImageZoom', label: 'Image Zoom On Hover' },
                { key: 'enableGlowEffect', label: 'Glow Background On Hover' },
                { key: 'enableVariantSlideAnimation', label: 'Variant Color Slide Transition' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={Boolean((workingConfig as any)[key])}
                    onChange={(e) =>
                      setWorkingConfig({ ...workingConfig, [key]: e.target.checked })
                    }
                    className="w-4 h-4 text-[#0B8F63] rounded border-neutral-300 focus:ring-[#0B8F63]"
                  />
                  <span className="font-semibold text-neutral-800">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Action Button Styling */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#0B8F63]" />
                <h3 className="font-extrabold text-sm text-neutral-900">Button Text & Colors</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Buy Now Text</label>
                <input
                  type="text"
                  value={workingConfig.buyNowText || ''}
                  onChange={(e) => setWorkingConfig({ ...workingConfig, buyNowText: e.target.value })}
                  placeholder="⚡ BUY NOW"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-semibold text-neutral-800 bg-neutral-50"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Buy Now Button Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={workingConfig.buyNowColor || '#0B8F63'}
                    onChange={(e) => setWorkingConfig({ ...workingConfig, buyNowColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-neutral-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={workingConfig.buyNowColor || '#0B8F63'}
                    onChange={(e) => setWorkingConfig({ ...workingConfig, buyNowColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 font-mono text-neutral-800 bg-neutral-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Add To Bag Text</label>
                <input
                  type="text"
                  value={workingConfig.addToCartText || ''}
                  onChange={(e) => setWorkingConfig({ ...workingConfig, addToCartText: e.target.value })}
                  placeholder="ADD TO BAG"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-semibold text-neutral-800 bg-neutral-50"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Add To Bag Button Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={workingConfig.addToCartColor || '#171717'}
                    onChange={(e) => setWorkingConfig({ ...workingConfig, addToCartColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-neutral-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={workingConfig.addToCartColor || '#171717'}
                    onChange={(e) => setWorkingConfig({ ...workingConfig, addToCartColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 font-mono text-neutral-800 bg-neutral-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Live Interactive Preview (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
          <div className="bg-neutral-900 text-white p-5 rounded-3xl shadow-xl space-y-4 border border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm tracking-wide uppercase text-neutral-200">
                  Live Interactive Preview
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-neutral-800 p-1 rounded-xl">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    previewDevice === 'desktop' ? 'bg-[#0B8F63] text-white font-bold' : 'text-neutral-400'
                  }`}
                  title="Desktop View"
                >
                  <Tv className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    previewDevice === 'mobile' ? 'bg-[#0B8F63] text-white font-bold' : 'text-neutral-400'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Preview Canvas */}
            <div
              className={`mx-auto transition-all duration-300 p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 ${
                previewDevice === 'mobile' ? 'max-w-[280px]' : 'max-w-[340px]'
              }`}
            >
              <ProductCard
                product={SAMPLE_PREVIEW_PRODUCT}
                onQuickView={() => showToast('Quick View clicked in Admin Preview', 'info')}
                onToggleWishlist={() => setDummyWishlist(!dummyWishlist)}
                isWishlisted={dummyWishlist}
                onAddToCart={() => showToast('Added to Cart in Admin Preview!', 'success')}
                onBuyNow={() => showToast('Buy Now triggered in Admin Preview!', 'success')}
                customConfig={workingConfig}
              />
            </div>

            <div className="bg-emerald-950/50 border border-emerald-800/40 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-200">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Interactive:</strong> Click color swatches, sizes, or share icons above to test real animations and image switching before saving!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
