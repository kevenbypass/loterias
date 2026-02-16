import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import https from "node:https";
import zlib from "node:zlib";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || process.env.API_PORT || 8787);
const nodeEnv = process.env.NODE_ENV || "development";
const OFFICIAL_API_TIMEOUT_MS = Number(process.env.OFFICIAL_API_TIMEOUT_MS || 12000);
const OFFICIAL_RESULTS_TTL_MS = Number(process.env.OFFICIAL_RESULTS_TTL_MS || 2 * 60 * 1000);

const normalizeOfficialBaseUrl = (raw, fallback) => {
  const candidate = typeof raw === "string" ? raw.trim() : "";
  const base = candidate || fallback;
  return base.replace(/\/+$/, "");
};

const OFFICIAL_CAIXA_DIRECT_BASE_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api";
const OFFICIAL_CAIXA_PROXY_DEFAULT_BASE_URL =
  "https://loterias-caixa-proxy.keven-loterias.workers.dev/portaldeloterias/api";
const configuredOfficialBaseUrl = normalizeOfficialBaseUrl(
  process.env.OFFICIAL_CAIXA_BASE_URL,
  OFFICIAL_CAIXA_PROXY_DEFAULT_BASE_URL
);
const OFFICIAL_CAIXA_ORIGIN = "https://servicebus2.caixa.gov.br";
const OFFICIAL_CAIXA_PROXY_KEY = (process.env.OFFICIAL_CAIXA_PROXY_KEY || "").trim();
const resolveUrlOrigin = (url, fallback) => {
  try {
    return new URL(url).origin;
  } catch {
    return fallback;
  }
};
const configuredOfficialBaseOrigin = resolveUrlOrigin(configuredOfficialBaseUrl, OFFICIAL_CAIXA_ORIGIN);
const usingConfiguredProxyBase = configuredOfficialBaseOrigin !== OFFICIAL_CAIXA_ORIGIN;

let OFFICIAL_API_BASE_URL = configuredOfficialBaseUrl;
if (usingConfiguredProxyBase && !OFFICIAL_CAIXA_PROXY_KEY) {
  console.warn(
    "OFFICIAL_CAIXA_PROXY_KEY missing while OFFICIAL_CAIXA_BASE_URL points to proxy; falling back to direct Caixa base URL."
  );
  OFFICIAL_API_BASE_URL = OFFICIAL_CAIXA_DIRECT_BASE_URL;
}

const OFFICIAL_CAIXA_BASE_ORIGIN = resolveUrlOrigin(OFFICIAL_API_BASE_URL, OFFICIAL_CAIXA_ORIGIN);
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
const OFFICIAL_REQUEST_HEADERS_CAIXA = {
  Referer: "https://loterias.caixa.gov.br/",
  Origin: "https://loterias.caixa.gov.br",
};
const OFFICIAL_RESPONSE_PREVIEW_MAX = 180;
const OFFICIAL_HTTP_AGENT = new https.Agent({
  keepAlive: true,
  maxSockets: 16,
});

