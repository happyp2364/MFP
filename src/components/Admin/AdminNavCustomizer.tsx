import React, { useState } from 'react';
import { useAdminNav } from '../../context/AdminNavContext';
import { AdminNavGroupConfig, AdminNavItemConfig } from '../../types/adminNav';
import {
  GripVertical,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Save,
  Undo,
  Redo,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface AdminNavCustomizerProps {
  showToast?: (msg: string) => void;
}

export const AdminNavCustomizer: React.FC<AdminNavCustomizerProps> = ({ showToast }) => {
  const {
    draftNavConfig,
    hasUnsavedChanges,
    canUndo,
    canRedo,
    undo,
    redo,
    saveNavConfig,
    resetToDefault,
    toggleGroupCollapse,
    toggleGroupVisibility,
    toggleItemVisibility,
    toggleItemLock,
    moveItem,
    moveGroup,
    reorderItemsInGroup,
    reorderGroups,
  } = useAdminNav();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Drag State for Items
  const [draggedItem, setDraggedItem] = useState<{ groupId: string; itemIndex: number } | null>(null);
  const [draggedGroupIndex, setDraggedGroupIndex] = useState<number | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await saveNavConfig();
      setSaveSuccess(true);
      if (showToast) showToast('🎨 Admin navigation layout saved successfully!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert('Failed to save menu configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmReset = async () => {
    await resetToDefault();
    setShowResetConfirm(false);
    if (showToast) showToast('🔄 Navigation menu restored to default layout.');
  };

  // Item Drag Handlers
  const handleItemDragStart = (e: React.DragEvent, groupId: string, itemIndex: number) => {
    e.stopPropagation();
    setDraggedItem({ groupId, itemIndex });
    e.dataTransfer.setData('text/plain', JSON.stringify({ groupId, itemIndex }));
  };

  const handleItemDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleItemDrop = (e: React.DragEvent, targetGroupId: string, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) return;

    const sourceGroup = draftNavConfig.groups.find((g) => g.id === draggedItem.groupId);
    const targetGroup = draftNavConfig.groups.find((g) => g.id === targetGroupId);
    if (!sourceGroup || !targetGroup) return;

    if (draggedItem.groupId === targetGroupId) {
      // Reorder inside same group
      const newItems = [...sourceGroup.items];
      const [moved] = newItems.splice(draggedItem.itemIndex, 1);
      newItems.splice(targetIndex, 0, moved);
      reorderItemsInGroup(targetGroupId, newItems);
    } else {
      // Move item to different group
      const newSourceItems = [...sourceGroup.items];
      const [moved] = newSourceItems.splice(draggedItem.itemIndex, 1);

      const newTargetItems = [...targetGroup.items];
      newTargetItems.splice(targetIndex, 0, moved);

      const updatedGroups = draftNavConfig.groups.map((g) => {
        if (g.id === draggedItem.groupId) return { ...g, items: newSourceItems };
        if (g.id === targetGroupId) return { ...g, items: newTargetItems };
        return g;
      });
      reorderGroups(updatedGroups);
    }

    setDraggedItem(null);
  };

  // Group Drag Handlers
  const handleGroupDragStart = (e: React.DragEvent, groupIndex: number) => {
    setDraggedGroupIndex(groupIndex);
  };

  const handleGroupDrop = (e: React.DragEvent, targetGroupIndex: number) => {
    e.preventDefault();
    if (draggedGroupIndex === null || draggedGroupIndex === targetGroupIndex) return;

    const newGroups = [...draftNavConfig.groups];
    const [moved] = newGroups.splice(draggedGroupIndex, 1);
    newGroups.splice(targetGroupIndex, 0, moved);
    reorderGroups(newGroups);
    setDraggedGroupIndex(null);
  };

  const queryLower = searchQuery.toLowerCase().trim();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md bg-white/95">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#0B8F63]" />
              Customize Admin Menu
            </h2>
            {hasUnsavedChanges ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Unsaved Changes
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Saved to Cloud
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Drag & drop, reorder, show/hide, or lock menu items to optimize your daily shop workflow.
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
            title="Undo last change"
          >
            <Undo className="w-3.5 h-3.5" />
            Undo
          </button>

          <button
            onClick={redo}
            disabled={!canRedo}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
            title="Redo change"
          >
            <Redo className="w-3.5 h-3.5" />
            Redo
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            Reset Defaults
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className={`px-4 py-2 text-xs font-bold rounded-xl text-white flex items-center gap-2 shadow-md transition-all ${
              saveSuccess
                ? 'bg-emerald-600 shadow-emerald-600/30'
                : hasUnsavedChanges
                ? 'bg-[#0B8F63] hover:bg-[#097551] shadow-[#0B8F63]/30'
                : 'bg-neutral-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isSaving ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveSuccess ? 'Saved!' : 'Save Navigation Menu'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search Admin menu modules (e.g. Orders, Products, Coupons, CRM, Payments)..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0B8F63]/30 focus:border-[#0B8F63] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700 font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Groups & Items Container */}
      <div className="space-y-4">
        {draftNavConfig.groups.map((group, groupIdx) => {
          // Filter items by search query if present
          const matchingItems = queryLower
            ? group.items.filter(
                (it) => it.label.toLowerCase().includes(queryLower) || it.id.toLowerCase().includes(queryLower)
              )
            : group.items;

          if (queryLower && matchingItems.length === 0) return null;

          return (
            <div
              key={group.id}
              draggable
              onDragStart={(e) => handleGroupDragStart(e, groupIdx)}
              onDragOver={handleItemDragOver}
              onDrop={(e) => handleGroupDrop(e, groupIdx)}
              className={`bg-white rounded-2xl border transition-all shadow-xs ${
                group.visible ? 'border-neutral-200' : 'border-neutral-200 bg-neutral-50/60 opacity-60'
              }`}
            >
              {/* Group Header */}
              <div className="p-4 flex items-center justify-between border-b border-neutral-100 bg-neutral-50/80 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 cursor-grab active:cursor-grabbing rounded-lg hover:bg-neutral-200/60 transition-colors"
                    title="Drag group to reorder"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  <span className="text-base">{group.icon}</span>

                  <h3 className="text-sm font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
                    {group.label}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-200/80 text-neutral-600">
                      {matchingItems.filter((i) => i.visible).length}/{matchingItems.length} Visible
                    </span>
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => moveGroup(group.id, 'up')}
                    disabled={groupIdx === 0}
                    className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-200/60 disabled:opacity-30 transition-colors"
                    title="Move Group Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => moveGroup(group.id, 'down')}
                    disabled={groupIdx === draftNavConfig.groups.length - 1}
                    className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-200/60 disabled:opacity-30 transition-colors"
                    title="Move Group Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => toggleGroupVisibility(group.id)}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                      group.visible
                        ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-neutral-400 bg-neutral-100 hover:bg-neutral-200'
                    }`}
                    title={group.visible ? 'Hide Entire Group' : 'Show Entire Group'}
                  >
                    {group.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => toggleGroupCollapse(group.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-200/60 transition-colors"
                  >
                    {group.collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Items List */}
              {!group.collapsed && (
                <div className="p-3 space-y-2">
                  {matchingItems.length === 0 ? (
                    <div className="text-center py-4 text-xs text-neutral-400 font-medium">
                      No items match "{searchQuery}" in this section.
                    </div>
                  ) : (
                    matchingItems.map((item, itemIdx) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleItemDragStart(e, group.id, itemIdx)}
                        onDragOver={handleItemDragOver}
                        onDrop={(e) => handleItemDrop(e, group.id, itemIdx)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          item.visible
                            ? 'bg-white border-neutral-200 shadow-xs hover:border-[#0B8F63]/50'
                            : 'bg-neutral-50 border-neutral-200/60 text-neutral-400 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="p-1 text-neutral-400 hover:text-neutral-700 cursor-grab active:cursor-grabbing rounded hover:bg-neutral-100"
                            title="Drag item to reorder"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                              {item.label}
                              {item.locked && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5 text-amber-600" /> Locked
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">ID: {item.id}</span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveItem(group.id, item.id, 'up')}
                            disabled={itemIdx === 0}
                            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => moveItem(group.id, item.id, 'down')}
                            disabled={itemIdx === group.items.length - 1}
                            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleItemLock(group.id, item.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              item.locked
                                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                                : 'text-neutral-400 hover:bg-neutral-100'
                            }`}
                            title={item.locked ? 'Unlock Item' : 'Lock Item'}
                          >
                            {item.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => toggleItemVisibility(group.id, item.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              item.visible
                                ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                : 'text-neutral-400 bg-neutral-100 hover:bg-neutral-200'
                            }`}
                            title={item.visible ? 'Hide Item' : 'Show Item'}
                          >
                            {item.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-neutral-900">Reset Navigation to Default?</h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              This will restore the recommended default menu layout and section ordering for Marudhar Fashion Point.
              Your product data, orders, and customer records will <strong>NOT</strong> be deleted.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/30"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
