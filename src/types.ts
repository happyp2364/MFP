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
  createdAt?: string;
  updatedAt?: string;
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
  instagramHandle?: string;
  approved?: boolean;
  hidden?: boolean;
  deleted?: boolean;
  pinned?: boolean;
  featured?: boolean;
  reply?: string;
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
  googleMapsLink?: string;
  coordinates?: string | { lat: number; lng: number };
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
  stat1Number?: string;
  stat1Label?: string;
  stat2Number?: string;
  stat2Label?: string;
  stat3Number?: string;
  stat3Label?: string;

  primaryBtnText?: string;
  primaryBtnLink?: string;
  whatsappBtnText?: string;
  whatsappBtnLink?: string;
  buyNowBtnText?: string;
  buyNowBtnLink?: string;

  bgType?: 'gradient' | 'image' | 'video';
  heroVideoUrl?: string;
  gradientTheme?: 'deep_emerald' | 'warm_noir' | 'royal_gold' | 'midnight_luxury';
  floatingShoes?: FloatingShoeItem[];
  particleDensity?: 'off' | 'low' | 'medium' | 'high';
  enableLightRays?: boolean;
  glowStrength?: 'subtle' | 'medium' | 'intense';
  parallaxStrength?: 'disabled' | 'subtle' | 'medium' | 'strong';
  animationSpeed?: 'slow' | 'normal' | 'fast';
}

export interface CategoryHighlight {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  itemCount: string;
  icon: string;
  subcategories: string[];
  featured?: boolean;
  trending?: boolean;
  popular?: boolean;
  newBadge?: boolean;
  enabled?: boolean;
  displayOrder?: number;
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

  // Checkout & Product Action Button Customization Settings
  enableBuyNow?: boolean;
  enableBuyWhatsApp?: boolean;
  enableAddToCart?: boolean;
  enableCashfree?: boolean;
  actionButtonsOrder?: string[];
  buyNowButtonText?: string;
  buyNowButtonColor?: string;
  buyWhatsAppButtonText?: string;
  buyWhatsAppButtonColor?: string;
  addToBagButtonText?: string;
  addToBagButtonColor?: string;
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
  orderId?: string;
  customerName?: string;
  totalAmount?: number;
  productCount?: number;
  paymentStatus?: string;
  message?: string;
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

export type SoundType =
  | 'click'
  | 'hover'
  | 'addToCart'
  | 'wishlist'
  | 'paymentSuccess'
  | 'orderSuccess'
  | 'notification'
  | 'error'
  | 'login'
  | 'logout';

export interface SoundConfig {
  enabled: boolean;
  masterVolume: number; // 0 - 100
  enableHoverSounds: boolean;
  enableButtonClicks: boolean;
  enableAddToCartSounds: boolean;
  enableOrderSuccessSounds: boolean;
  customSoundUrls: Partial<Record<SoundType, string>>;
}

export interface CustomerSoundSettings {
  muted: boolean;
  volume: number; // 0 - 100
  enabledTypes?: Record<string, boolean>;
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
    soundConfig?: SoundConfig;
  };
}

export interface PendingChangeItem {
  id: string;
  type: 'PRODUCT_ADD' | 'PRODUCT_UPDATE' | 'PRODUCT_DELETE' | 'PRICE_CHANGE' | 'STOCK_CHANGE' | 'BANNER' | 'CATEGORIES' | 'OFFERS' | 'THEME' | 'SETTINGS' | 'REVIEW' | 'OTHER';
  title: string;
  details: string;
  timestamp?: string;
}

export interface PublishStepLog {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  message?: string;
  timestamp?: string;
  errorCode?: string;
  collectionName?: string;
  documentId?: string;
  stackTrace?: string;
}

export interface PublishProgressState {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  percentage: number;
  logs: PublishStepLog[];
  error?: string;
  isCompleted?: boolean;
  errorCode?: string;
  collectionName?: string;
  documentId?: string;
  stackTrace?: string;
  documentSize?: string;
  batchSize?: number;
  numDocuments?: number;
  commitDuration?: string;
  writeCount?: number;
}

export interface PublishResult {
  success: boolean;
  versionNumber?: string;
  publishedAt?: string;
  totalUpdatedDocs?: number;
  publishDuration?: string;
  message?: string;
  logs?: PublishStepLog[];
  errorCode?: string;
  collectionName?: string;
  documentId?: string;
  stackTrace?: string;
  documentSize?: string;
  batchSize?: number;
  numDocuments?: number;
  commitDuration?: string;
  writeCount?: number;
}

