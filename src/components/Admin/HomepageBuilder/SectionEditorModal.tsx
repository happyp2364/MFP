import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Palette,
  Layout,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  Type,
  Layers,
  Wand2,
  Loader2,
} from 'lucide-react';
import { HomepageSection } from '../../../types';
import { generateAISectionContent } from '../../../lib/homepageService';
import { extractShoeFromImage } from '../../../utils/aiBackgroundRemoval';
import { AdminImageSelector } from '../../Common/UniversalImageSystem';

interface SectionEditorModalProps {
  section: HomepageSection;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSection: HomepageSection) => void;
}

export const SectionEditorModal: React.FC<SectionEditorModalProps> = ({
  section,
  isOpen,
  onClose,
  onSave,
}) => {
  const [edited, setEdited] = useState<HomepageSection>(() => JSON.parse(JSON.stringify(section)));
  const [activeTab, setActiveTab] = useState<'content' | 'styling' | 'visibility'>('content');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);
  const [isProcessingBgRemoval, setIsProcessingBgRemoval] = useState(false);

  if (!isOpen) return null;

  const handleRemoveBackground = async () => {
    const imgUrl = edited.contentData?.mainImage;
    if (!imgUrl) return;
    setIsProcessingBgRemoval(true);
    try {
      const res = await extractShoeFromImage(imgUrl);
      if (res && res.transparentPngUrl) {
        setEdited((prev) => ({
          ...prev,
          contentData: {
            ...prev.contentData,
            mainImage: res.transparentPngUrl,
          },
        }));
      }
    } catch (e) {
      console.error('Failed to remove background:', e);
    } finally {
      setIsProcessingBgRemoval(false);
    }
  };

  const handleAIContentRewrite = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAI(true);
    try {
      const result = await generateAISectionContent(edited.type, aiPrompt);
      if (result) {
        setEdited((prev) => ({
          ...prev,
          title: result.title || prev.title,
          subtitle: result.subtitle || prev.subtitle,
          contentData: {
            ...prev.contentData,
            ...result,
          },
        }));
        setShowAiInput(false);
      }
    } catch (e) {
      console.error('AI section rewrite failed:', e);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddSlideItem = () => {
    const slides = edited.contentData?.items || edited.contentData?.slides || [];
    const newSlide = {
      id: `item_${Date.now()}`,
      title: 'New Slide Headline',
      subtitle: 'Special Promotional Offer',
      imageUrl: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=1200',
      buttonText: 'Shop Collection',
      buttonLink: '/products',
      badgeText: 'Trending',
    };
    setEdited((prev) => ({
      ...prev,
      contentData: {
        ...prev.contentData,
        items: [...slides, newSlide],
        slides: [...slides, newSlide],
      },
    }));
  };

  const handleUpdateSlideItem = (index: number, field: string, value: any) => {
    const items = [...(edited.contentData?.items || edited.contentData?.slides || [])];
    if (items[index]) {
      items[index] = { ...items[index], [field]: value };
      setEdited((prev) => ({
        ...prev,
        contentData: {
          ...prev.contentData,
          items,
          slides: items,
        },
      }));
    }
  };

  const handleRemoveSlideItem = (index: number) => {
    const items = [...(edited.contentData?.items || edited.contentData?.slides || [])];
    items.splice(index, 1);
    setEdited((prev) => ({
      ...prev,
      contentData: {
        ...prev.contentData,
        items,
        slides: items,
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-8 border border-neutral-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Edit Section: {edited.title || edited.type}</h3>
              <p className="text-xs text-neutral-400 capitalize">Type: {edited.type.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 gap-2 pt-3">
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'content'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Type className="w-4 h-4" /> Content & Media
          </button>
          <button
            onClick={() => setActiveTab('styling')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'styling'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Palette className="w-4 h-4" /> Styling & Colors
          </button>
          <button
            onClick={() => setActiveTab('visibility')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'visibility'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Layout className="w-4 h-4" /> Devices & Layout
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[68vh] overflow-y-auto space-y-6">
          {/* AI Copy Assistant Section */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <span className="font-bold text-sm">Gemini AI Copywriter</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiInput(!showAiInput)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors border border-white/20 flex items-center gap-1.5"
              >
                {showAiInput ? 'Close AI Prompt' : 'Generate Headlines & Copy'}
              </button>
            </div>

            {showAiInput && (
              <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                <p className="text-xs text-neutral-200">
                  Describe what you want for this section (e.g. "Festive Diwali discounts with urgent CTA and ethnic tagline"):
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Enter AI instruction prompt..."
                    className="flex-1 bg-neutral-800/80 border border-neutral-700 text-white text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isGeneratingAI || !aiPrompt.trim()}
                    onClick={handleAIContentRewrite}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                      </>
                    ) : (
                      'Apply AI Copy'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* TAB 1: CONTENT */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Section Title / Main Headline
                </label>
                <input
                  type="text"
                  value={edited.title}
                  onChange={(e) => setEdited({ ...edited, title: e.target.value })}
                  placeholder="e.g., Royal Festive Collection 2026"
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Subtitle / Supporting Tagline
                </label>
                <input
                  type="text"
                  value={edited.subtitle || ''}
                  onChange={(e) => setEdited({ ...edited, subtitle: e.target.value })}
                  placeholder="e.g., High-performance Sports Shoes & Premium Leather Sneakers"
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Specific Content Item Editors */}
              {/* Specific Content Item Editors */}
              {edited.type === 'floating_sneaker' && (
                <div className="pt-2 space-y-4 border-t border-neutral-200">
                  <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2 pt-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Floating Sneaker & Glass Showcase Controls
                  </h4>

                  {/* Background Typography Word */}
                  <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Large Background Typography Word
                    </label>
                    <input
                      type="text"
                      value={edited.contentData?.backgroundWord || 'SPORT'}
                      onChange={(e) =>
                        setEdited({
                          ...edited,
                          contentData: { ...edited.contentData, backgroundWord: e.target.value.toUpperCase() },
                        })
                      }
                      placeholder="e.g. SPORT, NIKE, MFP, STYLE, LUXURY"
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm font-mono uppercase bg-white"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['NIKE', 'SPORT', 'STYLE', 'MFP', 'PREMIUM', 'APEX', 'SALE', 'NEW', 'LUXURY'].map((word) => (
                        <button
                          key={word}
                          type="button"
                          onClick={() =>
                            setEdited({
                              ...edited,
                              contentData: { ...edited.contentData, backgroundWord: word },
                            })
                          }
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-md border transition-colors ${
                            edited.contentData?.backgroundWord === word
                              ? 'bg-amber-600 text-white border-amber-700'
                              : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                          }`}
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Product Image & AI Background Removal */}
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      Main Centerpiece Product Image (PNG / Transparent)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={edited.contentData?.mainImage || ''}
                        onChange={(e) =>
                          setEdited({
                            ...edited,
                            contentData: { ...edited.contentData, mainImage: e.target.value },
                          })
                        }
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveBackground}
                        disabled={isProcessingBgRemoval || !edited.contentData?.mainImage}
                        className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isProcessingBgRemoval ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Removing BG...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3.5 h-3.5" /> AI Remove BG
                          </>
                        )}
                      </button>
                    </div>
                    {edited.contentData?.mainImage && (
                      <div className="w-full h-28 bg-neutral-900/10 rounded-lg overflow-hidden flex items-center justify-center p-2 border border-neutral-200">
                        <img
                          src={edited.contentData?.mainImage}
                          alt="Main Preview"
                          className="max-h-full max-w-full object-contain filter drop-shadow-md"
                        />
                      </div>
                    )}
                  </div>

                  {/* Headings & CTA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Small Heading / Eyebrow</label>
                      <input
                        type="text"
                        value={edited.contentData?.smallHeading || ''}
                        onChange={(e) =>
                          setEdited({
                            ...edited,
                            contentData: { ...edited.contentData, smallHeading: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Main Heading</label>
                      <input
                        type="text"
                        value={edited.contentData?.mainHeading || ''}
                        onChange={(e) =>
                          setEdited({
                            ...edited,
                            contentData: { ...edited.contentData, mainHeading: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Description Copy</label>
                    <textarea
                      rows={2}
                      value={edited.contentData?.description || ''}
                      onChange={(e) =>
                        setEdited({
                          ...edited,
                          contentData: { ...edited.contentData, description: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">CTA Button Text</label>
                      <input
                        type="text"
                        value={edited.contentData?.ctaText || ''}
                        onChange={(e) =>
                          setEdited({
                            ...edited,
                            contentData: { ...edited.contentData, ctaText: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">CTA Target Link</label>
                      <input
                        type="text"
                        value={edited.contentData?.ctaLink || 'products'}
                        onChange={(e) =>
                          setEdited({
                            ...edited,
                            contentData: { ...edited.contentData, ctaLink: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">CTA Style</label>
                      <select
                        value={edited.contentData?.ctaStyle || 'filled'}
                        onChange={(e) =>
                          setEdited({
                            ...edited,
                            contentData: { ...edited.contentData, ctaStyle: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold bg-white"
                      >
                        <option value="filled">Dark Solid Button</option>
                        <option value="glass">Glassmorphism Pill</option>
                        <option value="outline">High Contrast Outline</option>
                      </select>
                    </div>
                  </div>

                  {/* 3D Transform Sliders */}
                  <div className="p-3 bg-neutral-100 rounded-xl space-y-3">
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      3D Shoe Transform & Position Controls
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>Rotation Angle</span>
                          <span>{edited.contentData?.productRotation ?? -12}°</span>
                        </div>
                        <input
                          type="range"
                          min="-45"
                          max="45"
                          value={edited.contentData?.productRotation ?? -12}
                          onChange={(e) =>
                            setEdited({
                              ...edited,
                              contentData: { ...edited.contentData, productRotation: Number(e.target.value) },
                            })
                          }
                          className="w-full accent-amber-600"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>Zoom Scale</span>
                          <span>{edited.contentData?.productScale ?? 1.05}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.6"
                          max="1.5"
                          step="0.05"
                          value={edited.contentData?.productScale ?? 1.05}
                          onChange={(e) =>
                            setEdited({
                              ...edited,
                              contentData: { ...edited.contentData, productScale: Number(e.target.value) },
                            })
                          }
                          className="w-full accent-amber-600"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>Y-Offset (Float)</span>
                          <span>{edited.contentData?.productPositionY ?? -10}px</span>
                        </div>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={edited.contentData?.productPositionY ?? -10}
                          onChange={(e) =>
                            setEdited({
                              ...edited,
                              contentData: { ...edited.contentData, productPositionY: Number(e.target.value) },
                            })
                          }
                          className="w-full accent-amber-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Animation & Effect Toggles */}
                  <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                      Animation & Visual Effects Toggles
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {[
                        { key: 'enableFloatingAnimation', label: 'Floating Motion' },
                        { key: 'enableHoverZoom', label: '3D Hover Zoom' },
                        { key: 'enableGlassShine', label: 'Glass Shine' },
                        { key: 'enableSoftGlow', label: 'Radial Soft Glow' },
                        { key: 'enableReflection', label: 'Floor Reflection' },
                        { key: 'enableParticles', label: 'Dust Particles' },
                      ].map((eff) => (
                        <label key={eff.key} className="flex items-center gap-2 cursor-pointer p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                          <input
                            type="checkbox"
                            checked={edited.contentData?.[eff.key] ?? true}
                            onChange={(e) =>
                              setEdited({
                                ...edited,
                                contentData: { ...edited.contentData, [eff.key]: e.target.checked },
                              })
                            }
                            className="w-4 h-4 text-amber-600 rounded"
                          />
                          <span className="font-semibold text-neutral-800">{eff.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {edited.type === 'mbh_shoe_carousel' && (
                <div className="pt-2 space-y-4 border-t border-neutral-200">
                  <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2 pt-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> MBH Premium 3D Shoe Carousel Controls
                  </h4>

                  {/* Header Badge & Brand Typography Word */}
                  <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                          Header Badge Line
                        </label>
                        <input
                          type="text"
                          value={edited.contentData?.headerBadge || '✨ 2026 MBH ROYAL FOOTWEAR SHOWCASE'}
                          onChange={(e) =>
                            setEdited({
                              ...edited,
                              contentData: { ...edited.contentData, headerBadge: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-amber-300 rounded-lg text-xs font-semibold bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                          Background Typography Word
                        </label>
                        <input
                          type="text"
                          value={edited.contentData?.backgroundWord || 'MBH'}
                          onChange={(e) =>
                            setEdited({
                              ...edited,
                              contentData: { ...edited.contentData, backgroundWord: e.target.value.toUpperCase() },
                            })
                          }
                          placeholder="MBH, APEX, LUXURY..."
                          className="w-full px-3 py-1.5 border border-amber-300 rounded-lg text-xs font-mono font-bold uppercase bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['MBH', 'APEX', 'LUXURY', 'SNEAKER', 'ROYAL', '2026', 'FOOTWEAR'].map((word) => (
                        <button
                          key={word}
                          type="button"
                          onClick={() =>
                            setEdited({
                              ...edited,
                              contentData: { ...edited.contentData, backgroundWord: word },
                            })
                          }
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-md border transition-colors ${
                            edited.contentData?.backgroundWord === word
                              ? 'bg-amber-600 text-white border-amber-700'
                              : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                          }`}
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme Mode & Carousel Settings */}
                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      Theme Mode & Carousel Timers
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">Color Theme</label>
                        <select
                          value={edited.contentData?.themeMode || 'cream_white'}
                          onChange={(e) =>
                            setEdited({
                              ...edited,
                              contentData: { ...edited.contentData, themeMode: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold bg-white"
                        >
                          <option value="cream_white">Cream Luxury White</option>
                          <option value="obsidian_dark">Obsidian Midnight Dark</option>
                          <option value="royal_gold">Royal Gold Gradient</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">Auto Play Interval</label>
                        <select
                          value={edited.contentData?.autoPlayInterval || 5}
                          onChange={(e) =>
                            setEdited({
                              ...edited,
                              contentData: { ...edited.contentData, autoPlayInterval: Number(e.target.value) },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold bg-white"
                        >
                          <option value={3}>3 Seconds</option>
                          <option value={5}>5 Seconds</option>
                          <option value={8}>8 Seconds</option>
                          <option value={10}>10 Seconds</option>
                        </select>
                      </div>

                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800">
                          <input
                            type="checkbox"
                            checked={edited.contentData?.autoPlay ?? true}
                            onChange={(e) =>
                              setEdited({
                                ...edited,
                                contentData: { ...edited.contentData, autoPlay: e.target.checked },
                              })
                            }
                            className="w-4 h-4 text-amber-600 rounded"
                          />
                          <span>Enable Auto-Play</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Individual Animation Toggles */}
                  <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                      Individual Animation & FX Toggles
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {[
                        { key: 'enableFloating', label: 'Floating Motion' },
                        { key: 'enableSoftRotation', label: '3D Soft Rotation' },
                        { key: 'enableHoverZoom', label: 'Hover Zoom' },
                        { key: 'enableGlassReflection', label: 'Glass Reflection' },
                        { key: 'enableSoftGlow', label: 'Radial Soft Glow' },
                        { key: 'enableGlassShine', label: 'Glass Shine' },
                      ].map((eff) => (
                        <label key={eff.key} className="flex items-center gap-2 cursor-pointer p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                          <input
                            type="checkbox"
                            checked={edited.contentData?.[eff.key] ?? true}
                            onChange={(e) =>
                              setEdited({
                                ...edited,
                                contentData: { ...edited.contentData, [eff.key]: e.target.checked },
                              })
                            }
                            className="w-4 h-4 text-amber-600 rounded"
                          />
                          <span className="font-semibold text-neutral-800">{eff.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Slides Manager */}
                  <div className="space-y-3 pt-2 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                        Carousel Shoe Slides ({edited.contentData?.slides?.length || 0})
                      </h5>
                      <button
                        type="button"
                        onClick={() => {
                          const currentSlides = [...(edited.contentData?.slides || [])];
                          const newSlide = {
                            id: `slide_${Date.now()}`,
                            productName: 'MBH New Luxury Shoe',
                            collection: '2026 EDITION',
                            price: 2999,
                            originalPrice: 5999,
                            discountText: '50% OFF',
                            description: 'Handcrafted luxury shoe with ergonomic cushion sole.',
                            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
                            buyNowText: '⚡ BUY NOW',
                            buyNowLink: '/products',
                            viewDetailsText: 'VIEW DETAILS',
                            showWishlist: true,
                            floatingBadges: [
                              { title: 'Genuine Leather', value: '100% Original' },
                              { title: 'Air Cushion', value: 'Comfort' },
                              { title: 'Open Box Delivery', value: 'Inspect First' },
                            ],
                          };
                          setEdited({
                            ...edited,
                            contentData: { ...edited.contentData, slides: [...currentSlides, newSlide] },
                          });
                        }}
                        className="px-3 py-1.5 bg-amber-500 text-neutral-950 hover:bg-amber-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add New Shoe Slide
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(edited.contentData?.slides || []).map((slide: any, sIdx: number) => (
                        <div key={slide.id || sIdx} className="p-4 border border-neutral-200 rounded-xl bg-white shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs font-black flex items-center justify-center">
                                {sIdx + 1}
                              </span>
                              <span className="text-xs font-bold text-neutral-900">
                                {slide.productName || `Slide #${sIdx + 1}`}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              {sIdx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = [...edited.contentData.slides];
                                    const temp = list[sIdx];
                                    list[sIdx] = list[sIdx - 1];
                                    list[sIdx - 1] = temp;
                                    setEdited({
                                      ...edited,
                                      contentData: { ...edited.contentData, slides: list },
                                    });
                                  }}
                                  className="px-2 py-1 text-[10px] bg-neutral-100 hover:bg-neutral-200 font-bold rounded"
                                >
                                  ↑ Move Up
                                </button>
                              )}
                              {sIdx < (edited.contentData.slides.length - 1) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = [...edited.contentData.slides];
                                    const temp = list[sIdx];
                                    list[sIdx] = list[sIdx + 1];
                                    list[sIdx + 1] = temp;
                                    setEdited({
                                      ...edited,
                                      contentData: { ...edited.contentData, slides: list },
                                    });
                                  }}
                                  className="px-2 py-1 text-[10px] bg-neutral-100 hover:bg-neutral-200 font-bold rounded"
                                >
                                  ↓ Move Down
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const list = edited.contentData.slides.filter((_: any, i: number) => i !== sIdx);
                                  setEdited({
                                    ...edited,
                                    contentData: { ...edited.contentData, slides: list },
                                  });
                                }}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                title="Delete Slide"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Shoe Image Upload */}
                          <AdminImageSelector
                            value={slide.image || ''}
                            onChange={(url) => {
                              const list = [...edited.contentData.slides];
                              list[sIdx] = { ...list[sIdx], image: url };
                              setEdited({
                                ...edited,
                                contentData: { ...edited.contentData, slides: list },
                              });
                            }}
                            label="Shoe Image (PNG / Transparent PNG / WEBP)"
                            description="Supports upload, paste URL, camera capture, preset images, auto background removal & AI image generation."
                          />

                          {/* Slide Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-600 uppercase">Product Name</label>
                              <input
                                type="text"
                                value={slide.productName || ''}
                                onChange={(e) => {
                                  const list = [...edited.contentData.slides];
                                  list[sIdx] = { ...list[sIdx], productName: e.target.value };
                                  setEdited({
                                    ...edited,
                                    contentData: { ...edited.contentData, slides: list },
                                  });
                                }}
                                className="w-full p-1.5 border rounded text-xs font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-neutral-600 uppercase">Collection / Subtitle Tag</label>
                              <input
                                type="text"
                                value={slide.collection || ''}
                                onChange={(e) => {
                                  const list = [...edited.contentData.slides];
                                  list[sIdx] = { ...list[sIdx], collection: e.target.value };
                                  setEdited({
                                    ...edited,
                                    contentData: { ...edited.contentData, slides: list },
                                  });
                                }}
                                className="w-full p-1.5 border rounded text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-neutral-600 uppercase">Price (₹)</label>
                              <input
                                type="number"
                                value={slide.price || ''}
                                onChange={(e) => {
                                  const list = [...edited.contentData.slides];
                                  list[sIdx] = { ...list[sIdx], price: Number(e.target.value) };
                                  setEdited({
                                    ...edited,
                                    contentData: { ...edited.contentData, slides: list },
                                  });
                                }}
                                className="w-full p-1.5 border rounded text-xs font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-neutral-600 uppercase">Original Price (₹)</label>
                              <input
                                type="number"
                                value={slide.originalPrice || ''}
                                onChange={(e) => {
                                  const list = [...edited.contentData.slides];
                                  list[sIdx] = { ...list[sIdx], originalPrice: Number(e.target.value) };
                                  setEdited({
                                    ...edited,
                                    contentData: { ...edited.contentData, slides: list },
                                  });
                                }}
                                className="w-full p-1.5 border rounded text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-neutral-600 uppercase">Description Copy</label>
                            <textarea
                              rows={2}
                              value={slide.description || ''}
                              onChange={(e) => {
                                const list = [...edited.contentData.slides];
                                list[sIdx] = { ...list[sIdx], description: e.target.value };
                                setEdited({
                                  ...edited,
                                  contentData: { ...edited.contentData, slides: list },
                                });
                              }}
                              className="w-full p-1.5 border rounded text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-600 uppercase">Buy Now Button Text</label>
                              <input
                                type="text"
                                value={slide.buyNowText || '⚡ BUY NOW'}
                                onChange={(e) => {
                                  const list = [...edited.contentData.slides];
                                  list[sIdx] = { ...list[sIdx], buyNowText: e.target.value };
                                  setEdited({
                                    ...edited,
                                    contentData: { ...edited.contentData, slides: list },
                                  });
                                }}
                                className="w-full p-1.5 border rounded text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-neutral-600 uppercase">View Details Button Text</label>
                              <input
                                type="text"
                                value={slide.viewDetailsText || 'VIEW DETAILS'}
                                onChange={(e) => {
                                  const list = [...edited.contentData.slides];
                                  list[sIdx] = { ...list[sIdx], viewDetailsText: e.target.value };
                                  setEdited({
                                    ...edited,
                                    contentData: { ...edited.contentData, slides: list },
                                  });
                                }}
                                className="w-full p-1.5 border rounded text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(edited.type === 'hero_banner' || edited.type === 'slider' || edited.type === 'image_carousel' || edited.type === 'offer_cards') && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600" /> Banner Slides & Media Items ({edited.contentData?.items?.length || edited.contentData?.slides?.length || 0})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddSlideItem}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Slide Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(edited.contentData?.items || edited.contentData?.slides || []).map((slide: any, idx: number) => (
                      <div key={slide.id || idx} className="p-3.5 border border-neutral-200 rounded-xl bg-neutral-50/50 space-y-3">
                        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                          <span className="text-xs font-bold text-neutral-700">Slide #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlideItem(idx)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Headline Title</label>
                            <input
                              type="text"
                              value={slide.title || ''}
                              onChange={(e) => handleUpdateSlideItem(idx, 'title', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Subtitle / Badge</label>
                            <input
                              type="text"
                              value={slide.subtitle || slide.badgeText || ''}
                              onChange={(e) => handleUpdateSlideItem(idx, 'subtitle', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs"
                            />
                          </div>
                          <div className="md:col-span-2 pt-2">
                            <AdminImageSelector
                              value={slide.imageUrl || ''}
                              onChange={(url) => handleUpdateSlideItem(idx, 'imageUrl', url)}
                              label="Slide Image"
                              description="Supports upload, paste URL, capture with camera, presets, and AI generation."
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Button Text</label>
                            <input
                              type="text"
                              value={slide.buttonText || ''}
                              onChange={(e) => handleUpdateSlideItem(idx, 'buttonText', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Button Link</label>
                            <input
                              type="text"
                              value={slide.buttonLink || ''}
                              onChange={(e) => handleUpdateSlideItem(idx, 'buttonLink', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Showcase Settings */}
              {(edited.type.includes('product') || edited.type === 'flash_sale') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Display Limit (Max Items)
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={24}
                      value={edited.contentData?.limit || 8}
                      onChange={(e) =>
                        setEdited({
                          ...edited,
                          contentData: { ...edited.contentData, limit: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Filter Category
                    </label>
                    <input
                      type="text"
                      value={edited.contentData?.category || 'ALL'}
                      onChange={(e) =>
                        setEdited({
                          ...edited,
                          contentData: { ...edited.contentData, category: e.target.value },
                        })
                      }
                      placeholder="e.g. Men's Sports Shoes, Casual Sneakers, ALL"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Categories Cards List Manager */}
              {edited.type === 'categories' && (
                <div className="p-4 border border-emerald-200 bg-emerald-50/50 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                        Category Cards Manager
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Add, edit, reorder or schedule footwear category cards in this section.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const items = edited.contentData?.categoryItems || [];
                        const newItem = {
                          id: `cat_${Date.now()}`,
                          title: "Men's Sports Shoes",
                          subtitle: "High-performance cushioned shoes",
                          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
                          itemCount: "100+ Styles",
                          buttonText: "Explore Sports →",
                          categoryFilter: "men",
                          enabled: true,
                        };
                        setEdited({
                          ...edited,
                          contentData: {
                            ...edited.contentData,
                            categoryItems: [...items, newItem],
                          },
                        });
                      }}
                      className="px-3 py-1.5 bg-[#0B8F63] text-white text-xs font-bold rounded-xl hover:bg-[#086F4C] transition-colors"
                    >
                      + Add Category Card
                    </button>
                  </div>

                  {/* List of Category Items */}
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {((edited.contentData?.categoryItems || []) as any[]).map((item: any, idx: number) => (
                      <div key={item.id || idx} className="p-3 bg-white border border-neutral-200 rounded-xl space-y-2 shadow-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-neutral-900">
                            #{idx + 1}: {item.title || 'Untitled Category'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                const list = [...(edited.contentData?.categoryItems || [])];
                                const temp = list[idx];
                                list[idx] = list[idx - 1];
                                list[idx - 1] = temp;
                                setEdited({ ...edited, contentData: { ...edited.contentData, categoryItems: list } });
                              }}
                              className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] rounded disabled:opacity-30"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              disabled={idx === (edited.contentData?.categoryItems?.length || 1) - 1}
                              onClick={() => {
                                const list = [...(edited.contentData?.categoryItems || [])];
                                const temp = list[idx];
                                list[idx] = list[idx + 1];
                                list[idx + 1] = temp;
                                setEdited({ ...edited, contentData: { ...edited.contentData, categoryItems: list } });
                              }}
                              className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] rounded disabled:opacity-30"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const list = (edited.contentData?.categoryItems || []).filter((_: any, i: number) => i !== idx);
                                setEdited({ ...edited, contentData: { ...edited.contentData, categoryItems: list } });
                              }}
                              className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-neutral-500 font-bold block">Title</span>
                            <input
                              type="text"
                              value={item.title || ''}
                              onChange={(e) => {
                                const list = [...(edited.contentData?.categoryItems || [])];
                                list[idx] = { ...list[idx], title: e.target.value };
                                setEdited({ ...edited, contentData: { ...edited.contentData, categoryItems: list } });
                              }}
                              className="w-full p-1.5 border rounded bg-neutral-50"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-500 font-bold block">Subtitle</span>
                            <input
                              type="text"
                              value={item.subtitle || ''}
                              onChange={(e) => {
                                const list = [...(edited.contentData?.categoryItems || [])];
                                list[idx] = { ...list[idx], subtitle: e.target.value };
                                setEdited({ ...edited, contentData: { ...edited.contentData, categoryItems: list } });
                              }}
                              className="w-full p-1.5 border rounded bg-neutral-50"
                            />
                          </div>
                          <div className="md:col-span-2 pt-2">
                            <AdminImageSelector
                              value={item.image || ''}
                              onChange={(url) => {
                                const list = [...(edited.contentData?.categoryItems || [])];
                                list[idx] = { ...list[idx], image: url };
                                setEdited({ ...edited, contentData: { ...edited.contentData, categoryItems: list } });
                              }}
                              label="Category Item Image"
                              description="Supports upload, paste URL, capture, presets, and AI generation."
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-500 font-bold block">Button CTA</span>
                            <input
                              type="text"
                              value={item.buttonText || ''}
                              onChange={(e) => {
                                const list = [...(edited.contentData?.categoryItems || [])];
                                list[idx] = { ...list[idx], buttonText: e.target.value };
                                setEdited({ ...edited, contentData: { ...edited.contentData, categoryItems: list } });
                              }}
                              className="w-full p-1.5 border rounded bg-neutral-50"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Flash Sale Timer */}
              {edited.type === 'flash_sale' && (
                <div className="p-3 border border-amber-200 bg-amber-50 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-amber-900">Flash Sale Event Target Time</span>
                  <input
                    type="datetime-local"
                    value={edited.contentData?.targetDate || ''}
                    onChange={(e) =>
                      setEdited({
                        ...edited,
                        contentData: { ...edited.contentData, targetDate: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STYLING */}
          {activeTab === 'styling' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Background Color (Hex / CSS)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={edited.styling.bgColor || '#ffffff'}
                      onChange={(e) =>
                        setEdited({
                          ...edited,
                          styling: { ...edited.styling, bgColor: e.target.value },
                        })
                      }
                      className="w-10 h-9 p-0.5 border border-neutral-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={edited.styling.bgColor || '#ffffff'}
                      onChange={(e) =>
                        setEdited({
                          ...edited,
                          styling: { ...edited.styling, bgColor: e.target.value },
                        })
                      }
                      className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Text Color (Hex / CSS)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={edited.styling.textColor || '#171717'}
                      onChange={(e) =>
                        setEdited({
                          ...edited,
                          styling: { ...edited.styling, textColor: e.target.value },
                        })
                      }
                      className="w-10 h-9 p-0.5 border border-neutral-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={edited.styling.textColor || '#171717'}
                      onChange={(e) =>
                        setEdited({
                          ...edited,
                          styling: { ...edited.styling, textColor: e.target.value },
                        })
                      }
                      className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Top Padding (px)
                  </label>
                  <input
                    type="number"
                    value={edited.styling.paddingTop ?? 32}
                    onChange={(e) =>
                      setEdited({
                        ...edited,
                        styling: { ...edited.styling, paddingTop: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Bottom Padding (px)
                  </label>
                  <input
                    type="number"
                    value={edited.styling.paddingBottom ?? 32}
                    onChange={(e) =>
                      setEdited({
                        ...edited,
                        styling: { ...edited.styling, paddingBottom: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={edited.styling.fullWidth ?? true}
                    onChange={(e) =>
                      setEdited({
                        ...edited,
                        styling: { ...edited.styling, fullWidth: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-semibold text-neutral-800">
                    Full Width Container (Edge-to-edge layout)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: VISIBILITY & DEVICES */}
          {activeTab === 'visibility' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  Display Devices
                </label>
                <div className="flex gap-4">
                  {['desktop', 'tablet', 'mobile'].map((dev) => {
                    const currentDevices = edited.visibleDevices || ['desktop', 'tablet', 'mobile'];
                    const isChecked = currentDevices.includes(dev as any);
                    return (
                      <label key={dev} className="flex items-center gap-2 cursor-pointer bg-neutral-100 px-3 py-2 rounded-lg border border-neutral-200">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let nextDevices = [...currentDevices];
                            if (e.target.checked) {
                              if (!nextDevices.includes(dev as any)) nextDevices.push(dev as any);
                            } else {
                              nextDevices = nextDevices.filter((d) => d !== dev);
                            }
                            setEdited({ ...edited, visibleDevices: nextDevices });
                          }}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="text-xs font-bold capitalize text-neutral-800">{dev}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <input
                    type="checkbox"
                    checked={edited.enabled}
                    onChange={(e) => setEdited({ ...edited, enabled: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-sm font-bold text-emerald-900">
                    Enable Section on Live Website
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 text-sm font-semibold rounded-xl hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(edited)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Save Section Changes
          </button>
        </div>
      </div>
    </div>
  );
};
