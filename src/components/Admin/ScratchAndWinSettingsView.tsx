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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ScratchWinConfig, ScratchReward, CouponType } from '../../types';

export const ScratchAndWinSettingsView: React.FC = () => {
  const { scratchWinConfig, updateScratchWinConfig, coupons } = useStore();

  const [config, setConfig] = useState<ScratchWinConfig>({ ...scratchWinConfig });
  const [isSaving, setIsSaving] = useState(false);

  // Rewards list form state
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [rewardForm, setRewardForm] = useState<ScratchReward>({
    id: '',
    name: '',
    type: 'PERCENTAGE',
    value: 10,
    probability: 20,
    usageLimit: 100,
    usageCount: 0,
    perCustomerLimit: 1,
    enabled: true,
    expiryDate: '',
    couponCode: '',
  });

  const [showRewardForm, setShowRewardForm] = useState(false);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await updateScratchWinConfig(config);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (field: keyof Omit<ScratchWinConfig, 'rewards' | 'startDate' | 'endDate' | 'dailyActiveHoursStart' | 'dailyActiveHoursEnd' | 'minCartValue' | 'showAfterSeconds' | 'showAfterPageViews'>) => {
    setConfig((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleTextChange = (field: keyof ScratchWinConfig, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveReward = () => {
    if (!rewardForm.name) {
      alert('Please provide a reward name');
      return;
    }

    if (rewardForm.type !== 'NONE' && !rewardForm.couponCode) {
      alert('Please specify a Coupon Code for discount rewards');
      return;
    }

    let updatedRewards = [...config.rewards];
    if (editingRewardId) {
      updatedRewards = updatedRewards.map((r) => (r.id === editingRewardId ? rewardForm : r));
    } else {
      const newReward = {
        ...rewardForm,
        id: `reward-${Date.now()}`,
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

  const handleOpenEditReward = (reward: ScratchReward) => {
    setEditingRewardId(reward.id);
    setRewardForm({ ...reward });
    setShowRewardForm(true);
  };

  const handleOpenAddReward = () => {
    setEditingRewardId(null);
    setRewardForm({
      id: '',
      name: '',
      type: 'PERCENTAGE',
      value: 10,
      probability: 10,
      usageLimit: 100,
      usageCount: 0,
      perCustomerLimit: 1,
      enabled: true,
      expiryDate: '',
      couponCode: '',
    });
    setShowRewardForm(true);
  };

  // Calculate sum of probabilities
  const probabilitySum = config.rewards.reduce((sum, r) => sum + Number(r.probability || 0), 0);

  return (
    <div className="space-y-6" id="scratch-settings-root">
      {/* Overview and Main Toggle */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif-heading font-bold text-lg text-neutral-800">Scratch & Win Promotion Config</h3>
          </div>
          <p className="text-xs text-neutral-500">
            Offer engaging gamified rewards to visitors based on dynamic behavior, page views, and intent triggers.
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
                config.enabled ? 'bg-emerald-600' : 'bg-neutral-300'
              }`}
              id="scratch-toggle-btn"
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all shrink-0"
            id="scratch-save-btn"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Parameters & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scheduling & Core parameters */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-neutral-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-neutral-100">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Scheduling & Cart Criteria
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={config.startDate}
                  onChange={(e) => handleTextChange('startDate', e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={config.endDate}
                  onChange={(e) => handleTextChange('endDate', e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Daily Hours Start</label>
                <input
                  type="time"
                  value={config.dailyActiveHoursStart}
                  onChange={(e) => handleTextChange('dailyActiveHoursStart', e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Daily Hours End</label>
                <input
                  type="time"
                  value={config.dailyActiveHoursEnd}
                  onChange={(e) => handleTextChange('dailyActiveHoursEnd', e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Minimum Cart Value (₹)</label>
                <input
                  type="number"
                  value={config.minCartValue}
                  onChange={(e) => handleTextChange('minCartValue', Number(e.target.value))}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                  placeholder="0 means no minimum"
                />
              </div>
            </div>
          </div>

          {/* Trigger Constraints */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-neutral-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-neutral-100">
              <Clock className="w-4 h-4 text-emerald-600" />
              Intent & Behavior Triggers
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Show After X Seconds</label>
                <input
                  type="number"
                  value={config.showAfterSeconds}
                  onChange={(e) => handleTextChange('showAfterSeconds', Number(e.target.value))}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Show After X Page Views</label>
                <input
                  type="number"
                  value={config.showAfterPageViews}
                  onChange={(e) => handleTextChange('showAfterPageViews', Number(e.target.value))}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                  min="1"
                />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={config.showExitIntent}
                    onChange={() => handleToggle('showExitIntent')}
                    className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-neutral-700 font-bold">Trigger on Exit Intent</span>
                </label>
              </div>
            </div>
          </div>

          {/* Placement Settings */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-neutral-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-neutral-100">
              <Settings className="w-4 h-4 text-emerald-600" />
              Target Placement Pages
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showOnHomepage}
                  onChange={() => handleToggle('showOnHomepage')}
                  className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="text-xs font-bold text-neutral-800">Homepage</p>
                  <p className="text-[10px] text-neutral-500">Render on home page</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showOnProductPage}
                  onChange={() => handleToggle('showOnProductPage')}
                  className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="text-xs font-bold text-neutral-800">Product Pages</p>
                  <p className="text-[10px] text-neutral-500">Render during exploration</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showOnCheckout}
                  onChange={() => handleToggle('showOnCheckout')}
                  className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="text-xs font-bold text-neutral-800">Checkout Screen</p>
                  <p className="text-[10px] text-neutral-500">Nudge before purchase</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right column: Target Audiences & Options */}
        <div className="space-y-6">
          {/* Target Audience Segments */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-neutral-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-neutral-100">
              <Info className="w-4 h-4 text-emerald-600" />
              Target Audience
            </h4>

            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={config.firstVisitOnly}
                  onChange={() => handleToggle('firstVisitOnly')}
                  className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 animate-none"
                />
                <span>First-time Visit only</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={config.firstOrderOnly}
                  onChange={() => handleToggle('firstOrderOnly')}
                  className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 animate-none"
                />
                <span>First-time Order only</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={config.newCustomerOnly}
                  onChange={() => handleToggle('newCustomerOnly')}
                  className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 animate-none"
                />
                <span>New Customers only</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={config.returningCustomerOnly}
                  onChange={() => handleToggle('returningCustomerOnly')}
                  className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 animate-none"
                />
                <span>Returning Customers only</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={config.festivalOnly}
                  onChange={() => handleToggle('festivalOnly')}
                  className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 animate-none"
                />
                <span>Enable Festive Mode</span>
              </label>
            </div>
          </div>

          {/* Custom Safety Action */}
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 space-y-3">
            <div className="flex gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <h5 className="font-bold text-xs">Permanent Override</h5>
                <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                  Permanently disabling the Scratch & Win module ensures it will not fire for any client regardless of Firestore config. Use during critical system upgrades.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggle('permanentlyDisabled')}
              className={`w-full text-xs font-bold py-2 px-3 rounded-lg border transition-colors ${
                config.permanentlyDisabled
                  ? 'bg-amber-100 border-amber-400 text-amber-900 hover:bg-amber-200'
                  : 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-700'
              }`}
            >
              {config.permanentlyDisabled ? 'Re-enable Promotion Module' : 'Permanently Kill Module'}
            </button>
          </div>
        </div>
      </div>

      {/* Rewards Configuration Section */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-neutral-100 pb-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-neutral-800">Gamified Reward Outcomes</h4>
            <p className="text-xs text-neutral-500">
              Manage the rewards in the scratch card. Ensure standard coupons are also created for the specified coupon codes.
            </p>
          </div>

          <button
            onClick={handleOpenAddReward}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            id="scratch-add-reward-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reward Tier</span>
          </button>
        </div>

        {/* Probability validation message */}
        {probabilitySum !== 100 ? (
          <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Invalid Probability Sum</p>
              <p className="mt-0.5">
                The current total probability sum across all reward tiers is{' '}
                <span className="font-extrabold">{probabilitySum}%</span>. For proper functionality and predictable game play, the total sum of reward probabilities **MUST equal exactly 100%**.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Probability Sum Verified</p>
              <p className="mt-0.5">Total probability sum of rewards is exactly 100%. The scratch system is mathematically balanced.</p>
            </div>
          </div>
        )}

        {/* Rewards List */}
        <div className="overflow-x-auto border border-neutral-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Reward Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Value</th>
                <th className="p-3">Code Link</th>
                <th className="p-3">Win Chance</th>
                <th className="p-3">Usage Statistics</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {config.rewards.map((reward) => (
                <tr key={reward.id} className="hover:bg-neutral-50/50">
                  <td className="p-3 font-bold text-neutral-800">{reward.name}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-full font-bold text-[10px]">
                      {reward.type}
                    </span>
                  </td>
                  <td className="p-3 text-neutral-700">
                    {reward.type === 'PERCENTAGE'
                      ? `${reward.value}%`
                      : reward.type === 'FLAT'
                      ? `₹${reward.value}`
                      : '-'}
                  </td>
                  <td className="p-3">
                    {reward.couponCode ? (
                      <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded font-bold">
                        {reward.couponCode}
                      </span>
                    ) : (
                      <span className="text-neutral-400">None (Losing Tier)</span>
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
                        title="Edit Reward"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Reward"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {config.rewards.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-neutral-400">
                    No reward tiers configured yet. Add one to get started!
                  </td>
                </tr>
              )}
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
              {editingRewardId ? 'Modify Reward Tier' : 'Add New Reward Tier'}
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Reward Name</label>
                <input
                  type="text"
                  value={rewardForm.name}
                  onChange={(e) => setRewardForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g. 15% OFF Jackpot"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Type</label>
                  <select
                    value={rewardForm.type}
                    onChange={(e) =>
                      setRewardForm((prev) => ({ ...prev, type: e.target.value as CouponType | 'NONE' }))
                    }
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FLAT">Flat Discount</option>
                    <option value="FREE_SHIPPING">Free Shipping</option>
                    <option value="NONE">No Reward (Try Again)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={rewardForm.value}
                    onChange={(e) => setRewardForm((prev) => ({ ...prev, value: Number(e.target.value) }))}
                    disabled={rewardForm.type === 'FREE_SHIPPING' || rewardForm.type === 'NONE'}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 disabled:bg-neutral-50 disabled:text-neutral-400"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Coupon Code Link</label>
                  <input
                    type="text"
                    value={rewardForm.couponCode}
                    onChange={(e) => setRewardForm((prev) => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                    disabled={rewardForm.type === 'NONE'}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 font-mono text-emerald-600 uppercase disabled:bg-neutral-50 disabled:text-neutral-400"
                    placeholder="e.g. WIN15"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Win Probability (%)</label>
                  <input
                    type="number"
                    value={rewardForm.probability}
                    onChange={(e) => setRewardForm((prev) => ({ ...prev, probability: Number(e.target.value) }))}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Max Usage Limit</label>
                  <input
                    type="number"
                    value={rewardForm.usageLimit}
                    onChange={(e) => setRewardForm((prev) => ({ ...prev, usageLimit: Number(e.target.value) }))}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Customer Limit</label>
                  <input
                    type="number"
                    value={rewardForm.perCustomerLimit}
                    onChange={(e) => setRewardForm((prev) => ({ ...prev, perCustomerLimit: Number(e.target.value) }))}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    min="1"
                  />
                </div>
              </div>

              <div className="bg-neutral-50 rounded-lg p-2.5 text-[10px] text-neutral-500 flex gap-2">
                <Info className="w-4 h-4 text-neutral-400 shrink-0" />
                <p>
                  Ensure the **Coupon Code Link** exists as a coupon in the system, so the checkout engine can correctly apply the discount upon checkout.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  onClick={() => setShowRewardForm(false)}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReward}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow transition-colors"
                >
                  Confirm Tier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
