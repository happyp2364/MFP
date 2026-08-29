import React, { useState } from 'react';
import { 
  Footprints, MessageCircle, Phone, Mail, MapPin, ShieldCheck, Heart, Send, Sparkles
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { generateGeneralInquiryWhatsAppLink } from '../../utils/whatsapp';
import { SocialIconRenderer } from '../Social/SocialIconRenderer';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const { storeInfo, websiteConfig, socialMediaConfig, recordSocialClick } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const copyrightTapCount = React.useRef(0);
  const copyrightTapTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const handleCopyrightClick = () => {
    if (!onOpenAdmin) return;
    copyrightTapCount.current += 1;
    if (copyrightTapCount.current >= 5) {
      onOpenAdmin();
      copyrightTapCount.current = 0;
    }
    if (copyrightTapTimeout.current) clearTimeout(copyrightTapTimeout.current);
    copyrightTapTimeout.current = setTimeout(() => {
      copyrightTapCount.current = 0;
    }, 2000);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setNewsletterEmail('');
    }, 2500);
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
              मारुधर फैमिली क्लब • Join Marudhar Family Club
            </div>
            <h3 className="font-serif-heading text-2xl sm:text-3xl font-bold">
              विशेष ऑफर और नए कलेक्शन की जानकारी • Get Exclusive Deals & Updates
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400">
              सीजनल कैटलॉग और डिस्काउंट अपडेट सीधे व्हाट्सएप या ईमेल पर पाएं। Subscribe for seasonal catalog updates on WhatsApp & Email.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2 max-w-md">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="ईमेल या व्हाट्सऐप नंबर दर्ज करें"
              className="bg-neutral-900 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#0B8F63] flex-1"
            />
            <button
              type="submit"
              className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold text-xs px-6 py-3 rounded-2xl transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
            >
              <span>{subscribed ? 'जुड़ गए! • Subscribed!' : 'जुड़ें • Subscribe'}</span>
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
                  {websiteConfig?.businessIdentity?.businessName || storeInfo.name}
                </span>
                <p className="text-[10px] text-[#0B8F63] font-bold tracking-wide uppercase">
                  {websiteConfig?.businessIdentity?.tagline || storeInfo.tagline}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              भीलवाड़ा का भरोसेमंद पारिवारिक शोरूम — बेहतरीन स्पोर्ट्स शूज, फॉर्मल लेदर जूते, राजस्थानी जूतियां, स्कूल शूज और पुरुषों के परिधान।
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
                        <SocialIconRenderer 
                          iconNameOrUrl={plat.customIcon} 
                          platformId={plat.id} 
                          className="w-4 h-4" 
                        />
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
                    <span>व्हाट्सऐप पर संपर्क करें • WhatsApp</span>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0B8F63]">
              महत्वपूर्ण लिंक्स • Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><a href="#hero" className="hover:text-white transition-colors">होम पेज • Home</a></li>
              <li><a href="#categories" className="hover:text-white transition-colors">कैटेगरी • Categories</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">सभी उत्पाद • All Products</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">ग्राहक समीक्षाएं • Reviews</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">हमारे बारे में • About Us</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">दुकान का पता • Location</a></li>
            </ul>
          </div>

          {/* Col 3: Product Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0B8F63]">
              लोकप्रिय कलेक्शन • Collections
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">मेंस स्पोर्ट्स शूज • Running Shoes</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">लेदर लोफर्स • Formal Loafers</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">विमेंस स्नीकर्स • Women's Shoes</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">राजस्थानी जूतियां • Kolhapuris</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">किड्स स्कूल शूज • Kids' Shoes</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">मेंस शर्ट्स व पैंट्स • Men's Apparel</span></li>
            </ul>
          </div>

          {/* Col 4: Store Contact */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0B8F63]">
              संपर्क विवरण • Store Contact
            </h4>
            <div className="space-y-2 text-xs text-neutral-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#0B8F63] shrink-0 mt-0.5" />
                <span>{storeInfo.address}</span>
              </div>
              <a href={`tel:${storeInfo.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-[#0B8F63] shrink-0" />
                <span>फोन: {storeInfo.phone}</span>
              </a>
              <a href={generateGeneralInquiryWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4 text-[#0B8F63] shrink-0 fill-[#0B8F63]/20" />
                <span>व्हाट्सऐप: +{storeInfo.whatsappNumber}</span>
              </a>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0B8F63] shrink-0" />
                <span>{storeInfo.email}</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold pt-1">
                समय: {storeInfo.businessHours}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Guarantees & Copyright Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-1 select-none cursor-pointer" onClick={handleCopyrightClick} onDoubleClick={onOpenAdmin}>
            <span>{websiteConfig?.footer?.copyrightText || `© ${new Date().getFullYear()} ${websiteConfig?.businessIdentity?.businessName || storeInfo.name}. सर्वाधिकार सुरक्षित • All rights reserved.`}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-400">
            <span>💯 100% सही साइज गारंटी • Fit Guarantee</span>
            <span>•</span>
            <span>⚡ तेज डिलीवरी • Fast Shipping</span>
            <span>•</span>
            <span>💬 आसान व्हाट्सएप सहायता • Easy Support</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
