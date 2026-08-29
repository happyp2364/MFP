/**
 * MARUDHAR FASHION POINT - BILINGUAL HINDI + ENGLISH CONTENT SYSTEM
 * 
 * Provides natural, conversational, premium Indian English and Hindi
 * content pairs and helper utilities for the entire website.
 */

export { getCustomerLanguage, getCustomerText, CUSTOMER_COMMUNICATION_DICTIONARY, DEFAULT_CUSTOMER_WHATSAPP_TEMPLATES } from './customerLanguage';

export interface BilingualPair {
  hi: string;
  en: string;
}

/**
 * Combines Hindi and English into a polished bilingual string.
 * e.g. "आपका स्वागत है • Welcome to Marudhar Fashion Point"
 */
export function bilingual(hi: string, en: string, separator: string = ' • '): string {
  if (!hi && !en) return '';
  if (!hi) return en;
  if (!en) return hi;
  return `${hi}${separator}${en}`;
}

/**
 * Helper to extract or format bilingual pair object
 */
export function formatBilingual(pair: BilingualPair, separator: string = ' • '): string {
  return bilingual(pair.hi, pair.en, separator);
}

// 1. GLOBAL NAVIGATION & HEADER
export const BILINGUAL_NAV = {
  home: 'होम • Home',
  shop: 'शॉप • Shop',
  men: 'पुरुष • Men',
  women: 'महिलाएं • Women',
  kids: 'बच्चे • Kids',
  all: 'सभी कलेक्शन • All Collection',
  collections: 'कलेक्शन • Collections',
  about: 'हमारे बारे में • About Us',
  contact: 'संपर्क करें • Contact Us',
  storeLocator: 'स्टोर खोजें • Store Locator',
  trackOrder: 'ऑर्डर ट्रैक करें • Track Order',
  search: 'सर्च करें • Search',
  searchPlaceholder: 'जूते, स्नीकर्स या ब्रांड खोजें... • Search shoes, sneakers or brands...',
  wishlist: 'विशलिस्ट • Wishlist',
  cart: 'कार्ट • Cart',
  account: 'खाता • Account',
  admin: 'एडमिन • Admin',
  adminLogin: 'एडमिन लॉगिन • Admin Login',
  backToHome: '← होमपेज पर वापस जाएं • Back to Homepage',
  bookFitting: 'वीआईपी फिटिंग बुक करें • VIP Fitting Booking',
  help: 'सहायता • Help',
  menu: 'मेनू • Menu',
  close: 'बंद करें • Close',
};

// 2. ANNOUNCEMENT BAR
export const BILINGUAL_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    hi: 'पूरे भारत में चुनिंदा प्रोडक्ट्स पर फ्री डिलीवरी',
    en: 'Free Delivery Across India on Selected Footwear',
    text: '🚚 पूरे भारत में फ्री डिलीवरी • Free Delivery Across India',
    icon: 'Truck',
  },
  {
    id: 'ann-2',
    hi: 'नए सीज़न के स्पोर्ट्स शूज और स्नीकर्स उपलब्ध',
    en: 'New Season Sports Shoes & Sneakers Just Arrived',
    text: '👟 नए सीज़न के जूते और स्नीकर्स • New Season Arrivals Just In',
    icon: 'Sparkles',
  },
  {
    id: 'ann-3',
    hi: '15,000+ खुश परिवारों का भरोसेमंद स्टोर',
    en: 'Rated 4.9/5 by 15,000+ Happy Families',
    text: '⭐ 15,000+ खुश परिवारों का भरोसा • Trusted by 15,000+ Happy Families',
    icon: 'Award',
  },
  {
    id: 'ann-4',
    hi: 'आसान व्हाट्सऐप ऑर्डर और तुरंत कन्फर्मेशन',
    en: 'Easy WhatsApp Order & Instant Confirmation',
    text: '📱 आसान व्हाट्सऐप ऑर्डर • Easy WhatsApp Order & Quick Confirmation',
    icon: 'MessageCircle',
  },
];

