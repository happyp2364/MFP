import React, { useState } from 'react';
import { 
  Footprints, MessageCircle, Phone, Mail, MapPin, ShieldCheck, Heart, Send, Sparkles,
  Instagram, Facebook, Youtube, Send as TelegramIcon, Twitter, AtSign, Pin, Camera, Linkedin, Share2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { generateGeneralInquiryWhatsAppLink } from '../../utils/whatsapp';

export const Footer: React.FC = () => {
  const { storeInfo, socialMediaConfig, recordSocialClick } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setNewsletterEmail('');
    }, 2500);
  };

  const getPlatformIcon = (id: string) => {
    switch (id) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'telegram': return <TelegramIcon className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'threads': return <AtSign className="w-4 h-4" />;
      case 'pinterest': return <Pin className="w-4 h-4" />;
      case 'snapchat': return <Camera className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'google_business': return <MapPin className="w-4 h-4" />;
      default: return <Share2 className="w-4 h-4" />;
    }
  };

  // Get active and ordered footer platforms
  const footerPlatforms = (socialMediaConfig?.platforms || [])
    .filter(p => p.enabled && p.showFooter)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <footer className="bg-[#121816] text-white pt-16 pb-12 relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0B8F63]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Top Newsletter & WhatsApp Banner Card */}
        <div className="bg-[#1C2522] p-6 sm:p-10 rounded-3xl border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-2 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B8F63]/20 text-[#0B8F63] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Join Marudhar Family Club
            </div>
            <h3 className="font-serif-heading text-2xl sm:text-3xl font-bold">
              Get Exclusive Special Offers & New Arrival Alerts
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400">
              Subscribe to get seasonal catalog updates directly on WhatsApp & Email.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2 max-w-md">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email or WhatsApp number"
              className="bg-neutral-900 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#0B8F63] flex-1"
            />
            <button
              type="submit"
              className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold text-xs px-6 py-3 rounded-2xl transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
            >
              <span>{subscribed ? 'Subscribed!' : 'Subscribe'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Main Footer Links Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pt-4">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#0B8F63] flex items-center justify-center text-white shadow-md">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif-heading font-extrabold text-xl text-white tracking-tight">
                  {storeInfo.name}
                </span>
                <p className="text-[10px] text-[#0B8F63] font-bold tracking-wide uppercase">
                  {storeInfo.tagline}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Your trusted family destination for high-grade sports shoes, royal leather loafers, mirror-work Kolhapuris, durable school shoes, and men's daily apparel.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {footerPlatforms.length > 0 ? (
                footerPlatforms.map((plat) => {
                  const getHoverStyle = (effect: string) => {
                    switch (effect) {
                      case 'glow': return 'hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]';
                      case 'bounce': return 'hover:-translate-y-1';
                      case 'fade': return 'hover:opacity-75';
                      case 'rotate': return 'hover:rotate-12';
                      default: return 'hover:scale-105';
                    }
                  };

                  return (
                    <a
                      key={plat.id}
                      href={plat.profileUrl}
                      onClick={() => recordSocialClick(plat.id)}
                      target={plat.openInNewTab ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all shadow-sm ${getHoverStyle(plat.hoverEffect)}`}
                      style={{ backgroundColor: plat.bgColor || 'rgba(255,255,255,0.1)' }}
                      title={plat.customLabel || plat.name}
                    >
                      <span style={{ color: plat.iconColor || '#fff' }}>
                        {getPlatformIcon(plat.id)}
                      </span>
                    </a>
                  );
                })
              ) : (
                <>
                  <a
                    href={generateGeneralInquiryWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#0B8F63] hover:bg-[#086F4C] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-[#0B8F63]" />
                    <span>Shop on WhatsApp</span>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0B8F63]">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><a href="#hero" className="hover:text-white transition-colors">Home Page</a></li>
              <li><a href="#categories" className="hover:text-white transition-colors">Family Categories</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Explore All Products</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">Customer Testimonials</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About Viju Bhai & Store</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Store Location & Hours</a></li>
            </ul>
          </div>

          {/* Col 3: Product Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0B8F63]">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Men's Running Shoes & Sneakers</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Leather Loafers & Formals</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Women's Sports Shoes & Sneakers</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Traditional Kolhapuri & Juttis</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Kids' School & Party Shoes</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Men's Shirts & Trousers</span></li>
            </ul>
          </div>

          {/* Col 4: Store Contact */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0B8F63]">
              Store Information
            </h4>
            <div className="space-y-2 text-xs text-neutral-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#0B8F63] shrink-0 mt-0.5" />
                <span>{storeInfo.address}</span>
              </div>
              <a href={`tel:${storeInfo.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-[#0B8F63] shrink-0" />
                <span>Call: {storeInfo.phone}</span>
              </a>
              <a href={generateGeneralInquiryWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4 text-[#0B8F63] shrink-0 fill-[#0B8F63]/20" />
                <span>WhatsApp: +{storeInfo.whatsappNumber}</span>
              </a>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0B8F63] shrink-0" />
                <span>{storeInfo.email}</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold pt-1">
                Hours: {storeInfo.businessHours}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Guarantees & Copyright Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} Marudhar Fashion Point. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-400">
            <span>100% Fit & Size Guarantee</span>
            <span>•</span>
            <span>Express Delivery</span>
            <span>•</span>
            <span>Easy WhatsApp Returns</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
