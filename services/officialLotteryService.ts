import { LotteryResult } from "../types";
import { MOCK_RESULTS } from "../constants";

const OFFICIAL_CAIXA_HOME_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api/home/ultimos-resultados";
const DEFAULT_PROD_API_FALLBACK_BASE_URLS = ["https://loterias-jrky.onrender.com"];
const parseWarningsSeen = new Set<string>();

const warnParseIssueOnce = (
  key: string,
  message: string,
  sample?: unknown,
  options: { critical?: boolean } = {}
) => {
  if (parseWarningsSeen.has(key)) return;
  parseWarningsSeen.add(key);
  if (!import.meta.env.DEV && !options.critical) return;
  console.warn(`[officialLotteryService] ${message}`, sample);
};

const parseList = (rawValue: string): string[] =>
  rawValue
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeApiBaseUrl = (rawValue: string, sourceLabel: string): string => {
  const candidate = rawValue.trim();
  if (!candidate) return "";

  try {
    const parsed = new URL(candidate);
    if (import.meta.env.PROD && parsed.protocol !== "https:") {
      console.warn(
        `[officialLotteryService] Ignoring ${sourceLabel} because protocol is not https in production.`
      );
      return "";
    }

    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, "");
  } catch {
    console.warn(`[officialLotteryService] Ignoring invalid ${sourceLabel} value.`);
    return "";
  }
};

const pushUnique = (target: string[], value: string) => {
  if (!target.includes(value)) target.push(value);
};

const rawApiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || "");
const configuredApiBaseUrl = normalizeApiBaseUrl(rawApiBaseUrl, "VITE_API_BASE_URL");

const configuredFallbackApiBaseUrls = [
  ...parseList(String(import.meta.env.VITE_API_FALLBACK_BASE_URLS || "")),
  ...parseList(String(import.meta.env.VITE_API_FALLBACK_BASE_URL || "")),
]
  .map((value, idx) => normalizeApiBaseUrl(value, `VITE_API_FALLBACK_BASE_URLS[${idx}]`))
  .filter(Boolean);

const backendApiBaseCandidates: string[] = [];
if (configuredApiBaseUrl) {
  pushUnique(backendApiBaseCandidates, configuredApiBaseUrl);
}

if (import.meta.env.PROD) {
  configuredFallbackApiBaseUrls.forEach((value) => pushUnique(backendApiBaseCandidates, value));
  DEFAULT_PROD_API_FALLBACK_BASE_URLS.map((value, idx) =>
    normalizeApiBaseUrl(value, `DEFAULT_PROD_API_FALLBACK_BASE_URLS[${idx}]`)
  )
    .filter(Boolean)
    .forEach((value) => pushUnique(backendApiBaseCandidates, value));
}

// Keep same-origin call as last resort when app and API share the same host.
pushUnique(backendApiBaseCandidates, "");

const apiUrl = (baseUrl: string, path: string) => (baseUrl ? `${baseUrl}${path}` : path);

const GAME_ORDER = [
  "mega-sena",
  "lotofacil",
  "quina",
  "lotomania",
  "timemania",
  "dupla-sena",
  "dia-de-sorte",
  "super-sete",
  "milionaria",
  "federal",
] as const;

const OFFICIAL_HOME_KEYS: Record<(typeof GAME_ORDER)[number], string> = {
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

interface OfficialHomeEntry {
  acumulado?: boolean;
  dataApuracao?: string;
  dataProximoConcurso?: string;
  dezenas?: unknown;
  mesDaSorte?: string;
  numeroDoConcurso?: number | string;
  timeDoCoracao?: string;
  trevosSorteados?: unknown;
  valorEstimadoProximoConcurso?: number | string;
}

interface BackendOfficialResultsResponse {
  updatedAt?: string;
  source?: string;
  results?: unknown;
}

const isLotteryResult = (value: unknown): value is LotteryResult => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<LotteryResult>;
  return (
    typeof candidate.gameId === "string" &&
    typeof candidate.contestNumber === "string" &&
    typeof candidate.date === "string" &&
    Array.isArray(candidate.numbers) &&
    typeof candidate.accumulated === "boolean" &&
    typeof candidate.nextPrize === "string" &&
    typeof candidate.nextDate === "string"
  );
};

const parseNumericList = (values: unknown, fieldName = "unknown"): number[] => {
  if (!Array.isArray(values)) {
    warnParseIssueOnce(`not-array:${fieldName}`, `Expected array for ${fieldName}.`, values, { critical: true });
    return [];
  }

  const parsed: number[] = [];
  for (const value of values) {
    const asNumber = Number.parseInt(String(value), 10);
    if (Number.isFinite(asNumber)) {
      parsed.push(asNumber);
    } else {
      warnParseIssueOnce(`invalid-entry:${fieldName}`, `Invalid numeric entry in ${fieldName}.`, value, {
        critical: true,
      });
    }
  }

  return parsed;
};