// 3. HERO SLOGANS & CTAS
export const BILINGUAL_HERO = {
  badge: {
    hi: 'पधारो सा • 100% असली व प्रीमियम',
    en: 'Welcome • 100% Authentic Quality Since 2010',
  },
  slogans: [
    {
      hi: 'हर कदम में स्टाइल',
      en: 'Style in Every Step',
      subHi: 'जोधपुर व पीपाड़ सिटी का सबसे भरोसेमंद फैमिली फुटवियर स्टोर',
      subEn: "Rajasthan's premier destination for athletic sneakers, luxury loafers & Rajasthani craft.",
    },
    {
      hi: 'आपका स्टाइल, हमारी पहचान',
      en: 'Your Style, Our Identity',
      subHi: 'फैशन और आराम का सबसे शानदार संगम',
      subEn: 'Experience pure comfort with orthopedic memory cushioning and designer silhouettes.',
    },
    {
      hi: 'फैशन जो आपके अंदाज़ को बनाए खास',
      en: 'Fashion That Makes Your Style Stand Out',
      subHi: 'हर मौके के लिए खास और आकर्षक फुटवियर',
      subEn: 'From high-octane sports to grand wedding celebrations, step out with confidence.',
    },
    {
      hi: 'हर मौके के लिए शानदार स्टाइल',
      en: 'Signature Styles for Every Occasion',
      subHi: 'किफायती दाम, बेमिसाल मजबूती और भरोसा',
      subEn: 'Unmatched durability, fair transparent pricing, and royal craftsmanship.',
    },
  ],
  ctaExplore: 'कलेक्शन देखें • Explore Collection',
  ctaShopNow: 'अभी खरीदें • Shop Now',
  ctaWhatsApp: 'व्हाट्सऐप पर ऑर्डर करें • Order on WhatsApp',
  ctaViewDetails: 'विवरण देखें • View Details',
};

// 4. PRODUCT SECTIONS & HEADINGS
export const BILINGUAL_SECTIONS = {
  newArrivals: {
    title: 'नए आगमन • New Arrivals',
    subtitle: 'ताज़ा और लेटेस्ट ट्रेंडिंग स्टाइल • Fresh Drops & Season Highlights',
  },
  bestSellers: {
    title: 'सबसे ज्यादा पसंद किए गए • Best Sellers',
    subtitle: 'ग्राहकों की पहली पसंद • Customer Favorites in Store',
  },
  trendingStyles: {
    title: 'ट्रेंडिंग स्टाइल • Trending Styles',
    subtitle: 'इस सीज़न के सबसे लोकप्रिय शूज • Hot & In-Demand Right Now',
  },
  featuredCollection: {
    title: 'विशेष संग्रह • Featured Collection',
    subtitle: 'खास आपके लिए चुना गया स्टाइल • Handpicked Premium Selections',
  },
  justForYou: {
    title: 'खास आपके लिए • Just For You',
    subtitle: 'आपकी पसंद के अनुसार तैयार • Specially Curated for You',
  },
  todayTopPicks: {
    title: 'आज की खास पसंद • Today\'s Top Picks',
    subtitle: 'धमाकेदार डील्स और शानदार क्वालिटी • Exceptional Style at Great Value',
  },
  pricePoint699: {
    title: 'धमाका सेल ₹699 • Special ₹699 Collection',
    subtitle: 'बजट में बेस्ट क्वालिटी और भरपूर स्टाइल • Premium Quality at Unbeatable Price',
  },
  categories: {
    title: 'कलेक्शन अनुसार खरीदारी • Shop by Category',
    subtitle: 'पूरे परिवार के लिए शानदार विकल्प • Designed for Men, Women & Kids',
  },
  reviews: {
    title: 'ग्राहकों की राय • Customer Reviews',
    subtitle: '15,000+ संतुष्ट ग्राहकों का भरोसा • Real Stories from Real Shoppers',
  },
  aboutUs: {
    title: 'हमारी कहानी • Our Story',
    subtitle: '2010 से राजस्थान का भरोसेमंद फुटवियर स्टोर • Trusted Footwear Heritage Since 2010',
  },
  contactUs: {
    title: 'हमसे संपर्क करें • Contact Us',
    subtitle: 'हम आपकी मदद के लिए हमेशा तैयार हैं • Always Here to Help You',
  },
  storeLocator: {
    title: 'स्टोर लोकेटर • Store Locator',
    subtitle: 'हमारे पीपाड़ सिटी स्टोर पर पधारें • Visit Our Flagship Pipar City Store',
  },
  instagramFeed: {
    title: 'इंस्टाग्राम पर जुड़ें • Follow on Instagram',
    subtitle: '@marudhar_fashion_point पर ताज़ा अपडेट्स • Real Customer Looks & Styling Inspo',
  },
};

