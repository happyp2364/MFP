import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Trash2,
  AlertTriangle,
  Check,
  Eye,
  Zap,
  ShoppingBag,
  Layers,
  Palette,
  Ruler,
  CheckCircle2,
  XCircle,
  Tag,
  Plus,
  Flame,
  Star,
  TrendingUp,
  Award,
  DollarSign,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, SizeStock, ProductColor } from '../../types';
import {
  PRODUCT_FOR_OPTIONS,
  getSubcategoriesForProductFor,
  getSizeTypeForSubcategory,
  getStandardSizesForCategory,
  buildDefaultSizeStocks,
  PRESET_COLOR_PALETTE,
} from '../../utils/productCategoryDefaults';
import { optimizeImageFile } from '../../utils/imageOptimizer';
import { validateFileUpload } from '../../lib/security';
import { QuickViewModal } from '../Products/QuickViewModal';
import { AdminImageSelector } from '../Common/UniversalImageSystem';

interface SmartProductFormModalProps {
  product: Product;
  isCreating: boolean;
  onSave: (product: Product) => void;
  onClose: () => void;
  onDuplicate?: (product: Product) => void;
}

const DRAFT_STORAGE_KEY = 'mfp_admin_product_draft_v2';

const POPULAR_BRANDS = [
  'Marudhar Fashion',
  'Puma',
  'Nike',
  'Sparx',
  'Campus',
  'ONE 8',
  'AirGlide',
  'Bata',
];

