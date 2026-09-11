import React, { useState } from 'react';
import { X, BookmarkPlus, Sparkles, Check, Info } from 'lucide-react';
import { ProductTemplate } from '../../types';
import { saveProductTemplate } from '../../services/productTemplateService';

interface SaveAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplateData: {
    category: 'men' | 'women' | 'kids';
    productTypes: string[];
    brand: string;
    description?: string;
    shortDescription?: string;
    material?: string;
    fitGuide?: string;
    careInstructions?: string;
    features?: string[];
    collectionTags?: string[];
    metaTitle?: string;
    metaDescription?: string;
  };
  onSuccess?: (newTemplate: ProductTemplate) => void;
}

export const SaveAsTemplateModal: React.FC<SaveAsTemplateModalProps> = ({
  isOpen,
  onClose,
  initialTemplateData,
  onSuccess,
}) => {
  const defaultName = `${initialTemplateData.brand || 'Marudhar'} ${
    initialTemplateData.productTypes[0] || 'Footwear'
  } Template`;

  const [templateName, setTemplateName] = useState(defaultName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) {
      setError('Template name is required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const saved = await saveProductTemplate({
        name: templateName.trim(),
        descriptionPreview: (
          initialTemplateData.shortDescription ||
          initialTemplateData.description ||
          ''
        ).substring(0, 160),
        category: initialTemplateData.category,
        productTypes: initialTemplateData.productTypes,
        subcategory: initialTemplateData.productTypes[0] || 'Sports Shoes',
        brand: initialTemplateData.brand || 'Marudhar Fashion',
        description: initialTemplateData.description || '',
        shortDescription: initialTemplateData.shortDescription || '',
        material: initialTemplateData.material || '',
        fitGuide: initialTemplateData.fitGuide || '',
        careInstructions: initialTemplateData.careInstructions || '',
        features: initialTemplateData.features || [],
        collectionTags: initialTemplateData.collectionTags || [],
        metaTitle: initialTemplateData.metaTitle || '',
        metaDescription: initialTemplateData.metaDescription || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (onSuccess) {
        onSuccess(saved);
      }
      onClose();
    } catch (err: any) {
      console.error('Save template error:', err);
      setError(err?.message || 'Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-neutral-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#0B8F63] text-white flex items-center justify-center shadow-xs">
              <BookmarkPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-900">Save Form As Template</h2>
              <p className="text-xs text-neutral-500 font-medium">
                Create a reusable preset for fast future product listings.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-extrabold text-neutral-900 text-xs flex items-center gap-1.5">
              <span>Template Name</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Marudhar Sports Shoes Standard"
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-900 outline-none focus:ring-2 focus:ring-[#0B8F63]"
            />
          </div>

          {/* Included Specs Summary */}
          <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2 text-xs">
            <span className="font-extrabold text-neutral-700 text-[11px] uppercase tracking-wider block">
              Specifications Saved in This Template:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-neutral-400">Category:</span>
                <p className="font-bold text-neutral-800 capitalize">{initialTemplateData.category}</p>
              </div>
              <div>
                <span className="text-neutral-400">Brand:</span>
                <p className="font-bold text-neutral-800">{initialTemplateData.brand || 'Marudhar Fashion'}</p>
              </div>
            </div>
            <div>
              <span className="text-neutral-400 text-[11px]">Product Types:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {initialTemplateData.productTypes.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-1.5 text-[10px] text-amber-800">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Unique product details (Title, Price, SKU, Images, Size Stock) will not be saved in this template.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-neutral-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#0B8F63] hover:bg-[#086F4C] text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSaving ? 'Saving Template...' : 'Save Template'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
