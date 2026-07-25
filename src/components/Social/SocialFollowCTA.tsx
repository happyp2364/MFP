import React from 'react';
import { Instagram, Facebook, Youtube, Sparkles, Heart, BellRing, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const SocialFollowCTA: React.FC = () => {
  const { storeInfo } = useStore();

  return (
    <section className="py-16 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white relative overflow-hidden border-t border-b border-white/10">
      {/* Background Decorative Ripples */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#0B8F63]/10 via-rose-500/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300 mb-6 shadow-lg animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>JOIN OUR MARUDHAR FASHION FAMILY</span>
        </div>

        {/* Heading & Subheading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif-heading tracking-tight text-white mb-4">
          Stay Connected With Marudhar Fashion Point
        </h2>
        <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Follow us for the latest fashion collections, premium footwear, offers, and exclusive updates.
        </p>

        {/* Animated Social Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
          
          {/* Instagram Button */}
          <a
            href={storeInfo.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-5 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-bold shadow-xl hover:shadow-2xl hover:shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-between overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider text-rose-100 font-semibold">Instagram</span>
                <span className="block text-sm font-black tracking-tight">@marudhar_fashion_point</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Facebook Button */}
          <a
            href={storeInfo.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-5 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-700 text-white font-bold shadow-xl hover:shadow-2xl hover:shadow-blue-600/25 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-between overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                <Facebook className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider text-blue-100 font-semibold">Facebook</span>
                <span className="block text-sm font-black tracking-tight">Marudhar Fashion Point</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* YouTube Button */}
          <a
            href={storeInfo.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-5 rounded-2xl bg-gradient-to-tr from-red-700 via-red-600 to-rose-700 text-white font-bold shadow-xl hover:shadow-2xl hover:shadow-red-600/25 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-between overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider text-red-100 font-semibold">YouTube</span>
                <span className="block text-sm font-black tracking-tight">Watch Collections</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
          </a>

        </div>

        {/* Bottom Assurance Note */}
        <p className="mt-8 text-xs text-neutral-400 flex items-center justify-center gap-2">
          <BellRing className="w-4 h-4 text-[#0B8F63]" />
          <span>Get instant alerts on festive discount drops and new arrivals in Pipar City.</span>
        </p>

      </div>
    </section>
  );
};
