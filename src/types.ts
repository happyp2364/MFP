export type GenderCategory = 'men' | 'women' | 'kids' | 'all';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id: string;          // unique variant ID (e.g. prodId_color_size)
  sku: string;         // independent SKU
  barcode: string;     // independent barcode
  color: string;       // color name
  colorCode: string;   // color hex code
  size: string;        // size value
  price: number;       // independent price
  originalPrice: number; // independent original price
  discount: number;    // independent discount %
  stock: number;       // independent stock
  lowStockLimit: number; // independent low stock alert limit
  weight?: number;     // independent weight
  images: string[];    // independent color-specific images
  video?: string;      // optional video URL
  status: 'active' | 'hidden' | 'out_of_stock';
  updatedAt: string;
  updatedBy: string;
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
  variants?: ProductVariant[];
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
  selectedVariant?: ProductVariant;
}

export interface ContactFormInput {
  name: string;
  phone: string;
  email: string;
  category: string;
  message: string;
}

export interface OwnerMember {
  id: string;
  fullName: string;
  position: string; // e.g. Founder, Owner, Co-Owner, Director, Store Manager, Operations Head, Marketing Head, Inventory Manager
  roleType: 'owner' | 'team';
  shortIntro: string;
  experience: string;
  specialization: string;
  profilePhoto: string;
  contactNumber?: string;
  email?: string;
  signature?: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    whatsapp?: string;
    linkedin?: string;
    website?: string;
  };
  enabled: boolean;
  featured: boolean;
  displayOrder: number;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  image?: string;
  icon?: string;
  enabled: boolean;
  displayOrder: number;
}

export interface StoreAchievement {
  id: string;
  type: 'certificate' | 'award' | 'media' | 'milestone';
  title: string;
  issuerOrPublisher: string;
  year: string;
  description: string;
  imageUrl?: string;
  link?: string;
  enabled: boolean;
  displayOrder: number;
}

export interface LiveCounterItem {
  id: string;
  label: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  autoCalculate: boolean;
  autoMetric?: 'years' | 'customers' | 'products' | 'orders' | 'reviews';
  icon?: string;
  enabled: boolean;
  displayOrder: number;
}

export interface StoreGalleryItem {
  id: string;
  category: 'shop_inside' | 'shop_outside' | 'team' | 'festival' | 'events' | 'general';
  title: string;
  caption?: string;
  imageUrl: string;
  enabled: boolean;
  displayOrder: number;
}

export interface AboutUsConfig {
  businessName: string;
  establishmentYear: string;
  experienceYears: string;
  tagline: string;
  shopDescription: string;
  businessStory: string;
  familyBusinessInfo: string;
  mission: string;
  vision: string;
  journey: string;
  storeHighlights: string[];
  mainHeaderImage?: string;
  ownersAndTeam: OwnerMember[];
  timeline: TimelineEvent[];
  achievements: StoreAchievement[];
  counters: LiveCounterItem[];
  gallery: StoreGalleryItem[];
  socialLinks: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    whatsapp?: string;
    linkedin?: string;
    website?: string;
  };
  updatedAt?: string;
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

  // Header Customization Options
  showHeaderLogo?: boolean;
  showHeaderSearch?: boolean;
  showHeaderCategories?: boolean;
  showHeaderWishlist?: boolean;
  showHeaderCart?: boolean;
  showHeaderAccount?: boolean;
  showHeaderOffers?: boolean;
  headerLogoText?: string;
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

export interface MegaMenuSubcategory {
  id: string;
  name: string;
  displayOrder: number;
  enabled: boolean;
}

export interface MegaMenuSection {
  id: string;
  title: string;
  displayOrder: number;
  subcategories: MegaMenuSubcategory[];
}

export interface MegaMenuCategory {
  id: string;
  name: string;
  displayOrder: number;
  enabled: boolean;
  hidden?: boolean;
  icon?: string;
  image?: string;
  banner?: string;
  sections: MegaMenuSection[];
}

export interface CategoryHighlight {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  itemCount: string;
  icon: string;
  subcategories: string[];
  buttonText?: string;
  categoryFilter?: string;
  subcategoryFilter?: string;
  linkedProductIds?: string[];
  scheduleStart?: string;
  scheduleEnd?: string;
  hidden?: boolean;
  featured?: boolean;
  trending?: boolean;
  popular?: boolean;
  newBadge?: boolean;
  enabled?: boolean;
  displayOrder?: number;
  coverType?: 'admin' | 'highest_selling' | 'featured' | 'ai';
}

