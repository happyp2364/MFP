import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Settings,
  LayoutDashboard,
  Package,
  Tag,
  Database,
  Ticket,
  Sparkles,
  CreditCard,
  Share2,
  Sliders,
  LogOut,
  ChevronRight,
  Loader2,
  ChevronUp,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface FloatingAdminButtonProps {
  onOpenAdmin: () => void;
  onOpenAdminWithTab: (tab: string) => void;
}

export const FloatingAdminButton: React.FC<FloatingAdminButtonProps> = ({
  onOpenAdmin,
  onOpenAdminWithTab,
}) => {
  const { isAdmin, isAdminAuthLoading, logoutAdmin } = useStore();
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  
  const lastScrollY = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto Hide on Scroll Down, Reappear on Scroll Up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 120) {
        setIsVisible(false);
        setShowQuickMenu(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside to close quick menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowQuickMenu(false);
      }
    };

    if (showQuickMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuickMenu]);

  // Check if URL suggests admin intent
  const isUrlAdmin = typeof window !== 'undefined' && (
    window.location.search.includes('admin=true') ||
    window.location.pathname.includes('/admin')
  );

  // If user is not admin AND auth is not loading AND URL doesn't request admin, return null
  if (!isAdmin && !isAdminAuthLoading && !isUrlAdmin) return null;

  const handlePrimaryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBusy) return;

    setIsBusy(true);
    try {
      onOpenAdmin();
    } finally {
      setTimeout(() => setIsBusy(false), 300);
    }
  };

  const menuItems = [
    { label: 'Dashboard', tab: 'overview', icon: <LayoutDashboard className="w-4 h-4 text-[#0B8F63]" /> },
    { label: 'Orders', tab: 'orders', icon: <Package className="w-4 h-4 text-sky-600" /> },
    { label: 'Products', tab: 'products', icon: <Tag className="w-4 h-4 text-amber-500" /> },
    { label: 'Inventory', tab: 'products', icon: <Database className="w-4 h-4 text-indigo-500" /> },
    { label: 'Coupons', tab: 'coupons', icon: <Ticket className="w-4 h-4 text-emerald-500" /> },
    { label: 'Homepage Editor', tab: 'homepage', icon: <Sparkles className="w-4 h-4 text-fuchsia-500" /> },
    { label: 'Payment Settings', tab: 'payment_settings', icon: <CreditCard className="w-4 h-4 text-cyan-600" /> },
    { label: 'Social Media', tab: 'instagram', icon: <Share2 className="w-4 h-4 text-rose-500" /> },
    { label: 'Website Settings', tab: 'settings', icon: <Sliders className="w-4 h-4 text-neutral-600" /> },
  ];

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Quick Admin Menu Panel */}
      <AnimatePresence>
        {showQuickMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="mb-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/85 rounded-2xl shadow-2xl overflow-hidden w-64 max-h-[80vh] overflow-y-auto z-50 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick Menu Header */}
            <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-0.5">Quick Menu</span>
              <span className="text-xs font-black text-neutral-800 dark:text-neutral-100">🛡️ Admin Command Hub</span>
            </div>

            {/* Menu Options */}
            <div className="py-1.5 px-2 space-y-0.5">
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenAdminWithTab(item.tab);
                    setShowQuickMenu(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-neutral-100/60 dark:bg-neutral-800 group-hover:bg-white dark:group-hover:bg-neutral-750 transition-colors shadow-sm">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}

              <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1.5" />

              {/* Logout Option */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  logoutAdmin();
                  setShowQuickMenu(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-extrabold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 group-hover:bg-rose-100/50 dark:group-hover:bg-rose-900/30 transition-colors">
                    <LogOut className="w-4 h-4 text-rose-500" />
                  </span>
                  <span>Logout Session</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-rose-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) */}
      <AnimatePresence>
        {isVisible && (
          <div className="flex items-center gap-1 bg-amber-500/95 dark:bg-amber-600/95 backdrop-blur-md border border-amber-400/30 shadow-2xl rounded-full p-1 transition-all duration-300">
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePrimaryClick}
              disabled={isBusy}
              className="flex items-center gap-2 px-3.5 py-2 text-neutral-900 dark:text-white select-none cursor-pointer group font-black text-xs uppercase tracking-wider"
              title="Open Admin Dashboard"
            >
              <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                {isAdminAuthLoading ? (
                  <Loader2 className="w-4 h-4 text-neutral-900 dark:text-white animate-spin" />
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-neutral-900 dark:text-white group-hover:rotate-12 transition-transform duration-300" />
                    <Settings className="w-2.5 h-2.5 text-neutral-900 dark:text-white absolute -bottom-0.5 -right-0.5 animate-[spin_8s_linear_infinite]" />
                  </>
                )}
              </div>
              <span>Admin</span>
            </motion.button>

            {isAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowQuickMenu(!showQuickMenu);
                }}
                className="p-1.5 hover:bg-black/10 rounded-full text-neutral-900 dark:text-white transition-colors"
                title="Quick Menu"
              >
                <ChevronUp className={`w-4 h-4 transition-transform duration-200 ${showQuickMenu ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
