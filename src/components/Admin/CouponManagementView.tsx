import React, { useState } from 'react';
import {
  Plus,
  Ticket,
  Percent,
  Search,
  Filter,
  Trash2,
  Edit3,
  Copy,
  Eye,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  TrendingUp,
  Tag,
  DollarSign,
  Calendar,
  Gift,
  Truck,
  ArrowRight,
  Users,
  Lock,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PromoCoupon, CouponType, Product } from '../../types';
import { ScratchAndWinSettingsView } from './ScratchAndWinSettingsView';
import { OrderCelebrationSettingsView } from './OrderCelebrationSettingsView';

export const CouponManagementView: React.FC = () => {
  const {
    coupons,
    products,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    duplicateCoupon,
    showToast,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'coupons' | 'scratch' | 'celebration'>('coupons');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New coupon initial state
  const initialFormState = {
    code: '',
    name: '',
    description: '',
    bannerUrl: '',
    type: 'PERCENTAGE' as CouponType,
    discountValue: 10,
    maxDiscount: 0,
    minOrderAmount: 0,
    maxOrderAmount: 0,
    minProductPrice: 0,
    maxProductPrice: 0,
    usageLimit: 0,
    perCustomerLimit: 1,
    startDate: '',
    endDate: '',
    priority: 1,
    status: 'active' as PromoCoupon['status'],
    restrictType: 'ALL' as PromoCoupon['restrictType'],
    restrictCollections: [] as string[],
    restrictCategories: [] as string[],
    restrictBrands: [] as string[],
    restrictProductIds: [] as string[],
    restrictSizes: [] as string[],
    restrictColors: [] as string[],
    restrictStock: 'ALL' as NonNullable<PromoCoupon['restrictStock']>,
    stackable: false,
    autoApply: false,
    visible: true,
    visibility: 'public' as PromoCoupon['visibility'],
    featured: false,
  };

  const [formData, setFormData] = useState(initialFormState);

  // Preview Modal
  const [previewCoupon, setPreviewCoupon] = useState<PromoCoupon | null>(null);

  // Dynamic values extracted from products for restrictions
  const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[];
  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];
  const uniqueSubcategories = Array.from(new Set(products.map(p => p.subcategory).filter(Boolean))) as string[];
  const uniqueSizes = Array.from(new Set(products.flatMap(p => p.sizes || []).filter(Boolean))).map(String).sort((a, b) => a.localeCompare(b)) as string[];
  const uniqueColors = Array.from(new Set(products.flatMap(p => (p.colors || []).map(c => c.name)).filter(Boolean))) as string[];

  // Analytics helper variables
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.status === 'active').length;
  const totalRevenueGenerated = coupons.reduce((sum, c) => sum + (c.revenueGenerated || 0), 0);
  const totalDiscountGiven = coupons.reduce((sum, c) => sum + (c.discountGiven || 0), 0);
  const totalUsage = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
  const totalFailed = coupons.reduce((sum, c) => sum + (c.failedCount || 0), 0);
  const conversionRate = totalUsage + totalFailed > 0 
    ? Math.round((totalUsage / (totalUsage + totalFailed)) * 100) 
    : 0;

  // Filter coupons
  const filteredCoupons = coupons.filter(c => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = (c.code || '').toLowerCase().includes(q) || 
                          (c.name || '').toLowerCase().includes(q);
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      ...initialFormState,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (coupon: PromoCoupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      bannerUrl: coupon.bannerUrl || '',
      type: coupon.type,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount || 0,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxOrderAmount: coupon.maxOrderAmount || 0,
      minProductPrice: coupon.minProductPrice || 0,
      maxProductPrice: coupon.maxProductPrice || 0,
      usageLimit: coupon.usageLimit || 0,
      perCustomerLimit: coupon.perCustomerLimit || 1,
      startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
      endDate: coupon.endDate ? coupon.endDate.split('T')[0] : '',
      priority: coupon.priority || 1,
      status: coupon.status,
      restrictType: coupon.restrictType || 'ALL',
      restrictCollections: coupon.restrictCollections || [],
      restrictCategories: coupon.restrictCategories || [],
      restrictBrands: coupon.restrictBrands || [],
      restrictProductIds: coupon.restrictProductIds || [],
      restrictSizes: coupon.restrictSizes || [],
      restrictColors: coupon.restrictColors || [],
      restrictStock: coupon.restrictStock || 'ALL',
      stackable: coupon.stackable || false,
      autoApply: coupon.autoApply || false,
      visible: coupon.visible ?? true,
      visibility: coupon.visibility || 'public',
      featured: coupon.featured || false,
    });
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (coupon: PromoCoupon) => {
    const nextStatus = coupon.status === 'active' ? 'disabled' : 'active';
    await updateCoupon(coupon.id, { status: nextStatus });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      showToast('❌ Coupon code is required', 'error');
      return;
    }
    if (!formData.name.trim()) {
      showToast('❌ Coupon title is required', 'error');
      return;
    }

    const payload = {
      code: formData.code.toUpperCase().trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      bannerUrl: formData.bannerUrl.trim(),
      type: formData.type,
      discountValue: Number(formData.discountValue),
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
      minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : undefined,
      maxOrderAmount: formData.maxOrderAmount ? Number(formData.maxOrderAmount) : undefined,
      minProductPrice: formData.minProductPrice ? Number(formData.minProductPrice) : undefined,
      maxProductPrice: formData.maxProductPrice ? Number(formData.maxProductPrice) : undefined,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
      perCustomerLimit: formData.perCustomerLimit ? Number(formData.perCustomerLimit) : 1,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      priority: Number(formData.priority) || 1,
      status: formData.status,
      restrictType: formData.restrictType,
      restrictCollections: formData.restrictType === 'COLLECTIONS' ? formData.restrictCollections : [],
      restrictCategories: formData.restrictType === 'CATEGORIES' ? formData.restrictCategories : [],
      restrictBrands: formData.restrictType === 'BRANDS' ? formData.restrictBrands : [],
      restrictProductIds: formData.restrictType === 'PRODUCTS' ? formData.restrictProductIds : [],
      restrictSizes: formData.restrictSizes,
      restrictColors: formData.restrictColors,
      restrictStock: formData.restrictStock,
      stackable: formData.stackable,
      autoApply: formData.autoApply,
      visible: formData.visible,
      visibility: formData.visibility,
      featured: formData.featured,
    };

    let success = false;
    if (editingId) {
      success = await updateCoupon(editingId, payload);
    } else {
      success = await addCoupon(payload);
    }

    if (success) {
      setIsFormOpen(false);
    }
  };

  const handleToggleRestrictionListItem = (field: 'restrictCollections' | 'restrictCategories' | 'restrictBrands' | 'restrictProductIds' | 'restrictSizes' | 'restrictColors', value: string) => {
    setFormData(prev => {
      const list = prev[field] as string[];
      const nextList = list.includes(value) 
        ? list.filter(item => item !== value) 
        : [...list, value];
      return { ...prev, [field]: nextList };
    });
  };

  const renderSubTabs = () => (
    <div className="flex border-b border-neutral-200 gap-1 overflow-x-auto pb-1 shrink-0">
      <button
        onClick={() => setActiveSubTab('coupons')}
        className={`px-4 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
          activeSubTab === 'coupons'
            ? 'border-[#0B8F63] text-[#0B8F63]'
            : 'border-transparent text-neutral-500 hover:text-neutral-800'
        }`}
      >
        🎟️ Standard Coupons
      </button>
      <button
        onClick={() => setActiveSubTab('scratch')}
        className={`px-4 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
          activeSubTab === 'scratch'
            ? 'border-[#0B8F63] text-[#0B8F63]'
            : 'border-transparent text-neutral-500 hover:text-neutral-800'
        }`}
      >
        🎰 Scratch & Win Settings
      </button>
      <button
        onClick={() => setActiveSubTab('celebration')}
        className={`px-4 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
          activeSubTab === 'celebration'
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-neutral-500 hover:text-neutral-800'
        }`}
      >
        🎉 Order Success Celebration
      </button>
    </div>
  );

  if (activeSubTab === 'scratch') {
    return (
      <div className="space-y-6">
        {renderSubTabs()}
        <ScratchAndWinSettingsView />
      </div>
    );
  }

  if (activeSubTab === 'celebration') {
    return (
      <div className="space-y-6">
        {renderSubTabs()}
        <OrderCelebrationSettingsView />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderSubTabs()}
      {/* ----------------- ANALYTICS BANNER ----------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Engine</span>
            <Ticket className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-serif-heading font-extrabold text-neutral-900">{totalCoupons}</div>
            <div className="text-[10px] font-bold text-neutral-500 mt-0.5">{activeCoupons} Active Campaigns</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Coupons Used</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-serif-heading font-extrabold text-neutral-900">{totalUsage}</div>
            <div className="text-[10px] font-bold text-neutral-500 mt-0.5">{totalFailed} Failed Attempts</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Discount Value</span>
            <Percent className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-serif-heading font-extrabold text-neutral-900">₹{totalDiscountGiven.toLocaleString()}</div>
            <div className="text-[10px] font-bold text-neutral-500 mt-0.5">Average savings tracked</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Revenue Instigated</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-serif-heading font-extrabold text-neutral-900">₹{totalRevenueGenerated.toLocaleString()}</div>
            <div className="text-[10px] font-bold text-neutral-500 mt-0.5">Direct checkout attribution</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-serif-heading font-extrabold text-neutral-900">{conversionRate}%</div>
            <div className="text-[10px] font-bold text-neutral-500 mt-0.5">Activation success rate</div>
          </div>
        </div>
      </div>

      {/* ----------------- SEARCH & HEADER ACTIONS ----------------- */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search coupons by code or campaign name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-[#0B8F63]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#F7F7F7] border border-neutral-200 rounded-xl py-2 px-3 text-xs font-bold text-neutral-700 outline-none"
          >
            <option value="all">All Types</option>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FLAT">Flat Rate</option>
            <option value="BUY_X_GET_Y">Buy X Get Y</option>
            <option value="FREE_SHIPPING">Free Shipping</option>
            <option value="FREE_GIFT">Free Gift Promo</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F7F7F7] border border-neutral-200 rounded-xl py-2 px-3 text-xs font-bold text-neutral-700 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="disabled">Disabled</option>
            <option value="archived">Archived</option>
          </select>

          <button
            onClick={handleOpenCreate}
            className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* ----------------- COUPONS TABLE ----------------- */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        {filteredCoupons.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-neutral-500">No promotion coupons found</p>
            <p className="text-xs text-neutral-400 mt-1">Create a coupon campaign to begin offering deals.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121816] text-white font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Coupon & Campaign Info</th>
                  <th className="p-3.5">Discount Type</th>
                  <th className="p-3.5">Value</th>
                  <th className="p-3.5">Usage Metrics</th>
                  <th className="p-3.5">Start / End Dates</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                {filteredCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* Code and Name */}
                    <td className="p-3.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-sm text-[#0B8F63] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded uppercase tracking-wider">
                            {c.code}
                          </span>
                          {c.featured && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded uppercase">
                              ★ Featured
                            </span>
                          )}
                          {c.autoApply && (
                            <span className="text-[9px] bg-sky-100 text-sky-800 font-extrabold px-1.5 py-0.2 rounded uppercase">
                              ⚡ Auto
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-neutral-900 mt-1">{c.name}</div>
                        {c.description && (
                          <div className="text-[10px] text-neutral-400 mt-0.5 max-w-xs truncate">{c.description}</div>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="p-3.5 font-bold uppercase text-[10px] text-neutral-500">
                      <div className="flex items-center gap-1.5">
                        {c.type === 'PERCENTAGE' && <Percent className="w-3.5 h-3.5 text-amber-500" />}
                        {c.type === 'FLAT' && <Tag className="w-3.5 h-3.5 text-emerald-500" />}
                        {c.type === 'BUY_X_GET_Y' && <Gift className="w-3.5 h-3.5 text-rose-500" />}
                        {c.type === 'FREE_SHIPPING' && <Truck className="w-3.5 h-3.5 text-indigo-500" />}
                        {c.type === 'FREE_GIFT' && <Gift className="w-3.5 h-3.5 text-rose-400" />}
                        <span>{c.type.replace(/_/g, ' ')}</span>
                      </div>
                    </td>

                    {/* Value */}
                    <td className="p-3.5">
                      <div className="font-bold text-neutral-900">
                        {c.type === 'PERCENTAGE' && `${c.discountValue}%`}
                        {c.type === 'FLAT' && `₹${c.discountValue}`}
                        {c.type === 'BUY_X_GET_Y' && `Buy ${c.discountValue} Get 1 Free`}
                        {c.type === 'FREE_SHIPPING' && 'Free Delivery'}
                        {c.type === 'FREE_GIFT' && 'Gift Included'}
                      </div>
                      {c.type === 'PERCENTAGE' && c.maxDiscount && (
                        <div className="text-[9px] text-neutral-400 mt-0.5">Cap: ₹{c.maxDiscount}</div>
                      )}
                      {c.minOrderAmount ? (
                        <div className="text-[9px] text-neutral-500 mt-0.5">Min Subtotal: ₹{c.minOrderAmount}</div>
                      ) : null}
                    </td>

                    {/* Metrics */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                        <span>{c.usageCount || 0}</span>
                        <span className="text-neutral-400 font-normal">/</span>
                        <span className="text-neutral-500 font-semibold">{c.usageLimit || '∞'}</span>
                      </div>
                      <div className="text-[9px] text-neutral-400 mt-0.5">
                        Attribution: ₹{(c.revenueGenerated || 0).toLocaleString()}
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="p-3.5 text-neutral-500 text-[11px]">
                      <div className="flex flex-col gap-0.5 font-semibold">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-neutral-400 uppercase w-7">Start:</span>
                          <span>{c.startDate ? new Date(c.startDate).toLocaleDateString() : 'Immediate'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-neutral-400 uppercase w-7">End:</span>
                          <span className={c.endDate && new Date(c.endDate) < new Date() ? 'text-rose-500' : ''}>
                            {c.endDate ? new Date(c.endDate).toLocaleDateString() : 'Indefinite'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider ${
                        c.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : c.status === 'paused'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : c.status === 'disabled'
                          ? 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(c)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
                          title={c.status === 'active' ? 'Pause Coupon' : 'Activate Coupon'}
                        >
                          {c.status === 'active' ? (
                            <ToggleRight className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-neutral-400" />
                          )}
                        </button>

                        <button
                          onClick={() => setPreviewCoupon(c)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100 transition-all"
                          title="Preview Ticket"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => duplicateCoupon(c.id)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-indigo-500 hover:bg-neutral-100 transition-all"
                          title="Duplicate Coupon"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-emerald-600 hover:bg-neutral-100 transition-all"
                          title="Edit Campaign"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete coupon ${c.code}?`)) {
                              deleteCoupon(c.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 transition-all"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ----------------- EDIT / CREATE FORM MODAL ----------------- */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden z-10 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-[#121816] text-white p-4 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#0B8F63]" />
                <h3 className="font-serif-heading font-extrabold text-base">
                  {editingId ? 'Edit Promotion Campaign' : 'Create New Promotion Coupon'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
              {/* Core Information */}
              <div className="space-y-3.5 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                <h4 className="font-bold text-neutral-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-[#0B8F63] rounded-full inline-block" />
                  Campaign Core Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Coupon Promo Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SNEAKER40, FESTIVE99"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-mono uppercase text-sm focus:ring-1 focus:ring-[#0B8F63] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Campaign Display Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat ₹500 Discount, Buy 2 Get 1 Free"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-bold focus:ring-1 focus:ring-[#0B8F63] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Description / Subtitle</label>
                  <textarea
                    placeholder="Provide details about the deal terms (e.g. Valid on Men's Sneakers of Size 7 only)"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 h-16 resize-none focus:ring-1 focus:ring-[#0B8F63] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-bold outline-none"
                    >
                      <option value="active">Active (Deploy Live)</option>
                      <option value="paused">Paused (Temporarily Hold)</option>
                      <option value="disabled">Disabled (Deactivate)</option>
                      <option value="archived">Archived (Hide & Lock)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Campaign Priority</label>
                    <input
                      type="number"
                      placeholder="e.g. 1"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Promotion Visibility</label>
                    <select
                      value={formData.visibility}
                      onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as any }))}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-bold outline-none"
                    >
                      <option value="public">Public (Show to Customers)</option>
                      <option value="hidden">Hidden (Code application only)</option>
                    </select>
                  </div>
                </div>

                {/* Flags: Featured, Auto Apply, Stackable */}
                <div className="flex flex-wrap gap-4 pt-1 border-t border-neutral-200">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="w-4 h-4 accent-[#0B8F63]"
                    />
                    <span>★ Featured (Highlight on checkout page)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700">
                    <input
                      type="checkbox"
                      checked={formData.autoApply}
                      onChange={(e) => setFormData(prev => ({ ...prev, autoApply: e.target.checked }))}
                      className="w-4 h-4 accent-[#0B8F63]"
                    />
                    <span>⚡ Auto Apply (Apply automatically if valid)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700">
                    <input
                      type="checkbox"
                      checked={formData.stackable}
                      onChange={(e) => setFormData(prev => ({ ...prev, stackable: e.target.checked }))}
                      className="w-4 h-4 accent-[#0B8F63]"
                    />
                    <span>🔀 Stackable (Combine with other coupons)</span>
                  </label>
                </div>
              </div>

              {/* Discount Formulation */}
              <div className="space-y-3.5 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                <h4 className="font-bold text-neutral-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-amber-500 rounded-full inline-block" />
                  Discount Type & Values
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Coupon Promotion Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CouponType }))}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-extrabold outline-none"
                    >
                      <option value="PERCENTAGE">Percentage Discount (%)</option>
                      <option value="FLAT">Flat Monetary Discount (₹)</option>
                      <option value="BUY_X_GET_Y">Buy X Items Get Lowest Item Free</option>
                      <option value="FREE_SHIPPING">Free Shipping Discount</option>
                      <option value="FREE_GIFT">Free Premium Gift Promotion</option>
                    </select>
                  </div>

                  {formData.type !== 'FREE_SHIPPING' && formData.type !== 'FREE_GIFT' && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                        {formData.type === 'PERCENTAGE' && 'Discount Rate (%) *'}
                        {formData.type === 'FLAT' && 'Discount Amount (₹) *'}
                        {formData.type === 'BUY_X_GET_Y' && 'Trigger Quantity (X) *'}
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 15"
                        value={formData.discountValue}
                        onChange={(e) => setFormData(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                        className="w-full bg-white border border-neutral-300 rounded-lg p-2 outline-none font-bold"
                      />
                    </div>
                  )}

                  {formData.type === 'FREE_GIFT' && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Gift Item Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Leather Shoe Cleaner Kit"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-white border border-neutral-300 rounded-lg p-2 outline-none font-bold"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {formData.type === 'PERCENTAGE' && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Cap Max Discount (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 500 (0 for no cap)"
                        value={formData.maxDiscount || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: Number(e.target.value) }))}
                        className="w-full bg-white border border-neutral-300 rounded-lg p-2 outline-none font-semibold"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Global Usage Limit</label>
                    <input
                      type="number"
                      placeholder="e.g. 100 (0 for unlimited)"
                      value={formData.usageLimit || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: Number(e.target.value) }))}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Limit Per Customer</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 1"
                      value={formData.perCustomerLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, perCustomerLimit: Number(e.target.value) }))}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 outline-none font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Start Active Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">End Expiry Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Cart Threshold Limits & Specific Product Rules */}
              <div className="space-y-3.5 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                <h4 className="font-bold text-neutral-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-full inline-block" />
                  Cart Subtotal Thresholds
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Min Order Subtotal (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 999 (0 for no minimum)"
                      value={formData.minOrderAmount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Max Order Subtotal (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000 (0 for no maximum)"
                      value={formData.maxOrderAmount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxOrderAmount: Number(e.target.value) }))}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 outline-none font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Granular Restrictions */}
              <div className="space-y-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-neutral-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-rose-500 rounded-full inline-block" />
                    Product & Catalog Eligibility Rules
                  </h4>
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                    Smart Lock Enabled
                  </span>
                </div>

                {/* Scope selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1.5">Eligibility Category Scope</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'ALL', label: 'All Products' },
                      { key: 'COLLECTIONS', label: 'Collections (Gender)' },
                      { key: 'CATEGORIES', label: 'Sub-Categories' },
                      { key: 'BRANDS', label: 'Specific Brands' },
                      { key: 'PRODUCTS', label: 'Specific Products' },
                      { key: 'TRENDING', label: 'Trending Items Only' },
                      { key: 'FEATURED', label: 'Featured Items Only' },
                      { key: 'BEST_SELLER', label: 'Best Sellers Only' }
                    ].map(scope => (
                      <button
                        key={scope.key}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, restrictType: scope.key as any }))}
                        className={`py-2 px-2.5 rounded-xl text-center border font-bold transition-all ${
                          formData.restrictType === scope.key
                            ? 'bg-[#0B8F63] text-white border-[#0B8F63] shadow-sm'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        {scope.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Eligibility Lists */}
                {formData.restrictType === 'COLLECTIONS' && (
                  <div className="bg-white p-3.5 rounded-xl border border-neutral-200 space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-neutral-500">Select Eligible Collections</label>
                    <div className="flex flex-wrap gap-2">
                      {['men', 'women', 'kids'].map(col => {
                        const isSelected = formData.restrictCollections.includes(col);
                        return (
                          <button
                            key={col}
                            type="button"
                            onClick={() => handleToggleRestrictionListItem('restrictCollections', col)}
                            className={`px-3 py-1.5 rounded-lg border text-xs uppercase font-extrabold transition-all ${
                              isSelected
                                ? 'bg-[#0B8F63] text-white border-[#0B8F63]'
                                : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                            }`}
                          >
                            {col === 'men' ? "Men's Collection" : col === 'women' ? "Women's Collection" : "Kids Collection"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {formData.restrictType === 'CATEGORIES' && (
                  <div className="bg-white p-3.5 rounded-xl border border-neutral-200 space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-neutral-500">Select Eligible Sub-categories</label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                      {uniqueSubcategories.map(sub => {
                        const isSelected = formData.restrictCategories.includes(sub);
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => handleToggleRestrictionListItem('restrictCategories', sub)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-[#0B8F63] text-white border-[#0B8F63]'
                                : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                            }`}
                          >
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {formData.restrictType === 'BRANDS' && (
                  <div className="bg-white p-3.5 rounded-xl border border-neutral-200 space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-neutral-500">Select Eligible Brands</label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                      {uniqueBrands.map(b => {
                        const isSelected = formData.restrictBrands.includes(b);
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => handleToggleRestrictionListItem('restrictBrands', b)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-[#0B8F63] text-white border-[#0B8F63]'
                                : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                            }`}
                          >
                            {b}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {formData.restrictType === 'PRODUCTS' && (
                  <div className="bg-white p-3.5 rounded-xl border border-neutral-200 space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-neutral-500">Select Eligible Products</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-1 border border-neutral-100 rounded-lg">
                      {products.map(p => {
                        const isSelected = formData.restrictProductIds.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleToggleRestrictionListItem('restrictProductIds', p.id)}
                            className={`p-2 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                              isSelected
                                ? 'bg-[#0B8F63]/10 border-[#0B8F63] text-[#0B8F63]'
                                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                            }`}
                          >
                            <img src={p.images[0]} className="w-6 h-6 rounded object-cover shrink-0" />
                            <div className="truncate text-[10px] font-bold">
                              <div>{p.name}</div>
                              <div className="text-[9px] text-neutral-400 font-normal">₹{p.price} • {p.category}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dynamic Attributes: Sizes and Colors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-neutral-200">
                  <div className="bg-white p-3 rounded-xl border border-neutral-200 space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-neutral-500">Restrict by Size (Optional)</label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {uniqueSizes.map(size => {
                        const isSelected = formData.restrictSizes.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleToggleRestrictionListItem('restrictSizes', size)}
                            className={`px-2 py-1 rounded border text-[10px] font-extrabold transition-all min-w-8 text-center ${
                              isSelected
                                ? 'bg-[#0B8F63] text-white border-[#0B8F63]'
                                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                            }`}
                          >
                            Size {size}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[9px] text-neutral-400">If selected, coupon applies only if item has specified size selected.</p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-neutral-200 space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-neutral-500">Restrict by Color (Optional)</label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {uniqueColors.map(color => {
                        const isSelected = formData.restrictColors.includes(color);
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => handleToggleRestrictionListItem('restrictColors', color)}
                            className={`px-2.5 py-1 rounded border text-[10px] font-bold transition-all ${
                              isSelected
                                ? 'bg-[#0B8F63] text-white border-[#0B8F63]'
                                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[9px] text-neutral-400">If selected, coupon applies only if item matches specified colors.</p>
                  </div>
                </div>

                {/* Additional filters: price per product, stock condition */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-neutral-200">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Eligible Product Price Range</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min (₹)"
                        value={formData.minProductPrice || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, minProductPrice: Number(e.target.value) }))}
                        className="w-1/2 bg-white border border-neutral-300 rounded-lg p-2 outline-none font-semibold"
                      />
                      <span className="text-neutral-400 font-extrabold">-</span>
                      <input
                        type="number"
                        placeholder="Max (₹)"
                        value={formData.maxProductPrice || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxProductPrice: Number(e.target.value) }))}
                        className="w-1/2 bg-white border border-neutral-300 rounded-lg p-2 outline-none font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Inventory / Stock Condition</label>
                    <select
                      value={formData.restrictStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, restrictStock: e.target.value as any }))}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-bold outline-none"
                    >
                      <option value="ALL">Apply On All Inventory (No Restrictions)</option>
                      <option value="IN_STOCK">In-Stock Footwear Only</option>
                      <option value="LOW_STOCK">Limited Stock (Clearance/Hype Products)</option>
                      <option value="NEW_ARRIVALS">New Arrivals Only</option>
                      <option value="FEATURED">Featured Footwear Only</option>
                      <option value="CLEARANCE_SALE">Clearance Sale Items (Deducted Items)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold px-4 py-2.5 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingId ? 'Save Campaign Changes' : 'Create Live Campaign'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- PREVIEW TICKET MODAL ----------------- */}
      {previewCoupon && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={() => setPreviewCoupon(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-100 z-10 animate-in zoom-in-95 duration-200">
            {/* Coupon Ribbon Header */}
            <div className="bg-[#121816] p-4 text-center border-b border-white/10 relative">
              <span className="absolute top-3 left-3 text-[8px] uppercase font-mono tracking-widest text-[#0B8F63] font-bold">
                Verification Ticket
              </span>
              <Ticket className="w-10 h-10 text-[#0B8F63] mx-auto mb-2" />
              <h3 className="font-serif-heading font-extrabold text-white text-base">
                {previewCoupon.name}
              </h3>
              <p className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wider font-mono">
                {previewCoupon.code}
              </p>
            </div>

            {/* Ticket Cutout Border */}
            <div className="flex items-center justify-between -mx-3 my-0">
              <div className="w-6 h-6 rounded-full bg-neutral-900 shadow-inner" />
              <div className="flex-1 border-t-2 border-dashed border-neutral-200" />
              <div className="w-6 h-6 rounded-full bg-neutral-900 shadow-inner" />
            </div>

            {/* Content Details */}
            <div className="p-5 space-y-4 text-xs font-medium text-neutral-700">
              <div className="text-center font-bold text-neutral-900 bg-neutral-50 border border-neutral-200/60 rounded-xl p-3">
                <div className="text-[10px] text-neutral-400 uppercase tracking-widest">Promotion Value</div>
                <div className="text-2xl font-serif-heading font-extrabold text-[#0B8F63] mt-1">
                  {previewCoupon.type === 'PERCENTAGE' && `${previewCoupon.discountValue}% Off`}
                  {previewCoupon.type === 'FLAT' && `₹${previewCoupon.discountValue} Off`}
                  {previewCoupon.type === 'BUY_X_GET_Y' && `Buy ${previewCoupon.discountValue} Get 1 Free`}
                  {previewCoupon.type === 'FREE_SHIPPING' && 'Free Delivery'}
                  {previewCoupon.type === 'FREE_GIFT' && `Free Gift: ${previewCoupon.description || 'Special Present'}`}
                </div>
                <div className="text-[10px] text-neutral-400 font-bold mt-1">
                  Priority Index: {previewCoupon.priority || 1} • {previewCoupon.visibility === 'public' ? 'Public' : 'Hidden'} Campaign
                </div>
              </div>

              {/* Restrictions Information Box */}
              <div className="space-y-2.5">
                <div className="font-extrabold uppercase text-[10px] tracking-wider text-neutral-500">Eligibility Terms & Conditions</div>
                <div className="bg-[#F8FAFC] border border-neutral-200 p-3.5 rounded-xl space-y-2 text-[11px] text-neutral-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      {previewCoupon.minOrderAmount 
                        ? `Valid on subtotals starting from ₹${previewCoupon.minOrderAmount}` 
                        : 'No minimum subtotal requirement'}
                    </span>
                  </div>

                  {previewCoupon.maxDiscount && (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Maximum eligible discount capped at ₹{previewCoupon.maxDiscount}</span>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B8F63] shrink-0 mt-0.5" />
                    <span>
                      {previewCoupon.restrictType === 'ALL' && 'Applies to entire footwears catalog'}
                      {previewCoupon.restrictType === 'COLLECTIONS' && `Only eligible on collections: ${previewCoupon.restrictCollections?.join(', ').toUpperCase()}`}
                      {previewCoupon.restrictType === 'CATEGORIES' && `Only eligible on categories: ${previewCoupon.restrictCategories?.join(', ').toUpperCase()}`}
                      {previewCoupon.restrictType === 'BRANDS' && `Only eligible on brands: ${previewCoupon.restrictBrands?.join(', ').toUpperCase()}`}
                      {previewCoupon.restrictType === 'PRODUCTS' && 'Only eligible on specifically selected product models'}
                      {previewCoupon.restrictType === 'TRENDING' && 'Valid exclusively on trending catalog models'}
                      {previewCoupon.restrictType === 'FEATURED' && 'Valid exclusively on featured models'}
                      {previewCoupon.restrictType === 'BEST_SELLER' && 'Valid exclusively on best seller footwear'}
                    </span>
                  </div>

                  {(previewCoupon.restrictSizes?.length || 0) > 0 && (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0B8F63] shrink-0 mt-0.5" />
                      <span>Works only on selected sizes: {previewCoupon.restrictSizes?.join(', ')}</span>
                    </div>
                  )}

                  {(previewCoupon.restrictColors?.length || 0) > 0 && (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0B8F63] shrink-0 mt-0.5" />
                      <span>Works only on color variants: {previewCoupon.restrictColors?.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status and limits metrics */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="border border-neutral-200/80 p-2 rounded-xl">
                  <div className="text-[8px] text-neutral-400 uppercase">Usage Quota</div>
                  <div className="font-extrabold text-neutral-800 text-sm mt-0.5">
                    {previewCoupon.usageCount || 0} / {previewCoupon.usageLimit || '∞'}
                  </div>
                </div>

                <div className="border border-neutral-200/80 p-2 rounded-xl">
                  <div className="text-[8px] text-neutral-400 uppercase">Revenue Driven</div>
                  <div className="font-extrabold text-[#0B8F63] text-sm mt-0.5">
                    ₹{(previewCoupon.revenueGenerated || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-center shrink-0">
              <button
                type="button"
                onClick={() => setPreviewCoupon(null)}
                className="bg-[#121816] hover:bg-[#0B8F63] text-white text-xs font-extrabold px-6 py-2 rounded-xl transition-all"
              >
                Close Preview Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