const resolveAllowedOrigins = (raw) => {
  if (!raw) {
    return new Set([
      "http://localhost:3000",
      "http://localhost",
      "https://localhost",
      "capacitor://localhost",
      // Production default for this repo (prevents accidental outage if env var is cleared).
      "https://loterias-1.onrender.com",
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

const officialResultsCache = {
  value: null,
  expiresAt: 0,
  source: "unknown",
  diagnostics: null,
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

const isCaixaOfficialUrl = (url) => {
  try {
    return new URL(url).hostname === "servicebus2.caixa.gov.br";
  } catch {
    return false;
  }
};

const isOfficialProxyUrl = (url) => {
  try {
    if (!OFFICIAL_CAIXA_PROXY_KEY) return false;
    const parsed = new URL(url);
    return parsed.origin === OFFICIAL_CAIXA_BASE_ORIGIN && parsed.origin !== OFFICIAL_CAIXA_ORIGIN;
  } catch {
    return false;
  }
};

const getOfficialRequestHeaders = (url) => {
  const headers = isCaixaOfficialUrl(url)
    ? { ...OFFICIAL_REQUEST_HEADERS, ...OFFICIAL_REQUEST_HEADERS_CAIXA }
    : { ...OFFICIAL_REQUEST_HEADERS };

  if (isOfficialProxyUrl(url)) {
    headers["X-Proxy-Key"] = OFFICIAL_CAIXA_PROXY_KEY;
  }

  return headers;
};

const safeTextPreview = (text) => {
  if (typeof text !== "string") return "";
  return text.replace(/\s+/g, " ").slice(0, OFFICIAL_RESPONSE_PREVIEW_MAX);
};

const createOfficialError = (message, details = {}) => {
  const error = new Error(message);
  Object.assign(error, details);
  return error;
};

const summarizeOfficialError = (error) => {
  const fallback = { message: "unknown_error" };
  if (!error || typeof error !== "object") {
    if (typeof error === "string") return { message: error };
    return fallback;
  }

  const out = {
    message: typeof error.message === "string" ? error.message : "unknown_error",
  };

  if (typeof error.code === "string") out.code = error.code;
  if (typeof error.errno === "number") out.errno = error.errno;
  if (typeof error.syscall === "string") out.syscall = error.syscall;
  if (typeof error.status === "number") out.status = error.status;
  if (typeof error.strategy === "string") out.strategy = error.strategy;
  if (typeof error.contentType === "string" && error.contentType) out.contentType = error.contentType;
  if (typeof error.preview === "string" && error.preview) out.preview = error.preview;
  if (Array.isArray(error.attempts) && error.attempts.length) {
    out.attempts = error.attempts.slice(0, 4);
  }

  return out;
};

const decodeCompressedBody = (bodyBuffer, contentEncoding) => {
  const encoding = String(contentEncoding || "").toLowerCase();
  if (!encoding || encoding === "identity") return bodyBuffer;
  if (encoding.includes("gzip")) return zlib.gunzipSync(bodyBuffer);
  if (encoding.includes("br")) return zlib.brotliDecompressSync(bodyBuffer);
  if (encoding.includes("deflate")) return zlib.inflateSync(bodyBuffer);
  return bodyBuffer;
};

const requestOfficialJsonViaFetch = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getOfficialRequestHeaders(url),
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
    });

    const raw = await response.text();
    if (!response.ok) {
      throw createOfficialError(`official_api_http_${response.status}`, {
        status: Number(response.status),
        strategy: "fetch",
        contentType: response.headers.get("content-type") || "",
        preview: safeTextPreview(raw),
      });
    }

    try {
      return JSON.parse(raw);
    } catch {
      throw createOfficialError("official_api_invalid_json", {
        strategy: "fetch",
        status: Number(response.status),
        contentType: response.headers.get("content-type") || "",
        preview: safeTextPreview(raw),
      });
    }
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createOfficialError("official_api_timeout", { strategy: "fetch" });
    }

    if (error && typeof error === "object" && typeof error.strategy === "string") {
      throw error;
    }

    throw createOfficialError(error?.message || "official_api_fetch_failed", {
      strategy: "fetch",
      code: error?.code,
      errno: error?.errno,
      syscall: error?.syscall,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const requestOfficialJsonViaHttps = (url, timeoutMs) =>
  new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "GET",
        headers: {
          ...getOfficialRequestHeaders(url),
          "Accept-Encoding": "gzip, deflate, br",
        },
        agent: OFFICIAL_HTTP_AGENT,
      },
      (res) => {
        const chunks = [];

        res.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        res.on("end", () => {
          const status = Number(res.statusCode || 0);
          const contentType = String(res.headers["content-type"] || "");
          const contentEncoding = String(res.headers["content-encoding"] || "");
          const rawBuffer = Buffer.concat(chunks);
          let decodedBuffer = rawBuffer;

          try {
            decodedBuffer = decodeCompressedBody(rawBuffer, contentEncoding);
          } catch {
            reject(
              createOfficialError("official_api_invalid_encoding", {
                strategy: "https",
                status,
                contentType,
              })
            );
            return;
          }

          const raw = decodedBuffer.toString("utf8");

          if (status < 200 || status >= 300) {
            reject(
              createOfficialError(`official_api_http_${status}`, {
                strategy: "https",
                status,
                contentType,
                preview: safeTextPreview(raw),
              })
            );
            return;
          }

          try {
            resolve(JSON.parse(raw));
          } catch {
            reject(
              createOfficialError("official_api_invalid_json", {
                strategy: "https",
                status,
                contentType,
                preview: safeTextPreview(raw),
              })
            );
          }
        });
      }
    );

    req.on("error", (error) =>
      reject(
        createOfficialError(error?.message || "official_api_network_error", {
          strategy: "https",
          code: error?.code,
          errno: error?.errno,
          syscall: error?.syscall,
        })
      )
    );
    req.setTimeout(timeoutMs, () =>
      req.destroy(createOfficialError("official_api_timeout", { strategy: "https" }))
    );
    req.end();
  });

