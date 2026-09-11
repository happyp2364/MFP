import React, { useState, useEffect, useMemo } from 'react';
import {
  Instagram,
  Smartphone,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Sparkles,
  Play,
  Heart,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ShoppingBag,
  Volume2,
  Flame,
  CheckCircle2,
  Search
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { InstagramReelItem } from '../../types';
import { AdminImageSelector } from '../Common/UniversalImageSystem';

const DEFAULT_REELS: InstagramReelItem[] = [
  {
    id: 'reel_1',
    reelUrl: 'https://www.instagram.com/marudharfashionpoint/',
    title: 'Royal Wedding Mojari Showcase',
    caption: 'Pure royal craftsmanship from Rajasthan. Handcrafted leather mojaris crafted for grand celebrations! 👑✨',
    thumbnailUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    viewsCount: '48.2K',
    likesCount: '3.4K',
    soundTitle: 'Original Audio - marudharfashionpoint',
    featured: true,
    enabled: true,
    displayOrder: 1,
  },
  {
    id: 'reel_2',
    reelUrl: 'https://www.instagram.com/marudharfashionpoint/',
    title: 'High-Impact Air Sole Sneakers Test',
    caption: 'Lightweight, ultra-cushioned sports running sneakers. Walking 10,000 steps feeling like clouds! 👟⚡',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    viewsCount: '62.5K',
    likesCount: '4.8K',
    soundTitle: 'Original Audio - marudharfashionpoint',
    featured: false,
    enabled: true,
    displayOrder: 2,
  },
  {
    id: 'reel_3',
    reelUrl: 'https://www.instagram.com/marudharfashionpoint/',
    title: 'Pipar City Main Store Walkthrough',
    caption: 'Come visit our Pipar City showroom! Discover thousands of sneakers, loafers and party wear in person. 🏬🔥',
    thumbnailUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
    viewsCount: '35.1K',
    likesCount: '2.9K',
    soundTitle: 'Original Audio - marudharfashionpoint',
    featured: false,
    enabled: true,
    displayOrder: 3,
  },
  {
    id: 'reel_4',
    reelUrl: 'https://www.instagram.com/marudharfashionpoint/',
    title: 'Flat ₹699 Mega Bonanza Drop',
    caption: 'Best-selling ₹699 sneakers collection live! High-performance sneakers at honest family pricing. 👟💥',
    thumbnailUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
    viewsCount: '51.8K',
    likesCount: '4.1K',
    soundTitle: 'Original Audio - marudharfashionpoint',
    featured: false,
    enabled: true,
    displayOrder: 4,
  },
];

export const InstagramReelsAdminManager: React.FC = () => {
  const { socialMediaConfig, updateSocialMediaConfig, products, showToast } = useStore();

  const [enabled, setEnabled] = useState<boolean>(
    socialMediaConfig?.instagramReelsPhoneEnabled !== false
  );
  const [title, setTitle] = useState<string>(
    socialMediaConfig?.instagramReelsPhoneTitle || 'See Us on Instagram • मरुधर फैशन पॉइंट ऑन इंस्टाग्राम'
  );
  const [subtitle, setSubtitle] = useState<string>(
    socialMediaConfig?.instagramReelsPhoneSubtitle || 'Latest looks, new arrivals & store moments — follow us on Instagram @marudharfashionpoint'
  );
  const [accountHandle, setAccountHandle] = useState<string>(
    socialMediaConfig?.instagramReelsPhoneAccountHandle || '@marudharfashionpoint'
  );
  const [accountUrl, setAccountUrl] = useState<string>(
    socialMediaConfig?.instagramReelsPhoneAccountUrl || 'https://www.instagram.com/marudharfashionpoint/'
  );

  const [reels, setReels] = useState<InstagramReelItem[]>(() => {
    const list = socialMediaConfig?.instagramReelsList;
    if (Array.isArray(list) && list.length > 0) {
      return [...list];
    }
    return DEFAULT_REELS;
  });

  const [editingReelId, setEditingReelId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields for Add / Edit
  const [formReelUrl, setFormReelUrl] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formViewsCount, setFormViewsCount] = useState('45K');
  const [formLikesCount, setFormLikesCount] = useState('2.8K');
  const [formSoundTitle, setFormSoundTitle] = useState('Original Audio - marudharfashionpoint');
  const [formTaggedProductId, setFormTaggedProductId] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formEnabled, setFormEnabled] = useState(true);
  const [productSearch, setProductSearch] = useState('');

  // Sync with store
  useEffect(() => {
    if (socialMediaConfig) {
      setEnabled(socialMediaConfig.instagramReelsPhoneEnabled !== false);
      setTitle(socialMediaConfig.instagramReelsPhoneTitle || 'See Us on Instagram • मरुधर फैशन पॉइंट ऑन इंस्टाग्राम');
      setSubtitle(socialMediaConfig.instagramReelsPhoneSubtitle || 'Latest looks, new arrivals & store moments — follow us on Instagram @marudharfashionpoint');
      setAccountHandle(socialMediaConfig.instagramReelsPhoneAccountHandle || '@marudharfashionpoint');
      setAccountUrl(socialMediaConfig.instagramReelsPhoneAccountUrl || 'https://www.instagram.com/marudharfashionpoint/');
      if (Array.isArray(socialMediaConfig.instagramReelsList) && socialMediaConfig.instagramReelsList.length > 0) {
        setReels([...socialMediaConfig.instagramReelsList]);
      }
    }
  }, [socialMediaConfig]);

  // Filtered products for tagging
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    if (!productSearch.trim()) return products.slice(0, 20);
    const q = productSearch.toLowerCase();
    return products.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [products, productSearch]);

  const handleStartAdd = () => {
    setEditingReelId(null);
    setFormReelUrl(accountUrl);
    setFormTitle('');
    setFormCaption('');
    setFormThumbnailUrl('https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80');
    setFormViewsCount('50K');
    setFormLikesCount('3.5K');
    setFormSoundTitle('Original Audio - marudharfashionpoint');
    setFormTaggedProductId('');
    setFormFeatured(false);
    setFormEnabled(true);
    setShowAddForm(true);
  };

  const handleStartEdit = (reel: InstagramReelItem) => {
    setShowAddForm(false);
    setEditingReelId(reel.id);
    setFormReelUrl(reel.reelUrl || accountUrl);
    setFormTitle(reel.title || '');
    setFormCaption(reel.caption || '');
    setFormThumbnailUrl(reel.thumbnailUrl || '');
    setFormViewsCount(reel.viewsCount || '40K');
    setFormLikesCount(reel.likesCount || '2.5K');
    setFormSoundTitle(reel.soundTitle || 'Original Audio - marudharfashionpoint');
    setFormTaggedProductId(reel.taggedProductId || '');
    setFormFeatured(Boolean(reel.featured));
    setFormEnabled(reel.enabled !== false);
  };

  const handleCancelForm = () => {
    setEditingReelId(null);
    setShowAddForm(false);
  };

  const handleSaveReel = () => {
    if (!formTitle.trim()) {
      showToast('Please provide a title for the Reel', 'warning');
      return;
    }
    if (!formReelUrl.trim()) {
      showToast('Please provide the Instagram Reel URL', 'warning');
      return;
    }
    if (!formThumbnailUrl.trim()) {
      showToast('Please provide or upload a thumbnail image', 'warning');
      return;
    }

    if (editingReelId) {
      // Edit existing
      setReels((prev) =>
        prev.map((r) =>
          r.id === editingReelId
            ? {
                ...r,
                reelUrl: formReelUrl || accountUrl,
                title: formTitle.trim(),
                caption: formCaption.trim(),
                thumbnailUrl: formThumbnailUrl.trim(),
                viewsCount: formViewsCount,
                likesCount: formLikesCount,
                soundTitle: formSoundTitle,
                taggedProductId: formTaggedProductId || undefined,
                featured: formFeatured,
                enabled: formEnabled,
              }
            : r
        )
      );
      setEditingReelId(null);
      showToast('Reel updated in list (click "Publish Reels to Website" to save to cloud)', 'info');
    } else {
      // Add new
      const newReel: InstagramReelItem = {
        id: `reel_${Date.now()}`,
        reelUrl: formReelUrl || accountUrl,
        title: formTitle.trim(),
        caption: formCaption.trim(),
        thumbnailUrl: formThumbnailUrl.trim(),
        viewsCount: formViewsCount,
        likesCount: formLikesCount,
        soundTitle: formSoundTitle,
        taggedProductId: formTaggedProductId || undefined,
        featured: formFeatured,
        enabled: formEnabled,
        displayOrder: reels.length + 1,
      };
      setReels((prev) => [...prev, newReel]);
      setShowAddForm(false);
      showToast('New Reel added to list (click "Publish Reels to Website" to save to cloud)', 'info');
    }
  };

  const handleDeleteReel = (id: string) => {
    if (window.confirm('Delete this Instagram reel from showcase?')) {
      setReels((prev) => prev.filter((r) => r.id !== id).map((item, idx) => ({ ...item, displayOrder: idx + 1 })));
      showToast('Reel removed from showcase', 'info');
    }
  };

  const handleToggleReelEnabled = (id: string) => {
    setReels((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !(r.enabled !== false) } : r))
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setReels((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === reels.length - 1) return;
    setReels((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
    });
  };

  const handleSetDisplayOrder = (id: string, targetOrder: number) => {
    setReels((prev) => {
      const currentIndex = prev.findIndex((r) => r.id === id);
      if (currentIndex === -1) return prev;
      const copy = [...prev];
      const [item] = copy.splice(currentIndex, 1);
      const targetIndex = Math.max(0, Math.min(targetOrder - 1, copy.length));
      copy.splice(targetIndex, 0, item);
      return copy.map((r, idx) => ({ ...r, displayOrder: idx + 1 }));
    });
    showToast(`Reel position changed to #${targetOrder}`, 'info');
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset reels list to factory default showcase? Any custom reels will be replaced with standard showcase reels.')) {
      setReels(DEFAULT_REELS);
      showToast('Reels reset to default collection (click "Publish Reels to Website" to save)', 'info');
    }
  };

  const handleSaveAllToFirestore = async () => {
    setIsSaving(true);
    try {
      const updatedConfig = {
        ...(socialMediaConfig || {}),
        instagramReelsPhoneEnabled: enabled,
        instagramReelsPhoneTitle: title,
        instagramReelsPhoneSubtitle: subtitle,
        instagramReelsPhoneAccountHandle: accountHandle,
        instagramReelsPhoneAccountUrl: accountUrl,
        instagramReelsList: reels,
      };

      await updateSocialMediaConfig(updatedConfig);
      showToast('Instagram Reels Smartphone Showcase saved to Firestore!', 'success');
    } catch (err) {
      console.error('Error saving Instagram reels settings:', err);
      showToast('Failed to save Instagram Reels settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-bold mb-1.5 border border-pink-200">
            <Instagram className="w-3.5 h-3.5" />
            <span>INSTAGRAM REELS SMARTPHONE SHOWCASE</span>
          </div>
          <h2 className="text-xl font-black text-neutral-900 font-serif-heading">
            Instagram Reels Smartphone Display
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Showcase your viral store reels, shoes in motion & customer reviews in an interactive smartphone frame on the homepage.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAllToFirestore}
          disabled={isSaving}
          className="px-5 py-2.5 bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving to Cloud...' : 'Publish Reels to Website'}</span>
        </button>
      </div>

      {/* Global Section Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80">
        <div>
          <label className="font-bold text-neutral-700 block mb-1">Section Display Status</label>
          <label className="flex items-center gap-2 font-bold text-neutral-800 bg-white p-2.5 rounded-xl border border-neutral-200 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="rounded text-[#0B8F63] w-4 h-4"
            />
            <span>Enable Reels Smartphone Section</span>
          </label>
        </div>

        <div>
          <label className="font-bold text-neutral-700 block mb-1">Instagram Account Handle</label>
          <input
            type="text"
            value={accountHandle}
            onChange={(e) => setAccountHandle(e.target.value)}
            placeholder="@marudharfashionpoint"
            className="w-full bg-white border border-neutral-200 rounded-xl p-2.5 font-bold outline-none text-[#0B8F63]"
          />
        </div>

        <div>
          <label className="font-bold text-neutral-700 block mb-1">Instagram Profile Web URL</label>
          <input
            type="url"
            value={accountUrl}
            onChange={(e) => setAccountUrl(e.target.value)}
            placeholder="https://www.instagram.com/marudharfashionpoint/"
            className="w-full bg-white border border-neutral-200 rounded-xl p-2.5 font-mono text-[11px] outline-none text-blue-700"
          />
        </div>

        <div>
          <label className="font-bold text-neutral-700 block mb-1">Total Active Reels</label>
          <div className="bg-white border border-neutral-200 rounded-xl p-2.5 font-black text-neutral-900 flex items-center justify-between">
            <span>{reels.filter(r => r.enabled !== false).length} / {reels.length} Reels</span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Live Ready</span>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="font-bold text-neutral-700 block mb-1">Section Heading Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="See Us on Instagram • मरुधर फैशन पॉइंट ऑन इंस्टाग्राम"
            className="w-full bg-white border border-neutral-200 rounded-xl p-2.5 font-semibold outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="font-bold text-neutral-700 block mb-1">Section Subtitle / Description</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Latest looks, new arrivals & store moments — follow us on Instagram @marudharfashionpoint"
            className="w-full bg-white border border-neutral-200 rounded-xl p-2.5 outline-none"
          />
        </div>
      </div>

      {/* Reel Items List Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h3 className="font-serif-heading font-black text-neutral-900 text-base flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#0B8F63]" />
            <span>Configured Instagram Reels</span>
          </h3>
          <p className="text-xs text-neutral-500">
            Click any reel to edit, toggle active status, or re-order. These display inside the interactive phone showcase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to factory sample showcase reels"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleStartAdd}
            className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW REEL</span>
          </button>
        </div>
      </div>

      {/* ADD / EDIT REEL FORM MODAL / PANEL */}
      {(showAddForm || editingReelId) && (
        <div className="bg-emerald-50/50 p-5 rounded-3xl border-2 border-emerald-300 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
            <h4 className="font-serif-heading font-black text-sm text-emerald-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{editingReelId ? 'Edit Instagram Reel' : 'Add New Instagram Reel'}</span>
            </h4>
            <button
              type="button"
              onClick={handleCancelForm}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            <div className="sm:col-span-2">
              <label className="font-bold text-neutral-800 block mb-1">Reel Title / Headline</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Royal Mojari Wedding Collection 2025"
                className="w-full bg-white border border-neutral-300 rounded-xl p-2.5 font-bold outline-none text-neutral-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-neutral-800">Direct Instagram Reel URL</label>
                {formReelUrl && (
                  <a
                    href={formReelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-pink-600 hover:text-pink-700 font-bold"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Test Link</span>
                  </a>
                )}
              </div>
              <input
                type="url"
                value={formReelUrl}
                onChange={(e) => setFormReelUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                className="w-full bg-white border border-neutral-300 rounded-xl p-2.5 font-mono text-[11px] outline-none text-blue-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-neutral-800 block mb-1">Caption / Story Text</label>
              <textarea
                rows={2}
                value={formCaption}
                onChange={(e) => setFormCaption(e.target.value)}
                placeholder="Describe the footwear or showroom moment featured in this reel..."
                className="w-full bg-white border border-neutral-300 rounded-xl p-2.5 outline-none font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Views Count</label>
                  <input
                    type="text"
                    value={formViewsCount}
                    onChange={(e) => setFormViewsCount(e.target.value)}
                    placeholder="e.g. 52.4K"
                    className="w-full bg-white border border-neutral-300 rounded-xl p-2 outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Likes Count</label>
                  <input
                    type="text"
                    value={formLikesCount}
                    onChange={(e) => setFormLikesCount(e.target.value)}
                    placeholder="e.g. 3.8K"
                    className="w-full bg-white border border-neutral-300 rounded-xl p-2 outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">Audio Track Name</label>
                <input
                  type="text"
                  value={formSoundTitle}
                  onChange={(e) => setFormSoundTitle(e.target.value)}
                  placeholder="Original Audio - marudharfashionpoint"
                  className="w-full bg-white border border-neutral-300 rounded-xl p-2 outline-none font-medium"
                />
              </div>
            </div>

            {/* Tagged Product Selector */}
            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-neutral-800">Tag a Shoe/Product (Enables "Buy This Shoe" Quick Order)</label>
                <div className="flex items-center gap-2">
                  {formTaggedProductId && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const prod = products.find(p => p.id === formTaggedProductId);
                          const shoeImg = prod?.imageUrl || (prod?.images && prod.images[0]);
                          if (shoeImg) {
                            setFormThumbnailUrl(shoeImg);
                            showToast('Shoe image applied as thumbnail', 'info');
                          }
                        }}
                        className="text-[10px] text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded font-bold transition-colors cursor-pointer"
                      >
                        Use Shoe Image as Thumbnail
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormTaggedProductId('')}
                        className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>
              </div>

              <select
                value={formTaggedProductId}
                onChange={(e) => setFormTaggedProductId(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-xl p-2.5 text-xs outline-none font-medium"
              >
                <option value="">-- No Tagged Product (Standard Reel) --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.price}) - {p.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-1.5 font-bold text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="rounded text-amber-500 w-4 h-4"
                />
                <span>Featured / Trending Badge</span>
              </label>

              <label className="flex items-center gap-1.5 font-bold text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formEnabled}
                  onChange={(e) => setFormEnabled(e.target.checked)}
                  className="rounded text-[#0B8F63] w-4 h-4"
                />
                <span>Visible in Phone</span>
              </label>
            </div>

            {/* Universal Image Selector for Reel Thumbnail */}
            <div className="sm:col-span-3 pt-2">
              <AdminImageSelector
                value={formThumbnailUrl}
                onChange={(url) => setFormThumbnailUrl(url)}
                label="Reel Poster / Thumbnail Image"
                description="Upload a vertical format shoe/store visual or paste an Instagram CDN photo link."
              />
            </div>

          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-emerald-200/60">
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-4 py-2 rounded-xl border border-neutral-300 bg-white text-neutral-700 font-bold text-xs cursor-pointer hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveReel}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingReelId ? 'Apply Reel Updates' : 'Add Reel to Showcase'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Reel Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reels.map((reel, idx) => {
          const isActivelyEditing = editingReelId === reel.id;
          const isEnabledItem = reel.enabled !== false;

          return (
            <div
              key={reel.id}
              className={`bg-neutral-50 rounded-2xl border transition-all p-3 flex flex-col justify-between ${
                isActivelyEditing
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30'
                  : isEnabledItem
                  ? 'border-neutral-200 hover:border-neutral-300'
                  : 'border-neutral-200 opacity-60 bg-neutral-100'
              }`}
            >
              <div>
                {/* Thumbnail & Badges */}
                <div className="relative aspect-[9/14] rounded-xl overflow-hidden bg-neutral-900 mb-2.5 border border-neutral-200 shadow-inner group">
                  <img
                    src={reel.thumbnailUrl}
                    alt={reel.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                    <span className="bg-black/60 backdrop-blur-md text-white font-mono text-[9px] px-2 py-0.5 rounded-full">
                      #{idx + 1}
                    </span>
                    {reel.featured && (
                      <span className="bg-amber-400 text-neutral-950 font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                        <Flame className="w-2.5 h-2.5 fill-current" />
                        <span>HOT</span>
                      </span>
                    )}
                  </div>

                  {/* Play & Engagement overlay */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px]">
                    <span className="flex items-center gap-1 font-bold">
                      <Play className="w-3 h-3 fill-white" />
                      <span>{reel.viewsCount || '40K'}</span>
                    </span>
                    <span className="flex items-center gap-1 font-bold text-pink-300">
                      <Heart className="w-3 h-3 fill-pink-400 text-pink-400" />
                      <span>{reel.likesCount || '2K'}</span>
                    </span>
                  </div>
                </div>

                {/* Info */}
                <h4 className="font-bold text-xs text-neutral-900 line-clamp-1 mb-0.5">
                  {reel.title}
                </h4>
                <p className="text-[10px] text-neutral-500 line-clamp-2 leading-tight">
                  {reel.caption || 'No caption provided'}
                </p>

                {reel.taggedProductId && (
                  <div className="mt-1.5 inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                    <ShoppingBag className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Shoe Tagged</span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-3 pt-2.5 border-t border-neutral-200 flex items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 rounded bg-white hover:bg-neutral-200 border border-neutral-200 disabled:opacity-30 cursor-pointer"
                    title="Move Left/Up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === reels.length - 1}
                    className="p-1 rounded bg-white hover:bg-neutral-200 border border-neutral-200 disabled:opacity-30 cursor-pointer"
                    title="Move Right/Down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <select
                    value={idx + 1}
                    onChange={(e) => handleSetDisplayOrder(reel.id, Number(e.target.value))}
                    className="bg-white border border-neutral-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-neutral-700 outline-none cursor-pointer"
                    title="Set order position directly"
                  >
                    {reels.map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        #{i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <a
                    href={reel.reelUrl || accountUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white hover:bg-pink-50 border border-neutral-200 text-pink-600 cursor-pointer"
                    title="Test/Open Reel on Instagram"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleToggleReelEnabled(reel.id)}
                    className={`p-1.5 rounded-lg border cursor-pointer ${
                      isEnabledItem
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-neutral-200 border-neutral-300 text-neutral-500'
                    }`}
                    title={isEnabledItem ? 'Hide this Reel' : 'Show this Reel'}
                  >
                    {isEnabledItem ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(reel)}
                    className="p-1.5 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 cursor-pointer"
                    title="Edit Reel"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteReel(reel.id)}
                    className="p-1.5 rounded-lg bg-white hover:bg-rose-50 border border-rose-100 text-rose-600 cursor-pointer"
                    title="Delete Reel"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
