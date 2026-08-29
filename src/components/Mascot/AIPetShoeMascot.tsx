import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, X, Minimize2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface Point {
  x: number;
  y: number;
}

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export const AIPetShoeMascot: React.FC = () => {
  const { petShoeConfig } = useStore();

  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [tiltDeg, setTiltDeg] = useState(0);
  const [isIdle, setIsIdle] = useState(true);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [animationState, setAnimationState] = useState<'hover' | 'bounce' | 'spin' | 'shine'>('hover');
  const [isMobile, setIsMobile] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [userManuallyMinimized, setUserManuallyMinimized] = useState(false);

  const requestRef = useRef<number | null>(null);
  const posRef = useRef<Point>({ x: 0, y: 0 });
  const targetRef = useRef<Point>({ x: 0, y: 0 });
  const lastInteractionTimeRef = useRef<number>(Date.now());
  const sineTimeRef = useRef<number>(0);
  const pagePositionsCache = useRef<Record<string, Point>>({});
  const lastPathnameRef = useRef<string>(typeof window !== 'undefined' ? window.location.pathname : '');

  const baseSize = petShoeConfig?.sizePx || 130;
  const renderSize = isMobile ? baseSize * 0.75 : baseSize;
  const margin = 20; // 16-24px required margin from screen edges

  // Gather bounding rects of interactive elements & modals to avoid collision
  const getObstacleRects = useCallback((): { rects: Rect[]; hasModal: boolean } => {
    if (typeof window === 'undefined') return { rects: [], hasModal: false };

    const obstacles: Rect[] = [];
    let hasModal = false;

    // Detect modals / dialogs / drawers / popups
    const modalElements = document.querySelectorAll(
      '[role="dialog"], .modal, .dialog, #admin-modal, .checkout-modal, .cart-drawer, .fixed.inset-0'
    );

    modalElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.offsetParent !== null || window.getComputedStyle(htmlEl).display !== 'none') {
        const rect = htmlEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          // If modal takes up significant screen portion (> 40% viewport)
          if (rect.width * rect.height > (window.innerWidth * window.innerHeight) * 0.4) {
            hasModal = true;
          }
          obstacles.push({
            left: rect.left - margin,
            top: rect.top - margin,
            right: rect.right + margin,
            bottom: rect.bottom + margin,
          });
        }
      }
    });

    // Query interactive UI controls: buttons, inputs, forms, product cards, navs, floating hubs, toasts
    const selector = [
      'button:not(.ai-pet-shoe-mascot *)',
      'input',
      'select',
      'textarea',
      'form',
      'a.btn',
      'a[role="button"]',
      '.product-card',
      'nav',
      'header',
      'footer',
      '#checkout',
      '.floating-action-hub',
      '.toast-container',
      '.bottom-nav',
      '[data-interactive="true"]',
    ].join(', ');

    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      // Skip element inside pet mascot itself
      if (htmlEl.closest('.ai-pet-shoe-mascot')) return;

      if (htmlEl.offsetParent !== null && window.getComputedStyle(htmlEl).visibility !== 'hidden') {
        const rect = htmlEl.getBoundingClientRect();
        // Ignore small/zero rects or non-visible elements
        if (rect.width > 10 && rect.height > 10 && rect.bottom > 0 && rect.top < window.innerHeight) {
          obstacles.push({
            left: rect.left - 12,
            top: rect.top - 12,
            right: rect.right + 12,
            bottom: rect.bottom + 12,
          });
        }
      }
    });

    return { rects: obstacles, hasModal };
  }, []);

  // Check if a point (center of pet) with current size overlaps with any obstacle
  const checkCollision = useCallback(
    (point: Point, size: number, obstacles: Rect[]): boolean => {
      const halfSize = size / 2;
      const petRect: Rect = {
        left: point.x - halfSize,
        top: point.y - halfSize,
        right: point.x + halfSize,
        bottom: point.y + halfSize,
      };

      for (const obs of obstacles) {
        const overlapX = petRect.left < obs.right && petRect.right > obs.left;
        const overlapY = petRect.top < obs.bottom && petRect.bottom > obs.top;
        if (overlapX && overlapY) {
          return true;
        }
      }
      return false;
    },
    []
  );

  // Find optimal safe collision-free position on screen
  const findSafePosition = useCallback(
    (preferredPoint?: Point): { position: Point; safeFound: boolean; shouldMinimize: boolean } => {
      if (typeof window === 'undefined') {
        return { position: { x: 300, y: 500 }, safeFound: true, shouldMinimize: false };
      }

      const w = window.innerWidth;
      // Adjust height if mobile keyboard is visible
      const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      const h = Math.min(window.innerHeight, viewportHeight);

      const size = renderSize;
      const halfSize = size / 2;
      const minX = margin + halfSize;
      const maxX = w - margin - halfSize;
      const minY = margin + halfSize + 60; // Top header clearance
      const maxY = h - margin - halfSize - 40; // Bottom clearance

      const { rects: obstacles, hasModal } = getObstacleRects();

      if (hasModal) {
        return { position: { x: maxX, y: maxY }, safeFound: false, shouldMinimize: true };
      }

      // Check current or preferred position first
      if (preferredPoint) {
        const boundedPref = {
          x: Math.max(minX, Math.min(maxX, preferredPoint.x)),
          y: Math.max(minY, Math.min(maxY, preferredPoint.y)),
        };
        if (!checkCollision(boundedPref, size, obstacles)) {
          return { position: boundedPref, safeFound: true, shouldMinimize: false };
        }
      }

      // Check stored page memory position
      const pathname = window.location.pathname;
      const storedPos = pagePositionsCache.current[pathname];
      if (storedPos) {
        const boundedStored = {
          x: Math.max(minX, Math.min(maxX, storedPos.x)),
          y: Math.max(minY, Math.min(maxY, storedPos.y)),
        };
        if (!checkCollision(boundedStored, size, obstacles)) {
          return { position: boundedStored, safeFound: true, shouldMinimize: false };
        }
      }

      // Generate grid of candidate safe positions across screen corners and edges
      const candidatePoints: Point[] = [
        // Standard anchors
        { x: maxX, y: maxY - 60 }, // Bottom Right
        { x: minX, y: maxY - 60 }, // Bottom Left
        { x: maxX, y: minY + 40 }, // Top Right
        { x: minX, y: minY + 40 }, // Top Left
        { x: maxX, y: (minY + maxY) / 2 }, // Mid Right
        { x: minX, y: (minY + maxY) / 2 }, // Mid Left
        { x: (minX + maxX) / 2, y: maxY - 60 }, // Bottom Center
        { x: (minX + maxX) / 2, y: minY + 40 }, // Top Center
        // Intermediate Grid Points
        { x: minX + (maxX - minX) * 0.75, y: maxY - 120 },
        { x: minX + (maxX - minX) * 0.25, y: maxY - 120 },
        { x: minX + (maxX - minX) * 0.75, y: minY + 120 },
        { x: minX + (maxX - minX) * 0.25, y: minY + 120 },
      ];

      // Find first 100% collision-free candidate point
      for (const pt of candidatePoints) {
        const boundedPt = {
          x: Math.max(minX, Math.min(maxX, pt.x)),
          y: Math.max(minY, Math.min(maxY, pt.y)),
        };
        if (!checkCollision(boundedPt, size, obstacles)) {
          pagePositionsCache.current[pathname] = boundedPt;
          return { position: boundedPt, safeFound: true, shouldMinimize: false };
        }
      }

      // If no candidate is completely collision-free, evaluate score (minimal overlap)
      let bestPt = candidatePoints[0];
      let minOverlapArea = Infinity;

      for (const pt of candidatePoints) {
        const boundedPt = {
          x: Math.max(minX, Math.min(maxX, pt.x)),
          y: Math.max(minY, Math.min(maxY, pt.y)),
        };
        let overlapSum = 0;
        const petRect: Rect = {
          left: boundedPt.x - halfSize,
          top: boundedPt.y - halfSize,
          right: boundedPt.x + halfSize,
          bottom: boundedPt.y + halfSize,
        };

        for (const obs of obstacles) {
          const xOverlap = Math.max(0, Math.min(petRect.right, obs.right) - Math.max(petRect.left, obs.left));
          const yOverlap = Math.max(0, Math.min(petRect.bottom, obs.bottom) - Math.max(petRect.top, obs.top));
          overlapSum += xOverlap * yOverlap;
        }

        if (overlapSum < minOverlapArea) {
          minOverlapArea = overlapSum;
          bestPt = boundedPt;
        }
      }

      // If overlap area is significant (>15% of pet area), auto-minimize to prevent blocking
      const petArea = size * size;
      const shouldMinimize = minOverlapArea > petArea * 0.15;

      pagePositionsCache.current[pathname] = bestPt;
      return { position: bestPt, safeFound: false, shouldMinimize };
    },
    [renderSize, getObstacleRects, checkCollision]
  );

  // Recalculate & auto-reposition intelligently
  const reevaluatePosition = useCallback(
    (preferredPoint?: Point) => {
      const result = findSafePosition(preferredPoint);

      if (result.shouldMinimize && !userManuallyMinimized) {
        setIsMinimized(true);
      } else if (!result.shouldMinimize && !userManuallyMinimized) {
        setIsMinimized(false);
      }

      targetRef.current = result.position;
    },
    [findSafePosition, userManuallyMinimized]
  );

  // Window Resize & Keyboard & Orientation Listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      reevaluatePosition();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [reevaluatePosition]);

  // Initial Position & Page Path Change Detection
  useEffect(() => {
    const currentPath = window.location.pathname;
    lastPathnameRef.current = currentPath;

    const result = findSafePosition();
    posRef.current = result.position;
    targetRef.current = result.position;
    setPosition(result.position);

    if (result.shouldMinimize && !userManuallyMinimized) {
      setIsMinimized(true);
    }
  }, [findSafePosition, userManuallyMinimized]);

  // Screen Tap / Click for Intelligent Repositioning
  useEffect(() => {
    if (!petShoeConfig?.enabled) return;

    const handleScreenTap = (e: MouseEvent | TouchEvent) => {
      const targetEl = e.target as HTMLElement;
      if (
        targetEl.closest('button') ||
        targetEl.closest('input') ||
        targetEl.closest('select') ||
        targetEl.closest('textarea') ||
        targetEl.closest('.ai-pet-shoe-mascot') ||
        targetEl.closest('#admin-modal') ||
        targetEl.closest('.modal')
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
        lastInteractionTimeRef.current = Date.now();
        setIsIdle(false);
        reevaluatePosition({ x: clientX, y: clientY });
      }
    };

    window.addEventListener('click', handleScreenTap, { passive: true });
    return () => window.removeEventListener('click', handleScreenTap);
  }, [petShoeConfig?.enabled, reevaluatePosition]);

  // Scroll Listener with Debounced Collision Check
  useEffect(() => {
    if (!petShoeConfig?.enabled) return;

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      lastInteractionTimeRef.current = Date.now();
      setIsIdle(false);

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        reevaluatePosition();
        setIsIdle(true);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [petShoeConfig?.enabled, reevaluatePosition]);

  // MutationObserver to detect dynamic DOM changes (modals popping up, drawer opening)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new MutationObserver(() => {
      reevaluatePosition();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden'],
    });

    return () => observer.disconnect();
  }, [reevaluatePosition]);

  // Physics & Smooth 60FPS Lerp Animation Loop
  useEffect(() => {
    if (!petShoeConfig?.enabled) return;

    // Smooth lerp speed (300-500ms transition time equivalent)
    const lerpSpeed = 0.08;
    const hoverAmp = isMobile ? 6 : 10;

    const animate = () => {
      sineTimeRef.current += 0.04;

      // Check if path changed
      if (typeof window !== 'undefined' && window.location.pathname !== lastPathnameRef.current) {
        lastPathnameRef.current = window.location.pathname;
        reevaluatePosition();
      }

      // Floating idle orbit when quiet
      if (Date.now() - lastInteractionTimeRef.current > 2000) {
        if (!isIdle) setIsIdle(true);
        if (petShoeConfig?.enableIdleMovement !== false && !isMinimized) {
          const orbitX = Math.sin(sineTimeRef.current * 0.7) * (isMobile ? 10 : 20);
          const orbitY = Math.cos(sineTimeRef.current * 0.9) * hoverAmp;
          const currentTarget = pagePositionsCache.current[window.location.pathname] || targetRef.current;
          targetRef.current = {
            x: currentTarget.x + orbitX,
            y: currentTarget.y + orbitY,
          };
        }
      }

      // Physics Interpolation (Lerp)
      const dx = targetRef.current.x - posRef.current.x;
      const dy = targetRef.current.y - posRef.current.y;

      posRef.current.x += dx * lerpSpeed;
      posRef.current.y += dy * lerpSpeed;

      // Banking/Tilting calculation based on lateral velocity
      const currentTilt = Math.max(-18, Math.min(18, dx * 0.25));

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
    petShoeConfig?.enableIdleMovement,
    isMobile,
    isMinimized,
    reevaluatePosition,
    isIdle,
  ]);

  // Mascot Click Handler
  const handlePetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (petShoeConfig?.enableClickInteraction === false) return;

    lastInteractionTimeRef.current = Date.now();

    // Trigger random action animation
    const actions: ('bounce' | 'spin' | 'shine')[] = ['bounce', 'spin', 'shine'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    setAnimationState(randomAction);

    setTimeout(() => {
      setAnimationState('hover');
    }, 1200);

    // Trigger Speech Bubble
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
            reevaluatePosition();
          }}
          className="pointer-events-auto relative w-12 h-12 rounded-full bg-neutral-900 border border-amber-500/50 shadow-2xl flex items-center justify-center group hover:scale-110 active:scale-95 transition-all duration-300"
          title="Expand AI Pet Assistant 👟✨"
        >
          {/* Outer Glow */}
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

          {/* Sparkle Badge */}
          <div className="absolute -top-1 -right-1 p-0.5 bg-amber-500 rounded-full text-white shadow-xs">
            <Sparkles className="w-2.5 h-2.5" />
          </div>

          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-neutral-900/90 text-white text-[10px] font-semibold px-2 py-1 rounded-lg border border-amber-500/30 whitespace-nowrap shadow-md">
            Click to expand AI Pet 👟
          </div>
        </button>
      </div>
    );
  }

  // Full Floating AI Pet Mascot Rendering
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

        {/* ANGEL WINGS - Left & Right Vector Wings */}
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

        {/* ULTRA REALISTIC TRANSPARENT SHOE OBJECT */}
        <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
          <img
            src={shoeImgUrl}
            alt="Marudhar Fashion Point Mascot Shoe"
            className="w-full h-full object-contain filter drop-shadow-[0_18px_28px_rgba(0,0,0,0.5)] transition-all duration-300"
            referrerPolicy="no-referrer"
            loading="lazy"
          />

          {/* Glossy Reflection Sweep Effect */}
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

