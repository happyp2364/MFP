import { PaymentMethodType, PaymentSettings, Product } from '../types';

export interface OrderItemForTax {
  product: Product;
  quantity: number;
}

export interface TaxCalculationResult {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  deliveryCharge: number;
  convenienceFee: number;
  grandTotal: number;
  gstEnabled: boolean;
  gstRate: number;
  priceIncludesGst: boolean;
  taxMode: 'CGST_SGST' | 'IGST';
}

/**
 * Authoritative Convenience Fee Calculation
 * Single source of truth across website checkout, payment links, WhatsApp orders, Razorpay, and admin views.
 *
 * Rules:
 * 1. If Convenience Fee is disabled in Admin: Fee is always ₹0.
 * 2. If Apply Fee ONLY to Online Payments is enabled:
 *    - Online Razorpay (UPI, Cards, Netbanking, Wallets): configured % (default 2%, max 10%)
 *    - COD: ₹0
 *    - Manual Bank Transfer / UPI / Scan QR: ₹0
 * 3. Base is net merchandise subtotal (subtotal - discount).
 * 4. Exact currency rounding to 2 decimal places to support precise paise calculation without floating-point error.
 */
export function calculateConvenienceFee(
  subtotal: number,
  discountAmount: number = 0,
  paymentMethod: PaymentMethodType | string = 'ONLINE_UPI',
  paymentSettings?: PaymentSettings | null
): {
  fee: number;
  rate: number;
  isEnabled: boolean;
  applied: boolean;
} {
  const isEnabled = paymentSettings?.enableConvenienceFee !== false;
  const rate = Math.min(10, Math.max(0, Number(paymentSettings?.convenienceFeePercent ?? 2)));
  const applyFeeToOnlineOnly = paymentSettings?.applyFeeToOnlineOnly !== false;

  if (!isEnabled || rate <= 0) {
    return { fee: 0, rate, isEnabled, applied: false };
  }

  // Cash on Delivery is always ₹0 convenience fee
  if (paymentMethod === 'COD') {
    return { fee: 0, rate, isEnabled, applied: false };
  }

  // Manual QR Scan / Bank Transfer / UPI transfer
  const isManualPayment =
    paymentMethod === 'QR_SCAN' ||
    paymentMethod === 'UPI' ||
    paymentMethod === 'MANUAL_QR' ||
    paymentMethod === 'BANK_TRANSFER';
  if (isManualPayment && applyFeeToOnlineOnly) {
    return { fee: 0, rate, isEnabled, applied: false };
  }

  // Check if it's an online payment
  const isOnline =
    paymentMethod === 'ONLINE_UPI' ||
    paymentMethod === 'CARD' ||
    paymentMethod === 'NET_BANKING' ||
    paymentMethod === 'NETBANKING' ||
    paymentMethod === 'WALLET' ||
    paymentMethod === 'RAZORPAY' ||
    paymentMethod === 'WHATSAPP' ||
    !isManualPayment;

  if (applyFeeToOnlineOnly && !isOnline) {
    return { fee: 0, rate, isEnabled, applied: false };
  }

  // Base for fee calculation is net merchandise value (subtotal after validated discount)
  const feeBase = Math.max(0, (subtotal || 0) - Math.max(0, discountAmount || 0));
  const rawFee = (feeBase * rate) / 100;
  // Precise 2-decimal rounding to avoid float inaccuracies and support exact paise
  const fee = Math.round(rawFee * 100) / 100;

  return {
    fee,
    rate,
    isEnabled: true,
    applied: fee > 0,
  };
}

