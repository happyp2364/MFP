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
  const { storeInfo, websiteConfig, isAdmin, customerSoundSettings, megaMenuCategories } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);

  const logoTapCount = React.useRef(0);
  const logoTapTimeout = React.useRef<NodeJS.Timeout | null>(null);

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
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm py-2.5 border-b border-neutral-100'
            : 'bg-white/90 backdrop-blur-sm py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Left Section: Mobile Hamburger Toggle + Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Hamburger Drawer Trigger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl text-neutral-800 hover:bg-neutral-100 active:scale-95 transition-all"
                aria-label="Open Side Navigation Drawer"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Brand Logo */}
              {storeInfo?.showHeaderLogo !== false && (
                <button
                  onClick={handleLogoClick}
                  className="flex items-center gap-2 text-left group"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0B8F63] flex items-center justify-center text-white shadow-md shadow-[#0B8F63]/20 group-hover:scale-105 transition-transform duration-300">
                    <Footprints className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-serif-heading font-extrabold text-base sm:text-xl text-neutral-900 tracking-tight">
                        {websiteConfig?.businessIdentity?.businessName || storeInfo?.name || 'Shop'}
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-neutral-500 font-medium tracking-wide hidden xs:block">
                      {websiteConfig?.businessIdentity?.tagline || storeInfo?.tagline || 'Fashion & Footwear'}
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Middle Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <button
                onClick={() => handleNavClick('hero')}
                className="text-sm font-semibold text-neutral-700 hover:text-[#0B8F63] transition-colors"
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
                    <span>Shop Categories</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180 text-[#0B8F63]' : ''}`} />
                  </button>

                  {/* Mega Dropdown */}
                  {megaMenuOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[720px] bg-white rounded-2xl shadow-2xl border border-neutral-100 p-6 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                      {(megaMenuCategories?.filter((cat: any) => cat.enabled && !cat.hidden) || [])
                        .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
                        .map((category: any) => {
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
                                  ?.sort((a: any, b: any) => a.displayOrder - b.displayOrder)
                                  .map((section: any) => (
                                    <div key={section.id} className="space-y-2">
                                      {category.sections.length > 1 && (
                                        <h5 className="font-semibold text-[10px] text-neutral-400 uppercase tracking-wider">{section.title}</h5>
                                      )}
                                      <ul className="space-y-1.5 text-xs text-neutral-600">
                                        {section.subcategories
                                          ?.filter((sub: any) => sub.enabled)
                                          .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
                                          .map((sub: any) => (
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
              >
                Reviews
              </button>

              <button
                onClick={() => handleNavClick('about')}
                className="text-sm font-semibold text-neutral-700 hover:text-[#0B8F63] transition-colors"
              >
                About Us
              </button>

              <button
                onClick={() => handleNavClick('contact')}
                className="text-sm font-semibold text-neutral-700 hover:text-[#0B8F63] transition-colors"
              >
                Contact
              </button>

              {storeInfo?.showHeaderOffers !== false && (
                <button
                  onClick={() => handleNavClick('products')}
                  className="relative text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1 group py-2"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Offers</span>
                  <span className="absolute -top-1 -right-4 px-1 py-0.5 text-[8px] bg-rose-600 text-white rounded font-sans-body font-bold uppercase animate-pulse">
                    Hot
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
                className="hidden lg:flex items-center gap-2 bg-[#0B8F63] hover:bg-[#086F4C] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-md shadow-[#0B8F63]/20 hover:scale-105 transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4 fill-white text-[#0B8F63]" />
                <span>Shop on WhatsApp</span>
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
                  title="Book VIP Fitting on Google Calendar"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Fitting</span>
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
        onSelectCategory={(cat: any) => {
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
