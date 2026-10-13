import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// ─── Provider Config ────────────────────────────────────────────────────────
// Which env-var keys each provider needs to be "configured"
const PROVIDER_ENV_MAP: Record<string, { envKey: string; models: { id: string; name: string }[] }> = {
  gemini: {
    envKey: "GEMINI_API_KEY",
    models: [
      { id: "gemini-3.8-flash",        name: "Gemini 3.8 Flash" },
      { id: "gemini-3.1-pro-preview",  name: "Gemini 3.1 Pro Preview" },
      { id: "gemini-3.1-flash-lite",   name: "Gemini 3.1 Flash Lite" },
      { id: "gemini-flash-latest",     name: "Gemini Flash Latest" },
    ],
  },
  claude: {
    envKey: "CLAUDE_API_KEY",
    models: [
      { id: "claude-opus-4-5",   name: "Claude Opus 4.5" },
      { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5" },
      { id: "claude-haiku-3-5",  name: "Claude Haiku 3.5" },
      { id: "claude-opus-4-0",   name: "Claude Opus 4" },
      { id: "claude-sonnet-4-0", name: "Claude Sonnet 4" },
      { id: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet" },
      { id: "claude-3-5-haiku",  name: "Claude 3.5 Haiku" },
      { id: "claude-3-opus",     name: "Claude 3 Opus" },
    ],
  },
  deepseek: {
    envKey: "DEEPSEEK_API_KEY",
    models: [
      { id: "deepseek-chat",                name: "DeepSeek V3 (Chat)" },
      { id: "deepseek-reasoner",            name: "DeepSeek R1 (Reasoner)" },
      { id: "deepseek-v3-0324",             name: "DeepSeek V3 0324" },
      { id: "deepseek-r1-0528",             name: "DeepSeek R1 0528" },
      { id: "deepseek-coder-v2",            name: "DeepSeek Coder V2" },
      { id: "deepseek-r1-distill-qwen-32b", name: "R1 Distill Qwen 32B" },
    ],
  },
  glm: {
    envKey: "GLM_API_KEY",
    models: [
      { id: "glm-4-plus",  name: "GLM-4 Plus" },
      { id: "glm-4-air",   name: "GLM-4 Air" },
      { id: "glm-4-airx",  name: "GLM-4 AirX" },
      { id: "glm-4-flash", name: "GLM-4 Flash" },
      { id: "glm-4-long",  name: "GLM-4 Long" },
      { id: "glm-4v-plus", name: "GLM-4V Plus" },
      { id: "glm-z1-flash",name: "GLM-Z1 Flash" },
      { id: "glm-z1-air",  name: "GLM-Z1 Air" },
    ],
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function isKeyValid(key: string | undefined): boolean {
  return !!key && key.length > 10 && !["MY_GEMINI_API_KEY", "your_gemini_api_key", ""].includes(key);
}

function getProviderConfig() {
  return Object.entries(PROVIDER_ENV_MAP).map(([id, cfg]) => ({
    id,
    isConfigured: isKeyValid(process.env[cfg.envKey]),
    models: cfg.models,
  }));
}

// ─── Gemini Client (lazy) ───────────────────────────────────────────────────
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY",
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }
  return aiClient;
}

// ─── Simulated / Fallback Responses ─────────────────────────────────────────
function getSimulatedResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("proposal") || lower.includes("draft")) {
    return `Certainly. Here's a mood board concept for the glassmorphism approach:\n\n• **Layered Depth with Backdrop Blurs**: Translucent containers with blur(10px).\n• **Vibrant Gradient Accents**: Rich indigo, purple, or cyan highlights.\n• **Typography Precision**: Clean 'Inter' sans-serif with ample tracking.\n\nWould you like to expand the layout or pick a color palette?`;
  }
  if (lower.includes("bento") || lower.includes("grid")) {
    return `A bento grid layout is perfect for dashboards:\n\n1. **Focus Metrics**: Large primary card spanning 2 columns.\n2. **Recent Activities**: A slim, taller vertical card.\n3. **Quick Preferences**: Compact square widgets.\n\nWant a React component or a Tailwind layout recommendation?`;
  }
  if (lower.includes("hello") || lower.includes("hi")) {
    return "Hello! I'm PAB AI, your professional digital assistant. How can I help you optimize your design, draft proposals, or guide your workflow today?";
  }
  if (lower.includes("color") || lower.includes("palette")) {
    return "For PAB AI's Monochromatic style: deep dark charcoal (#1C1B1D) with clean whites, complemented by a soft cyan-accent (#00BCD4) for key highlights.";
  }
  if (lower.includes("regex") || lower.includes("python") || lower.includes("code")) {
    return "Here is a robust Python script for validating emails:\n\n```python\nimport re\n\ndef validate_email(email):\n    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'\n    return bool(re.match(pattern, email))\n\nprint(validate_email('alex.j@example.com'))  # True\n```";
  }
  if (lower.includes("analysis") || lower.includes("market")) {
    return "High-level market analysis:\n\n1. **Target Audience**: Professional designers and workflow optimizers.\n2. **Key Competitors**: Generic chatbots lacking visually tailored responses.\n3. **Value Proposition**: Translucent bento-lite interfaces with cohesive palettes.";
  }
  if (lower.includes("expand") || lower.includes("outline")) {
    return "Expanded outline:\n\n1. **Executive Summary** — Problem statement and solution overview.\n2. **Market Opportunity** — TAM/SAM/SOM analysis with supporting data.\n3. **Product Design** — Wireframes, user flows, and glassmorphism principles.\n4. **Technical Architecture** — Stack, infrastructure, and scalability plan.\n5. **Go-to-Market Strategy** — Launch timeline and acquisition channels.";
  }

  return `I received your message: "${message}". PAB AI is ready to help you optimize your design, draft proposals, or guide your workflow!`;
}

