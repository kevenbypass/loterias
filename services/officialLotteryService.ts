import { LotteryResult } from "../types";

const FALLBACK_PROD_API_BASE_URL = "https://loterias-jrky.onrender.com";
const rawBaseUrl = String(import.meta.env.VITE_API_BASE_URL || "").trim();
const apiBaseUrl = (rawBaseUrl || (import.meta.env.PROD ? FALLBACK_PROD_API_BASE_URL : "")).replace(/\/+$/, "");
const apiUrl = (path: string) => (apiBaseUrl ? `${apiBaseUrl}${path}` : path);

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

export const fetchAllResults = async ({
  force = false,
}: {
  force?: boolean;
} = {}): Promise<LotteryResult[]> => {
  const query = force ? "?force=1" : "";

  const response = await fetch(apiUrl(`/api/official-results${query}`), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`official_results_backend_failed_${response.status}`);
  }

  const payload = (await response.json()) as BackendOfficialResultsResponse | unknown;

  const resultArray = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as BackendOfficialResultsResponse).results)
    ? (payload as BackendOfficialResultsResponse).results
    : null;

  if (!resultArray) {
    throw new Error("official_results_invalid_payload");
  }

  const filtered = resultArray.filter(isLotteryResult);
  if (!filtered.length) {
    throw new Error("official_results_empty");
  }

  return filtered;
};
