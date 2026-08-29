/**
 * MARUDHAR FASHION POINT - WEBSITE-WISE CUSTOMER LANGUAGE CONTROL SYSTEM
 * 
 * Main UI stays in English (Home, Shop, Categories, Reviews, Cart, Admin).
 * Customer dialogues, promotional slogans, WhatsApp messages & order updates
 * are dynamically driven by website-level Customer Communication Language ('hi' | 'en').
 */

import { CustomerLanguage, WebsiteConfig } from '../types';

/**
 * Get active customer language for the current website/tenant.
 * Defaults strictly to 'hi' (Hindi).
 */
export function getCustomerLanguage(config?: WebsiteConfig | null): CustomerLanguage {
  if (config?.customerCommunication?.language) {
    return config.customerCommunication.language;
  }
  if (config?.customerLanguage) {
    return config.customerLanguage;
  }
  try {
    const raw = localStorage.getItem('mfp_website_config_live');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.customerCommunication?.language) {
        return parsed.customerCommunication.language;
      }
      if (parsed?.customerLanguage) {
        return parsed.customerLanguage;
      }
    }
  } catch {}
  return 'hi';
}

/**
 * Robust string extractor based on chosen language.
 * Guarantees zero undefined/null/[object Object] leakages.
 * If Hindi missing -> fallbacks to English.
 * If English missing -> fallbacks to Hindi.
 * If both missing -> safe fallback.
 */
export function getCustomerText(
  hiText: string | undefined | null,
  enText: string | undefined | null,
  language?: CustomerLanguage,
  fallback: string = ''
): string {
  const activeLang = language || getCustomerLanguage();

  const cleanHi = (typeof hiText === 'string' && hiText.trim().length > 0) ? hiText.trim() : null;
  const cleanEn = (typeof enText === 'string' && enText.trim().length > 0) ? enText.trim() : null;

  if (activeLang === 'hi') {
    if (cleanHi) return cleanHi;
    if (cleanEn) return cleanEn;
    return fallback;
  } else {
    if (cleanEn) return cleanEn;
    if (cleanHi) return cleanHi;
    return fallback;
  }
}

/**
 * Standard Customer Dialogues & Communication Content Dictionary
 */
