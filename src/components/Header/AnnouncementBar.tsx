import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, X, Tag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AnnouncementBar: React.FC = () => {
  const { announcements } = useStore();
  const [visible, setVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 1, hours: 15, minutes: 29, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return { days: 1, hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  const displayItems = announcements.length > 0
    ? announcements
    : ['🚚 Welcome to Marudhar Fashion Point! Buy 2 Get 7% OFF, Buy 3 Get 10% OFF'];

  return (
    <div className="bg-[#00A5B5] text-white text-xs sm:text-sm font-medium py-1.5 px-3 relative overflow-hidden z-50">
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-2">
        
        {/* Deal Text & Banner */}
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="font-bold tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm">
            <Tag className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="hidden xs:inline">Comfort Rush Deal | Ends In:</span>
            <span className="xs:hidden">Festive Deal | Ends In:</span>
          </span>
        </div>

        {/* Digital Box Countdown Timer */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold shrink-0">
          {/* Day Box */}
          <div className="bg-white text-neutral-900 px-1.5 py-0.5 rounded shadow-xs text-center min-w-[24px]">
            <span className="block text-xs font-black leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
            <span className="text-[8px] font-semibold text-neutral-500 block leading-none scale-90">Day</span>
          </div>
          <span className="text-white font-bold">:</span>

          {/* Hours Box */}
          <div className="bg-white text-neutral-900 px-1.5 py-0.5 rounded shadow-xs text-center min-w-[24px]">
            <span className="block text-xs font-black leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-[8px] font-semibold text-neutral-500 block leading-none scale-90">Hours</span>
          </div>
          <span className="text-white font-bold">:</span>

          {/* Min Box */}
          <div className="bg-white text-neutral-900 px-1.5 py-0.5 rounded shadow-xs text-center min-w-[24px]">
            <span className="block text-xs font-black leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-[8px] font-semibold text-neutral-500 block leading-none scale-90">Min</span>
          </div>
          <span className="text-white font-bold">:</span>

          {/* Sec Box */}
          <div className="bg-white text-neutral-900 px-1.5 py-0.5 rounded shadow-xs text-center min-w-[24px]">
            <span className="block text-xs font-black leading-none text-[#0B8F63]">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-[8px] font-semibold text-neutral-500 block leading-none scale-90">Sec</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setVisible(false)}
          className="text-white/80 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors shrink-0"
          aria-label="Close Announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

