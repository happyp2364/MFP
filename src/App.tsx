import React, { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { AnnouncementBar } from './components/Header/AnnouncementBar';
import { Navbar } from './components/Header/Navbar';
import { HorizontalCategoryBar } from './components/Header/HorizontalCategoryBar';
import { HeroSection } from './components/Hero/HeroSection';
import { CategorySection } from './components/Categories/CategorySection';
import { ProductGrid } from './components/Products/ProductGrid';
import { ProductCarousel } from './components/Carousels/ProductCarousel';
import { TrendingCollections } from './components/Collections/TrendingCollections';
import { ReviewsSection } from './components/Reviews/ReviewsSection';
import { AboutSection } from './components/About/AboutSection';
import { ContactSection } from './components/Contact/ContactSection';
import { InstagramFeed } from './components/Social/InstagramFeed';
import { SocialFollowCTA } from './components/Social/SocialFollowCTA';
import { Footer } from './components/Footer/Footer';
import { FloatingActionHub } from './components/FloatingActions/FloatingActionHub';
import { AIPetShoeMascot } from './components/Mascot/AIPetShoeMascot';
import { QuickViewModal } from './components/Products/QuickViewModal';
import { OrderSheet } from './components/Cart/OrderSheet';
import { LiveSearchModal } from './components/Search/LiveSearchModal';
import { WishlistModal } from './components/Wishlist/WishlistModal';
import { AdminLoginModal } from './components/Admin/AdminLoginModal';
import { AdminDashboardModal } from './components/Admin/AdminDashboardModal';
import { AdminErrorBoundary } from './components/Admin/AdminErrorBoundary';
import { CheckoutModal } from './components/Checkout/CheckoutModal';
import { CustomerAccountModal } from './components/Customer/CustomerAccountModal';
import { SoundSettingsModal } from './components/Customer/SoundSettingsModal';
import { CalendarBookingModal } from './components/GoogleWorkspace/CalendarBookingModal';
import { GmailInquiryModal } from './components/GoogleWorkspace/GmailInquiryModal';
import { WorkspaceHubDrawer } from './components/GoogleWorkspace/WorkspaceHubDrawer';
import { ProductDetailPage } from './components/Products/ProductDetailPage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ScratchCardPopup } from './components/Promo/ScratchCardPopup';
import { SpinWheelPopup } from './components/Promo/SpinWheelPopup';
import { OrderSuccessCelebration } from './components/Promo/OrderSuccessCelebration';

import { useStore } from './context/StoreContext';
import { Product, FilterState, GenderCategory, CartItem } from './types';
import { findProductBySlugOrId, getProductSlug } from './utils/productUtils';

function AppContent() {
  const { products, isAdmin, toastMessage } = useStore();
  const { backgroundGradientClass } = useTheme();

  // --- STATE ---
  const [activeCategory, setActiveCategory] = useState<GenderCategory>('all');
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

  const [wishlistIds, setWishlistIds] = useState<string[]>(['mfp-m01', 'mfp-w01']);
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
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [customerAccountOpen, setCustomerAccountOpen] = useState(false);
  const [soundSettingsOpen, setSoundSettingsOpen] = useState(false);

  // Google Workspace Modals
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [gmailModalOpen, setGmailModalOpen] = useState(false);
  const [workspaceHubOpen, setWorkspaceHubOpen] = useState(false);

  // --- DYNAMIC PUBLIC PRODUCT URL ROUTING ---
  const [productRouteSlug, setProductRouteSlug] = useState<string | null>(null);

  const scratchCurrentPath = productRouteSlug ? `/product/${productRouteSlug}` : checkoutModalOpen ? '/checkout' : '/';
  const scratchCartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cartItems]);

  React.useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/product/')) {
        const rawSlug = path.replace('/product/', '').split('/')[0].split('?')[0];
        if (rawSlug) {
          setProductRouteSlug(decodeURIComponent(rawSlug));
          return;
        }
      }

      const searchParams = new URLSearchParams(window.location.search);
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
    }
  }, [quickViewProduct]);

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
  };

  const handleSelectCategory = (cat: GenderCategory) => {
    setActiveCategory(cat);
    setFilterState((prev) => ({
      ...prev,
      category: cat,
      subcategories: [], // reset subcategories on category change
    }));
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id]
    );
  };

  const handleAddToCart = (product: Product, size: string, color: string) => {
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
        return copy;
      }

      return [
        ...prev,
        {
          product,
          selectedSize: size || product.sizes[0] || 'Standard',
          selectedColor: color || (product.colors[0] ? product.colors[0].name : 'Standard'),
          quantity: 1,
        },
      ];
    });
  };

  const handleBuyNow = (product: Product, size: string, color: string, quantity: number = 1) => {
    const chosenSize = size || (product.sizes && product.sizes[0]) || 'Standard';
    const chosenColor = color || (product.colors && product.colors[0] ? product.colors[0].name : 'Standard');

    setDirectCheckoutItems([
      {
        product,
        selectedSize: chosenSize,
        selectedColor: chosenColor,
        quantity: quantity > 0 ? quantity : 1,
      },
    ]);
    setCheckoutModalOpen(true);
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
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCollection = (collectionId: string) => {
    setFilterState((prev) => ({
      ...prev,
      collection: collectionId,
    }));
    handleNavigateToSection('products');
  };

  // --- FILTERED SUBCATEGORIES ---
  const availableSubcategories = useMemo(() => {
    let relevantProducts = products;
    if (filterState.category !== 'all') {
      relevantProducts = products.filter((p) => p.category === filterState.category);
    }
    const subs = new Set<string>();
    relevantProducts.forEach((p) => subs.add(p.subcategory));
    return Array.from(subs);
  }, [filterState.category, products]);

  // --- FILTERED PRODUCTS ---
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Gender Category
      if (filterState.category !== 'all' && p.category !== filterState.category) {
        return false;
      }

      // Subcategories
      if (
        filterState.subcategories.length > 0 &&
        !filterState.subcategories.includes(p.subcategory)
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
        const match =
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filterState.sortBy === 'price-low') return a.price - b.price;
      if (filterState.sortBy === 'price-high') return b.price - a.price;
      if (filterState.sortBy === 'rating') return b.rating - a.rating;
      if (filterState.sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      if (filterState.sortBy === 'discount') return b.discountPercent - a.discountPercent;
      return 0; // featured default order
    });
  }, [filterState, products]);

  // Carousels Products
  const bestSellers = useMemo(() => products.filter((p) => p.isBestSeller), [products]);
  const newArrivals = useMemo(() => products.filter((p) => p.isNewArrival), [products]);
  const wishlistedProducts = useMemo(
    () => products.filter((p) => wishlistIds.includes(p.id)),
    [wishlistIds, products]
  );

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-1000 selection:bg-[#0B8F63] selection:text-white relative overflow-x-hidden ${backgroundGradientClass}`}>
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Navigation Header */}
      <Navbar
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenOrderSheet={() => setOrderSheetOpen(true)}
        onOpenWishlist={() => setWishlistModalOpen(true)}
        onOpenAdmin={() => (isAdmin ? setAdminDashboardOpen(true) : setAdminLoginOpen(true))}
        onOpenCustomerAccount={() => setCustomerAccountOpen(true)}
        onOpenSoundSettings={() => setSoundSettingsOpen(true)}
        onOpenCalendarModal={() => setCalendarModalOpen(true)}
        onOpenGmailModal={() => setGmailModalOpen(true)}
        onOpenWorkspaceHub={() => setWorkspaceHubOpen(true)}
        wishlistCount={wishlistIds.length}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onNavigateToSection={handleNavigateToSection}
      />

      {/* Horizontal Category Slider Bar */}
      <div className="pt-[60px] sm:pt-[72px]">
        <HorizontalCategoryBar
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          onNavigateToSection={handleNavigateToSection}
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
          isWishlisted={activeRouteProduct ? wishlistIds.includes(activeRouteProduct.id) : false}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onQuickView={(p) => setQuickViewProduct(p)}
          wishlistIds={wishlistIds}
        />
      ) : (
        <>
          {/* 3. Hero Section */}
          <HeroSection onExploreClick={() => handleNavigateToSection('products')} />

          {/* 4. Family Category Cards */}
          <CategorySection
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
          />

          {/* 5. Best Sellers Auto Carousel */}
          <ProductCarousel
            title="Best Sellers in Store"
            subtitle="Customer Favorites"
            products={bestSellers}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />

          {/* 6. Main Interactive Product Catalog */}
          <ProductGrid
            products={filteredProducts}
            filterState={filterState}
            onUpdateFilter={handleUpdateFilter}
            onResetFilters={handleResetFilters}
            availableSubcategories={availableSubcategories}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />

          {/* 7. Trending Collections */}
          <TrendingCollections onSelectCollection={handleSelectCollection} />

          {/* 8. New Arrivals Carousel */}
          <ProductCarousel
            title="New Season Arrivals"
            subtitle="Fresh Drops"
            products={newArrivals}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />

          {/* 9. Customer Testimonials */}
          <ReviewsSection />

          {/* 10. About Us Storytelling */}
          <AboutSection />

          {/* 11. Contact & Store Locator */}
          <ContactSection
            onOpenCalendarModal={() => setCalendarModalOpen(true)}
            onOpenGmailModal={() => setGmailModalOpen(true)}
          />

          {/* 12. Instagram Feed */}
          <InstagramFeed />

          {/* 13. Social Follow CTA */}
          <SocialFollowCTA />
        </>
      )}

      {/* 14. Footer */}
      <Footer />

      {/* 13. Floating Action Hub (WhatsApp, Call, Socials, Back To Top, Calendar, Sound) */}
      <FloatingActionHub
        onOpenCalendarModal={() => setCalendarModalOpen(true)}
        onOpenSoundSettings={() => setSoundSettingsOpen(true)}
      />

      {/* Interactive AI Pet Shoe Brand Mascot */}
      <AIPetShoeMascot />

      {/* --- MODALS & DRAWERS --- */}
      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
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

      {/* Online Checkout Modal (UPI/QR, Cards, Netbanking, Cashfree, COD) */}
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

      {/* Customer Account & Order Tracking Modal */}
      <CustomerAccountModal
        isOpen={customerAccountOpen}
        onClose={() => setCustomerAccountOpen(false)}
        onQuickViewProduct={(p) => setQuickViewProduct(p)}
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

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
