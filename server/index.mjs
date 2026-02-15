import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import https from "node:https";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || process.env.API_PORT || 8787);
const apiKey = process.env.GEMINI_API_KEY;
const internalApiKey = process.env.INTERNAL_API_KEY || "";
const nodeEnv = process.env.NODE_ENV || "development";
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const CACHE_TTL_MS = Number(process.env.DREAM_CACHE_TTL_MS || 10 * 60 * 1000);
const MAX_CACHE_ITEMS = Number(process.env.DREAM_CACHE_MAX_ITEMS || 500);
const OFFICIAL_API_TIMEOUT_MS = Number(process.env.OFFICIAL_API_TIMEOUT_MS || 12000);
const OFFICIAL_RESULTS_TTL_MS = Number(process.env.OFFICIAL_RESULTS_TTL_MS || 2 * 60 * 1000);

const OFFICIAL_API_BASE_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api";
const OFFICIAL_API_HOME_URL = `${OFFICIAL_API_BASE_URL}/home/ultimos-resultados`;
const OFFICIAL_LOOKUP_URL = "https://lottolookup.com.br/api";
const OFFICIAL_API_SLUGS = {
  "mega-sena": "megasena",
  lotofacil: "lotofacil",
  quina: "quina",
  lotomania: "lotomania",
  timemania: "timemania",
  "dupla-sena": "duplasena",
  "dia-de-sorte": "diadesorte",
  "super-sete": "supersete",
  milionaria: "maismilionaria",
  federal: "federal",
};
const OFFICIAL_HOME_KEYS = {
  "mega-sena": "megasena",
  lotofacil: "lotofacil",
  quina: "quina",
  lotomania: "lotomania",
  timemania: "timemania",
  "dupla-sena": "duplasena",
  "dia-de-sorte": "diaDeSorte",
  "super-sete": "superSete",
  milionaria: "maisMilionaria",
  federal: "federal",
};
const OFFICIAL_LOOKUP_KEYS = {
  "mega-sena": "megasena",
  lotofacil: "lotofacil",
  quina: "quina",
  lotomania: "lotomania",
  timemania: "timemania",
  "dupla-sena": "duplasena",
  "dia-de-sorte": "diadesorte",
  "super-sete": "supersete",
  milionaria: "maismilionaria",
  federal: "federal",
};

const MONTH_NAMES_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const OFFICIAL_REQUEST_HEADERS = {
  Accept: "application/json",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
};

const resolveAllowedOrigins = (raw) => {
  if (!raw) {
    return new Set([
      "http://localhost:3000",
      "http://localhost",
      "https://localhost",
      "capacitor://localhost",
    ]);
  }

  const list = raw
    .split(/[;,]/)
    .map((origin) => origin.trim())
    .filter(Boolean)
    .filter((origin) => origin !== "*");

  if (raw.includes("*")) {
    console.warn("Ignoring wildcard '*' in ALLOWED_ORIGINS. Use explicit origins only.");
  }

  return new Set(list);
};

const allowedOrigins = resolveAllowedOrigins(process.env.ALLOWED_ORIGINS);

const isOriginAllowed = (origin) => {
  if (!origin) return false;
  return allowedOrigins.has(origin);
};

const sanitizeNumberArray = (values, min, max, count, allowRepeats = false) => {
  if (!Array.isArray(values)) return [];

  const out = [];
  const seen = new Set();

  for (const value of values) {
    const number = Number(value);
    if (!Number.isInteger(number) || number < min || number > max) continue;

    if (!allowRepeats) {
      if (seen.has(number)) continue;
      seen.add(number);
    }

    out.push(number);
    if (out.length >= count) break;
  }

  return out;
};

const normalizeText = (text) =>
  text
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();

const sha256 = (text) => crypto.createHash("sha256").update(text).digest("hex");

const cache = new Map();

const cacheGet = (key) => {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }

  return item.value;
};

const cacheSet = (key, value, ttlMs) => {
  if (cache.size >= MAX_CACHE_ITEMS) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
};

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of cache.entries()) {
    if (now > v.expiresAt) cache.delete(k);
  }
}, 60 * 1000).unref();