export const CUSTOMER_COMMUNICATION_DICTIONARY = {
  welcome: {
    badge: {
      hi: 'पधारो सा • 100% असली व प्रीमियम',
      en: 'Welcome • 100% Authentic Footwear',
    },
    title: {
      hi: 'आपका स्वागत है',
      en: 'Welcome to Our Store',
    },
    tagline: {
      hi: 'हर कदम में स्टाइल और भरोसा',
      en: 'Style & Confidence in Every Step',
    },
    subtext: {
      hi: 'पीपाड़ सिटी व जोधपुर का सबसे पसंदीदा फैमिली फुटवियर स्टोर।',
      en: "Rajasthan's premier destination for luxury footwear, sneakers and royal mojaris.",
    },
  },
  slogans: {
    hi: [
      'हर कदम में स्टाइल',
      'आपका स्टाइल, हमारी पहचान',
      'फैशन जो आपके अंदाज़ को बनाए खास',
      'हर मौके के लिए शानदार स्टाइल',
      'भरोसेमंद क्वालिटी, बेहतरीन आराम',
    ],
    en: [
      'Style for Every Step',
      'Your Style, Our Identity',
      'Fashion That Makes You Stand Out',
      'Signature Footwear for Every Occasion',
      'Trusted Quality, Unmatched Comfort',
    ],
  },
  offers: {
    badge: {
      hi: 'आज का खास ऑफर',
      en: "Today's Special Offer",
    },
    hurry: {
      hi: 'जल्दी करें, स्टॉक सीमित है!',
      en: 'Hurry, Limited Stock Available!',
    },
    discountNote: {
      hi: 'चुनिंदा जूतों पर विशेष छूट उपलब्ध है।',
      en: 'Special discounts available on selected footwear.',
    },
  },
  sections: {
    newArrivalsSubtitle: {
      hi: 'नए स्टाइल जो आपके लुक को बनाए खास।',
      en: 'Fresh styles curated to elevate your daily look.',
    },
    bestSellersSubtitle: {
      hi: 'हमारे ग्राहकों की सबसे पसंदीदा पसंद।',
      en: 'Customer favorites loved across Rajasthan.',
    },
    trendingSubtitle: {
      hi: 'इस सीज़न के सबसे लोकप्रिय और ट्रेंडी जूते।',
      en: 'Hot & trending silhouettes of the season.',
    },
    openBoxAssurance: {
      hi: 'डिलीवरी के समय पार्सल खोलकर देखें, फिर भुगतान करें।',
      en: 'Check your footwear on delivery before payment.',
    },
  },
  cart: {
    almostComplete: {
      hi: 'आपकी खरीदारी लगभग पूरी हो चुकी है। ❤️',
      en: "You're almost ready to complete your purchase. ❤️",
    },
    freeShippingUnlocked: {
      hi: 'बधाई हो! आपको फ्री डिलीवरी मिल गई है। 🚚🎉',
      en: 'Congratulations! You have unlocked Free Delivery. 🚚🎉',
    },
    freeShippingRemaining: {
      hi: (amt: number) => `फ्री डिलीवरी पाने के लिए ₹${amt} का और सामान जोड़ें।`,
      en: (amt: number) => `Add ₹${amt} more to get Free Delivery.`,
    },
    emptyMessage: {
      hi: 'आपकी शॉपिंग बैग अभी खाली है। आइए अपने लिए शानदार जूते चुनें!',
      en: "Your shopping bag is empty. Let's find your perfect pair!",
    },
    continueShopping: {
      hi: 'शॉपिंग जारी रखें',
      en: 'Continue Shopping',
    },
  },
  checkout: {
    orderPlacedSuccess: {
      hi: 'बधाई हो! आपका ऑर्डर सफलतापूर्वक दर्ज कर लिया गया है।',
      en: 'Congratulations! Your order has been placed successfully.',
    },
    whatsappConfirmationPrompt: {
      hi: 'ऑर्डर की त्वरित पुष्टि और ट्रैकिंग के लिए व्हाट्सऐप पर संपर्क करें।',
      en: 'Contact on WhatsApp for instant confirmation & tracking.',
    },
    codAssurance: {
      hi: 'कैश ऑन डिलीवरी उपलब्ध • सामान देखकर भुगतान करें',
      en: 'Cash on Delivery Available • Pay After Inspection',
    },
    fitGuarantee: {
      hi: '100% सही साइज व आसान 7-दिन एक्सचेंज',
      en: '100% Fit Guarantee & Easy 7-Day Exchange',
    },
  },
  toasts: {
    addedToCart: {
      hi: 'प्रोडक्ट बैग में जोड़ दिया गया है!',
      en: 'Item added to your shopping bag!',
    },
    addedToWishlist: {
      hi: 'विशलिस्ट में सहेज लिया गया!',
      en: 'Saved to your wishlist!',
    },
    removedFromWishlist: {
      hi: 'विशलिस्ट से हटा दिया गया।',
      en: 'Removed from your wishlist.',
    },
    couponApplied: {
      hi: (code: string) => `कूपन "${code}" सफलतापूर्वक लागू हुआ!`,
      en: (code: string) => `Coupon "${code}" applied successfully!`,
    },
    couponRemoved: {
      hi: 'कूपन हटा दिया गया।',
      en: 'Coupon removed.',
    },
    orderCancelled: {
      hi: 'ऑर्डर रद्द कर दिया गया है।',
      en: 'Order has been cancelled.',
    },
    friendlyError: {
      hi: 'कुछ समस्या आ गई है। कृपया थोड़ी देर बाद दोबारा प्रयास करें।',
      en: 'Something went wrong. Please try again shortly.',
    },
  },
  dialogues: {
    weLoveYourChoice: {
      hi: 'आपकी पसंद हमें बहुत पसंद आई। ❤️',
      en: 'We love your choice. ❤️',
    },
    helpPrompt: {
      hi: 'क्या आपको सही साइज या डिजाइन चुनने में सहायता चाहिए?',
      en: 'Need help choosing the right size or design?',
    },
    chatWithUs: {
      hi: 'व्हाट्सऐप पर हमसे बात करें',
      en: 'Chat with us on WhatsApp',
    },
  },
};

