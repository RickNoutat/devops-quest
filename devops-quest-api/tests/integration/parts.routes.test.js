/**
 * Tests d'intégration — GET /api/parts, GET /api/parts/:id, GET /api/stats, GET /api/health
 *
 * Vérifie que les routes existantes (données statiques) répondent correctement.
 */

const request = require("supertest");
const app = require("../../src/app");
const tpParts = require("../../src/data");

// ── GET /api/health ───────────────────────────────────────────────────────────

describe("GET /api/health", () => {
  test("200 avec status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });
});

// ── GET /api/parts ────────────────────────────────────────────────────────────

describe("GET /api/parts", () => {
  test("200 retourne un tableau de parties", async () => {
    const res = await request(app).get("/api/parts");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(tpParts.length);
  });

  test("chaque partie a id et title", async () => {
    const res = await request(app).get("/api/parts");
    res.body.forEach((part) => {
      expect(part).toHaveProperty("id");
      expect(part).toHaveProperty("title");
    });
  });
});

// ── GET /api/parts/:id ────────────────────────────────────────────────────────

describe("GET /api/parts/:id", () => {
  test("200 retourne la partie avec ses steps", async () => {
    const res = await request(app).get("/api/parts/part1");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("steps");
    expect(Array.isArray(res.body.steps)).toBe(true);
    expect(res.body.steps.length).toBeGreaterThan(0);
  });

  test("chaque step a id, title, xp, difficulty", async () => {
    const res = await request(app).get("/api/parts/part1");
    res.body.steps.forEach((step) => {
      expect(step).toHaveProperty("id");
      expect(step).toHaveProperty("title");
      expect(step).toHaveProperty("xp");
      expect(step).toHaveProperty("difficulty");
    });
  });

  test("404 pour un id inexistant", async () => {
    const res = await request(app).get("/api/parts/inexistant");
    expect(res.status).toBe(404);
  });
});

// ── GET /api/stats ────────────────────────────────────────────────────────────

describe("GET /api/stats", () => {
  test("200 retourne totalParts, totalSteps, totalXP, byDifficulty", async () => {
    const res = await request(app).get("/api/stats");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalParts");
    expect(res.body).toHaveProperty("totalSteps");
    expect(res.body).toHaveProperty("totalXP");
    expect(res.body).toHaveProperty("byDifficulty");
  });

  test("totalParts correspond au nombre de parties réelles", async () => {
    const res = await request(app).get("/api/stats");
    expect(res.body.totalParts).toBe(tpParts.length);
  });

  test("la somme byDifficulty = totalSteps", async () => {
    const res = await request(app).get("/api/stats");
    const { easy, medium, hard } = res.body.byDifficulty;
    expect(easy + medium + hard).toBe(res.body.totalSteps);
  });
});