const officialResultsCache = {
  value: null,
  expiresAt: 0,
  source: "unknown",
};

const formatCurrencyBRL = (value) => {
  const numericValue = Number(value);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
};

const parseNumericList = (values) => {
  if (!Array.isArray(values)) return [];

  const numbers = [];
  for (const item of values) {
    const parsed = Number.parseInt(String(item), 10);
    if (Number.isFinite(parsed)) numbers.push(parsed);
  }

  return numbers;
};

const monthNameToNumber = (monthName) => {
  if (typeof monthName !== "string") return null;

  const normalized = monthName.trim().toLowerCase();
  const idx = MONTH_NAMES_PT.findIndex((month) => month.toLowerCase() === normalized);
  return idx >= 0 ? idx + 1 : null;
};

const mapOfficialApiResponse = (gameId, data) => {
  const numbers = parseNumericList(
    Array.isArray(data?.listaDezenas) && data.listaDezenas.length
      ? data.listaDezenas
      : data?.dezenasSorteadasOrdemSorteio
  );

  if (!numbers.length) return null;

  let specialNumbers;
  let extraString;

  if (gameId === "milionaria") {
    const trevos = parseNumericList(data?.trevosSorteados);
    if (trevos.length) specialNumbers = trevos;
  }

  if (gameId === "dia-de-sorte") {
    const monthNumber = monthNameToNumber(data?.nomeTimeCoracaoMesSorte);
    if (monthNumber) specialNumbers = [monthNumber];
  }

  if (gameId === "timemania" && typeof data?.nomeTimeCoracaoMesSorte === "string") {
    extraString = data.nomeTimeCoracaoMesSorte.trim() || undefined;
  }

  return {
    gameId,
    contestNumber: String(data?.numero ?? ""),
    date: typeof data?.dataApuracao === "string" ? data.dataApuracao : "",
    numbers,
    specialNumbers,
    extraString,
    accumulated: Boolean(data?.acumulado),
    nextPrize: formatCurrencyBRL(data?.valorEstimadoProximoConcurso),
    nextDate: typeof data?.dataProximoConcurso === "string" ? data.dataProximoConcurso : "",
  };
};

const mapOfficialHomeResponse = (gameId, data) => {
  const numbers = parseNumericList(data?.dezenas);
  if (!numbers.length) return null;

  let specialNumbers;
  let extraString;

  if (gameId === "milionaria") {
    const trevos = parseNumericList(data?.trevosSorteados);
    if (trevos.length) specialNumbers = trevos;
  }

  if (gameId === "dia-de-sorte") {
    const monthNumber = monthNameToNumber(data?.mesDaSorte);
    if (monthNumber) specialNumbers = [monthNumber];
  }

  if (gameId === "timemania" && typeof data?.timeDoCoracao === "string") {
    extraString = data.timeDoCoracao.trim() || undefined;
  }

  return {
    gameId,
    contestNumber: String(data?.numeroDoConcurso ?? ""),
    date: typeof data?.dataApuracao === "string" ? data.dataApuracao : "",
    numbers,
    specialNumbers,
    extraString,
    accumulated: Boolean(data?.acumulado),
    nextPrize: formatCurrencyBRL(data?.valorEstimadoProximoConcurso),
    nextDate: typeof data?.dataProximoConcurso === "string" ? data.dataProximoConcurso : "",
  };
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requestOfficialJson = (url, timeoutMs) =>
  new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "GET",
        headers: OFFICIAL_REQUEST_HEADERS,
      },
      (res) => {
        const chunks = [];

        res.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        res.on("end", () => {
          const status = Number(res.statusCode || 0);
          const raw = Buffer.concat(chunks).toString("utf8");

          if (status < 200 || status >= 300) {
            reject(new Error(`official_api_http_${status}`));
            return;
          }

          try {
            resolve(JSON.parse(raw));
          } catch {
            reject(new Error("official_api_invalid_json"));
          }
        });
      }
    );

    req.on("error", (error) => reject(error));
    req.setTimeout(timeoutMs, () => req.destroy(new Error("official_api_timeout")));
    req.end();
  });

