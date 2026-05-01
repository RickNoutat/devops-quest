/**
 * Tests d'intégration — GET /api/progress, POST /api/progress/sync
 *
 * Vérifie l'authentification requise et la persistance correcte de la progression.
 */

const request = require("supertest");
const app = require("../../src/app");
const db = require("../../src/database/db");

let token;
let token2;

beforeEach(async () => {
  db.prepare("DELETE FROM progress").run();
  db.prepare("DELETE FROM users").run();

  const r1 = await request(app).post("/api/auth/register").send({ username: "alice", email: "alice@test.com", password: "secret123" });
  token = r1.body.token;

  const r2 = await request(app).post("/api/auth/register").send({ username: "bob", email: "bob@test.com", password: "secret123" });
  token2 = r2.body.token;
});

// ── GET /api/progress ─────────────────────────────────────────────────────────

describe("GET /api/progress", () => {
  test("401 sans token", async () => {
    const res = await request(app).get("/api/progress");
    expect(res.status).toBe(401);
  });

  test("200 retourne [] si aucune progression", async () => {
    const res = await request(app).get("/api/progress").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ completedSteps: [] });
  });

  test("retourne uniquement la progression du user connecté", async () => {
    await request(app).post("/api/progress/sync").set("Authorization", `Bearer ${token}`).send({ completedSteps: ["1-1", "1-2"] });
    await request(app).post("/api/progress/sync").set("Authorization", `Bearer ${token2}`).send({ completedSteps: ["1-3"] });

    const res = await request(app).get("/api/progress").set("Authorization", `Bearer ${token}`);
    expect(res.body.completedSteps).toHaveLength(2);
    expect(res.body.completedSteps).toContain("1-1");
    expect(res.body.completedSteps).not.toContain("1-3");
  });
});

// ── POST /api/progress/sync ───────────────────────────────────────────────────

describe("POST /api/progress/sync", () => {
  test("401 sans token", async () => {
    const res = await request(app).post("/api/progress/sync").send({ completedSteps: ["1-1"] });
    expect(res.status).toBe(401);
  });

  test("400 si completedSteps est absent", async () => {
    const res = await request(app).post("/api/progress/sync").set("Authorization", `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });

  test("200 sync réussie avec les steps fournis", async () => {
    const res = await request(app).post("/api/progress/sync").set("Authorization", `Bearer ${token}`).send({ completedSteps: ["1-1", "1-2"] });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, saved: 2 });
  });

  test("sync remplace la progression précédente (idempotent)", async () => {
    await request(app).post("/api/progress/sync").set("Authorization", `Bearer ${token}`).send({ completedSteps: ["1-1", "1-2", "1-3"] });
    await request(app).post("/api/progress/sync").set("Authorization", `Bearer ${token}`).send({ completedSteps: ["1-1"] });

    const res = await request(app).get("/api/progress").set("Authorization", `Bearer ${token}`);
    expect(res.body.completedSteps).toEqual(["1-1"]);
  });

  test("round-trip sync → get retourne les mêmes steps", async () => {
    const steps = ["1-1", "1-2", "2-1"];
    await request(app).post("/api/progress/sync").set("Authorization", `Bearer ${token}`).send({ completedSteps: steps });

    const res = await request(app).get("/api/progress").set("Authorization", `Bearer ${token}`);
    expect(res.body.completedSteps.sort()).toEqual(steps.sort());
  });
});