/**
 * WhatsApp Template Dictionaries in Hindi & English
 */
export const DEFAULT_CUSTOMER_WHATSAPP_TEMPLATES = {
  orderReceived: {
    title: 'Order Received',
    hi: `नमस्ते! 👋
{shopName} पर आपका ऑर्डर प्राप्त हो गया है।

🆔 *ऑर्डर आईडी:* #{orderId}
📦 *प्रोडक्ट:* {productName}
💰 *कुल राशि:* {finalPrice}
📍 *डिलीवरी पता:* {deliveryAddress}, {city}

आपके भरोसे के लिए दिल से धन्यवाद। ❤️
हम आपका ऑर्डर जल्द ही तैयार करेंगे।

धन्यवाद,
*{shopName}*`,
    en: `Hello! 👋
Your order has been received successfully at {shopName}.

🆔 *Order ID:* #{orderId}
📦 *Product:* {productName}
💰 *Total Amount:* {finalPrice}
📍 *Delivery Address:* {deliveryAddress}, {city}

Thank you for trusting us. ❤️
We will prepare your order shortly.

Warm regards,
*{shopName}*`,
  },
  orderConfirmed: {
    title: 'Order Confirmed',
    hi: `नमस्ते {customerName}! 👋
खुशखबरी! आपका ऑर्डर #{orderId} सफलतापूर्वक कन्फर्म कर दिया गया है। ✅

📦 *प्रोडक्ट:* {productName}
📏 *साइज:* {selectedSize}
💰 *कुल राशि:* {finalPrice}
💳 *भुगतान विधि:* {paymentMethod}

जल्द ही आपका पार्सल डिस्पैच कर दिया जाएगा। 🚚
*{shopName}*`,
    en: `Hello {customerName}! 👋
Great news! Your order #{orderId} has been confirmed. ✅

📦 *Product:* {productName}
📏 *Size:* {selectedSize}
💰 *Total Amount:* {finalPrice}
💳 *Payment Method:* {paymentMethod}

Your package will be dispatched shortly. 🚚
*{shopName}*`,
  },
  orderPacked: {
    title: 'Order Packed',
    hi: `नमस्ते {customerName}!
आपका ऑर्डर #{orderId} पूरी सावधानी और 100% क्वालिटी जांच के साथ पैक हो चुका है। 📦✨
जल्द ही कूरियर पार्टनर इसे लेकर रवाना होगा।

*{shopName}*`,
    en: `Hello {customerName}!
Your order #{orderId} has been safely packed after thorough quality inspection. 📦✨
It will be handed to our courier partner soon.

*{shopName}*`,
  },
  readyToDispatch: {
    title: 'Ready to Dispatch',
    hi: `नमस्ते {customerName}!
आपका ऑर्डर #{orderId} डिस्पैच के लिए पूरी तरह तैयार है। 🚚💨

*{shopName}*`,
    en: `Hello {customerName}!
Your order #{orderId} is ready for dispatch. 🚚💨

*{shopName}*`,
  },
  shipped: {
    title: 'Order Shipped',
    hi: `नमस्ते {customerName}! 🚚
खुशखबरी! आपका ऑर्डर #{orderId} रवाना (Shipped) कर दिया गया है।
पार्सल जल्द ही आपके दिए गए पते पर पहुंचेगा।

📍 *डिलीवरी पता:* {deliveryAddress}, {city}

*{shopName}*`,
    en: `Hello {customerName}! 🚚
Great news! Your order #{orderId} has been dispatched.
Your parcel is on its way to your delivery address.

📍 *Address:* {deliveryAddress}, {city}

*{shopName}*`,
  },
  delivered: {
    title: 'Delivered',
    hi: `नमस्ते {customerName}! 🎉
आपका ऑर्डर #{orderId} सफलतापूर्वक डिलीवर हो चुका है।
हमें उम्मीद है कि आपको हमारे जूते और सेवा पसंद आएगी।

*{shopName}* से जुड़ने के लिए धन्यवाद! ❤️`,
    en: `Hello {customerName}! 🎉
Your order #{orderId} has been successfully delivered.
We hope you love your new footwear!

Thank you for shopping with *{shopName}*! ❤️`,
  },
  cancelled: {
    title: 'Order Cancelled',
    hi: `नमस्ते {customerName},
आपका ऑर्डर #{orderId} अनुरोध अनुसार रद्द कर दिया गया है।
यदि आपने ऑनलाइन भुगतान किया था, तो रिफंड 3-5 कार्य दिवसों में पूरा हो जाएगा।

किसी भी सहायता के लिए हमसे संपर्क करें।
*{shopName}*`,
    en: `Hello {customerName},
Your order #{orderId} has been cancelled as per request.
If prepaid, your refund will be processed in 3-5 business days.

Reach out to us for any assistance.
*{shopName}*`,
  },
  paymentReceived: {
    title: 'Payment Received',
    hi: `नमस्ते {customerName}! ✅
ऑर्डर #{orderId} के लिए {finalPrice} का भुगतान सफलतापूर्वक प्राप्त हो गया है।
धन्यवाद!

*{shopName}*`,
    en: `Hello {customerName}! ✅
Payment of {finalPrice} for Order #{orderId} has been received successfully.
Thank you!

*{shopName}*`,
  },
  paymentPending: {
    title: 'Payment Pending',
    hi: `नमस्ते {customerName},
आपके ऑर्डर #{orderId} का भुगतान अभी बाकी है। कृपया दिए गए UPI QR कोड पर {finalPrice} का भुगतान पूरा करें ताकि हम तुरंत पार्सल रवाना कर सकें।

*{shopName}*`,
    en: `Hello {customerName},
Payment for your order #{orderId} ({finalPrice}) is currently pending. Please complete payment via UPI to enable instant dispatch.

*{shopName}*`,
  },
  productEnquiry: {
    title: 'Product Enquiry',
    hi: `नमस्ते *{shopName}*! 👋
मुझे इस प्रोडक्ट के बारे में जानकारी चाहिए:

📦 *प्रोडक्ट:* {productName}
📏 *साइज:* {selectedSize}
🎨 *कलर:* {selectedColor}
💰 *कीमत:* {finalPrice}
🔗 *लिंक:* {productURL}

क्या यह उपलब्ध है? कृपया पुष्टि करें।`,
    en: `Hello *{shopName}*! 👋
I would like to enquire about this product:

📦 *Product:* {productName}
📏 *Size:* {selectedSize}
🎨 *Color:* {selectedColor}
💰 *Price:* {finalPrice}
🔗 *Link:* {productURL}

Is this in stock? Please confirm.`,
  },
  customerEnquiry: {
    title: 'General Customer Enquiry',
    hi: `नमस्ते *{shopName}*! 👋
मुझे आपके स्टोर और कलेक्शन के बारे में जानकारी चाहिए।
{customQuery}

कृपया सहायता करें।`,
    en: `Hello *{shopName}*! 👋
I have an inquiry regarding your store and collections.
{customQuery}

Please assist.`,
  },
  storeContact: {
    title: 'Store Location & Timings',
    hi: `नमस्ते *{shopName}*! 👋
मुझे आपकी दुकान के पते, खुलने के समय या प्रोडक्ट्स के बारे में पूछना है।`,
    en: `Hello *{shopName}*! 👋
I would like to check your showroom address, business hours, and product availability.`,
  },
  feedbackRequest: {
    title: 'Customer Feedback Request',
    hi: `नमस्ते {customerName}! ⭐
*{shopName}* से की गई खरीदारी का आपका अनुभव कैसा रहा?
कृपया अपनी बहुमूल्य समीक्षा हमारे साथ साझा करें।

आपके विचार हमारे लिए बहुत महत्वपूर्ण हैं! ❤️`,
    en: `Hello {customerName}! ⭐
How was your shopping experience with *{shopName}*?
We would love to hear your feedback and review.

Your feedback means the world to us! ❤️`,
  },
};
