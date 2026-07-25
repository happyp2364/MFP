import React, { useState } from 'react';
import { Footprints, MessageCircle, Phone, Mail, MapPin, ShieldCheck, Heart, Send, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { generateGeneralInquiryWhatsAppLink } from '../../utils/whatsapp';

export const Footer: React.FC = () => {
  const { storeInfo } = useStore();
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

            <div className="pt-2 flex items-center gap-3">
              <a
                href={generateGeneralInquiryWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#0B8F63] hover:bg-[#086F4C] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white text-[#0B8F63]" />
                <span>Shop on WhatsApp</span>
              </a>

              <a
                href={storeInfo.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 text-white flex items-center justify-center transition-all shadow-sm"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>

              <a
                href={storeInfo.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-blue-600 text-white flex items-center justify-center transition-all shadow-sm"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>
              </a>

              <a
                href={storeInfo.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-sm"
                title="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
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
