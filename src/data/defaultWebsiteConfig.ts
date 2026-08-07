import { WebsiteConfig, SocialLinkItem } from '../types';

export const DEFAULT_SOCIAL_LINKS: SocialLinkItem[] = [
  {
    id: 'soc_1',
    platform: 'Instagram',
    title: 'Instagram',
    username: '@official_store',
    url: 'https://www.instagram.com/',
    enabled: true,
    openInNewTab: true,
    displayOrder: 1,
  },
  {
    id: 'soc_2',
    platform: 'Facebook',
    title: 'Facebook Page',
    username: 'Official Store Page',
    url: 'https://www.facebook.com/',
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
    username: 'Official Store Channel',
    url: 'https://youtube.com/',
    enabled: true,
    openInNewTab: true,
    displayOrder: 4,
  },
];

export const DEFAULT_WEBSITE_CONFIG: WebsiteConfig = {
  websiteId: 'tenant-default',
  tenantId: 'tenant-default',
  // Section 1: Business Identity
  businessIdentity: {
    businessName: 'Footwear Store',
    displayName: 'Footwear Store',
    legalName: 'Footwear Store Private Limited',
    brandName: 'Footwear Store',
    tagline: 'Style for Every Step.',
    shortDescription: "Premier destination for high-grade athletic sneakers, leather loafers, and designer family footwear.",
    longDescription: "A top-rated family footwear store bringing high-performance footwear, authentic craftsmanship, and orthopedic comfort at fair prices.",
    aboutBusiness: 'Built on trust, personal service, and uncompromised quality.',
    businessStory: 'Originated with a singular mission: to bring authentic, high-grade footwear to families at fair prices.',
    establishedYear: '2015',
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
    email: 'officialstore@gmail.com',
    supportEmail: 'support@officialstore.com',
    salesEmail: 'sales@officialstore.com',
    billingEmail: 'billing@officialstore.com',
    websiteUrl: 'https://nwd-phi.vercel.app',
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
    storeName: 'Official Footwear Store',
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
    websiteTitle: 'Footwear Store — Premium Footwear & Athletic Shoes',
    metaTitle: 'Footwear Store — Best Family Shoe Store',
    metaDescription: 'Discover high-grade athletic sneakers, royal leather loafers, and juttis. Order online with fast delivery.',
    keywords: ['Footwear Store', 'Athletic Shoes', 'Leather Shoes', 'Sneakers'],
    canonicalUrl: 'https://nwd-phi.vercel.app',
    ogImageUrl: '/logo.png',
    twitterCard: 'summary_large_image',
    structuredDataJson: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ShoeStore",
      "name": "Footwear Store",
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
    copyrightText: '© 2026 Footwear Store. All Rights Reserved.',
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
    privacyPolicy: 'We value your privacy. We store customer information securely and never sell your personal data.',
    termsAndConditions: 'All orders placed are subject to availability and verification. Prices include applicable taxes.',
    refundPolicy: 'Easy 7-day returns and exchanges available for size and manufacturing defects.',
    shippingPolicy: 'Free shipping on orders above ₹999. Fast delivery across regions.',
    cancellationPolicy: 'Orders can be cancelled prior to dispatch directly from your account or by calling customer care.',
    cookiePolicy: 'We use essential browser cookies to remember your cart, wishlist, and preference settings.',
    disclaimer: 'Product colors may slightly vary due to photographic lighting sources or your monitor settings.',
  },

  // Section 10: Emails
  emails: {
    emailHeader: '<div style="background:#111;padding:20px;text-align:center;"><h1 style="color:#F59E0B;">Footwear Store</h1></div>',
    emailFooter: '<div style="padding:15px;text-align:center;font-size:12px;color:#888;">© 2026 Footwear Store. Thank you for shopping with us!</div>',
    emailSignature: 'Warm regards,\nThe Footwear Store Team\nCustomer Care: +91 9782482250',
    supportName: 'Customer Care',
    supportEmail: 'support@nwd-phi.vercel.app',
  },

  // Section 11: WhatsApp
  whatsApp: {
    greeting: 'Hello! Welcome to Footwear Store 👟✨ How can we assist you today?',
    autoReply: 'Thank you for contacting us. Our team will get back to you shortly!',
    businessName: 'Footwear Store',
    supportNumber: '919782482250',
  },

  // Section 12: AI Pet
  aiPet: {
    customPrompts: 'You are the official AI Assistant for Footwear Store. Be friendly, polite, and assist customers with shoe sizes, order status, and store directions.',
    autoUseStoreInfo: true,
  },

  // Section 13: Invoices
  invoices: {
    logoUrl: '/logo.png',
    address: 'Commercial Market, Main City',
    gstNumber: '08AAAAA0000A1Z5',
    phone: '+91 9782482250',
    email: 'support@nwd-phi.vercel.app',
    website: 'https://nwd-phi.vercel.app',
    qrCodeUrl: '',
    footerText: 'Thank you for your purchase! Returns accepted within 7 days with valid invoice.',
  },

  // Section 14: Store Locator
  storeLocator: {
    stores: [],
  },

  version: 1,
  lastUpdated: new Date().toISOString(),
  updatedBy: 'System',
};
