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
  const globalPriceIncludesGst = paymentSettings?.priceIncludesGst ?? true;
  const taxMode = paymentSettings?.taxMode ?? 'CGST_SGST';
  const allowProductLevel = Boolean(paymentSettings?.allowProductLevelGst);

  let rawSubtotal = 0;
  let totalTaxable = 0;
  let totalItemTax = 0;

  for (const item of items) {
    const unitPrice = item.product.price || 0;
    const qty = item.quantity || 1;
    const itemTotalRaw = unitPrice * qty;
    rawSubtotal += itemTotalRaw;

    if (!gstEnabled) {
      continue;
    }

    const useDefault = item.product.useDefaultGstRate !== false;
    const itemRate = (allowProductLevel && !useDefault && typeof item.product.gstRate === 'number')
      ? item.product.gstRate
      : defaultRate;

    const itemIncludesGst = (allowProductLevel && item.product.priceIncludesGst !== undefined)
      ? item.product.priceIncludesGst
      : globalPriceIncludesGst;

    let itemTaxable = 0;
    let itemTax = 0;

    if (itemIncludesGst) {
      itemTaxable = itemTotalRaw / (1 + itemRate / 100);
      itemTax = itemTotalRaw - itemTaxable;
    } else {
      itemTaxable = itemTotalRaw;
      itemTax = itemTotalRaw * (itemRate / 100);
    }

    totalTaxable += itemTaxable;
    totalItemTax += itemTax;
  }

  const discount = Math.max(0, discountAmount);
  const delivery = Math.max(0, deliveryCharge);

  if (!gstEnabled) {
    const grandTotal = Math.max(0, rawSubtotal - discount + delivery);
    return {
      subtotal: rawSubtotal,
      discount,
      taxableAmount: Math.max(0, rawSubtotal - discount),
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalTax: 0,
      deliveryCharge: delivery,
      grandTotal,
      gstEnabled: false,
      gstRate: 0,
      priceIncludesGst: globalPriceIncludesGst,
      taxMode,
    };
  }

  const discountRatio = rawSubtotal > 0 ? Math.max(0, 1 - discount / rawSubtotal) : 1;
  const taxableAmount = Math.round(totalTaxable * discountRatio * 100) / 100;
  const totalTax = Math.round(totalItemTax * discountRatio * 100) / 100;

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (taxMode === 'CGST_SGST') {
    cgstAmount = Math.round((totalTax / 2) * 100) / 100;
    sgstAmount = Math.round((totalTax - cgstAmount) * 100) / 100;
  } else {
    igstAmount = totalTax;
  }

  const grandTotal = globalPriceIncludesGst
    ? Math.max(0, Math.round((rawSubtotal - discount + delivery) * 100) / 100)
    : Math.max(0, Math.round((rawSubtotal - discount + totalTax + delivery) * 100) / 100);

  return {
    subtotal: rawSubtotal,
    discount,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTax,
    deliveryCharge: delivery,
    grandTotal,
    gstEnabled: true,
    gstRate: defaultRate,
    priceIncludesGst: globalPriceIncludesGst,
    taxMode,
  };
}
