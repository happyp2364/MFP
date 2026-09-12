import React, { useState } from 'react';
import { Palette, Check, Sparkles, Eye, ShieldCheck, RefreshCw, X, ArrowRight } from 'lucide-react';
import { useWebsiteDesign } from '../../context/WebsiteDesignContext';
import { THEMES_REGISTRY, ThemeDefinition } from '../../data/themesRegistry';

interface ThemesStudioViewProps {
  showToast: (msg: string) => void;
}

export const ThemesStudioView: React.FC<ThemesStudioViewProps> = ({ showToast }) => {
  const { websiteDesignSettings, updateDraftDesignSettings, saveWebsiteDesignSettings } = useWebsiteDesign();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'brand' | 'nature' | 'weather' | 'festival' | 'social'>('all');
  const [previewTheme, setPreviewTheme] = useState<ThemeDefinition | null>(null);
  const [confirmTheme, setConfirmTheme] = useState<ThemeDefinition | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const activeThemeId = websiteDesignSettings.activeThemeId || 'local';

  const handleApplyTheme = async (theme: ThemeDefinition) => {
    setIsApplying(true);
    try {
      const updated = {
        ...websiteDesignSettings,
        activeThemeId: theme.id,
      };
      updateDraftDesignSettings(updated, true);
      await saveWebsiteDesignSettings(updated, 'Admin Theme Studio');
      showToast(`Successfully applied "${theme.name}" theme across the storefront!`);
      setConfirmTheme(null);
    } catch (err) {
      console.error('Error applying theme:', err);
      showToast('Failed to apply theme. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const filteredThemes = Object.values(THEMES_REGISTRY).filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1.5">
            <Palette className="w-4 h-4" />
            <span>Global Theme Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight">
            Change the Mood of Your Store
          </h1>
          <p className="text-sm text-neutral-300 mt-1 max-w-2xl leading-relaxed">
            Instantly transform the entire customer storefront visual identity—including colors, typography, surfaces, badges, and seasonal motifs—with professional curated themes.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-neutral-800/80 border border-neutral-700/80 px-4 py-3 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
            {THEMES_REGISTRY[activeThemeId]?.decoration.icon || '✨'}
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Active Theme</span>
            <span className="text-sm font-extrabold text-white">
              {THEMES_REGISTRY[activeThemeId]?.name || 'Local'}
            </span>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-200">
        {[
          { id: 'all', label: 'All Themes (20)' },
          { id: 'social', label: '📸 Social / Instagram Inspired' },
          { id: 'brand', label: 'Brand & Base' },
          { id: 'nature', label: 'Nature & Botanical' },
          { id: 'weather', label: 'Weather & Seasons' },
          { id: 'festival', label: 'Festivals & Luxury' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === tab.id
                ? 'bg-[#0B8F63] text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredThemes.map((theme) => {
          const isActive = activeThemeId === theme.id;

          return (
            <div
              key={theme.id}
              className={`relative bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl ${
                isActive ? 'border-[#0B8F63] ring-2 ring-[#0B8F63]/20' : 'border-neutral-200'
              }`}
            >
              {/* Card Header & Preview Mock */}
              <div
                className="p-5 border-b border-neutral-100 relative overflow-hidden"
                style={{ backgroundColor: theme.colors.background }}
              >
                {/* Decorative background glow */}
                <div
                  className="absolute -right-6 -top-6 w-32 h-32 rounded-full blur-2xl opacity-40 pointer-events-none"
                  style={{ backgroundColor: theme.colors.primary }}
                />

                <div className="flex items-start justify-between relative z-10 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{theme.decoration.icon}</span>
                    <div>
                      <h3
                        className="font-serif font-black text-base"
                        style={{ color: theme.colors.text, fontFamily: theme.fonts.heading }}
                      >
                        {theme.name}
                      </h3>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-200/60 text-neutral-700">
                        {theme.category}
                      </span>
                    </div>
                  </div>

                  {isActive && (
                    <span className="px-3 py-1 rounded-full bg-[#0B8F63] text-white text-[10px] font-black uppercase flex items-center gap-1 shadow-xs">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>

                <p
                  className="text-xs line-clamp-2 mb-4 relative z-10"
                  style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body }}
                >
                  {theme.description}
                </p>

                {/* Mini Website Component Mock */}
                <div
                  className="rounded-2xl p-3 border shadow-xs space-y-2 relative z-10"
                  style={{
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  }}
                >
                  <div className="flex items-center justify-between text-[10px]" style={{ color: theme.colors.text }}>
                    <span className="font-bold">MFP Store</span>
                    <span
                      className="px-2 py-0.5 rounded text-[9px] font-bold"
                      style={{ backgroundColor: theme.colors.badge, color: theme.colors.badgeText }}
                    >
                      ₹1,299
                    </span>
                  </div>
                  <div
                    className="w-full py-2 rounded-lg text-center text-[10px] font-bold"
                    style={{
                      backgroundColor: theme.colors.button,
                      color: theme.colors.buttonText,
                      borderRadius: `${theme.styling.buttonRadius}px`,
                    }}
                  >
                    Shop Now
                  </div>
                </div>

                {/* Color swatches */}
                <div className="flex items-center gap-1.5 mt-4 relative z-10">
                  <span className="text-[10px] text-neutral-400 font-semibold mr-1">Palette:</span>
                  {theme.previewColors.map((col, idx) => (
                    <div
                      key={idx}
                      className="w-5 h-5 rounded-full border border-neutral-200 shadow-2xs"
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setPreviewTheme(theme)}
                  className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={() => setConfirmTheme(theme)}
                  disabled={isActive}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-800 cursor-default opacity-80'
                      : 'bg-[#0B8F63] hover:bg-[#086F4C] text-white'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Current</span>
                    </>
                  ) : (
                    <>
                      <span>Apply Theme</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL PREVIEW MODAL */}
      {previewTheme && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-fade-in border border-neutral-200"
            style={{ backgroundColor: previewTheme.colors.background }}
          >
            {/* Modal Header */}
            <div
              className="p-6 border-b flex items-center justify-between"
              style={{ borderColor: previewTheme.colors.border }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{previewTheme.decoration.icon}</span>
                <div>
                  <h2
                    className="font-serif font-bold text-xl"
                    style={{ color: previewTheme.colors.text, fontFamily: previewTheme.fonts.heading }}
                  >
                    {previewTheme.name} Preview
                  </h2>
                  <p className="text-xs" style={{ color: previewTheme.colors.textMuted }}>
                    {previewTheme.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewTheme(null)}
                className="p-2 rounded-full bg-neutral-200/60 hover:bg-neutral-200 text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Preview */}
            <div className="p-6 space-y-6">
              <div
                className="p-6 rounded-2xl border space-y-4"
                style={{ backgroundColor: previewTheme.colors.card, borderColor: previewTheme.colors.border }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-black text-lg" style={{ color: previewTheme.colors.text }}>
                    Marudhar Fashion Point
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: previewTheme.colors.badge, color: previewTheme.colors.badgeText }}
                  >
                    ✨ New Arrival
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border" style={{ borderColor: previewTheme.colors.border, backgroundColor: previewTheme.colors.surface }}>
                    <p className="text-[11px] font-semibold" style={{ color: previewTheme.colors.textMuted }}>Running Shoe</p>
                    <p className="text-base font-black mt-1" style={{ color: previewTheme.colors.primary }}>₹1,499</p>
                  </div>
                  <div className="p-4 rounded-xl border" style={{ borderColor: previewTheme.colors.border, backgroundColor: previewTheme.colors.surface }}>
                    <p className="text-[11px] font-semibold" style={{ color: previewTheme.colors.textMuted }}>Leather Loafer</p>
                    <p className="text-base font-black mt-1" style={{ color: previewTheme.colors.primary }}>₹1,999</p>
                  </div>
                </div>

                <button
                  className="w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all text-center"
                  style={{ backgroundColor: previewTheme.colors.button, color: previewTheme.colors.buttonText }}
                >
                  Explore Collection
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs" style={{ color: previewTheme.colors.textMuted }}>
                  Heading font: <span className="font-bold">{previewTheme.fonts.heading}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const t = previewTheme;
                      setPreviewTheme(null);
                      setConfirmTheme(t);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold text-xs shadow-md"
                  >
                    Apply Theme Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmTheme && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-neutral-200 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0B8F63] flex items-center justify-center text-2xl mx-auto">
              {confirmTheme.decoration.icon}
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-neutral-900">
                Apply "{confirmTheme.name}" Theme?
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                This will update the visual appearance of the customer website instantly across all devices.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => setConfirmTheme(null)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyTheme(confirmTheme)}
                disabled={isApplying}
                className="flex-1 py-2.5 rounded-xl bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isApplying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isApplying ? 'Applying...' : 'Confirm & Apply'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