const requestOfficialJson = async (url, timeoutMs) => {
  const attempts = [];

  try {
    return await requestOfficialJsonViaFetch(url, timeoutMs);
  } catch (error) {
    attempts.push(summarizeOfficialError(error));
  }

  try {
    return await requestOfficialJsonViaHttps(url, timeoutMs);
  } catch (error) {
    attempts.push(summarizeOfficialError(error));
  }

  throw createOfficialError("official_api_request_failed", { attempts });
};

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
  const errors = [];
  for (const entry of outcomes) {
    if (entry.outcome.status === "fulfilled" && entry.outcome.value) {
      results.push(entry.outcome.value);
      continue;
    }

    if (entry.outcome.status === "rejected") {
      const summary = summarizeOfficialError(entry.outcome.reason);
      errors.push({ gameId: entry.gameId, error: summary });
      console.warn(`Official results failed for ${entry.gameId}:`, summary);
    }
  }

  return { results, errors };
};

const fetchAllOfficialResults = async ({ forceRefresh = false } = {}) => {
  const diagnostics = {
    startedAt: new Date().toISOString(),
    forceRefresh,
    cacheHit: false,
    source: "unknown",
    providers: {},
  };

  const now = Date.now();
  if (!forceRefresh && officialResultsCache.value && now < officialResultsCache.expiresAt) {
    diagnostics.cacheHit = true;
    diagnostics.source = officialResultsCache.source || "unknown";
    diagnostics.finishedAt = new Date().toISOString();
    officialResultsCache.diagnostics = diagnostics;
    return officialResultsCache.value;
  }

  const gameIds = Object.keys(OFFICIAL_API_SLUGS);
  let results = [];
  let source = "unknown";
  try {
    results = await fetchAllOfficialResultsFromHome(gameIds);
    source = "caixa_home";
    diagnostics.providers.caixa_home = { ok: true, count: results.length };
  } catch (error) {
    const homeError = summarizeOfficialError(error);
    diagnostics.providers.caixa_home = { ok: false, error: homeError };
    console.warn("Official home endpoint failed; falling back to per-game endpoints:", homeError);

    const perGame = await fetchAllOfficialResultsByGame(gameIds);
    results = perGame.results;

    diagnostics.providers.caixa_games = {
      ok: perGame.results.length > 0,
      count: perGame.results.length,
      failed: perGame.errors.length,
      errors: perGame.errors.slice(0, 6),
    };

    if (results.length) {
      source = "caixa_games";
    }
  }

  if (!results.length) {
    try {
      results = await fetchAllOfficialResultsFromLookup(gameIds);
      source = "lottolookup";
      diagnostics.providers.lottolookup = { ok: true, count: results.length };
    } catch (error) {
      const lookupError = summarizeOfficialError(error);
      diagnostics.providers.lottolookup = { ok: false, error: lookupError };
      console.warn("Lookup fallback endpoint failed:", lookupError);
    }
  }

  if (!results.length) {
    diagnostics.finishedAt = new Date().toISOString();
    const unavailableError = createOfficialError("official_results_unavailable", {
      diagnostics,
    });
    throw unavailableError;
  }

  const orderIndex = new Map(gameIds.map((gameId, idx) => [gameId, idx]));
  results.sort((a, b) => (orderIndex.get(a.gameId) ?? 999) - (orderIndex.get(b.gameId) ?? 999));

  diagnostics.source = source;
  diagnostics.finishedAt = new Date().toISOString();
  officialResultsCache.value = results;
  officialResultsCache.expiresAt = Date.now() + OFFICIAL_RESULTS_TTL_MS;
  officialResultsCache.source = source;
  officialResultsCache.diagnostics = diagnostics;
  return results;
};

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
    methods: ["GET", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
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

app.use(generalLimiter);

app.get("/api/official-results", async (req, res) => {
  const forceRefresh = typeof req.query.force === "string" && req.query.force === "1";

  try {
    const results = await fetchAllOfficialResults({ forceRefresh });
    const payload = {
      updatedAt: new Date().toISOString(),
      source: officialResultsCache.source || "unknown",
      results,
    };

    res.json(payload);
  } catch (error) {
    console.error("Erro ao buscar resultados oficiais:", {
      error: summarizeOfficialError(error),
    });

    res.status(502).json({ error: "official_results_unavailable" });
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
  console.log(`Loterias API server em http://${host}:${port}`);
});
