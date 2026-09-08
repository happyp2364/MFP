import { Product, CustomerOrder } from '../types';
import { STORE_INFO } from '../data/mockData';
import { isProductCompletelyOutOfStock, getSizeStockInfo } from './sizeStockUtils';
import {
  getProductSKU,
  getProductUrl,
  getPublicProductImageUrl,
  isValidCustomerValue,
  sanitizeWhatsAppText,
} from './productUtils';
import {
  PUBLIC_SITE_URL,
  getPublicOrderPaymentUrl,
  sanitizePublicCustomerUrl,
} from './siteUrl';
import { generateWhatsAppLinkFromCategory, WhatsAppPayloadData, getActiveStorePhone } from './whatsappTemplateParser';
export { getActiveStorePhone, sanitizeWhatsAppText, getPublicProductImageUrl, isValidCustomerValue, PUBLIC_SITE_URL };
import { getProductPrice } from './variantUtils';

export function generateProductWhatsAppLink(
  product: Product,
  selectedSize?: string,
  selectedColor?: string,
  quantity: number = 1,
  whatsappNum?: string
): string {
  const sizeText = selectedSize || (product.sizes.length > 0 ? product.sizes[0] : 'Standard');
  const colorText = selectedColor || (product.colors.length > 0 ? product.colors[0].name : 'Standard');
  const sku = getProductSKU(product);
  const productUrl = getProductUrl(product);
  const cleanImage = getPublicProductImageUrl(product) || undefined;
  const currentPrice = getProductPrice(product, sizeText, colorText);

  const isCompletelyOutOfStock = isProductCompletelyOutOfStock(product);
  const sizeInfo = getSizeStockInfo(product, sizeText);
  const isSizeOutOfStock = sizeInfo ? (!sizeInfo.inStock || sizeInfo.stockQuantity <= 0) : false;

  const category = (isCompletelyOutOfStock || isSizeOutOfStock) ? 'product_enquiry' : 'buy_now';

  const payload: WhatsAppPayloadData = {
    productName: product.name,
    productBrand: product.brand || 'मरुधर रॉयल',
    productCategory: product.category,
    productPrice: currentPrice,
    finalPrice: currentPrice * quantity,
    selectedSize: sizeText,
    selectedColor: colorText,
    quantity,
    productURL: productUrl,
    productImageLink: cleanImage,
    orderId: sku,
  };

  return generateWhatsAppLinkFromCategory(category, payload, undefined, whatsappNum);
}

export function generateCartWhatsAppLink(
  items: { product: Product; selectedSize: string; selectedColor: string; quantity: number }[],
  whatsappNum?: string,
  couponCode?: string,
  couponDiscount?: string
): string {
  if (items.length === 0) {
    return `https://wa.me/${whatsappNum || getActiveStorePhone()}`;
  }

  let totalPrice = 0;
  const itemNames = items.map((item) => {
    const itemPrice = getProductPrice(item.product, item.selectedSize, item.selectedColor);
    totalPrice += itemPrice * item.quantity;
    return `${item.product.name} (Qty: ${item.quantity}, Size: ${item.selectedSize})`;
  }).join(', ');

  const firstItem = items[0]?.product;

  const payload: WhatsAppPayloadData = {
    productName: itemNames,
    productCategory: 'Cart Items',
    finalPrice: totalPrice,
    couponCode: couponCode || 'N/A',
    couponDiscount: couponDiscount || 'N/A',
    quantity: items.reduce((acc, curr) => acc + curr.quantity, 0),
    productURL: firstItem ? getProductUrl(firstItem) : undefined,
    productImageLink: firstItem ? (getPublicProductImageUrl(firstItem) || undefined) : undefined,
  };

  return generateWhatsAppLinkFromCategory('cart_order', payload, undefined, whatsappNum);
}

export function generateGeneralInquiryWhatsAppLink(customQuery?: string, whatsappNum?: string): string {
  const payload: WhatsAppPayloadData = {
    customQuery,
  };
  return generateWhatsAppLinkFromCategory('inquiry', payload, undefined, whatsappNum);
}

