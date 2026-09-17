import React, { useState } from 'react';
import { X, Sparkles, Plus, Trash2, Check } from 'lucide-react';
import { PRESET_COLOR_PALETTE } from '../../utils/productCategoryDefaults';
import { MultiColorSwatch } from '../Common/MultiColorSwatch';

interface MixedColorCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMixedColor: (colorObj: { name: string; hex: string; isMultiColor: boolean; colorComponents: string[]; colorComponentHexes: string[]; images: string[] }) => void;
  existingColors: Array<{ name: string; hex: string }>;
}

export const MixedColorCreatorModal: React.FC<MixedColorCreatorModalProps> = ({
  isOpen,
  onClose,
  onAddMixedColor,
  existingColors,
}) => {
  const [selectedComponents, setSelectedComponents] = useState<Array<{ name: string; hex: string }>>([]);
  const [customCompName, setCustomCompName] = useState('');
  const [customCompHex, setCustomCompHex] = useState('#0B8F63');
  const [customComboName, setCustomComboName] = useState('');
  const [useCustomName, setUseCustomName] = useState(false);

  if (!isOpen) return null;

  const handleToggleColor = (name: string, hex: string) => {
    const exists = selectedComponents.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      if (selectedComponents.length <= 2) {
        alert('A mixed colour combination requires at least 2 colours.');
        return;
      }
      setSelectedComponents(selectedComponents.filter((c) => c.name.toLowerCase() !== name.toLowerCase()));
    } else {
      if (selectedComponents.length >= 6) {
        alert('Maximum 6 colours allowed in a single combination.');
        return;
      }
      setSelectedComponents([...selectedComponents, { name, hex }]);
    }
  };

  const handleAddCustomComponent = () => {
    if (!customCompName.trim()) return;
    if (selectedComponents.some(c => c.name.toLowerCase() === customCompName.trim().toLowerCase())) return;
    if (selectedComponents.length >= 6) {
      alert('Maximum 6 colours allowed.');
      return;
    }
    setSelectedComponents([...selectedComponents, { name: customCompName.trim(), hex: customCompHex }]);
    setCustomCompName('');
  };

  const handleRemoveComponent = (name: string) => {
    if (selectedComponents.length <= 2) {
      alert('A mixed colour combination requires at least 2 colours.');
      return;
    }
    setSelectedComponents(selectedComponents.filter((c) => c.name !== name));
  };

  const generatedName = selectedComponents.map((c) => c.name).join(' + ');
  const finalName = useCustomName && customComboName.trim() ? customComboName.trim() : generatedName;
  const primaryHex = selectedComponents[0]?.hex || '#000000';

  const handleCreate = () => {
    if (selectedComponents.length < 2) {
      alert('Please select at least 2 colours for a mixed colour combination.');
      return;
    }

    const newColorObj = {
      name: finalName,
      hex: primaryHex,
      isMultiColor: true,
      colorComponents: selectedComponents.map((c) => c.name),
      colorComponentHexes: selectedComponents.map((c) => c.hex),
      images: [],
    };

    onAddMixedColor(newColorObj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200/90 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-neutral-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Create Mixed / Multi-Colour</span>
            </h3>
            <p className="text-xs text-neutral-300 font-medium">Combine 2 to 6 colours into ONE unified multi-segment swatch.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Live Preview Card */}
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Live Swatch & Combination Preview</span>
            
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-neutral-200 flex items-center gap-4 px-6">
              <MultiColorSwatch
                colorObj={{
                  name: finalName || 'Select Colors',
                  hex: primaryHex,
                  isMultiColor: selectedComponents.length > 1,
                  colorComponents: selectedComponents,
                }}
                size="lg"
              />
              <div className="text-left">
                <span className="font-extrabold text-sm text-neutral-900 block font-mono">
                  {finalName || 'Select at least 2 colours'}
                </span>
                <span className="text-[11px] text-neutral-500 font-medium">
                  {selectedComponents.length} component colours ({selectedComponents.length === 2 ? '50/50 Split' : `${(100 / selectedComponents.length).toFixed(1)}% Segments`})
                </span>
              </div>
            </div>
          </div>

          {/* Palette Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-700">
                Select Component Colours (Min 2, Max 6):
              </label>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {selectedComponents.length} selected
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {PRESET_COLOR_PALETTE.map((preset) => {
                const isSelected = selectedComponents.some((c) => c.name.toLowerCase() === preset.name.toLowerCase());
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleToggleColor(preset.name, preset.hex)}
                    className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 text-emerald-900 font-bold'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full border border-neutral-300 shrink-0" style={{ backgroundColor: preset.hex }} />
                    <span className="text-xs truncate">{preset.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Component Adder */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Custom Color Name (e.g. Neon Lime)"
                value={customCompName}
                onChange={(e) => setCustomCompName(e.target.value)}
                className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0B8F63]"
              />
              <input
                type="color"
                value={customCompHex}
                onChange={(e) => setCustomCompHex(e.target.value)}
                className="w-9 h-9 p-0.5 rounded-xl border border-neutral-200 cursor-pointer bg-white"
              />
              <button
                type="button"
                onClick={handleAddCustomComponent}
                className="bg-neutral-800 hover:bg-neutral-900 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Selected Components List & Removal */}
          {selectedComponents.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase text-neutral-500 tracking-wider">Active Components in Combination:</span>
              <div className="flex flex-wrap gap-2">
                {selectedComponents.map((comp) => (
                  <div key={comp.name} className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-800">
                    <span className="w-3.5 h-3.5 rounded-full border border-neutral-300" style={{ backgroundColor: comp.hex }} />
                    <span>{comp.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveComponent(comp.name)}
                      className="text-neutral-400 hover:text-rose-600 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Combination Name Override */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase text-neutral-700 tracking-wider">Combination Display Name:</label>
              <button
                type="button"
                onClick={() => setUseCustomName(!useCustomName)}
                className="text-[11px] font-bold text-emerald-700 hover:underline"
              >
                {useCustomName ? 'Use Auto-Generated Name' : 'Customize Name'}
              </button>
            </div>
            {useCustomName ? (
              <input
                type="text"
                value={customComboName}
                onChange={(e) => setCustomComboName(e.target.value)}
                placeholder="e.g. Midnight Thunder"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#0B8F63]"
              />
            ) : (
              <div className="w-full bg-neutral-100 border border-neutral-200/80 rounded-xl px-3.5 py-2.5 text-xs font-black text-neutral-800 font-mono">
                {generatedName || 'Black + White'}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={selectedComponents.length < 2}
            className={`px-6 py-2.5 rounded-xl text-xs font-extrabold text-white transition-all shadow-sm ${
              selectedComponents.length >= 2
                ? 'bg-[#0B8F63] hover:bg-[#086F4C] shadow-emerald-600/20'
                : 'bg-neutral-300 cursor-not-allowed'
            }`}
          >
            Create Mixed Colour ({selectedComponents.length})
          </button>
        </div>
      </div>
    </div>
  );
};
