import React, { useState } from 'react';
import { Palette, Check, Sparkles, Eye, ShieldCheck, RefreshCw, X, ArrowRight, PartyPopper } from 'lucide-react';
import { useWebsiteDesign } from '../../context/WebsiteDesignContext';
import { THEMES_REGISTRY, ThemeDefinition } from '../../data/themesRegistry';
import { FESTIVALS_REGISTRY, FestivalExperience } from '../../data/festivalsRegistry';

interface ThemesStudioViewProps {
  showToast: (msg: string) => void;
}

export const ThemesStudioView: React.FC<ThemesStudioViewProps> = ({ showToast }) => {
  const { websiteDesignSettings, updateDraftDesignSettings, saveWebsiteDesignSettings } = useWebsiteDesign();
  const [selectedTab, setSelectedTab] = useState<'themes' | 'festivals'>('themes');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'brand' | 'nature' | 'weather' | 'festival' | 'social'>('all');
  
  const [previewTheme, setPreviewTheme] = useState<ThemeDefinition | null>(null);
  const [confirmTheme, setConfirmTheme] = useState<ThemeDefinition | null>(null);

  const [previewFestival, setPreviewFestival] = useState<FestivalExperience | null>(null);
  const [confirmFestival, setConfirmFestival] = useState<FestivalExperience | null>(null);

  const [isApplying, setIsApplying] = useState(false);

  const activeThemeId = websiteDesignSettings.activeThemeId || 'local';
  const activeFestivalId = websiteDesignSettings.activeFestivalId || 'none';

  const handleApplyTheme = async (theme: ThemeDefinition) => {
    setIsApplying(true);
    try {
      const updated = {
        ...websiteDesignSettings,
        activeThemeId: theme.id,
      };
      updateDraftDesignSettings(updated, true);
      await saveWebsiteDesignSettings(updated, 'Admin Theme Studio');
      showToast(`Successfully applied "${theme.name}" base theme across the storefront!`);
      setConfirmTheme(null);
    } catch (err) {
      console.error('Error applying theme:', err);
      showToast('Failed to apply theme. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplyFestival = async (festival: FestivalExperience) => {
    setIsApplying(true);
    try {
      const updated = {
        ...websiteDesignSettings,
        activeFestivalId: festival.id,
      };
      updateDraftDesignSettings(updated, true);
      await saveWebsiteDesignSettings(updated, 'Admin Festival Studio');
      showToast(`Successfully activated "${festival.name}" across the customer storefront!`);
      setConfirmFestival(null);
    } catch (err) {
      console.error('Error applying festival:', err);
      showToast('Failed to activate festival experience.');
    } finally {
      setIsApplying(false);
    }
  };

  const filteredThemes = Object.values(THEMES_REGISTRY).filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="space-y-8 p-4 sm:p-6 max-w-7xl mx-auto pb-16">
      {/* Studio Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1.5">
            <Palette className="w-4 h-4" />
            <span>Global Theme & Festival Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight">
            Storefront Visual & Festival Experience Engine
          </h1>
          <p className="text-sm text-neutral-300 mt-1 max-w-2xl leading-relaxed">
            Manage base visual themes and immersive seasonal festival experiences (Holi, Diwali, Christmas, New Year) instantly deployed across all customer touchpoints.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-3 bg-neutral-800/80 border border-neutral-700/80 px-4 py-3 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
              {THEMES_REGISTRY[activeThemeId]?.decoration.icon || '✨'}
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Base Theme</span>
              <span className="text-sm font-extrabold text-white">
                {THEMES_REGISTRY[activeThemeId]?.name || 'Local'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-neutral-800/80 border border-neutral-700/80 px-4 py-3 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-lg">
              {FESTIVALS_REGISTRY[activeFestivalId]?.icon || '✨'}
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Active Festival</span>
              <span className="text-sm font-extrabold text-white">
                {FESTIVALS_REGISTRY[activeFestivalId]?.name || 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Mode Selector Tabs */}
      <div className="flex items-center gap-4 border-b border-neutral-200 pb-3">
        <button
          onClick={() => setSelectedTab('themes')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
            selectedTab === 'themes'
              ? 'bg-[#0B8F63] text-white shadow-md'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Base Visual Themes ({Object.keys(THEMES_REGISTRY).length})</span>
        </button>
        <button
          onClick={() => setSelectedTab('festivals')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
            selectedTab === 'festivals'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <PartyPopper className="w-4 h-4" />
          <span>🌈 Festival Experience Engine ({Object.keys(FESTIVALS_REGISTRY).length})</span>
        </button>
      </div>

      {/* TAB 1: BASE VISUAL THEMES */}
      {selectedTab === 'themes' && (
        <div className="space-y-6">
          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-200">
            {[
              { id: 'all', label: 'All Themes' },
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
                    ? 'bg-[#0B8F63] text-white shadow-xs'
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
                  <div
                    className="p-5 border-b border-neutral-100 relative overflow-hidden"
                    style={{ backgroundColor: theme.colors.background }}
                  >
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
                          New
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-black" style={{ color: theme.colors.primary }}>₹1,499</span>
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                          style={{ backgroundColor: theme.colors.button }}
                        >
                          +
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setPreviewTheme(theme)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-800 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Preview Studio</span>
                    </button>

                    <button
                      onClick={() => setConfirmTheme(theme)}
                      disabled={isActive}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all ${
                        isActive
                          ? 'bg-emerald-100 text-[#0B8F63] cursor-default'
                          : 'bg-[#0B8F63] hover:bg-[#086F4C] text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Active Base' : 'Apply Theme'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: FESTIVAL EXPERIENCE ENGINE */}
      {selectedTab === 'festivals' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 border border-pink-500/20 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold uppercase tracking-wider inline-block">
                🌈 Immersive Seasonal Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-neutral-900">
                Turn On Full Festival Mode Instantly
              </h2>
              <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed">
                When activated, the entire storefront transforms with festive banners, gulal/diya particles, celebratory hero messages, and thematic badges across all customer pages.
              </p>
            </div>

            {activeFestivalId !== 'none' && (
              <button
                onClick={() => handleApplyFestival(FESTIVALS_REGISTRY['none'])}
                className="px-5 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-md cursor-pointer whitespace-nowrap"
              >
                Disable Festival Mode (None)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(FESTIVALS_REGISTRY).map((festival) => {
              const isActive = activeFestivalId === festival.id;

              return (
                <div
                  key={festival.id}
                  className={`relative bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl ${
                    isActive ? 'border-pink-500 ring-2 ring-pink-500/20 bg-gradient-to-b from-pink-50/30 to-white' : 'border-neutral-200'
                  }`}
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-2xl shadow-sm">
                        {festival.icon}
                      </div>

                      {isActive && (
                        <span className="px-3 py-1 rounded-full bg-pink-600 text-white text-[10px] font-black uppercase flex items-center gap-1 shadow-xs">
                          <Check className="w-3 h-3" />
                          Active Festival
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-serif font-black text-lg text-neutral-900">
                        {festival.name}
                      </h3>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                        {festival.subtitle}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1.5 text-xs">
                      <div className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Festival Announcement Preview:</div>
                      <p className="font-bold text-neutral-800 italic">
                        "{festival.announcementText || 'Standard seasonal branding'}"
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setPreviewFestival(festival)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-800 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Preview Experience</span>
                    </button>

                    <button
                      onClick={() => setConfirmFestival(festival)}
                      disabled={isActive}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all ${
                        isActive
                          ? 'bg-pink-100 text-pink-700 cursor-default'
                          : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Active Now' : 'Activate Experience'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BASE THEME PREVIEW MODAL */}
      {previewTheme && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-neutral-200 animate-fade-in">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between" style={{ backgroundColor: previewTheme.colors.background }}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{previewTheme.decoration.icon}</span>
                <div>
                  <h2 className="font-serif font-black text-xl" style={{ color: previewTheme.colors.text }}>
                    {previewTheme.name}
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
                <button
                  onClick={() => {
                    const t = previewTheme;
                    setPreviewTheme(null);
                    setConfirmTheme(t);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Apply Base Theme
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FESTIVAL EXPERIENCE PREVIEW MODAL */}
      {previewFestival && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-neutral-200 animate-fade-in">
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{previewFestival.icon}</span>
                <div>
                  <h2 className="font-serif font-black text-xl">
                    {previewFestival.name}
                  </h2>
                  <p className="text-xs text-pink-100">
                    {previewFestival.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewFestival(null)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Simulated Announcement Banner */}
              {previewFestival.announcementText && (
                <div className="bg-pink-100 border border-pink-300 text-pink-800 text-xs font-bold py-2.5 px-4 rounded-xl text-center">
                  {previewFestival.announcementText}
                </div>
              )}

              {/* Simulated Hero Section */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/15 to-amber-500/10 border border-pink-200 text-center space-y-3">
                <span className="px-3 py-1 rounded-full bg-pink-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  {previewFestival.heroBadge}
                </span>
                <h3 className="text-xl font-serif font-black text-neutral-900">
                  {previewFestival.heroTitle}
                </h3>
                <p className="text-xs text-neutral-600 max-w-md mx-auto">
                  {previewFestival.heroSubtitle}
                </p>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                    {previewFestival.badgeLabel || '🌈 SPECIAL'}
                  </span>
                  <button className="px-5 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs shadow-md">
                    Shop Collection
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-neutral-500">
                  Immersive particles: <span className="font-bold uppercase text-pink-600">{previewFestival.particlesType}</span>
                </div>
                <button
                  onClick={() => {
                    const f = previewFestival;
                    setPreviewFestival(null);
                    setConfirmFestival(f);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Activate Festival Experience
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* THEME CONFIRMATION MODAL */}
      {confirmTheme && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-neutral-200 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0B8F63] flex items-center justify-center text-2xl mx-auto">
              {confirmTheme.decoration.icon}
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-neutral-900">
                Apply "{confirmTheme.name}" Base Theme?
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

      {/* FESTIVAL CONFIRMATION MODAL */}
      {confirmFestival && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-neutral-200 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-2xl mx-auto">
              {confirmFestival.icon}
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-neutral-900">
                Activate "{confirmFestival.name}"?
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                This will immediately broadcast festive banners, celebratory heroes, and decorative overlays across the entire live customer storefront.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => setConfirmFestival(null)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyFestival(confirmFestival)}
                disabled={isApplying}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isApplying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isApplying ? 'Activating...' : 'Activate Festival'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
