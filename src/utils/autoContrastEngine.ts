/**
 * Auto Contrast Engine (WCAG AA Compliant)
 * Automatically detects elements with poor text-to-background contrast
 * and dynamically overrides their style to guarantee visibility.
 */

function parseColor(colorStr: string): { r: number; g: number; b: number; a: number } | null {
  if (!colorStr) return null;
  
  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
      a: rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1.0,
    };
  }

  // hex #fff or #ffffff
  if (colorStr.startsWith('#')) {
    const hex = colorStr.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1.0,
      };
    }
    if (hex.length === 6 || hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1.0,
      };
    }
  }

  return null;
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const rs = r / 255;
  const gs = g / 255;
  const bs = b / 255;
  const R = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
  const G = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
  const B = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getActualBackgroundColor(el: HTMLElement): { r: number; g: number; b: number; a: number } {
  let current: HTMLElement | null = el;
  while (current) {
    const computed = window.getComputedStyle(current);
    const bg = computed.backgroundColor;
    if (bg) {
      const parsed = parseColor(bg);
      // Ensure the background is solid (non-transparent)
      if (parsed && parsed.a > 0.1) {
        return parsed;
      }
    }
    current = current.parentElement;
  }
  return { r: 255, g: 255, b: 255, a: 1.0 }; // Fallback to white bg
}

export function runAutoContrastAudit() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // We target any elements containing text or interaction elements
  const elements = document.querySelectorAll<HTMLElement>(
    'span, p, h1, h2, h3, h4, h5, h6, label, td, th, input, textarea, select, button, a, li, option, div[role="tab"]'
  );

  elements.forEach((el) => {
    // Skip SVG, icons, or specific badge elements we don't want to affect
    if (el.tagName === 'svg' || el.classList.contains('lucide') || el.closest('svg')) {
      return;
    }

    // Only inspect items with text or interactive form fields
    const text = (el.textContent || el.innerText || '').trim();
    if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'SELECT' && !text) {
      return;
    }

    const computed = window.getComputedStyle(el);
    const textCol = computed.color;
    const parsedText = parseColor(textCol);
    
    if (!parsedText) return;

    const parsedBg = getActualBackgroundColor(el);

    const bgLuminance = getRelativeLuminance(parsedBg.r, parsedBg.g, parsedBg.b);
    const textLuminance = getRelativeLuminance(parsedText.r, parsedText.g, parsedText.b);

    const contrast = getContrastRatio(bgLuminance, textLuminance);

    // WCAG AA threshold is 4.5:1 for body, 3.0:1 for headings
    const isHeading = !!el.tagName.match(/^H[1-6]$/);
    const threshold = isHeading ? 3.0 : 4.0;

    if (contrast < threshold) {
      // Contrast is too low! Override text color if not already applied
      const targetColor = bgLuminance >= 0.5 ? '#111827' : '#ffffff';
      if (el.getAttribute('data-contrast-fixed') !== targetColor) {
        el.setAttribute('data-contrast-fixed', targetColor);
        el.style.setProperty('color', targetColor, 'important');
      }
    }
  });
}

let activeObserver: MutationObserver | null = null;
let isExecutingAudit = false;

function safeAuditExecution() {
  if (isExecutingAudit) return;
  isExecutingAudit = true;

  // Temporarily pause observer to prevent mutation loops
  if (activeObserver) {
    activeObserver.disconnect();
  }

  try {
    runAutoContrastAudit();
  } catch (err) {
    console.warn('Auto contrast engine notice:', err);
  } finally {
    isExecutingAudit = false;
    // Re-engage observer
    if (activeObserver && typeof document !== 'undefined' && document.body) {
      activeObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
      });
    }
  }
}

// Hook to continuously monitor the DOM
export function initAutoContrastEngine() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  let timeoutId: any = null;
  const debouncedAudit = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      safeAuditExecution();
    }, 250);
  };

  // Set up MutationObserver to check for poor contrast when DOM tree changes
  activeObserver = new MutationObserver((mutations) => {
    if (isExecutingAudit) return;
    let shouldTrigger = false;
    for (const m of mutations) {
      if (m.type === 'childList' || (m.type === 'attributes' && m.attributeName === 'class')) {
        shouldTrigger = true;
        break;
      }
    }
    if (shouldTrigger) {
      debouncedAudit();
    }
  });

  if (document.body) {
    activeObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  // Initial execution after load
  debouncedAudit();

  // Run audit on window resize and document interactions
  window.addEventListener('resize', debouncedAudit);
  document.addEventListener('focusin', debouncedAudit);

  return () => {
    if (activeObserver) {
      activeObserver.disconnect();
      activeObserver = null;
    }
    window.removeEventListener('resize', debouncedAudit);
    document.removeEventListener('focusin', debouncedAudit);
  };
}