// ─── Gemini Model Normalizer ─────────────────────────────────────────────
function normalizeGeminiModel(model?: string): string {
  if (!model) return "gemini-3.8-flash";
  const m = model.toLowerCase();
  if (m.includes("3.1-pro") || m.includes("3-pro")) return "gemini-3.1-pro-preview";
  if (m.includes("pro")) return "gemini-3.1-pro-preview";
  if (m.includes("lite")) return "gemini-3.1-flash-lite";
  if (m === "gemini-flash-latest") return "gemini-flash-latest";
  if (m === "gemini-3.8-flash") return "gemini-3.8-flash";
  // Any legacy or unrecognized models (e.g. gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-*)
  return "gemini-3.8-flash";
}

// ─── Gemini Chat ─────────────────────────────────────────────────────────────
async function callGemini(model: string, message: string, history: { sender: string; text: string }[]): Promise<string> {
  const targetModel = normalizeGeminiModel(model);
  const ai = getGeminiClient();

  const contents = [
    ...history.map(m => ({
      role: m.sender === "user" ? "user" : "model" as const,
      parts: [{ text: m.text }],
    })),
    { role: "user" as const, parts: [{ text: message }] },
  ];

  const response = await ai.models.generateContent({
    model: targetModel,
    contents,
    config: {
      systemInstruction:
        "You are PAB AI, a professional, friendly, and highly intelligent digital assistant. Speak clearly, objectively, and with professional composure. Keep responses concise, helpful, and beautifully formatted in markdown. When helping with UI, layout, design or code, provide highly practical and structured suggestions.",
    },
  });

  return response.text || "I was unable to formulate a response. Please try again.";
}

// ─── Express App ─────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // ── /api/ai/config ── returns which providers are configured ──────────────
  app.get("/api/ai/config", (_req, res) => {
    res.json({ success: true, config: getProviderConfig() });
  });

  // ── /api/ai/chat ── main chat endpoint (matches frontend calls) ──────────
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { provider = "gemini", model = "gemini-3.8-flash", message, history = [] } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const geminiKey = process.env.GEMINI_API_KEY;
      const useReal = provider === "gemini" && isKeyValid(geminiKey);

      if (useReal) {
        try {
          const text = await callGemini(model, message, history);
          return res.json({ text });
        } catch (innerErr: any) {
          const msg = innerErr?.message || String(innerErr);
          console.error("Gemini API error:", msg);

          if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
            const sim = getSimulatedResponse(message);
            return res.json({
              text: `⚠️ **[Free Quota Limit Reached — Running in Simulator]**\n\n${sim}`,
              isMock: true,
            });
          }
          throw innerErr;
        }
      }

      // Fallback simulation for any provider without a valid key
      await new Promise(r => setTimeout(r, 800));
      const responseText = getSimulatedResponse(message);
      return res.json({ text: responseText, isMock: true });
    } catch (err: any) {
      console.error("Chat API error:", err);
      res.status(500).json({ error: err.message || "An error occurred." });
    }
  });

  // ── /api/chat ── backward-compatible alias ───────────────────────────────
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!isKeyValid(apiKey)) {
        await new Promise(r => setTimeout(r, 1000));
        return res.json({ text: getSimulatedResponse(message), isMock: true });
      }

      try {
        const text = await callGemini("gemini-3.8-flash", message, history || []);
        return res.json({ text });
      } catch (innerErr: any) {
        const msg = innerErr?.message || String(innerErr);
        if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
          const sim = getSimulatedResponse(message);
          return res.json({
            text: `⚠️ **[Quota Limit Reached]**\n\n${sim}`,
            isMock: true,
          });
        }
        throw innerErr;
      }
    } catch (err: any) {
      console.error("Legacy chat error:", err);
      res.status(500).json({ error: err.message || "An error occurred." });
    }
  });

  // ── Vite Dev Middleware / Static Serving ─────────────────────────────────
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
    const providerStatus = getProviderConfig()
      .map(p => `${p.id}: ${p.isConfigured ? "✓ configured" : "✗ not configured"}`)
      .join(" | ");
    console.log(`\n🚀 PAB AI server running on port ${PORT}`);
    console.log(`📡 Providers: ${providerStatus}\n`);
  });
}

startServer();
