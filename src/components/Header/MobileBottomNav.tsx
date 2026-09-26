import React from 'react';
import { Home, Search, Heart, ShoppingBag, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  wishlistCount: number;
  cartCount: number;
  onNavigateHome: () => void;
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
  onOpenCart: () => void;
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  wishlistCount,
  cartCount,
  onNavigateHome,
  onOpenSearch,
  onOpenWishlist,
  onOpenCart,
  onOpenMenu,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200/80 dark:border-neutral-800 md:hidden flex items-center justify-around py-2 px-3 shadow-2xl safe-area-bottom">
      {/* Home */}
      <button
        onClick={onNavigateHome}
        className="flex flex-col items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-[#0B8F63] dark:hover:text-[#0B8F63] transition-colors py-1 px-2 relative min-w-[56px]"
        aria-label="Home"
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-semibold tracking-tight">Home</span>
      </button>

      {/* Search */}
      <button
        onClick={onOpenSearch}
        className="flex flex-col items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-[#0B8F63] dark:hover:text-[#0B8F63] transition-colors py-1 px-2 relative min-w-[56px]"
        aria-label="Search"
      >
        <Search className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-semibold tracking-tight">Search</span>
      </button>

      {/* Wishlist */}
      <button
        onClick={onOpenWishlist}
        className="flex flex-col items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-[#0B8F63] dark:hover:text-[#0B8F63] transition-colors py-1 px-2 relative min-w-[56px]"
        aria-label="Wishlist"
      >
        <div className="relative">
          <Heart className="w-5 h-5 mb-0.5" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {wishlistCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold tracking-tight">Wishlist</span>
      </button>

      {/* Cart / Bag */}
      <button
        onClick={onOpenCart}
        className="flex flex-col items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-[#0B8F63] dark:hover:text-[#0B8F63] transition-colors py-1 px-2 relative min-w-[56px]"
        aria-label="Cart"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#0B8F63] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold tracking-tight">Bag</span>
      </button>

      {/* Menu / Drawer */}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-[#0B8F63] dark:hover:text-[#0B8F63] transition-colors py-1 px-2 relative min-w-[56px]"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-semibold tracking-tight">Menu</span>
      </button>
    </nav>
  );
};
