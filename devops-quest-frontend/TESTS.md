# Tests — devops-quest-frontend

## Lancer les tests

```bash
pnpm test          # exécution unique
pnpm test:watch    # mode watch (relance à chaque sauvegarde)
```

**Stack :** Vitest + React Testing Library + jsdom
L'environnement jsdom simule le DOM navigateur. Les appels API et le contexte auth sont mockés.

---

## Structure

```
src/tests/
├── setup.js                            # Import @testing-library/jest-dom (matchers DOM)
├── unit/
│   ├── useCompletion.test.js           # Hook useCompletion
│   └── AuthContext.test.jsx            # AuthProvider + useAuth
└── components/
    ├── AuthModal.test.jsx              # Composant AuthModal
    ├── Leaderboard.test.jsx            # Composant Leaderboard
    └── Header.test.jsx                 # Composant Header
```

---

## Tests unitaires

### `useCompletion.test.js` (10 tests)

Teste le hook en isolation. `AuthContext` et `api.js` sont mockés.

| Groupe | Test | Comportement vérifié |
|--------|------|----------------------|
| **Non connecté** | Initialise avec `[]` si localStorage vide | État initial |
| **Non connecté** | Initialise depuis localStorage | Restauration de l'état |
| **Non connecté** | `toggle` ajoute un step | Ajout correct |
| **Non connecté** | `toggle` retire un step présent | Suppression correcte |
| **Non connecté** | Double toggle = idempotent | add → remove |
| **Non connecté** | localStorage mis à jour après toggle | Persistance locale |
| **Non connecté** | Pas d'appel API | Isolation localStorage |
| **Connecté** | Charge la progression distante à la connexion | `fetchProgress` appelé |
| **Connecté** | `syncProgress` appelé après toggle (debounce) | Sync avec délai 500ms |
| **Connecté** | Erreur `fetchProgress` → pas de crash | Résilience réseau |

---

### `AuthContext.test.jsx` (9 tests)

Teste `AuthProvider` via un composant `<Inspector>` qui expose l'état du contexte.

| Groupe | Test | Comportement vérifié |
|--------|------|----------------------|
| **Initial** | `user` null sans token en localStorage | Pas de restauration automatique |
| **Initial** | Restaure la session si token valide présent | `fetchMe` appelé au montage |
| **Initial** | Token invalide/expiré nettoyé au montage | `localStorage` vidé, user = null |
| **login** | Appelle `api.login` avec email + password | Paramètres corrects |
| **login** | Stocke le token dans localStorage | Persistance du token |
| **login** | Met à jour `user` après succès | État React mis à jour |
| **register** | Appelle `api.register` avec username/email/password | Paramètres corrects |
| **register** | Stocke le token et met à jour `user` | Comportement identique au login |
| **logout** | Supprime le token et remet `user` à null | Déconnexion complète |

---

## Tests de composants

### `AuthModal.test.jsx` (11 tests)

| Groupe | Test | Comportement vérifié |
|--------|------|----------------------|
| **Rendu** | Titre `// LOGIN` par défaut | Mode initial |
| **Rendu** | Onglets SE CONNECTER / S'INSCRIRE visibles | Navigation entre modes |
| **Rendu** | Champ username absent en mode login | Rendu conditionnel |
| **Switch** | Click S'INSCRIRE → champ username apparaît | Rendu conditionnel |
| **Switch** | Click S'INSCRIRE → titre `// REGISTER` | Changement de titre |
| **Login** | Appelle `api.login` avec les valeurs saisies | Soumission du formulaire |
| **Login** | Ferme la modale après succès | Callback `onClose` |
| **Login** | Affiche l'erreur API | Gestion d'erreur |
| **Register** | Appelle `api.register` avec username/email/password | Soumission du formulaire |
| **Fermeture** | Bouton × appelle `onClose` | Fermeture directe |
| **Fermeture** | Click sur l'overlay appelle `onClose` | Fermeture en dehors |

---

### `Leaderboard.test.jsx` (10 tests)

| Groupe | Test | Comportement vérifié |
|--------|------|----------------------|
| **Chargement** | Affiche "Chargement..." avant la réponse | État de chargement |
| **Chargement** | Affiche les entrées après chargement | Rendu de la liste |
| **Chargement** | Message "Aucun participant" si liste vide | État vide |
| **Chargement** | Affiche l'erreur API | Gestion d'erreur réseau |
| **Contenu** | Affiche le XP de chaque entrée | Données correctes |
| **Contenu** | Affiche le nombre de steps complétées | Données correctes |
| **User connecté** | `(toi)` à côté du username du user connecté | Identification visuelle |
| **User connecté** | Affiche la position `Ta position : #N` | Rang personnel |
| **User connecté** | Pas de `Ta position` si non connecté | Rendu conditionnel |
| **Fermeture** | Bouton × appelle `onClose` | Fermeture |

---

### `Header.test.jsx` (16 tests)

| Groupe | Test | Comportement vérifié |
|--------|------|----------------------|
| **Rendu** | Affiche `DEVOPS_QUEST` | Titre présent |
| **Rendu** | Affiche le XP total | Valeur stats |
| **Rendu** | Affiche `complété/total` | Compteur steps |
| **Rendu** | `0/0` si stats null | Valeurs par défaut |
| **Progression** | Affiche `0%` si aucun step | Calcul 0% |
| **Progression** | Affiche `100%` si tout complété | Calcul 100% |
| **Progression** | Affiche `50%` à mi-chemin | Calcul intermédiaire |
| **Non connecté** | Bouton `[ login ]` visible | Rendu conditionnel |
| **Non connecté** | Pas de bouton `logout` | Rendu conditionnel |
| **Non connecté** | Click `[ login ]` → `onLoginClick` | Callback |
| **Connecté** | Username affiché | Rendu conditionnel |
| **Connecté** | Bouton `logout` visible | Rendu conditionnel |
| **Connecté** | Pas de `[ login ]` | Rendu conditionnel |
| **Connecté** | Click `logout` → `auth.logout` | Callback |
| **Leaderboard** | Bouton `▲ TOP` toujours visible | Rendu permanent |
| **Leaderboard** | Click `▲ TOP` → `onLeaderboardClick` | Callback |
