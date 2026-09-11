import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { AnnouncementBar } from './components/Header/AnnouncementBar';
import { Navbar } from './components/Header/Navbar';
import { HorizontalCategoryBar } from './components/Header/HorizontalCategoryBar';
import { MobileScrollableCategories } from './components/Categories/MobileScrollableCategories';
import { HeroSection } from './components/Hero/HeroSection';
import { CategorySection } from './components/Categories/CategorySection';
import { ProductGrid } from './components/Products/ProductGrid';
import { ProductCarousel } from './components/Carousels/ProductCarousel';
import { TrendingCollections } from './components/Collections/TrendingCollections';
import { TrendingShoesSection } from './components/Collections/TrendingShoesSection';
import { PricePointCollectionSection } from './components/Collections/PricePointCollectionSection';
import { ReviewsSection } from './components/Reviews/ReviewsSection';
import { AboutSection } from './components/About/AboutSection';
import { ContactSection } from './components/Contact/ContactSection';
import { InstagramFeed } from './components/Social/InstagramFeed';
import { InstagramPhoneReelSection } from './components/Social/InstagramPhoneReelSection';
import { SocialFollowCTA } from './components/Social/SocialFollowCTA';
import { Footer } from './components/Footer/Footer';
import { FloatingActionHub } from './components/FloatingActions/FloatingActionHub';
import { AIPetShoeMascot } from './components/Mascot/AIPetShoeMascot';
import { QuickViewModal } from './components/Products/QuickViewModal';
import { OrderSheet } from './components/Cart/OrderSheet';
import { LiveSearchModal } from './components/Search/LiveSearchModal';
import { WishlistModal } from './components/Wishlist/WishlistModal';
import { AdminErrorBoundary } from './components/Admin/AdminErrorBoundary';
import { FloatingAdminButton } from './components/Admin/FloatingAdminButton';
import { SEOLiveScoreWidget } from './components/Admin/SEOLiveScoreWidget';
import { SEOSchemaInjector } from './components/SEO/SEOSchemaInjector';
import { CheckoutModal } from './components/Checkout/CheckoutModal';
import { CheckoutErrorBoundary } from './components/Checkout/CheckoutErrorBoundary';
import { OrderPaymentPage } from './components/Checkout/OrderPaymentPage';
import { PaymentErrorBoundary } from './components/Checkout/PaymentErrorBoundary';
import { CustomerAuthGuardModal } from './components/Customer/CustomerAuthGuardModal';
import { CustomerAccountModal } from './components/Customer/CustomerAccountModal';
import { SoundSettingsModal } from './components/Customer/SoundSettingsModal';
import { ProductDetailPage } from './components/Products/ProductDetailPage';
import { HomepageRenderer } from './components/Customer/HomepageRenderer';
import { lazyWithRetry } from './utils/lazyWithRetry';
import { getProductTypes, matchesAnyProductType } from './utils/productTypeUtils';

