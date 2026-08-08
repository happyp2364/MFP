import React from 'react';
import { Flame, ArrowUpRight, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface TrendingCollectionsProps {
  onSelectCollection: (collectionId: string) => void;
}

export const TrendingCollections: React.FC<TrendingCollectionsProps> = ({
  onSelectCollection,
}) => {
  const { trendingCollections } = useStore();

  return (
    <section className="py-16 bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0B8F63] mb-1">
              <Flame className="w-4 h-4 fill-[#0B8F63]" />
              <span>Trending Now</span>
            </div>
            <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-neutral-900">
              Curated Seasonal Collections
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md">
            Handpicked footwear & fashion edits designed for grand festivities, daily fitness, summer strolls, and school reopening.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingCollections.map((col: any) => (
            <div
              key={col.id}
              onClick={() => onSelectCollection(col.id)}
              className="group relative rounded-3xl overflow-hidden aspect-[16/10] bg-neutral-900 cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 border border-neutral-200/80"
            >
              <img
                src={col.image}
                alt={col.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md w-9 h-9 rounded-full flex items-center justify-center text-neutral-900 group-hover:bg-[#0B8F63] group-hover:text-white transition-all shadow-sm">
                <ArrowUpRight className="w-4 h-4" />
              </div>

              <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#0B8F63] text-white px-2.5 py-0.5 rounded">
                  {col.count}
                </span>
                <h3 className="font-serif-heading text-xl font-bold">{col.name}</h3>
                <p className="text-xs text-white/80 line-clamp-1 font-medium">{col.tagline}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
