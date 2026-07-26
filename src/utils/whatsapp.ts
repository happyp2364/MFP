import { Product } from '../types';
import { STORE_INFO } from '../data/mockData';
import { isProductCompletelyOutOfStock, getSizeStockInfo } from './sizeStockUtils';
import { getProductSKU, getProductUrl } from './productUtils';

export function generateProductWhatsAppLink(
  product: Product,
  selectedSize?: string,
  selectedColor?: string,
  quantity: number = 1
): string {
  const sizeText = selectedSize || (product.sizes.length > 0 ? product.sizes[0] : 'Standard');
  const colorText = selectedColor || (product.colors.length > 0 ? product.colors[0].name : 'Standard');
  const sku = getProductSKU(product);
  const productUrl = getProductUrl(product);

  const isCompletelyOutOfStock = isProductCompletelyOutOfStock(product);
  const sizeInfo = getSizeStockInfo(product, sizeText);
  const isSizeOutOfStock = sizeInfo ? (!sizeInfo.inStock || sizeInfo.stockQuantity <= 0) : false;

  let text = '';

  if (isCompletelyOutOfStock || isSizeOutOfStock) {
    text = `🛍️ Hello Marudhar Fashion Point,

I am interested in this product which is currently OUT OF STOCK:

📦 Product:
${product.name}

🏷️ SKU:
${sku}

📏 Size:
${sizeText}

🎨 Colour:
${colorText}

🔢 Quantity:
${quantity}

💰 Price:
₹${product.price.toLocaleString('en-IN')}

🔗 Product Link:
${productUrl}

🔔 Please notify me as soon as this item/size is restocked in store!`;
  } else {
    text = `🛍️ Hello Marudhar Fashion Point,

I want to order this product.

📦 Product:
${product.name}

🏷️ SKU:
${sku}

📏 Size:
${sizeText}

🎨 Colour:
${colorText}

🔢 Quantity:
${quantity}

💰 Price:
₹${product.price.toLocaleString('en-IN')}

🔗 Product Link:
${productUrl}

Please confirm availability.`;
  }

  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodedText}`;
}

export function generateCartWhatsAppLink(
  items: { product: Product; selectedSize: string; selectedColor: string; quantity: number }[]
): string {
  if (items.length === 0) return `https://wa.me/${STORE_INFO.whatsappNumber}`;

  let itemsSummary = '';
  let totalPrice = 0;

  items.forEach((item, index) => {
    const itemTotal = item.product.price * item.quantity;
    totalPrice += itemTotal;
    itemsSummary += `${index + 1}. ${item.product.name}\n   Size: ${item.selectedSize} | Color: ${item.selectedColor} | Qty: ${item.quantity} | ₹${itemTotal.toLocaleString('en-IN')}\n\n`;
  });

  const text = `Hello Marudhar Fashion Point,

I would like to place an order for the following items:

${itemsSummary}Total Estimated Amount: ₹${totalPrice.toLocaleString('en-IN')}

Please check item availability and guide me with the order confirmation. Thank you!`;

  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodedText}`;
}

export function generateGeneralInquiryWhatsAppLink(customQuery?: string): string {
  const defaultText = customQuery || `Hello Marudhar Fashion Point, I would like to inquire about your latest fashion & footwear collection and offers.`;
  const encodedText = encodeURIComponent(defaultText);
  return `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodedText}`;
}

export function generateOrderWhatsAppLink(order: import('../types').CustomerOrder): string {
  if (!order) return `https://wa.me/${STORE_INFO.whatsappNumber}`;

  let itemsSummary = '';
  order.items.forEach((item, index) => {
    const itemTotal = item.product.price * item.quantity;
    itemsSummary += `${index + 1}. ${item.product.name}\n   Size: ${item.selectedSize} | Color: ${item.selectedColor} | Qty: ${item.quantity} | ₹${itemTotal.toLocaleString('en-IN')}\n`;
  });

  const text = `Hello Marudhar Fashion Point,

✅ VERIFIED ORDER CONFIRMATION

Order ID: ${order.id}
Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}
Payment Method: ${order.paymentMethod}
Payment Status: ${order.paymentStatus} (Verified)
Payment Reference / UTR: ${order.paymentReference || 'N/A'}

📦 ORDERED ITEMS:
${itemsSummary}
Subtotal: ₹${order.subtotal.toLocaleString('en-IN')}${order.convenienceFee && order.convenienceFee > 0 ? `\nConvenience Fee: ₹${order.convenienceFee.toLocaleString('en-IN')}` : ''}
💰 Total Paid: ₹${order.totalAmount.toLocaleString('en-IN')}

📍 DELIVERY ADDRESS:
${order.customerName}
${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
Phone: ${order.customerPhone}

Please process my order for dispatch. Thank you!`;

  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodedText}`;
}
