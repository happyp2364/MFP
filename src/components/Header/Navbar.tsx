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

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenOrderSheet: () => void;
  onOpenWishlist: () => void;
  onOpenAdmin: () => void;
  onOpenAdminWithTab?: (tab: string) => void;
  onOpenCustomerAccount?: () => void;
  onOpenSoundSettings?: () => void;
  onOpenCalendarModal?: () => void;
  onOpenGmailModal?: () => void;
  onOpenWorkspaceHub?: () => void;
  wishlistCount: number;
  cartCount: number;
  activeCategory: GenderCategory;
  onSelectCategory: (cat: GenderCategory) => void;
  onNavigateToSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenOrderSheet,
  onOpenWishlist,
  onOpenAdmin,
  onOpenAdminWithTab,
  onOpenCustomerAccount,
  onOpenSoundSettings,
  onOpenCalendarModal,
  onOpenGmailModal,
  onOpenWorkspaceHub,
  wishlistCount,
  cartCount,
  activeCategory,
  onSelectCategory,
  onNavigateToSection,
}) => {
  const { storeInfo, isAdmin, customerSoundSettings } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);

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
                  onClick={() => handleNavClick('hero')}
                  className="flex items-center gap-2 text-left group"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0B8F63] flex items-center justify-center text-white shadow-md shadow-[#0B8F63]/20 group-hover:scale-105 transition-transform duration-300">
                    <Footprints className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-serif-heading font-extrabold text-base sm:text-xl text-neutral-900 tracking-tight">
                        {storeInfo?.headerLogoText || 'Marudhar'}
                      </span>
                      {(!storeInfo?.headerLogoText || storeInfo.headerLogoText === 'Marudhar') && (
                        <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded bg-[#0B8F63]/10 text-[#0B8F63] uppercase tracking-wider">
                          Point
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-neutral-500 font-medium tracking-wide hidden xs:block">
                      Fashion & Footwear
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
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] bg-white rounded-2xl shadow-2xl border border-neutral-100 p-6 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b pb-2">
                          <span className="w-2 h-2 rounded-full bg-[#0B8F63]" />
                          <h4 className="font-bold text-sm text-neutral-900">Men's Footwear</h4>
                        </div>
                        <ul className="space-y-2 text-xs text-neutral-600">
                          <li>
                            <button onClick={() => handleCategoryClick('men')} className="hover:text-[#0B8F63] hover:translate-x-0.5 transition-all block w-full text-left py-0.5">
                              Sports & Running Shoes
                            </button>
                          </li>
                          <li>
                            <button onClick={() => handleCategoryClick('men')} className="hover:text-[#0B8F63] hover:translate-x-0.5 transition-all block w-full text-left py-0.5">
                              Casual Sneakers & Slip-Ons
                            </button>
                          </li>
                          <li>
                            <button onClick={() => handleCategoryClick('men')} className="hover:text-[#0B8F63] hover:translate-x-0.5 transition-all block w-full text-left py-0.5">
                              Formal Leather Shoes
                            </button>
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b pb-2">
                          <span className="w-2 h-2 rounded-full bg-[#0B8F63]" />
                          <h4 className="font-bold text-sm text-neutral-900">Women's Sports Shoes</h4>
                        </div>
                        <ul className="space-y-2 text-xs text-neutral-600">
                          <li>
                            <button onClick={() => handleCategoryClick('women')} className="hover:text-[#0B8F63] hover:translate-x-0.5 transition-all block w-full text-left py-0.5 font-medium">
                              Athletic Running & Sports Shoes
                            </button>
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b pb-2">
                          <span className="w-2 h-2 rounded-full bg-[#0B8F63]" />
                          <h4 className="font-bold text-sm text-neutral-900">Kids' Footwear</h4>
                        </div>
                        <ul className="space-y-2 text-xs text-neutral-600">
                          <li>
                            <button onClick={() => handleCategoryClick('kids')} className="hover:text-[#0B8F63] hover:translate-x-0.5 transition-all block w-full text-left py-0.5">
                              Light-Up Sports Shoes
                            </button>
                          </li>
                          <li>
                            <button onClick={() => handleCategoryClick('kids')} className="hover:text-[#0B8F63] hover:translate-x-0.5 transition-all block w-full text-left py-0.5">
                              School Shoes & Assembly Wear
                            </button>
                          </li>
                          <li>
                            <button onClick={() => handleCategoryClick('kids')} className="hover:text-[#0B8F63] hover:translate-x-0.5 transition-all block w-full text-left py-0.5">
                              Party Wear Shoes & Sandals
                            </button>
                          </li>
                        </ul>
                      </div>
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

              {/* Admin Panel Trigger */}
              <button
                onClick={onOpenAdmin}
                className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full border transition-all ${
                  isAdmin
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 shadow-sm'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-200'
                }`}
                title={isAdmin ? 'Open Admin Dashboard' : 'Store Admin Login'}
              >
                <ShieldCheck className={`w-4 h-4 ${isAdmin ? 'text-amber-600' : 'text-[#0B8F63]'}`} />
                <span className="hidden sm:inline">{isAdmin ? 'Admin Panel' : 'Admin'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE LEFT SLIDE-OVER DRAWER (NEEMANS STYLE) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          />

          {/* Left Side Content Container */}
          <div className="relative w-full max-w-[320px] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300 overflow-y-auto no-scrollbar">
            
            {/* Drawer Top Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80 sticky top-0 bg-white z-20 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0B8F63] flex items-center justify-center text-white">
                  <Footprints className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-serif-heading font-extrabold text-sm text-neutral-900">
                    Marudhar Point
                  </span>
                  <span className="text-[10px] text-neutral-500 block leading-none">
                    Fashion & Footwear
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/60 transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Nav List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Main Store Navigation */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider block mb-2 px-2">
                  Store Directory
                </span>

                {/* 🏠 Home */}
                <button
                  onClick={() => { handleNavClick('hero'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3.5 py-3 px-3 rounded-xl text-xs font-bold text-neutral-700 hover:text-[#0B8F63] hover:bg-neutral-50 transition-all text-left animate-in fade-in duration-200"
                >
                  <Home className="w-4 h-4 text-[#0B8F63]" />
                  <span>🏠 Home</span>
                </button>

                {/* 📂 Categories Accordion */}
                <div className="space-y-1">
                  <button
                    onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                    className="w-full flex items-center justify-between py-3 px-3 rounded-xl text-xs font-bold text-neutral-700 hover:text-[#0B8F63] hover:bg-neutral-50 transition-all text-left"
                  >
                    <span className="flex items-center gap-3.5">
                      <Layers className="w-4 h-4 text-[#0B8F63]" />
                      <span>📂 Categories</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${categoriesExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {categoriesExpanded && (
                    <div className="pl-9 pr-2 py-1 space-y-1 bg-neutral-50/50 rounded-xl border border-neutral-100 animate-in slide-in-from-top-2 duration-200">
                      <button
                        onClick={() => handleCategoryClick('men')}
                        className="w-full text-left py-2 px-2 text-xs text-neutral-600 hover:text-[#0B8F63] font-medium"
                      >
                        Men's Collection
                      </button>
                      <button
                        onClick={() => handleCategoryClick('women')}
                        className="w-full text-left py-2 px-2 text-xs text-neutral-600 hover:text-[#0B8F63] font-medium"
                      >
                        Women's Sports Shoes
                      </button>
                      <button
                        onClick={() => handleCategoryClick('kids')}
                        className="w-full text-left py-2 px-2 text-xs text-neutral-600 hover:text-[#0B8F63] font-medium"
                      >
                        Kids' Footwear
                      </button>
                      <button
                        onClick={() => handleCategoryClick('all')}
                        className="w-full text-left py-2 px-2 text-xs text-[#0B8F63] font-bold"
                      >
                        ⚡ New Arrivals
                      </button>
                    </div>
                  )}
                </div>

                {/* ⭐ Reviews */}
                <button
                  onClick={() => { handleNavClick('reviews'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3.5 py-3 px-3 rounded-xl text-xs font-bold text-neutral-700 hover:text-[#0B8F63] hover:bg-neutral-50 transition-all text-left animate-in fade-in duration-200"
                >
                  <Star className="w-4 h-4 text-[#0B8F63]" />
                  <span>⭐ Reviews</span>
                </button>

                {/* ❤️ Wishlist */}
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenWishlist(); }}
                  className="w-full flex items-center justify-between py-3 px-3 rounded-xl text-xs font-bold text-neutral-700 hover:text-[#0B8F63] hover:bg-neutral-50 transition-all text-left animate-in fade-in duration-200"
                >
                  <span className="flex items-center gap-3.5">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>❤️ Wishlist</span>
                  </span>
                  <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                    {wishlistCount}
                  </span>
                </button>

                {/* 🛒 Cart */}
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenOrderSheet(); }}
                  className="w-full flex items-center justify-between py-3 px-3 rounded-xl text-xs font-bold text-neutral-700 hover:text-[#0B8F63] hover:bg-neutral-50 transition-all text-left animate-in fade-in duration-200"
                >
                  <span className="flex items-center gap-3.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>🛒 Cart</span>
                  </span>
                  <span className="bg-[#0B8F63] text-white px-2 py-0.5 rounded-full font-bold text-[10px]">
                    {cartCount}
                  </span>
                </button>

                {/* 📦 Orders */}
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenCustomerAccount?.(); }}
                  className="w-full flex items-center gap-3.5 py-3 px-3 rounded-xl text-xs font-bold text-neutral-700 hover:text-[#0B8F63] hover:bg-neutral-50 transition-all text-left animate-in fade-in duration-200"
                >
                  <Package className="w-4 h-4 text-amber-500" />
                  <span>📦 Orders</span>
                </button>

                {/* 📞 Contact */}
                <button
                  onClick={() => { handleNavClick('contact'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3.5 py-3 px-3 rounded-xl text-xs font-bold text-neutral-700 hover:text-[#0B8F63] hover:bg-neutral-50 transition-all text-left animate-in fade-in duration-200"
                >
                  <MapPin className="w-4 h-4 text-[#0B8F63]" />
                  <span>📞 Contact</span>
                </button>

                {/* 👤 My Account */}
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenCustomerAccount?.(); }}
                  className="w-full flex items-center gap-3.5 py-3 px-3 rounded-xl text-xs font-bold text-neutral-700 hover:text-[#0B8F63] hover:bg-neutral-50 transition-all text-left animate-in fade-in duration-200"
                >
                  <User className="w-4 h-4 text-[#0B8F63]" />
                  <span>👤 My Account</span>
                </button>
              </div>

              {/* Google Workspace Services */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider block mb-2 px-2">
                  VIP Workspace Services
                </span>
                <GoogleAuthButton onOpenWorkspaceHub={() => { setMobileMenuOpen(false); onOpenWorkspaceHub?.(); }} />
                
                <div className="grid grid-cols-2 gap-2 pt-1.5">
                  {onOpenCalendarModal && (
                    <button
                      onClick={() => { setMobileMenuOpen(false); onOpenCalendarModal(); }}
                      className="bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200 text-[10px] font-bold py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      <Calendar className="w-3 h-3 text-[#0B8F63]" />
                      <span>Book Fitting</span>
                    </button>
                  )}
                  {onOpenGmailModal && (
                    <button
                      onClick={() => { setMobileMenuOpen(false); onOpenGmailModal(); }}
                      className="bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200 text-[10px] font-bold py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      <Mail className="w-3.5 h-3.5 text-red-500" />
                      <span>Gmail Inquiry</span>
                    </button>
                  )}
                </div>
              </div>

              {/* If logged in user is Admin: Collapsible "Admin Panel" Section */}
              {isAdmin && (
                <div className="space-y-1.5 pt-4 border-t-2 border-amber-200/50">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin Control Panel</span>
                    </span>
                    <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">
                      Live
                    </span>
                  </div>

                  <button
                    onClick={() => setAdminExpanded(!adminExpanded)}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-extrabold bg-amber-50 text-amber-900 border border-amber-200/60 hover:bg-amber-100/80 transition-all text-left"
                  >
                    <span>Admin Panel Toggle</span>
                    <ChevronDown className={`w-4 h-4 text-amber-600 transition-transform duration-200 ${adminExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {adminExpanded && (
                    <div className="grid grid-cols-1 gap-1 pl-1 pr-1 py-1 bg-amber-50/20 rounded-xl border border-amber-100 animate-in slide-in-from-top-2 duration-200">
                      
                      {/* 📊 Dashboard */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('overview'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" />
                        <span>📊 Dashboard</span>
                      </button>

                      {/* 📦 Products & Stock */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('products'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <Package className="w-3.5 h-3.5 text-amber-600" />
                        <span>📦 Products & Stock</span>
                      </button>

                      {/* 🛍 Orders & Tracking */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('orders'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                        <span>🛍 Orders & Tracking</span>
                      </button>

                      {/* 🎟 Coupons */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('coupons'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <Ticket className="w-3.5 h-3.5 text-amber-600" />
                        <span>🎟 Coupons</span>
                      </button>

                      {/* ⚡ Flash Deals */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('marketing'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <Megaphone className="w-3.5 h-3.5 text-amber-600" />
                        <span>⚡ Flash Deals</span>
                      </button>

                      {/* 🎁 Lucky Box */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('lucky_box'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <Gift className="w-3.5 h-3.5 text-amber-600" />
                        <span>🎁 Lucky Box</span>
                      </button>

                      {/* 🎡 Spin Wheel */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('spin_wheel'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>🎡 Spin Wheel</span>
                      </button>

                      {/* 📰 Announcement Bar */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('top_announcement_bar'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <Layers className="w-3.5 h-3.5 text-amber-600" />
                        <span>📰 Announcement Bar</span>
                      </button>

                      {/* 🎨 Hero Section */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('homepage'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <Home className="w-3.5 h-3.5 text-amber-600" />
                        <span>🎨 Hero Section</span>
                      </button>

                      {/* 🏷 Categories & Highlights */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('categories'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <Layers className="w-3.5 h-3.5 text-amber-600" />
                        <span>🏷 Categories & Highlights</span>
                      </button>

                      {/* ⭐ Reviews Manager */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('reviews'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-600" />
                        <span>⭐ Reviews Manager</span>
                      </button>

                      {/* 📸 Happy Customers Gallery */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('instagram'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <Share2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>📸 Happy Customers Gallery</span>
                      </button>

                      {/* 📱 Social Media */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('instagram'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <Share2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>📱 Social Media</span>
                      </button>

                      {/* 📈 Analytics */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('reports'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                        <span>📈 Analytics</span>
                      </button>

                      {/* 💳 Payment Settings */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('payment_settings'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                        <span>💳 Payment Settings</span>
                      </button>

                      {/* 🏪 Store Information */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('homepage'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <Home className="w-3.5 h-3.5 text-amber-600" />
                        <span>🏪 Store Information</span>
                      </button>

                      {/* ☁ Google Drive Backup */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('backups'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <Database className="w-3.5 h-3.5 text-amber-600" />
                        <span>☁ Google Drive Backup</span>
                      </button>

                      {/* 🛠 Developer Diagnostic Center */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('audit'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>🛠 Developer Diagnostic Center</span>
                      </button>

                      {/* ⚙ Settings */}
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdminWithTab?.('settings'); }}
                        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-900 hover:bg-amber-100/50 transition-colors text-left"
                      >
                        <Settings className="w-3.5 h-3.5 text-amber-600" />
                        <span>⚙ Settings</span>
                      </button>

                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50 space-y-2 shrink-0">
              <a
                href={generateGeneralInquiryWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold py-3 rounded-xl shadow-md text-xs transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white text-[#0B8F63]" />
                <span>Shop Directly on WhatsApp</span>
              </a>

              <a
                href={`tel:${storeInfo.phone}`}
                className="w-full flex items-center justify-center gap-2 bg-white text-neutral-800 font-semibold py-2.5 rounded-xl text-xs border border-neutral-200"
              >
                <Phone className="w-3.5 h-3.5 text-[#0B8F63]" />
                <span>Call Store: {storeInfo.phone}</span>
              </a>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
