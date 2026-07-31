import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Heart,
  CheckCircle2,
  Footprints,
  MessageCircle,
  Users,
  Calendar,
  Image as ImageIcon,
  Sparkles,
  Phone,
  Instagram,
  Facebook,
  Youtube,
  Star,
  ExternalLink,
  ChevronRight,
  Maximize2,
  X,
  MapPin,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DEFAULT_ABOUT_US_CONFIG } from '../../data/defaultAboutUs';
import { generateGeneralInquiryWhatsAppLink } from '../../utils/whatsapp';

export const AboutSection: React.FC = () => {
  const { aboutUsConfig: rawAboutConfig, storeInfo, products, orders, reviews } = useStore();
  const config = rawAboutConfig || DEFAULT_ABOUT_US_CONFIG;

  const [activeTab, setActiveTab] = useState<'story' | 'owners' | 'timeline' | 'achievements' | 'gallery'>('story');
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string>('all');
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; caption?: string } | null>(null);

  // Dynamic counter calculation fallbacks
  const getCalculatedCounterValue = (counter: typeof config.counters[0]) => {
    if (!counter.autoCalculate) return counter.value;
    switch (counter.autoMetric) {
      case 'years':
        return config.experienceYears || '16+';
      case 'customers':
        return Math.max(50000, orders.length * 15 + 48000).toLocaleString('en-IN');
      case 'products':
        return Math.max(1200, products.length * 8 + 1150).toLocaleString('en-IN');
      case 'orders':
        return Math.max(100000, orders.length * 35 + 98000).toLocaleString('en-IN');
      case 'reviews':
        return reviews.length > 0
          ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
          : '4.9';
      default:
        return counter.value;
    }
  };

  const filteredGallery = config.gallery.filter((item) => {
    if (!item.enabled) return false;
    if (selectedGalleryCategory === 'all') return true;
    return item.category === selectedGalleryCategory;
  });

  return (
    <section id="about" className="py-20 sm:py-28 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
            <Footprints className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Pipar City Heritage • Est. {config.establishmentYear}</span>
          </div>

          <h2 className="font-serif-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            About <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">{config.businessName}</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
            {config.tagline}
          </p>
        </div>

        {/* Live Counters Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {config.counters.filter((c) => c.enabled).map((counter) => (
            <div
              key={counter.id}
              className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800 hover:border-amber-500/40 rounded-2xl p-4 text-center shadow-lg transition-all hover:-translate-y-1 group"
            >
              <div className="text-xl sm:text-2xl font-black text-amber-400 group-hover:scale-105 transition-transform">
                {counter.prefix}{getCalculatedCounterValue(counter)}{counter.suffix}
              </div>
              <div className="text-[11px] font-bold text-neutral-300 mt-1 uppercase tracking-wider truncate">
                {counter.label}
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid: Showcase Image & Interactive Story Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Column: Glassmorphism Showcase Card */}
          <div className="lg:col-span-5 relative flex flex-col justify-between">
            <div className="relative rounded-3xl overflow-hidden border border-amber-500/20 shadow-2xl bg-neutral-900 aspect-[4/5] group">
              <img
                src={config.mainHeaderImage || 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=80'}
                alt={`${config.businessName} Showroom`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

              {/* Bottom Showcase Info overlay */}
              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-amber-500 text-neutral-950 px-3 py-1 rounded-full shadow-md">
                  👑 {config.experienceYears} Footwear Heritage
                </span>
                <h3 className="text-xl font-bold text-white font-serif-heading">
                  {storeInfo.ownerContact || 'Viju Bhai Choudhary'}
                </h3>
                <p className="text-xs text-neutral-300 line-clamp-2">
                  {config.shopDescription}
                </p>
              </div>
            </div>

            {/* Floating Glassmorphism Trust Badge */}
            <div className="mt-4 sm:mt-0 lg:absolute lg:-bottom-6 lg:-right-6 bg-neutral-900/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-2xl max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-extrabold shrink-0 shadow-md">
                  100%
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Fit & Quality Guarantee</h4>
                  <p className="text-[10px] text-neutral-300">Direct personal inspection before dispatch</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tabbed Content Container */}
          <div className="lg:col-span-7 bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
            {/* Interactive Sub-Navigation Tabs */}
            <div className="flex overflow-x-auto gap-2 border-b border-neutral-800 pb-4 scrollbar-none">
              {[
                { id: 'story', label: 'Story & Heritage', icon: BookOpenIcon },
                { id: 'owners', label: 'Owners & Team', icon: Users },
                { id: 'timeline', label: 'Growth Journey', icon: Calendar },
                { id: 'achievements', label: 'Awards & Seals', icon: Award },
                { id: 'gallery', label: 'Showroom Gallery', icon: ImageIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-amber-500 text-neutral-950 shadow-md'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: STORY */}
            {activeTab === 'story' && (
              <div className="py-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-amber-300 mb-2 font-serif-heading">
                    The Marudhar Legacy in Pipar City
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {config.businessStory}
                  </p>
                </div>

                {config.familyBusinessInfo && (
                  <div className="bg-amber-950/30 border border-amber-500/20 rounded-2xl p-4 space-y-1">
                    <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-amber-400 fill-amber-400/20" /> Family Business Personal Touch
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {config.familyBusinessInfo}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-neutral-800/60 border border-neutral-700/60 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Our Mission</span>
                    <p className="text-xs text-neutral-200">{config.mission}</p>
                  </div>

                  <div className="bg-neutral-800/60 border border-neutral-700/60 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Our Vision</span>
                    <p className="text-xs text-neutral-200">{config.vision}</p>
                  </div>
                </div>

                {/* Highlights List */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                    Why Families Choose Us
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {config.storeHighlights.map((hl, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-neutral-200 bg-neutral-800/40 p-2.5 rounded-xl border border-neutral-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: OWNERS & TEAM */}
            {activeTab === 'owners' && (
              <div className="py-6 space-y-4">
                <h3 className="text-lg font-bold text-amber-300 mb-2 font-serif-heading">
                  Leadership & Service Team
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {config.ownersAndTeam.filter((m) => m.enabled).map((member) => (
                    <div
                      key={member.id}
                      className="bg-neutral-800/80 border border-neutral-700/80 hover:border-amber-500/40 rounded-2xl p-4 space-y-3 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={member.profilePhoto}
                          alt={member.fullName}
                          className="w-14 h-14 rounded-full object-cover border-2 border-amber-500/40 shadow-md shrink-0"
                          loading="lazy"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-white">{member.fullName}</h4>
                          <p className="text-xs text-amber-400 font-semibold">{member.position}</p>
                          <span className="text-[10px] text-neutral-400">Exp: {member.experience}</span>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-300 leading-snug">
                        {member.shortIntro}
                      </p>

                      <div className="pt-2 border-t border-neutral-700/60 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-neutral-400 font-medium truncate max-w-[150px]">
                          {member.specialization}
                        </span>

                        {member.socialLinks?.whatsapp && (
                          <a
                            href={`https://wa.me/${member.socialLinks.whatsapp}?text=${encodeURIComponent(`Hello ${member.fullName}, I am inquiring about Marudhar Fashion Point collections.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[11px] font-bold rounded-lg border border-emerald-500/30 flex items-center gap-1 transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" /> Chat
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="py-6 space-y-4">
                <h3 className="text-lg font-bold text-amber-300 mb-2 font-serif-heading">
                  Growth & Innovation Milestones
                </h3>

                <div className="relative border-l-2 border-amber-500/30 pl-6 ml-3 space-y-6">
                  {config.timeline.filter((t) => t.enabled).map((item) => (
                    <div key={item.id} className="relative group">
                      {/* Timeline Node Icon */}
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-amber-500 border-4 border-neutral-900 group-hover:scale-125 transition-transform" />

                      <div className="bg-neutral-800/60 border border-neutral-700/60 rounded-2xl p-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                            {item.year}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white pt-1">{item.title}</h4>
                        <p className="text-xs text-neutral-300">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: ACHIEVEMENTS */}
            {activeTab === 'achievements' && (
              <div className="py-6 space-y-4">
                <h3 className="text-lg font-bold text-amber-300 mb-2 font-serif-heading">
                  Certificates & Recognition
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {config.achievements.filter((a) => a.enabled).map((ach) => (
                    <div key={ach.id} className="bg-neutral-800/80 border border-neutral-700/80 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {ach.type}
                        </span>
                        <span className="text-xs font-bold text-neutral-400">{ach.year}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{ach.title}</h4>
                      <p className="text-xs text-amber-400 font-medium">{ach.issuerOrPublisher}</p>
                      <p className="text-xs text-neutral-300">{ach.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: GALLERY */}
            {activeTab === 'gallery' && (
              <div className="py-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-bold text-amber-300 font-serif-heading">
                    Showroom Photos
                  </h3>

                  {/* Gallery Filters */}
                  <div className="flex gap-1 overflow-x-auto text-[11px] font-bold">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'shop_inside', label: 'Inside' },
                      { id: 'shop_outside', label: 'Exterior' },
                      { id: 'team', label: 'Team' },
                      { id: 'festival', label: 'Festivals' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedGalleryCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          selectedGalleryCategory === cat.id
                            ? 'bg-amber-500 text-neutral-950 font-extrabold'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredGallery.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setLightboxImage({ url: photo.imageUrl, title: photo.title, caption: photo.caption })}
                      className="group relative h-32 rounded-xl overflow-hidden cursor-pointer border border-neutral-700/80 bg-neutral-950"
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-amber-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Direct WhatsApp Call to Action Footer */}
            <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white">Have a size or fitting question?</h4>
                <p className="text-[11px] text-neutral-400">Connect directly with Viju Bhai for personalized footwear guidance.</p>
              </div>

              <a
                href={generateGeneralInquiryWhatsAppLink(`Hello Viju Bhai, I am viewing Marudhar Fashion Point About Us section and would like to ask a question.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all shrink-0"
              >
                <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                <span>Chat with Viju Bhai on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-3xl w-full bg-neutral-900 border border-amber-500/30 rounded-3xl overflow-hidden p-2 text-white" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 bg-neutral-800 hover:bg-neutral-700 rounded-full text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="w-full max-h-[75vh] object-contain rounded-2xl bg-neutral-950"
            />
            <div className="p-4 space-y-1">
              <h4 className="font-bold text-sm text-amber-300">{lightboxImage.title}</h4>
              {lightboxImage.caption && <p className="text-xs text-neutral-300">{lightboxImage.caption}</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// Helper Icon for Tab
const BookOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);