export interface TrendingCollectionItem {
  id: string;
  name: string;
  tagline: string;
  image: string;
  count: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  roleId: string; // e.g. 'super_admin', 'admin', 'inventory_manager', etc.
  roleName?: string;
  status: 'active' | 'disabled';
  customPermissions?: Partial<AdminPermissionMatrix>; // Optional per-user overrides
  createdAt: string;
  createdBy: string;
  lastLogin?: string;
  loginHistory?: AdminLoginHistoryEntry[];
  deviceInfo?: string;
  forceLoggedOutAt?: string; // ISO string to invalidate active sessions
  phoneNumber?: string;
  username?: string;
  isLoggedIn?: boolean;
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
  isOpenBoxDelivery?: boolean;
  openBoxDeliveryNote?: string;
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
  marketingEnabled?: boolean;
  email: boolean;
  emailMarketing?: boolean;
  push: boolean;
  pushNotifications?: boolean;
  whatsApp: boolean;
  whatsappMarketing?: boolean;
  updatedAt: string;
  updatedBy?: string;
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

  // Top Bar Secondary Navigation Links & Options
  showStoreLocator?: boolean;
  storeLocatorText?: string;
  showTrackOrder?: boolean;
  trackOrderText?: string;
  showAbout?: boolean;
  aboutText?: string;
  showHelp?: boolean;
  helpText?: string;
  showContact?: boolean;
  contactText?: string;
  showLanguage?: boolean;
  languageText?: string;
  showOfferText?: boolean;
  offerText?: string;

  // Countdown Feature
  countdownEnabled?: boolean;
  countdownFestivalName?: string;
  countdownEndDate?: string; // YYYY-MM-DD
  countdownEndTime?: string; // HH:MM
  countdownExpiryOption?: 'hide' | 'ended_text' | 'switch_slide';
  countdownReverseMode?: boolean; // Enable Reverse Timeline
}

export interface SocialPlatformConfig {
  id: string;
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
  
  // Advanced Placements
  showTopBar?: boolean;
  showOnCheckout?: boolean;
  showOnAboutUs?: boolean;
  showOnOrderSuccess?: boolean;
  showOnCustomerProfile?: boolean;
  showOnPopup?: boolean;
  showOnCustomSection?: boolean;
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

  // WhatsApp Advanced Configs
  whatsappPhone?: string;
  whatsappCountryCode?: string;
  whatsappDefaultMessage?: string;
  whatsappProductInquiryMessage?: string;
  whatsappOrderMessage?: string;
  whatsappSupportMessage?: string;
  whatsappBulkOrderMessage?: string;
  whatsappFestivalGreeting?: string;
  whatsappBusinessHours?: string;
  whatsappAutoReplyText?: string;

  // Instagram Advanced Configs
  instagramFollowButtonText?: string;
  instagramProfilePictureLink?: string;
  instagramFeedEnabled?: boolean;
  instagramGalleryEnabled?: boolean;
  instagramReviewIntegrationEnabled?: boolean;

  // YouTube Advanced Configs
  youtubeChannelName?: string;
  youtubeChannelUrl?: string;
  youtubeSubscribeButtonText?: string;
  youtubeShortsSectionEnabled?: boolean;

  // Facebook Advanced Configs
  facebookPageName?: string;
  facebookPageUrl?: string;
  facebookMessengerLink?: string;
  facebookLikeButtonEnabled?: boolean;
  facebookShareButtonEnabled?: boolean;
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

export interface FlashDeal {
  id: string;
  title: string;
  status: 'active' | 'paused' | 'scheduled' | 'expired';
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
  
  showCountdown: boolean;
  countdownFormat: { days: boolean; hours: boolean; minutes: boolean; seconds: boolean };
  hideAfterExpiry: boolean;
  replaceWithNextId?: string;
  
  lowStockMessageEnabled: boolean;
  lowStockThreshold: number;
  lowStockCustomMessage?: string;
  
