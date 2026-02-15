import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const app = express();

// Render/Proxies: necessário para rate-limit por IP funcionar direito
app.set("trust proxy", 1);

// ====== ENV ======
const {
  GEMINI_API_KEY,
  ALLOWED_ORIGINS,
  INTERNAL_API_KEY,
  NODE_ENV = "development",
  PORT = 3000,
} = process.env;

if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY");
}
if (!INTERNAL_API_KEY) {
  console.warn("Missing INTERNAL_API_KEY (recommended for anti-bot).");
}

// ====== ORIGINS ======
const allowedOrigins = new Set(
  (ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);

// Nunca aceite "*" aqui para um endpoint que gera custo
function isOriginAllowed(origin) {
  if (!origin) return false; // bloqueia chamadas “sem origin” (curl/postman) por padrão
  return allowedOrigins.has(origin);
}

// ====== SECURITY HEADERS ======
app.use(
  helmet({
    // Ajuste CSP depois se precisar scripts externos
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "same-site" },
  })
);

// ====== JSON LIMIT (corta payload gigante) ======
app.use(express.json({ limit: "50kb" }));

// ====== CORS FECHADO ======
app.use(
  cors({
    origin: (origin, cb) => {
      // Em dev, você pode permitir sem origin (Postman) se quiser:
      if (NODE_ENV !== "production" && !origin) return cb(null, true);

      if (isOriginAllowed(origin)) return cb(null, true);
      return cb(new Error("CORS: origin not allowed"), false);
    },
    methods: ["POST", "GET", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Internal-Key"],
    maxAge: 86400,
  })
);

// ====== BASIC HEALTHCHECK ======
app.get("/", (req, res) => {
  res.status(200).json({ ok: true, service: "loterias-api" });
});
app.get("/health", (req, res) => res.status(200).send("ok"));

// ====== HARDEN: INTERNAL KEY (anti-bot simples e eficiente) ======
function requireInternalKey(req, res, next) {
  // Em produção: obrigatório
  if (NODE_ENV === "production") {
    const key = req.get("X-Internal-Key");
    if (!INTERNAL_API_KEY || !key || key !== INTERNAL_API_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
  next();
}

// ====== RATE LIMIT (anti-spam) ======
// 1) Geral
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests (general)." },
});

// 2) Pesado (IA)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12, // 12 req/min por IP (ajuste como quiser)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests (AI endpoint)." },
});

app.use(generalLimiter);

// ====== GAMES (NUNCA confiar no objeto vindo do cliente) ======
const GAMES = {
  mega: { id: "mega", name: "Mega-Sena", min: 1, max: 60, count: 6 },
  quina: { id: "quina", name: "Quina", min: 1, max: 80, count: 5 },
  lotofacil: { id: "lotofacil", name: "Lotofácil", min: 1, max: 25, count: 15 },
  lotomania: { id: "lotomania", name: "Lotomania", min: 0, max: 99, count: 50 },
};

function normalizeText(s) {
  return s
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

// ====== SIMPLE IN-MEMORY CACHE (economiza Gemini) ======
const cache = new Map();
// cacheKey -> { value, expiresAt }
function cacheGet(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.value;
}
function cacheSet(key, value, ttlMs) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

// limpa cache de leve
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of cache.entries()) {
    if (now > v.expiresAt) cache.delete(k);
  }
}, 60 * 1000).unref();

// ====== GEMINI ======
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "missing");
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.6,
    responseMimeType: "application/json",
    // Força formato e limita “bagunça”
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        interpretation: { type: SchemaType.STRING },
        numbers: {
          type:
