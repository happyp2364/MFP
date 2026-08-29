import { WebsiteConfig, SocialLinkItem } from '../types';

export const DEFAULT_SOCIAL_LINKS: SocialLinkItem[] = [
  {
    id: 'soc_1',
    platform: 'Instagram',
    title: 'Instagram',
    username: '@marudhar_fashion_point',
    url: 'https://www.instagram.com/marudhar_fashion_point/',
    enabled: true,
    openInNewTab: true,
    displayOrder: 1,
  },
  {
    id: 'soc_2',
    platform: 'Facebook',
    title: 'Facebook Page',
    username: 'Marudhar Fashion Point Official',
    url: 'https://www.facebook.com/share/1Antw1LgKS/',
    enabled: true,
    openInNewTab: true,
    displayOrder: 2,
  },
  {
    id: 'soc_3',
    platform: 'WhatsApp',
    title: 'WhatsApp Ordering',
    username: '+91 9782482250',
    url: 'https://wa.me/919782482250',
    enabled: true,
    openInNewTab: true,
    displayOrder: 3,
  },
  {
    id: 'soc_4',
    platform: 'YouTube',
    title: 'YouTube Channel',
    username: 'Marudhar Fashion Point Jodhpur',
    url: 'https://yt.openinapp.co/10n4u',
    enabled: true,
    openInNewTab: true,
    displayOrder: 4,
  },
];

