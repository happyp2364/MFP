import React, { useState } from 'react';
import { X, Calendar, Clock, Check } from 'lucide-react';
import { HomepageConfig, HomepagePreset } from '../../../types';

interface ScheduleTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: HomepagePreset | null;
  onScheduleConfirm: (presetId: string, startDate: string, endDate?: string) => void;
}

export const ScheduleTemplateModal: React.FC<ScheduleTemplateModalProps> = ({
  isOpen,
  onClose,
  preset,
  onScheduleConfirm,
}) => {
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState('');

  if (!isOpen || !preset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onScheduleConfirm(preset.id, startDate, endDate || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-extrabold">Schedule Template Activation</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: preset.previewColor }}
            />
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">{preset.name}</p>
              <p className="text-[11px] text-neutral-500 font-medium">{preset.badge}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Start Go-Live Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-bold bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              End Expiry Date & Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-bold bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-black rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <Clock className="w-4 h-4" /> Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
