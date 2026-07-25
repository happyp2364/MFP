import React, { useState, useEffect } from 'react';
import { Sparkles, X, Tag, Truck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AnnouncementBar: React.FC = () => {
  const { announcements } = useStore();
  const [visible, setVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayItems =
    announcements && announcements.length > 0
      ? announcements
      : [
          '🚚 Free Delivery on Selected Products Across India',
          '👟 New Season Sports Shoes & Sneakers Just Arrived',
          '⭐ Rated 4.9/5 by 15,000+ Happy Families',
          '📱 Easy WhatsApp Order & Instant Confirmation',
        ];

  useEffect(() => {
    if (displayItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [displayItems.length]);

  if (!visible) return null;

  return (
    <div className="bg-[#00A5B5] text-white text-xs sm:text-sm font-medium py-2 px-3 relative overflow-hidden z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden mx-auto sm:mx-0">
          <Truck className="w-4 h-4 text-amber-300 shrink-0" />
          <p className="font-semibold tracking-tight text-white text-xs sm:text-sm truncate transition-all duration-300">
            {displayItems[currentIndex]}
          </p>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors shrink-0 ml-auto sm:ml-0"
          aria-label="Close Announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};


