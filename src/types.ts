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
  sku?: string;               // Unique Product ID / Stock Keeping Unit (e.g. MFP-M01-RUN)
  slug?: string;              // Unique public URL slug (e.g. marudhar-airglide-knit-running-shoes)
  metaTitle?: string;         // Open Graph / WhatsApp preview custom title
  metaDescription?: string;   // Open Graph / WhatsApp preview custom description
  ogImage?: string;           // Open Graph / WhatsApp preview custom image URL
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
  isFeatured?: boolean;
  isLimitedStock?: boolean;
  isTrending?: boolean;
  status?: 'active' | 'hidden' | 'out_of_stock';
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

export interface FloatingShoeItem {
  id: string;
  name: string;
  imageUri: string;
  speedSec: number;
  rotationDeg: number;
  initialX: string;
  initialY: string;
  scale: number;
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

  // Premium Hero Experience V2.0 Controls
  bgType?: 'gradient' | 'image' | 'video';
  heroVideoUrl?: string;
  gradientTheme?: 'deep_emerald' | 'warm_noir' | 'royal_gold' | 'midnight_luxury';

  primaryBtnText?: string;
  primaryBtnLink?: string;
  whatsappBtnText?: string;
  whatsappBtnLink?: string;
  buyNowBtnText?: string;
  buyNowBtnLink?: string;

  floatingShoes?: FloatingShoeItem[];

  particleDensity?: 'off' | 'low' | 'medium' | 'high';
  enableLightRays?: boolean;
  glowStrength?: 'subtle' | 'medium' | 'intense';
  parallaxStrength?: 'disabled' | 'subtle' | 'medium' | 'strong';
  animationSpeed?: 'slow' | 'normal' | 'fast';
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

export interface SavedAddress {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault?: boolean;
}

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PACKING'
  | 'PACKED'
  | 'READY_TO_DISPATCH'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';

export type PaymentMethodType = 'UPI' | 'QR_SCAN' | 'CARD' | 'NET_BANKING' | 'WALLET' | 'COD';

export interface RefundRecord {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  gatewayProvider: string;
  createdAt: string;
}

export interface PaymentSettings {
  merchantName: string;
  upiId: string;
  upiName?: string;
  qrCodeCustomImage?: string;
  qrCodeUrl?: string;
  paymentInstructions?: string;
  paymentEnabled?: boolean;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  gatewayProvider?: 'RAZORPAY' | 'PHONEPE' | 'CASHFREE' | 'PAYU' | 'DIRECT_UPI_QR';
  apiKey?: string;
  apiSecret?: string;
  keyId?: string;
  keySecret?: string;
  merchantId?: string;
  webhookSecret?: string;
  enableUPI?: boolean;
  enableQR?: boolean;
  enableCards?: boolean;
  enableNetBanking?: boolean;
  enableWallets?: boolean;
  enableCOD?: boolean;
  isTestMode?: boolean;
  autoApprovePaidOrders?: boolean;
  currencySymbol?: string;
  gstPercent?: number;
  flatShippingRate?: number;
  standardDeliveryCharge?: number;
  freeShippingMinAmount?: number;
  noReturnPolicyEnabled?: boolean;
  noExchangePolicyEnabled?: boolean;
  policyText?: string;
  deliveryMessage?: string;
  estimatedDeliveryTime?: string;
  // Payment Method Based Pricing / Convenience Fee
  enableConvenienceFee?: boolean;
  convenienceFeePercent?: number;
  applyFeeToOnlineOnly?: boolean;
}

export interface ShippingAddressInfo {
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  landmark?: string;
}

export interface CustomerOrder {
  id: string; // e.g. #MFP1025
  orderNumber: number;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: ShippingAddressInfo;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  taxAmount: number;
  convenienceFee?: number;
  totalAmount: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  transactionId: string;
  paymentReference?: string;
  paymentTimestamp: string;
  createdAt: string;
  updatedAt: string;
  statusHistory?: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  customerNotes?: string;
}

export interface TransactionRecord {
  id: string;
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus;
  transactionRef: string;
  gatewayProvider: string;
  timestamp: string;
}

export interface AdminNotification {
  id: string;
  orderId: string;
  customerName: string;
  totalAmount: number;
  productCount: number;
  paymentStatus: string;
  timestamp: string;
  read: boolean;
}

export interface MarketingConsent {
  accepted: boolean;
  email: boolean;
  push: boolean;
  whatsApp: boolean;
  updatedAt: string;
}

export interface MarketingSubscriber {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  preferences: MarketingConsent;
  pushPermissionGranted?: boolean;
  subscribedAt: string;
}

export type CampaignType = 'EMAIL' | 'PUSH' | 'WHATSAPP';

export type CampaignCategory =
  | 'DAILY_OFFERS'
  | 'FESTIVAL_OFFERS'
  | 'WEEKEND_DEALS'
  | 'FLASH_SALES'
  | 'NEW_ARRIVALS'
  | 'BACK_IN_STOCK'
  | 'BIRTHDAY_OFFERS'
  | 'SPECIAL_DISCOUNT'
  | 'NEW_COLLECTION'
  | 'EXCLUSIVE_OFFER'
  | 'LIMITED_STOCK'
  | 'PRICE_DROP'
  | 'FESTIVAL_SALE';

export interface MarketingCampaign {
  id: string;
  title: string;
  subject?: string;
  category: CampaignCategory | string;
  channel: CampaignType;
  htmlContent?: string;
  pushMessage?: string;
  whatsAppTemplate?: string;
  whatsAppImage?: string;
  targetLink?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENT';
  scheduledAt?: string;
  sentAt?: string;
  recipientsCount: number;
  deliveredCount: number;
  openCount: number;
  clickCount: number;
  createdAt: string;
}

export interface CustomerProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  loginProvider: string;
  createdAt: string;
  lastLogin: string;
  wishlist?: string[]; // list of product IDs
  savedAddresses?: SavedAddress[];
  orderHistory?: CustomerOrder[];
  marketingConsent?: MarketingConsent;
}

