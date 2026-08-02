import React, { useState } from 'react';
import { Heart, Eye, MessageCircle, Star, Sparkles, Flame, Bell, ImageOff, Zap, ShoppingBag, Loader2 } from 'lucide-react';
import { Product } from '../../types';
import { generateProductWhatsAppLink } from '../../utils/whatsapp';
import { CLEAN_IMAGE_COMING_SOON_SVG } from '../../utils/imageOptimizer';
import { OpenBoxDeliveryBadge } from '../Common/OpenBoxDeliveryBadge';
import { useStore } from '../../context/StoreContext';
import {
  normalizeProductSizeStocks,
  isProductCompletelyOutOfStock,
  getFirstAvailableInStockSize,
} from '../../utils/sizeStockUtils';
import { getProductPrice } from '../../utils/variantUtils';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onAddToCart?: (product: Product, size: string, color: string) => void;
  onBuyNow?: (product: Product, size: string, color: string, quantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onToggleWishlist,
  isWishlisted,
  onAddToCart,
  onBuyNow,
}) => {
  const { playSiteSound, paymentSettings, showToast } = useStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);
  const sizeStocks = normalizeProductSizeStocks(product);
  const isCompletelyOutOfStock = isProductCompletelyOutOfStock(product);

  const [selectedSize, setSelectedSize] = useState<string>(
    getFirstAvailableInStockSize(product)
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors.length > 0 ? product.colors[0].name : 'Standard'
  );

  const handleWhatsAppBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSiteSound('addToCart');
    const link = generateProductWhatsAppLink(product, selectedSize, selectedColor);
    window.open(link, '_blank');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBuyNowLoading) return;

    if (isCompletelyOutOfStock) {
      showToast?.('This item is currently out of stock.', 'error');
      return;
    }

    if (!selectedSize) {
      showToast?.('Please select a size first.', 'info');
      onQuickView(product);
      return;
    }

    setIsBuyNowLoading(true);
    playSiteSound('addToCart');

    // Fast seamless trigger
    setTimeout(() => {
      setIsBuyNowLoading(false);
      if (onBuyNow) {
        onBuyNow(product, selectedSize, selectedColor || 'Standard', 1);
      } else {
        onQuickView(product);
      }
    }, 150);
  };

  const handleAddToCartAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompletelyOutOfStock) {
      showToast?.('This item is currently out of stock.', 'error');
      return;
    }
    playSiteSound('addToCart');
    if (onAddToCart) {
      onAddToCart(product, selectedSize || 'Free Size', selectedColor || 'Standard');
      showToast?.(`Added ${product.name} (${selectedSize}) to Bag!`, 'success');
    }
  };

  const activeVariantWithImages = product.variants?.find(
    (v) => v.color.toLowerCase() === selectedColor.toLowerCase() && v.images && v.images.length > 0
  );

  const displayImages = activeVariantWithImages?.images || product.images || [];

  const rawImageSrc = displayImages.length > 0 
    ? (displayImages[currentImageIndex] || displayImages[0])
    : '';

  const displayImageSrc = (!rawImageSrc || imageError) 
    ? CLEAN_IMAGE_COMING_SOON_SVG 
    : rawImageSrc;

  // Compute pricing dynamically based on selection
  const computedPrice = getProductPrice(product, selectedSize, selectedColor);
  const isVariantSelected = Boolean(product.variants?.find(v => v.color.toLowerCase() === selectedColor.toLowerCase() && v.size === selectedSize));
  const activeVariant = product.variants?.find(v => v.color.toLowerCase() === selectedColor.toLowerCase() && v.size === selectedSize);
  const originalPrice = isVariantSelected && activeVariant ? activeVariant.originalPrice : product.originalPrice;
  const currentPrice = isVariantSelected && activeVariant ? activeVariant.price : product.price;

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group bg-white/90 backdrop-blur-md rounded-2xl border border-neutral-200/80 shadow-sm hover:shadow-2xl hover:border-[#0B8F63]/30 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
    >
      {/* Top Image Box */}
      <div className="relative aspect-square w-full bg-gradient-to-br from-neutral-50 to-neutral-100/80 overflow-hidden flex items-center justify-center">
        {(!rawImageSrc || imageError) ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-neutral-50/90 border-b border-neutral-100">
            <div className="w-12 h-12 rounded-2xl bg-[#0B8F63]/10 text-[#0B8F63] flex items-center justify-center mb-2 shadow-inner">
              <ImageOff className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-neutral-800 tracking-wide uppercase">Real Image Coming Soon</span>
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
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Top Badges Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <OpenBoxDeliveryBadge product={product} variant="compact" />
          {currentPrice >= 999 && (
            <span className="bg-emerald-800 text-white text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-md shadow-sm">
              🚚 Free Delivery
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-[#0B8F63] text-white text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Best Seller
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-neutral-900 text-white text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm">
              New Arrival
            </span>
          )}
          {product.isLimitedStock && (
            <span className="bg-amber-500 text-white text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Limited Stock
            </span>
          )}
        </div>

        {/* Top Wishlist & Quick View Right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              playSiteSound('wishlist');
              onToggleWishlist(product);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
              isWishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-neutral-700 hover:text-rose-500 hover:bg-white'
            }`}
            aria-label="Add to wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-9 h-9 rounded-full bg-white/90 text-neutral-700 hover:text-[#0B8F63] hover:bg-white flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 duration-200"
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Image Swatcher Hover Preview Dots */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
            {displayImages.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentImageIndex === idx ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Discount Badge */}
        {(originalPrice > currentPrice) && (
          <div className="absolute bottom-3 left-3 bg-red-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded shadow-sm">
            {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% OFF
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Brand & Rating */}
          <div className="flex items-center justify-between text-xs min-h-[18px]">
            {product.brand && product.brand.trim().length > 0 ? (
              <span className="font-bold text-[#0B8F63] tracking-wide uppercase text-[11px]">
                {product.brand}
              </span>
            ) : <span />}
            {product.rating && product.rating > 0 ? (
              <div className="flex items-center gap-1 font-semibold text-neutral-800 text-[11px]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                {product.reviewsCount && product.reviewsCount > 0 ? (
                  <span className="text-neutral-400">({product.reviewsCount})</span>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-neutral-900 text-sm sm:text-base line-clamp-1 group-hover:text-[#0B8F63] transition-colors">
            {product.name}
          </h3>

          {/* Subcategory / Material */}
          <p className="text-xs text-neutral-500 line-clamp-1 font-medium">
            {product.subcategory} {product.material ? `• ${product.material}` : ''}
          </p>

          {/* Color Selector */}
          {product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
              <span className="text-[10px] font-semibold text-neutral-400">Colors:</span>
              <div className="flex items-center gap-1">
                {product.colors.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      selectedColor === c.name
                        ? 'ring-2 ring-offset-1 ring-[#0B8F63] scale-110'
                        : 'border-neutral-300'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Quick Selection Bar */}
          {sizeStocks.length > 0 && (
            <div className="pt-1.5" onClick={(e) => e.stopPropagation()}>
              <div className="text-[10px] font-semibold text-neutral-500 mb-1 flex justify-between">
                <span>Available Sizes:</span>
                <span className="font-bold text-[#0B8F63]">{selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {sizeStocks.filter((s) => s.isAvailable).slice(0, 6).map((item) => {
                  const isSelected = selectedSize === item.size;
                  const isInStock = item.inStock && item.stockQuantity > 0;

                  return (
                    <button
                      key={item.size}
                      disabled={!isInStock}
                      onClick={() => setSelectedSize(item.size)}
                      title={isInStock ? `Stock: ${item.stockQuantity}` : `${item.size} - Out of Stock`}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors relative ${
                        isSelected
                          ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-sm'
                          : isInStock
                          ? 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:border-neutral-400'
                          : 'bg-neutral-100 text-neutral-400 border-neutral-200 line-through cursor-not-allowed opacity-60'
                      }`}
                    >
                      {item.size}
                    </button>
                  );
                })}
                {sizeStocks.filter((s) => s.isAvailable).length > 6 && (
                  <span className="text-[10px] text-neutral-400 self-center font-bold">
                    +{sizeStocks.filter((s) => s.isAvailable).length - 6}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-2 border-t border-neutral-100 space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-serif-heading font-extrabold text-lg text-neutral-900">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {originalPrice > currentPrice && (
                <span className="text-xs text-neutral-400 line-through">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {isCompletelyOutOfStock ? (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                Out of Stock
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                In Stock
              </span>
            )}
          </div>

          {/* Action Buttons Section */}
          {isCompletelyOutOfStock ? (
            <button
              onClick={handleWhatsAppBuy}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Bell className="w-4 h-4 fill-white text-amber-600" />
              <span>NOTIFY ON WHATSAPP</span>
            </button>
          ) : (
            <div className="space-y-1.5">
              {/* Primary Action Button (Buy Now) */}
              {paymentSettings.enableBuyNow !== false && (
                <button
                  onClick={handleBuyNow}
                  disabled={isBuyNowLoading}
                  className="w-full text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-75"
                  style={{ backgroundColor: paymentSettings.buyNowButtonColor || '#0B8F63' }}
                >
                  {isBuyNowLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{paymentSettings.buyNowButtonText || 'BUY NOW'}</span>
                </button>
              )}

              {/* Secondary Buttons Row (WhatsApp & Add to Bag) */}
              <div className="grid grid-cols-2 gap-1.5">
                {paymentSettings.enableBuyWhatsApp !== false && (
                  <button
                    onClick={handleWhatsAppBuy}
                    className="w-full text-white font-bold text-[10px] sm:text-[11px] py-2 px-1.5 rounded-xl shadow-xs flex items-center justify-center gap-1 transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ backgroundColor: paymentSettings.buyWhatsAppButtonColor || '#25D366' }}
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span className="truncate">{paymentSettings.buyWhatsAppButtonText || 'WHATSAPP'}</span>
                  </button>
                )}

                {paymentSettings.enableAddToCart !== false && (
                  <button
                    onClick={handleAddToCartAction}
                    className="w-full text-white font-bold text-[10px] sm:text-[11px] py-2 px-1.5 rounded-xl shadow-xs flex items-center justify-center gap-1 transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ backgroundColor: paymentSettings.addToBagButtonColor || '#171717' }}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{paymentSettings.addToBagButtonText || 'ADD TO BAG'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
