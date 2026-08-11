import React, { useState, useEffect } from 'react';
import { getPlatformConfig } from '../../lib/platformConfig';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingBag,
  Bell,
  ImageOff,
  Copy,
  Check,
  Share2,
  AlertTriangle,
  PackageX,
  Sparkles,
  Zap,
  Loader2,
  ZoomIn,
  ZoomOut,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { generateProductWhatsAppLink } from '../../utils/whatsapp';
import { getProductSKU, getProductUrl } from '../../utils/productUtils';
import { CLEAN_IMAGE_COMING_SOON_SVG } from '../../utils/imageOptimizer';
import {
  normalizeProductSizeStocks,
  isProductCompletelyOutOfStock,
  getFirstAvailableInStockSize,
  getSizeStockInfo,
} from '../../utils/sizeStockUtils';
import { ProductCard } from './ProductCard';
import { OpenBoxDeliveryBadge } from '../Common/OpenBoxDeliveryBadge';
import { useStore } from '../../context/StoreContext';
import { SEOHead } from '../SEO/SEOHead';
import { generateProductSchema, generateBreadcrumbSchema } from '../../utils/seo';

interface ProductDetailPageProps {
  product: Product | null;
  targetSlug: string;
  allProducts: Product[];
  onBackToHome: () => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onAddToCart: (product: Product, size: string, color: string, selectedVariant?: ProductVariant) => void;
  onQuickView: (product: Product) => void;
  wishlistIds: string[];
  onBuyNow?: (product: Product, size: string, color: string, quantity: number, selectedVariant?: ProductVariant) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  targetSlug,
  allProducts,
  onBackToHome,
  onToggleWishlist,
  isWishlisted,
  onAddToCart,
  onQuickView,
  wishlistIds,
  onBuyNow,
}) => {
  const { paymentSettings, playSiteSound, showToast } = useStore();

  // State for image gallery & selections
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  // Sync state when product loads or changes
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setImageError(false);
      setQuantity(1);
      
      if (product.variants && product.variants.length > 0) {
        // Collect all available colors from variants
        const varColors = Array.from(new Set(product.variants.map(v => v.color)));
        const firstColor = varColors[0] || 'Standard';
        setSelectedColor(firstColor);

        // Find sizes for this color and set the first in-stock or available size
        const sizesForFirstColor = product.variants.filter(
          v => (v.color || '').toLowerCase() === (firstColor || '').toLowerCase() && v.status === 'active'
        );
        const inStockSizes = sizesForFirstColor.filter(v => v.stock > 0);
        if (inStockSizes.length > 0) {
          setSelectedSize(inStockSizes[0].size);
        } else if (sizesForFirstColor.length > 0) {
          setSelectedSize(sizesForFirstColor[0].size);
        } else {
          setSelectedSize('');
        }
      } else {
        setSelectedSize(getFirstAvailableInStockSize(product));
        setSelectedColor(product.colors.length > 0 ? product.colors[0].name : 'Standard');
      }
    }
  }, [product]);

  // Sync size when selectedColor changes
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0 && selectedColor) {
      const sizesForColor = product.variants.filter(
        v => (v.color || '').toLowerCase() === (selectedColor || '').toLowerCase() && v.status === 'active'
      );
      // If selectedSize is not available in new color, pick one
      const exists = sizesForColor.some(v => v.size === selectedSize);
      if (!exists && sizesForColor.length > 0) {
        const inStock = sizesForColor.filter(v => v.stock > 0);
        setSelectedSize(inStock.length > 0 ? inStock[0].size : sizesForColor[0].size);
      }
    }
  }, [selectedColor, product]);

  // Find current active variant
  const activeVariant = product?.variants?.find(
    (v) =>
      (v.color || '').toLowerCase() === (selectedColor || '').toLowerCase() &&
      v.size.toString() === selectedSize.toString()
  );

  // Prices
  const displayPrice = activeVariant ? activeVariant.price : (product?.price || 0);
  const displayOriginalPrice = activeVariant ? activeVariant.originalPrice : (product?.originalPrice || 0);
  const displayDiscountPercent = activeVariant ? activeVariant.discount : (product?.discountPercent || 0);

  // Gallery (Every color has its own gallery)
  const colorSpecificImages = product?.variants
    ? Array.from(
        new Set(
          product.variants
            .filter((v) => (v.color || '').toLowerCase() === (selectedColor || '').toLowerCase())
            .flatMap((v) => v.images || [])
        )
      ).filter(Boolean) as string[]
    : [];

  const displayImages = colorSpecificImages.length > 0 ? colorSpecificImages : (product?.images || []);

  // Sync index to avoid index out of bounds if selected color has fewer images
  useEffect(() => {
    if (activeImageIndex >= displayImages.length) {
      setActiveImageIndex(0);
    }
  }, [displayImages, activeImageIndex]);

  // Touch Swiping Handlers
  const touchStartX = React.useRef<number>(0);
  const touchEndX = React.useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      if (activeImageIndex < displayImages.length - 1) {
        setActiveImageIndex(prev => prev + 1);
      } else {
        setActiveImageIndex(0);
      }
    } else if (diff < -50) {
      if (activeImageIndex > 0) {
        setActiveImageIndex(prev => prev - 1);
      } else {
        setActiveImageIndex(displayImages.length - 1);
      }
    }
  };

  // -------------------------------------------------------------
  // DELETED / NOT FOUND PRODUCT CUSTOM ERROR PAGE
  // -------------------------------------------------------------
  if (!product) {
    const relatedProducts = allProducts.slice(0, 4);
    const latestProducts = allProducts.slice(4, 8);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 animate-in fade-in duration-300">
        <SEOHead 
          title={`Product Not Found | ${getPlatformConfig().platformDisplayName}`} 
          description="The product you are looking for could not be found."
        />
        {/* Back Navigation */}
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-white px-4 py-2 rounded-xl border border-neutral-200 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store Catalog</span>
        </button>

        {/* Custom Error Notice (NO 404) */}
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
            <PackageX className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-serif-heading font-extrabold text-neutral-900">
              This product is no longer available.
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto">
              The requested item <span className="font-mono font-bold text-amber-900">"{targetSlug}"</span> has been removed or discontinued from our active inventory. Please browse our latest arrivals below!
            </p>
          </div>

          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 bg-[#0B8F63] hover:bg-[#086F4C] text-white text-xs font-extrabold px-6 py-3.5 rounded-2xl shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore All Collections</span>
          </button>
        </div>

        {/* Related & Latest Products Showcase */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif-heading font-bold text-neutral-900">
                Trending Similar Footwear
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isWishlisted={wishlistIds.includes(p.id)}
                  onToggleWishlist={onToggleWishlist}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        )}

        {latestProducts.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-neutral-200">
            <h2 className="text-xl font-serif-heading font-bold text-neutral-900">
              Latest New Arrivals
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {latestProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isWishlisted={wishlistIds.includes(p.id)}
                  onToggleWishlist={onToggleWishlist}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VALID PRODUCT FULL PAGE DISPLAY
  // -------------------------------------------------------------
  const availableColors = product.variants && product.variants.length > 0
    ? Array.from(
        new Map(
          product.variants.map((v) => [
            (v.color || '').toLowerCase(),
            { name: v.color, hex: v.colorCode || '#FFFFFF' }
          ])
        ).values()
      )
    : product.colors;

  const sizeStocks = product.variants && product.variants.length > 0
    ? product.variants
        .filter((v) => (v.color || '').toLowerCase() === (selectedColor || '').toLowerCase() && v.status === 'active')
        .map((v) => ({
          size: v.size,
          inStock: v.stock > 0,
          stockQuantity: v.stock,
          isAvailable: true,
        }))
    : normalizeProductSizeStocks(product);

  const isCompletelyOutOfStock = product.variants && product.variants.length > 0
    ? !product.variants.some(v => v.stock > 0 && v.status === 'active')
    : isProductCompletelyOutOfStock(product);

  const selectedSizeInfo = product.variants && product.variants.length > 0
    ? sizeStocks.find(s => s.size === selectedSize)
    : getSizeStockInfo(product, selectedSize);

  const isSelectedSizeOutOfStock = selectedSizeInfo
    ? (!selectedSizeInfo.inStock || selectedSizeInfo.stockQuantity <= 0)
    : false;

  const rawImageSrc = displayImages && displayImages.length > 0
    ? (displayImages[activeImageIndex] || displayImages[0])
    : '';

  const displayImageSrc = (!rawImageSrc || imageError)
    ? CLEAN_IMAGE_COMING_SOON_SVG
    : rawImageSrc;

  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);

  const handleWhatsAppBuy = () => {
    const link = generateProductWhatsAppLink(product, selectedSize, selectedColor, quantity);
    window.open(link, '_blank');
  };

  const handleBuyNow = () => {
    if (isBuyNowLoading) return;

    if (isCompletelyOutOfStock || isSelectedSizeOutOfStock) {
      showToast?.('This item/size is currently out of stock.', 'error');
      return;
    }

    if (!selectedSize) {
      showToast?.('Please select a size first.', 'info');
      return;
    }

    setIsBuyNowLoading(true);
    playSiteSound('addToCart');

    setTimeout(() => {
      setIsBuyNowLoading(false);
      if (onBuyNow) {
        onBuyNow(product, selectedSize, selectedColor || 'Standard', quantity || 1, activeVariant);
      }
    }, 150);
  };

  const handleAddBag = () => {
    onAddToCart(product, selectedSize, selectedColor, activeVariant);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  // Related items in same category
  const relatedItems = allProducts
    .filter((p) => p.id !== product.id && (p.category === product.category || p.subcategory === product.subcategory))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 animate-in fade-in duration-300">
      <SEOHead 
        title={`${product.name} | ${getPlatformConfig().platformDisplayName}`}
        description={product.description || `Buy ${product.name} at ${getPlatformConfig().platformDisplayName}. Best price ₹${product.price}. Genuine quality & fast delivery.`}
        image={product.images?.[0]}
        url={getProductUrl(product)}
        type="product"
        schemas={[
          generateProductSchema(product),
          generateBreadcrumbSchema([
            { name: 'Home', item: '/' },
            { name: product.category, item: `/?category=${product.category}` },
            { name: product.name, item: `/product/${product.id}` }
          ])
        ]}
      />
      {/* Breadcrumb Navigation & Back Button */}
      <div className="flex items-center justify-between border-b border-neutral-200/80 pb-4">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-700 hover:text-[#0B8F63] bg-white px-3.5 py-2 rounded-xl border border-neutral-200 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-neutral-500">
          <span className="hover:underline cursor-pointer" onClick={onBackToHome}>Home</span>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-neutral-900 font-bold truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* Main Product Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-6 space-y-4 sticky top-24">
          {/* Main Display Image */}
          {(() => {
            const activeVarWithImages = product?.variants?.find(
              (v) => (v.color || '').toLowerCase() === (selectedColor || '').toLowerCase() && v.images && v.images.length > 0
            );
            const imageLabels = (activeVarWithImages as any)?.imageLabels || {};
            const activeLabel = imageLabels[rawImageSrc] || '';

            return (
              <div 
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative aspect-square w-full rounded-3xl overflow-hidden bg-neutral-100 border border-neutral-200/80 shadow-md flex items-center justify-center group cursor-zoom-in"
              >
                {(!rawImageSrc || imageError) ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-neutral-50">
                    <div className="w-16 h-16 rounded-2xl bg-[#0B8F63]/10 text-[#0B8F63] flex items-center justify-center mb-2">
                      <ImageOff className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Product Image Coming Soon</span>
                    <span className="text-[10px] font-medium text-neutral-400">Official Product Showcase</span>
                  </div>
                ) : (
                  <img
                    src={displayImageSrc}
                    alt={product.name}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 animate-in fade-in duration-300"
                    referrerPolicy="no-referrer"
                    onClick={() => setIsFullscreenOpen(true)}
                  />
                )}

                {/* Perspective Tag Label */}
                {activeLabel && (
                  <span className="absolute top-4 right-4 bg-emerald-600 text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md z-10">
                    {activeLabel}
                  </span>
                )}

                {/* Slide Counter */}
                {displayImages.length > 1 && (
                  <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xs text-white font-mono font-bold text-[10px] px-2.5 py-1 rounded-lg z-10 select-none">
                    {activeImageIndex + 1} / {displayImages.length}
                  </span>
                )}

                {/* Zoom Trigger Button */}
                {!(!rawImageSrc || imageError) && (
                  <button
                    onClick={() => setIsFullscreenOpen(true)}
                    className="absolute bottom-4 left-4 bg-white/90 hover:bg-white text-neutral-800 p-2 rounded-lg shadow-sm z-10 transition-colors"
                    title="Full Screen Gallery"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </button>
                )}

                {displayDiscountPercent > 0 && (
                  <span className="absolute top-4 left-4 bg-red-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-lg">
                    SAVE {displayDiscountPercent}%
                  </span>
                )}
              </div>
            );
          })()}

          {/* Thumbnails */}
          {displayImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              {displayImages.map((img, idx) => {
                const activeVarWithImages = product?.variants?.find(
                  (v) => (v.color || '').toLowerCase() === (selectedColor || '').toLowerCase() && v.images && v.images.length > 0
                );
                const imageLabels = (activeVarWithImages as any)?.imageLabels || {};
                const currentLabel = imageLabels[img] || '';

                return (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all relative ${
                      activeImageIndex === idx
                        ? 'border-[#0B8F63] ring-2 ring-[#0B8F63]/20 scale-105 shadow-md'
                        : 'border-neutral-200/80 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {currentLabel && (
                      <span className="absolute top-1 left-1 bg-black/75 text-white font-extrabold text-[7px] uppercase px-1 rounded-sm">
                        {currentLabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Product Details & WhatsApp Ordering */}
        <div className="lg:col-span-6 space-y-6">
          {/* Brand & Stock Badges */}
          <div className="flex items-center justify-between">
            {product.brand && product.brand.trim().length > 0 ? (
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#0B8F63] bg-[#0B8F63]/10 px-3.5 py-1.5 rounded-full border border-[#0B8F63]/20">
                {product.brand}
              </span>
            ) : <span />}

            <div className="flex items-center gap-2">
              {isCompletelyOutOfStock ? (
                <span className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200">
                  Out of Stock
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                  In Stock & Ready to Dispatch
                </span>
              )}
            </div>
          </div>

          {/* Title & Permanent Product ID / SKU */}
          <div className="space-y-2">
            <h1 className="font-serif-heading font-extrabold text-3xl sm:text-4xl text-neutral-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="bg-emerald-50 text-emerald-900 font-mono font-extrabold text-xs px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                <span>Product ID / SKU:</span>
                <span className="text-[#0B8F63]">{activeVariant && activeVariant.sku ? activeVariant.sku : getProductSKU(product)}</span>
              </span>

              {activeVariant && activeVariant.barcode && (
                <span className="bg-blue-50 text-blue-900 font-mono font-extrabold text-xs px-3 py-1 rounded-xl border border-blue-200 flex items-center gap-1.5">
                  <span>Barcode:</span>
                  <span className="text-blue-700">{activeVariant.barcode}</span>
                </span>
              )}

              {/* Permanent Share Link Copy Button */}
              <button
                onClick={() => {
                  const url = getProductUrl(product);
                  navigator.clipboard.writeText(url);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 transition-colors border border-neutral-200"
                title="Copy permanent shareable product link"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-extrabold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-neutral-500" />
                    <span>Copy Share Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Rating Summary */}
          {product.rating && product.rating > 0 ? (
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-800 bg-amber-50/80 border border-amber-200 px-3.5 py-1.5 rounded-xl w-fit">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="ml-1 text-neutral-900 font-extrabold">{product.rating}</span>
              </div>
              {product.reviewsCount && product.reviewsCount > 0 && (
                <span className="text-neutral-500 text-xs font-semibold">({product.reviewsCount} customer reviews)</span>
              )}
            </div>
          ) : null}

          {/* Price Box */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="font-serif-heading font-extrabold text-3xl sm:text-4xl text-neutral-900">
                ₹{(displayPrice || 0).toLocaleString('en-IN')}
              </span>
              {displayOriginalPrice > displayPrice && (
                <span className="text-lg text-neutral-400 line-through">
                  ₹{(displayOriginalPrice || 0).toLocaleString('en-IN')}
                </span>
              )}
              {displayDiscountPercent > 0 && (
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                  {displayDiscountPercent}% OFF
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Inclusive of all taxes • Free Shipping on orders over ₹999
            </p>
          </div>

          {/* Open Box Delivery Feature Banner */}
          <OpenBoxDeliveryBadge product={product} variant="banner" />

          {/* Description */}
          {product.description && (
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-800">
                Product Details & Features
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Color Selection */}
          {availableColors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
                Select Colour: <span className="text-[#0B8F63] font-extrabold">{selectedColor}</span>
              </label>
              <div className="flex items-center gap-3">
                {availableColors.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedColor === c.name
                        ? 'border-[#0B8F63] ring-2 ring-offset-2 ring-[#0B8F63] scale-110'
                        : 'border-neutral-200'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {sizeStocks.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                  <span>Select Size:</span>
                  <span className="text-[#0B8F63] font-extrabold text-sm">{selectedSize}</span>
                  {selectedSizeInfo && selectedSizeInfo.inStock && selectedSizeInfo.stockQuantity <= 5 && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Only {selectedSizeInfo.stockQuantity} pairs left!
                    </span>
                  )}
                </label>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {sizeStocks.filter((s) => s.isAvailable).map((item) => {
                  const isSelected = selectedSize === item.size;
                  const isInStock = item.inStock && item.stockQuantity > 0;

                  return (
                    <button
                      key={item.size}
                      disabled={!isInStock}
                      onClick={() => setSelectedSize(item.size)}
                      className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-all relative ${
                        isSelected
                          ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-md ring-2 ring-[#0B8F63]/20 scale-105'
                          : isInStock
                          ? 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-400'
                          : 'bg-neutral-100 text-neutral-400 border-neutral-200 line-through cursor-not-allowed opacity-60'
                      }`}
                    >
                      {item.size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Controls */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Quantity:</span>
            <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50 shadow-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-2 text-neutral-600 hover:bg-neutral-200 font-bold"
              >
                -
              </button>
              <span className="px-5 py-2 text-sm font-extrabold text-neutral-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3.5 py-2 text-neutral-600 hover:bg-neutral-200 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* PREMIUM SHIPPING & RETURN POLICY CARD */}
          <div className="p-4 bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 text-white rounded-2xl shadow-md border border-amber-800/40 space-y-3 my-3">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-serif font-extrabold text-amber-100 uppercase tracking-wider">
                  {paymentSettings.policyText || 'No Return & No Exchange Policy'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-900/60 px-2.5 py-0.5 rounded-full border border-amber-700/50">
                Verified Store Policy
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
              {/* Delivery Status */}
              <div className="flex items-center space-x-2 bg-black/40 p-2.5 rounded-xl border border-white/10">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-extrabold text-emerald-300 block">
                    {displayPrice >= (paymentSettings.freeShippingMinAmount || 999)
                      ? '🚚 FREE DELIVERY'
                      : `🚚 ₹${paymentSettings.flatShippingRate || 80} Delivery`}
                  </span>
                  <span className="text-[10px] text-neutral-300">
                    {displayPrice >= (paymentSettings.freeShippingMinAmount || 999)
                      ? 'Eligible for Free Standard Delivery'
                      : `Add ₹${((paymentSettings.freeShippingMinAmount || 999) - (displayPrice || 0)).toLocaleString()} for Free Delivery`}
                  </span>
                </div>
              </div>

              {/* Policy */}
              <div className="flex items-center space-x-2 bg-black/40 p-2.5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-1 font-extrabold text-rose-300 shrink-0 text-sm">
                  <span>❌</span>
                </div>
                <div>
                  <span className="font-extrabold text-rose-300 block">NO RETURN • NO EXCHANGE</span>
                  <span className="text-[10px] text-neutral-300">Quality Checked Prior to Dispatch</span>
                </div>
              </div>
            </div>

            {/* Badges Strip */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/10 text-[10px] font-bold">
              <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                🚚 FREE DELIVERY ABOVE ₹{paymentSettings.freeShippingMinAmount || 999}
              </span>
              <span className="bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-lg border border-rose-500/30">
                ❌ NO RETURN
              </span>
              <span className="bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-lg border border-rose-500/30">
                ❌ NO EXCHANGE
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS: BUY NOW, BUY ON WHATSAPP & BAG */}
          <div className="space-y-3 pt-4 border-t border-neutral-200">
            {isCompletelyOutOfStock || isSelectedSizeOutOfStock ? (
              <button
                onClick={handleWhatsAppBuy}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm sm:text-base py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01]"
              >
                <Bell className="w-5 h-5 fill-white text-amber-600" />
                <span>NOTIFY ME ON WHATSAPP (RESTOCK INQUIRY)</span>
              </button>
            ) : (
              <div className="space-y-3">
                {/* Direct Buy Now Button */}
                {paymentSettings.enableBuyNow !== false && (
                  <button
                    onClick={handleBuyNow}
                    disabled={isBuyNowLoading}
                    className="w-full text-white font-extrabold text-base sm:text-lg py-4 px-6 rounded-2xl shadow-lg shadow-[#0B8F63]/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 group relative overflow-hidden"
                    style={{ backgroundColor: paymentSettings.buyNowButtonColor || '#0B8F63' }}
                  >
                    {isBuyNowLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    ) : (
                      <Zap className="w-6 h-6 fill-white text-white animate-pulse" />
                    )}
                    <span>{paymentSettings.buyNowButtonText || 'BUY NOW'}</span>
                  </button>
                )}

                {/* Secondary Actions Row: WhatsApp, Add to Bag, Wishlist */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {paymentSettings.enableBuyWhatsApp !== false && (
                    <button
                      onClick={handleWhatsAppBuy}
                      className="w-full text-white font-bold text-xs sm:text-sm py-3.5 px-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                      style={{ backgroundColor: paymentSettings.buyWhatsAppButtonColor || '#25D366' }}
                    >
                      <MessageCircle className="w-4 h-4 fill-white text-white shrink-0" />
                      <span className="truncate">{paymentSettings.buyWhatsAppButtonText || 'BUY ON WHATSAPP'}</span>
                    </button>
                  )}

                  {paymentSettings.enableAddToCart !== false && (
                    <button
                      onClick={handleAddBag}
                      className="w-full text-white font-bold text-xs sm:text-sm py-3.5 px-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                      style={{ backgroundColor: paymentSettings.addToBagButtonColor || '#171717' }}
                    >
                      <ShoppingBag className="w-4 h-4 shrink-0" />
                      <span className="truncate">{addedNotice ? 'Added to Bag!' : (paymentSettings.addToBagButtonText || 'ADD TO BAG')}</span>
                    </button>
                  )}

                  <button
                    onClick={() => onToggleWishlist(product)}
                    className={`w-full font-bold text-xs sm:text-sm py-3.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-colors ${
                      isWishlisted
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 shrink-0 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span className="truncate">{isWishlisted ? 'Saved' : 'Wishlist'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Store Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-4 text-center text-[11px] text-neutral-600 font-semibold border-t border-neutral-100">
              <div className="flex flex-col items-center gap-1 p-2 bg-neutral-50 rounded-xl">
                <Truck className="w-4 h-4 text-[#0B8F63]" />
                <span>Express Local Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-neutral-50 rounded-xl">
                <RotateCcw className="w-4 h-4 text-[#0B8F63]" />
                <span>Easy Size Exchange</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-neutral-50 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-[#0B8F63]" />
                <span>100% Genuine Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedItems.length > 0 && (
        <div className="space-y-6 pt-12 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif-heading font-extrabold text-neutral-900">
                You May Also Like
              </h2>
              <p className="text-xs text-neutral-500">
                Handpicked options matching this collection
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedItems.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isWishlisted={wishlistIds.includes(p.id)}
                onToggleWishlist={onToggleWishlist}
                onQuickView={onQuickView}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview / Zoom Modal */}
      {isFullscreenOpen && displayImages.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col">
          {/* Header Controls */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-10">
            <span className="text-white/80 font-mono font-bold text-sm">
              {activeImageIndex + 1} / {displayImages.length}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setZoomScale(prev => Math.min(prev + 0.5, 3))}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => setZoomScale(prev => Math.max(prev - 0.5, 1))}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setIsFullscreenOpen(false);
                  setZoomScale(1);
                }}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors ml-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Main Zoomable Area */}
          <div 
            className="flex-1 flex items-center justify-center overflow-auto relative touch-pan-x touch-pan-y"
            onClick={() => {
              if (zoomScale > 1) setZoomScale(1);
            }}
          >
            <div 
              className="relative transition-transform duration-200 ease-out cursor-zoom-out flex items-center justify-center min-h-full min-w-full"
              style={{ transform: `scale(${zoomScale})` }}
            >
              <img
                src={displayImages[activeImageIndex]}
                alt="Fullscreen Preview"
                className="max-h-screen max-w-full object-contain pointer-events-none"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Prev/Next Navigation (Desktop) */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(prev => prev > 0 ? prev - 1 : displayImages.length - 1);
                  setZoomScale(1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-white/20 text-white rounded-full hidden md:block transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(prev => prev < displayImages.length - 1 ? prev + 1 : 0);
                  setZoomScale(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-white/20 text-white rounded-full hidden md:block transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Thumbnails Footer */}
          {displayImages.length > 1 && (
            <div className="bg-black/80 p-4 overflow-x-auto flex items-center justify-center gap-3 w-full shrink-0">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setZoomScale(1);
                  }}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx
                      ? 'border-[#0B8F63] ring-2 ring-[#0B8F63]/50 scale-110 opacity-100 z-10'
                      : 'border-white/20 opacity-40 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
