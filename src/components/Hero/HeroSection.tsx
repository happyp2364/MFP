import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, ArrowRight, ShieldCheck, Sparkles, Star, Award, Footprints, ChevronDown, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { generateGeneralInquiryWhatsAppLink } from '../../utils/whatsapp';

interface HeroSectionProps {
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  const { heroContent, storeInfo } = useStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Parallax mouse offsets
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [gyroPos, setGyroPos] = useState({ x: 0, y: 0 });
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Fallbacks & Destructuring
  const {
    badge = 'Marudhar New Season Collection 2026',
    headlineMain = 'Walk in Style.',
    headlineHighlight = 'Royal Comfort & Authentic Fashion.',
    subtitle = 'Discover Marudhar Fashion Point\'s exclusive lineup of high-grade athletic sneakers, royal leather loafers, women\'s sports shoes, and durable school footwear.',
    heroImage = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
    stat1Number = '15,000+',
    stat1Label = 'Happy Families Served',
    stat2Number = '100%',
    stat2Label = 'Fit & Size Guarantee',
    stat3Number = '4.9★',
    stat3Label: stat3LabelVal = 'Google Customer Rating',

    bgType = 'gradient',
    heroVideoUrl = '',
    gradientTheme = 'deep_emerald',

    primaryBtnText = 'Explore Collection',
    primaryBtnLink = '#categories',
    whatsappBtnText = 'Shop on WhatsApp',
    whatsappBtnLink = '',
    buyNowBtnText = 'Buy Now',
    buyNowBtnLink = '#products',

    floatingShoes = [
      {
        id: 'shoe-1',
        name: 'AirGlide Red Runner',
        imageUri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
        speedSec: 7.0,
        rotationDeg: 12,
        initialX: '82%',
        initialY: '18%',
        scale: 0.9,
      },
      {
        id: 'shoe-2',
        name: 'Royal Heritage Loafer',
        imageUri: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80',
        speedSec: 8.5,
        rotationDeg: -14,
        initialX: '8%',
        initialY: '62%',
        scale: 0.85,
      },
    ],

    particleDensity = 'medium',
    enableLightRays = true,
    parallaxStrength = 'medium',
  } = heroContent || {};

  // Compute Parallax Scale Factor
  const parallaxMultiplier = parallaxStrength === 'disabled' ? 0 : parallaxStrength === 'subtle' ? 10 : parallaxStrength === 'strong' ? 30 : 20;

  // 1. Mouse movement parallax handler
  useEffect(() => {
    if (parallaxStrength === 'disabled') return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [parallaxStrength]);

  // 2. Gyroscope orientation handler for mobile parallax
  useEffect(() => {
    if (parallaxStrength === 'disabled') return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const x = Math.min(Math.max(e.gamma / 45, -1), 1);
        const y = Math.min(Math.max((e.beta - 45) / 45, -1), 1);
        setGyroPos({ x, y });
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [parallaxStrength]);

  // Combined Parallax Offsets
  const activeX = mousePos.x || gyroPos.x;
  const activeY = mousePos.y || gyroPos.y;

  // 3. Floating Light Particles Canvas Animation
  useEffect(() => {
    if (particleDensity === 'off' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = particleDensity === 'low' ? 20 : particleDensity === 'high' ? 60 : 35;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.8,
      color: Math.random() > 0.4 ? 'rgba(212, 175, 55, ' : 'rgba(255, 255, 255, ',
      alpha: Math.random() * 0.6 + 0.2,
      speedY: Math.random() * 0.4 + 0.15,
      speedX: (Math.random() - 0.5) * 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.005;

        // Reset if off-screen
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0, Math.min(1, p.alpha))})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleDensity]);

  const handleSmoothScroll = (targetId: string) => {
    if (targetId === '#categories' || targetId === 'categories') {
      onExploreClick();
      return;
    }

    const cleanId = targetId.startsWith('#') ? targetId.slice(1) : targetId;
    const element = document.getElementById(cleanId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      onExploreClick();
    }
  };

  // Theme styling gradients
  const themeGradientClass =
    gradientTheme === 'warm_noir'
      ? 'from-[#121816] via-[#1A2320] to-[#0D1311] text-white'
      : gradientTheme === 'royal_gold'
      ? 'from-[#1A221E] via-[#2A3B33] to-[#121816] text-white'
      : gradientTheme === 'midnight_luxury'
      ? 'from-[#0B131E] via-[#121E2F] to-[#0A0F18] text-white'
      : 'from-[#073827] via-[#0B8F63] to-[#05291C] text-white';

