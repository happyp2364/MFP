import {
  WhatsAppTemplate,
  WhatsAppTemplatesConfig,
  WhatsAppTemplateActionCategory,
  Product,
  CustomerOrder,
} from '../types';
import {
  DEFAULT_WHATSAPP_TEMPLATES_CONFIG,
  WHATSAPP_VARIABLES_LIST,
} from '../data/defaultWhatsAppTemplates';
import { STORE_INFO } from '../data/mockData';
import { getProductSKU, getProductUrl } from './productUtils';
import { getPlatformConfig, getPlatformBaseUrl } from '../lib/platformConfig';

export interface WhatsAppPayloadData {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  productName?: string;
  productBrand?: string;
  productCategory?: string;
  productPrice?: string | number;
  discountAmount?: string | number;
  finalPrice?: string | number;
  couponCode?: string;
  couponDiscount?: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity?: string | number;
  paymentMethod?: string;
  deliveryAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  orderId?: string;
  date?: string;
  time?: string;
  shopName?: string;
  shopPhone?: string;
  shopWhatsApp?: string;
  website?: string;
  productURL?: string;
  productImageLink?: string;
  deliveryNotes?: string;
  customQuery?: string;
}

export function getStoredWhatsAppConfig(): WhatsAppTemplatesConfig {
  try {
    const raw = localStorage.getItem('nwd_whatsapp_templates_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.templates) && parsed.activeCategoryMap) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not parse stored whatsapp config:', e);
  }
  return DEFAULT_WHATSAPP_TEMPLATES_CONFIG;
}

export function getActiveTemplateForCategory(
  category: WhatsAppTemplateActionCategory,
  config?: WhatsAppTemplatesConfig
): WhatsAppTemplate {
  const activeConfig = config || getStoredWhatsAppConfig();
  const templateId = activeConfig.activeCategoryMap?.[category];

  if (templateId) {
    const found = activeConfig.templates.find((t) => t.id === templateId && t.enabled);
    if (found) return found;
  }

  // Fallback to first enabled template in this category
  const categoryMatch = activeConfig.templates.find(
    (t) => t.actionCategory === category && t.enabled
  );
  if (categoryMatch) return categoryMatch;

  // Fallback to default template in default config
  const defaultMatch = DEFAULT_WHATSAPP_TEMPLATES_CONFIG.templates.find(
    (t) => t.actionCategory === category
  );
  return defaultMatch || DEFAULT_WHATSAPP_TEMPLATES_CONFIG.templates[0];
}

export function getActiveStorePhone(): string {
  try {
    const saved = localStorage.getItem('nwd_store_info_live');
    if (saved) {
      const parsed = JSON.parse(saved);
      const phone = parsed.whatsappNumber || parsed.phone;
      if (phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length >= 10) return cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
      }
    }
  } catch (e) {}
  const fallback = STORE_INFO.whatsappNumber.replace(/\D/g, '');
  return fallback.startsWith('91') ? fallback : `91${fallback}`;
}

