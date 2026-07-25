import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, ArrowUp, Instagram, Facebook, Youtube, X, Share2, Calendar } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { generateGeneralInquiryWhatsAppLink } from '../../utils/whatsapp';

interface FloatingActionHubProps {
  onOpenCalendarModal?: () => void;
}

export const FloatingActionHub: React.FC<FloatingActionHubProps> = ({
  onOpenCalendarModal,
}) => {
  const { storeInfo } = useStore();
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

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      
      {/* Social Links Sub-Menu (Glassmorphism Circular Buttons with Tooltips) */}
      {expandedSocials && (
        <div className="flex flex-col items-end gap-3 mb-1 pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300">
          
          {/* Instagram Button */}
          <div className="group relative flex items-center gap-2">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap backdrop-blur-md">
              Instagram @marudhar_fashion_point
            </span>
            <a
              href={storeInfo.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-rose-500/20 hover:scale-115 active:scale-95 transition-all duration-300 backdrop-blur-md border border-white/20"
              title="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>

          {/* Facebook Button */}
          <div className="group relative flex items-center gap-2">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap backdrop-blur-md">
              Facebook Page
            </span>
            <a
              href={storeInfo.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-xl shadow-blue-600/20 hover:scale-115 active:scale-95 transition-all duration-300 backdrop-blur-md border border-white/20"
              title="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>

          {/* YouTube Button */}
          <div className="group relative flex items-center gap-2">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap backdrop-blur-md">
              YouTube Channel
            </span>
            <a
              href={storeInfo.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-700 text-white flex items-center justify-center shadow-xl shadow-red-600/20 hover:scale-115 active:scale-95 transition-all duration-300 backdrop-blur-md border border-white/20"
              title="YouTube"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>

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
        <div className="group relative flex items-center gap-2">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap backdrop-blur-md">
            Order on WhatsApp (+{storeInfo.whatsappNumber})
          </span>
          <a
            href={generateGeneralInquiryWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 rounded-full bg-[#0B8F63] text-white flex items-center justify-center shadow-2xl shadow-[#0B8F63]/40 hover:scale-110 active:scale-95 transition-all duration-300 relative"
            title="Order on WhatsApp"
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