// 5. PRODUCT CARD DIALOGUES & MICROCOPY
export const BILINGUAL_PRODUCT = {
  viewNow: 'अभी देखें • View Now',
  hurryUp: 'जल्दी करें • Hurry Up',
  limitedStock: 'सीमित स्टॉक • Limited Stock',
  popularChoice: 'लोकप्रिय पसंद • Popular Choice',
  newBadge: 'नया • New',
  bestSellerBadge: 'बेस्टसेलर • Best Seller',
  specialOfferBadge: 'खास ऑफर • Special Offer',
  trendingBadge: 'ट्रेंडिंग • Trending',
  almostSoldOut: 'स्टॉक खत्म होने वाला है • Almost Sold Out',
  inStock: 'स्टॉक में उपलब्ध • In Stock',
  outOfStock: 'स्टॉक समाप्त • Out of Stock',
  addToCart: 'कार्ट में जोड़ें • Add to Cart',
  buyNow: 'अभी खरीदें • Buy Now',
  orderOnWhatsApp: 'व्हाट्सऐप पर ऑर्डर करें • Order on WhatsApp',
  selectSize: 'साइज चुनें • Select Size',
  selectColor: 'रंग चुनें • Select Color',
  viewDetails: 'विवरण देखें • View Details',
  quickView: 'त्वरित झलक • Quick View',
  inclusiveTaxes: 'सभी कर सहित • Inclusive of all taxes',
  freeDelivery: 'मुफ्त डिलीवरी • Free Delivery',
  openBoxDelivery: 'ओपन बॉक्स डिलीवरी • Open Box Delivery',
  cashOnDelivery: 'कैश ऑन डिलीवरी उपलब्ध • Cash on Delivery Available',
  sevenDaysReturn: '7 दिन में आसान वापसी • 7-Day Easy Returns',
  savePercent: 'बचत • Save',
  originalPrice: 'मूल्य • MRP',
  ourPrice: 'ऑफर मूल्य • Offer Price',
  sizesAvailable: 'उपलब्ध साइज • Available Sizes',
  colorsAvailable: 'उपलब्ध रंग • Available Colors',
  specifications: 'उत्पाद विवरण • Product Specifications',
  features: 'मुख्य विशेषताएं • Key Features',
};

