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
   - `OFFICIAL_FORCE_REFRESH_MIN_INTERVAL_MS=300000` (opcional; intervalo minimo por IP para `?force=1`)
   - `OFFICIAL_FORCE_REFRESH_MAX_TRACKED_IPS=10000` (opcional; limite de IPs rastreados para force refresh, protege memoria contra IP spray)
   - `OFFICIAL_API_TIMEOUT_MS=12000` (opcional; timeout de consulta da API oficial)
   - `OFFICIAL_CAIXA_BASE_URL=https://servicebus2.caixa.gov.br/portaldeloterias/api` (opcional; origem oficial direta da Caixa)
   - `OFFICIAL_CAIXA_PROXY_KEY=` (opcional; chave para autenticar no proxy Cloudflare)
   - `OFFICIAL_LOOKUP_URLS=https://lottolookup.com.br/api` (opcional; lista separada por `,` ou `;` para fallback de lookup no backend)
   - `VITE_API_BASE_URL=` (opcional; backend principal do frontend, deixe vazio para usar proxy local do Vite)
   - `VITE_API_FALLBACK_BASE_URLS=https://loterias-jrky.onrender.com` (opcional; lista separada por `,` ou `;` para fallback do frontend)
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
     - `OFFICIAL_FORCE_REFRESH_MIN_INTERVAL_MS` = opcional (default `300000`)
     - `OFFICIAL_FORCE_REFRESH_MAX_TRACKED_IPS` = opcional (default `10000`)
     - `OFFICIAL_API_TIMEOUT_MS` = opcional (default `12000`)
     - `OFFICIAL_CAIXA_BASE_URL` = opcional (default `https://servicebus2.caixa.gov.br/portaldeloterias/api`)
     - `OFFICIAL_CAIXA_PROXY_KEY` = opcional (obrigatoria apenas se `OFFICIAL_CAIXA_BASE_URL` apontar para Worker proxy)
     - `OFFICIAL_LOOKUP_URLS` = opcional (default `https://lottolookup.com.br/api`, aceita lista separada por `,` ou `;`)

Depois de publicar o backend, pegue a URL (ex.: `https://loterias-api.onrender.com`) e coloque no build mobile/local:

- `.env.local`:
  - `VITE_API_BASE_URL=https://loterias-api.onrender.com`
  - `VITE_API_FALLBACK_BASE_URLS=https://loterias-jrky.onrender.com`

## Deploy automatico (GitHub -> Render)

Este repo inclui o workflow `.github/workflows/render-auto-deploy.yml`, que dispara deploy no Render a cada push na branch `main`.

Configure os secrets no GitHub (`Settings -> Secrets and variables -> Actions`):

- `RENDER_DEPLOY_HOOK_URL_FRONTEND`: Deploy Hook da Static Site
- `RENDER_DEPLOY_HOOK_URL_BACKEND`: Deploy Hook do Web Service
- (legado, opcional) `RENDER_WEBHOOK`: hook unico (usado apenas se os 2 acima nao existirem)

Como pegar os hooks no Render:
1. Abra o service no Render.
2. `Settings -> Deploy Hook`.
3. Crie/copiei a URL e salve no secret correspondente no GitHub.

Observacao: se seu service Render ja estiver com Auto-Deploy via Git habilitado, o hook pode ser opcional.

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
4. (Opcional) Ativar header de debug de upstream apenas quando estiver diagnosticando:
   - `npx wrangler secret put DEBUG_PROXY_HEADERS --config cloudflare/caixa-official-proxy/wrangler.toml` e valor `1`
   - Em producao, manter vazio/desligado para nao expor host de upstream
5. Configurar no backend Render:
   - `OFFICIAL_CAIXA_BASE_URL=https://SEU-WORKER.workers.dev/portaldeloterias/api`
   - `OFFICIAL_CAIXA_PROXY_KEY=mesmo_valor_do_PROXY_KEY`
6. Forcar teste:
   `GET /api/official-results?force=1`

## Scripts

- `npm start`: sobe backend Node/Express
- `npm run dev`: frontend + backend em paralelo
- `npm run dev:web`: somente Vite
- `npm run dev:api`: somente backend
- `npm run typecheck`: typecheck padrao (config de producao/CI)
- `npm run typecheck:dev`: typecheck com config de desenvolvimento
- `npm run build`: build frontend
