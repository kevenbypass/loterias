<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Loterias (frontend + backend seguro)

Este projeto usa backend local/servidor para proteger `GEMINI_API_KEY` e evitar exposicao no navegador/app.

## Rodar local

Prerequisito: Node.js 20+

1. Instalar dependencias:
   `npm install`
2. Criar `.env.local` com base em `.env.example` e definir:
   - `GEMINI_API_KEY=...`
   - `API_PORT=8787` (opcional)
   - `ALLOWED_ORIGINS=capacitor://localhost,http://localhost:3000,http://localhost,https://localhost` (somente origens explicitas; `*` e ignorado)
   - `INTERNAL_API_KEY=` (opcional; se definir, o frontend/app precisa enviar header `X-Internal-Key`)
   - `GEMINI_MODEL=gemini-2.0-flash` (opcional)
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
     - `GEMINI_API_KEY` = sua chave real
     - `ALLOWED_ORIGINS` = `capacitor://localhost,http://localhost:3000,http://localhost,https://localhost,https://SEU-FRONTEND.onrender.com` (nao usar `*`)
     - `INTERNAL_API_KEY` = opcional para bloquear bots sem chave interna

Depois de publicar o backend, pegue a URL (ex.: `https://loterias-api.onrender.com`) e coloque no build mobile/local:

- `.env.local`:
  - `VITE_API_BASE_URL=https://loterias-api.onrender.com`

## Scripts

- `npm start`: sobe backend Node/Express
- `npm run dev`: frontend + backend em paralelo
- `npm run dev:web`: somente Vite
- `npm run dev:api`: somente backend
- `npm run build`: build frontend
