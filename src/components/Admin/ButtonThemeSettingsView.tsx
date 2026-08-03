import React, { useState } from 'react';
import {
  Sparkles,
  Save,
  RotateCcw,
  Palette,
  Sliders,
  Eye,
  CheckCircle2,
  Zap,
  ShoppingBag,
  Heart,
  Eye as EyeIcon,
  Filter,
  Check,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Lock,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ButtonThemeConfig, DEFAULT_BUTTON_THEME_CONFIG } from '../../types';
import { LiquidButton } from '../UI/LiquidButton';

export const ButtonThemeSettingsView: React.FC = () => {
  const { buttonThemeConfig, updateButtonThemeConfig } = useStore();

  const [form, setForm] = useState<ButtonThemeConfig>({
    ...DEFAULT_BUTTON_THEME_CONFIG,
    ...buttonThemeConfig,
  });

  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await updateButtonThemeConfig(form);
    setSaveMessage('✨ Global Liquid Button Theme settings updated live!');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_BUTTON_THEME_CONFIG });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-emerald-950 text-white p-6 rounded-3xl border border-emerald-900/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Global Liquid UI Design System</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            💧 Global Liquid Button Manager
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl">
            Customize button physics, glassmorphism highlights, corner radii, liquid glows, and colors across the entire store.
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

          <LiquidButton
            variant="emerald"
            size="sm"
            onClick={() => handleSave()}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Button System
          </LiquidButton>
        </div>
      </div>

      {saveMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Form Controls */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#0B8F63]" />
            <span>Button System Parameters</span>
          </h3>

          {/* Color Palettes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-9 h-9 rounded-xl border border-neutral-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Secondary Dark Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="w-9 h-9 rounded-xl border border-neutral-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Accent Gold Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  className="w-9 h-9 rounded-xl border border-neutral-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Corner Radius & Glass Opacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-2">
                Corner Radius / Pill Geometry
              </label>
              <select
                value={form.borderRadius}
                onChange={(e) => setForm({ ...form, borderRadius: e.target.value as any })}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#0B8F63]"
              >
                <option value="rounded-lg">Rounded Large (8px)</option>
                <option value="rounded-xl">Rounded XL (12px)</option>
                <option value="rounded-2xl">Rounded 2XL (16px) - Default</option>
                <option value="rounded-3xl">Rounded 3XL (24px)</option>
                <option value="rounded-full">Full Pill Shape (Rounded-Full)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-2">
                Shadow & Glow Intensity
              </label>
              <select
                value={form.shadowStrength}
                onChange={(e) => setForm({ ...form, shadowStrength: e.target.value as any })}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#0B8F63]"
              >
                <option value="none">Flat (No Shadow)</option>
                <option value="soft">Soft Ambient Shadow</option>
                <option value="medium">Medium Elevated Shadow</option>
                <option value="deep">Deep Layered Shadow</option>
                <option value="liquid_glow">🔥 Dynamic Liquid Glow (Recommended)</option>
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-4 border-t border-neutral-200">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Liquid Animation Toggles
            </h4>

            <label className="flex items-center justify-between p-3 bg-neutral-50 rounded-2xl border border-neutral-200 cursor-pointer">
              <span className="text-xs font-bold text-neutral-800">
                Smooth Hover Lift & Scale (1.02x)
              </span>
              <input
                type="checkbox"
                checked={form.enableHoverAnimation}
                onChange={(e) => setForm({ ...form, enableHoverAnimation: e.target.checked })}
                className="w-4 h-4 accent-[#0B8F63] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-neutral-50 rounded-2xl border border-neutral-200 cursor-pointer">
              <span className="text-xs font-bold text-neutral-800">
                Liquid Glass Shimmer Highlight Reflection
              </span>
              <input
                type="checkbox"
                checked={form.enableLiquidHighlight}
                onChange={(e) => setForm({ ...form, enableLiquidHighlight: e.target.checked })}
                className="w-4 h-4 accent-[#0B8F63] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-neutral-50 rounded-2xl border border-neutral-200 cursor-pointer">
              <span className="text-xs font-bold text-neutral-800">
                Touch / Pointer Ripple Feedback
              </span>
              <input
                type="checkbox"
                checked={form.enableRipple}
                onChange={(e) => setForm({ ...form, enableRipple: e.target.checked })}
                className="w-4 h-4 accent-[#0B8F63] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-neutral-50 rounded-2xl border border-neutral-200 cursor-pointer">
              <span className="text-xs font-bold text-neutral-800">
                Ambient Pulse Glow on Focus / Primary Buttons
              </span>
              <input
                type="checkbox"
                checked={form.enableGlow}
                onChange={(e) => setForm({ ...form, enableGlow: e.target.checked })}
                className="w-4 h-4 accent-[#0B8F63] rounded"
              />
            </label>
          </div>
        </div>

        {/* Right Column: Live Interactive Playground */}
        <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 shadow-2xl space-y-6 text-white">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Live Interactive Button Playground
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-extrabold border border-emerald-500/20">
              Interactive Preview
            </span>
          </div>

          <p className="text-xs text-neutral-400">
            Hover and click any button below to test the active liquid highlight, press physics, and colors.
          </p>

          <div className="space-y-6">
            
            {/* Primary & Secondary Action Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                Primary & E-Commerce CTA Buttons
              </span>
              <div className="flex flex-wrap gap-3">
                <LiquidButton variant="emerald" size="md" leftIcon={<Zap className="w-4 h-4 fill-white" />}>
                  BUY NOW
                </LiquidButton>

                <LiquidButton variant="dark" size="md" leftIcon={<ShoppingBag className="w-4 h-4" />}>
                  Add to Cart
                </LiquidButton>

                <LiquidButton variant="gold" size="md" leftIcon={<Sparkles className="w-4 h-4" />}>
                  Checkout (₹699)
                </LiquidButton>
              </div>
            </div>

            {/* Sizes Showcase */}
            <div className="space-y-2 pt-4 border-t border-neutral-800">
              <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                Button Scale Spectrum (XS to XL)
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <LiquidButton size="xs">XS Tag</LiquidButton>
                <LiquidButton size="sm">SM Button</LiquidButton>
                <LiquidButton size="md">MD Regular</LiquidButton>
                <LiquidButton size="lg">LG Large</LiquidButton>
              </div>
            </div>

            {/* Utility & Action Buttons */}
            <div className="space-y-2 pt-4 border-t border-neutral-800">
              <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                Utility & Secondary Actions
              </span>
              <div className="flex flex-wrap gap-3">
                <LiquidButton variant="ghost" size="sm" leftIcon={<Heart className="w-3.5 h-3.5" />}>
                  Wishlist
                </LiquidButton>

                <LiquidButton variant="ghost" size="sm" leftIcon={<EyeIcon className="w-3.5 h-3.5" />}>
                  Quick View
                </LiquidButton>

                <LiquidButton variant="outline" size="sm" leftIcon={<Filter className="w-3.5 h-3.5" />}>
                  Apply Filters
                </LiquidButton>

                <LiquidButton variant="danger" size="sm" leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                  Remove Item
                </LiquidButton>
              </div>
            </div>

            {/* Loading State Preview */}
            <div className="space-y-2 pt-4 border-t border-neutral-800">
              <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                Loading State Feedback
              </span>
              <div className="flex flex-wrap gap-3">
                <LiquidButton variant="emerald" size="md" isLoading>
                  Processing Order...
                </LiquidButton>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Save Button Footer */}
      <div className="flex justify-end pt-4">
        <LiquidButton
          variant="emerald"
          size="lg"
          onClick={() => handleSave()}
          leftIcon={<Save className="w-5 h-5" />}
        >
          Save Changes to Entire Application
        </LiquidButton>
      </div>

    </div>
  );
};
