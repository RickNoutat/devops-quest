/**
 * Tests unitaires — auth.controller
 *
 * Couvre :
 *  - register : champs manquants, validation longueur, doublon, succès
 *  - login    : champs manquants, email inconnu, mauvais mdp, succès + token 7j
 *  - me       : utilisateur inexistant, succès
 */

const authController = require("../../src/controllers/auth.controller");
const db = require("../../src/database/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ── Helpers ──────────────────────────────────────────────────────────────────

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

function createUser(username = "alice", email = "alice@test.com", password = "secret123") {
  const hash = bcrypt.hashSync(password, 1);
  const r = db.prepare("INSERT INTO users (username, email, password_hash) VALUES (?,?,?)").run(username, email, hash);
  return { id: r.lastInsertRowid, username, email };
}

beforeEach(() => {
  db.prepare("DELETE FROM progress").run();
  db.prepare("DELETE FROM users").run();
});

// ── register ─────────────────────────────────────────────────────────────────

describe("register", () => {
  test("400 si body vide", () => {
    const req = { body: {} };
    const res = mockRes();
    authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  test("400 si username trop court (< 3 chars)", () => {
    const req = { body: { username: "ab", email: "x@x.com", password: "123456" } };
    const res = mockRes();
    authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("400 si password trop court (< 6 chars)", () => {
    const req = { body: { username: "validuser", email: "x@x.com", password: "123" } };
    const res = mockRes();
    authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("409 si username déjà pris", () => {
    createUser("alice", "alice@test.com");
    const req = { body: { username: "alice", email: "other@test.com", password: "secret123" } };
    const res = mockRes();
    authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("409 si email déjà pris", () => {
    createUser("alice", "alice@test.com");
    const req = { body: { username: "bob", email: "alice@test.com", password: "secret123" } };
    const res = mockRes();
    authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("201 avec token JWT et user en cas de succès", () => {
    const req = { body: { username: "alice", email: "alice@test.com", password: "secret123" } };
    const res = mockRes();
    authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const payload = res.json.mock.calls[0][0];
    expect(payload).toHaveProperty("token");
    expect(payload.user).toMatchObject({ username: "alice", email: "alice@test.com" });
  });

  test("le token JWT est valide et contient les bonnes données", () => {
    const req = { body: { username: "alice", email: "alice@test.com", password: "secret123" } };
    const res = mockRes();
    authController.register(req, res);
    const { token } = res.json.mock.calls[0][0];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded).toMatchObject({ username: "alice", email: "alice@test.com" });
    expect(decoded).toHaveProperty("id");
  });
});

// ── login ─────────────────────────────────────────────────────────────────────

describe("login", () => {
  test("400 si body vide", () => {
    const req = { body: {} };
    const res = mockRes();
    authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("401 si email inconnu", () => {
    const req = { body: { email: "unknown@test.com", password: "secret123" } };
    const res = mockRes();
    authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("401 si mauvais mot de passe", () => {
    createUser("alice", "alice@test.com", "secret123");
    const req = { body: { email: "alice@test.com", password: "wrongpassword" } };
    const res = mockRes();
    authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("200 avec token JWT valide en cas de succès", () => {
    createUser("alice", "alice@test.com", "secret123");
    const req = { body: { email: "alice@test.com", password: "secret123" } };
    const res = mockRes();
    authController.login(req, res);
    expect(res.status).not.toHaveBeenCalledWith(401);
    const payload = res.json.mock.calls[0][0];
    expect(payload).toHaveProperty("token");
    expect(payload.user).toMatchObject({ username: "alice" });
  });

  test("le token expire dans 7 jours (±1 min)", () => {
    createUser("alice", "alice@test.com", "secret123");
    const req = { body: { email: "alice@test.com", password: "secret123" } };
    const res = mockRes();
    authController.login(req, res);
    const { token } = res.json.mock.calls[0][0];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const expectedExp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
    expect(decoded.exp).toBeGreaterThan(expectedExp - 60);
    expect(decoded.exp).toBeLessThan(expectedExp + 60);
  });
});

// ── me ────────────────────────────────────────────────────────────────────────

describe("me", () => {
  test("404 si utilisateur introuvable en base", () => {
    const req = { user: { id: 9999 } };
    const res = mockRes();
    authController.me(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("200 retourne les infos de l'utilisateur", () => {
    const user = createUser();
    const req = { user: { id: user.id } };
    const res = mockRes();
    authController.me(req, res);
    const payload = res.json.mock.calls[0][0];
    expect(payload).toMatchObject({ username: "alice", email: "alice@test.com" });
    expect(payload).not.toHaveProperty("password_hash");
  });
});