export const SmartProductFormModal: React.FC<SmartProductFormModalProps> = ({
  product: initialProduct,
  isCreating,
  onSave,
  onClose,
  onDuplicate,
}) => {
  const [productState, setProductState] = useState<Product>(() => {
    return { ...initialProduct };
  });

  const [hasDraft, setHasDraft] = useState(false);
  const [imageInputUrl, setImageInputUrl] = useState('');
  const [isOptimizingImage, setIsOptimizingImage] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);

  // Custom Color Addition State
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#1E40AF');

  // Auto-Save Draft logic for NEW products
  useEffect(() => {
    if (isCreating) {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        setHasDraft(true);
      }
    }
  }, [isCreating]);

  // Persist draft on change
  useEffect(() => {
    if (isCreating && productState.name) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(productState));
    }
  }, [productState, isCreating]);

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        setProductState(JSON.parse(saved));
        setHasDraft(false);
      }
    } catch (e) {
      console.error('Failed to parse draft', e);
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
  };

  // --- HANDLER: PRODUCT FOR (Category: men | women | kids) ---
  const handleSelectProductFor = (category: 'men' | 'women' | 'kids') => {
    const subs = getSubcategoriesForProductFor(category);
    const defaultSub = subs.all[0] || 'Sports Shoes';
    const newSizeStocks = buildDefaultSizeStocks(category, defaultSub);
    const newSizes = newSizeStocks.map((s) => s.size);

    setProductState((prev) => ({
      ...prev,
      category,
      subcategory: defaultSub,
      sizes: newSizes,
      sizeStocks: newSizeStocks,
    }));
  };

  // --- HANDLER: PRODUCT TYPE (Subcategory) ---
  const handleSelectSubcategory = (subcategory: string) => {
    const newSizeStocks = buildDefaultSizeStocks(productState.category, subcategory);
    const newSizes = newSizeStocks.map((s) => s.size);

    setProductState((prev) => ({
      ...prev,
      subcategory,
      sizes: newSizes,
      sizeStocks: newSizeStocks,
    }));
  };

  // Current Size System Type
  const currentSizeType = getSizeTypeForSubcategory(productState.category, productState.subcategory);
  const standardSizeOptions = getStandardSizesForCategory(productState.category, productState.subcategory);

  // Normalize current sizeStocks
  const currentSizeStocks: SizeStock[] = productState.sizeStocks && productState.sizeStocks.length > 0
    ? productState.sizeStocks
    : standardSizeOptions.map((sz) => ({
        size: sz,
        isAvailable: true,
        inStock: true,
        stockQuantity: 10,
      }));

  // Toggle Size Availability
  const handleToggleSizeAvailable = (sizeStr: string) => {
    const updated = currentSizeStocks.map((st) => {
      if (st.size === sizeStr) {
        return { ...st, isAvailable: !st.isAvailable };
      }
      return st;
    });

    const activeSizes = updated.filter((s) => s.isAvailable).map((s) => s.size);
    setProductState({ ...productState, sizeStocks: updated, sizes: activeSizes });
  };

  // Change Quantity per Size
  const handleSizeQuantityChange = (sizeStr: string, qty: number) => {
    const sanitized = Math.max(0, qty);
    const updated = currentSizeStocks.map((st) => {
      if (st.size === sizeStr) {
        return {
          ...st,
          stockQuantity: sanitized,
          inStock: sanitized > 0,
        };
      }
      return st;
    });

    setProductState({ ...productState, sizeStocks: updated });
  };

  // Bulk Size Actions
  const handleBulkSelectAllSizes = () => {
    const updated = standardSizeOptions.map((sz) => {
      const existing = currentSizeStocks.find((s) => s.size === sz);
      return {
        size: sz,
        isAvailable: true,
        inStock: existing ? existing.inStock : true,
        stockQuantity: existing && existing.stockQuantity > 0 ? existing.stockQuantity : 10,
      };
    });
    setProductState({
      ...productState,
      sizeStocks: updated,
      sizes: updated.map((s) => s.size),
    });
  };

  const handleBulkDeselectAllSizes = () => {
    const updated = currentSizeStocks.map((s) => ({ ...s, isAvailable: false }));
    setProductState({ ...productState, sizeStocks: updated, sizes: [] });
  };

  const handleBulkSetAllInStock = (qty = 10) => {
    const updated = currentSizeStocks.map((s) => ({
      ...s,
      isAvailable: true,
      inStock: true,
      stockQuantity: qty,
    }));
    setProductState({
      ...productState,
      sizeStocks: updated,
      sizes: updated.map((s) => s.size),
    });
  };

  // COLOR MANAGEMENT
  const handleAddPresetColor = (colorObj: ProductColor) => {
    const exists = productState.colors.some(
      (c) => c.name.toLowerCase() === colorObj.name.toLowerCase()
    );
    if (exists) return;

    setProductState({
      ...productState,
      colors: [...productState.colors, colorObj],
    });
  };

  const handleRemoveColor = (colorName: string) => {
    setProductState({
      ...productState,
      colors: productState.colors.filter((c) => c.name !== colorName),
    });
  };

  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return;
    handleAddPresetColor({
      name: customColorName.trim(),
      hex: customColorHex,
    });
    setCustomColorName('');
  };

  // Auto-calculate discount percentage
  const handlePriceChange = (priceVal: number, origVal: number) => {
    let discount = 0;
    if (origVal > priceVal && origVal > 0) {
      discount = Math.round(((origVal - priceVal) / origVal) * 100);
    }
    setProductState({
      ...productState,
      price: priceVal,
      originalPrice: origVal,
      discountPercent: discount,
    });
  };

  // VALIDATION: Only Images (>=1), Name, Product For, Product Type, and Price (>0) are required.
  const isImagesValid = productState.images && productState.images.length > 0;
  const isNameValid = !!productState.name && productState.name.trim().length > 0;
  const isProductForValid = !!productState.category;
  const isSubcategoryValid = !!productState.subcategory;
  const isPriceValid = typeof productState.price === 'number' && productState.price > 0;

  const isFormValid = isImagesValid && isNameValid && isProductForValid && isSubcategoryValid && isPriceValid;

  // SUBMIT HANDLER WITH AUTOMATIC BACKGROUND METADATA GENERATION
  const handleSubmitForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid) return;

    const cleanName = productState.name.trim();
    const catCode = productState.category.charAt(0).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const subCode = (productState.subcategory || 'GEN')
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, 'X');

    // Auto-generate technical fields in background
    const autoSku = productState.sku && productState.sku.trim().length > 0
      ? productState.sku
      : `MFP-${catCode}${randomSuffix}-${subCode}`;

    const slugBase = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const autoSlug = productState.slug && productState.slug.trim().length > 0
      ? productState.slug
      : `${slugBase}-${Math.floor(100 + Math.random() * 900)}`;

    const autoMetaTitle = `${cleanName} | Marudhar Fashion Point`;
    const autoMetaDesc = `Buy ${cleanName} by ${productState.brand || 'Marudhar Fashion Point'} at ₹${productState.price}. Fast delivery & cash on delivery.`;

    // Process sizes: if no sizes selected, leave as empty array or keep current
    const activeSizes = productState.sizes || [];

    const finalProduct: Product = {
      ...productState,
      name: cleanName,
      brand: productState.brand ? productState.brand.trim() : '',
      description: productState.description ? productState.description.trim() : '',
      rating: productState.rating && productState.rating > 0 ? productState.rating : undefined,
      reviewsCount: productState.reviewsCount && productState.reviewsCount > 0 ? productState.reviewsCount : undefined,
      originalPrice: (productState.originalPrice && productState.originalPrice > productState.price)
        ? productState.originalPrice
        : undefined,
      discountPercent: (productState.originalPrice && productState.originalPrice > productState.price)
        ? Math.round(((productState.originalPrice - productState.price) / productState.originalPrice) * 100)
        : 0,
      isBestSeller: !!productState.isBestSeller,
      isNewArrival: !!productState.isNewArrival,
      isFeatured: !!productState.isFeatured,
      isTrending: !!productState.isTrending,
      isLimitedStock: !!productState.isLimitedStock,
      inStock: productState.inStock !== false,
      status: productState.status || 'active',
      sizes: activeSizes,
      colors: productState.colors || [],
      sku: autoSku,
      slug: autoSlug,
      metaTitle: autoMetaTitle,
      metaDescription: autoMetaDesc,
      id: productState.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    if (isCreating) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }

    onSave(finalProduct);
  };

  const availableSubcategories = getSubcategoriesForProductFor(productState.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden z-10 max-h-[92vh] flex flex-col">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B8F63]/20 border border-[#0B8F63]/40 flex items-center justify-center text-[#0B8F63]">
              <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-heading font-extrabold text-lg sm:text-xl text-white">
                  {isCreating ? 'Quick Add Product' : `Edit: "${productState.name}"`}
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Fast Entry Mode
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Technical IDs, SKU, and SEO metadata are generated automatically in the background.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLivePreview(true)}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm"
              title="Preview product as customer sees it"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Preview</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DRAFT RESTORE BANNER */}
        {hasDraft && isCreating && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-900 shrink-0">
            <div className="flex items-center gap-2 font-medium">
              <Zap className="w-4 h-4 text-amber-600 animate-bounce" />
              <span>An auto-saved product draft was found from your last session.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="px-2.5 py-1 bg-amber-600 text-white font-extrabold text-[11px] rounded-lg shadow-sm hover:bg-amber-700 transition-colors"
              >
                Restore Draft
              </button>
              <button
                type="button"
                onClick={handleClearDraft}
                className="px-2 py-1 text-neutral-500 hover:text-neutral-800 text-[11px] font-semibold"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* SINGLE CLEAN SCROLLABLE FORM BODY */}
        <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
          
          {/* SECTION 1: PRODUCT IMAGES */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="font-extrabold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0B8F63]" />
                1. Product Images ({productState.images?.length || 0})
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 font-extrabold px-2 py-0.5 rounded-md border border-emerald-200">
                Auto-Optimized & Enhanced
              </span>
            </div>

            <div className="w-full">
              <AdminImageSelector
                value={imageInputUrl}
                onChange={(url) => {
                  setImageInputUrl(url);
                }}
                label="Add Image to Product Gallery"
                description="Upload a photo, capture via camera, paste direct HTTPS link, generate with AI, or use presets."
              />

              {imageInputUrl && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!imageInputUrl.trim()) return;
                      setProductState((prev) => ({
                        ...prev,
                        images: [...(prev.images || []), imageInputUrl.trim()],
                      }));
                      setImageInputUrl('');
                    }}
                    className="w-full sm:w-auto bg-[#0B8F63] text-white font-extrabold text-xs px-6 py-3 rounded-xl hover:bg-[#086F4C] transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Selected Image to Product Gallery</span>
                  </button>
                </div>
              )}
            </div>

            {isOptimizingImage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-[#0B8F63] animate-spin" />
                <span>Processing and auto-enhancing image quality...</span>
              </div>
            )}

            {/* Thumbnail Preview List */}
            {(!productState.images || productState.images.length === 0) ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-medium flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  No image uploaded yet. A clean <strong>"Real Photo Coming Soon"</strong> placeholder will be rendered on the website.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
                {productState.images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 group shadow-xs"
                  >
                    <img src={imgUrl} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProductState((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== idx),
                          }));
                        }}
                        className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {idx === 0 ? (
                      <span className="absolute bottom-1 left-1 bg-[#0B8F63] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow">
                        Cover
                      </span>
                    ) : (
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] font-bold px-1 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: BASIC PRODUCT INFORMATION */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs space-y-4">
            <span className="font-extrabold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-neutral-100">
              <FileText className="w-4 h-4 text-[#0B8F63]" />
              2. Basic Product Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-extrabold text-neutral-800 block mb-1">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marudhar AirGlide Knit Running Shoes"
                  value={productState.name}
                  onChange={(e) => setProductState({ ...productState, name: e.target.value })}
                  className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#0B8F63] font-bold text-neutral-900 text-xs"
                />
              </div>

              <div>
                <label className="font-extrabold text-neutral-800 block mb-1">Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Marudhar Fashion, Nike, Sparx"
                  value={productState.brand}
                  onChange={(e) => setProductState({ ...productState, brand: e.target.value })}
                  className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#0B8F63] text-xs font-medium"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[10px] text-neutral-400 font-bold self-center mr-1">Quick:</span>
                  {POPULAR_BRANDS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setProductState({ ...productState, brand: b })}
                      className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded-md text-[10px] font-bold text-neutral-600 transition-colors"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PRODUCT FOR & SUBCATEGORY SELECTION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
              {/* Product For Segment */}
              <div>
                <label className="font-extrabold text-neutral-900 block mb-2">
                  Product For (Target Segment) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRODUCT_FOR_OPTIONS.map((opt) => {
                    const isSelected = productState.category === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectProductFor(opt.value)}
                        className={`py-2.5 px-2 rounded-xl border-2 font-extrabold text-xs transition-all text-center ${
                          isSelected
                            ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-sm'
                            : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Product Type / Subcategory */}
              <div>
                <label className="font-extrabold text-neutral-900 block mb-2">
                  Product Type ({productState.category.toUpperCase()}) <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-neutral-50 rounded-xl border border-neutral-200">
                  {availableSubcategories.all.map((sub) => {
                    const isSel = productState.subcategory === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => handleSelectSubcategory(sub)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          isSel
                            ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-xs'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: PRICING, DISCOUNT & STATUS */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs space-y-3">
            <span className="font-extrabold text-neutral-900 text-xs uppercase tracking-wider flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#0B8F63]" />
                3. Pricing & Product Status
              </span>
              {productState.discountPercent > 0 && (
                <span className="bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                  {productState.discountPercent}% OFF Discount
                </span>
              )}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-extrabold text-neutral-800 block mb-1">
                  Selling Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 1299"
                  value={productState.price || ''}
                  onChange={(e) => handlePriceChange(Number(e.target.value), productState.originalPrice)}
                  className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#0B8F63] font-extrabold text-sm text-[#0B8F63]"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Original Price / MRP (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 2499"
                  value={productState.originalPrice || ''}
                  onChange={(e) => handlePriceChange(productState.price, Number(e.target.value))}
                  className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#0B8F63] text-neutral-600 font-medium"
                />
              </div>

              <div>
                <label className="font-extrabold text-neutral-800 block mb-1">Product Status</label>
                <select
                  value={productState.status || (productState.inStock ? 'active' : 'out_of_stock')}
                  onChange={(e) => {
                    const stVal = e.target.value as 'active' | 'hidden' | 'out_of_stock';
                    setProductState({
                      ...productState,
                      status: stVal,
                      inStock: stVal === 'active',
                    });
                  }}
                  className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#0B8F63] font-extrabold text-xs text-neutral-900"
                >
                  <option value="active">🟢 Active (Published in Store)</option>
                  <option value="out_of_stock">🔴 Out of Stock</option>
                  <option value="hidden">👁️ Hidden (Draft / Private)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: AVAILABLE SIZES & STOCK MATRIX */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-neutral-100">
              <span className="font-extrabold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#0B8F63]" />
                4. Available Sizes & Stock Quantity
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleBulkSelectAllSizes}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-bold text-[10px] transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkSetAllInStock(10)}
                  className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg font-extrabold text-[10px] transition-colors"
                >
                  Preset 10 Pcs All
                </button>
                <button
                  type="button"
                  onClick={handleBulkDeselectAllSizes}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[10px] transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {standardSizeOptions.map((szStr) => {
                const stockObj = currentSizeStocks.find((s) => s.size === szStr) || {
                  size: szStr,
                  isAvailable: true,
                  inStock: true,
                  stockQuantity: 10,
                };

                return (
                  <div
                    key={szStr}
                    className={`p-2.5 rounded-xl border transition-all ${
                      stockObj.isAvailable
                        ? 'bg-neutral-50 border-neutral-200'
                        : 'bg-neutral-100/50 border-neutral-200/60 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 cursor-pointer font-extrabold text-xs text-neutral-900">
                        <input
                          type="checkbox"
                          checked={stockObj.isAvailable}
                          onChange={() => handleToggleSizeAvailable(szStr)}
                          className="w-3.5 h-3.5 rounded text-[#0B8F63] focus:ring-[#0B8F63]"
                        />
                        <span>
                          {currentSizeType === 'clothing_waist' ? `W${szStr}"` : `Size ${szStr}`}
                        </span>
                      </label>

                      {stockObj.isAvailable && (
                        <input
                          type="number"
                          min={0}
                          value={stockObj.stockQuantity}
                          onChange={(e) => handleSizeQuantityChange(szStr, Number(e.target.value))}
                          className="w-14 bg-white border border-neutral-200 rounded-lg p-1 text-center font-bold text-xs outline-none focus:ring-2 focus:ring-[#0B8F63]"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 5: AVAILABLE COLOURS */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs space-y-3">
            <span className="font-extrabold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-neutral-100">
              <Palette className="w-4 h-4 text-[#0B8F63]" />
              5. Available Colours ({productState.colors.length})
            </span>

            {/* Selected Active Color Tags */}
            <div className="flex flex-wrap gap-2 min-h-[36px] bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
              {productState.colors.length === 0 ? (
                <span className="text-neutral-400 italic text-xs self-center">No colors added yet. Click quick presets below.</span>
              ) : (
                productState.colors.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-neutral-200 shadow-2xs"
                  >
                    <span className="w-3 h-3 rounded-full border border-neutral-300" style={{ backgroundColor: c.hex }} />
                    <span className="font-bold text-neutral-800 text-xs">{c.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(c.name)}
                      className="text-neutral-400 hover:text-rose-600 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Quick Color Presets */}
            <div>
              <span className="font-extrabold text-[11px] text-neutral-700 block mb-1.5">Quick Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLOR_PALETTE.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleAddPresetColor(preset)}
                    className="flex items-center gap-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                  >
                    <span className="w-2.5 h-2.5 rounded-full border border-neutral-300" style={{ backgroundColor: preset.hex }} />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Adder */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Custom Color Name"
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl p-2 text-xs outline-none focus:ring-2 focus:ring-[#0B8F63]"
              />
              <input
                type="color"
                value={customColorHex}
                onChange={(e) => setCustomColorHex(e.target.value)}
                className="w-9 h-9 p-0.5 rounded-xl border border-neutral-200 cursor-pointer bg-white"
              />
              <button
                type="button"
                onClick={handleAddCustomColor}
                className="bg-[#0B8F63] text-white font-extrabold text-xs px-3 py-2 rounded-xl hover:bg-[#086F4C] transition-colors"
              >
                Add Color
              </button>
            </div>
          </div>

          {/* SECTION 6: PRODUCT DESCRIPTION */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs space-y-2">
            <span className="font-extrabold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-2 pb-1">
              <FileText className="w-4 h-4 text-[#0B8F63]" />
              6. Product Description
            </span>
            <textarea
              rows={3}
              placeholder="Enter key details, comfort specs, upper material, cushioning technology..."
              value={productState.description}
              onChange={(e) => setProductState({ ...productState, description: e.target.value })}
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#0B8F63] text-xs leading-relaxed"
            />
          </div>

          {/* SECTION 7: STORE PROMOTION FLAGS & BADGES */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs space-y-3">
            <span className="font-extrabold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-neutral-100">
              <Sparkles className="w-4 h-4 text-[#0B8F63]" />
              7. Store Badges & Highlight Tags
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Best Seller */}
              <button
                type="button"
                onClick={() => setProductState({ ...productState, isBestSeller: !productState.isBestSeller })}
                className={`p-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-between ${
                  productState.isBestSeller
                    ? 'bg-amber-500/10 border-amber-500 text-amber-900 shadow-xs'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Flame className={`w-4 h-4 ${productState.isBestSeller ? 'text-amber-600 fill-amber-600' : 'text-neutral-400'}`} />
                  Best Seller
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${productState.isBestSeller ? 'bg-amber-500 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                  {productState.isBestSeller ? 'YES' : 'NO'}
                </span>
              </button>

              {/* New Arrival */}
              <button
                type="button"
                onClick={() => setProductState({ ...productState, isNewArrival: !productState.isNewArrival })}
                className={`p-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-between ${
                  productState.isNewArrival
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 shadow-xs'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className={`w-4 h-4 ${productState.isNewArrival ? 'text-emerald-600 fill-emerald-600' : 'text-neutral-400'}`} />
                  New Arrival
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${productState.isNewArrival ? 'bg-[#0B8F63] text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                  {productState.isNewArrival ? 'YES' : 'NO'}
                </span>
              </button>

              {/* Featured Product */}
              <button
                type="button"
                onClick={() => setProductState({ ...productState, isFeatured: !productState.isFeatured })}
                className={`p-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-between ${
                  productState.isFeatured
                    ? 'bg-purple-500/10 border-purple-500 text-purple-900 shadow-xs'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Star className={`w-4 h-4 ${productState.isFeatured ? 'text-purple-600 fill-purple-600' : 'text-neutral-400'}`} />
                  Featured
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${productState.isFeatured ? 'bg-purple-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                  {productState.isFeatured ? 'YES' : 'NO'}
                </span>
              </button>

              {/* Trending Product */}
              <button
                type="button"
                onClick={() => setProductState({ ...productState, isTrending: !productState.isTrending })}
                className={`p-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-between ${
                  productState.isTrending
                    ? 'bg-blue-500/10 border-blue-500 text-blue-900 shadow-xs'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <TrendingUp className={`w-4 h-4 ${productState.isTrending ? 'text-blue-600' : 'text-neutral-400'}`} />
                  Trending
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${productState.isTrending ? 'bg-blue-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                  {productState.isTrending ? 'YES' : 'NO'}
                </span>
              </button>
            </div>
          </div>

        </form>

        {/* FOOTER ACTION BAR */}
        <div className="bg-neutral-50 border-t border-neutral-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-neutral-500">Required:</span>
            <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${isImagesValid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {isImagesValid ? '✓ Image' : '✗ Image Needed'}
            </span>
            <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${isNameValid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {isNameValid ? '✓ Name' : '✗ Name Needed'}
            </span>
            <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${isProductForValid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {isProductForValid ? '✓ Segment' : '✗ Segment Needed'}
            </span>
            <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${isSubcategoryValid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {isSubcategoryValid ? '✓ Type' : '✗ Type Needed'}
            </span>
            <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${isPriceValid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {isPriceValid ? '✓ Price' : '✗ Price Needed'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 font-bold text-neutral-700 hover:bg-neutral-100 transition-colors text-xs"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmitForm}
              disabled={!isFormValid}
              className={`px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-2 ${
                isFormValid
                  ? 'bg-[#0B8F63] hover:bg-[#086F4C] text-white cursor-pointer hover:scale-105'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isCreating ? 'Save Product' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIVE CUSTOMER PREVIEW MODAL OVERLAY */}
      {showLivePreview && (
        <QuickViewModal
          product={productState}
          onClose={() => setShowLivePreview(false)}
          onAddToCart={() => {}}
        />
      )}
    </div>
  );
};
