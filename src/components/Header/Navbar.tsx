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
                      Marudhar
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded bg-[#0B8F63]/10 text-[#0B8F63] uppercase tracking-wider">
                      Point
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-neutral-500 font-medium tracking-wide hidden xs:block">
                    Fashion & Footwear
                  </p>
                </div>
              </button>
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
            </nav>

            {/* Right Utilities Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Dynamic Theme & Time Toggle */}
              <div className="hidden xs:block">
                <ThemeToggleWidget compact />
              </div>

              {/* Search Trigger */}
              <button
                onClick={onOpenSearch}
                className="p-2 sm:p-2.5 rounded-full text-neutral-700 hover:text-[#0B8F63] hover:bg-neutral-100 transition-all active:scale-95"
                aria-label="Search products"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Icon */}
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
              {onOpenCustomerAccount && (
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
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
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

            <div className="p-4 space-y-5 flex-1">
              
              {/* 1. Greeting & Google Workspace Card */}
              <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-2xl p-4 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Google Workspace & Login</span>
                  </h3>
                </div>
                <p className="text-[11px] text-neutral-300 leading-snug">
                  Sign in with Google to sync VIP store fittings to Google Calendar and send direct Gmail inquiries.
                </p>
                <div className="space-y-2">
                  <GoogleAuthButton onOpenWorkspaceHub={() => { setMobileMenuOpen(false); onOpenWorkspaceHub?.(); }} />
                  
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {onOpenCalendarModal && (
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenCalendarModal(); }}
                        className="bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Fitting</span>
                      </button>
                    )}
                    {onOpenGmailModal && (
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenGmailModal(); }}
                        className="bg-neutral-800 hover:bg-neutral-700 text-red-400 border border-red-500/30 text-[11px] font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Gmail Inquiry</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Drawer Search Bar */}
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenSearch(); }}
                className="w-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-500 text-xs font-medium px-3.5 py-3 rounded-xl flex items-center justify-between border border-neutral-200/60 transition-all text-left"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#0B8F63]" />
                  <span>Search Men's Shoes, Women's Sports Shoes, Kids...</span>
                </span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded text-neutral-600 font-bold border">
                  SEARCH
                </span>
              </button>

              {/* 3. Shop Categories Grid Section */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-extrabold uppercase text-neutral-400 tracking-wider block">
                  Shop Collections
                </span>
                <div className="grid grid-cols-2 gap-2">
                  
                  {/* Men Card */}
                  <button
                    onClick={() => handleCategoryClick('men')}
                    className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 hover:bg-[#0B8F63]/10 border border-neutral-200/70 transition-all text-left group"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=100&q=80"
                      alt="Men Wear"
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-neutral-800 group-hover:text-[#0B8F63] block truncate">
                        Men's Collection
                      </span>
                      <span className="text-[9px] text-neutral-500 block">Shoes & Apparel</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#0B8F63] shrink-0" />
                  </button>

                  {/* Women Card */}
                  <button
                    onClick={() => handleCategoryClick('women')}
                    className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 hover:bg-[#0B8F63]/10 border border-neutral-200/70 transition-all text-left group"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=100&q=80"
                      alt="Women Sports Shoes"
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-neutral-800 group-hover:text-[#0B8F63] block truncate">
                        Women's Sports Shoes
                      </span>
                      <span className="text-[9px] text-neutral-500 block">Athletic & Running</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#0B8F63] shrink-0" />
                  </button>

                  {/* Kids Card */}
                  <button
                    onClick={() => handleCategoryClick('kids')}
                    className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 hover:bg-[#0B8F63]/10 border border-neutral-200/70 transition-all text-left group"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=100&q=80"
                      alt="Kids Footwear"
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-neutral-800 group-hover:text-[#0B8F63] block truncate">
                        Kids' Footwear
                      </span>
                      <span className="text-[9px] text-neutral-500 block">School & Sports</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#0B8F63] shrink-0" />
                  </button>

                  {/* New Arrivals */}
                  <button
                    onClick={() => handleCategoryClick('all')}
                    className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 hover:bg-[#0B8F63]/10 border border-neutral-200/70 transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#0B8F63]/10 text-[#0B8F63] flex items-center justify-center font-bold text-xs shrink-0">
                      ⚡
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-neutral-800 group-hover:text-[#0B8F63] block truncate">
                        New Arrivals
                      </span>
                      <span className="text-[9px] text-amber-600 font-semibold block">Just Launched</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#0B8F63] shrink-0" />
                  </button>

                </div>
              </div>

              {/* 4. Quick Actions (Wishlist, Bag) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenWishlist(); }}
                  className="p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/70 text-xs font-bold flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-amber-600 fill-amber-500" />
                    <span>Wishlist</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px]">
                    {wishlistCount}
                  </span>
                </button>

                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenOrderSheet(); }}
                  className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/70 text-xs font-bold flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#0B8F63]" />
                    <span>Inquiry Bag</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#0B8F63] text-white text-[10px]">
                    {cartCount}
                  </span>
                </button>
              </div>

              {/* 5. Quick Links List */}
              <div className="space-y-1 pt-2 border-t border-neutral-100">
                <span className="text-[11px] font-extrabold uppercase text-neutral-400 tracking-wider block mb-1">
                  Explore & Support
                </span>

                <button
                  onClick={() => handleNavClick('reviews')}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#0B8F63]" />
                    <span>Customer Reviews & Ratings</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>

                <button
                  onClick={() => handleNavClick('about')}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Footprints className="w-4 h-4 text-[#0B8F63]" />
                    <span>About Marudhar Fashion Point</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>

                <button
                  onClick={() => handleNavClick('contact')}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#0B8F63]" />
                    <span>Store Location & Directions</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>
              </div>

              {isAdmin && (
                <div className="space-y-1 pt-2 border-t border-neutral-100">
                  <span className="text-[11px] font-extrabold uppercase text-[#0B8F63] tracking-wider block mb-1">
                    Admin Tools
                  </span>
                  
                  <button
                    onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-semibold text-neutral-900 bg-[#0B8F63]/10 hover:bg-[#0B8F63]/20 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#0B8F63]" />
                      <span>Open Admin Panel</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#0B8F63]" />
                  </button>
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