// 6. OFFERS & PROMOTIONAL SLOGANS
export const BILINGUAL_OFFERS = {
  todayExclusive: "आज का धमाकेदार ऑफर! • Today's Exclusive Deal!",
  moreStyleMoreSavings: "स्टाइल भी, बचत भी! • More Style, More Savings!",
  speciallyCurated: "खास आपके लिए, खास कीमत पर • Specially Curated, Specially Priced",
  dontMiss: "मौका हाथ से न जाने दें • Don't Miss This Opportunity!",
  shopTodayStyleTomorrow: "आज की खरीदारी, कल का शानदार स्टाइल • Shop Today, Style Tomorrow",
  timeToUpgrade: "स्टाइल बदलने का समय आ गया है! • It's Time to Upgrade Your Style!",
  nextFavorite: "आपका अगला पसंदीदा स्टाइल शायद यहीं है! • Your Next Favorite Style Might Be Here!",
  makeEveryLookSpecial: "जो पहनें, वो खास हो • Make Every Look Special",
  whyCompromise: "स्टाइल में समझौता क्यों? • Why Compromise on Style?",
  confidenceInEveryStep: "हर कदम पर आत्मविश्वास • Confidence in Every Step",
  rajasthaniWelcome: "पधारो सा • Welcome",
  rajasthaniIdentity: "म्हारो स्टाइल, म्हारी पहचान • Our Style, Our Identity",
  rajasthaniTrust: "आपणो भरोसो, आपणो स्टाइल • Your Trust, Your Style",
  spinAndWin: "पहिया घुमाएं और जीतें • Spin the Wheel & Win",
  scratchAndWin: "स्क्रैच करें और इनाम पाएं • Scratch & Win Extra Discount",
};

// 7. CART DRAWER & ORDER SHEET
export const BILINGUAL_CART = {
  title: 'आपका शॉपिंग बैग • Your Shopping Bag',
  yourPicks: 'आपकी पसंद यहाँ है • Your Picks Are Here',
  addMore: 'अभी कुछ और जोड़ें • Add Something More',
  cartEmpty: 'आपका कार्ट खाली है • Your Cart Is Empty',
  cartEmptyDesc: 'आपने अभी तक कोई जूता या स्नीकर कार्ट में नहीं जोड़ा है • You haven\'t added any footwear to your bag yet.',
  startShopping: 'खरीदारी शुरू करें • Start Shopping',
  orderSummary: 'ऑर्डर सारांश • Order Summary',
  subtotal: 'उप-योग • Subtotal',
  shipping: 'डिलीवरी शुल्क • Delivery Fee',
  freeShippingText: 'मुफ्त • FREE',
  discount: 'छूट • Discount',
  totalAmount: 'कुल राशि • Total Amount',
  proceedToCheckout: 'चेकआउट के लिए आगे बढ़ें • Proceed to Checkout',
  clearCart: 'कार्ट खाली करें • Clear Cart',
  quantity: 'मात्रा • Quantity',
  size: 'साइज • Size',
  color: 'रंग • Color',
  remove: 'हटाएं • Remove',
  orderOnWhatsAppDirect: 'सीधे व्हाट्सऐप पर ऑर्डर करें • Order Directly on WhatsApp',
};

// 8. CHECKOUT & ORDERS
export const BILINGUAL_CHECKOUT = {
  orderReady: 'आपका ऑर्डर तैयार है • Your Order Is Ready',
  confirmOrder: 'ऑर्डर की पुष्टि करें • Confirm Your Order',
  orderSuccessReceived: 'आपका ऑर्डर सफलतापूर्वक मिल गया है! • Your Order Has Been Successfully Received!',
  thankYouTrust: 'धन्यवाद! आपका भरोसा हमारे लिए खास है • Thank You! Your Trust Means Everything to Us.',
  deliveryDetails: 'डिलीवरी का पता • Delivery Address',
  contactInfo: 'संपर्क जानकारी • Contact Details',
  fullName: 'पूरा नाम • Full Name',
  phoneNumber: 'मोबाइल नंबर • Mobile Phone Number',
  deliveryAddress: 'मकान / दुकान का पता व लैंडमार्क • Complete Address & Landmark',
  city: 'शहर / गांव • City / Town',
  state: 'राज्य • State',
  pinCode: 'पिन कोड • PIN Code',
  paymentMethod: 'भुगतान का तरीका • Payment Method',
  payUPI: 'ऑनलाइन / यूपीआई / क्यूआर कोड • Online / Instant UPI / QR Code',
  payCOD: 'कैश ऑन डिलीवरी • Cash on Delivery (COD)',
  placeOrderBtn: 'ऑर्डर पूरा करें • Place Order Now',
  orderIdLabel: 'ऑर्डर आईडी • Order ID',
  orderStatusLabel: 'ऑर्डर स्थिति • Order Status',
  orderDateLabel: 'तारीख • Order Date',
  trackYourOrder: 'अपना ऑर्डर ट्रैक करें • Track Your Order',
  downloadInvoice: 'बिल / इनवॉयस डाउनलोड करें • Download Tax Invoice',
  continueShopping: 'और खरीदारी करें • Continue Shopping',
};