export interface ToastState {
  id?: string;
  show?: boolean;
  message?: string;
  text?: string;
  type?: 'success' | 'error' | 'info';
}

export interface AnnouncementItem {
  id: string;
  text: string;
  enabled: boolean;
  icon?: string;
  buttonText?: string;
  buttonUrl?: string;
  startDate?: string;
  endDate?: string;
  autoActivate?: boolean;
  autoExpire?: boolean;
  deviceVisibility?: 'both' | 'mobile' | 'desktop';
}

export interface TopAnnouncementBarConfig {
  announcements: AnnouncementItem[];
  backgroundColor: string;
  textColor: string;
  stylePreset: 'cyan' | 'emerald' | 'amber' | 'rose' | 'luxury_dark' | 'custom';
  intervalSpeed: number;
  
  // Custom Styles
  fontSize?: number; // in px, e.g., 12, 14
  paddingY?: number; // in px
  alignment?: 'left' | 'center' | 'right';
  autoScroll?: boolean;
  permanentlyHidden?: boolean;

  // Countdown Feature
  countdownEnabled?: boolean;
  countdownFestivalName?: string;
  countdownEndDate?: string; // YYYY-MM-DD
  countdownEndTime?: string; // HH:MM
  countdownExpiryOption?: 'hide' | 'ended_text' | 'switch_slide';
  countdownReverseMode?: boolean; // Enable Reverse Timeline
}

export interface SocialPlatformConfig {
  id: string; // 'instagram' | 'facebook' | 'whatsapp' | 'youtube' | 'telegram' | 'twitter' | 'threads' | 'pinterest' | 'snapchat' | 'linkedin' | 'google_business'
  name: string;
  enabled: boolean;
  username: string;
  profileUrl: string;
  customIcon?: string;
  customButtonText?: string;
  customLabel?: string;
  displayOrder: number;
  openInNewTab: boolean;
  showAsFloating: boolean;
  showHeader: boolean;
  showFooter: boolean;
  showOnContact: boolean;
  showOnProduct: boolean;
  showOnHome: boolean;
  showOnMobile: boolean;
  showOnDesktop: boolean;
  iconColor: string;
  bgColor: string;
  hoverEffect: 'scale' | 'glow' | 'bounce' | 'fade' | 'rotate';
  animationType: 'none' | 'bounce' | 'pulse' | 'pulse-slow' | 'shake' | 'float';
}

export interface InstagramStoryHighlight {
  id: string;
  title: string;
  coverUrl: string;
  linkUrl: string;
}

export interface SocialInstagramMediaItem {
  id: string;
  type: 'post' | 'reel';
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  postUrl: string;
  createdAt: string;
}

export interface YouTubeVideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  views: string;
  duration: string;
  publishedAt: string;
  videoUrl: string;
}

export interface SocialMediaCenterConfig {
  platforms: SocialPlatformConfig[];
  instagramHighlights: InstagramStoryHighlight[];
  instagramMedia: SocialInstagramMediaItem[];
  youtubeVideos: YouTubeVideoItem[];
  youtubeShorts: YouTubeVideoItem[];
  youtubeFeaturedVideo?: YouTubeVideoItem;
  youtubePlaylists?: { id: string; name: string; count: string; url: string }[];
  whatsappPredefinedMessage?: string;
  whatsappSupportName?: string;
  whatsappSupportAvatar?: string;
  whatsappSupportRole?: string;
  facebookPageLikeUrl?: string;
  facebookMessengerUrl?: string;
  facebookFeedEmbed?: string;
}

export interface SocialAnalyticsLog {
  clickCount: Record<string, number>;
  lastClickTimestamp: Record<string, string>;
  dailyClicks: Record<string, number>; // date string "YYYY-MM-DD" -> click count
  weeklyClicks: Record<string, number>; // week string "YYYY-[W]WW" -> click count
  monthlyClicks: Record<string, number>; // month string "YYYY-MM" -> click count
}

export type CouponType = 'PERCENTAGE' | 'FLAT' | 'BUY_X_GET_Y' | 'FREE_SHIPPING' | 'FREE_GIFT';

