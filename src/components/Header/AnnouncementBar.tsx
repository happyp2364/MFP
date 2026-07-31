import React, { useState, useEffect } from 'react';
import { Sparkles, X, Tag, Truck, Award, MessageCircle, Info } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const iconMap: Record<string, React.ComponentType<any>> = {
  Truck,
  Sparkles,
  Tag,
  Award,
  MessageCircle,
  Info,
};

export const AnnouncementBar: React.FC = () => {
  const { topAnnouncementBarConfig } = useStore();
  const [visible, setVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Live countdown state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    ended: boolean;
  } | null>(null);

  // Filter enabled announcements
  const enabledAnnouncements = (topAnnouncementBarConfig?.announcements || [])
    .filter((item) => item.enabled);

  const displayItems = enabledAnnouncements.length > 0
    ? enabledAnnouncements
    : [
        { id: '1', text: '🚚 Free Delivery on Selected Products Across India', icon: 'Truck' },
        { id: '2', text: '👟 New Season Sports Shoes & Sneakers Just Arrived', icon: 'Sparkles' },
        { id: '3', text: '⭐ Rated 4.9/5 by 15,000+ Happy Families', icon: 'Award' },
        { id: '4', text: '📱 Easy WhatsApp Order & Instant Confirmation', icon: 'MessageCircle' },
      ];

  const speed = topAnnouncementBarConfig?.intervalSpeed || 4000;
  const shouldAutoScroll = topAnnouncementBarConfig?.autoScroll !== false;

  // Handle active slide carousel/interval
  useEffect(() => {
    if (displayItems.length <= 1 || !shouldAutoScroll) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayItems.length);
    }, speed);
    return () => clearInterval(interval);
  }, [displayItems.length, speed, shouldAutoScroll]);

  // Handle live countdown tick
  useEffect(() => {
    if (!topAnnouncementBarConfig?.countdownEnabled || !topAnnouncementBarConfig?.countdownEndDate) {
      setTimeLeft(null);
      return;
    }

    const targetStr = `${topAnnouncementBarConfig.countdownEndDate}T${topAnnouncementBarConfig.countdownEndTime || '00:00'}:00`;
    const targetMs = new Date(targetStr).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetMs - now;

      if (topAnnouncementBarConfig.countdownReverseMode) {
        // Reverse count-up timeline
        const elapsed = Math.abs(diff);
        const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
        const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, ended: false });
      } else {
        // Standard countdown
        if (diff <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: true });
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, ended: false });
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [
    topAnnouncementBarConfig?.countdownEnabled,
    topAnnouncementBarConfig?.countdownEndDate,
    topAnnouncementBarConfig?.countdownEndTime,
    topAnnouncementBarConfig?.countdownReverseMode
  ]);

  // Hide entirely if checked or dismissed
  if (!visible || topAnnouncementBarConfig?.permanentlyHidden) return null;

  // Handle countdown expiry options
  if (timeLeft && timeLeft.ended) {
    if (topAnnouncementBarConfig?.countdownExpiryOption === 'hide') {
      return null;
    }
  }

  const currentItem = displayItems[currentIndex];
  const IconComponent = currentItem?.icon ? (iconMap[currentItem.icon] || Truck) : Truck;

  // Render text color & styling dynamically
  const textColor = topAnnouncementBarConfig?.textColor || '#FFFFFF';
  const customFontSize = topAnnouncementBarConfig?.fontSize ? `${topAnnouncementBarConfig.fontSize}px` : undefined;
  const customPaddingY = topAnnouncementBarConfig?.paddingY ? `${topAnnouncementBarConfig.paddingY}px` : '8px';

  // Content alignment
  const alignmentClass = topAnnouncementBarConfig?.alignment === 'left'
    ? 'justify-start'
    : topAnnouncementBarConfig?.alignment === 'right'
    ? 'justify-end'
    : 'justify-center';

  // Render countdown expired text banner if configured
  const showEndedBannerText = timeLeft && timeLeft.ended && topAnnouncementBarConfig?.countdownExpiryOption === 'ended_text';

  return (
    <div
      className="font-medium px-3 relative overflow-hidden z-50 shadow-sm transition-colors duration-500 text-xs sm:text-sm"
      style={{
        backgroundColor: topAnnouncementBarConfig?.backgroundColor || '#00A5B5',
        color: textColor,
        fontSize: customFontSize,
        paddingTop: customPaddingY,
        paddingBottom: customPaddingY,
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-2">
        <div className={`flex-1 flex flex-col md:flex-row items-center gap-3 overflow-hidden ${alignmentClass}`}>
          {showEndedBannerText ? (
            <p className="font-bold tracking-wider animate-pulse">
              ✨ {topAnnouncementBarConfig?.countdownFestivalName || 'Festival'} Offer Has Concluded ✨
            </p>
          ) : (
            <>
              {currentItem && (
                <div className="flex items-center gap-2 overflow-hidden">
                  <IconComponent className="w-4 h-4 shrink-0" style={{ color: topAnnouncementBarConfig?.textColor === '#FFFFFF' ? '#FBBF24' : 'currentColor' }} />
                  <p className="font-semibold tracking-tight truncate transition-all duration-300">
                    {currentItem.text}
                  </p>
                </div>
              )}

              {/* Offer Text if enabled */}
              {topAnnouncementBarConfig?.showOfferText !== false && topAnnouncementBarConfig?.offerText && (
                <span className="hidden lg:inline-block font-bold text-[11px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                  {topAnnouncementBarConfig.offerText}
                </span>
              )}

              {/* Countdown / Count-up Display Overlay */}
              {timeLeft && (
                <div className="flex items-center gap-1.5 border-t md:border-t-0 md:border-l border-white/20 pt-1 md:pt-0 pl-0 md:pl-3 text-[10px] font-extrabold tracking-wide uppercase shrink-0">
                  <span className="text-amber-300 animate-pulse">⚡</span>
                  <span>{topAnnouncementBarConfig?.countdownFestivalName || 'FESTIVAL'}:</span>
                  <span className="font-mono bg-black/30 px-1.5 py-0.5 rounded text-amber-300">
                    {timeLeft.ended ? (
                      'ENDED'
                    ) : topAnnouncementBarConfig?.countdownReverseMode ? (
                      `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s Elapsed`
                    ) : (
                      `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
                    )}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Top Bar Navigation Links (Store Locator, Track Order, About, Help, Contact, Language) */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-semibold opacity-90 shrink-0 border-l border-white/20 pl-3">
          {topAnnouncementBarConfig?.showStoreLocator && (
            <a href="#store-locator" className="hover:underline flex items-center gap-1">
              📍 {topAnnouncementBarConfig.storeLocatorText || 'Store Locator'}
            </a>
          )}
          {topAnnouncementBarConfig?.showTrackOrder && (
            <a href="#track-order" className="hover:underline flex items-center gap-1">
              📦 {topAnnouncementBarConfig.trackOrderText || 'Track Order'}
            </a>
          )}
          {topAnnouncementBarConfig?.showAbout && (
            <a href="#about" className="hover:underline">
              {topAnnouncementBarConfig.aboutText || 'About'}
            </a>
          )}
          {topAnnouncementBarConfig?.showHelp && (
            <a href="#help" className="hover:underline">
              {topAnnouncementBarConfig.helpText || 'Help'}
            </a>
          )}
          {topAnnouncementBarConfig?.showContact && (
            <a href="#contact" className="hover:underline">
              {topAnnouncementBarConfig.contactText || 'Contact'}
            </a>
          )}
          {topAnnouncementBarConfig?.showLanguage && (
            <span className="bg-white/10 px-1.5 py-0.5 rounded cursor-pointer hover:bg-white/20">
              🌐 {topAnnouncementBarConfig.languageText || 'EN'}
            </span>
          )}
        </div>

        <button
          onClick={() => setVisible(false)}
          className="p-1 rounded-full hover:bg-white/10 transition-colors shrink-0 ml-auto sm:ml-0"
          style={{ color: textColor }}
          aria-label="Close Announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};


