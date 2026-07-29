import React, { useEffect, useRef, useState } from 'react';
import { X, Gift, AlertCircle, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ScratchReward } from '../../types';

export const ScratchCardPopup: React.FC<{ currentPath: string; cartSubtotal: number }> = ({
  currentPath,
  cartSubtotal,
}) => {
  const { scratchWinConfig, coupons, orders, customerUser, triggerGlobalCelebration } = useStore();

  const [isVisible, setIsVisible] = useState(false);
  const [hasScratched, setHasScratched] = useState(false);
  const [selectedReward, setSelectedReward] = useState<ScratchReward | null>(null);
  const [scratchProgress, setScratchProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const pointsScratchedRef = useRef<Set<string>>(new Set());

  // 1. Core Rule & Eligibility Checker Pipeline
  useEffect(() => {
    if (!scratchWinConfig || !scratchWinConfig.enabled) return;

    // Permanently Disabled Check
    if (localStorage.getItem('mfp_scratch_permanently_disabled') === 'true') return;

    // Daily Hour Check (Daily Active Hours)
    if (scratchWinConfig.dailyActiveHoursStart && scratchWinConfig.dailyActiveHoursEnd) {
      const now = new Date();
      const currentHourStr = now.toTimeString().slice(0, 5); // "HH:MM"
      const start = scratchWinConfig.dailyActiveHoursStart;
      const end = scratchWinConfig.dailyActiveHoursEnd;
      if (start && end) {
        if (currentHourStr < start || currentHourStr > end) return;
      }
    }

    // Schedule Start & End Date Check
    const nowTime = new Date().getTime();
    if (scratchWinConfig.startDate) {
      if (nowTime < new Date(scratchWinConfig.startDate).getTime()) return;
    }
    if (scratchWinConfig.endDate) {
      if (nowTime > new Date(scratchWinConfig.endDate).getTime()) return;
    }

    // Target Page Constraints Check
    let routeMatch = false;
    if (scratchWinConfig.showOnHomepage && (currentPath === '/' || currentPath === '')) {
      routeMatch = true;
    }
    if (scratchWinConfig.showOnProductPage && currentPath.includes('/product/')) {
      routeMatch = true;
    }
    if (scratchWinConfig.showOnCheckout && currentPath.includes('/checkout')) {
      routeMatch = true;
    }

    // Default to false if specific routes are enabled but current doesn't match
    if (
      (scratchWinConfig.showOnHomepage || scratchWinConfig.showOnProductPage || scratchWinConfig.showOnCheckout) &&
      !routeMatch
    ) {
      return;
    }

    // Minimum Cart Value Check
    if (scratchWinConfig.minCartValue && cartSubtotal < scratchWinConfig.minCartValue) {
      return;
    }

    // Customer segments checking
    const userOrdersCount = orders ? orders.length : 0;

    if (scratchWinConfig.newCustomerOnly && userOrdersCount > 0) return;
    if (scratchWinConfig.returningCustomerOnly && userOrdersCount === 0) return;

    if (scratchWinConfig.firstVisitOnly) {
      const visitFlag = localStorage.getItem('mfp_scratch_visited');
      if (visitFlag) return;
    }

    if (scratchWinConfig.firstOrderOnly && userOrdersCount > 0) return;

    // Track page views counter
    let pageViews = parseInt(sessionStorage.getItem('mfp_scratch_pageviews') || '0', 10);
    pageViews += 1;
    sessionStorage.setItem('mfp_scratch_pageviews', pageViews.toString());

    if (scratchWinConfig.showAfterPageViews && pageViews < scratchWinConfig.showAfterPageViews) {
      return;
    }

    // Select reward tier in advance (so it's painted behind canvas)
    const selectReward = () => {
      const activeRewards = scratchWinConfig.rewards || [];
      if (activeRewards.length === 0) return null;

      // Weighted random selection
      const totalProb = activeRewards.reduce((sum, r) => sum + r.probability, 0);
      let rand = Math.random() * totalProb;

      for (const r of activeRewards) {
        if (rand < r.probability) {
          return r;
        }
        rand -= r.probability;
      }
      return activeRewards[0];
    };

    const picked = selectReward();
    setSelectedReward(picked);

    // Setup presentation timer triggers
    let timerId: NodeJS.Timeout | null = null;
    const showPopup = () => {
      // Avoid duplicate triggers in same session
      const alreadyShownThisSession = sessionStorage.getItem('mfp_scratch_shown_session') === 'true';
      if (!alreadyShownThisSession) {
        setIsVisible(true);
        sessionStorage.setItem('mfp_scratch_shown_session', 'true');
        if (scratchWinConfig.firstVisitOnly) {
          localStorage.setItem('mfp_scratch_visited', 'true');
        }
      }
    };

    // Exit Intent Trigger
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 50) {
        showPopup();
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    if (scratchWinConfig.showExitIntent) {
      document.addEventListener('mouseleave', handleMouseLeave);
    } else {
      const delaySeconds = scratchWinConfig.showAfterSeconds || 3;
      timerId = setTimeout(showPopup, delaySeconds * 1000);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [scratchWinConfig, currentPath, cartSubtotal, orders]);

  // 2. Initialize Canvas Painting (Silver Scratch Layer)
  useEffect(() => {
    if (!isVisible || !canvasRef.current || hasScratched) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution for canvas drawing
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Paint metallic silver gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#C0C0C0');
    grad.addColorStop(0.3, '#E0E0E0');
    grad.addColorStop(0.5, '#F5F5F5');
    grad.addColorStop(0.7, '#D3D3D3');
    grad.addColorStop(1, '#A9A9A9');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dynamic decorative elements
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.width; i += 12) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 40, canvas.height);
      ctx.stroke();
    }

    // Paint instruction banner text
    ctx.fillStyle = '#4B5563';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎰 SCRATCH HERE TO WIN 🎰', canvas.width / 2, canvas.height / 2);

    ctx.fillStyle = '#6B7280';
    ctx.font = 'medium 10px system-ui, -apple-system, sans-serif';
    ctx.fillText('Hold & Scratch Card Surface', canvas.width / 2, canvas.height / 2 + 25);
  }, [isVisible, hasScratched]);

  // 3. Drawing Coordinate Scratch Trackers
  const scratchCircle = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Increment lightweight scratch counts based on unique grid coordinates
    const gridX = Math.floor(x / 15);
    const gridY = Math.floor(y / 15);
    const coordinateKey = `${gridX},${gridY}`;

    if (!pointsScratchedRef.current.has(coordinateKey)) {
      pointsScratchedRef.current.add(coordinateKey);
      const uniquePointsCount = pointsScratchedRef.current.size;

      // Threshold: 30 unique cells scratched triggers full reveal
      if (uniquePointsCount >= 30 && !hasScratched) {
        setHasScratched(true);
        triggerSuccessReveal();
      }
    }
  };

  const triggerSuccessReveal = () => {
    if (selectedReward && selectedReward.couponCode) {
      localStorage.setItem('mfp_scratched_coupon', selectedReward.couponCode.toUpperCase());
    }
    triggerGlobalCelebration();
  };

  // 4. Mouse / Touch Event Listeners
  const getEventCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (hasScratched) return;
    isDrawingRef.current = true;
    const coords = getEventCoordinates(e);
    if (coords) {
      lastPosRef.current = coords;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) scratchCircle(ctx, coords.x, coords.y);
    }
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || hasScratched || !canvasRef.current) return;
    e.preventDefault();

    const coords = getEventCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (coords && ctx && lastPosRef.current) {
      const from = lastPosRef.current;
      const to = coords;

      // Draw thick linear scratches between movements to bypass touch interval limits
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.lineWidth = 44;
      ctx.lineCap = 'round';
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      scratchCircle(ctx, to.x, to.y);
      lastPosRef.current = to;
    }
  };

  const handleEnd = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  // Close & permanent options
  const handleClose = () => {
    setIsVisible(false);
  };

  const handlePermanentlyDisable = () => {
    localStorage.setItem('mfp_scratch_permanently_disabled', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/80 backdrop-blur-md animate-fade-in"
      id="scratch-popup-backdrop"
    >
      <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-100 p-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
        
        {/* Header Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 transition-colors"
          id="scratch-close-btn"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Dynamic Header */}
        <div className="space-y-1 mt-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mx-auto">
            <Gift className="w-6 h-6 animate-bounce" />
          </div>
          <h3 className="font-serif-heading font-extrabold text-xl text-neutral-800">
            {scratchWinConfig?.festivalOnly ? '🎉 Special Festival Reward!' : '🎁 Exclusive Reward Unlock!'}
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed px-4">
            You qualify for an exclusive reward. Scratch the silver card surface below to claim your mystery prize!
          </p>
        </div>

        {/* Canvas / Reward Scratch Card */}
        <div className="relative w-64 h-36 bg-[#F8FAFC] border-2 border-dashed border-neutral-300 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center select-none">
          
          {/* Winner details behind the canvas */}
          {selectedReward && (
            <div className="p-4 flex flex-col items-center text-center space-y-1.5 animate-fade-in">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-600">
                Congratulations! You Won
              </div>
              <div className="font-extrabold text-[#0B8F63] text-sm leading-tight">
                {selectedReward.name}
              </div>
              {selectedReward.couponCode ? (
                <div className="mt-2 inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold text-xs px-2.5 py-1 rounded">
                  {selectedReward.couponCode.toUpperCase()}
                </div>
              ) : (
                <div className="text-xs text-neutral-500">Free promo gift item</div>
              )}
            </div>
          )}

          {/* Interactive scratch surface */}
          {!hasScratched && (
            <canvas
              ref={canvasRef}
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
              className="absolute inset-0 w-full h-full cursor-crosshair z-10 touch-none"
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="w-full pt-1 space-y-2">
          {hasScratched ? (
            <div className="space-y-2.5">
              <div className="text-xs text-[#0B8F63] font-bold flex items-center justify-center gap-1">
                <Check className="w-4 h-4" />
                <span>Coupon auto-applied to your checkout session!</span>
              </div>
              <button
                onClick={handleClose}
                className="w-full bg-[#121816] hover:bg-[#0B8F63] text-white font-extrabold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shadow-md"
              >
                <span>Awesome, Claim Reward</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-[10px] text-neutral-400">
              Your mystery reward will be revealed instantly upon scratching.
            </p>
          )}

          <button
            onClick={handlePermanentlyDisable}
            className="text-[10px] font-bold text-neutral-400 hover:text-rose-600 hover:underline pt-2 block mx-auto"
          >
            Don't show this promotion again
          </button>
        </div>
      </div>
    </div>
  );
};