// 9. WHATSAPP ORDERING CTA
export const BILINGUAL_WHATSAPP = {
  orderOnWhatsApp: 'व्हाट्सऐप पर ऑर्डर करें • Order on WhatsApp',
  oneMessageAway: 'बस एक मैसेज और आपका ऑर्डर तैयार • Just One Message Away From Your Order',
  stepGuide: 'ऑर्डर करें • कन्फर्म करें • घर बैठे पाएं • Order • Confirm • Receive',
  needHelp: 'मदद चाहिए? व्हाट्सऐप पर बात करें • Need Help? Chat with us on WhatsApp',
  instantSupport: 'त्वरित सहायता • Instant Support 24/7',
};

// 10. CUSTOMER SERVICE & CONTACT
export const BILINGUAL_CUSTOMER_SERVICE = {
  alwaysHere: "हम आपकी मदद के लिए हमेशा तैयार हैं • We're Always Here to Help",
  haveQuestion: 'कोई सवाल है? हमसे बात करें • Have a Question? Talk to Us',
  prioritySatisfaction: 'आपकी संतुष्टि हमारी प्राथमिकता है • Your Satisfaction Is Our Priority',
  callUs: 'कॉल करें • Call Us',
  emailUs: 'ईमेल भेजें • Email Us',
  visitStore: 'दुकान पर पधारें • Visit Our Store',
  storeTimings: 'दुकान का समय: सुबह 9:00 से रात 9:30 बजे तक • Store Hours: 9:00 AM - 9:30 PM (Daily)',
  addressLabel: 'दुकान का पता • Shop Address',
  landmarkLabel: 'लैंडमार्क • Landmark',
  directions: 'दिशा-निर्देश देखें (गूगल मैप्स) • Get Directions on Google Maps',
};

// 11. EMPTY STATES
export const BILINGUAL_EMPTY = {
  noProducts: 'अभी कोई प्रोडक्ट उपलब्ध नहीं है • No Products Available Yet',
  noOrders: 'कोई ऑर्डर नहीं मिला • No Orders Found',
  noResults: 'कोई परिणाम नहीं मिला • No Results Found',
  emptyWishlist: 'आपकी विशलिस्ट खाली है • Your Wishlist is Empty',
  emptyWishlistDesc: 'पसंदीदा जूतों को दिल के निशान पर क्लिक करके सेव करें • Save your favorite shoes by tapping the heart icon.',
  emptyCartDesc: 'कार्ट में कोई आइटम नहीं है • No items in your bag.',
  browseCatalog: 'कैटलॉग देखें • Browse Catalog',
  resetFilters: 'फ़िल्टर हटाएं • Clear All Filters',
};

// 12. ERROR & NOTIFICATION MESSAGES
export const BILINGUAL_MESSAGES = {
  somethingWrong: 'कुछ समस्या आ गई है • Something went wrong',
  pleaseTryAgain: 'कृपया दोबारा प्रयास करें • Please try again',
  connectionIssue: 'कनेक्शन की समस्या है • There seems to be a connection issue',
  savedSuccessfully: 'सफलतापूर्वक सेव हो गया • Saved Successfully',
  orderSubmitted: 'ऑर्डर सफलतापूर्वक भेज दिया गया • Order Submitted Successfully',
  infoUpdated: 'आपकी जानकारी अपडेट हो गई है • Your Information Has Been Updated',
  itemAddedToCart: 'आइटम कार्ट में जोड़ा गया • Item added to your shopping bag',
  itemAddedToWishlist: 'विशलिस्ट में जोड़ा गया • Added to your wishlist',
  itemRemovedWishlist: 'विशलिस्ट से हटाया गया • Removed from wishlist',
  itemRemovedCart: 'कार्ट से हटाया गया • Removed from cart',
  invalidPhone: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें • Please enter a valid 10-digit mobile number',
  fillRequiredFields: 'कृपया सभी आवश्यक फ़ील्ड भरें • Please fill in all required fields',
};

