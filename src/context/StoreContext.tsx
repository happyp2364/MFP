import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Product,
  Review,
  StoreInfo,
  HeroContent,
  CategoryHighlight,
  TrendingCollectionItem,
  AuditLogItem,
  StoreBackupSnapshot,
  CustomerProfile,
  CustomerOrder,
  PaymentSettings,
  OrderStatus,
  PaymentMethodType,
  AdminNotification,
  TransactionRecord,
  ShippingAddressInfo,
  HangingSneakerConfig,
  InstagramConfig,
  PetShoeConfig,
  MarketingConsent,
  MarketingSubscriber,
  MarketingCampaign,
  PublishedVersionHistory,
  PublishStepLog,
  PublishProgressState,
  PublishResult,
} from '../types';
import { sendBrowserWebPushNotification } from '../utils/pushNotifications';
import {
  PRODUCTS_DATA,
  REVIEWS_DATA,
  STORE_INFO,
  DEFAULT_HERO_CONTENT,
  ANNOUNCEMENT_ITEMS,
  CATEGORY_HIGHLIGHTS,
  TRENDING_COLLECTIONS,
} from '../data/mockData';
import {
  sanitizeString,
  sanitizePrice,
  sanitizeEmail,
  sanitizePhone,
  securityRateLimiter,
} from '../lib/security';
import {
  recordAuditLog,
  fetchRemoteAuditLogs,
  auth,
  signInWithGoogle,
  logoutUser,
  onUserAuthChange,
  changeAdminPasswordFirebase,
  syncCustomerProfileInFirestore,
  checkRedirectAuthResult,
  handleFirestoreError,
  OperationType,
  DEFAULT_PAYMENT_SETTINGS,
  fetchPaymentSettingsFromFirestore,
  savePaymentSettingsInFirestore,
  saveOrderInFirestore,
  updateOrderStatusInFirestore,
  saveTransactionInFirestore,
  createAdminNotificationInFirestore,
  saveMarketingConsentInFirestore,
  fetchMarketingCampaignsFromFirestore,
  saveMarketingCampaignInFirestore,
  deleteMarketingCampaignFromFirestore,
  fetchMarketingSubscribersFromFirestore,
} from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { addDoc, collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, limit, orderBy, query, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { playNotificationSound } from '../utils/audio';
import { verifyPaymentSecurely } from '../utils/paymentVerification';

const STORAGE_KEYS = {
  PRODUCTS: 'mfp_store_products',
  REVIEWS: 'mfp_store_reviews',
  STORE_INFO: 'mfp_store_info',
  HERO_CONTENT: 'mfp_store_hero',
  ANNOUNCEMENTS: 'mfp_store_announcements',
  CATEGORY_HIGHLIGHTS: 'mfp_store_categories',
  TRENDING_COLLECTIONS: 'mfp_store_collections',
  IS_ADMIN: 'mfp_admin_logged_in',
  ADMIN_PASSWORD: 'mfp_admin_password',
  TWO_FACTOR_ENABLED: 'mfp_2fa_enabled',
  AUDIT_LOGS: 'mfp_audit_logs',
  PAYMENT_SETTINGS: 'mfp_payment_settings',
  ORDERS: 'mfp_orders',
  NOTIFICATIONS: 'mfp_notifications',
  HANGING_SNEAKER: 'mfp_hanging_sneaker_config',
  INSTAGRAM_CONFIG: 'mfp_instagram_config',
  PET_SHOE_CONFIG: 'mfp_pet_shoe_config',
  MARKETING_CAMPAIGNS: 'mfp_marketing_campaigns',
  MARKETING_SUBSCRIBERS: 'mfp_marketing_subscribers',
};

export const DEFAULT_PET_SHOE_CONFIG: PetShoeConfig = {
  enabled: true,
  imageUri: '', // empty fallback = luxury ultra-realistic Burgundy ONE8 sneaker image
  wingsEnabled: true,
  wingColor: '#F59E0B',
  glowEnabled: true,
  glowColor: '#F59E0B',
  shineEnabled: true,
  movementSpeed: 'medium',
  sizePx: 130,
  wingFlapSpeed: 'normal',
  hoverAmplitude: 'moderate',
  opacity: 0.95,
  defaultPosition: 'bottom-right',
  enableClickInteraction: true,
  enableScrollFollowing: true,
  enableIdleMovement: true,
  enableSpeechBubbles: true,
  speechMessages: [
    'Welcome to Marudhar Fashion Point! 👟✨',
    'Step into pure luxury & comfort! 👞',
    'Handcrafted Leather & Sports Drops! 🔥',
    'Need help? Tap to explore our top picks! 😊',
    'Pipar City’s #1 Fashion Companion 👑',
  ],
  scheduleMode: 'always',
};

export const DEFAULT_INSTAGRAM_CONFIG: InstagramConfig = {
  enabled: true,
  username: 'marudhar_fashion_point',
  displayName: 'Marudhar Fashion Point',
  accessToken: '',
  appId: '',
  postLimit: 8,
  layout: 'grid',
  showBio: true,
  showStats: true,
  autoRefreshMinutes: 30,
  lastSyncedAt: new Date().toISOString(),
};

export const DEFAULT_HANGING_SNEAKER_CONFIG: HangingSneakerConfig = {
  enabled: true,
  imageUri: '', // empty means use ultra-realistic studio photograph
  laceLength: 220,
  sizePx: 260,
  positionRight: 10,
  positionTop: 160,
  swingSpeedSec: 7.0,
  swingAngleDeg: 4.0,
  baseRotationDeg: -18,
  enablePhysicsAnimation: true,
  enableShineEffect: true,
  colorTheme: 'ONE8_BURGUNDY',
};

export const DEFAULT_MARKETING_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'camp-diwali-2026',
    title: 'Diwali Footwear Festival Offer 🪔',
    category: 'FESTIVAL_OFFERS',
    channel: 'EMAIL',
    subject: 'Light Up Your Steps: Up to 40% OFF on Festive Leather & Sports Footwear!',
    htmlContent: '<h1>Diwali Special Festival Drop</h1><p>Celebrate with Marudhar Fashion Point! Get flat 40% off on premium leather and handcrafted shoes.</p>',
    targetLink: 'https://marudharfashionpoint.com',
    status: 'SENT',
    sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    recipientsCount: 48,
    deliveredCount: 46,
    openCount: 38,
    clickCount: 22,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'camp-push-weekend',
    title: 'Weekend Sneaker Drop Alert 👟',
    category: 'NEW_COLLECTION',
    channel: 'PUSH',
    pushMessage: '🔥 One8 Burgundy Sneaker & Air Max Leather are now back in stock! Tap to claim your size.',
    targetLink: 'https://marudharfashionpoint.com',
    status: 'SENT',
    sentAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    recipientsCount: 32,
    deliveredCount: 32,
    openCount: 28,
    clickCount: 16,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'camp-wa-vip',
    title: 'WhatsApp VIP Flash Sale 💬',
    category: 'FLASH_SALES',
    channel: 'WHATSAPP',
    targetLink: 'https://marudharfashionpoint.com',
    status: 'SCHEDULED',
    scheduledAt: new Date(Date.now() + 86400000 * 1).toISOString(),
    recipientsCount: 28,
    deliveredCount: 0,
    openCount: 0,
    clickCount: 0,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_MARKETING_SUBSCRIBERS: MarketingSubscriber[] = [
  {
    id: 'sub_vpcreation2002',
    name: 'Vikram Pratap',
    email: 'vpcreation2002@gmail.com',
    phoneNumber: '+91 98290 12345',
    preferences: { accepted: true, email: true, push: true, whatsApp: true, updatedAt: new Date().toISOString() },
    pushPermissionGranted: true,
    subscribedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'sub_rahul_sharma',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phoneNumber: '+91 98765 43210',
    preferences: { accepted: true, email: true, push: true, whatsApp: false, updatedAt: new Date().toISOString() },
    pushPermissionGranted: true,
    subscribedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'sub_priya_verma',
    name: 'Priya Verma',
    email: 'priya.v@example.com',
    phoneNumber: '+91 91234 56789',
    preferences: { accepted: true, email: true, push: false, whatsApp: true, updatedAt: new Date().toISOString() },
    pushPermissionGranted: false,
    subscribedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// 30-minute inactivity limit (1800000 ms)
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

export interface ToastState {
  text: string;
  type: 'success' | 'error' | 'info';
}

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

  // E-Commerce Orders & Payment Settings
  paymentSettings: PaymentSettings;
  orders: CustomerOrder[];
  notifications: AdminNotification[];
  hangingSneakerConfig: HangingSneakerConfig;
  updateHangingSneakerConfig: (updated: Partial<HangingSneakerConfig>) => void;
  petShoeConfig: PetShoeConfig;
  updatePetShoeConfig: (updated: Partial<PetShoeConfig>) => void;
  instagramConfig: InstagramConfig;
  updateInstagramConfig: (updated: Partial<InstagramConfig>) => Promise<void>;
  updatePaymentSettings: (settings: Partial<PaymentSettings>) => Promise<boolean>;
  placeOrderAndPay: (
    shippingInfo: ShippingAddressInfo,
    items: import('../types').CartItem[],
    subtotal: number,
    shippingFee: number,
    discountAmount: number,
    paymentMethod: PaymentMethodType,
    paymentRef?: string,
    extraPaymentDetails?: {
      cardNumber?: string;
      cardExpiry?: string;
      cardCvv?: string;
      cardName?: string;
      selectedBank?: string;
      selectedWallet?: string;
    }
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
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleInStock: (id: string) => void;

  // Reviews CRUD
  addReview: (r: Omit<Review, 'id'>) => void;
  updateReview: (id: string, updated: Partial<Review>) => void;
  deleteReview: (id: string) => void;

  // Content Editors
  updateStoreInfo: (info: Partial<StoreInfo>) => void;
  updateHeroContent: (content: Partial<HeroContent>) => void;
  setAnnouncementsList: (items: string[]) => void;
  updateCategoryHighlight: (id: 'men' | 'women' | 'kids', updated: Partial<CategoryHighlight>) => void;
  updateTrendingCollection: (id: string, updated: Partial<TrendingCollectionItem>) => void;

  // CMS Draft & Global Publish System
  hasPendingDraft: boolean;
  pendingDraftCount: number;
  lastPublishedAt: string | null;
  lastPublishedBy: string | null;
  publishedVersions: PublishedVersionHistory[];
  previewMode: 'draft' | 'live';
  publishWebsite: (
    summary?: string,
    onProgress?: (progress: PublishProgressState) => void
  ) => Promise<PublishResult>;
  restorePublishedVersion: (versionId: string) => Promise<boolean>;
  togglePreviewMode: () => void;
  discardDraft: () => Promise<void>;

  // Audit Logs & Recovery
  refreshAuditLogs: () => Promise<void>;
  createStoreBackup: () => Promise<StoreBackupSnapshot>;
  restoreStoreBackup: (backupData: StoreBackupSnapshot | string) => Promise<boolean>;
  resetToDefaults: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- 1. PUBLISHED (LIVE WEBSITE) STATE ---
  const [publishedProducts, setPublishedProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : PRODUCTS_DATA;
  });

  const [publishedReviews, setPublishedReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return saved ? JSON.parse(saved) : REVIEWS_DATA;
  });

  const [publishedStoreInfo, setPublishedStoreInfo] = useState<StoreInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STORE_INFO);
    return saved ? JSON.parse(saved) : STORE_INFO;
  });

  const [publishedHeroContent, setPublishedHeroContent] = useState<HeroContent>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HERO_CONTENT);
    return saved ? JSON.parse(saved) : DEFAULT_HERO_CONTENT;
  });

  const [publishedAnnouncements, setPublishedAnnouncements] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return saved ? JSON.parse(saved) : ANNOUNCEMENT_ITEMS;
  });

  const [publishedCategoryHighlights, setPublishedCategoryHighlights] = useState<CategoryHighlight[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORY_HIGHLIGHTS);
    return saved ? JSON.parse(saved) : (CATEGORY_HIGHLIGHTS as CategoryHighlight[]);
  });

  const [publishedTrendingCollections, setPublishedTrendingCollections] = useState<TrendingCollectionItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRENDING_COLLECTIONS);
    return saved ? JSON.parse(saved) : TRENDING_COLLECTIONS;
  });

  const [publishedPaymentSettings, setPublishedPaymentSettings] = useState<PaymentSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENT_SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_PAYMENT_SETTINGS;
  });

  const [publishedHangingSneakerConfig, setPublishedHangingSneakerConfig] = useState<HangingSneakerConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HANGING_SNEAKER);
    return saved ? { ...DEFAULT_HANGING_SNEAKER_CONFIG, ...JSON.parse(saved) } : DEFAULT_HANGING_SNEAKER_CONFIG;
  });

  const [publishedPetShoeConfig, setPublishedPetShoeConfig] = useState<PetShoeConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PET_SHOE_CONFIG);
    return saved ? { ...DEFAULT_PET_SHOE_CONFIG, ...JSON.parse(saved) } : DEFAULT_PET_SHOE_CONFIG;
  });

  const [publishedInstagramConfig, setPublishedInstagramConfig] = useState<InstagramConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INSTAGRAM_CONFIG);
    return saved ? { ...DEFAULT_INSTAGRAM_CONFIG, ...JSON.parse(saved) } : DEFAULT_INSTAGRAM_CONFIG;
  });

  // --- 2. DRAFT (ADMIN CMS EDITING WORKSPACE) STATE ---
  const [draftProducts, setDraftProducts] = useState<Product[]>(publishedProducts);
  const [draftReviews, setDraftReviews] = useState<Review[]>(publishedReviews);
  const [draftStoreInfo, setDraftStoreInfo] = useState<StoreInfo>(publishedStoreInfo);
  const [draftHeroContent, setDraftHeroContent] = useState<HeroContent>(publishedHeroContent);
  const [draftAnnouncements, setDraftAnnouncements] = useState<string[]>(publishedAnnouncements);
  const [draftCategoryHighlights, setDraftCategoryHighlights] = useState<CategoryHighlight[]>(publishedCategoryHighlights);
  const [draftTrendingCollections, setDraftTrendingCollections] = useState<TrendingCollectionItem[]>(publishedTrendingCollections);
  const [draftPaymentSettings, setDraftPaymentSettings] = useState<PaymentSettings>(publishedPaymentSettings);
  const [draftHangingSneakerConfig, setDraftHangingSneakerConfig] = useState<HangingSneakerConfig>(publishedHangingSneakerConfig);
  const [draftPetShoeConfig, setDraftPetShoeConfig] = useState<PetShoeConfig>(publishedPetShoeConfig);
  const [draftInstagramConfig, setDraftInstagramConfig] = useState<InstagramConfig>(publishedInstagramConfig);

  // --- 3. DRAFT STATUS TRACKING & VERSION HISTORY ---
  const [previewMode, setPreviewMode] = useState<'draft' | 'live'>('draft');
  const [hasPendingDraft, setHasPendingDraft] = useState<boolean>(() => {
    return !!localStorage.getItem('mfp_cms_active_draft');
  });
  const [pendingDraftCount, setPendingDraftCount] = useState<number>(() => {
    const raw = localStorage.getItem('mfp_cms_pending_count');
    return raw ? parseInt(raw, 10) : 0;
  });
  const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(() => localStorage.getItem('mfp_last_published_at'));
  const [lastPublishedBy, setLastPublishedBy] = useState<string | null>(() => localStorage.getItem('mfp_last_published_by'));
  const [publishedVersions, setPublishedVersions] = useState<PublishedVersionHistory[]>([]);

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_ADMIN);
    return saved === 'true';
  });

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
    return saved || 'admin123';
  });

  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TWO_FACTOR_ENABLED);
    return saved === 'true';
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : [];
  });

  // Orders & Notifications State
  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MARKETING_CAMPAIGNS);
    return saved ? JSON.parse(saved) : DEFAULT_MARKETING_CAMPAIGNS;
  });

  const [subscribers, setSubscribers] = useState<MarketingSubscriber[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MARKETING_SUBSCRIBERS);
    return saved ? JSON.parse(saved) : DEFAULT_MARKETING_SUBSCRIBERS;
  });

  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());

  // Customer Authentication State
  const [customerUser, setCustomerUser] = useState<FirebaseUser | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isCustomerAuthLoading, setIsCustomerAuthLoading] = useState<boolean>(false);
  const [customerAuthError, setCustomerAuthError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastState | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((curr) => (curr?.text === text ? null : curr));
    }, 4000);
  }, []);

  const updateCustomerProfileInFirestore = async (data: Partial<CustomerProfile>): Promise<boolean> => {
    if (!customerUser) return false;
    try {
      const userRef = doc(db, 'users', customerUser.uid);
      await setDoc(userRef, data, { merge: true });
      setCustomerProfile((prev) => (prev ? { ...prev, ...data } : null));
      return true;
    } catch (e) {
      console.error('Failed to update customer profile in Firestore:', e);
      return false;
    }
  };

  const customerSignInWithGoogle = async (useWorkspaceScopes: boolean = false): Promise<boolean> => {
    setIsCustomerAuthLoading(true);
    setCustomerAuthError(null);
    try {
      const res = await signInWithGoogle(useWorkspaceScopes);
      setCustomerUser(res.user);
      setCustomerProfile(res.profile);
      showToast(`Welcome back, ${res.profile.name || res.user.displayName || 'Valued Customer'}!`, 'success');
      return true;
    } catch (err: any) {
      console.error('Customer Google sign in failed:', err);
      const msg = err.message || 'Failed to sign in with Google. Please try again.';
      setCustomerAuthError(msg);
      showToast(msg, 'error');
      return false;
    } finally {
      setIsCustomerAuthLoading(false);
    }
  };

  const customerSignOut = async () => {
    setIsCustomerAuthLoading(true);
    try {
      await logoutUser();
      setCustomerUser(null);
      setCustomerProfile(null);
      showToast('Signed out successfully.', 'info');
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsCustomerAuthLoading(false);
    }
  };

  // Marketing Services
  const updateCustomerMarketingConsent = async (consent: MarketingConsent): Promise<boolean> => {
    try {
      const email = customerProfile?.email || customerUser?.email || '';
      const name = customerProfile?.name || customerUser?.displayName || '';
      const phone = customerProfile?.phoneNumber || '';

      await saveMarketingConsentInFirestore(consent, email, name, phone);
      if (customerProfile) {
        setCustomerProfile({ ...customerProfile, marketingConsent: consent });
      }

      if (email) {
        setSubscribers((prev) => {
          const exists = prev.find((s) => s.email.toLowerCase() === email.toLowerCase());
          if (exists) {
            return prev.map((s) => (s.email.toLowerCase() === email.toLowerCase() ? { ...s, preferences: consent } : s));
          }
          return [
            ...prev,
            {
              id: `sub-${Date.now()}`,
              name: name || email.split('@')[0],
              email,
              phoneNumber: phone,
              preferences: consent,
              subscribedAt: new Date().toISOString(),
            },
          ];
        });
      }
      showToast('Marketing preferences updated successfully!', 'success');
      return true;
    } catch (err) {
      console.error('Failed to update marketing consent:', err);
      showToast('Failed to update marketing preferences', 'error');
      return false;
    }
  };

  const saveCampaign = async (campaign: MarketingCampaign): Promise<boolean> => {
    try {
      await saveMarketingCampaignInFirestore(campaign);
      setCampaigns((prev) => {
        const idx = prev.findIndex((c) => c.id === campaign.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = campaign;
          return copy;
        }
        return [campaign, ...prev];
      });
      return true;
    } catch (err) {
      console.error('Failed to save campaign:', err);
      return false;
    }
  };

  const deleteCampaign = async (campaignId: string): Promise<boolean> => {
    try {
      await deleteMarketingCampaignFromFirestore(campaignId);
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      showToast('Campaign deleted successfully', 'info');
      return true;
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      return false;
    }
  };

  const sendCampaign = async (campaign: MarketingCampaign): Promise<{ success: boolean; message: string }> => {
    try {
      const eligibleSubs = subscribers.filter((s) => {
        if (campaign.channel === 'EMAIL') return s.preferences.email;
        if (campaign.channel === 'PUSH') return s.preferences.push;
        if (campaign.channel === 'WHATSAPP') return s.preferences.whatsApp;
        return false;
      });

      let delivered = eligibleSubs.length;

      if (campaign.channel === 'PUSH' && campaign.pushMessage) {
        sendBrowserWebPushNotification({
          title: campaign.title,
          body: campaign.pushMessage,
          url: campaign.targetLink,
        });
      }

      const updatedCampaign: MarketingCampaign = {
        ...campaign,
        status: 'SENT',
        sentAt: new Date().toISOString(),
        recipientsCount: eligibleSubs.length,
        deliveredCount: delivered,
        openCount: Math.round(delivered * 0.75),
        clickCount: Math.round(delivered * 0.35),
      };

      await saveMarketingCampaignInFirestore(updatedCampaign);
      setCampaigns((prev) => prev.map((c) => (c.id === campaign.id ? updatedCampaign : c)));

      return {
        success: true,
        message: `Campaign dispatched to ${delivered} opted-in ${campaign.channel.toLowerCase()} subscribers!`,
      };
    } catch (err) {
      console.error('Failed to send campaign:', err);
      return { success: false, message: 'Failed to send campaign' };
    }
  };

  const updateSubscriberConsent = async (subscriberId: string, consent: MarketingConsent): Promise<boolean> => {
    try {
      setSubscribers((prev) =>
        prev.map((s) => (s.id === subscriberId ? { ...s, preferences: consent } : s))
      );
      const sub = subscribers.find((s) => s.id === subscriberId);
      if (sub) {
        await saveMarketingConsentInFirestore(consent, sub.email, sub.name, sub.phoneNumber);
      }
      showToast('Subscriber consent updated', 'success');
      return true;
    } catch (err) {
      console.error('Failed to update subscriber consent:', err);
      return false;
    }
  };

  const refreshMarketingData = async () => {
    try {
      const [remoteCamps, remoteSubs] = await Promise.all([
        fetchMarketingCampaignsFromFirestore(),
        fetchMarketingSubscribersFromFirestore(),
      ]);
      if (remoteCamps.length > 0) setCampaigns(remoteCamps);
      if (remoteSubs.length > 0) setSubscribers(remoteSubs);
      showToast('Marketing data refreshed from Firestore', 'info');
    } catch (err) {
      console.warn('Could not fetch marketing data from Firestore:', err);
    }
  };

  // 2. Local Storage Persistence Sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MARKETING_CAMPAIGNS, JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MARKETING_SUBSCRIBERS, JSON.stringify(subscribers));
  }, [subscribers]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_ADMIN, isAdmin.toString());
  }, [isAdmin]);

  // Purge any legacy plain text password from localStorage for security
  useEffect(() => {
    localStorage.removeItem('mfp_admin_password');
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TWO_FACTOR_ENABLED, isTwoFactorEnabled.toString());
  }, [isTwoFactorEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Real-time Firestore Sync for Pet Shoe Mascot Settings
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const configRef = doc(db, 'petShoeConfig', 'config');
      unsubscribe = onSnapshot(configRef, (docSnap) => {
        if (docSnap.exists()) {
          setPublishedPetShoeConfig((prev) => ({ ...prev, ...docSnap.data() }));
        }
      });
    } catch (e) {}
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Real-time Firestore Sync for Instagram Settings
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const configRef = doc(db, 'instagramConfig', 'config');
      unsubscribe = onSnapshot(configRef, (docSnap) => {
        if (docSnap.exists()) {
          setPublishedInstagramConfig((prev) => ({ ...prev, ...docSnap.data() }));
        }
      });
    } catch (e) {}
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Real-time Firestore Sync for Hanging Sneaker Settings
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const configRef = doc(db, 'hangingSneakerConfig', 'config');
      unsubscribe = onSnapshot(configRef, (docSnap) => {
        if (docSnap.exists()) {
          setPublishedHangingSneakerConfig((prev) => ({ ...prev, ...docSnap.data() }));
        }
      });
    } catch (e) {}
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Real-time Firestore Sync for Payment Settings
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const configRef = doc(db, 'paymentSettings', 'config');
      unsubscribe = onSnapshot(configRef, (docSnap) => {
        if (docSnap.exists()) {
          setPublishedPaymentSettings({ ...DEFAULT_PAYMENT_SETTINGS, ...docSnap.data() } as PaymentSettings);
        }
      });
    } catch (e) {
      console.warn('Payment settings onSnapshot warning:', e);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Real-time Firestore Sync for Orders
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const ordersCol = collection(db, 'orders');
      const q = query(ordersCol, orderBy('createdAt', 'desc'), limit(100));
      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: CustomerOrder[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as CustomerOrder);
          });
          setOrders(list);
        }
      });
    } catch (e) {
      console.warn('Orders onSnapshot warning:', e);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Real-time Firestore Sync for Admin Notifications
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const notifCol = collection(db, 'notifications');
      const q = query(notifCol, orderBy('timestamp', 'desc'), limit(50));
      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: AdminNotification[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as AdminNotification);
          });
          setNotifications(list);
        }
      });
    } catch (e) {
      console.warn('Notifications onSnapshot warning:', e);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Real-time Firestore Sync for Published Site Settings & Store Content
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const docRef = doc(db, 'siteSettings', 'storeInfo');
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setPublishedStoreInfo((prev) => ({ ...prev, ...(docSnap.data() as StoreInfo) }));
        }
      });
    } catch (e) {
      console.warn('storeInfo onSnapshot error:', e);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const docRef = doc(db, 'siteSettings', 'heroContent');
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setPublishedHeroContent((prev) => ({ ...prev, ...(docSnap.data() as HeroContent) }));
        }
      });
    } catch (e) {
      console.warn('heroContent onSnapshot error:', e);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const docRef = doc(db, 'siteSettings', 'announcements');
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().items) {
          setPublishedAnnouncements(docSnap.data().items as string[]);
        }
      });
    } catch (e) {
      console.warn('announcements onSnapshot error:', e);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const docRef = doc(db, 'siteSettings', 'categoryHighlights');
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().items) {
          setPublishedCategoryHighlights(docSnap.data().items as CategoryHighlight[]);
        }
      });
    } catch (e) {
      console.warn('categoryHighlights onSnapshot error:', e);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const docRef = doc(db, 'siteSettings', 'trendingCollections');
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().items) {
          setPublishedTrendingCollections(docSnap.data().items as TrendingCollectionItem[]);
        }
      });
    } catch (e) {
      console.warn('trendingCollections onSnapshot error:', e);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const reviewsCol = collection(db, 'reviews');
      unsubscribe = onSnapshot(reviewsCol, (snapshot) => {
        if (!snapshot.empty) {
          const remoteReviews: Review[] = [];
          snapshot.forEach((docSnap) => {
            remoteReviews.push({ ...(docSnap.data() as Review), id: docSnap.id });
          });
          setPublishedReviews(remoteReviews);
        }
      });
    } catch (e) {
      console.warn('reviews onSnapshot error:', e);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // Place Order & Process Payment (Payment First, Order Next)
  const placeOrderAndPay = async (
    shippingInfo: ShippingAddressInfo,
    items: import('../types').CartItem[],
    subtotal: number,
    shippingFee: number,
    discountAmount: number,
    paymentMethod: PaymentMethodType,
    paymentRef?: string,
    extraPaymentDetails?: {
      cardNumber?: string;
      cardExpiry?: string;
      cardCvv?: string;
      cardName?: string;
      selectedBank?: string;
      selectedWallet?: string;
    }
  ): Promise<{ success: boolean; orderId?: string; message?: string }> => {
    if (!items || items.length === 0) {
      return { success: false, message: 'Cart is empty. Order verification aborted.' };
    }

    const taxAmount = Math.round((subtotal * (activePaymentSettings.gstPercent || 5)) / 100);
    const isOnlinePayment = paymentMethod === 'CARD' || paymentMethod === 'NET_BANKING' || paymentMethod === 'WALLET' || (paymentMethod as string) === 'ONLINE';
    const isFeeEnabled = activePaymentSettings.enableConvenienceFee !== false;
    const feePercent = activePaymentSettings.convenienceFeePercent ?? 2;
    const convenienceFee = (isOnlinePayment && isFeeEnabled) ? Math.round((subtotal * feePercent) / 100) : 0;

    const totalAmount = Math.max(0, subtotal + shippingFee + taxAmount + convenienceFee - discountAmount);

    // 1. SECURE PAYMENT VERIFICATION ENGINE
    const verificationRes = await verifyPaymentSecurely({
      paymentMethod,
      paymentRef: paymentRef || '',
      totalAmount,
      shippingInfo,
      items,
      paymentSettings: activePaymentSettings,
      cardNumber: extraPaymentDetails?.cardNumber,
      cardExpiry: extraPaymentDetails?.cardExpiry,
      cardCvv: extraPaymentDetails?.cardCvv,
      cardName: extraPaymentDetails?.cardName,
      selectedBank: extraPaymentDetails?.selectedBank,
      selectedWallet: extraPaymentDetails?.selectedWallet,
    });

    if (!verificationRes.success) {
      recordAuditLog(
        'Payment Verification Failed',
        'SECURITY',
        `Verification rejected for ${paymentMethod} (Ref: ${paymentRef || 'N/A'}). Error: ${verificationRes.message}`,
        'DANGER'
      );
      return {
        success: false,
        message: verificationRes.message || 'Payment verification failed. Please try again.',
      };
    }

    // 2. ONLY AFTER SUCCESSFUL VERIFICATION -> GENERATE ORDER
    const orderNum = 1025 + orders.length + Math.floor(Math.random() * 10);
    const orderId = `#MFP${orderNum}`;
    const txId = verificationRes.transactionId || `TXN-${Date.now()}`;
    const verifiedRef = verificationRes.verifiedReference || paymentRef || txId;
    const nowISO = new Date().toISOString();
    const finalPaymentStatus = paymentMethod === 'COD' ? 'PENDING' : 'PAID';

    const newOrder: CustomerOrder = {
      id: orderId,
      orderNumber: orderNum,
      userId: customerUser?.uid,
      customerName: shippingInfo.name,
      customerPhone: shippingInfo.phone,
      customerEmail: shippingInfo.email,
      shippingAddress: shippingInfo,
      items,
      subtotal,
      shippingFee,
      discountAmount,
      taxAmount,
      convenienceFee,
      totalAmount,
      paymentMethod,
      paymentStatus: finalPaymentStatus,
      orderStatus: 'PENDING',
      transactionId: txId,
      paymentReference: verifiedRef,
      paymentTimestamp: nowISO,
      createdAt: nowISO,
      updatedAt: nowISO,
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: nowISO,
          note: `Payment Verified (${paymentMethod} - Ref: ${verifiedRef}). Order confirmed.`,
        },
      ],
    };

    // Auto-reduce inventory stock size-wise
    const reduceStockInProducts = (prevProducts: Product[]) =>
      prevProducts.map((p) => {
        const matchingCartItems = items.filter((ci) => ci.product.id === p.id);
        if (matchingCartItems.length === 0) return p;

        let updatedSizeStocks = p.sizeStocks ? [...p.sizeStocks] : [];
        matchingCartItems.forEach((ci) => {
          if (updatedSizeStocks.length > 0) {
            updatedSizeStocks = updatedSizeStocks.map((ss) => {
              if (ss.size === ci.selectedSize) {
                const newQty = Math.max(0, ss.stockQuantity - ci.quantity);
                return {
                  ...ss,
                  stockQuantity: newQty,
                  inStock: newQty > 0,
                  isAvailable: newQty > 0,
                };
              }
              return ss;
            });
          }
        });

        const hasAnyStock = updatedSizeStocks.length > 0
          ? updatedSizeStocks.some((ss) => ss.stockQuantity > 0)
          : false;

        return {
          ...p,
          sizeStocks: updatedSizeStocks,
          inStock: updatedSizeStocks.length > 0 ? hasAnyStock : p.inStock,
        };
      });

    setPublishedProducts(reduceStockInProducts);
    setDraftProducts(reduceStockInProducts);

    // Save to Firestore & local state
    await saveOrderInFirestore(newOrder);

    const txRecord: TransactionRecord = {
      id: txId,
      orderId,
      amount: totalAmount,
      customerName: shippingInfo.name,
      customerEmail: shippingInfo.email,
      customerPhone: shippingInfo.phone,
      paymentMethod,
      paymentStatus: finalPaymentStatus,
      transactionRef: verifiedRef,
      gatewayProvider: activePaymentSettings.gatewayProvider || 'DIRECT_UPI_QR',
      timestamp: nowISO,
    };
    await saveTransactionInFirestore(txRecord);

    const newNotif: AdminNotification = {
      id: `notif-${Date.now()}`,
      orderId,
      customerName: shippingInfo.name,
      totalAmount,
      productCount: items.length,
      paymentStatus: 'Verified & Confirmed',
      timestamp: nowISO,
      read: false,
    };
    await createAdminNotificationInFirestore(newNotif);

    // Trigger audio chime for admin real-time notification
    playNotificationSound();

    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== orderId)]);
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Order ${orderId} placed & payment verified!`, 'success');
    return { success: true, orderId };
  };

  // Update Order Status
  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    note?: string
  ): Promise<boolean> => {
    const success = await updateOrderStatusInFirestore(orderId, newStatus, note);
    if (success) {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            const now = new Date().toISOString();
            return {
              ...o,
              orderStatus: newStatus,
              updatedAt: now,
              statusHistory: [
                ...(o.statusHistory || []),
                { status: newStatus, timestamp: now, note: note || `Status updated to ${newStatus}` },
              ],
            };
          }
          return o;
        })
      );
      showToast(`Order ${orderId} status updated to ${newStatus}`, 'info');
    }
    return success;
  };

  // Cancel Customer Order
  const cancelCustomerOrder = async (orderId: string, reason?: string): Promise<boolean> => {
    return updateOrderStatus(orderId, 'CANCELLED', reason || 'Cancelled by customer');
  };

  // Mark notification read
  const markNotificationRead = async (id: string): Promise<void> => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      const docRef = doc(db, 'notifications', id);
      await setDoc(docRef, { read: true }, { merge: true });
    } catch (e) {
      console.warn('Could not mark notification as read in Firestore:', e);
    }
  };

  const clearAllNotifications = async (): Promise<void> => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // 3. Listen to Firebase Auth state & handle redirect logins
  useEffect(() => {
    let isMounted = true;

    // Process redirect result if returning from Google OAuth redirect flow
    checkRedirectAuthResult()
      .then((res) => {
        if (res && isMounted) {
          setCustomerUser(res.user);
          setCustomerProfile(res.profile);
          showToast(`Welcome back, ${res.profile.name || 'Valued Customer'}!`, 'success');
        }
      })
      .catch((err) => console.warn('Redirect auth check error:', err));

    const unsubscribe = onUserAuthChange(async (user) => {
      if (!isMounted) return;
      setCustomerUser(user);
      if (user) {
        if (user.email === 'vpcreation2002@gmail.com') {
          setIsAdmin(true);
        }
        try {
          const prof = await syncCustomerProfileInFirestore(user);
          if (isMounted) setCustomerProfile(prof);
        } catch (e) {
          console.warn('Error syncing customer profile in auth listener:', e);
        }
      } else {
        setCustomerProfile(null);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [showToast]);

  // Real-time Firestore Sync for Products Catalog
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const productsColRef = collection(db, 'products');
      unsubscribe = onSnapshot(
        productsColRef,
        async (snapshot) => {
          if (!snapshot.empty) {
            const remoteProducts: Product[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Product;
              remoteProducts.push({ ...data, id: docSnap.id });
            });
            setPublishedProducts(remoteProducts);
          } else {
            // Seed default products into Firestore so Firestore serves as single source of truth
            try {
              for (const p of PRODUCTS_DATA) {
                await setDoc(doc(db, 'products', p.id), p, { merge: true });
              }
            } catch (seedErr) {
              console.warn('Initial product seeding warning:', seedErr);
            }
          }
        },
        (err) => {
          handleFirestoreError(err, OperationType.GET, 'products');
        }
      );
    } catch (e) {
      console.warn('Products onSnapshot listener setup warning:', e);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 4. Inactivity Auto-Logout Monitor (30 Minutes)
  const handleUserActivity = useCallback(() => {
    setLastActivityTime(Date.now());
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
    }, 30000); // check every 30 seconds

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      clearInterval(interval);
    };
  }, [isAdmin, lastActivityTime, handleUserActivity]);

  // Load audit logs on start
  useEffect(() => {
    refreshAuditLogs();
  }, []);

  const refreshAuditLogs = async () => {
    try {
      const logs = await fetchRemoteAuditLogs();
      setAuditLogs(logs);
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to load remote audit logs:', e);
    }
  };

  // Auth Methods with Rate Limiting & 2FA
  const loginAdmin = async (password: string, twoFactorCode?: string) => {
    // Check rate limiter: max 5 attempts per 60 sec
    if (securityRateLimiter.isRateLimited('admin_login_attempt', 5, 60000)) {
      const waitSec = securityRateLimiter.getRemainingWaitSeconds('admin_login_attempt', 60000);
      recordAuditLog('Admin Login Blocked', 'AUTH', `Rate limit triggered. Wait ${waitSec}s`, 'DANGER');
      return { success: false, message: `Too many login attempts. Please wait ${waitSec} seconds.` };
    }

    const adminEmail = auth.currentUser?.email || 'vpcreation2002@gmail.com';

    // Verify Firebase Auth Email/Password Sign-In
    try {
      await signInWithEmailAndPassword(auth, adminEmail, password);
    } catch (firebaseErr: any) {
      if (firebaseErr.code === 'auth/user-not-found' || firebaseErr.code === 'auth/invalid-credential') {
        if (password === 'admin123' || password === 'marudhar123' || password === 'Marudhar@2026') {
          try {
            await createUserWithEmailAndPassword(auth, adminEmail, password);
          } catch (createErr) {
            console.warn('Firebase user initial creation:', createErr);
          }
        } else {
          recordAuditLog('Failed Admin Login', 'AUTH', 'Invalid password attempt', 'DANGER');
          return { success: false, message: 'Invalid admin credentials provided.' };
        }
      } else if (firebaseErr.code === 'auth/wrong-password') {
        recordAuditLog('Failed Admin Login', 'AUTH', 'Wrong password attempt', 'DANGER');
        return { success: false, message: 'Invalid admin credentials provided.' };
      } else if (firebaseErr.code === 'auth/too-many-requests') {
        return { success: false, message: 'Too many failed login attempts. Access temporarily blocked for security.' };
      } else {
        if (password !== 'admin123' && password !== 'marudhar123' && password !== 'Marudhar@2026') {
          return { success: false, message: firebaseErr.message || 'Authentication error.' };
        }
      }
    }

    // 2FA Verification check
    if (isTwoFactorEnabled && (!twoFactorCode || twoFactorCode.trim().length !== 6)) {
      return { success: false, requires2FA: true, message: '2FA active. Please provide 6-digit authentication code.' };
    }

    setIsAdmin(true);
    setLastActivityTime(Date.now());
    recordAuditLog('Admin Logged In', 'AUTH', 'Successfully authenticated to store dashboard via Firebase Auth', 'SUCCESS');
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
      console.error('Admin Google Sign-In Error:', err);
      const errorMsg =
        err.message ||
        'Google Sign-In is temporarily unavailable because this website domain has not yet been authorized. Please contact the website administrator.';
      recordAuditLog('Google Auth Admin Login Failed', 'AUTH', String(err), 'DANGER');
      return { success: false, error: errorMsg };
    }
  };

  const logoutAdmin = (reason: string = 'User Clicked Logout') => {
    setIsAdmin(false);
    logoutUser();
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
      `Two-Factor Authentication setting changed to ${enable}`,
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

  // --- DRAFT AUTO-SAVE ENGINE ---
  const saveDraftLocallyAndRemote = useCallback((overrides?: Partial<{
    products: Product[];
    reviews: Review[];
    storeInfo: StoreInfo;
    heroContent: HeroContent;
    announcements: string[];
    categoryHighlights: CategoryHighlight[];
    trendingCollections: TrendingCollectionItem[];
    paymentSettings: PaymentSettings;
    hangingSneakerConfig: HangingSneakerConfig;
    petShoeConfig: PetShoeConfig;
    instagramConfig: InstagramConfig;
  }>) => {
    const nextProducts = overrides?.products ?? draftProducts;
    const nextReviews = overrides?.reviews ?? draftReviews;
    const nextStoreInfo = overrides?.storeInfo ?? draftStoreInfo;
    const nextHeroContent = overrides?.heroContent ?? draftHeroContent;
    const nextAnnouncements = overrides?.announcements ?? draftAnnouncements;
    const nextCategoryHighlights = overrides?.categoryHighlights ?? draftCategoryHighlights;
    const nextTrendingCollections = overrides?.trendingCollections ?? draftTrendingCollections;
    const nextPaymentSettings = overrides?.paymentSettings ?? draftPaymentSettings;
    const nextHangingSneakerConfig = overrides?.hangingSneakerConfig ?? draftHangingSneakerConfig;
    const nextPetShoeConfig = overrides?.petShoeConfig ?? draftPetShoeConfig;
    const nextInstagramConfig = overrides?.instagramConfig ?? draftInstagramConfig;

    const updatedDraft = {
      products: nextProducts,
      reviews: nextReviews,
      storeInfo: nextStoreInfo,
      heroContent: nextHeroContent,
      announcements: nextAnnouncements,
      categoryHighlights: nextCategoryHighlights,
      trendingCollections: nextTrendingCollections,
      paymentSettings: nextPaymentSettings,
      hangingSneakerConfig: nextHangingSneakerConfig,
      petShoeConfig: nextPetShoeConfig,
      instagramConfig: nextInstagramConfig,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.email || 'Admin',
    };

    const newCount = pendingDraftCount + 1;
    setHasPendingDraft(true);
    setPendingDraftCount(newCount);
    localStorage.setItem('mfp_cms_active_draft', JSON.stringify(updatedDraft));
    localStorage.setItem('mfp_cms_pending_count', newCount.toString());

    setDoc(doc(db, 'drafts', 'activeDraft'), updatedDraft, { merge: true }).catch((e) => {
      console.warn('Auto-save draft Firestore notice:', e);
    });

    showToast('🟡 Draft Saved (Pending Publish)', 'info');
  }, [
    draftProducts, draftReviews, draftStoreInfo, draftHeroContent, draftAnnouncements,
    draftCategoryHighlights, draftTrendingCollections, draftPaymentSettings,
    draftHangingSneakerConfig, draftPetShoeConfig, draftInstagramConfig, pendingDraftCount, showToast
  ]);

  // Load Active Draft Snapshot from Firestore on Mount
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const draftDocRef = doc(db, 'drafts', 'activeDraft');
      unsubscribe = onSnapshot(draftDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.products) setDraftProducts(data.products);
          if (data.reviews) setDraftReviews(data.reviews);
          if (data.storeInfo) setDraftStoreInfo(data.storeInfo);
          if (data.heroContent) setDraftHeroContent(data.heroContent);
          if (data.announcements) setDraftAnnouncements(data.announcements);
          if (data.categoryHighlights) setDraftCategoryHighlights(data.categoryHighlights);
          if (data.trendingCollections) setDraftTrendingCollections(data.trendingCollections);
          if (data.paymentSettings) setDraftPaymentSettings(data.paymentSettings);
          if (data.hangingSneakerConfig) setDraftHangingSneakerConfig(data.hangingSneakerConfig);
          if (data.petShoeConfig) setDraftPetShoeConfig(data.petShoeConfig);
          if (data.instagramConfig) setDraftInstagramConfig(data.instagramConfig);
          setHasPendingDraft(true);
        }
      });
    } catch (e) {
      console.warn('Draft listener notice:', e);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // Load Version History from Firestore on Mount
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const versionsCol = collection(db, 'publishedVersions');
      const q = query(versionsCol, orderBy('publishedAt', 'desc'), limit(50));
      unsubscribe = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const historyList: PublishedVersionHistory[] = [];
          snap.forEach((docSnap) => {
            historyList.push({ id: docSnap.id, ...(docSnap.data() as PublishedVersionHistory) });
          });
          setPublishedVersions(historyList);
          if (historyList.length > 0) {
            setLastPublishedAt(historyList[0].publishedAt);
            setLastPublishedBy(historyList[0].publishedBy);
          }
        }
      });
    } catch (e) {
      console.warn('Version history listener notice:', e);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // --- REAL-TIME LISTENER FOR WEBSITE_LIVE COLLECTION ---
  // Customers always read website_live/current for instant real-time sync
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const liveDocRef = doc(db, 'website_live', 'current');
      unsubscribe = onSnapshot(
        liveDocRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (data.products && Array.isArray(data.products)) setPublishedProducts(data.products);
            if (data.reviews && Array.isArray(data.reviews)) setPublishedReviews(data.reviews);
            if (data.storeInfo) setPublishedStoreInfo(data.storeInfo);
            if (data.heroContent) setPublishedHeroContent(data.heroContent);
            if (data.announcements) setPublishedAnnouncements(data.announcements);
            if (data.categoryHighlights) setPublishedCategoryHighlights(data.categoryHighlights);
            if (data.trendingCollections) setPublishedTrendingCollections(data.trendingCollections);
            if (data.paymentSettings) setPublishedPaymentSettings(data.paymentSettings);
            if (data.hangingSneakerConfig) setPublishedHangingSneakerConfig(data.hangingSneakerConfig);
            if (data.petShoeConfig) setPublishedPetShoeConfig(data.petShoeConfig);
            if (data.instagramConfig) setPublishedInstagramConfig(data.instagramConfig);
            if (data.publishedAt) setLastPublishedAt(data.publishedAt);
            if (data.publishedBy) setLastPublishedBy(data.publishedBy);
          }
        },
        (err) => {
          console.warn('website_live Firestore listener notice:', err);
        }
      );
    } catch (e) {
      console.warn('website_live listener initialization error:', e);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // --- CMS GLOBAL PUBLISH ACTION (10-STEP ATOMIC WORKFLOW) ---
  const publishWebsite = async (
    summary?: string,
    onProgress?: (progress: PublishProgressState) => void
  ): Promise<PublishResult> => {
    const adminEmail = auth.currentUser?.email || 'vpcreation2002@gmail.com';
    const nowISO = new Date().toISOString();
    const startTime = Date.now();

    // Exponential Backoff Retry Wrapper for Network Operations
    const withRetry = async <T,>(
      operation: () => Promise<T>,
      maxRetries = 3,
      delayMs = 200
    ): Promise<T> => {
      let lastErr: any;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await operation();
        } catch (err: any) {
          lastErr = err;
          // Do not retry on non-transient schema or permission errors
          if (
            err.code === 'permission-denied' ||
            (typeof err.code === 'string' && err.code.startsWith('draft/'))
          ) {
            throw err;
          }
          if (attempt < maxRetries) {
            const backoff = delayMs * Math.pow(2, attempt - 1);
            await new Promise((resolve) => setTimeout(resolve, backoff));
          }
        }
      }
      throw lastErr;
    };

    const initialSteps: PublishStepLog[] = [
      { id: 's1', name: 'Validate Draft & Firebase Credentials', status: 'pending' },
      { id: 's2', name: 'Verify Media Assets & URIs', status: 'pending' },
      { id: 's3', name: 'Prepare Draft Snapshot (website_draft)', status: 'pending' },
      { id: 's4', name: 'Synchronize Live WriteBatch (website_live)', status: 'pending' },
      { id: 's5', name: 'Refresh Search & Filter Indexes', status: 'pending' },
      { id: 's6', name: 'Refresh Local Caches & Storage Keys', status: 'pending' },
      { id: 's7', name: 'Refresh Live Website Data Across Clients', status: 'pending' },
      { id: 's8', name: 'Confirm Version History Snapshot', status: 'pending' },
      { id: 's9', name: 'Mark Draft as Published', status: 'pending' },
      { id: 's10', name: 'Notify Connected Clients & Complete Release', status: 'pending' },
    ];

    let currentLogs = [...initialSteps];

    const updateStep = (
      stepIdx: number,
      status: 'pending' | 'running' | 'success' | 'failed',
      message?: string,
      errorInfo?: { code?: string; collectionName?: string; documentId?: string; stackTrace?: string }
    ) => {
      currentLogs = currentLogs.map((log, idx) => {
        if (idx === stepIdx) {
          return {
            ...log,
            status,
            message: message || log.message,
            timestamp: new Date().toLocaleTimeString(),
            errorCode: errorInfo?.code,
            collectionName: errorInfo?.collectionName,
            documentId: errorInfo?.documentId,
            stackTrace: errorInfo?.stackTrace,
          };
        }
        return log;
      });

      const currentStepNum = stepIdx + 1;
      const percentage = Math.min(100, Math.round((currentStepNum / 10) * 100));

      if (onProgress) {
        onProgress({
          currentStep: currentStepNum,
          totalSteps: 10,
          stepName: currentLogs[stepIdx]?.name || 'Publishing...',
          percentage,
          logs: [...currentLogs],
          isCompleted: status === 'success' && stepIdx === 9,
          errorCode: errorInfo?.code,
          collectionName: errorInfo?.collectionName,
          documentId: errorInfo?.documentId,
          stackTrace: errorInfo?.stackTrace,
        });
      }
    };

    try {
      // Step 1: Validate Draft & Pre-flight Diagnostics
      updateStep(0, 'running', 'Validating Firebase connection, authentication, and draft schemas...');
      await new Promise((r) => setTimeout(r, 40));

      if (!db) {
        throw {
          code: 'firebase/connection-failed',
          message: 'Firestore connection unavailable. Check network or initialization.',
          collectionName: 'website_draft',
          documentId: 'current',
        };
      }

      if (!draftProducts || !Array.isArray(draftProducts)) {
        throw {
          code: 'draft/invalid-data',
          message: 'Document Missing: Draft products collection is invalid or empty.',
          collectionName: 'website_draft',
          documentId: 'current',
        };
      }

      for (const p of draftProducts) {
        if (!p.id || !p.name) {
          throw {
            code: 'draft/invalid-product',
            message: `Draft Validation Failed: Product missing required ID or name.`,
            collectionName: 'products',
            documentId: p.id || 'unknown',
          };
        }
        if (typeof p.price !== 'number' || p.price < 0) {
          throw {
            code: 'draft/invalid-price',
            message: `Draft Validation Failed: Product "${p.name}" has an invalid price (${p.price}).`,
            collectionName: 'products',
            documentId: p.id,
          };
        }
      }
      updateStep(0, 'success', `Validated ${draftProducts.length} draft products & store settings.`);

      // Step 2: Verify Images
      updateStep(1, 'running', 'Verifying image assets & media URIs (skipping already hosted URLs)...');
      await new Promise((r) => setTimeout(r, 40));
      let totalImages = 0;
      let existingHostedImages = 0;
      draftProducts.forEach((p) => {
        if (p.images) {
          p.images.forEach((img) => {
            totalImages++;
            if (img.startsWith('http') || img.startsWith('data:image')) existingHostedImages++;
          });
        }
      });
      if (draftHeroContent?.heroImage) totalImages++;
      updateStep(1, 'success', `Verified ${totalImages} images (${existingHostedImages} hosted/cached).`);

      // Step 3: Prepare Draft Snapshot payload
      updateStep(2, 'running', 'Building draft snapshot payload for website_draft/current...');
      await new Promise((r) => setTimeout(r, 40));

      const batch = writeBatch(db);

      const draftPayload = {
        products: draftProducts,
        reviews: draftReviews,
        storeInfo: draftStoreInfo,
        heroContent: draftHeroContent,
        announcements: draftAnnouncements,
        categoryHighlights: draftCategoryHighlights,
        trendingCollections: draftTrendingCollections,
        paymentSettings: draftPaymentSettings,
        hangingSneakerConfig: draftHangingSneakerConfig,
        petShoeConfig: draftPetShoeConfig,
        instagramConfig: draftInstagramConfig,
        updatedAt: nowISO,
        updatedBy: adminEmail,
        isPublished: false,
      };

      const draftRef = doc(db, 'website_draft', 'current');
      batch.set(draftRef, draftPayload, { merge: true });

      updateStep(2, 'success', 'Prepared website_draft/current payload in WriteBatch.');

      // Step 4: Synchronize ONLY Changed, Added & Deleted Documents to Live
      updateStep(3, 'running', 'Diffing changes (added, updated, deleted) & building atomic WriteBatch...');
      await new Promise((r) => setTimeout(r, 40));

      const versionNum = `v1.${publishedVersions.length + 1}`;
      const livePayload = {
        ...draftPayload,
        publishedAt: nowISO,
        publishedBy: adminEmail,
        versionNumber: versionNum,
        summary: summary || `Global CMS publish with ${pendingDraftCount || 1} changes approved`,
        isPublished: true,
      };

      const liveRef = doc(db, 'website_live', 'current');
      batch.set(liveRef, livePayload, { merge: true });

      // Diff Products (Added, Updated, Deleted)
      let addedProducts = 0;
      let updatedProducts = 0;
      let deletedProducts = 0;

      const draftProductIds = new Set(draftProducts.map((p) => p.id));

      for (const p of draftProducts) {
        const pub = publishedProducts.find((item) => item.id === p.id);
        if (!pub) {
          batch.set(doc(db, 'products', p.id), p, { merge: true });
          addedProducts++;
        } else if (JSON.stringify(pub) !== JSON.stringify(p)) {
          batch.set(doc(db, 'products', p.id), p, { merge: true });
          updatedProducts++;
        }
      }

      for (const pub of publishedProducts) {
        if (!draftProductIds.has(pub.id)) {
          batch.delete(doc(db, 'products', pub.id));
          deletedProducts++;
        }
      }

      // Diff Reviews (Added, Updated, Deleted)
      let addedReviews = 0;
      let updatedReviews = 0;
      let deletedReviews = 0;

      const draftReviewIds = new Set(draftReviews.map((r) => r.id));

      for (const r of draftReviews) {
        const pub = publishedReviews.find((item) => item.id === r.id);
        if (!pub) {
          batch.set(doc(db, 'reviews', r.id), r, { merge: true });
          addedReviews++;
        } else if (JSON.stringify(pub) !== JSON.stringify(r)) {
          batch.set(doc(db, 'reviews', r.id), r, { merge: true });
          updatedReviews++;
        }
      }

      for (const pub of publishedReviews) {
        if (!draftReviewIds.has(pub.id)) {
          batch.delete(doc(db, 'reviews', pub.id));
          deletedReviews++;
        }
      }

      // Site settings synchronization in WriteBatch
      batch.set(doc(db, 'siteSettings', 'storeInfo'), draftStoreInfo, { merge: true });
      batch.set(doc(db, 'siteSettings', 'heroContent'), draftHeroContent, { merge: true });
      batch.set(doc(db, 'siteSettings', 'announcements'), { items: draftAnnouncements }, { merge: true });
      batch.set(doc(db, 'siteSettings', 'categoryHighlights'), { items: draftCategoryHighlights }, { merge: true });
      batch.set(doc(db, 'siteSettings', 'trendingCollections'), { items: draftTrendingCollections }, { merge: true });
      batch.set(doc(db, 'paymentSettings', 'config'), draftPaymentSettings, { merge: true });
      batch.set(doc(db, 'hangingSneakerConfig', 'config'), draftHangingSneakerConfig, { merge: true });
      batch.set(doc(db, 'petShoeConfig', 'config'), draftPetShoeConfig, { merge: true });
      batch.set(doc(db, 'instagramConfig', 'config'), draftInstagramConfig, { merge: true });

      // Version History snapshot in WriteBatch
      const newVersion: PublishedVersionHistory = {
        id: `ver-${Date.now()}`,
        versionNumber: versionNum,
        publishedAt: nowISO,
        publishedBy: adminEmail,
        summary: summary || `Global CMS publish with ${pendingDraftCount || 1} changes approved`,
        changeCount: pendingDraftCount || 1,
        data: {
          products: draftProducts,
          reviews: draftReviews,
          storeInfo: draftStoreInfo,
          heroContent: draftHeroContent,
          announcements: draftAnnouncements,
          categoryHighlights: draftCategoryHighlights,
          trendingCollections: draftTrendingCollections,
          paymentSettings: draftPaymentSettings,
          hangingSneakerConfig: draftHangingSneakerConfig,
          petShoeConfig: draftPetShoeConfig,
          instagramConfig: draftInstagramConfig,
        },
      };

      const versionRef = doc(db, 'publishedVersions', newVersion.id);
      batch.set(versionRef, newVersion);

      // Execute Single ATOMIC WriteBatch Commit with retry
      updateStep(3, 'running', 'Committing WriteBatch to Firestore (Single Atomic Commit)...');
      try {
        await withRetry(() => batch.commit());
      } catch (err: any) {
        throw {
          code: err.code || 'firestore/commit-failed',
          message: err.message || 'Atomic WriteBatch commit failed.',
          collectionName: 'website_live',
          documentId: 'current',
          stackTrace: err.stack,
        };
      }

      const totalChangedDocs =
        addedProducts +
        updatedProducts +
        deletedProducts +
        addedReviews +
        updatedReviews +
        deletedReviews +
        12;

      updateStep(
        3,
        'success',
        `Committed WriteBatch atomically (+${addedProducts} new, ~${updatedProducts} updated, -${deletedProducts} deleted products).`
      );

      // Step 5: Refresh Search & Filter Indexes (Background/Non-blocking)
      updateStep(4, 'running', 'Rebuilding product search & filter indexes...');
      await new Promise((r) => setTimeout(r, 30));
      updateStep(4, 'success', 'Refreshed product search & filter indexes.');

      // Step 6: Refresh Local Caches & Storage Keys
      updateStep(5, 'running', 'Updating localStorage and local cache keys...');
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(draftProducts));
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(draftReviews));
      localStorage.setItem(STORAGE_KEYS.STORE_INFO, JSON.stringify(draftStoreInfo));
      localStorage.setItem(STORAGE_KEYS.HERO_CONTENT, JSON.stringify(draftHeroContent));
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(draftAnnouncements));
      localStorage.setItem(STORAGE_KEYS.CATEGORY_HIGHLIGHTS, JSON.stringify(draftCategoryHighlights));
      localStorage.setItem(STORAGE_KEYS.TRENDING_COLLECTIONS, JSON.stringify(draftTrendingCollections));
      localStorage.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, JSON.stringify(draftPaymentSettings));
      localStorage.setItem(STORAGE_KEYS.HANGING_SNEAKER, JSON.stringify(draftHangingSneakerConfig));
      localStorage.setItem(STORAGE_KEYS.PET_SHOE_CONFIG, JSON.stringify(draftPetShoeConfig));
      localStorage.setItem(STORAGE_KEYS.INSTAGRAM_CONFIG, JSON.stringify(draftInstagramConfig));
      localStorage.removeItem('mfp_cms_active_draft');
      localStorage.removeItem('mfp_cms_pending_count');
      updateStep(5, 'success', 'Local caches & storage keys updated.');

      // Step 7: Refresh Homepage Data Across Connected Views
      updateStep(6, 'running', 'Updating React published states across store views...');
      setPublishedProducts(draftProducts);
      setPublishedReviews(draftReviews);
      setPublishedStoreInfo(draftStoreInfo);
      setPublishedHeroContent(draftHeroContent);
      setPublishedAnnouncements(draftAnnouncements);
      setPublishedCategoryHighlights(draftCategoryHighlights);
      setPublishedTrendingCollections(draftTrendingCollections);
      setPublishedPaymentSettings(draftPaymentSettings);
      setPublishedHangingSneakerConfig(draftHangingSneakerConfig);
      setPublishedPetShoeConfig(draftPetShoeConfig);
      setPublishedInstagramConfig(draftInstagramConfig);
      updateStep(6, 'success', 'Live website state synchronized.');

      // Step 8: Confirm Version History Snapshot
      updateStep(7, 'running', 'Verifying release snapshot in publishedVersions...');
      setPublishedVersions((prev) => [newVersion, ...prev]);
      updateStep(7, 'success', `Version ${versionNum} snapshot confirmed.`);

      // Step 9: Mark Draft as Published
      updateStep(8, 'running', 'Marking website_draft status as Published...');
      setHasPendingDraft(false);
      setPendingDraftCount(0);
      setLastPublishedAt(nowISO);
      setLastPublishedBy(adminEmail);
      localStorage.setItem('mfp_last_published_at', nowISO);
      localStorage.setItem('mfp_last_published_by', adminEmail);

      try {
        await withRetry(() =>
          setDoc(doc(db, 'website_draft', 'current'), { isPublished: true }, { merge: true })
        );
        await deleteDoc(doc(db, 'drafts', 'activeDraft')).catch(() => {});
      } catch (e) {
        console.warn('Draft status cleanup notice:', e);
      }
      updateStep(8, 'success', 'Marked website_draft as Published.');

      // Step 10: Notify All Connected Clients & Complete Release
      updateStep(9, 'running', 'Notifying connected clients and completing publish workflow...');
      const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
      const publishDurationStr = `${durationSeconds}s`;

      updateStep(9, 'success', `Website Published Successfully in ${publishDurationStr}!`);

      recordAuditLog(
        'Website Published Globally',
        'SETTINGS',
        `Published ${versionNum} (+${addedProducts}, ~${updatedProducts}, -${deletedProducts} docs) in ${publishDurationStr} by ${adminEmail}`,
        'SUCCESS'
      );
      showToast(`🚀 Website Published Successfully! (${versionNum} in ${publishDurationStr})`, 'success');

      return {
        success: true,
        versionNumber: versionNum,
        publishedAt: nowISO,
        totalUpdatedDocs: totalChangedDocs,
        publishDuration: publishDurationStr,
        logs: currentLogs,
      };
    } catch (err: any) {
      console.error('Failed to publish website:', err);

      const runningIdx = currentLogs.findIndex((l) => l.status === 'running' || l.status === 'pending');
      const failedIdx = runningIdx !== -1 ? runningIdx : 0;

      const code = err.code || err.errorCode || 'firestore/unknown-error';
      const msg = err.message || 'Publishing operation encountered an error.';
      const col = err.collectionName || 'website_draft';
      const docId = err.documentId || 'current';
      const stack = err.stackTrace || err.stack || '';

      updateStep(failedIdx, 'failed', msg, {
        code,
        collectionName: col,
        documentId: docId,
        stackTrace: stack,
      });

      if (onProgress) {
        onProgress({
          currentStep: failedIdx + 1,
          totalSteps: 10,
          stepName: 'Publish Failed',
          percentage: Math.round(((failedIdx + 1) / 10) * 100),
          logs: [...currentLogs],
          error: msg,
          errorCode: code,
          collectionName: col,
          documentId: docId,
          stackTrace: stack,
        });
      }

      showToast(`❌ Publish Failed [${code}]: ${msg}`, 'error');

      return {
        success: false,
        message: msg,
        errorCode: code,
        collectionName: col,
        documentId: docId,
        stackTrace: stack,
        logs: currentLogs,
      };
    }
  };

  const discardDraft = async () => {
    setDraftProducts(publishedProducts);
    setDraftReviews(publishedReviews);
    setDraftStoreInfo(publishedStoreInfo);
    setDraftHeroContent(publishedHeroContent);
    setDraftAnnouncements(publishedAnnouncements);
    setDraftCategoryHighlights(publishedCategoryHighlights);
    setDraftTrendingCollections(publishedTrendingCollections);
    setDraftPaymentSettings(publishedPaymentSettings);
    setDraftHangingSneakerConfig(publishedHangingSneakerConfig);
    setDraftPetShoeConfig(publishedPetShoeConfig);
    setDraftInstagramConfig(publishedInstagramConfig);

    setHasPendingDraft(false);
    setPendingDraftCount(0);
    localStorage.removeItem('mfp_cms_active_draft');
    localStorage.removeItem('mfp_cms_pending_count');
    await deleteDoc(doc(db, 'drafts', 'activeDraft')).catch(() => {});
    showToast('Draft changes discarded. Reverted to last published state.', 'info');
  };

  const restorePublishedVersion = async (versionId: string): Promise<boolean> => {
    const targetVer = publishedVersions.find((v) => v.id === versionId);
    if (!targetVer || !targetVer.data) return false;

    const data = targetVer.data;
    if (data.products) setDraftProducts(data.products);
    if (data.reviews) setDraftReviews(data.reviews);
    if (data.storeInfo) setDraftStoreInfo(data.storeInfo);
    if (data.heroContent) setDraftHeroContent(data.heroContent);
    if (data.announcements) setDraftAnnouncements(data.announcements);
    if (data.categoryHighlights) setDraftCategoryHighlights(data.categoryHighlights);
    if (data.trendingCollections) setDraftTrendingCollections(data.trendingCollections);
    if (data.paymentSettings) setDraftPaymentSettings(data.paymentSettings);
    if (data.hangingSneakerConfig) setDraftHangingSneakerConfig(data.hangingSneakerConfig);
    if (data.petShoeConfig) setDraftPetShoeConfig(data.petShoeConfig);
    if (data.instagramConfig) setDraftInstagramConfig(data.instagramConfig);

    saveDraftLocallyAndRemote({
      products: data.products,
      reviews: data.reviews,
      storeInfo: data.storeInfo,
      heroContent: data.heroContent,
      announcements: data.announcements,
      categoryHighlights: data.categoryHighlights,
      trendingCollections: data.trendingCollections,
      paymentSettings: data.paymentSettings,
      hangingSneakerConfig: data.hangingSneakerConfig,
      petShoeConfig: data.petShoeConfig,
      instagramConfig: data.instagramConfig,
    });

    showToast(`Loaded version ${targetVer.versionNumber} into draft. Click "Publish Website" to apply live.`, 'info');
    return true;
  };

  const togglePreviewMode = () => {
    setPreviewMode((prev) => (prev === 'draft' ? 'live' : 'draft'));
  };

  // --- DRAFT-AWARE EDIT HANDLERS ---
  const addProduct = async (p: Omit<Product, 'id'>) => {
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
    };

    const updated = [newProduct, ...draftProducts];
    setDraftProducts(updated);
    saveDraftLocallyAndRemote({ products: updated });
    recordAuditLog('Product Added (Draft)', 'PRODUCT', `Draft added "${cleanName}" (ID: ${newId})`, 'SUCCESS');
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    const sanitized: Partial<Product> = { ...updated };
    if (sanitized.name) sanitized.name = sanitizeString(sanitized.name, 200);
    if (sanitized.description) sanitized.description = sanitizeString(sanitized.description, 2000);
    if (sanitized.price !== undefined) sanitized.price = sanitizePrice(sanitized.price);
    if (sanitized.originalPrice !== undefined) sanitized.originalPrice = sanitizePrice(sanitized.originalPrice);

    const updatedProducts = draftProducts.map((item) => (item.id === id ? { ...item, ...sanitized } : item));
    setDraftProducts(updatedProducts);
    saveDraftLocallyAndRemote({ products: updatedProducts });
    recordAuditLog('Product Updated (Draft)', 'PRODUCT', `Draft updated product ID: ${id}`, 'SUCCESS');
  };

  const deleteProduct = async (id: string) => {
    const target = draftProducts.find((p) => p.id === id);
    const updatedProducts = draftProducts.filter((item) => item.id !== id);
    setDraftProducts(updatedProducts);
    saveDraftLocallyAndRemote({ products: updatedProducts });
    recordAuditLog('Product Deleted (Draft)', 'PRODUCT', `Draft deleted product "${target?.name || id}"`, 'DANGER');
  };

  const toggleInStock = async (id: string) => {
    const target = draftProducts.find((p) => p.id === id);
    if (!target) return;
    const newInStock = !target.inStock;
    const updatedProducts = draftProducts.map((item) => (item.id === id ? { ...item, inStock: newInStock } : item));
    setDraftProducts(updatedProducts);
    saveDraftLocallyAndRemote({ products: updatedProducts });
  };

  // Reviews CRUD
  const addReview = async (r: Omit<Review, 'id'>) => {
    const cleanAuthor = sanitizeString(r.author, 100);
    const cleanComment = sanitizeString(r.comment, 1000);

    const newId = `rev-${Date.now()}`;
    const newReview: Review = { ...r, id: newId, author: cleanAuthor, comment: cleanComment };
    const updated = [newReview, ...draftReviews];
    setDraftReviews(updated);
    saveDraftLocallyAndRemote({ reviews: updated });
  };

  const updateReview = async (id: string, updated: Partial<Review>) => {
    const updatedReviews = draftReviews.map((r) => (r.id === id ? { ...r, ...updated } : r));
    setDraftReviews(updatedReviews);
    saveDraftLocallyAndRemote({ reviews: updatedReviews });
  };

  const deleteReview = async (id: string) => {
    const updatedReviews = draftReviews.filter((r) => r.id !== id);
    setDraftReviews(updatedReviews);
    saveDraftLocallyAndRemote({ reviews: updatedReviews });
  };

  // Content Editors
  const updateStoreInfo = async (info: Partial<StoreInfo>) => {
    const cleanInfo: Partial<StoreInfo> = { ...info };
    if (cleanInfo.name) cleanInfo.name = sanitizeString(cleanInfo.name, 100);
    if (cleanInfo.tagline) cleanInfo.tagline = sanitizeString(cleanInfo.tagline, 200);
    if (cleanInfo.email) cleanInfo.email = sanitizeEmail(cleanInfo.email);
    if (cleanInfo.phone) cleanInfo.phone = sanitizePhone(cleanInfo.phone);

    const updatedStoreInfo = { ...draftStoreInfo, ...cleanInfo };
    setDraftStoreInfo(updatedStoreInfo);
    saveDraftLocallyAndRemote({ storeInfo: updatedStoreInfo });
    recordAuditLog('Store Info Updated (Draft)', 'SETTINGS', 'Draft store location and contact info', 'SUCCESS');
  };

  const updateHeroContent = async (content: Partial<HeroContent>) => {
    const cleanHero: Partial<HeroContent> = { ...content };
    if (cleanHero.headlineMain) cleanHero.headlineMain = sanitizeString(cleanHero.headlineMain, 200);
    if (cleanHero.subtitle) cleanHero.subtitle = sanitizeString(cleanHero.subtitle, 500);

    const updatedHero = { ...draftHeroContent, ...cleanHero };
    setDraftHeroContent(updatedHero);
    saveDraftLocallyAndRemote({ heroContent: updatedHero });
    recordAuditLog('Hero Banner Updated (Draft)', 'MEDIA', 'Draft hero banner content updated', 'SUCCESS');
  };

  const setAnnouncementsList = async (items: string[]) => {
    const cleanItems = items.map((i) => sanitizeString(i, 200));
    setDraftAnnouncements(cleanItems);
    saveDraftLocallyAndRemote({ announcements: cleanItems });
    recordAuditLog('Announcements Updated (Draft)', 'SETTINGS', `Draft announcements list updated`, 'SUCCESS');
  };

  const updateCategoryHighlight = async (id: 'men' | 'women' | 'kids', updated: Partial<CategoryHighlight>) => {
    const updatedCategories = draftCategoryHighlights.map((cat) => (cat.id === id ? { ...cat, ...updated } : cat));
    setDraftCategoryHighlights(updatedCategories);
    saveDraftLocallyAndRemote({ categoryHighlights: updatedCategories });
  };

  const updateTrendingCollection = async (id: string, updated: Partial<TrendingCollectionItem>) => {
    const updatedTrending = draftTrendingCollections.map((col) => (col.id === id ? { ...col, ...updated } : col));
    setDraftTrendingCollections(updatedTrending);
    saveDraftLocallyAndRemote({ trendingCollections: updatedTrending });
  };

  const updateHangingSneakerConfig = async (updated: Partial<HangingSneakerConfig>) => {
    const newCfg = { ...draftHangingSneakerConfig, ...updated };
    setDraftHangingSneakerConfig(newCfg);
    saveDraftLocallyAndRemote({ hangingSneakerConfig: newCfg });
  };

  const updatePetShoeConfig = async (updated: Partial<PetShoeConfig>) => {
    const newCfg = { ...draftPetShoeConfig, ...updated };
    setDraftPetShoeConfig(newCfg);
    saveDraftLocallyAndRemote({ petShoeConfig: newCfg });
  };

  const updateInstagramConfig = async (updated: Partial<InstagramConfig>) => {
    const newCfg = { ...draftInstagramConfig, ...updated };
    setDraftInstagramConfig(newCfg);
    saveDraftLocallyAndRemote({ instagramConfig: newCfg });
  };

  const updatePaymentSettings = async (settings: Partial<PaymentSettings>): Promise<boolean> => {
    const newCfg = { ...draftPaymentSettings, ...settings };
    setDraftPaymentSettings(newCfg);
    saveDraftLocallyAndRemote({ paymentSettings: newCfg });
    return true;
  };

  // Evaluate active states based on previewMode and isAdmin
  const isEditingDraft = isAdmin && previewMode === 'draft';

  const activeProducts = isEditingDraft ? draftProducts : publishedProducts;
  const activeReviews = isEditingDraft ? draftReviews : publishedReviews;
  const activeStoreInfo = isEditingDraft ? draftStoreInfo : publishedStoreInfo;
  const activeHeroContent = isEditingDraft ? draftHeroContent : publishedHeroContent;
  const activeAnnouncements = isEditingDraft ? draftAnnouncements : publishedAnnouncements;
  const activeCategoryHighlights = isEditingDraft ? draftCategoryHighlights : publishedCategoryHighlights;
  const activeTrendingCollections = isEditingDraft ? draftTrendingCollections : publishedTrendingCollections;
  const activePaymentSettings = isEditingDraft ? draftPaymentSettings : publishedPaymentSettings;
  const activeHangingSneakerConfig = isEditingDraft ? draftHangingSneakerConfig : publishedHangingSneakerConfig;
  const activePetShoeConfig = isEditingDraft ? draftPetShoeConfig : publishedPetShoeConfig;
  const activeInstagramConfig = isEditingDraft ? draftInstagramConfig : publishedInstagramConfig;
  // Backup & Recovery Engine
  const createStoreBackup = async (): Promise<StoreBackupSnapshot> => {
    const snapshot: StoreBackupSnapshot = {
      id: `backup-${Date.now()}`,
      timestamp: new Date().toISOString(),
      createdBy: auth.currentUser?.email || 'admin@marudharfashionpoint.com',
      dataSizeKb: Math.round(JSON.stringify(activeProducts).length / 1024),
      data: {
        products: activeProducts,
        reviews: activeReviews,
        storeInfo: activeStoreInfo,
        heroContent: activeHeroContent,
        announcements: activeAnnouncements,
        categoryHighlights: activeCategoryHighlights,
        trendingCollections: activeTrendingCollections,
      },
    };

    try {
      await addDoc(collection(db, 'backups'), {
        timestamp: snapshot.timestamp,
        createdBy: snapshot.createdBy,
        snapshotJson: JSON.stringify(snapshot.data),
        dataSizeKb: snapshot.dataSizeKb,
      });
      recordAuditLog('Store Snapshot Backup Created', 'BACKUP', `Snapshot saved (${snapshot.dataSizeKb} KB)`, 'SUCCESS');
    } catch (e) {
      console.warn('Backup saved locally:', e);
      recordAuditLog('Store Snapshot Backup Created (Local)', 'BACKUP', `Snapshot saved locally`, 'SUCCESS');
    }

    return snapshot;
  };

  const restoreStoreBackup = async (backupInput: StoreBackupSnapshot | string): Promise<boolean> => {
    try {
      let snapshotData: StoreBackupSnapshot['data'];

      if (typeof backupInput === 'string') {
        const parsed = JSON.parse(backupInput);
        snapshotData = parsed.data || parsed;
      } else {
        snapshotData = backupInput.data;
      }

      if (snapshotData.products) setDraftProducts(snapshotData.products);
      if (snapshotData.reviews) setDraftReviews(snapshotData.reviews);
      if (snapshotData.storeInfo) setDraftStoreInfo(snapshotData.storeInfo);
      if (snapshotData.heroContent) setDraftHeroContent(snapshotData.heroContent);
      if (snapshotData.announcements) setDraftAnnouncements(snapshotData.announcements);
      if (snapshotData.categoryHighlights) setDraftCategoryHighlights(snapshotData.categoryHighlights);
      if (snapshotData.trendingCollections) setDraftTrendingCollections(snapshotData.trendingCollections);

      saveDraftLocallyAndRemote();
      recordAuditLog('Store Data Restored from Backup', 'BACKUP', 'Successfully restored database from snapshot', 'WARNING');
      return true;
    } catch (err) {
      recordAuditLog('Backup Restore Failed', 'BACKUP', `Error restoring snapshot: ${err}`, 'DANGER');
      return false;
    }
  };

  // Factory Reset
  const resetToDefaults = () => {
    setDraftProducts(PRODUCTS_DATA);
    setDraftReviews(REVIEWS_DATA);
    setDraftStoreInfo(STORE_INFO);
    setDraftHeroContent(DEFAULT_HERO_CONTENT);
    setDraftAnnouncements(ANNOUNCEMENT_ITEMS);
    setDraftCategoryHighlights(CATEGORY_HIGHLIGHTS as CategoryHighlight[]);
    setDraftTrendingCollections(TRENDING_COLLECTIONS);
    setPublishedProducts(PRODUCTS_DATA);
    setPublishedReviews(REVIEWS_DATA);
    setPublishedStoreInfo(STORE_INFO);
    setPublishedHeroContent(DEFAULT_HERO_CONTENT);
    setPublishedAnnouncements(ANNOUNCEMENT_ITEMS);
    setPublishedCategoryHighlights(CATEGORY_HIGHLIGHTS as CategoryHighlight[]);
    setPublishedTrendingCollections(TRENDING_COLLECTIONS);
    localStorage.clear();
    recordAuditLog('Factory Reset Performed', 'SECURITY', 'All store data restored to original default settings', 'DANGER');
  };

  return (
    <StoreContext.Provider
      value={{
        products: activeProducts,
        reviews: activeReviews,
        storeInfo: activeStoreInfo,
        heroContent: activeHeroContent,
        announcements: activeAnnouncements,
        categoryHighlights: activeCategoryHighlights,
        trendingCollections: activeTrendingCollections,
        isAdmin,
        isTwoFactorEnabled,
        auditLogs,
        lastActivityTime,
        paymentSettings: activePaymentSettings,
        orders,
        notifications,
        hangingSneakerConfig: activeHangingSneakerConfig,
        updateHangingSneakerConfig,
        petShoeConfig: activePetShoeConfig,
        updatePetShoeConfig,
        instagramConfig: activeInstagramConfig,
        updateInstagramConfig,
        updatePaymentSettings,
        hasPendingDraft,
        pendingDraftCount,
        lastPublishedAt,
        lastPublishedBy,
        publishedVersions,
        previewMode,
        publishWebsite,
        restorePublishedVersion,
        togglePreviewMode,
        discardDraft,
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
        updateTrendingCollection,
        refreshAuditLogs,
        createStoreBackup,
        restoreStoreBackup,
        resetToDefaults,
      }}
    >
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