export interface PromoCoupon {
  id: string;
  name: string;
  code: string;
  description: string;
  bannerImage?: string;
  bannerUrl?: string;
  type: CouponType;
  discountValue: number; // e.g., 10 for 10% or 100 for ₹100 Flat
  maxDiscount?: number; // Maximum discount limit
  minOrderAmount?: number; // Minimum order subtotal required
  maxOrderAmount?: number; // Maximum order subtotal allowed
  startDate: string; // ISO or YYYY-MM-DD
  endDate: string; // ISO or YYYY-MM-DD
  usageLimit?: number; // Maximum global uses
  perCustomerLimit?: number; // Maximum uses per customer
  priority: number; // Priority order for auto-apply or lists
  stackable: boolean; // Can be combined with other coupons
  autoApply: boolean; // Automatically apply during checkout
  visible: boolean; // Is visible in checkout selection list
  visibility?: 'public' | 'hidden';
  featured: boolean; // Is highlighted/featured
  status: 'active' | 'paused' | 'disabled' | 'archived';

  // Product Restrictions
  restrictType: 'ALL' | 'PRODUCTS' | 'CATEGORIES' | 'COLLECTIONS' | 'BRANDS' | 'TRENDING' | 'FEATURED' | 'BEST_SELLER';
  restrictProductIds?: string[]; // Applicable product IDs
  restrictCategories?: string[]; // Applicable category highlights or subcategories
  restrictCollections?: string[]; // e.g., 'men', 'women', 'kids'
  restrictBrands?: string[]; // list of allowed brands

  // Size & Color Restrictions
  restrictSizes?: string[]; // e.g., ["6", "7", "8", "9", "10"]
  restrictColors?: string[]; // e.g., ["Black", "White", "Blue"]

  // Price & Stock range
  minProductPrice?: number;
  maxProductPrice?: number;
  restrictStock?: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'NEW_ARRIVALS' | 'FEATURED' | 'CLEARANCE_SALE';

  // Real-time usage stats
  usageCount: number;
  successCount: number;
  failedCount: number;
  revenueGenerated: number;
  discountGiven: number;
  createdAt: string;
}

export interface LuckyBoxReward {
  id: string;
  title: string;
  type: CouponType | 'NONE' | 'POINTS' | 'GIFT' | 'BETTER_LUCK';
  value: number;
  probability: number;
  usageLimit: number;
  usageCount: number;
  perCustomerLimit: number;
  couponCode?: string;
  image?: string;
}

export interface ScratchReward {
  id: string;
  name: string;
  type: CouponType | 'NONE' | 'POINTS' | 'GIFT' | 'BETTER_LUCK';
  value: number;
  probability: number;
  usageLimit: number;
  usageCount: number;
  perCustomerLimit: number;
  enabled: boolean;
  expiryDate?: string;
  couponCode?: string;
  image?: string;
}

export interface ScratchWinConfig {
  enabled: boolean;
  permanentlyDisabled: boolean;
  showOnHomepage: boolean;
  showOnProductPage: boolean;
  showOnCheckout: boolean;
  showOnOrderSuccess: boolean;
  firstVisitOnly: boolean;
  firstOrderOnly: boolean;
  returningCustomerOnly: boolean;
  newCustomerOnly: boolean;
  festivalOnly: boolean;
  dailyLimit: number;
  perCustomerLimit: number;
  globalUsageLimit: number;
  minCartValue: number;
  startDate?: string;
  endDate?: string;
  dailyActiveHoursStart?: string;
  dailyActiveHoursEnd?: string;
  showAfterSeconds?: number;
  showAfterPageViews?: number;
  showExitIntent?: boolean;
  rewards: ScratchReward[];
}

export interface LuckyBoxConfig {
  enabled: boolean;
  permanentlyDisabled: boolean;
  showOnHomepage: boolean;
  showOnProductPage: boolean;
  showOnCheckout: boolean;
  showOnOrderSuccess: boolean;
  firstVisitOnly: boolean;
  firstOrderOnly: boolean;
  returningCustomerOnly: boolean;
  newCustomerOnly: boolean;
  festivalOnly: boolean;
  dailyLimit: number;
  perCustomerLimit: number;
  globalUsageLimit: number;
  minCartValue: number;
  startDate?: string;
  endDate?: string;
  dailyActiveHours?: { start: string; end: string };
  showAfterSeconds?: number;
  showAfterPageViews?: number;
  showExitIntent?: boolean;
  rewards: LuckyBoxReward[];
}

export interface WheelSection {
  id: string;
  title: string;
  type: CouponType | 'NONE' | 'POINTS' | 'GIFT' | 'BETTER_LUCK';
  value: number;
  probability: number;
  couponCode?: string;
  color: string;
  icon?: string;
}

export interface SpinWheelConfig {
  enabled: boolean;
  sectionsCount: 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  sections: WheelSection[];
  soundEnabled: boolean;
  celebrationEnabled: boolean;
  autoApplyCoupon: boolean;
  canSpinAgainDays: number;
  minCartValue?: number;
}

