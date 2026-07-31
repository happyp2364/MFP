import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { AboutUsConfig, OwnerMember, TimelineEvent, StoreAchievement, LiveCounterItem, StoreGalleryItem } from '../../types';
import { DEFAULT_ABOUT_US_CONFIG } from '../../data/defaultAboutUs';
import { optimizeImageFile } from '../../utils/imageOptimizer';
import {
  Sparkles,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  UserCheck,
  Award,
  Calendar,
  Image as ImageIcon,
  BarChart2,
  Share2,
  BookOpen,
  Users,
  CheckCircle2,
  Loader2,
  Upload,
  Link as LinkIcon,
  HelpCircle,
  Briefcase,
  Star,
  Layers,
  Heart,
  Store
} from 'lucide-react';

export const AboutUsSettingsView: React.FC = () => {
  const { aboutUsConfig, updateAboutUsConfig } = useStore();
  const [formData, setFormData] = useState<AboutUsConfig>(aboutUsConfig || DEFAULT_ABOUT_US_CONFIG);
  const [activeTab, setActiveTab] = useState<'story' | 'owners' | 'timeline' | 'achievements' | 'gallery' | 'counters' | 'social'>('story');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiType, setAiType] = useState<'story' | 'bio' | 'mission' | 'vision' | 'highlights'>('story');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiResultNote, setAiResultNote] = useState<string | null>(null);

  // Edit Modals / States for sub-lists
  const [editingOwner, setEditingOwner] = useState<OwnerMember | null>(null);
  const [editingTimeline, setEditingTimeline] = useState<TimelineEvent | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<StoreAchievement | null>(null);
  const [editingGallery, setEditingGallery] = useState<StoreGalleryItem | null>(null);
  const [editingCounter, setEditingCounter] = useState<LiveCounterItem | null>(null);

  const [highlightInput, setHighlightInput] = useState('');

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await updateAboutUsConfig(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Reset About Us section to default template for Marudhar Fashion Point? All custom edits will be restored to original settings.')) {
      setFormData(DEFAULT_ABOUT_US_CONFIG);
    }
  };

  // Image Upload helper
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await optimizeImageFile(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.82 });
      callback(compressed);
    } catch (err) {
      alert('Failed to process image file. Please try another image.');
    }
  };

  // AI Generation Handler
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAI(true);
    setAiResultNote(null);
    try {
      const res = await fetch('/api/ai/generate-about-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: aiType,
          prompt: aiPrompt,
          currentText: aiType === 'story' ? formData.businessStory : formData.mission
        })
      });
      const data = await res.json();
      if (data.success && data.result) {
        if (aiType === 'story' && data.result.content) {
          setFormData((prev) => ({ ...prev, businessStory: data.result.content }));
          setAiResultNote('✨ Business story updated with AI generation!');
        } else if (aiType === 'mission' && data.result.content) {
          setFormData((prev) => ({ ...prev, mission: data.result.content }));
          setAiResultNote('✨ Mission statement updated with AI generation!');
        } else if (aiType === 'vision' && data.result.content) {
          setFormData((prev) => ({ ...prev, vision: data.result.content }));
          setAiResultNote('✨ Vision statement updated with AI generation!');
        } else if (aiType === 'bio' && data.result.content && editingOwner) {
          setEditingOwner((prev) => prev ? { ...prev, shortIntro: data.result.content } : null);
          setAiResultNote('✨ Owner bio updated with AI generation!');
        } else if (aiType === 'highlights' && Array.isArray(data.result.highlights)) {
          setFormData((prev) => ({ ...prev, storeHighlights: data.result.highlights }));
          setAiResultNote('✨ Store highlights replaced with AI generated points!');
        }
      }
    } catch (err) {
      console.error(err);
      alert('AI Generation service failed. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Owner List Handlers
  const saveOwner = (owner: OwnerMember) => {
    setFormData((prev) => {
      const exists = prev.ownersAndTeam.some((o) => o.id === owner.id);
      const updatedList = exists
        ? prev.ownersAndTeam.map((o) => (o.id === owner.id ? owner : o))
        : [...prev.ownersAndTeam, { ...owner, displayOrder: prev.ownersAndTeam.length + 1 }];
      return { ...prev, ownersAndTeam: updatedList };
    });
    setEditingOwner(null);
  };

  const deleteOwner = (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member card?')) {
      setFormData((prev) => ({
        ...prev,
        ownersAndTeam: prev.ownersAndTeam.filter((o) => o.id !== id)
      }));
    }
  };

  const moveOwner = (index: number, direction: 'up' | 'down') => {
    const list = [...formData.ownersAndTeam];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    // re-assign order
    const reordered = list.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
    setFormData((prev) => ({ ...prev, ownersAndTeam: reordered }));
  };

  // Timeline Handlers
  const saveTimeline = (item: TimelineEvent) => {
    setFormData((prev) => {
      const exists = prev.timeline.some((t) => t.id === item.id);
      const updatedList = exists
        ? prev.timeline.map((t) => (t.id === item.id ? item : t))
        : [...prev.timeline, { ...item, displayOrder: prev.timeline.length + 1 }];
      return { ...prev, timeline: updatedList };
    });
    setEditingTimeline(null);
  };

  const deleteTimeline = (id: string) => {
    if (window.confirm('Delete this timeline milestone?')) {
      setFormData((prev) => ({
        ...prev,
        timeline: prev.timeline.filter((t) => t.id !== id)
      }));
    }
  };

  const moveTimeline = (index: number, direction: 'up' | 'down') => {
    const list = [...formData.timeline];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setFormData((prev) => ({ ...prev, timeline: list.map((it, idx) => ({ ...it, displayOrder: idx + 1 })) }));
  };

  // Achievement Handlers
  const saveAchievement = (ach: StoreAchievement) => {
    setFormData((prev) => {
      const exists = prev.achievements.some((a) => a.id === ach.id);
      const updatedList = exists
        ? prev.achievements.map((a) => (a.id === ach.id ? ach : a))
        : [...prev.achievements, { ...ach, displayOrder: prev.achievements.length + 1 }];
      return { ...prev, achievements: updatedList };
    });
    setEditingAchievement(null);
  };

  const deleteAchievement = (id: string) => {
    if (window.confirm('Delete this award/certificate?')) {
      setFormData((prev) => ({
        ...prev,
        achievements: prev.achievements.filter((a) => a.id !== id)
      }));
    }
  };

  // Gallery Handlers
  const saveGallery = (item: StoreGalleryItem) => {
    setFormData((prev) => {
      const exists = prev.gallery.some((g) => g.id === item.id);
      const updatedList = exists
        ? prev.gallery.map((g) => (g.id === item.id ? item : g))
        : [...prev.gallery, { ...item, displayOrder: prev.gallery.length + 1 }];
      return { ...prev, gallery: updatedList };
    });
    setEditingGallery(null);
  };

  const deleteGallery = (id: string) => {
    if (window.confirm('Delete this photo from store gallery?')) {
      setFormData((prev) => ({
        ...prev,
        gallery: prev.gallery.filter((g) => g.id !== id)
      }));
    }
  };

  // Counter Handlers
  const saveCounter = (counter: LiveCounterItem) => {
    setFormData((prev) => {
      const exists = prev.counters.some((c) => c.id === counter.id);
      const updatedList = exists
        ? prev.counters.map((c) => (c.id === counter.id ? counter : c))
        : [...prev.counters, { ...counter, displayOrder: prev.counters.length + 1 }];
      return { ...prev, counters: updatedList };
    });
    setEditingCounter(null);
  };

  const deleteCounter = (id: string) => {
    if (window.confirm('Delete this counter metric?')) {
      setFormData((prev) => ({
        ...prev,
        counters: prev.counters.filter((c) => c.id !== id)
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-900 text-white p-5 rounded-2xl border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-300">
            <Heart className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-wide flex items-center gap-2">
              About Us Manager <span className="text-xs font-semibold px-2.5 py-0.5 bg-amber-500/30 text-amber-300 rounded-full border border-amber-400/30">Admin Studio</span>
            </h2>
            <p className="text-xs text-neutral-300 mt-0.5">
              Customize Marudhar Fashion Point's business story, owners, timeline, achievements & store photos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefault}
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl border border-neutral-700 transition-colors flex items-center gap-1.5"
            title="Reset to original template"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
          </button>
          
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-950" /> Saved Live!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save All Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Content Copywriter Bar */}
      <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl p-4 shadow-lg text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-sm text-amber-200">Gemini AI Story Copywriter</span>
              <p className="text-xs text-neutral-400">Generate or enhance business story, owner bios, mission & highlights in seconds</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={aiType}
              onChange={(e: any) => setAiType(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="story">Business Story</option>
              <option value="mission">Mission Statement</option>
              <option value="vision">Vision Statement</option>
              <option value="bio">Owner Bio</option>
              <option value="highlights">Store Highlights</option>
            </select>

            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. 'Make it regal & customer focused celebrating 16 years in Pipar City'..."
              className="flex-1 md:w-80 bg-neutral-800/90 border border-neutral-700 text-xs text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-neutral-500"
            />

            <button
              onClick={handleAIGenerate}
              disabled={isGeneratingAI || !aiPrompt.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              {isGeneratingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Generate
            </button>
          </div>
        </div>
        {aiResultNote && (
          <p className="text-xs text-emerald-400 font-medium mt-2.5 pl-1 bg-emerald-950/40 py-1 px-2 rounded border border-emerald-500/20">
            {aiResultNote}
          </p>
        )}
      </div>

      {/* Main Sub Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-neutral-900/80 border border-neutral-800 rounded-2xl scrollbar-none">
        {[
          { id: 'story', label: 'Business Story & Info', icon: BookOpen },
          { id: 'owners', label: `Owners & Team (${formData.ownersAndTeam.length})`, icon: Users },
          { id: 'timeline', label: `Timeline (${formData.timeline.length})`, icon: Calendar },
          { id: 'achievements', label: `Achievements (${formData.achievements.length})`, icon: Award },
          { id: 'gallery', label: `Store Gallery (${formData.gallery.length})`, icon: ImageIcon },
          { id: 'counters', label: `Live Counters (${formData.counters.length})`, icon: BarChart2 },
          { id: 'social', label: 'Social & Links', icon: Share2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: STORY & GENERAL INFO */}
      {activeTab === 'story' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <BookOpen className="w-5 h-5 text-amber-500" /> Business Identity & Main Story
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Business Name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Establishment Year</label>
              <input
                type="text"
                value={formData.establishmentYear}
                onChange={(e) => setFormData((prev) => ({ ...prev, establishmentYear: e.target.value }))}
                placeholder="2010"
                className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Years of Experience Display</label>
              <input
                type="text"
                value={formData.experienceYears}
                onChange={(e) => setFormData((prev) => ({ ...prev, experienceYears: e.target.value }))}
                placeholder="16+"
                className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Main Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
              placeholder="Pioneering Quality Footwear & Family Fashion Heritage Since 2010"
              className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Short Shop Overview / Description</label>
            <textarea
              rows={2}
              value={formData.shopDescription}
              onChange={(e) => setFormData((prev) => ({ ...prev, shopDescription: e.target.value }))}
              className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Detailed Business Story</label>
            <textarea
              rows={5}
              value={formData.businessStory}
              onChange={(e) => setFormData((prev) => ({ ...prev, businessStory: e.target.value }))}
              className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Family Business Heritage & Personal Care Info</label>
            <textarea
              rows={3}
              value={formData.familyBusinessInfo}
              onChange={(e) => setFormData((prev) => ({ ...prev, familyBusinessInfo: e.target.value }))}
              className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Our Mission</label>
              <textarea
                rows={3}
                value={formData.mission}
                onChange={(e) => setFormData((prev) => ({ ...prev, mission: e.target.value }))}
                className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Our Vision</label>
              <textarea
                rows={3}
                value={formData.vision}
                onChange={(e) => setFormData((prev) => ({ ...prev, vision: e.target.value }))}
                className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Main Banner Image */}
          <div className="bg-neutral-800/60 border border-neutral-700/60 rounded-xl p-4">
            <label className="block text-xs font-semibold text-neutral-300 mb-2">Main About Us Showcase Image</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {formData.mainHeaderImage && (
                <img
                  src={formData.mainHeaderImage}
                  alt="Showcase"
                  className="w-28 h-20 object-cover rounded-lg border border-neutral-600 shadow-md"
                />
              )}
              <div className="flex-1 space-y-2 w-full">
                <input
                  type="text"
                  value={formData.mainHeaderImage || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mainHeaderImage: e.target.value }))}
                  placeholder="Image URL (e.g. Unsplash or direct link)"
                  className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 text-xs font-medium rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" /> Upload Image File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, (url) => setFormData((prev) => ({ ...prev, mainHeaderImage: url })))}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Store Highlights Bullet Points */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">Store Highlights & Value Pillars</label>
            <div className="space-y-2 mb-3">
              {formData.storeHighlights.map((hl, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-neutral-800 border border-neutral-700/80 rounded-xl px-3 py-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={hl}
                    onChange={(e) => {
                      const updated = [...formData.storeHighlights];
                      updated[idx] = e.target.value;
                      setFormData((prev) => ({ ...prev, storeHighlights: updated }));
                    }}
                    className="flex-1 bg-transparent text-white text-xs focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        storeHighlights: prev.storeHighlights.filter((_, i) => i !== idx)
                      }));
                    }}
                    className="text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                placeholder="Add a new store highlight (e.g. '100% Fit & Cushion Guarantee')"
                className="flex-1 bg-neutral-800 border border-neutral-700 text-white text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (highlightInput.trim()) {
                    setFormData((prev) => ({
                      ...prev,
                      storeHighlights: [...prev.storeHighlights, highlightInput.trim()]
                    }));
                    setHighlightInput('');
                  }
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: OWNERS & TEAM MEMBERS */}
      {activeTab === 'owners' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" /> Owners & Key Leadership Team
              </h3>
              <p className="text-xs text-neutral-400">Add, edit, reorder, or hide profile cards of Viju Bhai and team members.</p>
            </div>
            <button
              onClick={() => {
                setEditingOwner({
                  id: `owner_${Date.now()}`,
                  fullName: '',
                  position: 'Owner & Director',
                  roleType: 'owner',
                  shortIntro: '',
                  experience: '10+ Years',
                  specialization: 'Royal Footwear',
                  profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
                  socialLinks: {},
                  enabled: true,
                  featured: true,
                  displayOrder: formData.ownersAndTeam.length + 1
                });
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Owner / Member
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.ownersAndTeam.map((member, idx) => (
              <div
                key={member.id}
                className={`relative bg-neutral-800/80 border rounded-2xl p-4 transition-all flex flex-col justify-between ${
                  member.enabled ? 'border-neutral-700' : 'border-neutral-800 opacity-60'
                }`}
              >
                <div className="flex gap-3.5">
                  <img
                    src={member.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'}
                    alt={member.fullName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/40 shadow-md shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-sm text-white truncate">{member.fullName || 'Unnamed Member'}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        member.roleType === 'owner' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {member.roleType === 'owner' ? '👑 Owner' : '👥 Team'}
                      </span>
                    </div>

                    <p className="text-xs text-amber-400 font-medium truncate mt-0.5">{member.position}</p>
                    <p className="text-[11px] text-neutral-300 line-clamp-2 mt-1.5">{member.shortIntro}</p>

                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-2">
                      <span>Exp: {member.experience}</span>
                      <span>•</span>
                      <span className="truncate">{member.specialization}</span>
                    </div>
                  </div>
                </div>

                {/* Card Controls Footer */}
                <div className="flex items-center justify-between border-t border-neutral-700/60 pt-3 mt-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveOwner(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-30 text-white rounded-lg transition-colors"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveOwner(idx, 'down')}
                      disabled={idx === formData.ownersAndTeam.length - 1}
                      className="p-1.5 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-30 text-white rounded-lg transition-colors"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const updated = formData.ownersAndTeam.map((o) => (o.id === member.id ? { ...o, enabled: !o.enabled } : o));
                        setFormData((prev) => ({ ...prev, ownersAndTeam: updated }));
                      }}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        member.enabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-neutral-700 text-neutral-400'
                      }`}
                    >
                      {member.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingOwner(member)}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteOwner(member.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" /> Business Growth Timeline
              </h3>
              <p className="text-xs text-neutral-400">Chronological journey from 2010 store founding to present digital expansion.</p>
            </div>
            <button
              onClick={() => {
                setEditingTimeline({
                  id: `time_${Date.now()}`,
                  year: new Date().getFullYear().toString(),
                  title: '',
                  description: '',
                  image: '',
                  enabled: true,
                  displayOrder: formData.timeline.length + 1
                });
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Milestone
            </button>
          </div>

          <div className="space-y-3">
            {formData.timeline.map((item, idx) => (
              <div key={item.id} className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="px-3 py-2 bg-amber-500/20 text-amber-400 rounded-xl font-extrabold text-sm border border-amber-500/30">
                    {item.year}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{item.title || 'Untitled Milestone'}</h4>
                    <p className="text-xs text-neutral-300 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => moveTimeline(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-30 text-white rounded-lg"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveTimeline(idx, 'down')}
                    disabled={idx === formData.timeline.length - 1}
                    className="p-1.5 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-30 text-white rounded-lg"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingTimeline(item)}
                    className="px-3 py-1.5 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30"
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteTimeline(item.id)} className="p-1.5 text-neutral-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: ACHIEVEMENTS & CERTIFICATES */}
      {activeTab === 'achievements' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Certificates, Awards & Recognition
              </h3>
              <p className="text-xs text-neutral-400">Display official excellence awards, quality guarantees, and milestone seals.</p>
            </div>
            <button
              onClick={() => {
                setEditingAchievement({
                  id: `ach_${Date.now()}`,
                  type: 'award',
                  title: '',
                  issuerOrPublisher: 'Retail Excellence Committee',
                  year: new Date().getFullYear().toString(),
                  description: '',
                  enabled: true,
                  displayOrder: formData.achievements.length + 1
                });
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Award/Certificate
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.achievements.map((ach) => (
              <div key={ach.id} className="bg-neutral-800/80 border border-neutral-700/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {ach.type}
                  </span>
                  <span className="text-xs text-neutral-400 font-semibold">{ach.year}</span>
                </div>
                <h4 className="font-bold text-sm text-white">{ach.title || 'Untitled Award'}</h4>
                <p className="text-xs text-amber-400">{ach.issuerOrPublisher}</p>
                <p className="text-xs text-neutral-300">{ach.description}</p>
                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-700/60">
                  <button
                    onClick={() => setEditingAchievement(ach)}
                    className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30"
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteAchievement(ach.id)} className="p-1 text-neutral-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: STORE GALLERY */}
      {activeTab === 'gallery' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-500" /> Showroom & Event Photo Gallery
              </h3>
              <p className="text-xs text-neutral-400">Manage real photos of your store interior, exterior, team, and festive celebrations.</p>
            </div>
            <button
              onClick={() => {
                setEditingGallery({
                  id: `gal_${Date.now()}`,
                  category: 'shop_inside',
                  title: '',
                  caption: '',
                  imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
                  enabled: true,
                  displayOrder: formData.gallery.length + 1
                });
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Photo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {formData.gallery.map((photo) => (
              <div key={photo.id} className="group bg-neutral-800 border border-neutral-700/80 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between">
                <div className="relative h-40 overflow-hidden bg-neutral-950">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-neutral-900/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 backdrop-blur-sm uppercase">
                    {photo.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-xs text-white truncate">{photo.title || 'Showroom Photo'}</h4>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5">{photo.caption}</p>
                  <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-neutral-700/60">
                    <button
                      onClick={() => setEditingGallery(photo)}
                      className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-[11px] font-bold rounded-lg border border-amber-500/30"
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteGallery(photo.id)} className="p-1 text-neutral-400 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: LIVE COUNTERS */}
      {activeTab === 'counters' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-amber-500" /> Customer Trust Live Counters
              </h3>
              <p className="text-xs text-neutral-400">Display animated metrics like Years of Heritage, Happy Customers & Delivered Orders.</p>
            </div>
            <button
              onClick={() => {
                setEditingCounter({
                  id: `cnt_${Date.now()}`,
                  label: '',
                  value: '1000',
                  suffix: '+',
                  autoCalculate: false,
                  enabled: true,
                  displayOrder: formData.counters.length + 1
                });
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Counter Metric
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {formData.counters.map((cnt) => (
              <div key={cnt.id} className="bg-neutral-800 border border-neutral-700/80 rounded-2xl p-4 text-center space-y-1">
                <div className="text-2xl font-black text-amber-400">
                  {cnt.prefix}{cnt.value}{cnt.suffix}
                </div>
                <div className="text-xs font-bold text-white">{cnt.label || 'Metric Label'}</div>
                {cnt.autoCalculate && (
                  <span className="inline-block text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full mt-1">
                    ⚡ Auto Synced
                  </span>
                )}
                <div className="flex justify-center gap-2 pt-2 mt-2 border-t border-neutral-700/60">
                  <button
                    onClick={() => setEditingCounter(cnt)}
                    className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30"
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteCounter(cnt.id)} className="p-1 text-neutral-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: SOCIAL & LINKS */}
      {activeTab === 'social' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Share2 className="w-5 h-5 text-amber-500" /> Social Links & Direct Contact Channels
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Instagram Profile Link</label>
              <input
                type="text"
                value={formData.socialLinks?.instagram || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, instagram: e.target.value } }))}
                placeholder="https://instagram.com/marudhar_fashion_point"
                className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">WhatsApp Direct Number (With Country Code)</label>
              <input
                type="text"
                value={formData.socialLinks?.whatsapp || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, whatsapp: e.target.value } }))}
                placeholder="919829012345"
                className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Facebook Page Link</label>
              <input
                type="text"
                value={formData.socialLinks?.facebook || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, facebook: e.target.value } }))}
                placeholder="https://facebook.com/marudharfashionpoint"
                className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">YouTube Channel Link</label>
              <input
                type="text"
                value={formData.socialLinks?.youtube || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, youtube: e.target.value } }))}
                placeholder="https://youtube.com/@marudharfashionpoint"
                className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL: OWNER MEMBER */}
      {editingOwner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl w-full max-w-2xl p-6 space-y-4 my-8 text-white max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2 border-b border-neutral-800 pb-3">
              <UserCheck className="w-5 h-5 text-amber-400" /> Edit Team Member Profile Card
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingOwner.fullName}
                  onChange={(e) => setEditingOwner({ ...editingOwner, fullName: e.target.value })}
                  placeholder="Viju Bhai Choudhary"
                  className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Position / Designation</label>
                <input
                  type="text"
                  value={editingOwner.position}
                  onChange={(e) => setEditingOwner({ ...editingOwner, position: e.target.value })}
                  placeholder="Founder & Managing Director"
                  className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Role Type</label>
                <select
                  value={editingOwner.roleType}
                  onChange={(e: any) => setEditingOwner({ ...editingOwner, roleType: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="owner">Owner / Co-Founder</option>
                  <option value="team">Team Member / Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Experience Years</label>
                <input
                  type="text"
                  value={editingOwner.experience}
                  onChange={(e) => setEditingOwner({ ...editingOwner, experience: e.target.value })}
                  placeholder="18+ Years"
                  className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Specialization / Expertise</label>
              <input
                type="text"
                value={editingOwner.specialization}
                onChange={(e) => setEditingOwner({ ...editingOwner, specialization: e.target.value })}
                placeholder="Royal Wedding Mojaris & Customer Relationships"
                className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Short Biography / Introduction</label>
              <textarea
                rows={3}
                value={editingOwner.shortIntro}
                onChange={(e) => setEditingOwner({ ...editingOwner, shortIntro: e.target.value })}
                placeholder="Brief introduction..."
                className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Profile Image URL or Upload */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Profile Photo</label>
              <div className="flex items-center gap-3">
                <img
                  src={editingOwner.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'}
                  alt="Preview"
                  className="w-12 h-12 rounded-full object-cover border border-amber-500/40 shrink-0"
                />
                <input
                  type="text"
                  value={editingOwner.profilePhoto}
                  onChange={(e) => setEditingOwner({ ...editingOwner, profilePhoto: e.target.value })}
                  placeholder="Photo URL"
                  className="flex-1 bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white focus:outline-none"
                />
                <label className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg cursor-pointer transition-colors border border-neutral-700 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" /> Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, (url) => setEditingOwner({ ...editingOwner, profilePhoto: url }))}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Social Links for Owner */}
            <div className="space-y-2 border-t border-neutral-800 pt-3">
              <span className="text-xs font-bold text-amber-300">Individual Contact & Social Links</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editingOwner.contactNumber || ''}
                  onChange={(e) => setEditingOwner({ ...editingOwner, contactNumber: e.target.value })}
                  placeholder="Phone: +91 98290 12345"
                  className="bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-1.5 text-white"
                />
                <input
                  type="text"
                  value={editingOwner.socialLinks?.whatsapp || ''}
                  onChange={(e) => setEditingOwner({ ...editingOwner, socialLinks: { ...editingOwner.socialLinks, whatsapp: e.target.value } })}
                  placeholder="WhatsApp Number (e.g. 919829012345)"
                  className="bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-1.5 text-white"
                />
                <input
                  type="text"
                  value={editingOwner.socialLinks?.instagram || ''}
                  onChange={(e) => setEditingOwner({ ...editingOwner, socialLinks: { ...editingOwner.socialLinks, instagram: e.target.value } })}
                  placeholder="Instagram Link"
                  className="bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-1.5 text-white"
                />
                <input
                  type="text"
                  value={editingOwner.signature || ''}
                  onChange={(e) => setEditingOwner({ ...editingOwner, signature: e.target.value })}
                  placeholder="Signature / Quote (e.g. 'Viju Bhai')"
                  className="bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-1.5 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
              <label className="flex items-center gap-2 text-xs text-neutral-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingOwner.enabled}
                  onChange={(e) => setEditingOwner({ ...editingOwner, enabled: e.target.checked })}
                  className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500"
                />
                Show on Customer Website
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingOwner(null)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveOwner(editingOwner)}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-md"
                >
                  Save Owner Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL: TIMELINE */}
      {editingTimeline && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Calendar className="w-5 h-5 text-amber-400" /> Edit Growth Milestone
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Year</label>
                <input
                  type="text"
                  value={editingTimeline.year}
                  onChange={(e) => setEditingTimeline({ ...editingTimeline, year: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Milestone Title</label>
                <input
                  type="text"
                  value={editingTimeline.title}
                  onChange={(e) => setEditingTimeline({ ...editingTimeline, title: e.target.value })}
                  placeholder="Store Launch / Expansion"
                  className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={editingTimeline.description}
                onChange={(e) => setEditingTimeline({ ...editingTimeline, description: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg p-2.5 text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setEditingTimeline(null)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => saveTimeline(editingTimeline)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl"
              >
                Save Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL: ACHIEVEMENT */}
      {editingAchievement && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white">
            <h3 className="text-base font-bold text-amber-300 border-b border-neutral-800 pb-3">
              Edit Award / Certificate
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Type</label>
                <select
                  value={editingAchievement.type}
                  onChange={(e: any) => setEditingAchievement({ ...editingAchievement, type: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white"
                >
                  <option value="award">Award</option>
                  <option value="certificate">Certificate</option>
                  <option value="milestone">Milestone Seal</option>
                  <option value="media">Media Coverage</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Year</label>
                <input
                  type="text"
                  value={editingAchievement.year}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, year: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Title</label>
              <input
                type="text"
                value={editingAchievement.title}
                onChange={(e) => setEditingAchievement({ ...editingAchievement, title: e.target.value })}
                placeholder="Best Retail Footwear Store"
                className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Issuer / Committee</label>
              <input
                type="text"
                value={editingAchievement.issuerOrPublisher}
                onChange={(e) => setEditingAchievement({ ...editingAchievement, issuerOrPublisher: e.target.value })}
                placeholder="Rajasthan Retail Association"
                className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={editingAchievement.description}
                onChange={(e) => setEditingAchievement({ ...editingAchievement, description: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg p-2 text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button onClick={() => setEditingAchievement(null)} className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-xl">
                Cancel
              </button>
              <button onClick={() => saveAchievement(editingAchievement)} className="px-5 py-2 bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL: GALLERY */}
      {editingGallery && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white">
            <h3 className="text-base font-bold text-amber-300 border-b border-neutral-800 pb-3">
              Edit Gallery Photo
            </h3>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Category</label>
              <select
                value={editingGallery.category}
                onChange={(e: any) => setEditingGallery({ ...editingGallery, category: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white"
              >
                <option value="shop_inside">Inside Showroom</option>
                <option value="shop_outside">Store Exterior</option>
                <option value="team">Team Photos</option>
                <option value="festival">Festival Celebration</option>
                <option value="events">Customer Events</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Photo Title</label>
              <input
                type="text"
                value={editingGallery.title}
                onChange={(e) => setEditingGallery({ ...editingGallery, title: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Caption</label>
              <input
                type="text"
                value={editingGallery.caption || ''}
                onChange={(e) => setEditingGallery({ ...editingGallery, caption: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Photo URL / Upload</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editingGallery.imageUrl}
                  onChange={(e) => setEditingGallery({ ...editingGallery, imageUrl: e.target.value })}
                  className="flex-1 bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white"
                />
                <label className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg cursor-pointer border border-neutral-700">
                  <Upload className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, (url) => setEditingGallery({ ...editingGallery, imageUrl: url }))}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button onClick={() => setEditingGallery(null)} className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-xl">
                Cancel
              </button>
              <button onClick={() => saveGallery(editingGallery)} className="px-5 py-2 bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL: COUNTER */}
      {editingCounter && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white">
            <h3 className="text-base font-bold text-amber-300 border-b border-neutral-800 pb-3">
              Edit Live Counter Metric
            </h3>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Metric Label</label>
              <input
                type="text"
                value={editingCounter.label}
                onChange={(e) => setEditingCounter({ ...editingCounter, label: e.target.value })}
                placeholder="Happy Customers"
                className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Prefix</label>
                <input
                  type="text"
                  value={editingCounter.prefix || ''}
                  onChange={(e) => setEditingCounter({ ...editingCounter, prefix: e.target.value })}
                  placeholder=""
                  className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Value</label>
                <input
                  type="text"
                  value={editingCounter.value}
                  onChange={(e) => setEditingCounter({ ...editingCounter, value: e.target.value })}
                  placeholder="50000"
                  className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Suffix</label>
                <input
                  type="text"
                  value={editingCounter.suffix || ''}
                  onChange={(e) => setEditingCounter({ ...editingCounter, suffix: e.target.value })}
                  placeholder="+"
                  className="w-full bg-neutral-800 border border-neutral-700 text-xs rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="autoCalc"
                checked={editingCounter.autoCalculate}
                onChange={(e) => setEditingCounter({ ...editingCounter, autoCalculate: e.target.checked })}
                className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="autoCalc" className="text-xs text-neutral-300 font-semibold cursor-pointer">
                Auto Calculate from Live Catalog / Orders / Heritage Years
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button onClick={() => setEditingCounter(null)} className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-xl">
                Cancel
              </button>
              <button onClick={() => saveCounter(editingCounter)} className="px-5 py-2 bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl">
                Save Counter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
