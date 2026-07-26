import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';

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
      className="fixed z-30 pointer-events-none select-none origin-top transition-all duration-500 max-h-screen overflow-visible scale-75 sm:scale-85 md:scale-95 lg:scale-100"
      aria-hidden="true"
    >
      <style>{`
        /* Premium Subtle Pendulum Swing & Floating Motion */
        @keyframes subtle-luxury-swing {
          0% {
            transform: rotate(${baseRotationDeg - swingAngleDeg}deg) translateY(0px) rotateY(-2deg);
          }
          50% {
            transform: rotate(${baseRotationDeg + swingAngleDeg}deg) translateY(5px) rotateY(2deg);
          }
          100% {
            transform: rotate(${baseRotationDeg - swingAngleDeg}deg) translateY(0px) rotateY(-2deg);
          }
        }

        /* Subtle Hover Lift & Sway */
        @keyframes subtle-hover-swing {
          0% {
            transform: rotate(${baseRotationDeg - (swingAngleDeg + 1)}deg) scale(1.03) translateY(-3px);
          }
          50% {
            transform: rotate(${baseRotationDeg + (swingAngleDeg + 1)}deg) scale(1.03) translateY(3px);
          }
          100% {
            transform: rotate(${baseRotationDeg - (swingAngleDeg + 1)}deg) scale(1.03) translateY(-3px);
          }
        }

        /* Click Physics Reaction */
        @keyframes subtle-kick-bounce {
          0% {
            transform: rotate(${baseRotationDeg}deg) scale(1) translateY(0);
          }
          25% {
            transform: rotate(${baseRotationDeg - 8}deg) scale(1.06) translateY(-8px);
          }
          50% {
            transform: rotate(${baseRotationDeg + 6}deg) scale(1.03) translateY(4px);
          }
          75% {
            transform: rotate(${baseRotationDeg - 3}deg) scale(1.01) translateY(-2px);
          }
          100% {
            transform: rotate(${baseRotationDeg}deg) scale(1) translateY(0);
          }
        }

        /* Natural Lace Sway */
        @keyframes subtle-lace-dangle {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(2.5deg);
          }
        }

        .animate-subtle-swing {
          transform-origin: 120px 0px;
          animation: ${enablePhysicsAnimation ? `subtle-luxury-swing ${animDuration} cubic-bezier(0.4, 0, 0.2, 1) infinite` : 'none'};
          will-change: transform;
        }

        .animate-subtle-hover {
          transform-origin: 120px 0px;
          animation: ${enablePhysicsAnimation ? `subtle-hover-swing ${swingSpeedSec * 0.6}s cubic-bezier(0.4, 0, 0.2, 1) infinite` : 'none'};
          will-change: transform;
        }

        .animate-subtle-kick {
          transform-origin: 120px 0px;
          animation: subtle-kick-bounce 1.2s cubic-bezier(0.25, 1, 0.5, 1) 1;
          will-change: transform;
        }

        .animate-lace-dangle {
          transform-origin: 120px ${laceLength}px;
          animation: ${enablePhysicsAnimation ? 'subtle-lace-dangle 6s ease-in-out infinite' : 'none'};
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-subtle-swing, .animate-subtle-hover, .animate-subtle-kick, .animate-lace-dangle {
            animation: none !important;
          }
        }
      `}</style>

      {/* Interactive Container */}
      <div
        className={`pointer-events-auto cursor-pointer transition-all duration-500 ease-out ${
          isClicked
            ? 'animate-subtle-kick filter drop-shadow-[0_20px_35px_rgba(88,17,26,0.45)]'
            : isHovered
            ? 'animate-subtle-hover filter drop-shadow-[0_18px_30px_rgba(88,17,26,0.35)] drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)]'
            : 'animate-subtle-swing filter drop-shadow-[0_16px_28px_rgba(0,0,0,0.22)]'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        title="ONE 8 Shoes - Premium Burgundy Leather Edition"
      >
        {imageUri ? (
          /* =========================================================
             CUSTOM UPLOADED SNEAKER IMAGE (ADMIN REPLACEMENT)
             ========================================================= */
          <div className="relative flex flex-col items-center">
            {/* Top Suspension Woven White Laces */}
            <svg
              width="240"
              height={laceLength}
              viewBox={`0 0 240 ${laceLength}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[120px] sm:w-[160px] md:w-[200px] lg:w-[240px] h-auto"
            >
              <defs>
                <linearGradient id="gunmetalEyeletGradCustom" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="30%" stopColor="#9CA3AF" />
                  <stop offset="70%" stopColor="#4B5563" />
                  <stop offset="100%" stopColor="#111827" />
                </linearGradient>
              </defs>
              {/* Chrome Top Mount Bracket */}
              <rect x="108" y="0" width="24" height="8" rx="2" fill="url(#gunmetalEyeletGradCustom)" />
              <circle cx="120" cy="8" r="4" fill="none" stroke="url(#gunmetalEyeletGradCustom)" strokeWidth="2.5" />
              
              {/* Suspension White Laces Strands with Natural Curve */}
              <path
                d={`M 114 10 C 112 ${laceLength * 0.4}, 110 ${laceLength * 0.7}, 102 ${laceLength}`}
                stroke="#FAF8F5"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={`M 114 10 C 112 ${laceLength * 0.4}, 110 ${laceLength * 0.7}, 102 ${laceLength}`}
                stroke="#E5E0D8"
                strokeWidth="1"
                strokeDasharray="2 2"
                fill="none"
              />

              <path
                d={`M 126 10 C 128 ${laceLength * 0.4}, 130 ${laceLength * 0.7}, 138 ${laceLength}`}
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={`M 126 10 C 128 ${laceLength * 0.4}, 130 ${laceLength * 0.7}, 138 ${laceLength}`}
                stroke="#E5E0D8"
                strokeWidth="1"
                strokeDasharray="2 2"
                fill="none"
              />

              {/* Knot at bottom of laces */}
              <ellipse cx="120" cy={laceLength - 4} rx="10" ry="6" fill="#FAF8F5" stroke="#D1C7BD" strokeWidth="1" />
            </svg>

            {/* Custom Uploaded Image as Uploaded */}
            <div
              style={{
                width: `${sizePx}px`,
                maxWidth: '85vw',
              }}
              className="relative transition-transform duration-300 drop-shadow-[0_20px_30px_rgba(0,0,0,0.32)]"
            >
              <img
                src={imageUri}
                alt="ONE 8 Hanging Shoe"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain filter contrast-105"
              />
            </div>
          </div>
        ) : (
          /* =========================================================
             REFERENCE SHOE: ONE 8 BURGUNDY WINE LUXURY LEATHER SNEAKER
             ========================================================= */
          <svg
            width="280"
            height="500"
            viewBox="0 0 280 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[130px] sm:w-[170px] md:w-[220px] lg:w-[260px] xl:w-[280px] h-auto transition-transform duration-300"
          >
            <defs>
              {/* 1. Burgundy Leather Base Gradient */}
              <linearGradient id="burgundyLeatherGrad" x1="10%" y1="0%" x2="90%" y2="100%">
                <stop offset="0%" stopColor="#731928" />
                <stop offset="35%" stopColor="#58111A" />
                <stop offset="70%" stopColor="#450C15" />
                <stop offset="100%" stopColor="#2A060C" />
              </linearGradient>

              {/* 2. Burgundy Leather Specular Highlight */}
              <linearGradient id="burgundyShineGrad" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#A8283E" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#6D1725" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3B0A12" stopOpacity="0" />
              </linearGradient>

              {/* 3. Gum Rubber Sole Gradient */}
              <linearGradient id="gumSoleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#D29A57" />
                <stop offset="40%" stopColor="#B88242" />
                <stop offset="80%" stopColor="#9C692D" />
                <stop offset="100%" stopColor="#7A501F" />
              </linearGradient>

              {/* 4. Crisp White Midsole Gradient */}
              <linearGradient id="whiteMidsoleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#FAF7F2" />
                <stop offset="100%" stopColor="#E5DFD5" />
              </linearGradient>

              {/* 5. Metallic Gold Foil Gradient (Logo & Signature) */}
              <linearGradient id="goldFoilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF2B2" />
                <stop offset="30%" stopColor="#EAB308" />
                <stop offset="70%" stopColor="#CA8A04" />
                <stop offset="100%" stopColor="#713F12" />
              </linearGradient>

              {/* 6. Gold Metallic EyeletShader */}
              <linearGradient id="goldEyeletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="40%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#854D0E" />
              </linearGradient>

              {/* 7. Chrome Top Bracket Shader */}
              <linearGradient id="chromeBracketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#9CA3AF" />
                <stop offset="100%" stopColor="#374151" />
              </linearGradient>

              {/* 8. Fine Leather Grain Overlay Pattern */}
              <pattern id="leatherTexturePattern" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M0 2 Q2 0 4 2 T8 2 M2 5 Q4 3 6 5 T2 8" fill="none" stroke="#1A0307" strokeWidth="0.3" opacity="0.12" />
                <circle cx="3" cy="3" r="0.4" fill="#000" opacity="0.08" />
                <circle cx="6" cy="6" r="0.5" fill="#FFF" opacity="0.06" />
              </pattern>

              {/* Drop Shadow Filter */}
              <filter id="one8ShoeShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="4" dy="18" stdDeviation="10" floodColor="#3D0A12" floodOpacity="0.4" />
                <feDropShadow dx="1" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.3" />
              </filter>
            </defs>

            <g filter="url(#one8ShoeShadow)">
              {/* =========================================================
                 1. TOP MOUNT BRACKET & LONG WOVEN WHITE HANGING LACES
                 ========================================================= */}
              <rect x="128" y="0" width="24" height="8" rx="2" fill="url(#chromeBracketGrad)" />
              <circle cx="140" cy="8" r="4" fill="none" stroke="url(#chromeBracketGrad)" strokeWidth="2.5" />

              {/* Left Hanging Shoelace Strand */}
              <path
                d={`M 134 10 C 130 90, 122 150, 112 ${laceLength}`}
                stroke="#FAF8F5"
                strokeWidth="5.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={`M 134 10 C 130 90, 122 150, 112 ${laceLength}`}
                stroke="#E2DCD3"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={`M 134 10 C 130 90, 122 150, 112 ${laceLength}`}
                stroke="#9E9488"
                strokeWidth="1"
                strokeDasharray="2 2"
                fill="none"
                opacity="0.6"
              />

              {/* Right Hanging Shoelace Strand */}
              <path
                d={`M 146 10 C 150 90, 158 150, 168 ${laceLength}`}
                stroke="#FFFFFF"
                strokeWidth="5.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={`M 146 10 C 150 90, 158 150, 168 ${laceLength}`}
                stroke="#E2DCD3"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={`M 146 10 C 150 90, 158 150, 168 ${laceLength}`}
                stroke="#9E9488"
                strokeWidth="1"
                strokeDasharray="2 2"
                fill="none"
                opacity="0.6"
              />

              {/* Tied Knot & Bow Loop at InStep */}
              <g transform={`translate(0, ${laceLength - 220})`}>
                <ellipse cx="140" cy="220" rx="14" ry="7" fill="#FAF8F5" stroke="#D1C7BD" strokeWidth="1" />
                <path
                  d="M 140 220 C 110 195, 80 215, 100 238 C 115 255, 132 230, 140 220 Z"
                  fill="#FAF8F5"
                  stroke="#D1C7BD"
                  strokeWidth="1"
                />
                <path
                  d="M 140 220 C 170 195, 200 215, 180 238 C 165 255, 148 230, 140 220 Z"
                  fill="#FFFFFF"
                  stroke="#D1C7BD"
                  strokeWidth="1"
                />
              </g>

              {/* =========================================================
                 2. ONE 8 BURGUNDY LEATHER SNEAKER BODY (NATURAL GRAVITY)
                 ========================================================= */}
              <g transform={`translate(10, ${laceLength - 200})`}>
                {/* A. Padded Collar Interior & Black/Burgundy Lining */}
                <ellipse cx="65" cy="225" rx="22" ry="12" fill="#200508" transform="rotate(-15 65 225)" />
                <path d="M 45 215 C 56 208, 78 218, 86 232" stroke="#FAF8F5" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />

                {/* B. Burgundy Leather Tongue with ONE 8 Gold Foil Badge */}
                <path
                  d="M 72 212 Q 92 196, 106 182 L 118 190 Q 102 210, 86 226 Z"
                  fill="url(#burgundyLeatherGrad)"
                  stroke="#3B0A12"
                  strokeWidth="1"
                />
                <rect x="92" y="192" width="14" height="22" rx="3" fill="#420B13" stroke="url(#goldFoilGrad)" strokeWidth="0.8" transform="rotate(25 99 203)" />
                {/* Gold "one 8" Text on Tongue */}
                <text x="94" y="205" fill="url(#goldFoilGrad)" fontSize="7" fontWeight="bold" fontFamily="serif" transform="rotate(25 99 203)">
                  one 8
                </text>

                {/* C. Main Burgundy Leather Upper Body */}
                <path
                  d="M 42 225 C 34 255, 30 290, 32 318 C 38 326, 46 332, 56 335 L 208 348 C 228 345, 238 332, 230 312 C 220 290, 200 265, 172 242 C 140 216, 102 202, 82 210 C 64 218, 50 210, 42 225 Z"
                  fill="url(#burgundyLeatherGrad)"
                  stroke="#380910"
                  strokeWidth="1.2"
                />
                <path
                  d="M 42 225 C 34 255, 30 290, 32 318 C 38 326, 46 332, 56 335 L 208 348 C 228 345, 238 332, 230 312 C 220 290, 200 265, 172 242 C 140 216, 102 202, 82 210 C 64 218, 50 210, 42 225 Z"
                  fill="url(#leatherTexturePattern)"
                />
                {/* Leather Specular Highlight Overlay */}
                <path
                  d="M 46 228 C 40 252, 38 280, 40 305 C 50 270, 75 240, 110 225 Z"
                  fill="url(#burgundyShineGrad)"
                />

                {/* D. Precision Double Stitched Lines (Toe Cap & Vamp Panels) */}
                <path
                  d="M 46 235 C 40 260, 38 285, 40 310"
                  stroke="#9C273C"
                  strokeWidth="1"
                  strokeDasharray="2.5 1.5"
                  fill="none"
                  opacity="0.8"
                />
                <path
                  d="M 48 237 C 42 262, 40 287, 42 312"
                  stroke="#E2C898"
                  strokeWidth="0.8"
                  strokeDasharray="2.5 1.5"
                  fill="none"
                  opacity="0.7"
                />

                <path
                  d="M 152 248 C 176 268, 202 292, 218 316 C 205 330, 175 338, 150 334 C 136 320, 138 280, 152 248 Z"
                  fill="url(#burgundyLeatherGrad)"
                  stroke="#380910"
                  strokeWidth="0.8"
                />
                <path
                  d="M 152 248 C 176 268, 202 292, 218 316 C 205 330, 175 338, 150 334 C 136 320, 138 280, 152 248 Z"
                  fill="url(#leatherTexturePattern)"
                />
                <path
                  d="M 154 252 C 176 270, 198 292, 212 314"
                  stroke="#E2C898"
                  strokeWidth="1"
                  strokeDasharray="2.5 1.5"
                  fill="none"
                  opacity="0.85"
                />

                {/* E. ICONIC ONE 8 DOUBLE-LOOP INFINITY KNOT SIDE STITCHING */}
                <g opacity="0.95">
                  {/* Outer Loop 1 */}
                  <circle cx="118" cy="272" r="14" fill="none" stroke="#E2C898" strokeWidth="1.5" strokeDasharray="3 1.5" />
                  <circle cx="118" cy="272" r="12" fill="none" stroke="#E2C898" strokeWidth="1" strokeDasharray="3 1.5" />
                  
                  {/* Outer Loop 2 (Intersecting Infinity Knot) */}
                  <circle cx="136" cy="270" r="14" fill="none" stroke="#E2C898" strokeWidth="1.5" strokeDasharray="3 1.5" />
                  <circle cx="136" cy="270" r="12" fill="none" stroke="#E2C898" strokeWidth="1" strokeDasharray="3 1.5" />

                  {/* Parallel Stitching Lines Extending to Heel */}
                  <path d="M 60 282 L 104 274" stroke="#E2C898" strokeWidth="1.2" strokeDasharray="3 1.5" fill="none" />
                  <path d="M 60 285 L 104 277" stroke="#E2C898" strokeWidth="1.2" strokeDasharray="3 1.5" fill="none" />
                  <path d="M 150 268 L 180 262" stroke="#E2C898" strokeWidth="1.2" strokeDasharray="3 1.5" fill="none" />
                  <path d="M 150 271 L 180 265" stroke="#E2C898" strokeWidth="1.2" strokeDasharray="3 1.5" fill="none" />
                </g>

                {/* F. GOLD SIGNATURE DETAILS ON HEEL COUNTER */}
                <g transform="translate(48, 275) rotate(-10)">
                  {/* Cursive Gold Foil Signature Stamp */}
                  <path
                    d="M 2 12 Q 8 2, 12 14 T 20 8 Q 24 16, 28 6 T 34 14"
                    stroke="url(#goldFoilGrad)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="36" cy="14" r="1" fill="url(#goldFoilGrad)" />
                </g>

                {/* G. Gold Metallic Eyelets & Lacing Across Instep */}
                <circle cx="96" cy="216" r="4" fill="url(#goldEyeletGrad)" />
                <circle cx="96" cy="216" r="2" fill="#200508" />

                <circle cx="110" cy="230" r="4" fill="url(#goldEyeletGrad)" />
                <circle cx="110" cy="230" r="2" fill="#200508" />

                <circle cx="124" cy="246" r="4" fill="url(#goldEyeletGrad)" />
                <circle cx="124" cy="246" r="2" fill="#200508" />

                <circle cx="138" cy="262" r="4" fill="url(#goldEyeletGrad)" />
                <circle cx="138" cy="262" r="2" fill="#200508" />

                {/* Woven White Shoelaces Threaded Through Eyelets */}
                <path
                  d="M 100 196 L 96 216 L 110 230 L 124 246 L 138 262"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 100 196 L 110 230 M 96 216 L 124 246 M 110 230 L 138 262"
                  stroke="#FAF8F5"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* H. Crisp White Midsole Layer */}
                <path
                  d="M 32 318 C 34 328, 44 335, 54 337 L 202 350 C 220 347, 230 338, 228 325 L 227 332 C 224 343, 212 352, 192 352 L 50 339 C 38 337, 30 328, 32 318 Z"
                  fill="url(#whiteMidsoleGrad)"
                  stroke="#D1C7BD"
                  strokeWidth="1"
                />

                {/* I. Warm Gum Rubber Outsole */}
                <path
                  d="M 32 328 C 34 338, 44 344, 54 346 L 202 359 C 220 356, 230 347, 227 334 L 225 342 C 222 353, 210 361, 190 361 L 50 348 C 38 346, 30 337, 32 328 Z"
                  fill="url(#gumSoleGrad)"
                  stroke="#6E4417"
                  strokeWidth="1"
                />
                {/* Outsole Grip Texture Lines */}
                <path
                  d="M 36 338 Q 110 353, 220 352"
                  stroke="#7A501F"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  fill="none"
                />

                {/* J. Loose Cascading Shoelace Ends with Gold Aglets */}
                <g className="animate-lace-dangle">
                  {/* Lace End 1 */}
                  <path
                    d="M 102 210 C 85 240, 115 280, 90 320 C 76 342, 94 370, 84 402"
                    stroke="#FFFFFF"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 102 210 C 85 240, 115 280, 90 320 C 76 342, 94 370, 84 402"
                    stroke="#E2DCD3"
                    strokeWidth="1"
                    strokeDasharray="2 1.5"
                    fill="none"
                  />
                  {/* Gold Metallic Aglet Tip 1 */}
                  <path d="M 84 402 L 81 420" stroke="url(#goldFoilGrad)" strokeWidth="4" strokeLinecap="round" />
                  <line x1="82" y1="407" x2="84" y2="407" stroke="#713F12" strokeWidth="0.8" />

                  {/* Lace End 2 */}
                  <path
                    d="M 108 210 C 125 245, 95 290, 120 330 C 130 348, 124 372, 120 392"
                    stroke="#FAF8F5"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Gold Metallic Aglet Tip 2 */}
                  <path d="M 120 392 L 118 410" stroke="url(#goldFoilGrad)" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="118.5" y1="397" x2="120.5" y2="397" stroke="#713F12" strokeWidth="0.8" />
                </g>
              </g>
            </g>
          </svg>
        )}

        {/* Subtle Tooltip on Hover */}
        {isHovered && (
          <div className="absolute top-[280px] -left-28 sm:-left-36 bg-neutral-950/90 text-white backdrop-blur-md text-[11px] font-bold px-3 py-1.5 rounded-full border border-amber-500/30 shadow-xl pointer-events-none animate-fade-in flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>ONE 8 Shoes - Burgundy Leather Edition</span>
          </div>
        )}
      </div>
    </div>
  );
};