const fetchOfficialGameResult = async (gameId) => {
  const slug = OFFICIAL_API_SLUGS[gameId];
  if (!slug) return null;

  const url = `${OFFICIAL_API_BASE_URL}/${slug}`;
  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const payload = await requestOfficialJson(url, OFFICIAL_API_TIMEOUT_MS);
      const mapped = mapOfficialApiResponse(gameId, payload);
      if (!mapped) {
        throw new Error("official_api_invalid_payload");
      }

      return mapped;
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await sleep(200 * attempt);
      }
    }
  }

  throw lastError || new Error("official_api_request_failed");
};

const fetchAllOfficialResultsFromHome = async (gameIds) => {
  const payload = await requestOfficialJson(OFFICIAL_API_HOME_URL, OFFICIAL_API_TIMEOUT_MS);
  if (!payload || typeof payload !== "object") {
    throw new Error("official_home_invalid_payload");
  }

  const results = [];
  for (const gameId of gameIds) {
    const homeKey = OFFICIAL_HOME_KEYS[gameId];
    const entry = payload?.[homeKey];
    if (!entry || typeof entry !== "object") continue;

    const mapped = mapOfficialHomeResponse(gameId, entry);
    if (mapped) results.push(mapped);
  }

  if (!results.length) {
    throw new Error("official_home_empty");
  }

  return results;
};

const fetchAllOfficialResultsFromLookup = async (gameIds) => {
  const payload = await requestOfficialJson(OFFICIAL_LOOKUP_URL, OFFICIAL_API_TIMEOUT_MS);
  if (!payload || typeof payload !== "object") {
    throw new Error("official_lookup_invalid_payload");
  }

  const results = [];
  for (const gameId of gameIds) {
    const lookupKey = OFFICIAL_LOOKUP_KEYS[gameId];
    const entry = payload?.[lookupKey];
    if (!entry || typeof entry !== "object") continue;

    const mapped = mapOfficialApiResponse(gameId, entry);
    if (mapped) results.push(mapped);
  }

  if (!results.length) {
    throw new Error("official_lookup_empty");
  }

  return results;
};

const fetchAllOfficialResultsByGame = async (gameIds) => {
  const outcomes = [];
  const BATCH_SIZE = 3;

  for (let i = 0; i < gameIds.length; i += BATCH_SIZE) {
    const batch = gameIds.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(batch.map((gameId) => fetchOfficialGameResult(gameId)));
    settled.forEach((outcome, idx) => {
      outcomes.push({ gameId: batch[idx], outcome });
    });
  }

  const results = [];
  for (const entry of outcomes) {
    if (entry.outcome.status === "fulfilled" && entry.outcome.value) {
      results.push(entry.outcome.value);
      continue;
    }

    if (entry.outcome.status === "rejected") {
      console.warn(`Official results failed for ${entry.gameId}:`, entry.outcome.reason);
    }
  }

  return results;
};

const fetchAllOfficialResults = async ({ forceRefresh = false } = {}) => {
  const now = Date.now();
  if (!forceRefresh && officialResultsCache.value && now < officialResultsCache.expiresAt) {
    return officialResultsCache.value;
  }

  const gameIds = Object.keys(OFFICIAL_API_SLUGS);
  let results = [];
  let source = "unknown";
  try {
    results = await fetchAllOfficialResultsFromHome(gameIds);
    source = "caixa_home";
  } catch (error) {
    console.warn("Official home endpoint failed; falling back to per-game endpoints:", error);
    results = await fetchAllOfficialResultsByGame(gameIds);
    if (results.length) {
      source = "caixa_games";
    }
  }

  if (!results.length) {
    try {
      results = await fetchAllOfficialResultsFromLookup(gameIds);
      source = "lottolookup";
    } catch (error) {
      console.warn("Lookup fallback endpoint failed:", error);
    }
  }

  if (!results.length) {
    throw new Error("official_results_unavailable");
  }

  const orderIndex = new Map(gameIds.map((gameId, idx) => [gameId, idx]));
  results.sort((a, b) => (orderIndex.get(a.gameId) ?? 999) - (orderIndex.get(b.gameId) ?? 999));

  officialResultsCache.value = results;
  officialResultsCache.expiresAt = Date.now() + OFFICIAL_RESULTS_TTL_MS;
  officialResultsCache.source = source;
  return results;
};

