import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Sparkles,
  Check,
  Tag,
  Layers,
  ArrowRight,
  Info,
  Sliders,
  FileText,
} from 'lucide-react';
import { ProductTemplate } from '../../types';
import { getProductTypes } from '../../utils/productTypeUtils';

interface ApplyTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ProductTemplate[];
  onApply: (template: ProductTemplate, overwriteMode: 'fillEmpty' | 'overwriteAll') => void;
  onOpenTemplateManager?: () => void;
  currentCategory?: 'men' | 'women' | 'kids';
}

export const ApplyTemplateModal: React.FC<ApplyTemplateModalProps> = ({
  isOpen,
  onClose,
  templates,
  onApply,
  onOpenTemplateManager,
  currentCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'men' | 'women' | 'kids'>(
    currentCategory || 'all'
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    templates[0]?.id || null
  );
  const [overwriteMode, setOverwriteMode] = useState<'fillEmpty' | 'overwriteAll'>('fillEmpty');

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

  const activeTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || filteredTemplates[0] || null;
  }, [templates, selectedTemplateId, filteredTemplates]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (!activeTemplate) return;
    onApply(activeTemplate, overwriteMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-neutral-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B8F63] text-white flex items-center justify-center shadow-md shadow-[#0B8F63]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-neutral-900">
                Apply Product Template
              </h2>
              <p className="text-xs text-neutral-500 font-medium">
                Choose a pre-configured template to auto-populate reusable specs, product types & description.
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

        {/* Filter and Search Bar */}
        <div className="p-3 sm:p-4 border-b border-neutral-200/80 bg-neutral-50 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by name, brand, or product types..."
              className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-neutral-900 outline-none focus:ring-2 focus:ring-[#0B8F63]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['all', 'men', 'women', 'kids'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  categoryFilter === cat
                    ? 'bg-[#0B8F63] text-white shadow-xs'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {cat === 'all' ? 'All' : cat === 'men' ? 'Men' : cat === 'women' ? 'Women' : 'Kids'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area (Two-column: Template List + Template Live Preview) */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-neutral-200">
          {/* Left Column: Template Selector Cards */}
          <div className="md:w-1/2 overflow-y-auto p-3 sm:p-4 space-y-2.5 max-h-[45vh] md:max-h-full">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-10 px-4">
                <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-neutral-600">No templates found matching your query.</p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Try clearing the search or category filter.
                </p>
              </div>
            ) : (
              filteredTemplates.map((t) => {
                const isSelected = activeTemplate?.id === t.id;
                const types = getProductTypes(t);
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50/60 border-[#0B8F63] ring-2 ring-[#0B8F63]/20 shadow-xs'
                        : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-neutral-900 text-xs sm:text-sm">
                            {t.name}
                          </span>
                          <span className="text-[10px] uppercase font-extrabold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                            {t.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-medium line-clamp-1">
                          {t.brand} • {t.descriptionPreview || t.description || 'Standard specs'}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-[#0B8F63] border-[#0B8F63] text-white'
                            : 'border-neutral-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Product Types Chips Preview */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {types.map((type, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md"
                        >
                          {type}
                        </span>
                      ))}
                      {t.material && (
                        <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-md line-clamp-1">
                          {t.material.split(',')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Template Detailed Preview & Application Settings */}
          <div className="md:w-1/2 overflow-y-auto p-4 sm:p-5 bg-neutral-50/50 flex flex-col justify-between max-h-[45vh] md:max-h-full">
            {activeTemplate ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#0B8F63]">
                      Template Preview
                    </span>
                    <span className="text-[11px] font-bold text-neutral-400">
                      Brand: <span className="text-neutral-800">{activeTemplate.brand}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-neutral-900 mt-0.5">
                    {activeTemplate.name}
                  </h3>
                </div>

                {/* Multiple Product Types */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-neutral-500">Product Types:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {getProductTypes(activeTemplate).map((pt, i) => (
                      <span
                        key={i}
                        className="text-xs font-bold text-white bg-[#0B8F63] px-2.5 py-1 rounded-lg shadow-2xs"
                      >
                        {pt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description Preview */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-neutral-500">Description:</span>
                  <p className="text-xs text-neutral-700 bg-white p-2.5 rounded-xl border border-neutral-200/80 leading-relaxed max-h-24 overflow-y-auto">
                    {activeTemplate.description || 'No description provided.'}
                  </p>
                </div>

                {/* Materials, Fit, Care */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeTemplate.material && (
                    <div className="p-2 bg-white rounded-xl border border-neutral-200/80 space-y-0.5">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Material</span>
                      <p className="font-semibold text-neutral-800 line-clamp-2">{activeTemplate.material}</p>
                    </div>
                  )}
                  {activeTemplate.fitGuide && (
                    <div className="p-2 bg-white rounded-xl border border-neutral-200/80 space-y-0.5">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Fit Guide</span>
                      <p className="font-semibold text-neutral-800 line-clamp-2">{activeTemplate.fitGuide}</p>
                    </div>
                  )}
                </div>

                {/* Features Highlights */}
                {activeTemplate.features && activeTemplate.features.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-neutral-500">
                      Features ({activeTemplate.features.length}):
                    </span>
                    <ul className="text-xs text-neutral-700 space-y-0.5 bg-white p-2.5 rounded-xl border border-neutral-200/80 max-h-20 overflow-y-auto">
                      {activeTemplate.features.map((f, idx) => (
                        <li key={idx} className="line-clamp-1">
                          • {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Application Overwrite Mode Selector */}
                <div className="p-3 bg-white rounded-2xl border border-neutral-200 space-y-2">
                  <span className="text-xs font-extrabold text-neutral-900 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#0B8F63]" />
                    <span>Apply Behavior</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOverwriteMode('fillEmpty')}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        overwriteMode === 'fillEmpty'
                          ? 'bg-emerald-50/70 border-[#0B8F63] text-neutral-900'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            overwriteMode === 'fillEmpty'
                              ? 'bg-[#0B8F63] border-[#0B8F63] text-white'
                              : 'border-neutral-300'
                          }`}
                        >
                          {overwriteMode === 'fillEmpty' && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span className="text-xs font-bold">Fill Empty Only</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1 pl-5">
                        Preserves any values you have already entered in the form.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOverwriteMode('overwriteAll')}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        overwriteMode === 'overwriteAll'
                          ? 'bg-emerald-50/70 border-[#0B8F63] text-neutral-900'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            overwriteMode === 'overwriteAll'
                              ? 'bg-[#0B8F63] border-[#0B8F63] text-white'
                              : 'border-neutral-300'
                          }`}
                        >
                          {overwriteMode === 'overwriteAll' && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span className="text-xs font-bold">Replace Reusable</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1 pl-5">
                        Replaces product types, brand, and description with template specs.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-neutral-100 rounded-xl flex items-start gap-1.5 text-[10px] text-neutral-600">
                  <Info className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Safety guarantee:</strong> Product Name (if typed), SKU, Price, Images, and Size Stock are NEVER modified or erased.
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-neutral-400">
                Select a template on the left to preview.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-neutral-200 flex items-center justify-between gap-3 shrink-0">
          <div>
            {onOpenTemplateManager && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTemplateManager();
                }}
                className="text-xs font-bold text-[#0B8F63] hover:underline flex items-center gap-1"
              >
                <span>Manage Templates</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!activeTemplate}
              className="px-5 py-2 bg-[#0B8F63] hover:bg-[#086F4C] text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Apply Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
