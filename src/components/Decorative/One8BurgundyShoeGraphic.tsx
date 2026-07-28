import React from 'react';

interface Props {
  width?: number;
  className?: string;
  enableShine?: boolean;
}

/**
 * Ultra HD Photorealistic Isolated Cutout of the ONE 8 Burgundy Leather Sneaker.
 * Transparent background (100% free of rocks, poster text, or dark backgrounds).
 */
export const One8BurgundyShoeGraphic: React.FC<Props> = ({
  width = 260,
  className = '',
  enableShine = true,
}) => {
  return (
    <div
      style={{ width: `${width}px`, maxWidth: '85vw' }}
      className={`relative select-none filter contrast-[1.05] brightness-[1.02] drop-shadow-[0_20px_28px_rgba(0,0,0,0.45)] ${className}`}
    >
      <svg
        viewBox="0 0 500 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto overflow-visible"
      >
        <defs>
          {/* Leather Base Gradient */}
          <linearGradient id="burgundyLeatherGrad" x1="50" y1="50" x2="450" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#801C2B" />
            <stop offset="35%" stopColor="#691220" />
            <stop offset="70%" stopColor="#520D18" />
            <stop offset="100%" stopColor="#3B0710" />
          </linearGradient>

          {/* Top Vamp Highlight */}
          <linearGradient id="leatherHighlightGrad" x1="120" y1="100" x2="300" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A32C3E" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#801C2B" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3B0710" stopOpacity="0" />
          </linearGradient>

          {/* Gum Rubber Outsole Gradient */}
          <linearGradient id="gumSoleGrad" x1="100" y1="240" x2="480" y2="290" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DF9F5B" />
            <stop offset="50%" stopColor="#C88540" />
            <stop offset="100%" stopColor="#A06428" />
          </linearGradient>

          {/* Midsole White Gradient */}
          <linearGradient id="midsoleWhiteGrad" x1="100" y1="210" x2="470" y2="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F5F0E8" />
            <stop offset="100%" stopColor="#DDD6C8" />
          </linearGradient>

          {/* Gold Foil Metallic Accent */}
          <linearGradient id="goldFoilGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFE8A3" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#AA7C11" />
            <stop offset="100%" stopColor="#F3E5AB" />
          </linearGradient>

          {/* Inner Collar Dark Shadow */}
          <linearGradient id="collarInnerGrad" x1="380" y1="90" x2="440" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#220308" />
            <stop offset="100%" stopColor="#520D18" />
          </linearGradient>

          {/* Soft Drop Shadow for Sole */}
          <filter id="soleSoftShadow" x="-10%" y="-10%" width="130%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* --- SHOE BODY LAYER --- */}
        <g filter="url(#soleSoftShadow)">
          {/* Inner Lining Collar Opening */}
          <path
            d="M 370 85 C 385 75, 415 80, 440 100 C 455 115, 460 135, 450 155 C 430 170, 395 150, 370 120 Z"
            fill="url(#collarInnerGrad)"
          />

          {/* Main Leather Upper Outer Contour */}
          <path
            d="M 120 220 C 90 215, 75 190, 85 165 C 105 130, 160 125, 200 120 C 240 115, 275 85, 305 75 C 330 68, 360 70, 380 82 C 405 75, 440 85, 460 115 C 475 140, 470 185, 455 210 C 420 230, 320 232, 120 220 Z"
            fill="url(#burgundyLeatherGrad)"
            stroke="#3B0710"
            strokeWidth="2"
          />

          {/* Top Toe Box & Vamp Leather Highlight */}
          <path
            d="M 120 220 C 90 215, 75 190, 85 165 C 105 130, 160 125, 200 120 C 235 115, 260 100, 280 95 C 220 120, 160 140, 120 220 Z"
            fill="url(#leatherHighlightGrad)"
          />

          {/* Double Stitched Vamp Seams */}
          <path
            d="M 115 190 C 130 160, 165 140, 210 135"
            stroke="#A32C3E"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            fill="none"
          />
          <path
            d="M 118 193 C 133 163, 168 143, 213 138"
            stroke="#4A0812"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            fill="none"
          />

          {/* --- ICONIC ONE 8 DOUBLE-LOOP INFINITY STITCHING ON SIDE PANEL --- */}
          <g transform="translate(230, 125) scale(0.85)">
            {/* Parallel Running Accent Threads */}
            <path d="M -30 20 L 120 -15" stroke="url(#goldFoilGrad)" strokeWidth="2" opacity="0.85" />
            <path d="M -28 25 L 122 -10" stroke="url(#goldFoilGrad)" strokeWidth="2" opacity="0.85" />
            <path d="M -26 30 L 124 -5" stroke="url(#goldFoilGrad)" strokeWidth="2" opacity="0.85" />

            {/* Left Infinity Loop Knot */}
            <circle cx="25" cy="10" r="18" stroke="url(#goldFoilGrad)" strokeWidth="2.5" fill="none" />
            <circle cx="25" cy="10" r="13" stroke="url(#goldFoilGrad)" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />

            {/* Right Infinity Loop Knot */}
            <circle cx="55" cy="3" r="18" stroke="url(#goldFoilGrad)" strokeWidth="2.5" fill="none" />
            <circle cx="55" cy="3" r="13" stroke="url(#goldFoilGrad)" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />

            {/* Intersecting Knot Weave */}
            <path d="M 10 12 C 25 -5, 55 20, 70 0" stroke="url(#goldFoilGrad)" strokeWidth="2" fill="none" />
          </g>

          {/* Gold Cursive Signature Stamp on Heel Quarter */}
          <g transform="translate(370, 115) rotate(-12) scale(0.8)">
            <path
              d="M 0 10 C 5 0, 10 20, 15 5 C 20 -10, 25 15, 30 10 M 12 18 C 22 22, 35 15, 45 25 M 32 5 L 42 0"
              stroke="url(#goldFoilGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* --- TONGUE & GOLD ONE 8 EMBLEM --- */}
          <path
            d="M 285 75 C 295 60, 320 55, 335 65 C 330 85, 310 90, 285 75 Z"
            fill="#520D18"
            stroke="url(#goldFoilGrad)"
            strokeWidth="1"
          />
          <text
            x="305"
            y="72"
            fill="url(#goldFoilGrad)"
            fontSize="10"
            fontWeight="bold"
            fontFamily="sans-serif"
            letterSpacing="1"
            transform="rotate(-15, 305, 72)"
          >
            one 8
          </text>

          {/* --- CREAM LACES & METALLIC EYELETS --- */}
          {/* Eyelet 1 */}
          <circle cx="220" cy="120" r="4.5" fill="#C5A059" stroke="#520D18" strokeWidth="1.5" />
          <circle cx="220" cy="120" r="2.5" fill="#220308" />

          {/* Eyelet 2 */}
          <circle cx="250" cy="108" r="4.5" fill="#C5A059" stroke="#520D18" strokeWidth="1.5" />
          <circle cx="250" cy="108" r="2.5" fill="#220308" />

          {/* Eyelet 3 */}
          <circle cx="280" cy="96" r="4.5" fill="#C5A059" stroke="#520D18" strokeWidth="1.5" />
          <circle cx="280" cy="96" r="2.5" fill="#220308" />

          {/* Eyelet 4 */}
          <circle cx="310" cy="84" r="4.5" fill="#C5A059" stroke="#520D18" strokeWidth="1.5" />
          <circle cx="310" cy="84" r="2.5" fill="#220308" />

          {/* Cross Lacing Threads */}
          <path d="M 220 120 C 235 110, 240 115, 250 108" stroke="#FAF8F5" strokeWidth="6" strokeLinecap="round" />
          <path d="M 220 120 C 235 110, 240 115, 250 108" stroke="#E5DFD5" strokeWidth="4" strokeLinecap="round" />

          <path d="M 250 108 C 265 98, 270 103, 280 96" stroke="#FAF8F5" strokeWidth="6" strokeLinecap="round" />
          <path d="M 250 108 C 265 98, 270 103, 280 96" stroke="#E5DFD5" strokeWidth="4" strokeLinecap="round" />

          <path d="M 280 96 C 295 86, 300 91, 310 84" stroke="#FAF8F5" strokeWidth="6" strokeLinecap="round" />
          <path d="M 280 96 C 295 86, 300 91, 310 84" stroke="#E5DFD5" strokeWidth="4" strokeLinecap="round" />

          {/* --- MIDSOLE LAYER (CRISP WHITE/CREAM BAND) --- */}
          <path
            d="M 115 220 C 220 232, 350 232, 455 210 L 458 232 C 350 252, 220 252, 110 240 Z"
            fill="url(#midsoleWhiteGrad)"
            stroke="#CFC8BC"
            strokeWidth="1"
          />
          {/* Fine Midsole Texture Lines */}
          <path
            d="M 113 230 C 220 242, 350 242, 456 220"
            stroke="#D0C7B8"
            strokeWidth="1"
            strokeDasharray="2 2"
            fill="none"
          />

          {/* --- OUTSOLE LAYER (HONEY GUM RUBBER SOLE) --- */}
          <path
            d="M 110 240 C 220 252, 350 252, 458 232 L 452 248 C 345 268, 215 268, 105 252 Z"
            fill="url(#gumSoleGrad)"
            stroke="#8C521E"
            strokeWidth="1"
          />
          {/* Gum Sole Traction Grip Ridge Highlights */}
          <path
            d="M 110 248 C 220 260, 345 260, 450 240"
            stroke="#FFE0B2"
            strokeWidth="1.5"
            opacity="0.4"
            fill="none"
          />
        </g>
      </svg>

      {/* Gentle Luxury Glossy Shine Light Sweep Overlay */}
      {enableShine && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-25 animate-shine-sweep mix-blend-overlay" />
        </div>
      )}
    </div>
  );
};
