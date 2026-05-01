/**
 * Configuration Swagger / OpenAPI 3.0
 */

const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DevOps Quest API",
      version: "1.0.0",
      description:
        "API REST du guide interactif DevOps Quest — Jenkins, Docker, Azure.\n\n" +
        "Les routes protégées requièrent un token JWT obtenu via `/api/auth/login` ou `/api/auth/register`. " +
        "Passez-le dans le header `Authorization: Bearer <token>`.",
    },
    servers: [
      { url: "http://localhost:3001", description: "Développement local" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Message d'erreur" },
          },
        },
        User: {
          type: "object",
          properties: {
            id:         { type: "integer", example: 1 },
            username:   { type: "string",  example: "alice" },
            email:      { type: "string",  example: "alice@example.com" },
            created_at: { type: "string",  format: "date-time" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: { type: "string", example: "eyJhbGci..." },
            user:  { $ref: "#/components/schemas/User" },
          },
        },
        Step: {
          type: "object",
          properties: {
            id:            { type: "string",  example: "1-1" },
            number:        { type: "integer", example: 1 },
            title:         { type: "string",  example: "Installer la VM Ubuntu" },
            description:   { type: "string" },
            xp:            { type: "integer", example: 50 },
            difficulty:    { type: "string",  enum: ["easy", "medium", "hard"] },
            estimatedTime: { type: "string",  example: "15 min" },
            instructions:  { type: "array",   items: { type: "object" } },
            commands:      { type: "array",   items: { type: "object" } },
            validation:    { type: "string" },
            tips:          { type: "array",   items: { type: "string" } },
            traps:         { type: "array",   items: { type: "string" } },
          },
        },
        Part: {
          type: "object",
          properties: {
            id:          { type: "string",  example: "part1" },
            title:       { type: "string",  example: "Partie 1 — VM & Jenkins" },
            description: { type: "string" },
            icon:        { type: "string" },
            color:       { type: "string" },
            totalXP:     { type: "integer", example: 600 },
            stepsCount:  { type: "integer", example: 10 },
          },
        },
        PartDetail: {
          allOf: [
            { $ref: "#/components/schemas/Part" },
            {
              type: "object",
              properties: {
                steps: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Step" },
                },
              },
            },
          ],
        },
        Stats: {
          type: "object",
          properties: {
            totalParts: { type: "integer", example: 2 },
            totalSteps: { type: "integer", example: 20 },
            totalXP:    { type: "integer", example: 1200 },
            byDifficulty: {
              type: "object",
              properties: {
                easy:   { type: "integer", example: 8 },
                medium: { type: "integer", example: 8 },
                hard:   { type: "integer", example: 4 },
              },
            },
          },
        },
        LeaderboardEntry: {
          type: "object",
          properties: {
            rank:           { type: "integer", example: 1 },
            id:             { type: "integer", example: 42 },
            username:       { type: "string",  example: "alice" },
            totalXp:        { type: "integer", example: 750 },
            completedSteps: { type: "integer", example: 12 },
          },
        },
      },
    },
    tags: [
      { name: "Health",      description: "Santé de l'API" },
      { name: "Parts",       description: "Parties du TP" },
      { name: "Steps",       description: "Étapes (toutes parties confondues)" },
      { name: "Stats",       description: "Statistiques globales" },
      { name: "Auth",        description: "Authentification — sessions JWT 7 jours" },
      { name: "Progress",    description: "Progression utilisateur (authentifié)" },
      { name: "Leaderboard", description: "Classement des participants" },
    ],
    paths: {
      // ── Health ─────────────────────────────────────────────────────────────
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Vérifier l'état de l'API",
          responses: {
            200: {
              description: "API opérationnelle",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status:    { type: "string", example: "ok" },
                      version:   { type: "string", example: "1.0.0" },
                      timestamp: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ── Parts ───────────────────────────────────────────────────────────────
      "/api/parts": {
        get: {
          tags: ["Parts"],
          summary: "Liste toutes les parties (sommaire)",
          responses: {
            200: {
              description: "Tableau de parties",
              content: {
                "application/json": {
                  schema: { type: "array", items: { $ref: "#/components/schemas/Part" } },
                },
              },
            },
          },
        },
      },
      "/api/parts/{partId}": {
        get: {
          tags: ["Parts"],
          summary: "Détail d'une partie avec toutes ses étapes",
          parameters: [
            {
              name: "partId",
              in: "path",
              required: true,
              schema: { type: "string", example: "part1" },
              description: "Identifiant de la partie (ex: part1, part2)",
            },
          ],
          responses: {
            200: {
              description: "Partie avec ses étapes",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PartDetail" },
                },
              },
            },
            404: {
              description: "Partie introuvable",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/parts/{partId}/steps/{stepId}": {
        get: {
          tags: ["Parts"],
          summary: "Détail d'une étape spécifique",
          parameters: [
            { name: "partId", in: "path", required: true, schema: { type: "string", example: "part1" } },
            { name: "stepId", in: "path", required: true, schema: { type: "string", example: "1-1" } },
          ],
          responses: {
            200: {
              description: "Étape",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Step" } } },
            },
            404: {
              description: "Partie ou étape introuvable",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },

      // ── Steps ───────────────────────────────────────────────────────────────
      "/api/steps": {
        get: {
          tags: ["Steps"],
          summary: "Liste toutes les étapes (toutes parties, format plat)",
          responses: {
            200: {
              description: "Tableau d'étapes enrichies avec partId et partTitle",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      allOf: [
                        { $ref: "#/components/schemas/Step" },
                        {
                          type: "object",
                          properties: {
                            partId:    { type: "string", example: "part1" },
                            partTitle: { type: "string", example: "Partie 1 — VM & Jenkins" },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ── Stats ───────────────────────────────────────────────────────────────
      "/api/stats": {
        get: {
          tags: ["Stats"],
          summary: "Statistiques globales du TP",
          responses: {
            200: {
              description: "Statistiques",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Stats" } } },
            },
          },
        },
      },

      // ── Auth ────────────────────────────────────────────────────────────────
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Créer un compte",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["username", "email", "password"],
                  properties: {
                    username: { type: "string", minLength: 3, maxLength: 30, example: "alice" },
                    email:    { type: "string", format: "email", example: "alice@example.com" },
                    password: { type: "string", minLength: 6, example: "secret123" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Compte créé — retourne un token JWT valable 7 jours",
              content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
            },
            400: { description: "Champs manquants ou invalides", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            409: { description: "Username ou email déjà utilisé",  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Se connecter",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email:    { type: "string", format: "email", example: "alice@example.com" },
                    password: { type: "string", example: "secret123" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Connexion réussie — retourne un token JWT valable 7 jours",
              content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
            },
            400: { description: "Champs manquants",               content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            401: { description: "Email ou mot de passe incorrect", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Profil de l'utilisateur connecté",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Profil utilisateur",
              content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
            },
            401: { description: "Token manquant ou invalide", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Utilisateur introuvable",    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ── Progress ────────────────────────────────────────────────────────────
      "/api/progress": {
        get: {
          tags: ["Progress"],
          summary: "Récupérer la progression de l'utilisateur connecté",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Liste des IDs d'étapes complétées",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      completedSteps: {
                        type: "array",
                        items: { type: "string" },
                        example: ["1-1", "1-2", "2-1"],
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Token manquant ou invalide", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/progress/sync": {
        post: {
          tags: ["Progress"],
          summary: "Synchroniser la progression (remplace l'existante)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["completedSteps"],
                  properties: {
                    completedSteps: {
                      type: "array",
                      items: { type: "string" },
                      example: ["1-1", "1-2", "2-1"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Progression sauvegardée",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      ok:    { type: "boolean", example: true },
                      saved: { type: "integer", example: 3 },
                    },
                  },
                },
              },
            },
            400: { description: "completedSteps manquant ou invalide", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            401: { description: "Token manquant ou invalide",           content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ── Leaderboard ─────────────────────────────────────────────────────────
      "/api/leaderboard": {
        get: {
          tags: ["Leaderboard"],
          summary: "Classement des participants par XP (top 50)",
          description:
            "Route publique. Si un token Bearer valide est fourni, `currentUserRank` indique la position exacte de l'utilisateur connecté (même hors top 50).",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Classement",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      leaderboard: {
                        type: "array",
                        items: { $ref: "#/components/schemas/LeaderboardEntry" },
                      },
                      currentUserRank: {
                        type: "integer",
                        nullable: true,
                        example: 5,
                        description: "Position de l'utilisateur connecté, null si non connecté",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
