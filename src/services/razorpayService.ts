/**
 * Production-Ready Razorpay Payment Integration Service
 * Marudhar Fashion Point
 * 
 * Features:
 * - Dynamic asynchronous script loader for Razorpay Standard Checkout (v1)
 * - Server-authoritative Order Creation with Price Tamper Prevention
 * - Server-side Cryptographic HMAC SHA256 Signature Verification
 * - Live Mode & Secure Environment Variable resolution (Key Secret is never exposed)
 */

export interface RazorpayCreateOrderPayload {
  orderId?: string;
  amount?: number;
  items?: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    selectedSize?: string;
    selectedColor?: string;
  }>;
  shippingInfo?: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    street?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  couponCode?: string;
  discountAmount?: number;
  flatShippingRate?: number;
  freeShippingMinAmount?: number;
  paymentMethod?: string;
  enableConvenienceFee?: boolean;
  convenienceFeePercent?: number;
  convenienceFee?: number;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  success: boolean;
  orderId: string;
  amount: number; // in paise
  currency: string;
  keyId: string;
  calculatedAmount: number;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  receipt?: string;
  message?: string;
}

export interface RazorpayVerificationPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethod?: string;
  amount?: number;
}

export interface RazorpayVerificationResponse {
  success: boolean;
  verified: boolean;
  status: 'PAID' | 'FAILED';
  paymentId?: string;
  orderId?: string;
  amount?: number;
  verifiedAt?: string;
  message?: string;
}

/**
 * Dynamically loads the official Razorpay Standard Checkout SDK into the document head
 */
export async function loadRazorpaySDK(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.error('[Razorpay SDK] Failed to load official checkout.js script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Fetches safe public gateway configuration from the server
 */
export async function getRazorpayPublicConfig(): Promise<{ keyId: string; isConfigured: boolean; mode: string }> {
  try {
    const res = await fetch('/api/razorpay/config');
    if (res.ok) {
      const data = await res.json();
      return {
        keyId: data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        isConfigured: Boolean(data.isConfigured || import.meta.env.VITE_RAZORPAY_KEY_ID),
        mode: data.mode || 'LIVE',
      };
    }
  } catch (err) {
    console.warn('[getRazorpayPublicConfig fallback]:', err);
  }

  return {
    keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
    isConfigured: Boolean(import.meta.env.VITE_RAZORPAY_KEY_ID),
    mode: 'LIVE',
  };
}

/**
 * Creates an authoritative order on the server
 */
export async function createRazorpayServerOrder(payload: RazorpayCreateOrderPayload): Promise<RazorpayOrderResponse> {
  const response = await fetch('/api/razorpay/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create payment order on server.');
  }

  return data;
}

/**
 * Submits the payment response to the server for cryptographic signature verification
 */
export async function verifyRazorpayServerPayment(
  payload: RazorpayVerificationPayload
): Promise<RazorpayVerificationResponse> {
  const response = await fetch('/api/razorpay/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || !data.success || !data.verified) {
    throw new Error(data.message || 'Payment signature verification failed on server.');
  }

  return data;
}

/**
 * Opens Razorpay Standard Checkout popup
 */
export async function openRazorpayCheckoutModal({
  orderId,
  amountInPaise,
  keyId,
  customerName,
  customerEmail,
  customerPhone,
  themeColor = '#0B8F63',
  onSuccess,
  onFailure,
  onDismiss,
}: {
  orderId: string;
  amountInPaise: number;
  keyId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  themeColor?: string;
  onSuccess: (paymentData: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  onFailure: (error: any) => void;
  onDismiss?: () => void;
}): Promise<void> {
  const isLoaded = await loadRazorpaySDK();
  if (!isLoaded) {
    throw new Error('Could not load Razorpay payment gateway. Please check your internet connection.');
  }

  const effectiveKeyId = keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!effectiveKeyId) {
    throw new Error('Razorpay Key ID is not configured. Please contact store administrator.');
  }

  const options = {
    key: effectiveKeyId,
    amount: amountInPaise,
    currency: 'INR',
    name: 'Marudhar Fashion Point',
    description: 'Order Payment • Footwear & Apparel',
    image: '/assets/logo-marudhar.png',
    order_id: orderId,
    prefill: {
      name: customerName,
      email: customerEmail,
      contact: customerPhone,
    },
    theme: {
      color: themeColor,
    },
    modal: {
      ondismiss: () => {
        if (onDismiss) {
          onDismiss();
        }
      },
      escape: true,
      backdropclose: false,
    },
    handler: (response: any) => {
      if (response && response.razorpay_payment_id && response.razorpay_order_id && response.razorpay_signature) {
        onSuccess(response);
      } else {
        onFailure(new Error('Incomplete payment response received from Razorpay.'));
      }
    },
  };

  const razorpay = new (window as any).Razorpay(options);
  razorpay.on('payment.failed', (response: any) => {
    const errorDesc = response?.error?.description || response?.error?.reason || 'Payment was declined or cancelled.';
    onFailure(new Error(errorDesc));
  });

  razorpay.open();
}
