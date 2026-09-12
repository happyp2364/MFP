import { AboutUsConfig } from '../types';
import { PUBLIC_SITE_URL } from '../utils/siteUrl';

export const DEFAULT_ABOUT_US_CONFIG: AboutUsConfig = {
  businessName: "Marudhar Fashion Point",
  establishmentYear: "2010",
  experienceYears: "16+",
  tagline: "2010 se Pipar City me best quality footwear, comfort aur family fashion ka trusted name.",
  shopDescription: "Marudhar Fashion Point Pipar City ka sabse trusted footwear store hai, jahan aapko sports shoes, handcrafted wedding mojaris aur family footwear ki best quality aur comfortable range milti hai.",
  businessStory: "Marudhar Fashion Point ki journey 2010 me Viju Bhai ke saath Pipar City me start hui. Humara simple vision tha — ki har family ko best quality, comfort aur stylish footwear fair price me mile. Main market me ek choti shop se shuru karke, aaj hum 50,000+ families ke trust ke saath Pipar City ka sabse popular family footwear showroom ban chuke hain.",
  familyBusinessInfo: "Hum ek family business hain, isliye har customer humare liye parivaar jaisa hai. Viju Bhai aur humari team har footwear stock ko personally check karti hai — sole quality, comfort aur durability verify karne ke baad hi product display par lagaya jata hai.",
  mission: "Har customer ko royal style, maximum comfort aur durable footwear fair price par deliver karna hi humara main goal hai.",
  vision: "Western Rajasthan me family footwear ka sabse trusted brand banna, jahan traditional Rajasthani mojaris aur modern trended shoes dono ek jagah easily mil sakein.",
  journey: "2010 me ek chote se footwear counter se shuru hui ye journey aaj Pipar City ka sabse trusted landmark ban chuki hai. Ab aap offline store ke saath-saath WhatsApp aur website par bhi latest collection easily order kar sakte hain.",
  storeHighlights: [
    "100% Quality aur comfortable size guarantee",
    "Handcrafted Royal Leather Juttis & Mojaris",
    "High-performance Air-Cushion Sports Shoes",
    "WhatsApp par personalized size guidance",
    "Direct factory sourcing ki wajah से honest pricing",
    "Fast doorstep delivery & Open Box Trial"
  ],
  mainHeaderImage: "",
  ownersAndTeam: [
    {
      id: "owner_1",
      fullName: "Viju Bhai Choudhary (Vijay Parihar)",
      position: "Founder & Managing Director",
      roleType: "owner",
      shortIntro: "Marudhar Fashion Point ke founder hain jinka focus hamesha customer trust, perfect fitting aur best quality footwear dene par raha hai.",
      experience: "18+ Years Retail Expertise",
      specialization: "Royal Wedding Mojaris & Customer Relationships",
      profilePhoto: "",
      contactNumber: "+91 9782482250",
      email: "vijubhai@marudharfashion.com",
      signature: "Viju Bhai",
      socialLinks: {
        instagram: "https://instagram.com/marudhar_boot_house_pipar",
        facebook: "https://facebook.com/marudharfashionpoint",
        youtube: "https://youtube.com/@marudharfashionpoint",
        whatsapp: "919782482250"
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
      shortIntro: "Store operations, inventory management aur national athletic shoe brands ke stock selection ki responsibility sambhalte hain.",
      experience: "12+ Years Supply Chain",
      specialization: "Athletic Shoe Tech & Inventory Logistics",
      profilePhoto: "",
      contactNumber: "+91 9782482250",
      email: "rajesh@marudharfashion.com",
      socialLinks: {
        whatsapp: "919782482250",
        instagram: "https://instagram.com/marudhar_boot_house_pipar"
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
      shortIntro: "Bridal collections, ethnic embroidery juttis aur kids footwear section ki curation aur selection lead karti hain.",
      experience: "10+ Years Styling",
      specialization: "Bridal Collections & Kids Sizing Ergonomics",
      profilePhoto: "",
      socialLinks: {
        instagram: "https://instagram.com/marudhar_boot_house_pipar"
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
      shortIntro: "Ensure karte hain ki store me aane wale aur online enquiry karne wale har customer ko perfect size aur comfort mile.",
      experience: "8+ Years Fitting",
      specialization: "Custom Size Adjustments & WhatsApp Assistance",
      profilePhoto: "",
      socialLinks: {
        whatsapp: "919782482250"
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
      description: "2010 me Viju Bhai ne Pipar City me Marudhar Fashion Point ki shuruaat ki, jiska main goal tha har customer ko best quality footwear dena.",
      image: "",
      icon: "store",
      enabled: true,
      displayOrder: 1
    },
    {
      id: "time_2",
      year: "2015",
      title: "Showroom Expansion & National Brands",
      description: "Store space expand hua aur national sports sneakers aur formal leather shoe collections add kiye gaye.",
      image: "",
      icon: "trending",
      enabled: true,
      displayOrder: 2
    },
    {
      id: "time_3",
      year: "2020",
      title: "WhatsApp Express Orders & Home Dispatch",
      description: "WhatsApp ke through direct video shopping aur size guidance start ki, jisse 10,000+ families ne ghar baithe order karna shuru kiya.",
      image: "",
      icon: "smartphone",
      enabled: true,
      displayOrder: 3
    },
    {
      id: "time_4",
      year: "2024",
      title: "Smart Inventory & Digital Catalog",
      description: "Smart barcode inventory aur online catalog system implement kiya gaya, jisse stock management aur order delivery aur fast ho gayi.",
      image: "",
      icon: "database",
      enabled: true,
      displayOrder: 4
    },
    {
      id: "time_5",
      year: "2026",
      title: "Royal Collection Launch & Enterprise Tech",
      description: "Handcrafted royal wedding mojaris ka naya collection launch hua aur live website portal ke saath real-time store sync start hua.",
      image: "",
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
      description: "Western Rajasthan me best customer satisfaction rating aur genuine quality assurance ke liye award se sammanit.",
      imageUrl: "",
      enabled: true,
      displayOrder: 1
    },
    {
      id: "ach_2",
      type: "certificate",
      title: "50,000+ Verified Customers Benchmark",
      issuerOrPublisher: "Marudhar Business Association",
      year: "2024",
      description: "Jodhpur aur Pali district ke 50,000 se zyada satisfied families ko quality service provide karne ka benchmark.",
      imageUrl: "",
      enabled: true,
      displayOrder: 2
    },
    {
      id: "ach_3",
      type: "milestone",
      title: "100% Size & Comfort Guarantee Seal",
      issuerOrPublisher: "Footwear Standards Trust",
      year: "2025",
      description: "Zero-defect check protocol aur 100% authentic quality assurance verified seal.",
      imageUrl: "",
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
  gallery: [],
  socialLinks: {
    instagram: "https://instagram.com/marudhar_fashion_point",
    facebook: "https://facebook.com/marudharfashionpoint",
    youtube: "https://youtube.com/@marudharfashionpoint",
    whatsapp: "919829012345",
    website: PUBLIC_SITE_URL
  }
};
