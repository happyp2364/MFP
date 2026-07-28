import React, { useState } from 'react';
import {
  Sparkles,
  Save,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Settings,
  Percent,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Info,
  Gift,
  MousePointer2,
  Layout,
  Users,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { LuckyBoxConfig, LuckyBoxReward, CouponType } from '../../types';

export const LuckyBoxSettingsView: React.FC = () => {
  const { luckyBoxConfig, updateLuckyBoxConfig, coupons } = useStore();

  const [config, setConfig] = useState<LuckyBoxConfig>({ ...luckyBoxConfig });
  const [isSaving, setIsSaving] = useState(false);

  // Rewards list form state
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [rewardForm, setRewardForm] = useState<LuckyBoxReward>({
    id: '',
    title: '',
    type: 'PERCENTAGE',
    value: 10,
    probability: 20,
    usageLimit: 100,
    usageCount: 0,
    perCustomerLimit: 1,
    couponCode: '',
  });

  const [showRewardForm, setShowRewardForm] = useState(false);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    const success = await updateLuckyBoxConfig(config);
    setIsSaving(false);
  };

  const handleToggle = (field: keyof Omit<LuckyBoxConfig, 'rewards' | 'dailyLimit' | 'perCustomerLimit' | 'globalUsageLimit' | 'minCartValue'>) => {
    setConfig((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleTextChange = (field: keyof LuckyBoxConfig, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveReward = () => {
    if (!rewardForm.title) {
      alert('Please provide a reward title');
      return;
    }

    if (rewardForm.type !== 'BETTER_LUCK' && rewardForm.type !== 'GIFT' && !rewardForm.couponCode) {
      alert('Please specify a Coupon Code for discount rewards');
      return;
    }

    let updatedRewards = [...config.rewards];
    if (editingRewardId) {
      updatedRewards = updatedRewards.map((r) => (r.id === editingRewardId ? rewardForm : r));
    } else {
      const newReward = {
        ...rewardForm,
        id: `lb-${Date.now()}`,
        usageCount: 0,
      };
      updatedRewards.push(newReward);
    }

    setConfig((prev) => ({
      ...prev,
      rewards: updatedRewards,
    }));

    setShowRewardForm(false);
    setEditingRewardId(null);
  };

  const handleDeleteReward = (id: string) => {
    if (confirm('Are you sure you want to delete this reward?')) {
      setConfig((prev) => ({
        ...prev,
        rewards: prev.rewards.filter((r) => r.id !== id),
      }));
    }
  };

  const handleOpenEditReward = (reward: LuckyBoxReward) => {
    setEditingRewardId(reward.id);
    setRewardForm({ ...reward });
    setShowRewardForm(true);
  };

  const handleOpenAddReward = () => {
    setEditingRewardId(null);
    setRewardForm({
      id: '',
      title: '',
      type: 'PERCENTAGE',
      value: 10,
      probability: 10,
      usageLimit: 100,
      usageCount: 0,
      perCustomerLimit: 1,
      couponCode: '',
    });
    setShowRewardForm(true);
  };

  // Calculate sum of probabilities
  const probabilitySum = config.rewards.reduce((sum, r) => sum + Number(r.probability || 0), 0);

  return (
    <div className="space-y-6" id="luckybox-settings-root">
      {/* Overview and Main Toggle */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Gift className="w-5 h-5" />
            </div>
            <h3 className="font-serif-heading font-bold text-lg text-neutral-800">Premium Lucky Box Reward System</h3>
          </div>
          <p className="text-xs text-neutral-500">
            Boost customer engagement with a high-end gamified reward box. Real-time probability management and page-specific targeting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {config.permanentlyDisabled ? (
            <span className="px-3 py-1 bg-neutral-100 text-neutral-500 rounded-full text-xs font-bold border border-neutral-200">
              ⛔ Permanently Disabled
            </span>
          ) : (
            <button
              onClick={() => handleToggle('enabled')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                config.enabled ? 'bg-indigo-600' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  config.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          )}

          <button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Parameters & Placement */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Placement Pages */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-neutral-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-neutral-100">
              <Layout className="w-4 h-4 text-indigo-600" />
              Target Placement Pages
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={config.showOnHomepage}
                  onChange={() => handleToggle('showOnHomepage')}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-xs font-bold text-neutral-800">Homepage</p>
                  <p className="text-[10px] text-neutral-500">Render on home page</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={config.showOnProductPage}
                  onChange={() => handleToggle('showOnProductPage')}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-xs font-bold text-neutral-800">Product Pages</p>
                  <p className="text-[10px] text-neutral-500">Render on every product</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={config.showOnCheckout}
                  onChange={() => handleToggle('showOnCheckout')}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-xs font-bold text-neutral-800">Checkout Page</p>
                  <p className="text-[10px] text-neutral-500">Last minute conversion nudge</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={config.showOnOrderSuccess}
                  onChange={() => handleToggle('showOnOrderSuccess')}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-xs font-bold text-neutral-800">Order Success Page</p>
                  <p className="text-[10px] text-neutral-500">Post-purchase celebration</p>
                </div>
              </label>
            </div>
          </div>

          {/* Usage Limits & Cart Criteria */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-neutral-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-neutral-100">
              <MousePointer2 className="w-4 h-4 text-indigo-600" />
              Usage Limits & Criteria
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Daily Lucky Box Limit (Global)</label>
                <input
                  type="number"
                  value={config.dailyLimit}
                  onChange={(e) => handleTextChange('dailyLimit', Number(e.target.value))}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Per Customer Lifetime Limit</label>
                <input
                  type="number"
                  value={config.perCustomerLimit}
                  onChange={(e) => handleTextChange('perCustomerLimit', Number(e.target.value))}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Global Total Limit (Permanent)</label>
                <input
                  type="number"
                  value={config.globalUsageLimit}
                  onChange={(e) => handleTextChange('globalUsageLimit', Number(e.target.value))}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Min. Cart Value for Eligibility (₹)</label>
                <input
                  type="number"
                  value={config.minCartValue}
                  onChange={(e) => handleTextChange('minCartValue', Number(e.target.value))}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Target Audiences & Danger Zone */}
        <div className="space-y-6">
          {/* Target Audience Segments */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-neutral-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-neutral-100">
              <Users className="w-4 h-4 text-indigo-600" />
              Target Audience
            </h4>

            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={config.firstVisitOnly}
                  onChange={() => handleToggle('firstVisitOnly')}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>First-time Visit only</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={config.firstOrderOnly}
                  onChange={() => handleToggle('firstOrderOnly')}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>First-time Order only</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={config.newCustomerOnly}
                  onChange={() => handleToggle('newCustomerOnly')}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>New Customers only</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={config.returningCustomerOnly}
                  onChange={() => handleToggle('returningCustomerOnly')}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Returning Customers only</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={config.festivalOnly}
                  onChange={() => handleToggle('festivalOnly')}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-bold text-orange-600">Active Festive Season Mode</span>
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-rose-50 rounded-2xl p-5 border border-rose-200 space-y-3">
            <div className="flex gap-2 text-rose-800">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <h5 className="font-bold text-xs">Kill Switch</h5>
                <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                  Permanently disable the Lucky Box module. This overrides all other settings.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggle('permanentlyDisabled')}
              className={`w-full text-xs font-bold py-2 px-3 rounded-lg border transition-colors ${
                config.permanentlyDisabled
                  ? 'bg-rose-100 border-rose-400 text-rose-900 hover:bg-rose-200'
                  : 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-700'
              }`}
            >
              {config.permanentlyDisabled ? 'Re-enable Lucky Box' : 'Permanently Kill Lucky Box'}
            </button>
          </div>
        </div>
      </div>

      {/* Rewards Configuration Section */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-neutral-100 pb-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-neutral-800">Lucky Box Rewards Inventory</h4>
            <p className="text-xs text-neutral-500">
              Define the contents of the box. Total probability must equal 100%.
            </p>
          </div>

          <button
            onClick={handleOpenAddReward}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Reward</span>
          </button>
        </div>

        {/* Probability verification */}
        {probabilitySum !== 100 ? (
          <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Probability Imbalance</p>
              <p className="mt-0.5">
                Total probability is <span className="font-extrabold">{probabilitySum}%</span>. It must be exactly 100% for the system to function correctly.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">System Balanced</p>
              <p className="mt-0.5">Total probability is 100%. The reward engine is ready.</p>
            </div>
          </div>
        )}

        {/* Rewards List */}
        <div className="overflow-x-auto border border-neutral-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Reward Title</th>
                <th className="p-3">Type</th>
                <th className="p-3">Value</th>
                <th className="p-3">Coupon Code</th>
                <th className="p-3">Probability</th>
                <th className="p-3">Usage</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {config.rewards.map((reward) => (
                <tr key={reward.id} className="hover:bg-neutral-50/50">
                  <td className="p-3 font-bold text-neutral-800">{reward.title}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      reward.type === 'BETTER_LUCK' ? 'bg-neutral-100 text-neutral-600' : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {reward.type}
                    </span>
                  </td>
                  <td className="p-3 text-neutral-700">
                    {reward.type === 'PERCENTAGE' ? `${reward.value}%` : reward.type === 'FLAT' ? `₹${reward.value}` : '-'}
                  </td>
                  <td className="p-3">
                    {reward.couponCode ? (
                      <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded font-bold">
                        {reward.couponCode}
                      </span>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="p-3 font-bold text-neutral-800">{reward.probability}%</td>
                  <td className="p-3 text-neutral-500">
                    {reward.usageCount || 0} / {reward.usageLimit || '∞'}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditReward(reward)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
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
      </div>

      {/* Reward Form Modal */}
      {showRewardForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-950/50 backdrop-blur-sm" onClick={() => setShowRewardForm(false)} />
          <div className="relative bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-md p-6 z-10 animate-in zoom-in-95 duration-150">
            <h4 className="font-serif-heading font-extrabold text-base text-neutral-800 mb-4 pb-2 border-b border-neutral-100">
              {editingRewardId ? 'Edit Lucky Reward' : 'Add New Lucky Reward'}
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Reward Title</label>
                <input
                  type="text"
                  value={rewardForm.title}
                  onChange={(e) => setRewardForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. ₹500 Mega Discount"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Reward Type</label>
                  <select
                    value={rewardForm.type}
                    onChange={(e) =>
                      setRewardForm((prev) => ({ ...prev, type: e.target.value as any }))
                    }
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="PERCENTAGE">Percentage OFF</option>
                    <option value="FLAT">Flat Discount</option>
                    <option value="FREE_SHIPPING">Free Shipping</option>
                    <option value="GIFT">Mystery Gift</option>
                    <option value="BETTER_LUCK">Better Luck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Value (₹ or %)</label>
                  <input
                    type="number"
                    value={rewardForm.value}
                    onChange={(e) => setRewardForm((prev) => ({ ...prev, value: Number(e.target.value) }))}
                    disabled={rewardForm.type === 'FREE_SHIPPING' || rewardForm.type === 'GIFT' || rewardForm.type === 'BETTER_LUCK'}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 disabled:bg-neutral-50 disabled:text-neutral-400"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={rewardForm.couponCode}
                    onChange={(e) => setRewardForm((prev) => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                    disabled={rewardForm.type === 'GIFT' || rewardForm.type === 'BETTER_LUCK'}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 font-mono text-indigo-600 uppercase"
                    placeholder="LUCKY50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Probability (%)</label>
                  <input
                    type="number"
                    value={rewardForm.probability}
                    onChange={(e) => setRewardForm((prev) => ({ ...prev, probability: Number(e.target.value) }))}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Global Usage Limit</label>
                  <input
                    type="number"
                    value={rewardForm.usageLimit}
                    onChange={(e) => setRewardForm((prev) => ({ ...prev, usageLimit: Number(e.target.value) }))}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Per Customer Limit</label>
                  <input
                    type="number"
                    value={rewardForm.perCustomerLimit}
                    onChange={(e) => setRewardForm((prev) => ({ ...prev, perCustomerLimit: Number(e.target.value) }))}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  onClick={() => setShowRewardForm(false)}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReward}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-indigo-200 transition-all"
                >
                  Save Reward
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
