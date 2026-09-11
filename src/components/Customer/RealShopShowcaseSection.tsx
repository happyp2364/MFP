import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Award,
  ShieldCheck,
  Eye,
  Store,
  Users,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Maximize2,
  X,
} from 'lucide-react';
import { REAL_MARUDHAR_SHOP_IMAGES, ShopImageItem } from '../../data/shopImages';
import { CANONICAL_STORE_LOCATION } from '../../data/storeLocation';
import { generateGeneralInquiryWhatsAppLink } from '../../utils/whatsapp';

interface RealShopShowcaseSectionProps {
  title?: string;
  subtitle?: string;
}

export const RealShopShowcaseSection: React.FC<RealShopShowcaseSectionProps> = ({
  title = 'Visit Our Real Showroom in Pipar City',
  subtitle = 'Marudhar Boot House • The Brand of Pipar • मनपसंद जूतों का एकमात्र शोरूम',
}) => {
  const [selectedImage, setSelectedImage] = useState<ShopImageItem>(REAL_MARUDHAR_SHOP_IMAGES[1]); // exterior
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxImage, setLightboxImage] = useState<ShopImageItem | null>(null);

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'shop_outside', label: 'Store Exterior' },
    { id: 'shop_inside', label: 'Showroom Interior' },
    { id: 'team', label: 'Founder & Team' },
    { id: 'promotional_banner', label: 'Store Banners' },
    { id: 'branding', label: 'Official Branding' },
  ];

  const filteredImages = activeCategory === 'all'
    ? REAL_MARUDHAR_SHOP_IMAGES
    : REAL_MARUDHAR_SHOP_IMAGES.filter((img) => img.category === activeCategory);

  const handleWhatsApp = () => {
    const url = generateGeneralInquiryWhatsAppLink(
      'Namaste Viju Bhai! I am interested in visiting Marudhar Boot House in Pipar City. Please share today\'s opening hours and new shoe arrivals.'
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDirections = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      'Marudhar Boot House Jojri Nadi Mistri Market Pipar City Rajasthan'
    )}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="w-full py-8 sm:py-12 bg-stone-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-stone-800 my-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
            <Store className="w-3.5 h-3.5" /> Authentic Physical Footwear Showroom
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-stone-300">
            {subtitle}
          </p>
        </div>

        {/* Highlight Main Showcase Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-stone-950/80 rounded-2xl p-4 sm:p-6 border border-stone-800 items-center">
          {/* Main Visual */}
          <div className="lg:col-span-7 relative group rounded-xl overflow-hidden bg-stone-900 aspect-4/3 sm:aspect-16/9 flex items-center justify-center">
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== selectedImage.fallbackUrl) {
                  target.src = selectedImage.fallbackUrl;
                }
              }}
            />
            <button
              onClick={() => setLightboxImage(selectedImage)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs font-semibold"
              title="Expand photo"
            >
              <Maximize2 className="w-4 h-4" /> Full View
            </button>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                {selectedImage.category.replace('_', ' ')}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">{selectedImage.title}</h3>
              <p className="text-xs sm:text-sm text-stone-300 line-clamp-2 mt-1">{selectedImage.caption}</p>
            </div>
          </div>

          {/* Store Info & Action Center */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
                <ShieldCheck className="w-4 h-4" /> Real Ground Presence Since 2010
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Marudhar Boot House (MBH)
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Visit our physical store to experience the complete inventory, personalized fit check by Viju Bhai, and genuine leather handcrafted collections.
              </p>
            </div>

            {/* Address & Contact Cards */}
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-3 bg-stone-900/90 rounded-xl border border-stone-800">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Store Address:</div>
                  <div className="text-stone-300">
                    Jojri Nadi Ke Pass, Mistri Market, Pipar City, Jodhpur, Rajasthan - 342601
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-stone-900/90 rounded-xl border border-stone-800">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Contact / WhatsApp:</div>
                    <div className="text-stone-300">+91 9782482250 (Vijay Parihar)</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded">
                  Open Today
                </span>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleWhatsApp}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
              >
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </button>
              <button
                onClick={handleDirections}
                className="w-full py-3 px-4 bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 border border-stone-700"
              >
                <ExternalLink className="w-4 h-4" /> Get Directions
              </button>
            </div>
          </div>
        </div>

        {/* Categorized Photo Gallery Tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-stone-800 pb-3">
            <h4 className="text-base font-bold text-stone-200 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" /> Explore Original Photographs ({filteredImages.length})
            </h4>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition shrink-0 ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredImages.map((img) => {
              const isCurrent = selectedImage.id === img.id;
              return (
                <div
                  key={img.id}
                  onClick={() => setSelectedImage(img)}
                  className={`group relative rounded-xl overflow-hidden bg-stone-950 border cursor-pointer transition-all aspect-4/3 flex flex-col justify-end ${
                    isCurrent ? 'ring-2 ring-amber-400 border-transparent shadow-lg' : 'border-stone-800 hover:border-stone-600'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== img.fallbackUrl) {
                        target.src = img.fallbackUrl;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 p-2.5">
                    <p className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-amber-300">
                      {img.title}
                    </p>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400">
                      {img.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-stone-950 rounded-2xl overflow-hidden border border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/70 hover:bg-black text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="w-full max-h-[75vh] object-contain bg-black"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== lightboxImage.fallbackUrl) {
                  target.src = lightboxImage.fallbackUrl;
                }
              }}
            />
            <div className="p-4 sm:p-6 bg-stone-900 border-t border-stone-800 space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {lightboxImage.category.replace('_', ' ')}
              </span>
              <h3 className="text-lg font-bold text-white">{lightboxImage.title}</h3>
              <p className="text-sm text-stone-300">{lightboxImage.caption}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
