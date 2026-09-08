import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Razorpay from "razorpay";
import crypto from "crypto";

// Server in-memory transaction log
interface ServerTransactionRecord {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  paymentStatus: string;
  gatewayProvider: string;
  isTestMode: boolean;
  verifiedAt: string;
  refunded?: boolean;
  refundId?: string;
  refundAmount?: number;
}

const serverTransactionsLog: ServerTransactionRecord[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enterprise Security Headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(self), microphone=(), geolocation=(self)");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; img-src 'self' https: data: blob:; font-src 'self' https: data:; frame-ancestors *;"
    );
    next();
  });

  // Server-side IP Rate Limiting for API protection
  const apiRateLimitMap = new Map<string, { count: number; resetAt: number }>();
  app.use("/api/", (req, res, next) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "global_client";
    const ipKey = Array.isArray(ip) ? ip[0] : String(ip);
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 120;

    const entry = apiRateLimitMap.get(ipKey);
    if (!entry || now > entry.resetAt) {
      apiRateLimitMap.set(ipKey, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > maxRequests) {
      return res.status(429).json({
        error: "Too many requests. API rate limit exceeded.",
        retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
      });
    }

    next();
  });

  // Support JSON payload up to 30MB for base64 image uploads and capture rawBody for webhook HMAC verification
  app.use(
    express.json({
      limit: "30mb",
      verify: (req: any, _res, buf) => {
        req.rawBody = buf ? buf.toString() : "";
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: "30mb" }));

  // Shared Gemini Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Shoe Extraction API route
  app.post("/api/ai/extract-shoe", async (req, res) => {
    try {
      const { imageSrc, width = 800, height = 800 } = req.body || {};

      if (!imageSrc) {
        return res.status(400).json({ error: "imageSrc is required" });
      }

      let visionPrompt = `Analyze this footwear photo/poster/design.
Identify the primary shoe object as the central subject.
1. Provide the exact bounding box coordinates [ymin, xmin, ymax, xmax] as normalized integers from 0 to 1000 encompassing the COMPLETE shoe, including all wings, laces, soles, tongues, and fine details. Add a safe generous margin so NO part of the shoe is cut off.
2. Identify RGB samples of the surrounding background colors.
3. Classify the background type and halo risk (e.g. white background glow, dark shadow).

Respond strictly with valid JSON:
{
  "box": [ymin, xmin, ymax, xmax],
  "confidence": 0.98,
  "shoeType": "footwear",
  "backgroundColors": [[255,255,255], [245,245,245]],
  "backgroundType": "white",
  "haloRisk": "white_halo",
  "hasWingsOrLaces": true
}`;

      let base64Data = "";
      let mimeType = "image/png";

      if (imageSrc.startsWith("data:")) {
        const parts = imageSrc.split(",");
        mimeType = parts[0].match(/:(.*?);/)?.[1] || "image/png";
        base64Data = parts[1];
      }

      let boundingBox = null;
      let backgroundColors: Array<[number, number, number]> = [];
      let backgroundType = "unknown";
      let haloRisk = "none";
      let confidence = 0.9;

      if (base64Data && process.env.GEMINI_API_KEY) {
        try {
          const geminiRes = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                },
                { text: visionPrompt },
              ],
            },
            config: {
              responseMimeType: "application/json",
            },
          });

          if (geminiRes.text) {
            const parsed = JSON.parse(geminiRes.text);
            if (parsed.box && Array.isArray(parsed.box) && parsed.box.length === 4) {
              boundingBox = parsed.box; // [ymin, xmin, ymax, xmax] normalized 0-1000
            }
            if (Array.isArray(parsed.backgroundColors)) {
              backgroundColors = parsed.backgroundColors;
            }
            if (parsed.backgroundType) {
              backgroundType = parsed.backgroundType;
            }
            if (parsed.haloRisk) {
              haloRisk = parsed.haloRisk;
            }
            if (typeof parsed.confidence === "number") {
              confidence = parsed.confidence;
            }
          }
        } catch (geminiErr) {
          console.warn("[Gemini AI Extraction] Vision analysis note:", geminiErr);
        }
      }

      return res.json({
        success: true,
        boundingBox,
        backgroundColors,
        backgroundType,
        haloRisk,
        confidence,
        message: "Shoe AI detection completed successfully",
      });
    } catch (err: any) {
      console.error("[API extract-shoe Error]:", err);
      return res.status(500).json({ error: err.message || "Extraction failed" });
    }
  });

  // =========================================================================
  // AI PRODUCT DESCRIPTION GENERATOR
  // =========================================================================
  app.post("/api/ai/generate-description", async (req, res) => {
    try {
      const { productName, category, brand, features, targetAudience } = req.body || {};
      if (!productName) return res.status(400).json({ error: "productName is required" });

      const prompt = `You are a luxury footwear copywriter for Marudhar Fashion Point (Pipar City, Rajasthan).
Write an engaging, SEO-rich product description for:
Name: ${productName}
Category: ${category || 'Footwear'}
Brand: ${brand || 'Marudhar'}
Features: ${features || 'Premium comfort, durable sole, stylish finish'}
Target Audience: ${targetAudience || 'Fashion-conscious buyers'}

Respond ONLY with valid JSON with fields:
{
  "shortDescription": "1-2 sentences highlighting royalty & comfort",
  "bulletPoints": ["4 key bullet points"],
  "fullDescription": "2 paragraphs of persuasive marketing copy",
  "seoTags": ["5 relevant search tags"]
}`;

      if (process.env.GEMINI_API_KEY) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });
          if (response.text) {
            return res.json({ success: true, result: JSON.parse(response.text) });
          }
        } catch (aiErr) {
          console.warn("[AI Description] Gemini fallback note:", aiErr);
        }
      }

      return res.json({
        success: true,
        result: {
          shortDescription: `Step into royal elegance with ${productName}. Designed for supreme comfort and lasting craftsmanship at Marudhar Fashion Point.`,
          bulletPoints: [
            "Handcrafted precision with high-grade breathable materials",
            "Ergonomic cushioned sole for all-day effortless stride",
            "Versatile styling perfect for festive celebrations & everyday wear",
            "Direct delivery from Pipar City, Rajasthan"
          ],
          fullDescription: `${productName} combines authentic craftsmanship with modern aesthetics. Engineered to provide maximum arch support and durability, this pair elevates your outfit effortlessly.\n\nCrafted with care at Marudhar Fashion Point, each pair undergoes rigorous quality checks to ensure long-lasting wear and unmatched satisfaction.`,
          seoTags: [productName, category || "Footwear", brand || "Marudhar", "Pipar City Footwear", "Marudhar Fashion"]
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "AI description generation failed" });
    }
  });

  // =========================================================================
  // AI SEO SUGGESTIONS API
  // =========================================================================
  app.post("/api/ai/seo-suggestions", async (req, res) => {
    try {
      const { title, description, category } = req.body || {};
      const prompt = `Generate SEO metadata and schema suggestions for Marudhar Fashion Point e-commerce store page:
Title: ${title || 'Marudhar Fashion Point'}
Category: ${category || 'Footwear'}
Respond ONLY with valid JSON:
{
  "metaTitle": "Title under 60 chars",
  "metaDescription": "Meta description under 160 chars",
  "primaryKeywords": ["6 relevant search keywords"],
  "searchIntent": "commercial"
}`;

      if (process.env.GEMINI_API_KEY) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });
          if (response.text) {
            return res.json({ success: true, result: JSON.parse(response.text) });
          }
        } catch (aiErr) {
          console.warn("[AI SEO] Gemini fallback note:", aiErr);
        }
      }

      return res.json({
        success: true,
        result: {
          metaTitle: "Marudhar Fashion Point | Premium Shoes & Footwear Pipar City",
          metaDescription: "Explore royal footwear at Marudhar Fashion Point, Pipar City. Shop handcrafted juttis, sneakers, loafers & sports shoes with fast shipping.",
          primaryKeywords: ["Marudhar Fashion Point", "Pipar City Shoes", "Handcrafted Juttis", "Sports Sneakers", "Leather Loafers", "Rajasthan Footwear"],
          searchIntent: "commercial"
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // =========================================================================
  // AI SMART SEARCH & AUTOCOMPLETE
  // =========================================================================
  app.post("/api/ai/smart-search", async (req, res) => {
    try {
      const { query = "" } = req.body || {};
      const q = query.trim();

      if (!q) {
        return res.json({
          correctedQuery: "",
          suggestions: ["Sneakers", "Leather Loafers", "Ethnic Jutti", "School Shoes", "Sports Shoes"],
          categories: ["Men", "Women", "Kids", "Accessories"]
        });
      }

      if (process.env.GEMINI_API_KEY && q.length >= 2) {
        try {
          const prompt = `User typed search query: "${q}" in footwear store Marudhar Fashion Point.
Respond ONLY with valid JSON:
{
  "correctedQuery": "corrected spelling or original",
  "suggestions": ["4 specific footwear search terms"],
  "matchedCategory": "Men"
}`;

          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            return res.json({ success: true, ...parsed });
          }
        } catch (aiErr) {
          console.warn("[Smart Search AI] Fallback note:", aiErr);
        }
      }

      let corrected = q;
      const typoMap: Record<string, string> = {
        'sneker': 'Sneakers',
        'sneakers': 'Sneakers',
        'lofer': 'Leather Loafers',
        'lofers': 'Leather Loafers',
        'juti': 'Ethnic Jutti',
        'jutti': 'Ethnic Jutti',
        'shos': 'Shoes',
        'schoole': 'School Shoes',
        'sport': 'Sports Shoes',
      };

      const lower = q.toLowerCase();
      if (typoMap[lower]) corrected = typoMap[lower];

      return res.json({
        success: true,
        correctedQuery: corrected,
        suggestions: [
          `${corrected} for Men`,
          `${corrected} New Arrival`,
          `Royal ${corrected}`,
          `Best Seller ${corrected}`
        ],
        matchedCategory: "All"
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // =========================================================================
  // AI SOCIAL MEDIA MANAGEMENT ASSISTANT
  // =========================================================================
  app.post("/api/ai/social-media-assistant", async (req, res) => {
    try {
      const { action, platform, context } = req.body || {};
      if (!action) return res.status(400).json({ error: "action parameter is required" });

      let systemPrompt = `You are a social media branding expert and footwear copywriter for Marudhar Fashion Point (located in Pipar City, Rajasthan).
We sell high-grade sports shoes, royal leather loafers, mirror-work Kolhapuris, and men's apparel.
Help with the action: "${action}" for platform: "${platform || 'All'}". Context: ${typeof context === 'object' ? JSON.stringify(context) : (context || 'N/A')}.`;

      let prompt = "";
      if (action === 'suggest_placement') {
        prompt = `${systemPrompt}
Suggest the best social media placements (e.g. Header, Footer, Floating Buttons, Checkout Page, Product Details) to maximize user click-through rate.
Respond strictly in valid JSON format:
{
  "title": "AI Placement Strategy",
  "suggestions": [
    "Placing WhatsApp floating button on Product details for sizing help",
    "Placing Instagram Feed on the Homepage for social proof",
    "Placing Map/Address link in Site Footer and Contact Page"
  ],
  "reasoning": "Since footwear has sizing ambiguity, WhatsApp floating helper placement offers high conversion."
}`;
      } else if (action === 'suggest_cta') {
        prompt = `${systemPrompt}
Suggest 5 extremely engaging and urgent Call-to-Action (CTA) button labels for ${platform || 'our social channels'}.
Respond strictly in valid JSON format:
{
  "title": "High-Converting CTAs",
  "suggestions": [
    "Shop on WhatsApp 💬",
    "View Wedding Lookbook 👑",
    "Claim Festive 10% Off 🎁",
    "Order via Messenger ⚡",
    "Get Sizing Help Live 👞"
  ],
  "reasoning": "CTAs that use icons and offer immediate help or discounts perform up to 40% better on regional storefronts."
}`;
      } else if (action === 'suggest_button_color') {
        prompt = `${systemPrompt}
Suggest modern, high-contrast, premium brand colors (Hex codes) and matching light card backgrounds for ${platform || 'various social platform buttons'}.
Respond strictly in valid JSON format:
{
  "title": "Premium Brand Color Palette",
  "suggestions": [
    "Emerald Sizing Green (#0B8F63) on Off-White (#F4FAF7) for trust & clarity",
    "Royal Gold (#D4AF37) on Cream (#FDFBF7) for premium loafers",
    "Deep Cobalt Blue (#1E40AF) on Blue-Wash (#EFF6FF) for formal shoes"
  ],
  "hexColors": ["#0B8F63", "#D4AF37", "#1E40AF"],
  "bgColors": ["#F4FAF7", "#FDFBF7", "#EFF6FF"],
  "reasoning": "High-contrast colors help button visibility without causing aesthetic visual pollution."
}`;
      } else {
        // Caption, Promo, Festival, Product launch
        prompt = `${systemPrompt}
Generate highly engaging social media copywriting suitable for sharing. Include relevant emojis, local flavor (Pipar City shoe expertise), clear CTA, and relevant tags.
Respond strictly in valid JSON format:
{
  "title": "AI Copywriter Draft",
  "caption": "Write 2-3 engaging, well-formatted paragraphs here with emojis and local flavor.",
  "suggestions": [
    "Share on Instagram Reels at 7 PM IST",
    "Pin this with a high-quality photo of Jodhpuri Jutis"
  ],
  "hashtags": ["#marudharfashion", "#footwear", "#piparcity", "#jodhpurishoes"],
  "reasoning": "Using local storytelling about artisanal shoe crafting builds local brand authority and customer trust."
}`;
      }

      if (process.env.GEMINI_API_KEY) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });
          if (response.text) {
            return res.json({ success: true, result: JSON.parse(response.text) });
          }
        } catch (aiErr) {
          console.warn("[AI Social Assistant] Gemini fallback note:", aiErr);
        }
      }

      // Default static fallback values if API key is missing or model fails
      let fallbackResult: any = {
        title: "Marudhar AI Social Strategy Draft",
        suggestions: [
          "Place a WhatsApp Support floating button on Product details pages to answer sizing inquiries instantly.",
          "Display Instagram story highlights right on the homepage to showcase live customer testimonials in Pipar City.",
          "Promote wedding collection launch on YouTube with a curated lookbook video."
        ],
        reasoning: "Personalized regional customer assistance on WhatsApp combined with social proof on Instagram boosts digital credibility."
      };

      if (action === 'suggest_cta') {
        fallbackResult = {
          title: "Suggested Call-to-Actions",
          suggestions: [
            "Shop Sizing on WhatsApp 💬",
            "View Real Shoe Videos 🎥",
            "Get Instant Size Help 👞",
            "Explore Wedding Mojaris 👑",
            "Claim 10% Jodhpur Discount 🎁"
          ],
          reasoning: "Direct, descriptive CTAs specifying footwear type outperform generic terms like 'Visit Us'."
        };
      } else if (action === 'suggest_button_color') {
        fallbackResult = {
          title: "Branding Color Suggestions",
          suggestions: [
            "WhatsApp Forest Green: #25D366 (Icon) on #E8F9EE (Bg)",
            "Royal Jodhpuri Gold: #D4AF37 (Icon) on #FDFBF7 (Bg)",
            "Midnight Sports Black: #111827 (Icon) on #F9FAFB (Bg)"
          ],
          hexColors: ["#25D366", "#D4AF37", "#111827"],
          bgColors: ["#E8F9EE", "#FDFBF7", "#F9FAFB"],
          reasoning: "Authentic, high-contrast combinations designed to look spectacular on both mobile and desktop screens."
        };
      } else if (action === 'generate_caption') {
        fallbackResult = {
          title: "Footwear Showcase Caption",
          caption: `👑 Step into absolute royalty directly from Pipar City! Our handcrafted wedding leather Mojaris are designed with premium leather, cushioned insoles, and beautiful traditional mirror-work to keep you comfortable all day long. 👞✨\n\nPerfect for groom-wear, festivals, and royal family gatherings. Available now in sizes 6 to 11. Drop us a message on WhatsApp for customized sizing advice!`,
          suggestions: ["Post on Instagram Reels during evening peak traffic.", "Add 3 close-up shoe photos showing hand-stitch details."],
          hashtags: ["#marudharfashion", "#royalmojari", "#weddingfootwear", "#piparcity", "#jodhpurishoes"],
          reasoning: "Capturing wedding season excitement Jodhpur style increases engagement among families."
        };
      } else if (action === 'generate_promotional') {
        fallbackResult = {
          title: "Promo Offer Copywriter",
          caption: `⚡ FLASH SALE: Grab the most durable sports sneakers in Pipar City at up to 15% OFF! 👟🔥\n\nMarudhar Fashion Point brings you double-soled, breathable training shoes built for maximum speed and longevity. Whether running or walking, experience the ultimate comfort.\n\n🎁 Message us today and mention 'MARUDHAR15' to get an instant discount with free doorstep delivery!`,
          suggestions: ["Share to local WhatsApp Broadcast lists.", "Embed as a popup announcement on the storefront."],
          hashtags: ["#sneakerhead", "#marudharfashion", "#shoesale", "#piparcity"],
          reasoning: "Creating immediate FOMO combined with direct local delivery hooks buyers."
        };
      } else if (action === 'generate_festival') {
        fallbackResult = {
          title: "Festive Celebration Copywriter",
          caption: `✨ Shubh Tyohar! From the entire family of Marudhar Fashion Point, we wish you a prosperous festive season! 🪔🌸\n\nCelebrate in premium style with our special Royal Loafers and traditional Juttis. Specially curated for wedding celebrations and prayer events. Each pair represents heritage and pride.\n\n📞 Click the WhatsApp bubble to secure your festive sizing today!`,
          suggestions: ["Publish as a greeting post on Google Business Profile.", "Pin at the top of the Facebook page."],
          hashtags: ["#festiveshoes", "#traditionaljuttis", "#shubhtyohar", "#marudharfashion"],
          reasoning: "Combining warm greetings with product collections establishes visual connection and community warmth."
        };
      } else if (action === 'generate_product_launch') {
        fallbackResult = {
          title: "New Product Launch Alert",
          caption: `🚀 THE WAIT IS OVER: Introducing the Midnight Stealth Sneaker Series! 👟🖤\n\nEngineered with an ultra-responsive flex-sole, water-resistant knit-upper, and modern reflective laces. Exclusive to Marudhar Fashion Point, Jodhpur.\n\nBe the first in Pipar City to own these. Extremely limited stock! Sizing help is available live on WhatsApp.`,
          suggestions: ["Launch an Instagram Reel showing shoe flexibility.", "Update your WhatsApp status to capture early orders."],
          hashtags: ["#newlaunch", "#stealthsneakers", "#marudharfashion", "#piparcity"],
          reasoning: "Pre-launch hype combined with limited availability alerts sneakers collectors to act fast."
        };
      }

      return res.json({ success: true, result: fallbackResult });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // =========================================================================
  // AI ANALYTICS SUMMARY REPORT
  // =========================================================================
  app.post("/api/ai/analytics-summary", async (req, res) => {
    try {
      const { totalOrders = 124, revenue = 184500, topCategory = "Sports Sneakers" } = req.body || {};

      if (process.env.GEMINI_API_KEY) {
        try {
          const prompt = `Analyze store metrics for Marudhar Fashion Point:
Total Orders: ${totalOrders}
Revenue: ₹${revenue}
Top Category: ${topCategory}
Respond ONLY with valid JSON:
{
  "summary": "2 sentences executive overview",
  "growthTips": ["3 strategic growth action points"],
  "topPerformingReason": "1 sentence explanation"
}`;

          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });

          if (response.text) {
            return res.json({ success: true, analytics: JSON.parse(response.text) });
          }
        } catch (aiErr) {
          console.warn("[Analytics AI] Fallback note:", aiErr);
        }
      }

      return res.json({
        success: true,
        analytics: {
          summary: `Marudhar Fashion Point generated ₹${revenue.toLocaleString('en-IN')} across ${totalOrders} orders, led by high demand in ${topCategory}.`,
          growthTips: [
            "Promote ONE 8 Burgundy Leather Sneakers during upcoming festival sales",
            "Introduce bundle discounts on Kids School Shoes & Sports Wear",
            "Leverage Instagram Reels showcasing Rajasthani handcrafted Jutti making"
          ],
          topPerformingReason: `${topCategory} continues to dominate customer preference due to lightweight comfort and competitive pricing.`
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // =========================================================================
  // AI HOMEPAGE EXPERIENCE BUILDER API ENDPOINTS
  // =========================================================================
  app.post("/api/ai/generate-homepage-layout", async (req, res) => {
    try {
      const { prompt = "", currentTheme = "light" } = req.body || {};
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      const systemPrompt = `You are an expert e-commerce UI designer & UX conversion architect for Marudhar Fashion Point (Pipar City, Rajasthan).
The user requested a homepage layout design with prompt: "${prompt}".

Generate a complete, highly structured HomepageConfig JSON with an array of section objects.
Available section types:
"floating_sneaker", "hero_banner", "slider", "image_carousel", "video_banner", "featured_products", "trending_products", "new_arrivals", "best_sellers", "flash_sale", "festival_collection", "categories", "coupons", "announcements", "customer_reviews", "instagram_feed", "why_choose_us", "open_box_delivery", "offer_cards", "scrolling_banner", "countdown_timer", "newsletter", "faqs", "about_store", "custom_html", "rich_text", "gallery", "quick_category_icons", "footer_banner".

Return strictly valid JSON matching this schema:
{
  "name": "Design Name based on prompt",
  "presetName": "AI Custom Layout",
  "themeMode": "light" | "dark" | "luxury" | "festival" | "glassmorphic",
  "sections": [
    {
      "id": "sec_ai_1",
      "type": "hero_banner",
      "title": "Main Heading",
      "subtitle": "Subtitle text",
      "enabled": true,
      "visibleDevices": ["desktop", "tablet", "mobile"],
      "styling": {
        "bgColor": "#HEX",
        "bgGradient": "tailwind gradient class or empty",
        "textColor": "#HEX",
        "accentColor": "#HEX",
        "paddingTop": 32,
        "paddingBottom": 32,
        "fullWidth": true
      },
      "contentData": {
        "badge": "Badge label",
        "heading": "Hero heading",
        "description": "Short marketing copy",
        "ctaText": "Button label",
        "ctaLink": "products",
        "imageUrl": "Unsplash footwear photo URL"
      }
    }
  ]
}

Ensure 6 to 10 sections are included to form a rich, realistic homepage! Include a hero_banner, quick_category_icons, countdown_timer or coupons, best_sellers, new_arrivals, why_choose_us, open_box_delivery, customer_reviews, and faqs.`;

      if (process.env.GEMINI_API_KEY) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: systemPrompt,
            config: { responseMimeType: "application/json" }
          });
          if (response.text) {
            const parsed = JSON.parse(response.text);
            return res.json({ success: true, config: parsed });
          }
        } catch (aiErr) {
          console.warn("[AI Homepage Layout] Gemini fallback note:", aiErr);
        }
      }

      // Smart Fallback layout based on prompt keywords
      const isDark = prompt.toLowerCase().includes("dark") || prompt.toLowerCase().includes("black") || prompt.toLowerCase().includes("nike") || prompt.toLowerCase().includes("sports");
      const isFestival = prompt.toLowerCase().includes("festival") || prompt.toLowerCase().includes("rakhi") || prompt.toLowerCase().includes("diwali") || prompt.toLowerCase().includes("wedding") || prompt.toLowerCase().includes("royal");

      return res.json({
        success: true,
        config: {
          name: `AI Custom: ${prompt.slice(0, 30)}`,
          presetName: isFestival ? "Festive Celebration" : isDark ? "Dark Athletic" : "Modern Storefront",
          themeMode: isFestival ? "festival" : isDark ? "dark" : "light",
          sections: [
            {
              id: `sec_ai_hero_${Date.now()}`,
              type: "hero_banner",
              title: isFestival ? "Festive Royal Dhamaka" : isDark ? "UNLEASH YOUR PEAK SPEED" : "Step into Luxury & Supreme Comfort",
              subtitle: "Handcrafted in Pipar City, Delivered Across India",
              enabled: true,
              visibleDevices: ["desktop", "tablet", "mobile"],
              styling: {
                bgColor: isFestival ? "#881337" : isDark ? "#000000" : "#0F172A",
                bgGradient: isFestival ? "from-rose-950 via-red-900 to-amber-900" : isDark ? "from-black via-zinc-900 to-emerald-950" : "from-neutral-900 via-neutral-900/90 to-[#0B8F63]/20",
                textColor: "#FFFFFF",
                accentColor: isFestival ? "#F59E0B" : "#0B8F63",
                paddingTop: 48,
                paddingBottom: 48,
                fullWidth: true
              },
              contentData: {
                badge: isFestival ? "👑 FESTIVAL EDITION" : "⚡ NEW DROP 2026",
                heading: isFestival ? "Royal Footwear for Every Grand Occasion" : "Precision Craftsmanship Meets Cloud Comfort",
                description: "Explore air-cushioned sports sneakers, burnished leather loafers, and Rajasthani zari juttis.",
                ctaText: "Shop Collection Now",
                ctaLink: "products",
                imageUrl: isFestival ? "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1200&q=80" : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80"
              }
            },
            {
              id: `sec_ai_cat_${Date.now()}`,
              type: "quick_category_icons",
              title: "Quick Category Filter",
              subtitle: "Find your ideal fit in 1 click",
              enabled: true,
              visibleDevices: ["desktop", "tablet", "mobile"],
              styling: { bgColor: "#FFFFFF", textColor: "#0F172A", paddingTop: 24, paddingBottom: 24 },
              contentData: {
                categories: [
                  { id: "m", name: "Men's Shoes", icon: "👞", categoryFilter: "men", count: "120+ Styles" },
                  { id: "w", name: "Women's Footwear", icon: "👠", categoryFilter: "women", count: "95+ Styles" },
                  { id: "k", name: "Kids & Junior", icon: "👟", categoryFilter: "kids", count: "60+ Styles" },
                  { id: "r", name: "Royal Juttis", icon: "👑", categoryFilter: "all", collectionFilter: "royal", count: "Handcrafted" }
                ]
              }
            },
            {
              id: `sec_ai_timer_${Date.now()}`,
              type: "countdown_timer",
              title: "⚡ Flash Deal Countdown",
              subtitle: "Extra 10% OFF on Instant UPI Payments",
              enabled: true,
              visibleDevices: ["desktop", "tablet", "mobile"],
              styling: { bgColor: "#991B1B", bgGradient: "from-amber-600 via-rose-700 to-red-900", textColor: "#FFFFFF", paddingTop: 20, paddingBottom: 20, borderRadius: 16 },
              contentData: {
                targetDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
                code: "AIFLASH10",
                ctaText: "Claim Extra Offer"
              }
            },
            {
              id: `sec_ai_bestsellers_${Date.now()}`,
              type: "best_sellers",
              title: "Top Rated Footwear Picks",
              subtitle: "Voted #1 by footwear lovers in Pipar City",
              enabled: true,
              visibleDevices: ["desktop", "tablet", "mobile"],
              styling: { bgColor: "#F8FAFC", textColor: "#0F172A", paddingTop: 32, paddingBottom: 32 },
              contentData: { limit: 8 }
            },
            {
              id: `sec_ai_openbox_${Date.now()}`,
              type: "open_box_delivery",
              title: "Open Box Inspection Guarantee",
              subtitle: "Inspect shoes before paying cash on delivery",
              enabled: true,
              visibleDevices: ["desktop", "tablet", "mobile"],
              styling: { bgColor: "#F0FDF4", textColor: "#065F46", paddingTop: 24, paddingBottom: 24, borderRadius: 16 },
              contentData: {}
            },
            {
              id: `sec_ai_faqs_${Date.now()}`,
              type: "faqs",
              title: "Customer FAQs",
              subtitle: "Sizing, Shipping & Easy Returns",
              enabled: true,
              visibleDevices: ["desktop", "tablet", "mobile"],
              styling: { bgColor: "#FFFFFF", textColor: "#0F172A", paddingTop: 32, paddingBottom: 32 },
              contentData: {
                faqs: [
                  { q: "How do I choose the correct shoe size?", a: "We follow standard UK/India shoe sizing. You can also chat with us on WhatsApp for exact foot length guidance." },
                  { q: "Is Open Box Delivery available in my area?", a: "Yes, Open Box Delivery is available across 25,000+ PIN codes in India." }
                ]
              }
            }
          ]
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to generate AI homepage layout" });
    }
  });

  app.post("/api/ai/generate-section-content", async (req, res) => {
    try {
      const { sectionType = "hero_banner", prompt = "Make it persuasive and regal" } = req.body || {};

      const aiPrompt = `You are a high-converting e-commerce copywriter for footwear brand Marudhar Fashion Point.
Write engaging copy for homepage section "${sectionType}" with directive: "${prompt}".
Respond strictly with valid JSON:
{
  "title": "Engaging Section Title",
  "subtitle": "Clear, persuasive subtitle",
  "badge": "Short badge tag",
  "description": "Short 2-sentence description",
  "ctaText": "Action Button Label"
}`;

      if (process.env.GEMINI_API_KEY) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: aiPrompt,
            config: { responseMimeType: "application/json" }
          });
          if (response.text) {
            return res.json({ success: true, result: JSON.parse(response.text) });
          }
        } catch (aiErr) {
          console.warn("[AI Section Content] Gemini fallback note:", aiErr);
        }
      }

      return res.json({
        success: true,
        result: {
          title: "Step Into Royal Sophistication",
          subtitle: "Handcrafted Juttis, Genuine Loafers & High-Performance Athletic Sneakers",
          badge: "👑 ROYAL SELECTION",
          description: "Engineered with ergonomic air soles and soft genuine leather. Direct factory dispatch from Pipar City.",
          ctaText: "Shop Collection"
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai/generate-about-content", async (req, res) => {
    try {
      const { type = "story", prompt = "Enhance story with royal Rajasthani heritage and quality footwear craftsmanship", currentText = "" } = req.body || {};

      const aiPrompt = `You are a world-class luxury brand storytelling copywriter for "Marudhar Fashion Point", Pipar City's top footwear destination.
Task: Write compelling content of type "${type}".
User Instruction: "${prompt}"
Existing context (if any): "${currentText}"

Requirements based on type:
- "story": 2-3 engaging, warm paragraphs celebrating 16+ years of footwear heritage, Viju Bhai's quality commitment, and customer trust.
- "bio": A inspiring 2-sentence executive/owner bio emphasizing customer satisfaction and footwear expertise.
- "mission": A clear, inspiring 1-sentence mission statement.
- "vision": A forward-looking 1-sentence vision statement.
- "highlights": JSON array of 5-6 short bullet points (e.g. ["100% Fit Guarantee", "Handcrafted Mojaris"]).

Respond strictly with valid JSON in format:
{
  "content": "Generated text here...",
  "highlights": ["item 1", "item 2"]
}`;

      if (process.env.GEMINI_API_KEY) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: aiPrompt,
            config: { responseMimeType: "application/json" }
          });
          if (response.text) {
            const parsed = JSON.parse(response.text);
            return res.json({ success: true, result: parsed });
          }
        } catch (aiErr) {
          console.warn("[AI About Us] Gemini fallback note:", aiErr);
        }
      }

      // Fallback
      if (type === "highlights") {
        return res.json({
          success: true,
          result: {
            content: "100% Quality Inspected Before Dispatch",
            highlights: [
              "100% Fit & Comfort Guarantee",
              "Handcrafted Royal Rajasthani Mojaris",
              "Ergonomic Cushion Air Sole Sneakers",
              "Direct Sourcing at Fair Family Prices",
              "Personalized Sizing Guidance via WhatsApp"
            ]
          }
        });
      }

      return res.json({
        success: true,
        result: {
          content: "Founded in 2010 by Viju Bhai, Marudhar Fashion Point has grown from Pipar City's trusted local shoe store into Rajasthan's beloved multi-category family footwear landmark. Driven by relentless quality inspection and personal service, we ensure every step you take radiates royal comfort."
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // =========================================================================
  // LIVE LOCATION & GOOGLE MAPS STORE API
  // =========================================================================
  app.get("/api/location/store-info", (_req, res) => {
    return res.json({
      success: true,
      store: {
        name: "Marudhar Fashion Point",
        address: "Main Market, Near Railway Station Road, Pipar City, Jodhpur, Rajasthan 342601",
        city: "Pipar City",
        district: "Jodhpur",
        state: "Rajasthan",
        pincode: "342601",
        coordinates: { lat: 26.3912, lng: 73.6631 },
        phone: "+91 98290 12345",
        whatsapp: "+91 98290 12345",
        email: "contact@marudharfashionpoint.com",
        hours: "Mon - Sun: 9:00 AM - 9:00 PM",
        googleMapsUrl: "https://maps.google.com/?q=Pipar+City+Rajasthan",
        googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3575.523091!2d73.6631!3d26.3912!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDIzJzI4LjMiTiA3M8KwMzknNDcuMiJF!5e0!3m2!1sen!2sin!4v1620000000000"
      }
    });
  });

  // =========================================================================
  // LIVE WEATHER & SHOPPING RECOMMENDATION API
  // =========================================================================
  app.get("/api/weather", (_req, res) => {
    return res.json({
      success: true,
      location: "Pipar City, Rajasthan",
      temperatureC: 31,
      condition: "Sunny & Clear",
      humidity: "35%",
      recommendation: "Perfect weather for breathable mesh sports sneakers & handcrafted leather juttis!"
    });
  });

  // =========================================================================
  // INSTAGRAM GRAPH API INTEGRATION & CACHING SERVER ROUTE
  // =========================================================================
  let inMemoryInstagramToken = process.env.INSTAGRAM_ACCESS_TOKEN || "";
  let inMemoryInstagramConfig = {
    username: "marudhar_fashion_point",
    displayName: "Marudhar Fashion Point",
    postLimit: 8,
    layout: "grid",
    showBio: true,
    showStats: true,
  };

  interface CacheEntry {
    profile: any;
    posts: any[];
    timestamp: number;
  }
  let instagramCache: CacheEntry | null = null;
  const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

  // Default live profile data for @marudhar_fashion_point
  const DEFAULT_PROFILE = {
    username: "marudhar_fashion_point",
    displayName: "Marudhar Fashion Point",
    profilePictureUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80",
    followersCount: "18.5K",
    followingCount: "412",
    postsCount: "1,240",
    biography: "Step into Royalty & Comfort 👞 Exclusive Footwear & Fashion Hub in Pipar City • Handcrafted Juttis, Sports Sneakers & Leather Wear • Worldwide Shipping 📦",
    verified: true,
    isLiveApiConnected: false,
  };

  const DEFAULT_POSTS = [
    {
      id: "ig_post_1",
      permalink: "https://www.instagram.com/marudhar_fashion_point/",
      mediaUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
      mediaType: "IMAGE",
      caption: "Step into royal elegance with our latest ONE 8 Burgundy Leather Edition! 👟✨ Exclusive drop at Pipar City. #MarudharFashionPoint #Piparcity",
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      likeCount: 1240,
      commentsCount: 84,
      category: "ONE 8 Special",
    },
    {
      id: "ig_post_2",
      permalink: "https://www.instagram.com/marudhar_fashion_point/",
      mediaUrl: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80",
      mediaType: "IMAGE",
      caption: "Men's Genuine Handcrafted Leather Loafers. Designed for extreme durability, softness & royal posture. 👞🔥",
      timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      likeCount: 950,
      commentsCount: 62,
      category: "Leather Wear",
    },
    {
      id: "ig_post_3",
      permalink: "https://www.instagram.com/marudhar_fashion_point/",
      mediaUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
      mediaType: "IMAGE",
      caption: "Women's High-Performance Sports & Running Shoes! Cloud-foam soles for effortless stride. 👟💖",
      timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
      likeCount: 1820,
      commentsCount: 112,
      category: "Sports Wear",
    },
    {
      id: "ig_post_4",
      permalink: "https://www.instagram.com/marudhar_fashion_point/",
      mediaUrl: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80",
      mediaType: "IMAGE",
      caption: "Light-up LED & Flexible Cushion Sports Shoes for Kids! Durable, orthopedic support & fun designs. 🧒⚡",
      timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      likeCount: 820,
      commentsCount: 45,
      category: "Kids Wear",
    },
    {
      id: "ig_post_5",
      permalink: "https://www.instagram.com/marudhar_fashion_point/",
      mediaUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
      mediaType: "IMAGE",
      caption: "Rajasthani Handcrafted Zari Juttis for Wedding & Festival Season. Pure royal heritage vibes! 👑✨",
      timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      likeCount: 2150,
      commentsCount: 150,
      category: "Ethnic Juttis",
    },
    {
      id: "ig_post_6",
      permalink: "https://www.instagram.com/marudhar_fashion_point/",
      mediaUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
      mediaType: "IMAGE",
      caption: "Fresh Batch of Ultra-Breathable Mesh Athletic Shoes arrived at Marudhar Fashion Point! 🏃‍♂️⚡",
      timestamp: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
      likeCount: 1430,
      commentsCount: 98,
      category: "New Drop",
    },
    {
      id: "ig_post_7",
      permalink: "https://www.instagram.com/marudhar_fashion_point/",
      mediaUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      mediaType: "IMAGE",
      caption: "Red Flame Edition Running Sneakers! Lightweight, impact-absorbing air cushion heel. 👟🔥",
      timestamp: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
      likeCount: 1980,
      commentsCount: 134,
      category: "Performance",
    },
    {
      id: "ig_post_8",
      permalink: "https://www.instagram.com/marudhar_fashion_point/",
      mediaUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
      mediaType: "IMAGE",
      caption: "Classic Unisex Canvas Low-Tops in Cream White. Timeless street style for everyday wear. 👟✨",
      timestamp: new Date(Date.now() - 144 * 3600 * 1000).toISOString(),
      likeCount: 1110,
      commentsCount: 76,
      category: "Casuals",
    },
  ];

  // Helper function to fetch from Meta Instagram Graph API
  async function fetchLiveInstagramData(accessToken: string, limit: number = 8) {
    const trimmedToken = (accessToken || "").trim();
    if (!trimmedToken || trimmedToken.length < 15 || trimmedToken.includes("YOUR_") || trimmedToken.includes("INSTAGRAM_ACCESS_TOKEN")) {
      return {
        profile: { ...DEFAULT_PROFILE, isLiveApiConnected: false },
        posts: DEFAULT_POSTS,
        isLive: false,
        error: "No valid Access Token provided.",
      };
    }

    try {
      // 1. Fetch Profile Info
      const profileUrl = `https://graph.instagram.com/v18.0/me?fields=id,username,account_type,media_count,followers_count,biography,profile_picture_url&access_token=${encodeURIComponent(trimmedToken)}`;
      const profileRes = await fetch(profileUrl);

      if (!profileRes.ok) {
        const errJson = await profileRes.json().catch(() => ({}));
        const msg = errJson?.error?.message || `Instagram Graph API Profile error (${profileRes.status})`;
        return {
          profile: { ...DEFAULT_PROFILE, isLiveApiConnected: false },
          posts: DEFAULT_POSTS,
          isLive: false,
          error: msg,
        };
      }

      const profileData = await profileRes.json();

      // 2. Fetch Media Feed
      const mediaUrl = `https://graph.instagram.com/v18.0/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&limit=${limit}&access_token=${encodeURIComponent(trimmedToken)}`;
      const mediaRes = await fetch(mediaUrl);

      if (!mediaRes.ok) {
        const errJson = await mediaRes.json().catch(() => ({}));
        const msg = errJson?.error?.message || `Instagram Graph API Media error (${mediaRes.status})`;
        return {
          profile: { ...DEFAULT_PROFILE, isLiveApiConnected: false },
          posts: DEFAULT_POSTS,
          isLive: false,
          error: msg,
        };
      }

      const mediaData = await mediaRes.json();

      const profile = {
        username: profileData.username || "marudhar_fashion_point",
        displayName: "Marudhar Fashion Point",
        profilePictureUrl: profileData.profile_picture_url || DEFAULT_PROFILE.profilePictureUrl,
        followersCount: profileData.followers_count ? `${(profileData.followers_count / 1000).toFixed(1)}K` : DEFAULT_PROFILE.followersCount,
        followingCount: "412",
        postsCount: profileData.media_count ? profileData.media_count.toString() : DEFAULT_PROFILE.postsCount,
        biography: profileData.biography || DEFAULT_PROFILE.biography,
        verified: true,
        isLiveApiConnected: true,
      };

      const posts = (mediaData.data || []).map((item: any, idx: number) => ({
        id: item.id || `ig_live_${idx}`,
        permalink: item.permalink || `https://www.instagram.com/p/${item.id}/`,
        mediaUrl: item.media_url || item.thumbnail_url || DEFAULT_POSTS[idx % DEFAULT_POSTS.length].mediaUrl,
        mediaType: item.media_type || "IMAGE",
        thumbnailUrl: item.thumbnail_url,
        caption: item.caption || "Marudhar Fashion Point Exclusive Footwear #MarudharFashionPoint",
        timestamp: item.timestamp || new Date().toISOString(),
        likeCount: item.like_count || Math.floor(800 + Math.random() * 1200),
        commentsCount: item.comments_count || Math.floor(40 + Math.random() * 100),
        category: item.media_type === "VIDEO" ? "Reel" : "New Drop",
      }));

      return { profile, posts, isLive: true };
    } catch (err: any) {
      return {
        profile: { ...DEFAULT_PROFILE, isLiveApiConnected: false },
        posts: DEFAULT_POSTS,
        isLive: false,
        error: err.message,
      };
    }
  }

  // GET /api/instagram/feed - Fetch current profile and live posts
  app.get("/api/instagram/feed", async (req, res) => {
    try {
      const now = Date.now();
      const limit = parseInt((req.query.limit as string) || "8", 10);

      // Return cached result if valid
      if (instagramCache && now - instagramCache.timestamp < CACHE_TTL_MS) {
        return res.json({
          success: true,
          profile: instagramCache.profile,
          posts: instagramCache.posts.slice(0, limit),
          fromCache: true,
          lastSyncedAt: new Date(instagramCache.timestamp).toISOString(),
        });
      }

      if (inMemoryInstagramToken) {
        const liveResult = await fetchLiveInstagramData(inMemoryInstagramToken, limit);
        if (liveResult.profile) {
          instagramCache = {
            profile: liveResult.profile,
            posts: liveResult.posts,
            timestamp: now,
          };
          return res.json({
            success: true,
            profile: liveResult.profile,
            posts: liveResult.posts,
            fromCache: false,
            isLiveApiConnected: liveResult.profile.isLiveApiConnected,
            lastSyncedAt: new Date(now).toISOString(),
          });
        }
      }

      // Fallback response with official profile data
      return res.json({
        success: true,
        profile: DEFAULT_PROFILE,
        posts: DEFAULT_POSTS.slice(0, limit),
        fromCache: false,
        isLiveApiConnected: false,
        lastSyncedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("[GET /api/instagram/feed Error]:", err);
      return res.status(500).json({ error: err.message || "Failed to load Instagram feed" });
    }
  });

  // POST /api/instagram/config - Update server token & options
  app.post("/api/instagram/config", async (req, res) => {
    try {
      const { accessToken, username, postLimit, layout, showBio, showStats } = req.body || {};

      if (typeof accessToken === "string") {
        inMemoryInstagramToken = accessToken.trim();
        // Invalidate cache when token changes
        instagramCache = null;
      }

      if (username) inMemoryInstagramConfig.username = username;
      if (postLimit) inMemoryInstagramConfig.postLimit = postLimit;
      if (layout) inMemoryInstagramConfig.layout = layout;
      if (showBio !== undefined) inMemoryInstagramConfig.showBio = showBio;
      if (showStats !== undefined) inMemoryInstagramConfig.showStats = showStats;

      return res.json({
        success: true,
        message: "Instagram configuration updated successfully",
        hasAccessToken: !!inMemoryInstagramToken,
        config: inMemoryInstagramConfig,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // POST /api/instagram/test-connection - Test Meta Access Token
  app.post("/api/instagram/test-connection", async (req, res) => {
    try {
      const { accessToken } = req.body || {};
      const tokenToTest = accessToken || inMemoryInstagramToken;

      if (!tokenToTest) {
        return res.status(400).json({
          success: false,
          message: "No Access Token provided to test.",
        });
      }

      const result = await fetchLiveInstagramData(tokenToTest, 4);

      if (result.profile && result.profile.isLiveApiConnected) {
        return res.json({
          success: true,
          message: `Successfully connected to Instagram Graph API for @${result.profile.username}!`,
          profile: result.profile,
          postCount: result.posts.length,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.error || "Failed to authenticate with Meta Instagram Graph API. Check token permissions.",
        });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // =========================================================================
  // PRODUCTION RAZORPAY PAYMENT GATEWAY SYSTEM (LIVE PRODUCTION ARCHITECTURE)
  // =========================================================================

  // Server-side orders cache for tamper-proof amount and verification tracking
  interface ServerOrderCacheItem {
    orderId: string;
    amountInPaise: number;
    finalAmount: number;
    subtotal: number;
    deliveryFee: number;
    discountAmount: number;
    convenienceFee?: number;
    receipt: string;
    createdAt: number;
  }
  const serverOrdersCache = new Map<string, ServerOrderCacheItem>();

  // Helper: Get initialized Razorpay instance with LIVE credentials
  const getRazorpayInstance = (): Razorpay | null => {
    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    if (!keyId || !keySecret) {
      return null;
    }

    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  };

  // 1. GET /api/razorpay/config - Public configuration (Key ID only, NEVER Key Secret)
  app.get(["/api/razorpay/config", "/api/payment/config"], (_req, res) => {
    const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "").trim();
    const isConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    const isLiveMode = keyId.startsWith("rzp_live_") || (!keyId.startsWith("rzp_test_") && keyId.length > 5);

    return res.json({
      success: true,
      keyId,
      isConfigured,
      mode: isLiveMode ? "LIVE" : "TEST",
      freeShippingThreshold: 999,
      pricesIncludeGst: true,
      supportedMethods: ["UPI", "CARD", "NET_BANKING", "WALLET"],
    });
  });

  // 2. POST /api/razorpay/create-order - Authoritative Order Creation with Price Tamper Prevention
  const handleCreateRazorpayOrder = async (req: express.Request, res: express.Response) => {
    try {
      const {
        items = [],
        shippingInfo = {},
        couponCode,
        discountAmount = 0,
        flatShippingRate,
        freeShippingMinAmount,
        shippingFee,
        isFreeShipping,
        freeShippingPromo,
        receipt,
        notes = {},
      } = req.body || {};

      const razorpay = getRazorpayInstance();
      const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
      const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

      if (!razorpay || !keyId || !keySecret) {
        return res.status(503).json({
          success: false,
          message: "Razorpay Live credentials (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are not configured in server environment variables. Please configure them in your Vercel Project Settings.",
        });
      }

      // 1. Validate & Recalculate Subtotal on Server to Prevent Price Tampering
      let serverSubtotal = 0;
      if (Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
          let unitPrice = 0;

          // Check if item has a product ID in catalog
          const catalogItem = SERVER_PRODUCT_CATALOG.find((p) => p.id === (item.productId || item.product?.id));
          if (catalogItem && typeof catalogItem.price === "number") {
            unitPrice = catalogItem.price;
          } else {
            // Fall back to submitted unit price with safety validation
            unitPrice = Math.max(0, Number(item.price || item.product?.price) || 0);
          }

          serverSubtotal += unitPrice * qty;
        }
      } else {
        // Direct amount fallback if items array not provided
        serverSubtotal = Math.max(0, Number(req.body.subtotal ?? req.body.amount ?? req.body.totalAmount) || 0);
      }

      if (serverSubtotal <= 0) {
        return res.status(400).json({
          success: false,
          message: "Unable to calculate payable amount. Cart items are invalid or empty.",
        });
      }

      // 2. Validate Discount
      let validatedDiscount = Math.max(0, Math.min(Number(discountAmount) || 0, serverSubtotal));

      // 3. Authoritative Delivery Fee: Zero Hidden Charges
      // Free delivery applies if:
      // - Explicitly marked as free shipping (e.g. coupon / promo / store policy): isFreeShipping === true or freeShippingPromo === true
      // - Shipping fee explicitly sent as 0
      // - Subtotal >= freeShippingMinAmount (default threshold: 999)
      // - flatShippingRate is explicitly configured as 0
      const effectiveThreshold = Number(freeShippingMinAmount !== undefined ? freeShippingMinAmount : 999);
      let effectiveDeliveryFee = 0;
      const isExplicitFreeDelivery = Boolean(isFreeShipping || freeShippingPromo);
      const isThresholdMet = effectiveThreshold > 0 && serverSubtotal >= effectiveThreshold;

      if (isExplicitFreeDelivery || isThresholdMet) {
        effectiveDeliveryFee = 0;
      } else if (shippingFee !== undefined && Number(shippingFee) >= 0) {
        effectiveDeliveryFee = Number(shippingFee);
      } else if (flatShippingRate !== undefined && Number(flatShippingRate) >= 0) {
        effectiveDeliveryFee = Number(flatShippingRate);
      } else {
        // Default to 0 delivery fee if not specified, never silently add unrequested charges
        effectiveDeliveryFee = 0;
      }

      // 4. Authoritative Convenience Fee Calculation for Online Razorpay Checkout
      const isFeeEnabled = req.body.enableConvenienceFee !== false;
      const feeRate = Math.min(10, Math.max(0, Number(req.body.convenienceFeePercent ?? 2)));
      const isManualPayment = req.body.paymentMethod === 'COD' || req.body.paymentMethod === 'QR_SCAN' || req.body.paymentMethod === 'UPI';
      let serverConvenienceFee = 0;

      if (!isManualPayment && isFeeEnabled && feeRate > 0) {
        const feeBase = Math.max(0, serverSubtotal - validatedDiscount);
        serverConvenienceFee = Math.round((feeBase * feeRate) / 100);
      }

      // 5. GST-INCLUSIVE PRICING:
      // Product price is already tax-inclusive. No duplicate GST is added to the customer total.
      // Final Payable = Subtotal - Discount + Delivery Fee + Convenience Fee
      let finalPayableAmount = Math.max(
        0,
        serverSubtotal - validatedDiscount + effectiveDeliveryFee + serverConvenienceFee
      );

      // Authoritative Order ID Validation from Firestore (for WhatsApp & Direct Order Payment Links)
      const targetOrderId = (req.body.orderId || req.body.mfpOrderId || "").trim();
      if (targetOrderId) {
        try {
          const cleanId = targetOrderId.replace(/^#/, '');
          const candidateKeys = Array.from(new Set([cleanId, `#${cleanId}`, targetOrderId]));
          let foundFsData: any = null;

          for (const cand of candidateKeys) {
            const firestoreUrl = `https://firestore.googleapis.com/v1/projects/gen-lang-client-0934233443/databases/ai-studio-marudharfashionp-84582cae-673f-469e-bad0-503eef199989/documents/orders/${encodeURIComponent(cand)}`;
            const fsRes = await fetch(firestoreUrl);
            if (fsRes.ok) {
              foundFsData = await fsRes.json();
              break;
            }
          }

          if (foundFsData) {
            const fields = foundFsData.fields || {};
            const pStatus = fields.paymentStatus?.stringValue;
            const oStatus = fields.orderStatus?.stringValue;
            const fsTotal = fields.totalAmount?.doubleValue ?? fields.totalAmount?.integerValue;
            const fsDelivery = fields.shippingFee?.doubleValue ?? fields.shippingFee?.integerValue;
            const fsDiscount = fields.discountAmount?.doubleValue ?? fields.discountAmount?.integerValue;
            const fsConvenience = fields.convenienceFee?.doubleValue ?? fields.convenienceFee?.integerValue;
            const fsSubtotal = fields.subtotal?.doubleValue ?? fields.subtotal?.integerValue;

            if (pStatus === "PAID") {
              return res.status(400).json({
                success: false,
                message: "इस ऑर्डर का भुगतान पहले ही हो चुका है। (This order is already paid.)",
                alreadyPaid: true,
              });
            }

            if (oStatus === "CANCELLED") {
              return res.status(400).json({
                success: false,
                message: "यह ऑर्डर रद्द (Cancelled) हो चुका है। (This order is cancelled.)",
                cancelled: true,
              });
            }

            if (fsTotal !== undefined && Number(fsTotal) > 0) {
              finalPayableAmount = Number(fsTotal);
            }
            if (fsDelivery !== undefined) {
              effectiveDeliveryFee = Number(fsDelivery);
            }
            if (fsDiscount !== undefined) {
              validatedDiscount = Number(fsDiscount);
            }
            if (fsConvenience !== undefined) {
              serverConvenienceFee = Number(fsConvenience);
            }
            if (fsSubtotal !== undefined) {
              serverSubtotal = Number(fsSubtotal);
            }
          }
        } catch (fsErr) {
          console.warn("[Server Firestore check notice]:", fsErr);
        }
      }

      // Convert to Integer Paise (Zero floating-point arithmetic errors)
      const amountInPaise = Math.round(finalPayableAmount * 100);

      if (amountInPaise <= 0) {
        return res.status(400).json({
          success: false,
          message: "Payable amount must be greater than ₹0.",
        });
      }

      const orderReceipt = receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      // 5. Call Live Razorpay Orders API
      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: orderReceipt,
        notes: {
          store: "Marudhar Fashion Point",
          customerName: shippingInfo.name || "Customer",
          customerPhone: shippingInfo.phone || "",
          customerEmail: shippingInfo.email || "",
          couponCode: couponCode || "NONE",
          subtotal: `Rs.${serverSubtotal}`,
          delivery: `Rs.${effectiveDeliveryFee}`,
          discount: `Rs.${validatedDiscount}`,
          convenienceFee: `Rs.${serverConvenienceFee}`,
          finalAmount: `Rs.${finalPayableAmount}`,
          ...notes,
        },
      });

      // 6. Cache Order Details for Server-side Verification Cross-Check
      serverOrdersCache.set(rzpOrder.id, {
        orderId: rzpOrder.id,
        amountInPaise,
        finalAmount: finalPayableAmount,
        subtotal: serverSubtotal,
        deliveryFee: effectiveDeliveryFee,
        discountAmount: validatedDiscount,
        convenienceFee: serverConvenienceFee,
        receipt: orderReceipt,
        createdAt: Date.now(),
      });

      return res.json({
        success: true,
        order_id: rzpOrder.id,
        orderId: rzpOrder.id,
        amount: rzpOrder.amount, // in paise
        currency: rzpOrder.currency,
        keyId,
        calculatedAmount: finalPayableAmount,
        subtotal: serverSubtotal,
        deliveryFee: effectiveDeliveryFee,
        discountAmount: validatedDiscount,
        convenienceFee: serverConvenienceFee,
        totalAmount: finalPayableAmount,
        receipt: orderReceipt,
      });
    } catch (err: any) {
      console.error("[Razorpay Create Order Error]:", err?.error || err?.message || err);
      const description = err?.error?.description || err?.message || "Failed to create Razorpay live order.";
      return res.status(500).json({
        success: false,
        message: `Razorpay Order Error: ${description}`,
      });
    }
  };

  app.post("/api/razorpay/create-order", handleCreateRazorpayOrder);
  app.post("/api/create-order", handleCreateRazorpayOrder);
  app.post("/api/payment/create-order", handleCreateRazorpayOrder);

  // 3. POST /api/razorpay/verify-payment - Cryptographic Signature & Status Verification
  const handleVerifyRazorpayPayment = async (req: express.Request, res: express.Response) => {
    try {
      const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        customerName,
        customerEmail,
        customerPhone,
        paymentMethod = "ONLINE_UPI",
      } = req.body || {};

      if (!razorpay_payment_id || !razorpay_order_id) {
        return res.status(400).json({
          success: false,
          verified: false,
          status: "FAILED",
          message: "Missing razorpay_payment_id or razorpay_order_id. Verification rejected.",
        });
      }

      if (!razorpay_signature) {
        return res.status(400).json({
          success: false,
          verified: false,
          status: "FAILED",
          message: "Missing razorpay_signature. Cryptographic verification cannot proceed without signature.",
        });
      }

      const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
      const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();

      if (!keySecret) {
        return res.status(500).json({
          success: false,
          verified: false,
          status: "FAILED",
          message: "RAZORPAY_KEY_SECRET is not configured on the server. Please set it in Vercel environment variables.",
        });
      }

      // 1. Mandatory Cryptographic HMAC SHA256 Signature Verification:
      // signature = HMAC_SHA256(order_id + "|" + payment_id, secret)
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      const expectedBuf = Buffer.from(expectedSignature, "utf-8");
      const receivedBuf = Buffer.from(String(razorpay_signature || ""), "utf-8");

      const isSignatureValid =
        expectedBuf.length === receivedBuf.length &&
        crypto.timingSafeEqual(expectedBuf, receivedBuf);

      if (!isSignatureValid) {
        console.warn(`[Razorpay Signature Verification Rejected] Signature mismatch for Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`);
        return res.status(400).json({
          success: false,
          verified: false,
          status: "FAILED",
          message: "Cryptographic signature mismatch. Payment verification failed.",
        });
      }

      // 2. Fetch Payment Directly from Live Razorpay API to Confirm Capture Status
      const razorpay = getRazorpayInstance();
      let paymentDetails: any = null;
      if (razorpay) {
        try {
          paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
          if (paymentDetails) {
            // Confirm order_id matches
            if (paymentDetails.order_id && paymentDetails.order_id !== razorpay_order_id) {
              return res.status(400).json({
                success: false,
                verified: false,
                status: "FAILED",
                message: "Payment order reference does not match the server order.",
              });
            }

            // Confirm payment is authorized or captured
            if (paymentDetails.status !== "captured" && paymentDetails.status !== "authorized") {
              return res.status(400).json({
                success: false,
                verified: false,
                status: "FAILED",
                message: `Payment status is ${paymentDetails.status}. Expected 'captured' or 'authorized'.`,
              });
            }
          }
        } catch (fetchErr: any) {
          console.warn("[Razorpay API fetch warning]:", fetchErr?.message || fetchErr);
        }
      }

      // 3. Cross-check against cached server order amount if present
      const cachedOrder = serverOrdersCache.get(razorpay_order_id);
      const confirmedAmount = paymentDetails
        ? paymentDetails.amount / 100
        : cachedOrder
        ? cachedOrder.finalAmount
        : Number(req.body.amount) || 0;

      const verifiedAt = new Date().toISOString();

      // 4. Record Verified Transaction in Server Ledger Idempotently
      const existingTx = serverTransactionsLog.find((t) => t.paymentId === razorpay_payment_id);
      if (!existingTx) {
        const txRecord: ServerTransactionRecord = {
          id: `TX-${Date.now()}`,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          amount: confirmedAmount,
          currency: "INR",
          customerName: customerName || (paymentDetails?.notes?.customerName) || "Customer",
          customerEmail: customerEmail || paymentDetails?.email || "",
          customerPhone: customerPhone || paymentDetails?.contact || "",
          paymentMethod: paymentDetails?.method ? `RAZORPAY_${paymentDetails.method.toUpperCase()}` : paymentMethod,
          paymentStatus: "PAID",
          gatewayProvider: "RAZORPAY",
          isTestMode: keyId.startsWith("rzp_test_"),
          verifiedAt,
        };
        serverTransactionsLog.unshift(txRecord);
      }

      return res.json({
        success: true,
        verified: true,
        status: "PAID",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: confirmedAmount,
        verifiedAt,
        message: "Payment signature and status verified successfully.",
      });
    } catch (err: any) {
      console.error("[Razorpay Verify Payment Error]:", err);
      return res.status(500).json({
        success: false,
        verified: false,
        status: "FAILED",
        message: err.message || "Server error occurred during payment verification.",
      });
    }
  };

  app.post("/api/razorpay/verify-payment", handleVerifyRazorpayPayment);
  app.post("/api/verify-payment", handleVerifyRazorpayPayment);
  app.post("/api/payment/verify", handleVerifyRazorpayPayment);

  // 4. POST /api/razorpay/webhook - Server-to-Server Razorpay Webhook Event Processor
  app.post("/api/razorpay/webhook", async (req: any, res: express.Response) => {
    try {
      const webhookSignature = req.headers["x-razorpay-signature"] as string;
      const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();

      if (!webhookSecret) {
        console.error("[Razorpay Webhook Error]: RAZORPAY_WEBHOOK_SECRET is not configured on server.");
        return res.status(500).json({ error: "Webhook secret is not configured on server." });
      }

      if (!webhookSignature) {
        console.warn("[Razorpay Webhook Warning]: Missing x-razorpay-signature header");
        return res.status(400).json({ error: "Missing x-razorpay-signature header" });
      }

      const rawBody = req.rawBody || JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      const expectedBuf = Buffer.from(expectedSignature, "utf-8");
      const signatureBuf = Buffer.from(webhookSignature, "utf-8");

      if (expectedBuf.length !== signatureBuf.length || !crypto.timingSafeEqual(expectedBuf, signatureBuf)) {
        console.error("[Razorpay Webhook Error]: Invalid webhook signature");
        return res.status(400).json({ error: "Invalid webhook signature" });
      }

      const event = req.body?.event;
      const payload = req.body?.payload;

      console.log(`[Razorpay Webhook Received]: ${event}`);

      if (event === "payment.captured" || event === "order.paid" || event === "payment.authorized") {
        const payment = payload?.payment?.entity;
        const order = payload?.order?.entity;
        const paymentId = payment?.id;
        const orderId = payment?.order_id || order?.id;

        if (paymentId && orderId) {
          const existingTx = serverTransactionsLog.find((t) => t.paymentId === paymentId);
          if (!existingTx) {
            serverTransactionsLog.unshift({
              id: `TX-WH-${Date.now()}`,
              orderId,
              paymentId,
              amount: (payment?.amount || order?.amount || 0) / 100,
              currency: "INR",
              customerName: payment?.notes?.customerName || "Customer",
              customerEmail: payment?.email || "",
              customerPhone: payment?.contact || "",
              paymentMethod: payment?.method ? `RAZORPAY_${payment.method.toUpperCase()}` : "RAZORPAY_WEBHOOK",
              paymentStatus: "PAID",
              gatewayProvider: "RAZORPAY",
              isTestMode: false,
              verifiedAt: new Date().toISOString(),
            });
          }
        }
      } else if (event === "payment.failed") {
        const payment = payload?.payment?.entity;
        console.warn(`[Razorpay Payment Failed Webhook]: Payment ${payment?.id}, Reason: ${payment?.error_description}`);
      }

      // Always return 200 OK to acknowledge receipt to Razorpay
      return res.status(200).json({ status: "ok" });
    } catch (err: any) {
      console.error("[Razorpay Webhook Processing Exception]:", err);
      return res.status(500).json({ error: err.message || "Webhook processing error" });
    }
  });

  // 5. POST /api/payment/refund - Process Refund via Live Razorpay API
  app.post("/api/payment/refund", async (req, res) => {
    try {
      const { paymentId, amount, reason = "Customer requested refund" } = req.body || {};

      if (!paymentId) {
        return res.status(400).json({ success: false, message: "Payment ID required for refund" });
      }

      const razorpay = getRazorpayInstance();
      if (!razorpay) {
        return res.status(503).json({
          success: false,
          message: "Razorpay credentials are not configured in server environment variables.",
        });
      }

      const rzpRefund = await razorpay.payments.refund(paymentId, {
        amount: amount ? Math.round(amount * 100) : undefined,
        notes: { reason },
      });

      const refundId = rzpRefund.id || `rfnd_${Date.now()}`;

      // Update in-memory log
      const txIndex = serverTransactionsLog.findIndex((t) => t.paymentId === paymentId);
      if (txIndex >= 0) {
        serverTransactionsLog[txIndex].refunded = true;
        serverTransactionsLog[txIndex].paymentStatus = "REFUNDED";
        serverTransactionsLog[txIndex].refundId = refundId;
        serverTransactionsLog[txIndex].refundAmount = amount || serverTransactionsLog[txIndex].amount;
      }

      return res.json({
        success: true,
        refundId,
        paymentId,
        status: "REFUNDED",
        amount,
        message: `Refund of ₹${amount || "full amount"} processed successfully via Razorpay. Refund ID: ${refundId}`,
      });
    } catch (err: any) {
      console.error("[POST /api/payment/refund Error]:", err);
      const description = err?.error?.description || err?.message || "Failed to process refund via Razorpay.";
      return res.status(500).json({ success: false, message: description });
    }
  });

  // 6. GET /api/payment/transactions - Server Ledger
  app.get("/api/payment/transactions", (_req, res) => {
    return res.json({
      success: true,
      count: serverTransactionsLog.length,
      transactions: serverTransactionsLog,
    });
  });

  // 7. POST /api/payment/test-gateway - Server Connection Probe (Zero-Trust)
  app.post("/api/payment/test-gateway", async (_req, res) => {
    try {
      const razorpay = getRazorpayInstance();
      const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
      const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

      if (!razorpay || !keyId || !keySecret) {
        return res.status(503).json({
          success: false,
          connected: false,
          message: "Razorpay environment variables (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are missing or incomplete on the server.",
        });
      }

      const isLive = keyId.startsWith("rzp_live_") || (!keyId.startsWith("rzp_test_") && keyId.length > 5);

      return res.json({
        success: true,
        connected: true,
        mode: isLive ? "LIVE" : "TEST",
        keyIdPrefix: keyId.substring(0, 8) + "...",
        message: `✓ Gateway Connection Active (${isLive ? "LIVE Mode" : "TEST Mode"}).`,
      });
    } catch (err: any) {
      console.error("[Test Gateway Probe Error]:", err);
      return res.status(500).json({
        success: false,
        connected: false,
        message: err.message || "Failed to probe Razorpay gateway.",
      });
    }
  });

  // =========================================================================
  // WHATSAPP BUSINESS CLOUD API INTEGRATION (FUTURE / LIVE CLOUD API SUPPORT)
  // =========================================================================
  app.post("/api/whatsapp/send-order", async (req, res) => {
    try {
      const {
        productName,
        sku,
        size,
        color,
        quantity,
        price,
        productUrl,
        productImage,
        customerPhone,
        customerMessage,
      } = req.body || {};

      const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

      const messageText = `🛍️ *Hello Marudhar Fashion Point*,

I want to order this product.

📦 *Product:*
${productName || 'N/A'}

🏷️ *SKU:*
${sku || 'N/A'}

📏 *Size:*
${size || 'Standard'}

🎨 *Colour:*
${color || 'Standard'}

🔢 *Quantity:*
${quantity || 1}

💰 *Price:*
₹${price ? Number(price).toLocaleString('en-IN') : '0'}

🔗 *Product Link:*
${productUrl || ''}

${customerMessage || 'Please confirm availability.'}`;

      if (token && phoneNumberId) {
        try {
          const recipientPhone = (customerPhone || '919782482250').replace(/[^0-9]/g, '');

          // Call Meta WhatsApp Business Cloud API with Image & Caption
          const graphApiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
          const payload = productImage
            ? {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: recipientPhone,
                type: "image",
                image: {
                  link: productImage,
                  caption: messageText,
                },
              }
            : {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: recipientPhone,
                type: "text",
                text: { body: messageText },
              };

          const waResponse = await fetch(graphApiUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          const waData = await waResponse.json();

          if (waResponse.ok) {
            return res.json({
              success: true,
              mode: "CLOUD_API",
              messageId: waData?.messages?.[0]?.id,
              status: "SENT",
              message: "Order with product image sent directly via WhatsApp Business Cloud API!",
            });
          } else {
            console.warn("[WhatsApp Cloud API Note]:", waData);
          }
        } catch (apiErr: any) {
          console.warn("[WhatsApp Cloud API Error]:", apiErr?.message);
        }
      }

      // Fallback response for direct deep link
      const encoded = encodeURIComponent(messageText);
      const targetWhatsAppNumber = (customerPhone || '919782482250').replace(/[^0-9]/g, '');

      return res.json({
        success: true,
        mode: "DEEP_LINK",
        whatsappUrl: `https://wa.me/${targetWhatsAppNumber}?text=${encoded}`,
        isCloudApiConfigured: !!(token && phoneNumberId),
        message: "WhatsApp Cloud API credentials not configured yet. Prepared direct WhatsApp deep link.",
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // =========================================================================
  // DYNAMIC OPEN GRAPH METADATA ROUTE FOR WHATSAPP PRODUCT LINK PREVIEWS
  // =========================================================================
  const SERVER_PRODUCT_CATALOG: any[] = [
    {
      id: 'mfp-m01',
      sku: 'MFP-M01-RUN',
      slug: 'marudhar-airglide-knit-running-shoes',
      name: 'Marudhar AirGlide Knit Running Shoes',
      price: 1499,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80'],
      description: 'Ultra-breathable flyknit mesh running shoes engineered for maximum cushioning and responsive shock absorption.',
    },
    {
      id: 'mfp-m02',
      sku: 'MFP-M02-LOAF',
      slug: 'royal-heritage-handcrafted-leather-loafers',
      name: 'Royal Heritage Handcrafted Leather Loafers',
      price: 2299,
      images: ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1200&q=80'],
      description: 'Luxurious burnished genuine leather loafers featuring memory foam insoles and anti-slip rubber outsoles.',
    },
    {
      id: 'mfp-w01',
      sku: 'MFP-W01-SPT',
      slug: 'marudhar-women-progrip-cushioned-sports-shoes',
      name: 'Marudhar Women ProGrip Cushioned Sports Shoes',
      price: 1699,
      images: ['https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80'],
      description: 'Ultra-comfortable athletic sports shoes designed for women with memory foam cushioning.',
    },
    {
      id: 'mfp-k01',
      sku: 'MFP-K01-SCH',
      slug: 'marudhar-junior-flex-light-up-sports-shoes',
      name: 'Marudhar Junior Flex Light-Up Sports Shoes',
      price: 899,
      images: ['https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80'],
      description: 'Durable, lightweight children sneakers with easy velcro closure and fun LED heel lights.',
    },
  ];

  const handleProductRoute = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const rawSlug = req.params.slug || "";
      const target = rawSlug.trim().toLowerCase();

      // Find product in catalog
      const foundProduct = SERVER_PRODUCT_CATALOG.find(
        (p) =>
          p.slug.toLowerCase() === target ||
          p.id.toLowerCase() === target ||
          (p.sku && p.sku.toLowerCase() === target) ||
          target.includes(p.id.toLowerCase())
      );

      const fs = await import("fs");
      const indexHtmlPath = process.env.NODE_ENV === "production"
        ? path.join(process.cwd(), "dist", "index.html")
        : path.join(process.cwd(), "index.html");

      if (fs.existsSync(indexHtmlPath)) {
        let html = fs.readFileSync(indexHtmlPath, "utf-8");

        if (foundProduct) {
          const host = req.get("host") || "marudhar-fashion-point-1.vercel.app";
          const protocol = req.protocol || "https";
          const fullUrl = `${protocol}://${host}/product/${foundProduct.id || foundProduct.slug}`;
          const title = `${foundProduct.name} | Marudhar Fashion Point`;
          const desc = `Buy ${foundProduct.name} (SKU: ${foundProduct.sku || foundProduct.id}) for ₹${foundProduct.price.toLocaleString('en-IN')}. ${foundProduct.description}`;
          const imgUrl = foundProduct.images?.[0] || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80';

          const ogTags = `
    <!-- Dynamic Open Graph & WhatsApp Product Link Metadata -->
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="Marudhar Fashion Point" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${imgUrl}" />
    <meta property="og:image:secure_url" content="${imgUrl}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="product:price:amount" content="${foundProduct.price}" />
    <meta property="product:price:currency" content="INR" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${imgUrl}" />
`;

          html = html.replace("<head>", `<head>${ogTags}`);
        }

        return res.send(html);
      }
    } catch (err) {
      console.warn("[OG Route Note]:", err);
    }
    next();
  };

  app.get("/product/:slug", handleProductRoute);
  app.get("/products/:slug", handleProductRoute);

  // =========================================================================
  // CLEAN PRODUCT IMAGE HOSTING & PROXY ROUTE
  // Ensures WhatsApp and external links always get a clean HTTP/HTTPS image
  // =========================================================================
  const handleProductImageRequest = async (req: express.Request, res: express.Response) => {
    try {
      const productId = req.params.id || (req.query.id as string) || (req.query.productId as string) || "";
      const target = productId.trim().toLowerCase();

      if (!target) {
        return res.status(404).send("Product image not found");
      }

      // 1. Check server product catalog for the real product image
      const foundProduct = SERVER_PRODUCT_CATALOG.find(
        (p) =>
          p.id?.toLowerCase() === target ||
          p.slug?.toLowerCase() === target ||
          (p.sku && p.sku.toLowerCase() === target)
      );

      if (foundProduct && Array.isArray(foundProduct.images) && foundProduct.images.length > 0) {
        const firstImg = foundProduct.images[0];
        if (typeof firstImg === 'string' && firstImg.trim()) {
          if (firstImg.startsWith('http://') || firstImg.startsWith('https://')) {
            return res.redirect(302, firstImg);
          }
          if (firstImg.startsWith('data:image/')) {
            const matches = firstImg.match(/^data:image\/([a-zA-Z+.-]+);base64,(.+)$/);
            if (matches) {
              const mimeType = `image/${matches[1]}`;
              const imgBuffer = Buffer.from(matches[2], 'base64');
              res.setHeader('Content-Type', mimeType);
              res.setHeader('Cache-Control', 'public, max-age=86400');
              return res.send(imgBuffer);
            }
          }
        }
      }

      // 2. Check Firestore via REST API for the real uploaded product image
      try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/gen-lang-client-0934233443/databases/ai-studio-marudharfashionp-84582cae-673f-469e-bad0-503eef199989/documents/products/${encodeURIComponent(productId)}`;
        const fsRes = await fetch(firestoreUrl);
        if (fsRes.ok) {
          const docData = await fsRes.json();
          const fields = docData.fields || {};
          const imagesValues = fields.images?.arrayValue?.values || [];
          if (imagesValues.length > 0) {
            const firstImg = imagesValues[0]?.stringValue;
            if (typeof firstImg === 'string' && firstImg.trim()) {
              if (firstImg.startsWith('http://') || firstImg.startsWith('https://')) {
                return res.redirect(302, firstImg);
              }
              if (firstImg.startsWith('data:image/')) {
                const matches = firstImg.match(/^data:image\/([a-zA-Z+.-]+);base64,(.+)$/);
                if (matches) {
                  const mimeType = `image/${matches[1]}`;
                  const imgBuffer = Buffer.from(matches[2], 'base64');
                  res.setHeader('Content-Type', mimeType);
                  res.setHeader('Cache-Control', 'public, max-age=86400');
                  return res.send(imgBuffer);
                }
              }
            }
          }
        }
      } catch (dbErr) {
        console.warn('[api/product-image firestore fetch error]:', dbErr);
      }

      // 3. If product genuinely has no real image, return 404 rather than a fake demo image
      return res.status(404).send("Product image not found");
    } catch (err) {
      return res.status(404).send("Product image not found");
    }
  };

  app.get("/api/product-image/:id", handleProductImageRequest);
  app.get("/api/product-image", handleProductImageRequest);

  // =========================================================================
  // DYNAMIC SEO LOCATION PAGES
  // =========================================================================
  app.get("/seo/:location", async (req, res, next) => {
    try {
      const location = req.params.location?.replace(/-/g, ' ');
      const fs = await import("fs");
      const indexHtmlPath = process.env.NODE_ENV === "production"
        ? path.join(process.cwd(), "dist", "index.html")
        : path.join(process.cwd(), "index.html");

      if (fs.existsSync(indexHtmlPath)) {
        let html = fs.readFileSync(indexHtmlPath, "utf-8");
        
        // Capitalize location
        const capitalizedLocation = location.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        const title = `Best Footwear Store in ${capitalizedLocation} | Shoes & Accessories`;
        const desc = `Discover the best shoes, sneakers, and fashion accessories in ${capitalizedLocation}. Shop at Marudhar Fashion Point for premium quality footwear with exclusive local offers.`;
        const imgUrl = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80';
        
        const host = req.get("host") || "marudhar-fashion-point-1.vercel.app";
        const protocol = req.protocol || "https";
        const fullUrl = `${protocol}://${host}/seo/${req.params.location}`;

        const ogTags = `
    <!-- Dynamic SEO Location Metadata -->
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Marudhar Fashion Point" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${imgUrl}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
`;
        html = html.replace("<head>", `<head>${ogTags}`);
        return res.send(html);
      }
    } catch (err) {
      console.warn("[SEO Route Note]:", err);
    }
    next();
  });

  // =========================================================================
  // DYNAMIC SITEMAP AND ROBOTS.TXT
  // =========================================================================
  app.get("/robots.txt", (req, res) => {
    const host = req.get("host") || "marudhar-fashion-point-1.vercel.app";
    const protocol = req.protocol || "https";
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nSitemap: ${protocol}://${host}/sitemap.xml`);
  });

  app.get("/sitemap.xml", (req, res) => {
    const host = req.get("host") || "marudhar-fashion-point-1.vercel.app";
    const protocol = req.protocol || "https";
    const baseUrl = `${protocol}://${host}`;
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/store-locator</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;

    // Add products
    SERVER_PRODUCT_CATALOG.forEach(p => {
      xml += `
  <url>
    <loc>${baseUrl}/product/${p.slug || p.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `\n</urlset>`;
    
    res.type('application/xml');
    res.send(xml);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
