import { Product, CustomerOrder } from '../types';
import { STORE_INFO } from '../data/mockData';
import { isProductCompletelyOutOfStock, getSizeStockInfo } from './sizeStockUtils';
import { getProductSKU, getProductUrl } from './productUtils';
import { generateWhatsAppLinkFromCategory, WhatsAppPayloadData, getActiveStorePhone } from './whatsappTemplateParser';
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
  const mainImage = product.images && product.images.length > 0 ? product.images[0] : '';
  const currentPrice = getProductPrice(product, sizeText, colorText);

  const isCompletelyOutOfStock = isProductCompletelyOutOfStock(product);
  const sizeInfo = getSizeStockInfo(product, sizeText);
  const isSizeOutOfStock = sizeInfo ? (!sizeInfo.inStock || sizeInfo.stockQuantity <= 0) : false;

  const category = (isCompletelyOutOfStock || isSizeOutOfStock) ? 'product_enquiry' : 'buy_now';

  const payload: WhatsAppPayloadData = {
    productName: product.name,
    productBrand: product.brand || 'Royal Collection',
    productCategory: product.category,
    productPrice: currentPrice,
    finalPrice: currentPrice * quantity,
    selectedSize: sizeText,
    selectedColor: colorText,
    quantity,
    productURL: productUrl,
    productImageLink: mainImage,
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

  const payload: WhatsAppPayloadData = {
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    orderId: order.id,
    date: new Date(order.createdAt).toLocaleDateString('en-IN'),
    time: new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    paymentMethod: order.paymentMethod,
    finalPrice: order.totalAmount,
    deliveryAddress: order.shippingAddress.street,
    city: order.shippingAddress.city,
    state: order.shippingAddress.state,
    pincode: order.shippingAddress.pincode,
    productName: firstItem ? `${firstItem.product.name}${order.items.length > 1 ? ` (+${order.items.length - 1} more items)` : ''}` : 'Order Package',
    selectedSize: firstItem ? firstItem.selectedSize : 'Standard',
    selectedColor: firstItem ? firstItem.selectedColor : 'Standard',
    quantity: order.items.reduce((acc, curr) => acc + curr.quantity, 0),
  };

  return generateWhatsAppLinkFromCategory(category, payload, undefined, whatsappNum);
}
