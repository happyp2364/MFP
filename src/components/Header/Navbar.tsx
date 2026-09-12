import React, { useState, useEffect } from 'react';
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Footprints,
  ShieldCheck,
  Tag,
  User,
  MapPin,
  Calendar,
  Mail,
  Volume2,
  VolumeX,
  Home,
  Layers,
  Star,
  Package,
  Gift,
  Ticket,
  Megaphone,
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  Database,
  FileText,
  Settings,
  Share2,
} from 'lucide-react';
import { GenderCategory } from '../../types';
import { useStore } from '../../context/StoreContext';
import { generateGeneralInquiryWhatsAppLink } from '../../utils/whatsapp';
import { GoogleAuthButton } from '../GoogleWorkspace/GoogleAuthButton';
import { ThemeToggleWidget } from '../Theme/ThemeToggleWidget';
import { MobileSideDrawer } from './MobileSideDrawer';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenOrderSheet: () => void;
  onOpenWishlist: () => void;
  onOpenAdmin: () => void;
  onOpenAdminWithTab?: (tab: string) => void;
  onOpenCustomerAccount?: () => void;
  onOpenSoundSettings?: () => void;
  onOpenStoreLocator?: () => void;
  onOpenRewardsModal?: () => void;
  onOpenCalendarModal?: () => void;
  onOpenGmailModal?: () => void;
  onOpenWorkspaceHub?: () => void;
  wishlistCount: number;
  cartCount: number;
  activeCategory: GenderCategory;
  onSelectCategory: (cat: GenderCategory) => void;
  onNavigateToSection: (sectionId: string) => void;
  onSelectSubcategory?: (sub: string, cat: GenderCategory) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenOrderSheet,
  onOpenWishlist,
  onOpenAdmin,
  onOpenAdminWithTab,
  onOpenCustomerAccount,
  onOpenSoundSettings,
  onOpenStoreLocator,
  onOpenRewardsModal,
  onOpenCalendarModal,
  onOpenGmailModal,
  onOpenWorkspaceHub,
  wishlistCount,
  cartCount,
  activeCategory,
  onSelectCategory,
  onNavigateToSection,
  onSelectSubcategory,
}) => {
  const { storeInfo, websiteConfig, logoConfig, isAdmin, customerSoundSettings, megaMenuCategories } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);
  const [logoImageFailed, setLogoImageFailed] = useState(false);

  const logoTapCount = React.useRef(0);
  const logoTapTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const defaultLogoSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80"><defs><linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23092e22"/><stop offset="50%" stop-color="%230B8F63"/><stop offset="100%" stop-color="%23054d35"/></linearGradient><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23F6E05E"/><stop offset="50%" stop-color="%23D4AF37"/><stop offset="100%" stop-color="%23B7791F"/></linearGradient></defs><rect x="4" y="8" width="64" height="64" rx="16" fill="url(%23bgGrad)" stroke="url(%23goldGrad)" stroke-width="2.5"/><path d="M24 48 C24 38, 28 30, 36 24 C44 30, 48 38, 48 48 Z" fill="none" stroke="url(%23goldGrad)" stroke-width="3" stroke-linecap="round"/><circle cx="36" cy="38" r="5" fill="url(%23goldGrad)"/><polygon points="36,18 39,23 44,22 41,26 43,31 36,28 29,31 31,26 28,22 33,23" fill="url(%23goldGrad)"/><text x="82" y="38" font-family="'Playfair Display', Georgia, serif" font-weight="900" font-size="20" fill="%230B8F63" letter-spacing="0.5">MARUDHAR</text><text x="82" y="56" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="11" fill="%232D3748" letter-spacing="2">FASHION POINT</text></svg>`;

  const rawLogoUrl = logoConfig?.logoUrl || storeInfo?.logoUrl || websiteConfig?.businessIdentity?.logoUrl || '';
  const activeLogoUrl = logoImageFailed || !rawLogoUrl ? defaultLogoSvg : rawLogoUrl;
  const activeLogoType = logoConfig?.logoType || storeInfo?.logoType || websiteConfig?.businessIdentity?.logoType || 'both';
  const activeLogoText = logoConfig?.brandNameText || storeInfo?.headerLogoText || websiteConfig?.businessIdentity?.businessName || storeInfo?.name || 'Marudhar Fashion Point';
  const activeTagline = logoConfig?.taglineText || websiteConfig?.businessIdentity?.tagline || storeInfo?.tagline || 'Style for Every Step.';
  const showLogoVisibility = logoConfig?.logoVisibility !== false && storeInfo?.showHeaderLogo !== false;
  const showBrandName = logoConfig?.showBrandNameBesideLogo !== false || activeLogoType === 'both' || activeLogoType === 'text';

  const handleLogoClick = () => {
    handleNavClick('hero');
    logoTapCount.current += 1;
    if (logoTapCount.current >= 5) {
      onOpenAdmin();
      logoTapCount.current = 0;
    }
    if (logoTapTimeout.current) clearTimeout(logoTapTimeout.current);
    logoTapTimeout.current = setTimeout(() => {
      logoTapCount.current = 0;
    }, 2000);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    onNavigateToSection(sectionId);
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  };

  const handleCategoryClick = (cat: GenderCategory) => {
    onSelectCategory(cat);
    onNavigateToSection('products');
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 flex items-center ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-100'
            : 'bg-white/90 backdrop-blur-sm'
        }`}
        style={{
          minHeight: 'var(--mfp-header-height)',
          paddingTop: 'var(--mfp-header-padding-y)',
          paddingBottom: 'var(--mfp-header-padding-y)',
          paddingLeft: 'var(--mfp-header-padding-x)',
          paddingRight: 'var(--mfp-header-padding-x)',
        }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Left Section: Mobile Hamburger Toggle + Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Hamburger Drawer Trigger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl text-neutral-800 hover:bg-neutral-100 active:scale-95 transition-all"
                aria-label="Open Side Navigation Drawer"
              >
                <Menu style={{ width: 'var(--mfp-icon-header-size)', height: 'var(--mfp-icon-header-size)' }} />
              </button>

              {/* Brand Logo */}
              {showLogoVisibility && (
                <button
                  onClick={handleLogoClick}
                  className="flex items-center gap-2.5 text-left group cursor-pointer"
                  title="Click to go home (Admin: 5-tap shortcut)"
                >
                  {activeLogoUrl && (activeLogoType === 'image' || activeLogoType === 'both' || activeLogoType === 'icon') && (
                    <img
                      src={activeLogoUrl}
                      alt={activeLogoText}
                      onError={() => setLogoImageFailed(true)}
                      style={{
                        width: logoConfig?.logoWidthDesktop ? `${logoConfig.logoWidthDesktop}px` : undefined,
                        maxHeight: '44px',
                        objectFit: logoConfig?.objectFit || 'contain',
                      }}
                      className="h-9 sm:h-10 w-auto max-w-[150px] sm:max-w-[220px] object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {(showBrandName || activeLogoType === 'text') && (
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-serif-heading font-extrabold text-base sm:text-lg text-neutral-900 tracking-tight leading-snug">
                          {activeLogoText}
                        </span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-neutral-500 font-medium tracking-wide hidden xs:block leading-none">
                        {activeTagline}
                      </p>
                    </div>
                  )}
                </button>
              )}
            </div>

            {/* Middle Desktop Navigation Links */}
            <nav className="hidden md:flex items-center" style={{ gap: 'var(--mfp-nav-gap)' }}>
              <button
                onClick={() => handleNavClick('hero')}
                className="text-sm font-semibold text-neutral-700 hover:text-[#0B8F63] transition-colors"
                title="Home"
              >
                Home
              </button>

              {/* Mega Menu Trigger */}
              {storeInfo?.showHeaderCategories !== false && (
                <div
                  className="relative"
                  onMouseEnter={() => setMegaMenuOpen(true)}
                  onMouseLeave={() => setMegaMenuOpen(false)}
                >
                  <button
                    onClick={() => handleNavClick('products')}
                    className="flex items-center gap-1 text-sm font-semibold text-neutral-700 hover:text-[#0B8F63] transition-colors py-2"
                  >
                    <span>Categories</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180 text-[#0B8F63]' : ''}`} />
                  </button>

                  {/* Mega Dropdown */}
                  {megaMenuOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[720px] bg-white rounded-2xl shadow-2xl border border-neutral-100 p-6 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                      {(megaMenuCategories?.filter(cat => cat.enabled && !cat.hidden) || [])
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((category) => {
                          const genderName = category.name.toUpperCase();
                          const gender: GenderCategory = genderName.includes("WOMEN") ? 'women' : genderName.includes("MEN") ? 'men' : genderName.includes("KID") ? 'kids' : 'all';
                          return (
                            <div key={category.id} className="space-y-4">
                              <div className="flex items-center gap-2 border-b pb-2">
                                <span className="w-2 h-2 rounded-full bg-[#0B8F63]" />
                                <h4 className="font-bold text-sm text-neutral-900 tracking-tight">{category.name}</h4>
                              </div>
                              <div className="space-y-4">
                                {category.sections
                                  ?.sort((a, b) => a.displayOrder - b.displayOrder)
                                  .map((section) => (
                                    <div key={section.id} className="space-y-2">
                                      {category.sections.length > 1 && (
                                        <h5 className="font-bold text-[10px] text-neutral-700 uppercase tracking-wider">{section.title}</h5>
                                      )}
                                      <ul className="space-y-1.5 text-xs text-neutral-600">
                                        {section.subcategories
                                          ?.filter(sub => sub.enabled)
                                          .sort((a, b) => a.displayOrder - b.displayOrder)
                                          .map((sub) => (
                                            <li key={sub.id}>
                                              <button
                                                onClick={() => {
                                                  if (onSelectSubcategory) {
                                                    onSelectSubcategory(sub.name, gender);
                                                  } else {
                                                    handleCategoryClick(gender);
                                                  }
                                                  setMegaMenuOpen(false);
                                                }}
                                                className="hover:text-[#0B8F63] hover:translate-x-1 transition-all block w-full text-left py-0.5"
                                              >
                                                {sub.name}
                                              </button>
                                            </li>
                                          ))}
                                      </ul>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => handleNavClick('reviews')}
                className="text-sm font-semibold text-neutral-700 hover:text-[#0B8F63] transition-colors"
                title="Reviews"
              >
                Reviews
              </button>

              <button
                onClick={() => handleNavClick('about')}
                className="text-sm font-semibold text-neutral-700 hover:text-[#0B8F63] transition-colors"
                title="About Us"
              >
                About Us
              </button>

              <button
                onClick={() => handleNavClick('contact')}
                className="text-sm font-semibold text-neutral-700 hover:text-[#0B8F63] transition-colors"
                title="Contact"
              >
                Contact
              </button>

              {storeInfo?.showHeaderOffers !== false && (
                <button
                  onClick={() => handleNavClick('products')}
                  className="relative text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1 group py-2"
                  title="Offers"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Offers</span>
                  <span className="absolute -top-1 -right-4 px-1 py-0.5 text-[8px] bg-rose-600 text-white rounded font-sans-body font-bold uppercase animate-pulse">
                    HOT
                  </span>
                </button>
              )}
            </nav>

            {/* Right Utilities Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Dynamic Theme & Time Toggle */}
              <div className="hidden xs:block">
                <ThemeToggleWidget compact />
              </div>

              {/* Search Trigger */}
              {storeInfo?.showHeaderSearch !== false && (
                <button
                  onClick={onOpenSearch}
                  className="p-2 sm:p-2.5 rounded-full text-neutral-700 hover:text-[#0B8F63] hover:bg-neutral-100 transition-all active:scale-95"
                  aria-label="Search products"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Nearby Stores Locator Button */}
              {onOpenStoreLocator && (
                <button
                  onClick={onOpenStoreLocator}
                  className="p-2 sm:p-2.5 rounded-full text-emerald-700 hover:bg-emerald-50 transition-all relative active:scale-95"
                  aria-label="Nearby Stores & Outlets"
                  title="Find Nearby Physical Stores & Outlets"
                >
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </button>
              )}

              {/* Wishlist Icon */}
              {storeInfo?.showHeaderWishlist !== false && (
                <button
                  onClick={onOpenWishlist}
                  className="p-2 sm:p-2.5 rounded-full text-neutral-700 hover:text-[#0B8F63] hover:bg-neutral-100 transition-all relative active:scale-95"
                  aria-label="View Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#0B8F63] text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              )}

              {/* Customer Sound Settings Button */}
              {onOpenSoundSettings && (
                <button
                  onClick={onOpenSoundSettings}
                  className={`p-2 sm:p-2.5 rounded-full transition-all relative active:scale-95 ${
                    customerSoundSettings?.muted
                      ? 'text-rose-500 hover:bg-rose-50'
                      : 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50'
                  }`}
                  aria-label="Sound Settings"
                  title={customerSoundSettings?.muted ? 'Sound Muted - Click to adjust' : `Sound Active (${customerSoundSettings?.volume}%)`}
                >
                  {customerSoundSettings?.muted ? (
                    <VolumeX className="w-5 h-5 text-rose-500" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-emerald-600" />
                  )}
                </button>
              )}

              {/* My Orders & Account Button */}
              {storeInfo?.showHeaderAccount !== false && onOpenCustomerAccount && (
                <button
                  onClick={onOpenCustomerAccount}
                  className="p-2 sm:p-2.5 rounded-full text-neutral-700 hover:text-amber-800 hover:bg-amber-50 transition-all relative active:scale-95"
                  aria-label="My Account & Orders"
                  title="My Account & Live Order Tracking"
                >
                  <User className="w-5 h-5 text-amber-900" />
                </button>
              )}

              {/* Order Bag Icon */}
              {storeInfo?.showHeaderCart !== false && (
                <button
                  onClick={onOpenOrderSheet}
                  className="p-2 sm:p-2.5 rounded-full text-neutral-700 hover:text-[#0B8F63] hover:bg-neutral-100 transition-all relative active:scale-95"
                  aria-label="View Order Bag"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#0B8F63] text-white text-[10px] font-bold flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* Direct WhatsApp Desktop Button */}
              <a
                href={generateGeneralInquiryWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-2 bg-[#0B8F63] hover:bg-[#086F4C] text-white text-xs font-bold px-4 shadow-md shadow-[#0B8F63]/20 hover:scale-105 transition-all duration-300"
                style={{
                  height: 'var(--mfp-whatsapp-btn-height)',
                  borderRadius: 'var(--mfp-whatsapp-btn-radius)',
                }}
                title="व्हाट्सऐप पर ऑर्डर करें • Order on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-white text-[#0B8F63]" />
                <span>व्हाट्सऐप • WhatsApp</span>
              </a>

              {/* Google Workspace Account / Sign-In Button */}
              <div className="hidden sm:block">
                <GoogleAuthButton compact onOpenWorkspaceHub={onOpenWorkspaceHub} />
              </div>

              {/* Book Fitting Calendar Trigger */}
              {onOpenCalendarModal && (
                <button
                  onClick={onOpenCalendarModal}
                  className="hidden xl:flex items-center gap-1.5 bg-[#0B8F63]/10 hover:bg-[#0B8F63]/20 text-[#0B8F63] text-xs font-bold px-3 py-2 rounded-full border border-[#0B8F63]/20 transition-all"
                  title="वीआईपी फिटिंग बुक करें • Book VIP Fitting on Google Calendar"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>फिटिंग बुक करें • Book Fitting</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Side Drawer Component */}
      <MobileSideDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenSearch={onOpenSearch}
        onNavigateToSection={handleNavClick}
        onOpenStoreLocator={() => {
          if (onOpenStoreLocator) onOpenStoreLocator();
        }}
        onOpenAuthModal={() => {
          if (onOpenCustomerAccount) onOpenCustomerAccount();
        }}
        onOpenOrdersModal={() => {
          if (onOpenCustomerAccount) onOpenCustomerAccount();
        }}
        onOpenWishlistModal={onOpenWishlist}
        onOpenRewardsModal={() => {
          if (onOpenRewardsModal) onOpenRewardsModal();
        }}
        onSelectCategory={(cat) => {
          if (cat === 'men' || cat === 'women' || cat === 'kids' || cat === 'all') {
            handleCategoryClick(cat as GenderCategory);
          } else {
            handleNavClick('products');
          }
        }}
      />
    </>
  );
};
