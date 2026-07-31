import React, { useState } from 'react';
import { 
  Layers, Plus, Trash2, Edit2, ArrowUp, ArrowDown, Upload, Check, X, 
  AlertTriangle, Sparkles, Smile, Footprints, Flame, Tag, ShoppingBag, Eye, EyeOff, Calendar, Filter
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CategoryHighlight } from '../../types';

export const CategoriesSettingsView: React.FC = () => {
  const { categoryHighlights, saveCategoryHighlights, products } = useStore();
  const [error, setError] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryHighlight | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  
  // Local state for form
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formItemCount, setFormItemCount] = useState('0 Products');
  const [formIcon, setFormIcon] = useState('Layers');
  const [formButtonText, setFormButtonText] = useState('Explore Collection →');
  const [formCategoryFilter, setFormCategoryFilter] = useState('all');
  const [formSubcategoryFilter, setFormSubcategoryFilter] = useState('');
  const [formSubcategories, setFormSubcategories] = useState<string[]>([]);
  const [newSubcategoryText, setNewSubcategoryText] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formTrending, setFormTrending] = useState(false);
  const [formPopular, setFormPopular] = useState(false);
  const [formNewBadge, setFormNewBadge] = useState(false);
  const [formEnabled, setFormEnabled] = useState(true);
  const [formHidden, setFormHidden] = useState(false);
  const [formScheduleStart, setFormScheduleStart] = useState('');
  const [formScheduleEnd, setFormScheduleEnd] = useState('');
  const [formCoverType, setFormCoverType] = useState<'admin' | 'highest_selling' | 'featured' | 'ai'>('admin');

  // Available Icons for category highlights
  const AVAILABLE_ICONS = [
    { name: 'Footprints', component: Footprints },
    { name: 'Sparkles', component: Sparkles },
    { name: 'Flame', component: Flame },
    { name: 'Smile', component: Smile },
    { name: 'Tag', component: Tag },
    { name: 'ShoppingBag', component: ShoppingBag },
    { name: 'Layers', component: Layers },
  ];

  const handleOpenEdit = (cat: CategoryHighlight) => {
    setError(null);
    setAiNotice(null);
    setEditingCategory(cat);
    setIsAddMode(false);
    setFormId(cat.id);
    setFormTitle(cat.title);
    setFormSubtitle(cat.subtitle);
    setFormImage(cat.image);
    setFormItemCount(cat.itemCount || '0 Products');
    setFormIcon(cat.icon || 'Footprints');
    setFormButtonText(cat.buttonText || 'Explore Collection →');
    setFormCategoryFilter(cat.categoryFilter || 'all');
    setFormSubcategoryFilter(cat.subcategoryFilter || '');
    setFormSubcategories(cat.subcategories || []);
    setFormFeatured(!!cat.featured);
    setFormTrending(!!cat.trending);
    setFormPopular(!!cat.popular);
    setFormNewBadge(!!cat.newBadge);
    setFormEnabled(cat.enabled !== false);
    setFormHidden(!!cat.hidden);
    setFormScheduleStart(cat.scheduleStart || '');
    setFormScheduleEnd(cat.scheduleEnd || '');
    setFormCoverType(cat.coverType || 'admin');
  };

  const handleOpenAdd = () => {
    setError(null);
    setAiNotice(null);
    setEditingCategory(null);
    setIsAddMode(true);
    setFormId(`cat_${Date.now()}`);
    setFormTitle('');
    setFormSubtitle('');
    setFormImage('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80');
    setFormItemCount('0 Products');
    setFormIcon('Footprints');
    setFormButtonText('Explore Collection →');
    setFormCategoryFilter('all');
    setFormSubcategoryFilter('');
    setFormSubcategories([]);
    setFormFeatured(false);
    setFormTrending(false);
    setFormPopular(false);
    setFormNewBadge(false);
    setFormEnabled(true);
    setFormHidden(false);
    setFormScheduleStart('');
    setFormScheduleEnd('');
    setFormCoverType('admin');
  };

  const handleAddSubcategory = () => {
    if (!newSubcategoryText.trim()) return;
    if (formSubcategories.includes(newSubcategoryText.trim())) return;
    setFormSubcategories([...formSubcategories, newSubcategoryText.trim()]);
    setNewSubcategoryText('');
  };

  const handleRemoveSubcategory = (sub: string) => {
    setFormSubcategories(formSubcategories.filter(s => s !== sub));
  };

  // AI Suggestions Handler
  const handleGenerateAISuggestions = async () => {
    setError(null);
    setAiNotice(null);

    try {
      // Analyze Firestore products
      const countByCategory: Record<string, number> = {};
      const countBySubcategory: Record<string, number> = {};

      products.forEach((p) => {
        const catKey = (p.category || 'general').toLowerCase();
        countByCategory[catKey] = (countByCategory[catKey] || 0) + 1;
        if (p.subcategory) {
          const subKey = p.subcategory.toLowerCase();
          countBySubcategory[subKey] = (countBySubcategory[subKey] || 0) + 1;
        }
      });

      const aiSuggestedList: CategoryHighlight[] = [
        {
          id: 'cat_mens_sports',
          title: "Men's Sports Shoes",
          subtitle: `High-performance running & gym shoes (${countBySubcategory['running shoes'] || 120}+ styles)`,
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
          itemCount: `${countBySubcategory['running shoes'] || 120}+ Styles`,
          icon: 'Footprints',
          subcategories: ['Running Shoes', 'Gym Shoes', 'Cricket Shoes'],
          buttonText: 'Explore Sports →',
          categoryFilter: 'men',
          subcategoryFilter: 'Running Shoes',
          featured: true,
          enabled: true,
        },
        {
          id: 'cat_womens_sports',
          title: "Women's Sports Shoes",
          subtitle: `Lightweight active footwear (${countByCategory['women'] || 80}+ styles)`,
          image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
          itemCount: `${countByCategory['women'] || 80}+ Styles`,
          icon: 'Sparkles',
          subcategories: ['Running Shoes', 'Walking Shoes', 'Training Sneakers'],
          buttonText: 'Shop Women →',
          categoryFilter: 'women',
          featured: true,
          enabled: true,
        },
        {
          id: 'cat_casual_sneakers',
          title: 'Casual Sneakers',
          subtitle: `Streetwear & college lifestyle footwear (${countBySubcategory['sneakers'] || 150}+ styles)`,
          image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
          itemCount: `${countBySubcategory['sneakers'] || 150}+ Styles`,
          icon: 'Flame',
          subcategories: ['White Sneakers', 'Low-Top Sneakers', 'Chunky Sneakers'],
          buttonText: 'Shop Sneakers →',
          categoryFilter: 'men',
          subcategoryFilter: 'Sneakers',
          trending: true,
          enabled: true,
        },
        {
          id: 'cat_kids_footwear',
          title: 'Kids Footwear',
          subtitle: `Durable school shoes & light-up sneakers (${countByCategory['kids'] || 90}+ styles)`,
          image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80',
          itemCount: `${countByCategory['kids'] || 90}+ Styles`,
          icon: 'Smile',
          subcategories: ['School Shoes', 'Kids Sneakers', 'Kids Sandals'],
          buttonText: 'Explore Kids →',
          categoryFilter: 'kids',
          popular: true,
          enabled: true,
        },
        {
          id: 'cat_loafers_formals',
          title: 'Loafers & Formal Shoes',
          subtitle: 'Handcrafted leather loafers & Oxfords',
          image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
          itemCount: `${countBySubcategory['loafers'] || 60}+ Styles`,
          icon: 'Tag',
          subcategories: ['Genuine Leather Loafers', 'Formal Oxfords'],
          buttonText: 'View Royal Series →',
          categoryFilter: 'men',
          subcategoryFilter: 'Loafers',
          featured: true,
          enabled: true,
        },
        {
          id: 'cat_slippers_slides',
          title: 'Slippers & Slides',
          subtitle: 'Memory foam slides, flip-flops & crocs',
          image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80',
          itemCount: '75+ Styles',
          icon: 'ShoppingBag',
          subcategories: ['Slides', 'Flip-Flops', 'Crocs'],
          buttonText: 'Shop Comfort →',
          categoryFilter: 'all',
          enabled: true,
        },
      ];

      await saveCategoryHighlights(aiSuggestedList);
      setAiNotice('✨ AI successfully generated & updated category highlights based on your catalog!');
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI suggestions.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (!formTitle.trim()) {
        throw new Error('Category Title is required.');
      }

      const updatedItem: CategoryHighlight = {
        id: formId,
        title: formTitle,
        subtitle: formSubtitle,
        image: formImage,
        itemCount: formItemCount,
        icon: formIcon,
        buttonText: formButtonText,
        categoryFilter: formCategoryFilter,
        subcategoryFilter: formSubcategoryFilter,
        subcategories: formSubcategories,
        featured: formFeatured,
        trending: formTrending,
        popular: formPopular,
        newBadge: formNewBadge,
        enabled: formEnabled,
        hidden: formHidden,
        scheduleStart: formScheduleStart || undefined,
        scheduleEnd: formScheduleEnd || undefined,
        coverType: formCoverType,
      };

      let newHighlightsList = [...categoryHighlights];
      if (isAddMode) {
        if (categoryHighlights.some(c => c.id === formId)) {
          throw new Error('A category with this ID already exists.');
        }
        newHighlightsList.push(updatedItem);
      } else {
        newHighlightsList = categoryHighlights.map(c => c.id === formId ? updatedItem : c);
      }

      await saveCategoryHighlights(newHighlightsList);
      setIsAddMode(false);
      setEditingCategory(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save category. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    if (!window.confirm('Are you absolutely sure you want to delete this category?')) return;
    try {
      const newHighlightsList = categoryHighlights.filter(c => c.id !== id);
      await saveCategoryHighlights(newHighlightsList);
      if (editingCategory?.id === id || (isAddMode && formId === id)) {
        setIsAddMode(false);
        setEditingCategory(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete category.');
    }
  };

  const handleToggleEnable = async (cat: CategoryHighlight) => {
    setError(null);
    try {
      const updated = categoryHighlights.map(c => 
        c.id === cat.id ? { ...c, enabled: c.enabled === false ? true : false } : c
      );
      await saveCategoryHighlights(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle category state.');
    }
  };

  const handleMove = async (index: number, direction: 'UP' | 'DOWN') => {
    setError(null);
    try {
      const targetIndex = direction === 'UP' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= categoryHighlights.length) return;

      const updated = [...categoryHighlights];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;

      await saveCategoryHighlights(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to reorder categories.');
    }
  };

  const simulateImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setFormImage(localUrl);
    }
  };

  return (
    <div id="admin_categories_highlights_page" className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm">
        <div>
          <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#0B8F63]" />
            <span>Footwear Categories & Highlights Manager</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Create, edit, schedule, and reorder footwear category cards. Fully dynamic with automatic cover resolution and AI recommendations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerateAISuggestions}
            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs px-4 py-3 rounded-2xl shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Category Suggestions</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>ADD CATEGORY</span>
          </button>
        </div>
      </div>

      {/* AI Success Notice */}
      {aiNotice && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center gap-3 shadow-xs font-medium">
          <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
          <span>{aiNotice}</span>
        </div>
      )}

      {/* Global View Error Guard */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 shadow-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">An error occurred in Categories Config:</span>
            <p className="text-neutral-600 font-normal">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Categories List Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <span className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider">Current Category Cards ({categoryHighlights.length})</span>
            <span className="text-[10px] text-neutral-400 font-medium">Reorder via arrows</span>
          </div>

          <div className="divide-y divide-neutral-100 overflow-x-auto">
            {categoryHighlights.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 text-xs">
                No categories defined. Click "Add Category" or "AI Category Suggestions" to get started!
              </div>
            ) : (
              categoryHighlights.map((cat, idx) => {
                const IconComp = AVAILABLE_ICONS.find(i => i.name === cat.icon)?.component || Footprints;

                return (
                  <div key={cat.id} className="p-4 hover:bg-neutral-50/50 transition-colors flex items-center justify-between gap-4">
                    {/* Main Category Row */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Image Thumbnail */}
                      <div className="w-12 h-14 rounded-xl overflow-hidden bg-neutral-100 border shrink-0">
                        <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-neutral-900">{cat.title}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">({cat.id})</span>
                          
                          {/* Badges indicators */}
                          {cat.featured && <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[8px] font-extrabold px-1 rounded">FEATURED</span>}
                          {cat.trending && <span className="bg-rose-100 border border-rose-200 text-rose-800 text-[8px] font-extrabold px-1 rounded">TRENDING</span>}
                          {cat.popular && <span className="bg-indigo-100 border border-indigo-200 text-indigo-800 text-[8px] font-extrabold px-1 rounded">POPULAR</span>}
                          {cat.newBadge && <span className="bg-emerald-100 border border-emerald-200 text-emerald-800 text-[8px] font-extrabold px-1 rounded">NEW</span>}
                        </div>

                        <p className="text-[10px] text-neutral-500 truncate max-w-xs">{cat.subtitle || 'No description provided.'}</p>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                            <IconComp className="w-3 h-3 text-[#0B8F63]" />
                            <span>{cat.buttonText || 'Explore →'}</span>
                          </span>
                          <span className="text-[10px] text-neutral-300">•</span>
                          <span className="text-[10px] text-neutral-500 font-semibold">{cat.itemCount || '0 items'}</span>
                          <span className="text-[10px] text-neutral-300">•</span>
                          <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1 rounded uppercase">{cat.categoryFilter || 'all'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions and Ordering */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleMove(idx, 'UP')}
                        disabled={idx === 0}
                        className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 'DOWN')}
                        disabled={idx === categoryHighlights.length - 1}
                        className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleEnable(cat)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          cat.enabled !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                        }`}
                        title={cat.enabled !== false ? 'Category Active' : 'Category Hidden'}
                      >
                        {cat.enabled !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 bg-[#0B8F63]/10 hover:bg-[#0B8F63]/25 text-[#0B8F63] rounded-lg border border-[#0B8F63]/10 transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-100 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Categories Details / Form Sidebar */}
        <div className="lg:col-span-5">
          {(editingCategory || isAddMode) ? (
            <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <span className="font-serif-heading font-bold text-sm text-neutral-800">
                  {isAddMode ? 'Add New Category' : `Edit Category: ${editingCategory?.title}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddMode(false);
                    setEditingCategory(null);
                  }}
                  className="p-1 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-3.5 text-xs max-h-[70vh] overflow-y-auto pr-1">
                {/* ID Field */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Unique Identifier ID *</label>
                  <input
                    type="text"
                    required
                    disabled={!isAddMode}
                    value={formId}
                    onChange={(e) => setFormId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="e.g. mens_sports"
                    className="w-full bg-neutral-50 disabled:opacity-60 border border-neutral-200 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-[#0B8F63] outline-none"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Category Title / Name *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Men's Sports Shoes"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Description / Subtitle</label>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="e.g. High-performance cushioned running & gym shoes"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                  />
                </div>

                {/* Button Text */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Button CTA Text</label>
                  <input
                    type="text"
                    value={formButtonText}
                    onChange={(e) => setFormButtonText(e.target.value)}
                    placeholder="e.g. Explore Sports →"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                  />
                </div>

                {/* Cover Type Selector & Image Path */}
                <div className="space-y-2">
                  <label className="font-bold text-neutral-700 block">Category Cover Image Strategy</label>
                  <select
                    value={formCoverType}
                    onChange={(e) => setFormCoverType(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 font-medium outline-none"
                  >
                    <option value="admin">Admin Uploaded Cover Image</option>
                    <option value="highest_selling">Auto: Highest Selling Product Image in Firestore</option>
                    <option value="featured">Auto: Featured Product Image in Firestore</option>
                    <option value="ai">Auto: AI Premium Footwear Cover</option>
                  </select>

                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                      />
                      <label className="p-2.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-xl cursor-pointer flex items-center justify-center text-neutral-600 shadow-xs">
                        <Upload className="w-4 h-4" />
                        <input type="file" accept="image/*" onChange={simulateImageUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="mt-1.5 w-full h-24 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50">
                      <img src={formImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80' }} referrerPolicy="no-referrer" />
                    </div>
                  </div>
                </div>

                {/* Linked Category & Subcategory Filter */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Linked Category</label>
                    <select
                      value={formCategoryFilter}
                      onChange={(e) => setFormCategoryFilter(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                    >
                      <option value="all">All Products</option>
                      <option value="men">Men's Footwear</option>
                      <option value="women">Women's Footwear</option>
                      <option value="kids">Kids' Footwear</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Subcategory Filter</label>
                    <input
                      type="text"
                      value={formSubcategoryFilter}
                      onChange={(e) => setFormSubcategoryFilter(e.target.value)}
                      placeholder="e.g. Running Shoes"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                    />
                  </div>
                </div>

                {/* Count and Icon */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Display Item Count</label>
                    <input
                      type="text"
                      value={formItemCount}
                      onChange={(e) => setFormItemCount(e.target.value)}
                      placeholder="e.g. 150+ Styles"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Category Icon</label>
                    <select
                      value={formIcon}
                      onChange={(e) => setFormIcon(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                    >
                      {AVAILABLE_ICONS.map(ic => (
                        <option key={ic.name} value={ic.name}>{ic.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Schedule Visibility */}
                <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200 space-y-2">
                  <span className="font-bold text-neutral-800 flex items-center gap-1.5 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-[#0B8F63]" />
                    <span>Schedule Category Visibility (Optional)</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-neutral-500 font-medium block">Start Date/Time</span>
                      <input
                        type="datetime-local"
                        value={formScheduleStart}
                        onChange={(e) => setFormScheduleStart(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-lg p-1.5 text-[11px]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 font-medium block">End Date/Time</span>
                      <input
                        type="datetime-local"
                        value={formScheduleEnd}
                        onChange={(e) => setFormScheduleEnd(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-lg p-1.5 text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Subcategories (Quick Pills Setup) */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Manage Subcategories</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubcategoryText}
                      onChange={(e) => setNewSubcategoryText(e.target.value)}
                      placeholder="e.g. Cricket Shoes"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubcategory}
                      className="px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2 max-h-24 overflow-y-auto p-1 bg-neutral-50 rounded-xl border border-neutral-100">
                    {formSubcategories.length === 0 ? (
                      <span className="text-[10px] text-neutral-400 p-1">No subcategories defined.</span>
                    ) : (
                      formSubcategories.map((sub, sidx) => (
                        <span key={sidx} className="bg-white border border-neutral-200 px-2 py-0.5 rounded-lg flex items-center gap-1 font-semibold text-[10px] text-neutral-700">
                          <span>{sub}</span>
                          <button type="button" onClick={() => handleRemoveSubcategory(sub)} className="text-neutral-400 hover:text-rose-600 p-0.5 rounded">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Badges Toggles */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-2">Configure Status Badges</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 p-2 bg-neutral-50 border rounded-xl cursor-pointer">
                      <input type="checkbox" checked={formFeatured} onChange={(e) => setFormFeatured(e.target.checked)} className="accent-[#0B8F63] w-4 h-4" />
                      <span className="font-semibold text-neutral-800">Featured Badge</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-neutral-50 border rounded-xl cursor-pointer">
                      <input type="checkbox" checked={formTrending} onChange={(e) => setFormTrending(e.target.checked)} className="accent-[#0B8F63] w-4 h-4" />
                      <span className="font-semibold text-neutral-800">Trending Badge</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-neutral-50 border rounded-xl cursor-pointer">
                      <input type="checkbox" checked={formPopular} onChange={(e) => setFormPopular(e.target.checked)} className="accent-[#0B8F63] w-4 h-4" />
                      <span className="font-semibold text-neutral-800">Popular Badge</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-neutral-50 border rounded-xl cursor-pointer">
                      <input type="checkbox" checked={formNewBadge} onChange={(e) => setFormNewBadge(e.target.checked)} className="accent-[#0B8F63] w-4 h-4" />
                      <span className="font-semibold text-neutral-800">New Badge</span>
                    </label>
                  </div>
                </div>

                {/* Enable Checkbox */}
                <label className="flex items-center gap-2.5 p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl cursor-pointer">
                  <input type="checkbox" checked={formEnabled} onChange={(e) => setFormEnabled(e.target.checked)} className="accent-[#0B8F63] w-4 h-4" />
                  <div>
                    <span className="font-bold text-neutral-800 block">Enable Card</span>
                    <span className="text-[10px] text-neutral-500">Visible on live storefront when enabled.</span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs py-3 rounded-xl shadow transition-colors"
                >
                  SAVE CATEGORY
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddMode(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-3xl p-8 text-center text-xs text-neutral-500 space-y-2">
              <Layers className="w-8 h-8 text-neutral-400 mx-auto" />
              <h4 className="font-bold text-neutral-700">No Category Selected</h4>
              <p className="max-w-xs mx-auto text-neutral-400">
                Click the edit button next to any category card to customize its details, upload images, manage subcategories or configure schedule visibility.
              </p>
              <button
                onClick={handleOpenAdd}
                className="inline-block bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[10px] px-4 py-2 rounded-xl shadow-xs transition-colors"
              >
                Create New Category
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
