/**
 * Tests d'intégration — POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
 *
 * Utilise supertest pour simuler des requêtes HTTP complètes sur l'app Express.
 */

const request = require("supertest");
const app = require("../../src/app");
const db = require("../../src/database/db");

beforeEach(() => {
  db.prepare("DELETE FROM progress").run();
  db.prepare("DELETE FROM users").run();
});

// ── POST /api/auth/register ───────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  const valid = { username: "alice", email: "alice@test.com", password: "secret123" };

  test("201 + token + user en cas de succès", async () => {
    const res = await request(app).post("/api/auth/register").send(valid);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toMatchObject({ username: "alice", email: "alice@test.com" });
    expect(res.body.user).not.toHaveProperty("password_hash");
  });

  test("400 si email manquant", async () => {
    const res = await request(app).post("/api/auth/register").send({ username: "alice", password: "secret123" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("400 si password trop court", async () => {
    const res = await request(app).post("/api/auth/register").send({ username: "alice", email: "a@a.com", password: "123" });
    expect(res.status).toBe(400);
  });

  test("409 si username ou email déjà existant", async () => {
    await request(app).post("/api/auth/register").send(valid);
    const res = await request(app).post("/api/auth/register").send(valid);
    expect(res.status).toBe(409);
  });

  test("le mot de passe n'est jamais renvoyé dans la réponse", async () => {
    const res = await request(app).post("/api/auth/register").send(valid);
    expect(JSON.stringify(res.body)).not.toContain("secret123");
    expect(JSON.stringify(res.body)).not.toContain("password");
  });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({ username: "alice", email: "alice@test.com", password: "secret123" });
  });

  test("200 + token en cas de succès", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "alice@test.com", password: "secret123" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toMatchObject({ username: "alice" });
  });

  test("401 si email inconnu", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "nobody@test.com", password: "secret123" });
    expect(res.status).toBe(401);
  });

  test("401 si mauvais mot de passe", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "alice@test.com", password: "badpassword" });
    expect(res.status).toBe(401);
  });

  test("400 si body vide", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

describe("GET /api/auth/me", () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post("/api/auth/register").send({ username: "alice", email: "alice@test.com", password: "secret123" });
    token = res.body.token;
  });

  test("200 retourne le profil de l'utilisateur connecté", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ username: "alice", email: "alice@test.com" });
  });

  test("401 sans token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("401 avec token invalide", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer token-bidon");
    expect(res.status).toBe(401);
  });

  test("401 avec token mal formé (sans Bearer)", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", token);
    expect(res.status).toBe(401);
  });
});
