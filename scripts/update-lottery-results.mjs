#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "..", "public", "data");
const resultsFile = path.join(dataDir, "results.json");
const backupFile = `${resultsFile}.bak`;

const DEFAULT_API_URL = "https://loterias-jrky.onrender.com/api/official-results";
const apiUrls = [
  (process.env.API_URL || "").trim(),
  (process.env.API_FALLBACK_URL_1 || "").trim(),
  (process.env.API_FALLBACK_URL_2 || "").trim(),
  DEFAULT_API_URL,
].filter((value, idx, all) => value && all.indexOf(value) === idx);
const timeoutMs = Number.parseInt(process.env.API_TIMEOUT_MS || "15000", 10);
const maxAttempts = Number.parseInt(process.env.API_MAX_ATTEMPTS || "3", 10);

const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const readJsonIfExists = (filePath) => {
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, timeout) => {
  if (typeof fetch !== "function") {
    throw new Error("Global fetch is not available. Use Node.js 18+.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
};

const isResultEntry = (value) => {
  if (!value || typeof value !== "object") return false;

  const candidate = value;
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

const normalizePayload = (payload) => {
  const results = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray(payload.results)
    ? payload.results
    : [];

  return {
    updatedAt: new Date().toISOString(),
    source:
      payload && typeof payload === "object" && typeof payload.source === "string"
        ? payload.source
        : "official-api",
    results,
    metadata: {
      fetchedFrom: "unknown",
      version: "1.0.0",
    },
  };
};

const hasResultChanges = (previousData, nextData) => {
  const previousResults = Array.isArray(previousData?.results) ? previousData.results : null;
  const nextResults = Array.isArray(nextData?.results) ? nextData.results : null;
  return JSON.stringify(previousResults) !== JSON.stringify(nextResults);
};

const saveJson = (filePath, value) => {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const fetchNormalizedResults = async (url, timeout, attempts) => {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, timeout);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const payload = await response.json();
      const normalized = normalizePayload(payload);
      if (!Array.isArray(normalized.results) || normalized.results.length === 0) {
        throw new Error("API returned an empty results list.");
      }

      if (!normalized.results.every(isResultEntry)) {
        throw new Error("API returned an invalid results structure.");
      }

      normalized.metadata.fetchedFrom = url;
      return normalized;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(500 * attempt);
      }
    }
  }

  throw lastError || new Error("Unable to fetch results.");
};

const main = async () => {
  if (!apiUrls.length) {
    throw new Error("No API endpoints configured.");
  }

  ensureDataDir();
  const previous = readJsonIfExists(resultsFile);

  let normalized = null;
  let lastError = null;
  for (const url of apiUrls) {
    console.log(`Fetching lottery results from ${url}`);
    try {
      normalized = await fetchNormalizedResults(url, timeoutMs, maxAttempts);
      break;
    } catch (error) {
      lastError = error;
      console.warn(`Endpoint failed (${url}): ${error.message}`);
    }
  }

  if (!normalized) {
    throw lastError || new Error("All API endpoints failed.");
  }

  if (!hasResultChanges(previous, normalized)) {
    console.log("No changes detected.");
    return;
  }

  if (previous) {
    saveJson(backupFile, previous);
  }

  saveJson(resultsFile, normalized);
  console.log(`Results updated at ${resultsFile} (source: ${normalized.metadata.fetchedFrom})`);
};

main().catch((error) => {
  console.error(`Failed to update lottery results: ${error.message}`);
  process.exit(1);
});