  displayLocations: ('homepage_hero' | 'product_page' | 'checkout' | 'cart' | 'category_page' | 'floating_banner' | 'announcement_bar' | 'popup')[];
  
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

export type WhatsAppTemplateActionCategory =
  | 'buy_now'
  | 'cart_order'
  | 'cod_order'
  | 'online_order'
  | 'inquiry'
  | 'product_enquiry'
  | 'bulk_order'
  | 'wholesale_order'
  | 'support_request';

export interface WhatsAppTemplateAdvancedOptions {
  showProductImageLink: boolean;
  showProductURL: boolean;
  showCouponDetails: boolean;
  showCustomerAddress: boolean;
  showPaymentDetails: boolean;
  showDeliveryNotes: boolean;
  customThankYouMessage: string;
  storePoliciesNote: string;
  returnExchangeNote: string;
}

export interface WhatsAppTemplate {
  id: string;
  title: string;
  actionCategory: WhatsAppTemplateActionCategory;
  enabled: boolean;
  isActiveForAction: boolean;
  isDefault?: boolean;
  messageBody: string;
  advancedOptions: WhatsAppTemplateAdvancedOptions;
  updatedAt: string;
}

export interface WhatsAppTemplatesConfig {
  templates: WhatsAppTemplate[];
  activeCategoryMap: Record<WhatsAppTemplateActionCategory, string>;
}

export interface OpenBoxDeliveryConfig {
  enabled: boolean;
  heading: string;
  description: string;
  icon: 'package' | 'shield' | 'box' | 'check' | 'truck' | 'eye' | 'lock' | 'award' | string;
  badgeColor: 'emerald' | 'amber' | 'blue' | 'indigo' | 'purple' | 'rose' | 'dark' | string;
  backgroundColor: 'emerald-light' | 'amber-light' | 'blue-light' | 'neutral-light' | 'dark-slate' | string;
  textColor: 'default' | 'dark' | 'emerald' | 'amber' | 'indigo' | string;
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'none';
  displayPriority: 'high' | 'normal' | 'low';
  applicabilityScope: 'all' | 'categories' | 'products';
  applicableCategoryIds: string[];
  applicableProductIds: string[];
  minOrderValue: number;
  paymentEligibility: 'all' | 'cod_only' | 'prepaid_only';
}

export const DEFAULT_OPEN_BOX_DELIVERY_CONFIG: OpenBoxDeliveryConfig = {
  enabled: true,
  heading: 'Open Box Delivery Available',
  description: 'Your order will be opened in front of you at the time of delivery for verification before handover.',
  icon: 'package',
  badgeColor: 'emerald',
  backgroundColor: 'emerald-light',
  textColor: 'default',
  borderStyle: 'dashed',
  displayPriority: 'high',
  applicabilityScope: 'all',
  applicableCategoryIds: [],
  applicableProductIds: [],
  minOrderValue: 0,
  paymentEligibility: 'all',
};

// ==========================================
// MULTI ADMIN MANAGEMENT SYSTEM & RBAC TYPES
// ==========================================

export type AdminModule =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'coupons'
  | 'reviews'
  | 'categories'
  | 'brands'
  | 'payments'
  | 'reports'
  | 'analytics'
  | 'website_settings'
  | 'theme'
  | 'hero'
  | 'announcements'
  | 'ai_features'
  | 'marketing'
  | 'whatsapp_templates'
  | 'google_drive_backup'
  | 'admin_management';

export type AdminAction = 'read' | 'create' | 'edit' | 'delete' | 'export';

export interface AdminModulePermissions {
  read: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
}

export type AdminPermissionMatrix = Record<AdminModule, AdminModulePermissions>;

export type BuiltInAdminRoleId =
  | 'super_admin'
  | 'admin'
  | 'inventory_manager'
  | 'order_manager'
  | 'marketing_manager'
  | 'finance_manager'
  | 'customer_support'
  | 'custom';

export interface AdminRole {
  id: string; // BuiltInAdminRoleId or custom generated ID
  name: string;
  description: string;
  isSystemPreset: boolean;
  permissions: AdminPermissionMatrix;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
}

export interface AdminLoginHistoryEntry {
  id: string;
  timestamp: string;
  ip?: string;
  device: string;
  loginMethod: 'google' | 'password';
  status: 'success' | 'failed';
  userAgent?: string;
}

// ==========================================
// AI HOME EXPERIENCE BUILDER TYPES
// ==========================================

export type HomepageSectionType =
  | 'hero_banner'
  | 'floating_sneaker'
  | 'mbh_shoe_carousel'
  | 'trending_shoes'
  | 'trending_shoes_collection'
  | 'price_point_699'
  | 'price_699_collection'
  | 'slider'
  | 'image_carousel'
  | 'video_banner'
  | 'featured_products'
  | 'trending_products'
  | 'new_arrivals'
  | 'best_sellers'
  | 'flash_sale'
  | 'festival_collection'
  | 'brands'
  | 'categories'
  | 'coupons'
  | 'announcements'
  | 'customer_reviews'
  | 'instagram_feed'
  | 'youtube_videos'
  | 'why_choose_us'
  | 'open_box_delivery'
  | 'offer_cards'
  | 'scrolling_banner'
  | 'countdown_timer'
  | 'newsletter'
  | 'faqs'
  | 'about_store'
  | 'custom_html'
  | 'rich_text'
  | 'gallery'
  | 'horizontal_product_slider'
  | 'vertical_product_list'
  | 'recently_viewed'
  | 'recommended_products'
  | 'ai_recommended'
  | 'quick_category_icons'
  | 'footer_banner';

export interface HomepageSectionStyling {
  bgColor?: string;
  bgGradient?: string;
  bgImage?: string;
  overlayOpacity?: number;
  textColor?: string;
  accentColor?: string;
  paddingTop?: number; // rem or px
  paddingBottom?: number;
  borderRadius?: number;
  shadow?: string;
  animation?: 'fade' | 'slide-up' | 'zoom' | 'none';
  fullWidth?: boolean;
}

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  title: string;
  subtitle?: string;
  enabled: boolean;
  visibleDevices?: ('desktop' | 'tablet' | 'mobile')[];
  styling: HomepageSectionStyling;
  contentData: Record<string, any>;
}

export interface HomepageConfigSchedule {
  enabled: boolean;
  startDate?: string;
  endDate?: string;
  timeOfDay?: 'all' | 'day' | 'night';
}

export interface HomepageConfig {
  id: string;
  name: string;
  presetName?: string;
  themeMode?: 'light' | 'dark' | 'luxury' | 'festival' | 'glassmorphic';
  sections: HomepageSection[];
  updatedAt: string;
  updatedBy?: string;
  schedule?: HomepageConfigSchedule;
}

export interface HomepageVersion {
  id: string;
  config: HomepageConfig;
  createdAt: string;
  createdBy: string;
  note?: string;
}

export interface HomepagePreset {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  badge: string;
  category?: string;
  tags?: string[];
  isCustom?: boolean;
  isFavorite?: boolean;
  isPinned?: boolean;
  createdAt?: string;
  scheduledAt?: string;
  thumbnailUrl?: string;
  config: Partial<HomepageConfig>;
}

export interface ActiveThemeDoc {
  themeId: string;
  presetName: string;
  themeMode?: 'light' | 'dark' | 'luxury' | 'festival' | 'glassmorphic';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
    textColor: string;
    cardBg: string;
  };
  fonts: {
    headingFont: string;
    bodyFont: string;
    scaleRatio: number;
  };
  layout: {
    containerWidth: string;
    borderRadius: number;
    spacing: string;
  };
  hero: {
    heroType: string;
    title?: string;
    subtitle?: string;
    bgGradient?: string;
  };
  cards: {
    style: string;
    borderRadius: number;
    shadow: string;
  };
  buttons: {
    style: string;
    borderRadius: number;
  };
  banners: {
    topAnnouncementEnabled: boolean;
    bannerStyle: string;
  };
  updatedAt: string;
  updatedBy: string;
}

