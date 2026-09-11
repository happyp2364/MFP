import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  Edit2,
  Copy,
  Trash2,
  Tag,
  Check,
  Layers,
  ArrowRight,
  FileText,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { ProductTemplate } from '../../types';
import {
  listenToProductTemplates,
  saveProductTemplate,
  deleteProductTemplate,
  duplicateProductTemplate,
} from '../../services/productTemplateService';
import { ProductTemplateEditorModal } from './ProductTemplateEditorModal';
import { getProductTypes } from '../../utils/productTypeUtils';

interface ProductTemplatesViewProps {
  onApplyTemplateToNewProduct?: (template: ProductTemplate) => void;
}

export const ProductTemplatesView: React.FC<ProductTemplatesViewProps> = ({
  onApplyTemplateToNewProduct,
}) => {
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'men' | 'women' | 'kids'>('all');
  const [editingTemplate, setEditingTemplate] = useState<ProductTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    const unsub = listenToProductTemplates((loaded) => {
      setTemplates(loaded);
    });
    return () => unsub();
  }, []);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const types = getProductTypes(t);
        const match =
          t.name.toLowerCase().includes(q) ||
          t.brand.toLowerCase().includes(q) ||
          types.some((typ) => typ.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.material && t.material.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [templates, categoryFilter, searchQuery]);

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (template: ProductTemplate) => {
    setEditingTemplate(template);
    setIsEditorOpen(true);
  };

  const handleDuplicate = async (template: ProductTemplate) => {
    try {
      const copy = await duplicateProductTemplate(template);
      showNotice(`Template duplicated as "${copy.name}".`);
    } catch (err) {
      console.error('Duplicate error:', err);
      showNotice('Failed to duplicate template.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete template "${name}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteProductTemplate(id);
      showNotice(`Deleted template "${name}".`);
    } catch (err) {
      console.error('Delete template error:', err);
      showNotice('Failed to delete template from Firestore.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveTemplate = async (templateData: Omit<ProductTemplate, 'id'> & { id?: string }) => {
    await saveProductTemplate(templateData);
    showNotice(templateData.id ? 'Template updated successfully.' : 'New template created successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#0B8F63] stroke-[3]" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-extrabold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-neutral-900 text-white rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-white/10 backdrop-blur-sm text-emerald-300">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">Product Templates Engine</h2>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl font-medium">
            Standardize and fast-track product creation. Pre-define multiple product types, brand specifications, technical materials, and fit guides once, then apply them in a single click.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateNew}
          className="px-5 py-2.5 bg-[#0B8F63] hover:bg-emerald-500 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-md flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create New Template</span>
        </button>
      </div>

      {/* Controls Bar: Search & Category Filter */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by title, brand, or product types..."
            className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-neutral-900 outline-none focus:ring-2 focus:ring-[#0B8F63]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-neutral-400 mr-1 hidden sm:inline">Category:</span>
          {(['all', 'men', 'women', 'kids'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === cat
                  ? 'bg-[#0B8F63] text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat === 'all' ? 'All' : cat === 'men' ? "Men's" : cat === 'women' ? "Women's" : "Kids'"}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-neutral-900">No Product Templates Found</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            {searchQuery
              ? 'No templates matched your search keywords. Try clearing the filter or search query.'
              : 'Create your first reusable product template to accelerate listing additions for your inventory.'}
          </p>
          <button
            onClick={handleCreateNew}
            className="mt-2 px-5 py-2 bg-[#0B8F63] hover:bg-[#086F4C] text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Template Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const types = getProductTypes(template);
            return (
              <div
                key={template.id}
                className="bg-white rounded-3xl border border-neutral-200 p-5 shadow-2xs hover:shadow-md hover:border-neutral-300 transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Card Top */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-black tracking-widest text-[#0B8F63] bg-[#0B8F63]/10 px-2.5 py-0.5 rounded-md">
                        {template.category.toUpperCase()}
                      </span>
                      <h3 className="font-extrabold text-neutral-900 text-base leading-snug pt-1 group-hover:text-[#0B8F63] transition-colors">
                        {template.name}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-lg shrink-0">
                      {template.brand}
                    </span>
                  </div>

                  {/* Multiple Product Types Badges */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Product Types ({types.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {types.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Description Preview */}
                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {template.descriptionPreview || template.description || 'No description preview.'}
                  </p>

                  {/* Material & Fit preview */}
                  <div className="space-y-1 text-[11px] text-neutral-500 border-t border-neutral-100 pt-2.5">
                    {template.material && (
                      <p className="line-clamp-1">
                        <strong className="text-neutral-700">Material:</strong> {template.material}
                      </p>
                    )}
                    {template.features && template.features.length > 0 && (
                      <p className="line-clamp-1">
                        <strong className="text-neutral-700">Highlights:</strong> {template.features.length} standard feature bullets
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-3 border-t border-neutral-100 space-y-2">
                  {onApplyTemplateToNewProduct && (
                    <button
                      type="button"
                      onClick={() => onApplyTemplateToNewProduct(template)}
                      className="w-full py-2 bg-[#0B8F63] hover:bg-[#086F4C] text-white rounded-xl text-xs font-extrabold shadow-2xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Apply to New Product</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEdit(template)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      title="Edit template fields"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(template)}
                      className="py-1.5 px-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      title="Clone this template"
                    >
                      <Copy className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Clone</span>
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === template.id}
                      onClick={() => handleDelete(template.id, template.name)}
                      className="py-1.5 px-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Template Editor Modal */}
      {isEditorOpen && (
        <ProductTemplateEditorModal
          template={editingTemplate}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveTemplate}
        />
      )}
    </div>
  );
};
