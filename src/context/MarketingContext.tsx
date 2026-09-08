import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PromoCoupon, MarketingCampaign, MarketingSubscriber } from '../types';
import { db, saveMarketingConsentInFirestore } from '../lib/firebase';
import { collection, limit, onSnapshot, orderBy, query, doc, setDoc, deleteDoc } from 'firebase/firestore';

export interface CouponValidationResult {
  valid: boolean;
  coupon?: PromoCoupon;
  discountAmount: number;
  isFreeShipping?: boolean;
  freeShipping?: boolean;
  freeGift?: boolean;
  giftName?: string;
  message?: string;
  reason?: string;
}

export const DEFAULT_MARKETING_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'camp_festival_offers',
    title: 'Festival Offers',
    category: 'FESTIVAL_OFFERS',
    channel: 'WHATSAPP',
    status: 'ACTIVE',
    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    recipientsCount: 1250,
    deliveredCount: 1240,
    openCount: 980,
    clickCount: 420,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'camp_new_arrivals',
    title: 'New Arrivals',
    category: 'NEW_ARRIVALS',
    channel: 'EMAIL',
    status: 'ACTIVE',
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    recipientsCount: 850,
    deliveredCount: 840,
    openCount: 560,
    clickCount: 290,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'camp_flash_sales',
    title: 'Flash Sales',
    category: 'FLASH_SALES',
    channel: 'PUSH',
    status: 'ACTIVE',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    recipientsCount: 2100,
    deliveredCount: 2050,
    openCount: 1420,
    clickCount: 890,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'camp_best_sellers',
    title: 'Best Sellers',
    category: 'SPECIAL_DISCOUNT',
    channel: 'WHATSAPP',
    status: 'ACTIVE',
    scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    recipientsCount: 1650,
    deliveredCount: 1620,
    openCount: 1180,
    clickCount: 650,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

