export type GenderCategory = 'men' | 'women' | 'kids' | 'all';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface SizeStock {
  size: string;
  isAvailable: boolean;
  inStock: boolean;
  stockQuantity: number;
  system?: 'UK' | 'EU' | 'US' | 'Clothing' | 'Kids' | 'Custom';
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'men' | 'women' | 'kids';
  subcategory: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  description: string;
  sizes: string[];
  sizeStocks?: SizeStock[];
  colors: ProductColor[];
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isLimitedStock?: boolean;
  isTrending?: boolean;
  collectionTags: string[];
  material?: string;
  inStock: boolean;
}

export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  productBought?: string;
  avatar?: string;
}

export interface FilterState {
  searchQuery: string;
  category: GenderCategory;
  subcategories: string[];
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  badgeFilter: 'all' | 'bestsellers' | 'new' | 'limited';
  collection: string;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'discount';
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface ContactFormInput {
  name: string;
  phone: string;
  email: string;
  category: string;
  message: string;
}

export interface StoreInfo {
  name: string;
  tagline: string;
  altTagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  googleMapsEmbed: string;
  businessHours: string;
  ownerContact: string;
  instagram: string;
  facebook: string;
  youtube: string;
}

export interface HeroContent {
  badge: string;
  headlineMain: string;
  headlineHighlight: string;
  subtitle: string;
  heroImage: string;
  stat1Number: string;
  stat1Label: string;
  stat2Number: string;
  stat2Label: string;
  stat3Number: string;
  stat3Label: string;
}

export interface CategoryHighlight {
  id: 'men' | 'women' | 'kids';
  title: string;
  subtitle: string;
  image: string;
  itemCount: string;
  icon: string;
  subcategories: string[];
}

export interface TrendingCollectionItem {
  id: string;
  name: string;
  tagline: string;
  image: string;
  count: string;
}

export interface AdminUser {
  username: string;
  isLoggedIn: boolean;
  lastLoginTime?: string;
}

// Enterprise Security Types
export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  category: 'AUTH' | 'PRODUCT' | 'SETTINGS' | 'BACKUP' | 'SECURITY' | 'MEDIA';
  details: string;
  userEmail: string;
  status: 'SUCCESS' | 'WARNING' | 'DANGER';
  ipAddress?: string;
}

export interface StoreBackupSnapshot {
  id: string;
  timestamp: string;
  createdBy: string;
  dataSizeKb: number;
  data: {
    products: Product[];
    reviews: Review[];
    storeInfo: StoreInfo;
    heroContent: HeroContent;
    announcements: string[];
    categoryHighlights: CategoryHighlight[];
    trendingCollections: TrendingCollectionItem[];
  };
}
