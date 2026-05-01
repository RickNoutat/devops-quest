# Tests — devops-quest-api

## Lancer les tests

```bash
pnpm test          # exécution unique
pnpm test:watch    # mode watch (relance à chaque sauvegarde)
```

> La base SQLite de test est **en mémoire** (`DB_PATH=:memory:`), totalement isolée de la base de production.

---

## Structure

```
tests/
├── setup.js                          # Variables d'environnement de test (DB, JWT_SECRET)
├── unit/
│   ├── auth.controller.test.js       # Tests unitaires du controller auth
│   ├── progress.controller.test.js   # Tests unitaires du controller progress
│   ├── leaderboard.controller.test.js# Tests unitaires du controller leaderboard
│   └── stats.controller.test.js      # Tests unitaires du controller stats
└── integration/
    ├── auth.routes.test.js            # Tests HTTP /api/auth/*
    ├── progress.routes.test.js        # Tests HTTP /api/progress/*
    ├── leaderboard.routes.test.js     # Tests HTTP /api/leaderboard
    └── parts.routes.test.js           # Tests HTTP /api/parts, /api/stats, /api/health
```

---

## Tests unitaires

### `auth.controller.test.js` (13 tests)

Teste la logique métier directement, sans HTTP.

| Groupe | Test | Comportement vérifié |
|--------|------|----------------------|
| `register` | 400 si body vide | Champs requis manquants |
| `register` | 400 si username < 3 chars | Validation longueur username |
| `register` | 400 si password < 6 chars | Validation longueur password |
| `register` | 409 si username déjà pris | Détection doublon username |
| `register` | 409 si email déjà pris | Détection doublon email |
| `register` | 201 + token + user | Inscription réussie |
| `register` | Token JWT valide 7 jours | Contenu et expiration du JWT |
| `login` | 400 si body vide | Champs requis manquants |
| `login` | 401 si email inconnu | Email introuvable en base |
| `login` | 401 si mauvais mot de passe | Comparaison bcrypt |
| `login` | 200 + token | Connexion réussie |
| `login` | Token expire dans 7 jours | Vérification de l'expiration (±1 min) |
| `me` | 404 si user introuvable | User supprimé ou ID invalide |
| `me` | 200 retourne le profil | Données retournées sans password_hash |

---

### `progress.controller.test.js` (8 tests)

| Groupe | Test | Comportement vérifié |
|--------|------|----------------------|
| `syncProgress` | 400 si body sans completedSteps | Validation du body |
| `syncProgress` | 400 si completedSteps n'est pas un tableau | Type checking |
| `syncProgress` | 200 avec tableau vide | Efface la progression existante |
| `syncProgress` | 200 avec steps valides | XP récupéré depuis les données statiques |
| `syncProgress` | Steps inconnues → XP = 0 | Fallback pour step_id inconnu |
| `syncProgress` | Remplace complètement l'ancienne progression | Comportement de remplacement total |
| `getProgress` | [] si aucune progression | Utilisateur sans données |
| `getProgress` | Retourne les step_ids sauvegardés | Lecture correcte depuis la DB |
| `getProgress` | Isolation par utilisateur | N'expose pas la progression d'un autre user |

---

### `leaderboard.controller.test.js` (7 tests)

| Groupe | Test | Comportement vérifié |
|--------|------|----------------------|
| `getLeaderboard` | Tableau vide si aucun user | Base vide |
| `getLeaderboard` | Champs rank, username, totalXp, completedSteps | Structure des entrées |
| `getLeaderboard` | Tri par XP décroissant | Ordre du classement |
| `getLeaderboard` | User sans progression → totalXp=0 | Valeurs nulles traitées |
| `getLeaderboard` | currentUserRank null si non connecté | Absence de token |
| `getLeaderboard` | currentUserRank correct si connecté | Position calculée |
| `getLeaderboard` | Rangs consécutifs depuis 1 | Numérotation du classement |

---

### `stats.controller.test.js` (6 tests)

| Test | Comportement vérifié |
|------|----------------------|
| totalParts correspond aux données | Cohérence avec `src/data` |
| totalSteps = somme des étapes | Calcul correct |
| totalXP = somme des XP | Calcul correct |
| byDifficulty contient easy/medium/hard | Structure de la réponse |
| Somme des difficultés = totalSteps | Exhaustivité des catégories |
| Comptes non négatifs | Valeurs valides |

---

## Tests d'intégration

Les tests d'intégration utilisent **Supertest** pour simuler des requêtes HTTP complètes (middlewares CORS, auth, error handler inclus).

### `auth.routes.test.js` (12 tests)

| Route | Test | Code attendu |
|-------|------|-------------|
| `POST /api/auth/register` | Succès | 201 |
| `POST /api/auth/register` | Email manquant | 400 |
| `POST /api/auth/register` | Password trop court | 400 |
| `POST /api/auth/register` | Doublon | 409 |
| `POST /api/auth/register` | Password jamais renvoyé | — |
| `POST /api/auth/login` | Succès | 200 |
| `POST /api/auth/login` | Email inconnu | 401 |
| `POST /api/auth/login` | Mauvais mot de passe | 401 |
| `POST /api/auth/login` | Body vide | 400 |
| `GET /api/auth/me` | Avec token valide | 200 |
| `GET /api/auth/me` | Sans token | 401 |
| `GET /api/auth/me` | Token invalide | 401 |
| `GET /api/auth/me` | Token sans "Bearer" | 401 |

---

### `progress.routes.test.js` (8 tests)

| Route | Test | Code attendu |
|-------|------|-------------|
| `GET /api/progress` | Sans token | 401 |
| `GET /api/progress` | Aucune progression | 200 `[]` |
| `GET /api/progress` | Isolation entre users | 200 (données filtrées) |
| `POST /api/progress/sync` | Sans token | 401 |
| `POST /api/progress/sync` | Body invalide | 400 |
| `POST /api/progress/sync` | Succès | 200 |
| `POST /api/progress/sync` | Remplace l'ancienne progression | 200 |
| `POST /api/progress/sync` | Round-trip sync→get | cohérence |

---

### `leaderboard.routes.test.js` (7 tests)

| Route | Test | Code attendu |
|-------|------|-------------|
| `GET /api/leaderboard` | Accès sans token (public) | 200 |
| `GET /api/leaderboard` | Base vide | 200 `[]` |
| `GET /api/leaderboard` | Champs présents | 200 |
| `GET /api/leaderboard` | Ordre XP décroissant | 200 |
| `GET /api/leaderboard` | currentUserRank null si non connecté | 200 |
| `GET /api/leaderboard` | currentUserRank correct si connecté | 200 |
| `GET /api/leaderboard` | Token invalide ignoré (pas d'erreur) | 200 |

---

### `parts.routes.test.js` (9 tests)

| Route | Test | Code attendu |
|-------|------|-------------|
| `GET /api/health` | Status ok | 200 |
| `GET /api/parts` | Tableau de parties | 200 |
| `GET /api/parts` | Champs id et title | 200 |
| `GET /api/parts/part1` | Retourne les steps | 200 |
| `GET /api/parts/part1` | Steps avec id, title, xp, difficulty | 200 |
| `GET /api/parts/inexistant` | Partie inconnue | 404 |
| `GET /api/stats` | Champs requis présents | 200 |
| `GET /api/stats` | totalParts cohérent | 200 |
| `GET /api/stats` | Somme byDifficulty = totalSteps | 200 |
