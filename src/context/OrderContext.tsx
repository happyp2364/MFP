import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomerOrder, OrderStatus, PaymentMethodType, PaymentStatus, CartItem, ShippingAddressInfo, PaymentSettings } from '../types';
import { saveOrderInFirestore, updateOrderStatusInFirestore, db } from '../lib/firebase';
import { calculateOrderTax } from '../utils/taxUtils';
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
      const taxResult = calculateOrderTax(
        items.map(i => ({ product: i.product, quantity: i.quantity })),
        discountAmount,
        details.shippingFee,
        paymentSettings
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
        transactionId: details.targetRef || `tx_${Date.now()}`,
        paymentReference: details.targetRef,
        paymentTimestamp: new Date().toISOString(),
        couponCode,
        gstEnabled: taxResult.gstEnabled,
        gstRate: taxResult.gstRate,
        priceIncludesGst: taxResult.priceIncludesGst,
        taxMode: taxResult.taxMode,
      };

      setOrders((prev) => [newOrder, ...prev]);
      await saveOrderInFirestore(newOrder);
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

  return (
    <OrderContext.Provider
      value={{
        orders,
        placeOrderAndPay,
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
