import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Clock, Package, TrendingUp, ArrowRight, Star } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { FlashDeal } from '../../types';

export const FlashDealSection: React.FC = () => {
  const { flashDeals, products, recordEngagementMetric } = useStore();

  const activeDeals = flashDeals.filter(d => {
    const now = new Date();
    const isStatusActive = d.status === 'active';
    const isTimeActive = (!d.startDate || new Date(d.startDate) <= now) && (!d.endDate || new Date(d.endDate) > now);
    return isStatusActive && isTimeActive;
  });

  if (activeDeals.length === 0) return null;

  return (
    <section className="py-12 px-4 md:px-8 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-200">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Limited Time Offers
            </div>
            <h2 className="text-4xl md:text-5xl font-serif-heading font-black text-neutral-900 italic tracking-tighter">
              FLASH <span className="text-orange-600">DEALS</span>
            </h2>
          </div>
          <p className="text-sm text-neutral-500 font-medium max-w-md">
            Don't miss out on these exclusive, high-urgency deals. Once the timer hits zero, these prices are gone forever!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeDeals.map((deal) => (
            <FlashDealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FlashDealCard: React.FC<{ deal: FlashDeal }> = ({ deal }) => {
  const { products, recordEngagementMetric } = useStore();
  const product = products.find(p => deal.targetIds?.includes(p.id)) || products[0];
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      if (!deal.endDate) {
        setTimeLeft('LIMITED');
        return;
      }
      const now = new Date().getTime();
      const end = new Date(deal.endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deal.endDate]);

  if (!product) return null;

  const discountPrice = deal.discountType === 'PERCENTAGE' 
    ? Math.round(product.price * (1 - deal.discountValue / 100))
    : Math.max(0, product.price - deal.discountValue);

  const discountPercent = Math.round(((product.price - discountPrice) / product.price) * 100);
  const productImage = product.images?.[0] || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-xl shadow-neutral-200/40 hover:shadow-2xl hover:shadow-orange-200/20 transition-all"
    >
      {/* Product Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {discountPercent > 0 && (
            <div className="px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
              -{discountPercent}% OFF
            </div>
          )}
          {deal.lowStockMessageEnabled && (
            <div className="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl animate-pulse">
              Only {deal.lowStockThreshold || 5} Left!
            </div>
          )}
        </div>

        {/* Countdown Timer Overlay */}
        {deal.showCountdown && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-white shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Ending In</span>
            </div>
            <span className="text-sm font-mono font-black text-neutral-900 tracking-tighter">
              {timeLeft}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{product.brand}</span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[10px] font-black text-neutral-900">{product.rating}</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="flex items-end justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-neutral-400 line-through">₹{product.price}</span>
            <div className="text-2xl font-black text-neutral-900 tracking-tighter italic">
              ₹{discountPrice}
            </div>
          </div>
          
          <button
            onClick={() => {
              recordEngagementMetric('flashDealClicks');
              if (product.slug) {
                window.history.pushState({}, '', `/product/${product.slug}`);
                window.dispatchEvent(new Event('popstate'));
              }
            }}
            className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center hover:bg-orange-600 transition-colors group-hover:scale-105 active:scale-95"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
