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

  useEffect(() => {
    if (displayItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayItems.length);
    }, speed);
    return () => clearInterval(interval);
  }, [displayItems.length, speed]);

  if (!visible || displayItems.length === 0) return null;

  const currentItem = displayItems[currentIndex];
  const IconComponent = currentItem.icon ? (iconMap[currentItem.icon] || Truck) : Truck;

  // Render text color of closing button dynamically
  const textColor = topAnnouncementBarConfig?.textColor || '#FFFFFF';

  return (
    <div
      className="text-xs sm:text-sm font-medium py-2 px-3 relative overflow-hidden z-50 shadow-sm transition-colors duration-500"
      style={{
        backgroundColor: topAnnouncementBarConfig?.backgroundColor || '#00A5B5',
        color: textColor,
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden mx-auto sm:mx-0">
          <IconComponent className="w-4 h-4 shrink-0" style={{ color: topAnnouncementBarConfig?.textColor === '#FFFFFF' ? '#FBBF24' : 'currentColor' }} />
          <p className="font-semibold tracking-tight text-xs sm:text-sm truncate transition-all duration-300">
            {currentItem.text}
          </p>
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


