import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomerOrder, OrderStatus, PaymentMethodType, PaymentStatus, CartItem, ShippingAddressInfo, PaymentSettings } from '../types';
import { saveOrderInFirestore, updateOrderStatusInFirestore, fetchOrderByIdFromFirestore, updateOrderPaymentSuccess, db, auth } from '../lib/firebase';
import { calculateOrderTax } from '../utils/taxUtils';
import { generateWhatsAppOrderUrlWithPaymentLink, formatWhatsAppOrderMessageWithPaymentLink } from '../utils/whatsapp';
import { getProductPrice } from '../utils/variantUtils';
import { isValidCustomerValue } from '../utils/productUtils';
import { getPublicOrderPaymentUrl } from '../utils/siteUrl';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';

interface OrderContextType {
  orders: CustomerOrder[];
  placeOrderAndPay: (
    items: CartItem[],
    shippingInfo: ShippingAddressInfo,
    paymentMethod: PaymentMethodType,
    details: {
      targetRef?: string;
      subtotal: number;
      shippingFee: number;
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
      cardNumber?: string;
      cardExpiry?: string;
      cardCvv?: string;
      cardName?: string;
      selectedBank?: string;
      selectedWallet?: string;
    },
    couponCode?: string,
    discountAmount?: number,
    paymentSettings?: PaymentSettings | null
  ) => Promise<{ success: boolean; orderId?: string; message?: string }>;
  createWhatsAppOrder: (
    items: CartItem[],
    couponCode?: string,
    discountAmount?: number,
    customerInfo?: { name?: string; phone?: string; email?: string },
    shippingAddress?: Partial<ShippingAddressInfo>,
    shippingFeeOverride?: number
  ) => Promise<{
    success: boolean;
    order?: CustomerOrder;
    orderId?: string;
    paymentUrl?: string;
    whatsappUrl?: string;
    message?: string;
  }>;
  markOrderAsPaid: (
    orderId: string,
    paymentData: {
      razorpayPaymentId: string;
      razorpayOrderId: string;
      razorpaySignature?: string;
    }
  ) => Promise<boolean>;
  getOrderById: (orderId: string) => Promise<CustomerOrder | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, courierName?: string) => Promise<void>;
  cancelCustomerOrder: (orderId: string, reason: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(500));
    const unsub = onSnapshot(q, (snapshot) => {
      const loaded: CustomerOrder[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...docSnap.data() } as CustomerOrder);
      });
      setOrders(loaded);
    }, () => {});

    return () => unsub();
  }, []);

  const placeOrderAndPay = async (
    items: CartItem[],
    shippingInfo: ShippingAddressInfo,
    paymentMethod: PaymentMethodType,
    details: {
      targetRef?: string;
      subtotal: number;
      shippingFee: number;
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
      cardNumber?: string;
      cardExpiry?: string;
      cardCvv?: string;
      cardName?: string;
      selectedBank?: string;
      selectedWallet?: string;
    },
    couponCode?: string,
    discountAmount: number = 0,
    paymentSettings?: PaymentSettings | null
  ): Promise<{ success: boolean; orderId?: string; message?: string }> => {
    try {
      // Idempotency: Prevent duplicate orders from same Razorpay payment
      if (details.razorpayPaymentId) {
        const existingOrder = orders.find(
          (o) => o.razorpayPaymentId === details.razorpayPaymentId || o.transactionId === details.razorpayPaymentId
        );
        if (existingOrder) {
          console.warn('[Duplicate Order Guard] Order already recorded for Razorpay payment:', details.razorpayPaymentId);
          return { success: true, orderId: existingOrder.id };
        }
      }

      const taxResult = calculateOrderTax(
        items.map(i => ({ product: i.product, quantity: i.quantity })),
        discountAmount,
        details.shippingFee,
        paymentSettings,
        paymentMethod
      );

      const orderNumber = Date.now();
      const orderId = `ord_${orderNumber}`;

      const paymentStatus = paymentMethod === 'COD' ? 'PENDING' : 'PAID';
      const paymentVerificationStatus = paymentMethod === 'COD' ? 'not_required' : (paymentMethod === 'UPI' ? 'pending' : 'verified');

      const newOrder: CustomerOrder = {
        id: orderId,
        orderNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items,
        subtotal: taxResult.subtotal,
        shippingFee: taxResult.deliveryCharge,
        discountAmount: taxResult.discount,
        convenienceFee: taxResult.convenienceFee ?? 0,
        taxAmount: taxResult.totalTax,
        taxableAmount: taxResult.taxableAmount,
        cgstAmount: taxResult.cgstAmount,
        sgstAmount: taxResult.sgstAmount,
        igstAmount: taxResult.igstAmount,
        totalAmount: taxResult.grandTotal,
        paymentMethod,
        paymentStatus: paymentStatus as PaymentStatus,
        paymentVerificationStatus: paymentVerificationStatus as any,
        orderStatus: 'PENDING' as OrderStatus,
        customerName: shippingInfo.name,
        customerEmail: shippingInfo.email,
        customerPhone: shippingInfo.phone,
        shippingAddress: shippingInfo,
        transactionId: details.razorpayPaymentId || details.targetRef || `tx_${Date.now()}`,
        paymentReference: details.razorpayPaymentId || details.targetRef,
        razorpayOrderId: details.razorpayOrderId,
        razorpayPaymentId: details.razorpayPaymentId,
        razorpaySignature: details.razorpaySignature,
        paymentTimestamp: new Date().toISOString(),
        couponCode,
        gstEnabled: taxResult.gstEnabled,
        gstRate: taxResult.gstRate,
        priceIncludesGst: taxResult.priceIncludesGst,
        taxMode: taxResult.taxMode,
      };

      setOrders((prev) => [newOrder, ...prev]);
      const saved = await saveOrderInFirestore(newOrder);
      if (!saved) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        return {
          success: false,
          message: 'Unable to record order in database. Please check your internet connection and try again.',
        };
      }
      return { success: true, orderId };
    } catch (err: any) {
      console.error('placeOrderAndPay error:', err);
      return { success: false, message: err?.message || 'Payment verification failed. Please verify your details.' };
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
    courierName?: string
  ) => {
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            orderStatus: status,
            trackingNumber: trackingNumber || (o as any).trackingNumber,
            courierName: courierName || (o as any).courierName,
            updatedAt: new Date().toISOString(),
          }
        : o
    );
    setOrders(updated);
    try {
      await updateOrderStatusInFirestore(orderId, status, trackingNumber, courierName);
    } catch (e) {
      console.warn('Firestore order status update failed', e);
    }
  };

  const cancelCustomerOrder = async (orderId: string, reason: string) => {
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            orderStatus: 'CANCELLED' as OrderStatus,
            cancellationReason: reason,
            updatedAt: new Date().toISOString(),
          }
        : o
    );
    setOrders(updated);
    try {
      await updateOrderStatusInFirestore(orderId, 'CANCELLED');
    } catch (e) {
      console.warn('Firestore cancel order failed', e);
    }
  };

  const createWhatsAppOrder = async (
    items: CartItem[],
    couponCode?: string,
    discountAmount?: number,
    customerInfo?: { name?: string; phone?: string; email?: string },
    shippingAddress?: Partial<ShippingAddressInfo>,
    shippingFeeOverride?: number
  ) => {
    try {
      if (!items || items.length === 0) {
        return { success: false, message: 'Cart items are empty' };
      }

      // 1. Authoritative Pricing Calculation
      const subtotal = items.reduce((acc, item) => {
        const itemPrice = getProductPrice(item.product, item.selectedSize, item.selectedColor);
        return acc + itemPrice * (item.quantity || 1);
      }, 0);

      const defaultShipping = subtotal >= 999 ? 0 : 0;
      const shippingFee = shippingFeeOverride !== undefined ? Math.max(0, shippingFeeOverride) : defaultShipping;
      const validatedDiscount = Math.max(0, Math.min(Number(discountAmount) || 0, subtotal));
      const totalAmount = Math.max(0, subtotal - validatedDiscount + shippingFee);

      // 2. Generate Unique Order ID (Format: MFP-1025)
      let randomNum = Math.floor(1000 + Math.random() * 9000);
      let orderId = `MFP-${randomNum}`;
      while (orders.some((o) => o.id === orderId)) {
        randomNum = Math.floor(1000 + Math.random() * 9000);
        orderId = `MFP-${randomNum}`;
      }

      // 3. Dynamic Website Origin & Payment Link
      const cleanOrderId = orderId.replace(/^#/, '');
      const paymentUrl = getPublicOrderPaymentUrl(cleanOrderId);

      const now = new Date().toISOString();

      // Extract real user details if logged in
      const currentAuthUser = auth.currentUser;
      const resolvedName = (customerInfo?.name && isValidCustomerValue(customerInfo.name))
        ? customerInfo.name.trim()
        : (currentAuthUser?.displayName && isValidCustomerValue(currentAuthUser.displayName))
        ? currentAuthUser.displayName.trim()
        : '';

      const resolvedPhone = (customerInfo?.phone && isValidCustomerValue(customerInfo.phone))
        ? customerInfo.phone.trim()
        : (currentAuthUser?.phoneNumber && isValidCustomerValue(currentAuthUser.phoneNumber))
        ? currentAuthUser.phoneNumber.trim()
        : '';

      const resolvedEmail = (customerInfo?.email && isValidCustomerValue(customerInfo.email))
        ? customerInfo.email.trim()
        : (currentAuthUser?.email && isValidCustomerValue(currentAuthUser.email))
        ? currentAuthUser.email.trim()
        : '';

      const resolvedStreet = (shippingAddress?.street && isValidCustomerValue(shippingAddress.street))
        ? shippingAddress.street.trim()
        : '';

      const resolvedCity = (shippingAddress?.city && isValidCustomerValue(shippingAddress.city))
        ? shippingAddress.city.trim()
        : '';

      const resolvedState = (shippingAddress?.state && isValidCustomerValue(shippingAddress.state))
        ? shippingAddress.state.trim()
        : '';

      const resolvedPincode = (shippingAddress?.pincode && isValidCustomerValue(shippingAddress.pincode))
        ? shippingAddress.pincode.trim()
        : '';

      const newOrder: CustomerOrder = {
        id: orderId,
        orderNumber: randomNum,
        customerName: resolvedName,
        customerPhone: resolvedPhone,
        customerEmail: resolvedEmail,
        shippingAddress: {
          name: resolvedName || shippingAddress?.name || '',
          street: resolvedStreet,
          city: resolvedCity,
          state: resolvedState || 'Rajasthan',
          pincode: resolvedPincode,
          phone: resolvedPhone || shippingAddress?.phone || '',
          email: resolvedEmail || shippingAddress?.email || '',
        },
        items,
        subtotal,
        shippingFee,
        discountAmount: validatedDiscount,
        convenienceFee: 0,
        taxAmount: 0,
        totalAmount,
        paymentMethod: 'WHATSAPP',
        paymentStatus: 'PENDING',
        paymentVerificationStatus: 'pending',
        orderStatus: 'PENDING',
        transactionId: `wa_${Date.now()}`,
        paymentTimestamp: now,
        couponCode: couponCode || undefined,
        source: 'WHATSAPP',
        paymentLink: paymentUrl,
        createdAt: now,
        updatedAt: now,
        statusHistory: [
          {
            status: 'PENDING',
            timestamp: now,
            note: `Order initiated via WhatsApp with payment link: ${paymentUrl}`,
          },
        ],
      };

      // 4. Save to Firestore
      await saveOrderInFirestore(newOrder);

      // 5. Update Local State
      setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== orderId)]);

      // 6. Generate Direct WhatsApp Message Link
      const whatsappUrl = generateWhatsAppOrderUrlWithPaymentLink(newOrder, paymentUrl);

      return {
        success: true,
        order: newOrder,
        orderId,
        paymentUrl,
        whatsappUrl,
      };
    } catch (err: any) {
      console.error('[createWhatsAppOrder error]:', err);
      return {
        success: false,
        message: err.message || 'Failed to create WhatsApp order',
      };
    }
  };

  const markOrderAsPaid = async (
    orderId: string,
    paymentData: {
      razorpayPaymentId: string;
      razorpayOrderId: string;
      razorpaySignature?: string;
    }
  ): Promise<boolean> => {
    try {
      const ok = await updateOrderPaymentSuccess(orderId, paymentData);
      if (ok) {
        setOrders((prev) =>
          prev.map((o) => {
            if (
              o.id === orderId ||
              o.id === `#${orderId}` ||
              o.id.replace('#', '') === orderId.replace('#', '')
            ) {
              return {
                ...o,
                paymentStatus: 'PAID',
                paymentVerificationStatus: 'verified',
                orderStatus: 'PENDING',
                razorpayPaymentId: paymentData.razorpayPaymentId,
                razorpayOrderId: paymentData.razorpayOrderId,
                razorpaySignature: paymentData.razorpaySignature || '',
                transactionId: paymentData.razorpayPaymentId,
                paymentVerifiedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
            }
            return o;
          })
        );
      }
      return ok;
    } catch (err) {
      console.error('[markOrderAsPaid error]:', err);
      return false;
    }
  };

  const getOrderById = async (orderId: string): Promise<CustomerOrder | null> => {
    if (!orderId) return null;
    const cleanId = orderId.trim();

    // 1. Check local in-memory context first
    const local = orders.find(
      (o) =>
        o.id.toLowerCase() === cleanId.toLowerCase() ||
        o.id.replace('#', '').toLowerCase() === cleanId.replace('#', '').toLowerCase() ||
        String(o.orderNumber) === cleanId.replace(/\D/g, '')
    );
    if (local) return local;

    // 2. Fetch from authoritative Firestore database
    return await fetchOrderByIdFromFirestore(cleanId);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        placeOrderAndPay,
        createWhatsAppOrder,
        markOrderAsPaid,
        getOrderById,
        updateOrderStatus,
        cancelCustomerOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within OrderProvider');
  return context;
};
