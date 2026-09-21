import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json({ limit: "5mb" }));

// CORS handler for cross-origin requests & Vercel previews
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Lazy initialization of Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build-vercel",
      },
    },
  });
}

// Router containing all API endpoints
const router = express.Router();

// Root API info endpoint
router.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Web App Prompt Builder API is running on Vercel Serverless",
    endpoints: [
      "GET /api/health",
      "POST /api/analyze-requirements",
      "POST /api/refine-prompt",
    ],
  });
});

// Health check endpoint
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    platform: "vercel-serverless",
  });
});

// Smart Idea Analysis & Auto-Expansion Endpoint
router.post("/analyze-requirements", async (req: Request, res: Response) => {
  try {
    const { idea, currentData } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: false,
        fallback: true,
        message: "GEMINI_API_KEY not configured. Falling back to built-in domain heuristics.",
      });
    }

    const prompt = `Anda adalah Software Architect dan Technical Prompt Engineer Senior.
Pengguna ingin membangun aplikasi web:
Ide / Deskripsi Pengguna: "${idea}"
Data yang sudah diisi pengguna: ${JSON.stringify(currentData || {})}

Tugas Anda:
1. Analisis kebutuhan sistem secara mendalam.
2. Identifikasi:
   - Nama aplikasi yang ideal
   - Ringkasan tujuan aplikasi
   - Target pengguna
   - User roles & permissions (minimal 2-3 role spesifik)
   - Modul & fitur inti yang wajib ada
   - Alur kerja utama (User Flow step-by-step)
   - Struktur halaman web
   - Database rekomendasi & struktur tabel utama (nama tabel, kolom kunci)
   - API endpoints utama (REST/RPC)
   - Auth & Authorization (JWT, Session, RBAC)
   - Rekomendasi Tech Stack (Frontend, Backend, Styling, Database)
   - Desain UI/UX & Responsive requirement
   - Security & Validation checklist
   - Hal-hal penting yang "Perlu Ditentukan" oleh pengguna (misal payment gateway spesifik, SLA, dll).

Berikan output HANYA dalam format JSON valid dengan skema berikut tanpa backtick markdown:
{
  "appName": "...",
  "appDescription": "...",
  "targetUsers": "...",
  "roles": [
    {"name": "...", "description": "...", "permissions": ["..."]}
  ],
  "modules": [
    {"name": "...", "features": ["...", "..."]}
  ],
  "userFlows": ["1. ...", "2. ..."],
  "pages": ["/dashboard - Halaman utama...", "/..."],
  "database": {
    "type": "PostgreSQL / Supabase / MongoDB / Firebase",
    "tables": [
      {"name": "...", "description": "...", "columns": ["id (PK)", "name (VARCHAR)", "..."]}
    ]
  },
  "apis": [
    {"method": "POST", "path": "/api/...", "description": "..."}
  ],
  "auth": {
    "type": "JWT / OAuth / Supabase Auth",
    "mechanism": "..."
  },
  "techStack": {
    "frontend": "React + TypeScript + Tailwind CSS",
    "backend": "Node.js (Express / Fastify) / Next.js",
    "database": "PostgreSQL + Prisma ORM",
    "uiLibrary": "Lucide React, Tailwind CSS"
  },
  "uiUxDesign": "Clean modern dashboard...",
  "security": ["Input sanitization", "Rate limiting", "RBAC middleware"],
  "missingToDecide": ["Penyedia payment gateway", "Metode notifikasi SMS/WhatsApp"],
  "recommendations": ["Sediakan fitur audit log untuk keamanan data..."]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const responseText = response.text || "{}";
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = null;
    }

    if (parsed) {
      return res.json({
        success: true,
        data: parsed,
      });
    } else {
      return res.status(500).json({ success: false, error: "Failed to parse AI output" });
    }
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze requirements",
    });
  }
});

// Prompt Refinement / AI Polish Endpoint
router.post("/refine-prompt", async (req: Request, res: Response) => {
  try {
    const { promptMarkdown, instructions } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: false,
        fallback: true,
        message: "GEMINI_API_KEY not configured.",
      });
    }

    const prompt = `Anda adalah Senior AI Coding Prompt Optimizer.
Pertajam dan perjelas technical prompt berikut agar semakin tegas, bebas dari ambiguitas, dan langsung dapat dieksekusi dengan sempurna oleh AI Coding (Google AI Studio / Cursor / Claude).
Instruksi khusus pengguna: "${instructions || "Perjelas spesifikasi teknis dan pastikan tidak ada asumsi yang kabur"}"

Prompt saat ini:
${promptMarkdown}

Keluarkan hasil prompt Markdown yang telah disempurnakan dengan tetap mempertahankan struktur 21 bagian standar.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    return res.json({
      success: true,
      polishedPrompt: response.text,
    });
  } catch (error: any) {
    console.error("AI Polish error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to polish prompt",
    });
  }
});

// Mount router on both /api and / so it works seamlessly regardless of rewrite behavior
app.use("/api", router);
app.use("/", router);

export default app;
