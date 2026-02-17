#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "..", "public", "data");
const resultsFile = path.join(dataDir, "results.json");

const DEFAULT_API_URL = "https://loterias-jrky.onrender.com/api/official-results";
const apiUrl = (process.env.API_URL || "").trim() || DEFAULT_API_URL;
const timeoutMs = Number.parseInt(process.env.API_TIMEOUT_MS || "15000", 10);

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
      fetchedFrom: apiUrl,
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

const main = async () => {
  console.log(`Fetching lottery results from ${apiUrl}`);

  ensureDataDir();

  const response = await fetchWithTimeout(apiUrl, timeoutMs);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const normalized = normalizePayload(payload);

  if (!Array.isArray(normalized.results) || normalized.results.length === 0) {
    throw new Error("API returned an empty results list.");
  }

  const previous = readJsonIfExists(resultsFile);
  if (!hasResultChanges(previous, normalized)) {
    console.log("No changes detected.");
    return;
  }

  saveJson(resultsFile, normalized);
  console.log(`Results updated at ${resultsFile}`);
};

main().catch((error) => {
  console.error(`Failed to update lottery results: ${error.message}`);
  process.exit(1);
});
