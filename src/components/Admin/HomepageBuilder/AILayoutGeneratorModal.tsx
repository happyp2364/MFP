import React, { useState } from 'react';
import { X, Sparkles, Wand2, Loader2, Check, RefreshCw, Layers } from 'lucide-react';
import { HomepageConfig } from '../../../types';
import { generateAIHomepageLayout } from '../../../lib/homepageService';

interface AILayoutGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyLayout: (generatedConfig: HomepageConfig) => void;
}

const SAMPLE_PROMPTS = [
  {
    title: '👑 Royal Festive Utsav',
    prompt: 'Design a high-end royal Indian wedding festival homepage with gold & crimson tones, hero saree slider, flash sale countdown, category spotlights, and customer reviews.',
  },
  {
    title: '⚡ Mega Flash Sale Express',
    prompt: 'Create a high-energy flash deal sale homepage with urgent timer, promo coupon banners, top trending products grid, and trust badges.',
  },
  {
    title: '🌿 Minimalist Ethnic Elegance',
    prompt: 'Create a clean, spacious boutique layout with pastel accents, curated designer suits, new arrivals showcase, and Instagram gallery.',
  },
];

export const AILayoutGeneratorModal: React.FC<AILayoutGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyLayout,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<HomepageConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const config = await generateAIHomepageLayout(finalPrompt);
      if (config) {
        setPreviewConfig(config);
      } else {
        setError('Could not generate layout. Please try a different prompt.');
      }
    } catch (err) {
      setError('AI generation error. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-8 border border-neutral-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-neutral-900 via-purple-950 to-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI Homepage Experience Designer</h3>
              <p className="text-xs text-neutral-300">Powered by Gemini AI - Generate complete dynamic layouts in seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Quick Preset Prompts */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
              Select Quick Theme Prompt:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SAMPLE_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(item.prompt);
                    handleGenerate(item.prompt);
                  }}
                  className="p-3 text-left border border-purple-100 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50 rounded-xl transition-all group"
                >
                  <span className="block text-xs font-bold text-purple-900 group-hover:text-purple-700 mb-1">
                    {item.title}
                  </span>
                  <span className="block text-[11px] text-neutral-600 line-clamp-2">
                    {item.prompt}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Or Describe Custom Vision:
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Design a festive Diwali theme with maroon accents, big banner slider, top saree deals, flash sale, and reviews..."
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <button
              type="button"
              disabled={isLoading || !prompt.trim()}
              onClick={() => handleGenerate()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Gemini AI is designing your homepage...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" /> Generate Full Layout with Gemini
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Preview of Generated Layout */}
          {previewConfig && (
            <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> AI Generated Layout: {previewConfig.name}
                  </h4>
                  <p className="text-xs text-emerald-700">Theme: {previewConfig.themeMode || 'light'} • Sections: {previewConfig.sections.length}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-lg hover:bg-emerald-50 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {previewConfig.sections.map((sec, idx) => (
                  <div key={sec.id || idx} className="p-2.5 bg-white border border-emerald-100 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-neutral-800">{sec.title}</span>
                    </div>
                    <span className="text-[10px] font-semibold uppercase text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                      {sec.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 text-sm font-semibold rounded-xl hover:bg-neutral-100"
          >
            Cancel
          </button>
          {previewConfig && (
            <button
              onClick={() => {
                onApplyLayout(previewConfig);
                onClose();
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Apply Generated Layout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
