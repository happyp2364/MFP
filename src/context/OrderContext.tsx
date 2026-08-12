import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomerOrder, OrderStatus, PaymentMethodType, PaymentStatus, CartItem, ShippingAddressInfo } from '../types';
import { saveOrderInFirestore, updateOrderStatusInFirestore, db } from '../lib/firebase';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { onTenantCollectionSnapshot } from '../lib/onSnapshotMultiTenant';
import { getCurrentTenantId, filterDocsByTenant } from '../lib/tenantIsolation';

interface OrderContextType {
  orders: CustomerOrder[];
  placeOrderAndPay: (
    items: CartItem[],
    subtotal: number,
    shippingFee: number,
    discountAmount: number,
    paymentMethod: PaymentMethodType,
    customerDetails: { name: string; email: string; phone: string; address: string; city: string; state: string; pincode: string },
    notes?: string
  ) => Promise<CustomerOrder>;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, courierName?: string) => Promise<void>;
  cancelCustomerOrder: (orderId: string, reason: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTenant, setActiveTenant] = useState(getCurrentTenantId());
  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  useEffect(() => {
    const handleTenantChange = () => {
      setActiveTenant(getCurrentTenantId());
    };
    window.addEventListener('tenantChanged', handleTenantChange);
    window.addEventListener('storage', handleTenantChange);
    return () => {
      window.removeEventListener('tenantChanged', handleTenantChange);
      window.removeEventListener('storage', handleTenantChange);
    };
  }, []);

  useEffect(() => {
    setOrders([]);

    const unsub = onTenantCollectionSnapshot(
      db,
      'orders',
      [orderBy('createdAt', 'desc'), limit(500)],
      (snapshot) => {
        const loaded: CustomerOrder[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...(docSnap.data() as any) } as CustomerOrder);
        });
        setOrders(loaded);
      },
      (err) => {
        console.warn('Orders listener notice:', err);
      }
    );

    return () => unsub();
  }, [activeTenant]);

  const placeOrderAndPay = async (
    items: CartItem[],
    subtotal: number,
    shippingFee: number,
    discountAmount: number,
    paymentMethod: PaymentMethodType,
    customerDetails: { name: string; email: string; phone: string; address: string; city: string; state: string; pincode: string },
    notes?: string
  ): Promise<CustomerOrder> => {
    const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);
    const orderNumber = Date.now();
    const shippingAddress: ShippingAddressInfo = {
      name: customerDetails.name,
      street: customerDetails.address,
      city: customerDetails.city,
      state: customerDetails.state,
      pincode: customerDetails.pincode,
      phone: customerDetails.phone,
      email: customerDetails.email,
    };

    const newOrder: CustomerOrder = {
      id: `ord_${orderNumber}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items,
      subtotal,
      shippingFee,
      discountAmount,
      taxAmount: 0,
      totalAmount,
      paymentMethod,
      paymentStatus: (paymentMethod === 'COD' ? 'PENDING' : 'PAID') as PaymentStatus,
      orderStatus: 'PENDING' as OrderStatus,
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      customerPhone: customerDetails.phone,
      shippingAddress,
      transactionId: `tx_${Date.now()}`,
      paymentTimestamp: new Date().toISOString(),
      customerNotes: notes,
    };

    setOrders((prev) => [newOrder, ...prev]);
    try {
      await saveOrderInFirestore(newOrder);
    } catch (e) {
      console.warn('Firestore save order failed', e);
    }
    return newOrder;
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
