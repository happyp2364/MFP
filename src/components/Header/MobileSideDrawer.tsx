import React, { useState } from 'react';
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
  Lock,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface MobileSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStoreLocator: () => void;
  onOpenAuthModal: () => void;
  onOpenOrdersModal: () => void;
  onOpenWishlistModal: () => void;
  onOpenRewardsModal: () => void;
  onSelectCategory?: (category: string) => void;
}

export const MobileSideDrawer: React.FC<MobileSideDrawerProps> = ({
  isOpen,
  onClose,
  onOpenStoreLocator,
  onOpenAuthModal,
  onOpenOrdersModal,
  onOpenWishlistModal,
  onOpenRewardsModal,
  onSelectCategory,
}) => {
  const { customerUser, customerProfile, customerSignOut, storeInfo, isAdmin } = useStore();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);

  if (!isOpen) return null;

  const handleCategoryClick = (catKey: string) => {
    if (onSelectCategory) {
      onSelectCategory(catKey);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/70 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Container */}
      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-xs sm:max-w-sm bg-neutral-900 text-white flex flex-col shadow-2xl border-r border-neutral-800">
          {/* Drawer Top Header / User Card */}
          <div className="p-5 bg-gradient-to-br from-emerald-950 via-neutral-900 to-neutral-950 border-b border-neutral-800 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800/80 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {customerUser ? (
              <div className="flex items-center gap-3 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-emerald-500/20 border border-emerald-400/30">
                  {customerProfile?.name ? customerProfile.name[0].toUpperCase() : 'M'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-extrabold text-white truncate max-w-[160px]">
                      {customerProfile?.name || 'Valued Shopper'}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase border border-amber-500/30">
                      VIP
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 truncate max-w-[170px]">
                    {customerUser.email || customerUser.phoneNumber || 'LoggedIn Customer'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-neutral-800 text-emerald-400 flex items-center justify-center font-bold">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Welcome</h3>
                    <p className="text-xs text-neutral-400">Sign in to track orders & earn rewards</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  Sign In / Register
                </button>
              </div>
            )}
          </div>

          {/* Drawer Menu Links */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs font-bold divide-y divide-neutral-800/80">
            {/* Quick Action Links */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenOrdersModal();
                }}
                className="w-full p-3 rounded-2xl hover:bg-neutral-800 text-neutral-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-amber-500" />
                  <span>My Orders & Tracking</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-600" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenWishlistModal();
                }}
                className="w-full p-3 rounded-2xl hover:bg-neutral-800 text-neutral-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>My Wishlist</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-600" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenRewardsModal();
                }}
                className="w-full p-3 rounded-2xl hover:bg-neutral-800 text-neutral-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Gift className="w-4 h-4 text-purple-400" />
                  <span>Spin the Wheel & Rewards</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-black uppercase">
                  WIN PRIZES
                </span>
              </button>

              {/* Nearby Stores Featured Link */}
              <button
                onClick={() => {
                  onClose();
                  onOpenStoreLocator();
                }}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500/30 text-emerald-300 hover:text-white flex items-center justify-between transition-all cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-emerald-400 animate-bounce" />
                  <span className="font-extrabold">Nearby Stores & Outlets</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase">
                  LOCATE
                </span>
              </button>
            </div>

            {/* Shop by Category Accordion */}
            <div className="pt-4 space-y-2">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="w-full flex items-center justify-between text-neutral-400 uppercase tracking-widest text-[10px] font-black px-1"
              >
                <span>Shop By Category</span>
                {isCategoriesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {isCategoriesOpen && (
                <div className="space-y-1 pt-1">
                  <button
                    onClick={() => handleCategoryClick('men')}
                    className="w-full p-2.5 rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Footprints className="w-4 h-4 text-emerald-500" />
                    <span>Men's Footwear</span>
                  </button>

                  <button
                    onClick={() => handleCategoryClick('women')}
                    className="w-full p-2.5 rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span>Women's Shoes & Heels</span>
                  </button>

                  <button
                    onClick={() => handleCategoryClick('kids')}
                    className="w-full p-2.5 rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Footprints className="w-4 h-4 text-amber-400" />
                    <span>Kids Footwear</span>
                  </button>

                  <button
                    onClick={() => handleCategoryClick('clothing')}
                    className="w-full p-2.5 rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Shirt className="w-4 h-4 text-blue-400" />
                    <span>Men's Apparel & Accessories</span>
                  </button>
                </div>
              )}
            </div>

            {/* Store Information & Customer Support */}
            <div className="pt-4 space-y-1">
              <div className="text-neutral-400 uppercase tracking-widest text-[10px] font-black px-1 mb-2">
                Help & Support
              </div>

              <a
                href={`https://wa.me/91${storeInfo.phone.replace(/[^0-9]/g, '') || '9829012345'}?text=Hi%20Marudhar%20Fashion%20Point%20support,%20I%20need%20help.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-2.5 rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-3 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <span>WhatsApp Support</span>
              </a>

              <a
                href={`tel:${storeInfo.phone || '9829012345'}`}
                className="w-full p-2.5 rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-3 transition-colors"
              >
                <Phone className="w-4 h-4 text-blue-400" />
                <span>Helpline: {storeInfo.phone}</span>
              </a>
            </div>

            {/* Logout Action */}
            {customerUser && (
              <div className="pt-4">
                <button
                  onClick={() => {
                    customerSignOut();
                    onClose();
                  }}
                  className="w-full p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-neutral-950 border-t border-neutral-800 text-center text-[10px] text-neutral-500 font-medium">
            Marudhar Fashion Point © 2026 • Premium Footwear Systems
          </div>
        </div>
      </div>
    </div>
  );
};