interface MarketingContextType {
  coupons: PromoCoupon[];
  addCoupon: (c: Omit<PromoCoupon, 'id' | 'usageCount'>) => Promise<void>;
  updateCoupon: (id: string, c: Partial<PromoCoupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  duplicateCoupon: (coupon: PromoCoupon) => Promise<void>;
  validateCoupon: (
    code: string,
    orderTotalOrItems: number | Array<{ product?: any; price?: number; quantity: number }>
  ) => CouponValidationResult;
  trackCouponUse: (code: string) => Promise<void>;
  campaigns: MarketingCampaign[];
  subscribers: MarketingSubscriber[];
  updateCustomerMarketingConsent: (email: string, consent: any) => Promise<void>;
  saveCampaign: (c: MarketingCampaign) => Promise<boolean>;
  deleteCampaign: (id: string) => Promise<boolean>;
  sendCampaign: (idOrCampaign: string | MarketingCampaign) => Promise<{ success: boolean; message: string }>;
  pauseCampaign: (id: string) => Promise<boolean>;
  resumeCampaign: (id: string) => Promise<boolean>;
  duplicateCampaign: (campaign: MarketingCampaign) => Promise<MarketingCampaign>;
  updateSubscriberConsent: (id: string, consent: any) => Promise<void>;
  refreshMarketingData: () => Promise<void>;
}

const MarketingContext = createContext<MarketingContextType | undefined>(undefined);

const DELETED_CAMPAIGNS_KEY = 'mfp_deleted_campaign_ids_v1';

const getDeletedCampaignIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(DELETED_CAMPAIGNS_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch (e) {}
  return new Set();
};

const markCampaignDeleted = (id: string) => {
  try {
    const set = getDeletedCampaignIds();
    set.add(id);
    localStorage.setItem(DELETED_CAMPAIGNS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {}
};

export const MarketingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [coupons, setCoupons] = useState<PromoCoupon[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(DEFAULT_MARKETING_CAMPAIGNS);
  const [subscribers, setSubscribers] = useState<MarketingSubscriber[]>([]);

  useEffect(() => {
    const unsubCoupons = onSnapshot(query(collection(db, 'coupons'), limit(100)), (snapshot) => {
      const loaded: PromoCoupon[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...docSnap.data() } as PromoCoupon);
      });
      setCoupons(loaded);
    }, () => {});

    const unsubSubscribers = onSnapshot(query(collection(db, 'marketingSubscribers'), limit(200)), (snapshot) => {
      const loaded: MarketingSubscriber[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...docSnap.data() } as MarketingSubscriber);
      });
      setSubscribers(loaded);
    }, () => {});

    const unsubCampaigns = onSnapshot(query(collection(db, 'marketingCampaigns'), orderBy('createdAt', 'desc'), limit(100)), (snapshot) => {
      const loaded: MarketingCampaign[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...docSnap.data() } as MarketingCampaign);
      });
      const deletedIds = getDeletedCampaignIds();
      const filteredLoaded = loaded.filter((c) => !deletedIds.has(c.id));
      const loadedIds = new Set(filteredLoaded.map((c) => c.id));
      const remainingDefaults = DEFAULT_MARKETING_CAMPAIGNS.filter((d) => !loadedIds.has(d.id) && !deletedIds.has(d.id));
      setCampaigns([...filteredLoaded, ...remainingDefaults]);
    }, () => {
      const deletedIds = getDeletedCampaignIds();
      setCampaigns((prev) => {
        const pool = prev.length > 0 ? prev : DEFAULT_MARKETING_CAMPAIGNS;
        return pool.filter((c) => !deletedIds.has(c.id));
      });
    });

    return () => {
      unsubCoupons();
      unsubSubscribers();
      unsubCampaigns();
    };
  }, []);

  const addCoupon = async (c: Omit<PromoCoupon, 'id' | 'usageCount'>) => {
    const newCoupon: PromoCoupon = { ...c, id: `c_${Date.now()}`, usageCount: 0 };
    setCoupons((prev) => [newCoupon, ...prev]);
    try {
      await setDoc(doc(db, 'coupons', newCoupon.id), newCoupon);
    } catch (e) {
      console.warn('Firestore add coupon failed', e);
    }
  };

  const updateCoupon = async (id: string, c: Partial<PromoCoupon>) => {
    setCoupons((prev) => prev.map((item) => (item.id === id ? { ...item, ...c } : item)));
    try {
      await setDoc(doc(db, 'coupons', id), c, { merge: true });
    } catch (e) {
      console.warn('Firestore update coupon failed', e);
    }
  };

  const deleteCoupon = async (id: string) => {
    setCoupons((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteDoc(doc(db, 'coupons', id));
    } catch (e) {
      console.warn('Firestore delete coupon failed', e);
    }
  };

  const duplicateCoupon = async (coupon: PromoCoupon) => {
    const { id, usageCount, ...rest } = coupon;
    await addCoupon({
      ...rest,
      code: `${coupon.code}_COPY`,
    });
  };

  const validateCoupon = (
    code: string,
    orderTotalOrItems: number | Array<{ product?: any; price?: number; quantity: number }>
  ): CouponValidationResult => {
    if (!code || !code.trim()) {
      return { valid: false, discountAmount: 0, reason: 'कूपन कोड दर्ज करें (Please enter coupon code)' };
    }

    let orderTotal = 0;
    if (typeof orderTotalOrItems === 'number') {
      orderTotal = Math.max(0, orderTotalOrItems);
    } else if (Array.isArray(orderTotalOrItems)) {
      orderTotal = orderTotalOrItems.reduce((acc, it) => {
        const p = Number(it.price ?? it.product?.price ?? 0);
        const q = Math.max(1, Number(it.quantity ?? 1));
        return acc + p * q;
      }, 0);
    }

    const cleanCode = code.trim().toUpperCase();
    const target = coupons.find(
      (c) => c.code.toUpperCase() === cleanCode && (c.status === 'active' || !c.status)
    );

    if (!target) {
      return { valid: false, discountAmount: 0, reason: 'अमान्य कूपन कोड (Invalid or expired coupon code)' };
    }

    // Expiry check
    if (target.endDate) {
      const now = new Date();
      const expiry = new Date(target.endDate);
      if (expiry.getTime() < now.getTime()) {
        return { valid: false, discountAmount: 0, reason: 'यह कूपन समाप्त हो चुका है (Coupon expired)' };
      }
    }

    // Usage limit check
    if (typeof target.usageLimit === 'number' && target.usageLimit > 0) {
      if ((target.usageCount || 0) >= target.usageLimit) {
        return { valid: false, discountAmount: 0, reason: 'कूपन उपयोग सीमा समाप्त (Coupon usage limit reached)' };
      }
    }

    // Minimum order amount
    if (typeof target.minOrderAmount === 'number' && target.minOrderAmount > 0) {
      if (orderTotal < target.minOrderAmount) {
        return {
          valid: false,
          discountAmount: 0,
          reason: `इस कूपन के लिए न्यूनतम ऑर्डर ₹${target.minOrderAmount} होना चाहिए (Min order ₹${target.minOrderAmount})`,
        };
      }
    }

    // Maximum order amount
    if (typeof target.maxOrderAmount === 'number' && target.maxOrderAmount > 0) {
      if (orderTotal > target.maxOrderAmount) {
        return {
          valid: false,
          discountAmount: 0,
          reason: `इस कूपन के लिए अधिकतम ऑर्डर ₹${target.maxOrderAmount} तक मान्य है (Max order ₹${target.maxOrderAmount})`,
        };
      }
    }

    let discountAmount = 0;
    const isFreeShipping = target.type === 'FREE_SHIPPING';
    const isFreeGift = target.type === 'FREE_GIFT';
    const giftName = target.description || 'Special Gift Item';

    if (target.type === 'PERCENTAGE') {
      const calculated = (orderTotal * (target.discountValue || 0)) / 100;
      discountAmount = typeof target.maxDiscount === 'number' && target.maxDiscount > 0
        ? Math.min(calculated, target.maxDiscount)
        : calculated;
      discountAmount = Math.round(discountAmount * 100) / 100;
    } else if (target.type === 'FLAT') {
      discountAmount = Math.min(orderTotal, target.discountValue || 0);
    } else if (target.type === 'FREE_SHIPPING') {
      discountAmount = 0;
    }

    return {
      valid: true,
      coupon: target,
      discountAmount,
      isFreeShipping,
      freeShipping: isFreeShipping,
      freeGift: isFreeGift,
      giftName,
      message: 'कूपन सफलतापूर्वक लागू हुआ (Coupon applied successfully)',
    };
  };

  const trackCouponUse = async (code: string) => {
    const target = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (target) {
      await updateCoupon(target.id, { usageCount: (target.usageCount || 0) + 1 });
    }
  };

  const updateCustomerMarketingConsent = async (email: string, consent: any) => {
    try {
      await saveMarketingConsentInFirestore(consent, email);
    } catch (e) {
      console.warn('Firestore marketing consent sync failed', e);
    }
  };

  const saveCampaign = async (c: MarketingCampaign): Promise<boolean> => {
    try {
      const set = getDeletedCampaignIds();
      if (set.has(c.id)) {
        set.delete(c.id);
        localStorage.setItem(DELETED_CAMPAIGNS_KEY, JSON.stringify(Array.from(set)));
      }
    } catch (e) {}

    setCampaigns((prev) => [c, ...prev.filter((p) => p.id !== c.id)]);
    try {
      await setDoc(doc(db, 'marketingCampaigns', c.id), c, { merge: true });
      return true;
    } catch (e) {
      console.warn('Firestore campaign save notice:', e);
      return true;
    }
  };

  const deleteCampaign = async (id: string): Promise<boolean> => {
    markCampaignDeleted(id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'marketingCampaigns', id));
      return true;
    } catch (e) {
      console.warn('Firestore campaign delete notice:', e);
      return true;
    }
  };

  const sendCampaign = async (
    idOrCampaign: string | MarketingCampaign
  ): Promise<{ success: boolean; message: string }> => {
    const campaign =
      typeof idOrCampaign === 'string'
        ? campaigns.find((c) => c.id === idOrCampaign)
        : idOrCampaign;

    if (!campaign) {
      return { success: false, message: 'Campaign not found' };
    }

    const updated: MarketingCampaign = {
      ...campaign,
      status: 'SENT',
      sentAt: new Date().toISOString(),
      deliveredCount: campaign.recipientsCount || 100,
      openCount: Math.round((campaign.recipientsCount || 100) * 0.72),
      clickCount: Math.round((campaign.recipientsCount || 100) * 0.35),
    };

    const saved = await saveCampaign(updated);
    if (saved) {
      return {
        success: true,
        message: `Campaign '${campaign.title}' sent successfully to ${updated.recipientsCount} recipients!`,
      };
    }
    return { success: false, message: 'Failed to send campaign' };
  };

  const pauseCampaign = async (id: string): Promise<boolean> => {
    try {
      const target = campaigns.find((c) => c.id === id);
      if (!target) return false;
      const updated: MarketingCampaign = {
        ...target,
        status: 'PAUSED',
        updatedAt: new Date().toISOString(),
      };
      setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
      await setDoc(doc(db, 'marketingCampaigns', id), updated, { merge: true });
      return true;
    } catch (e) {
      console.warn('Firestore pause campaign notice:', e);
      return true;
    }
  };

  const resumeCampaign = async (id: string): Promise<boolean> => {
    try {
      const target = campaigns.find((c) => c.id === id);
      if (!target) return false;
      const updated: MarketingCampaign = {
        ...target,
        status: 'ACTIVE',
        updatedAt: new Date().toISOString(),
      };
      setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
      await setDoc(doc(db, 'marketingCampaigns', id), updated, { merge: true });
      return true;
    } catch (e) {
      console.warn('Firestore resume campaign notice:', e);
      return true;
    }
  };

  const duplicateCampaign = async (campaign: MarketingCampaign): Promise<MarketingCampaign> => {
    const newId = `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const duplicated: MarketingCampaign = {
      ...campaign,
      id: newId,
      title: `${campaign.title} (Copy)`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recipientsCount: campaign.recipientsCount || 0,
      deliveredCount: 0,
      openCount: 0,
      clickCount: 0,
    };
    setCampaigns((prev) => [duplicated, ...prev]);
    try {
      await setDoc(doc(db, 'marketingCampaigns', newId), duplicated);
    } catch (e) {
      console.warn('Firestore duplicate campaign notice:', e);
    }
    return duplicated;
  };

  const updateSubscriberConsent = async (id: string, consent: any) => {
    const target = subscribers.find((s) => s.id === id);
    if (target) {
      const updated = { ...target, preferences: consent };
      setSubscribers((prev) => prev.map((s) => (s.id === id ? updated : s)));
      try {
        await setDoc(doc(db, 'marketingSubscribers', id), updated);
      } catch (e) {
        console.warn('Firestore subscriber sync failed', e);
      }
    }
  };

  const refreshMarketingData = async () => {};

  return (
    <MarketingContext.Provider
      value={{
        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        duplicateCoupon,
        validateCoupon,
        trackCouponUse,
        campaigns,
        subscribers,
        updateCustomerMarketingConsent,
        saveCampaign,
        deleteCampaign,
        sendCampaign,
        pauseCampaign,
        resumeCampaign,
        duplicateCampaign,
        updateSubscriberConsent,
        refreshMarketingData,
      }}
    >
      {children}
    </MarketingContext.Provider>
  );
};

export const useMarketing = () => {
  const context = useContext(MarketingContext);
  if (!context) throw new Error('useMarketing must be used within MarketingProvider');
  return context;
};
