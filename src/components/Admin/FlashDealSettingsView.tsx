import React, { useState } from 'react';
import {
  Save,
  Plus,
  Trash2,
  Settings,
  AlertTriangle,
  Zap,
  Calendar,
  Clock,
  Package,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { FlashDeal } from '../../types';

export const FlashDealSettingsView: React.FC = () => {
  const { flashDeals, addFlashDeal, updateFlashDeal, deleteFlashDeal, products } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeal, setNewDeal] = useState<Omit<FlashDeal, 'id' | 'analytics'>>({
    title: '',
    productId: '',
    discountPrice: 0,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    stockLimit: 10,
    active: true,
    showCountdown: true,
    showLowStockMessage: true,
    lowStockThreshold: 5,
  });

  const handleCreate = async () => {
    if (!newDeal.productId || !newDeal.title) {
      alert('Fill all required fields');
      return;
    }
    await addFlashDeal(newDeal);
    setShowAddModal(false);
  };

  const getProduct = (id: string) => products.find(p => p.id === id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-serif-heading font-bold text-lg text-neutral-800">Flash Deals & Live Scarcity</h3>
          </div>
          <p className="text-xs text-neutral-500">
            Create high-urgency limited time offers with live countdowns and stock counters.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Flash Deal</span>
        </button>
      </div>

      {/* Deals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {flashDeals.map((deal) => {
          const product = getProduct(deal.productId);
          return (
            <div key={deal.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden group">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${deal.active ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-300'}`} />
                  <span className="text-xs font-bold text-neutral-800">{deal.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => updateFlashDeal(deal.id, { active: !deal.active })}
                    className={`p-1.5 rounded-lg transition-colors ${deal.active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteFlashDeal(deal.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {product && (
                  <div className="flex gap-4">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-16 h-16 rounded-xl object-cover border border-neutral-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-neutral-800 truncate">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-neutral-400 line-through">₹{product.price}</span>
                        <span className="text-sm font-bold text-orange-600">₹{deal.discountPrice}</span>
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-bold">
                          {Math.round(((product.price - deal.discountPrice) / product.price) * 100)}% OFF
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Stock Remaining</p>
                    <div className="flex items-end justify-between mt-1">
                      <span className="text-lg font-bold text-neutral-800">{deal.stockLimit}</span>
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
                    <span>Ends: {new Date(deal.endTime).toLocaleDateString()} at {new Date(deal.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                  value={newDeal.productId}
                  onChange={(e) => {
                    const p = getProduct(e.target.value);
                    setNewDeal(prev => ({ 
                      ...prev, 
                      productId: e.target.value,
                      discountPrice: p ? Math.round(p.price * 0.8) : 0 
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
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Flash Price (₹)</label>
                  <input
                    type="number"
                    value={newDeal.discountPrice}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, discountPrice: Number(e.target.value) }))}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-orange-500 font-bold text-orange-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Flash Stock Limit</label>
                  <input
                    type="number"
                    value={newDeal.stockLimit}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, stockLimit: Number(e.target.value) }))}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newDeal.startTime.slice(0, 16)}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, startTime: new Date(e.target.value).toISOString() }))}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newDeal.endTime.slice(0, 16)}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, endTime: new Date(e.target.value).toISOString() }))}
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
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDeal.showLowStockMessage}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, showLowStockMessage: e.target.checked }))}
                    className="rounded border-neutral-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-xs font-bold text-neutral-700">Display "Low Stock" Warning</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4 border-t border-neutral-100">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs py-2 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2 rounded-xl shadow-lg shadow-orange-100 transition-all"
                >
                  Launch Deal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
