import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, Phone, ArrowUp, X, Share2, Calendar, Volume2, VolumeX, Instagram
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { generateGeneralInquiryWhatsAppLink } from '../../utils/whatsapp';
import { SocialIconRenderer } from '../Social/SocialIconRenderer';

interface FloatingActionHubProps {
  onOpenCalendarModal?: () => void;
  onOpenSoundSettings?: () => void;
}

export const FloatingActionHub: React.FC<FloatingActionHubProps> = ({
  onOpenCalendarModal,
  onOpenSoundSettings,
}) => {
  const { storeInfo, customerSoundSettings, socialMediaConfig, recordSocialClick } = useStore();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [expandedSocials, setExpandedSocials] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Extract other active floating platforms except WhatsApp (which is treated as a primary floating button below)
  const floatingPlatforms = (socialMediaConfig?.platforms || [])
    .filter(p => p.enabled && p.showAsFloating && p.id !== 'whatsapp')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Predefined custom WhatsApp details
  const waMessage = socialMediaConfig?.whatsappPredefinedMessage || '';
  const waSupportName = socialMediaConfig?.whatsappSupportName || 'MFP Support';
  const waSupportRole = socialMediaConfig?.whatsappSupportRole || 'Live Agent';
  const waSupportAvatar = socialMediaConfig?.whatsappSupportAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=64&q=80';
  const waUrl = generateGeneralInquiryWhatsAppLink(waMessage);

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      
      {/* Social Links Sub-Menu (Glassmorphism Circular Buttons with Tooltips) */}
      {expandedSocials && (
        <div className="flex flex-col items-end gap-3 mb-1 pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300">
          {floatingPlatforms.length > 0 ? (
            floatingPlatforms.map((plat) => {
              const getHoverStyle = (effect: string) => {
                switch (effect) {
                  case 'glow': return 'hover:shadow-[0_0_15px_rgba(255,255,255,0.7)]';
                  case 'bounce': return 'hover:-translate-y-1';
                  case 'fade': return 'hover:opacity-75';
                  case 'rotate': return 'hover:rotate-12';
                  default: return 'hover:scale-110';
                }
              };

              return (
                <div key={plat.id} className="group relative flex items-center gap-2">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap backdrop-blur-md">
                    {plat.customLabel || `${plat.name} - @${plat.username}`}
                  </span>
                  <a
                    href={plat.profileUrl}
                    onClick={() => recordSocialClick(plat.id)}
                    target={plat.openInNewTab ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className={`w-11 h-11 rounded-full text-white flex items-center justify-center shadow-xl hover:scale-115 active:scale-95 transition-all duration-300 backdrop-blur-md border border-white/20 ${getHoverStyle(plat.hoverEffect)}`}
                    style={{ backgroundColor: plat.bgColor || 'rgba(255,255,255,0.1)' }}
                    title={plat.name}
                  >
                    <span style={{ color: plat.iconColor || '#fff' }}>
                      <SocialIconRenderer 
                        iconNameOrUrl={plat.customIcon} 
                        platformId={plat.id} 
                        className="w-5 h-5" 
                      />
                    </span>
                  </a>
                </div>
              );
            })
          ) : (
            <>
              {/* Fallback legacy links if none configured */}
              <div className="group relative flex items-center gap-2">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap backdrop-blur-md">
                  Instagram @marudhar_fashion_point
                </span>
                <a
                  href={storeInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-rose-500/20 hover:scale-115 active:scale-95 transition-all duration-300 backdrop-blur-md border border-white/20"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </>
          )}
        </div>
      )}

      {/* Main Floating Action Cluster */}
      <div className="flex flex-col items-end gap-3 pointer-events-auto">
        
        {/* Toggle Social Media links button */}
        <div className="group relative flex items-center gap-2">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap backdrop-blur-md">
            {expandedSocials ? 'Close Socials' : 'Social Channels'}
          </span>
          <button
            onClick={() => setExpandedSocials(!expandedSocials)}
            className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md text-neutral-800 border border-neutral-200/80 shadow-xl flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-300 active:scale-95"
            title="Social Media Links"
          >
            {expandedSocials ? (
              <X className="w-5 h-5 text-rose-500" />
            ) : (
              <Share2 className="w-5 h-5 text-[#0B8F63]" />
            )}
          </button>
        </div>

        {/* Sound Settings Control Button */}
        {onOpenSoundSettings && (
          <div className="group relative flex items-center gap-2">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap backdrop-blur-md">
              {customerSoundSettings?.muted ? 'Muted (Tap for Sound Settings)' : `Sound Volume: ${customerSoundSettings?.volume ?? 80}%`}
            </span>
            <button
              onClick={onOpenSoundSettings}
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 backdrop-blur-md border border-neutral-200/80 active:scale-95 ${
                customerSoundSettings?.muted
                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200'
                  : 'bg-white/90 text-emerald-700 hover:bg-emerald-50 border-emerald-200'
              }`}
              title="Sound Settings"
            >
              {customerSoundSettings?.muted ? (
                <VolumeX className="w-5 h-5 text-rose-500" />
              ) : (
                <Volume2 className="w-5 h-5 text-emerald-600" />
              )}
            </button>
          </div>
        )}

        {/* Quick Call Button */}
        <div className="group relative flex items-center gap-2">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap backdrop-blur-md">
            Call Store: {storeInfo.phone}
          </span>
          <a
            href={`tel:${storeInfo.phone}`}
            className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-xl shadow-black/20 hover:scale-110 active:scale-95 transition-all duration-300 border border-neutral-700"
            title={`Call ${storeInfo.name}`}
          >
            <Phone className="w-5 h-5 text-[#0B8F63]" />
          </a>
        </div>

        {/* Google Calendar Fitting Booking Floating Button */}
        {onOpenCalendarModal && (
          <div className="group relative flex items-center gap-2">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap backdrop-blur-md">
              Book VIP Fitting (Google Calendar)
            </span>
            <button
              onClick={onOpenCalendarModal}
              className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-xl shadow-black/20 hover:scale-110 active:scale-95 transition-all duration-300 border border-[#0B8F63]"
              title="Book VIP Fitting on Google Calendar"
            >
              <Calendar className="w-5 h-5 text-[#0B8F63]" />
            </button>
          </div>
        )}

        {/* Primary WhatsApp Floating Button */}
        <div className="group relative flex items-center gap-3">
          {/* Support agent chat bubble indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-900 text-white p-3 rounded-2xl shadow-xl whitespace-nowrap backdrop-blur-md flex items-center gap-2.5 border border-white/10">
            <img src={waSupportAvatar} alt={waSupportName} className="w-8 h-8 rounded-full border border-neutral-700 object-cover" />
            <div className="text-left leading-tight">
              <span className="font-bold text-[11px] block text-white">{waSupportName}</span>
              <span className="text-[9px] text-[#0B8F63] font-extrabold tracking-wide uppercase">{waSupportRole}</span>
            </div>
          </div>
          <a
            href={waUrl}
            onClick={() => recordSocialClick('whatsapp')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 rounded-full bg-[#0B8F63] text-white flex items-center justify-center shadow-2xl shadow-[#0B8F63]/40 hover:scale-110 active:scale-95 transition-all duration-300 relative"
            title={`Inquire on WhatsApp with ${waSupportName}`}
          >
            <MessageCircle className="w-7 h-7 fill-white text-[#0B8F63]" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white animate-ping" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white" />
          </a>
        </div>

        {/* Back To Top Button */}
        {showScrollTop && (
          <div className="group relative flex items-center gap-2">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap backdrop-blur-md">
              Back To Top
            </span>
            <button
              onClick={scrollToTop}
              className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md text-neutral-800 border border-neutral-200/80 shadow-lg flex items-center justify-center hover:bg-[#0B8F63] hover:text-white hover:border-[#0B8F63] transition-all duration-300 active:scale-95"
              title="Back to top"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

