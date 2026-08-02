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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface FloatingAdminButtonProps {
  onOpenAdmin: () => void;
  onOpenAdminWithTab: (tab: string) => void;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export const FloatingAdminButton: React.FC<FloatingAdminButtonProps> = ({
  onOpenAdmin,
  onOpenAdminWithTab,
}) => {
  const { isAdmin, logoutAdmin } = useStore();
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  
  const lastScrollY = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto Hide on Scroll Down, Reappear on Scroll Up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 120) {
        // Scrolling down
        setIsVisible(false);
        setShowQuickMenu(false); // Auto close menu if scrolling down
      } else {
        // Scrolling up
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

  // If user is not logged in as Admin, do not render the FAB
  if (!isAdmin) return null;

  // Handle Ripple Effect
  const handleCreateRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
  };

  // Long Press Handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    isLongPressActive.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressActive.current = true;
      setShowQuickMenu(true);
      // Optional: trigger device vibration for haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 500); // 500ms threshold for long press
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (!isLongPressActive.current) {
      // It's a single tap!
      handleCreateRipple(e as React.MouseEvent<HTMLButtonElement>);
      onOpenAdmin();
    }
  };

  const handleTouchMove = () => {
    // If they drag, cancel the long press
    if (timerRef.current) {
      clearTimeout(timerRef.current);
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
                  onClick={() => {
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
                onClick={() => {
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
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            className="flex items-center gap-2.5 px-4.5 py-3 rounded-full bg-amber-500/95 dark:bg-amber-600/95 backdrop-blur-md border border-amber-400/30 shadow-2xl hover:bg-amber-500 dark:hover:bg-amber-600 text-neutral-900 dark:text-white transition-all duration-300 relative overflow-hidden select-none cursor-pointer group"
            title="Admin Dashboard (Hold for Quick Menu)"
            style={{ touchAction: 'none' }}
          >
            {/* Dynamic CSS Ripple Elements */}
            {ripples.map((ripple) => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 15, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                onAnimationComplete={() => {
                  setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
                }}
                className="absolute bg-white/40 rounded-full pointer-events-none"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  width: 16,
                  height: 16,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}

            {/* Premium Icon Concept: Shield with a rotating gear inside */}
            <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
              <ShieldAlert className="w-5 h-5 text-neutral-900 dark:text-white group-hover:rotate-12 transition-transform duration-300" />
              <Settings className="w-2.5 h-2.5 text-neutral-900 dark:text-white absolute -bottom-0.5 -right-0.5 animate-[spin_8s_linear_infinite]" />
            </div>

            {/* Admin Label */}
            <span className="text-xs font-black uppercase tracking-widest text-neutral-900 dark:text-white">
              Admin
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
