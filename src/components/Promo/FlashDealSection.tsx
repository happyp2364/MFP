import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Clock, Package, TrendingUp, ArrowRight, Star } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { FlashDeal } from '../../types';
import { useNavigate } from 'react-router-dom';

export const FlashDealRenderer: React.FC<{ location: FlashDeal['displayLocations'][0], productId?: string, className?: string }> = ({ location, productId, className = '' }) => {
  const { flashDeals, products, flashDealConfig, recordEngagementMetric } = useStore();
  const [timers, setTimers] = useState<Record<string, string>>({});
  
  if (!flashDealConfig?.masterEnabled) return null;

  const activeDeals = flashDeals.filter(d => {
    const now = new Date();
    const start = new Date(d.startDate);
    const end = new Date(d.endDate);
    if (d.status === 'disabled' || d.status === 'paused') return false;
    let isActive = d.status === 'active';
    if (d.autoStart && d.status === 'scheduled' && start <= now) isActive = true;
    const isTimeValid = start <= now && end > now;
    if (!isActive || !isTimeValid) return false;
    if (!d.displayLocations?.includes(location)) return false;
    if (productId && d.targetIds && d.targetIds.length > 0 && !d.targetIds.includes(productId)) return false;
    return true;
  });

  const activeDealsRef = React.useRef(activeDeals);
  React.useEffect(() => { activeDealsRef.current = activeDeals; }, [activeDeals]);

  useEffect(() => {
    const updateTimers = () => {
      const now = new Date().getTime();
      const newTimers: Record<string, string> = {};
      activeDealsRef.current.forEach(deal => {
        const diff = new Date(deal.endDate).getTime() - now;
        if (diff <= 0) {
          newTimers[deal.id] = 'EXPIRED';
        } else {
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          
          const parts = [];
          if (deal.countdownFormat?.days && d > 0) parts.push(`${d}d`);
          if (deal.countdownFormat?.hours) parts.push(`${h.toString().padStart(2, '0')}h`);
          if (deal.countdownFormat?.minutes) parts.push(`${m.toString().padStart(2, '0')}m`);
          if (deal.countdownFormat?.seconds) parts.push(`${s.toString().padStart(2, '0')}s`);
          newTimers[deal.id] = parts.join(' : ');
        }
      });
      setTimers(prev => JSON.stringify(prev) === JSON.stringify(newTimers) ? prev : newTimers);
    };
    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  if (activeDeals.length === 0) return null;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {activeDeals.map(deal => {
        if (timers[deal.id] === 'EXPIRED' && deal.hideAfterExpiry) return null;
        
        let scarcityContent = null;
        if (deal.lowStockMessageEnabled) {
          let minStock = 999;
          (deal.targetIds || []).forEach(pid => {
            const p = products.find(prod => prod.id === pid);
            if (p) {
              const totalStock = p.sizeStocks ? p.sizeStocks.reduce((sum, s) => sum + s.stockQuantity, 0) : (p.inStock ? 10 : 0);
              if (totalStock > 0 && totalStock < minStock) minStock = totalStock;
            }
          });
          
          if (minStock <= deal.lowStockThreshold) {
            let msg = deal.scarcityMessageTemplate || 'Only {count} Left';
            if (msg === 'custom') msg = deal.lowStockCustomMessage || '';
            msg = msg.replace('{count}', minStock.toString());
            
            const style = deal.scarcityStyling || { textColor: '#FFFFFF', bgColor: '#DC2626', animation: 'pulse' };
            scarcityContent = (
              <div 
                style={{ backgroundColor: style.bgColor, color: style.textColor }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm inline-block ${
                  style.animation === 'pulse' ? 'animate-pulse' : 
                  style.animation === 'bounce' ? 'animate-bounce' : ''
                } ${style.animation === 'glow' ? 'shadow-lg shadow-current' : ''}`}
              >
                {msg}
              </div>
            );
          }
        }
        
        const dealStyle = deal.styling || { bgColor: '#FFF7ED', textColor: '#C2410C', borderColor: '#FFEDD5' };
        
        return (
          <div key={deal.id} style={{ backgroundColor: dealStyle.bgColor, color: dealStyle.textColor, borderColor: dealStyle.borderColor }} className="p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4 text-left w-full sm:w-auto">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="font-bold text-sm">{deal.title}</h4>
                <div className="text-xs opacity-90">
                  Save {deal.discountType === 'PERCENTAGE' ? `${deal.discountValue}%` : `₹${deal.discountValue}`}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {scarcityContent}
              
              {deal.showCountdown && (
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2 border border-white/30 shadow-sm shrink-0">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-black text-sm tracking-widest whitespace-nowrap">{timers[deal.id] || ''}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const FlashDealSection: React.FC = () => {
  const { flashDeals, products, recordEngagementMetric, flashDealConfig } = useStore();
  const navigate = useNavigate();

  if (!flashDealConfig?.masterEnabled) return null;

  const activeDeals = flashDeals.filter(d => {
    const now = new Date();
    const start = new Date(d.startDate);
    const end = new Date(d.endDate);
    
    // Admin disabled it explicitly
    if (d.status === 'disabled' || d.status === 'paused') return false;
    
    // If it's active manually
    let isActive = d.status === 'active';
    
    // Auto-start logic
    if (d.autoStart && d.status === 'scheduled' && start <= now) {
      isActive = true;
    }
    
    // Time constraint logic
    const isTimeValid = start <= now && end > now;
    
    return isActive && isTimeValid && d.displayLocations?.includes('homepage');
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
  const productId = deal.targetIds?.[0] || '';
  const product = products.find(p => p.id === productId);
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  const dealRef = React.useRef(deal);
  React.useEffect(() => { dealRef.current = deal; }, [deal]);

  useEffect(() => {
    const updateTimer = () => {
      const currentDeal = dealRef.current;
      const now = new Date().getTime();
      const end = new Date(currentDeal.endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft(prev => prev === 'EXPIRED' ? prev : 'EXPIRED');
        setIsExpired(prev => prev === true ? prev : true);
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      const parts = [];
      if (currentDeal.countdownFormat?.days && d > 0) parts.push(`${d}d`);
      if (currentDeal.countdownFormat?.hours) parts.push(`${h.toString().padStart(2, '0')}h`);
      if (currentDeal.countdownFormat?.minutes) parts.push(`${m.toString().padStart(2, '0')}m`);
      if (currentDeal.countdownFormat?.seconds) parts.push(`${s.toString().padStart(2, '0')}s`);
      
      const newTime = parts.join(' : ');
      setTimeLeft(prev => prev === newTime ? prev : newTime);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!product || (isExpired && deal.hideAfterExpiry)) return null;

  // Compute scarcity text and styling
  let totalStock = product.sizeStocks ? product.sizeStocks.reduce((sum, s) => sum + s.stockQuantity, 0) : 0;
  if (!product.sizeStocks || product.sizeStocks.length === 0) {
    totalStock = product.inStock ? 10 : 0; // fallback if no specific sizes
  }
  
  const showScarcity = deal.lowStockMessageEnabled && (product.isLimitedStock || (totalStock > 0 && totalStock <= deal.lowStockThreshold));
  
  let scarcityMessage = deal.scarcityMessageTemplate || 'Only {count} Left';
  if (scarcityMessage === 'custom') scarcityMessage = deal.lowStockCustomMessage || '';
  scarcityMessage = scarcityMessage.replace('{count}', totalStock.toString());
  
  const scarcityStyle = deal.scarcityStyling || { textColor: '#FFFFFF', bgColor: '#DC2626', animation: 'pulse' };

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
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
            {deal.discountType === 'PERCENTAGE' ? `-${deal.discountValue}% OFF` : `₹${deal.discountValue} OFF`}
          </div>
          {showScarcity && (
            <div 
              style={{ backgroundColor: scarcityStyle.bgColor, color: scarcityStyle.textColor }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl ${
                scarcityStyle.animation === 'pulse' ? 'animate-pulse' : 
                scarcityStyle.animation === 'bounce' ? 'animate-bounce' : ''
              } ${scarcityStyle.animation === 'glow' ? 'shadow-lg shadow-current' : ''}`}
            >
              {scarcityMessage}
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
              ₹{deal.discountType === 'PERCENTAGE' ? Math.round(product.price * (1 - deal.discountValue / 100)) : product.price - deal.discountValue}
            </div>
          </div>
          
          <button
            onClick={() => {
              recordEngagementMetric('flashDealClicks');
              window.location.href = `/product/${product.slug}`;
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
