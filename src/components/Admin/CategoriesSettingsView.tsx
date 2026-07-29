import React, { useState } from 'react';
import { 
  Layers, Plus, Trash2, Edit2, ArrowUp, ArrowDown, Upload, Check, X, 
  AlertTriangle, Sparkles, Smile, Footprints, Flame, Tag, ShoppingBag, Eye, EyeOff
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CategoryHighlight } from '../../types';

export const CategoriesSettingsView: React.FC = () => {
  const { categoryHighlights, saveCategoryHighlights } = useStore();
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryHighlight | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  
  // Local state for form
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formItemCount, setFormItemCount] = useState('0 Products');
  const [formIcon, setFormIcon] = useState('Layers');
  const [formSubcategories, setFormSubcategories] = useState<string[]>([]);
  const [newSubcategoryText, setNewSubcategoryText] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formTrending, setFormTrending] = useState(false);
  const [formPopular, setFormPopular] = useState(false);
  const [formNewBadge, setFormNewBadge] = useState(false);
  const [formEnabled, setFormEnabled] = useState(true);

  // Available Icons for category highlights
  const AVAILABLE_ICONS = [
    { name: 'Layers', component: Layers },
    { name: 'Sparkles', component: Sparkles },
    { name: 'Smile', component: Smile },
    { name: 'Footprints', component: Footprints },
    { name: 'Flame', component: Flame },
    { name: 'Tag', component: Tag },
    { name: 'ShoppingBag', component: ShoppingBag }
  ];

  const handleOpenEdit = (cat: CategoryHighlight) => {
    setError(null);
    setEditingCategory(cat);
    setIsAddMode(false);
    setFormId(cat.id);
    setFormTitle(cat.title);
    setFormSubtitle(cat.subtitle);
    setFormImage(cat.image);
    setFormItemCount(cat.itemCount || '0 Products');
    setFormIcon(cat.icon || 'Layers');
    setFormSubcategories(cat.subcategories || []);
    setFormFeatured(!!cat.featured);
    setFormTrending(!!cat.trending);
    setFormPopular(!!cat.popular);
    setFormNewBadge(!!cat.newBadge);
    setFormEnabled(cat.enabled !== false);
  };

  const handleOpenAdd = () => {
    setError(null);
    setEditingCategory(null);
    setIsAddMode(true);
    setFormId(`cat_${Date.now()}`);
    setFormTitle('');
    setFormSubtitle('');
    setFormImage('https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80');
    setFormItemCount('0 Products');
    setFormIcon('Layers');
    setFormSubcategories([]);
    setFormFeatured(false);
    setFormTrending(false);
    setFormPopular(false);
    setFormNewBadge(false);
    setFormEnabled(true);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (!formTitle.trim()) {
        throw new Error('Category Title is required.');
      }
      if (!formImage.trim()) {
        throw new Error('Category Image URL is required.');
      }

      const updatedItem: CategoryHighlight = {
        id: formId,
        title: formTitle,
        subtitle: formSubtitle,
        image: formImage,
        itemCount: formItemCount,
        icon: formIcon,
        subcategories: formSubcategories,
        featured: formFeatured,
        trending: formTrending,
        popular: formPopular,
        newBadge: formNewBadge,
        enabled: formEnabled,
      };

      let newHighlightsList = [...categoryHighlights];
      if (isAddMode) {
        // Prevent duplicate IDs
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
    if (!window.confirm('Are you absolutely sure you want to delete this category? All customer references might be disabled.')) return;
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
      // Create local object URL to simulate immediate change or mock upload
      const localUrl = URL.createObjectURL(file);
      setFormImage(localUrl);
      // Give feedback
      alert('Selected file locally. For true storage persistence, direct web image paths from Unsplash/CDN are fully supported.');
    }
  };

  return (
    <div id="admin_categories_highlights_page" className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm">
        <div>
          <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#0B8F63]" />
            <span>Categories & Highlights Manager</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Create, edit, and reorder home-page category cards. These sync instantly to customer viewports with zero reload required.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW CATEGORY</span>
        </button>
      </div>

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
            <span className="text-[10px] text-neutral-400 font-medium">Drag-ordered by table position</span>
          </div>

          <div className="divide-y divide-neutral-100 overflow-x-auto">
            {categoryHighlights.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 text-xs">
                No categories defined. Click "Add New Category" above to build your first collections deck!
              </div>
            ) : (
              categoryHighlights.map((cat, idx) => {
                const IconComp = AVAILABLE_ICONS.find(i => i.name === cat.icon)?.component || Layers;

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
                            <span>Icon: {cat.icon || 'Layers'}</span>
                          </span>
                          <span className="text-[10px] text-neutral-300">•</span>
                          <span className="text-[10px] text-neutral-500 font-semibold">{cat.itemCount || '0 items'}</span>
                          <span className="text-[10px] text-neutral-300">•</span>
                          <span className="text-[10px] text-neutral-400">{cat.subcategories?.length || 0} Subcategories</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions and Ordering */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Reordering */}
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

                      {/* Enable/Disable Toggle */}
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

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 bg-[#0B8F63]/10 hover:bg-[#0B8F63]/25 text-[#0B8F63] rounded-lg border border-[#0B8F63]/10 transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
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
              <div className="space-y-3.5 text-xs">
                {/* ID Field (ReadOnly on edit) */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Unique Identifier ID *</label>
                  <input
                    type="text"
                    required
                    disabled={!isAddMode}
                    value={formId}
                    onChange={(e) => setFormId((e.target.value || '').toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="e.g. wedding_shoes"
                    className="w-full bg-neutral-50 disabled:opacity-60 border border-neutral-200 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-[#0B8F63] outline-none"
                  />
                  {isAddMode && <p className="text-[10px] text-neutral-400 mt-0.5">Use lowercase letters, numbers and underscores only.</p>}
                </div>

                {/* Name */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Category Title / Name *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Party Wear Heels"
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
                    placeholder="e.g. Exquisite handcrafted premium designs for special occasions"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                  />
                </div>

                {/* Image Path */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Category Image Path / URL *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
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
                    <img src={formImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=150&q=80' }} referrerPolicy="no-referrer" />
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
                      placeholder="e.g. 120+ Products"
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

                {/* Subcategories (Quick Pills Setup) */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Manage Subcategories</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubcategoryText}
                      onChange={(e) => setNewSubcategoryText(e.target.value)}
                      placeholder="e.g. Heeled Sandals"
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
                      <span className="text-[10px] text-neutral-400 p-1">No subcategories. Add some above.</span>
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
                    <span className="text-[10px] text-neutral-500">If unchecked, this card will be hidden from the customer website immediately.</span>
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
                Click the edit button next to any category card to customize its details, upload images, manage subcategories or configure badge features.
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
