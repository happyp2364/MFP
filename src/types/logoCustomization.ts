export interface LogoCustomConfig {
  logoUrl: string;
  logoType: 'image' | 'icon' | 'text' | 'both';
  logoWidthDesktop: number; // e.g. 160
  logoHeightDesktop: number | 'auto'; // 'auto' or numeric px
  logoWidthMobile: number; // e.g. 120
  logoHeightMobile: number | 'auto'; // 'auto' or numeric px
  keepAspectRatio: boolean;
  logoVisibility: boolean;
  showBrandNameBesideLogo: boolean;
  brandNameText: string;
  taglineText: string;
  objectFit: 'contain' | 'cover' | 'fill';
  updatedAt?: string;
  updatedBy?: string;
}
