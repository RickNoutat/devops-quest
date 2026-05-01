# DevOps Quest

Application web interactive pour apprendre le DevOps en mode "quest log" (RPG-like) : modules, etapes, XP, leaderboard, suivi de progression. Projet ecole avec un focus sur la chaine complete d'un ingenieur DevOps moderne (CI/CD, conteneurisation, deploiement cloud, HTTPS).

**[Acceder au site](https://devopsquest.duckdns.org)** — **[Documentation API (Swagger)](https://devopsquest.duckdns.org/api/docs)**

## Sommaire

- [Quick start (local)](#quick-start-local)
- [Architecture](#architecture)
- [VM Azure](#vm-azure)
- [Stack technique](#stack-technique)
- [Docker](#docker)
- [Variables d'environnement](#variables-denvironnement-backend)
- [Volumes Docker](#volumes-docker)
- [Pipelines CI/CD](#pipelines-cicd-jenkins)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Equipe](#equipe)

## Quick start (local)

**Backend :**

```bash
cd devops-quest-api
pnpm install
cp .env.example .env  # ajuster les variables (JWT_SECRET, SMTP_*)
pnpm dev              # http://localhost:3001
```

**Frontend :**

```bash
cd devops-quest-frontend
pnpm install
pnpm dev              # http://localhost:5173
```

**Tests :**

```bash
cd devops-quest-api && pnpm test       # 73 tests (Jest + Supertest)
cd devops-quest-frontend && pnpm test  # 56 tests (Vitest + RTL)
```

## Architecture

```text
                       Internet
                          |
                          v
                +-------------------+
                |       Caddy       |  (port 80/443, HTTPS auto via Let's Encrypt)
                | reverse proxy     |
                +---------+---------+
                          |
            +-------------+-------------+
            |                           |
            v                           v
   +-----------------+         +------------------+
   |    /api/*       |         |        /         |
   |  backend:3001   |         |  frontend:8080   |
   +-----------------+         +------------------+
   Docker container             Docker container
   devops-quest-api             devops-quest-frontend
   (Node.js / Express)          (Nginx + React SPA)
            |
            v
       SQLite (/data/)
```

Tout est heberge sur une seule VM Azure : `devopsquest.duckdns.org` → `74.248.130.202`.

## VM Azure

| Caracteristique | Valeur                  |
| --------------- | ----------------------- |
| Domaine         | devopsquest.duckdns.org |
| IP publique     | 74.248.130.202          |
| SKU             | Standard_B2ats_v2       |
| Region          | polandcentral           |
| OS              | Ubuntu 22.04 LTS        |
| Resource Group  | rg-devops-pl            |
| NSG             | devops-quest-apiNSG     |
| Utilisateur SSH | azureuser               |

### Ports ouverts (NSG)

| Port | Protocole | Usage                                       |
| ---- | --------- | ------------------------------------------- |
| 22   | TCP       | SSH                                         |
| 80   | TCP       | HTTP (redirige vers HTTPS)                  |
| 443  | TCP       | HTTPS                                       |
| 3001 | TCP       | Backend API (interne, exposable pour debug) |

## Stack technique

### Backend (devops-quest-api)

- **Runtime** : Node.js 20
- **Framework** : Express.js
- **Base de donnees** : SQLite via `better-sqlite3`
- **Auth** : JWT (sessions 7 jours) + bcryptjs
- **Email** : Nodemailer (Gmail SMTP)
- **Doc API** : Swagger UI (`/api/docs`)
- **Tests** : Jest + Supertest (73 tests, 8 suites)

### Frontend (devops-quest-frontend)

- **Framework** : React 18 + Vite
- **Serveur** : Nginx (conteneur Docker)
- **Auth** : Context API + localStorage (`dq-token`)
- **Tests** : Vitest + React Testing Library (56 tests, 5 suites)

### Reverse proxy / HTTPS

- **Caddy** (installe directement sur la VM, hors Docker)
- HTTPS automatique via Let's Encrypt
- Redirection HTTP → HTTPS automatique

## Docker

### Image Backend

```dockerfile
FROM node:20-slim
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install
COPY . .
EXPOSE 3001
CMD ["node", "src/index.js"]
```

### Image Frontend

```dockerfile
FROM node:20-slim AS build
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Commandes de deploiement

**Backend :**

```bash
docker run -d \
  --name devops-quest-api \
  --restart unless-stopped \
  -p 3001:3001 \
  -e PORT=3001 \
  -e JWT_SECRET=<secret> \
  -e FRONTEND_URL=https://devopsquest.duckdns.org \
  -e DB_PATH=/data/devops-quest.db \
  -e SMTP_HOST=smtp.gmail.com \
  -e SMTP_PORT=587 \
  -e SMTP_USER=<email> \
  -e SMTP_PASS=<app-password> \
  -e "SMTP_FROM=DevOps Quest <email>" \
  -v devops-quest-data:/data \
  rickydavinci/devops-quest-api:latest
```

**Frontend :**

```bash
docker run -d \
  --name devops-quest-frontend \
  --restart unless-stopped \
  -p 8080:80 \
  devops-quest-frontend:latest
```

### Configuration Caddy

`/etc/caddy/Caddyfile` :

```caddy
devopsquest.duckdns.org {
    handle /api/* {
        reverse_proxy localhost:3001
    }
    handle {
        reverse_proxy localhost:8080
    }
}
```

## Variables d'environnement (Backend)

| Variable       | Description            | Exemple                               |
| -------------- | ---------------------- | ------------------------------------- |
| `PORT`         | Port d'ecoute          | `3001`                                |
| `JWT_SECRET`   | Cle de signature JWT   | `devops-quest-prod-2024`              |
| `FRONTEND_URL` | URL du frontend (CORS) | `https://devopsquest.duckdns.org`     |
| `DB_PATH`      | Chemin SQLite          | `/data/devops-quest.db`               |
| `SMTP_HOST`    | Serveur SMTP           | `smtp.gmail.com`                      |
| `SMTP_PORT`    | Port SMTP              | `587`                                 |
| `SMTP_USER`    | Email SMTP             | `ricknoutat@gmail.com`                |
| `SMTP_PASS`    | Mot de passe app Gmail | `xxxx xxxx xxxx xxxx`                 |
| `SMTP_FROM`    | Expediteur             | `DevOps Quest <ricknoutat@gmail.com>` |

## Volumes Docker

| Volume              | Montage | Contenu                         |
| ------------------- | ------- | ------------------------------- |
| `devops-quest-data` | `/data` | Base SQLite (`devops-quest.db`) |

> Ne **jamais** monter un volume sur `/app` — cela ecraserait les `node_modules` compiles dans l'image.

## Pipelines CI/CD (Jenkins)

Jenkins tourne dans un container Docker sur une VM UTM locale (`192.168.64.8:8080`). Les pipelines sont declenchees par **SCM Polling** sur le repo GitHub (verification toutes les 2 minutes).

### Pipeline Backend (`devops-quest-api/Jenkinsfile`)

```text
Checkout -> Install -> Test -> Build Docker -> Push Docker Hub -> Deploy VM -> Health Check
```

**Credentials Jenkins requis :**

| ID                      | Type              | Description              |
| ----------------------- | ----------------- | ------------------------ |
| `dockerhub-credentials` | Username/Password | Compte Docker Hub        |
| `azure-api-ip`          | Secret text       | IP de la VM Azure        |
| `azure-ssh-key`         | SSH Key           | Cle SSH pour azureuser   |
| `jwt-secret`            | Secret text       | JWT_SECRET de production |
| `frontend-url`          | Secret text       | URL HTTPS du frontend    |
| `smtp-user`             | Secret text       | Email SMTP               |
| `smtp-pass`             | Secret text       | Mot de passe app Gmail   |

### Pipeline Frontend (`devops-quest-frontend/Jenkinsfile`)

```text
Checkout -> Install -> Test -> Build Docker (VITE_API_URL) -> Push Docker Hub -> Deploy VM -> Health Check
```

**Credentials Jenkins requis :**

| ID                      | Type              | Description                     |
| ----------------------- | ----------------- | ------------------------------- |
| `dockerhub-credentials` | Username/Password | Compte Docker Hub               |
| `azure-frontend-ip`     | Secret text       | IP de la VM (meme que backend)  |
| `azure-api-ip`          | Secret text       | IP de la VM (pour VITE_API_URL) |
| `azure-ssh-key`         | SSH Key           | Cle SSH pour azureuser          |

## API Endpoints

| Methode | Route                       | Auth      | Description                     |
| ------- | --------------------------- | --------- | ------------------------------- |
| GET     | `/api/health`               | -         | Health check                    |
| GET     | `/api/stats`                | -         | Statistiques generales          |
| GET     | `/api/parts`                | -         | Liste des parties               |
| GET     | `/api/parts/:id`            | -         | Detail d'une partie             |
| GET     | `/api/docs`                 | -         | Documentation Swagger           |
| POST    | `/api/auth/register`        | -         | Inscription                     |
| POST    | `/api/auth/login`           | -         | Connexion                       |
| GET     | `/api/auth/me`              | JWT       | Profil utilisateur              |
| POST    | `/api/auth/forgot-password` | -         | Demande reset mot de passe      |
| POST    | `/api/auth/reset-password`  | -         | Reset mot de passe (avec token) |
| GET     | `/api/progress`             | JWT       | Progression utilisateur         |
| POST    | `/api/progress/sync`        | JWT       | Synchro progression             |
| GET     | `/api/leaderboard`          | Optionnel | Top 50 + rang utilisateur       |

## Troubleshooting

### "Exec format error" sur better-sqlite3

Le binaire natif a ete compile pour la mauvaise architecture. **Build l'image directement sur la VM** au lieu d'utiliser `docker buildx` depuis un Mac M1.

### RAM insuffisante pour Docker build

La VM `Standard_B2ats_v2` n'a que 847 MB de RAM. Creer un swap avant le build :

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
```

### Volume /app ecrase node_modules

Ne jamais utiliser `-v volume:/app`. Monter uniquement le volume de donnees sur `/data` :

```bash
-v devops-quest-data:/data -e DB_PATH=/data/devops-quest.db
```

### Container en restart loop

Verifier les logs : `docker logs devops-quest-api`. Causes courantes : `JWT_SECRET` manquant, mauvaise architecture binaire, port deja utilise.

### Caddy ne genere pas de certificat HTTPS

Verifier que :

- Le domaine pointe bien vers l'IP de la VM (`dig devopsquest.duckdns.org`)
- Les ports 80 et 443 sont ouverts dans le NSG Azure
- Caddy tourne : `sudo systemctl status caddy`
- Logs Caddy : `sudo journalctl -u caddy -f`

## Equipe

| Membre | Role             | Responsabilite                           |
| ------ | ---------------- | ---------------------------------------- |
| Ricky  | Full-stack + Ops | API, frontend, infra, CI/CD, deploiement |
