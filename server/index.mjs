import dotenv from "dotenv";
import express from "express";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || process.env.API_PORT || 8787);
const apiKey = process.env.GEMINI_API_KEY;
const allowedOriginsRaw = process.env.ALLOWED_ORIGINS;

const resolveAllowedOrigins = (raw) => {
  if (!raw) {
    return new Set([
      "http://localhost:3000",
      "http://localhost",
      "https://localhost",
      "capacitor://localhost",
    ]);
  }

  if (raw.trim() === "*") {
    return "*";
  }

  const list = raw
    .split(/[;,]/)
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set(list);
};

const allowedOrigins = resolveAllowedOrigins(allowedOriginsRaw);

app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (allowedOrigins === "*") {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin || "*");
    if (requestOrigin) {
      res.setHeader("Vary", "Origin");
    }
  } else if (requestOrigin && allowedOrigins.has(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

const validatePayload = (body) => {
  if (!body || typeof body !== "object") return false;
  if (typeof body.dreamText !== "string" || !body.dreamText.trim()) return false;
  if (!body.game || typeof body.game !== "object") return false;
  return true;
};

const buildPrompt = (dreamText, game) => `
Atue como um especialista em numerologia e interpretacao de sonhos.
O usuario teve o seguinte sonho: "${dreamText}".
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
Retorne APENAS um objeto JSON com as chaves: 'main' (array de inteiros), 'special' (array de inteiros, vazio se nao houver) e 'extraString' (string, vazio se nao houver).
`;

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/interpret-dream", async (req, res) => {
  if (!validatePayload(req.body)) {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }

  if (!apiKey) {
    res.status(503).json({ error: "missing_gemini_api_key" });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const { dreamText, game } = req.body;
    const prompt = buildPrompt(dreamText, game);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            main: { type: Type.ARRAY, items: { type: Type.INTEGER } },
            special: { type: Type.ARRAY, items: { type: Type.INTEGER } },
            extraString: { type: Type.STRING, nullable: true },
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      res.status(502).json({ error: "empty_gemini_response" });
      return;
    }

    const parsed = JSON.parse(text);
    res.json({
      main: Array.isArray(parsed.main) ? parsed.main : [],
      special: Array.isArray(parsed.special) ? parsed.special : [],
      extraString: typeof parsed.extraString === "string" ? parsed.extraString : undefined,
    });
  } catch (error) {
    console.error("Erro no backend Gemini:", error);
    res.status(500).json({ error: "gemini_request_failed" });
  }
});

app.listen(port, host, () => {
  console.log(`Gemini API server em http://${host}:${port}`);
});
