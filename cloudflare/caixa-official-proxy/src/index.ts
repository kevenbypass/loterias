interface Env {
  PROXY_KEY?: string;
  REQUEST_TIMEOUT_MS?: string;
  UPSTREAM_BASE_URL?: string;
}

const DEFAULT_UPSTREAM_BASE_URL = "https://servicebus2.caixa.gov.br";
const DEFAULT_TIMEOUT_MS = 12000;
const ALLOWED_PATH_PREFIX = "/portaldeloterias/api/";

const BROWSER_HEADERS: Record<string, string> = {
  Accept: "application/json",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  Origin: "https://loterias.caixa.gov.br",
  Referer: "https://loterias.caixa.gov.br/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
};

const json = (status: number, payload: unknown): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });

const normalizedTimeout = (raw: string | undefined): number => {
  const parsed = Number.parseInt(raw || "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 60000) return DEFAULT_TIMEOUT_MS;
  return parsed;
};

const normalizeBaseUrl = (raw: string | undefined): string => {
  const candidate = typeof raw === "string" ? raw.trim() : "";
  const base = candidate || DEFAULT_UPSTREAM_BASE_URL;
  return base.replace(/\/+$/, "");
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return json(200, {
        ok: true,
        service: "loterias-caixa-proxy",
        time: new Date().toISOString(),
      });
    }

    if (request.method !== "GET") {
      return json(405, { error: "method_not_allowed" });
    }

    if (!url.pathname.startsWith(ALLOWED_PATH_PREFIX)) {
      return json(404, { error: "not_found" });
    }

    const requiredKey = (env.PROXY_KEY || "").trim();
    if (requiredKey) {
      const providedKey = (request.headers.get("X-Proxy-Key") || "").trim();
      if (!providedKey || providedKey !== requiredKey) {
        return json(401, { error: "unauthorized" });
      }
    }

    const timeoutMs = normalizedTimeout(env.REQUEST_TIMEOUT_MS);
    const upstreamBaseUrl = normalizeBaseUrl(env.UPSTREAM_BASE_URL);
    const upstreamUrl = `${upstreamBaseUrl}${url.pathname}${url.search}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers = new Headers();
      Object.entries(BROWSER_HEADERS).forEach(([key, value]) => headers.set(key, value));

      const upstreamResponse = await fetch(upstreamUrl, {
        method: "GET",
        headers,
        redirect: "follow",
        cache: "no-store",
        signal: controller.signal,
      });

      const outHeaders = new Headers();
      const forwardedHeaders = [
        "content-type",
        "content-encoding",
        "etag",
        "last-modified",
        "expires",
        "pragma",
      ];
      forwardedHeaders.forEach((header) => {
        const value = upstreamResponse.headers.get(header);
        if (value) outHeaders.set(header, value);
      });

      outHeaders.set("Cache-Control", "no-store");
      outHeaders.set("X-Proxy-Upstream-Host", new URL(upstreamUrl).hostname);

      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        headers: outHeaders,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "proxy_upstream_request_failed";
      return json(502, {
        error: "proxy_upstream_failed",
        message: errorMessage,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  },
};
