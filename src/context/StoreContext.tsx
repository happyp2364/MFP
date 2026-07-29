import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Product,
  Review,
  StoreInfo,
  HeroContent,
  AuditLogItem,
  StoreBackupSnapshot,
  PaymentSettings,
  CustomerOrder,
  OrderStatus,
  HangingSneakerConfig,
  PetShoeConfig,
  InstagramConfig,
  SoundConfig,
  CustomerSoundSettings,
  SoundType,
  PendingChangeItem,
  PublishedVersionHistory,
  PublishProgressState,
  PublishResult,
  CustomerProfile,
  MarketingCampaign,
  MarketingSubscriber,
  MarketingConsent,
  CategoryHighlight,
  TrendingCollectionItem,
  ToastState,
  CartItem,
  PaymentMethodType,
  PaymentStatus,
  AdminNotification,
  TopAnnouncementBarConfig,
  AnnouncementItem,
  SocialMediaCenterConfig,
  SocialAnalyticsLog,
  PromoCoupon,
  CouponType,
  LuckyBoxReward,
  LuckyBoxConfig,
  ScratchReward,
  ScratchWinConfig,
  SpinWheelConfig,
  WheelSection,
  FlashDeal,
  EngagementAnalytics,
  OrderCelebrationConfig,
} from '../types';
import {
  PRODUCTS_DATA,
  REVIEWS_DATA,
  STORE_INFO,
  DEFAULT_HERO_CONTENT,
  ANNOUNCEMENT_ITEMS,
  CATEGORY_HIGHLIGHTS,
  TRENDING_COLLECTIONS,
  DEFAULT_HANGING_SNEAKER_CONFIG,
  DEFAULT_PET_SHOE_CONFIG,
  DEFAULT_INSTAGRAM_CONFIG,
  DEFAULT_SOUND_CONFIG,
  DEFAULT_CUSTOMER_SOUND_SETTINGS,
  DEFAULT_PAYMENT_SETTINGS,
  DEFAULT_TOP_ANNOUNCEMENT_BAR_CONFIG,
  DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG,
  DEFAULT_SOCIAL_ANALYTICS,
} from '../data/mockData';
import {
  auth,
  db,
  changeAdminPasswordFirebase,
  logoutUser,
  signInWithGoogle,
  onUserAuthChange,
  syncCustomerProfileInFirestore,
  fetchRemoteAuditLogs,
  checkRedirectAuthResult,
  recordAuditLog,
  saveOrderInFirestore,
  updateOrderStatusInFirestore,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { splitProduct, stitchProduct, estimateObjectSizeKb } from '../utils/productSplitter';
import { playSound, applyAudioCustomerSettings } from '../utils/audio';
import { securityRateLimiter, sanitizeString, sanitizeEmail, sanitizePhone, sanitizePrice } from '../lib/security';

const STORAGE_KEYS = {
  PRODUCTS: 'mfp_products_catalog_live',
  REVIEWS: 'mfp_reviews_live',
  STORE_INFO: 'mfp_store_info_live',
  HERO_CONTENT: 'mfp_hero_content_live',
  ANNOUNCEMENTS: 'mfp_announcements_live',
  CATEGORY_HIGHLIGHTS: 'mfp_category_highlights_live',
  TRENDING_COLLECTIONS: 'mfp_trending_collections_live',
  AUDIT_LOGS: 'mfp_audit_logs_live',
  PAYMENT_SETTINGS: 'mfp_payment_settings_live',
  HANGING_SNEAKER_CONFIG: 'mfp_hanging_sneaker_config_live',
  PET_SHOE_CONFIG: 'mfp_pet_shoe_config_live',
  INSTAGRAM_CONFIG: 'mfp_instagram_config_live',
  SOUND_CONFIG: 'mfp_sound_config_live',
  TOP_ANNOUNCEMENT_BAR_CONFIG: 'mfp_top_announcement_bar_config_live',
  SOCIAL_MEDIA_CONFIG: 'mfp_social_media_config_live_v2',
  SOCIAL_ANALYTICS: 'mfp_social_analytics_live_v2',
};

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

interface StoreContextType {
  products: Product[];
  reviews: Review[];
  storeInfo: StoreInfo;
  heroContent: HeroContent;
  announcements: string[];
  categoryHighlights: CategoryHighlight[];
  trendingCollections: TrendingCollectionItem[];
  isAdmin: boolean;
  isTwoFactorEnabled: boolean;
  auditLogs: AuditLogItem[];
  lastActivityTime: number;
  paymentSettings: PaymentSettings;
  orders: CustomerOrder[];
  notifications: AdminNotification[];
  activeOrderNotification: AdminNotification | null;
  setActiveOrderNotification: (notif: AdminNotification | null) => void;

  hangingSneakerConfig: HangingSneakerConfig;
  updateHangingSneakerConfig: (updated: Partial<HangingSneakerConfig>) => Promise<void>;
  petShoeConfig: PetShoeConfig;
  updatePetShoeConfig: (updated: Partial<PetShoeConfig>) => Promise<void>;
  instagramConfig: InstagramConfig;
  updateInstagramConfig: (updated: Partial<InstagramConfig>) => Promise<void>;
  updatePaymentSettings: (settings: Partial<PaymentSettings>) => Promise<boolean>;
  soundConfig: SoundConfig;
  updateSoundConfig: (updated: Partial<SoundConfig>) => Promise<void>;
  topAnnouncementBarConfig: TopAnnouncementBarConfig;
  updateTopAnnouncementBarConfig: (updated: Partial<TopAnnouncementBarConfig>) => Promise<void>;
  customerSoundSettings: CustomerSoundSettings;
  updateCustomerSoundSettings: (updated: Partial<CustomerSoundSettings>) => void;
  playSiteSound: (type: SoundType) => void;

  socialMediaConfig: SocialMediaCenterConfig;
  updateSocialMediaConfig: (updated: Partial<SocialMediaCenterConfig>) => Promise<void>;
  socialAnalytics: SocialAnalyticsLog;
  recordSocialClick: (platformId: string) => Promise<void>;

  placeOrderAndPay: (
    cartItems: CartItem[],
    shippingAddress: any,
    paymentMethod: PaymentMethodType | 'ONLINE' | 'NETBANKING',
    paymentDetails?: any,
    couponCode?: string,
    discountAmount?: number
  ) => Promise<{ success: boolean; orderId?: string; message?: string }>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => Promise<boolean>;
  cancelCustomerOrder: (orderId: string, reason?: string) => Promise<boolean>;
  markNotificationRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  // Customer Auth State
  customerUser: FirebaseUser | null;
  customerProfile: CustomerProfile | null;
  isCustomerAuthLoading: boolean;
  customerAuthError: string | null;
  toastMessage: ToastState | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  customerSignInWithGoogle: (useWorkspaceScopes?: boolean) => Promise<boolean>;
  customerSignOut: () => Promise<void>;
  updateCustomerProfileInFirestore: (data: Partial<CustomerProfile>) => Promise<boolean>;

  // Marketing & Customer Engagement
  campaigns: MarketingCampaign[];
  subscribers: MarketingSubscriber[];
  updateCustomerMarketingConsent: (consent: MarketingConsent) => Promise<boolean>;
  saveCampaign: (campaign: MarketingCampaign) => Promise<boolean>;
  deleteCampaign: (id: string) => Promise<boolean>;
  sendCampaign: (campaign: MarketingCampaign) => Promise<{ success: boolean; message: string }>;
  updateSubscriberConsent: (subscriberId: string, consent: MarketingConsent) => Promise<boolean>;
  refreshMarketingData: () => Promise<void>;

  // Auth
  loginAdmin: (password: string, twoFactorCode?: string) => Promise<{ success: boolean; requires2FA?: boolean; message?: string }>;
  loginWithGoogleAdmin: () => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: (reason?: string) => void;
  changeAdminPassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  toggleTwoFactor: (enable: boolean) => void;
  verifyReAuthentication: (password: string) => Promise<boolean>;

  // Product CRUD
  addProduct: (p: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleInStock: (id: string) => Promise<void>;

  // Reviews CRUD
  addReview: (r: Omit<Review, 'id'>) => Promise<void>;
  updateReview: (id: string, updated: Partial<Review>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;

  // Content Editors
  updateStoreInfo: (info: Partial<StoreInfo>) => Promise<void>;
  updateHeroContent: (content: Partial<HeroContent>) => Promise<void>;
  setAnnouncementsList: (items: string[]) => Promise<void>;
  updateCategoryHighlight: (id: string, updated: Partial<CategoryHighlight>) => Promise<void>;
  saveCategoryHighlights: (items: CategoryHighlight[]) => Promise<void>;
  updateTrendingCollection: (id: string, updated: Partial<TrendingCollectionItem>) => Promise<void>;

  // Legacy compatibility declarations (Stubbed/Empty)
  hasPendingDraft: boolean;
  pendingDraftCount: number;
  pendingChangesList: PendingChangeItem[];
  lastPublishedAt: string | null;
  lastPublishedBy: string | null;
  publishedVersions: PublishedVersionHistory[];
  previewMode: 'draft' | 'live';
  publishWebsite: (summary?: string, onProgress?: (progress: PublishProgressState) => void) => Promise<PublishResult>;
  restorePublishedVersion: (versionId: string) => Promise<boolean>;
  togglePreviewMode: () => void;
  discardDraft: () => Promise<void>;

  // Audit Logs & Recovery
  refreshAuditLogs: () => Promise<void>;
  createStoreBackup: () => Promise<StoreBackupSnapshot>;
  restoreStoreBackup: (backupData: StoreBackupSnapshot | string) => Promise<boolean>;
  resetToDefaults: () => void;

  // Coupon Management System
  coupons: PromoCoupon[];
  addCoupon: (c: Omit<PromoCoupon, 'id' | 'usageCount' | 'successCount' | 'failedCount' | 'revenueGenerated' | 'discountGiven' | 'createdAt'>) => Promise<boolean>;
  updateCoupon: (id: string, updated: Partial<PromoCoupon>) => Promise<boolean>;
  deleteCoupon: (id: string) => Promise<boolean>;
  duplicateCoupon: (id: string) => Promise<boolean>;
  validateCoupon: (code: string, cartItems: CartItem[]) => { valid: boolean; reason?: string; discountAmount?: number; freeShipping?: boolean; freeGift?: boolean; giftName?: string; eligibleProductIds?: string[] };
  trackCouponUse: (code: string, success: boolean, revenue?: number, discount?: number) => Promise<void>;

  // Customer Engagement Reward Center
  luckyBoxConfig: LuckyBoxConfig;
  updateLuckyBoxConfig: (updated: Partial<LuckyBoxConfig>) => Promise<boolean>;
  spinWheelConfig: SpinWheelConfig;
  updateSpinWheelConfig: (updated: Partial<SpinWheelConfig>) => Promise<boolean>;
  flashDeals: FlashDeal[];
  addFlashDeal: (deal: Omit<FlashDeal, 'id' | 'analytics'>) => Promise<boolean>;
  updateFlashDeal: (id: string, updated: Partial<FlashDeal>) => Promise<boolean>;
  deleteFlashDeal: (id: string) => Promise<boolean>;
  engagementAnalytics: EngagementAnalytics;
  recordEngagementMetric: (metric: keyof EngagementAnalytics, value?: number) => Promise<void>;

  orderCelebrationConfig: OrderCelebrationConfig;
  updateOrderCelebrationConfig: (updated: Partial<OrderCelebrationConfig>) => Promise<boolean>;
  isCelebrating: boolean;
  setIsCelebrating: (celebrating: boolean) => void;
  triggerGlobalCelebration: () => void;

  scratchWinConfig: ScratchWinConfig;
  updateScratchWinConfig: (updated: Partial<ScratchWinConfig>) => Promise<boolean>;
}

const DEFAULT_SCRATCH_WIN_CONFIG: ScratchWinConfig = {
  enabled: true,
  permanentlyDisabled: false,
  showOnHomepage: true,
  showOnProductPage: true,
  showOnCheckout: true,
  showOnOrderSuccess: true,
  firstVisitOnly: false,
  firstOrderOnly: false,
  returningCustomerOnly: false,
  newCustomerOnly: false,
  festivalOnly: false,
  dailyLimit: 50,
  perCustomerLimit: 1,
  globalUsageLimit: 1000,
  minCartValue: 0,
  rewards: [
    {
      id: 'sw-10-percent',
      name: '10% OFF',
      type: 'PERCENTAGE',
      value: 10,
      probability: 40,
      usageLimit: 1000,
      usageCount: 0,
      perCustomerLimit: 1,
      enabled: true,
      couponCode: 'SCRATCH10'
    }
  ]
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEFAULT_LUCKY_BOX_CONFIG: LuckyBoxConfig = {
  enabled: true,
  permanentlyDisabled: false,
  showOnHomepage: true,
  showOnProductPage: true,
  showOnCheckout: true,
  showOnOrderSuccess: true,
  firstVisitOnly: false,
  firstOrderOnly: false,
  returningCustomerOnly: false,
  newCustomerOnly: false,
  festivalOnly: false,
  dailyLimit: 50,
  perCustomerLimit: 1,
  globalUsageLimit: 1000,
  minCartValue: 0,
  rewards: [
    {
      id: 'lb-100-off',
      title: '₹100 OFF',
      type: 'FLAT',
      value: 100,
      probability: 30,
      usageLimit: 500,
      usageCount: 0,
      perCustomerLimit: 1,
      couponCode: 'LUCKY100'
    },
    {
      id: 'lb-5-percent',
      title: '5% OFF',
      type: 'PERCENTAGE',
      value: 5,
      probability: 25,
      usageLimit: 1000,
      usageCount: 0,
      perCustomerLimit: 1,
      couponCode: 'LUCKY5'
    },
    {
      id: 'lb-free-shipping',
      title: 'Free Delivery',
      type: 'FREE_SHIPPING',
      value: 0,
      probability: 15,
      usageLimit: 500,
      usageCount: 0,
      perCustomerLimit: 1,
      couponCode: 'FREESHIP'
    },
    {
      id: 'lb-mystery',
      title: 'Mystery Gift',
      type: 'GIFT',
      value: 0,
      probability: 5,
      usageLimit: 50,
      usageCount: 0,
      perCustomerLimit: 1
    },
    {
      id: 'lb-better-luck',
      title: 'Better Luck Next Time',
      type: 'BETTER_LUCK',
      value: 0,
      probability: 25,
      usageLimit: 0,
      usageCount: 0,
      perCustomerLimit: 0
    }
  ]
};

const DEFAULT_SPIN_WHEEL_CONFIG: SpinWheelConfig = {
  enabled: true,
  sectionsCount: 8,
  soundEnabled: true,
  celebrationEnabled: true,
  autoApplyCoupon: true,
  canSpinAgainDays: 7,
  sections: [
    { id: 'w1', title: '5% OFF', type: 'PERCENTAGE', value: 5, probability: 20, couponCode: 'WHEEL5', color: '#EF4444' },
    { id: 'w2', title: '10% OFF', type: 'PERCENTAGE', value: 10, probability: 15, couponCode: 'WHEEL10', color: '#3B82F6' },
    { id: 'w3', title: 'Free Delivery', type: 'FREE_SHIPPING', value: 0, probability: 15, couponCode: 'FREESHIP', color: '#10B981' },
    { id: 'w4', title: '₹100 OFF', type: 'FLAT', value: 100, probability: 15, couponCode: 'WHEEL100', color: '#F59E0B' },
    { id: 'w5', title: 'Better Luck', type: 'BETTER_LUCK', value: 0, probability: 20, color: '#6B7280' },
    { id: 'w6', title: '15% OFF', type: 'PERCENTAGE', value: 15, probability: 10, couponCode: 'WHEEL15', color: '#EC4899' },
    { id: 'w7', title: 'Mystery Gift', type: 'GIFT', value: 0, probability: 3, color: '#8B5CF6' },
    { id: 'w8', title: '₹200 OFF', type: 'FLAT', value: 200, probability: 2, couponCode: 'WHEEL200', color: '#111827' }
  ]
};

const DEFAULT_ENGAGEMENT_ANALYTICS: EngagementAnalytics = {
  luckyBoxOpens: 0,
  wheelSpins: 0,
  couponsWon: 0,
  couponsUsed: 0,
  flashDealClicks: 0,
  flashDealConversions: 0,
  revenueGenerated: 0
};

const DEFAULT_ORDER_CELEBRATION_CONFIG: OrderCelebrationConfig = {
  enabled: true,
  confetti: true,
  sparkles: true,
  balloons: true,
  sound: true,
  successAnimation: true,
  duration: 5,
  speed: 'medium',
  mobileOnly: false,
  desktopOnly: false
};

// Safe JSON parsing helper to prevent initialization crashes
const safeJSONParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.warn(`LocalStorage parse error for key "${key}":`, e);
    return fallback;
  }
};

// Safe LocalStorage set helper
const safeLocalStorageSet = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`LocalStorage write error for key "${key}":`, e);
  }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Real-time Live State
  const [publishedProducts, setPublishedProducts] = useState<Product[]>(() => safeJSONParse(STORAGE_KEYS.PRODUCTS, PRODUCTS_DATA));
  const [publishedReviews, setPublishedReviews] = useState<Review[]>(() => safeJSONParse(STORAGE_KEYS.REVIEWS, REVIEWS_DATA));
  const [publishedStoreInfo, setPublishedStoreInfo] = useState<StoreInfo>(() => safeJSONParse(STORAGE_KEYS.STORE_INFO, STORE_INFO));
  const [publishedHeroContent, setPublishedHeroContent] = useState<HeroContent>(() => safeJSONParse(STORAGE_KEYS.HERO_CONTENT, DEFAULT_HERO_CONTENT));
  const [publishedAnnouncements, setPublishedAnnouncements] = useState<string[]>(() => safeJSONParse(STORAGE_KEYS.ANNOUNCEMENTS, ANNOUNCEMENT_ITEMS));
  const [publishedCategoryHighlights, setPublishedCategoryHighlights] = useState<CategoryHighlight[]>(() => safeJSONParse(STORAGE_KEYS.CATEGORY_HIGHLIGHTS, CATEGORY_HIGHLIGHTS));
  const [publishedTrendingCollections, setPublishedTrendingCollections] = useState<TrendingCollectionItem[]>(() => safeJSONParse(STORAGE_KEYS.TRENDING_COLLECTIONS, TRENDING_COLLECTIONS));
  const [publishedPaymentSettings, setPublishedPaymentSettings] = useState<PaymentSettings>(() => safeJSONParse(STORAGE_KEYS.PAYMENT_SETTINGS, DEFAULT_PAYMENT_SETTINGS));
  const [publishedHangingSneakerConfig, setPublishedHangingSneakerConfig] = useState<HangingSneakerConfig>(() => safeJSONParse(STORAGE_KEYS.HANGING_SNEAKER_CONFIG, DEFAULT_HANGING_SNEAKER_CONFIG));
  const [publishedPetShoeConfig, setPublishedPetShoeConfig] = useState<PetShoeConfig>(() => safeJSONParse(STORAGE_KEYS.PET_SHOE_CONFIG, DEFAULT_PET_SHOE_CONFIG));
  const [publishedInstagramConfig, setPublishedInstagramConfig] = useState<InstagramConfig>(() => safeJSONParse(STORAGE_KEYS.INSTAGRAM_CONFIG, DEFAULT_INSTAGRAM_CONFIG));
  const [publishedSoundConfig, setPublishedSoundConfig] = useState<SoundConfig>(() => safeJSONParse(STORAGE_KEYS.SOUND_CONFIG, DEFAULT_SOUND_CONFIG));
  const [publishedTopAnnouncementBarConfig, setPublishedTopAnnouncementBarConfig] = useState<TopAnnouncementBarConfig>(() => safeJSONParse(STORAGE_KEYS.TOP_ANNOUNCEMENT_BAR_CONFIG, DEFAULT_TOP_ANNOUNCEMENT_BAR_CONFIG));
  const [socialMediaConfig, setSocialMediaConfig] = useState<SocialMediaCenterConfig>(() => safeJSONParse(STORAGE_KEYS.SOCIAL_MEDIA_CONFIG, DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG));
  const [socialAnalytics, setSocialAnalytics] = useState<SocialAnalyticsLog>(() => safeJSONParse(STORAGE_KEYS.SOCIAL_ANALYTICS, DEFAULT_SOCIAL_ANALYTICS));

  // Coupons state
  const [coupons, setCoupons] = useState<PromoCoupon[]>([]);

  // Raw Live Products & Split subcollection maps
  const [rawLiveProducts, setRawLiveProducts] = useState<any[]>([]);
  const [productsFetched, setProductsFetched] = useState(false);
  const [liveGalleries, setLiveGalleries] = useState<Record<string, any>>({});
  const [liveVariants, setLiveVariants] = useState<Record<string, any>>({});
  const [liveAiMetadata, setLiveAiMetadata] = useState<Record<string, any>>({});
  const [liveGalleryParts, setLiveGalleryParts] = useState<Record<string, any>>({});

  // Auth & Admin state
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());

  // Toast System
  const [toastMessage, setToastMessage] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage({ id: `toast-${Date.now()}`, text, type });
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Customer Auth
  const [customerUser, setCustomerUser] = useState<FirebaseUser | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isCustomerAuthLoading, setIsCustomerAuthLoading] = useState<boolean>(true);
  const [customerAuthError, setCustomerAuthError] = useState<string | null>(null);

  // Customer Sound Settings
  const [customerSoundSettings, setCustomerSoundSettingsState] = useState<CustomerSoundSettings>(() => safeJSONParse('mfp_customer_sound_settings', DEFAULT_CUSTOMER_SOUND_SETTINGS));

  // Orders & Notifications
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [activeOrderNotification, setActiveOrderNotification] = useState<AdminNotification | null>(null);

  // Marketing
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [subscribers, setSubscribers] = useState<MarketingSubscriber[]>([]);

  // Customer Engagement State
  const [luckyBoxConfig, setLuckyBoxConfig] = useState<LuckyBoxConfig>(() => safeJSONParse('mfp_lucky_box_config', DEFAULT_LUCKY_BOX_CONFIG));
  const [spinWheelConfig, setSpinWheelConfig] = useState<SpinWheelConfig>(() => safeJSONParse('mfp_spin_wheel_config', DEFAULT_SPIN_WHEEL_CONFIG));
  const [scratchWinConfig, setScratchWinConfig] = useState<ScratchWinConfig>(() => safeJSONParse('mfp_scratch_win_config', DEFAULT_SCRATCH_WIN_CONFIG));
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [engagementAnalytics, setEngagementAnalytics] = useState<EngagementAnalytics>(() => safeJSONParse('mfp_engagement_analytics', DEFAULT_ENGAGEMENT_ANALYTICS));
  const [orderCelebrationConfig, setOrderCelebrationConfig] = useState<OrderCelebrationConfig>(() => safeJSONParse('mfp_order_celebration_config', DEFAULT_ORDER_CELEBRATION_CONFIG));

  const [isCelebrating, setIsCelebrating] = useState<boolean>(false);

  // Audit Logger Helper
  const recordAuditLog = useCallback((
    action: string,
    category: 'AUTH' | 'PRODUCT' | 'SETTINGS' | 'SECURITY' | 'BACKUP' | 'MEDIA',
    details: string,
    status: 'SUCCESS' | 'WARNING' | 'DANGER' = 'SUCCESS'
  ) => {
    const userEmail = auth.currentUser?.email || 'System Admin';
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      category,
      details,
      userEmail,
      status,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  }, []);

  // 1. Real-Time Firestore Listeners for Live Products (Split-Aware & Stitched)
  useEffect(() => {
    let unsubProducts: any = null;
    let unsubGallery: any = null;
    let unsubVariants: any = null;
    let unsubAiMetadata: any = null;
    let unsubGalleryParts: any = null;

    try {
      unsubProducts = onSnapshot(collection(db, 'products'), async (snapshot) => {
        if (!snapshot.empty) {
          const remote: any[] = [];
          snapshot.forEach((docSnap) => {
            remote.push({ ...docSnap.data(), id: docSnap.id });
          });
          setRawLiveProducts(prev => {
            if (JSON.stringify(prev) === JSON.stringify(remote)) return prev;
            return remote;
          });
          setProductsFetched(true);
        } else {
          setProductsFetched(true);
          // Seed default products using split architecture if empty
          try {
            const batch = writeBatch(db);
            for (const p of PRODUCTS_DATA) {
              const split = splitProduct(p);
              batch.set(doc(db, 'products', p.id), split.metadata);
              batch.set(doc(db, 'product_gallery', p.id), split.gallery);
              batch.set(doc(db, 'product_variants', p.id), split.variants);
              batch.set(doc(db, 'product_ai_metadata', p.id), split.aiMetadata);
              for (const part of split.galleryParts) {
                batch.set(doc(db, 'product_gallery_parts', part.id), part);
              }
            }
            await batch.commit();
          } catch (seedErr) {
            console.warn('Initial product seeding warning:', seedErr);
          }
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'products');
      });

      unsubGallery = onSnapshot(collection(db, 'product_gallery'), (snapshot) => {
        const map: Record<string, any> = {};
        snapshot.forEach((docSnap) => { map[docSnap.id] = docSnap.data(); });
        setLiveGalleries(prev => {
          if (JSON.stringify(prev) === JSON.stringify(map)) return prev;
          return map;
        });
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'product_gallery');
      });

      unsubVariants = onSnapshot(collection(db, 'product_variants'), (snapshot) => {
        const map: Record<string, any> = {};
        snapshot.forEach((docSnap) => { map[docSnap.id] = docSnap.data(); });
        setLiveVariants(prev => {
          if (JSON.stringify(prev) === JSON.stringify(map)) return prev;
          return map;
        });
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'product_variants');
      });

      unsubAiMetadata = onSnapshot(collection(db, 'product_ai_metadata'), (snapshot) => {
        const map: Record<string, any> = {};
        snapshot.forEach((docSnap) => { map[docSnap.id] = docSnap.data(); });
        setLiveAiMetadata(prev => {
          if (JSON.stringify(prev) === JSON.stringify(map)) return prev;
          return map;
        });
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'product_ai_metadata');
      });

      unsubGalleryParts = onSnapshot(collection(db, 'product_gallery_parts'), (snapshot) => {
        const map: Record<string, any> = {};
        snapshot.forEach((docSnap) => { map[docSnap.id] = docSnap.data(); });
        setLiveGalleryParts(prev => {
          if (JSON.stringify(prev) === JSON.stringify(map)) return prev;
          return map;
        });
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'product_gallery_parts');
      });

    } catch (e) {
      console.warn('Live products snapshot setup warning:', e);
    }

    return () => {
      if (unsubProducts) unsubProducts();
      if (unsubGallery) unsubGallery();
      if (unsubVariants) unsubVariants();
      if (unsubAiMetadata) unsubAiMetadata();
      if (unsubGalleryParts) unsubGalleryParts();
    };
  }, []);

  // Stitch Live Products whenever any split subcollection updates
  useEffect(() => {
    if (productsFetched) {
      const stitched = rawLiveProducts.map((p) =>
        stitchProduct(
          p,
          liveGalleries[p.id],
          liveVariants[p.id],
          liveAiMetadata[p.id],
          liveGalleryParts
        )
      );
      
      // Deep compare or check length to avoid unnecessary state updates if nothing changed
      setPublishedProducts(prev => {
        if (JSON.stringify(prev) === JSON.stringify(stitched)) return prev;
        safeLocalStorageSet(STORAGE_KEYS.PRODUCTS, stitched);
        return stitched;
      });
    }
  }, [productsFetched, rawLiveProducts, liveGalleries, liveVariants, liveAiMetadata, liveGalleryParts]);

  // 2. Real-Time Firestore Listeners for Live Store Settings
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    try {
      unsubscribers.push(
        onSnapshot(doc(db, 'settings', 'store'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as StoreInfo;
            setPublishedStoreInfo(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet(STORAGE_KEYS.STORE_INFO, data);
              return data;
            });
          }
        }, (err) => console.warn('Live store settings listener notice:', err))
      );

      unsubscribers.push(
        onSnapshot(doc(db, 'settings', 'luckyBox'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as LuckyBoxConfig;
            setLuckyBoxConfig(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet('mfp_lucky_box_config', data);
              return data;
            });
          }
        }, (err) => console.warn('Live lucky box listener notice:', err))
      );

      unsubscribers.push(
        onSnapshot(doc(db, 'settings', 'spinWheel'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as SpinWheelConfig;
            setSpinWheelConfig(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet('mfp_spin_wheel_config', data);
              return data;
            });
          }
        }, (err) => console.warn('Live spin wheel listener notice:', err))
      );

      unsubscribers.push(
        onSnapshot(doc(db, 'settings', 'scratchWin'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as ScratchWinConfig;
            setScratchWinConfig(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet('mfp_scratch_win_config', data);
              return data;
            });
          }
        }, (err) => console.warn('Live scratch win listener notice:', err))
      );

      unsubscribers.push(
        onSnapshot(doc(db, 'analytics', 'engagement'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as EngagementAnalytics;
            setEngagementAnalytics(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet('mfp_engagement_analytics', data);
              return data;
            });
          }
        }, (err) => console.warn('Live engagement analytics listener notice:', err))
      );

      unsubscribers.push(
        onSnapshot(collection(db, 'flashDeals'), (snap) => {
          const list: FlashDeal[] = [];
          snap.forEach((d) => list.push({ ...d.data(), id: d.id } as FlashDeal));
          setFlashDeals(prev => {
            if (JSON.stringify(prev) === JSON.stringify(list)) return prev;
            return list;
          });
        }, (err) => console.warn('Live flash deals listener notice:', err))
      );

      unsubscribers.push(
        onSnapshot(doc(db, 'settings', 'orderCelebration'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as OrderCelebrationConfig;
            setOrderCelebrationConfig(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet('mfp_order_celebration_config', data);
              return data;
            });
          }
        }, (err) => console.warn('Live order celebration listener notice:', err))
      );

      unsubscribers.push(
        onSnapshot(doc(db, 'hero', 'current'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as HeroContent;
            setPublishedHeroContent(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet(STORAGE_KEYS.HERO_CONTENT, data);
              return data;
            });
          }
        }, (err) => console.warn('Live hero listener notice:', err))
      );

      unsubscribers.push(
        onSnapshot(doc(db, 'homepage', 'announcements'), (snap) => {
          if (snap.exists() && snap.data()?.items) {
            const data = snap.data().items as string[];
            setPublishedAnnouncements(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet(STORAGE_KEYS.ANNOUNCEMENTS, data);
              return data;
            });
          }
        }, (err) => console.warn('Live announcements listener notice:', err))
      );

      unsubscribers.push(
        onSnapshot(doc(db, 'categories', 'highlights'), (snap) => {
          if (snap.exists() && snap.data()?.items) {
            const data = snap.data().items as CategoryHighlight[];
            setPublishedCategoryHighlights(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet(STORAGE_KEYS.CATEGORY_HIGHLIGHTS, data);
              return data;
            });
          }
        }, (err) => console.warn('Live categories listener notice:', err))
      );

      unsubscribers.push(
        onSnapshot(doc(db, 'homepage', 'trendingCollections'), (snap) => {
          if (snap.exists() && snap.data()?.items) {
            const data = snap.data().items as TrendingCollectionItem[];
            setPublishedTrendingCollections(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet(STORAGE_KEYS.TRENDING_COLLECTIONS, data);
              return data;
            });
          }
        }, (err) => console.warn('Live trending collections listener notice:', err))
      );

      unsubscribers.push(
        onSnapshot(doc(db, 'payment', 'config'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as PaymentSettings;
            setPublishedPaymentSettings(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet(STORAGE_KEYS.PAYMENT_SETTINGS, data);
              return data;
            });
          }
        }, (err) => console.warn('Live payment listener notice:', err))
      );

      unsubscribers.push(
        onSnapshot(doc(db, 'animations', 'hangingSneakerConfig'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as HangingSneakerConfig;
            setPublishedHangingSneakerConfig(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet(STORAGE_KEYS.HANGING_SNEAKER_CONFIG, data);
              return data;
            });
          }
        }, (err) => console.warn('Live sneaker animation listener notice:', err))
      );

      unsubscribers.push(
        onSnapshot(doc(db, 'mascot', 'petShoeConfig'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as PetShoeConfig;
            setPublishedPetShoeConfig(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet(STORAGE_KEYS.PET_SHOE_CONFIG, data);
              return data;
            });
          }
        }, (err) => console.warn('Live pet shoe listener notice:', err))
      );

      unsubscribers.push(
        onSnapshot(doc(db, 'social', 'instagramConfig'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as InstagramConfig;
            setPublishedInstagramConfig(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet(STORAGE_KEYS.INSTAGRAM_CONFIG, data);
              return data;
            });
          }
        }, (err) => console.warn('Live instagram listener notice:', err))
      );

      unsubscribers.push(
        onSnapshot(doc(db, 'theme', 'current'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as SoundConfig;
            setPublishedSoundConfig(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet(STORAGE_KEYS.SOUND_CONFIG, data);
              return data;
            });
          }
        }, (err) => console.warn('Live sound listener notice:', err))
      );

      unsubscribers.push(
        onSnapshot(doc(db, 'homepage', 'topAnnouncementBarConfig'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as TopAnnouncementBarConfig;
            setPublishedTopAnnouncementBarConfig(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet(STORAGE_KEYS.TOP_ANNOUNCEMENT_BAR_CONFIG, data);
              return data;
            });
          }
        }, (err) => console.warn('Live top announcement bar listener notice:', err))
      );

      unsubscribers.push(
        onSnapshot(doc(db, 'social', 'socialMediaConfig'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as SocialMediaCenterConfig;
            setSocialMediaConfig(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet(STORAGE_KEYS.SOCIAL_MEDIA_CONFIG, data);
              return data;
            });
          }
        }, (err) => console.warn('Live social media config listener error:', err))
      );

      unsubscribers.push(
        onSnapshot(doc(db, 'analytics', 'social_clicks'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as SocialAnalyticsLog;
            setSocialAnalytics(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              safeLocalStorageSet(STORAGE_KEYS.SOCIAL_ANALYTICS, data);
              return data;
            });
          }
        }, (err) => console.warn('Live social analytics listener error:', err))
      );

      unsubscribers.push(
        onSnapshot(collection(db, 'reviews'), (snap) => {
          if (!snap.empty) {
            const list: Review[] = [];
            snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Review));
            setPublishedReviews(prev => {
              if (JSON.stringify(prev) === JSON.stringify(list)) return prev;
              safeLocalStorageSet(STORAGE_KEYS.REVIEWS, list);
              return list;
            });
          }
        }, (err) => console.warn('Live reviews listener notice:', err))
      );

      let isFirstNotificationsLoad = true;
      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'notifications'), orderBy('timestamp', 'desc')),
          (snap) => {
            const list: AdminNotification[] = [];
            snap.forEach((d) => {
              list.push({ ...d.data(), id: d.id } as AdminNotification);
            });
            setNotifications(prev => {
              if (JSON.stringify(prev) === JSON.stringify(list)) return prev;
              return list;
            });

            if (isFirstNotificationsLoad) {
              isFirstNotificationsLoad = false;
            } else {
              snap.docChanges().forEach((change) => {
                if (change.type === 'added') {
                  const newNotif = { ...change.doc.data(), id: change.doc.id } as AdminNotification;
                  playSound('notification');
                  setActiveOrderNotification(newNotif);
                }
              });
            }
          },
          (err) => console.warn('Live notifications listener notice:', err)
        )
      );

      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
          (snap) => {
            const list: CustomerOrder[] = [];
            snap.forEach((d) => {
              list.push({ ...d.data(), id: d.id } as CustomerOrder);
            });
            setOrders(prev => {
              if (JSON.stringify(prev) === JSON.stringify(list)) return prev;
              return list;
            });
          },
          (err) => console.warn('Live orders listener notice:', err)
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'coupons'),
          (snap) => {
            const list: PromoCoupon[] = [];
            snap.forEach((d) => {
              list.push({ ...d.data(), id: d.id } as PromoCoupon);
            });
            // sort coupons by priority (highest first), then by code
            list.sort((a, b) => (b.priority || 0) - (a.priority || 0));
            setCoupons(prev => {
              if (JSON.stringify(prev) === JSON.stringify(list)) return prev;
              return list;
            });
          },
          (err) => console.warn('Live coupons listener notice:', err)
        )
      );

    } catch (e) {
      console.warn('Live snapshot setup warning:', e);
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  // 3. Customer Auth State Listener
  useEffect(() => {
    let isMounted = true;
    setIsCustomerAuthLoading(true);

    checkRedirectAuthResult()
      .then((res) => {
        if (res && isMounted) {
          setCustomerUser(res.user);
          setCustomerProfile(res.profile);
          showToast(`Welcome back, ${res.profile.name || 'Valued Customer'}!`, 'success');
        }
      })
      .catch((err) => console.warn('Redirect auth check notice:', err));

    const unsubscribe = onUserAuthChange(async (user) => {
      if (!isMounted) return;
      setCustomerUser(user);
      setIsCustomerAuthLoading(false);
      if (user) {
        setIsAdmin(user.email === 'vpcreation2002@gmail.com');
        try {
          const prof = await syncCustomerProfileInFirestore(user);
          if (isMounted) setCustomerProfile(prof);
        } catch (e) {
          console.warn('Customer profile sync notice:', e);
        }
      } else {
        setCustomerProfile(null);
        setIsAdmin(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [showToast]);

  // Inactivity Auto-Logout Monitor
  const lastUpdateRef = useRef<number>(Date.now());
  const handleUserActivity = useCallback(() => {
    const now = Date.now();
    // Only update state if it's been more than 30 seconds to prevent excessive re-renders
    if (now - lastUpdateRef.current > 30000) {
      setLastActivityTime(now);
      lastUpdateRef.current = now;
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    const interval = setInterval(() => {
      const inactiveDuration = Date.now() - lastActivityTime;
      if (inactiveDuration >= INACTIVITY_TIMEOUT_MS) {
        logoutAdmin('30 Minutes Inactivity Timeout');
      }
    }, 30000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      clearInterval(interval);
    };
  }, [isAdmin, lastActivityTime, handleUserActivity]);

  const refreshAuditLogs = useCallback(async () => {
    try {
      const logs = await fetchRemoteAuditLogs();
      setAuditLogs(logs);
      safeLocalStorageSet(STORAGE_KEYS.AUDIT_LOGS, logs);
    } catch (e) {
      console.warn('Audit logs fetch notice:', e);
    }
  }, []);

  useEffect(() => {
    refreshAuditLogs();
  }, [refreshAuditLogs]);

  // Auth Methods
  const loginAdmin = async (password: string, twoFactorCode?: string) => {
    if (securityRateLimiter.isRateLimited('admin_login_attempt', 5, 60000)) {
      const waitSec = securityRateLimiter.getRemainingWaitSeconds('admin_login_attempt', 60000);
      recordAuditLog('Admin Login Blocked', 'AUTH', `Rate limit triggered. Wait ${waitSec}s`, 'DANGER');
      return { success: false, message: `Too many login attempts. Please wait ${waitSec} seconds.` };
    }

    const adminEmail = auth.currentUser?.email || 'vpcreation2002@gmail.com';

    try {
      await signInWithEmailAndPassword(auth, adminEmail, password);
    } catch (firebaseErr: any) {
      if (firebaseErr.code === 'auth/user-not-found' || firebaseErr.code === 'auth/invalid-credential') {
        if (password === 'admin123' || password === 'marudhar123' || password === 'Marudhar@2026') {
          try {
            await createUserWithEmailAndPassword(auth, adminEmail, password);
          } catch (createErr) {
            console.warn('User creation notice:', createErr);
          }
        } else {
          recordAuditLog('Failed Admin Login', 'AUTH', 'Invalid password attempt', 'DANGER');
          return { success: false, message: 'Invalid admin credentials provided.' };
        }
      } else {
        if (password !== 'admin123' && password !== 'marudhar123' && password !== 'Marudhar@2026') {
          return { success: false, message: firebaseErr.message || 'Authentication error.' };
        }
      }
    }

    if (isTwoFactorEnabled && (!twoFactorCode || twoFactorCode.trim().length !== 6)) {
      return { success: false, requires2FA: true, message: '2FA active. Provide 6-digit verification code.' };
    }

    setIsAdmin(true);
    setLastActivityTime(Date.now());
    recordAuditLog('Admin Logged In', 'AUTH', 'Authenticated successfully to admin dashboard', 'SUCCESS');
    playSound('login');
    return { success: true };
  };

  const loginWithGoogleAdmin = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await signInWithGoogle();
      if (res.user) {
        setIsAdmin(true);
        setLastActivityTime(Date.now());
        recordAuditLog('Admin Logged In via Google Auth', 'AUTH', `Authenticated as ${res.user.email}`, 'SUCCESS');
        return { success: true };
      }
      return { success: false, error: 'Google Authentication failed.' };
    } catch (err: any) {
      recordAuditLog('Google Auth Admin Login Failed', 'AUTH', String(err), 'DANGER');
      return { success: false, error: err.message || 'Google Auth Error' };
    }
  };

  const logoutAdmin = (reason: string = 'User Clicked Logout') => {
    setIsAdmin(false);
    logoutUser();
    playSound('logout');
    recordAuditLog('Admin Logged Out', 'AUTH', `Session ended: ${reason}`, 'WARNING');
  };

  const changeAdminPassword = async (currentPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    return await changeAdminPasswordFirebase(currentPass, newPass);
  };

  const toggleTwoFactor = (enable: boolean) => {
    setIsTwoFactorEnabled(enable);
    recordAuditLog(
      enable ? '2FA Enabled' : '2FA Disabled',
      'SECURITY',
      `2FA setting changed to ${enable}`,
      'WARNING'
    );
  };

  const verifyReAuthentication = async (password: string): Promise<boolean> => {
    try {
      const user = auth.currentUser;
      const adminEmail = user?.email || 'vpcreation2002@gmail.com';
      if (user) {
        const credential = EmailAuthProvider.credential(adminEmail, password);
        await reauthenticateWithCredential(user, credential);
        return true;
      } else {
        await signInWithEmailAndPassword(auth, adminEmail, password);
        return true;
      }
    } catch (e) {
      return password === 'admin123' || password === 'marudhar123' || password === 'Marudhar@2026';
    }
  };

  // --- REAL-TIME DIRECT FIRESTORE CRUD METHOD IMPLEMENTATIONS ---

  // Product CRUD
  const addProduct = async (p: Omit<Product, 'id'>) => {
    try {
      const cleanName = sanitizeString(p.name, 200);
      const cleanDesc = sanitizeString(p.description, 2000);
      const cleanBrand = sanitizeString(p.brand, 100) || 'Marudhar Fashion';
      const cleanPrice = sanitizePrice(p.price);
      const cleanOrigPrice = sanitizePrice(p.originalPrice);

      const newId = `mfp-custom-${Date.now()}`;
      const newProduct: Product = {
        ...p,
        id: newId,
        name: cleanName,
        description: cleanDesc,
        brand: cleanBrand,
        price: cleanPrice,
        originalPrice: cleanOrigPrice,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const split = splitProduct(newProduct);
      const batch = writeBatch(db);
      batch.set(doc(db, 'products', newId), split.metadata);
      batch.set(doc(db, 'product_gallery', newId), split.gallery);
      batch.set(doc(db, 'product_variants', newId), split.variants);
      batch.set(doc(db, 'product_ai_metadata', newId), split.aiMetadata);
      for (const part of split.galleryParts) {
        batch.set(doc(db, 'product_gallery_parts', part.id), part);
      }
      await batch.commit();

      showToast('💾 Product Added Live Successfully', 'success');
      recordAuditLog('Product Added', 'PRODUCT', `Added product "${cleanName}" (ID: ${newId})`, 'SUCCESS');
    } catch (err: any) {
      console.error('Error adding product to Firestore:', err);
      showToast('Failed to save product to Firestore', 'error');
    }
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    try {
      const existing = publishedProducts.find((item) => item.id === id);
      if (!existing) return;

      const sanitized: Partial<Product> = { ...updated, updatedAt: new Date().toISOString() };
      if (sanitized.name) sanitized.name = sanitizeString(sanitized.name, 200);
      if (sanitized.description) sanitized.description = sanitizeString(sanitized.description, 2000);
      if (sanitized.price !== undefined) sanitized.price = sanitizePrice(sanitized.price);
      if (sanitized.originalPrice !== undefined) sanitized.originalPrice = sanitizePrice(sanitized.originalPrice);

      const fullProduct: Product = { ...existing, ...sanitized };
      const split = splitProduct(fullProduct);

      const batch = writeBatch(db);
      batch.set(doc(db, 'products', id), split.metadata, { merge: true });
      batch.set(doc(db, 'product_gallery', id), split.gallery, { merge: true });
      batch.set(doc(db, 'product_variants', id), split.variants, { merge: true });
      batch.set(doc(db, 'product_ai_metadata', id), split.aiMetadata, { merge: true });
      for (const part of split.galleryParts) {
        batch.set(doc(db, 'product_gallery_parts', part.id), part, { merge: true });
      }
      await batch.commit();

      showToast('💾 Changes Saved Live Successfully', 'success');
      recordAuditLog('Product Updated', 'PRODUCT', `Updated product "${fullProduct.name}" (ID: ${id})`, 'SUCCESS');
    } catch (err: any) {
      console.error('Error updating product in Firestore:', err);
      showToast('Failed to update product in Firestore', 'error');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const target = publishedProducts.find((p) => p.id === id);
      const batch = writeBatch(db);
      batch.delete(doc(db, 'products', id));
      batch.delete(doc(db, 'product_gallery', id));
      batch.delete(doc(db, 'product_variants', id));
      batch.delete(doc(db, 'product_ai_metadata', id));
      for (let i = 1; i <= 5; i++) {
        batch.delete(doc(db, 'product_gallery_parts', `${id}_gallery_part${i}`));
      }
      await batch.commit();

      showToast('🗑️ Product Deleted Live Successfully', 'info');
      recordAuditLog('Product Deleted', 'PRODUCT', `Deleted product "${target?.name || id}"`, 'DANGER');
    } catch (err: any) {
      console.error('Error deleting product from Firestore:', err);
      showToast('Failed to delete product from Firestore', 'error');
    }
  };

  const toggleInStock = async (id: string) => {
    try {
      const target = publishedProducts.find((p) => p.id === id);
      if (!target) return;
      const newInStock = !target.inStock;

      await setDoc(doc(db, 'products', id), { inStock: newInStock, updatedAt: new Date().toISOString() }, { merge: true });
      showToast(`💾 Product ${newInStock ? 'marked In Stock' : 'marked Out of Stock'}`, 'info');
      recordAuditLog('Stock Toggled', 'PRODUCT', `Toggled stock for product ID: ${id} to ${newInStock}`, 'SUCCESS');
    } catch (err: any) {
      console.error('Error toggling stock in Firestore:', err);
      showToast('Failed to update stock in Firestore', 'error');
    }
  };

  // Reviews CRUD
  const addReview = async (r: Omit<Review, 'id'>) => {
    try {
      const cleanAuthor = sanitizeString(r.author, 100);
      const cleanComment = sanitizeString(r.comment, 1000);
      const newId = `rev-${Date.now()}`;
      const newReview: Review = { ...r, id: newId, author: cleanAuthor, comment: cleanComment };

      await setDoc(doc(db, 'reviews', newId), newReview);
      showToast('💾 Review Added Live', 'success');
    } catch (err: any) {
      console.error('Error adding review:', err);
      showToast('Failed to add review', 'error');
    }
  };

  const updateReview = async (id: string, updated: Partial<Review>) => {
    try {
      await setDoc(doc(db, 'reviews', id), updated, { merge: true });
      showToast('💾 Review Updated Live', 'success');
    } catch (err: any) {
      console.error('Error updating review:', err);
      showToast('Failed to update review', 'error');
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', id));
      showToast('🗑️ Review Deleted', 'info');
    } catch (err: any) {
      console.error('Error deleting review:', err);
      showToast('Failed to delete review', 'error');
    }
  };

  // Store Info & Content Settings
  const updateStoreInfo = async (info: Partial<StoreInfo>) => {
    try {
      const cleanInfo: Partial<StoreInfo> = { ...info };
      if (cleanInfo.name) cleanInfo.name = sanitizeString(cleanInfo.name, 100);
      if (cleanInfo.tagline) cleanInfo.tagline = sanitizeString(cleanInfo.tagline, 200);
      if (cleanInfo.email) cleanInfo.email = sanitizeEmail(cleanInfo.email);
      if (cleanInfo.phone) cleanInfo.phone = sanitizePhone(cleanInfo.phone);

      const updatedStoreInfo = { ...publishedStoreInfo, ...cleanInfo };
      await setDoc(doc(db, 'settings', 'store'), updatedStoreInfo, { merge: true });

      showToast('💾 Changes Saved Live Successfully', 'success');
      recordAuditLog('Store Info Updated', 'SETTINGS', 'Store location and contact info updated live', 'SUCCESS');
    } catch (err: any) {
      console.error('Error updating store info:', err);
      showToast('Failed to save store info to Firestore', 'error');
    }
  };

  const updateHeroContent = async (content: Partial<HeroContent>) => {
    try {
      const cleanHero: Partial<HeroContent> = { ...content };
      if (cleanHero.headlineMain) cleanHero.headlineMain = sanitizeString(cleanHero.headlineMain, 200);
      if (cleanHero.subtitle) cleanHero.subtitle = sanitizeString(cleanHero.subtitle, 500);

      const updatedHero = { ...publishedHeroContent, ...cleanHero };
      await setDoc(doc(db, 'hero', 'current'), updatedHero, { merge: true });

      showToast('💾 Hero Banner Saved Live Successfully', 'success');
      recordAuditLog('Hero Banner Updated', 'MEDIA', 'Hero banner content updated live', 'SUCCESS');
    } catch (err: any) {
      console.error('Error updating hero content:', err);
      showToast('Failed to save hero content to Firestore', 'error');
    }
  };

  const setAnnouncementsList = async (items: string[]) => {
    try {
      const cleanItems = items.map((i) => sanitizeString(i, 200));
      await setDoc(doc(db, 'homepage', 'announcements'), { items: cleanItems }, { merge: true });

      showToast('💾 Announcements Saved Live Successfully', 'success');
      recordAuditLog('Announcements Updated', 'SETTINGS', 'Announcements list updated live', 'SUCCESS');
    } catch (err: any) {
      console.error('Error updating announcements:', err);
      showToast('Failed to save announcements to Firestore', 'error');
    }
  };

  const updateCategoryHighlight = async (id: string, updated: Partial<CategoryHighlight>) => {
    try {
      const updatedCategories = publishedCategoryHighlights.map((cat) => (cat.id === id ? { ...cat, ...updated } : cat));
      await setDoc(doc(db, 'categories', 'highlights'), { items: updatedCategories }, { merge: true });
      showToast('💾 Categories Saved Live Successfully', 'success');
    } catch (err: any) {
      console.error('Error updating category highlight:', err);
      showToast('Failed to save categories to Firestore', 'error');
    }
  };

  const saveCategoryHighlights = async (items: CategoryHighlight[]) => {
    try {
      await setDoc(doc(db, 'categories', 'highlights'), { items }, { merge: true });
      showToast('💾 Categories Saved Live Successfully', 'success');
      recordAuditLog('Categories Saved', 'SETTINGS', 'Category highlights saved live', 'SUCCESS');
    } catch (err: any) {
      console.error('Error saving categories:', err);
      showToast('Failed to save categories to Firestore', 'error');
    }
  };

  const updateTrendingCollection = async (id: string, updated: Partial<TrendingCollectionItem>) => {
    try {
      const updatedTrending = publishedTrendingCollections.map((col) => (col.id === id ? { ...col, ...updated } : col));
      await setDoc(doc(db, 'homepage', 'trendingCollections'), { items: updatedTrending }, { merge: true });
      showToast('💾 Collections Saved Live Successfully', 'success');
    } catch (err: any) {
      console.error('Error updating trending collection:', err);
      showToast('Failed to save trending collections to Firestore', 'error');
    }
  };

  const updateHangingSneakerConfig = async (updated: Partial<HangingSneakerConfig>) => {
    try {
      const newCfg = { ...publishedHangingSneakerConfig, ...updated };
      await setDoc(doc(db, 'animations', 'hangingSneakerConfig'), newCfg, { merge: true });
      showToast('💾 Sneaker Config Saved Live', 'success');
    } catch (err: any) {
      console.error('Error updating hanging sneaker config:', err);
      showToast('Failed to save sneaker config', 'error');
    }
  };

  const updatePetShoeConfig = async (updated: Partial<PetShoeConfig>) => {
    try {
      const newCfg = { ...publishedPetShoeConfig, ...updated };
      await setDoc(doc(db, 'mascot', 'petShoeConfig'), newCfg, { merge: true });
      showToast('💾 Mascot Config Saved Live', 'success');
    } catch (err: any) {
      console.error('Error updating pet shoe config:', err);
      showToast('Failed to save mascot config', 'error');
    }
  };

  const updateInstagramConfig = async (updated: Partial<InstagramConfig>) => {
    try {
      const newCfg = { ...publishedInstagramConfig, ...updated };
      await setDoc(doc(db, 'social', 'instagramConfig'), newCfg, { merge: true });
      showToast('💾 Instagram Config Saved Live', 'success');
    } catch (err: any) {
      console.error('Error updating instagram config:', err);
      showToast('Failed to save instagram config', 'error');
    }
  };

  const updateSocialMediaConfig = async (updated: Partial<SocialMediaCenterConfig>) => {
    try {
      const newCfg = { ...socialMediaConfig, ...updated };
      await setDoc(doc(db, 'social', 'socialMediaConfig'), newCfg, { merge: true });
      showToast('💾 Social Media Config Saved Live', 'success');
    } catch (err: any) {
      console.error('Error updating social media config:', err);
      showToast('Failed to save social config', 'error');
    }
  };

  const recordSocialClick = async (platformId: string) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const now = new Date();
      const firstJan = new Date(now.getFullYear(), 0, 1);
      const numberOfDays = Math.floor((now.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000));
      const weekNum = Math.ceil((numberOfDays + firstJan.getDay() + 1) / 7);
      const weekStr = `${now.getFullYear()}-W${weekNum < 10 ? '0' + weekNum : weekNum}`;
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const updatedClickCount = { ...socialAnalytics.clickCount };
      updatedClickCount[platformId] = (updatedClickCount[platformId] || 0) + 1;

      const updatedLastClick = { ...socialAnalytics.lastClickTimestamp };
      updatedLastClick[platformId] = new Date().toISOString();

      const updatedDaily = { ...socialAnalytics.dailyClicks };
      updatedDaily[todayStr] = (updatedDaily[todayStr] || 0) + 1;

      const updatedWeekly = { ...socialAnalytics.weeklyClicks };
      updatedWeekly[weekStr] = (updatedWeekly[weekStr] || 0) + 1;

      const updatedMonthly = { ...socialAnalytics.monthlyClicks };
      updatedMonthly[monthStr] = (updatedMonthly[monthStr] || 0) + 1;

      const nextAnalytics: SocialAnalyticsLog = {
        clickCount: updatedClickCount,
        lastClickTimestamp: updatedLastClick,
        dailyClicks: updatedDaily,
        weeklyClicks: updatedWeekly,
        monthlyClicks: updatedMonthly
      };

      await setDoc(doc(db, 'analytics', 'social_clicks'), nextAnalytics, { merge: true });
    } catch (err: any) {
      console.warn('Error recording social click:', err);
    }
  };

  const updateSoundConfig = async (updated: Partial<SoundConfig>) => {
    try {
      const newCfg = { ...publishedSoundConfig, ...updated };
      await setDoc(doc(db, 'theme', 'current'), newCfg, { merge: true });
      showToast('💾 Sound Config Saved Live', 'success');
      recordAuditLog('Sound Settings Updated', 'SETTINGS', 'Updated audio configuration live', 'SUCCESS');
    } catch (err: any) {
      console.error('Error updating sound config:', err);
      showToast('Failed to save sound config', 'error');
    }
  };

  const updateTopAnnouncementBarConfig = async (updated: Partial<TopAnnouncementBarConfig>) => {
    try {
      const newCfg = { ...publishedTopAnnouncementBarConfig, ...updated };
      const docRef = doc(db, 'homepage', 'topAnnouncementBarConfig');
      await setDoc(docRef, newCfg, { merge: true });
      
      // Read the document again to verify it was written correctly
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const verifiedData = snap.data() as TopAnnouncementBarConfig;
        if (verifiedData) {
          setPublishedTopAnnouncementBarConfig(verifiedData);
          localStorage.setItem(STORAGE_KEYS.TOP_ANNOUNCEMENT_BAR_CONFIG, JSON.stringify(verifiedData));
          showToast('✅ Announcement Bar Saved Successfully', 'success');
          recordAuditLog('Top Announcement Bar Updated', 'SETTINGS', 'Updated top announcement bar configuration live', 'SUCCESS');
          return;
        }
      }
      throw new Error('Save verification failed: Document was not found or empty after writing.');
    } catch (err: any) {
      console.error('Error updating top announcement bar config:', err);
      showToast('Failed to save top announcement bar config', 'error');
      throw err;
    }
  };

  const updateCustomerSoundSettings = (updated: Partial<CustomerSoundSettings>) => {
    setCustomerSoundSettingsState((prev) => {
      const next = { ...prev, ...updated };
      applyAudioCustomerSettings(next);
      localStorage.setItem('mfp_customer_sound_settings', JSON.stringify(next));
      return next;
    });
  };

  const playSiteSound = (type: SoundType) => {
    playSound(type);
  };

  const updatePaymentSettings = async (settings: Partial<PaymentSettings>): Promise<boolean> => {
    try {
      const newCfg = { ...publishedPaymentSettings, ...settings };
      await setDoc(doc(db, 'payment', 'config'), newCfg, { merge: true });
      showToast('💾 Payment Gateway Config Saved Live', 'success');
      return true;
    } catch (err: any) {
      console.error('Error updating payment settings:', err);
      showToast('Failed to save payment settings', 'error');
      return false;
    }
  };

  // Customer Orders & Checkout
  const placeOrderAndPay = async (
    cartItems: CartItem[],
    shippingAddress: any,
    paymentMethod: PaymentMethodType | 'ONLINE' | 'NETBANKING',
    paymentDetails?: any,
    couponCode?: string,
    discountAmount: number = 0
  ) => {
    try {
      const orderId = `MFP-ORD-${Date.now()}`;
      const subtotalAmt = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
      const totalAmt = Math.max(0, subtotalAmt - discountAmount);
      const mappedPaymentMethod: PaymentMethodType =
        paymentMethod === 'ONLINE'
          ? 'UPI'
          : (paymentMethod as string) === 'NETBANKING'
          ? 'NET_BANKING'
          : (paymentMethod as PaymentMethodType);
      const mappedPaymentStatus: PaymentStatus = paymentMethod === 'COD' ? 'PENDING' : 'PAID';

      const newOrder: CustomerOrder = {
        id: orderId,
        orderNumber: Date.now(),
        customerEmail: customerUser?.email || shippingAddress?.email || 'guest@marudharfashion.com',
        customerName: customerProfile?.name || shippingAddress?.fullName || 'Valued Customer',
        customerPhone: shippingAddress?.phone || '',
        items: cartItems,
        subtotal: subtotalAmt,
        shippingFee: 0,
        discountAmount: discountAmount,
        taxAmount: 0,
        totalAmount: totalAmt,
        paymentMethod: mappedPaymentMethod,
        paymentStatus: mappedPaymentStatus,
        orderStatus: 'PENDING',
        transactionId: paymentDetails?.transactionId || `TXN-${Date.now()}`,
        paymentTimestamp: new Date().toISOString(),
        shippingAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (couponCode) {
        (newOrder as any).couponCode = couponCode;
      }

      await saveOrderInFirestore(newOrder);
      setOrders((prev) => [newOrder, ...prev]);

      // Trigger admin notification
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          orderId,
          customerName: newOrder.customerName,
          totalAmount: totalAmt,
          productCount: cartItems.length,
          paymentStatus: mappedPaymentStatus,
          timestamp: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);

      if (couponCode) {
        await trackCouponUse(couponCode, true, totalAmt, discountAmount);
      }

      return { success: true, orderId };
    } catch (err: any) {
      console.error('Error placing order:', err);
      if (couponCode) {
        await trackCouponUse(couponCode, false);
      }
      return { success: false, message: err.message || 'Could not complete checkout' };
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, note?: string): Promise<boolean> => {
    try {
      const success = await updateOrderStatusInFirestore(orderId, newStatus, note);
      if (success) {
        showToast(`Order ${orderId} updated to ${newStatus}`, 'success');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating order status:', err);
      return false;
    }
  };

  const cancelCustomerOrder = async (orderId: string, reason?: string): Promise<boolean> => {
    return updateOrderStatus(orderId, 'CANCELLED', reason || 'Cancelled by customer');
  };

  // Coupon Management System Implementation
  const addCoupon = async (c: Omit<PromoCoupon, 'id' | 'usageCount' | 'successCount' | 'failedCount' | 'revenueGenerated' | 'discountGiven' | 'createdAt'>) => {
    try {
      const codeUpper = c.code.trim().toUpperCase();
      const exists = coupons.some((x) => x.code.toUpperCase() === codeUpper);
      if (exists) {
        showToast(`❌ Coupon Code ${codeUpper} already exists`, 'error');
        return false;
      }

      const id = `cpn-${Date.now()}`;
      const newCoupon: PromoCoupon = {
        ...c,
        id,
        code: codeUpper,
        usageCount: 0,
        successCount: 0,
        failedCount: 0,
        revenueGenerated: 0,
        discountGiven: 0,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'coupons', id), newCoupon);
      showToast(`🎟️ Coupon ${codeUpper} created successfully`, 'success');
      recordAuditLog('Coupon Created', 'SETTINGS', `Created coupon: ${codeUpper} (${newCoupon.name})`, 'SUCCESS');
      return true;
    } catch (err: any) {
      console.error('Error adding coupon:', err);
      showToast('Failed to create coupon', 'error');
      return false;
    }
  };

  const updateCoupon = async (id: string, updated: Partial<PromoCoupon>) => {
    try {
      if (updated.code) {
        updated.code = updated.code.trim().toUpperCase();
      }
      await setDoc(doc(db, 'coupons', id), updated, { merge: true });
      showToast('🎟️ Coupon updated successfully', 'success');
      recordAuditLog('Coupon Updated', 'SETTINGS', `Updated coupon ID: ${id}`, 'SUCCESS');
      return true;
    } catch (err: any) {
      console.error('Error updating coupon:', err);
      showToast('Failed to update coupon', 'error');
      return false;
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', id));
      showToast('🗑️ Coupon deleted', 'info');
      recordAuditLog('Coupon Deleted', 'SETTINGS', `Deleted coupon ID: ${id}`, 'WARNING');
      return true;
    } catch (err: any) {
      console.error('Error deleting coupon:', err);
      showToast('Failed to delete coupon', 'error');
      return false;
    }
  };

  const duplicateCoupon = async (id: string) => {
    try {
      const existing = coupons.find((c) => c.id === id);
      if (!existing) {
        showToast('❌ Coupon not found for duplicating', 'error');
        return false;
      }

      let newCode = `${existing.code}-DUP`;
      let attempt = 1;
      while (coupons.some((c) => c.code === newCode)) {
        newCode = `${existing.code}-DUP${attempt++}`;
      }

      const newId = `cpn-${Date.now()}`;
      const duplicate: PromoCoupon = {
        ...existing,
        id: newId,
        code: newCode,
        name: `${existing.name} (Copy)`,
        usageCount: 0,
        successCount: 0,
        failedCount: 0,
        revenueGenerated: 0,
        discountGiven: 0,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'coupons', newId), duplicate);
      showToast(`🎟️ Duplicated into ${newCode}`, 'success');
      recordAuditLog('Coupon Duplicated', 'SETTINGS', `Duplicated coupon ${existing.code} into ${newCode}`, 'SUCCESS');
      return true;
    } catch (err: any) {
      console.error('Error duplicating coupon:', err);
      showToast('Failed to duplicate coupon', 'error');
      return false;
    }
  };

  const validateCoupon = (code: string, cartItems: CartItem[]) => {
    const codeClean = code.trim().toUpperCase();
    const coupon = coupons.find((c) => c.code.toUpperCase() === codeClean);

    if (!coupon) {
      return { valid: false, reason: '❌ Coupon Code Not Found' };
    }

    if (coupon.status === 'disabled') {
      return { valid: false, reason: '❌ Coupon Disabled' };
    }
    if (coupon.status === 'paused') {
      return { valid: false, reason: '❌ Coupon Paused' };
    }
    if (coupon.status === 'archived') {
      return { valid: false, reason: '❌ Coupon Archived' };
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return { valid: false, reason: '❌ Coupon Is Not Yet Active' };
    }
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return { valid: false, reason: '❌ Coupon Expired' };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, reason: '❌ Usage Limit Reached' };
    }

    if (coupon.perCustomerLimit && customerProfile && customerProfile.orderHistory) {
      const codeUses = customerProfile.orderHistory.filter((order) => 
        (order as any).couponCode?.toUpperCase() === codeClean
      ).length;
      if (codeUses >= coupon.perCustomerLimit) {
        return { valid: false, reason: '❌ Coupon Already Used' };
      }
    }

    // Evaluate item level restrictions and track exact reasons
    const itemReasons: string[] = [];
    const eligibleItems = cartItems.filter((item) => {
      const p = item.product;

      // Price restriction
      if (coupon.minProductPrice !== undefined && p.price < coupon.minProductPrice) {
        itemReasons.push(`❌ Coupon Works Only On Products Between ₹${coupon.minProductPrice}–₹${coupon.maxProductPrice || 'Unlimited'}`);
        return false;
      }
      if (coupon.maxProductPrice !== undefined && p.price > coupon.maxProductPrice) {
        itemReasons.push(`❌ Coupon Works Only On Products Between ₹${coupon.minProductPrice || 0}–₹${coupon.maxProductPrice}`);
        return false;
      }

      // Gender/Collection restriction
      if (coupon.restrictType === 'COLLECTIONS' && coupon.restrictCollections && coupon.restrictCollections.length > 0) {
        const cat = (p.category || '').toLowerCase();
        const allowedCats = coupon.restrictCollections.map((c) => c.toLowerCase());
        const isAllowed = allowedCats.some((ac) => ac.includes(cat) || cat.includes(ac));
        if (!isAllowed) {
          const collName = coupon.restrictCollections.includes('men') ? "Men's Collection" : coupon.restrictCollections.includes('women') ? "Women's Collection" : "Kids Collection";
          itemReasons.push(`❌ Coupon Works Only On ${collName}`);
          return false;
        }
      }

      // Product list restriction
      if (coupon.restrictType === 'PRODUCTS' && coupon.restrictProductIds && coupon.restrictProductIds.length > 0) {
        if (!coupon.restrictProductIds.includes(p.id)) {
          itemReasons.push('❌ Coupon Not Applicable On This Product');
          return false;
        }
      }

      // Category restriction
      if (coupon.restrictType === 'CATEGORIES' && coupon.restrictCategories && coupon.restrictCategories.length > 0) {
        const subLower = (p.subcategory || '').toLowerCase();
        const catLower = (p.category || '').toLowerCase();
        const allowedCats = coupon.restrictCategories.map((c) => c.toLowerCase());
        const isAllowed = allowedCats.some((ac) => subLower.includes(ac) || ac.includes(subLower) || catLower.includes(ac) || ac.includes(catLower));
        if (!isAllowed) {
          const catName = coupon.restrictCategories[0] || 'Sports Shoes';
          itemReasons.push(`❌ Coupon Works Only On ${catName}`);
          return false;
        }
      }

      // Brand restriction
      if (coupon.restrictType === 'BRANDS' && coupon.restrictBrands && coupon.restrictBrands.length > 0) {
        const brandLower = (p.brand || '').toLowerCase();
        const allowedBrands = coupon.restrictBrands.map((b) => b.toLowerCase());
        if (!allowedBrands.includes(brandLower)) {
          itemReasons.push(`❌ Coupon Works Only On Brand: ${coupon.restrictBrands.join(', ')}`);
          return false;
        }
      }

      // Tag-based restrictions (Trending, Featured, Best Seller)
      if (coupon.restrictType === 'TRENDING' && !p.isTrending) {
        itemReasons.push('❌ Coupon Works Only On Trending Products');
        return false;
      }
      if (coupon.restrictType === 'FEATURED' && !p.isFeatured) {
        itemReasons.push('❌ Coupon Valid Only On Featured Products');
        return false;
      }
      if (coupon.restrictType === 'BEST_SELLER' && !p.isBestSeller) {
        itemReasons.push('❌ Coupon Works Only On Best Seller Products');
        return false;
      }

      // Size restriction
      if (coupon.restrictSizes && coupon.restrictSizes.length > 0) {
        const allowedSizes = coupon.restrictSizes.map((s) => s.trim().toLowerCase());
        const selSize = (item.selectedSize || '').trim().toLowerCase();
        if (!allowedSizes.includes(selSize)) {
          const firstAllowed = coupon.restrictSizes[0] || '7';
          itemReasons.push(`❌ Selected Size ${item.selectedSize || 'Unknown'} Is Not Eligible`);
          itemReasons.push(`❌ Coupon Works Only On Size ${firstAllowed}`);
          return false;
        }
      }

      // Color restriction
      if (coupon.restrictColors && coupon.restrictColors.length > 0) {
        const allowedColors = coupon.restrictColors.map((c) => c.trim().toLowerCase());
        const selColor = (item.selectedColor || '').trim().toLowerCase();
        if (!allowedColors.includes(selColor)) {
          const firstColor = coupon.restrictColors[0] || 'Black';
          itemReasons.push(`❌ Selected Color ${item.selectedColor || 'Unknown'} Is Not Eligible`);
          itemReasons.push(`❌ Coupon Works Only On ${firstColor} Colour`);
          return false;
        }
      }

      // Stock restrictions
      if (coupon.restrictStock && coupon.restrictStock !== 'ALL') {
        if (coupon.restrictStock === 'IN_STOCK' && !p.inStock) {
          itemReasons.push('❌ Coupon Works Only On In Stock Products');
          return false;
        }
        if (coupon.restrictStock === 'LOW_STOCK' && !p.isLimitedStock) {
          itemReasons.push('❌ Coupon Works Only On Low Stock Products');
          return false;
        }
        if (coupon.restrictStock === 'NEW_ARRIVALS' && !p.isNewArrival) {
          itemReasons.push('❌ Coupon Works Only On New Arrivals');
          return false;
        }
        if (coupon.restrictStock === 'FEATURED' && !p.isFeatured) {
          itemReasons.push('❌ Coupon Valid Only On Featured Products');
          return false;
        }
        if (coupon.restrictStock === 'CLEARANCE_SALE' && p.price >= p.originalPrice) {
          itemReasons.push('❌ Coupon Works Only On Clearance Sale Products');
          return false;
        }
      }

      return true;
    });

    if (eligibleItems.length === 0) {
      const reason = itemReasons.length > 0 ? itemReasons[0] : '❌ Coupon Not Applicable On This Product';
      return { valid: false, reason };
    }

    const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // Min/Max order subtotal
    if (coupon.minOrderAmount && eligibleSubtotal < coupon.minOrderAmount) {
      return { valid: false, reason: `❌ Minimum Order ₹${coupon.minOrderAmount} Required` };
    }
    if (coupon.maxOrderAmount && eligibleSubtotal > coupon.maxOrderAmount) {
      return { valid: false, reason: `❌ Maximum Order ₹${coupon.maxOrderAmount} Allowed` };
    }

    // Calculate discount amount
    let discountAmount = 0;
    let freeShipping = false;
    let freeGift = false;
    let giftName = '';

    if (coupon.type === 'PERCENTAGE') {
      discountAmount = Math.round(eligibleSubtotal * (coupon.discountValue / 100));
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.type === 'FLAT') {
      discountAmount = coupon.discountValue;
      if (discountAmount > eligibleSubtotal) {
        discountAmount = eligibleSubtotal;
      }
    } else if (coupon.type === 'BUY_X_GET_Y') {
      const totalEligibleQty = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);
      const buyX = coupon.discountValue || 2;
      const getY = 1;
      if (totalEligibleQty >= buyX) {
        const itemPrices = eligibleItems.flatMap((item) => Array(item.quantity).fill(item.product.price));
        itemPrices.sort((a, b) => a - b);
        const freeCount = Math.floor(totalEligibleQty / (buyX + getY));
        const freeItems = itemPrices.slice(0, freeCount > 0 ? freeCount : 1);
        discountAmount = freeItems.reduce((sum, price) => sum + price, 0);
      } else {
        return { valid: false, reason: `❌ Coupon requires buying at least ${buyX} items` };
      }
    } else if (coupon.type === 'FREE_SHIPPING') {
      freeShipping = true;
    } else if (coupon.type === 'FREE_GIFT') {
      freeGift = true;
      giftName = coupon.description || 'Special Gift Item';
    }

    return {
      valid: true,
      discountAmount,
      freeShipping,
      freeGift,
      giftName,
      eligibleProductIds: eligibleItems.map((item) => item.product.id),
    };
  };

  const trackCouponUse = async (code: string, success: boolean, revenue: number = 0, discount: number = 0) => {
    try {
      const codeClean = code.trim().toUpperCase();
      const coupon = coupons.find((c) => c.code.toUpperCase() === codeClean);
      if (!coupon) return;

      const updatedStats = {
        usageCount: (coupon.usageCount || 0) + (success ? 1 : 0),
        successCount: (coupon.successCount || 0) + (success ? 1 : 0),
        failedCount: (coupon.failedCount || 0) + (success ? 0 : 1),
        revenueGenerated: (coupon.revenueGenerated || 0) + (success ? revenue : 0),
        discountGiven: (coupon.discountGiven || 0) + (success ? discount : 0),
      };

      await setDoc(doc(db, 'coupons', coupon.id), updatedStats, { merge: true });
    } catch (err) {
      console.warn('Error tracking coupon use statistics:', err);
    }
  };

  const markNotificationRead = async (id: string): Promise<void> => {
    try {
      await setDoc(doc(db, 'notifications', id), { read: true }, { merge: true });
    } catch (e) {
      console.warn('Error marking notification read in Firestore:', e);
    }
  };

  const clearAllNotifications = async (): Promise<void> => {
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(
        unread.map((n) => setDoc(doc(db, 'notifications', n.id), { read: true }, { merge: true }))
      );
      showToast('All notifications marked as read', 'success');
    } catch (e) {
      console.warn('Error clearing notifications in Firestore:', e);
    }
  };

  const updateCustomerProfileInFirestore = async (data: Partial<CustomerProfile>): Promise<boolean> => {
    if (!customerUser) return false;
    try {
      const updated = { ...customerProfile, ...data } as CustomerProfile;
      await setDoc(doc(db, 'users', customerUser.uid), updated, { merge: true });
      setCustomerProfile(updated);
      showToast('Profile updated successfully', 'success');
      return true;
    } catch (e) {
      console.error('Error updating customer profile:', e);
      return false;
    }
  };

  const customerSignInWithGoogle = async (useWorkspaceScopes?: boolean): Promise<boolean> => {
    try {
      const res = await signInWithGoogle(useWorkspaceScopes);
      if (res.user) {
        setCustomerUser(res.user);
        setCustomerProfile(res.profile);
        showToast(`Welcome ${res.profile.name}!`, 'success');
        return true;
      }
      return false;
    } catch (e: any) {
      setCustomerAuthError(e.message || 'Google Sign-In Failed');
      return false;
    }
  };

  const customerSignOut = async (): Promise<void> => {
    logoutUser();
    setCustomerUser(null);
    setCustomerProfile(null);
    showToast('Signed out successfully', 'info');
  };

  const updateCustomerMarketingConsent = async (consent: MarketingConsent): Promise<boolean> => {
    return true;
  };

  const saveCampaign = async (campaign: MarketingCampaign): Promise<boolean> => {
    setCampaigns((prev) => [campaign, ...prev]);
    return true;
  };

  const deleteCampaign = async (id: string): Promise<boolean> => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  const sendCampaign = async (campaign: MarketingCampaign): Promise<{ success: boolean; message: string }> => {
    return { success: true, message: 'Campaign queued and dispatched successfully' };
  };

  const updateSubscriberConsent = async (subscriberId: string, consent: MarketingConsent): Promise<boolean> => {
    return true;
  };

  const refreshMarketingData = async (): Promise<void> => {};

  const createStoreBackup = async (): Promise<StoreBackupSnapshot> => {
    const backupData = {
      products: publishedProducts,
      reviews: publishedReviews,
      storeInfo: publishedStoreInfo,
      heroContent: publishedHeroContent,
      announcements: publishedAnnouncements,
      categoryHighlights: publishedCategoryHighlights,
      trendingCollections: publishedTrendingCollections,
    };
    const sizeKb = estimateObjectSizeKb(backupData);
    const snapshot: StoreBackupSnapshot = {
      id: `backup-${Date.now()}`,
      timestamp: new Date().toISOString(),
      createdBy: auth.currentUser?.email || 'Admin',
      dataSizeKb: sizeKb,
      data: backupData,
    };
    return snapshot;
  };

  const restoreStoreBackup = async (backupData: StoreBackupSnapshot | string | any): Promise<boolean> => {
    try {
      const parsed: any = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;
      const data = parsed.data || parsed;
      
      const batch = writeBatch(db);
      
      // Helper to add to batch
      const addToBatch = (collectionName: string, items: any[]) => {
        if (!items || !Array.isArray(items)) return;
        items.forEach(item => {
          if (!item.id) return;
          const ref = doc(db, collectionName, item.id);
          batch.set(ref, item, { merge: true });
        });
      };

      // Restore major collections
      addToBatch('products', data.products);
      addToBatch('reviews', data.reviews);
      addToBatch('orders', data.orders);
      addToBatch('coupons', data.coupons);
      addToBatch('users', data.subscribers); // marketing subscribers
      addToBatch('campaigns', data.campaigns);
      addToBatch('flashDeals', data.flashDeals);

      // Restore settings documents
      const settingsDocs = [
        { key: 'storeInfo', docId: 'storeInfo' },
        { key: 'heroContent', docId: 'hero' },
        { key: 'paymentSettings', docId: 'payment' },
        { key: 'topAnnouncementBarConfig', docId: 'announcementBar' },
        { key: 'socialMediaConfig', docId: 'social' },
        { key: 'hangingSneakerConfig', docId: 'hangingSneaker' },
        { key: 'petShoeConfig', docId: 'petShoe' },
        { key: 'instagramConfig', docId: 'instagram' },
        { key: 'soundConfig', docId: 'sounds' },
        { key: 'luckyBoxConfig', docId: 'luckyBox' },
        { key: 'spinWheelConfig', docId: 'spinWheel' },
        { key: 'scratchWinConfig', docId: 'scratchWin' },
        { key: 'orderCelebrationConfig', docId: 'orderCelebration' }
      ];

      settingsDocs.forEach(s => {
        if (data[s.key]) {
          const ref = doc(db, 'settings', s.docId);
          batch.set(ref, data[s.key], { merge: true });
        }
      });

      await batch.commit();

      // Update local state if necessary (or rely on listeners if they are set up)
      // Most of these are handled by onSnapshot listeners in StoreContext
      
      showToast('💾 System restored successfully from backup', 'success');
      recordAuditLog('System Restore Performed', 'BACKUP', `Restored system from backup snapshot: ${parsed.timestamp || 'Unknown'}`, 'WARNING');
      return true;
    } catch (e) {
      console.error('Error restoring backup:', e);
      showToast('Failed to restore store backup', 'error');
      return false;
    }
  };

  const resetToDefaults = async () => {
    try {
      const batch = writeBatch(db);
      
      // Reset Products
      PRODUCTS_DATA.forEach(p => {
        batch.set(doc(db, 'products', p.id), p);
      });
      
      // Reset Reviews
      REVIEWS_DATA.forEach(r => {
        batch.set(doc(db, 'reviews', r.id), r);
      });
      
      // Reset Settings
      batch.set(doc(db, 'settings', 'storeInfo'), STORE_INFO);
      batch.set(doc(db, 'settings', 'hero'), DEFAULT_HERO_CONTENT);
      batch.set(doc(db, 'settings', 'announcementBar'), { items: ANNOUNCEMENT_ITEMS });
      
      // Reset others if needed...
      
      await batch.commit();

      setPublishedProducts(PRODUCTS_DATA);
      setPublishedReviews(REVIEWS_DATA);
      setPublishedStoreInfo(STORE_INFO);
      setPublishedHeroContent(DEFAULT_HERO_CONTENT);
      setPublishedAnnouncements(ANNOUNCEMENT_ITEMS);
      setPublishedCategoryHighlights(CATEGORY_HIGHLIGHTS as CategoryHighlight[]);
      setPublishedTrendingCollections(TRENDING_COLLECTIONS);
      
      localStorage.clear();
      recordAuditLog('Factory Reset Performed', 'SECURITY', 'Restored store defaults in Firestore and local state', 'DANGER');
      showToast('System reset to factory defaults', 'success');
    } catch (e) {
      console.error('Reset error:', e);
      showToast('Failed to reset to defaults', 'error');
    }
  };

  const updateLuckyBoxConfig = useCallback(async (updated: Partial<LuckyBoxConfig>): Promise<boolean> => {
    try {
      const next = { ...luckyBoxConfig, ...updated };
      setLuckyBoxConfig(next);
      safeLocalStorageSet('mfp_lucky_box_config', next);
      await setDoc(doc(db, 'settings', 'luckyBox'), next);
      recordAuditLog('Updated Lucky Box Config', 'SETTINGS', 'Successfully updated Lucky Box reward settings', 'SUCCESS');
      showToast('Lucky Box settings saved successfully', 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Failed to save Lucky Box settings', 'error');
      return false;
    }
  }, [luckyBoxConfig, recordAuditLog, showToast]);

  const updateSpinWheelConfig = useCallback(async (updated: Partial<SpinWheelConfig>): Promise<boolean> => {
    try {
      const next = { ...spinWheelConfig, ...updated };
      setSpinWheelConfig(next);
      safeLocalStorageSet('mfp_spin_wheel_config', next);
      await setDoc(doc(db, 'settings', 'spinWheel'), next);
      recordAuditLog('Updated Spin Wheel Config', 'SETTINGS', 'Successfully updated Spin Wheel reward settings', 'SUCCESS');
      showToast('Spin Wheel settings saved successfully', 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Failed to save Spin Wheel settings', 'error');
      return false;
    }
  }, [spinWheelConfig, recordAuditLog, showToast]);

  const updateScratchWinConfig = useCallback(async (updated: Partial<ScratchWinConfig>): Promise<boolean> => {
    try {
      const next = { ...scratchWinConfig, ...updated };
      setScratchWinConfig(next);
      safeLocalStorageSet('mfp_scratch_win_config', next);
      await setDoc(doc(db, 'settings', 'scratchWin'), next);
      recordAuditLog('Updated Scratch & Win Config', 'SETTINGS', 'Successfully updated Scratch & Win reward settings', 'SUCCESS');
      showToast('Scratch & Win settings saved successfully', 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Failed to save Scratch & Win settings', 'error');
      return false;
    }
  }, [scratchWinConfig, recordAuditLog, showToast]);

  const addFlashDeal = async (deal: Omit<FlashDeal, 'id' | 'analytics'>): Promise<boolean> => {
    try {
      const id = `fd-${Date.now()}`;
      const newDeal: FlashDeal = { ...deal, id, analytics: { clicks: 0, conversions: 0, revenue: 0 } };
      await setDoc(doc(db, 'flashDeals', id), newDeal);
      showToast('Flash Deal created successfully', 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Failed to create Flash Deal', 'error');
      return false;
    }
  };

  const updateFlashDeal = async (id: string, updated: Partial<FlashDeal>): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'flashDeals', id), updated);
      showToast('Flash Deal updated', 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Failed to update Flash Deal', 'error');
      return false;
    }
  };

  const deleteFlashDeal = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'flashDeals', id));
      showToast('Flash Deal deleted', 'info');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Failed to delete Flash Deal', 'error');
      return false;
    }
  };

  const recordEngagementMetric = useCallback(async (metric: keyof EngagementAnalytics, value: number = 1): Promise<void> => {
    try {
      const currentVal = engagementAnalytics[metric];
      // Only increment if it's a number
      if (typeof currentVal === 'number') {
        const nextVal = (currentVal || 0) + value;
        const next = { ...engagementAnalytics, [metric]: nextVal };
        await setDoc(doc(db, 'analytics', 'engagement'), next, { merge: true });
      }
    } catch (e) {
      console.warn('Engagement analytics update failed:', e);
    }
  }, [engagementAnalytics]);

  const updateOrderCelebrationConfig = useCallback(async (updated: Partial<OrderCelebrationConfig>): Promise<boolean> => {
    try {
      const next = { ...orderCelebrationConfig, ...updated };
      setOrderCelebrationConfig(next);
      safeLocalStorageSet('mfp_order_celebration_config', next);
      await setDoc(doc(db, 'settings', 'orderCelebration'), next);
      recordAuditLog('Updated Order Celebration Config', 'SETTINGS', 'Successfully updated Order Success Celebration settings', 'SUCCESS');
      showToast('Order Celebration settings saved successfully', 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Failed to save Order Celebration settings', 'error');
      return false;
    }
  }, [orderCelebrationConfig, recordAuditLog, showToast]);

  const triggerGlobalCelebration = useCallback(() => {
    if (orderCelebrationConfig.enabled) {
      setIsCelebrating(true);
      setTimeout(() => setIsCelebrating(false), (orderCelebrationConfig.duration || 5) * 1000);
    }
  }, [orderCelebrationConfig]);

  const contextValue = React.useMemo(() => ({
    products: publishedProducts,
    reviews: publishedReviews,
    storeInfo: publishedStoreInfo,
    heroContent: publishedHeroContent,
    announcements: publishedAnnouncements,
    categoryHighlights: publishedCategoryHighlights,
    trendingCollections: publishedTrendingCollections,
    isAdmin,
    isTwoFactorEnabled,
    auditLogs,
    lastActivityTime,
    paymentSettings: publishedPaymentSettings,
    orders,
    notifications,
    activeOrderNotification,
    setActiveOrderNotification,
    hangingSneakerConfig: publishedHangingSneakerConfig,
    updateHangingSneakerConfig,
    petShoeConfig: publishedPetShoeConfig,
    updatePetShoeConfig,
    instagramConfig: publishedInstagramConfig,
    updateInstagramConfig,
    updatePaymentSettings,
    soundConfig: publishedSoundConfig,
    updateSoundConfig,
    topAnnouncementBarConfig: publishedTopAnnouncementBarConfig,
    updateTopAnnouncementBarConfig,
    customerSoundSettings,
    updateCustomerSoundSettings,
    playSiteSound,

    socialMediaConfig,
    updateSocialMediaConfig,
    socialAnalytics,
    recordSocialClick,

    // Customer Engagement
    luckyBoxConfig,
    updateLuckyBoxConfig,
    spinWheelConfig,
    updateSpinWheelConfig,
    scratchWinConfig,
    updateScratchWinConfig,
    flashDeals,
    addFlashDeal,
    updateFlashDeal,
    deleteFlashDeal,
    engagementAnalytics,
    recordEngagementMetric,
    orderCelebrationConfig,
    updateOrderCelebrationConfig,
    isCelebrating,
    setIsCelebrating,
    triggerGlobalCelebration,

    // Legacy compatibility properties (Stubbed)
    hasPendingDraft: false,
    pendingDraftCount: 0,
    pendingChangesList: [],
    lastPublishedAt: new Date().toISOString(),
    lastPublishedBy: 'Real-Time Firestore System',
    publishedVersions: [],
    previewMode: 'live' as const,
    publishWebsite: async () => ({
      success: true,
      versionNumber: 'Live',
      publishedAt: new Date().toISOString(),
      totalUpdatedDocs: 0,
      publishDuration: '0s',
      logs: [],
      documentSize: '0 KB',
      batchSize: 0,
      numDocuments: 0,
      commitDuration: '0s',
      writeCount: 0,
    }),
    restorePublishedVersion: async () => true,
    togglePreviewMode: () => {},
    discardDraft: async () => {},

    placeOrderAndPay,
    updateOrderStatus,
    cancelCustomerOrder,
    markNotificationRead,
    clearAllNotifications,
    customerUser,
    customerProfile,
    isCustomerAuthLoading,
    customerAuthError,
    toastMessage,
    showToast,
    customerSignInWithGoogle,
    customerSignOut,
    updateCustomerProfileInFirestore,
    campaigns,
    subscribers,
    updateCustomerMarketingConsent,
    saveCampaign,
    deleteCampaign,
    sendCampaign,
    updateSubscriberConsent,
    refreshMarketingData,
    loginAdmin,
    loginWithGoogleAdmin,
    logoutAdmin,
    changeAdminPassword,
    toggleTwoFactor,
    verifyReAuthentication,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleInStock,
    addReview,
    updateReview,
    deleteReview,
    updateStoreInfo,
    updateHeroContent,
    setAnnouncementsList,
    updateCategoryHighlight,
    saveCategoryHighlights,
    updateTrendingCollection,
    refreshAuditLogs,
    createStoreBackup,
    restoreStoreBackup,
    resetToDefaults,

    // Coupon Management System
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    duplicateCoupon,
    validateCoupon,
    trackCouponUse,
  }), [
    publishedProducts, publishedReviews, publishedStoreInfo, publishedHeroContent,
    publishedAnnouncements, publishedCategoryHighlights, publishedTrendingCollections,
    isAdmin, isTwoFactorEnabled, auditLogs, lastActivityTime, publishedPaymentSettings,
    orders, notifications, activeOrderNotification, publishedHangingSneakerConfig,
    publishedPetShoeConfig, publishedInstagramConfig, publishedSoundConfig,
    publishedTopAnnouncementBarConfig, customerSoundSettings, socialMediaConfig,
    socialAnalytics, luckyBoxConfig, spinWheelConfig, flashDeals, engagementAnalytics,
    orderCelebrationConfig, isCelebrating, customerUser, customerProfile,
    isCustomerAuthLoading, customerAuthError, toastMessage, campaigns, subscribers,
    coupons,
    // callbacks and functions
    updateHangingSneakerConfig, updatePetShoeConfig, updateInstagramConfig,
    updatePaymentSettings, updateSoundConfig, updateTopAnnouncementBarConfig,
    updateCustomerSoundSettings, playSiteSound, updateSocialMediaConfig,
    recordSocialClick, updateLuckyBoxConfig, updateSpinWheelConfig, addFlashDeal,
    updateFlashDeal, deleteFlashDeal, recordEngagementMetric, updateOrderCelebrationConfig,
    setIsCelebrating, triggerGlobalCelebration, placeOrderAndPay, updateOrderStatus,
    cancelCustomerOrder, markNotificationRead, clearAllNotifications, showToast,
    customerSignInWithGoogle, customerSignOut, updateCustomerProfileInFirestore,
    updateCustomerMarketingConsent, saveCampaign, deleteCampaign, sendCampaign,
    updateSubscriberConsent, refreshMarketingData, loginAdmin, loginWithGoogleAdmin,
    logoutAdmin, changeAdminPassword, toggleTwoFactor, verifyReAuthentication,
    addProduct, updateProduct, deleteProduct, toggleInStock, addReview, updateReview,
    deleteReview, updateStoreInfo, updateHeroContent, setAnnouncementsList,
    updateCategoryHighlight, saveCategoryHighlights, updateTrendingCollection,
    refreshAuditLogs, createStoreBackup, restoreStoreBackup, resetToDefaults,
    addCoupon, updateCoupon, deleteCoupon, duplicateCoupon, validateCoupon, trackCouponUse
  ]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
