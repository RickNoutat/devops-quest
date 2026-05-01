/**
 * Tests unitaires — progress.controller
 *
 * Couvre :
 *  - syncProgress : body invalide, sync vide, sync avec steps valides et invalides
 *  - getProgress  : retourne [] si aucune progression, retourne les step_ids sauvegardés
 */

const progressController = require("../../src/controllers/progress.controller");
const db = require("../../src/database/db");
const bcrypt = require("bcryptjs");

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

function createUser(username = "alice", email = "alice@test.com") {
  const hash = bcrypt.hashSync("secret123", 1);
  const r = db.prepare("INSERT INTO users (username, email, password_hash) VALUES (?,?,?)").run(username, email, hash);
  return { id: r.lastInsertRowid, username, email };
}

beforeEach(() => {
  db.prepare("DELETE FROM progress").run();
  db.prepare("DELETE FROM users").run();
});

// ── syncProgress ──────────────────────────────────────────────────────────────

describe("syncProgress", () => {
  test("400 si completedSteps absent du body", () => {
    const user = createUser();
    const req = { user: { id: user.id }, body: {} };
    const res = mockRes();
    progressController.syncProgress(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("400 si completedSteps n'est pas un tableau", () => {
    const user = createUser();
    const req = { user: { id: user.id }, body: { completedSteps: "1-1" } };
    const res = mockRes();
    progressController.syncProgress(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("200 avec tableau vide — efface la progression", () => {
    const user = createUser();
    // Insérer une progression existante
    db.prepare("INSERT INTO progress (user_id, step_id, xp) VALUES (?,?,?)").run(user.id, "1-1", 50);

    const req = { user: { id: user.id }, body: { completedSteps: [] } };
    const res = mockRes();
    progressController.syncProgress(req, res);
    expect(res.json).toHaveBeenCalledWith({ ok: true, saved: 0 });

    const rows = db.prepare("SELECT * FROM progress WHERE user_id = ?").all(user.id);
    expect(rows).toHaveLength(0);
  });

  test("200 sauvegarde les steps valides avec le bon XP", () => {
    const user = createUser();
    const req = { user: { id: user.id }, body: { completedSteps: ["1-1", "1-2"] } };
    const res = mockRes();
    progressController.syncProgress(req, res);
    expect(res.json).toHaveBeenCalledWith({ ok: true, saved: 2 });

    const rows = db.prepare("SELECT step_id, xp FROM progress WHERE user_id = ? ORDER BY step_id").all(user.id);
    expect(rows).toHaveLength(2);
    expect(rows[0].step_id).toBe("1-1");
    expect(rows[0].xp).toBeGreaterThan(0); // XP vient des données statiques
  });

  test("les steps inconnues ont un XP de 0", () => {
    const user = createUser();
    const req = { user: { id: user.id }, body: { completedSteps: ["step-inexistant"] } };
    const res = mockRes();
    progressController.syncProgress(req, res);
    const row = db.prepare("SELECT xp FROM progress WHERE user_id = ? AND step_id = ?").get(user.id, "step-inexistant");
    expect(row.xp).toBe(0);
  });

  test("sync remplace complètement l'ancienne progression", () => {
    const user = createUser();
    // Sync initial
    progressController.syncProgress({ user: { id: user.id }, body: { completedSteps: ["1-1", "1-2", "1-3"] } }, mockRes());
    // Nouveau sync avec moins de steps
    const req = { user: { id: user.id }, body: { completedSteps: ["1-1"] } };
    const res = mockRes();
    progressController.syncProgress(req, res);
    const rows = db.prepare("SELECT * FROM progress WHERE user_id = ?").all(user.id);
    expect(rows).toHaveLength(1);
    expect(rows[0].step_id).toBe("1-1");
  });
});

// ── getProgress ───────────────────────────────────────────────────────────────

describe("getProgress", () => {
  test("retourne un tableau vide si aucune progression", () => {
    const user = createUser();
    const req = { user: { id: user.id } };
    const res = mockRes();
    progressController.getProgress(req, res);
    expect(res.json).toHaveBeenCalledWith({ completedSteps: [] });
  });

  test("retourne les step_ids sauvegardés pour l'utilisateur", () => {
    const user = createUser();
    db.prepare("INSERT INTO progress (user_id, step_id, xp) VALUES (?,?,?)").run(user.id, "1-1", 50);
    db.prepare("INSERT INTO progress (user_id, step_id, xp) VALUES (?,?,?)").run(user.id, "1-2", 75);

    const req = { user: { id: user.id } };
    const res = mockRes();
    progressController.getProgress(req, res);
    const { completedSteps } = res.json.mock.calls[0][0];
    expect(completedSteps).toHaveLength(2);
    expect(completedSteps).toContain("1-1");
    expect(completedSteps).toContain("1-2");
  });

  test("ne retourne que la progression de l'utilisateur connecté", () => {
    const alice = createUser("alice", "alice@test.com");
    const bob = createUser("bob", "bob@test.com");
    db.prepare("INSERT INTO progress (user_id, step_id, xp) VALUES (?,?,?)").run(alice.id, "1-1", 50);
    db.prepare("INSERT INTO progress (user_id, step_id, xp) VALUES (?,?,?)").run(bob.id, "1-2", 75);

    const req = { user: { id: alice.id } };
    const res = mockRes();
    progressController.getProgress(req, res);
    const { completedSteps } = res.json.mock.calls[0][0];
    expect(completedSteps).toEqual(["1-1"]);
  });
});
