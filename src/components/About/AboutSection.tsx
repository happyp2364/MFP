import React from 'react';
import { ShieldCheck, Award, Heart, CheckCircle2, Footprints, MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { generateGeneralInquiryWhatsAppLink } from '../../utils/whatsapp';

export const AboutSection: React.FC = () => {
  const { storeInfo } = useStore();

  return (
    <section id="about" className="py-20 bg-[#F7F7F7] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Store Image & Heritage Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/80 aspect-[4/5] bg-neutral-900 group">
              <img
                src="https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=80"
                alt="Marudhar Fashion Point Store Heritage"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Founder Tag */}
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] font-bold tracking-widest uppercase bg-[#0B8F63] text-white px-2.5 py-1 rounded-full">
                  Local Family Legacy
                </span>
                <h3 className="font-serif-heading text-xl font-bold">{storeInfo.ownerContact}</h3>
                <p className="text-xs text-white/80">Serving with personal care, size guarantee & WhatsApp convenience.</p>
              </div>
            </div>

            {/* Floating Trust Pill */}
            <div className="absolute -bottom-6 -right-4 glass-panel rounded-2xl p-4 shadow-xl border border-white/80 max-w-xs hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B8F63] text-white flex items-center justify-center shrink-0 font-bold">
                  100%
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900">Quality Guaranteed</div>
                  <div className="text-[10px] text-neutral-500">Every shoe inspected before dispatch</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Storytelling Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B8F63]/10 text-[#0B8F63] text-xs font-bold uppercase tracking-wider">
              <Footprints className="w-3.5 h-3.5" />
              About Our Store
            </div>

            <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
              Marudhar Fashion Point is a trusted destination for premium fashion and footwear.
            </h2>

            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              We provide quality products for men, women, and kids with affordable pricing and easy WhatsApp ordering. Guided by our founder Viju Bhai, customer satisfaction is our highest priority.
            </p>

            {/* Core Values Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#0B8F63]/10 text-[#0B8F63] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-neutral-900">National Brand Quality</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Ergonomic soles, breathable uppers, and long-lasting stitching.</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#0B8F63]/10 text-[#0B8F63] flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-neutral-900">Affordable Family Pricing</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Direct store value with fair discounts for every household budget.</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#0B8F63]/10 text-[#0B8F63] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-neutral-900">Instant WhatsApp Orders</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">No complicated checkouts—chat directly with our store team.</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#0B8F63]/10 text-[#0B8F63] flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-neutral-900">100% Fit & Exchange Guarantee</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Easy size replacements and friendly local support.</p>
                </div>
              </div>
            </div>

            {/* Direct Contact Action */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href={generateGeneralInquiryWhatsAppLink("Hello Viju Bhai, I want to know more about Marudhar Fashion Point's latest collection.")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-md shadow-[#0B8F63]/20 flex items-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white text-[#0B8F63]" />
                <span>Talk to Viju Bhai on WhatsApp</span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
