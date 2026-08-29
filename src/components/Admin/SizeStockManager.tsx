import React, { useState } from 'react';
import { SizeStock } from '../../types';
import { SIZE_PRESETS, syncSizesFromSizeStocks } from '../../utils/sizeStockUtils';
import { Plus, Trash2, CheckCircle2, XCircle, RefreshCw, Sparkles, Layers } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface SizeStockManagerProps {
  sizeStocks: SizeStock[];
  onChange: (updatedStocks: SizeStock[], updatedSizesList: string[]) => void;
  category?: string;
}

export const SizeStockManager: React.FC<SizeStockManagerProps> = ({
  sizeStocks,
  onChange,
  category = 'men',
}) => {
  const [customInput, setCustomInput] = useState('');
  const { showToast } = useStore();

  const updateStocks = (newStocks: SizeStock[]) => {
    const updatedSizesList = syncSizesFromSizeStocks(newStocks);
    onChange(newStocks, updatedSizesList);
  };

  // Toggle availability
  const handleToggleAvailable = (index: number) => {
    const next = [...sizeStocks];
    next[index] = {
      ...next[index],
      isAvailable: !next[index].isAvailable,
    };
    updateStocks(next);
  };

  // Toggle inStock
  const handleToggleInStock = (index: number) => {
    const next = [...sizeStocks];
    const newInStock = !next[index].inStock;
    next[index] = {
      ...next[index],
      inStock: newInStock,
      stockQuantity: newInStock && next[index].stockQuantity === 0 ? 10 : next[index].stockQuantity,
    };
    updateStocks(next);
  };

  // Change quantity
  const handleQuantityChange = (index: number, val: number) => {
    const qty = Math.max(0, val);
    const next = [...sizeStocks];
    next[index] = {
      ...next[index],
      stockQuantity: qty,
      inStock: qty > 0,
    };
    updateStocks(next);
  };

  // Delete size
  const handleDeleteSize = (index: number) => {
    const next = sizeStocks.filter((_, i) => i !== index);
    updateStocks(next);
  };

  // Add Custom Size
  const handleAddCustomSize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customInput.trim()) return;

    const trimmed = customInput.trim();
    if (sizeStocks.some((s) => s.size.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`Size "${trimmed}" is already added.`, 'error');
      return;
    }

    const newStock: SizeStock = {
      size: trimmed,
      isAvailable: true,
      inStock: true,
      stockQuantity: 10,
      system: 'Custom',
    };

    updateStocks([...sizeStocks, newStock]);
    setCustomInput('');
  };

  // Load Preset
  const handleLoadPreset = (presetList: string[], systemName: SizeStock['system']) => {
    const newStocks: SizeStock[] = presetList.map((sz) => ({
      size: sz,
      isAvailable: true,
      inStock: true,
      stockQuantity: 10,
      system: systemName,
    }));
    updateStocks(newStocks);
  };

  // Bulk Actions
  const handleMarkAllInStock = () => {
    const next = sizeStocks.map((s) => ({
      ...s,
      inStock: true,
      stockQuantity: s.stockQuantity === 0 ? 10 : s.stockQuantity,
    }));
    updateStocks(next);
  };

  const handleMarkAllOutOfStock = () => {
    const next = sizeStocks.map((s) => ({
      ...s,
      inStock: false,
    }));
    updateStocks(next);
  };

  const handleEnableAll = () => {
    const next = sizeStocks.map((s) => ({
      ...s,
      isAvailable: true,
    }));
    updateStocks(next);
  };

  return (
    <div className="bg-[#F8FAFC] p-4 sm:p-5 rounded-2xl border border-neutral-200/90 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0B8F63]" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900">
              Available Sizes & Stock Quantity Management
            </h4>
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Configure available sizes, stock quantity per size, and enable/disable sizes in real-time.
          </p>
        </div>

        {/* Quick Bulk Actions */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          <button
            type="button"
            onClick={handleEnableAll}
            className="bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 font-bold px-2.5 py-1 rounded-lg transition-colors"
          >
            Enable All
          </button>
          <button
            type="button"
            onClick={handleMarkAllInStock}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-1 rounded-lg transition-colors"
          >
            Mark All In Stock
          </button>
          <button
            type="button"
            onClick={handleMarkAllOutOfStock}
            className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold px-2.5 py-1 rounded-lg transition-colors"
          >
            Mark All Out of Stock
          </button>
        </div>
      </div>

      {/* Preset System Quick Load Bar */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
          Load Quick Size System Presets:
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleLoadPreset(SIZE_PRESETS.UK_FOOTWEAR, 'UK')}
            className="bg-white hover:bg-emerald-50 text-neutral-800 hover:text-[#0B8F63] border border-neutral-200 hover:border-[#0B8F63] text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
          >
            👟 UK Footwear (5 - 11)
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset(SIZE_PRESETS.EU_FOOTWEAR, 'EU')}
            className="bg-white hover:bg-emerald-50 text-neutral-800 hover:text-[#0B8F63] border border-neutral-200 hover:border-[#0B8F63] text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
          >
            👞 EU Footwear (38 - 45)
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset(SIZE_PRESETS.US_FOOTWEAR, 'US')}
            className="bg-white hover:bg-emerald-50 text-neutral-800 hover:text-[#0B8F63] border border-neutral-200 hover:border-[#0B8F63] text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
          >
            👟 US Footwear (6 - 11)
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset(SIZE_PRESETS.CLOTHING_ALPHA, 'Clothing')}
            className="bg-white hover:bg-emerald-50 text-neutral-800 hover:text-[#0B8F63] border border-neutral-200 hover:border-[#0B8F63] text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
          >
            👕 Clothing (XS - XXXL)
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset(SIZE_PRESETS.CLOTHING_WAIST, 'Clothing')}
            className="bg-white hover:bg-emerald-50 text-neutral-800 hover:text-[#0B8F63] border border-neutral-200 hover:border-[#0B8F63] text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
          >
            👖 Waist Sizes (28 - 42)
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset(SIZE_PRESETS.KIDS_AGE, 'Kids')}
            className="bg-white hover:bg-emerald-50 text-neutral-800 hover:text-[#0B8F63] border border-neutral-200 hover:border-[#0B8F63] text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
          >
            👶 Kids Age (2-13Y)
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset(SIZE_PRESETS.KIDS_SHOES, 'Kids')}
            className="bg-white hover:bg-emerald-50 text-neutral-800 hover:text-[#0B8F63] border border-neutral-200 hover:border-[#0B8F63] text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
          >
            👟 Kids Shoe Sizes (C6 - 5)
          </button>
        </div>
      </div>

      {/* Size Grid / List */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        {sizeStocks.length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-400 space-y-2">
            <p>No sizes added yet. Click a preset above or add a custom size below.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {/* Table Header */}
            <div className="bg-neutral-100/70 grid grid-cols-12 gap-2 p-2.5 text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">
              <div className="col-span-3">Size Value</div>
              <div className="col-span-3 text-center">Availability</div>
              <div className="col-span-3 text-center">Stock Status</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-1 text-right">Del</div>
            </div>

            {/* Size Rows */}
            {sizeStocks.map((item, idx) => (
              <div
                key={`${item.size}-${idx}`}
                className={`grid grid-cols-12 gap-2 p-2.5 items-center text-xs transition-colors ${
                  !item.isAvailable ? 'bg-neutral-50 opacity-60' : 'hover:bg-neutral-50/80'
                }`}
              >
                {/* Size Name */}
                <div className="col-span-3 font-bold text-neutral-900 flex items-center gap-1.5">
                  <span className="bg-neutral-100 border border-neutral-200 text-neutral-800 font-extrabold px-2 py-1 rounded text-xs">
                    {item.size}
                  </span>
                  {item.system && (
                    <span className="hidden sm:inline text-[9px] text-neutral-400 font-semibold uppercase">
                      ({item.system})
                    </span>
                  )}
                </div>

                {/* Available Toggle */}
                <div className="col-span-3 text-center">
                  <button
                    type="button"
                    onClick={() => handleToggleAvailable(idx)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                      item.isAvailable
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-neutral-200 text-neutral-600 border border-neutral-300'
                    }`}
                  >
                    {item.isAvailable ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Enabled</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-neutral-500" />
                        <span>Disabled</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Stock Status Toggle */}
                <div className="col-span-3 text-center">
                  <button
                    type="button"
                    disabled={!item.isAvailable}
                    onClick={() => handleToggleInStock(idx)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                      item.inStock && item.stockQuantity > 0
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {item.inStock && item.stockQuantity > 0 ? (
                      <span>In Stock</span>
                    ) : (
                      <span>Out of Stock</span>
                    )}
                  </button>
                </div>

                {/* Quantity Input */}
                <div className="col-span-2 text-center">
                  <input
                    type="number"
                    min="0"
                    disabled={!item.isAvailable}
                    value={item.stockQuantity}
                    onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 0)}
                    className="w-full text-center bg-[#F7F7F7] border border-neutral-300 rounded-lg py-1 px-1 font-bold text-xs outline-none focus:ring-1 focus:ring-[#0B8F63]"
                  />
                </div>

                {/* Delete Button */}
                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleDeleteSize(idx)}
                    className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove size"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Size Addition Input */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          placeholder="Enter custom size (e.g. Free Size, 5.5, 32, UK 9.5)..."
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCustomSize();
            }
          }}
          className="flex-1 bg-white border border-neutral-300 rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-[#0B8F63]"
        />
        <button
          type="button"
          onClick={() => handleAddCustomSize()}
          className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Size</span>
        </button>
      </div>
    </div>
  );
};
