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
  Tag,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  PricePointCollectionConfig,
  DEFAULT_PRICE_POINT_CONFIG,
  PricePointSource,
} from '../../types';
import { PricePointCollectionSection } from '../Collections/PricePointCollectionSection';

export const PricePointSettingsView: React.FC = () => {
  const { pricePointConfig, updatePricePointConfig, products } = useStore();

  const [form, setForm] = useState<PricePointCollectionConfig>({
    ...DEFAULT_PRICE_POINT_CONFIG,
    ...pricePointConfig,
  });

  const [productSearch, setProductSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'source' | 'style' | 'schedule' | 'preview'>('content');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await updatePricePointConfig(form);
    setSaveMessage('⚡ Price Point Collection settings saved live to Firestore!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_PRICE_POINT_CONFIG });
  };

  const handleToggleProductSelection = (productId: string) => {
    const current = form.selectedProductIds || [];
    if (current.includes(productId)) {
      setForm({
        ...form,
        selectedProductIds: current.filter((id) => id !== productId),
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
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-emerald-950 text-white p-6 rounded-3xl border border-emerald-900/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>Budget & Price Point Collection Manager</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            🔥 ₹699 Shoe Collection Manager
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl">
            Configure the animated ₹699 (or custom budget) footwear showcase, price limits, cards, and smart deduplication.
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'content'
              ? 'bg-[#0B8F63] text-white shadow-md'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          📝 Titles & Price Threshold
        </button>

        <button
          onClick={() => setActiveTab('source')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'source'
              ? 'bg-[#0B8F63] text-white shadow-md'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          ⚡ Product Source & Filter ({form.selectedProductIds?.length || 0})
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
          📅 Scheduling & Smart Filters
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

      {/* TAB 1: CONTENT & PRICE THRESHOLD */}
      {activeTab === 'content' && (
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-900">Section Titles & Price Target</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="w-4 h-4 accent-[#0B8F63] rounded"
              />
              <span className="text-xs font-bold text-neutral-800">Enable Section on Homepage</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Price Threshold Selection */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Price Limit Threshold (₹)
              </label>
              <div className="flex gap-2 mb-2">
                {[499, 699, 999, 1499].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setForm({
                        ...form,
                        priceLimit: amt,
                        sectionTitle: `🔥 Starting at ₹${amt}`,
                        subtitle: `Premium Shoes Under ₹${amt}`,
                      });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      form.priceLimit === amt
                        ? 'bg-[#0B8F63] text-white border-[#0B8F63]'
                        : 'bg-neutral-100 border-neutral-300 text-neutral-800 hover:bg-neutral-200'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={form.priceLimit || 699}
                onChange={(e) => setForm({ ...form, priceLimit: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 focus:ring-2 focus:ring-[#0B8F63] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Badge Label Tag
              </label>
              <input
                type="text"
                value={form.badgeLabel || ''}
                onChange={(e) => setForm({ ...form, badgeLabel: e.target.value })}
                placeholder="UNBEATABLE VALUE"
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0B8F63] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={form.ctaText || ''}
                onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                placeholder="Explore Under ₹699"
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0B8F63] outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Section Main Title
              </label>
              <input
                type="text"
                value={form.sectionTitle}
                onChange={(e) => setForm({ ...form, sectionTitle: e.target.value })}
                placeholder="🔥 Starting at ₹699"
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-extrabold focus:ring-2 focus:ring-[#0B8F63] outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Subtitle / Description
              </label>
              <textarea
                rows={2}
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Premium Shoes Under ₹699"
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B8F63] outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT SOURCE & MANUAL PICKER */}
      {activeTab === 'source' && (
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-2">
                Product Selection Source Mode
              </label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value as PricePointSource })}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 focus:ring-2 focus:ring-[#0B8F63] outline-none"
              >
                <option value="price_limit">🏷️ Auto Filter (Shoes ≤ ₹{form.priceLimit || 699})</option>
                <option value="featured">🌟 Featured Shoes Under Budget</option>
                <option value="collection">🎓 Budget / Value Collection Tags</option>
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
                max={16}
                step={2}
                value={form.maxProducts || 8}
                onChange={(e) => setForm({ ...form, maxProducts: parseInt(e.target.value, 10) })}
                className="w-full accent-[#0B8F63] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-bold mt-1">
                <span>4 Shoes</span>
                <span>8 Shoes</span>
                <span>12 Shoes</span>
                <span>16 Shoes</span>
              </div>
            </div>
          </div>

          {/* Manual Selection Product Picker */}
          {form.source === 'manual' && (
            <div className="space-y-4 border-t border-neutral-200 pt-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Select Specific Shoes for Showcase ({form.selectedProductIds?.length || 0} selected)
                </h4>
                <input
                  type="text"
                  placeholder="Search footwear..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs outline-none focus:border-[#0B8F63]"
                />
              </div>

              {/* Selected Sequence List */}
              {form.selectedProductIds && form.selectedProductIds.length > 0 && (
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
                  <span className="text-[11px] font-bold text-neutral-600 block mb-2">
                    Current Sequence (Click arrows to reorder):
                  </span>
                  <div className="space-y-1.5">
                    {form.selectedProductIds.map((id, index) => {
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
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveProduct(index, 'down')}
                              disabled={index === form.selectedProductIds.length - 1}
                              className="p-1 hover:bg-neutral-100 rounded disabled:opacity-30 text-neutral-700 cursor-pointer"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleProductSelection(id)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
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

              {/* Product Grid Picker */}
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

      {/* TAB 3: THEMES & CARDS */}
      {activeTab === 'style' && (
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Background Theme */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-2">
                Background Theme
              </label>
              <select
                value={form.backgroundStyle}
                onChange={(e) => setForm({ ...form, backgroundStyle: e.target.value as any })}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 focus:ring-2 focus:ring-[#0B8F63] outline-none"
              >
                <option value="obsidian_emerald">✨ Obsidian Emerald (Dark Luxe)</option>
                <option value="midnight_purple">🌌 Midnight Purple Nebula</option>
                <option value="cream_gold">👑 Cream Gold Elegance</option>
                <option value="clean_white">⚪ Clean Minimalist White</option>
              </select>
            </div>

            {/* Card Style */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-2">
                Card Presentation Style
              </label>
              <select
                value={form.cardStyle}
                onChange={(e) => setForm({ ...form, cardStyle: e.target.value as any })}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 focus:ring-2 focus:ring-[#0B8F63] outline-none"
              >
                <option value="neon_glass">🔮 Floating Neon Glassmorphism</option>
                <option value="minimalist_glow">💡 Soft Ambient Glow</option>
                <option value="luxury_dark_gold">🏆 Luxury Dark Gold Trim</option>
              </select>
            </div>

            {/* Animation Style */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-2">
                Animation Flow
              </label>
              <select
                value={form.animationStyle}
                onChange={(e) => setForm({ ...form, animationStyle: e.target.value as any })}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 focus:ring-2 focus:ring-[#0B8F63] outline-none"
              >
                <option value="floating_airpods_flow">🎈 Floating AirPods-Style Motion</option>
                <option value="orbit_3d_deck">🛸 3D Orbit Deck Motion</option>
                <option value="stagger_slide">⚡ Staggered Slide In</option>
              </select>
            </div>

          </div>

          <div className="pt-4 border-t border-neutral-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enableAnimation}
                onChange={(e) => setForm({ ...form, enableAnimation: e.target.checked })}
                className="w-4 h-4 accent-[#0B8F63] rounded"
              />
              <span className="text-xs font-bold text-neutral-800">
                Enable Smooth Floating 3D Image Animations
              </span>
            </label>
          </div>
        </div>
      )}

      {/* TAB 4: SCHEDULING & SMART FILTERS */}
      {activeTab === 'schedule' && (
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-neutral-900">Smart Filters & Campaign Scheduling</h3>

          <div className="space-y-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.excludeOutofStock}
                onChange={(e) => setForm({ ...form, excludeOutofStock: e.target.checked })}
                className="w-4 h-4 accent-[#0B8F63] rounded"
              />
              <span className="text-xs font-bold text-neutral-800">
                Automatically Exclude Out-of-Stock Footwear
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.preventDuplicateHomepageItems}
                onChange={(e) => setForm({ ...form, preventDuplicateHomepageItems: e.target.checked })}
                className="w-4 h-4 accent-[#0B8F63] rounded"
              />
              <span className="text-xs font-bold text-neutral-800">
                Prevent Showing Duplicate Shoes Already Present in Nearby Homepage Sections
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Start Date & Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={form.scheduleStart || ''}
                onChange={(e) => setForm({ ...form, scheduleStart: e.target.value })}
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
                onChange={(e) => setForm({ ...form, scheduleEnd: e.target.value })}
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
              <Eye className="w-4 h-4" /> Live Interactive Section Preview
            </span>
            <span className="text-[11px] text-neutral-400">
              Matches current configuration
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-neutral-800">
            <PricePointCollectionSection />
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
          <span>Save Changes to Live Store</span>
        </button>
      </div>

    </div>
  );
};
