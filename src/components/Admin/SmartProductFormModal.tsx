import React, { useState, useEffect } from 'react';
import { getPlatformConfig } from '../../lib/platformConfig';
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
import { Product, SizeStock, ProductColor, ProductVariant } from '../../types';
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
import { useStore } from '../../context/StoreContext';

interface SmartProductFormModalProps {
  product: Product;
  isCreating: boolean;
  onSave: (product: Product) => void;
  onClose: () => void;
  onDuplicate?: (product: Product) => void;
}

const DRAFT_STORAGE_KEY = 'nwd_admin_product_draft_v2';

const POPULAR_BRANDS = [
  'House Brand',
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
  const { showToast } = useStore();
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

  // --- ENTERPRISE VARIANT MATRIX STATE ---
  const [variantTab, setVariantTab] = useState<'galleries' | 'matrix' | 'ai'>('galleries');
  const [selectedColorForGallery, setSelectedColorForGallery] = useState<string>('');
  const [bulkPriceInput, setBulkPriceInput] = useState<string>('');
  const [bulkOrigPriceInput, setBulkOrigPriceInput] = useState<string>('');
  const [bulkStockInput, setBulkStockInput] = useState<string>('');
  const [bulkLowStockLimit, setBulkLowStockLimit] = useState<string>('');
  const [bulkStatusInput, setBulkStatusInput] = useState<'active' | 'hidden'>('active');
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [bulkUrlInput, setBulkUrlInput] = useState<string>('');
  const [colorCopySource, setColorCopySource] = useState<string>('');

  // Helper functions for auto-SKU and auto-barcode
  const generateAutoSKU = (productName: string, color: string, size: string): string => {
    const cleanName = productName.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanColor = color.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanSize = size.padStart(2, '0').toUpperCase().replace(/[^A-Z0-9]/g, '');
    return `${cleanName}-${cleanColor}-${cleanSize}`;
  };

  const generateAutoBarcode = (productId: string, color: string, size: string): string => {
    const cleanId = productId.substring(0, 4).toUpperCase();
    const cleanColor = color.substring(0, 2).toUpperCase();
    const cleanSize = size.replace(/[^0-9]/g, '');
    return `890${cleanId}${cleanColor}${cleanSize}`.padEnd(13, '0').substring(0, 13);
  };

  // Matrix Auto-Regeneration Helper
  const regenerateVariantMatrix = () => {
    const newVariants: ProductVariant[] = [];
    const activeSizes = productState.sizeStocks 
      ? productState.sizeStocks.filter(s => s.isAvailable).map(s => s.size) 
      : productState.sizes;
    
    productState.colors.forEach(col => {
      activeSizes.forEach(sz => {
        const existing = (productState.variants || []).find(
          v => (v.color || '').toLowerCase() === (col.name || '').toLowerCase() && v.size.toString() === sz.toString()
        );
        
        if (existing) {
          newVariants.push({
            ...existing,
            color: col.name,
            colorCode: col.hex,
            size: sz
          });
        } else {
          const varId = `${productState.id || 'prod'}_${col.name.replace(/\s+/g, '')}_${sz}`;
          const autoSku = generateAutoSKU(productState.name || 'NWD', col.name, sz);
          const autoBarcode = generateAutoBarcode(productState.id || '101', col.name, sz);
          
          const siblingImages = (productState.variants || [])
            .find(v => (v.color || '').toLowerCase() === (col.name || '').toLowerCase() && v.images && v.images.length > 0)
            ?.images || [];

          newVariants.push({
            id: varId,
            sku: autoSku,
            barcode: autoBarcode,
            color: col.name,
            colorCode: col.hex,
            size: sz,
            price: productState.price || 999,
            originalPrice: productState.originalPrice || productState.price || 1499,
            discount: productState.discountPercent || 0,
            stock: 10,
            lowStockLimit: 2,
            images: siblingImages.length > 0 ? siblingImages : [...(productState.images || [])],
            status: 'active',
            updatedAt: new Date().toISOString(),
            updatedBy: 'Admin'
          });
        }
      });
    });
    
    setProductState(prev => ({
      ...prev,
      variants: newVariants
    }));
  };

  // Sync Variant Matrix on changes to Colors/Sizes
  useEffect(() => {
    if (productState.colors && productState.colors.length > 0) {
      regenerateVariantMatrix();
    }
  }, [productState.colors, productState.sizes]);

  // Set default gallery color selection
  useEffect(() => {
    if (productState.colors && productState.colors.length > 0 && !selectedColorForGallery) {
      setSelectedColorForGallery(productState.colors[0].name);
    }
  }, [productState.colors, selectedColorForGallery]);

  const updateColorGalleryImages = (colorName: string, newImages: string[], videoUrl?: string, labels?: Record<string, string>) => {
    const updatedVariants = (productState.variants || []).map(v => {
      if ((v.color || '').toLowerCase() === (colorName || '').toLowerCase()) {
        return {
          ...v,
          images: newImages,
          video: videoUrl !== undefined ? videoUrl : v.video,
          imageLabels: labels !== undefined ? labels : (v as any).imageLabels
        };
      }
      return v;
    });

    const allUniqueImages = Array.from(new Set([
      ...(productState.images || []),
      ...newImages
    ])).filter(Boolean) as string[];

    setProductState(prev => ({
      ...prev,
      variants: updatedVariants,
      images: allUniqueImages
    }));
  };

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
      (c) => (c.name || '').toLowerCase() === (colorObj.name || '').toLowerCase()
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

    const cleanName = (productState.name || '').trim();
    const catCode = productState.category.charAt(0).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const subCode = (productState.subcategory || 'GEN')
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, 'X');

    // Auto-generate technical fields in background
    const autoSku = productState.sku && productState.sku.trim().length > 0
      ? productState.sku
      : `NWD-${catCode}${randomSuffix}-${subCode}`;

    const slugBase = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const autoSlug = productState.slug && productState.slug.trim().length > 0
      ? productState.slug
      : `${slugBase}-${Math.floor(100 + Math.random() * 900)}`;

    const autoMetaTitle = `${cleanName} | ${getPlatformConfig().platformDisplayName}`;
    const autoMetaDesc = `Buy ${cleanName} by ${productState.brand || getPlatformConfig().platformDisplayName} at ₹${productState.price}. Fast delivery & cash on delivery.`;

    // Process sizes: if no sizes selected, leave as empty array or keep current
    const activeSizes = productState.sizes || [];

    const finalProduct: Product = {
      ...productState,
      name: cleanName,
      brand: productState.brand ? productState.brand.trim() : '',
      description: productState.description ? productState.description.trim() : '',
      rating: productState.rating && productState.rating > 0 ? productState.rating : 0,
      reviewsCount: productState.reviewsCount && productState.reviewsCount > 0 ? productState.reviewsCount : 0,
      originalPrice: (productState.originalPrice && productState.originalPrice > productState.price)
        ? productState.originalPrice
        : 0,
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
                  placeholder="e.g. AirGlide Knit Running Shoes"
                  value={productState.name}
                  onChange={(e) => setProductState({ ...productState, name: e.target.value })}
                  className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#0B8F63] font-bold text-neutral-900 text-xs"
                />
              </div>

              <div>
                <label className="font-extrabold text-neutral-800 block mb-1">Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Nike, Sparx, Puma"
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

          {/* ENTERPRISE VARIANT MANAGEMENT STUDIO */}
          <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/80 shadow-md space-y-4">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="font-extrabold text-neutral-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Enterprise Variant Management Studio</span>
              </h3>
              <p className="text-[11px] font-medium text-neutral-500 mt-1">
                Configure color-specific image galleries, custom variant prices, stocks, independent SKUs, and barcodes.
              </p>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-neutral-200">
              <button
                type="button"
                onClick={() => setVariantTab('galleries')}
                className={`flex-1 py-2 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                  variantTab === 'galleries'
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                🎥 Color-Wise Galleries ({productState.colors.length})
              </button>
              <button
                type="button"
                onClick={() => setVariantTab('matrix')}
                className={`flex-1 py-2 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                  variantTab === 'matrix'
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                📊 Variant Matrix Table ({(productState.variants || []).length})
              </button>
              <button
                type="button"
                onClick={() => setVariantTab('ai')}
                className={`flex-1 py-2 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                  variantTab === 'ai'
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                🧠 AI Intelligence & Alerts
              </button>
            </div>

            {/* TAB CONTENT: 1. GALLERIES */}
            {variantTab === 'galleries' && (
              <div className="space-y-4">
                {productState.colors.length === 0 ? (
                  <div className="text-center py-6 text-xs text-neutral-500 font-medium">
                    ⚠️ Please add at least one color in Section 5 above to configure media galleries.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Active Color for Media Row */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold uppercase text-neutral-600 tracking-wider block">Select Color Variant Studio:</label>
                      <div className="flex flex-wrap gap-2">
                        {productState.colors.map((c) => (
                          <button
                            type="button"
                            key={c.name}
                            onClick={() => setSelectedColorForGallery(c.name)}
                            className={`px-3 py-1.5 rounded-xl border-2 font-bold text-xs flex items-center gap-1.5 transition-all ${
                              (selectedColorForGallery || '').toLowerCase() === (c.name || '').toLowerCase()
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/15'
                                : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                            }`}
                          >
                            <span className="w-3.5 h-3.5 rounded-full border border-neutral-300" style={{ backgroundColor: c.hex }} />
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Studio Tools & Quick Actions */}
                    <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/80 pb-2">
                        <span className="font-extrabold text-neutral-800 text-xs block">
                          🎨 Media Workspace: <span className="text-emerald-700 font-mono font-black">{selectedColorForGallery || 'Standard'}</span>
                        </span>

                        {/* Copy Option */}
                        <div className="flex items-center gap-1.5">
                          <select
                            value={colorCopySource}
                            onChange={(e) => setColorCopySource(e.target.value)}
                            className="bg-white border border-neutral-200 rounded-lg p-1 text-[11px] font-bold outline-none"
                          >
                            <option value="">Copy Gallery from...</option>
                            {productState.colors
                              .filter(c => (c.name || '').toLowerCase() !== (selectedColorForGallery || '').toLowerCase())
                              .map(c => (
                                <option key={c.name} value={c.name}>{c.name}</option>
                              ))
                            }
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              if (!colorCopySource) return;
                              // Find siblings' images
                              const sourceImages = (productState.variants || [])
                                .find(v => (v.color || '').toLowerCase() === (colorCopySource || '').toLowerCase() && v.images && v.images.length > 0)
                                ?.images || [];
                              if (sourceImages.length > 0) {
                                updateColorGalleryImages(selectedColorForGallery, sourceImages);
                                showToast?.(`Copied ${sourceImages.length} images from ${colorCopySource} successfully!`, 'success');
                              } else {
                                showToast?.(`No images found in source color: ${colorCopySource}`, 'info');
                              }
                            }}
                            className="bg-white hover:bg-neutral-100 text-neutral-800 px-2 py-1 rounded-lg text-[10px] font-extrabold border border-neutral-300 transition-colors"
                          >
                            Clone
                          </button>
                        </div>
                      </div>

                      {/* Bulk URL Import */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Bulk Paste Image URLs (One link per line):</label>
                        <div className="flex gap-2">
                          <textarea
                            rows={2}
                            value={bulkUrlInput}
                            onChange={(e) => setBulkUrlInput(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60"
                            className="flex-1 bg-white border border-neutral-200 rounded-xl p-2 text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const urls = bulkUrlInput
                                .split(/[\n,]/)
                                .map(u => u.trim())
                                .filter(u => u.startsWith('http'));
                              if (urls.length === 0) {
                                showToast?.('Please enter valid HTTP/HTTPS image links.', 'error');
                                return;
                              }
                              const existingImages = (productState.variants || [])
                                .find(v => (v.color || '').toLowerCase() === (selectedColorForGallery || '').toLowerCase())
                                ?.images || [];
                              const merged = [...existingImages, ...urls];
                              updateColorGalleryImages(selectedColorForGallery, merged);
                              setBulkUrlInput('');
                              showToast?.(`Added ${urls.length} images successfully!`, 'success');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 rounded-xl transition-colors self-end h-fit py-3"
                          >
                            Import
                          </button>
                        </div>
                      </div>

                      {/* AI Generator Tool Mock */}
                      <div className="bg-[#0B8F63]/5 p-3 rounded-xl border border-[#0B8F63]/20 flex items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-extrabold text-emerald-950 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-[#0B8F63]" />
                            AI Image Generator Studio
                          </span>
                          <span className="text-[9px] text-emerald-700 font-medium block">
                            Generate authentic premium footwear photos using our local generative canvas.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            // Seed standard clean model placeholders for mockup
                            const demoImages = [
                              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60',
                              'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=60',
                              'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=60',
                            ];
                            const existingImages = (productState.variants || [])
                              .find(v => (v.color || '').toLowerCase() === (selectedColorForGallery || '').toLowerCase())
                              ?.images || [];
                            const merged = [...existingImages, ...demoImages];
                            updateColorGalleryImages(selectedColorForGallery, merged);
                            showToast?.('AI Generated 3 premium model images successfully!', 'success');
                          }}
                          className="bg-emerald-100 hover:bg-emerald-200 text-[#0B8F63] font-black text-[10px] px-3 py-1.5 rounded-lg border border-[#0B8F63]/30 flex items-center gap-1 transition-all"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Generate</span>
                        </button>
                      </div>
                    </div>

                    {/* RENDER ACTIVE COLOR GALLERY LIST */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-extrabold text-neutral-700 block">
                        Gallery Portfolio ({
                          ((productState.variants || []).find(
                            v => (v.color || '').toLowerCase() === (selectedColorForGallery || '').toLowerCase()
                          )?.images || []).length
                        } / 50 Images)
                      </span>

                      {(() => {
                        const activeImages = ((productState.variants || []).find(
                          v => (v.color || '').toLowerCase() === (selectedColorForGallery || '').toLowerCase()
                        )?.images || []);

                        if (activeImages.length === 0) {
                          return (
                            <div className="text-center py-8 rounded-2xl bg-neutral-50 border border-dashed border-neutral-300 text-xs text-neutral-400 font-medium">
                              No images added to this color yet. Use URLs above or generate.
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {activeImages.map((img, index) => {
                              const activeVarObj = (productState.variants || []).find(
                                v => (v.color || '').toLowerCase() === (selectedColorForGallery || '').toLowerCase()
                              );
                              const labels = (activeVarObj as any)?.imageLabels || {};
                              const activeLabel = labels[img] || '';

                              return (
                                <div key={img + index} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 group flex flex-col justify-between p-1.5">
                                  <img src={img} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover z-0" referrerPolicy="no-referrer" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10" />

                                  {/* Pill Badge Tag Label */}
                                  {activeLabel ? (
                                    <span className="z-20 bg-emerald-600 text-white font-extrabold text-[9px] uppercase px-1.5 py-0.5 rounded-full shadow-md w-fit">
                                      {activeLabel}
                                    </span>
                                  ) : <span className="z-20" />}

                                  {/* Action Panels */}
                                  <div className="z-20 flex items-center justify-between w-full mt-auto">
                                    {/* Set Cover Indicator */}
                                    {index === 0 ? (
                                      <span className="bg-amber-500 text-white font-bold text-[8px] uppercase px-1 rounded-sm shadow-xs">
                                        COVER
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const reordered = [...activeImages];
                                          const [removed] = reordered.splice(index, 1);
                                          reordered.unshift(removed);
                                          updateColorGalleryImages(selectedColorForGallery, reordered);
                                        }}
                                        className="bg-black/60 hover:bg-black/80 text-white font-extrabold text-[8px] uppercase px-1 rounded-sm transition-colors"
                                      >
                                        Cover
                                      </button>
                                    )}

                                    {/* Operations */}
                                    <div className="flex items-center gap-1">
                                      {/* Reorder Left */}
                                      {index > 0 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const reordered = [...activeImages];
                                            const temp = reordered[index - 1];
                                            reordered[index - 1] = reordered[index];
                                            reordered[index] = temp;
                                            updateColorGalleryImages(selectedColorForGallery, reordered);
                                          }}
                                          className="p-1 bg-white/90 hover:bg-white text-neutral-800 rounded-md shadow-xs text-xs font-black"
                                        >
                                          &lt;
                                        </button>
                                      )}
                                      
                                      {/* Label Selector Dropdown */}
                                      <select
                                        value={activeLabel}
                                        onChange={(e) => {
                                          const nextLabels = { ...labels, [img]: e.target.value };
                                          updateColorGalleryImages(selectedColorForGallery, activeImages, undefined, nextLabels);
                                        }}
                                        className="bg-black/60 hover:bg-black/85 text-white border-none rounded p-0.5 text-[8px] font-extrabold outline-none cursor-pointer"
                                        title="Image Perspective Label"
                                      >
                                        <option value="">LBL</option>
                                        <option value="NEW">NEW</option>
                                        <option value="360°">360°</option>
                                        <option value="ON FOOT">ON FOOT</option>
                                        <option value="TOP VIEW">TOP</option>
                                        <option value="SIDE VIEW">SIDE</option>
                                        <option value="BACK VIEW">BACK</option>
                                        <option value="SOLE VIEW">SOLE</option>
                                        <option value="IN BOX">IN BOX</option>
                                      </select>

                                      {/* Delete */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const filtered = activeImages.filter((_, i) => i !== index);
                                          updateColorGalleryImages(selectedColorForGallery, filtered);
                                          showToast?.('Image removed from color gallery.', 'info');
                                        }}
                                        className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-xs transition-colors"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 2. MATRIX GRID */}
            {variantTab === 'matrix' && (
              <div className="space-y-4">
                {/* Bulk Actions Panel */}
                <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200/80 space-y-2.5">
                  <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider block">Bulk Matrix Updates ({selectedVariantIds.length} Selected):</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 items-end">
                    {/* Price */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-500 block">Price (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 999"
                        value={bulkPriceInput}
                        onChange={(e) => setBulkPriceInput(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-lg p-1 text-xs font-bold outline-none"
                      />
                    </div>
                    {/* MRP */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-500 block">MRP (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 1499"
                        value={bulkOrigPriceInput}
                        onChange={(e) => setBulkOrigPriceInput(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-lg p-1 text-xs font-bold outline-none"
                      />
                    </div>
                    {/* Stock */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-500 block">Stock</label>
                      <input
                        type="number"
                        placeholder="e.g. 20"
                        value={bulkStockInput}
                        onChange={(e) => setBulkStockInput(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-lg p-1 text-xs font-bold outline-none"
                      />
                    </div>
                    {/* Low Stock Limit */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-500 block">Low Stock Warning</label>
                      <input
                        type="number"
                        placeholder="e.g. 3"
                        value={bulkLowStockLimit}
                        onChange={(e) => setBulkLowStockLimit(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-lg p-1 text-xs font-bold outline-none"
                      />
                    </div>
                    {/* Status */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-500 block">Status</label>
                      <select
                        value={bulkStatusInput}
                        onChange={(e) => setBulkStatusInput(e.target.value as 'active' | 'hidden')}
                        className="w-full bg-white border border-neutral-200 rounded-lg p-1 text-xs font-bold outline-none"
                      >
                        <option value="active">🟢 Active</option>
                        <option value="hidden">👁️ Hidden</option>
                      </select>
                    </div>

                    {/* Apply Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedVariantIds.length === 0) {
                          showToast?.('Please select at least one variant row to bulk update.', 'info');
                          return;
                        }
                        const updated = (productState.variants || []).map(v => {
                          if (selectedVariantIds.includes(v.id)) {
                            const newP = bulkPriceInput ? Number(bulkPriceInput) : v.price;
                            const newOP = bulkOrigPriceInput ? Number(bulkOrigPriceInput) : v.originalPrice;
                            let newDisc = v.discount;
                            if (newOP > newP && newOP > 0) {
                              newDisc = Math.round(((newOP - newP) / newOP) * 100);
                            }
                            return {
                              ...v,
                              price: newP,
                              originalPrice: newOP,
                              discount: newDisc,
                              stock: bulkStockInput ? Number(bulkStockInput) : v.stock,
                              lowStockLimit: bulkLowStockLimit ? Number(bulkLowStockLimit) : v.lowStockLimit,
                              status: bulkStatusInput as 'active' | 'hidden' | 'out_of_stock'
                            };
                          }
                          return v;
                        });
                        setProductState(prev => ({ ...prev, variants: updated }));
                        setBulkPriceInput('');
                        setBulkOrigPriceInput('');
                        setBulkStockInput('');
                        setBulkLowStockLimit('');
                        setSelectedVariantIds([]);
                        showToast?.('Applied bulk parameters successfully!', 'success');
                      }}
                      className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs py-2 rounded-lg transition-all w-full text-center"
                    >
                      Apply Bulk
                    </button>
                  </div>
                </div>

                {/* Variants Table Container */}
                <div className="border border-neutral-200 rounded-2xl overflow-x-auto bg-neutral-50 max-h-[400px] overflow-y-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-neutral-100/90 border-b border-neutral-200 sticky top-0 z-10">
                        <th className="p-2.5 font-extrabold text-neutral-600 text-[10px] w-8">
                          <input
                            type="checkbox"
                            checked={selectedVariantIds.length === (productState.variants || []).length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedVariantIds((productState.variants || []).map(v => v.id));
                              } else {
                                setSelectedVariantIds([]);
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-600"
                          />
                        </th>
                        <th className="p-2.5 font-extrabold text-neutral-600 text-[10px]">VARIANT ATTRIB</th>
                        <th className="p-2.5 font-extrabold text-neutral-600 text-[10px]">PRICES (₹)</th>
                        <th className="p-2.5 font-extrabold text-neutral-600 text-[10px]">STOCKS</th>
                        <th className="p-2.5 font-extrabold text-neutral-600 text-[10px]">SKU / BARCODE</th>
                        <th className="p-2.5 font-extrabold text-neutral-600 text-[10px]">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {(productState.variants || []).map((variant, index) => {
                        const isSelected = selectedVariantIds.includes(variant.id);
                        return (
                          <tr key={variant.id} className={`hover:bg-neutral-100/50 transition-colors ${isSelected ? 'bg-emerald-50/20' : ''}`}>
                            <td className="p-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedVariantIds([...selectedVariantIds, variant.id]);
                                  } else {
                                    setSelectedVariantIds(selectedVariantIds.filter(id => id !== variant.id));
                                  }
                                }}
                                className="rounded text-emerald-600 focus:ring-emerald-600"
                              />
                            </td>
                            {/* Color & Size Badges */}
                            <td className="p-2.5">
                              <div className="flex flex-col gap-1">
                                <span className="font-extrabold text-neutral-900 flex items-center gap-1.5">
                                  <span className="w-3.5 h-3.5 rounded-full border border-neutral-300" style={{ backgroundColor: variant.colorCode }} />
                                  <span>{variant.color}</span>
                                </span>
                                <span className="bg-neutral-200/80 text-neutral-800 font-bold px-1.5 py-0.5 rounded-md w-fit text-[9px] uppercase">
                                  Size {variant.size}
                                </span>
                              </div>
                            </td>
                            {/* Price / MRP Inputs */}
                            <td className="p-2.5">
                              <div className="flex flex-col gap-1 max-w-[110px]">
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] font-bold text-neutral-400">Sale:</span>
                                  <input
                                    type="number"
                                    value={variant.price}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = (productState.variants || []).map((v, i) => {
                                        if (i === index) {
                                          let disc = v.discount;
                                          if (v.originalPrice > val && v.originalPrice > 0) {
                                            disc = Math.round(((v.originalPrice - val) / v.originalPrice) * 100);
                                          }
                                          return { ...v, price: val, discount: disc };
                                        }
                                        return v;
                                      });
                                      setProductState(prev => ({ ...prev, variants: updated }));
                                    }}
                                    className="bg-white border border-neutral-200 rounded p-0.5 text-xs font-black text-emerald-700 w-16"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] font-bold text-neutral-400">MRP:</span>
                                  <input
                                    type="number"
                                    value={variant.originalPrice}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = (productState.variants || []).map((v, i) => {
                                        if (i === index) {
                                          let disc = 0;
                                          if (val > v.price && val > 0) {
                                            disc = Math.round(((val - v.price) / val) * 100);
                                          }
                                          return { ...v, originalPrice: val, discount: disc };
                                        }
                                        return v;
                                      });
                                      setProductState(prev => ({ ...prev, variants: updated }));
                                    }}
                                    className="bg-white border border-neutral-200 rounded p-0.5 text-xs font-semibold text-neutral-500 w-16"
                                  />
                                </div>
                                {variant.discount > 0 && (
                                  <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded-sm w-fit">
                                    {variant.discount}% OFF
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* Stock & Low Stock Warning */}
                            <td className="p-2.5">
                              <div className="flex flex-col gap-1 max-w-[100px]">
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] font-bold text-neutral-400">Qty:</span>
                                  <input
                                    type="number"
                                    value={variant.stock}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = (productState.variants || []).map((v, i) => {
                                        if (i === index) {
                                          return { ...v, stock: val };
                                        }
                                        return v;
                                      });
                                      setProductState(prev => ({ ...prev, variants: updated }));
                                    }}
                                    className="bg-white border border-neutral-200 rounded p-0.5 text-xs font-bold w-12 text-center"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] font-bold text-neutral-400">Min:</span>
                                  <input
                                    type="number"
                                    value={variant.lowStockLimit}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = (productState.variants || []).map((v, i) => {
                                        if (i === index) {
                                          return { ...v, lowStockLimit: val };
                                        }
                                        return v;
                                      });
                                      setProductState(prev => ({ ...prev, variants: updated }));
                                    }}
                                    className="bg-white border border-neutral-200 rounded p-0.5 text-xs font-bold w-12 text-center text-amber-700"
                                  />
                                </div>
                              </div>
                            </td>
                            {/* SKU / Barcode */}
                            <td className="p-2.5">
                              <div className="flex flex-col gap-1 max-w-[150px]">
                                <input
                                  type="text"
                                  value={variant.sku}
                                  placeholder="SKU Code"
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const updated = (productState.variants || []).map((v, i) => {
                                      if (i === index) return { ...v, sku: val };
                                      return v;
                                    });
                                    setProductState(prev => ({ ...prev, variants: updated }));
                                  }}
                                  className="bg-white border border-neutral-200 rounded p-0.5 text-[10px] font-mono font-bold uppercase w-28 outline-none"
                                />
                                <input
                                  type="text"
                                  value={variant.barcode || ''}
                                  placeholder="Barcode"
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const updated = (productState.variants || []).map((v, i) => {
                                      if (i === index) return { ...v, barcode: val };
                                      return v;
                                    });
                                    setProductState(prev => ({ ...prev, variants: updated }));
                                  }}
                                  className="bg-white border border-neutral-200 rounded p-0.5 text-[10px] font-mono font-bold w-28 outline-none"
                                />
                              </div>
                            </td>
                            {/* Status */}
                            <td className="p-2.5">
                              <select
                                value={variant.status}
                                onChange={(e) => {
                                  const val = e.target.value as 'active' | 'hidden';
                                  const updated = (productState.variants || []).map((v, i) => {
                                    if (i === index) return { ...v, status: val };
                                    return v;
                                  });
                                  setProductState(prev => ({ ...prev, variants: updated }));
                                }}
                                className="bg-white border border-neutral-200 rounded p-1 text-[10px] font-bold outline-none cursor-pointer"
                              >
                                <option value="active">Active</option>
                                <option value="hidden">Hidden</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. AI STRATEGY & ALERTS */}
            {variantTab === 'ai' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Alerts Card */}
                  <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-3">
                    <span className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5 uppercase tracking-wider block">
                      <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
                      Low Stock Alert Warnings
                    </span>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {(() => {
                        const lowStockItems = (productState.variants || []).filter(v => v.stock <= v.lowStockLimit);
                        if (lowStockItems.length === 0) {
                          return (
                            <span className="text-[11px] text-emerald-800 font-bold block bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                              🟢 Perfect: All variant configurations have healthy inventory reserves.
                            </span>
                          );
                        }
                        return lowStockItems.map(item => (
                          <div key={item.id} className="flex justify-between items-center gap-1 bg-white p-2 rounded-xl border border-amber-100 text-[10px] font-bold text-amber-900">
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full border border-neutral-300 shrink-0" style={{ backgroundColor: item.colorCode }} />
                              <span>{item.color} (Size {item.size})</span>
                            </span>
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              Only {item.stock} left
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* AI Forecasting Demand */}
                  <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-4 space-y-3">
                    <span className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5 uppercase tracking-wider block">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      AI Optimization & Pricing Recommendations
                    </span>
                    <div className="space-y-2.5 text-[11px] leading-relaxed text-neutral-600">
                      <p>
                        Our machine learning models recommend a <strong className="text-emerald-800">10% premium markdown adjustments</strong> for high-performing size variants like <strong className="text-emerald-900">Size 8 and Size 9</strong> across standard solid black shoes due to regional seasonal footfalls.
                      </p>
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-100 text-[10px] font-bold text-emerald-950 flex items-center justify-between">
                        <span>Slow-Moving Variants: Size 11</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (productState.variants || []).map(v => {
                              if (v.size.toString() === '11') {
                                return { ...v, price: Math.round(v.price * 0.9) };
                              }
                              return v;
                            });
                            setProductState(prev => ({ ...prev, variants: updated }));
                            showToast?.('Applied 10% markdown on Size 11 variants!', 'success');
                          }}
                          className="bg-emerald-100 hover:bg-emerald-200 text-[#0B8F63] px-2 py-1 rounded-md border border-[#0B8F63]/30 uppercase text-[9px] font-black transition-all"
                        >
                          Markdown 10%
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
