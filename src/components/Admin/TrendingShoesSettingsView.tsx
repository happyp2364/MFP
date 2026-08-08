import React, { useState } from 'react';
import {
  Flame,
  Save,
  RotateCcw,
  Sparkles,
  Sliders,
  Check,
  Eye,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Calendar,
  Layers,
  Palette,
  Zap,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  TrendingShoesCollectionConfig,
  DEFAULT_TRENDING_SHOES_CONFIG,
  TrendingShoesSource,
  Product,
} from '../../types';
import { TrendingShoesSection } from '../Collections/TrendingShoesSection';

export const TrendingShoesSettingsView: React.FC = () => {
  const { trendingShoesConfig, updateTrendingShoesConfig, products } = useStore();

  const [form, setForm] = useState<TrendingShoesCollectionConfig>({
    ...DEFAULT_TRENDING_SHOES_CONFIG,
    ...trendingShoesConfig,
  });

  const [productSearch, setProductSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'source' | 'style' | 'schedule' | 'preview'>('content');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await updateTrendingShoesConfig(form);
    setSaveMessage('✅ Trending Shoes Collection configuration saved live to Firestore!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_TRENDING_SHOES_CONFIG });
  };

  const handleToggleProductSelection = (productId: string) => {
    const current = form.selectedProductIds || [];
    if (current.includes(productId)) {
      setForm({
        ...form,
        selectedProductIds: current.filter((id: any) => id !== productId),
      });
    } else {
      setForm({
        ...form,
        selectedProductIds: [...current, productId],
      });
    }
  };

  const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
    const current = [...(form.selectedProductIds || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.length) return;

    const temp = current[index];
    current[index] = current[targetIndex];
    current[targetIndex] = temp;

    setForm({
      ...form,
      selectedProductIds: current,
    });
  };

  const filteredProductsForPicker = products.filter(
    (p: any) =>
      (p.name || '').toLowerCase().includes((productSearch || '').toLowerCase()) ||
      (p.brand || '').toLowerCase().includes((productSearch || '').toLowerCase()) ||
      (p.category || '').toLowerCase().includes((productSearch || '').toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-emerald-950 text-white p-6 rounded-3xl border border-emerald-900/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>Homepage Section Manager</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            🔥 Trending Shoes Collection Manager
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl">
            Configure the 3D interactive shoe showcase, automated product source, card layout, and animations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-white/20 hover:bg-white/10 text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#0B8F63] hover:bg-[#097551] text-white shadow-lg shadow-[#0B8F63]/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Live Settings</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main Controls Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'content'
              ? 'bg-[#0B8F63] text-white shadow-md'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          📝 Titles & Content
        </button>

        <button
          onClick={() => setActiveTab('source')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'source'
              ? 'bg-[#0B8F63] text-white shadow-md'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          ⚡ Product Source & Reorder ({form.selectedProductIds?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('style')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'style'
              ? 'bg-[#0B8F63] text-white shadow-md'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          🎨 Theme & Card Styles
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-[#0B8F63] text-white shadow-md'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          📅 Scheduling & Status
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-[#0B8F63] text-white shadow-md'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          👁️ Live Preview
        </button>
      </div>

      {/* TAB 1: CONTENT */}
      {activeTab === 'content' && (
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-900">Section Content & Headings</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e: any) => setForm({ ...form, enabled: e.target.checked })}
                className="w-4 h-4 accent-[#0B8F63] rounded"
              />
              <span className="text-xs font-bold text-neutral-800">Enable Section on Homepage</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Badge Label Tag
              </label>
              <input
                type="text"
                value={form.badgeLabel || ''}
                onChange={(e: any) => setForm({ ...form, badgeLabel: e.target.value })}
                placeholder="COLLEGE FAVOURITES"
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0B8F63] outline-none"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                Top small badge pill text
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={form.ctaText || ''}
                onChange={(e: any) => setForm({ ...form, ctaText: e.target.value })}
                placeholder="View All Shoes"
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0B8F63] outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Section Main Title
              </label>
              <input
                type="text"
                value={form.sectionTitle}
                onChange={(e: any) => setForm({ ...form, sectionTitle: e.target.value })}
                placeholder="🔥 Trending Shoes Collection"
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-extrabold focus:ring-2 focus:ring-[#0B8F63] outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Subtitle / Description
              </label>
              <textarea
                rows={2}
                value={form.subtitle}
                onChange={(e: any) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Discover our most popular college sports shoes."
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B8F63] outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT SOURCE & SELECTION */}
      {activeTab === 'source' && (
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-2">
                Automated Collection Source Mode
              </label>
              <select
                value={form.source}
                onChange={(e: any) => setForm({ ...form, source: e.target.value as TrendingShoesSource })}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 focus:ring-2 focus:ring-[#0B8F63] outline-none"
              >
                <option value="trending">🔥 Trending Products (Highest Reviews & Badges)</option>
                <option value="bestsellers">🏆 Best Sellers Only</option>
                <option value="newest">✨ Newest Arrivals</option>
                <option value="featured">🌟 Featured Collection</option>
                <option value="rating">⭐ Highest Rated Footwear</option>
                <option value="seasonal">🎓 Seasonal / College Collection</option>
                <option value="ai_recommended">🤖 AI Smart Recommended Mix</option>
                <option value="manual">🖐️ Manual Selection (Select Products Below)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-2">
                Maximum Displayed Shoes: <span className="text-[#0B8F63]">{form.maxProducts || 8}</span>
              </label>
              <input
                type="range"
                min={4}
                max={12}
                step={1}
                value={form.maxProducts || 8}
                onChange={(e: any) => setForm({ ...form, maxProducts: parseInt(e.target.value, 10) })}
                className="w-full accent-[#0B8F63] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-bold mt-1">
                <span>4 Shoes</span>
                <span>8 Shoes</span>
                <span>12 Shoes</span>
              </div>
            </div>
          </div>

          {/* Manual Selection Product Picker */}
          {form.source === 'manual' && (
            <div className="space-y-4 border-t border-neutral-200 pt-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Select Specific Shoes for Manual Showcase ({form.selectedProductIds?.length || 0} selected)
                </h4>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e: any) => setProductSearch(e.target.value)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs outline-none focus:border-[#0B8F63]"
                />
              </div>

              {/* Selected Order List with Move Up / Move Down */}
              {form.selectedProductIds && form.selectedProductIds.length > 0 && (
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
                  <span className="text-[11px] font-bold text-neutral-600 block mb-2">
                    Current Showcase Sequence (Click arrows to reorder):
                  </span>
                  <div className="space-y-1.5">
                    {form.selectedProductIds.map((id: any, index: any) => {
                      const p = products.find((prod: any) => prod.id === id);
                      if (!p) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-neutral-200 text-xs font-bold"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-neutral-400 text-[10px] w-4">{index + 1}.</span>
                            <img
                              src={p.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'}
                              alt=""
                              className="w-8 h-8 object-contain rounded"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-neutral-900 line-clamp-1">{p.name}</span>
                            <span className="text-emerald-600 font-extrabold">₹{p.price}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveProduct(index, 'up')}
                              disabled={index === 0}
                              className="p-1 hover:bg-neutral-100 rounded disabled:opacity-30 text-neutral-700 cursor-pointer"
                              title="Move Up"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveProduct(index, 'down')}
                              disabled={index === form.selectedProductIds.length - 1}
                              className="p-1 hover:bg-neutral-100 rounded disabled:opacity-30 text-neutral-700 cursor-pointer"
                              title="Move Down"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleProductSelection(id)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Product Grid Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1 border border-neutral-200 rounded-2xl">
                {filteredProductsForPicker.map((prod: any) => {
                  const isSelected = form.selectedProductIds?.includes(prod.id);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleToggleProductSelection(prod.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                          : 'bg-white border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 accent-[#0B8F63]"
                      />
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'}
                        alt=""
                        className="w-10 h-10 object-contain rounded"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-bold text-neutral-900 truncate">{prod.name}</p>
                        <p className="text-neutral-500 text-[10px]">₹{prod.price}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STYLES & ANIMATIONS */}
      {activeTab === 'style' && (
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Background Style */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-2">
                Background Theme
              </label>
              <select
                value={form.backgroundStyle}
                onChange={(e: any) =>
                  setForm({
                    ...form,
                    backgroundStyle: e.target.value as any,
                  })
                }
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 focus:ring-2 focus:ring-[#0B8F63] outline-none"
              >
                <option value="dark_glass">✨ Dark Ambient Glass (Recommended)</option>
                <option value="premium_cream">👑 Premium Gold Cream</option>
                <option value="neon_emerald">⚡ Neon Obsidian Emerald</option>
                <option value="clean_white">⚪ Minimalist Crisp White</option>
              </select>
            </div>

            {/* Card Style */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-2">
                Card Presentation Style
              </label>
              <select
                value={form.cardStyle}
                onChange={(e: any) =>
                  setForm({
                    ...form,
                    cardStyle: e.target.value as any,
                  })
                }
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 focus:ring-2 focus:ring-[#0B8F63] outline-none"
              >
                <option value="floating_showcase">🎈 Floating Showcase (Interactive Deck)</option>
                <option value="3d_glass">🔮 3D Glassmorphism Panel</option>
                <option value="elevated_modern">Structured Elevated Modern</option>
              </select>
            </div>

            {/* Transition Speed */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-2">
                Transition Speed
              </label>
              <select
                value={form.transitionSpeed}
                onChange={(e: any) =>
                  setForm({
                    ...form,
                    transitionSpeed: e.target.value as any,
                  })
                }
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 focus:ring-2 focus:ring-[#0B8F63] outline-none"
              >
                <option value="fast">⚡ Fast (3 Seconds)</option>
                <option value="normal">🎯 Normal (4.5 Seconds)</option>
                <option value="smooth">🌊 Smooth Slow (6 Seconds)</option>
              </select>
            </div>

          </div>

          <div className="pt-4 border-t border-neutral-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enableAnimation}
                onChange={(e: any) => setForm({ ...form, enableAnimation: e.target.checked })}
                className="w-4 h-4 accent-[#0B8F63] rounded"
              />
              <span className="text-xs font-bold text-neutral-800">
                Enable Smooth Floating & Auto-rotation Animations
              </span>
            </label>
          </div>
        </div>
      )}

      {/* TAB 4: SCHEDULING */}
      {activeTab === 'schedule' && (
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-neutral-900">Section Display Scheduling</h3>
          <p className="text-xs text-neutral-500">
            Optionally set dates to automatically publish or retire this section during seasonal campaigns.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Start Date & Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={form.scheduleStart || ''}
                onChange={(e: any) => setForm({ ...form, scheduleStart: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0B8F63] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                End Date & Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={form.scheduleEnd || ''}
                onChange={(e: any) => setForm({ ...form, scheduleEnd: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0B8F63] outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LIVE PREVIEW */}
      {activeTab === 'preview' && (
        <div className="bg-neutral-900 p-4 rounded-3xl border border-neutral-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between text-white px-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> Realtime Interactive Preview
            </span>
            <span className="text-[11px] text-neutral-400">
              Matches your current live configuration
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-neutral-800">
            <TrendingShoesSection />
          </div>
        </div>
      )}

      {/* Save Button Footer */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={() => handleSave()}
          className="px-8 py-3 rounded-2xl font-black text-sm bg-[#0B8F63] hover:bg-[#097551] text-white shadow-xl shadow-[#0B8F63]/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes to Live Website</span>
        </button>
      </div>

    </div>
  );
};
