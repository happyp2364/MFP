import React, { useState } from 'react';
import {
  Save, Plus, Trash2, Settings, AlertTriangle, Zap, Calendar,
  Clock, Package, ArrowRight, TrendingUp, Power, Copy, Star, Pin, Edit, Pause, Play
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { FlashDeal } from '../../types';

export const FlashDealSettingsView: React.FC = () => {
  const { flashDeals, addFlashDeal, updateFlashDeal, deleteFlashDeal, products, flashDealConfig, updateFlashDealConfig } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<FlashDeal | null>(null);
  const [newDeal, setNewDeal] = useState<Omit<FlashDeal, 'id' | 'analytics'>>({
    title: '',
    status: 'active',
    targetType: 'PRODUCTS',
    targetIds: [],
    discountType: 'PERCENTAGE',
    discountValue: 20,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 3600000 * 24).toISOString(),
    timezone: 'Asia/Kolkata',
    showCountdown: true,
    countdownFormat: { days: true, hours: true, minutes: true, seconds: true },
    hideAfterExpiry: true,
    autoStart: true,
    autoStop: true,
    lowStockMessageEnabled: true,
    lowStockThreshold: 5,
    scarcityMessageTemplate: 'Only {count} Left',
    scarcityStyling: { textColor: '#FFFFFF', bgColor: '#DC2626', icon: 'zap', animation: 'pulse' },
    displayLocations: ['homepage_hero', 'product_page'],
    styling: {
      bgColor: '#FFFFFF',
      textColor: '#111827',
      animation: 'pulse',
      countdownTheme: 'bold',
      glowEffect: true,
    }
  });

  const handleCreateOrUpdate = async () => {
    if (!newDeal.targetIds || newDeal.targetIds.length === 0 || !newDeal.title) {
      alert('Fill all required fields (Title and at least one Product)');
      return;
    }
    if (editingDeal) {
      await updateFlashDeal(editingDeal.id, newDeal);
    } else {
      await addFlashDeal(newDeal);
    }
    setShowAddModal(false);
    setEditingDeal(null);
  };

  const handleDuplicate = async (deal: FlashDeal) => {
    const duplicatedDeal = { ...deal, title: `${deal.title} (Copy)`, status: 'paused' as const };
    const { id, analytics, ...dealData } = duplicatedDeal;
    await addFlashDeal(dealData);
  };

  const getProduct = (id: string) => products.find(p => p.id === id);

  return (
    <div className="space-y-6">
      {/* Master Control */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-serif-heading font-bold text-lg text-neutral-800">Flash Deals Master Control</h3>
          </div>
          <p className="text-xs text-neutral-500">
            {flashDealConfig?.masterEnabled ? 'Flash deals are currently ACTIVE on the website.' : 'Flash deals are currently DISABLED.'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <span className={`text-sm font-bold ${flashDealConfig?.masterEnabled ? 'text-emerald-600' : 'text-neutral-500'}`}>
              {flashDealConfig?.masterEnabled ? 'System Enabled' : 'System Disabled'}
            </span>
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${flashDealConfig?.masterEnabled ? 'bg-emerald-500' : 'bg-neutral-300'}`}>
              <input
                type="checkbox"
                className="sr-only"
                checked={flashDealConfig?.masterEnabled || false}
                onChange={(e) => updateFlashDealConfig({ masterEnabled: e.target.checked })}
              />
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${flashDealConfig?.masterEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </label>
          <button
            onClick={() => {
              setEditingDeal(null);
              setNewDeal({
                title: '', status: 'active', targetType: 'PRODUCTS', targetIds: [], discountType: 'PERCENTAGE', discountValue: 20,
                startDate: new Date().toISOString(), endDate: new Date(Date.now() + 3600000 * 24).toISOString(), timezone: 'Asia/Kolkata',
                showCountdown: true, countdownFormat: { days: true, hours: true, minutes: true, seconds: true }, hideAfterExpiry: true,
                autoStart: true, autoStop: true, lowStockMessageEnabled: true, lowStockThreshold: 5, scarcityMessageTemplate: 'Only {count} Left',
                scarcityStyling: { textColor: '#FFFFFF', bgColor: '#DC2626', icon: 'zap', animation: 'pulse' },
                displayLocations: ['homepage_hero', 'product_page'], styling: { bgColor: '#FFFFFF', textColor: '#111827', animation: 'pulse', countdownTheme: 'bold', glowEffect: true }
              });
              setShowAddModal(true);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Flash Deal</span>
          </button>
        </div>
      </div>

      {/* Deals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {flashDeals.map((deal) => {
          const product = getProduct(deal.targetIds?.[0] || '');
          const isActive = deal.status === 'active';
          
          return (
            <div key={deal.id} className={`bg-white rounded-2xl border ${isActive ? 'border-orange-200 shadow-orange-100/50' : 'border-neutral-200'} shadow-sm overflow-hidden group`}>
              <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    deal.status === 'active' ? 'bg-emerald-500 animate-pulse' : 
                    deal.status === 'paused' ? 'bg-amber-500' :
                    deal.status === 'scheduled' ? 'bg-blue-500' :
                    deal.status === 'expired' ? 'bg-neutral-500' : 'bg-rose-500'
                  }`} />
                  <span className="text-xs font-bold text-neutral-800">{deal.title}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                    deal.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                    deal.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                    deal.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    deal.status === 'expired' ? 'bg-neutral-100 text-neutral-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {deal.status.toUpperCase()}
                  </span>
                  {deal.isFeatured && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                  {deal.isPinned && <Pin className="w-3 h-3 text-blue-500 fill-current" />}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {deal.status === 'active' ? (
                    <>
                      <button onClick={() => updateFlashDeal(deal.id, { status: 'paused' })} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Pause"><Pause className="w-4 h-4" /></button>
                      <button onClick={() => updateFlashDeal(deal.id, { status: 'disabled' })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Disable"><Power className="w-4 h-4" /></button>
                    </>
                  ) : deal.status === 'paused' ? (
                    <button onClick={() => updateFlashDeal(deal.id, { status: 'active' })} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Resume"><Play className="w-4 h-4" /></button>
                  ) : (
                    <button onClick={() => updateFlashDeal(deal.id, { status: 'active' })} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Enable"><Power className="w-4 h-4" /></button>
                  )}
                  <button onClick={() => updateFlashDeal(deal.id, { status: 'scheduled' })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Schedule"><Calendar className="w-4 h-4" /></button>
                  <button onClick={() => updateFlashDeal(deal.id, { isFeatured: !deal.isFeatured })} className={`p-1.5 ${deal.isFeatured ? 'text-yellow-600 bg-yellow-50' : 'text-neutral-400 hover:text-yellow-600 hover:bg-yellow-50'} rounded-lg transition-colors`} title="Feature"><Star className="w-4 h-4" /></button>
                  <button onClick={() => updateFlashDeal(deal.id, { isPinned: !deal.isPinned })} className={`p-1.5 ${deal.isPinned ? 'text-blue-600 bg-blue-50' : 'text-neutral-400 hover:text-blue-600 hover:bg-blue-50'} rounded-lg transition-colors`} title="Pin"><Pin className="w-4 h-4" /></button>
                  
                  <div className="w-px h-4 bg-neutral-200 mx-1" />
                  
                  <button onClick={() => { setEditingDeal(deal); setNewDeal(deal as any); setShowAddModal(true); }} className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDuplicate(deal)} className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors" title="Duplicate"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => deleteFlashDeal(deal.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {product && (
                  <div className="flex gap-4">
                    <img src={product.images[0]} alt={product.name} className="w-16 h-16 rounded-xl object-cover border border-neutral-100" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-neutral-800 truncate">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-neutral-400 line-through">₹{product.price}</span>
                        <span className="text-sm font-bold text-orange-600">
                          ₹{deal.discountType === 'PERCENTAGE' ? Math.round(product.price * (1 - deal.discountValue / 100)) : product.price - deal.discountValue}
                        </span>
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-bold">
                          {deal.discountType === 'PERCENTAGE' ? `${deal.discountValue}% OFF` : `₹${deal.discountValue} OFF`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Stock Threshold</p>
                    <div className="flex items-end justify-between mt-1">
                      <span className="text-lg font-bold text-neutral-800">{deal.lowStockThreshold}</span>
                      <Package className="w-4 h-4 text-neutral-300" />
                    </div>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Revenue</p>
                    <div className="flex items-end justify-between mt-1">
                      <span className="text-lg font-bold text-neutral-800">₹{deal.analytics?.revenue || 0}</span>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Ends: {new Date(deal.endDate).toLocaleDateString()} at {new Date(deal.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" /> {deal.analytics?.clicks || 0} Clicks</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg p-6 z-10 overflow-y-auto max-h-[90vh]">
            <h4 className="font-bold text-lg text-neutral-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              Configure Flash Deal
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Deal Title</label>
                <input
                  type="text"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-orange-500"
                  placeholder="e.g. Midnight Madness Sale"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Select Product</label>
                <select
                  value={newDeal.targetIds?.[0] || ''}
                  onChange={(e) => {
                    setNewDeal(prev => ({ 
                      ...prev, 
                      targetIds: [e.target.value]
                    }));
                  }}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-orange-500"
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Discount Type</label>
                  <select
                    value={newDeal.discountType}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, discountType: e.target.value as 'PERCENTAGE' | 'FLAT' }))}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={newDeal.discountValue}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-orange-500 font-bold text-orange-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newDeal.startDate.slice(0, 16)}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, startDate: new Date(e.target.value).toISOString() }))}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newDeal.endDate.slice(0, 16)}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, endDate: new Date(e.target.value).toISOString() }))}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDeal.showCountdown}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, showCountdown: e.target.checked }))}
                    className="rounded border-neutral-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-xs font-bold text-neutral-700">Display Live Countdown Timer</span>
                </label>
                {newDeal.showCountdown && (
                  <div className="pl-6 grid grid-cols-2 gap-2 text-xs text-neutral-600">
                    <label className="flex items-center gap-1"><input type="checkbox" checked={newDeal.countdownFormat?.days} onChange={e => setNewDeal(p => ({ ...p, countdownFormat: { ...p.countdownFormat, days: e.target.checked } }))} /> Days</label>
                    <label className="flex items-center gap-1"><input type="checkbox" checked={newDeal.countdownFormat?.hours} onChange={e => setNewDeal(p => ({ ...p, countdownFormat: { ...p.countdownFormat, hours: e.target.checked } }))} /> Hours</label>
                    <label className="flex items-center gap-1"><input type="checkbox" checked={newDeal.countdownFormat?.minutes} onChange={e => setNewDeal(p => ({ ...p, countdownFormat: { ...p.countdownFormat, minutes: e.target.checked } }))} /> Minutes</label>
                    <label className="flex items-center gap-1"><input type="checkbox" checked={newDeal.countdownFormat?.seconds} onChange={e => setNewDeal(p => ({ ...p, countdownFormat: { ...p.countdownFormat, seconds: e.target.checked } }))} /> Seconds</label>
                    
                    <label className="flex items-center gap-1 col-span-2 mt-1"><input type="checkbox" checked={newDeal.hideAfterExpiry} onChange={e => setNewDeal(p => ({ ...p, hideAfterExpiry: e.target.checked }))} /> Auto Hide After Expiry</label>
                    <label className="flex items-center gap-1 col-span-2"><input type="checkbox" checked={newDeal.autoStart} onChange={e => setNewDeal(p => ({ ...p, autoStart: e.target.checked }))} /> Auto Start (Activates on start date)</label>
                    <label className="flex items-center gap-1 col-span-2"><input type="checkbox" checked={newDeal.autoStop} onChange={e => setNewDeal(p => ({ ...p, autoStop: e.target.checked }))} /> Auto Stop (Pauses on end date)</label>
                  </div>
                )}
                
                <label className="flex items-center gap-2 cursor-pointer mt-3">
                  <input
                    type="checkbox"
                    checked={newDeal.lowStockMessageEnabled}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, lowStockMessageEnabled: e.target.checked }))}
                    className="rounded border-neutral-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-xs font-bold text-neutral-700">Display Live Scarcity / Low Stock Warning</span>
                </label>
                {newDeal.lowStockMessageEnabled && (
                  <div className="pl-6 space-y-3 pt-1">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Message Template</label>
                      <select
                        value={newDeal.scarcityMessageTemplate || 'Only {count} Left'}
                        onChange={e => setNewDeal(p => ({ ...p, scarcityMessageTemplate: e.target.value }))}
                        className="w-full text-xs border border-neutral-300 rounded-lg p-1.5 focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="Only {count} Left">Only {'{count}'} Left</option>
                        <option value="Selling Fast">Selling Fast</option>
                        <option value="Limited Stock">Limited Stock</option>
                        <option value="Only {count} Pairs Left">Only {'{count}'} Pairs Left</option>
                        <option value="Offer Ends Soon">Offer Ends Soon</option>
                        <option value="custom">Custom Message...</option>
                      </select>
                      {newDeal.scarcityMessageTemplate === 'custom' && (
                        <input type="text" value={newDeal.lowStockCustomMessage || ''} onChange={e => setNewDeal(p => ({ ...p, lowStockCustomMessage: e.target.value }))} placeholder="Custom message (use {count} for stock)" className="w-full text-xs border border-neutral-300 rounded-lg p-1.5 mt-1 focus:ring-1 focus:ring-orange-500" />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Stock Threshold</label>
                        <input type="number" value={newDeal.lowStockThreshold} onChange={e => setNewDeal(p => ({ ...p, lowStockThreshold: Number(e.target.value) }))} className="w-full text-xs border border-neutral-300 rounded-lg p-1.5 focus:ring-1 focus:ring-orange-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Animation</label>
                        <select value={newDeal.scarcityStyling?.animation || 'pulse'} onChange={e => setNewDeal(p => ({ ...p, scarcityStyling: { ...(p.scarcityStyling || { textColor: '', bgColor: '', icon: '' }), animation: e.target.value as any } }))} className="w-full text-xs border border-neutral-300 rounded-lg p-1.5 focus:ring-1 focus:ring-orange-500">
                          <option value="none">None</option>
                          <option value="pulse">Pulse</option>
                          <option value="glow">Glow</option>
                          <option value="bounce">Bounce</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                         <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Text Color</label>
                         <input type="color" value={newDeal.scarcityStyling?.textColor || '#FFFFFF'} onChange={e => setNewDeal(p => ({ ...p, scarcityStyling: { ...(p.scarcityStyling || { bgColor: '', icon: '', animation: 'pulse' }), textColor: e.target.value } }))} className="w-full h-8 cursor-pointer rounded border border-neutral-300" />
                      </div>
                      <div>
                         <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Background Color</label>
                         <input type="color" value={newDeal.scarcityStyling?.bgColor || '#DC2626'} onChange={e => setNewDeal(p => ({ ...p, scarcityStyling: { ...(p.scarcityStyling || { textColor: '', icon: '', animation: 'pulse' }), bgColor: e.target.value } }))} className="w-full h-8 cursor-pointer rounded border border-neutral-300" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="pt-3 border-t border-neutral-100">
                  <label className="block text-[11px] font-bold text-neutral-600 mb-2">Display Locations</label>
                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-700">
                    {['homepage', 'homepage_hero', 'product_page', 'category_page', 'search_results', 'cart', 'checkout', 'announcement_bar', 'popup', 'floating_banner'].map(loc => (
                      <label key={loc} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={newDeal.displayLocations.includes(loc as any)}
                          onChange={e => {
                            if (e.target.checked) setNewDeal(p => ({ ...p, displayLocations: [...p.displayLocations, loc as any] }));
                            else setNewDeal(p => ({ ...p, displayLocations: p.displayLocations.filter(l => l !== loc) }));
                          }}
                        />
                        {loc.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-neutral-100">
                <button
                  onClick={() => { setShowAddModal(false); setEditingDeal(null); }}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs py-2 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrUpdate}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2 rounded-xl shadow-lg shadow-orange-100 transition-all"
                >
                  {editingDeal ? 'Update Deal' : 'Launch Deal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