export interface ProductFeedConfig {
  productsPerPage: number; // 12, 24, 36, 48
  infiniteScroll: boolean; // ON/OFF
  loadMoreButton: boolean; // ON/OFF
  maxHomepageProducts: number; // Max total homepage products allowed
  maxCategoryProducts: number; // Max category page products allowed
  duplicateDetection: boolean; // ON/OFF
  randomization: boolean; // ON/OFF
  featuredPriority: number; // Priority 1-10
  trendingPriority: number; // Priority 1-10
  bestSellerPriority: number; // Priority 1-10
  recentlyAddedPriority: number; // Priority 1-10
}

export interface ProductCardDesignerConfig {
  cardStyle: 'mbh_3d_glass' | 'luxury_elevated' | 'minimal_clean' | 'borderless_modern';
  aspectRatio: 'aspect-square' | 'aspect-[4/5]' | 'aspect-[3/4]';
  cornerRadius: 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl' | 'rounded-full';
  borderStyle: 'border-thin' | 'border-thick' | 'border-glass' | 'border-none';
  shadowIntensity: 'shadow-sm' | 'shadow-md' | 'shadow-lg' | 'shadow-2xl';
  backgroundTheme: 'bg-white' | 'bg-glass' | 'bg-dark' | 'bg-cream';
  badgeStyle: 'solid' | 'outline' | 'glass' | 'pill';
  fontFamily: 'sans' | 'serif' | 'mono';
  animationSpeed: 'fast' | 'normal' | 'slow';

