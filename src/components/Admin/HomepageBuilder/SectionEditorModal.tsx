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

  if (!isOpen) return null;

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
                  placeholder="e.g., Handcrafted Designer Sarees & Heavy Lehengas"
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Specific Content Item Editors */}
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
                          <div className="md:col-span-2">
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Image URL</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={slide.imageUrl || ''}
                                onChange={(e) => handleUpdateSlideItem(idx, 'imageUrl', e.target.value)}
                                className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs"
                              />
                              {slide.imageUrl && (
                                <img src={slide.imageUrl} alt="preview" className="w-9 h-9 object-cover rounded border border-neutral-200" />
                              )}
                            </div>
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
                      placeholder="e.g. Sarees, Kurtis, ALL"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                    />
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
