import React, { useState } from 'react';

export const ShoeLaceOverlay: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Trigger a realistic physical kick/bounce on click
  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 1200);
  };

  return (
    <div
      className="fixed top-0 right-3 sm:right-8 md:right-14 lg:right-20 z-30 pointer-events-none select-none origin-top transition-all duration-500 max-h-screen overflow-visible"
      aria-hidden="true"
    >
      <style>{`
        /* Realistic Multi-Axis Pendulum Physics with 3D Perspective Rotation */
        @keyframes realistic-hanging-swing {
          0% {
            transform: rotate(0deg) translateY(0px) rotateY(0deg) skewX(0deg);
          }
          15% {
            transform: rotate(3.2deg) translateY(3px) rotateY(5deg) skewX(0.6deg);
          }
          32% {
            transform: rotate(-1.2deg) translateY(-1px) rotateY(-3deg) skewX(-0.3deg);
          }
          50% {
            transform: rotate(-3.5deg) translateY(4px) rotateY(-6deg) skewX(-0.7deg);
          }
          68% {
            transform: rotate(2.0deg) translateY(-0.5px) rotateY(3deg) skewX(0.4deg);
          }
          85% {
            transform: rotate(-1.5deg) translateY(2px) rotateY(-2deg) skewX(-0.2deg);
          }
          100% {
            transform: rotate(0deg) translateY(0px) rotateY(0deg) skewX(0deg);
          }
        }

        /* Enhanced Interactive Hover Physics: Smooth Lift, Wider Momentum & Rim Glow */
        @keyframes realistic-hover-swing {
          0% {
            transform: rotate(0deg) scale(1.04) translateY(-4px) rotateY(0deg);
          }
          25% {
            transform: rotate(6.2deg) scale(1.04) translateY(5px) rotateY(10deg);
          }
          50% {
            transform: rotate(-5.8deg) scale(1.04) translateY(2px) rotateY(-8deg);
          }
          75% {
            transform: rotate(3.8deg) scale(1.04) translateY(4px) rotateY(5deg);
          }
          100% {
            transform: rotate(0deg) scale(1.04) translateY(-4px) rotateY(0deg);
          }
        }

        /* Click Kick/Bounce Physics Reaction */
        @keyframes realistic-kick-bounce {
          0% {
            transform: rotate(0deg) scale(1) translateY(0);
          }
          20% {
            transform: rotate(-12deg) scale(1.08) translateY(-12px) rotateY(-15deg);
          }
          40% {
            transform: rotate(9deg) scale(1.05) translateY(8px) rotateY(12deg);
          }
          60% {
            transform: rotate(-5deg) scale(1.02) translateY(-4px) rotateY(-6deg);
          }
          80% {
            transform: rotate(2deg) scale(1.01) translateY(2px) rotateY(3deg);
          }
          100% {
            transform: rotate(0deg) scale(1) translateY(0);
          }
        }

        /* Secondary Flexing Sway for Dangling Lace Ends & Gold Aglets */
        @keyframes realistic-lace-dangle {
          0%, 100% {
            transform: rotate(0deg) skewX(0deg);
          }
          25% {
            transform: rotate(5.5deg) skewX(1.2deg);
          }
          55% {
            transform: rotate(-4.8deg) skewX(-1.0deg);
          }
          80% {
            transform: rotate(2.5deg) skewX(0.5deg);
          }
        }

        .animate-realistic-swing {
          transform-origin: 120px 0px;
          animation: realistic-hanging-swing 9.5s cubic-bezier(0.42, 0, 0.58, 1) infinite;
          will-change: transform;
        }

        .animate-realistic-hover {
          transform-origin: 120px 0px;
          animation: realistic-hover-swing 4.2s cubic-bezier(0.42, 0, 0.58, 1) infinite;
          will-change: transform;
        }

        .animate-realistic-kick {
          transform-origin: 120px 0px;
          animation: realistic-kick-bounce 1.2s cubic-bezier(0.25, 1, 0.5, 1) 1;
          will-change: transform;
        }

        .animate-lace-dangle {
          transform-origin: 118px 240px;
          animation: realistic-lace-dangle 7s ease-in-out infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-realistic-swing, .animate-realistic-hover, .animate-realistic-kick, .animate-lace-dangle {
            animation: none !important;
          }
        }
      `}</style>

      {/* Interactive Container for Pointer Events */}
      <div
        className={`pointer-events-auto cursor-pointer transition-all duration-500 ease-out ${
          isClicked
            ? 'animate-realistic-kick filter drop-shadow-[0_24px_42px_rgba(11,143,99,0.5)]'
            : isHovered
            ? 'animate-realistic-hover filter drop-shadow-[0_22px_36px_rgba(11,143,99,0.38)] drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]'
            : 'animate-realistic-swing filter drop-shadow-[0_18px_30px_rgba(0,0,0,0.28)]'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        title="Marudhar Fashion Point - Ultra-Realistic High-Top Leather Sneaker (Click to Bounce)"
      >
        <svg
          width="240"
          height="540"
          viewBox="0 0 240 540"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[115px] sm:w-[155px] md:w-[195px] lg:w-[235px] xl:w-[255px] h-auto transition-transform duration-300"
        >
          <defs>
            {/* 1. Photorealistic Tumbled Leather Grain Overlay */}
            <pattern id="tumbledLeatherPattern" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 0 3 Q 3 0, 6 3 T 12 3 M 3 6 Q 6 3, 9 6 T 3 12 M 0 9 Q 6 12, 12 9" fill="none" stroke="#262626" strokeWidth="0.4" opacity="0.08" />
              <circle cx="2" cy="4" r="0.6" fill="#000" opacity="0.06" />
              <circle cx="8" cy="9" r="0.7" fill="#FFF" opacity="0.08" />
            </pattern>

            {/* 2. Micro Canvas & Suede Texture */}
            <pattern id="suedeTexturePattern" width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="#E5E5E5" />
              <path d="M0 3 L3 0 L6 3 L3 6 Z" fill="#D4D4D4" opacity="0.3" />
            </pattern>

            {/* 3. White Tumbled Leather Upper Gradient (3D Volumetric Lighting) */}
            <linearGradient id="whiteLeatherUpperGrad" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#FAFAFA" />
              <stop offset="70%" stopColor="#F0F0F0" />
              <stop offset="100%" stopColor="#D9D9D9" />
            </linearGradient>

            {/* 4. Deep Forest Green (#0B8F63) Brand Accent Leather Gradient */}
            <linearGradient id="forestGreenLeatherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="35%" stopColor="#0B8F63" />
              <stop offset="75%" stopColor="#076646" />
              <stop offset="100%" stopColor="#04422D" />
            </linearGradient>

            {/* 5. Light Grey Suede Panel Gradient */}
            <linearGradient id="lightGreySuedeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5F5F5" />
              <stop offset="50%" stopColor="#E5E5E5" />
              <stop offset="100%" stopColor="#CCCCCC" />
            </linearGradient>

            {/* 6. Dark Charcoal / Black Accent Gradient */}
            <linearGradient id="charcoalBlackAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#333333" />
              <stop offset="60%" stopColor="#1A1A1A" />
              <stop offset="100%" stopColor="#0A0A0A" />
            </linearGradient>

            {/* 7. Premium Textured Rubber Midsole Gradient */}
            <linearGradient id="rubberMidsole3DGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="20%" stopColor="#F8F8F8" />
              <stop offset="60%" stopColor="#E8E8E8" />
              <stop offset="85%" stopColor="#D4D4D4" />
              <stop offset="100%" stopColor="#B5B5B5" />
            </linearGradient>

            {/* 8. Metallic Gunmetal / Brass Eyelet Shader */}
            <linearGradient id="gunmetalEyeletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#9CA3AF" />
              <stop offset="70%" stopColor="#4B5563" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>

            {/* 9. Metallic Gold Aglet Shader */}
            <linearGradient id="goldAglet3DGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="35%" stopColor="#EAB308" />
              <stop offset="75%" stopColor="#CA8A04" />
              <stop offset="100%" stopColor="#713F12" />
            </linearGradient>

            {/* 10. Photorealistic Multi-Layer Studio Shadow & Soft Ambient Occlusion */}
            <filter id="photorealSneakerShadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="5" dy="16" stdDeviation="8" floodColor="#000000" floodOpacity="0.32" />
              <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#0B8F63" floodOpacity="0.22" />
            </filter>

            {/* 11. Top Mount Bracket Shadow */}
            <filter id="bracketShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.4" />
            </filter>

            {/* 12. Soft Contact Ambient Occlusion for Sole Layers */}
            <linearGradient id="soleAmbientOcclusion" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
            </linearGradient>
          </defs>

          <g filter="url(#photorealSneakerShadow)">

            {/* =========================================================
                1. BROWSER TOP EDGE MOUNTING BRACKET (Y=0 AT TOP SCREEN)
               ========================================================= */}
            <g filter="url(#bracketShadow)">
              {/* Chrome/Gunmetal Fixing Plate */}
              <rect x="108" y="0" width="24" height="10" rx="3" fill="url(#gunmetalEyeletGrad)" />
              <circle cx="120" cy="10" r="6" fill="none" stroke="url(#gunmetalEyeletGrad)" strokeWidth="3.5" />
              <circle cx="120" cy="10" r="2.5" fill="#0B8F63" />
            </g>

            {/* =========================================================
                2. LONG SUSPENSION COTTON SHOELACES (EXTENDING HALFWAY DOWN)
               ========================================================= */}
            {/* Left Suspension Strand */}
            <path
              d="M 116 12 Q 114 110, 106 240"
              stroke="#FFFFFF"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 116 12 Q 114 110, 106 240"
              stroke="#E5E5E5"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Woven Cotton Micro-Stitching Texture on Left Strand */}
            <path
              d="M 116 12 Q 114 110, 106 240"
              stroke="#0B8F63"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              fill="none"
              opacity="0.8"
            />

            {/* Right Suspension Strand */}
            <path
              d="M 124 12 Q 126 110, 134 240"
              stroke="#F5F5F5"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 124 12 Q 126 110, 134 240"
              stroke="#D4D4D4"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Woven Cotton Micro-Stitching Texture on Right Strand */}
            <path
              d="M 124 12 Q 126 110, 134 240"
              stroke="#0B8F63"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              fill="none"
              opacity="0.8"
            />

            {/* =========================================================
                3. REALISTIC TIED KNOT & BOW LOOPS AT INSTEP (MID-WAY DOWN)
               ========================================================= */}
            {/* Left Bow Loop */}
            <path
              d="M 120 240 C 82 208, 48 232, 72 260 C 90 280, 112 250, 120 240 Z"
              fill="url(#whiteLeatherUpperGrad)"
              stroke="#CCCCCC"
              strokeWidth="1"
            />
            <path
              d="M 82 228 C 68 238, 72 252, 90 260"
              stroke="#0B8F63"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              fill="none"
              opacity="0.75"
            />

            {/* Right Bow Loop */}
            <path
              d="M 120 240 C 158 208, 192 232, 168 260 C 150 280, 128 250, 120 240 Z"
              fill="url(#whiteLeatherUpperGrad)"
              stroke="#CCCCCC"
              strokeWidth="1"
            />
            <path
              d="M 158 228 C 172 238, 168 252, 150 260"
              stroke="#0B8F63"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              fill="none"
              opacity="0.75"
            />

            {/* Main Center Knot Wrap (Forest Green Leather & Cotton Cushion) */}
            <rect
              x="111"
              y="232"
              width="18"
              height="15"
              rx="6"
              fill="url(#forestGreenLeatherGrad)"
              transform="rotate(-5 120 240)"
            />
            <rect
              x="113"
              y="234"
              width="14"
              height="11"
              rx="4"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1"
              opacity="0.85"
              transform="rotate(-5 120 240)"
            />

            {/* =========================================================
                4. ULTRA-REALISTIC ORIGINAL HIGH-TOP BASKETBALL SNEAKER
               ========================================================= */}

            {/* A. Padded Ankle Collar Interior Opening (Deep Soft Padding) */}
            <ellipse
              cx="70"
              cy="295"
              rx="28"
              ry="15"
              fill="url(#charcoalBlackAccentGrad)"
              transform="rotate(-26 70 295)"
            />
            {/* Padded Collar Cushion Rim */}
            <path
              d="M 46 280 C 60 270, 88 285, 98 304"
              stroke="#0B8F63"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 48 281 C 61 272, 87 286, 96 303"
              stroke="#FFFFFF"
              strokeWidth="1"
              strokeDasharray="3 2"
              fill="none"
              opacity="0.8"
            />

            {/* B. High-Top Padded Leather Tongue */}
            <path
              d="M 78 280 Q 102 262, 118 242 L 130 250 Q 112 276, 94 296 Z"
              fill="url(#whiteLeatherUpperGrad)"
              stroke="#CCCCCC"
              strokeWidth="1.2"
            />
            <path
              d="M 78 280 Q 102 262, 118 242 L 130 250 Q 112 276, 94 296 Z"
              fill="url(#tumbledLeatherPattern)"
            />

            {/* Luxury Brand Tongue Label (Deep Forest Green Leather Tag) */}
            <rect
              x="104"
              y="252"
              width="16"
              height="24"
              rx="3.5"
              fill="url(#forestGreenLeatherGrad)"
              transform="rotate(30 112 264)"
            />
            {/* Gold Crest Monogram / Stitching on Label */}
            <rect
              x="106"
              y="254"
              width="12"
              height="20"
              rx="2"
              fill="none"
              stroke="#EAB308"
              strokeWidth="0.8"
              transform="rotate(30 112 264)"
            />
            <circle cx="112" cy="264" r="3.5" fill="#FFFFFF" transform="rotate(30 112 264)" />
            <path d="M 110 264 L 114 264 M 112 262 L 112 266" stroke="#0B8F63" strokeWidth="1.2" transform="rotate(30 112 264)" />

            {/* C. Main White Tumbled Leather Body Upper */}
            <path
              d="M 44 295 C 34 332, 30 372, 32 398 C 38 408, 46 415, 58 418 L 194 438 C 214 435, 226 420, 218 400 C 208 378, 190 350, 164 324 C 132 294, 96 276, 78 286 C 60 296, 50 284, 44 295 Z"
              fill="url(#whiteLeatherUpperGrad)"
              stroke="#B8B8B8"
              strokeWidth="1.2"
            />
            {/* Leather Texture Overlay */}
            <path
              d="M 44 295 C 34 332, 30 372, 32 398 C 38 408, 46 415, 58 418 L 194 438 C 214 435, 226 420, 218 400 C 208 378, 190 350, 164 324 C 132 294, 96 276, 78 286 C 60 296, 50 284, 44 295 Z"
              fill="url(#tumbledLeatherPattern)"
            />

            {/* D. Light Grey Suede Toe Cap & Fender Overlay */}
            <path
              d="M 166 326 C 188 348, 208 376, 218 400 C 212 418, 192 428, 168 424 C 152 408, 154 366, 166 326 Z"
              fill="url(#lightGreySuedeGrad)"
              stroke="#A3A3A3"
              strokeWidth="1"
            />
            <path
              d="M 166 326 C 188 348, 208 376, 218 400 C 212 418, 192 428, 168 424 C 152 408, 154 366, 166 326 Z"
              fill="url(#suedeTexturePattern)"
              opacity="0.4"
            />
            {/* Toe Box Breathable Ventilation Perforations */}
            <g fill="#737373" opacity="0.65">
              <circle cx="188" cy="385" r="1" />
              <circle cx="193" cy="388" r="1" />
              <circle cx="198" cy="392" r="1" />
              <circle cx="184" cy="391" r="1" />
              <circle cx="189" cy="395" r="1" />
              <circle cx="194" cy="399" r="1" />
              <circle cx="180" cy="397" r="1" />
              <circle cx="185" cy="401" r="1" />
              <circle cx="190" cy="405" r="1" />
            </g>

            {/* E. Heel Counter Leather Overlay & Pull Loop */}
            <path
              d="M 32 398 C 30 362, 36 328, 46 304 C 54 322, 58 358, 54 402 Z"
              fill="url(#charcoalBlackAccentGrad)"
              stroke="#171717"
              strokeWidth="1"
            />
            {/* Forest Green Heel Pull Tab */}
            <path
              d="M 36 316 C 30 310, 26 324, 32 336 L 40 332 C 36 323, 40 320, 42 320 Z"
              fill="url(#forestGreenLeatherGrad)"
            />

            {/* F. Original Signature Marudhar Curved Racing Swoop (Forest Green Leather) */}
            <path
              d="M 50 372 C 76 344, 114 336, 164 366 C 142 386, 92 390, 50 395 Z"
              fill="url(#forestGreenLeatherGrad)"
              stroke="#04422D"
              strokeWidth="1"
            />
            {/* White Contrast Edge Stitching along Racing Swoop */}
            <path
              d="M 58 365 C 80 342, 116 335, 158 358"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeDasharray="3 2"
              fill="none"
              opacity="0.9"
            />

            {/* G. Precision Double Stitching Lines Across Leather Panels */}
            <path
              d="M 48 308 C 40 338, 36 368, 38 394"
              stroke="#0B8F63"
              strokeWidth="1.2"
              strokeDasharray="3 2"
              fill="none"
              opacity="0.85"
            />
            <path
              d="M 80 294 C 100 316, 136 340, 168 356"
              stroke="#A3A3A3"
              strokeWidth="1"
              strokeDasharray="3 2"
              fill="none"
            />
            <path
              d="M 84 298 C 104 320, 140 344, 172 360"
              stroke="#FFFFFF"
              strokeWidth="0.9"
              strokeDasharray="3 2"
              fill="none"
              opacity="0.8"
            />

            {/* H. Metallic Gunmetal Eyelets along Instep Stay */}
            {/* Eyelet 1 */}
            <circle cx="110" cy="278" r="5.5" fill="url(#gunmetalEyeletGrad)" />
            <circle cx="110" cy="278" r="2.8" fill="#0F0F0F" />

            {/* Eyelet 2 */}
            <circle cx="126" cy="296" r="5.5" fill="url(#gunmetalEyeletGrad)" />
            <circle cx="126" cy="296" r="2.8" fill="#0F0F0F" />

            {/* Eyelet 3 */}
            <circle cx="142" cy="316" r="5.5" fill="url(#gunmetalEyeletGrad)" />
            <circle cx="142" cy="316" r="2.8" fill="#0F0F0F" />

            {/* Eyelet 4 */}
            <circle cx="158" cy="338" r="5.5" fill="url(#gunmetalEyeletGrad)" />
            <circle cx="158" cy="338" r="2.8" fill="#0F0F0F" />

            {/* Criss-Cross Lacing Detail through Metallic Eyelets */}
            <path
              d="M 120 240 L 110 278 L 126 296 L 142 316 L 158 338"
              stroke="#FFFFFF"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 120 240 L 126 296 M 110 278 L 142 316 M 126 296 L 158 338"
              stroke="#F5F5F5"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* I. Ultra-Realistic Sculpted Rubber Midsole & Outsole Wall */}
            <path
              d="M 32 398 C 34 412, 46 422, 56 424 L 188 444 C 208 440, 220 428, 218 412 L 217 422 C 214 436, 200 448, 176 448 L 50 430 C 38 428, 30 416, 32 398 Z"
              fill="url(#rubberMidsole3DGrad)"
              stroke="#A3A3A3"
              strokeWidth="1.2"
            />

            {/* Micro-Textured Stitched Midsole Perimeter */}
            <path
              d="M 34 404 C 54 410, 124 424, 210 420"
              stroke="#737373"
              strokeWidth="1.2"
              strokeDasharray="2.5 2"
              fill="none"
              opacity="0.8"
            />

            {/* Deep Forest Green Midsole Accent Stripe (#0B8F63) */}
            <path
              d="M 34 408 C 56 414, 126 427, 210 424"
              stroke="#0B8F63"
              strokeWidth="3.2"
              fill="none"
            />

            {/* Translucent Outsole Rubber Tread Base (Herringbone Sole Grooves) */}
            <path
              d="M 34 420 Q 102 436, 198 444"
              stroke="#171717"
              strokeWidth="3"
              strokeDasharray="6 3"
              fill="none"
            />

            {/* Ambient Occlusion Base Overlay on Midsole */}
            <path
              d="M 32 398 C 34 412, 46 422, 56 424 L 188 444 C 208 440, 220 428, 218 412 Z"
              fill="url(#soleAmbientOcclusion)"
            />

            {/* =========================================================
                5. CASCADING LOOSE LACE STRANDS WITH METALLIC GOLD AGLETS
               ========================================================= */}
            <g className="animate-lace-dangle">
              {/* Primary Loose Hanging Strand */}
              <path
                d="M 118 242 C 96 278, 130 328, 100 378 C 84 406, 106 442, 96 484"
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 118 242 C 96 278, 130 328, 100 378 C 84 406, 106 442, 96 484"
                stroke="#0B8F63"
                strokeWidth="1.2"
                strokeDasharray="2 2"
                fill="none"
                opacity="0.85"
              />

              {/* Metallic Gold Aglet Tip #1 */}
              <path d="M 96 484 L 93 506" stroke="url(#goldAglet3DGrad)" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="94" y1="490" x2="96" y2="490" stroke="#713F12" strokeWidth="1" />
              <line x1="93.5" y1="498" x2="95.5" y2="498" stroke="#713F12" strokeWidth="1" />

              {/* Secondary Loose Hanging Strand */}
              <path
                d="M 122 242 C 144 284, 106 342, 136 392 C 146 414, 140 442, 136 468"
                stroke="#F5F5F5"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Metallic Gold Aglet Tip #2 */}
              <path d="M 136 468 L 134 488" stroke="url(#goldAglet3DGrad)" strokeWidth="4" strokeLinecap="round" />
              <line x1="134.5" y1="473" x2="136.5" y2="473" stroke="#713F12" strokeWidth="1" />
            </g>

          </g>
        </svg>

        {/* Floating Tooltip Pill on Hover */}
        {isHovered && (
          <div className="absolute top-[280px] -left-28 sm:-left-36 bg-neutral-900/90 text-white backdrop-blur-md text-[11px] font-bold px-3 py-1.5 rounded-full border border-emerald-500/30 shadow-xl pointer-events-none animate-fade-in flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[#0B8F63] animate-ping" />
            <span>Marudhar Heritage High-Top (Click to Kick)</span>
          </div>
        )}
      </div>
    </div>
  );
};
