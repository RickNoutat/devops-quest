# ⚡ DevOps Quest — Frontend

Interface React (Vite) gamifiée qui consomme l'API de Mouamar.

## 📁 Structure

```
src/
├── main.jsx                  # Entry point
├── App.jsx                   # Orchestrateur principal
├── components/
│   ├── Header.jsx            # Barre + progression XP
│   ├── StatBadge.jsx         # Badge statistique
│   ├── PartSelector.jsx      # Sélection Part 1 / Part 2
│   ├── StepsSidebar.jsx      # Liste des étapes
│   ├── StepDetail.jsx        # Détail + copier-coller
│   ├── DifficultyBadge.jsx   # Badge Facile/Moyen/Difficile
│   ├── Section.jsx           # Titre de section
│   └── ApiError.jsx          # Écran si API off
├── services/
│   └── api.js                # Fetch centralisé
├── hooks/
│   └── useCompletion.js      # Hook progression localStorage
└── styles/
    └── global.css            # Thème dark + animations
```

## 🚀 Lancer

```bash
# 1. D'abord l'API (repo de Mouamar)
cd devops-quest-api && pnpm install && pnpm dev

# 2. Le frontend
cp .env.example .env
pnpm install
pnpm dev
# → http://localhost:5173
```

## ☁️ Déployer sur Netlify

1. **Add new site → Import from GitHub**
2. Build auto-détecté via `netlify.toml`
3. Variable : `VITE_API_URL` = URL Render de Mouamar

## 👤 Auteur

**Rick Noutat**
