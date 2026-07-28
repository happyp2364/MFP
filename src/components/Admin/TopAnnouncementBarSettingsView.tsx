import React, { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  Palette,
  Clock,
  Check,
  Truck,
  Tag,
  Award,
  MessageCircle,
  Info,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { TopAnnouncementBarConfig, AnnouncementItem } from '../../types';

const PRESET_STYLES = [
  { id: 'cyan', name: 'Signature Cyan', bg: '#00A5B5', text: '#FFFFFF' },
  { id: 'emerald', name: 'Fresh Emerald', bg: '#0B8F63', text: '#FFFFFF' },
  { id: 'amber', name: 'Warm Amber', bg: '#F59E0B', text: '#FFFFFF' },
  { id: 'rose', name: 'Crimson Rose', bg: '#E11D48', text: '#FFFFFF' },
  { id: 'luxury_dark', name: 'Luxury Obsidian', bg: '#171717', text: '#F3F4F6' },
];

const AVAILABLE_ICONS = [
  { id: 'Truck', name: 'Delivery Truck', Component: Truck },
  { id: 'Sparkles', name: 'Sparkles', Component: Sparkles },
  { id: 'Tag', name: 'Promo Tag', Component: Tag },
  { id: 'Award', name: 'Award Badge', Component: Award },
  { id: 'MessageCircle', name: 'WhatsApp/Chat', Component: MessageCircle },
  { id: 'Info', name: 'Information', Component: Info },
];

export const TopAnnouncementBarSettingsView: React.FC = () => {
  const { topAnnouncementBarConfig, updateTopAnnouncementBarConfig } = useStore();

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [backgroundColor, setBackgroundColor] = useState('#00A5B5');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [stylePreset, setStylePreset] = useState<'cyan' | 'emerald' | 'amber' | 'rose' | 'custom'>('cyan');
  const [intervalSpeed, setIntervalSpeed] = useState(4000);

  // New announcement form state
  const [newText, setNewText] = useState('');
  const [newIcon, setNewIcon] = useState('Truck');

  // Status states
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state with Context when loaded
  useEffect(() => {
    if (topAnnouncementBarConfig) {
      setAnnouncements(topAnnouncementBarConfig.announcements || []);
      setBackgroundColor(topAnnouncementBarConfig.backgroundColor || '#00A5B5');
      setTextColor(topAnnouncementBarConfig.textColor || '#FFFFFF');
      setStylePreset(topAnnouncementBarConfig.stylePreset || 'cyan');
      setIntervalSpeed(topAnnouncementBarConfig.intervalSpeed || 4000);
    }
  }, [topAnnouncementBarConfig]);

  // Preset Selector
  const handleSelectPreset = (preset: typeof PRESET_STYLES[number]) => {
    setStylePreset(preset.id as any);
    setBackgroundColor(preset.bg);
    setTextColor(preset.text);
    setSaveStatus('IDLE');
  };

  // Add announcement
  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newItem: AnnouncementItem = {
      id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: newText.trim(),
      enabled: true,
      icon: newIcon,
    };

    setAnnouncements([...announcements, newItem]);
    setNewText('');
    setSaveStatus('IDLE');
  };

  // Edit text
  const handleEditText = (id: string, text: string) => {
    setAnnouncements(
      announcements.map((item) => (item.id === id ? { ...item, text } : item))
    );
    setSaveStatus('IDLE');
  };

  // Change icon
  const handleSelectIcon = (id: string, icon: string) => {
    setAnnouncements(
      announcements.map((item) => (item.id === id ? { ...item, icon } : item))
    );
    setSaveStatus('IDLE');
  };

  // Toggle enabled status
  const handleToggleEnabled = (id: string) => {
    setAnnouncements(
      announcements.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
    setSaveStatus('IDLE');
  };

  // Delete announcement
  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter((item) => item.id !== id));
    setSaveStatus('IDLE');
  };

  // Reorder Up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...announcements];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    setAnnouncements(newItems);
    setSaveStatus('IDLE');
  };

  // Reorder Down
  const handleMoveDown = (index: number) => {
    if (index === announcements.length - 1) return;
    const newItems = [...announcements];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    setAnnouncements(newItems);
    setSaveStatus('IDLE');
  };

  // Save Config to Firebase
  const handleSaveConfig = async () => {
    if (announcements.length === 0) {
      setSaveStatus('ERROR');
      setErrorMsg('You must have at least one announcement.');
      return;
    }

    setIsSaving(true);
    setSaveStatus('SAVING');
    setErrorMsg(null);

    const updatedConfig: TopAnnouncementBarConfig = {
      announcements,
      backgroundColor,
      textColor,
      stylePreset,
      intervalSpeed: Number(intervalSpeed) || 4000,
    };

    try {
      await updateTopAnnouncementBarConfig(updatedConfig);
      setIsSaving(false);
      setSaveStatus('SUCCESS');
      setTimeout(() => {
        setSaveStatus((prev) => (prev === 'SUCCESS' ? 'IDLE' : prev));
      }, 4000);
    } catch (err: any) {
      console.error('Failed to save announcement bar config:', err);
      setIsSaving(false);
      setSaveStatus('ERROR');
      setErrorMsg(err.message || 'Failed to save configuration to Firestore.');
    }
  };

  return (
    <div className="space-y-6 text-xs max-w-7xl mx-auto">
      {/* Header Info Banner */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00A5B5]/10 text-[#00A5B5] flex items-center justify-center shrink-0 shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif-heading font-bold text-base text-neutral-900">
              Top Announcement Bar Customizer
            </h2>
            <p className="text-neutral-500 text-[11px] mt-0.5">
              Create, edit, reorder, and style dynamic sliding announcements at the very top of your website.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={isSaving}
          className="px-6 py-3 bg-[#0B8F63] hover:bg-[#086F4C] text-white rounded-xl font-extrabold text-xs shadow-md hover:shadow-lg flex items-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Saving Live...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Announcement Bar Settings</span>
            </>
          )}
        </button>
      </div>

      {/* Save States */}
      {saveStatus === 'SAVING' && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200 shadow-sm">
          <RefreshCw className="w-4 h-4 text-[#0B8F63] animate-spin shrink-0" />
          <span>Saving top announcement bar config to Firestore... Please wait.</span>
        </div>
      )}

      {saveStatus === 'SUCCESS' && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-3 animate-in fade-in duration-200 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-[#0B8F63] shrink-0" />
          <span>✓ Announcements updated successfully. Storefront announcement bar is updated in real-time.</span>
        </div>
      )}

      {saveStatus === 'ERROR' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg || 'Failed to save settings. Please try again.'}</span>
        </div>
      )}

      {/* Live Preview Box */}
      <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-extrabold tracking-widest text-neutral-400 uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Customer Storefront Preview
          </span>
          <span className="text-[10px] text-neutral-500 font-medium">Recreated style and contents</span>
        </div>
        <div
          className="text-xs font-medium py-2 px-4 rounded-xl relative overflow-hidden transition-all duration-300 flex items-center justify-between shadow-md"
          style={{ backgroundColor, color: textColor }}
        >
          {announcements.filter((a) => a.enabled).length > 0 ? (
            <div className="flex items-center gap-2">
              {(() => {
                const activeOnes = announcements.filter((a) => a.enabled);
                const firstIcon = activeOnes[0]?.icon || 'Truck';
                const IconComponent = AVAILABLE_ICONS.find((i) => i.id === firstIcon)?.Component || Truck;
                return <IconComponent className="w-4 h-4" style={{ color: textColor === '#FFFFFF' ? '#FBBF24' : 'currentColor' }} />;
              })()}
              <p className="font-semibold tracking-tight text-xs">
                {announcements.filter((a) => a.enabled)[0]?.text}
              </p>
              {announcements.filter((a) => a.enabled).length > 1 && (
                <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold ml-1.5">
                  +{announcements.filter((a) => a.enabled).length - 1} more sliding
                </span>
              )}
            </div>
          ) : (
            <div className="text-center font-bold italic w-full">
              No active announcements.
            </div>
          )}
          <button className="opacity-80 hover:opacity-100 p-0.5 rounded-full hover:bg-white/10 shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Color & Style Customization */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-5">
            <h3 className="font-serif-heading font-bold text-base text-neutral-900 border-b border-neutral-100 pb-2.5 flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-600" />
              <span>Theme & Style Settings</span>
            </h3>

            {/* Presets Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-800 block">Preset Styles</label>
              <div className="grid grid-cols-1 gap-2">
                {PRESET_STYLES.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      stylePreset === preset.id
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-sm font-bold'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    <span className="font-semibold text-xs text-neutral-900">{preset.name}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-5 h-5 rounded-full border border-neutral-300" style={{ backgroundColor: preset.bg }} />
                      <span className="w-5 h-5 rounded-full border border-neutral-300 flex items-center justify-center font-bold text-[9px]" style={{ backgroundColor: preset.text, color: preset.bg }}>
                        Aa
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 block">Custom Background</label>
                <div className="flex items-center gap-2 bg-[#F7F7F7] p-2 rounded-xl border border-neutral-200">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => {
                      setBackgroundColor(e.target.value);
                      setStylePreset('custom');
                      setSaveStatus('IDLE');
                    }}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-neutral-300 shrink-0"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => {
                      setBackgroundColor(e.target.value);
                      setStylePreset('custom');
                      setSaveStatus('IDLE');
                    }}
                    className="w-full bg-transparent font-mono text-xs uppercase outline-none font-bold text-neutral-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 block">Custom Text Color</label>
                <div className="flex items-center gap-2 bg-[#F7F7F7] p-2 rounded-xl border border-neutral-200">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      setStylePreset('custom');
                      setSaveStatus('IDLE');
                    }}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-neutral-300 shrink-0"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      setStylePreset('custom');
                      setSaveStatus('IDLE');
                    }}
                    className="w-full bg-transparent font-mono text-xs uppercase outline-none font-bold text-neutral-900"
                  />
                </div>
              </div>
            </div>

            {/* Interval Speed */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-100">
              <label className="text-xs font-bold text-neutral-800 flex items-center justify-between">
                <span>Transition Slide Interval</span>
                <span className="font-mono text-emerald-800 font-extrabold">{intervalSpeed / 1000}s</span>
              </label>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="range"
                  min={2000}
                  max={10000}
                  step={500}
                  value={intervalSpeed}
                  onChange={(e) => {
                    setIntervalSpeed(Number(e.target.value));
                    setSaveStatus('IDLE');
                  }}
                  className="w-full accent-[#0B8F63]"
                />
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">
                Speed of rotation between active announcements (Default: 4 seconds).
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (2 spans): Announcements List CRUD */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
            <h3 className="font-serif-heading font-bold text-base text-neutral-900 border-b border-neutral-100 pb-2.5 flex items-center justify-between">
              <span>Manage Announcement Slides ({announcements.length})</span>
              <span className="text-neutral-400 text-[10px] font-normal">Reorder & customize slides</span>
            </h3>

            {/* Add New Announcement Form */}
            <form onSubmit={handleAddAnnouncement} className="p-4 bg-[#F7F7F7] rounded-xl border border-neutral-200 flex flex-col md:flex-row gap-3 items-end">
              <div className="w-full space-y-1.5">
                <label className="font-bold text-neutral-700 block">Add New Announcement slide</label>
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g. 📢 Flat 20% off on premium athletic sneakers this weekend!"
                  className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-xs text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="w-full md:w-48 space-y-1.5 shrink-0">
                <label className="font-bold text-neutral-700 block">Icon</label>
                <select
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-xs text-neutral-900 outline-none"
                >
                  {AVAILABLE_ICONS.map((ico) => (
                    <option key={ico.id} value={ico.id}>{ico.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-5 py-3 bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold rounded-lg flex items-center justify-center gap-1.5 shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>

            {/* Announcements List */}
            {announcements.length === 0 ? (
              <div className="p-8 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-300 text-neutral-400 italic">
                No announcement slides created yet. Add your first announcement above.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {announcements.map((item, index) => {
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        item.enabled ? 'bg-white border-neutral-200' : 'bg-neutral-50/60 border-neutral-100 opacity-60'
                      }`}
                    >
                      {/* Left: Checkbox for Enable/Disable */}
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() => handleToggleEnabled(item.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        title={item.enabled ? 'Click to Disable' : 'Click to Enable'}
                      />

                      {/* Middle: Icon Selector + Input Box */}
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        {/* Inline Icon Selector Dropdown */}
                        <select
                          value={item.icon || 'Truck'}
                          onChange={(e) => handleSelectIcon(item.id, e.target.value)}
                          className="bg-[#F7F7F7] border border-neutral-200 rounded-lg px-2 py-1.5 font-semibold text-[10px] text-neutral-700 outline-none shrink-0"
                          title="Change icon"
                        >
                          {AVAILABLE_ICONS.map((ico) => (
                            <option key={ico.id} value={ico.id}>{ico.id}</option>
                          ))}
                        </select>

                        {/* Text input */}
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => handleEditText(item.id, e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-emerald-600 outline-none font-semibold text-neutral-900 text-xs py-1 transition-all"
                        />
                      </div>

                      {/* Right: Reorder actions & Delete */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === announcements.length - 1}
                          className="p-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAnnouncement(item.id)}
                          className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Delete slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Close Icon mapping for Preview Close button
const X: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
