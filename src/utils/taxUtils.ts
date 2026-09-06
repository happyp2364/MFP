import { PaymentSettings, Product } from '../types';

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
  grandTotal: number;
  gstEnabled: boolean;
  gstRate: number;
  priceIncludesGst: boolean;
  taxMode: 'CGST_SGST' | 'IGST';
}

export function calculateOrderTax(
  items: OrderItemForTax[],
  discountAmount: number = 0,
  deliveryCharge: number = 0,
  paymentSettings?: PaymentSettings | null
): TaxCalculationResult {
  const gstEnabled = Boolean(paymentSettings?.gstEnabled);
  const defaultRate = paymentSettings?.defaultGstRate ?? 18;
  const taxMode = paymentSettings?.taxMode ?? 'CGST_SGST';
  const freeThreshold = paymentSettings?.freeShippingMinAmount ?? 999;

  let rawSubtotal = 0;
  for (const item of items) {
    const unitPrice = item.product.price || 0;
    const qty = Math.max(1, item.quantity || 1);
    rawSubtotal += unitPrice * qty;
  }

  const discount = Math.max(0, Math.min(discountAmount, rawSubtotal));

  // Determine actual delivery charge respecting the free delivery threshold
  let effectiveDelivery = Math.max(0, deliveryCharge);
  if (rawSubtotal >= freeThreshold) {
    effectiveDelivery = 0;
  }

  // Customer-facing grand total is GST-INCLUSIVE:
  // Subtotal - Discount + Delivery (Zero additional tax added)
  const grandTotal = Math.max(0, Math.round((rawSubtotal - discount + effectiveDelivery) * 100) / 100);

  // Business / Invoice calculation (GST extracted from inclusive total for legal invoicing)
  const netDiscountedSubtotal = Math.max(0, rawSubtotal - discount);
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
    grandTotal,
    gstEnabled,
    gstRate: defaultRate,
    priceIncludesGst: true,
    taxMode,
  };
}
