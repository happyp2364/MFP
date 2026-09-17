import React from 'react';
import { useWebsiteDesign } from '../../context/WebsiteDesignContext';
import { FESTIVALS_REGISTRY } from '../../data/festivalsRegistry';

export const FestivalExperienceOverlay: React.FC = () => {
  const { websiteDesignSettings } = useWebsiteDesign();
  const activeFestivalId = websiteDesignSettings.activeFestivalId || 'none';
  const festival = FESTIVALS_REGISTRY[activeFestivalId];

  if (!festival || activeFestivalId === 'none') {
    return null;
  }

  return (
    <>
      {/* Top Announcement Bar Enhancement */}
      {festival.announcementText && (
        <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500 text-white text-xs sm:text-sm font-bold py-2 px-4 text-center tracking-wide shadow-sm flex items-center justify-center gap-2 relative z-50 overflow-hidden">
          <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
          <span className="text-base animate-bounce">{festival.icon}</span>
          <span>{festival.announcementText}</span>
          <span className="text-base animate-bounce">{festival.icon}</span>
        </div>
      )}

      {/* Floating Festive Particles & Decorative Corner Elements */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden="true">
        {/* Top left subtle decorative splash */}
        <div 
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-25 animate-pulse"
          style={{ backgroundColor: festival.primaryColor }}
        />

        {/* Top right subtle decorative splash */}
        <div 
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-25 animate-pulse"
          style={{ backgroundColor: festival.secondaryColor, animationDelay: '1s' }}
        />

        {/* Floating decorative particles */}
        <div className="absolute top-24 left-10 text-xl opacity-60 animate-bounce" style={{ animationDuration: '4s' }}>
          {festival.icon}
        </div>
        <div className="absolute top-36 right-12 text-2xl opacity-60 animate-bounce" style={{ animationDuration: '6s', animationDelay: '2s' }}>
          ✨
        </div>
        <div className="absolute bottom-20 left-16 text-xl opacity-50 animate-pulse">
          🎨
        </div>
        <div className="absolute bottom-32 right-20 text-xl opacity-50 animate-bounce" style={{ animationDuration: '5s' }}>
          💫
        </div>
      </div>
    </>
  );
};