// Lazy loaded modals with retry protection to prevent dynamic import fetch errors
const AdminLoginModal = lazyWithRetry<typeof import('./components/Admin/AdminLoginModal').AdminLoginModal>(
  () => import('./components/Admin/AdminLoginModal'),
  'AdminLoginModal'
);
const AdminDashboardModal = lazyWithRetry<typeof import('./components/Admin/AdminDashboardModal').AdminDashboardModal>(
  () => import('./components/Admin/AdminDashboardModal'),
  'AdminDashboardModal'
);
const CalendarBookingModal = lazyWithRetry<typeof import('./components/GoogleWorkspace/CalendarBookingModal').CalendarBookingModal>(
  () => import('./components/GoogleWorkspace/CalendarBookingModal'),
  'CalendarBookingModal'
);
const GmailInquiryModal = lazyWithRetry<typeof import('./components/GoogleWorkspace/GmailInquiryModal').GmailInquiryModal>(
  () => import('./components/GoogleWorkspace/GmailInquiryModal'),
  'GmailInquiryModal'
);
const WorkspaceHubDrawer = lazyWithRetry<typeof import('./components/GoogleWorkspace/WorkspaceHubDrawer').WorkspaceHubDrawer>(
  () => import('./components/GoogleWorkspace/WorkspaceHubDrawer'),
  'WorkspaceHubDrawer'
);
const StoreLocatorPage = lazyWithRetry<typeof import('./components/StoreLocator/StoreLocatorPage').StoreLocatorPage>(
  () => import('./components/StoreLocator/StoreLocatorPage'),
  'StoreLocatorPage'
);
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useWebsiteDesign } from './context/WebsiteDesignContext';
import { SectionResponsiveConfig } from './types/websiteDesign';
import { ScratchCardPopup } from './components/Promo/ScratchCardPopup';
import { SpinWheelPopup } from './components/Promo/SpinWheelPopup';
import { OrderSuccessCelebration } from './components/Promo/OrderSuccessCelebration';
import { useStore } from './context/StoreContext';
import { Product, FilterState, GenderCategory, CartItem, ProductVariant } from './types';
import { findProductBySlugOrId, getProductSlug } from './utils/productUtils';
import { deduplicateProducts, sortProductsWithSmartMix } from './utils/productFeedOptimizer';
import { getCartItemPrice } from './utils/variantUtils';
import { SEOHead } from './components/SEO/SEOHead';
import { generateOrganizationSchema, generateLocalBusinessSchema, generateBreadcrumbSchema, generateFAQSchema } from './utils/seo';
import { db } from './lib/firebase';
import { doc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';

// =============================================================
// ISOLATED DIRECT ORDER PAYMENT VIEW
// =============================================================
interface PaymentRouteViewProps {
  orderId: string;
  onBackHome: () => void;
}

function PaymentRouteView({ orderId, onBackHome }: PaymentRouteViewProps) {
  const { backgroundGradientClass } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-1000 selection:bg-[#0B8F63] selection:text-white relative overflow-x-hidden ${backgroundGradientClass}`}>
      <SEOHead 
        title={`Order Payment #${orderId} | Marudhar Fashion Point`}
        description="Complete your secure order payment via UPI, QR, Card, or Netbanking."
      />
      <PaymentErrorBoundary
        orderId={orderId}
        onBackHome={onBackHome}
      >
        <OrderPaymentPage
          orderId={orderId}
          onBackHome={onBackHome}
        />
      </PaymentErrorBoundary>
    </div>
  );
}

// =============================================================
// STOREFRONT APPLICATION VIEW
// =============================================================
function StorefrontView() {
  const { products, isAdmin, toastMessage, productFeedConfig, seoConfig, customerUser, showToast, playSiteSound } = useStore();
  const { backgroundGradientClass } = useTheme();
  const { draftDesignSettings } = useWebsiteDesign();

  // --- STATE ---
  const [activeCategory, setActiveCategory] = useState<GenderCategory>('all');
  const [isShopActive, setIsShopActive] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    subcategories: [],
    priceRange: [500, 5000],
    colors: [],
    sizes: [],
    badgeFilter: 'all',
    collection: '',
    sortBy: 'featured',
  });

  const getInitialWishlistIds = (): string[] => {
    try {
      const saved = localStorage.getItem('mfp_wishlist');
      if (!saved) return [];
      if (saved === '["mfp-m01","mfp-w01"]' || saved === '["mfp-m01", "mfp-w01"]') {
        try { localStorage.setItem('mfp_wishlist', JSON.stringify([])); } catch {}
        return [];
      }
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return Array.from(new Set(parsed.map((id: any) => String(id)).filter(Boolean)));
      }
      return [];
    } catch {
      return [];
    }
  };

  const [wishlistIds, setWishlistIds] = useState<string[]>(getInitialWishlistIds);

  // Realtime Firestore sync for customer wishlist under users/{uid}/wishlist
  useEffect(() => {
    if (!customerUser) {
      try {
        const saved = localStorage.getItem('mfp_wishlist');
        if (saved) {
          if (saved === '["mfp-m01","mfp-w01"]' || saved === '["mfp-m01", "mfp-w01"]') {
            try { localStorage.setItem('mfp_wishlist', JSON.stringify([])); } catch {}
            setWishlistIds([]);
          } else {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setWishlistIds(Array.from(new Set(parsed.map((id: any) => String(id)).filter(Boolean))));
            } else {
              setWishlistIds([]);
            }
          }
        } else {
          setWishlistIds([]);
        }
      } catch {
        setWishlistIds([]);
      }
      return;
    }

    const wishlistColRef = collection(db, 'users', customerUser.uid, 'wishlist');
    const unsub = onSnapshot(
      wishlistColRef,
      (snapshot) => {
        const ids = snapshot.docs.map((d) => d.id);
        const cleanIds = Array.from(new Set(ids.map((id) => String(id)).filter(Boolean)));
        setWishlistIds(cleanIds);
        try {
          localStorage.setItem('mfp_wishlist', JSON.stringify(cleanIds));
        } catch {}
      },
      (err) => {
        console.warn('Wishlist Firestore onSnapshot error:', err);
      }
    );

    return () => unsub();
  }, [customerUser]);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => 
    products.length > 0 ? [
      {
        product: products[0],
        selectedSize: '8',
        selectedColor: 'Forest Green',
        quantity: 1,
      },
    ] : []
  );
  const [directCheckoutItems, setDirectCheckoutItems] = useState<CartItem[] | null>(null);

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [orderSheetOpen, setOrderSheetOpen] = useState(false);
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState<any>(undefined);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [authGuardOpen, setAuthGuardOpen] = useState(false);
  const [pendingBuyNowAction, setPendingBuyNowAction] = useState<{
    product: Product;
    size: string;
    color: string;
    quantity: number;
    selectedVariant?: ProductVariant;
  } | null>(null);
  const [customerAccountOpen, setCustomerAccountOpen] = useState(false);
  const [soundSettingsOpen, setSoundSettingsOpen] = useState(false);
  const [storeLocatorOpen, setStoreLocatorOpen] = useState(false);

  // Google Workspace Modals
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [gmailModalOpen, setGmailModalOpen] = useState(false);
  const [workspaceHubOpen, setWorkspaceHubOpen] = useState(false);

  // --- DYNAMIC PUBLIC PRODUCT URL ROUTING ---
  const [productRouteSlug, setProductRouteSlug] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    if (path.startsWith('/product/')) {
      const rawSlug = path.replace('/product/', '').split('/')[0].split('?')[0];
      if (rawSlug) return decodeURIComponent(rawSlug);
    }
    const searchParams = new URLSearchParams(window.location.search);
    const queryProduct = searchParams.get('product');
    if (queryProduct) return decodeURIComponent(queryProduct);
    return null;
  });

  const scratchCurrentPath = productRouteSlug
    ? `/product/${productRouteSlug}`
    : checkoutModalOpen
    ? '/checkout'
    : '/';
  const scratchCartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + getCartItemPrice(item) * item.quantity, 0);
  }, [cartItems]);

  React.useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);

      // Product Route
      if (path.startsWith('/product/')) {
        const rawSlug = path.replace('/product/', '').split('/')[0].split('?')[0];
        if (rawSlug) {
          setProductRouteSlug(decodeURIComponent(rawSlug));
          return;
        }
      }

      const queryProduct = searchParams.get('product');
      if (queryProduct) {
        setProductRouteSlug(decodeURIComponent(queryProduct));
        return;
      }

      if (window.location.hash.startsWith('#/product/')) {
        const hashSlug = window.location.hash.replace('#/product/', '').split('?')[0];
        if (hashSlug) {
          setProductRouteSlug(decodeURIComponent(hashSlug));
          return;
        }
      }

      setProductRouteSlug(null);
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Global hotkey shortcut to open Admin Login: Ctrl + Alt + A (or Cmd + Opt + A on Mac)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setAdminLoginOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Matched product for active URL route
  const activeRouteProduct = useMemo(() => {
    if (!productRouteSlug || !products || products.length === 0) return null;
    return findProductBySlugOrId(products, productRouteSlug);
  }, [products, productRouteSlug]);

  // Sync address bar URL when quickViewProduct opens or closes
  React.useEffect(() => {
    if (quickViewProduct) {
      const slug = getProductSlug(quickViewProduct);
      const targetUrl = `/product/${slug}`;
      if (window.location.pathname !== targetUrl) {
        window.history.pushState({ productId: quickViewProduct.id }, '', targetUrl);
      }
    } else {
      if (!productRouteSlug && window.location.pathname.startsWith('/product/')) {
        window.history.pushState({}, '', '/');
      }
    }
  }, [quickViewProduct, productRouteSlug]);

  // --- HANDLERS ---
  const handleUpdateFilter = (updated: Partial<FilterState>) => {
    setFilterState((prev) => {
      const newFilters = { ...prev, ...updated };
      if (updated.category !== undefined) {
        setActiveCategory(updated.category);
      }
      return newFilters;
    });
  };

  const handleResetFilters = () => {
    setFilterState({
      searchQuery: '',
      category: 'all',
      subcategories: [],
      priceRange: [500, 5000],
      colors: [],
      sizes: [],
      badgeFilter: 'all',
      collection: '',
      sortBy: 'featured',
    });
    setActiveCategory('all');
    setIsShopActive(false);
  };

  const handleSelectCategory = (cat: GenderCategory) => {
    setActiveCategory(cat);
    setFilterState((prev) => ({
      ...prev,
      category: cat,
      subcategories: [], // reset subcategories on category change
    }));
    if (cat !== 'all') {
      setIsShopActive(true);
    }
    if (productRouteSlug) {
      setProductRouteSlug(null);
      window.history.pushState({}, '', '/');
    }
  };

  const handleSelectSubcategory = (sub: string, cat: GenderCategory) => {
    setActiveCategory(cat);
    setFilterState((prev) => ({
      ...prev,
      category: cat,
      subcategories: [sub],
    }));
    setIsShopActive(true);
    if (productRouteSlug) {
      setProductRouteSlug(null);
      window.history.pushState({}, '', '/');
    }
    handleNavigateToSection('products');
  };

  const handleToggleWishlist = async (product: Product) => {
    if (!product || !product.id) return;

    const rawId = product.id;
    const strId = String(rawId);
    const isCurrentlyWishlisted = wishlistIds.some((id) => id === rawId || String(id) === strId);

    // Optimistic UI update supporting string/number IDs
    const updatedWishlistIds = isCurrentlyWishlisted
      ? wishlistIds.filter((id) => id !== rawId && String(id) !== strId)
      : [...wishlistIds, strId];

    setWishlistIds(updatedWishlistIds);
    try {
      localStorage.setItem('mfp_wishlist', JSON.stringify(updatedWishlistIds));
    } catch {}

    if (playSiteSound) playSiteSound('wishlist');

    // Guest user handling
    if (!customerUser) {
      if (isCurrentlyWishlisted) {
        if (showToast) showToast(`Removed "${product.name}" from wishlist`, 'info');
      } else {
        if (showToast) showToast(`Saved "${product.name}" to wishlist! Sign in to sync across devices.`, 'success');
      }
      return;
    }

    // Logged in customer handling
    try {
      const docRef = doc(db, 'users', customerUser.uid, 'wishlist', strId);
      if (isCurrentlyWishlisted) {
        await deleteDoc(docRef);
        if (showToast) showToast(`Removed "${product.name}" from wishlist`, 'info');
      } else {
        await setDoc(docRef, {
          productId: strId,
          productName: product.name,
          price: product.price,
          image: (product as any).primaryImage || product.images?.[0] || '',
          addedAt: new Date().toISOString(),
        });
        if (showToast) showToast(`Saved "${product.name}" to wishlist!`, 'success');
      }
    } catch (err) {
      console.warn('Failed to update wishlist in Firestore:', err);
    }
  };

  const handleAddToCart = (product: Product, size: string, color: string, selectedVariant?: ProductVariant) => {
    let variant = selectedVariant;
    if (!variant && product.variants && product.variants.length > 0) {
      variant = product.variants.find(
        (v) => v.color.toLowerCase() === color.toLowerCase() && v.size.toString() === size.toString()
      );
    }

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += 1;
        if (variant) {
          copy[existingIndex].selectedVariant = variant;
        }
        return copy;
      }

      return [
        ...prev,
        {
          product,
          selectedSize: size || product.sizes[0] || 'Standard',
          selectedColor: color || (product.colors[0] ? product.colors[0].name : 'Standard'),
          quantity: 1,
          selectedVariant: variant,
        },
      ];
    });
  };

  const handleBuyNow = (product: Product, size: string, color: string, quantity: number = 1, selectedVariant?: ProductVariant) => {
    if (!product) {
      showToast?.('Product information is missing.', 'error');
      return;
    }
    const safeProduct = {
      ...product,
      price: typeof product.price === 'number' ? product.price : Number(product.price) || 0,
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [''],
      name: product.name || 'Product',
      sizes: Array.isArray(product.sizes) ? product.sizes : ['Standard'],
      colors: Array.isArray(product.colors) ? product.colors : [],
      variants: Array.isArray(product.variants) ? product.variants : [],
    };

    const chosenSize = size || (safeProduct.sizes && safeProduct.sizes[0]) || 'Standard';
    const chosenColor = color || (safeProduct.colors && safeProduct.colors[0] ? safeProduct.colors[0].name : 'Standard');

    let variant = selectedVariant;
    if (!variant && safeProduct.variants && safeProduct.variants.length > 0) {
      variant = safeProduct.variants.find(
        (v) => v.color && chosenColor && v.color.toLowerCase() === chosenColor.toLowerCase() && v.size && v.size.toString() === chosenSize.toString()
      );
    }

    if (!customerUser) {
      setPendingBuyNowAction({
        product: safeProduct,
        size: chosenSize,
        color: chosenColor,
        quantity: quantity > 0 ? quantity : 1,
        selectedVariant: variant,
      });
      setAuthGuardOpen(true);
      return;
    }

    setDirectCheckoutItems([
      {
        product: safeProduct,
        selectedSize: chosenSize,
        selectedColor: chosenColor,
        quantity: quantity > 0 ? quantity : 1,
        selectedVariant: variant,
      },
    ]);
    setCheckoutModalOpen(true);
  };

  const handleAuthGuardSuccess = () => {
    setAuthGuardOpen(false);
    if (pendingBuyNowAction) {
      const { product, size, color, quantity, selectedVariant } = pendingBuyNowAction;
      setPendingBuyNowAction(null);
      setDirectCheckoutItems([
        {
          product,
          selectedSize: size,
          selectedColor: color,
          quantity,
          selectedVariant,
        },
      ]);
      setCheckoutModalOpen(true);
    }
  };

  const handleUpdateCartQuantity = (id: string, size: string, color: string, qty: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === id && item.selectedSize === size && item.selectedColor === color
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const handleRemoveCartItem = (id: string, size: string, color: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === id && item.selectedSize === size && item.selectedColor === color)
      )
    );
  };

  const handleNavigateToSection = (sectionId: string) => {
    if (sectionId === 'products') {
      setIsShopActive(true);
      setTimeout(() => {
        const el = document.getElementById('products');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
      return;
    }

    if (isShopActive) {
      setIsShopActive(false);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'hero' || sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectCollection = (collectionId: string) => {
    setFilterState((prev) => ({
      ...prev,
      collection: collectionId,
    }));
    if (productRouteSlug) {
      setProductRouteSlug(null);
      window.history.pushState({}, '', '/');
    }
    handleNavigateToSection('products');
  };

  // --- FILTERED SUBCATEGORIES & PRODUCT TYPES ---
  const availableSubcategories = useMemo(() => {
    let relevantProducts = products;
    if (filterState.category !== 'all') {
      relevantProducts = products.filter((p) => p.category === filterState.category);
    }
    const subs = new Set<string>();
    relevantProducts.forEach((p) => {
      const types = getProductTypes(p);
      types.forEach((t) => subs.add(t));
    });
    return Array.from(subs);
  }, [filterState.category, products]);

  // --- FILTERED PRODUCTS ---
  const filteredProducts = useMemo(() => {
    const rawFiltered = products.filter((p) => {
      // Gender Category
      if (filterState.category !== 'all' && p.category !== filterState.category) {
        return false;
      }

      // Subcategories & Multiple Product Types (matches if product has ANY of the selected types)
      if (
        filterState.subcategories.length > 0 &&
        !matchesAnyProductType(p, filterState.subcategories)
      ) {
        return false;
      }

      // Max Price
      if (p.price > filterState.priceRange[1]) {
        return false;
      }

      // Colors
      if (filterState.colors.length > 0) {
        const hasColor = p.colors.some((c) => filterState.colors.includes(c.name));
        if (!hasColor) return false;
      }

      // Sizes
      if (filterState.sizes.length > 0) {
        const hasSize = p.sizes.some((sz) => filterState.sizes.includes(sz));
        if (!hasSize) return false;
      }

      // Badge Filter
      if (filterState.badgeFilter === 'bestsellers' && !p.isBestSeller) return false;
      if (filterState.badgeFilter === 'new' && !p.isNewArrival) return false;
      if (filterState.badgeFilter === 'limited' && !p.isLimitedStock) return false;

      // Collection Filter
      if (filterState.collection) {
        const colMatch = p.collectionTags.some(
          (tag) => tag.toLowerCase() === filterState.collection.toLowerCase()
        );
        if (!colMatch) return false;
      }

      // Search Query
      if (filterState.searchQuery) {
        const q = filterState.searchQuery.toLowerCase();
        const pTypes = getProductTypes(p);
        const typesMatch = pTypes.some((t) => t.toLowerCase().includes(q));
        const match =
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          typesMatch ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });

    // Deduplicate Products
    const unique = deduplicateProducts(rawFiltered, productFeedConfig);

    // Sort Products
    if (filterState.sortBy === 'price-low') return [...unique].sort((a, b) => a.price - b.price);
    if (filterState.sortBy === 'price-high') return [...unique].sort((a, b) => b.price - a.price);
    if (filterState.sortBy === 'rating') return [...unique].sort((a, b) => b.rating - a.rating);
    if (filterState.sortBy === 'newest') return [...unique].sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    if (filterState.sortBy === 'discount') return [...unique].sort((a, b) => b.discountPercent - a.discountPercent);

    // Default 'featured' ranking utilizes the smart mix weighted algorithm
    return sortProductsWithSmartMix(unique, productFeedConfig, filterState.sortBy);
  }, [filterState, products, productFeedConfig]);

  const showShopView = useMemo(() => {
    return isShopActive ||
      activeCategory !== 'all' ||
      filterState.searchQuery !== '' ||
      filterState.subcategories.length > 0 ||
      filterState.colors.length > 0 ||
      filterState.sizes.length > 0 ||
      filterState.badgeFilter !== 'all' ||
      filterState.collection !== '';
  }, [isShopActive, activeCategory, filterState]);

  // Carousels Products (Limited to 8 products per homepage limit as requested)
  const bestSellers = useMemo(() => {
    const raw = products.filter((p) => p.isBestSeller);
    const unique = deduplicateProducts(raw, productFeedConfig);
    if (unique.length === 0) {
      return products.slice(0, 8);
    }
    return unique.slice(0, 8);
  }, [products, productFeedConfig]);

  const newArrivals = useMemo(() => {
    const raw = products.filter((p) => p.isNewArrival);
    const unique = deduplicateProducts(raw, productFeedConfig);
    if (unique.length === 0) {
      return products.slice(4, 12);
    }
    return unique.slice(0, 8);
  }, [products, productFeedConfig]);

  const featuredProducts = useMemo(() => {
    const raw = products.filter((p) => p.isFeatured);
    const unique = deduplicateProducts(raw, productFeedConfig);
    if (unique.length === 0) {
      return products.slice(0, 8);
    }
    return unique.slice(0, 8);
  }, [products, productFeedConfig]);

  const trendingProducts = useMemo(() => {
    const raw = products.filter((p) => p.isTrending);
    const unique = deduplicateProducts(raw, productFeedConfig);
    if (unique.length === 0) {
      return products.slice(8, 16);
    }
    return unique.slice(0, 8);
  }, [products, productFeedConfig]);
  const validWishlistIds = useMemo(() => {
    if (!products || products.length === 0) return [];
    const productSet = new Set(products.map((p) => String(p.id)));
    return Array.from(
      new Set(
        wishlistIds
          .map((id) => String(id))
          .filter((id) => Boolean(id) && productSet.has(id))
      )
    );
  }, [wishlistIds, products]);

  const wishlistedProducts = useMemo(
    () => products.filter((p) => validWishlistIds.includes(String(p.id))),
    [validWishlistIds, products]
  );

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-1000 selection:bg-[#0B8F63] selection:text-white relative overflow-x-hidden ${backgroundGradientClass}`}>
      <SEOHead 
        title={seoConfig?.globalTitleTemplate?.replace('%s', 'Home') || 'Marudhar Fashion Point'}
        description={seoConfig?.globalDescription}
        image={seoConfig?.defaultOgImage}
        schemas={[generateOrganizationSchema()]}
      />
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Navigation Header */}
      <Navbar
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenStoreLocator={() => setStoreLocatorOpen(true)}
        onOpenOrderSheet={() => setOrderSheetOpen(true)}
        onOpenWishlist={() => setWishlistModalOpen(true)}
        onOpenAdmin={() => {
          setAdminActiveTab(undefined);
          if (isAdmin) {
            setAdminDashboardOpen(true);
          } else {
            setAdminLoginOpen(true);
          }
        }}
        onOpenAdminWithTab={(tab) => {
          setAdminActiveTab(tab);
          if (isAdmin) {
            setAdminDashboardOpen(true);
          } else {
            setAdminLoginOpen(true);
          }
        }}
        onOpenCustomerAccount={() => setCustomerAccountOpen(true)}
        onOpenSoundSettings={() => setSoundSettingsOpen(true)}
        onOpenCalendarModal={() => setCalendarModalOpen(true)}
        onOpenGmailModal={() => setGmailModalOpen(true)}
        onOpenWorkspaceHub={() => setWorkspaceHubOpen(true)}
        wishlistCount={validWishlistIds.length}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onNavigateToSection={(sec) => {
          if (sec === 'hero') {
            setIsShopActive(false);
            handleSelectCategory('all');
            handleResetFilters();
          } else if (sec === 'products') {
            setIsShopActive(true);
          }
          handleNavigateToSection(sec);
        }}
        onSelectSubcategory={handleSelectSubcategory}
      />

      {/* Mobile Category Slider & Desktop Horizontal Category Bar */}
      <div style={{ paddingTop: 'var(--mfp-header-height)' }}>
        <MobileScrollableCategories
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            if (cat === 'men' || cat === 'women' || cat === 'kids' || cat === 'all') {
              handleSelectCategory(cat as GenderCategory);
            } else {
              setIsShopActive(true);
            }
          }}
        />
        <HorizontalCategoryBar
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          onNavigateToSection={(sec) => {
            if (sec === 'hero') {
              setIsShopActive(false);
              handleSelectCategory('all');
              handleResetFilters();
            } else if (sec === 'products') {
              setIsShopActive(true);
            }
            handleNavigateToSection(sec);
          }}
        />
      </div>

      {productRouteSlug !== null ? (
        <ProductDetailPage
          product={activeRouteProduct}
          targetSlug={productRouteSlug}
          allProducts={products}
          onBackToHome={() => {
            setProductRouteSlug(null);
            setQuickViewProduct(null);
            if (window.location.pathname.startsWith('/product/')) {
              window.history.pushState({}, '', '/');
            }
          }}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={activeRouteProduct ? validWishlistIds.includes(String(activeRouteProduct.id)) : false}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onQuickView={(p) => setQuickViewProduct(p)}
          wishlistIds={validWishlistIds}
        />
      ) : showShopView ? (
        <>
          {/* Breadcrumbs with Back to Home button for Shop View */}
          <div className="bg-white border-b border-neutral-100 py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-bold text-neutral-500">
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handleResetFilters}
                  className="hover:text-[#0B8F63] transition-colors"
                >
                  Home
                </button>
                <span>/</span>
                <span className="text-[#0B8F63] capitalize">
                  {activeCategory === 'all' ? 'All Products' : activeCategory}
                </span>
                {filterState.subcategories.length > 0 && (
                  <>
                    <span>/</span>
                    <span className="text-neutral-900 capitalize">
                      {filterState.subcategories[0]}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-[#0B8F63] hover:text-[#0B8F63]/80 transition-all font-extrabold uppercase tracking-wide bg-[#0B8F63]/10 px-3 py-1.5 rounded-lg border border-[#0B8F63]/20 shadow-sm cursor-pointer"
              >
                ← Back to Homepage
              </button>
            </div>
          </div>

          {/* 6. Main Interactive Product Catalog */}
          <div id="products">
            <ProductGrid
              products={filteredProducts}
              filterState={filterState}
              onUpdateFilter={handleUpdateFilter}
              onResetFilters={handleResetFilters}
              availableSubcategories={availableSubcategories}
              wishlistIds={validWishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onQuickView={(p) => setQuickViewProduct(p)}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </div>
        </>
      ) : (
        <>
          <HomepageRenderer
            onSelectProduct={(p) => setQuickViewProduct(p)}
            onNavigateCategory={(cat) => {
              handleSelectCategory(cat as any);
              setIsShopActive(true);
              setTimeout(() => {
                handleNavigateToSection('products');
              }, 100);
            }}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            wishlistIds={validWishlistIds}
            onToggleWishlist={handleToggleWishlist}
          />

          {(() => {
            const layout = draftDesignSettings.layout;
            const order = layout?.homeSectionOrder || [
              'hero', 'trending_shoes', 'price_point_699', 'categories', 'featured_products',
              'best_sellers', 'trending_products', 'trending_collections', 'new_arrivals',
              'reviews', 'about', 'contact', 'instagram', 'social'
            ];
            const secConfigs = layout?.sections || {};

            return order.map((secId) => {
              const config = secConfigs[secId];
              if (config && config.visible === false) return null;

              const desktop: Partial<SectionResponsiveConfig> = config?.desktop || {};
              const sectionStyle: React.CSSProperties = {
                paddingTop: `${desktop.paddingTop ?? 16}px`,
                paddingBottom: `${desktop.paddingBottom ?? 16}px`,
                paddingLeft: `${desktop.paddingLeft ?? 16}px`,
                paddingRight: `${desktop.paddingRight ?? 16}px`,
                marginTop: `${desktop.marginTop ?? 0}px`,
                marginBottom: `${desktop.marginBottom ?? 16}px`,
                borderRadius: `${desktop.borderRadius ?? 0}px`,
              };

              let widthClass = 'w-full';
              if (desktop.width === 'wide') widthClass = 'max-w-7xl mx-auto';
              else if (desktop.width === 'standard') widthClass = 'max-w-5xl mx-auto';
              else if (desktop.width === 'compact') widthClass = 'max-w-3xl mx-auto';

              switch (secId) {
                case 'hero':
                  return (
                    <div id="hero" key="hero" style={sectionStyle} className={widthClass}>
                      <HeroSection onExploreClick={() => {
                        setIsShopActive(true);
                        setTimeout(() => {
                          handleNavigateToSection('products');
                        }, 100);
                      }} />
                    </div>
                  );
                case 'trending_shoes':
                  return (
                    <div id="trending_shoes" key="trending_shoes" style={sectionStyle} className={widthClass}>
                      <TrendingShoesSection
                        wishlistIds={validWishlistIds}
                        onToggleWishlist={handleToggleWishlist}
                        onQuickView={(p) => setQuickViewProduct(p)}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                      />
                    </div>
                  );
                case 'price_point_699':
                  return (
                    <div id="price_point_699" key="price_point_699" style={sectionStyle} className={widthClass}>
                      <PricePointCollectionSection
                        wishlistIds={validWishlistIds}
                        onToggleWishlist={handleToggleWishlist}
                        onQuickView={(p) => setQuickViewProduct(p)}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                      />
                    </div>
                  );
                case 'categories':
                  return (
                    <div id="categories" key="categories" style={sectionStyle} className={widthClass}>
                      <CategorySection
                        activeCategory={activeCategory}
                        onSelectCategory={(cat) => {
                          handleSelectCategory(cat);
                          setIsShopActive(true);
                          setTimeout(() => {
                            handleNavigateToSection('products');
                          }, 100);
                        }}
                      />
                    </div>
                  );
                case 'featured_products':
                  return (
                    <div id="featured_products" key="featured_products" style={sectionStyle} className={widthClass}>
                      <ProductCarousel
                        title="Featured Collection"
                        subtitle="Handpicked Styles"
                        products={featuredProducts}
                        wishlistIds={validWishlistIds}
                        onToggleWishlist={handleToggleWishlist}
                        onQuickView={(p) => setQuickViewProduct(p)}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                      />
                    </div>
                  );
                case 'best_sellers':
                  return (
                    <div id="best_sellers" key="best_sellers" style={sectionStyle} className={widthClass}>
                      <ProductCarousel
                        title="Best Sellers in Store"
                        subtitle="Customer Favorites"
                        products={bestSellers}
                        wishlistIds={validWishlistIds}
                        onToggleWishlist={handleToggleWishlist}
                        onQuickView={(p) => setQuickViewProduct(p)}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                      />
                    </div>
                  );
                case 'trending_products':
                  return (
                    <div id="trending_products" key="trending_products" style={sectionStyle} className={widthClass}>
                      <ProductCarousel
                        title="Trending Products"
                        subtitle="Hot Right Now"
                        products={trendingProducts}
                        wishlistIds={validWishlistIds}
                        onToggleWishlist={handleToggleWishlist}
                        onQuickView={(p) => setQuickViewProduct(p)}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                      />
                    </div>
                  );
                case 'trending_collections':
                  return (
                    <div id="trending_collections" key="trending_collections" style={sectionStyle} className={widthClass}>
                      <TrendingCollections onSelectCollection={handleSelectCollection} />
                    </div>
                  );
                case 'new_arrivals':
                  return (
                    <div id="new_arrivals" key="new_arrivals" style={sectionStyle} className={widthClass}>
                      <ProductCarousel
                        title="New Season Arrivals"
                        subtitle="Fresh Drops"
                        products={newArrivals}
                        wishlistIds={validWishlistIds}
                        onToggleWishlist={handleToggleWishlist}
                        onQuickView={(p) => setQuickViewProduct(p)}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                      />
                    </div>
                  );
                case 'reviews':
                  return (
                    <div id="reviews" key="reviews" style={sectionStyle} className={widthClass}>
                      <ReviewsSection />
                    </div>
                  );
                case 'about':
                  return (
                    <div id="about" key="about" style={sectionStyle} className={widthClass}>
                      <AboutSection />
                    </div>
                  );
                case 'contact':
                  return (
                    <div id="contact" key="contact" style={sectionStyle} className={widthClass}>
                      <ContactSection
                        onOpenCalendarModal={() => setCalendarModalOpen(true)}
                        onOpenGmailModal={() => setGmailModalOpen(true)}
                      />
                    </div>
                  );
                case 'instagram':
                  return (
                    <div id="instagram" key="instagram" style={sectionStyle} className={widthClass}>
                      <InstagramPhoneReelSection />
                      <InstagramFeed />
                    </div>
                  );
                case 'instagram_reels':
                  return (
                    <div id="instagram_reels" key="instagram_reels" style={sectionStyle} className={widthClass}>
                      <InstagramPhoneReelSection />
                    </div>
                  );
                case 'social':
                  return (
                    <div id="social" key="social" style={sectionStyle} className={widthClass}>
                      <SocialFollowCTA />
                    </div>
                  );
                default:
                  return null;
              }
            });
          })()}
        </>
      )}

      {/* 14. Footer */}
      <Footer onOpenAdmin={() => setAdminLoginOpen(true)} />

      {/* 13. Floating Action Hub (WhatsApp, Call, Socials, Back To Top, Calendar, Sound) */}
      <FloatingActionHub
        onOpenCalendarModal={() => setCalendarModalOpen(true)}
        onOpenSoundSettings={() => setSoundSettingsOpen(true)}
      />

      {/* Premium Floating Admin Command Button */}
      <FloatingAdminButton
        onOpenAdmin={() => {
          setAdminActiveTab(undefined);
          if (isAdmin) {
            setAdminDashboardOpen(true);
          } else {
            setAdminLoginOpen(true);
          }
        }}
        onOpenAdminWithTab={(tab) => {
          setAdminActiveTab(tab as any);
          if (isAdmin) {
            setAdminDashboardOpen(true);
          } else {
            setAdminLoginOpen(true);
          }
        }}
      />

      <SEOLiveScoreWidget />
      <SEOSchemaInjector />

      {/* Interactive AI Pet Shoe Brand Mascot */}
      <AIPetShoeMascot />

      {/* --- MODALS & DRAWERS --- */}
      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={quickViewProduct ? validWishlistIds.includes(String(quickViewProduct.id)) : false}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Order Bag Sheet Drawer */}
      <OrderSheet
        isOpen={orderSheetOpen}
        onClose={() => setOrderSheetOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        onProceedToCheckout={() => {
          setDirectCheckoutItems(null);
          setCheckoutModalOpen(true);
        }}
      />

      {/* Online Checkout Modal (UPI/QR, Cards, Netbanking, Razorpay, COD) */}
      <CheckoutErrorBoundary fallbackTitle="Checkout Process Notice">
        <CheckoutModal
          isOpen={checkoutModalOpen}
          onClose={() => {
            setCheckoutModalOpen(false);
            setDirectCheckoutItems(null);
          }}
          cartItems={directCheckoutItems || cartItems}
          onOrderComplete={(orderId) => {
            if (!directCheckoutItems) {
              setCartItems([]);
            }
            setDirectCheckoutItems(null);
            setCheckoutModalOpen(false);
            setCustomerAccountOpen(true);
          }}
        />
      </CheckoutErrorBoundary>

      {/* Customer Auth Guard Modal for Buy Now / Checkout */}
      <CustomerAuthGuardModal
        isOpen={authGuardOpen}
        onClose={() => {
          setAuthGuardOpen(false);
          setPendingBuyNowAction(null);
        }}
        onSuccess={handleAuthGuardSuccess}
        reasonTitle="Login Required to Complete Purchase"
        reasonDescription="Please log in securely to proceed with your order, track shipments, and checkout."
      />

      {/* Customer Account & Order Tracking Modal */}
      <CustomerAccountModal
        isOpen={customerAccountOpen}
        onClose={() => setCustomerAccountOpen(false)}
        onQuickViewProduct={(p) => setQuickViewProduct(p)}
        wishlistedProducts={wishlistedProducts}
      />

      {/* Customer Sound & Audio Preferences Modal */}
      <SoundSettingsModal
        isOpen={soundSettingsOpen}
        onClose={() => setSoundSettingsOpen(false)}
      />

      {/* Live Search Modal */}
      <LiveSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        products={products}
        onSelectProduct={(p) => setQuickViewProduct(p)}
        onOpenStoreLocator={() => setStoreLocatorOpen(true)}
        onSearchCategory={(catQuery) => {
          setFilterState((prev) => ({ ...prev, searchQuery: catQuery }));
          handleNavigateToSection('products');
        }}
      />

      {/* Wishlist Saved Items Modal */}
      <WishlistModal
        isOpen={wishlistModalOpen}
        onClose={() => setWishlistModalOpen(false)}
        wishlistedProducts={wishlistedProducts}
        onToggleWishlist={handleToggleWishlist}
        onQuickView={(p) => setQuickViewProduct(p)}
      />

      <Suspense fallback={null}>
        {/* Admin Login Modal */}
        <AdminLoginModal
          isOpen={adminLoginOpen}
          onClose={() => setAdminLoginOpen(false)}
          onLoginSuccess={() => setAdminDashboardOpen(true)}
        />

        {/* Admin Dashboard Modal */}
        <AdminErrorBoundary fallbackTitle="Admin Panel Shell Notice">
          <AdminDashboardModal
            isOpen={adminDashboardOpen}
            onClose={() => setAdminDashboardOpen(false)}
            initialTab={adminActiveTab}
          />
        </AdminErrorBoundary>

        {/* Google Calendar VIP Store Fitting Booking Modal */}
        <CalendarBookingModal
          isOpen={calendarModalOpen}
          onClose={() => setCalendarModalOpen(false)}
        />

        {/* Gmail Direct Inquiry Modal */}
        <GmailInquiryModal
          isOpen={gmailModalOpen}
          onClose={() => setGmailModalOpen(false)}
        />

        {/* Google Workspace Account Hub Drawer */}
        <WorkspaceHubDrawer
          isOpen={workspaceHubOpen}
          onClose={() => setWorkspaceHubOpen(false)}
          onOpenCalendarModal={() => setCalendarModalOpen(true)}
          onOpenGmailModal={() => setGmailModalOpen(true)}
        />

        {/* Nearby Stores Full-Screen Locator Page */}
        <StoreLocatorPage
          isOpen={storeLocatorOpen}
          onClose={() => setStoreLocatorOpen(false)}
        />
      </Suspense>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 max-w-sm"
          style={{
            backgroundColor:
              toastMessage.type === 'error'
                ? '#FEF2F2'
                : toastMessage.type === 'info'
                ? '#EFF6FF'
                : '#F0FDF4',
            borderColor:
              toastMessage.type === 'error'
                ? '#FCA5A5'
                : toastMessage.type === 'info'
                ? '#BFDBFE'
                : '#86EFAC',
            color:
              toastMessage.type === 'error'
                ? '#991B1B'
                : toastMessage.type === 'info'
                ? '#1E40AF'
                : '#166534',
          }}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          ) : toastMessage.type === 'info' ? (
            <Info className="w-5 h-5 text-blue-600 shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span className="text-xs font-bold leading-tight">{toastMessage.text}</span>
        </div>
      )}

      {/* Scratch & Win Popup Overlay */}
      <ScratchCardPopup currentPath={scratchCurrentPath} cartSubtotal={scratchCartSubtotal} />

      {/* Spin the Wheel Popup Overlay */}
      <SpinWheelPopup currentPath={scratchCurrentPath} />

      {/* Order Success Celebration Visual Effects Canvas Overlay */}
      <OrderSuccessCelebration />
    </div>
  );
}

// =============================================================
// ROUTER COORDINATOR
// =============================================================
export type AppRoute = 
  | { type: 'payment'; orderId: string }
  | { type: 'storefront' };

export function parseAppRoute(): AppRoute {
  if (typeof window === 'undefined') return { type: 'storefront' };

  // 1. Direct path routing: /pay/:orderId
  const path = window.location.pathname;
  if (path.startsWith('/pay/')) {
    const rawOrderId = path.replace('/pay/', '').split('/')[0].split('?')[0];
    if (rawOrderId) {
      return { type: 'payment', orderId: decodeURIComponent(rawOrderId) };
    }
  }

  // 2. Query param routing: ?pay=... or ?orderId=...
  const searchParams = new URLSearchParams(window.location.search);
  const queryPay = searchParams.get('pay') || searchParams.get('orderId');
  if (queryPay) {
    return { type: 'payment', orderId: decodeURIComponent(queryPay) };
  }

  // 3. Hash routing: #/pay/:orderId
  if (window.location.hash.startsWith('#/pay/')) {
    const hashOrderId = window.location.hash.replace('#/pay/', '').split('?')[0];
    if (hashOrderId) {
      return { type: 'payment', orderId: decodeURIComponent(hashOrderId) };
    }
  }

  return { type: 'storefront' };
}

function AppContent() {
  const [route, setRoute] = useState<AppRoute>(() => parseAppRoute());

  useEffect(() => {
    const handleUrlChange = () => {
      setRoute(parseAppRoute());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleBackHomeFromPayment = () => {
    setRoute({ type: 'storefront' });
    if (window.location.pathname.startsWith('/pay/')) {
      window.history.pushState({}, '', '/');
    }
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (route.type === 'payment') {
    return (
      <PaymentRouteView
        orderId={route.orderId}
        onBackHome={handleBackHomeFromPayment}
      />
    );
  }

  return <StorefrontView />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
