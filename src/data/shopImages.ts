export interface ShopImageItem {
  id: string;
  filename: string;
  title: string;
  caption: string;
  category: 'shop_outside' | 'shop_inside' | 'promotional_banner' | 'brand_emblem' | 'branding' | 'merchandise' | 'team';
  url: string;
  fallbackUrl: string;
  aspectRatio: '16:9' | '4:3' | '1:1' | '3:4' | '21:9';
  recommendedPlacements: string[];
}

export const REAL_MARUDHAR_SHOP_IMAGES: ShopImageItem[] = [];

export const getShopImageById = (id: string): ShopImageItem | undefined => {
  return REAL_MARUDHAR_SHOP_IMAGES.find((img) => img.id === id);
};

export const getShopImagesByCategory = (category: ShopImageItem['category']): ShopImageItem[] => {
  return REAL_MARUDHAR_SHOP_IMAGES.filter((img) => img.category === category);
};
