import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, ShoppingBag } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CRITICAL GLOBAL APP ERROR CAUGHT:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleResetAndReload = () => {
    try {
      // Clear non-critical local storage caches if corrupted
      const keysToRemove = [
        'mfp_products_catalog_live',
        'mfp_reviews_live',
        'mfp_store_info_live',
        'mfp_hero_content_live',
        'mfp_announcements_live',
        'mfp_category_highlights_live',
        'mfp_trending_collections_live',
        'mfp_whatsapp_templates_config',
        'mfp_spin_wheel_config',
        'mfp_scratch_win_config',
      ];
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Could not clear local storage keys:', e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6 border border-amber-500/30">
            <ShoppingBag className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
            Marudhar Fashion Point
          </h1>
          <p className="text-neutral-400 text-sm max-w-md mb-6 leading-relaxed">
            The application experienced a temporary display update notice. Click below to restore full connectivity.
          </p>

          {this.state.error && (
            <div className="mb-6 p-3 bg-neutral-800/90 border border-neutral-700 rounded-xl text-left max-w-md w-full font-mono text-[11px] text-amber-300 break-words max-h-28 overflow-y-auto">
              {this.state.error.message || String(this.state.error)}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3 px-5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>

            <button
              type="button"
              onClick={this.handleResetAndReload}
              className="w-full py-3 px-5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-semibold rounded-xl transition-all cursor-pointer text-xs"
            >
              Reset Cache & Recover
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
