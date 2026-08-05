import React from 'react';
import {
  Sparkles,
  Flame,
  Tag,
  Zap,
  Footprints,
  Shirt,
  Heart,
  Award,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MobileCategoryIcon } from '../../types';

interface MobileScrollableCategoriesProps {
  onSelectCategory?: (categoryKey: string) => void;
  activeCategory?: string;
}

export const MobileScrollableCategories: React.FC<MobileScrollableCategoriesProps> = ({
  onSelectCategory,
  activeCategory,
}) => {
  const { mobileCategories } = useStore();

  const enabledCategories = mobileCategories.filter((c) => c.enabled !== false);

  if (enabledCategories.length === 0) return null;

  // Render Lucide icon based on name
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-rose-500" />;
      case 'Footprints':
        return <Footprints className="w-5 h-5 text-emerald-600" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5 text-blue-500" />;
      case 'Tag':
        return <Tag className="w-5 h-5 text-purple-500" />;
      case 'Award':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-teal-500" />;
      default:
        return <Zap className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="w-full bg-white border-b border-neutral-100 py-3 px-2 sm:hidden overflow-hidden">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none px-2 snap-x snap-mandatory touch-pan-x">
        {enabledCategories.map((cat) => {
          const isActive = activeCategory === cat.categoryKey;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory && onSelectCategory(cat.categoryKey)}
              className="flex flex-col items-center gap-1.5 shrink-0 snap-start cursor-pointer group focus:outline-none"
            >
              {/* Icon Container with Badge */}
              <div className="relative">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xs ${
                    isActive
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-500 ring-offset-2 scale-105'
                      : 'bg-neutral-100 text-neutral-800 group-hover:bg-emerald-50 group-hover:text-emerald-700'
                  }`}
                >
                  {renderCategoryIcon(cat.iconName)}
                </div>

                {cat.badge && (
                  <span
                    className={`absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase shadow-xs tracking-wider border border-white ${
                      cat.badgeColor || 'bg-rose-500 text-white'
                    }`}
                  >
                    {cat.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] font-extrabold max-w-[64px] text-center truncate leading-tight ${
                  isActive ? 'text-emerald-700 font-black' : 'text-neutral-700 group-hover:text-neutral-900'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