  // Feature Toggles
  showBrand: boolean;
  showRating: boolean;
  showDiscountTag: boolean;
  showBadges: boolean;
  showColorSwatches: boolean;
  showSizeSelector: boolean;
  showWishlist: boolean;
  showQuickView: boolean;
  showShareButton: boolean;
  showCompareButton: boolean;
  showBuyNow: boolean;
  showAddToCart: boolean;
  showStockStatus: boolean;

  // Hover & FX Effects
  enableLiftOnHover: boolean;
  enableScaleOnHover: boolean;
  enableShadowBoost: boolean;
  enableImageZoom: boolean;
  enableGlowEffect: boolean;
  enableVariantSlideAnimation: boolean;

  // Custom Buttons & Styling
  buyNowColor?: string;
  buyNowText?: string;
  addToCartColor?: string;
  addToCartText?: string;
  whatsAppColor?: string;
  whatsAppText?: string;
}

export const DEFAULT_PRODUCT_CARD_CONFIG: ProductCardDesignerConfig = {
  cardStyle: 'mbh_3d_glass',
  aspectRatio: 'aspect-square',
  cornerRadius: 'rounded-2xl',
  borderStyle: 'border-thin',
  shadowIntensity: 'shadow-md',
  backgroundTheme: 'bg-white',
  badgeStyle: 'glass',
  fontFamily: 'sans',
  animationSpeed: 'normal',

  showBrand: true,
  showRating: true,
  showDiscountTag: true,
  showBadges: true,
  showColorSwatches: true,
  showSizeSelector: true,
  showWishlist: true,
  showQuickView: true,
  showShareButton: true,
  showCompareButton: true,
  showBuyNow: true,
  showAddToCart: true,
  showStockStatus: true,

  enableLiftOnHover: true,
  enableScaleOnHover: true,
  enableShadowBoost: true,
  enableImageZoom: true,
  enableGlowEffect: true,
  enableVariantSlideAnimation: true,

  buyNowColor: '#0B8F63',
  buyNowText: '⚡ BUY NOW',
  addToCartColor: '#171717',
  addToCartText: 'ADD TO BAG',
  whatsAppColor: '#25D366',
  whatsAppText: 'WHATSAPP',
};

export type TrendingShoesSource = 
  | 'newest'
  | 'bestsellers'
  | 'trending'
  | 'featured'
  | 'rating'
  | 'manual'
  | 'seasonal'
  | 'ai_recommended';

export interface TrendingShoesCollectionConfig {
  id: string;
  enabled: boolean;
  sectionTitle: string;
  subtitle: string;
  source: TrendingShoesSource;
  selectedProductIds: string[];
  maxProducts: number;
  enableAnimation: boolean;
  transitionSpeed: 'fast' | 'normal' | 'smooth';
  cardStyle: '3d_glass' | 'floating_showcase' | 'elevated_modern';
  backgroundStyle: 'dark_glass' | 'premium_cream' | 'neon_emerald' | 'clean_white';
  scheduleStart?: string;
  scheduleEnd?: string;
  badgeLabel?: string;
  ctaText?: string;
  updatedAt?: string;
}

export const DEFAULT_TRENDING_SHOES_CONFIG: TrendingShoesCollectionConfig = {
  id: 'trending-shoes-section-01',
  enabled: true,
  sectionTitle: '🔥 Trending Shoes Collection',
  subtitle: 'Discover our most popular college sports shoes.',
  source: 'trending',
  selectedProductIds: [],
  maxProducts: 8,
  enableAnimation: true,
  transitionSpeed: 'normal',
  cardStyle: 'floating_showcase',
  backgroundStyle: 'dark_glass',
  badgeLabel: 'COLLEGE FAVOURITES',
  ctaText: 'View All Shoes',
};

