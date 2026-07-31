import React, { useState } from 'react';
import { X, Save, Sparkles, FolderPlus } from 'lucide-react';
import { HomepageConfig, HomepagePreset } from '../../../types';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: HomepageConfig;
  onSaveTemplate: (newPreset: HomepagePreset) => void;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSaveTemplate,
}) => {
  const [name, setName] = useState(currentConfig.name ? `${currentConfig.name} Custom Template` : 'My Custom Storefront Template');
  const [description, setDescription] = useState('Custom homepage design saved from live draft with tailored sections and styling.');
  const [category, setCategory] = useState('Saved / Custom');
  const [badge, setBadge] = useState('CUSTOM');
  const [previewColor, setPreviewColor] = useState('#0B8F63');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const customPreset: HomepagePreset = {
      id: `custom_preset_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      previewColor: previewColor,
      badge: badge.trim().toUpperCase() || 'CUSTOM',
      category: category,
      tags: ['Saved / Custom', 'Custom Template', category],
      isCustom: true,
      createdAt: new Date().toISOString(),
      config: JSON.parse(JSON.stringify(currentConfig)),
    };

    onSaveTemplate(customPreset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-extrabold">Save Current Draft as Template</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Template Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Festive Summer Flash Sale Layout"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-semibold bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of this template layout..."
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-bold bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              >
                <option value="Saved / Custom">Saved / Custom</option>
                <option value="Luxury">Luxury</option>
                <option value="Sneakers">Sneakers</option>
                <option value="Fashion">Fashion</option>
                <option value="Festival">Festival</option>
                <option value="Modern">Modern</option>
                <option value="Minimal White">Minimal White</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Badge Label
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="MY TEMPLATE"
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-bold bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Card Preview Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={previewColor}
                onChange={(e) => setPreviewColor(e.target.value)}
                className="w-10 h-10 rounded-xl border-0 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-neutral-600 dark:text-neutral-400">
                {previewColor}
              </span>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-neutral-950 text-xs font-black rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" /> Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