const monthNameToNumber = (monthName: unknown): number | null => {
  if (typeof monthName !== "string") return null;

  const normalized = monthName.trim().toLowerCase();
  const idx = MONTH_NAMES_PT.findIndex((month) => month.toLowerCase() === normalized);
  return idx >= 0 ? idx + 1 : null;
};

const formatCurrencyBRL = (value: unknown): string => {
  const numericValue = Number(value);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
};

const mapOfficialHomeResponse = (
  gameId: (typeof GAME_ORDER)[number],
  entry: OfficialHomeEntry
): LotteryResult | null => {
  const numbers = parseNumericList(entry.dezenas, `${gameId}.dezenas`);
  if (!numbers.length) return null;

  let specialNumbers: number[] | undefined;
  let extraString: string | undefined;

  if (gameId === "milionaria") {
    const trevos = parseNumericList(entry.trevosSorteados, `${gameId}.trevosSorteados`);
    if (trevos.length) specialNumbers = trevos;
  }

  if (gameId === "dia-de-sorte") {
    const monthNumber = monthNameToNumber(entry.mesDaSorte);
    if (monthNumber) specialNumbers = [monthNumber];
  }

  if (gameId === "timemania" && typeof entry.timeDoCoracao === "string") {
    extraString = entry.timeDoCoracao.trim() || undefined;
  }

  return {
    gameId,
    contestNumber: String(entry.numeroDoConcurso ?? ""),
    date: typeof entry.dataApuracao === "string" ? entry.dataApuracao : "",
    numbers,
    specialNumbers,
    extraString,
    accumulated: Boolean(entry.acumulado),
    nextPrize: formatCurrencyBRL(entry.valorEstimadoProximoConcurso),
    nextDate: typeof entry.dataProximoConcurso === "string" ? entry.dataProximoConcurso : "",
  };
};

const fetchFromOfficialHome = async (force = false): Promise<LotteryResult[]> => {
  const cacheBuster = force ? `?ts=${Date.now()}` : "";
  const response = await fetch(`${OFFICIAL_CAIXA_HOME_URL}${cacheBuster}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`official_results_caixa_failed_${response.status}`);
  }

  const payload = (await response.json()) as Record<string, unknown> | null;
  if (!payload || typeof payload !== "object") {
    throw new Error("official_results_caixa_invalid_payload");
  }

  const results: LotteryResult[] = [];
  for (const gameId of GAME_ORDER) {
    const key = OFFICIAL_HOME_KEYS[gameId];
    const candidate = payload[key];
    if (!candidate || typeof candidate !== "object") continue;

    const mapped = mapOfficialHomeResponse(gameId, candidate as OfficialHomeEntry);
    if (mapped) results.push(mapped);
  }

  if (!results.length) {
    throw new Error("official_results_caixa_empty");
  }

  return results;
};

const fetchFromBackend = async (force = false): Promise<LotteryResult[]> => {
  const query = force ? "?force=1" : "";
  const requestPath = `/api/official-results${query}`;
  let lastError: unknown = null;

  for (const baseUrl of backendApiBaseCandidates) {
    const targetUrl = apiUrl(baseUrl, requestPath);
    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`official_results_backend_failed_${response.status}`);
      }

      const payload = (await response.json()) as BackendOfficialResultsResponse | unknown;

      const resultArray: unknown[] | null = Array.isArray(payload)
        ? payload
        : payload && typeof payload === "object" && Array.isArray((payload as BackendOfficialResultsResponse).results)
          ? ((payload as BackendOfficialResultsResponse).results as unknown[])
          : null;

      if (!resultArray) {
        throw new Error("official_results_invalid_payload");
      }

      const filtered = resultArray.filter(isLotteryResult);
      if (!filtered.length) {
        throw new Error("official_results_empty");
      }

      return filtered;
    } catch (error) {
      lastError = error;
      if (import.meta.env.DEV) {
        console.warn(`[officialLotteryService] Backend API attempt failed for ${targetUrl}:`, error);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("official_results_backend_failed");
};

export const fetchAllResults = async ({
  force = false,
}: {
  force?: boolean;
} = {}): Promise<LotteryResult[]> => {
  try {
    return await fetchFromOfficialHome(force);
  } catch (officialError) {
    console.warn("Official Caixa request failed in frontend, falling back to backend API:", officialError);
    try {
      return await fetchFromBackend(force);
    } catch (backendError) {
      console.warn("Backend API failed in frontend, using MOCK_RESULTS fallback:", backendError);
      return MOCK_RESULTS;
    }
  }
};
