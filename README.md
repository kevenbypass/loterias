<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Loterias (frontend + backend seguro)

Este projeto usa backend local/servidor para fornecer os endpoints da aplicacao (ex.: resultados oficiais) e aplicar controles de seguranca (CORS, headers, rate limit).

## Rodar local

Prerequisito: Node.js 20+

1. Instalar dependencias:
   `npm install`
2. Criar `.env.local` com base em `.env.example` e definir:
   - `API_PORT=8787` (opcional)
   - `ALLOWED_ORIGINS=capacitor://localhost,http://localhost:3000,http://localhost,https://localhost` (somente origens explicitas; `*` e ignorado)
   - `OFFICIAL_RESULTS_TTL_MS=120000` (opcional; cache dos resultados oficiais no backend)
   - `OFFICIAL_API_TIMEOUT_MS=12000` (opcional; timeout de consulta da API oficial)
   - `OFFICIAL_CAIXA_BASE_URL=https://servicebus2.caixa.gov.br/portaldeloterias/api` (opcional; origem oficial direta da Caixa)
   - `OFFICIAL_CAIXA_PROXY_KEY=` (opcional; chave para autenticar no proxy Cloudflare)
   - `VITE_API_BASE_URL=` (deixe vazio para usar proxy local do Vite)
3. Rodar frontend + backend:
   `npm run dev`

URLs locais:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8787/api/health`

## Deploy no Render (mesmo repo)

Crie 2 services no Render apontando para o mesmo repositorio:

1. Frontend (`Static Site`)
   - Root Directory: vazio (`.`)
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. Backend (`Web Service`)
   - Root Directory: vazio (`.`)
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     - `ALLOWED_ORIGINS` = `capacitor://localhost,http://localhost:3000,http://localhost,https://localhost,https://SEU-FRONTEND.onrender.com` (nao usar `*`)
     - `OFFICIAL_RESULTS_TTL_MS` = opcional (default `120000`)
     - `OFFICIAL_API_TIMEOUT_MS` = opcional (default `12000`)
     - `OFFICIAL_CAIXA_BASE_URL` = opcional (default `https://servicebus2.caixa.gov.br/portaldeloterias/api`)
     - `OFFICIAL_CAIXA_PROXY_KEY` = opcional (obrigatoria apenas se `OFFICIAL_CAIXA_BASE_URL` apontar para Worker proxy)

Depois de publicar o backend, pegue a URL (ex.: `https://loterias-api.onrender.com`) e coloque no build mobile/local:

- `.env.local`:
  - `VITE_API_BASE_URL=https://loterias-api.onrender.com`

## Proxy oficial da Caixa (Cloudflare Worker)

Use se o backend no Render estiver caindo direto para `lottolookup` por bloqueio/rede na Caixa.

Arquivos do proxy:
- `cloudflare/caixa-official-proxy/wrangler.toml`
- `cloudflare/caixa-official-proxy/src/index.ts`

Passos:
1. Login no Cloudflare:
   `npx wrangler login`
2. Deploy do Worker:
   `npx wrangler deploy --config cloudflare/caixa-official-proxy/wrangler.toml`
3. (Recomendado) Definir segredo no Worker:
   `npx wrangler secret put PROXY_KEY --config cloudflare/caixa-official-proxy/wrangler.toml`
4. Configurar no backend Render:
   - `OFFICIAL_CAIXA_BASE_URL=https://SEU-WORKER.workers.dev/portaldeloterias/api`
   - `OFFICIAL_CAIXA_PROXY_KEY=mesmo_valor_do_PROXY_KEY`
5. Forcar teste:
   `GET /api/official-results?force=1`

## Scripts

- `npm start`: sobe backend Node/Express
- `npm run dev`: frontend + backend em paralelo
- `npm run dev:web`: somente Vite
- `npm run dev:api`: somente backend
- `npm run build`: build frontend