// 13. FOOTER
export const BILINGUAL_FOOTER = {
  passion: 'आपका स्टाइल, हमारा जुनून • Your Style, Our Passion',
  trustShopping: 'भरोसे के साथ फैशन की खरीदारी • Shop Fashion With Confidence',
  stayConnected: 'हमसे जुड़े रहें • Stay Connected With Us',
  copyright: '© 2026 मारुधर फैशन पॉइंट • Marudhar Fashion Point. सर्वाधिकार सुरक्षित • All Rights Reserved.',
  madeWithPride: 'राजस्थान के गौरव व भरोसे के साथ निर्मित • Crafted with Pride in Rajasthan',
  quickLinks: 'त्वरित लिंक • Quick Links',
  shopCategories: 'कलेक्शन • Shop Categories',
  customerCare: 'ग्राहक सेवा • Customer Care',
  legalPolicies: 'नीति व नियम • Policies & Terms',
};

// 14. ADMIN PANEL HEADINGS & ACTIONS
export const BILINGUAL_ADMIN = {
  panelTitle: 'मारुधर एडमिन पोर्टल • Marudhar Command Center',
  storeInfo: 'स्टोर की जानकारी • Store Information',
  productMgmt: 'उत्पाद प्रबंधन • Product Management',
  ordersTracking: 'ऑर्डर और ट्रैकिंग • Orders & Tracking',
  customerMgmt: 'ग्राहक प्रबंधन • Customer Management',
  paymentSetup: 'पेमेंट सेटअप • Payment Setup',
  websiteSettings: 'वेबसाइट सेटिंग्स • Website Settings',
  marketingCenter: 'मार्केटिंग और ग्रोथ • Marketing & Growth',
  socialMedia: 'सोशल मीडिया लिंक्स • Social Channels',
  reviewsMgmt: 'समीक्षाएं व रेटिंग • Customer Reviews',
  announcementBar: 'अनाउंसमेंट बार • Top Announcement Bar',
  saveChanges: 'बदलाव सेव करें • Save Changes',
  savedState: 'सहेजा गया • Saved',
  preview: 'पूर्वावलोकन • Live Preview',
  cancel: 'रद्द करें • Cancel',
  delete: 'हटाएं • Delete',
  edit: 'संपादित करें • Edit',
  addNewProduct: 'नया प्रोडक्ट जोड़ें • Add New Product',
  uploadImages: 'तस्वीरें अपलोड करें • Upload Photos',
  confirmDeleteProduct: 'क्या आप इस प्रोडक्ट को हटाना चाहते हैं? • Are you sure you want to delete this product?',
  confirmDeleteGeneral: 'क्या आप इसे हटाना चाहते हैं? • Are you sure you want to delete this item?',
  yesDelete: 'हां, हटाएं • Yes, Delete',
  confirmSaveChanges: 'क्या आप इन बदलावों को सेव करना चाहते हैं? • Do you want to save these changes?',
  yesSave: 'हां, सेव करें • Yes, Save Changes',
  discardChanges: 'बदलाव रद्द करें • Discard Changes',
  filterStatus: 'स्थिति अनुसार फ़िल्टर • Filter by Status',
  allOrders: 'सभी ऑर्डर • All Orders',
  pendingOrders: 'लंबित • Pending',
  confirmedOrders: 'पुष्टीकृत • Confirmed',
  shippedOrders: 'भेजा गया • Shipped',
  deliveredOrders: 'डिलीवर हुआ • Delivered',
  cancelledOrders: 'रद्द • Cancelled',
};
