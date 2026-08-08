import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Dices, Sparkles, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { WheelSection } from '../../types';

interface SpinWheelPopupProps {
  currentPath: string;
}

export const SpinWheelPopup: React.FC<SpinWheelPopupProps> = ({ currentPath }) => {
  const { spinWheelConfig, triggerGlobalCelebration, recordEngagementMetric } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelSection | null>(null);
  const [hasSpun, setHasSpun] = useState(false);

  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!spinWheelConfig?.enabled) return;

    const lastSpun = localStorage.getItem('nwd_wheel_last_spun');
    if (lastSpun) {
      const daysSince = (Date.now() - parseInt(lastSpun)) / (1000 * 60 * 60 * 24);
      if (daysSince < (spinWheelConfig.canSpinAgainDays || 7)) return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 15000); // Show after 15s on site

    return () => clearTimeout(timer);
  }, [spinWheelConfig]);

  const handleSpin = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    recordEngagementMetric('wheelSpins');

    // Select winner
    const sections = spinWheelConfig.sections;
    const totalProb = sections.reduce((sum: any, s: any) => sum + s.probability, 0);
    let rand = Math.random() * totalProb;
    
    let winnerIdx = 0;
    for (let i = 0; i < sections.length; i++) {
      if (rand < sections[i].probability) {
        winnerIdx = i;
        break;
      }
      rand -= sections[i].probability;
    }

    const sectionAngle = 360 / sections.length;
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const targetRotation = extraSpins * 360 + (360 - (winnerIdx * sectionAngle));
    
    setRotation(targetRotation);

    setTimeout(() => {
      const winner = sections[winnerIdx];
      setResult(winner);
      setIsSpinning(false);
      setHasSpun(true);
      localStorage.setItem('nwd_wheel_last_spun', Date.now().toString());
      if (winner.couponCode) {
        localStorage.setItem('nwd_active_coupon', winner.couponCode);
        recordEngagementMetric('couponsWon');
      }
      if (spinWheelConfig.celebrationEnabled) {
        triggerGlobalCelebration();
      }
    }, 5000);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg bg-neutral-900 rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Wheel Container */}
          <div className="relative aspect-square max-w-[300px] mx-auto">
            {/* The Wheel */}
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: 5, ease: [0.15, 0, 0.15, 1] }}
              className="w-full h-full rounded-full border-[12px] border-neutral-800 shadow-2xl relative overflow-hidden flex items-center justify-center"
              style={{
                background: `conic-gradient(${spinWheelConfig.sections.map((s: any, i: any) => {
                  const angle = 360 / spinWheelConfig.sections.length;
                  return `${s.color} ${i * angle}deg ${(i + 1) * angle}deg`;
                }).join(', ')})`,
              }}
            >
              {spinWheelConfig.sections.map((s: any, i: any) => {
                const angle = (360 / spinWheelConfig.sections.length);
                const rotation = i * angle;
                return (
                  <div
                    key={s.id}
                    className="absolute inset-0 flex items-start justify-center pt-8"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    <span 
                      className="text-[10px] md:text-[12px] font-black text-white uppercase tracking-tighter"
                      style={{ transform: `rotate(${angle / 2}deg)` }}
                    >
                      {s.title}
                    </span>
                  </div>
                );
              })}
              
              {/* Inner Circle */}
              <div className="absolute inset-0 m-auto w-12 h-12 bg-white rounded-full border-4 border-neutral-800 shadow-lg flex items-center justify-center z-10">
                <div className="w-2 h-2 bg-neutral-800 rounded-full" />
              </div>
            </motion.div>

            {/* Needle */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-8 h-10 z-20">
              <div className="w-full h-full bg-white clip-path-needle shadow-xl" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
            </div>
          </div>

          {/* Text & Action */}
          <div className="text-center md:text-left space-y-6">
            {!hasSpun ? (
              <>
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 text-pink-400 rounded-full border border-pink-500/20 text-[10px] font-black uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    Limited Time Offer
                  </div>
                  <h3 className="text-3xl md:text-4xl font-serif-heading font-black text-white italic leading-tight">
                    SPIN TO <br/> <span className="text-pink-500">WIN BIG!</span>
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    Try your luck on the wheel of fortune. Guaranteed rewards for every single spin!
                  </p>
                </div>

                <button
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="w-full group bg-white hover:bg-pink-500 text-neutral-900 hover:text-white font-black text-sm py-5 rounded-2xl shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL'}
                  {!isSpinning && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Winner!</div>
                  <h3 className="text-4xl font-serif-heading font-black text-white italic">
                    {result?.title}
                  </h3>
                </div>

                {result?.couponCode && (
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase">Your Coupon Code</p>
                    <div className="text-3xl font-mono font-black text-emerald-400">{result.couponCode}</div>
                  </div>
                )}

                <button
                  onClick={handleClose}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm py-5 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all"
                >
                  USE REWARD NOW
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
