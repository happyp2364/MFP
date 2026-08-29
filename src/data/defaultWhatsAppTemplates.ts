import { WhatsAppTemplate, WhatsAppTemplatesConfig, WhatsAppTemplateActionCategory } from '../types';

export const ACTION_CATEGORY_INFO: Record<
  WhatsAppTemplateActionCategory,
  { label: string; description: string; badgeColor: string }
> = {
  buy_now: {
    label: 'Buy Now / Direct Buy',
    description: 'Triggered when a customer clicks Buy Now on a product page',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  cart_order: {
    label: 'Add to Cart Order',
    description: 'Triggered when ordering multiple items from cart drawer',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  cod_order: {
    label: 'COD Order',
    description: 'Triggered when customer places a Cash on Delivery order',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  online_order: {
    label: 'Online Payment Order',
    description: 'Triggered after customer completes online UPI/Card payment',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  inquiry: {
    label: 'Inquiry Only',
    description: 'General store inquiry from floating WhatsApp widget or navbar',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  product_enquiry: {
    label: 'Product Enquiry',
    description: 'Question about a specific product availability, size, or restocking',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  bulk_order: {
    label: 'Bulk Order',
    description: 'Inquiry for large volume or team orders',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  wholesale_order: {
    label: 'Wholesale Order',
    description: 'Retailer or business wholesale pricing requests',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  support_request: {
    label: 'Support Request',
    description: 'Help with an existing order, tracking, or issue',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
  },
};

export const WHATSAPP_VARIABLES_LIST = [
  { key: '{customerName}', label: 'Customer Name', sample: 'Rajesh Sharma', category: 'Customer' },
  { key: '{customerPhone}', label: 'Customer Phone', sample: '+91 98765 43210', category: 'Customer' },
  { key: '{customerEmail}', label: 'Customer Email', sample: 'rajesh@example.com', category: 'Customer' },
  { key: '{productName}', label: 'Product Name', sample: 'One8 Emerald Leather Loafers', category: 'Product' },
  { key: '{productBrand}', label: 'Product Brand', sample: 'Marudhar Royal', category: 'Product' },
  { key: '{productCategory}', label: 'Product Category', sample: 'Men Leather Loafers', category: 'Product' },
  { key: '{productPrice}', label: 'Product Price', sample: '₹2,499', category: 'Product' },
  { key: '{discountAmount}', label: 'Discount Amount', sample: '₹500', category: 'Pricing' },
  { key: '{finalPrice}', label: 'Final Price', sample: '₹1,999', category: 'Pricing' },
  { key: '{couponCode}', label: 'Coupon Code', sample: 'ROYAL10', category: 'Pricing' },
  { key: '{couponDiscount}', label: 'Coupon Discount', sample: '10% OFF', category: 'Pricing' },
  { key: '{selectedSize}', label: 'Selected Size', sample: 'UK 9 / 43', category: 'Product' },
  { key: '{selectedColor}', label: 'Selected Color', sample: 'Royal Burgundy', category: 'Product' },
  { key: '{quantity}', label: 'Quantity', sample: '1', category: 'Product' },
  { key: '{paymentMethod}', label: 'Payment Method', sample: 'Direct UPI QR Code', category: 'Order' },
  { key: '{deliveryAddress}', label: 'Street Address', sample: '124 Station Road, Near Fort', category: 'Shipping' },
  { key: '{city}', label: 'City', sample: 'Jodhpur', category: 'Shipping' },
  { key: '{state}', label: 'State', sample: 'Rajasthan', category: 'Shipping' },
  { key: '{pincode}', label: 'Pincode', sample: '342001', category: 'Shipping' },
  { key: '{orderId}', label: 'Order ID', sample: 'MFP-984210', category: 'Order' },
  { key: '{date}', label: 'Order Date', sample: '30/07/2026', category: 'Order' },
  { key: '{time}', label: 'Order Time', sample: '02:45 PM', category: 'Order' },
  { key: '{shopName}', label: 'Shop Name', sample: 'Marudhar Fashion Point', category: 'Store' },
  { key: '{shopPhone}', label: 'Shop Phone', sample: '+91 97824 82250', category: 'Store' },
  { key: '{shopWhatsApp}', label: 'Shop WhatsApp', sample: '+91 97824 82250', category: 'Store' },
  { key: '{website}', label: 'Store URL', sample: 'https://marudharfashion.com', category: 'Store' },
  { key: '{productURL}', label: 'Product Link', sample: 'https://marudharfashion.com/#product-one8-loafers', category: 'Product' },
];

const DEFAULT_ADVANCED_OPTIONS = {
  showProductImageLink: true,
  showProductURL: true,
  showCouponDetails: true,
  showCustomerAddress: true,
  showPaymentDetails: true,
  showDeliveryNotes: true,
  customThankYouMessage: '✨ Thank you for choosing Marudhar Fashion Point! We appreciate your trust.',
  storePoliciesNote: '📋 Store Policy: 100% Authentic Quality Assured. Verified Before Dispatch.',
  returnExchangeNote: '🔄 Size Exchange available within 7 days of delivery.',
};

export const DEFAULT_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl_buy_now_default',
    title: 'Standard Buy Now Template',
    actionCategory: 'buy_now',
    enabled: true,
    isActiveForAction: true,
    isDefault: true,
    updatedAt: new Date().toISOString(),
    messageBody: `🛍️ *DIRECT BUY ORDER - {shopName}*

Hello {shopName}! I would like to purchase this product directly via WhatsApp:

📦 *Product:* {productName}
🏷️ *Brand:* {productBrand}
📁 *Category:* {productCategory}
📏 *Size:* {selectedSize}
🎨 *Color:* {selectedColor}
🔢 *Quantity:* {quantity}
💰 *Price:* {finalPrice}

👤 *Customer Name:* {customerName}
📞 *Mobile Number:* {customerPhone}
📍 *Delivery Address:* {deliveryAddress}, {city}, {state} - {pincode}

Please confirm stock availability and send payment/dispatch instructions.`,
    advancedOptions: { ...DEFAULT_ADVANCED_OPTIONS },
  },
  {
    id: 'tpl_cart_order_default',
    title: 'Standard Cart Checkout Template',
    actionCategory: 'cart_order',
    enabled: true,
    isActiveForAction: true,
    isDefault: true,
    updatedAt: new Date().toISOString(),
    messageBody: `🛒 *CART ORDER CONFIRMATION - {shopName}*

Hello {shopName}! I would like to place an order for the items in my shopping cart:

💰 *Total Estimated Price:* {finalPrice}
🎟️ *Coupon Code:* {couponCode} ({couponDiscount})

👤 *Customer Name:* {customerName}
📞 *Mobile:* {customerPhone}
📍 *Delivery Address:* {deliveryAddress}, {city}, {state} - {pincode}

Please verify item stock and guide me with the order confirmation. Thank you!`,
    advancedOptions: { ...DEFAULT_ADVANCED_OPTIONS },
  },
  {
    id: 'tpl_cod_order_default',
    title: 'Standard COD Order Template',
    actionCategory: 'cod_order',
    enabled: true,
    isActiveForAction: true,
    isDefault: true,
    updatedAt: new Date().toISOString(),
    messageBody: `💵 *CASH ON DELIVERY ORDER - {shopName}*

Hello {shopName}! I have placed a Cash on Delivery (COD) order on your website.

🆔 *Order ID:* {orderId}
📅 *Date:* {date} at {time}
💳 *Payment Mode:* Cash on Delivery (COD)
💰 *Total Payable:* {finalPrice}

📦 *Ordered Item:* {productName}
📏 *Size:* {selectedSize} | 🎨 *Color:* {selectedColor} | 🔢 *Qty:* {quantity}

📍 *Shipping Address:*
{customerName}
{deliveryAddress}, {city}, {state} - {pincode}
Contact Phone: {customerPhone}

Please verify my address and confirm express dispatch!`,
    advancedOptions: { ...DEFAULT_ADVANCED_OPTIONS },
  },
  {
    id: 'tpl_online_order_default',
    title: 'Standard Online Payment Template',
    actionCategory: 'online_order',
    enabled: true,
    isActiveForAction: true,
    isDefault: true,
    updatedAt: new Date().toISOString(),
    messageBody: `✅ *VERIFIED ONLINE PAYMENT ORDER - {shopName}*

Hello {shopName}! I have successfully completed payment for my order.

🆔 *Order ID:* {orderId}
📅 *Date:* {date} at {time}
💳 *Payment Method:* {paymentMethod} (Verified)
💰 *Total Paid:* {finalPrice}

📦 *Ordered Item:* {productName}
📏 *Size:* {selectedSize} | 🎨 *Color:* {selectedColor} | 🔢 *Qty:* {quantity}

📍 *Delivery Address:*
{customerName}
{deliveryAddress}, {city}, {state} - {pincode}
Phone: {customerPhone}

Please process my order for fast dispatch and share the tracking details. Thank you!`,
    advancedOptions: { ...DEFAULT_ADVANCED_OPTIONS },
  },
  {
    id: 'tpl_inquiry_default',
    title: 'General Store Inquiry Template',
    actionCategory: 'inquiry',
    enabled: true,
    isActiveForAction: true,
    isDefault: true,
    updatedAt: new Date().toISOString(),
    messageBody: `💬 *GENERAL STORE INQUIRY - {shopName}*

Hello {shopName}! I am visiting your online store and would like to inquire about your footwear collection, stock availability, and special discounts.

🌐 Store URL: {website}
📞 Helpline: {shopPhone}

Please connect me with a store representative.`,
    advancedOptions: { ...DEFAULT_ADVANCED_OPTIONS, showProductImageLink: false, showProductURL: false, showCustomerAddress: false, showPaymentDetails: false },
  },
  {
    id: 'tpl_product_enquiry_default',
    title: 'Product Stock & Size Enquiry Template',
    actionCategory: 'product_enquiry',
    enabled: true,
    isActiveForAction: true,
    isDefault: true,
    updatedAt: new Date().toISOString(),
    messageBody: `🔍 *PRODUCT STOCK ENQUIRY - {shopName}*

Hello {shopName}! I am interested in this product and have a query:

📦 *Product Name:* {productName}
🏷️ *Brand:* {productBrand}
📏 *Size:* {selectedSize}
🎨 *Color:* {selectedColor}
💰 *Price:* {productPrice}

🔗 *Direct Product Link:* {productURL}

Could you please let me know if this size is ready for store pickup or home delivery?`,
    advancedOptions: { ...DEFAULT_ADVANCED_OPTIONS },
  },
  {
    id: 'tpl_bulk_order_default',
    title: 'Bulk Order Quotation Template',
    actionCategory: 'bulk_order',
    enabled: true,
    isActiveForAction: true,
    isDefault: true,
    updatedAt: new Date().toISOString(),
    messageBody: `📦 *BULK ORDER QUOTATION REQUEST - {shopName}*

Hello {shopName}! I would like to request a bulk order price quote:

📦 *Product:* {productName}
📁 *Category:* {productCategory}
🔢 *Quantity Required:* {quantity}
📏 *Sizes Required:* {selectedSize}

👤 *Contact Name:* {customerName}
📞 *Phone Number:* {customerPhone}
📍 *Delivery City:* {city}, {state}

Please share your best bulk discounted rate and estimated delivery timeframe.`,
    advancedOptions: { ...DEFAULT_ADVANCED_OPTIONS },
  },
  {
    id: 'tpl_wholesale_order_default',
    title: 'Wholesale B2B Inquiry Template',
    actionCategory: 'wholesale_order',
    enabled: true,
    isActiveForAction: true,
    isDefault: true,
    updatedAt: new Date().toISOString(),
    messageBody: `🏬 *WHOLESALE B2B INQUIRY - {shopName}*

Hello {shopName} Wholesale Department!

I own a retail footwear business and am interested in wholesale purchasing:

🏢 *Business Name:* {customerName}
📞 *WhatsApp:* {customerPhone}
📧 *Email:* {customerEmail}
📍 *Store Location:* {city}, {state} - {pincode}

Looking for wholesale pricing in: {productCategory}.
Please share your full wholesale catalog, rate list, and minimum order quantities.`,
    advancedOptions: { ...DEFAULT_ADVANCED_OPTIONS, showProductImageLink: false, showPaymentDetails: false },
  },
  {
    id: 'tpl_support_request_default',
    title: 'Customer Support Request Template',
    actionCategory: 'support_request',
    enabled: true,
    isActiveForAction: true,
    isDefault: true,
    updatedAt: new Date().toISOString(),
    messageBody: `🆘 *CUSTOMER SUPPORT REQUEST - {shopName}*

Hello {shopName} Support Team!

I need assistance regarding an existing order or store query:

🆔 *Order ID:* {orderId}
👤 *Customer Name:* {customerName}
📞 *Phone Number:* {customerPhone}

Please connect with me to assist. Thank you!`,
    advancedOptions: { ...DEFAULT_ADVANCED_OPTIONS, showProductImageLink: false, showProductURL: false },
  },
];

export const DEFAULT_ACTIVE_CATEGORY_MAP: Record<WhatsAppTemplateActionCategory, string> = {
  buy_now: 'tpl_buy_now_default',
  cart_order: 'tpl_cart_order_default',
  cod_order: 'tpl_cod_order_default',
  online_order: 'tpl_online_order_default',
  inquiry: 'tpl_inquiry_default',
  product_enquiry: 'tpl_product_enquiry_default',
  bulk_order: 'tpl_bulk_order_default',
  wholesale_order: 'tpl_wholesale_order_default',
  support_request: 'tpl_support_request_default',
};

export const DEFAULT_WHATSAPP_TEMPLATES_CONFIG: WhatsAppTemplatesConfig = {
  templates: DEFAULT_WHATSAPP_TEMPLATES,
  activeCategoryMap: DEFAULT_ACTIVE_CATEGORY_MAP,
};
