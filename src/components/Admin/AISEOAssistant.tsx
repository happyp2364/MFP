import React, { useState } from 'react';
import { Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { getPlatformConfig } from '../../lib/platformConfig';

export const AISEOAssistant: React.FC<{ onApply: (data: any) => void }> = ({ onApply }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generateSEO = () => {
    setIsGenerating(true);
    const platform = getPlatformConfig();
    setTimeout(() => {
      setResult({
        title: `Premium Men's & Women's Footwear | ${platform.platformDisplayName}`,
        description: "Discover exclusive handcrafted leather shoes, premium sports sneakers, and trendy casual footwear for men, women, and kids. Best quality guaranteed.",
        keywords: `shoes, premium footwear, leather shoes, sports sneakers, ${platform.platformDisplayName}`
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100">
      <div className="flex items-center justify-between mb-4">
         <h4 className="font-bold text-emerald-900 flex items-center gap-2">
           <Sparkles className="w-5 h-5 text-emerald-600" />
           AI SEO Assistant
         </h4>
         <button
           onClick={generateSEO}
           disabled={isGenerating}
           className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
         >
           {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
           {isGenerating ? 'Analyzing Content...' : 'Auto-Generate SEO'}
         </button>
      </div>
      
      {result && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-emerald-100 animate-in fade-in">
           <div>
             <span className="text-xs font-bold text-neutral-500 block mb-1">Optimized Title</span>
             <p className="text-sm font-medium text-neutral-900">{result.title}</p>
           </div>
           <div>
             <span className="text-xs font-bold text-neutral-500 block mb-1">Optimized Description</span>
             <p className="text-sm font-medium text-neutral-900">{result.description}</p>
           </div>
           <div>
             <span className="text-xs font-bold text-neutral-500 block mb-1">Keywords</span>
             <p className="text-sm font-medium text-neutral-900">{result.keywords}</p>
           </div>
           <button
             onClick={() => {
               onApply(result);
               setResult(null);
             }}
             className="w-full mt-2 py-2 bg-neutral-900 text-white rounded-lg text-sm font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
           >
             <CheckCircle className="w-4 h-4" />
             Apply to Settings
           </button>
        </div>
      )}
    </div>
  );
};
