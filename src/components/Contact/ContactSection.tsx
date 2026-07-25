import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ContactFormInput } from '../../types';

interface ContactSectionProps {
  onOpenCalendarModal?: () => void;
  onOpenGmailModal?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  onOpenCalendarModal,
  onOpenGmailModal,
}) => {
  const { storeInfo } = useStore();

  const [formData, setFormData] = useState<ContactFormInput>({
    name: '',
    phone: '',
    email: '',
    category: 'Men Footwear',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    // Send formatted message directly to WhatsApp!
    const text = `Hello Marudhar Fashion Point,

Inquiry / Order Request from Website:
Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email || 'N/A'}
Category Interest: ${formData.category}
Message: ${formData.message || 'I want to check latest availability.'}`;

    const encodedText = encodeURIComponent(text);
    const link = `https://wa.me/${storeInfo.whatsappNumber}?text=${encodedText}`;

    setSubmitted(true);
    setTimeout(() => {
      window.open(link, '_blank');
      setSubmitted(false);
      setFormData({ name: '', phone: '', email: '', category: 'Men Footwear', message: '' });
    }, 1200);
  };

  return (
    <section id="contact" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0B8F63] px-3 py-1 rounded-full bg-[#0B8F63]/10 inline-block">
            Get in Touch
          </span>
          <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900">
            Visit Store or Order Online
          </h2>
          <p className="text-sm text-neutral-600">
            Have questions about sizes, bulk wedding orders, or custom fitting? Connect with us directly on WhatsApp or visit our store.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Store Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Address */}
            <div className="bg-[#F7F7F7] p-5 rounded-2xl border border-neutral-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#0B8F63] text-white flex items-center justify-center shrink-0 shadow-sm">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">Store Address</h4>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {storeInfo.address}
                </p>
              </div>
            </div>

            {/* Phone & WhatsApp */}
            <div className="bg-[#F7F7F7] p-5 rounded-2xl border border-neutral-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#0B8F63] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">Phone & WhatsApp</h4>
                <div className="text-xs text-neutral-700 font-semibold mt-1 space-y-1">
                  <a href={`tel:${storeInfo.phone}`} className="flex items-center gap-1.5 hover:text-[#0B8F63] transition-colors">
                    <Phone className="w-3.5 h-3.5 text-[#0B8F63]" />
                    <span>Call: {storeInfo.phone}</span>
                  </a>
                  <a href={`https://wa.me/${storeInfo.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#0B8F63] hover:underline transition-colors">
                    <MessageCircle className="w-3.5 h-3.5 fill-[#0B8F63] text-[#0B8F63]" />
                    <span>WhatsApp: +{storeInfo.whatsappNumber}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-[#F7F7F7] p-5 rounded-2xl border border-neutral-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#0B8F63] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">Email Us</h4>
                <p className="text-xs text-neutral-600 mt-1">{storeInfo.email}</p>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-[#F7F7F7] p-5 rounded-2xl border border-neutral-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#0B8F63] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">Store Hours</h4>
                <p className="text-xs text-neutral-600 mt-1 font-semibold">{storeInfo.businessHours}</p>
                <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Open Today
                </span>
              </div>
            </div>

            {/* Google Calendar VIP Fitting Banner */}
            {onOpenCalendarModal && (
              <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-5 rounded-2xl border border-neutral-800 shadow-md space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0B8F63] flex items-center justify-center text-white">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">Book VIP Store Fitting</h4>
                    <p className="text-[10px] text-emerald-400 font-semibold">Google Calendar Integration</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-snug">
                  Reserve a personal fitting session with our footwear specialists and sync the event directly to your Google Calendar.
                </p>
                <button
                  type="button"
                  onClick={onOpenCalendarModal}
                  className="w-full bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Book Fitting on Google Calendar</span>
                </button>
              </div>
            )}

            {/* Gmail Direct Inquiry Banner */}
            {onOpenGmailModal && (
              <div className="bg-red-50 border border-red-200/80 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-red-950 uppercase tracking-wider">Send Direct Email</h4>
                    <p className="text-[10px] text-red-600 font-semibold">Gmail API Integration</p>
                  </div>
                </div>
                <p className="text-xs text-red-900 leading-snug">
                  Send footwear size requests or bulk order specs directly from your Gmail account to {storeInfo.email}.
                </p>
                <button
                  type="button"
                  onClick={onOpenGmailModal}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Email via Gmail</span>
                </button>
              </div>
            )}

            {/* Interactive Google Maps Preview */}
            <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-sm aspect-video">
              <iframe
                title="Marudhar Fashion Point Location"
                src={storeInfo.googleMapsEmbed}
                className="w-full h-full border-0"
                allowFullScreen={false}
                loading="lazy"
              />
            </div>

          </div>

          {/* Right Contact / Order Form */}
          <div className="lg:col-span-7 bg-[#F7F7F7] p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-sm space-y-6">
            <div>
              <h3 className="font-serif-heading font-bold text-2xl text-neutral-900">
                Send Direct Message or Order Query
              </h3>
              <p className="text-xs text-neutral-600 mt-1">
                Submitting this form connects you directly with our WhatsApp store assistant!
              </p>
            </div>

            {submitted ? (
              <div className="py-12 text-center space-y-3 bg-white rounded-2xl p-6 border border-emerald-100">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#0B8F63] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg text-neutral-900">Opening WhatsApp...</h4>
                <p className="text-xs text-neutral-600">Connecting you with Marudhar Fashion Point assistant.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-white border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Mobile / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9829012345"
                      className="w-full bg-white border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. ramesh@gmail.com"
                      className="w-full bg-white border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Product Category Interest</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none font-medium"
                    >
                      <option value="Men Footwear">Men's Footwear & Sneakers</option>
                      <option value="Women Sports Shoes">Women's Sports Shoes</option>
                      <option value="Kids Shoes">Kids' School & Party Shoes</option>
                      <option value="Wedding Juttis">Wedding / Festive Special</option>
                      <option value="Apparel">Clothing & Apparel</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Your Requirements / Shoe Size / Message</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe what size or style you are looking for..."
                    className="w-full bg-white border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-[#0B8F63]/20 flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-5 h-5 fill-white text-[#0B8F63]" />
                  <span>Send Message on WhatsApp</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