export const DEFAULT_WEBSITE_CONFIG: WebsiteConfig = {
  // Section 1: Business Identity
  businessIdentity: {
    businessName: 'Marudhar Fashion Point',
    displayName: 'Marudhar Fashion Point',
    legalName: 'Marudhar Fashion Point Private Limited',
    brandName: 'Marudhar',
    tagline: 'Style for Every Step.',
    shortDescription: "Pipar City's premier destination for high-grade athletic sneakers, royal Rajasthani mojaris, and designer family footwear.",
    longDescription: "Marudhar Fashion Point is Rajasthan's top-rated family footwear store bringing high-performance footwear, authentic craftsmanship, and orthopedic comfort at fair prices.",
    aboutBusiness: 'Built on trust, personal service, and uncompromised quality since 2010.',
    businessStory: 'Founded in 2010 by Viju Bhai in Pipar City, Marudhar Fashion Point originated with a singular mission: to bring authentic, high-grade footwear to families across Rajasthan at fair prices.',
    establishedYear: '2010',
    gstNumber: '08AAAAA0000A1Z5',
    panNumber: 'ABCDE1234F',
    cinNumber: 'U52100RJ2010PTC000000',
    licenseNumbers: 'RJ-PIPAR-SHOP-2010-8849',
    ownerName: 'Vijay Parihar',
    coOwnerNames: 'Vishal Parihar',
    founderDetails: 'Viju Bhai (Vijay Parihar) — Founder & Master Craftsman',
    logoUrl: '/logo.png',
    lightLogoUrl: '/logo.png',
    darkLogoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
    loadingLogoUrl: '/logo.png',
    splashLogoUrl: '/logo.png',
    emailSignatureLogoUrl: '/logo.png',
  },

  // Section 2: Contact Details
  contactDetails: {
    phone: '+91 9782482250',
    altPhone: '+91 9782482251',
    whatsappNumber: '919782482250',
    customerCareNumber: '+91 9782482250',
    tollFreeNumber: '1800-123-4567',
    email: 'marudharfashionpoint@gmail.com',
    supportEmail: 'support@marudharfashionpoint.com',
    salesEmail: 'sales@marudharfashionpoint.com',
    billingEmail: 'billing@marudharfashionpoint.com',
    websiteUrl: 'https://marudharfashionpoint.com',
  },

  // Section 3: Address
  address: {
    shopAddress: 'JOJRI NADI KE PASS, MISTRI MARKET, PIPAR CITY, Rajasthan 342601',
    billingAddress: 'JOJRI NADI KE PASS, MISTRI MARKET, PIPAR CITY, Rajasthan 342601',
    warehouseAddress: 'JOJRI NADI KE PASS, MISTRI MARKET, PIPAR CITY, Rajasthan 342601',
    returnAddress: 'JOJRI NADI KE PASS, MISTRI MARKET, PIPAR CITY, Rajasthan 342601',
    googleMapsLink: 'https://maps.google.com/?q=Pipar+City+Rajasthan',
    latitude: 26.3862,
    longitude: 73.5414,
    landmark: 'Near Jojri Nadi & Mistri Market',
    city: 'Pipar City',
    district: 'Jodhpur',
    state: 'Rajasthan',
    country: 'India',
    pinCode: '342601',
  },

  // Section 4: Social Media
  socialMedia: {
    links: DEFAULT_SOCIAL_LINKS,
  },

  // Section 5: Store Settings
  storeSettings: {
    storeName: 'Marudhar Fashion Point Main Store',
    storeStatus: 'open',
    businessHours: 'Monday - Sunday: 9:00 AM - 9:30 PM',
    holidayCalendar: 'Open 365 Days a Year (Special Festive Timing on Diwali & Holi)',
    emergencyNotice: '',
    storeBannerUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
    storePhotos: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    ],
    storeVideos: [],
  },

  // Section 6: SEO
  seo: {
    websiteTitle: 'Marudhar Fashion Point — Premium Footwear & Athletic Shoes',
    metaTitle: 'Marudhar Fashion Point — Best Family Shoe Store in Rajasthan',
    metaDescription: 'Discover high-grade athletic sneakers, royal leather loafers, and Rajasthani juttis at Marudhar Fashion Point. Order online with free delivery and COD.',
    keywords: ['Marudhar Fashion Point', 'Shoe Store Pipar City', 'Athletic Shoes', 'Rajasthani Jutti', 'Leather Shoes', 'Sneakers Jodhpur'],
    canonicalUrl: 'https://marudharfashionpoint.com',
    ogImageUrl: '/logo.png',
    twitterCard: 'summary_large_image',
    structuredDataJson: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ShoeStore",
      "name": "Marudhar Fashion Point",
      "address": "Pipar City, Rajasthan 342601",
      "telephone": "+91 9782482250"
    }, null, 2),
    googleVerificationCode: '',
    bingVerificationCode: '',
  },

  // Section 7: Branding
  branding: {
    primaryColor: '#F59E0B',
    secondaryColor: '#10B981',
    accentColor: '#3B82F6',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: 'md',
    buttonStyle: 'gradient',
  },

  // Section 8: Footer
  footer: {
    copyrightText: '© 2026 Marudhar Fashion Point. All Rights Reserved. Built with Royal Quality Standards.',
    footerLinks: [
      { label: 'Shop Men', url: '/category/men' },
      { label: 'Shop Women', url: '/category/women' },
      { label: 'Shop Kids', url: '/category/kids' },
      { label: 'Store Locator', url: '#store-locator' },
      { label: 'Track Order', url: '#track' },
    ],
    privacyPolicyLink: '#privacy',
    termsLink: '#terms',
    refundPolicyLink: '#refund',
    shippingPolicyLink: '#shipping',
    aboutLink: '#about',
    contactLink: '#contact',
  },

  // Section 9: Legal Documents
  legal: {
    privacyPolicy: 'Marudhar Fashion Point values your privacy. We store customer information securely and never sell your personal data.',
    termsAndConditions: 'All orders placed on Marudhar Fashion Point are subject to availability and verification. Prices include applicable taxes.',
    refundPolicy: 'Easy 7-day returns and exchanges available for size and manufacturing defects. Open Box Delivery is supported.',
    shippingPolicy: 'Free shipping on orders above ₹999. Local deliveries in Rajasthan delivered within 24-48 hours.',
    cancellationPolicy: 'Orders can be cancelled prior to dispatch directly from your account or by calling customer care.',
    cookiePolicy: 'We use essential browser cookies to remember your cart, wishlist, and preference settings.',
    disclaimer: 'Product colors may slightly vary due to photographic lighting sources or your monitor settings.',
  },

  // Section 10: Emails
  emails: {
    emailHeader: '<div style="background:#111;padding:20px;text-align:center;"><h1 style="color:#F59E0B;">Marudhar Fashion Point</h1></div>',
    emailFooter: '<div style="padding:15px;text-align:center;font-size:12px;color:#888;">© 2026 Marudhar Fashion Point. Thank you for shopping with us!</div>',
    emailSignature: 'Warm regards,\nThe Marudhar Fashion Point Team\nCustomer Care: +91 9782482250',
    supportName: 'Marudhar Customer Care',
    supportEmail: 'support@marudharfashionpoint.com',
  },

  // Section 11: WhatsApp
  whatsApp: {
    greeting: 'Hello! Welcome to Marudhar Fashion Point 👟✨ How can we assist you today?',
    autoReply: 'Thank you for contacting Marudhar Fashion Point. Our team will get back to you shortly!',
    businessName: 'Marudhar Fashion Point',
    supportNumber: '919782482250',
  },

  // Section 12: AI Pet
  aiPet: {
    customPrompts: 'You are the official AI Pet Assistant for Marudhar Fashion Point. Be friendly, polite, and assist customers with shoe sizes, order status, and store directions.',
    autoUseStoreInfo: true,
  },

  // Section 13: Invoices
  invoices: {
    logoUrl: '/logo.png',
    address: 'JOJRI NADI KE PASS, MISTRI MARKET, PIPAR CITY, Rajasthan 342601',
    gstNumber: '08AAAAA0000A1Z5',
    phone: '+91 9782482250',
    email: 'marudharfashionpoint@gmail.com',
    website: 'https://marudharfashionpoint.com',
    qrCodeUrl: '',
    footerText: 'Thank you for your purchase from Marudhar Fashion Point! Returns accepted within 7 days with valid invoice.',
  },

  // Section 14: Store Locator
  storeLocator: {
    stores: [],
  },

  // Section 15: Customer Communication & Language Control
  customerLanguage: 'hi',
  customerCommunication: {
    language: 'hi',
    slogans: {
      hi: [
        'हर कदम में स्टाइल',
        'आपका स्टाइल, हमारी पहचान',
        'फैशन जो आपके अंदाज़ को बनाए खास',
        'हर मौके के लिए शानदार स्टाइल',
      ],
      en: [
        'Style for Every Step',
        'Your Style, Our Identity',
        'Fashion That Makes You Stand Out',
        'Signature Styles for Every Occasion',
      ],
    },
    welcomeMessage: {
      hi: 'आपका स्वागत है • मारूधर फैशन पॉइंट',
      en: 'Welcome to Marudhar Fashion Point',
    },
    orderConfirmationMessage: {
      hi: 'आपका ऑर्डर सफलतापूर्वक प्राप्त हो गया है।',
      en: 'Your order has been received successfully.',
    },
    cartAlmostCompleteMessage: {
      hi: 'आपकी खरीदारी लगभग पूरी हो चुकी है। ❤️',
      en: "You're almost ready to complete your purchase. ❤️",
    },
    limitedStockAlert: {
      hi: 'जल्दी करें, स्टॉक सीमित है!',
      en: 'Hurry, Limited Stock Available!',
    },
    friendlyErrorMessage: {
      hi: 'कुछ समस्या आ गई है। कृपया थोड़ी देर बाद दोबारा प्रयास करें।',
      en: 'Something went wrong. Please try again shortly.',
    },
  },

  version: 1,
  lastUpdated: new Date().toISOString(),
  updatedBy: 'System',
};
