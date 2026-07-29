import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Sparkles, ArrowRight, PackageOpen } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { LuckyBoxReward } from '../../types';

interface LuckyBoxPopupProps {
  currentPath: string;
  cartSubtotal: number;
}

export const LuckyBoxPopup: React.FC<LuckyBoxPopupProps> = ({ currentPath, cartSubtotal }) => {
  const { luckyBoxConfig, triggerGlobalCelebration, recordEngagementMetric } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [reward, setReward] = useState<LuckyBoxReward | null>(null);

  useEffect(() => {
    if (!luckyBoxConfig?.enabled || luckyBoxConfig.permanentlyDisabled) return;

    // Route matching
    let shouldShow = false;
    if (luckyBoxConfig.showOnHomepage && (currentPath === '/' || currentPath === '')) shouldShow = true;
    if (luckyBoxConfig.showOnProductPage && currentPath.includes('/product/')) shouldShow = true;
    if (luckyBoxConfig.showOnCheckout && currentPath.includes('/checkout')) shouldShow = true;
    if (luckyBoxConfig.showOnOrderSuccess && currentPath.includes('/success')) shouldShow = true;

    if (!shouldShow) return;

    // Minimum cart value
    if (cartSubtotal < (luckyBoxConfig.minCartValue || 0)) return;

    // Frequency & Limits
    const lastOpened = localStorage.getItem('mfp_luckybox_last_opened');
    if (lastOpened) {
      const hoursSince = (Date.now() - parseInt(lastOpened)) / (1000 * 60 * 60);
      if (hoursSince < 24) return; // Only once a day
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
      recordEngagementMetric('luckyBoxOpens');
    }, 5000);

    return () => clearTimeout(timer);
  }, [luckyBoxConfig, currentPath, cartSubtotal]);

  const handleOpen = () => {
    setIsOpening(true);
    
    // Select reward based on probability
    const rewards = luckyBoxConfig.rewards.filter(r => r.probability > 0);
    const totalProb = rewards.reduce((sum, r) => sum + r.probability, 0);
    let rand = Math.random() * totalProb;
    
    let selected: LuckyBoxReward | null = null;
    for (const r of rewards) {
      if (rand < r.probability) {
        selected = r;
        break;
      }
      rand -= r.probability;
    }

    setTimeout(() => {
      setReward(selected || rewards[0]);
      setIsOpening(false);
      setHasOpened(true);
      localStorage.setItem('mfp_luckybox_last_opened', Date.now().toString());
      if (selected?.couponCode) {
        localStorage.setItem('mfp_active_coupon', selected.couponCode);
        recordEngagementMetric('couponsWon');
      }
      triggerGlobalCelebration();
    }, 2000);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-gradient-to-b from-indigo-900 to-indigo-950 rounded-[2.5rem] p-8 text-center shadow-2xl border border-indigo-500/30 overflow-hidden"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-40 h-40 bg-indigo-500/20 blur-[80px] rounded-full" />
              <div className="absolute bottom-[-10%] right-[-10%] w-40 h-40 bg-purple-500/20 blur-[80px] rounded-full" />
            </div>

            <button
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {!hasOpened ? (
              <div className="space-y-6 relative z-10">
                <div className="relative">
                  <motion.div
                    animate={isOpening ? { 
                      rotate: [0, -5, 5, -5, 5, 0],
                      scale: [1, 1.1, 1.1, 1.1, 1.1, 1],
                    } : {
                      y: [0, -10, 0]
                    }}
                    transition={{ 
                      repeat: isOpening ? 5 : Infinity, 
                      duration: isOpening ? 0.2 : 3 
                    }}
                    className="w-32 h-32 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-white/20"
                  >
                    <Gift className="w-16 h-16 text-white" />
                  </motion.div>
                  
                  {isOpening && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-full h-full bg-white/10 blur-xl animate-pulse rounded-full" />
                    </motion.div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-serif-heading font-black text-white italic tracking-tight">
                    LUCKY REWARD BOX
                  </h3>
                  <p className="text-sm text-indigo-200/80 leading-relaxed px-4">
                    Something special is waiting inside for you. Open the box to reveal your mystery gift!
                  </p>
                </div>

                <button
                  onClick={handleOpen}
                  disabled={isOpening}
                  className="group relative w-full bg-white text-indigo-900 font-black text-sm py-4 rounded-2xl shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isOpening ? 'OPENING...' : 'OPEN MY LUCKY BOX'}
                    {!isOpening && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-indigo-50"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '0%' }}
                    transition={{ type: 'tween' }}
                  />
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 relative z-10"
              >
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full mx-auto flex items-center justify-center border border-emerald-500/30">
                  <Sparkles className="w-12 h-12 text-emerald-400" />
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Congratulations!</p>
                  <h3 className="text-3xl font-serif-heading font-black text-white italic">
                    {reward?.title}
                  </h3>
                </div>

                {reward?.couponCode && (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                    <p className="text-[10px] font-bold text-indigo-300 uppercase">Your Secret Coupon Code</p>
                    <div className="text-2xl font-mono font-black text-emerald-400 tracking-wider">
                      {reward.couponCode}
                    </div>
                    <p className="text-[10px] text-indigo-300/60 font-medium italic">
                      Applied automatically at checkout
                    </p>
                  </div>
                )}

                <button
                  onClick={handleClose}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <PackageOpen className="w-5 h-5" />
                  CLAIM REWARD
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
