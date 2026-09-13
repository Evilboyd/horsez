import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini AI lazily or safely
  let ai: GoogleGenAI | null = null;
  function getAI() {
    if (!ai && process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return ai;
  }

  // Health API
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "horsez digital stable" });
  });

  // AI Equine Triage & Consultation API
  app.post("/api/ai/triage", async (req, res) => {
    try {
      const { symptoms, horseName, photoDescription } = req.body;
      const genAI = getAI();
      
      if (!genAI) {
        return res.json({
          urgency: symptoms?.includes("Severe Colic") ? "CODE RED" : "URGENT CARE",
          assessment: "Initial triage based on selected symptoms: Immediate veterinarian review recommended. Ensure horse remains calm and in a safe environment.",
          recommendations: [
            "Monitor heart rate and mucous membrane color",
            "Do not give medication without vet direction",
            "Keep horse walking gently if colic is suspected",
            "Prepare Coggins & health records for dispatch"
          ],
          aiPowered: false
        });
      }

      const prompt = `You are an expert equine veterinary emergency triage specialist for the app 'horsez'.
Assess the following situation:
Horse Name: ${horseName || "Horse"}
Symptoms Selected: ${Array.isArray(symptoms) ? symptoms.join(", ") : symptoms}
Additional Notes: ${photoDescription || "None provided"}

Provide a structured JSON response (strictly valid JSON) with:
1. "urgency": "CODE RED" or "URGENT CARE" or "ROUTINE"
2. "assessment": A clear 2-3 sentence emergency triage statement.
3. "recommendations": Array of 3-5 immediate steps for the horse owner while waiting for vet dispatch.
4. "suggestedCategory": Which of the horsez categories to access ("Emergency Vet", "Routine Vet", "Farrier", "Feed & Supplies").`;

      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json({ ...parsed, aiPowered: true });
    } catch (err: any) {
      console.error("AI Triage Error:", err);
      res.json({
        urgency: "URGENT CARE",
        assessment: "Emergency triage protocol activated. A veterinarian team has been flagged for dispatch.",
        recommendations: [
          "Keep horse calm and isolated in a well-ventilated stall",
          "Ensure fresh clean water is accessible if appropriate",
          "Have your horse's medical records ready for the incoming vet"
        ],
        aiPowered: false
      });
    }
  });

  // AI Equine Assistant (Smart Search & Recommendations)
  app.post("/api/ai/assistant", async (req, res) => {
    try {
      const { query } = req.body;
      const genAI = getAI();

      if (!genAI) {
        return res.json({
          reply: `I can help you find services on horsez! For "${query}", try exploring our 8 main categories: Emergency Vet, Routine Vets, Farriers, Transportation, Trainers, Feed & Supplies, Bed & Bale Lodging, or Buy & Sell Marketplace.`
        });
      }

      const prompt = `You are 'horsez AI', an equine expert assistant inside the 'horsez' app.
The app offers 8 services:
1. Emergency Vet (Dispatch, video triage, code red)
2. Routine Vet (Vaccines, clinic booking, medical records)
3. Farriers (Emergency shoe fix, routine trim, hoof photo logs)
4. Transportation (Uber for horses, live route tracking, hauler bids)
5. Trainers (Tinder-style matching, video portfolio, exercise rides)
6. Feed & Supplies (Chewy-style shop, bulk hay, subscriptions)
7. Bed & Bale Lodging (Priceline-style horse motels, RV pads, stalls)
8. Buy & Sell Marketplace (FB Marketplace style horses, tack, trailers)

User query: "${query}"
Provide a friendly, helpful 2-4 sentence response directing the user or answering their horse care question. Keep it concise, practical, and encourage using the appropriate horsez category.`;

      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ reply: response.text });
    } catch (err: any) {
      console.error("AI Assistant Error:", err);
      res.json({ reply: "I'm ready to assist you with all your equine needs on horsez! Browse our 8 specialized services above." });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[horsez] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
