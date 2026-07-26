import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, MessageCircle, Heart, X, Volume2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AIPetShoeMascot: React.FC = () => {
  const { petShoeConfig } = useStore();

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [tiltDeg, setTiltDeg] = useState(0);
  const [isIdle, setIsIdle] = useState(true);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [animationState, setAnimationState] = useState<'hover' | 'bounce' | 'spin' | 'shine'>('hover');
  const [isMobile, setIsMobile] = useState(false);

  const requestRef = useRef<number | null>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const lastInteractionTimeRef = useRef<number>(Date.now());
  const sineTimeRef = useRef<number>(0);

  // Default Position anchor calculations
  const getAnchorPos = () => {
    if (typeof window === 'undefined') return { x: 300, y: 500 };
    const w = window.innerWidth;
    const h = window.innerHeight;
    const margin = isMobile ? 20 : 60;
    const size = (petShoeConfig?.sizePx || 130) * (isMobile ? 0.75 : 1);

    switch (petShoeConfig?.defaultPosition) {
      case 'bottom-left':
        return { x: margin + size / 2, y: h - margin - size / 2 - 80 };
      case 'top-right':
        return { x: w - margin - size / 2, y: margin + size / 2 + 100 };
      case 'top-left':
        return { x: margin + size / 2, y: margin + size / 2 + 100 };
      case 'center-right':
        return { x: w - margin - size / 2, y: h / 2 };
      case 'bottom-right':
      default:
        return { x: w - margin - size / 2 - 10, y: h - margin - size / 2 - 90 };
    }
  };

  // Resize Listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      const anchor = getAnchorPos();
      targetRef.current = anchor;
      setTargetPos(anchor);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [petShoeConfig?.defaultPosition, petShoeConfig?.sizePx]);

  // Initial position mount
  useEffect(() => {
    const anchor = getAnchorPos();
    posRef.current = anchor;
    targetRef.current = anchor;
    setPosition(anchor);
    setTargetPos(anchor);
  }, []);

  // Screen Click/Tap Listener for Smart Movement
  useEffect(() => {
    if (!petShoeConfig?.enabled || !petShoeConfig?.enableScrollFollowing) return;

    const handleScreenTap = (e: MouseEvent | TouchEvent) => {
      // Don't trigger if user is clicking admin modal or form controls or pet itself
      const targetEl = e.target as HTMLElement;
      if (
        targetEl.closest('button') ||
        targetEl.closest('input') ||
        targetEl.closest('select') ||
        targetEl.closest('textarea') ||
        targetEl.closest('.ai-pet-shoe-mascot') ||
        targetEl.closest('#admin-modal')
      ) {
        return;
      }

      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      if (clientX > 0 && clientY > 0) {
        // Keep inside screen bounds with padding
        const size = (petShoeConfig?.sizePx || 130) * (isMobile ? 0.75 : 1);
        const padding = size / 2 + 20;
        const boundedX = Math.max(padding, Math.min(window.innerWidth - padding, clientX));
        const boundedY = Math.max(padding, Math.min(window.innerHeight - padding, clientY));

        targetRef.current = { x: boundedX, y: boundedY };
        setTargetPos({ x: boundedX, y: boundedY });
        lastInteractionTimeRef.current = Date.now();
        setIsIdle(false);
      }
    };

    window.addEventListener('click', handleScreenTap, { passive: true });
    return () => window.removeEventListener('click', handleScreenTap);
  }, [petShoeConfig?.enabled, petShoeConfig?.enableScrollFollowing, isMobile]);

  // Scroll Listener
  useEffect(() => {
    if (!petShoeConfig?.enabled || !petShoeConfig?.enableScrollFollowing) return;

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      lastInteractionTimeRef.current = Date.now();
      setIsIdle(false);

      // Slightly shift vertical target during scroll
      const anchor = getAnchorPos();
      const scrollFactor = Math.sin(window.scrollY * 0.005) * 40;
      targetRef.current = { x: anchor.x, y: anchor.y + scrollFactor };

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsIdle(true);
      }, 1500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [petShoeConfig?.enabled, petShoeConfig?.enableScrollFollowing, isMobile]);

  // Physics & Animation Loop (requestAnimationFrame for 60FPS Lerp Movement)
  useEffect(() => {
    if (!petShoeConfig?.enabled) return;

    const lerpSpeed =
      petShoeConfig?.movementSpeed === 'fast'
        ? 0.12
        : petShoeConfig?.movementSpeed === 'slow'
        ? 0.04
        : 0.07;

    const hoverAmp =
      petShoeConfig?.hoverAmplitude === 'dynamic'
        ? 14
        : petShoeConfig?.hoverAmplitude === 'gentle'
        ? 6
        : 10;

    const animate = () => {
      sineTimeRef.current += 0.04;

      // Check if user has been idle for 2 seconds -> drift back to anchor
      if (Date.now() - lastInteractionTimeRef.current > 2200) {
        if (!isIdle) setIsIdle(true);
        const anchor = getAnchorPos();
        // Add smooth floating idle orbit
        if (petShoeConfig?.enableIdleMovement !== false) {
          const orbitX = Math.sin(sineTimeRef.current * 0.7) * (isMobile ? 15 : 35);
          const orbitY = Math.cos(sineTimeRef.current * 0.9) * hoverAmp;
          targetRef.current = { x: anchor.x + orbitX, y: anchor.y + orbitY };
        } else {
          targetRef.current = anchor;
        }
      } else {
        // Add gentle hover sine while following target
        targetRef.current.y += Math.sin(sineTimeRef.current * 1.5) * 0.5;
      }

      // Physics Interpolation (Lerp)
      const dx = targetRef.current.x - posRef.current.x;
      const dy = targetRef.current.y - posRef.current.y;

      posRef.current.x += dx * lerpSpeed;
      posRef.current.y += dy * lerpSpeed;

      // Bank/Tilt in movement direction
      const currentTilt = Math.max(-18, Math.min(18, dx * 0.3));

      setPosition({ x: posRef.current.x, y: posRef.current.y });
      setTiltDeg(currentTilt);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [
    petShoeConfig?.enabled,
    petShoeConfig?.movementSpeed,
    petShoeConfig?.hoverAmplitude,
    petShoeConfig?.enableIdleMovement,
    petShoeConfig?.defaultPosition,
    isMobile,
  ]);

  // Click on Pet Shoe Mascot Directly
  const handlePetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (petShoeConfig?.enableClickInteraction === false) return;

    lastInteractionTimeRef.current = Date.now();

    // Random action
    const actions: ('bounce' | 'spin' | 'shine')[] = ['bounce', 'spin', 'shine'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    setAnimationState(randomAction);

    setTimeout(() => {
      setAnimationState('hover');
    }, 1200);

    // Speech bubble
    if (petShoeConfig?.enableSpeechBubbles !== false) {
      const msgs = petShoeConfig?.speechMessages || [
        'Welcome to Marudhar Fashion Point! 👟✨',
        'Step into pure luxury & comfort! 👞',
        'Handcrafted Leather & Sports Drops! 🔥',
        'Need help? Tap to explore our top picks! 😊',
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setSpeechBubble(randomMsg);

      setTimeout(() => {
        setSpeechBubble(null);
      }, 4200);
    }
  };

  if (!petShoeConfig?.enabled) return null;

  // Render sizing
  const baseSize = petShoeConfig?.sizePx || 130;
  const renderSize = isMobile ? baseSize * 0.75 : baseSize;
  const wingColor = petShoeConfig?.wingColor || '#F59E0B';
  const glowColor = petShoeConfig?.glowColor || '#F59E0B';

  // Default Sneaker Image: High-Resolution Transparent Luxury Burgundy ONE8 Sneaker
  const shoeImgUrl =
    petShoeConfig?.imageUri && petShoeConfig.imageUri.trim() !== ''
      ? petShoeConfig.imageUri
      : 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80';

  const wingFlapDuration =
    petShoeConfig?.wingFlapSpeed === 'fast'
      ? '0.6s'
      : petShoeConfig?.wingFlapSpeed === 'slow'
      ? '1.8s'
      : '1.1s';

  return (
    <div
      className="fixed z-40 pointer-events-none ai-pet-shoe-mascot transition-opacity duration-300 select-none"
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${position.x - renderSize / 2}px, ${position.y - renderSize / 2}px, 0)`,
        opacity: petShoeConfig?.opacity ?? 0.95,
      }}
    >
      {/* Floating Shadow Below Mascot */}
      <div
        className="absolute left-1/2 -bottom-6 -translate-x-1/2 rounded-full blur-md transition-all duration-300"
        style={{
          width: `${renderSize * 0.7}px`,
          height: '14px',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          transform: `scale(${1 - Math.abs(tiltDeg) * 0.01})`,
        }}
      />

      {/* Speech Bubble Above Mascot */}
      {speechBubble && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 pointer-events-auto animate-in zoom-in-90 slide-in-from-bottom-2 duration-300">
          <div className="relative bg-neutral-900/90 text-white border border-amber-500/40 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold max-w-xs text-center flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
            <span className="leading-tight">{speechBubble}</span>
            <button
              onClick={() => setSpeechBubble(null)}
              className="ml-1 p-0.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-neutral-400" />
            </button>
          </div>
          {/* Arrow */}
          <div className="w-3 h-3 bg-neutral-900/90 border-r border-b border-amber-500/40 rotate-45 mx-auto -mt-1.5" />
        </div>
      )}

      {/* Main Interactive Mascot Container */}
      <div
        onClick={handlePetClick}
        className={`relative pointer-events-auto cursor-pointer group transition-transform duration-300 ${
          animationState === 'bounce'
            ? 'animate-bounce'
            : animationState === 'spin'
            ? 'rotate-[360deg] transition-transform duration-700'
            : ''
        }`}
        style={{
          width: `${renderSize}px`,
          height: `${renderSize * 0.75}px`,
          transform: `rotate(${tiltDeg}deg)`,
        }}
        title="Tap me! I'm your Marudhar Fashion Point Mascot 👟✨"
      >
        {/* Golden / Custom Aura Glow Effect */}
        {petShoeConfig?.glowEnabled !== false && (
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-60 animate-pulse pointer-events-none"
            style={{
              backgroundColor: glowColor,
            }}
          />
        )}

        {/* ANGEL WINGS - Left & Right Vector Wings with Feather Layers */}
        {petShoeConfig?.wingsEnabled !== false && (
          <>
            {/* Left Wing */}
            <div
              className="absolute top-1/2 -left-8 -translate-y-1/2 origin-right pointer-events-none"
              style={{
                animation: `wingFlapLeft ${wingFlapDuration} ease-in-out infinite alternate`,
              }}
            >
              <svg
                width={renderSize * 0.55}
                height={renderSize * 0.55}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
              >
                <path
                  d="M95 50C70 10 30 15 10 35C2 43 0 55 5 65C12 78 30 75 45 68C60 62 80 58 95 50Z"
                  fill={`url(#wingGradLeft)`}
                />
                <path
                  d="M90 48C70 20 40 25 22 40C12 48 10 58 16 66C25 76 40 70 55 63C70 56 85 52 90 48Z"
                  fill="#FFFFFF"
                  fillOpacity="0.4"
                />
                <defs>
                  <linearGradient id="wingGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="60%" stopColor={wingColor} />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Right Wing */}
            <div
              className="absolute top-1/2 -right-8 -translate-y-1/2 origin-left pointer-events-none"
              style={{
                animation: `wingFlapRight ${wingFlapDuration} ease-in-out infinite alternate`,
              }}
            >
              <svg
                width={renderSize * 0.55}
                height={renderSize * 0.55}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
              >
                <path
                  d="M5 50C30 10 70 15 90 35C98 43 100 55 95 65C88 78 70 75 55 68C40 62 20 58 5 50Z"
                  fill={`url(#wingGradRight)`}
                />
                <path
                  d="M10 48C30 20 60 25 78 40C88 48 90 58 84 66C75 76 60 70 45 63C30 56 15 52 10 48Z"
                  fill="#FFFFFF"
                  fillOpacity="0.4"
                />
                <defs>
                  <linearGradient id="wingGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="60%" stopColor={wingColor} />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </>
        )}

        {/* ULTRA REALISTIC TRANSPARENT SHOE OBJECT (NO CARD / NO POSTER FRAME) */}
        <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
          <img
            src={shoeImgUrl}
            alt="Marudhar Fashion Point Mascot Shoe"
            className="w-full h-full object-contain filter drop-shadow-[0_18px_28px_rgba(0,0,0,0.5)] transition-all duration-300"
            referrerPolicy="no-referrer"
            loading="lazy"
          />

          {/* Luxury Glossy Reflection Sweep Effect Masked Strictly to Shoe Body */}
          {petShoeConfig?.shineEnabled !== false && (
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              style={{
                WebkitMaskImage: `url("${shoeImgUrl}")`,
                maskImage: `url("${shoeImgUrl}")`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
              }}
            >
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out mix-blend-overlay" />
            </div>
          )}

          {/* Sparkle Badge */}
          <div className="absolute top-0 right-0 p-1 bg-amber-500 rounded-full text-white shadow-md animate-bounce">
            <Sparkles className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Keyframe Styles for Flapping Wings */}
      <style>{`
        @keyframes wingFlapLeft {
          0% { transform: translateY(-50%) rotate(-15deg) scaleX(1); }
          100% { transform: translateY(-50%) rotate(25deg) scaleX(0.9); }
        }
        @keyframes wingFlapRight {
          0% { transform: translateY(-50%) rotate(15deg) scaleX(1); }
          100% { transform: translateY(-50%) rotate(-25deg) scaleX(0.9); }
        }
      `}</style>
    </div>
  );
};