export interface InstagramConfig {
  enabled: boolean;
  username: string; // default "marudhar_fashion_point"
  displayName: string; // default "Marudhar Fashion Point"
  accessToken?: string;
  appId?: string;
  postLimit: number; // 6, 8, 12, 16
  layout: 'grid' | 'carousel' | 'masonry';
  showBio: boolean;
  showStats: boolean;
  autoRefreshMinutes: number;
  lastSyncedAt?: string;
}

export interface InstagramProfile {
  username: string;
  displayName: string;
  profilePictureUrl: string;
  followersCount: string;
  followingCount: string;
  postsCount: string;
  biography: string;
  verified: boolean;
  isLiveApiConnected: boolean;
}

export interface InstagramMediaItem {
  id: string;
  permalink: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  thumbnailUrl?: string;
  caption: string;
  timestamp: string;
  likeCount: number;
  commentsCount: number;
  category: string;
}

export interface PetShoeConfig {
  enabled: boolean;
  imageUri: string; // custom uploaded or default luxury sneaker
  wingsEnabled: boolean;
  wingColor: string; // e.g. '#F59E0B', '#E5E7EB', '#F43F5E', '#10B981', '#3B82F6'
  glowEnabled: boolean;
  glowColor: string; // e.g. '#F59E0B', '#06B6D4', '#E11D48'
  shineEnabled: boolean;
  movementSpeed: 'slow' | 'medium' | 'fast';
  sizePx: number; // e.g. 130
  wingFlapSpeed: 'slow' | 'normal' | 'fast';
  hoverAmplitude: 'gentle' | 'moderate' | 'dynamic';
  opacity: number; // 0.5 - 1.0
  defaultPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center-right';
  enableClickInteraction: boolean;
  enableScrollFollowing: boolean;
  enableIdleMovement: boolean;
  enableSpeechBubbles: boolean;
  speechMessages: string[];
  scheduleMode: 'always' | 'homepage_only' | 'festival_only';
}

export interface HangingSneakerConfig {
  enabled: boolean;
  imageUri: string; // custom uploaded image URL, or fallback default studio photograph
  laceLength: number; // lace drop length in px (e.g. 240)
  sizePx: number; // shoe width/scale in desktop view (e.g. 260)
  positionRight: number; // right offset spacing in rem/px (e.g. 10)
  positionTop: number; // top offset in px (e.g. 180)
  swingSpeedSec: number; // pendulum swing speed duration in seconds (6-8s)
  swingAngleDeg: number; // pendulum swing angle in degrees (3-5deg)
  baseRotationDeg: number; // base tilt angle in degrees (e.g. -18deg)
  enablePhysicsAnimation: boolean;
  enableShineEffect?: boolean; // gentle luxury glossy shine overlay
  colorTheme?: 'ONE8_BURGUNDY' | 'MARUDHAR_HERITAGE' | 'MIDNIGHT_NAVY' | 'GOLD_LUXURY';
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
    paymentSettings?: PaymentSettings;
  };
}

export interface PublishedVersionHistory {
  id: string;
  versionNumber: string;
  publishedAt: string;
  publishedBy: string;
  summary: string;
  changeCount: number;
  data: {
    products: Product[];
    reviews: Review[];
    storeInfo: StoreInfo;
    heroContent: HeroContent;
    announcements: string[];
    categoryHighlights: CategoryHighlight[];
    trendingCollections: TrendingCollectionItem[];
    paymentSettings?: PaymentSettings;
    hangingSneakerConfig?: HangingSneakerConfig;
    petShoeConfig?: PetShoeConfig;
    instagramConfig?: InstagramConfig;
  };
}
