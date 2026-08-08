import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PromoCoupon, MarketingCampaign, MarketingSubscriber } from '../types';
import { db, saveMarketingConsentInFirestore } from '../lib/firebase';
import { collection, limit, onSnapshot, orderBy, query, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { onTenantCollectionSnapshot } from '../lib/onSnapshotMultiTenant';
import { getTenantDocWriteRef } from '../lib/firestoreMultiTenant';

interface MarketingContextType {
  coupons: PromoCoupon[];
  addCoupon: (c: Omit<PromoCoupon, 'id' | 'usageCount'>) => Promise<void>;
  updateCoupon: (id: string, c: Partial<PromoCoupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  duplicateCoupon: (coupon: PromoCoupon) => Promise<void>;
  validateCoupon: (code: string, orderTotal: number) => { valid: boolean; coupon?: PromoCoupon; discountAmount: number; message: string };
  trackCouponUse: (code: string) => Promise<void>;
  campaigns: MarketingCampaign[];
  subscribers: MarketingSubscriber[];
  updateCustomerMarketingConsent: (email: string, consent: any) => Promise<void>;
  saveCampaign: (c: MarketingCampaign) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  sendCampaign: (id: string) => Promise<void>;
  updateSubscriberConsent: (id: string, consent: any) => Promise<void>;
  refreshMarketingData: () => Promise<void>;
}

const MarketingContext = createContext<MarketingContextType | undefined>(undefined);

export const MarketingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [coupons, setCoupons] = useState<PromoCoupon[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [subscribers, setSubscribers] = useState<MarketingSubscriber[]>([]);

  useEffect(() => {
    const unsubCoupons = onTenantCollectionSnapshot(db, 'coupons', [], (snapshot) => {
      const loaded: PromoCoupon[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...(docSnap.data() as any) } as PromoCoupon);
      });
      setCoupons(loaded);
    }, () => {});

    const unsubSubscribers = onTenantCollectionSnapshot(db, 'marketingSubscribers', [limit(200)], (snapshot) => {
      const loaded: MarketingSubscriber[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...(docSnap.data() as any) } as MarketingSubscriber);
      });
      setSubscribers(loaded);
    }, () => {});

    const unsubCampaigns = onTenantCollectionSnapshot(db, 'marketingCampaigns', [orderBy('createdAt', 'desc'), limit(100)], (snapshot) => {
      const loaded: MarketingCampaign[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...(docSnap.data() as any) } as MarketingCampaign);
      });
      setCampaigns(loaded);
    }, () => {});

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
      await setDoc(getTenantDocWriteRef(db, 'coupons', newCoupon.id), newCoupon);
    } catch (e) {
      console.warn('Firestore add coupon failed', e);
    }
  };

  const updateCoupon = async (id: string, c: Partial<PromoCoupon>) => {
    setCoupons((prev) => prev.map((item) => (item.id === id ? { ...item, ...c } : item)));
    try {
      await setDoc(getTenantDocWriteRef(db, 'coupons', id), c, { merge: true });
    } catch (e) {
      console.warn('Firestore update coupon failed', e);
    }
  };

  const deleteCoupon = async (id: string) => {
    setCoupons((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteDoc(getTenantDocWriteRef(db, 'coupons', id));
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

  const validateCoupon = (code: string, orderTotal: number) => {
    const target = coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.status === 'active'
    );
    if (!target) {
      return { valid: false, discountAmount: 0, message: 'Invalid or expired coupon code' };
    }
    if (target.minOrderAmount && orderTotal < target.minOrderAmount) {
      return { valid: false, discountAmount: 0, message: `Minimum order value for this coupon is ₹${target.minOrderAmount}` };
    }
    let discountAmount = 0;
    if (target.type === 'PERCENTAGE') {
      discountAmount = (orderTotal * target.discountValue) / 100;
      if (target.maxDiscount && discountAmount > target.maxDiscount) {
        discountAmount = target.maxDiscount;
      }
    } else {
      discountAmount = target.discountValue;
    }
    return { valid: true, coupon: target, discountAmount, message: 'Coupon applied successfully!' };
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

  const saveCampaign = async (c: MarketingCampaign) => {
    setCampaigns((prev) => [c, ...prev.filter((p) => p.id !== c.id)]);
    try {
      await setDoc(getTenantDocWriteRef(db, 'marketingCampaigns', c.id), c);
    } catch (e) {
      console.warn('Firestore campaign save failed', e);
    }
  };

  const deleteCampaign = async (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(getTenantDocWriteRef(db, 'marketingCampaigns', id));
    } catch (e) {
      console.warn('Firestore campaign delete failed', e);
    }
  };

  const sendCampaign = async (id: string) => {
    const target = campaigns.find((c) => c.id === id);
    if (target) {
      await saveCampaign({ ...target, status: 'SENT', sentAt: new Date().toISOString() });
    }
  };

  const updateSubscriberConsent = async (id: string, consent: any) => {
    const target = subscribers.find((s) => s.id === id);
    if (target) {
      const updated = { ...target, preferences: consent };
      setSubscribers((prev) => prev.map((s) => (s.id === id ? updated : s)));
      try {
        await setDoc(getTenantDocWriteRef(db, 'marketingSubscribers', id), updated);
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