export function renderWhatsAppMessageText(
  template: WhatsAppTemplate,
  payload: WhatsAppPayloadData
): string {
  const config = getPlatformConfig();
  const shopName = payload.shopName || STORE_INFO.name || config.platformName;
  const shopPhone = payload.shopPhone || STORE_INFO.phone || '+91 97824 82250';
  const shopWhatsApp = payload.shopWhatsApp || STORE_INFO.whatsappNumber || '+91 97824 82250';
  const website = payload.website || (typeof window !== 'undefined' ? window.location.origin : config.platformBaseUrl);

  const replacements: Record<string, string> = {
    '{customerName}': payload.customerName || 'Customer',
    '{customerPhone}': payload.customerPhone || 'N/A',
    '{customerEmail}': payload.customerEmail || 'N/A',
    '{productName}': payload.productName || 'Featured Fashion Item',
    '{productBrand}': payload.productBrand || 'Royal Quality',
    '{productCategory}': payload.productCategory || 'Footwear',
    '{productPrice}': typeof payload.productPrice === 'number' ? `₹${payload.productPrice.toLocaleString('en-IN')}` : (payload.productPrice || 'N/A'),
    '{discountAmount}': typeof payload.discountAmount === 'number' ? `₹${payload.discountAmount.toLocaleString('en-IN')}` : (payload.discountAmount || '₹0'),
    '{finalPrice}': typeof payload.finalPrice === 'number' ? `₹${payload.finalPrice.toLocaleString('en-IN')}` : (payload.finalPrice || 'N/A'),
    '{couponCode}': payload.couponCode || 'N/A',
    '{couponDiscount}': payload.couponDiscount || 'N/A',
    '{selectedSize}': payload.selectedSize || 'Standard',
    '{selectedColor}': payload.selectedColor || 'Standard',
    '{quantity}': String(payload.quantity || '1'),
    '{paymentMethod}': payload.paymentMethod || 'WhatsApp Direct / UPI',
    '{deliveryAddress}': payload.deliveryAddress || 'Address Provided',
    '{city}': payload.city || 'Jodhpur',
    '{state}': payload.state || 'Rajasthan',
    '{pincode}': payload.pincode || '342001',
    '{orderId}': payload.orderId || `NWD-${Date.now().toString().slice(-6)}`,
    '{date}': payload.date || new Date().toLocaleDateString('en-IN'),
    '{time}': payload.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    '{shopName}': shopName,
    '{shopPhone}': shopPhone,
    '{shopWhatsApp}': shopWhatsApp,
    '{website}': website,
    '{productURL}': payload.productURL || website,
  };

  let rendered = template.messageBody || '';

  Object.entries(replacements).forEach(([key, val]) => {
    rendered = rendered.replaceAll(key, val);
  });

  const opts = template.advancedOptions;
  if (opts) {
    if (opts.showProductImageLink && payload.productImageLink && !rendered.includes(payload.productImageLink)) {
      rendered += `\n\n🖼️ *Product Image:* ${payload.productImageLink}`;
    }
    if (opts.showProductURL && payload.productURL && !rendered.includes(payload.productURL)) {
      rendered += `\n\n🔗 *Product Page:* ${payload.productURL}`;
    }
    if (opts.showCouponDetails && payload.couponCode && payload.couponCode !== 'N/A' && !rendered.includes(payload.couponCode)) {
      rendered += `\n\n🎟️ *Applied Coupon:* ${payload.couponCode} (${payload.couponDiscount || 'Discount Applied'})`;
    }
    if (opts.showCustomerAddress && payload.deliveryAddress && !rendered.includes(payload.deliveryAddress)) {
      rendered += `\n\n📍 *Shipping Address:*\n${payload.deliveryAddress}, ${payload.city || '}, ${payload.state || '} - ${payload.pincode || ''}`;
    }
    if (opts.showPaymentDetails && payload.paymentMethod && !rendered.includes(payload.paymentMethod)) {
      rendered += `\n\n💳 *Payment Details:* ${payload.paymentMethod}`;
    }
    if (opts.showDeliveryNotes && payload.deliveryNotes && !rendered.includes(payload.deliveryNotes)) {
      rendered += `\n\n📝 *Delivery Note:* ${payload.deliveryNotes}`;
    }
    if (opts.customThankYouMessage && opts.customThankYouMessage.trim()) {
      rendered += `\n\n${opts.customThankYouMessage.trim()}`;
    }
    if (opts.storePoliciesNote && opts.storePoliciesNote.trim()) {
      rendered += `\n\n${opts.storePoliciesNote.trim()}`;
    }
    if (opts.returnExchangeNote && opts.returnExchangeNote.trim()) {
      rendered += `\n\n${opts.returnExchangeNote.trim()}`;
    }
  }

  return rendered;
}

export function generateWhatsAppLinkFromCategory(
  category: WhatsAppTemplateActionCategory,
  payload: WhatsAppPayloadData,
  config?: WhatsAppTemplatesConfig,
  customWhatsAppNum?: string
): string {
  const template = getActiveTemplateForCategory(category, config);
  const text = renderWhatsAppMessageText(template, payload);
  const targetNumber = customWhatsAppNum ? customWhatsAppNum.replace(/\D/g, '') : getActiveStorePhone();
  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(text)}`;
}

export function buildSamplePayloadForPreview(category: WhatsAppTemplateActionCategory): WhatsAppPayloadData {
  return {
    customerName: 'Rajesh Sharma',
    customerPhone: '+91 98765 43210',
    customerEmail: 'rajesh.sharma@example.com',
    productName: 'Royal Handcrafted Velvet Loafers',
    productBrand: 'Royal Heritage',
    productCategory: 'Men Luxury Footwear',
    productPrice: 2999,
    discountAmount: 500,
    finalPrice: 2499,
    couponCode: 'FESTIVE10',
    couponDiscount: '10% OFF',
    selectedSize: 'UK 9 / 43',
    selectedColor: 'Deep Royal Burgundy',
    quantity: 1,
    paymentMethod: 'Direct Online UPI QR Code',
    deliveryAddress: '45, Ratanada Main Market',
    city: 'Jodhpur',
    state: 'Rajasthan',
    pincode: '342001',
    orderId: 'NWD-892410',
    date: new Date().toLocaleDateString('en-IN'),
    time: '03:30 PM',
    shopName: 'Footwear Store',
    shopPhone: '+91 97824 82250',
    shopWhatsApp: '+91 97824 82250',
    website: typeof window !== 'undefined' ? window.location.origin : getPlatformBaseUrl(),
    productURL: `${getPlatformBaseUrl()}/#product-velvet-loafers`,
    productImageLink: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    deliveryNotes: 'Please deliver after 2 PM',
  };
}
