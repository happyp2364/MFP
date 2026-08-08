import React from 'react';
import { Footprints, Sparkles, Smile, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { GenderCategory } from '../../types';

interface CategorySectionProps {
  onSelectCategory: (cat: GenderCategory) => void;
  activeCategory: GenderCategory;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  onSelectCategory,
  activeCategory,
}) => {
  const { categoryHighlights } = useStore();

  return (
    <section id="categories" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0B8F63] px-3 py-1 rounded-full bg-[#0B8F63]/10 inline-block">
            Explore By Family
          </span>
          <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900">
            Select Your Category
          </h2>
          <p className="text-sm sm:text-base text-neutral-600">
            Crafted with ergonomic comfort, premium genuine materials, and royal craftsmanship for every member of the family.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categoryHighlights.map((cat: any) => {
            const isSelected = activeCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id as GenderCategory)}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 border ${
                  isSelected
                    ? 'ring-2 ring-[#0B8F63] border-transparent shadow-xl'
                    : 'border-neutral-200/80 shadow-sm hover:shadow-2xl hover:-translate-y-1.5'
                }`}
              >
                {/* Background Image Container */}
                <div className="aspect-[4/5] sm:aspect-[3/4] w-full relative overflow-hidden bg-neutral-100">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/30 to-transparent" />

                  {/* Top Badge & Icon */}
                  <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-neutral-900 shadow-sm">
                      {cat.itemCount}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#0B8F63] group-hover:bg-[#0B8F63] group-hover:text-white transition-all duration-300 shadow-sm">
                      <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Bottom Content */}
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-serif-heading text-2xl sm:text-3xl font-bold">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-white/80 font-medium line-clamp-1">
                        {cat.subtitle}
                      </p>
                    </div>

                    {/* Subcategories Quick Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cat.subcategories.slice(0, 4).map((sub: any, idx: any) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold bg-white/20 hover:bg-white/30 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white/90 transition-colors"
                        >
                          {sub}
                        </span>
                      ))}
                      {cat.subcategories.length > 4 && (
                        <span className="text-[10px] font-semibold bg-[#0B8F63] px-2 py-1 rounded-lg text-white">
                          +{cat.subcategories.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Indicator Ribbon */}
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-[#0B8F63] text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Selected
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