export function generateOrderWhatsAppLink(order: CustomerOrder, whatsappNum?: string): string {
  if (!order) return `https://wa.me/${whatsappNum || getActiveStorePhone()}`;

  const isCOD = order.paymentMethod === 'COD';
  const category = isCOD ? 'cod_order' : 'online_order';

  const firstItem = order.items[0];

  let productDetailsText = firstItem ? `${firstItem.product.name}${order.items.length > 1 ? ` (+${order.items.length - 1} more items)` : ''}` : 'Order Package';

  if (order.gstEnabled) {
    const taxRate = order.gstRate || 18;
    const halfRate = taxRate / 2;
    const taxable = order.taxableAmount ?? (order.subtotal - order.discountAmount);
    const delivery = order.shippingFee;
    const totalTax = order.taxAmount;
    if (order.taxMode === 'IGST') {
      productDetailsText += `\nTaxable Amount: ₹${taxable.toLocaleString()}\nIGST ${taxRate}%: ₹${totalTax.toLocaleString()}\nDelivery: ₹${delivery.toLocaleString()}\nGrand Total: ₹${order.totalAmount.toLocaleString()}`;
    } else {
      const cgst = order.cgstAmount ?? (totalTax / 2);
      const sgst = order.sgstAmount ?? (totalTax / 2);
      productDetailsText += `\nTaxable Amount: ₹${taxable.toLocaleString()}\nCGST ${halfRate}%: ₹${cgst.toLocaleString()}\nSGST ${halfRate}%: ₹${sgst.toLocaleString()}\nDelivery: ₹${delivery.toLocaleString()}\nGrand Total: ₹${order.totalAmount.toLocaleString()}`;
    }
  }

  const payload: WhatsAppPayloadData = {
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    orderId: order.id,
    date: new Date(order.createdAt).toLocaleDateString('en-IN'),
    time: new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    paymentMethod: order.paymentMethod,
    finalPrice: order.totalAmount,
    deliveryAddress: order.shippingAddress?.street || (order as any)?.deliveryAddress || '',
    city: order.shippingAddress?.city || '',
    state: order.shippingAddress?.state || '',
    pincode: order.shippingAddress?.pincode || '',
    productName: productDetailsText,
    selectedSize: firstItem ? firstItem.selectedSize : 'Standard',
    selectedColor: firstItem ? firstItem.selectedColor : 'Standard',
    quantity: order.items.reduce((acc, curr) => acc + curr.quantity, 0),
  };

  return generateWhatsAppLinkFromCategory(category, payload, undefined, whatsappNum);
}

/**
 * Format real dynamic WhatsApp Order Message containing the Order-Specific Payment Link
 * Uses strict brand name: "मरुधर फैशन पॉइंट"
 */
