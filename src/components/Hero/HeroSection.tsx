import React from 'react';
import { MessageCircle, Phone, ArrowRight, ShieldCheck, Sparkles, Star, Award, Footprints } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { generateGeneralInquiryWhatsAppLink } from '../../utils/whatsapp';

interface HeroSectionProps {
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  const { heroContent, storeInfo } = useStore();

  return (
    <section id="hero" className="relative pt-6 sm:pt-10 pb-12 sm:pb-20 overflow-hidden bg-gradient-to-b from-[#F7F7F7] via-white to-[#F7F7F7]">
      {/* Background Subtle Parallax Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#0B8F63]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-[#0B8F63]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text & CTA Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-neutral-200 shadow-sm text-xs font-semibold text-neutral-800 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <span className="w-2 h-2 rounded-full bg-[#0B8F63] animate-ping" />
              <Sparkles className="w-3.5 h-3.5 text-[#0B8F63]" />
              <span>{heroContent.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl text-neutral-900 tracking-tight leading-[1.1]">
              {heroContent.headlineMain}{' '}
              <span className="text-[#0B8F63] relative inline-block">
                {heroContent.headlineHighlight}
                <span className="absolute bottom-1 left-0 right-0 h-2 bg-[#0B8F63]/15 -z-10 rounded-full"></span>
              </span>
            </h1>

            {/* Sub Heading */}
            <p className="text-base sm:text-lg lg:text-xl text-neutral-600 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {heroContent.subtitle}
            </p>

            {/* CTA Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
              {/* 1. Explore Collection */}
              <button
                onClick={onExploreClick}
                className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 text-sm"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* 2. Shop on WhatsApp */}
              <a
                href={generateGeneralInquiryWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-[#0B8F63]/25 hover:scale-105 active:scale-95 transition-all duration-300 text-sm"
              >
                <MessageCircle className="w-5 h-5 fill-white text-[#0B8F63]" />
                <span>Shop on WhatsApp</span>
              </a>

              {/* 3. Call Now */}
              <a
                href={`tel:${storeInfo.phone}`}
                className="flex items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold px-5 py-3.5 rounded-2xl border border-neutral-200 shadow-sm hover:border-neutral-300 transition-all text-sm"
              >
                <Phone className="w-4 h-4 text-[#0B8F63]" />
                <span>Call Store</span>
              </a>
            </div>

            {/* Key Value Proposition Badges */}
            <div className="pt-6 border-t border-neutral-200/60 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0B8F63]/10 flex items-center justify-center text-[#0B8F63]">
                  <Star className="w-4 h-4 fill-[#0B8F63]" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-neutral-900">{heroContent.stat1Number}</div>
                  <div className="text-[11px] text-neutral-500">{heroContent.stat1Label}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0B8F63]/10 flex items-center justify-center text-[#0B8F63]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-neutral-900">{heroContent.stat2Number}</div>
                  <div className="text-[11px] text-neutral-500">{heroContent.stat2Label}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0B8F63]/10 flex items-center justify-center text-[#0B8F63]">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-neutral-900">{heroContent.stat3Number}</div>
                  <div className="text-[11px] text-neutral-500">{heroContent.stat3Label}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Product Spotlight & Floating Animation Showcase */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Outer Glow frame */}
            <div className="relative w-full max-w-md lg:max-w-none aspect-[4/3] sm:aspect-[1/1] rounded-3xl overflow-hidden shadow-2xl border border-white/60 group">
              <img
                src={heroContent.heroImage}
                alt="Marudhar Fashion Point Footwear Showcase"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Banner Overlay Info */}
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] font-bold tracking-widest uppercase bg-[#0B8F63] text-white px-2.5 py-1 rounded-full">
                  Flagship Spotlight
                </span>
                <h3 className="font-serif-heading text-xl font-bold">{storeInfo.name} Collection</h3>
                <p className="text-xs text-white/80">{storeInfo.tagline}</p>
              </div>
            </div>

            {/* Floating Shoe Feature Card (Animated Floating Micro Card) */}
            <div className="absolute -top-6 -right-2 sm:-right-6 glass-panel rounded-2xl p-3.5 shadow-xl border border-white/80 max-w-[200px] animate-float hidden sm:flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80"
                  alt="AirGlide Sneaker"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-900 line-clamp-1">AirGlide Runner</div>
                <div className="text-[11px] text-[#0B8F63] font-bold">₹1,499 <span className="line-through text-neutral-400 text-[9px]">₹2,999</span></div>
                <div className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5">★ 4.9 (128)</div>
              </div>
            </div>

            {/* Floating Trust Pill */}
            <div className="absolute -bottom-5 -left-2 sm:-left-6 glass-panel rounded-2xl p-3 shadow-lg border border-white/80 flex items-center gap-3 animate-float [animation-delay:2s]">
              <div className="w-9 h-9 rounded-full bg-[#0B8F63] text-white flex items-center justify-center shrink-0">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-900">Viju Bhai Guarantee</div>
                <div className="text-[10px] text-neutral-500">100% Size & Fit Assured</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
