# ⚡ DevOps Quest — API

API REST Express qui sert les données des TPs DevOps (Jenkins + Azure).

## 📁 Structure

```
src/
├── index.js                      # Point d'entrée
├── app.js                        # Config Express + montage routes
├── controllers/
│   ├── parts.controller.js       # Logique métier parties
│   ├── steps.controller.js       # Logique métier étapes
│   └── stats.controller.js       # Logique métier stats
├── routes/
│   ├── parts.routes.js           # GET /api/parts
│   ├── steps.routes.js           # GET /api/steps
│   ├── stats.routes.js           # GET /api/stats
│   └── health.routes.js          # GET /api/health
├── middlewares/
│   ├── cors.js                   # CORS configuré pour le frontend
│   └── errorHandler.js           # Gestion d'erreurs centralisée
└── data/
    ├── index.js                  # Agrégateur
    ├── part1.js                  # Part 1 — Jenkins
    └── part2.js                  # Part 2 — Azure
```

## 🚀 Lancer

```bash
cp .env.example .env
pnpm install
pnpm dev
# → http://localhost:3001
```

## 📡 Endpoints

| Route | Description |
|-------|-------------|
| `GET /api/parts` | Sommaire des parties |
| `GET /api/parts/:partId` | Partie avec ses étapes |
| `GET /api/parts/:partId/steps/:stepId` | Une étape |
| `GET /api/steps` | Toutes les étapes (flat) |
| `GET /api/stats` | Statistiques globales |
| `GET /api/health` | Health check |

## ☁️ Déployer sur Render

1. **New → Web Service** → connecter ce repo
2. Build command : `pnpm install`
3. Start command : `node src/index.js`
4. Variables : `PORT=3001`, `FRONTEND_URL=<url_netlify_rick>`

## 👤 Auteur

**Mouamar**