const sanitizeGame = (rawGame) => {
  if (!rawGame || typeof rawGame !== "object") return null;

  const minNumber = Number(rawGame.minNumber);
  const maxNumber = Number(rawGame.maxNumber);
  const defaultCount = Number(rawGame.defaultCount);
  const maxCount = Number(rawGame.maxCount || rawGame.defaultCount);

  if (
    typeof rawGame.id !== "string" ||
    typeof rawGame.name !== "string" ||
    !Number.isInteger(minNumber) ||
    !Number.isInteger(maxNumber) ||
    !Number.isInteger(defaultCount) ||
    !Number.isInteger(maxCount)
  ) {
    return null;
  }

  if (minNumber > maxNumber) return null;
  if (defaultCount < 1 || defaultCount > 100) return null;
  if (maxCount < defaultCount || maxCount > 200) return null;

  const safeGame = {
    id: rawGame.id,
    name: rawGame.name,
    minNumber,
    maxNumber,
    defaultCount,
    maxCount,
    allowRepeats: Boolean(rawGame.allowRepeats),
  };

  if (rawGame.specialRange && typeof rawGame.specialRange === "object") {
    const specialMin = Number(rawGame.specialRange.min);
    const specialMax = Number(rawGame.specialRange.max);
    const specialCount = Number(rawGame.specialRange.count);

    if (
      typeof rawGame.specialRange.label !== "string" ||
      !Number.isInteger(specialMin) ||
      !Number.isInteger(specialMax) ||
      !Number.isInteger(specialCount) ||
      specialMin > specialMax ||
      specialCount < 1 ||
      specialCount > 100
    ) {
      return null;
    }

    safeGame.specialRange = {
      label: rawGame.specialRange.label,
      min: specialMin,
      max: specialMax,
      count: specialCount,
    };
  }

  if (rawGame.extraOptions && typeof rawGame.extraOptions === "object") {
    if (
      typeof rawGame.extraOptions.label !== "string" ||
      !Array.isArray(rawGame.extraOptions.options) ||
      rawGame.extraOptions.options.length === 0
    ) {
      return null;
    }

    const options = rawGame.extraOptions.options
      .filter((opt) => typeof opt === "string")
      .map((opt) => opt.trim())
      .filter(Boolean)
      .slice(0, 300);

    if (!options.length) return null;

    safeGame.extraOptions = {
      label: rawGame.extraOptions.label,
      options,
    };
  }

  return safeGame;
};

const validatePayload = (body) => {
  if (!body || typeof body !== "object") {
    return { ok: false, reason: "invalid_payload" };
  }

  if (typeof body.dreamText !== "string") {
    return { ok: false, reason: "invalid_dream_text" };
  }

  const dreamText = normalizeText(body.dreamText);
  if (!dreamText || dreamText.length > 2000) {
    return { ok: false, reason: "invalid_dream_text" };
  }

  const game = sanitizeGame(body.game);
  if (!game) {
    return { ok: false, reason: "invalid_game" };
  }

  return { ok: true, value: { dreamText, game } };
};

const buildPrompt = (dreamText, game) => `
Atue como um especialista em numerologia e interpretacao de sonhos.
O usuario teve o seguinte sonho: ${JSON.stringify(dreamText)}.
Gere uma lista de ${game.defaultCount} numeros da sorte para o jogo ${game.name} (numeros entre ${game.minNumber} e ${game.maxNumber}).
${
  game.specialRange
    ? `Tambem gere ${game.specialRange.count} numeros extras (${game.specialRange.label}) entre ${game.specialRange.min} e ${game.specialRange.max}.`
    : ""
}
${
  game.extraOptions
    ? `Tambem escolha um "${game.extraOptions.label}" da seguinte lista que mais combine com o sonho: ${game.extraOptions.options.join(", ")}.`
    : ""
}
Retorne APENAS um objeto JSON com as chaves: "main" (array de inteiros), "special" (array de inteiros, vazio se nao houver) e "extraString" (string, vazio se nao houver).
`;

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "same-site" },
  })
);

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "loterias-api" });
});

