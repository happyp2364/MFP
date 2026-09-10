import { ComponentType, lazy, LazyExoticComponent } from 'react';

/**
 * Robust lazy loading wrapper that handles dynamic import failures smoothly,
 * retrying once or falling back gracefully to prevent AppErrorBoundary crashes.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T } | { [key: string]: T }>,
  exportName?: string
): LazyExoticComponent<T> {
  return lazy(async () => {
    const pageRefreshed = JSON.parse(
      window.sessionStorage.getItem('lazy_retry_refreshed') || 'false'
    );

    try {
      const module = await componentImport();
      window.sessionStorage.setItem('lazy_retry_refreshed', 'false');

      if (exportName && (module as any)[exportName]) {
        return { default: (module as any)[exportName] };
      }
      if ('default' in module && module.default) {
        return { default: module.default as T };
      }
      const firstExport = Object.values(module)[0];
      if (firstExport) {
        return { default: firstExport as T };
      }
      throw new Error('No valid component export found in module.');
    } catch (error) {
      console.warn('Dynamic import failed, attempting recovery...', error);
      if (!pageRefreshed) {
        window.sessionStorage.setItem('lazy_retry_refreshed', 'true');
        window.location.reload();
      }
      throw error;
    }
  });
}

