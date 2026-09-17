import React, { useState, useEffect, useMemo } from 'react';
import { X, Heart, MessageCircle, Star, Sparkles, ShieldCheck, Truck, RotateCcw, ShoppingBag, Bell, ImageOff, Share2, Copy, Check, Zap, Loader2 } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { generateProductWhatsAppLink } from '../../utils/whatsapp';
import { getProductSKU, getProductUrl } from '../../utils/productUtils';
import { CLEAN_IMAGE_COMING_SOON_SVG } from '../../utils/imageOptimizer';
import { OpenBoxDeliveryBadge } from '../Common/OpenBoxDeliveryBadge';
import {
  normalizeProductSizeStocks,
  isProductCompletelyOutOfStock,
  getFirstAvailableInStockSize,
  getSizeStockInfo,
} from '../../utils/sizeStockUtils';
import { getProductPrice, getImagesForSelectedColor, resolveColorImageIndex } from '../../utils/variantUtils';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
  onAddToCart?: (product: Product, size: string, color: string) => void;
  onBuyNow?: (product: Product, size: string, color: string, quantity: number) => void;
}

const QuickViewModalContent: React.FC<{
  product: Product;
  onClose: () => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
  onAddToCart?: (product: Product, size: string, color: string) => void;
  onBuyNow?: (product: Product, size: string, color: string, quantity: number) => void;
}> = ({
  product,
  onClose,
  onToggleWishlist,
  isWishlisted,
  onAddToCart,
  onBuyNow,
}) => {
  const { paymentSettings, playSiteSound, showToast } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('Standard');
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setImageError(false);
      setSelectedSize(getFirstAvailableInStockSize(product));
      setSelectedColor(
        product.colors && product.colors.length > 0 ? product.colors[0].name : 'Standard'
      );
      setQuantity(1);
      setAddedNotice(false);
      setCopiedLink(false);
    }
  }, [product]);

  const sizeStocks = normalizeProductSizeStocks(product);
  const isCompletelyOutOfStock = isProductCompletelyOutOfStock(product);

  const selectedSizeInfo = getSizeStockInfo(product, selectedSize);
  const isSelectedSizeOutOfStock = selectedSizeInfo
    ? (!selectedSizeInfo.inStock || selectedSizeInfo.stockQuantity <= 0)
    : false;

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
    playSiteSound?.('addToCart');

    setTimeout(() => {
      setIsBuyNowLoading(false);
      if (onBuyNow) {
        onBuyNow(product, selectedSize, selectedColor || 'Standard', quantity || 1);
        onClose();
      }
    }, 150);
  };

  const handleAddBag = () => {
    if (onAddToCart) {
      onAddToCart(product, selectedSize, selectedColor);
    }
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const displayImages = useMemo(() => {
    return getImagesForSelectedColor(product, selectedColor);
  }, [product, selectedColor]);

  // Align active image index when selectedColor changes
  useEffect(() => {
    const idx = resolveColorImageIndex(product, selectedColor, displayImages);
    setActiveImageIndex(idx);
  }, [selectedColor, product, displayImages]);

  const rawImageSrc = displayImages.length > 0
    ? (displayImages[activeImageIndex] || displayImages[0])
    : '';

  const displayImageSrc = (!rawImageSrc || imageError)
    ? CLEAN_IMAGE_COMING_SOON_SVG
    : rawImageSrc;

  const currentPrice = getProductPrice(product, selectedSize, selectedColor);
  const isVariantSelected = Boolean(product.variants?.find(v => v && typeof v.color === 'string' && selectedColor && typeof selectedColor === 'string' && v.color.trim().toLowerCase() === selectedColor.trim().toLowerCase() && v.size === selectedSize));
  const activeVariant = product.variants?.find(v => v && typeof v.color === 'string' && selectedColor && typeof selectedColor === 'string' && v.color.trim().toLowerCase() === selectedColor.trim().toLowerCase() && v.size === selectedSize);
  const originalPrice = isVariantSelected && activeVariant ? activeVariant.originalPrice : product.originalPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Dialog Window */}
      <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-auto max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-neutral-100 flex items-center justify-center text-neutral-600 shadow-md transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Gallery Section */}
        <div className="md:w-1/2 bg-neutral-100 p-6 flex flex-col justify-between">
          {/* Main Display Image */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-inner mb-4 flex items-center justify-center">
            {(!rawImageSrc || imageError) ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-neutral-50/90">
                <div className="w-14 h-14 rounded-2xl bg-[#0B8F63]/10 text-[#0B8F63] flex items-center justify-center mb-2 shadow-inner">
                  <ImageOff className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-neutral-800 tracking-wide uppercase">Real Product Image Coming Soon</span>
                <span className="text-[10px] font-medium text-neutral-400 mt-0.5">Marudhar Fashion Point</span>
              </div>
            ) : (
              <img
                src={displayImageSrc}
                alt={product.name}
                loading="lazy"
                decoding="async"
                onError={() => setImageError(true)}
                style={{ filter: 'brightness(102%) contrast(104%) saturate(105%)' }}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            )}
            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-red-600 text-white font-extrabold text-xs px-2.5 py-1 rounded shadow-md">
                Save {product.discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          {displayImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx
                      ? 'border-[#0B8F63] ring-2 ring-[#0B8F63]/20 scale-105'
                      : 'border-white opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Details & WhatsApp Action Section */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto">
          <div className="space-y-4">
            {/* Brand & Badges */}
            <div className="flex items-center justify-between">
              {product.brand && product.brand.trim().length > 0 ? (
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#0B8F63] bg-[#0B8F63]/10 px-3 py-1 rounded-full">
                  {product.brand}
                </span>
              ) : <span />}
              {product.rating && product.rating > 0 ? (
                <div className="flex items-center gap-1 text-xs font-bold text-neutral-800">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  {product.reviewsCount && product.reviewsCount > 0 ? (
                    <span className="text-neutral-400">({product.reviewsCount} reviews)</span>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Product Title */}
            <div>
              <h2 className="font-serif-heading font-extrabold text-2xl sm:text-3xl text-neutral-900 leading-tight">
                {product.name}
              </h2>
              
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="bg-emerald-100 text-emerald-900 font-mono font-extrabold text-[11px] px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <span>SKU:</span>
                  <span>{getProductSKU(product)}</span>
                </span>

                <button
                  onClick={() => {
                    const url = getProductUrl(product);
                    navigator.clipboard.writeText(url);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors border border-neutral-200"
                  title="Copy direct product link"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-extrabold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3">
              <span className="font-serif-heading font-extrabold text-3xl text-neutral-900">
                ₹{(currentPrice ?? 0).toLocaleString('en-IN')}
              </span>
              {originalPrice > currentPrice && (
                <span className="text-base text-neutral-400 line-through">
                  ₹{(originalPrice ?? 0).toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Inclusive of all taxes
              </span>
            </div>

            {/* Open Box Delivery Feature Banner */}
            <OpenBoxDeliveryBadge product={product} variant="banner" />

            {/* Description */}
            {product.description && product.description.trim().length > 0 && (
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Color Selector */}
            {product.colors.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
                  Select Color: <span className="text-[#0B8F63]">{selectedColor}</span>
                </label>
                <div className="flex items-center gap-2">
                  {product.colors.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedColor && c.name && selectedColor.trim().toLowerCase() === c.name.trim().toLowerCase()
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

            {/* Size Selector */}
            {sizeStocks.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Select Size (UK/India): <span className="text-[#0B8F63] font-black">{selectedSize || 'Choose Size'}</span>
                  </label>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {sizeStocks.map((sz, idx) => {
                    const isSelected = selectedSize === sz.size;
                    const isAvailable = sz.inStock && sz.stockQuantity > 0;

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(sz.size)}
                        className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all flex flex-col items-center justify-center relative ${
                          isSelected
                            ? 'bg-[#0B8F63] border-[#0B8F63] text-white shadow-md scale-105 ring-2 ring-[#0B8F63]/30'
                            : isAvailable
                            ? 'bg-white border-neutral-200 text-neutral-800 hover:border-neutral-400'
                            : 'bg-neutral-100 border-neutral-200 text-neutral-400 opacity-60'
                        }`}
                      >
                        <span className="text-sm font-extrabold">{sz.size}</span>
                        <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-white/90' : isAvailable ? 'text-emerald-600 font-semibold' : 'text-rose-500 font-semibold'}`}>
                          {isAvailable ? `${sz.stockQuantity} left` : 'Sold out'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="space-y-3 pt-4 border-t border-neutral-200">
            {isCompletelyOutOfStock || isSelectedSizeOutOfStock ? (
              <button
                onClick={handleWhatsAppBuy}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Bell className="w-5 h-5 fill-white text-amber-600" />
                <span>NOTIFY ME ON WHATSAPP (RESTOCK INQUIRY)</span>
              </button>
            ) : (
              <div className="space-y-2.5">
                {/* Direct Buy Now Button */}
                {paymentSettings.enableBuyNow !== false && (
                  <button
                    onClick={handleBuyNow}
                    disabled={isBuyNowLoading}
                    className="btn-liquid-base btn-liquid-emerald w-full text-white font-extrabold text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition-all disabled:opacity-75 cursor-pointer"
                    style={{ backgroundColor: paymentSettings.buyNowButtonColor || '#0B8F63' }}
                  >
                    {isBuyNowLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Zap className="w-5 h-5 fill-current animate-pulse" />
                    )}
                    <span>{paymentSettings.buyNowButtonText || 'BUY NOW'}</span>
                  </button>
                )}

                {/* Secondary Actions Row: WhatsApp, Add to Bag, Wishlist */}
                <div className="grid grid-cols-3 gap-2">
                  {paymentSettings.enableBuyWhatsApp !== false && (
                    <button
                      onClick={handleWhatsAppBuy}
                      className="btn-liquid-base btn-liquid-emerald w-full text-white font-bold text-xs py-2.5 px-2 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      style={{ backgroundColor: paymentSettings.buyWhatsAppButtonColor || '#25D366' }}
                    >
                      <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                      <span className="truncate">{paymentSettings.buyWhatsAppButtonText || 'WHATSAPP'}</span>
                    </button>
                  )}

                  {paymentSettings.enableAddToCart !== false && (
                    <button
                      onClick={handleAddBag}
                      className="btn-liquid-base btn-liquid-dark w-full text-white font-bold text-xs py-2.5 px-2 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      style={{ backgroundColor: paymentSettings.addToBagButtonColor || '#171717' }}
                    >
                      <ShoppingBag className="w-4 h-4 shrink-0" />
                      <span className="truncate">{addedNotice ? 'Added!' : (paymentSettings.addToBagButtonText || 'ADD TO BAG')}</span>
                    </button>
                  )}

                  <button
                    onClick={() => onToggleWishlist?.(product)}
                    className={`btn-liquid-base btn-liquid-ghost w-full font-bold text-xs py-2.5 px-2 rounded-xl border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
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

            {/* Local Store Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px] text-neutral-600 font-bold border-t border-neutral-100">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-[#0B8F63]" />
                <span>Express Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>❌ No Return / Exchange</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#0B8F63]" />
                <span>100% Quality Checked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onToggleWishlist,
  isWishlisted,
  onAddToCart,
  onBuyNow,
}) => {
  if (!product) return null;

  return (
    <QuickViewModalContent
      product={product}
      onClose={onClose}
      onToggleWishlist={onToggleWishlist}
      isWishlisted={isWishlisted}
      onAddToCart={onAddToCart}
      onBuyNow={onBuyNow}
    />
  );
};
