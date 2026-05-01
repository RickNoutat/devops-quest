/**
 * Tests unitaires — leaderboard.controller
 *
 * Couvre :
 *  - leaderboard vide, tri par XP, rang calculé, currentUserRank connecté/anonyme
 */

const leaderboardController = require("../../src/controllers/leaderboard.controller");
const db = require("../../src/database/db");
const bcrypt = require("bcryptjs");

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

function createUser(username, email) {
  const hash = bcrypt.hashSync("pass", 1);
  const r = db.prepare("INSERT INTO users (username, email, password_hash) VALUES (?,?,?)").run(username, email, hash);
  return r.lastInsertRowid;
}

function addProgress(userId, steps) {
  const insert = db.prepare("INSERT INTO progress (user_id, step_id, xp) VALUES (?,?,?)");
  steps.forEach(([stepId, xp]) => insert.run(userId, stepId, xp));
}

beforeEach(() => {
  db.prepare("DELETE FROM progress").run();
  db.prepare("DELETE FROM users").run();
});

// ── getLeaderboard ────────────────────────────────────────────────────────────

describe("getLeaderboard", () => {
  test("retourne un tableau vide si aucun utilisateur", () => {
    const req = { user: null };
    const res = mockRes();
    leaderboardController.getLeaderboard(req, res);
    const { leaderboard, currentUserRank } = res.json.mock.calls[0][0];
    expect(leaderboard).toHaveLength(0);
    expect(currentUserRank).toBeNull();
  });

  test("liste les utilisateurs avec rank, username, totalXp, completedSteps", () => {
    const id = createUser("alice", "alice@test.com");
    addProgress(id, [["1-1", 50], ["1-2", 75]]);

    const req = { user: null };
    const res = mockRes();
    leaderboardController.getLeaderboard(req, res);
    const { leaderboard } = res.json.mock.calls[0][0];
    expect(leaderboard[0]).toMatchObject({
      rank: 1,
      username: "alice",
      totalXp: 125,
      completedSteps: 2,
    });
  });

  test("tri par XP décroissant", () => {
    const idA = createUser("alice", "alice@test.com");
    const idB = createUser("bob", "bob@test.com");
    const idC = createUser("charlie", "charlie@test.com");
    addProgress(idA, [["1-1", 100]]);
    addProgress(idB, [["1-1", 300]]);
    addProgress(idC, [["1-1", 200]]);

    const req = { user: null };
    const res = mockRes();
    leaderboardController.getLeaderboard(req, res);
    const { leaderboard } = res.json.mock.calls[0][0];
    expect(leaderboard[0].username).toBe("bob");
    expect(leaderboard[1].username).toBe("charlie");
    expect(leaderboard[2].username).toBe("alice");
  });

  test("un utilisateur sans progression a totalXp=0", () => {
    createUser("ghost", "ghost@test.com");
    const req = { user: null };
    const res = mockRes();
    leaderboardController.getLeaderboard(req, res);
    const { leaderboard } = res.json.mock.calls[0][0];
    expect(leaderboard[0]).toMatchObject({ username: "ghost", totalXp: 0, completedSteps: 0 });
  });

  test("currentUserRank est null si non connecté", () => {
    createUser("alice", "alice@test.com");
    const req = { user: null };
    const res = mockRes();
    leaderboardController.getLeaderboard(req, res);
    expect(res.json.mock.calls[0][0].currentUserRank).toBeNull();
  });

  test("currentUserRank retourne le rang du user connecté", () => {
    const idA = createUser("alice", "alice@test.com");
    const idB = createUser("bob", "bob@test.com");
    addProgress(idA, [["1-1", 500]]);
    addProgress(idB, [["1-1", 100]]);

    const req = { user: { id: idB } };
    const res = mockRes();
    leaderboardController.getLeaderboard(req, res);
    expect(res.json.mock.calls[0][0].currentUserRank).toBe(2);
  });

  test("les rangs sont consécutifs et commencent à 1", () => {
    ["a", "b", "c"].forEach((name, i) => {
      const id = createUser(name, `${name}@test.com`);
      addProgress(id, [[`1-${i + 1}`, (3 - i) * 100]]);
    });

    const req = { user: null };
    const res = mockRes();
    leaderboardController.getLeaderboard(req, res);
    const ranks = res.json.mock.calls[0][0].leaderboard.map((e) => e.rank);
    expect(ranks).toEqual([1, 2, 3]);
  });
});
