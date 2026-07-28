import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { HeroContent, FloatingShoeItem } from '../../types';
import { Sparkles, Save, Video, Image, Layers, Plus, Trash2, Sliders, CheckCircle2 } from 'lucide-react';

export const HeroSectionManagerView: React.FC = () => {
  const { heroContent, updateHeroContent } = useStore();
  const [form, setForm] = useState<HeroContent>({
    badge: heroContent?.badge || 'Marudhar New Season Collection 2026',
    headlineMain: heroContent?.headlineMain || 'Walk in Style.',
    headlineHighlight: heroContent?.headlineHighlight || 'Royal Comfort & Authentic Fashion.',
    subtitle: heroContent?.subtitle || 'Discover Marudhar Fashion Point\'s exclusive lineup of high-grade athletic sneakers, royal leather loafers, women\'s sports shoes, and durable school footwear.',
    heroImage: heroContent?.heroImage || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
    stat1Number: heroContent?.stat1Number || '15,000+',
    stat1Label: heroContent?.stat1Label || 'Happy Families Served',
    stat2Number: heroContent?.stat2Number || '100%',
    stat2Label: heroContent?.stat2Label || 'Fit & Size Guarantee',
    stat3Number: heroContent?.stat3Number || '4.9★',
    stat3Label: heroContent?.stat3Label || 'Google Customer Rating',

    bgType: heroContent?.bgType || 'gradient',
    heroVideoUrl: heroContent?.heroVideoUrl || '',
    gradientTheme: heroContent?.gradientTheme || 'deep_emerald',

    primaryBtnText: heroContent?.primaryBtnText || 'Explore Collection',
    primaryBtnLink: heroContent?.primaryBtnLink || '#categories',
    whatsappBtnText: heroContent?.whatsappBtnText || 'Shop on WhatsApp',
    whatsappBtnLink: heroContent?.whatsappBtnLink || '',
    buyNowBtnText: heroContent?.buyNowBtnText || 'Buy Now',
    buyNowBtnLink: heroContent?.buyNowBtnLink || '#products',

    floatingShoes: heroContent?.floatingShoes || [
      {
        id: 'shoe-1',
        name: 'AirGlide Red Runner',
        imageUri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
        speedSec: 7.0,
        rotationDeg: 12,
        initialX: '82%',
        initialY: '18%',
        scale: 0.9,
      },
      {
        id: 'shoe-2',
        name: 'Royal Heritage Loafer',
        imageUri: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80',
        speedSec: 8.5,
        rotationDeg: -14,
        initialX: '8%',
        initialY: '62%',
        scale: 0.85,
      },
    ],

    particleDensity: heroContent?.particleDensity || 'medium',
    enableLightRays: heroContent?.enableLightRays ?? true,
    glowStrength: heroContent?.glowStrength || 'medium',
    parallaxStrength: heroContent?.parallaxStrength || 'medium',
    animationSpeed: heroContent?.animationSpeed || 'normal',
  });

  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateHeroContent(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 4000);
  };

  const addFloatingShoe = () => {
    const newShoe: FloatingShoeItem = {
      id: `shoe-${Date.now()}`,
      name: 'Custom Floating Shoe',
      imageUri: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
      speedSec: 7.5,
      rotationDeg: 10,
      initialX: '75%',
      initialY: '50%',
      scale: 0.85,
    };
    setForm({
      ...form,
      floatingShoes: [...(form.floatingShoes || []), newShoe],
    });
  };

  const removeFloatingShoe = (id: string) => {
    setForm({
      ...form,
      floatingShoes: (form.floatingShoes || []).filter((s) => s.id !== id),
    });
  };

  const updateFloatingShoe = (id: string, updated: Partial<FloatingShoeItem>) => {
    setForm({
      ...form,
      floatingShoes: (form.floatingShoes || []).map((s) => (s.id === id ? { ...s, ...updated } : s)),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Top Banner Notice */}
      {savedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-medium flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#0B8F63] shrink-0" />
            <span>
              <strong>Saved Successfully ✓</strong> 
            </span>
          </div>
        </div>
      )}

      {/* 1. Hero Text & Copywriting */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
        <h3 className="font-serif-heading font-bold text-base text-neutral-900 border-b border-neutral-100 pb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Hero Headings & Brand Copywriting</span>
        </h3>

        <div className="grid grid-cols-1 gap-4 text-xs">
          <div>
            <label className="font-bold text-neutral-700 block mb-1">Badge Text (Top Pill)</label>
            <input
              type="text"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none font-bold text-neutral-900"
              placeholder="e.g. Marudhar New Season Collection 2026"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Headline Line 1 (Main)</label>
              <input
                type="text"
                value={form.headlineMain}
                onChange={(e) => setForm({ ...form, headlineMain: e.target.value })}
                className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none font-bold text-neutral-900"
                placeholder="Walk in Style."
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Headline Line 2 (Highlighted Gradient)</label>
              <input
                type="text"
                value={form.headlineHighlight}
                onChange={(e) => setForm({ ...form, headlineHighlight: e.target.value })}
                className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none font-bold text-emerald-800"
                placeholder="Royal Comfort & Authentic Fashion."
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-neutral-700 block mb-1">Subtitle / Paragraph Description</label>
            <textarea
              rows={3}
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 outline-none text-xs font-medium"
            />
          </div>
        </div>
      </div>

      {/* 2. CTA Action Buttons */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
        <h3 className="font-serif-heading font-bold text-base text-neutral-900 border-b border-neutral-100 pb-2">
          Call-To-Action (CTA) Buttons
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Primary Button */}
          <div className="space-y-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <span className="font-bold text-neutral-800 block">Primary Action</span>
            <input
              type="text"
              value={form.primaryBtnText}
              onChange={(e) => setForm({ ...form, primaryBtnText: e.target.value })}
              placeholder="Button Label"
              className="w-full bg-white border border-neutral-200 rounded-lg p-2 font-bold"
            />
            <input
              type="text"
              value={form.primaryBtnLink}
              onChange={(e) => setForm({ ...form, primaryBtnLink: e.target.value })}
              placeholder="Target Link (#categories)"
              className="w-full bg-white border border-neutral-200 rounded-lg p-2 font-mono text-[11px]"
            />
          </div>

          {/* WhatsApp Button */}
          <div className="space-y-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
            <span className="font-bold text-emerald-900 block">WhatsApp Action</span>
            <input
              type="text"
              value={form.whatsappBtnText}
              onChange={(e) => setForm({ ...form, whatsappBtnText: e.target.value })}
              placeholder="Button Label"
              className="w-full bg-white border border-neutral-200 rounded-lg p-2 font-bold"
            />
            <input
              type="text"
              value={form.whatsappBtnLink}
              onChange={(e) => setForm({ ...form, whatsappBtnLink: e.target.value })}
              placeholder="Custom Link (Leave empty for default)"
              className="w-full bg-white border border-neutral-200 rounded-lg p-2 font-mono text-[11px]"
            />
          </div>

          {/* Buy Now Button */}
          <div className="space-y-2 p-3 bg-amber-50/50 rounded-xl border border-amber-200">
            <span className="font-bold text-amber-900 block">Buy Now Action</span>
            <input
              type="text"
              value={form.buyNowBtnText}
              onChange={(e) => setForm({ ...form, buyNowBtnText: e.target.value })}
              placeholder="Button Label"
              className="w-full bg-white border border-neutral-200 rounded-lg p-2 font-bold"
            />
            <input
              type="text"
              value={form.buyNowBtnLink}
              onChange={(e) => setForm({ ...form, buyNowBtnLink: e.target.value })}
              placeholder="Target Link (#products)"
              className="w-full bg-white border border-neutral-200 rounded-lg p-2 font-mono text-[11px]"
            />
          </div>
        </div>
      </div>

      {/* 3. Background & Lighting Controls */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
        <h3 className="font-serif-heading font-bold text-base text-neutral-900 border-b border-neutral-100 pb-2 flex items-center justify-between">
          <span>Background Mode & Atmospheric Effects</span>
          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            GPU Accelerated (60 FPS)
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, bgType: 'gradient' })}
            className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2 justify-center transition-all ${
              form.bgType === 'gradient'
                ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-md'
                : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Cinematic Gradient</span>
          </button>

          <button
            type="button"
            onClick={() => setForm({ ...form, bgType: 'image' })}
            className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2 justify-center transition-all ${
              form.bgType === 'image'
                ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-md'
                : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Background Image</span>
          </button>

          <button
            type="button"
            onClick={() => setForm({ ...form, bgType: 'video' })}
            className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2 justify-center transition-all ${
              form.bgType === 'video'
                ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-md'
                : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Hero Video MP4</span>
          </button>
        </div>

        {form.bgType === 'gradient' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Gradient Preset</label>
              <select
                value={form.gradientTheme || 'deep_emerald'}
                onChange={(e) => setForm({ ...form, gradientTheme: e.target.value as any })}
                className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 font-bold outline-none"
              >
                <option value="deep_emerald">Deep Forest Emerald & Gold</option>
                <option value="warm_noir">Warm Luxury Noir & Silver</option>
                <option value="royal_gold">Royal Emerald Gold</option>
                <option value="midnight_luxury">Midnight Sapphire Luxury</option>
              </select>
            </div>
          </div>
        )}

        {form.bgType === 'image' && (
          <div className="text-xs space-y-1 pt-2">
            <label className="font-bold text-neutral-700 block">Hero Background Image URL</label>
            <input
              type="text"
              value={form.heroImage}
              onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 font-mono text-xs outline-none"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
        )}

        {form.bgType === 'video' && (
          <div className="text-xs space-y-1 pt-2">
            <label className="font-bold text-neutral-700 block">Hero Background Video MP4 URL</label>
            <input
              type="text"
              value={form.heroVideoUrl || ''}
              onChange={(e) => setForm({ ...form, heroVideoUrl: e.target.value })}
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2.5 font-mono text-xs outline-none"
              placeholder="https://assets.mixkit.co/videos/preview/..."
            />
            <p className="text-[10px] text-neutral-500">Auto-plays muted in background on continuous loop.</p>
          </div>
        )}

        {/* Particles & Parallax Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-3 border-t border-neutral-100">
          <div>
            <label className="font-bold text-neutral-700 block mb-1">Floating Light Particles</label>
            <select
              value={form.particleDensity || 'medium'}
              onChange={(e) => setForm({ ...form, particleDensity: e.target.value as any })}
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2 font-bold outline-none"
            >
              <option value="off">Off (Disabled)</option>
              <option value="low">Low Density</option>
              <option value="medium">Medium Density (Recommended)</option>
              <option value="high">High Particle Density</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-neutral-700 block mb-1">Parallax Effect Strength</label>
            <select
              value={form.parallaxStrength || 'medium'}
              onChange={(e) => setForm({ ...form, parallaxStrength: e.target.value as any })}
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-2 font-bold outline-none"
            >
              <option value="disabled">Disabled</option>
              <option value="subtle">Subtle Movement</option>
              <option value="medium">Medium Parallax (Recommended)</option>
              <option value="strong">Strong Parallax</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
            <div>
              <span className="font-bold text-neutral-800 block">Sunlight Rays</span>
              <span className="text-[10px] text-neutral-500">Soft Shimmer Beams</span>
            </div>
            <input
              type="checkbox"
              checked={form.enableLightRays ?? true}
              onChange={(e) => setForm({ ...form, enableLightRays: e.target.checked })}
              className="w-4 h-4 accent-[#0B8F63] rounded cursor-pointer"
            />
          </div>
        </div>

      </div>

      {/* 4. Floating Decorative Sneakers */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#0B8F63]" />
            <h3 className="font-serif-heading font-bold text-base text-neutral-900">
              Floating Decorative Sneakers Manager
            </h3>
          </div>

          <button
            type="button"
            onClick={addFloatingShoe}
            className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Floating Shoe</span>
          </button>
        </div>

        <div className="space-y-4">
          {(form.floatingShoes || []).length === 0 ? (
            <p className="text-xs text-neutral-400 italic">No floating sneakers added yet. Click "Add Floating Shoe" above.</p>
          ) : (
            (form.floatingShoes || []).map((shoe, idx) => (
              <div key={shoe.id || idx} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-neutral-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{shoe.name || `Floating Shoe #${idx + 1}`}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFloatingShoe(shoe.id)}
                    className="text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-neutral-600 block mb-1">Shoe Title</label>
                    <input
                      type="text"
                      value={shoe.name}
                      onChange={(e) => updateFloatingShoe(shoe.id, { name: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-lg p-2 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-neutral-600 block mb-1">Transparent PNG Image URL</label>
                    <input
                      type="text"
                      value={shoe.imageUri}
                      onChange={(e) => updateFloatingShoe(shoe.id, { imageUri: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-lg p-2 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-600 block mb-1">Float Speed (Sec)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={shoe.speedSec}
                      onChange={(e) => updateFloatingShoe(shoe.id, { speedSec: parseFloat(e.target.value) || 7 })}
                      className="w-full bg-white border border-neutral-200 rounded-lg p-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-600 block mb-1">Position Left X (%)</label>
                    <input
                      type="text"
                      value={shoe.initialX}
                      onChange={(e) => updateFloatingShoe(shoe.id, { initialX: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-lg p-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-600 block mb-1">Position Top Y (%)</label>
                    <input
                      type="text"
                      value={shoe.initialY}
                      onChange={(e) => updateFloatingShoe(shoe.id, { initialY: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Save Button */}
      <button
        type="submit"
        className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs px-7 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
      >
        <Save className="w-4 h-4" />
        <span>Save Changes</span>
      </button>
    </form>
  );
};