export interface FlashDealConfig {
  masterEnabled: boolean;
}

export interface FlashDeal {
  id: string;
  title: string;
  status: 'active' | 'paused' | 'scheduled' | 'expired' | 'disabled';
  targetType: 'ALL' | 'PRODUCTS' | 'CATEGORIES' | 'COLLECTIONS' | 'BRANDS' | 'SIZES' | 'COLORS' | 'PRICE_RANGE' | 'STOCK_STATUS' | 'FEATURED' | 'NEW_ARRIVALS' | 'BEST_SELLERS';
  targetIds?: string[]; // e.g. Product IDs, Category names
  targetPriceRange?: [number, number];
  targetSizes?: string[];
  targetColors?: string[];
  
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  
  startDate: string;
  endDate: string;
  timezone: string;
  
  isFeatured?: boolean;
  isPinned?: boolean;
  
  showCountdown: boolean;
  countdownFormat: { days: boolean; hours: boolean; minutes: boolean; seconds: boolean };
  hideAfterExpiry: boolean;
  autoStart?: boolean;
  autoStop?: boolean;
  replaceWithNextId?: string;
  
  lowStockMessageEnabled: boolean;
  lowStockThreshold: number;
  lowStockCustomMessage?: string;
  scarcityMessageTemplate?: string;
  scarcityStyling?: {
    textColor: string;
    bgColor: string;
    icon: string;
    animation: 'none' | 'pulse' | 'glow' | 'bounce';
  };
  
  displayLocations: ('homepage' | 'homepage_hero' | 'product_page' | 'checkout' | 'cart' | 'category_page' | 'search_results' | 'floating_banner' | 'announcement_bar' | 'popup')[];
  
  styling: {
    bgColor: string;
    textColor: string;
    borderColor?: string;
    animation?: 'none' | 'pulse' | 'glow' | 'bounce';
    countdownTheme?: 'minimal' | 'luxury' | 'bold' | 'classic';
    fontFamily?: string;
    glowEffect?: boolean;
    buttonStyle?: string;
  };
  
  analytics: {
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

export interface EngagementAnalytics {
  luckyBoxOpens: number;
  wheelSpins: number;
  couponsWon: number;
  couponsUsed: number;
  flashDealClicks: number;
  flashDealConversions: number;
  revenueGenerated: number;
  topPerformingRewardId?: string;
  mostClaimedCouponCode?: string;
}

export interface OrderCelebrationConfig {
  enabled: boolean;
  confetti: boolean;
  sparkles: boolean;
  balloons: boolean;
  sound: boolean;
  successAnimation: boolean;
  duration: number; // in seconds
  speed: 'slow' | 'medium' | 'fast';
  mobileOnly: boolean;
  desktopOnly: boolean;
}

export interface BackupHistoryItem {
  id: string;
  timestamp: string;
  fileName: string;
  fileId: string;
  size: number;
  status: 'SUCCESS' | 'FAILED';
  type: 'MANUAL' | 'AUTO_DAILY' | 'AUTO_WEEKLY' | 'AUTO_MONTHLY';
  entitiesIncluded: string[];
}

export interface DriveBackupConfig {
  isConnected: boolean;
  connectedEmail?: string;
  driveFolderId?: string;
  autoBackupEnabled: boolean;
  dailyEnabled: boolean;
  weeklyEnabled: boolean;
  monthlyEnabled: boolean;
  lastBackupAt?: string;
  history: BackupHistoryItem[];
}


export interface DiagnosticIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'runtime' | 'performance' | 'security' | 'accessibility' | 'ui' | 'firestore' | 'logic';
  location: {
    file?: string;
    component?: string;
    function?: string;
  };
  description: string;
  suggestedFix: string;
  isSafeToFix: boolean;
  status: 'detected' | 'fixing' | 'fixed' | 'failed' | 'ignored';
  detectedAt: string;
}

export interface DiagnosticScanResult {
  scanId: string;
  timestamp: string;
  issues: DiagnosticIssue[];
  healthScores: {
    performance: number;
    security: number;
    accessibility: number;
    ui: number;
    firestore: number;
    overall: number;
  };
}

export interface DiagnosticCenterState {
  lastScan?: DiagnosticScanResult;
  isScanning: boolean;
  activeFixes: string[]; // Issue IDs
  restorePoints: {
    id: string;
    timestamp: string;
    description: string;
    data: any; // Snapshot of state or code
  }[];
}





