# Security Best Practices Report (LotoSorte)

Date: 2026-02-15

## Scope

Codebase: this repository (`loterias`)

Primary stack:
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express

## Executive Summary

Major risks reported (third-party Tailwind CDN + weakened CSP + AI endpoint exposure/cost) were addressed:
- The frontend no longer loads Tailwind via CDN and does not require `unsafe-inline`.
- A strict CSP is enforced in production (while dev mode strips CSP to keep HMR working).
- The legacy AI feature and its backend endpoint were removed, so it no longer consumes any AI API.
- Official-results diagnostics and related infrastructure details are not exposed to clients.

No repository-tracked secrets were found (only placeholders like `.env.example`).

## Findings

### Critical

None found in current code state.

### High

None found in current code state.

### Medium

None found in current code state.

### Low

#### 1) CSP delivered via meta tag (limitations)

- Rule ID: REACT-HEADERS-001 / REACT-CSP-001
- Severity: Low
- Location: `index.html:7`
- Evidence:
  - CSP is defined via `<meta http-equiv="Content-Security-Policy" ...>`.
- Impact:
  - Meta CSP is useful but has limitations vs. HTTP response headers (notably `frame-ancestors` is not enforced via meta in modern browsers).
- Fix (recommended):
  - If you want clickjacking protection and tighter control, set CSP and other headers at the edge (Render/Cloudflare) via **HTTP response headers**.

#### 2) Rate limiting is per-instance (in-memory)

- Rule ID: EXPRESS-AUTH-001 / general abuse controls
- Severity: Low
- Location: `server/index.mjs:725` (`express-rate-limit`)
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

#### B) Removed legacy AI integration

- Change:
  - Removed the `/api/interpret-dream` endpoint and all client UI for the removed AI feature.
  - Removed client-side internal key storage (`X-Internal-Key` in browser storage).
  - Removed the third-party AI SDK dependency from the project.

#### C) Reduced information disclosure for official results

- Location: `server/index.mjs:735`
- Change:
  - Official-results diagnostics and debug headers are not exposed to clients.

## Notes / Operational Checklist (Production)

- Render backend env vars:
  - `ALLOWED_ORIGINS` includes your frontend origin (`https://loterias-1.onrender.com`)
- GitHub:
  - Do not commit `.env.local` (keep it ignored).