export function calculateOrderTax(
  items: OrderItemForTax[],
  discountAmount: number = 0,
  deliveryCharge?: number,
  paymentSettings?: PaymentSettings | null,
  paymentMethod: PaymentMethodType | string = 'ONLINE_UPI',
  isExplicitFreeShipping: boolean = false
): TaxCalculationResult {
  const gstEnabled = Boolean(paymentSettings?.gstEnabled);
  const defaultRate = paymentSettings?.defaultGstRate ?? 18;
  const taxMode = paymentSettings?.taxMode ?? 'CGST_SGST';
  const freeThreshold = paymentSettings?.freeShippingMinAmount !== undefined ? paymentSettings.freeShippingMinAmount : 999;

  let rawSubtotal = 0;
  for (const item of items) {
    const unitPrice = item.product?.price || 0;
    const qty = Math.max(1, item.quantity || 1);
    rawSubtotal += unitPrice * qty;
  }

  const discount = Math.max(0, Math.min(discountAmount, rawSubtotal));
  const netDiscountedSubtotal = Math.max(0, rawSubtotal - discount);

  // Determine actual delivery charge respecting the free delivery threshold post-discount
  const isThresholdMet = freeThreshold > 0 && netDiscountedSubtotal >= freeThreshold;
  let effectiveDelivery = 0;

  if (isExplicitFreeShipping || isThresholdMet) {
    effectiveDelivery = 0;
  } else if (deliveryCharge !== undefined && Number(deliveryCharge) >= 0) {
    effectiveDelivery = Number(deliveryCharge);
  } else if (paymentSettings?.flatShippingRate !== undefined && Number(paymentSettings.flatShippingRate) >= 0) {
    effectiveDelivery = Number(paymentSettings.flatShippingRate);
  } else {
    effectiveDelivery = 80;
  }

  // Authoritative convenience fee calculation
  const { fee: convenienceFee } = calculateConvenienceFee(
    rawSubtotal,
    discount,
    paymentMethod,
    paymentSettings
  );

  // Customer-facing grand total is GST-INCLUSIVE:
  // Subtotal - Discount + Delivery + Convenience Fee (Zero additional hidden markup)
  const grandTotal = Math.max(
    0,
    Math.round((netDiscountedSubtotal + effectiveDelivery + convenienceFee) * 100) / 100
  );

  // Business / Invoice calculation (GST extracted from inclusive total for legal invoicing)
  const rateFraction = defaultRate / 100;
  const taxableAmount = Math.round((netDiscountedSubtotal / (1 + rateFraction)) * 100) / 100;
  const totalTax = Math.round((netDiscountedSubtotal - taxableAmount) * 100) / 100;

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (taxMode === 'CGST_SGST') {
    cgstAmount = Math.round((totalTax / 2) * 100) / 100;
    sgstAmount = Math.round((totalTax - cgstAmount) * 100) / 100;
  } else {
    igstAmount = totalTax;
  }

  return {
    subtotal: rawSubtotal,
    discount,
    taxableAmount: gstEnabled ? taxableAmount : netDiscountedSubtotal,
    cgstAmount: gstEnabled ? cgstAmount : 0,
    sgstAmount: gstEnabled ? sgstAmount : 0,
    igstAmount: gstEnabled ? igstAmount : 0,
    totalTax: gstEnabled ? totalTax : 0,
    deliveryCharge: effectiveDelivery,
    convenienceFee,
    grandTotal,
    gstEnabled,
    gstRate: defaultRate,
    priceIncludesGst: true,
    taxMode,
  };
}

/**
 * Authoritative summary calculation given fixed subtotal & discount
 */
export function calculateOrderPricing({
  subtotal,
  discountAmount = 0,
  shippingFee,
  freeShippingMinAmount = 999,
  isExplicitFreeShipping = false,
  paymentMethod = 'ONLINE_UPI',
  paymentSettings,
}: {
  subtotal: number;
  discountAmount?: number;
  shippingFee?: number;
  freeShippingMinAmount?: number;
  isExplicitFreeShipping?: boolean;
  paymentMethod?: PaymentMethodType | string;
  paymentSettings?: PaymentSettings | null;
}) {
  const freeThreshold = paymentSettings?.freeShippingMinAmount !== undefined ? paymentSettings.freeShippingMinAmount : (freeShippingMinAmount ?? 999);
  const validatedDiscount = Math.max(0, Math.min(discountAmount, subtotal));
  const netMerchandise = Math.max(0, subtotal - validatedDiscount);

  // Free delivery threshold is evaluated on post-discount net merchandise
  const isThresholdMet = freeThreshold > 0 && netMerchandise >= freeThreshold;

  let effectiveDelivery = 0;
  if (isExplicitFreeShipping || isThresholdMet) {
    effectiveDelivery = 0;
  } else if (shippingFee !== undefined && Number(shippingFee) >= 0) {
    effectiveDelivery = Number(shippingFee);
  } else if (paymentSettings?.flatShippingRate !== undefined && Number(paymentSettings.flatShippingRate) >= 0) {
    effectiveDelivery = Number(paymentSettings.flatShippingRate);
  } else {
    effectiveDelivery = 80;
  }

  const { fee: convenienceFee } = calculateConvenienceFee(
    subtotal,
    validatedDiscount,
    paymentMethod,
    paymentSettings
  );

  const totalAmount = Math.max(
    0,
    Math.round((netMerchandise + effectiveDelivery + convenienceFee) * 100) / 100
  );

  return {
    subtotal,
    discountAmount: validatedDiscount,
    netMerchandise,
    shippingFee: effectiveDelivery,
    convenienceFee,
    totalAmount,
    isFreeShipping: effectiveDelivery === 0,
    freeDeliveryReason: effectiveDelivery === 0 ? (isExplicitFreeShipping ? 'Coupon' : (isThresholdMet ? 'Threshold' : 'StoreConfig')) : null,
  };
}


