import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { StoreProvider } from './context/StoreContext.tsx';
import { WebsiteDesignProvider } from './context/WebsiteDesignContext.tsx';
import { AdminNavProvider } from './context/AdminNavContext.tsx';
import { initAutoContrastEngine } from './utils/autoContrastEngine.ts';
import { HelmetProvider } from 'react-helmet-async';
import { AppErrorBoundary } from './components/Common/AppErrorBoundary.tsx';
import './index.css';

// Safely initialize the global WCAG Auto Contrast accessibility engine
try {
  initAutoContrastEngine();
} catch (err) {
  console.warn('Auto contrast engine init notice:', err);
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AppErrorBoundary>
        <HelmetProvider>
          <WebsiteDesignProvider>
            <AdminNavProvider>
              <StoreProvider>
                <App />
              </StoreProvider>
            </AdminNavProvider>
          </WebsiteDesignProvider>
        </HelmetProvider>
      </AppErrorBoundary>
    </StrictMode>,
  );
}

