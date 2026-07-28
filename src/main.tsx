import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { StoreProvider } from './context/StoreContext.tsx';
import { initAutoContrastEngine } from './utils/autoContrastEngine.ts';
import './index.css';

import { BrowserRouter } from 'react-router-dom';

// Initialize the global WCAG Auto Contrast accessibility engine
initAutoContrastEngine();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <App />
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
);
