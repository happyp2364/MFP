import React from 'react';
import { Sparkles, Footprints, Flame, Tag, ArrowRight } from 'lucide-react';
import { GenderCategory } from '../../types';

interface HorizontalCategoryBarProps {
  activeCategory: GenderCategory;
  onSelectCategory: (cat: GenderCategory) => void;
  onNavigateToSection: (sectionId: string) => void;
}

export const HorizontalCategoryBar: React.FC<HorizontalCategoryBarProps> = ({
  activeCategory,
  onSelectCategory,
  onNavigateToSection,
}) => {
  const categories = [
    {
      id: 'all',
      name: 'सभी कलेक्शन • All',
      tag: 'एक्सप्लोर करें • Explore',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=150&q=80',
      badge: 'HOT',
    },
    {
      id: 'men',
      name: 'पुरुष • Men',
      tag: 'स्पोर्ट्स व फॉर्मल • Sports',
      image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=150&q=80',
      badge: 'POPULAR',
    },
    {
      id: 'women',
      name: 'महिलाएं • Women',
      tag: 'स्पोर्ट्स शूज • Footwear',
      image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=150&q=80',
      badge: 'TRENDING',
    },
    {
      id: 'kids',
      name: 'बच्चे • Kids',
      tag: 'स्कूल व प्ले • Casuals',
      image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=150&q=80',
      badge: 'NEW',
    },
  ];

  const quickPills = [
    { label: '⚡ नए आगमन • New Drops', action: () => { onSelectCategory('all'); onNavigateToSection('products'); } },
    { label: '👟 स्नीकर्स • Sneakers', action: () => { onSelectCategory('men'); onNavigateToSection('products'); } },
    { label: '🩴 स्लिप ऑन • Slides', action: () => { onSelectCategory('men'); onNavigateToSection('products'); } },
    { label: '👟 विमेंस शूज • Women Sports', action: () => { onSelectCategory('women'); onNavigateToSection('products'); } },
    { label: '🧒 किड्स शूज • Kids Light-Up', action: () => { onSelectCategory('kids'); onNavigateToSection('products'); } },
    { label: '🏷️ खास सेल • Clearance Sale', action: () => { onSelectCategory('all'); onNavigateToSection('products'); } },
  ];

  const handleClick = (catId: GenderCategory) => {
    onSelectCategory(catId);
    onNavigateToSection('products');
  };

  return (
    <div className="bg-white border-b border-neutral-100 py-3 relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Horizontal Card Row */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-1 pt-1">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => handleClick(cat.id as GenderCategory)}
                className={`flex items-center gap-2.5 p-1.5 pr-4 rounded-2xl border transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#0B8F63]/10 border-[#0B8F63] ring-1 ring-[#0B8F63] text-[#0B8F63] shadow-sm'
                    : 'bg-[#F7F7F7] border-neutral-200/80 hover:border-neutral-300 text-neutral-800'
                }`}
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-white shadow-xs border border-neutral-200/50">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold leading-tight">{cat.name}</span>
                    {cat.badge && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#0B8F63] text-white">
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-500 font-medium block leading-none mt-0.5">
                    {cat.tag}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Quick Subcategory Pills */}
          <div className="h-8 w-px bg-neutral-200 shrink-0 mx-1" />

          {quickPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={pill.action}
              className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-[#0B8F63]/10 hover:text-[#0B8F63] text-xs font-semibold text-neutral-700 whitespace-nowrap transition-all shrink-0 border border-neutral-200/60"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
