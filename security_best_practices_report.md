# Security Best Practices Report (LotoSorte)

Date: 2026-02-15

## Scope

Codebase: `C:\Users\keven\loterias` (GitHub: `kevenbypass/loterias`)

Primary stack:
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express

## Executive Summary

Major risks reported (public Gemini usage + third-party Tailwind CDN + weakened CSP) were addressed:
- The frontend no longer loads Tailwind via CDN and does not require `unsafe-inline`.
- A strict CSP is enforced in production (while dev mode strips CSP to keep HMR working).
- The backend protects `/api/interpret-dream` behind `X-Internal-Key` (plus rate limiting).
- Official-results diagnostics and related infrastructure details are no longer exposed by default.

No repository-tracked secrets were found (only placeholders like `.env.example`).

## Findings

### Critical

None found in current code state.

### High

None found in current code state.

### Medium

#### 1) Internal key stored client-side (localStorage)

- Rule ID: REACT-CONFIG-001 (secrets must not be in the client bundle; client storage is observable) / general best practice
- Severity: Medium
- Location:
  - `services/geminiService.ts:35` reads `localStorage.getItem("lotosorte_internal_key")`
  - `components/DreamView.tsx:173` writes to `localStorage.setItem("lotosorte_internal_key", ...)`
- Evidence:
  - The browser stores `X-Internal-Key` in `localStorage` and sends it on requests. (`services/geminiService.ts:51`)
- Impact:
  - If an attacker ever achieves XSS on your origin (or a malicious extension runs), they can read the internal key and use your AI endpoint.
- Fix (recommended):
  - Prefer **server-side auth** (login) for admin-only features, or use a short-lived token minted server-side.
  - If you keep this model, prefer `sessionStorage` over `localStorage` (less persistent) and keep rate limits in place.
- Mitigation:
  - Keep CSP strict (already done) and avoid introducing HTML injection sinks.
- False positive notes:
  - This is only “security critical” if the internal key is intended to be secret. If it’s just an “admin convenience toggle”, risk is reduced but not zero.

### Low

#### 2) CSP delivered via meta tag (limitations)

- Rule ID: REACT-HEADERS-001 / REACT-CSP-001
- Severity: Low
- Location: `index.html:7`
- Evidence:
  - CSP is defined via `<meta http-equiv="Content-Security-Policy" ...>`.
- Impact:
  - Meta CSP is useful but has limitations vs. HTTP response headers (notably `frame-ancestors` is not enforced via meta in modern browsers).
- Fix (recommended):
  - If you want clickjacking protection and tighter control, set CSP and other headers at the edge (Render/Cloudflare) via **HTTP response headers**.

#### 3) Rate limiting is per-instance (in-memory)

- Rule ID: EXPRESS-AUTH-001 / general abuse controls
- Severity: Low
- Location: `server/index.mjs:940` (`express-rate-limit`)
- Impact:
  - If you scale to multiple instances, attackers can bypass limits by spreading requests across instances/IPs.
- Fix (recommended):
  - Move rate limiting to the edge (Cloudflare) or use a shared store (Redis) for rate limit counters.

## Resolved / Improvements Applied

#### A) Removed Tailwind CDN + tightened CSP (no `unsafe-inline`)

- Location: `index.html:7`
- Change:
  - `script-src 'self'`, `script-src-attr 'none'`
  - `style-src 'self' ...`, `style-src-attr 'none'`
  - Removed the Tailwind CDN script and moved to build-time Tailwind.
- Related files:
  - `index.css` (Tailwind v4 import + app custom CSS)
  - `postcss.config.cjs`, `tailwind.config.cjs`

#### B) Internal key mismatch fixed (frontend now sends `X-Internal-Key`)

- Location: `services/geminiService.ts:51`
- Change:
  - The frontend attaches `X-Internal-Key` when configured in the browser.

#### C) Reduced information disclosure for official results

- Location: `server/index.mjs:976`
- Change:
  - Debug headers (`X-Official-*`) are only set for authorized diagnostics requests.

## Notes / Operational Checklist (Production)

- Render backend env vars:
  - `GEMINI_API_KEY` set
  - `INTERNAL_API_KEY` set
  - `REQUIRE_INTERNAL_API_KEY=1`
  - `ALLOWED_ORIGINS` includes your frontend origin (`https://loterias-1.onrender.com`)
- GitHub:
  - Do not commit `.env.local` (keep it ignored).

