import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { StoreProvider } from './context/StoreContext.tsx';
import { initAutoContrastEngine } from './utils/autoContrastEngine.ts';
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
      <StoreProvider>
        <App />
      </StoreProvider>
    </StrictMode>,
  );
}

