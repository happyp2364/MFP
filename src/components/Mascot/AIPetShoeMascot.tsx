import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, X, Minimize2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface Point {
  x: number;
  y: number;
}

export const AIPetShoeMascot: React.FC = () => {
  const { petShoeConfig } = useStore();

  const [position, setPosition] = useState<Point>({ x: 100, y: 100 });
  const [tiltDeg, setTiltDeg] = useState(0);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [animationState, setAnimationState] = useState<'hover' | 'bounce' | 'spin' | 'shine'>('hover');
  const [isMobile, setIsMobile] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [userManuallyMinimized, setUserManuallyMinimized] = useState(false);

  const requestRef = useRef<number | null>(null);
  const posRef = useRef<Point>({ x: 100, y: 100 });
  const targetRef = useRef<Point>({ x: 100, y: 100 });
  const isMovingRef = useRef<boolean>(false);

  const baseSize = petShoeConfig?.sizePx || 130;
  const renderSize = isMobile ? baseSize * 0.75 : baseSize;
  const margin = 20;

  // Calculate safe bounded coordinates
  const clampPosition = useCallback((pt: Point): Point => {
    if (typeof window === 'undefined') return pt;
    const w = window.innerWidth;
    const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const h = Math.min(window.innerHeight, viewportHeight);
    const halfSize = renderSize / 2;

    const minX = margin + halfSize;
    const maxX = w - margin - halfSize;
    const minY = margin + halfSize + 50;
    const maxY = h - margin - halfSize;

    return {
      x: Math.max(minX, Math.min(maxX, pt.x)),
      y: Math.max(minY, Math.min(maxY, pt.y)),
    };
  }, [renderSize]);

  // Set initial starting position based on config
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const startingPos = petShoeConfig?.startingPosition || 'bottom-right';

    let initialX = w - 120;
    let initialY = h - 140;

    if (startingPos === 'bottom-left') {
      initialX = 120;
      initialY = h - 140;
    } else if (startingPos === 'top-right') {
      initialX = w - 120;
      initialY = 140;
    } else if (startingPos === 'top-left') {
      initialX = 120;
      initialY = 140;
    } else if (startingPos === 'center') {
      initialX = w / 2;
      initialY = h / 2;
    }

    const bounded = clampPosition({ x: initialX, y: initialY });
    posRef.current = bounded;
    targetRef.current = bounded;
    setPosition(bounded);
    setIsMobile(window.innerWidth < 640);
  }, [petShoeConfig?.startingPosition, clampPosition]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      const bounded = clampPosition(targetRef.current);
      targetRef.current = bounded;
      posRef.current = bounded;
      setPosition(bounded);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition]);

  // Click / Tap listener for move-to target
  useEffect(() => {
    if (!petShoeConfig?.enabled || petShoeConfig?.clickToMove === false) return;

    const handleScreenClick = (e: MouseEvent | TouchEvent) => {
      const targetEl = e.target as HTMLElement;

      // Do not move if clicking interactive UI elements, modals, or mascot itself
      if (
        targetEl.closest('button') ||
        targetEl.closest('input') ||
        targetEl.closest('select') ||
        targetEl.closest('textarea') ||
        targetEl.closest('a') ||
        targetEl.closest('.ai-pet-shoe-mascot') ||
        targetEl.closest('#admin-modal') ||
        targetEl.closest('.modal') ||
        targetEl.closest('[role="dialog"]')
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
        const newTarget = clampPosition({ x: clientX, y: clientY });
        targetRef.current = newTarget;
        isMovingRef.current = true;
      }
    };

    window.addEventListener('pointerdown', handleScreenClick, { passive: true });
    return () => window.removeEventListener('pointerdown', handleScreenClick);
  }, [petShoeConfig?.enabled, petShoeConfig?.clickToMove, clampPosition]);

  // Animation Loop (requestAnimationFrame)
  useEffect(() => {
    if (!petShoeConfig?.enabled) return;

    // Speed configuration
    const speedSetting = petShoeConfig?.speed || 'normal';
    const lerpSpeed = speedSetting === 'slow' ? 0.05 : speedSetting === 'fast' ? 0.2 : 0.1;

    const animate = () => {
      if (isMovingRef.current) {
        const dx = targetRef.current.x - posRef.current.x;
        const dy = targetRef.current.y - posRef.current.y;

        posRef.current.x += dx * lerpSpeed;
        posRef.current.y += dy * lerpSpeed;

        const currentTilt = Math.max(-18, Math.min(18, dx * 0.25));
        setTiltDeg(currentTilt);
        setPosition({ x: posRef.current.x, y: posRef.current.y });

        // Stop animation when close enough to target
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
          posRef.current = { ...targetRef.current };
          setPosition({ ...targetRef.current });
          setTiltDeg(0);
          isMovingRef.current = false;
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [petShoeConfig?.enabled, petShoeConfig?.speed]);

  // Mascot Click Handler
  const handlePetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (petShoeConfig?.enableClickInteraction === false) return;

    const actions: ('bounce' | 'spin' | 'shine')[] = ['bounce', 'spin', 'shine'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    setAnimationState(randomAction);

    setTimeout(() => {
      setAnimationState('hover');
    }, 1200);

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

  const wingColor = petShoeConfig?.wingColor || '#F59E0B';
  const glowColor = petShoeConfig?.glowColor || '#F59E0B';

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

  // Render Minimized Circular Floating Assistant Button
  if (isMinimized) {
    return (
      <div
        className="fixed z-40 pointer-events-none ai-pet-shoe-mascot transition-all duration-300 select-none"
        style={{
          left: 0,
          top: 0,
          transform: `translate3d(${position.x - 24}px, ${position.y - 24}px, 0)`,
          opacity: petShoeConfig?.opacity ?? 0.95,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(false);
            setUserManuallyMinimized(false);
          }}
          className="pointer-events-auto relative w-12 h-12 rounded-full bg-neutral-900 border border-amber-500/50 shadow-2xl flex items-center justify-center group hover:scale-110 active:scale-95 transition-all duration-300"
          type="button"
          title="Expand AI Pet Assistant 👟✨"
        >
          <div
            className="absolute inset-0 rounded-full blur-md opacity-70 animate-pulse pointer-events-none"
            style={{ backgroundColor: glowColor }}
          />
          <img
            src={shoeImgUrl}
            alt="AI Pet Assistant"
            className="w-7 h-7 object-contain relative z-10 filter drop-shadow-md"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -top-1 -right-1 p-0.5 bg-amber-500 rounded-full text-white shadow-xs">
            <Sparkles className="w-2.5 h-2.5" />
          </div>
        </button>
      </div>
    );
  }

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
        className="absolute left-1/2 -bottom-6 -translate-x-1/2 rounded-full blur-md transition-all duration-300 pointer-events-none"
        style={{
          width: `${renderSize * 0.7}px`,
          height: '14px',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          transform: `scale(${1 - Math.abs(tiltDeg) * 0.01})`,
        }}
      />

      {/* Minimize Quick Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMinimized(true);
          setUserManuallyMinimized(true);
        }}
        className="absolute -top-2 -right-2 z-20 pointer-events-auto p-1 bg-neutral-900/80 hover:bg-neutral-800 text-amber-400 border border-amber-500/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
        type="button"
        title="Minimize AI Pet"
      >
        <Minimize2 className="w-3 h-3" />
      </button>

      {/* Speech Bubble Above Mascot */}
      {speechBubble && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 pointer-events-auto animate-in zoom-in-90 slide-in-from-bottom-2 duration-300">
          <div className="relative bg-neutral-900/90 text-white border border-amber-500/40 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold max-w-xs text-center flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
            <span className="leading-tight">{speechBubble}</span>
            <button
              onClick={() => setSpeechBubble(null)}
              className="ml-1 p-0.5 hover:bg-white/20 rounded-full transition-colors"
              type="button"
            >
              <X className="w-3 h-3 text-neutral-400" />
            </button>
          </div>
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
        {petShoeConfig?.glowEnabled !== false && (
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-60 animate-pulse pointer-events-none"
            style={{ backgroundColor: glowColor }}
          />
        )}

        {petShoeConfig?.wingsEnabled !== false && (
          <>
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
                <defs>
                  <linearGradient id="wingGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="60%" stopColor={wingColor} />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

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

        <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
          <img
            src={shoeImgUrl}
            alt="Marudhar Fashion Point Mascot Shoe"
            className="w-full h-full object-contain filter drop-shadow-[0_18px_28px_rgba(0,0,0,0.5)] transition-all duration-300"
            referrerPolicy="no-referrer"
            loading="lazy"
          />

          <div className="absolute top-0 right-0 p-1 bg-amber-500 rounded-full text-white shadow-md animate-bounce">
            <Sparkles className="w-3 h-3" />
          </div>
        </div>
      </div>

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
