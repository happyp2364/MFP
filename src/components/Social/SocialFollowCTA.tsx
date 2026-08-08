import React from 'react';
import { Sparkles, BellRing, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SocialIconRenderer } from './SocialIconRenderer';

export const SocialFollowCTA: React.FC = () => {
  const { socialMediaConfig, recordSocialClick } = useStore();

  const enabledPlatforms = (socialMediaConfig?.platforms || [])
    .filter((p: any) => p.enabled)
    .sort((a: any, b: any) => a.displayOrder - b.displayOrder);

  return (
    <section className="py-16 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white relative overflow-hidden border-t border-b border-white/10">
      {/* Background Decorative Ripples */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#0B8F63]/10 via-rose-500/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300 mb-6 shadow-lg animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>JOIN OUR EXCLUSIVE COMMUNITY</span>
        </div>

        {/* Heading & Subheading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif-heading tracking-tight text-white mb-4">
          Stay Connected With Us
        </h2>
        <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Follow us for the latest fashion collections, premium footwear, offers, and exclusive updates.
        </p>

        {/* Animated Social Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {enabledPlatforms.length > 0 ? (
            enabledPlatforms.map((plat: any) => {
              const getHoverStyle = (effect: string) => {
                switch (effect) {
                  case 'glow': return 'hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]';
                  case 'bounce': return 'hover:-translate-y-1';
                  case 'fade': return 'hover:opacity-85';
                  case 'rotate': return 'hover:rotate-3';
                  default: return 'hover:scale-[1.03]';
                }
              };

              return (
                <a
                  key={plat.id}
                  href={plat.profileUrl}
                  onClick={() => recordSocialClick(plat.id)}
                  target={plat.openInNewTab ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className={`group relative p-5 rounded-2xl text-white font-bold shadow-xl transition-all duration-300 flex items-center justify-between overflow-hidden border border-white/10 ${getHoverStyle(plat.hoverEffect)}`}
                  style={{ backgroundColor: plat.bgColor || '#171717' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform">
                      <SocialIconRenderer 
                        iconNameOrUrl={plat.customIcon} 
                        platformId={plat.id} 
                        className="w-5 h-5" 
                        style={{ color: plat.iconColor || '#fff' }}
                      />
                    </div>
                    <div className="text-left">
                      <span className="block text-xs uppercase tracking-wider text-neutral-300 font-semibold">
                        {plat.name}
                      </span>
                      <span className="block text-sm font-black tracking-tight truncate max-w-[150px]">
                        {plat.username ? `@${plat.username}` : (plat.customButtonText || 'Connect')}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" />
                </a>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-neutral-400">
              No social platforms configured.
            </div>
          )}
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
