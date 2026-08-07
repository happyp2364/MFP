import { AboutUsConfig } from '../types';

export const DEFAULT_ABOUT_US_CONFIG: AboutUsConfig = {
  businessName: "Official Store",
  establishmentYear: "2015",
  experienceYears: "10+",
  tagline: "Pioneering Quality Footwear & Family Fashion Heritage",
  shopDescription: "A premier destination for high-performance athletic shoes, handcrafted leather mojaris, and designer family footwear. Built on trust, personal service, and uncompromised quality.",
  businessStory: "Originated with a singular mission: to bring authentic, high-grade footwear to families at fair prices. From a modest shopfront in the main market, our dedication to cushion comfort, durable stitching, and honest customer care transformed us into a multi-category showroom serving thousands of households.",
  familyBusinessInfo: "As a proud enterprise, every customer is welcomed like family. Our leadership team personally evaluates every consignment—testing sole density, leather flexibility, and arch support—before it reaches our retail display.",
  mission: "To deliver style, ergonomic cushion comfort, and long-lasting footwear to every member of the family with warm personal care and transparent pricing.",
  vision: "To set the golden standard for family footwear retail, blending traditional craftsmanship with modern footwear technology and digital convenience.",
  journey: "Evolved into a top-rated footwear landmark. Through WhatsApp direct ordering and online cataloging, we now ship authentic quality nationwide.",
  storeHighlights: [
    "100% Quality & Fit Guarantee on Every Pair",
    "Handcrafted Royal Leather Juttis & Mojaris",
    "High-Performance Air-Cushion Sports Sneakers",
    "Personalized Sizing Advice via WhatsApp",
    "Direct Factory Sourcing for Honest Family Prices",
    "Free Exchange & Express Home Dispatch"
  ],
  mainHeaderImage: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1200&q=80",
  ownersAndTeam: [
    {
      id: "owner_1",
      fullName: "Viju Bhai Choudhary",
      position: "Founder & Managing Director",
      roleType: "owner",
      shortIntro: "Founder and visionary driving our customer-first culture, personal sizing guarantee, and royal quality standards.",
      experience: "18+ Years Retail Expertise",
      specialization: "Royal Wedding Mojaris & Customer Relationships",
      profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      contactNumber: "+91 98290 12345",
      email: "vijubhai@officialstore.com",
      signature: "Viju Bhai",
      socialLinks: {
        instagram: "https://instagram.com/official_store",
        facebook: "https://facebook.com/official_store",
        youtube: "https://youtube.com/@official_store",
        whatsapp: "919829012345"
      },
      enabled: true,
      featured: true,
      displayOrder: 1
    },
    {
      id: "owner_2",
      fullName: "Rajesh Choudhary",
      position: "Co-Owner & Operations Head",
      roleType: "owner",
      shortIntro: "Directs inventory management, brand tie-ups, and supply chain quality for national athletic and formal shoe lines.",
      experience: "12+ Years Supply Chain",
      specialization: "Athletic Shoe Tech & Inventory Logistics",
      profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      contactNumber: "+91 98290 54321",
      email: "rajesh@officialstore.com",
      socialLinks: {
        whatsapp: "919829054321",
        instagram: "https://instagram.com/official_store"
      },
      enabled: true,
      featured: true,
      displayOrder: 2
    },
    {
      id: "team_3",
      fullName: "Smt. Sunita Choudhary",
      position: "Director - Women's & Kids Fashion",
      roleType: "team",
      shortIntro: "Head curator for bridal wear, ethnic embroidery juttis, and comfortable kids' activewear footwear.",
      experience: "10+ Years Styling",
      specialization: "Bridal Collections & Kids Sizing Ergonomics",
      profilePhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
      socialLinks: {
        instagram: "https://instagram.com/official_store"
      },
      enabled: true,
      featured: false,
      displayOrder: 3
    },
    {
      id: "team_4",
      fullName: "Mahesh Kumar",
      position: "Store Manager & Fitting Specialist",
      roleType: "team",
      shortIntro: "Ensures every walk-in and online customer gets the exact fit, arch support, and style match.",
      experience: "8+ Years Fitting",
      specialization: "Custom Size Adjustments & WhatsApp Assistance",
      profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      socialLinks: {
        whatsapp: "919829012345"
      },
      enabled: true,
      featured: false,
      displayOrder: 4
    }
  ],
  timeline: [
    {
      id: "time_1",
      year: "2010",
      title: "Pipar City Main Store Launch",
      description: "Founded by Viju Bhai with a commitment to bring top quality footwear to Pipar City.",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
      icon: "store",
      enabled: true,
      displayOrder: 1
    },
    {
      id: "time_2",
      year: "2015",
      title: "Showroom Expansion & National Brands",
      description: "Expanded retail space to over 1,500 sq. ft., adding national athletic sneaker and formal leather shoe collections.",
      image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80",
      icon: "trending",
      enabled: true,
      displayOrder: 2
    },
    {
      id: "time_3",
      year: "2020",
      title: "WhatsApp Express Orders & Home Dispatch",
      description: "Pioneered direct WhatsApp video-shopping and size guidance, serving over 10,000 households remotely.",
      image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80",
      icon: "smartphone",
      enabled: true,
      displayOrder: 3
    },
    {
      id: "time_4",
      year: "2024",
      title: "Smart Inventory & Digital Catalog",
      description: "Implemented real-time barcode inventory management and automated online order tracking.",
      image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80",
      icon: "database",
      enabled: true,
      displayOrder: 4
    },
    {
      id: "time_5",
      year: "2026",
      title: "Royal Collection Launch & Enterprise Tech",
      description: "Introduced handcrafted royal embroidery mojaris and live real-time web portal sync.",
      image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80",
      icon: "sparkles",
      enabled: true,
      displayOrder: 5
    }
  ],
  achievements: [
    {
      id: "ach_1",
      type: "award",
      title: "Best Regional Family Footwear Store",
      issuerOrPublisher: "Rajasthan Retail Excellence Committee",
      year: "2023",
      description: "Awarded for highest customer satisfaction rating and quality assurance in Western Rajasthan.",
      imageUrl: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=600&q=80",
      enabled: true,
      displayOrder: 1
    },
    {
      id: "ach_2",
      type: "certificate",
      title: "50,000+ Verified Customers Benchmark",
      issuerOrPublisher: "Local Business Association",
      year: "2024",
      description: "Recognized for serving 50,000+ satisfied families across Jodhpur and Pali districts.",
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
      enabled: true,
      displayOrder: 2
    },
    {
      id: "ach_3",
      type: "milestone",
      title: "100% Size & Comfort Guarantee Seal",
      issuerOrPublisher: "Footwear Standards Trust",
      year: "2025",
      description: "Certified zero-defect dispatch protocol and 100% friendly exchange policy.",
      imageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80",
      enabled: true,
      displayOrder: 3
    }
  ],
  counters: [
    {
      id: "cnt_1",
      label: "Years of Heritage",
      value: "16",
      prefix: "",
      suffix: "+",
      autoCalculate: true,
      autoMetric: "years",
      icon: "award",
      enabled: true,
      displayOrder: 1
    },
    {
      id: "cnt_2",
      label: "Happy Customers",
      value: "50000",
      prefix: "",
      suffix: "+",
      autoCalculate: true,
      autoMetric: "customers",
      icon: "users",
      enabled: true,
      displayOrder: 2
    },
    {
      id: "cnt_3",
      label: "Products & Styles",
      value: "1200",
      prefix: "",
      suffix: "+",
      autoCalculate: true,
      autoMetric: "products",
      icon: "package",
      enabled: true,
      displayOrder: 3
    },
    {
      id: "cnt_4",
      label: "Orders Delivered",
      value: "100000",
      prefix: "",
      suffix: "+",
      autoCalculate: true,
      autoMetric: "orders",
      icon: "check-circle",
      enabled: true,
      displayOrder: 4
    },
    {
      id: "cnt_5",
      label: "National Brands",
      value: "25",
      prefix: "",
      suffix: "+",
      autoCalculate: false,
      icon: "shield",
      enabled: true,
      displayOrder: 5
    },
    {
      id: "cnt_6",
      label: "Positive Rating",
      value: "4.9",
      prefix: "",
      suffix: "★",
      autoCalculate: true,
      autoMetric: "reviews",
      icon: "star",
      enabled: true,
      displayOrder: 6
    }
  ],
  gallery: [
    {
      id: "gal_1",
      category: "shop_outside",
      title: "Main Store Front",
      caption: "Exterior showroom in Pipar City Main Market.",
      imageUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
      enabled: true,
      displayOrder: 1
    },
    {
      id: "gal_2",
      category: "shop_inside",
      title: "Royal Footwear Lounge",
      caption: "Dedicated section for handcrafted wedding mojaris and bridal collection.",
      imageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
      enabled: true,
      displayOrder: 2
    },
    {
      id: "gal_3",
      category: "shop_inside",
      title: "Athletic & Sports Shoe Section",
      caption: "Wide array of cushioned mesh sneakers and casual walking shoes.",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      enabled: true,
      displayOrder: 3
    },
    {
      id: "gal_4",
      category: "team",
      title: "Store Service Team",
      caption: "Our customer service specialists ready to assist with sizing and fitting.",
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
      enabled: true,
      displayOrder: 4
    },
    {
      id: "gal_5",
      category: "festival",
      title: "Diwali Special Display",
      caption: "Festive illuminations and new festive collection launch.",
      imageUrl: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80",
      enabled: true,
      displayOrder: 5
    },
    {
      id: "gal_6",
      category: "events",
      title: "Customer Appreciation Day",
      caption: "Celebrating 16 years with our loyal Pipar City families.",
      imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
      enabled: true,
      displayOrder: 6
    }
  ],
  socialLinks: {
    instagram: "https://instagram.com/official_store",
    facebook: "https://facebook.com/official_store",
    youtube: "https://youtube.com/@official_store",
    whatsapp: "919829012345",
    website: "https://nwd-phi.vercel.app"
  }
};
