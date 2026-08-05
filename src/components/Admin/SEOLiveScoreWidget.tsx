import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Activity, X, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const SEOLiveScoreWidget: React.FC = () => {
  const { isAdmin } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState(100);
  const [issues, setIssues] = useState<{ type: 'error' | 'warning' | 'success'; message: string }[]>([]);
  
  // We don't have react-router in this app, it's a SPA without real router usually. 
  // We can just rely on MutationObserver for title/meta changes to re-evaluate.
  
  useEffect(() => {
    if (!isAdmin) return;
    
    const evaluateSEO = () => {
      let currentScore = 100;
      const newIssues: { type: 'error' | 'warning' | 'success'; message: string }[] = [];

      // 1. Check Title
      if (!document.title || document.title === '') {
        currentScore -= 20;
        newIssues.push({ type: 'error', message: 'Missing page title.' });
      } else if (document.title.length < 30 || document.title.length > 65) {
        currentScore -= 5;
        newIssues.push({ type: 'warning', message: 'Page title should be between 30 and 65 characters.' });
      } else {
        newIssues.push({ type: 'success', message: 'Good page title length.' });
      }

      // 2. Check Description
      const descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta || !descMeta.getAttribute('content')) {
        currentScore -= 20;
        newIssues.push({ type: 'error', message: 'Missing meta description.' });
      } else {
        const descLen = descMeta.getAttribute('content')?.length || 0;
        if (descLen < 50 || descLen > 160) {
          currentScore -= 10;
          newIssues.push({ type: 'warning', message: 'Meta description should be between 50 and 160 characters.' });
        } else {
          newIssues.push({ type: 'success', message: 'Good meta description length.' });
        }
      }

      // 3. Check Canonical
      const canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        currentScore -= 10;
        newIssues.push({ type: 'warning', message: 'Missing canonical URL.' });
      } else {
        newIssues.push({ type: 'success', message: 'Canonical URL present.' });
      }

      // 4. Check Open Graph
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        currentScore -= 10;
        newIssues.push({ type: 'warning', message: 'Missing Open Graph image (og:image).' });
      }

      // 5. Check H1
      const h1s = document.querySelectorAll('h1');
      if (h1s.length === 0) {
        currentScore -= 15;
        newIssues.push({ type: 'error', message: 'Missing H1 heading.' });
      } else if (h1s.length > 1) {
        currentScore -= 5;
        newIssues.push({ type: 'warning', message: 'Multiple H1 headings found. Usually, 1 is optimal.' });
      } else {
        newIssues.push({ type: 'success', message: 'H1 heading present.' });
      }

      // 6. Check Image Alts
      const images = document.querySelectorAll('img');
      const imagesWithoutAlt = Array.from(images).filter(img => !img.hasAttribute('alt') || img.getAttribute('alt') === '');
      if (imagesWithoutAlt.length > 0) {
        currentScore -= (imagesWithoutAlt.length * 2);
        newIssues.push({ type: 'error', message: `${imagesWithoutAlt.length} image(s) missing alt text.` });
      } else if (images.length > 0) {
        newIssues.push({ type: 'success', message: 'All images have alt text.' });
      }

      setScore(Math.max(0, currentScore));
      setIssues(newIssues);
    };

    // Evaluate initially and then observe document head for changes
    evaluateSEO();
    
    // Quick polling for SPA navigation changes (since we don't have router listener easily available)
    const interval = setInterval(evaluateSEO, 2000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 bg-white/90 backdrop-blur shadow-xl border border-neutral-200 text-neutral-800 px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-neutral-50 transition-all hover:scale-105"
      >
        <Search className="w-4 h-4 text-emerald-600" />
        <span className="text-xs">Live SEO Score:</span>
        <span className={`text-xs ${score >= 90 ? 'text-emerald-600' : score >= 70 ? 'text-amber-500' : 'text-red-500'}`}>
          {score}/100
        </span>
      </button>

      {/* Widget Modal */}
      {isOpen && (
        <div className="fixed bottom-36 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-neutral-900 text-white p-4 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-emerald-400" />
              Live SEO Auditor
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-center py-4 border-b border-neutral-100 mb-4">
              <div className="text-center">
                <div className={`text-5xl font-black ${score >= 90 ? 'text-emerald-500' : score >= 70 ? 'text-amber-500' : 'text-red-500'}`}>
                  {score}
                </div>
                <div className="text-xs font-bold text-neutral-500 mt-1 uppercase tracking-widest">Page Score</div>
              </div>
            </div>

            <div className="space-y-3">
              {issues.map((issue, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <div className="shrink-0 mt-0.5">
                    {issue.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {issue.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    {issue.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <p className={`text-xs ${
                    issue.type === 'error' ? 'text-red-700 font-medium' :
                    issue.type === 'warning' ? 'text-amber-700 font-medium' :
                    'text-emerald-700'
                  }`}>
                    {issue.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
