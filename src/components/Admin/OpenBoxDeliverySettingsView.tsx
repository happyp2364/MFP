import React, { useState } from 'react';
import {
  Package,
  ShieldCheck,
  Box,
  CheckCircle2,
  Truck,
  Eye,
  Lock,
  Award,
  Save,
  Check,
  Layers,
  ShoppingBag,
  DollarSign,
  CreditCard,
  Sparkles,
  Info,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { OpenBoxDeliveryConfig } from '../../types';
import { OpenBoxDeliveryBadge } from '../Common/OpenBoxDeliveryBadge';

export const OpenBoxDeliverySettingsView: React.FC = () => {
  const { openBoxDeliveryConfig, updateOpenBoxDeliveryConfig, products, categoryHighlights, showToast } = useStore();

  const [formConfig, setFormConfig] = useState<OpenBoxDeliveryConfig>(() => ({
    ...openBoxDeliveryConfig,
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOpenBoxDeliveryConfig(formConfig);
      showToast('Open Box Delivery settings saved successfully!', 'success');
    } catch (err) {
      console.error('Error saving open box settings:', err);
      showToast('Failed to save settings. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormConfig({ ...openBoxDeliveryConfig });
    showToast('Reset to saved settings', 'info');
  };

  // Icon options
  const iconOptions = [
    { id: 'package', name: 'Package Box', Icon: Package },
    { id: 'shield', name: 'Security Shield', Icon: ShieldCheck },
    { id: 'box', name: 'Cargo Box', Icon: Box },
    { id: 'check', name: 'Verified Check', Icon: CheckCircle2 },
    { id: 'truck', name: 'Delivery Truck', Icon: Truck },
    { id: 'eye', name: 'Open Inspection', Icon: Eye },
    { id: 'lock', name: 'Protected Lock', Icon: Lock },
    { id: 'award', name: 'Quality Award', Icon: Award },
  ];

  // Badge Color options
  const badgeColorOptions = [
    { id: 'emerald', name: 'Emerald Green', bgClass: 'bg-[#0B8F63]' },
    { id: 'amber', name: 'Amber Gold', bgClass: 'bg-amber-500' },
    { id: 'blue', name: 'Ocean Blue', bgClass: 'bg-blue-600' },
    { id: 'indigo', name: 'Royal Indigo', bgClass: 'bg-indigo-600' },
    { id: 'purple', name: 'Deep Purple', bgClass: 'bg-purple-600' },
    { id: 'rose', name: 'Rose Red', bgClass: 'bg-rose-600' },
    { id: 'dark', name: 'Dark Onyx', bgClass: 'bg-neutral-900' },
  ];

  // Background Style options
  const bgStyleOptions = [
    { id: 'emerald-light', name: 'Soft Emerald', desc: 'Light mint tint' },
    { id: 'amber-light', name: 'Soft Amber', desc: 'Warm golden tint' },
    { id: 'blue-light', name: 'Soft Blue', desc: 'Clean azure tint' },
    { id: 'neutral-light', name: 'Minimal Neutral', desc: 'Off-white slate' },
    { id: 'dark-slate', name: 'Luxury Dark', desc: 'Dark obsidian background' },
  ];

  // Filtered products for selection
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const toggleCategorySelection = (catId: string) => {
    setFormConfig((prev) => {
      const current = prev.applicableCategoryIds || [];
      const updated = current.includes(catId)
        ? current.filter((id) => id !== catId)
        : [...current, catId];
      return { ...prev, applicableCategoryIds: updated };
    });
  };

  const toggleProductSelection = (prodId: string) => {
    setFormConfig((prev) => {
      const current = prev.applicableProductIds || [];
      const updated = current.includes(prodId)
        ? current.filter((id) => id !== prodId)
        : [...current, prodId];
      return { ...prev, applicableProductIds: updated };
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Save Controls */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 text-[#0B8F63] font-bold">
              <Package className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
              Open Box Delivery Management
            </h2>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${formConfig.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'}`}>
              {formConfig.enabled ? 'ACTIVE' : 'DISABLED'}
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Control open box inspection rules, badges, custom copy, colors, and conditional eligibility across your store.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#0B8F63] hover:bg-[#097551] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Settings Form, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Settings Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Master Switch Card */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Master System Switch</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Enable or disable Open Box Delivery badge globally on customer pages.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formConfig.enabled}
                  onChange={(e) => setFormConfig({ ...formConfig, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B8F63]"></div>
              </label>
            </div>

            {/* Custom Heading & Description */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Custom Heading
                </label>
                <input
                  type="text"
                  value={formConfig.heading}
                  onChange={(e) => setFormConfig({ ...formConfig, heading: e.target.value })}
                  placeholder="e.g. Open Box Delivery Available"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#0B8F63] focus:ring-1 focus:ring-[#0B8F63]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Custom Description
                </label>
                <textarea
                  rows={2}
                  value={formConfig.description}
                  onChange={(e) => setFormConfig({ ...formConfig, description: e.target.value })}
                  placeholder="Describe open box delivery process for customers..."
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#0B8F63] focus:ring-1 focus:ring-[#0B8F63]"
                />
              </div>
            </div>
          </div>

          {/* 2. Visual Styling & Customization */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-neutral-900 pb-2 border-b border-neutral-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0B8F63]" />
              <span>Badge Style & Design Settings</span>
            </h3>

            {/* Icon Picker */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-2">
                Custom Icon
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {iconOptions.map(({ id, name, Icon }) => {
                  const selected = formConfig.icon === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFormConfig({ ...formConfig, icon: id })}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        selected
                          ? 'border-[#0B8F63] bg-emerald-50/60 text-[#0B8F63] font-bold shadow-xs'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] truncate">{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Badge Accent Color */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-2">
                Badge Accent Color
              </label>
              <div className="flex flex-wrap gap-2">
                {badgeColorOptions.map(({ id, name, bgClass }) => {
                  const selected = formConfig.badgeColor === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFormConfig({ ...formConfig, badgeColor: id })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                        selected
                          ? 'border-neutral-900 ring-2 ring-neutral-900/20 font-bold bg-neutral-50'
                          : 'border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${bgClass}`} />
                      <span>{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Background Style */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-2">
                Card Background Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {bgStyleOptions.map(({ id, name, desc }) => {
                  const selected = formConfig.backgroundColor === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFormConfig({ ...formConfig, backgroundColor: id })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selected
                          ? 'border-[#0B8F63] bg-emerald-50/50 text-[#0B8F63] font-bold'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <span className="text-xs block font-bold">{name}</span>
                      <span className="text-[10px] text-neutral-500 font-normal">{desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Border Style & Display Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Border Style
                </label>
                <select
                  value={formConfig.borderStyle}
                  onChange={(e) => setFormConfig({ ...formConfig, borderStyle: e.target.value as any })}
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-[#0B8F63]"
                >
                  <option value="dashed">Dashed Border (Recommended)</option>
                  <option value="solid">Solid Border</option>
                  <option value="dotted">Dotted Border</option>
                  <option value="none">No Border</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Display Priority
                </label>
                <select
                  value={formConfig.displayPriority}
                  onChange={(e) => setFormConfig({ ...formConfig, displayPriority: e.target.value as any })}
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-[#0B8F63]"
                >
                  <option value="high">High Priority (Prominent Top)</option>
                  <option value="normal">Normal Priority (Standard)</option>
                  <option value="low">Low Priority (Compact Inline)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Conditional Applicability Rules */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-neutral-900 pb-2 border-b border-neutral-100 flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#0B8F63]" />
              <span>Conditional Eligibility Rules</span>
            </h3>

            {/* Scope Selection */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-2">
                Where should Open Box Delivery apply?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', title: 'All Products', icon: ShoppingBag },
                  { id: 'categories', title: 'Selected Categories', icon: Layers },
                  { id: 'products', title: 'Selected Products', icon: Package },
                ].map(({ id, title, icon: Icon }) => {
                  const selected = formConfig.applicabilityScope === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFormConfig({ ...formConfig, applicabilityScope: id as any })}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                        selected
                          ? 'border-[#0B8F63] bg-emerald-50 text-[#0B8F63] font-bold shadow-xs'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] leading-tight">{title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Selectors if applicabilityScope === 'categories' */}
            {formConfig.applicabilityScope === 'categories' && (
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 animate-in fade-in duration-200">
                <label className="text-xs font-bold text-neutral-700 block">
                  Select Applicable Categories
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'men', name: "Men's Collection" },
                    { id: 'women', name: "Women's Sports Shoes" },
                    { id: 'kids', name: "Kids' Footwear" },
                  ].map((cat) => {
                    const checked = (formConfig.applicableCategoryIds || []).includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategorySelection(cat.id)}
                        className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-between transition-all ${
                          checked
                            ? 'bg-[#0B8F63] text-white border-[#0B8F63]'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {checked && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Product Selectors if applicabilityScope === 'products' */}
            {formConfig.applicabilityScope === 'products' && (
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-700">
                    Select Specific Products ({formConfig.applicableProductIds?.length || 0} selected)
                  </label>
                  <span className="text-[10px] text-neutral-500">
                    {products.length} total catalog items
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search product by name or SKU..."
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:border-[#0B8F63]"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border border-neutral-200/60 rounded-lg p-2 bg-white">
                  {filteredProducts.map((prod) => {
                    const checked = (formConfig.applicableProductIds || []).includes(prod.id);
                    return (
                      <div
                        key={prod.id}
                        onClick={() => toggleProductSelection(prod.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          checked ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200' : 'hover:bg-neutral-50 text-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {prod.images && prod.images[0] && (
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-6 h-6 rounded object-cover shrink-0"
                            />
                          )}
                          <span className="truncate">{prod.name}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 shrink-0 ml-2">
                          ₹{prod.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payment Method Eligibility & Min Order Value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Payment Method Eligibility
                </label>
                <select
                  value={formConfig.paymentEligibility}
                  onChange={(e) => setFormConfig({ ...formConfig, paymentEligibility: e.target.value as any })}
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-[#0B8F63]"
                >
                  <option value="all">Both COD & Prepaid Orders</option>
                  <option value="cod_only">COD Only (Cash on Delivery)</option>
                  <option value="prepaid_only">Prepaid Orders Only (UPI / Cards)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Minimum Order Value (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formConfig.minOrderValue}
                  onChange={(e) => setFormConfig({ ...formConfig, minOrderValue: Math.max(0, Number(e.target.value) || 0) })}
                  placeholder="0 for all orders"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-[#0B8F63]"
                />
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Live Interactive Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs sticky top-24 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#0B8F63]" />
                <span>Live Website Preview</span>
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded uppercase tracking-wider">
                Real-Time
              </span>
            </div>

            {/* Product Page Preview */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                1. Product Page Preview
              </span>
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-neutral-200 shrink-0 overflow-hidden">
                    <img
                      src={products[0]?.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'}
                      alt="Sample product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-neutral-800 block truncate">
                      {products[0]?.name || 'Marudhar AirGlide Running Shoes'}
                    </span>
                    <span className="text-xs font-extrabold text-[#0B8F63]">
                      ₹{products[0]?.price || 1499}
                    </span>
                  </div>
                </div>

                <OpenBoxDeliveryBadge config={formConfig} variant="full" />
              </div>
            </div>

            {/* Checkout Screen Preview */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                2. Checkout Screen Preview
              </span>
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
                  <span>Order Verification</span>
                  <span className="text-emerald-600">Free</span>
                </div>

                <OpenBoxDeliveryBadge config={formConfig} variant="checkout" />
              </div>
            </div>

            {/* Compact Header Pill Preview */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                3. Compact Badge Tag
              </span>
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                <OpenBoxDeliveryBadge config={formConfig} variant="compact" />
              </div>
            </div>

            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 leading-snug flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Changes saved here sync immediately to Firestore and update customer devices automatically without refreshing.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
