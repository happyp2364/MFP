import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Package,
  Heart,
  Gift,
  Ticket,
  MapPin,
  Phone,
  MessageCircle,
  Info,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  Footprints,
  Shirt,
  Tag,
  HelpCircle,
  Search,
  Instagram,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface MobileSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
  onOpenStoreLocator?: () => void;
  onOpenAuthModal?: () => void;
  onOpenOrdersModal?: () => void;
  onOpenWishlistModal?: () => void;
  onOpenRewardsModal?: () => void;
  onSelectCategory?: (category: string) => void;
  onNavigateToSection?: (sectionId: string) => void;
}

export const MobileSideDrawer: React.FC<MobileSideDrawerProps> = ({
  isOpen,
  onClose,
  onOpenSearch,
  onOpenStoreLocator,
  onOpenAuthModal,
  onOpenOrdersModal,
  onOpenWishlistModal,
  onOpenRewardsModal,
  onSelectCategory,
  onNavigateToSection,
}) => {
  const { customerUser, customerProfile, customerSignOut, storeInfo, websiteConfig, logoConfig } = useStore();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCategoryClick = (catKey: string) => {
    if (onSelectCategory) {
      onSelectCategory(catKey);
    }
    onClose();
  };

  const handleNavClick = (sectionId: string) => {
    if (onNavigateToSection) {
      onNavigateToSection(sectionId);
    }
    onClose();
  };

  const brandName = logoConfig?.brandNameText || storeInfo?.name || 'Marudhar Fashion Point';
  const logoUrl = logoConfig?.logoUrl || storeInfo?.logoUrl || '';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Container (Slide from Left, Light Theme) */}
      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-[340px] sm:max-w-sm bg-white text-neutral-900 flex flex-col shadow-2xl border-r border-neutral-200 transform transition-transform duration-300 ease-out">
          
          {/* Drawer Header */}
          <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-8 w-auto object-contain rounded" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-[#0B8F63] text-white font-serif font-black flex items-center justify-center text-sm shadow-sm">
                  M
                </div>
              )}
              <div>
                <h2 className="font-serif font-bold text-sm text-neutral-900 tracking-tight leading-tight">
                  {brandName}
                </h2>
                <p className="text-[10px] text-neutral-500 font-medium tracking-wide">
                  Pipar City, Jodhpur
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-neutral-200/60 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
            
            {/* Search Bar Trigger */}
            <div
              onClick={() => {
                onClose();
                if (onOpenSearch) onOpenSearch();
              }}
              className="w-full flex items-center gap-3 bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200 text-neutral-600 px-3.5 py-3 rounded-2xl cursor-pointer transition-all shadow-2xs"
            >
              <Search className="w-4 h-4 text-[#0B8F63]" />
              <span className="font-semibold text-xs text-neutral-700">Search shoes, sneakers, loafers...</span>
            </div>

            {/* Login / Account Card */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-neutral-50 border border-emerald-500/20 rounded-2xl p-4 shadow-xs">
              {customerUser ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#0B8F63] text-white font-black flex items-center justify-center text-base shadow-sm">
                      {customerProfile?.name ? customerProfile.name[0].toUpperCase() : 'M'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-neutral-900 text-sm">
                          {customerProfile?.name || 'Valued Shopper'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-black uppercase border border-amber-300">
                          VIP
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate max-w-[160px]">
                        {customerUser.email || customerUser.phoneNumber || 'Signed in'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenOrdersModal) onOpenOrdersModal();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#0B8F63] text-white font-bold text-[11px] shadow-xs hover:bg-[#086F4C] transition-colors"
                  >
                    Orders
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-neutral-900">Hey, Shoe Lover! 👋</h3>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      Login to manage your orders, wishlist, rewards & more.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenAuthModal) onOpenAuthModal();
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Login / Register</span>
                  </button>
                </div>
              )}
            </div>

            {/* SHOP DISCOVERY VISUAL TILES */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-black uppercase text-neutral-400 tracking-wider px-1">
                <span>Shop Discovery</span>
                <span className="text-[10px] text-[#0B8F63]">Trending</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { title: 'Men’s Footwear', cat: 'men', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=300&q=80' },
                  { title: 'Women’s Shoes', cat: 'women', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80' },
                  { title: 'New Arrivals', section: 'new_arrivals', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=300&q=80' },
                  { title: 'Best Sellers', section: 'best_sellers', img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=300&q=80' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (item.cat) handleCategoryClick(item.cat);
                      else if (item.section) handleNavClick(item.section);
                    }}
                    className="group relative rounded-2xl overflow-hidden border border-neutral-200 h-24 bg-neutral-100 cursor-pointer shadow-2xs hover:shadow-md transition-all flex items-end p-2.5"
                  >
                    <img
                      src={item.img}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />
                    <span className="relative z-10 text-white font-bold text-xs tracking-tight flex items-center justify-between w-full">
                      <span>{item.title}</span>
                      <ArrowRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* MFP CATEGORY ACCORDION */}
            <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-neutral-50">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="w-full flex items-center justify-between p-3.5 bg-white text-neutral-800 font-bold text-xs cursor-pointer hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-[#0B8F63]" />
                  <span>All Categories & Collections</span>
                </div>
                {isCategoriesOpen ? <ChevronDown className="w-4 h-4 text-neutral-500" /> : <ChevronRight className="w-4 h-4 text-neutral-500" />}
              </button>

              {isCategoriesOpen && (
                <div className="p-2 space-y-1 bg-neutral-50/80 border-t border-neutral-200">
                  {[
                    { label: 'Sneakers', cat: 'men' },
                    { label: 'Sports & Running Shoes', cat: 'men' },
                    { label: 'Loafers & Formals', cat: 'men' },
                    { label: 'Women’s Heels & Flats', cat: 'women' },
                    { label: 'Kids Footwear', cat: 'kids' },
                    { label: 'Men’s Apparel & Shirts', cat: 'clothing' },
                    { label: 'Sandals & Slides', cat: 'all' },
                  ].map((sub, i) => (
                    <button
                      key={i}
                      onClick={() => handleCategoryClick(sub.cat)}
                      className="w-full text-left px-3 py-2 rounded-xl text-neutral-700 hover:text-[#0B8F63] hover:bg-white font-medium text-xs flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>{sub.label}</span>
                      <ChevronRight className="w-3 h-3 text-neutral-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ACCOUNT & QUICK ACTIONS LIST */}
            <div className="space-y-1 border-t border-neutral-200 pt-3">
              <div className="text-[10px] font-black uppercase text-neutral-400 tracking-wider px-1 mb-1.5">
                My Account & Orders
              </div>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenOrdersModal) onOpenOrdersModal();
                }}
                className="w-full p-2.5 rounded-xl hover:bg-neutral-100 text-neutral-700 font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-amber-600" />
                  <span>My Orders & Delivery Tracking</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenWishlistModal) onOpenWishlistModal();
                }}
                className="w-full p-2.5 rounded-xl hover:bg-neutral-100 text-neutral-700 font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>My Saved Wishlist</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenRewardsModal) onOpenRewardsModal();
                }}
                className="w-full p-2.5 rounded-xl hover:bg-neutral-100 text-neutral-700 font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Gift className="w-4 h-4 text-purple-600" />
                  <span>Spin & Win Rewards</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[9px] font-black">
                  FREE
                </span>
              </button>
            </div>

            {/* NEARBY STORES / STORE LOCATOR */}
            <div className="border-t border-neutral-200 pt-3">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenStoreLocator) onOpenStoreLocator();
                }}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-500/30 text-emerald-900 hover:bg-emerald-100/60 flex items-center justify-between transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#0B8F63]" />
                  <span className="font-extrabold text-xs">Nearby Stores & Showroom</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#0B8F63] text-white text-[9px] font-black">
                  VISIT
                </span>
              </button>
            </div>

            {/* FOLLOW US ON INSTAGRAM */}
            <div className="border-t border-neutral-200 pt-3">
              <a
                href="https://www.instagram.com/marudharfashionpoint/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 border border-pink-500/20 text-neutral-800 hover:bg-pink-100/50 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs block">@marudharfashionpoint</span>
                    <span className="text-[10px] text-neutral-500">Tag #MarudharStyle to get featured</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </a>
            </div>

            {/* HELP & SUPPORT ACCORDION */}
            <div className="border-t border-neutral-200 pt-3 space-y-1">
              <button
                onClick={() => setIsHelpOpen(!isHelpOpen)}
                className="w-full flex items-center justify-between p-2 rounded-xl text-neutral-700 hover:bg-neutral-100 font-semibold text-xs"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Help, FAQ & Contact Support</span>
                </div>
                {isHelpOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {isHelpOpen && (
                <div className="pl-6 space-y-2 py-2 text-neutral-600 text-xs">
                  <a
                    href={`https://wa.me/91${storeInfo.phone.replace(/[^0-9]/g, '') || '9829012345'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-emerald-700 font-semibold hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Helpline</span>
                  </a>
                  <button onClick={() => handleNavClick('faqs')} className="block hover:text-[#0B8F63]">
                    Frequently Asked Questions
                  </button>
                  <button onClick={() => handleNavClick('about_store')} className="block hover:text-[#0B8F63]">
                    About Our Store (Pipar City)
                  </button>
                  <button onClick={() => handleNavClick('footer')} className="block hover:text-[#0B8F63]">
                    Shipping, Returns & Policies
                  </button>
                </div>
              )}
            </div>

            {/* LOGOUT BUTTON */}
            {customerUser && (
              <div className="border-t border-neutral-200 pt-3 pb-2">
                <button
                  onClick={() => {
                    customerSignOut();
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout from Account</span>
                </button>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-3 bg-neutral-100 border-t border-neutral-200 text-center text-[10px] text-neutral-500 font-medium">
            Marudhar Fashion Point © 2026 • Instagram Inspired Light Theme
          </div>
        </div>
      </div>
    </div>
  );
};