  return (
    <section
      id="hero"
      className={`relative min-h-[92vh] sm:min-h-screen pt-12 sm:pt-20 pb-16 sm:pb-24 overflow-hidden flex flex-col justify-between transition-all duration-700 ${
        bgType === 'gradient' ? `bg-gradient-to-br ${themeGradientClass}` : 'bg-neutral-950 text-white'
      }`}
    >
      {/* ---------------- 1. BACKGROUND LAYERS ---------------- */}

      {/* A. Background Video Mode */}
      {bgType === 'video' && heroVideoUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            src={heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            onLoadedData={() => setVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[1px]" />
        </div>
      )}

      {/* B. Background Image Mode */}
      {bgType === 'image' && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={heroImage}
            alt="Marudhar Luxury Footwear"
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
            style={{
              transform: `translate3d(${activeX * (parallaxMultiplier * 0.3)}px, ${activeY * (parallaxMultiplier * 0.3)}px, 0)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/30" />
        </div>
      )}

      {/* C. Ambient Moving Glows */}
      <div
        className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-40 transition-transform duration-300"
        style={{
          background: 'radial-gradient(circle, rgba(11,143,99,0.5) 0%, rgba(212,175,55,0.2) 60%, transparent 100%)',
          transform: `translate3d(${-activeX * parallaxMultiplier}px, ${-activeY * parallaxMultiplier}px, 0)`,
        }}
      />
      <div
        className="absolute bottom-10 right-0 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-30 transition-transform duration-300"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, rgba(11,143,99,0.3) 60%, transparent 100%)',
          transform: `translate3d(${activeX * parallaxMultiplier}px, ${activeY * parallaxMultiplier}px, 0)`,
        }}
      />

      {/* D. Soft Sunlight Rays / Light Beams */}
      {enableLightRays && (
        <div
          className="absolute -top-32 -right-32 w-[700px] h-[700px] pointer-events-none opacity-25 mix-blend-screen animate-pulse duration-10000"
          style={{
            background: 'conic-gradient(from 180deg at 80% 20%, rgba(255,235,180,0.4) 0deg, transparent 40deg, rgba(255,255,255,0.2) 80deg, transparent 120deg)',
          }}
        />
      )}

      {/* E. Floating Light Particle Canvas */}
      {particleDensity !== 'off' && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10 w-full h-full" />
      )}

      {/* ---------------- 2. MAIN HERO CONTENT CONTAINER ---------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full my-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column: Text Content & Actions */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-center lg:text-left">

            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-xs font-bold text-amber-300 tracking-wide uppercase animate-in fade-in slide-in-from-bottom-3 duration-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{badge}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            </div>

            {/* Headline with Staggered Reveal */}
            <div className="space-y-2">
              <h1 className="font-serif-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.08] drop-shadow-md">
                <span className="block opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards">
                  {headlineMain}
                </span>
                {headlineHighlight && (
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-emerald-200 to-amber-300 opacity-0 animate-in fade-in slide-in-from-bottom-5 duration-700 [animation-delay:200ms] fill-mode-forwards font-serif-heading">
                    {headlineHighlight}
                  </span>
                )}
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-base sm:text-lg lg:text-xl text-white/85 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed drop-shadow-sm opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:400ms] fill-mode-forwards">
              {subtitle}
            </p>

            {/* CTA Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:600ms] fill-mode-forwards">
              
              {/* 1. Explore Collection */}
              <button
                onClick={() => handleSmoothScroll(primaryBtnLink)}
                className="group relative flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-neutral-950 font-extrabold px-7 py-4 rounded-2xl shadow-xl shadow-amber-900/30 hover:shadow-amber-500/40 hover:-translate-y-1 active:translate-y-0.5 transition-all duration-300 text-sm cursor-pointer overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>{primaryBtnText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

              {/* 2. Shop on WhatsApp */}
              <a
                href={whatsappBtnLink || generateGeneralInquiryWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-4 rounded-2xl border border-emerald-400/40 shadow-lg shadow-emerald-900/40 hover:shadow-emerald-500/30 hover:-translate-y-1 active:translate-y-0.5 transition-all duration-300 text-sm"
              >
                <MessageCircle className="w-5 h-5 fill-white text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>{whatsappBtnText}</span>
              </a>

              {/* 3. Buy Now */}
              <button
                onClick={() => handleSmoothScroll(buyNowBtnLink)}
                className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold px-5 py-4 rounded-2xl border border-white/20 hover:border-white/40 shadow-sm hover:-translate-y-1 active:translate-y-0.5 transition-all text-sm cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                <span>{buyNowBtnText}</span>
              </button>

            </div>

            {/* Key Value Proposition Stats */}
            <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left opacity-0 animate-in fade-in duration-700 [animation-delay:800ms] fill-mode-forwards">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shrink-0">
                  <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white">{stat1Number}</div>
                  <div className="text-[11px] text-white/70">{stat1Label}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white">{stat2Number}</div>
                  <div className="text-[11px] text-white/70">{stat2Label}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shrink-0">
                  <Award className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white">{stat3Number}</div>
                  <div className="text-[11px] text-white/70">{stat3LabelVal}</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Parallax Showcase & Floating Decorative Sneakers */}
          <div className="lg:col-span-5 relative flex justify-center items-center min-h-[380px] sm:min-h-[440px]">
            
            {/* Central Spotlight Showcase Container */}
            <div
              className="relative w-full max-w-md aspect-[4/3] sm:aspect-[1/1] rounded-3xl overflow-hidden shadow-2xl border border-white/30 group transition-transform duration-200 ease-out"
              style={{
                transform: `translate3d(${activeX * (parallaxMultiplier * 0.6)}px, ${activeY * (parallaxMultiplier * 0.6)}px, 0)`,
              }}
            >
              <img
                src={heroImage}
                alt="Marudhar Fashion Point Footwear Showcase"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Banner Overlay Info */}
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5 z-10">
                <span className="text-[10px] font-extrabold tracking-widest uppercase bg-amber-400 text-neutral-950 px-3 py-1 rounded-full shadow-md">
                  👑 Flagship Collection
                </span>
                <h3 className="font-serif-heading text-xl font-bold">{storeInfo.name}</h3>
                <p className="text-xs text-white/80 line-clamp-1">{storeInfo.tagline}</p>
              </div>
            </div>

            {/* ---------------- 3. FLOATING DECORATIVE SNEAKERS ---------------- */}
            {floatingShoes && floatingShoes.map((shoe, idx) => {
              if (!shoe.imageUri) return null;

              const delay = idx * 1.5;
              const speed = shoe.speedSec || 7.0;

              return (
                <div
                  key={shoe.id || idx}
                  className="absolute pointer-events-none hidden sm:block z-30 transition-transform duration-300 ease-out"
                  style={{
                    left: shoe.initialX || (idx === 0 ? '80%' : '5%'),
                    top: shoe.initialY || (idx === 0 ? '15%' : '60%'),
                    transform: `translate3d(${activeX * (parallaxMultiplier * (1 + idx * 0.4))}px, ${
                      activeY * (parallaxMultiplier * (1 + idx * 0.4))
                    }px, 0) scale(${shoe.scale || 0.9}) rotate(${shoe.rotationDeg || 0}deg)`,
                  }}
                >
                  <div
                    className="relative animate-float"
                    style={{
                      animationDuration: `${speed}s`,
                      animationDelay: `${delay}s`,
                    }}
                  >
                    {/* Realistic Drop Shadow */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/40 rounded-full blur-md" />

                    <img
                      src={shoe.imageUri}
                      alt={shoe.name || 'Floating Footwear'}
                      className="w-36 h-36 md:w-44 md:h-44 object-contain filter drop-shadow-2xl hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />

                    {/* Subtle Name Tag Pill */}
                    {shoe.name && (
                      <div className="mt-1 bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full text-center shadow-lg whitespace-nowrap">
                        {shoe.name}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Bottom Left Trust Pill */}
            <div
              className="absolute -bottom-4 left-0 sm:-left-6 glass-panel rounded-2xl p-3 shadow-2xl border border-white/30 flex items-center gap-3 animate-float [animation-delay:2s] z-30 bg-neutral-900/80 text-white backdrop-blur-xl"
              style={{
                transform: `translate3d(${activeX * (parallaxMultiplier * 0.4)}px, ${activeY * (parallaxMultiplier * 0.4)}px, 0)`,
              }}
            >
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center shrink-0 font-bold">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Viju Bhai Guarantee</div>
                <div className="text-[10px] text-emerald-300 font-medium">100% Fit & Size Assured</div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ---------------- 4. ANIMATED SCROLL DOWN INDICATOR ---------------- */}
      <div className="relative z-20 pt-4 pb-2 text-center flex flex-col items-center justify-center">
        <button
          onClick={() => handleSmoothScroll('#categories')}
          className="group inline-flex flex-col items-center gap-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/40 group-hover:border-amber-300 flex justify-center p-1.5 transition-colors">
            <div className="w-1.5 h-2.5 rounded-full bg-amber-400 animate-bounce" />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-amber-200/90 group-hover:text-amber-300">
            <span>Scroll Down</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
          </div>
        </button>
      </div>

    </section>
  );
};