app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(express.json({ limit: "50kb" }));

app.use(
  cors({
    origin: (origin, callback) => {
      if (nodeEnv !== "production" && !origin) {
        callback(null, true);
        return;
      }

      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS: origin not allowed"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Internal-Key"],
    maxAge: 86400,
  })
);

app.use((error, _req, res, next) => {
  if (error && typeof error.message === "string" && error.message.startsWith("CORS:")) {
    res.status(403).json({ error: "origin_not_allowed" });
    return;
  }

  next(error);
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too_many_requests_general" },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too_many_requests_ai" },
});

app.use(generalLimiter);

const requireInternalKey = (req, res, next) => {
  if (!internalApiKey) {
    next();
    return;
  }

  const key = req.get("X-Internal-Key");
  if (!key || key !== internalApiKey) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  next();
};

app.get("/api/official-results", async (req, res) => {
  const forceRefresh = typeof req.query.force === "string" && req.query.force === "1";

  try {
    const results = await fetchAllOfficialResults({ forceRefresh });
    res.json({
      updatedAt: new Date().toISOString(),
      source: officialResultsCache.source || "unknown",
      results,
    });
  } catch (error) {
    console.error("Erro ao buscar resultados oficiais:", error);
    res.status(502).json({ error: "official_results_unavailable" });
  }
});

app.post("/api/interpret-dream", aiLimiter, requireInternalKey, async (req, res) => {
  const payloadValidation = validatePayload(req.body);
  if (!payloadValidation.ok) {
    res.status(400).json({ error: payloadValidation.reason });
    return;
  }

  if (!apiKey) {
    res.status(503).json({ error: "missing_gemini_api_key" });
    return;
  }

  const { dreamText, game } = payloadValidation.value;
  const cacheKey = sha256(
    JSON.stringify({
      dreamText,
      game: {
        id: game.id,
        minNumber: game.minNumber,
        maxNumber: game.maxNumber,
        defaultCount: game.defaultCount,
        specialRange: game.specialRange || null,
        extraOptions: game.extraOptions?.options || null,
      },
    })
  );

  const cached = cacheGet(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildPrompt(dreamText, game);

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            main: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
            },
            special: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
            },
            extraString: { type: Type.STRING, nullable: true },
          },
        },
      },
    });

    const text = typeof response.text === "function" ? await response.text() : response.text;
    if (!text || typeof text !== "string") {
      res.status(502).json({ error: "empty_gemini_response" });
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      res.status(502).json({ error: "invalid_gemini_json" });
      return;
    }

    const main = sanitizeNumberArray(
      parsed.main,
      game.minNumber,
      game.maxNumber,
      game.maxCount,
      game.allowRepeats
    );
    const special = game.specialRange
      ? sanitizeNumberArray(
          parsed.special,
          game.specialRange.min,
          game.specialRange.max,
          game.specialRange.count
        )
      : [];
    const extraString =
      typeof parsed.extraString === "string" ? parsed.extraString.trim().slice(0, 120) : undefined;

    const result = { main, special, extraString };
    cacheSet(cacheKey, result, CACHE_TTL_MS);
    res.json(result);
  } catch (error) {
    console.error("Erro no backend Gemini:", error);
    res.status(500).json({ error: "gemini_request_failed" });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "not_found" });
});

app.use((error, _req, res, _next) => {
  console.error("Unhandled server error:", error);
  res.status(500).json({ error: "internal_server_error" });
});

app.listen(port, host, () => {
  console.log(`Gemini API server em http://${host}:${port}`);
});