export type PricePointSource =
  | 'price_limit'
  | 'manual'
  | 'collection'
  | 'featured'
  | 'ai_recommended';

export interface PricePointCollectionConfig {
  id: string;
  enabled: boolean;
  sectionTitle: string;
  subtitle: string;
  priceLimit: number; // e.g. 699, 499, 999, 1499
  source: PricePointSource;
  selectedProductIds: string[];
  maxProducts: number;
  enableAnimation: boolean;
  animationStyle: 'floating_airpods_flow' | 'orbit_3d_deck' | 'stagger_slide';
  cardStyle: 'neon_glass' | 'minimalist_glow' | 'luxury_dark_gold';
  backgroundStyle: 'obsidian_emerald' | 'midnight_purple' | 'cream_gold' | 'clean_white';
  scheduleStart?: string;
  scheduleEnd?: string;
  badgeLabel?: string;
  ctaText?: string;
  excludeOutofStock?: boolean;
  preventDuplicateHomepageItems?: boolean;
  updatedAt?: string;
}

export const DEFAULT_PRICE_POINT_CONFIG: PricePointCollectionConfig = {
  id: 'price-point-699-section-01',
  enabled: true,
  sectionTitle: '🔥 Starting at ₹699',
  subtitle: 'Premium Shoes Under ₹699',
  priceLimit: 699,
  source: 'price_limit',
  selectedProductIds: [],
  maxProducts: 8,
  enableAnimation: true,
  animationStyle: 'floating_airpods_flow',
  cardStyle: 'neon_glass',
  backgroundStyle: 'obsidian_emerald',
  badgeLabel: 'UNBEATABLE VALUE',
  ctaText: 'Explore Under ₹699',
  excludeOutofStock: true,
  preventDuplicateHomepageItems: true,
};

export interface ButtonThemeConfig {
  id: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  borderRadius: 'rounded-lg' | 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl' | 'rounded-full';
  glassOpacity: number;
  borderStrength: 'none' | 'thin' | 'medium' | 'glow';
  shadowStrength: 'none' | 'soft' | 'medium' | 'deep' | 'liquid_glow';
  enableHoverAnimation: boolean;
  enableRipple: boolean;
  enableLiquidHighlight: boolean;
  enableGlow: boolean;
  animationSpeed: 'fast' | 'normal' | 'smooth';
  updatedAt?: string;
}

export const DEFAULT_BUTTON_THEME_CONFIG: ButtonThemeConfig = {
  id: 'global-liquid-button-theme',
  primaryColor: '#0B8F63',
  secondaryColor: '#0F172A',
  accentColor: '#F59E0B',
  borderRadius: 'rounded-2xl',
  glassOpacity: 0.15,
  borderStrength: 'thin',
  shadowStrength: 'liquid_glow',
  enableHoverAnimation: true,
  enableRipple: true,
  enableLiquidHighlight: true,
  enableGlow: true,
  animationSpeed: 'normal',
};

export type StoreGalleryPhotoCategory = 'exterior' | 'interior' | 'staff' | 'display';

export interface StoreGalleryPhoto {
  id?: string;
  url: string;
  title: string;
  category: StoreGalleryPhotoCategory;
  description?: string;
}

export interface PhysicalStore {
  id: string;
  name: string;
  slug: string;
  rating: number;
  reviewsCount: number;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string;
  whatsapp: string;
  openingHoursToday: string;
  openingHoursWeek: string;
  isOpen: boolean;
  images: string[]; // Interior, Exterior, Staff photos
  galleryPhotos?: StoreGalleryPhoto[]; // Categorized photos (exterior, interior, staff, display)
  services: string[]; // e.g. ['Open Box Delivery', 'Try Before Buy', 'Shoe Trial', 'Card Payment', 'Parking', 'Wheelchair Accessible']
  managerName: string;
  holidayTiming: string;
  specialOffers: string;
  googleMapsUrl: string;
  isFeatured: boolean;
  isEnabled: boolean;
  updatedAt?: string;
}

export interface MobileCategoryIcon {
  id: string;
  name: string;
  iconName: string;
  image?: string;
  categoryKey: string; // e.g. 'new-arrivals', 'sports-shoes', 'sneakers', 'running', 'formal-shoes', 'sandals', 'slippers', 'men-clothing', 'kids', 'offers', 'best-sellers', 'trending'
  badge?: string;
  badgeColor?: string;
  order: number;
  enabled: boolean;
}












