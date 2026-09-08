import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { getActiveStorePhone, sanitizeWhatsAppText } from '../../utils/whatsapp';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[AppErrorBoundary] Caught global application error:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
    });
  }

  private handleContactWhatsApp = () => {
    const storePhone = getActiveStorePhone().replace(/\D/g, '');
    const text = `नमस्ते मरुधर फैशन पॉइंट 🙏\n\nवेबसाइट लोड करने में समस्या आई है। कृपया मेरी सहायता करें।`;
    const cleanText = sanitizeWhatsAppText(text);
    window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(cleanText)}`, '_blank');
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 text-center space-y-5">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-neutral-900">मरुधर फैशन पॉइंट</h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                वेबसाइट लोड करने में अस्थायी समस्या आई है। आपका डेटा सुरक्षित है।
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-red-50 rounded-xl text-left border border-red-200 space-y-1">
                <p className="text-[11px] font-bold text-red-800">
                  त्रुटि विवरण (Diagnostic Info):
                </p>
                <p className="text-[11px] font-mono text-red-700 break-all">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-[9px] font-mono text-neutral-500 overflow-x-auto max-h-24 whitespace-pre-wrap">
                    {this.state.error.stack.split('\n').slice(0, 4).join('\n')}
                  </pre>
                )}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                पेज पुनः लोड करें (Reload)
              </button>

              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold rounded-xl text-xs border border-neutral-200 flex items-center justify-center gap-2 transition-colors"
              >
                <Home className="w-4 h-4" />
                होम पेज पर जाएं
              </button>

              <button
                onClick={this.handleContactWhatsApp}
                className="w-full py-2.5 px-4 text-emerald-700 hover:text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp सहायता
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
