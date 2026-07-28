import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { HeroContent } from '../../types';
import { Sparkles, Save, CheckCircle2 } from 'lucide-react';

export const HeroSectionManagerView: React.FC = () => {
  const { heroContent, updateHeroContent, storeInfo } = useStore();
  const [form, setForm] = useState<HeroContent>({
    badge: heroContent?.badge || storeInfo?.name || 'Marudhar Fashion Point',
    headlineMain: heroContent?.headlineMain || 'Walk in Style.',
    headlineHighlight: heroContent?.headlineHighlight || 'Royal Comfort & Authentic Fashion.',
    subtitle:
      heroContent?.subtitle ||
      'Discover Marudhar Fashion Point\'s exclusive lineup of athletic sneakers, royal leather loafers, women\'s sports shoes, and durable footwear.',
    heroImage:
      heroContent?.heroImage ||
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
    primaryBtnText: heroContent?.primaryBtnText || 'Shop Now',
    primaryBtnLink: heroContent?.primaryBtnLink || '#products',
  });

  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateHeroContent(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 4000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Top Banner Notice */}
      {savedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-medium flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#0B8F63] shrink-0" />
            <span>
              <strong>Hero Section Updated!</strong> Your changes are saved to draft mode. Click <strong>🚀 Publish Website</strong> at the top to publish them live.
            </span>
          </div>
        </div>
      )}

      {/* Hero Settings */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
        <h3 className="font-serif-heading font-bold text-base text-neutral-900 border-b border-neutral-100 pb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Hero Banner Content</span>
        </h3>

        <div className="grid grid-cols-1 gap-4 text-xs">
          <div>
            <label className="font-bold text-neutral-700 block mb-1">Badge Text (Shop Name or Season)</label>
            <input
              type="text"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none font-bold text-neutral-900"
              placeholder="e.g. Marudhar Fashion Point"
            />
          </div>

          <div>
            <label className="font-bold text-neutral-700 block mb-1">Tagline / Main Heading</label>
            <input
              type="text"
              value={form.headlineHighlight}
              onChange={(e) => setForm({ ...form, headlineHighlight: e.target.value })}
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none font-bold text-emerald-800"
              placeholder="Royal Comfort & Authentic Fashion."
            />
          </div>

          <div>
            <label className="font-bold text-neutral-700 block mb-1">Short Tagline / Subtitle</label>
            <textarea
              rows={3}
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none text-xs font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-neutral-700 block mb-1">Banner Image URL</label>
            <input
              type="text"
              value={form.heroImage}
              onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 font-mono text-xs outline-none"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Button Text</label>
              <input
                type="text"
                value={form.primaryBtnText}
                onChange={(e) => setForm({ ...form, primaryBtnText: e.target.value })}
                className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 font-bold outline-none"
                placeholder="Shop Now"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Button Link</label>
              <input
                type="text"
                value={form.primaryBtnLink}
                onChange={(e) => setForm({ ...form, primaryBtnLink: e.target.value })}
                className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 font-mono text-xs outline-none"
                placeholder="#products"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        type="submit"
        className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs px-7 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
      >
        <Save className="w-4 h-4" />
        <span>SAVE HERO SETTINGS</span>
      </button>
    </form>
  );
};
