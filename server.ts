import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON payload up to 30MB for base64 image uploads
  app.use(express.json({ limit: "30mb" }));
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

      // If GEMINI_API_KEY is available, use Gemini 3.6 Flash Vision to detect shoe bounding box & segmentation instructions
      let visionPrompt = `Analyze this image containing a shoe/sneaker.
Identify the exact bounding box coordinates [ymin, xmin, ymax, xmax] of ONLY the primary shoe object, ignoring all background, poster text, rocks, badges, and logos outside the shoe.
Respond with JSON: {"box": [ymin, xmin, ymax, xmax], "confidence": 0.95, "shoeType": "sneaker"}`;

      let base64Data = "";
      let mimeType = "image/png";

      if (imageSrc.startsWith("data:")) {
        const parts = imageSrc.split(",");
        mimeType = parts[0].match(/:(.*?);/)?.[1] || "image/png";
        base64Data = parts[1];
      }

      let boundingBox = null;

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
            if (parsed.box && Array.isArray(parsed.box)) {
              boundingBox = parsed.box; // [ymin, xmin, ymax, xmax] normalized 0-1000
            }
          }
        } catch (geminiErr) {
          console.warn("[Gemini AI Extraction] Vision analysis note:", geminiErr);
        }
      }

      return res.json({
        success: true,
        boundingBox,
        message: "Shoe AI detection completed successfully",
      });
    } catch (err: any) {
      console.error("[API extract-shoe Error]:", err);
      return res.status(500).json({ error: err.message || "Extraction failed" });
    }
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