export function formatWhatsAppOrderMessageWithPaymentLink(order: CustomerOrder, paymentUrl: string): string {
  const cleanOrderId = (order.id || '').replace(/^#/, '');

  // 1. PRODUCT DETAILS
  const items = order.items || [];
  const renderedItems = items.map((item, idx) => {
    const p = item.product;
    const itemPrice = getProductPrice(p, item.selectedSize, item.selectedColor);
    const size = item.selectedSize || (p.sizes && p.sizes[0]) || 'Standard';
    const color = item.selectedColor || (p.colors && p.colors[0]?.name) || 'Standard';
    const brand = p.brand || 'मरुधर रॉयल';
    const category = p.category ? (p.category.charAt(0).toUpperCase() + p.category.slice(1)) : 'Footwear';

    const cleanImgUrl = getPublicProductImageUrl(p, item.selectedVariant?.images?.[0]);
    const productUrl = getProductUrl(p);

    const lines = [
      `📦 *प्रोडक्ट:* ${p.name}`,
      `🏷️ *ब्रांड:* ${brand}`,
      `📁 *कैटेगरी:* ${category}`,
      `📏 *साइज:* ${size}`,
      `🎨 *कलर:* ${color}`,
      `🔢 *मात्रा:* ${item.quantity}`,
      `💰 *कीमत:* ₹${itemPrice.toLocaleString('en-IN')}`,
    ];

    if (cleanImgUrl) {
      lines.push(`\n🖼️ *Product Image:*\n${cleanImgUrl}`);
    }

    if (productUrl) {
      lines.push(`\n🔗 *Product Link:*\n${productUrl}`);
    }

    const blockContent = lines.join('\n');
    if (items.length > 1) {
      return `━━━━━━━━━━━━━━\n📦 *PRODUCT ${idx + 1}*\n━━━━━━━━━━━━━━\n\n${blockContent}`;
    }
    return blockContent;
  }).join('\n\n');

  const productsSection = items.length > 1
    ? `━━━━━━━━━━━━━━\n📦 *PRODUCT DETAILS (${items.length} Items)*\n━━━━━━━━━━━━━━\n\n${renderedItems}`
    : `━━━━━━━━━━━━━━\n📦 *PRODUCT DETAILS*\n━━━━━━━━━━━━━━\n\n${renderedItems || '📦 *प्रोडक्ट:* Order Items × 1'}`;

  // 2. CUSTOMER DETAILS
  const customerLines: string[] = [];
  if (isValidCustomerValue(order.customerName)) {
    customerLines.push(`👤 *नाम:* ${order.customerName.trim()}`);
  }
  if (isValidCustomerValue(order.customerPhone)) {
    customerLines.push(`📞 *मोबाइल:* ${order.customerPhone.trim()}`);
  }
  if (isValidCustomerValue(order.customerEmail) && order.customerEmail.includes('@')) {
    customerLines.push(`📧 *Gmail:* ${order.customerEmail.trim()}`);
  }

  // Address
  const addr = order.shippingAddress;
  if (addr) {
    const addressParts: string[] = [];
    if (isValidCustomerValue(addr.street) && addr.street !== 'Will be confirmed on WhatsApp') {
      addressParts.push(addr.street.trim());
    }
    const locationParts = [
      isValidCustomerValue(addr.city) ? addr.city.trim() : '',
      isValidCustomerValue(addr.state) ? addr.state.trim() : '',
      isValidCustomerValue(addr.pincode) ? addr.pincode.trim() : '',
    ].filter(Boolean).join(', ');

    if (locationParts) {
      addressParts.push(locationParts);
    }

    if (addressParts.length > 0) {
      customerLines.push(`📍 *डिलीवरी पता:*\n${addressParts.join('\n')}`);
    }
  }

  let customerSection = '';
  if (customerLines.length > 0) {
    customerSection = `━━━━━━━━━━━━━━\n👤 *CUSTOMER DETAILS*\n━━━━━━━━━━━━━━\n\n${customerLines.join('\n')}`;
  }

  // 3. ORDER SUMMARY
  const shippingFeeNum = typeof order.shippingFee === 'number' ? order.shippingFee : 0;
  const deliveryText = shippingFeeNum <= 0 ? 'FREE' : `₹${shippingFeeNum.toLocaleString('en-IN')}`;
  const discountAmountNum = typeof order.discountAmount === 'number' ? order.discountAmount : 0;
  const discountLine = discountAmountNum > 0 ? `Discount: ₹${discountAmountNum.toLocaleString('en-IN')}\n` : '';
  const convenienceFeeNum = typeof order.convenienceFee === 'number' ? order.convenienceFee : 0;
  const convenienceFeeLine = convenienceFeeNum > 0 ? `Convenience Fee: ₹${convenienceFeeNum.toLocaleString('en-IN')}\n` : '';
  const subtotalNum = typeof order.subtotal === 'number' ? order.subtotal : (order.totalAmount || 0);
  const totalAmountNum = typeof order.totalAmount === 'number' ? order.totalAmount : subtotalNum;

  const summarySection = `━━━━━━━━━━━━━━\n💰 *ORDER SUMMARY*\n━━━━━━━━━━━━━━\n\nSubtotal: ₹${subtotalNum.toLocaleString('en-IN')}\nDelivery: ${deliveryText}\n${discountLine}${convenienceFeeLine}*Total Payable: ₹${totalAmountNum.toLocaleString('en-IN')}*`;

  // 4. PAYMENT SECTION
  let prodPaymentUrl = paymentUrl;
  if (!prodPaymentUrl || !prodPaymentUrl.startsWith('http')) {
    prodPaymentUrl = getPublicOrderPaymentUrl(cleanOrderId);
  } else {
    prodPaymentUrl = sanitizePublicCustomerUrl(prodPaymentUrl);
  }

  const paymentSection = `━━━━━━━━━━━━━━\n💳 *PAYMENT*\n━━━━━━━━━━━━━━\n\nभुगतान अभी बाकी है।\n\n🔐 *सुरक्षित भुगतान लिंक:*\n${prodPaymentUrl}\n\n🌐 *Website:*\n${PUBLIC_SITE_URL}\n\nकृपया स्टॉक उपलब्धता और ऑर्डर की पुष्टि करें।\n\nधन्यवाद 🙏\n*मरुधर फैशन पॉइंट*`;

  // 5. COMBINE
  const messageBlocks = [
    `🛍️ *नया ऑर्डर — मरुधर फैशन पॉइंट*\n\nनमस्ते! मैंने आपकी वेबसाइट से यह ऑर्डर किया है।\n\n🧾 *Order ID:* ${cleanOrderId}`,
    productsSection,
  ];

  if (customerSection) {
    messageBlocks.push(customerSection);
  }

  messageBlocks.push(summarySection);
  messageBlocks.push(paymentSection);

  return sanitizeWhatsAppText(messageBlocks.join('\n\n'));
}

/**
 * Generates the wa.me link with the dynamic order message and payment link
 */
export function generateWhatsAppOrderUrlWithPaymentLink(
  order: CustomerOrder,
  paymentUrl: string,
  storePhone?: string
): string {
  const phone = (storePhone || getActiveStorePhone()).replace(/\D/g, '');
  const rawMessage = formatWhatsAppOrderMessageWithPaymentLink(order, paymentUrl);
  const cleanMessage = sanitizeWhatsAppText(rawMessage);
  return `https://wa.me/${phone}?text=${encodeURIComponent(cleanMessage)}`;
}
