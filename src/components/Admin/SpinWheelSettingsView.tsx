import React, { useState } from 'react';
import {
  Save,
  Plus,
  Trash2,
  Settings,
  AlertTriangle,
  CheckCircle,
  Dices,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SpinWheelConfig, WheelSection } from '../../types';

export const SpinWheelSettingsView: React.FC = () => {
  const { spinWheelConfig, updateSpinWheelConfig } = useStore();

  const [config, setConfig] = useState<SpinWheelConfig>({ ...spinWheelConfig });
  const [isSaving, setIsSaving] = useState(false);

  // Section form state
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState<WheelSection>({
    id: '',
    title: '',
    type: 'PERCENTAGE',
    value: 10,
    probability: 10,
    couponCode: '',
    color: '#000000',
  });

  const [showSectionForm, setShowSectionForm] = useState(false);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await updateSpinWheelConfig(config);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (field: keyof Omit<SpinWheelConfig, 'sections' | 'sectionsCount' | 'canSpinAgainDays'>) => {
    setConfig((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSaveSection = () => {
    if (!sectionForm.title) {
      alert('Please provide a title');
      return;
    }

    let updatedSections = [...config.sections];
    if (editingSectionId) {
      updatedSections = updatedSections.map((s) => (s.id === editingSectionId ? sectionForm : s));
    } else {
      updatedSections.push({ ...sectionForm, id: `w-${Date.now()}` });
    }

    setConfig((prev) => ({
      ...prev,
      sections: updatedSections,
      sectionsCount: updatedSections.length as any,
    }));

    setShowSectionForm(false);
    setEditingSectionId(null);
  };

  const handleDeleteSection = (id: string) => {
    if (confirm('Delete this section?')) {
      setConfig((prev) => {
        const next = prev.sections.filter((s) => s.id !== id);
        return {
          ...prev,
          sections: next,
          sectionsCount: next.length as any,
        };
      });
    }
  };

  const probabilitySum = config.sections.reduce((sum, s) => sum + Number(s.probability || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
              <Dices className="w-5 h-5" />
            </div>
            <h3 className="font-serif-heading font-bold text-lg text-neutral-800">Spin the Wheel Configuration</h3>
          </div>
          <p className="text-xs text-neutral-500">
            Create an interactive spin-to-win game for your customers. Customize sections, colors, and win chances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleToggle('enabled')}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              config.enabled ? 'bg-pink-600' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                config.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>

          <button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Section Management */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between gap-4 border-b border-neutral-100 pb-4">
              <h4 className="font-bold text-sm text-neutral-800">Wheel Sections</h4>
              <button
                onClick={() => {
                  setEditingSectionId(null);
                  setSectionForm({
                    id: '',
                    title: '',
                    type: 'PERCENTAGE',
                    value: 5,
                    probability: 10,
                    couponCode: '',
                    color: '#EF4444',
                  });
                  setShowSectionForm(true);
                }}
                className="bg-neutral-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            </div>

            {probabilitySum !== 100 && (
              <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-3 flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <p className="text-xs">
                  Total probability is <strong>{probabilitySum}%</strong>. Adjust to <strong>100%</strong> for valid spins.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config.sections.map((s) => (
                <div key={s.id} className="p-3 rounded-xl border border-neutral-100 bg-neutral-50/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full border border-neutral-200" 
                      style={{ backgroundColor: s.color }} 
                    />
                    <div>
                      <p className="text-xs font-bold text-neutral-800">{s.title}</p>
                      <p className="text-[10px] text-neutral-500">{s.probability}% Chance • {s.couponCode || 'No Coupon'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setEditingSectionId(s.id);
                        setSectionForm(s);
                        setShowSectionForm(true);
                      }}
                      className="p-1.5 text-neutral-500 hover:text-pink-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteSection(s.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Experience Settings */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-5">
            <h4 className="font-bold text-xs text-neutral-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-neutral-100">
              <Zap className="w-4 h-4 text-pink-600" />
              Game Experience
            </h4>

            <div className="space-y-4">
              <label className="flex items-center justify-between gap-3 cursor-pointer group">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${config.soundEnabled ? 'bg-pink-50 text-pink-600' : 'bg-neutral-50 text-neutral-400'}`}>
                    {config.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-bold text-neutral-700">Sound Effects</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.soundEnabled}
                  onChange={() => handleToggle('soundEnabled')}
                  className="rounded border-neutral-300 text-pink-600 focus:ring-pink-500"
                />
              </label>

              <label className="flex items-center justify-between gap-3 cursor-pointer group">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${config.celebrationEnabled ? 'bg-pink-50 text-pink-600' : 'bg-neutral-50 text-neutral-400'}`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-700">Confetti Celebration</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.celebrationEnabled}
                  onChange={() => handleToggle('celebrationEnabled')}
                  className="rounded border-neutral-300 text-pink-600 focus:ring-pink-500"
                />
              </label>

              <label className="flex items-center justify-between gap-3 cursor-pointer group">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${config.autoApplyCoupon ? 'bg-pink-50 text-pink-600' : 'bg-neutral-50 text-neutral-400'}`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-700">Auto-apply Coupon</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoApplyCoupon}
                  onChange={() => handleToggle('autoApplyCoupon')}
                  className="rounded border-neutral-300 text-pink-600 focus:ring-pink-500"
                />
              </label>

              <div className="pt-2">
                <label className="block text-[11px] font-bold text-neutral-500 mb-1 uppercase tracking-tighter">Cooldown (Days)</label>
                <input
                  type="number"
                  value={config.canSpinAgainDays}
                  onChange={(e) => setConfig(prev => ({ ...prev, canSpinAgainDays: Number(e.target.value) }))}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-pink-500"
                  min="0"
                />
                <p className="text-[10px] text-neutral-400 mt-1">Days a customer must wait before spinning again.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Modal */}
      {showSectionForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setShowSectionForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-sm p-6 z-10">
            <h4 className="font-bold text-sm text-neutral-800 mb-4 border-b border-neutral-100 pb-2">
              {editingSectionId ? 'Edit Wheel Section' : 'Add Wheel Section'}
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Title (Label on Wheel)</label>
                <input
                  type="text"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-pink-500"
                  placeholder="e.g. 20% OFF"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Probability (%)</label>
                  <input
                    type="number"
                    value={sectionForm.probability}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, probability: Number(e.target.value) }))}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-pink-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Color</label>
                  <input
                    type="color"
                    value={sectionForm.color}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-8 border border-neutral-300 rounded-lg p-0.5 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Type</label>
                  <select
                    value={sectionForm.type}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-pink-500"
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FLAT">Flat</option>
                    <option value="FREE_SHIPPING">Free Ship</option>
                    <option value="GIFT">Gift</option>
                    <option value="BETTER_LUCK">No Reward</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Value</label>
                  <input
                    type="number"
                    value={sectionForm.value}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, value: Number(e.target.value) }))}
                    disabled={sectionForm.type === 'BETTER_LUCK' || sectionForm.type === 'FREE_SHIPPING' || sectionForm.type === 'GIFT'}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-pink-500 disabled:bg-neutral-50 disabled:text-neutral-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Coupon Code Link</label>
                <input
                  type="text"
                  value={sectionForm.couponCode}
                  onChange={(e) => setSectionForm(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                  disabled={sectionForm.type === 'BETTER_LUCK' || sectionForm.type === 'GIFT'}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 focus:ring-1 focus:ring-pink-500 font-mono uppercase text-pink-600"
                  placeholder="SPINWIN10"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowSectionForm(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs py-2 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSection}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs py-2 rounded-xl shadow-lg shadow-pink-100 transition-all"
                >
                  Save Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
