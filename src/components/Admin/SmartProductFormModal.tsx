import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Trash2,
  AlertTriangle,
  Check,
  Copy,
  Eye,
  Share2,
  RefreshCw,
  Plus,
  Zap,
  ShoppingBag,
  Layers,
  Palette,
  Ruler,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Tag,
  CheckSquare,
  Square,
  FileText,
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

interface SmartProductFormModalProps {
  product: Product;
  isCreating: boolean;
  onSave: (product: Product) => void;
  onClose: () => void;
  onDuplicate?: (product: Product) => void;
}

const DRAFT_STORAGE_KEY = 'mfp_admin_product_draft_v1';

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
  const [activeTab, setActiveTab] = useState<'details' | 'category' | 'sizes' | 'colors' | 'gallery'>('details');

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

  // Persist draft on edit
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
      console.error('Failed to parse draft');
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

  // Toggle Size Availability (Enable / Disable)
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

  // Toggle Size Stock Status (In Stock vs Out of Stock)
  const handleToggleSizeInStock = (sizeStr: string) => {
    const updated = currentSizeStocks.map((st) => {
      if (st.size === sizeStr) {
        const nextInStock = !st.inStock;
        return {
          ...st,
          inStock: nextInStock,
          stockQuantity: nextInStock ? (st.stockQuantity > 0 ? st.stockQuantity : 10) : 0,
        };
      }
      return st;
    });

    setProductState({ ...productState, sizeStocks: updated });
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

  // SMART VALIDATION CHECKS
  const isNameValid = !!productState.name.trim();
  const isSkuValid = !!productState.sku?.trim();
  const isSlugValid = !!productState.slug?.trim();
  const isPriceValid = productState.price > 0;
  const isHasImage = productState.images && productState.images.length > 0;
  const isHasSizes = currentSizeStocks.some((s) => s.isAvailable);

  const isFormComplete = isNameValid && isSkuValid && isSlugValid && isPriceValid && isHasSizes;

  // Auto-calculate discount percentage whenever prices change
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

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete) return;

    // Clear draft upon successful save
    if (isCreating) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }

    onSave(productState);
  };

  const availableSubcategories = getSubcategoriesForProductFor(productState.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden z-10 max-h-[92vh] flex flex-col">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B8F63]/20 border border-[#0B8F63]/40 flex items-center justify-center text-[#0B8F63]">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-heading font-extrabold text-lg sm:text-xl text-white">
                  {isCreating ? 'Smart Add Product Manager' : `Edit Product: "${productState.name}"`}
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Dynamic Category & Stock Engine
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Automatically configures size matrices, stock parameters, and color variations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLivePreview(true)}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all"
              title="Preview product as customer sees it"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Preview</span>
            </button>

            {onDuplicate && !isCreating && (
              <button
                type="button"
                onClick={() => onDuplicate(productState)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Duplicate product"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Duplicate</span>
              </button>
            )}

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

        {/* NAVIGATION TABS */}
        <div className="bg-neutral-50 border-b border-neutral-200/80 px-4 pt-2 flex items-center gap-1 overflow-x-auto shrink-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-3.5 py-2.5 text-xs font-extrabold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'bg-white text-[#0B8F63] border-t-2 border-[#0B8F63] shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Basic & Pricing</span>
            {isNameValid && isPriceValid && <Check className="w-3 h-3 text-emerald-600 font-extrabold" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('category')}
            className={`px-3.5 py-2.5 text-xs font-extrabold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'category'
                ? 'bg-white text-[#0B8F63] border-t-2 border-[#0B8F63] shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Product For & Type</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-mono uppercase">
              {productState.category}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sizes')}
            className={`px-3.5 py-2.5 text-xs font-extrabold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'sizes'
                ? 'bg-white text-[#0B8F63] border-t-2 border-[#0B8F63] shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>3. Dynamic Size Matrix</span>
            <span className="bg-neutral-200 text-neutral-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
              {currentSizeStocks.filter((s) => s.isAvailable).length} Active
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`px-3.5 py-2.5 text-xs font-extrabold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'colors'
                ? 'bg-white text-[#0B8F63] border-t-2 border-[#0B8F63] shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>4. Color Palette</span>
            <span className="bg-neutral-200 text-neutral-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
              {productState.colors.length} Colors
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`px-3.5 py-2.5 text-xs font-extrabold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'gallery'
                ? 'bg-white text-[#0B8F63] border-t-2 border-[#0B8F63] shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>5. Image Gallery</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${isHasImage ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {productState.images?.length || 0}
            </span>
          </button>
        </div>

        {/* FORM CONTENT BODY */}
        <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: BASIC & PRICING */}
          {activeTab === 'details' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-neutral-800 block mb-1">
                    Product Title / Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marudhar AirGlide Knit Running Shoes"
                    value={productState.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      const autoSlug = newName
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');
                      setProductState({
                        ...productState,
                        name: newName,
                        slug: productState.slug || autoSlug,
                        metaTitle: productState.metaTitle || `${newName} | Marudhar Fashion Point`,
                        metaDescription: productState.metaDescription || `Buy ${newName} at lowest price with fast shipping on Marudhar Fashion Point.`,
                      });
                    }}
                    className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#0B8F63] font-medium text-neutral-900"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-neutral-800 block mb-1">Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Marudhar Fashion, ONE 8, AirGlide"
                    value={productState.brand}
                    onChange={(e) => setProductState({ ...productState, brand: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#0B8F63]"
                  />
                </div>
              </div>

              {/* SKU & PUBLIC URL SLUG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80">
                <div>
                  <label className="font-extrabold text-emerald-950 block mb-1 flex items-center justify-between">
                    <span>Unique Item SKU <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-emerald-700 font-bold">Auto-formatted</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MFP-M01-RUN"
                    value={productState.sku || ''}
                    onChange={(e) =>
                      setProductState({
                        ...productState,
                        sku: e.target.value.toUpperCase().trim(),
                      })
                    }
                    className="w-full bg-white border border-emerald-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#0B8F63] font-mono text-xs font-bold text-emerald-900"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-emerald-950 block mb-1 flex items-center justify-between">
                    <span>Public URL Slug <span className="text-rose-500">*</span></span>
                    <button
                      type="button"
                      onClick={() => {
                        const generated = (productState.name || 'product')
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)/g, '');
                        setProductState({ ...productState, slug: generated });
                      }}
                      className="text-[10px] font-bold text-[#0B8F63] hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      Auto-generate
                    </button>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. marudhar-airglide-running-shoes"
                    value={productState.slug || ''}
                    onChange={(e) =>
                      setProductState({
                        ...productState,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                      })
                    }
                    className="w-full bg-white border border-emerald-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#0B8F63] font-mono text-xs text-neutral-800"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block truncate">
                    URL: <code className="bg-white px-1 py-0.5 rounded text-emerald-800 border border-emerald-200">/product/{productState.slug || 'slug'}</code>
                  </span>
                </div>
              </div>

              {/* PRICING & DISCOUNT CALCULATOR */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-neutral-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#0B8F63]" />
                    Pricing & Discount Calculator
                  </span>
                  {productState.discountPercent > 0 && (
                    <span className="bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">
                      Customer Savings: {productState.discountPercent}% OFF
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Selling Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={productState.price}
                      onChange={(e) => handlePriceChange(Number(e.target.value), productState.originalPrice)}
                      className="w-full bg-white border border-neutral-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#0B8F63] font-extrabold text-sm text-[#0B8F63]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Original MRP Price (₹)</label>
                    <input
                      type="number"
                      value={productState.originalPrice}
                      onChange={(e) => handlePriceChange(productState.price, Number(e.target.value))}
                      className="w-full bg-white border border-neutral-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#0B8F63] text-neutral-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Stock Status</label>
                    <button
                      type="button"
                      onClick={() => setProductState({ ...productState, inStock: !productState.inStock })}
                      className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs border transition-all flex items-center justify-center gap-2 ${
                        productState.inStock
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {productState.inStock ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>In Stock (Published)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Out of Stock</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION & MATERIAL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-extrabold text-neutral-800 block mb-1">Product Description</label>
                  <textarea
                    rows={3}
                    placeholder="Enter detailed description, features, comfort details..."
                    value={productState.description}
                    onChange={(e) => setProductState({ ...productState, description: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#0B8F63] text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-neutral-800 block mb-1">Material / Upper Finish</label>
                  <input
                    type="text"
                    placeholder="e.g. Breathable Flyknit, Genuine Leather, Mesh"
                    value={productState.material || ''}
                    onChange={(e) => setProductState({ ...productState, material: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#0B8F63]"
                  />
                </div>
              </div>

              {/* WHATSAPP & OPEN GRAPH PREVIEW */}
              <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-2">
                <span className="font-extrabold text-neutral-800 text-xs flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-[#0B8F63]" />
                  WhatsApp & Social Link Preview Metadata
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Meta Title for WhatsApp preview"
                    value={productState.metaTitle || ''}
                    onChange={(e) => setProductState({ ...productState, metaTitle: e.target.value })}
                    className="bg-white border border-neutral-200 rounded-xl p-2 text-xs outline-none focus:ring-2 focus:ring-[#0B8F63]"
                  />
                  <input
                    type="text"
                    placeholder="Meta Description for WhatsApp subtext"
                    value={productState.metaDescription || ''}
                    onChange={(e) => setProductState({ ...productState, metaDescription: e.target.value })}
                    className="bg-white border border-neutral-200 rounded-xl p-2 text-xs outline-none focus:ring-2 focus:ring-[#0B8F63]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT FOR & PRODUCT TYPE */}
          {activeTab === 'category' && (
            <div className="space-y-6 text-xs">
              {/* STEP 1: PRODUCT FOR (MANDATORY FIELD) */}
              <div>
                <label className="font-extrabold text-sm text-neutral-900 block mb-2 flex items-center justify-between">
                  <span>STEP 1 — Product For (Mandatory Target Segment) <span className="text-rose-500">*</span></span>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Selected: {productState.category.toUpperCase()}
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PRODUCT_FOR_OPTIONS.map((opt) => {
                    const isSelected = productState.category === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectProductFor(opt.value)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-1.5 relative ${
                          isSelected
                            ? 'bg-[#0B8F63]/10 border-[#0B8F63] ring-2 ring-[#0B8F63]/20 shadow-md'
                            : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 bg-[#0B8F63] text-white p-1 rounded-full">
                            <Check className="w-3 h-3 font-extrabold" />
                          </span>
                        )}
                        <span className="font-serif-heading font-extrabold text-lg text-neutral-900">
                          {opt.label}
                        </span>
                        <span className="text-[11px] text-neutral-500 font-medium">
                          {opt.value === 'men' && 'Footwear & Men\'s Apparel'}
                          {opt.value === 'women' && 'Footwear Collection ONLY'}
                          {opt.value === 'kids' && 'Junior & School Footwear'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: PRODUCT TYPE SUBCATEGORIES */}
              <div className="pt-2 border-t border-neutral-200">
                <label className="font-extrabold text-sm text-neutral-900 block mb-2">
                  STEP 2 — Product Type (Subcategory for {productState.category.toUpperCase()}) <span className="text-rose-500">*</span>
                </label>

                {/* MEN FOOTWEAR VS CLOTHING */}
                {productState.category === 'men' && (
                  <div className="space-y-4">
                    {/* Footwear Section */}
                    <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
                      <span className="font-bold text-neutral-800 text-xs block mb-2 flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#0B8F63]" />
                        Men's Footwear Options ({availableSubcategories.footwear.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {availableSubcategories.footwear.map((sub) => {
                          const isSel = productState.subcategory === sub;
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => handleSelectSubcategory(sub)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                                isSel
                                  ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-md ring-2 ring-[#0B8F63]/20'
                                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                              }`}
                            >
                              {sub}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Clothing Section */}
                    <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
                      <span className="font-bold text-neutral-800 text-xs block mb-2 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#0B8F63]" />
                        Men's Clothing Options ({availableSubcategories.clothing.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {availableSubcategories.clothing.map((sub) => {
                          const isSel = productState.subcategory === sub;
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => handleSelectSubcategory(sub)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                                isSel
                                  ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-md ring-2 ring-[#0B8F63]/20'
                                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                              }`}
                            >
                              {sub}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* WOMEN FOOTWEAR ONLY */}
                {productState.category === 'women' && (
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Women's Footwear Options (Filtered as per Store Policy):</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableSubcategories.footwear.map((sub) => {
                        const isSel = productState.subcategory === sub;
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => handleSelectSubcategory(sub)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                              isSel
                                ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-md ring-2 ring-[#0B8F63]/20'
                                : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-400'
                            }`}
                          >
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-emerald-800 italic">
                      Note: Unrequested categories like Heels, Dresses, Kurtis, Suits, and Leggings are hidden.
                    </p>
                  </div>
                )}

                {/* KIDS FOOTWEAR ONLY */}
                {productState.category === 'kids' && (
                  <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2 text-amber-950 font-extrabold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      <span>Kids' Footwear Options:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableSubcategories.footwear.map((sub) => {
                        const isSel = productState.subcategory === sub;
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => handleSelectSubcategory(sub)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                              isSel
                                ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-md ring-2 ring-[#0B8F63]/20'
                                : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-400'
                            }`}
                          >
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC SIZE MATRIX & STOCK PER SIZE */}
          {activeTab === 'sizes' && (
            <div className="space-y-4 text-xs">
              <div className="bg-neutral-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <span className="text-emerald-400 font-extrabold text-xs uppercase tracking-wider block">
                    Active Matrix: {productState.category.toUpperCase()} • {productState.subcategory}
                  </span>
                  <h4 className="font-bold text-sm text-white mt-0.5">
                    {currentSizeType === 'footwear' && `Footwear Standard Sizes (${standardSizeOptions.join(', ')})`}
                    {currentSizeType === 'clothing_alpha' && `Clothing Sizes (S, M, L, XL, XXL, XXXL)`}
                    {currentSizeType === 'clothing_waist' && `Men's Jeans Waist Sizes (28 to 44)`}
                  </h4>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleBulkSelectAllSizes}
                    className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-bold text-[11px] border border-neutral-700"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkSetAllInStock(10)}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-extrabold text-[11px] shadow-sm"
                  >
                    Preset 10 Pcs All
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkDeselectAllSizes}
                    className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-rose-300 rounded-lg font-bold text-[11px] border border-neutral-700"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* SIZE MATRIX CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
                      className={`p-3.5 rounded-2xl border transition-all ${
                        stockObj.isAvailable
                          ? stockObj.inStock && stockObj.stockQuantity > 0
                            ? 'bg-white border-neutral-200 shadow-sm'
                            : 'bg-rose-50/50 border-rose-200'
                          : 'bg-neutral-100/60 border-neutral-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                        <label className="flex items-center gap-2 cursor-pointer font-extrabold text-sm text-neutral-900">
                          <input
                            type="checkbox"
                            checked={stockObj.isAvailable}
                            onChange={() => handleToggleSizeAvailable(szStr)}
                            className="w-4 h-4 rounded text-[#0B8F63] focus:ring-[#0B8F63]"
                          />
                          <span>
                            {currentSizeType === 'clothing_waist' ? `Waist ${szStr}"` : `Size ${szStr}`}
                          </span>
                        </label>

                        {stockObj.isAvailable && (
                          <button
                            type="button"
                            onClick={() => handleToggleSizeInStock(szStr)}
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              stockObj.inStock && stockObj.stockQuantity > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {stockObj.inStock && stockObj.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                          </button>
                        )}
                      </div>

                      {stockObj.isAvailable ? (
                        <div className="pt-2 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-neutral-500 font-bold">Qty Available:</span>
                          <input
                            type="number"
                            min={0}
                            value={stockObj.stockQuantity}
                            onChange={(e) => handleSizeQuantityChange(szStr, Number(e.target.value))}
                            className="w-20 bg-[#F7F7F7] border border-neutral-200 rounded-lg p-1.5 font-bold text-center text-xs outline-none focus:ring-2 focus:ring-[#0B8F63]"
                          />
                        </div>
                      ) : (
                        <p className="text-[10px] text-neutral-400 italic pt-2">Size Disabled for this Product</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: COLOR PALETTE MANAGEMENT */}
          {activeTab === 'colors' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-extrabold text-sm text-neutral-900 block mb-1">
                  Active Product Colors ({productState.colors.length})
                </label>
                <p className="text-xs text-neutral-500 mb-3">
                  Click quick preset color chips below or add a custom color name & hex.
                </p>

                {/* CURRENT SELECTED COLORS */}
                <div className="flex flex-wrap gap-2.5 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                  {productState.colors.length === 0 ? (
                    <span className="text-neutral-400 italic text-xs">No color selected yet. Click a color chip below to add.</span>
                  ) : (
                    productState.colors.map((c, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shadow-sm"
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-neutral-300 shadow-inner"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="font-bold text-neutral-800 text-xs">{c.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(c.name)}
                          className="text-neutral-400 hover:text-rose-600 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* PRESET PALETTE CHIPS */}
              <div className="pt-2">
                <label className="font-extrabold text-xs text-neutral-800 block mb-2">
                  Quick Color Presets:
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLOR_PALETTE.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleAddPresetColor(preset)}
                      className="flex items-center gap-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-neutral-300" style={{ backgroundColor: preset.hex }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CUSTOM COLOR ADDITION */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 space-y-2 pt-3">
                <span className="font-extrabold text-emerald-950 text-xs block">Add Custom Color Variation:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Color Name (e.g. Royal Burgundy, Tan Leather)"
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    className="flex-1 bg-white border border-emerald-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#0B8F63]"
                  />
                  <input
                    type="color"
                    value={customColorHex}
                    onChange={(e) => setCustomColorHex(e.target.value)}
                    className="w-10 h-10 p-0.5 rounded-xl border border-emerald-200 cursor-pointer bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="bg-[#0B8F63] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-[#086F4C] transition-colors"
                  >
                    Add Color
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: IMAGE GALLERY & OPTIMIZATION */}
          {activeTab === 'gallery' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-neutral-800 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0B8F63]" />
                  Product Image Uploads ({productState.images?.length || 0})
                </label>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 font-extrabold px-2 py-0.5 rounded-md border border-emerald-200">
                  Canvas Auto-Contrast & Sharpness Enhancement
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* DRAG & DROP / FILE UPLOAD */}
                <label className="border-2 border-dashed border-[#0B8F63]/40 hover:border-[#0B8F63] bg-[#0B8F63]/5 hover:bg-[#0B8F63]/10 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
                  <Upload className="w-7 h-7 text-[#0B8F63] mb-1 group-hover:scale-110 transition-transform" />
                  <span className="font-extrabold text-[#0B8F63] text-xs">Upload Real Photos / Take Picture</span>
                  <span className="text-[10px] text-neutral-500 mt-1">JPEG, PNG, WEBP (Supports Bulk Upload)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      if (!e.target.files || e.target.files.length === 0) return;
                      setIsOptimizingImage(true);
                      const files = Array.from(e.target.files) as File[];
                      for (const file of files) {
                        const validation = validateFileUpload(file);
                        if (!validation.isValid) {
                          alert(validation.error || 'Invalid file format');
                          continue;
                        }
                        try {
                          const optimizedUrl = await optimizeImageFile(file, { enhance: true });
                          setProductState((prev) => ({
                            ...prev,
                            images: [...(prev.images || []), optimizedUrl],
                          }));
                        } catch (err) {
                          console.error('Error optimizing image:', err);
                        }
                      }
                      setIsOptimizingImage(false);
                      e.target.value = '';
                    }}
                  />
                </label>

                {/* DIRECT URL INPUT */}
                <div className="bg-[#F7F7F7] border border-neutral-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-neutral-800 text-xs mb-1 block">Add via Image Web URL</span>
                    <p className="text-[10px] text-neutral-500 mb-2">Provide direct image link for real shop product.</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={imageInputUrl}
                      onChange={(e) => setImageInputUrl(e.target.value)}
                      className="flex-1 bg-white border border-neutral-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#0B8F63]"
                    />
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
                      className="bg-[#0B8F63] text-white font-extrabold text-xs px-3.5 py-2 rounded-xl hover:bg-[#086F4C] transition-colors"
                    >
                      Add URL
                    </button>
                  </div>
                </div>
              </div>

              {isOptimizingImage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 text-[#0B8F63] animate-spin" />
                  <span>Processing & Canvas auto-enhancing uploaded product photo...</span>
                </div>
              )}

              {/* GALLERY THUMBNAILS GRID */}
              <div>
                {(!productState.images || productState.images.length === 0) ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-medium flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      No product image uploaded yet. A clean <strong>"Real Image Coming Soon"</strong> placeholder will be rendered on the website to ensure customers are never shown fake products.
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {productState.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 group shadow-sm"
                      >
                        <img
                          src={imgUrl}
                          alt={`Product ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1">
                          <button
                            type="button"
                            onClick={() => {
                              setProductState((prev) => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== idx),
                              }));
                            }}
                            className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                            title="Delete Image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {idx === 0 ? (
                          <span className="absolute bottom-1.5 left-1.5 bg-[#0B8F63] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow">
                            Primary Cover
                          </span>
                        ) : (
                          <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                            #{idx + 1}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </form>

        {/* FOOTER ACTION BAR & VALIDATION STATUS */}
        <div className="bg-neutral-50 border-t border-neutral-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold text-neutral-600">Completeness:</span>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${isNameValid ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-500'}`}>
                Title
              </span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${isSkuValid ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-500'}`}>
                SKU
              </span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${isPriceValid ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-500'}`}>
                Price
              </span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${isHasSizes ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-500'}`}>
                Sizes
              </span>
            </div>
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
              disabled={!isFormComplete}
              className={`px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-2 ${
                isFormComplete
                  ? 'bg-[#0B8F63] hover:bg-[#086F4C] text-white cursor-pointer hover:scale-105'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isCreating ? 'Publish Product' : 'Save Changes'}</span>
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
