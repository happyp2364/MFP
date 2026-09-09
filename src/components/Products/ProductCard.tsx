import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Heart,
  Eye,
  MessageCircle,
  Star,
  Sparkles,
  Flame,
  Bell,
  ImageOff,
  Zap,
  ShoppingBag,
  Loader2,
  Share2,
  Scale,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Product, ProductCardDesignerConfig, DEFAULT_PRODUCT_CARD_CONFIG } from '../../types';
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

// Authentic, recognizable WhatsApp icon (phone handset inside speech bubble)
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.15c-1.49 0-2.94-.4-4.21-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.136 8.136 0 01-1.25-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c.01 4.54-3.68 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.06 0 1.21.89 2.39 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.12-.23-.19-.48-.31z" />
  </svg>
);

export interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onAddToCart?: (product: Product, size: string, color: string) => void;
  onBuyNow?: (product: Product, size: string, color: string, quantity: number) => void;
  customConfig?: Partial<ProductCardDesignerConfig>;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onToggleWishlist,
  isWishlisted,
  onAddToCart,
  onBuyNow,
  customConfig,
}) => {
  const { playSiteSound, paymentSettings, showToast, productCardConfig } = useStore();

  // Merge designer settings (global store config or override for admin preview)
  const cfg: ProductCardDesignerConfig = useMemo(() => {
    return {
      ...DEFAULT_PRODUCT_CARD_CONFIG,
      ...(productCardConfig || {}),
      ...(customConfig || {}),
    };
  }, [productCardConfig, customConfig]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [isImageAnimating, setIsImageAnimating] = useState(false);

  const sizeStocks = normalizeProductSizeStocks(product);
  const isCompletelyOutOfStock = isProductCompletelyOutOfStock(product);

  const buttonRowRef = useRef<HTMLDivElement>(null);
  const [isCompactButton, setIsCompactButton] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return true;
  });

  useEffect(() => {
    const el = buttonRowRef.current;
    if (!el) return;

    const checkWidth = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        // Under ~220px row width (each button under ~107px in 2-col row),
        // use compact "Order from" to prevent compression or ellipsis.
        setIsCompactButton(rect.width < 220);
      }
    };

    checkWidth();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect.width;
          if (w > 0) {
            setIsCompactButton(w < 220);
          }
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    } else {
      window.addEventListener('resize', checkWidth);
      return () => window.removeEventListener('resize', checkWidth);
    }
  }, []);

  const [selectedSize, setSelectedSize] = useState<string>(
    getFirstAvailableInStockSize(product) || (product.sizes && product.sizes[0]) || 'Free Size'
  );

  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : 'Standard'
  );

  // Find images for the active selected color variant
  const activeVariantWithImages = useMemo(() => {
    return product.variants?.find(
      (v) =>
        v.color.toLowerCase() === selectedColor.toLowerCase() &&
        v.images &&
        v.images.length > 0
    );
  }, [product.variants, selectedColor]);

  const displayImages = useMemo(() => {
    if (activeVariantWithImages?.images && activeVariantWithImages.images.length > 0) {
      return activeVariantWithImages.images;
    }
    return product.images && product.images.length > 0 ? product.images : [];
  }, [activeVariantWithImages, product.images]);

  const rawImageSrc = displayImages.length > 0 ? displayImages[currentImageIndex] || displayImages[0] : '';
  const displayImageSrc = (!rawImageSrc || imageError) ? CLEAN_IMAGE_COMING_SOON_SVG : rawImageSrc;

  // Compute prices dynamically
  const computedPrice = getProductPrice(product, selectedSize, selectedColor);
  const activeVariant = product.variants?.find(
    (v) => v.color.toLowerCase() === selectedColor.toLowerCase() && v.size === selectedSize
  );
  const originalPrice = activeVariant?.originalPrice || product.originalPrice || product.price;
  const currentPrice = computedPrice || product.price;

  // Handle color variant switching with smooth slide/fade animation
  const handleColorChange = (colorName: string) => {
    if (colorName === selectedColor) return;
    if (cfg.enableVariantSlideAnimation) {
      setIsImageAnimating(true);
    }
    setSelectedColor(colorName);
    setCurrentImageIndex(0);
    setImageError(false);

    if (cfg.enableVariantSlideAnimation) {
      setTimeout(() => {
        setIsImageAnimating(false);
      }, 250);
    }
  };

  // Image Navigation
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (displayImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (displayImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  // Share action
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?product=${product.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Check out ${product.name} on Marudhar Fashion Point!`,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      showToast?.('Product link copied to clipboard!', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Compare action
  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsComparing((prev) => !prev);
    playSiteSound('click');
    showToast?.(
      !isComparing ? `Added ${product.name} to comparison list` : `Removed ${product.name} from comparison`,
      'info'
    );
  };

  // Buy Now
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

    setTimeout(() => {
      setIsBuyNowLoading(false);
      if (onBuyNow) {
        onBuyNow(product, selectedSize, selectedColor || 'Standard', 1);
      } else {
        onQuickView(product);
      }
    }, 150);
  };

  // Add To Cart
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

  // WhatsApp Order
  const handleWhatsAppBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSiteSound('addToCart');
    const link = generateProductWhatsAppLink(product, selectedSize, selectedColor);
    window.open(link, '_blank');
  };

  // Styling helper calculations based on config presets
  const getStyleClasses = () => {
    let base = 'group cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col justify-between ';

    // Corner Radius
    base += `${cfg.cornerRadius} `;

    // Shadow
    if (cfg.shadowIntensity === 'shadow-sm') base += 'shadow-sm ';
    else if (cfg.shadowIntensity === 'shadow-md') base += 'shadow-md ';
    else if (cfg.shadowIntensity === 'shadow-lg') base += 'shadow-lg ';
    else if (cfg.shadowIntensity === 'shadow-2xl') base += 'shadow-2xl ';

    // Hover Lift & Scale
    if (cfg.enableLiftOnHover) base += 'hover:-translate-y-1.5 ';
    if (cfg.enableScaleOnHover) base += 'hover:scale-[1.015] ';

    // Card Style Presets
    switch (cfg.cardStyle) {
      case 'mbh_3d_glass':
        base += 'bg-white/95 dark:bg-neutral-900/90 backdrop-blur-xl border border-white/60 dark:border-neutral-800 hover:border-[#0B8F63]/40 hover:shadow-[0_20px_40px_-15px_rgba(11,143,99,0.25)] ';
        break;
      case 'luxury_elevated':
        base += 'bg-[#FAF9F6] border border-amber-900/10 hover:border-amber-700/30 hover:shadow-2xl ';
        break;
      case 'minimal_clean':
        base += 'bg-white border border-neutral-200 hover:border-neutral-900 ';
        break;
      case 'borderless_modern':
        base += 'bg-neutral-100/80 border-none hover:bg-white hover:shadow-xl ';
        break;
      default:
        base += 'bg-white border border-neutral-200 hover:border-[#0B8F63]/40 ';
    }

    // Font Family
    if (cfg.fontFamily === 'serif') base += 'font-serif ';
    else if (cfg.fontFamily === 'mono') base += 'font-mono ';
    else base += 'font-sans ';

    return base;
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className={getStyleClasses()}
      style={{
        borderRadius: 'var(--mfp-product-card-radius)',
        padding: 'var(--mfp-product-card-padding)',
        transitionDuration:
          cfg.animationSpeed === 'fast'
            ? '200ms'
            : cfg.animationSpeed === 'slow'
            ? '500ms'
            : '350ms',
      }}
    >
      {/* Glow Effect Accent Background on Hover */}
      {cfg.enableGlowEffect && (
        <div className="absolute -inset-1 bg-gradient-to-r from-[#0B8F63]/20 via-emerald-400/20 to-teal-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" />
      )}

      {/* Top Image Box */}
      <div
        className={`relative ${cfg.aspectRatio} w-full bg-neutral-50 overflow-hidden flex items-center justify-center`}
        style={{
          borderRadius: 'var(--mfp-product-image-radius)',
        }}
      >
        {(!rawImageSrc || imageError) ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-neutral-50/90">
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
            style={{ filter: 'brightness(101%) contrast(103%)' }}
            className={`w-full h-full object-cover object-center transition-all duration-500 ease-out ${
              cfg.enableImageZoom ? 'group-hover:scale-110' : ''
            } ${isImageAnimating ? 'scale-95 opacity-50 blur-xs' : 'scale-100 opacity-100'}`}
            referrerPolicy="no-referrer"
          />
        )}

        {/* Multiple Image Gallery Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-neutral-800 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-neutral-800 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Top Left Badges */}
        {cfg.showBadges && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <OpenBoxDeliveryBadge product={product} variant="compact" />
            {currentPrice >= 999 && (
              <span className="bg-emerald-800 text-white text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-md shadow-sm">
                🚚 फ्री डिलीवरी • Free Delivery
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-[#0B8F63] text-white text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                बेस्ट सेलर • Best Seller
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-neutral-900 text-white text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md shadow-sm">
                नया • New
              </span>
            )}
            {product.isLimitedStock && (
              <span className="bg-amber-500 text-white text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                <Flame className="w-3 h-3" />
                सीमित स्टॉक • Limited
              </span>
            )}
          </div>
        )}

        {/* Top Right Quick Action Icons (Wishlist, QuickView, Share, Compare) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {cfg.showWishlist && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                playSiteSound('wishlist');
                onToggleWishlist(product);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                isWishlisted
                  ? 'bg-rose-500 text-white scale-110'
                  : 'bg-white/90 text-neutral-700 hover:text-rose-500 hover:bg-white hover:scale-105'
              }`}
              aria-label="Add to wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>
          )}

          {cfg.showQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-8 h-8 rounded-full bg-white/90 text-neutral-700 hover:text-[#0B8F63] hover:bg-white flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 duration-200 hover:scale-105"
              aria-label="Quick view"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {cfg.showShareButton && (
            <button
              onClick={handleShare}
              className={`w-8 h-8 rounded-full bg-white/90 text-neutral-700 hover:text-blue-600 hover:bg-white flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 duration-200 hover:scale-105 ${
                isCopied ? 'bg-emerald-500 text-white opacity-100' : ''
              }`}
              aria-label="Share product"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {cfg.showCompareButton && (
            <button
              onClick={handleCompare}
              className={`w-8 h-8 rounded-full bg-white/90 text-neutral-700 hover:text-purple-600 hover:bg-white flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 duration-200 hover:scale-105 ${
                isComparing ? 'bg-purple-600 text-white opacity-100' : ''
              }`}
              aria-label="Compare product"
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Gallery Image Dots Preview */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md">
            {displayImages.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentImageIndex === idx ? 'bg-white w-4' : 'bg-white/50 w-1.5'
                }`}
              />
            ))}
          </div>
        )}

        {/* Discount Badge Tag */}
        {cfg.showDiscountTag && originalPrice > currentPrice && (
          <div className="absolute bottom-3 left-3 bg-red-600 text-white font-extrabold text-[10px] sm:text-[11px] px-2 py-0.5 rounded shadow-sm">
            {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% OFF
          </div>
        )}
      </div>

      {/* Product Information Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Brand & Rating Header */}
          <div className="flex items-center justify-between text-xs min-h-[18px]">
            {cfg.showBrand && product.brand && product.brand.trim().length > 0 ? (
              <span className="font-extrabold text-[#0B8F63] tracking-widest uppercase text-[10px] sm:text-[11px]">
                {product.brand}
              </span>
            ) : (
              <span />
            )}

            {cfg.showRating && product.rating && product.rating > 0 ? (
              <div className="flex items-center gap-1 font-semibold text-neutral-800 text-[11px]">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                {product.reviewsCount && product.reviewsCount > 0 ? (
                  <span className="text-neutral-600 font-medium">({product.reviewsCount})</span>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-neutral-900 dark:text-white text-sm sm:text-base line-clamp-1 group-hover:text-[#0B8F63] dark:group-hover:text-emerald-400 transition-colors">
            {product.name}
          </h3>

          {/* Subcategory & Material */}
          <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-1 font-medium">
            {product.subcategory} {product.material ? `• ${product.material}` : ''}
          </p>

          {/* Interactive Color Swatches */}
          {cfg.showColorSwatches && product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
              <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">Colors:</span>
              <div className="flex items-center gap-1.5">
                {product.colors.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleColorChange(c.name)}
                    className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                      selectedColor === c.name
                        ? 'ring-2 ring-offset-1 ring-[#0B8F63] scale-110 shadow-xs'
                        : 'border-neutral-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Interactive Size Availability Selector */}
          {cfg.showSizeSelector && sizeStocks.length > 0 && (
            <div className="pt-1.5" onClick={(e) => e.stopPropagation()}>
              <div className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 mb-1 flex justify-between uppercase tracking-wider">
                <span>Sizes:</span>
                <span className="font-extrabold text-[#0B8F63] dark:text-emerald-400">{selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {sizeStocks
                  .filter((s) => s.isAvailable)
                  .slice(0, 6)
                  .map((item) => {
                    const isSelected = selectedSize === item.size;
                    const isInStock = item.inStock && item.stockQuantity > 0;

                    return (
                      <button
                        key={item.size}
                        disabled={!isInStock}
                        onClick={() => setSelectedSize(item.size)}
                        title={isInStock ? `In Stock: ${item.stockQuantity}` : `${item.size} Out of Stock`}
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded border transition-all ${
                          isSelected
                            ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-xs scale-105'
                            : isInStock
                            ? 'bg-neutral-50 dark:bg-neutral-800/90 text-neutral-800 dark:text-neutral-100 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-white dark:hover:bg-neutral-700'
                            : 'bg-neutral-100 dark:bg-neutral-900/80 text-neutral-400 dark:text-neutral-500 border-neutral-200 dark:border-neutral-800 line-through cursor-not-allowed opacity-75'
                        }`}
                      >
                        {item.size}
                      </button>
                    );
                  })}
                {sizeStocks.filter((s) => s.isAvailable).length > 6 && (
                  <span className="text-[10px] text-neutral-600 dark:text-neutral-400 self-center font-bold">
                    +{sizeStocks.filter((s) => s.isAvailable).length - 6}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Actions Footer */}
        <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/80 space-y-2">
          {/* Price & Stock Badge Row */}
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-black text-xl sm:text-2xl text-neutral-950 dark:text-white tracking-tight leading-none product-card-sale-price">
                ₹{(currentPrice ?? 0).toLocaleString('en-IN')}
              </span>
              {originalPrice > currentPrice && (
                <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 line-through font-bold product-card-mrp-price">
                  ₹{(originalPrice ?? 0).toLocaleString('en-IN')}
                </span>
              )}
              {originalPrice > currentPrice && (
                <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900/60">
                  {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% छूट
                </span>
              )}
            </div>

            {cfg.showStockStatus && (
              isCompletelyOutOfStock ? (
                <span className="text-[10px] font-extrabold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 px-2 py-0.5 rounded shrink-0">
                  स्टॉक समाप्त • Out of Stock
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-900/60 px-1.5 py-0.5 rounded shrink-0">
                  उपलब्ध • In Stock
                </span>
              )
            )}
          </div>

          {/* Action Buttons */}
          {isCompletelyOutOfStock ? (
            <button
              onClick={handleWhatsAppBuy}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Bell className="w-4 h-4 fill-white text-amber-600" />
              <span>व्हाट्सऐप पर सूचित करें • NOTIFY</span>
            </button>
          ) : (
            <div className="space-y-1.5">
              {/* Primary Buy Now Button */}
              {cfg.showBuyNow && paymentSettings.enableBuyNow !== false && (
                <button
                  onClick={handleBuyNow}
                  disabled={isBuyNowLoading}
                  className="btn-liquid-base btn-liquid-emerald w-full text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-75 cursor-pointer"
                  style={{
                    backgroundColor: cfg.buyNowColor || paymentSettings.buyNowButtonColor || '#0B8F63',
                  }}
                >
                  {isBuyNowLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{cfg.buyNowText || paymentSettings.buyNowButtonText || 'अभी खरीदें • BUY NOW'}</span>
                </button>
              )}

              {/* Secondary Buttons Row */}
              <div
                ref={buttonRowRef}
                className={`w-full ${
                  cfg.showAddToCart && paymentSettings.enableAddToCart !== false
                    ? 'grid grid-cols-2 gap-1.5'
                    : 'flex'
                }`}
              >
                {paymentSettings.enableBuyWhatsApp !== false && (
                  <button
                    type="button"
                    onClick={handleWhatsAppBuy}
                    aria-label="Order on WhatsApp"
                    title="Order on WhatsApp"
                    className="btn-liquid-base btn-liquid-emerald w-full text-white font-bold text-[10.5px] sm:text-[11px] py-2 px-1.5 sm:px-2 rounded-xl shadow-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap min-w-0 select-none"
                    style={{
                      backgroundColor: cfg.whatsAppColor || paymentSettings.buyWhatsAppButtonColor || '#25D366',
                    }}
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 shrink-0 fill-current" />
                    <span className="whitespace-nowrap font-bold tracking-tight">
                      {isCompactButton ? (
                        <>
                          <span className="hidden xl:inline">Order on WhatsApp</span>
                          <span className="xl:hidden">Order from</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">
                            {cfg.whatsAppText || paymentSettings.buyWhatsAppButtonText || 'Order on WhatsApp'}
                          </span>
                          <span className="sm:hidden">Order from</span>
                        </>
                      )}
                    </span>
                  </button>
                )}

                {cfg.showAddToCart && paymentSettings.enableAddToCart !== false && (
                  <button
                    type="button"
                    onClick={handleAddToCartAction}
                    aria-label="Add to Bag"
                    title="Add to Bag"
                    className="btn-liquid-base btn-liquid-dark w-full text-white font-bold text-[10.5px] sm:text-[11px] py-2 px-1.5 sm:px-2 rounded-xl shadow-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap min-w-0 select-none"
                    style={{
                      backgroundColor: cfg.addToCartColor || paymentSettings.addToBagButtonColor || '#171717',
                    }}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-nowrap font-bold tracking-tight">
                      {isCompactButton ? (
                        <>
                          <span className="hidden sm:inline">Add to Bag</span>
                          <span className="sm:hidden">Add</span>
                        </>
                      ) : (
                        cfg.addToCartText || paymentSettings.addToBagButtonText || 'Add to Bag'
                      )}
                    </span>
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

export const ProductCard = React.memo(ProductCardComponent);
