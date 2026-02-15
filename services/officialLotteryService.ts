import { LotteryResult } from "../types";
import { MOCK_RESULTS } from "../constants";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (path: string) => (apiBaseUrl ? `${apiBaseUrl}${path}` : path);

const formatCurrency = (value: number): string => {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const API_SLUGS: Record<string, string> = {
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

interface BackendOfficialResultsResponse {
  updatedAt?: string;
  source?: string;
  results?: unknown;
}

interface LegacyApiResponse {
  concurso?: number;
  data?: string;
  dezenas?: string[];
  dezenasOrdemSorteio?: string[];
  trevos?: string[];
  timeCoracao?: string;
  mesSorte?: string;
  acumulou?: boolean;
  valorEstimadoProximoConcurso?: number;
  dataProximoConcurso?: string;
}

const normalizeNumbers = (values: unknown): number[] => {
  if (!Array.isArray(values)) return [];

  return values
    .map((value) => Number.parseInt(String(value), 10))
    .filter((value) => Number.isFinite(value));
};

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

const fetchViaBackend = async ({ force = false } = {}): Promise<LotteryResult[] | null> => {
  const query = force ? "?force=1" : "";
  const response = await fetch(apiUrl(`/api/official-results${query}`), {
    method: "GET",
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Backend official results failed: ${response.status}`);
  }

  const payload = (await response.json()) as BackendOfficialResultsResponse | unknown;

  if (Array.isArray(payload)) {
    return payload.filter(isLotteryResult);
  }

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as BackendOfficialResultsResponse).results)
  ) {
    return (payload as BackendOfficialResultsResponse).results!.filter(isLotteryResult);
  }

  return null;
};

const fetchLegacyGameResult = async (gameId: string): Promise<LotteryResult | null> => {
  const apiSlug = API_SLUGS[gameId];
  if (!apiSlug) return null;

  const endpoint = `https://loteriascaixa-api.herokuapp.com/api/${apiSlug}/latest?ts=${Date.now()}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`legacy_provider_http_${response.status}`);
    }

    const data = (await response.json()) as LegacyApiResponse;
    const numbers = normalizeNumbers(data.dezenas?.length ? data.dezenas : data.dezenasOrdemSorteio);
    if (!numbers.length) return null;

    let specialNumbers: number[] | undefined;
    let extraString: string | undefined;

    if (gameId === "milionaria" && data.trevos) {
      specialNumbers = normalizeNumbers(data.trevos);
    }

    if (gameId === "dia-de-sorte" && data.mesSorte) {
      const months = [
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
      const monthIdx = months.findIndex((month) => month.toLowerCase() === data.mesSorte?.toLowerCase());
      if (monthIdx !== -1) specialNumbers = [monthIdx + 1];
    }

    if (gameId === "timemania" && data.timeCoracao) {
      extraString = data.timeCoracao;
    }

    return {
      gameId,
      contestNumber: String(data.concurso ?? ""),
      date: data.data ?? "",
      numbers,
      specialNumbers,
      extraString,
      accumulated: Boolean(data.acumulou),
      nextPrize: formatCurrency(Number(data.valorEstimadoProximoConcurso ?? 0)),
      nextDate: data.dataProximoConcurso ?? "",
    };
  } catch (error) {
    console.warn(`Failed to fetch legacy official results for ${gameId}.`, error);
    return null;
  }
};

export const fetchAllResults = async ({
  force = false,
}: {
  force?: boolean;
} = {}): Promise<LotteryResult[]> => {
  try {
    const backendResults = await fetchViaBackend({ force });
    if (backendResults && backendResults.length > 0) {
      return backendResults;
    }
  } catch (error) {
    console.warn("Backend official results endpoint unavailable; using legacy provider fallback.", error);
  }

  const gamesToFetch = Object.keys(API_SLUGS);
  const results = await Promise.all(
    gamesToFetch.map(async (gameId) => {
      const liveData = await fetchLegacyGameResult(gameId);
      if (liveData) return liveData;
      return MOCK_RESULTS.find((mock) => mock.gameId === gameId) || null;
    })
  );

  return results.filter((result): result is LotteryResult => result !== null);
};
