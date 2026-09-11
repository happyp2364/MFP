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

const HERO_PERSPECTIVES = [
  {
    id: 'exterior',
    title: 'Main Storefront & Signboard',
    subtitle: 'Pipar City Market Entrance',
    url: '/images/shop/shop_exterior_pipar_front.jpg',
    badge: '🏪 Exterior',
  },
  {
    id: 'interior',
    title: 'Illuminated Shoe Showroom',
    subtitle: 'Footwear Racks & Air-Conditioned Lounge',
    url: '/images/shop/shop_interior_illuminated_walkthrough.jpg',
    badge: '✨ Interior',
  },
  {
    id: 'founder',
    title: 'Viju Bhai (Vijay Parihar) & Team',
    subtitle: '18+ Years Retail Trust & Consultation',
    url: '/images/shop/owners_vijay_parihar_viju_bhai_team.jpg',
    badge: '👥 Leadership',
  },
  {
    id: 'banner',
    title: 'Official Footwear Destination Banner',
    subtitle: 'Jojri Nadi Road Mistri Market',
    url: '/images/shop/banner_vijay_parihar_branded_shoes.jpg',
    badge: '🏆 Banner',
  },
];

export const AboutSection: React.FC = () => {
  const { aboutUsConfig: rawAboutConfig, storeInfo, products, reviews } = useStore();
  const config = rawAboutConfig || DEFAULT_ABOUT_US_CONFIG;

  const [activeTab, setActiveTab] = useState<'story' | 'owners' | 'timeline' | 'achievements' | 'gallery'>('story');
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string>('all');
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; caption?: string } | null>(null);
  const [heroViewIndex, setHeroViewIndex] = useState(0);

  // Dynamic counter calculation fallbacks
  const getCalculatedCounterValue = (counter: typeof config.counters[0]) => {
    if (!counter.autoCalculate) return counter.value;
    switch (counter.autoMetric) {
      case 'years':
        return config.experienceYears || '16+';
      case 'customers':
        return (50000).toLocaleString('en-IN');
      case 'products':
        return Math.max(1200, products.length * 8 + 1150).toLocaleString('en-IN');
      case 'orders':
        return (100000).toLocaleString('en-IN');
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

  const activeHero = HERO_PERSPECTIVES[heroViewIndex] || HERO_PERSPECTIVES[0];

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
          {/* Left Column: Glassmorphism Showcase Card with Interactive Viewpoints */}
          <div className="lg:col-span-5 relative flex flex-col justify-between space-y-4">
            <div 
              onClick={() => setLightboxImage({ url: activeHero.url, title: activeHero.title, caption: activeHero.subtitle })}
              className="relative rounded-3xl overflow-hidden border border-amber-500/20 shadow-2xl bg-neutral-900 aspect-[4/5] group cursor-pointer"
            >
              <img
                src={activeHero.url}
                alt={activeHero.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/shop/shop_exterior_pipar_front.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

              {/* Top View Badge & Enlarge Button */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full shadow-md">
                  {activeHero.badge}
                </span>
                <span className="p-2 rounded-xl bg-black/60 backdrop-blur-md text-white/80 hover:text-white border border-white/10">
                  <Maximize2 className="w-4 h-4" />
                </span>
              </div>

              {/* Bottom Showcase Info overlay */}
              <div className="absolute bottom-4 left-4 right-4 space-y-1.5">
                <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-amber-500 text-neutral-950 px-2.5 py-0.5 rounded-full shadow-md">
                  👑 {config.experienceYears} Footwear Heritage
                </span>
                <h3 className="text-lg font-bold text-white font-serif-heading">
                  {activeHero.title}
                </h3>
                <p className="text-xs text-neutral-300 line-clamp-2">
                  {activeHero.subtitle}
                </p>
              </div>
            </div>

            {/* Quick Perspective Thumbnails Switcher */}
            <div className="grid grid-cols-4 gap-2">
              {HERO_PERSPECTIVES.map((persp, idx) => (
                <button
                  key={persp.id}
                  type="button"
                  onClick={() => setHeroViewIndex(idx)}
                  className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                    heroViewIndex === idx
                      ? 'border-amber-400 ring-2 ring-amber-400/40 scale-102'
                      : 'border-neutral-800 opacity-60 hover:opacity-100 hover:border-neutral-600'
                  }`}
                  title={persp.title}
                >
                  <img
                    src={persp.url}
                    alt={persp.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/shop/shop_exterior_pipar_front.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <span className="absolute bottom-1 left-1 right-1 text-[9px] font-extrabold text-white text-center truncate bg-black/80 rounded px-1">
                    {persp.badge.split(' ')[1] || persp.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* Floating Glassmorphism Trust Badge */}
            <div className="bg-neutral-900/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-3.5 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-extrabold shrink-0 shadow-md text-xs">
                  100%
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Genuine In-Store Stock</h4>
                  <p className="text-[10px] text-neutral-300">Pipar City showroom se direct open-box verification</p>
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

                {/* Authentic Shop Photos inside Story */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Real Storefront & Inside Glimpse</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div 
                      onClick={() => setLightboxImage({
                        url: '/images/shop/shop_exterior_pipar_front.jpg',
                        title: 'मरुधर बूट हाऊस — Main Storefront Signboard',
                        caption: 'Pipar City Main Market near Jojri Nadi Road. The premier footwear showroom of Pipar City with distinctive Hindi signboard.'
                      })}
                      className="group relative rounded-2xl overflow-hidden border border-neutral-700/80 bg-neutral-950 aspect-[16/10] cursor-pointer hover:border-amber-400/50 transition-all shadow-md"
                    >
                      <img
                        src="/images/shop/shop_exterior_pipar_front.jpg"
                        alt="Marudhar Boot House Main Exterior Signboard"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/shop/banner_vijay_parihar_branded_shoes.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2.5 left-3 right-3 text-white">
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm">
                          📍 Pipar City Storefront
                        </span>
                        <p className="text-xs font-bold truncate mt-0.5">मरुधर बूट हाऊस Entrance</p>
                      </div>
                    </div>

                    <div 
                      onClick={() => setLightboxImage({
                        url: '/images/shop/shop_interior_illuminated_walkthrough.jpg',
                        title: 'Marudhar Boot House Showroom Interior Walkthrough',
                        caption: 'Illuminated shoe aisles, LED display rows, and carpeted trial floor.'
                      })}
                      className="group relative rounded-2xl overflow-hidden border border-neutral-700/80 bg-neutral-950 aspect-[16/10] cursor-pointer hover:border-amber-400/50 transition-all shadow-md"
                    >
                      <img
                        src="/images/shop/shop_interior_illuminated_walkthrough.jpg"
                        alt="Marudhar Boot House Showroom Interior"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/shop/shop_exterior_pipar_front.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2.5 left-3 right-3 text-white">
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300 bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm">
                          ✨ In-Store Showroom
                        </span>
                        <p className="text-xs font-bold truncate mt-0.5">Shoe Trial Racks & Walkway</p>
                      </div>
                    </div>
                  </div>
                </div>

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
                    Pipar City ki families humein kyun chunti hain
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
              <div className="py-6 space-y-5">
                {/* Founder Spotlight Card with Real Photograph */}
                <div 
                  onClick={() => setLightboxImage({
                    url: '/images/shop/owners_vijay_parihar_viju_bhai_team.jpg',
                    title: 'Founder Vijay Parihar (Viju Bhai) & Leadership Team',
                    caption: 'Proprietor of Marudhar Boot House, serving Pipar City and surrounding districts with authentic footwear since 2010.'
                  })}
                  className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-800/90 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden group cursor-pointer hover:border-amber-400 transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <div className="relative shrink-0 w-28 h-36 sm:w-32 sm:h-40 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl bg-neutral-950">
                      <img
                        src="/images/shop/owners_vijay_parihar_viju_bhai_team.jpg"
                        alt="Vijay Parihar (Viju Bhai) Marudhar Boot House Founder"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/shop/shop_exterior_pipar_front.jpg';
                        }}
                      />
                      <span className="absolute bottom-1 left-1 right-1 text-[8px] font-black uppercase tracking-wider bg-black/85 text-amber-300 text-center py-0.5 rounded">
                        Founder & Team
                      </span>
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                        ⭐ Founder Spotlight
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-white font-serif-heading">
                        Vijay Parihar (Viju Bhai)
                      </h4>
                      <p className="text-xs font-semibold text-amber-400">
                        Proprietor & Managing Director • 18+ Years Trusted Retail Leadership
                      </p>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        "Hamara lakshya Pipar City aur pure Rajasthan ki families ko original, comfortable aur durable shoes provide karna hai. Har customer hamare pariwar jaisa hai — hum dispatch se pehle har single jodi ko personally inspect karte hain."
                      </p>

                      <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                        <a
                          href="https://wa.me/919782482250?text=Namaste%20Viju%20Bhai,%20I%20am%20reaching%20out%20from%20the%20Marudhar%20Fashion%20Point%20website."
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Direct WhatsApp Consultation</span>
                        </a>

                        <a
                          href="tel:9782482250"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl border border-neutral-700 flex items-center gap-1.5 transition-all"
                        >
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          <span>Call: 9782482250</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-base font-bold text-amber-300 mb-1 font-serif-heading pt-2">
                  Store Management & Fitting Specialists
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
                    Showroom Photos ({filteredGallery.length})
                  </h3>

                  {/* Gallery Filters */}
                  <div className="flex gap-1 overflow-x-auto text-[11px] font-bold scrollbar-none pb-1">
                    {[
                      { id: 'all', label: 'All Photos' },
                      { id: 'shop_outside', label: 'Storefront' },
                      { id: 'shop_inside', label: 'Showroom' },
                      { id: 'team', label: 'Owners & Team' },
                      { id: 'promotional_banner', label: 'Banners' },
                      { id: 'brand_emblem', label: 'Logo & Seals' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedGalleryCategory(cat.id)}
                        className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                          selectedGalleryCategory === cat.id
                            ? 'bg-amber-500 text-neutral-950 font-extrabold shadow-sm'
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
                      className="group relative h-36 rounded-xl overflow-hidden cursor-pointer border border-neutral-700/80 bg-neutral-950 shadow-md hover:border-amber-400/60 transition-all"
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                          photo.category === 'promotional_banner' || photo.category === 'brand_emblem'
                            ? 'object-contain p-2'
                            : 'object-cover'
                        }`}
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/shop/shop_exterior_pipar_front.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-white">
                        <span className="font-bold truncate max-w-[80%]">{photo.title}</span>
                        <Maximize2 className="w-3 h-3 text-amber-400 shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Direct WhatsApp Call to Action Footer */}
            <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white">Size ya fitting ko lekar koi sawaal hai?</h4>
                <p className="text-[11px] text-neutral-400">Viju Bhai se WhatsApp par connect karein aur right size select karne me guidance lein.</p>
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
