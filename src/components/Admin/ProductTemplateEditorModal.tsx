import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Save,
  Tag,
  FileText,
  Plus,
  Trash2,
  Check,
  Info,
} from 'lucide-react';
import { ProductTemplate } from '../../types';
import { getSubcategoriesForProductFor } from '../../utils/productCategoryDefaults';
import { getProductTypes } from '../../utils/productTypeUtils';

interface ProductTemplateEditorModalProps {
  template?: ProductTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<ProductTemplate, 'id'> & { id?: string }) => Promise<void>;
}

const POPULAR_BRANDS = [
  'Marudhar Fashion',
  'Puma',
  'Nike',
  'Sparx',
  'Campus',
  'ONE 8',
  'AirGlide',
  'Bata',
];

const SUGGESTED_TAGS = [
  'Sports Collection',
  'New Arrival',
  'Bestseller',
  'Trending Now',
  'Premium Collection',
  'Casual Shoes',
  'Formal Shoes',
  'Daily Wear',
];

export const ProductTemplateEditorModal: React.FC<ProductTemplateEditorModalProps> = ({
  template,
  isOpen,
  onClose,
  onSave,
}) => {
  const isEditing = !!template?.id;

  const [name, setName] = useState(template?.name || '');
  const [category, setCategory] = useState<'men' | 'women' | 'kids'>(template?.category || 'men');
  const [productTypes, setProductTypes] = useState<string[]>(() => {
    return template ? getProductTypes(template) : [];
  });
  const [brand, setBrand] = useState(template?.brand || 'Marudhar Fashion');
  const [shortDescription, setShortDescription] = useState(template?.shortDescription || '');
  const [description, setDescription] = useState(template?.description || '');
  const [material, setMaterial] = useState(template?.material || '');
  const [fitGuide, setFitGuide] = useState(template?.fitGuide || '');
  const [careInstructions, setCareInstructions] = useState(template?.careInstructions || '');
  const [features, setFeatures] = useState<string[]>(template?.features || []);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [collectionTags, setCollectionTags] = useState<string[]>(template?.collectionTags || []);
  const [metaTitle, setMetaTitle] = useState(template?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(template?.metaDescription || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const availableSubs = getSubcategoriesForProductFor(category);

  const handleToggleProductType = (type: string) => {
    setProductTypes((prev) => {
      const exists = prev.includes(type);
      if (exists) {
        if (prev.length <= 1) {
          return prev; // Keep at least one
        }
        return prev.filter((t) => t !== type);
      }
      return [...prev, type];
    });
  };

  const handleRemoveProductType = (type: string) => {
    setProductTypes((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((t) => t !== type);
    });
  };

  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    setFeatures((prev) => [...prev, newFeatureInput.trim()]);
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleToggleTag = (tag: string) => {
    setCollectionTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Template name is required.');
      return;
    }
    if (productTypes.length === 0) {
      setErrorMessage('At least one product type is required.');
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);
    try {
      await onSave({
        id: template?.id,
        name: name.trim(),
        descriptionPreview: (shortDescription || description || '').substring(0, 160).trim(),
        category,
        productTypes,
        subcategory: productTypes[0] || '',
        brand: brand.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        material: material.trim(),
        fitGuide: fitGuide.trim(),
        careInstructions: careInstructions.trim(),
        features,
        collectionTags,
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        createdAt: template?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      console.error('Error saving template:', err);
      setErrorMessage(err?.message || 'Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-neutral-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B8F63] text-white flex items-center justify-center shadow-md shadow-[#0B8F63]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-neutral-900">
                {isEditing ? 'Edit Product Template' : 'Create Reusable Product Template'}
              </h2>
              <p className="text-xs text-neutral-500 font-medium">
                Save time by predefining reusable styles, types, descriptions, fit & care info.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
              {errorMessage}
            </div>
          )}

          {/* Template Title */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-neutral-900 text-xs flex items-center gap-1.5">
              <span>Template Name</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Marudhar Sports Running Shoes Standard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-900 outline-none focus:ring-2 focus:ring-[#0B8F63]"
            />
            <p className="text-[10px] text-neutral-400">
              A recognizable title for your team (e.g. "Formal Dress Shoe Template", "Daily Casual Sneakers").
            </p>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-neutral-900 text-xs">Product Category</label>
            <div className="grid grid-cols-3 gap-2">
              {(['men', 'women', 'kids'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                    category === cat
                      ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {cat === 'men' ? "Men's Footwear" : cat === 'women' ? "Women's Footwear" : "Kids' Collection"}
                </button>
              ))}
            </div>
          </div>

          {/* Product Types (Multi-select) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-neutral-900 text-xs flex items-center gap-1.5">
                <span>Product Types ({category.toUpperCase()})</span>
                <span className="text-rose-500">*</span>
                <span className="text-[10px] font-bold text-neutral-400">
                  ({productTypes.length} selected)
                </span>
              </label>
              {productTypes.length > 1 && (
                <button
                  type="button"
                  onClick={() => setProductTypes([availableSubs.all[0] || 'Sports Shoes'])}
                  className="text-[11px] font-bold text-neutral-500 hover:text-rose-600 transition-colors underline"
                >
                  Reset to 1
                </button>
              )}
            </div>

            {/* Selected Chips */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#0B8F63]/5 rounded-xl border border-[#0B8F63]/20">
              <span className="text-[10px] font-extrabold uppercase text-[#0B8F63] tracking-wider mr-1">
                Selected:
              </span>
              {productTypes.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0B8F63] text-white shadow-xs"
                >
                  <span>{type}</span>
                  {productTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProductType(type)}
                      className="w-3.5 h-3.5 rounded-full hover:bg-black/20 flex items-center justify-center transition-colors ml-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            {/* Available Type Buttons */}
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-neutral-50 rounded-xl border border-neutral-200">
              {availableSubs.all.map((sub) => {
                const isSel = productTypes.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleToggleProductType(sub)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      isSel
                        ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {isSel && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brand */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-neutral-900 text-xs">Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Marudhar Fashion"
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-neutral-900 outline-none focus:ring-2 focus:ring-[#0B8F63]"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {POPULAR_BRANDS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(b)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                    brand === b
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Full Description */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-neutral-900 text-xs">Standard Product Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of craftsmanship, sole architecture, design language..."
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl p-3 text-xs sm:text-sm font-medium text-neutral-900 outline-none focus:ring-2 focus:ring-[#0B8F63]"
            />
          </div>

          {/* Material & Construction */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-neutral-900 text-xs">Materials & Construction</label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="e.g. Breathable Flyknit Mesh, EVA Cushioned Midsole, Anti-Skid Rubber Outsole"
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-neutral-900 outline-none focus:ring-2 focus:ring-[#0B8F63]"
            />
          </div>

          {/* Fit Guide & Care Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-extrabold text-neutral-900 text-xs">Fit Guide</label>
              <input
                type="text"
                value={fitGuide}
                onChange={(e) => setFitGuide(e.target.value)}
                placeholder="e.g. True to UK sizing. For broad feet choose +0.5 size."
                className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 outline-none focus:ring-2 focus:ring-[#0B8F63]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-extrabold text-neutral-900 text-xs">Care Instructions</label>
              <input
                type="text"
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                placeholder="e.g. Wipe with damp cloth. Air dry away from direct sunlight."
                className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 outline-none focus:ring-2 focus:ring-[#0B8F63]"
              />
            </div>
          </div>

          {/* Key Product Features (Bullet points) */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-neutral-900 text-xs flex items-center justify-between">
              <span>Key Features / Highlights ({features.length})</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFeatureInput}
                onChange={(e) => setNewFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="e.g. Memory foam orthotic insole"
                className="flex-1 bg-[#F7F7F7] border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0B8F63]"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            {features.length > 0 && (
              <div className="space-y-1 pt-1">
                {features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs"
                  >
                    <span className="text-neutral-800 font-medium">• {feat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-neutral-400 hover:text-rose-600 transition-colors ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Collection Tags */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-neutral-900 text-xs">Collection Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.map((tag) => {
                const isSel = collectionTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                      isSel
                        ? 'bg-[#0B8F63] text-white border-[#0B8F63]'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2">
            <span className="text-xs font-extrabold text-neutral-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#0B8F63]" />
              <span>Standard SEO / Social Preview</span>
            </span>
            <div className="space-y-1.5">
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Meta Title (e.g. Marudhar Sports Shoes | Best Price)"
                className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#0B8F63]"
              />
              <input
                type="text"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Meta Description (brief WhatsApp/Google summary)"
                className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#0B8F63]"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-2 text-[11px] text-amber-800">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Templates never store unique product names, prices, SKUs, inventory, or product images. Those remain distinct for every individual product you add.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#0B8F63] hover:bg-[#086F4C] text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Template...' : isEditing ? 'Update Template' : 'Save Template'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
