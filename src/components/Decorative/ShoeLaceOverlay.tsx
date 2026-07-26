import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { One8BurgundyShoeGraphic } from './One8BurgundyShoeGraphic';

export const ShoeLaceOverlay: React.FC = () => {
  const { hangingSneakerConfig } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  if (!hangingSneakerConfig || !hangingSneakerConfig.enabled) {
    return null;
  }

  const {
    imageUri,
    laceLength = 220,
    sizePx = 260,
    positionRight = 10,
    positionTop = 160,
    swingSpeedSec = 7.0,
    swingAngleDeg = 4.0,
    baseRotationDeg = -18,
    enablePhysicsAnimation = true,
    enableShineEffect = true,
  } = hangingSneakerConfig;

  // Handle subtle interactive click kick
  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 1200);
  };

  const animDuration = `${swingSpeedSec}s`;

  return (
    <div
      style={{
        top: `${positionTop}px`,
        right: `${positionRight}rem`,
      }}
      className="fixed z-20 pointer-events-none select-none origin-top transition-all duration-500 overflow-visible max-w-full scale-55 sm:scale-75 md:scale-90 lg:scale-100"
      aria-hidden="true"
    >
      <style>{`
        /* GPU Accelerated Pendulum Swing & Natural Inertia Float */
        @keyframes ultra-realistic-swing {
          0% {
            transform: translate3d(0, 0, 0) rotate(${baseRotationDeg - swingAngleDeg}deg) translateY(0px) rotateY(-2deg);
          }
          50% {
            transform: translate3d(0, 0, 0) rotate(${baseRotationDeg + swingAngleDeg}deg) translateY(5px) rotateY(2deg);
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(${baseRotationDeg - swingAngleDeg}deg) translateY(0px) rotateY(-2deg);
          }
        }

        /* Hover Lift & Fine Swing */
        @keyframes ultra-hover-swing {
          0% {
            transform: translate3d(0, 0, 0) rotate(${baseRotationDeg - (swingAngleDeg + 1)}deg) scale(1.03) translateY(-3px);
          }
          50% {
            transform: translate3d(0, 0, 0) rotate(${baseRotationDeg + (swingAngleDeg + 1)}deg) scale(1.03) translateY(3px);
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(${baseRotationDeg - (swingAngleDeg + 1)}deg) scale(1.03) translateY(-3px);
          }
        }

        /* Interactive Tap Reaction */
        @keyframes ultra-kick-bounce {
          0% {
            transform: translate3d(0, 0, 0) rotate(${baseRotationDeg}deg) scale(1) translateY(0);
          }
          25% {
            transform: translate3d(0, 0, 0) rotate(${baseRotationDeg - 8}deg) scale(1.06) translateY(-8px);
          }
          50% {
            transform: translate3d(0, 0, 0) rotate(${baseRotationDeg + 6}deg) scale(1.03) translateY(4px);
          }
          75% {
            transform: translate3d(0, 0, 0) rotate(${baseRotationDeg - 3}deg) scale(1.01) translateY(-2px);
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(${baseRotationDeg}deg) scale(1) translateY(0);
          }
        }

        /* Studio Light Gloss Sweep Across Leather Surface */
        @keyframes studio-shine-sweep {
          0% {
            transform: translateX(-150%) skewX(-25deg);
            opacity: 0;
          }
          20% {
            opacity: 0.6;
          }
          40% {
            transform: translateX(150%) skewX(-25deg);
            opacity: 0;
          }
          100% {
            transform: translateX(150%) skewX(-25deg);
            opacity: 0;
          }
        }

        .animate-ultra-swing {
          transform-origin: 120px 0px;
          animation: ${enablePhysicsAnimation ? `ultra-realistic-swing ${animDuration} cubic-bezier(0.4, 0, 0.2, 1) infinite` : 'none'};
          will-change: transform;
        }

        .animate-ultra-hover {
          transform-origin: 120px 0px;
          animation: ${enablePhysicsAnimation ? `ultra-hover-swing ${swingSpeedSec * 0.6}s cubic-bezier(0.4, 0, 0.2, 1) infinite` : 'none'};
          will-change: transform;
        }

        .animate-ultra-kick {
          transform-origin: 120px 0px;
          animation: ultra-kick-bounce 1.2s cubic-bezier(0.25, 1, 0.5, 1) 1;
          will-change: transform;
        }

        .animate-shine-sweep {
          animation: studio-shine-sweep 5.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-ultra-swing, .animate-ultra-hover, .animate-ultra-kick, .animate-shine-sweep {
            animation: none !important;
          }
        }
      `}</style>

      {/* Interactive Container */}
      <div
        className={`pointer-events-auto cursor-pointer transition-all duration-500 ease-out flex flex-col items-center ${
          isClicked
            ? 'animate-ultra-kick filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.5)]'
            : isHovered
            ? 'animate-ultra-hover filter drop-shadow-[0_22px_35px_rgba(0,0,0,0.45)]'
            : 'animate-ultra-swing filter drop-shadow-[0_18px_30px_rgba(0,0,0,0.35)]'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        title="Hanging Studio Sneaker"
      >
        {/* =========================================================
           1. REALISTIC WOVEN WHITE SHOELACES SUSPENSION STRANDS
           ========================================================= */}
        <svg
          width="240"
          height={laceLength}
          viewBox={`0 0 240 ${laceLength}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[120px] sm:w-[160px] md:w-[200px] lg:w-[240px] h-auto shrink-0"
        >
          <defs>
            {/* Chrome Top Mounting Bracket */}
            <linearGradient id="chromeBracketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#9CA3AF" />
              <stop offset="80%" stopColor="#4B5563" />
              <stop offset="100%" stopColor="#1F2937" />
            </linearGradient>

            {/* Woven Fabric Texture Pattern for Laces */}
            <pattern id="laceWovenPattern" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M0 3 L3 0 L6 3 L3 6 Z" fill="#FAF8F5" />
              <path d="M0 3 L3 6 L6 3 L3 0 Z" fill="#E5DFD5" opacity="0.4" />
            </pattern>
          </defs>

          {/* Top Edge Mounting Hardware */}
          <rect x="108" y="0" width="24" height="8" rx="2" fill="url(#chromeBracketGrad)" />
          <circle cx="120" cy="8" r="4" fill="none" stroke="url(#chromeBracketGrad)" strokeWidth="2.5" />

          {/* Left Strand of Natural Woven White Shoelace */}
          <path
            d={`M 114 10 C 112 ${laceLength * 0.35}, 108 ${laceLength * 0.7}, 100 ${laceLength}`}
            stroke="#FAF8F5"
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M 114 10 C 112 ${laceLength * 0.35}, 108 ${laceLength * 0.7}, 100 ${laceLength}`}
            stroke="#D6CFC7"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M 114 10 C 112 ${laceLength * 0.35}, 108 ${laceLength * 0.7}, 100 ${laceLength}`}
            stroke="#8C8275"
            strokeWidth="1"
            strokeDasharray="2 2"
            fill="none"
            opacity="0.7"
          />

          {/* Right Strand of Natural Woven White Shoelace */}
          <path
            d={`M 126 10 C 128 ${laceLength * 0.35}, 132 ${laceLength * 0.7}, 140 ${laceLength}`}
            stroke="#FFFFFF"
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M 126 10 C 128 ${laceLength * 0.35}, 132 ${laceLength * 0.7}, 140 ${laceLength}`}
            stroke="#D6CFC7"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M 126 10 C 128 ${laceLength * 0.35}, 132 ${laceLength * 0.7}, 140 ${laceLength}`}
            stroke="#8C8275"
            strokeWidth="1"
            strokeDasharray="2 2"
            fill="none"
            opacity="0.7"
          />

          {/* Knot Tie & Bow Loops at bottom junction */}
          <g transform={`translate(0, ${laceLength - 10})`}>
            <ellipse cx="120" cy="0" rx="10" ry="5" fill="#FAF8F5" stroke="#C5BBB0" strokeWidth="1" />
            <path d="M 120 0 C 100 -18, 75 0, 95 18 Z" fill="#FFFFFF" stroke="#C5BBB0" strokeWidth="1" />
            <path d="M 120 0 C 140 -18, 165 0, 145 18 Z" fill="#FAF8F5" stroke="#C5BBB0" strokeWidth="1" />
          </g>
        </svg>

        {/* =========================================================
           2. HIGH-RESOLUTION ULTRA REALISTIC PRODUCT PHOTOGRAPHY / GRAPHIC
           ========================================================= */}
        {imageUri?.trim() ? (
          <div
            style={{
              width: `${sizePx}px`,
              maxWidth: '85vw',
            }}
            className="relative transition-transform duration-300 group overflow-visible"
          >
            {/* Custom AI Extracted Transparent Shoe Image */}
            <img
              src={imageUri}
              alt="Ultra Realistic Hanging Sneaker"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-contain filter contrast-[1.05] brightness-[1.02] drop-shadow-[0_22px_32px_rgba(0,0,0,0.45)]"
              loading="lazy"
            />

            {/* Gentle Luxury Glossy Shine Light Sweep Overlay Masked Strictly to Shoe Body */}
            {enableShineEffect && (
              <div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                style={{
                  WebkitMaskImage: `url("${imageUri}")`,
                  maskImage: `url("${imageUri}")`,
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                }}
              >
                <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-25 animate-shine-sweep mix-blend-overlay" />
              </div>
            )}
          </div>
        ) : (
          <One8BurgundyShoeGraphic width={sizePx} enableShine={enableShineEffect} />
        )}

        {/* Subtle Tooltip on Hover */}
        {isHovered && (
          <div className="absolute top-[280px] -left-28 sm:-left-36 bg-neutral-950/90 text-white backdrop-blur-md text-[11px] font-bold px-3.5 py-1.5 rounded-full border border-amber-500/30 shadow-2xl pointer-events-none animate-fade-in flex items-center gap-2 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>ONE 8 Luxury Studio Sneaker</span>
          </div>
        )}
      </div>
    </div>
  );
};

