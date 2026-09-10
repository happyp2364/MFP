import { LogoCustomConfig } from '../types/logoCustomization';

export const DEFAULT_MARUDHAR_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80"><defs><linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23092e22"/><stop offset="50%" stop-color="%230B8F63"/><stop offset="100%" stop-color="%23054d35"/></linearGradient><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23F6E05E"/><stop offset="50%" stop-color="%23D4AF37"/><stop offset="100%" stop-color="%23B7791F"/></linearGradient></defs><rect x="4" y="8" width="64" height="64" rx="16" fill="url(%23bgGrad)" stroke="url(%23goldGrad)" stroke-width="2.5"/><path d="M24 48 C24 38, 28 30, 36 24 C44 30, 48 38, 48 48 Z" fill="none" stroke="url(%23goldGrad)" stroke-width="3" stroke-linecap="round"/><circle cx="36" cy="38" r="5" fill="url(%23goldGrad)"/><polygon points="36,18 39,23 44,22 41,26 43,31 36,28 29,31 31,26 28,22 33,23" fill="url(%23goldGrad)"/><text x="82" y="38" font-family="'Playfair Display', Georgia, serif" font-weight="900" font-size="20" fill="%230B8F63" letter-spacing="0.5">MARUDHAR</text><text x="82" y="56" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="11" fill="%232D3748" letter-spacing="2">FASHION POINT</text></svg>`;

export const DEFAULT_LOGO_CONFIG: LogoCustomConfig = {
  logoUrl: '/images/shop/marudhar_logo.png',
  logoType: 'both',
  logoWidthDesktop: 160,
  logoHeightDesktop: 'auto',
  logoWidthMobile: 120,
  logoHeightMobile: 'auto',
  keepAspectRatio: true,
  logoVisibility: true,
  showBrandNameBesideLogo: true,
  brandNameText: 'Marudhar Fashion Point',
  taglineText: 'Style for Every Step.',
  objectFit: 'contain',
};
