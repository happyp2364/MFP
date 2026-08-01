import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  WhatsAppTemplate,
  WhatsAppTemplateActionCategory,
  WhatsAppTemplateAdvancedOptions,
} from '../../types';
import {
  ACTION_CATEGORY_INFO,
  WHATSAPP_VARIABLES_LIST,
  DEFAULT_WHATSAPP_TEMPLATES,
  DEFAULT_ACTIVE_CATEGORY_MAP,
} from '../../data/defaultWhatsAppTemplates';
import {
  renderWhatsAppMessageText,
  buildSamplePayloadForPreview,
  generateWhatsAppLinkFromCategory,
} from '../../utils/whatsappTemplateParser';
import {
  MessageSquare,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Eye,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Strikethrough as StrikeIcon,
  List,
  Smile,
  ExternalLink,
  ShieldCheck,
  Check,
  Zap,
  Tag,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const WhatsAppTemplateManager: React.FC = () => {
  const { whatsappTemplatesConfig, updateWhatsAppTemplatesConfig, resetWhatsAppTemplatesToDefault, showToast } = useStore();

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'advanced'>('editor');

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const templates = whatsappTemplatesConfig?.templates || DEFAULT_WHATSAPP_TEMPLATES;
  const activeCategoryMap: Record<WhatsAppTemplateActionCategory, string> = whatsappTemplatesConfig?.activeCategoryMap || DEFAULT_ACTIVE_CATEGORY_MAP;

  const filteredTemplates = templates.filter((tpl) => {
    if (selectedCategoryFilter === 'all') return true;
    return tpl.actionCategory === selectedCategoryFilter;
  });

  const handleCreateNew = () => {
    const newTpl: WhatsAppTemplate = {
      id: `tpl_custom_${Date.now()}`,
      title: 'New Custom Template',
      actionCategory: 'buy_now',
      enabled: true,
      isActiveForAction: false,
      updatedAt: new Date().toISOString(),
      messageBody: `🛍️ *ORDER INQUIRY - {shopName}*\n\nHello {shopName}! I would like to order:\n\n📦 *Product:* {productName}\n💰 *Price:* {finalPrice}\n\n👤 *Name:* {customerName}\n📞 *Phone:* {customerPhone}\n\nPlease confirm!`,
      advancedOptions: {
        showProductImageLink: true,
        showProductURL: true,
        showCouponDetails: true,
        showCustomerAddress: true,
        showPaymentDetails: true,
        showDeliveryNotes: true,
        customThankYouMessage: '✨ Thank you for shopping with us!',
        storePoliciesNote: '📋 Quality Assured Footwear.',
        returnExchangeNote: '🔄 7-Day Easy Exchange.',
      },
    };
    setEditingTemplate(newTpl);
  };

  const handleDuplicate = (tpl: WhatsAppTemplate) => {
    const duplicated: WhatsAppTemplate = {
      ...tpl,
      id: `tpl_copy_${Date.now()}`,
      title: `${tpl.title} (Copy)`,
      isActiveForAction: false,
      isDefault: false,
      updatedAt: new Date().toISOString(),
    };
    const updatedList = [duplicated, ...templates];
    updateWhatsAppTemplatesConfig({
      ...whatsappTemplatesConfig,
      templates: updatedList,
    });
  };

  const handleDelete = (id: string) => {
    if (templates.length <= 1) {
      showToast('You must keep at least one template in the system.', 'error');
      return;
    }
    if (confirm('Are you sure you want to delete this WhatsApp message template?')) {
      const updatedList = templates.filter((t) => t.id !== id);
      updateWhatsAppTemplatesConfig({
        ...whatsappTemplatesConfig,
        templates: updatedList,
      });
      showToast('Template deleted successfully.', 'success');
    }
  };

  const handleToggleEnabled = (id: string, currentVal: boolean) => {
    const updatedList = templates.map((t) => (t.id === id ? { ...t, enabled: !currentVal } : t));
    updateWhatsAppTemplatesConfig({
      ...whatsappTemplatesConfig,
      templates: updatedList,
    });
  };

  const handleSetActiveForCategory = (tpl: WhatsAppTemplate) => {
    const updatedList = templates.map((t) => ({
      ...t,
      isActiveForAction: t.actionCategory === tpl.actionCategory ? t.id === tpl.id : t.isActiveForAction,
    }));
    const newMap: Record<WhatsAppTemplateActionCategory, string> = {
      ...activeCategoryMap,
      [tpl.actionCategory]: tpl.id,
    };
    updateWhatsAppTemplatesConfig({
      templates: updatedList,
      activeCategoryMap: newMap,
    });
  };

  const handleSaveEditing = () => {
    if (!editingTemplate) return;
    if (!editingTemplate.title.trim()) {
      showToast('Template title cannot be empty.', 'error');
      return;
    }

    const exists = templates.some((t) => t.id === editingTemplate.id);
    let updatedList: WhatsAppTemplate[] = [];

    if (exists) {
      updatedList = templates.map((t) => (t.id === editingTemplate.id ? { ...editingTemplate, updatedAt: new Date().toISOString() } : t));
    } else {
      updatedList = [{ ...editingTemplate, updatedAt: new Date().toISOString() }, ...templates];
    }

    let updatedMap: Record<WhatsAppTemplateActionCategory, string> = { ...activeCategoryMap };
    if (editingTemplate.isActiveForAction) {
      updatedList = updatedList.map((t) => ({
        ...t,
        isActiveForAction: t.actionCategory === editingTemplate.actionCategory ? t.id === editingTemplate.id : t.isActiveForAction,
      }));
      updatedMap[editingTemplate.actionCategory] = editingTemplate.id;
    }

    updateWhatsAppTemplatesConfig({
      templates: updatedList,
      activeCategoryMap: updatedMap,
    });

    showToast('Template saved successfully.', 'success');
    setEditingTemplate(null);
  };

  const insertVariableAtCursor = (varKey: string) => {
    if (!editingTemplate || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editingTemplate.messageBody;

    const before = text.substring(0, start);
    const after = text.substring(end);
    const updatedText = `${before}${varKey}${after}`;

    setEditingTemplate({ ...editingTemplate, messageBody: updatedText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + varKey.length, start + varKey.length);
    }, 50);
  };

  const applyFormattingWrap = (prefix: string, suffix: string) => {
    if (!editingTemplate || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editingTemplate.messageBody;

    const selected = text.substring(start, end) || 'text';
    const before = text.substring(0, start);
    const after = text.substring(end);

    const updatedText = `${before}${prefix}${selected}${suffix}${after}`;
    setEditingTemplate({ ...editingTemplate, messageBody: updatedText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  const quickEmojis = ['🛍️', '📦', '🏷️', '📏', '🎨', '💰', '👤', '📞', '📍', '💳', '✅', '🚚', '🎟️', '🆘', '🏬', '💬', '✨', '📋', '🔄', '⭐'];

  const parseFormattedTextForPreview = (raw: string) => {
    let html = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    html = html.replace(/~(.*?)~/g, '<del>$1</del>');
    html = html.replace(/\n/g, '<br/>');

    return { __html: html };
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Live WhatsApp Integration
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              📱 WhatsApp Message Templates
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl">
              Customize automated WhatsApp order notes, buy-now links, and inquiry messages. Changes save directly to Firestore and apply instantly for all customers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                if (confirm('Reset all WhatsApp templates to original default templates?')) {
                  resetWhatsAppTemplatesToDefault();
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5 border border-white/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-slate-400">Total Templates</div>
            <div className="text-lg font-bold text-white">{templates.length} Templates</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-slate-400">Active Category Routes</div>
            <div className="text-lg font-bold text-emerald-400">
              {Object.keys(ACTION_CATEGORY_INFO).length} Action Types
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-slate-400">Firestore Sync</div>
            <div className="text-lg font-bold text-teal-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Real-Time Active
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-slate-400">Formatting Engine</div>
            <div className="text-lg font-bold text-amber-300">WhatsApp Markdown</div>
          </div>
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategoryFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
            selectedCategoryFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
          }`}
        >
          All Templates ({templates.length})
        </button>
        {Object.entries(ACTION_CATEGORY_INFO).map(([catKey, info]) => {
          const count = templates.filter((t) => t.actionCategory === catKey).length;
          return (
            <button
              key={catKey}
              onClick={() => setSelectedCategoryFilter(catKey)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                selectedCategoryFilter === catKey
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              {info.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((tpl) => {
          const categoryMeta = ACTION_CATEGORY_INFO[tpl.actionCategory] || {
            label: tpl.actionCategory,
            badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
          };

          const isActive = activeCategoryMap[tpl.actionCategory] === tpl.id || tpl.isActiveForAction;

          return (
            <div
              key={tpl.id}
              className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden ${
                isActive ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
              }`}
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${categoryMeta.badgeColor}`}>
                      {categoryMeta.label}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{tpl.title}</h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isActive && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold shadow-xs">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs font-mono text-slate-700 h-28 overflow-hidden relative group">
                  <div className="whitespace-pre-line line-clamp-5 text-[11px] leading-relaxed">
                    {tpl.messageBody}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
                </div>

                {/* Advanced Config Indicators */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                  {tpl.advancedOptions?.showProductImageLink && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">🖼️ Image</span>
                  )}
                  {tpl.advancedOptions?.showCouponDetails && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">🎟️ Coupon</span>
                  )}
                  {tpl.advancedOptions?.showCustomerAddress && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">📍 Address</span>
                  )}
                  {tpl.advancedOptions?.showPaymentDetails && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">💳 Payment</span>
                  )}
                </div>
              </div>

              {/* Card Footer Bar */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleEnabled(tpl.id, tpl.enabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      tpl.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        tpl.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-[11px] font-medium text-slate-600">
                    {tpl.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {!isActive && tpl.enabled && (
                    <button
                      onClick={() => handleSetActiveForCategory(tpl)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                      title="Set as Active for this Category"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setPreviewTemplate(tpl);
                      setIsPreviewOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                    title="Live WhatsApp Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(tpl)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                    title="Duplicate Template"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingTemplate({ ...tpl })}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition"
                    title="Edit Template"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {!tpl.isDefault && (
                    <button
                      onClick={() => handleDelete(tpl.id)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Modal Drawer */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col my-auto">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Edit WhatsApp Message Template</h3>
                  <p className="text-xs text-slate-400">Configure text body, variables, formatting, and display toggles</p>
                </div>
              </div>

              <button
                onClick={() => setEditingTemplate(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Basic Template Meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Template Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.title}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="e.g., Summer Direct Buy Template"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Action Route Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editingTemplate.actionCategory}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        actionCategory: e.target.value as WhatsAppTemplateActionCategory,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                  >
                    {Object.entries(ACTION_CATEGORY_INFO).map(([catKey, info]) => (
                      <option key={catKey} value={catKey}>
                        {info.label} ({catKey})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggles Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingTemplate.enabled}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, enabled: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  Enable Template
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-800">
                  <input
                    type="checkbox"
                    checked={editingTemplate.isActiveForAction}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, isActiveForAction: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  Set as Active Default for {ACTION_CATEGORY_INFO[editingTemplate.actionCategory]?.label}
                </label>
              </div>

              {/* Editor Tabs */}
              <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === 'editor'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Edit3 className="w-4 h-4" /> Message Editor & Variables
                </button>
                <button
                  onClick={() => setActiveTab('advanced')}
                  className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === 'advanced'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Settings className="w-4 h-4" /> Advanced Options & Toggles
                </button>
              </div>

              {activeTab === 'editor' ? (
                <div className="space-y-4">
                  {/* Formatting Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-100 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => applyFormattingWrap('*', '*')}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-200 font-bold text-xs text-slate-800 border border-slate-300 flex items-center gap-1"
                        title="Bold (*text*)"
                      >
                        <BoldIcon className="w-3.5 h-3.5" /> Bold
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormattingWrap('_', '_')}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-200 italic text-xs text-slate-800 border border-slate-300 flex items-center gap-1"
                        title="Italic (_text_)"
                      >
                        <ItalicIcon className="w-3.5 h-3.5" /> Italic
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormattingWrap('~', '~')}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-200 line-through text-xs text-slate-800 border border-slate-300 flex items-center gap-1"
                        title="Strikethrough (~text~)"
                      >
                        <StrikeIcon className="w-3.5 h-3.5" /> Strike
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariableAtCursor('\n• ')}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-xs text-slate-800 border border-slate-300 flex items-center gap-1"
                        title="Bullet list item"
                      >
                        <List className="w-3.5 h-3.5" /> Bullet
                      </button>
                    </div>

                    {/* Emoji Quick Toolbar */}
                    <div className="flex items-center gap-1 overflow-x-auto max-w-full">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase mr-1">Quick Emojis:</span>
                      {quickEmojis.map((emoji, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => insertVariableAtCursor(emoji)}
                          className="px-1.5 py-0.5 rounded hover:bg-slate-200 text-sm transition"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Variables Selector Panel */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" /> Click any variable button to insert into message body:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {WHATSAPP_VARIABLES_LIST.map((v) => (
                        <button
                          key={v.key}
                          type="button"
                          onClick={() => insertVariableAtCursor(v.key)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-800 text-[11px] font-mono text-slate-700 border border-slate-300 hover:border-emerald-300 transition shadow-2xs flex items-center gap-1"
                          title={`${v.label} (Sample: ${v.sample})`}
                        >
                          <span className="text-emerald-600 font-bold">+</span> {v.key}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Textarea */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex justify-between items-center">
                      <span>WhatsApp Message Body Text</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {editingTemplate.messageBody.length} characters | {editingTemplate.messageBody.split(/\s+/).filter(Boolean).length} words
                      </span>
                    </label>
                    <textarea
                      ref={textareaRef}
                      value={editingTemplate.messageBody}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, messageBody: e.target.value })}
                      rows={10}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 font-mono text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none leading-relaxed"
                    />
                  </div>
                </div>
              ) : (
                /* Advanced Options Tab */
                <div className="space-y-6">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-600" /> Dynamic Toggle Append Rules
                    </div>
                    <p>
                      When enabled, these sections will be automatically appended to the generated WhatsApp message if the required order details exist!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTemplate.advancedOptions?.showProductImageLink}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            advancedOptions: { ...editingTemplate.advancedOptions, showProductImageLink: e.target.checked },
                          })
                        }
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-slate-900">Show Product Image Link</div>
                        <div className="text-[11px] text-slate-500">Appends direct high-res image URL</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTemplate.advancedOptions?.showProductURL}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            advancedOptions: { ...editingTemplate.advancedOptions, showProductURL: e.target.checked },
                          })
                        }
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-slate-900">Show Product Page Link</div>
                        <div className="text-[11px] text-slate-500">Appends direct website product URL</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTemplate.advancedOptions?.showCouponDetails}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            advancedOptions: { ...editingTemplate.advancedOptions, showCouponDetails: e.target.checked },
                          })
                        }
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-slate-900">Show Coupon Details</div>
                        <div className="text-[11px] text-slate-500">Appends promo code & discount summary</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTemplate.advancedOptions?.showCustomerAddress}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            advancedOptions: { ...editingTemplate.advancedOptions, showCustomerAddress: e.target.checked },
                          })
                        }
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-slate-900">Show Shipping Address</div>
                        <div className="text-[11px] text-slate-500">Appends full street, city, state, pincode</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTemplate.advancedOptions?.showPaymentDetails}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            advancedOptions: { ...editingTemplate.advancedOptions, showPaymentDetails: e.target.checked },
                          })
                        }
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-slate-900">Show Payment Method & UTR</div>
                        <div className="text-[11px] text-slate-500">Appends payment mode details</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTemplate.advancedOptions?.showDeliveryNotes}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            advancedOptions: { ...editingTemplate.advancedOptions, showDeliveryNotes: e.target.checked },
                          })
                        }
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-slate-900">Show Delivery Instructions</div>
                        <div className="text-[11px] text-slate-500">Appends customer special notes</div>
                      </div>
                    </label>
                  </div>

                  {/* Custom Note Fields */}
                  <div className="space-y-4 pt-4 border-t border-slate-200 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Custom Thank-You Message</label>
                      <input
                        type="text"
                        value={editingTemplate.advancedOptions?.customThankYouMessage || ''}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            advancedOptions: { ...editingTemplate.advancedOptions, customThankYouMessage: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="e.g. ✨ Thank you for choosing Marudhar Fashion Point!"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Store Policies Note</label>
                      <input
                        type="text"
                        value={editingTemplate.advancedOptions?.storePoliciesNote || ''}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            advancedOptions: { ...editingTemplate.advancedOptions, storePoliciesNote: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="e.g. 📋 100% Quality Inspected Item"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Return / Exchange Note</label>
                      <input
                        type="text"
                        value={editingTemplate.advancedOptions?.returnExchangeNote || ''}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            advancedOptions: { ...editingTemplate.advancedOptions, returnExchangeNote: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="e.g. 🔄 7-Day Size Exchange available"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setPreviewTemplate(editingTemplate);
                  setIsPreviewOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4 text-emerald-600" /> Preview Live Output
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditing}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Live Phone Preview Modal */}
      {isPreviewOpen && previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto">
            {/* Phone Top Header */}
            <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-sm border border-emerald-500">
                  MF
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight">Marudhar Fashion Point</h4>
                  <p className="text-[10px] text-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online • WhatsApp Business
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body (WhatsApp Green Wallpaper style) */}
            <div className="bg-[#efeae2] p-4 min-h-[380px] max-h-[500px] overflow-y-auto space-y-3 font-sans relative">
              <div className="text-center my-2">
                <span className="bg-[#e1f5fe] text-slate-700 text-[10px] px-2.5 py-1 rounded-md shadow-2xs font-medium">
                  🔒 Messages are end-to-end encrypted
                </span>
              </div>

              {/* Chat Speech Bubble */}
              <div className="ml-auto max-w-[88%] bg-[#dcf8c6] rounded-2xl rounded-tr-none p-3.5 shadow-sm border border-emerald-200 text-xs text-slate-900 relative space-y-1">
                <div
                  className="whitespace-pre-line leading-relaxed font-sans"
                  dangerouslySetInnerHTML={parseFormattedTextForPreview(
                    renderWhatsAppMessageText(
                      previewTemplate,
                      buildSamplePayloadForPreview(previewTemplate.actionCategory)
                    )
                  )}
                />

                <div className="flex items-center justify-end gap-1 text-[9px] text-slate-500 pt-1">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-blue-600 font-bold">✓✓</span>
                </div>
              </div>
            </div>

            {/* Phone Footer */}
            <div className="bg-slate-100 p-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-medium">Live Sample Data Output</span>
              <a
                href={generateWhatsAppLinkFromCategory(
                  previewTemplate.actionCategory,
                  buildSamplePayloadForPreview(previewTemplate.actionCategory)
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Test in WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
