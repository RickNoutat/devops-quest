/**
 * Tests d'intégration — GET /api/leaderboard
 *
 * Vérifie l'accès public, le tri, et la détection du user connecté.
 */

const request = require("supertest");
const app = require("../../src/app");
const db = require("../../src/database/db");

async function registerAndSync(username, email, steps) {
  const r = await request(app).post("/api/auth/register").send({ username, email, password: "secret123" });
  const { token } = r.body;
  await request(app).post("/api/progress/sync").set("Authorization", `Bearer ${token}`).send({ completedSteps: steps });
  return token;
}

beforeEach(() => {
  db.prepare("DELETE FROM progress").run();
  db.prepare("DELETE FROM users").run();
});

describe("GET /api/leaderboard", () => {
  test("200 accessible sans token (public)", async () => {
    const res = await request(app).get("/api/leaderboard");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("leaderboard");
    expect(res.body).toHaveProperty("currentUserRank");
  });

  test("leaderboard vide si aucun utilisateur inscrit", async () => {
    const res = await request(app).get("/api/leaderboard");
    expect(res.body.leaderboard).toHaveLength(0);
    expect(res.body.currentUserRank).toBeNull();
  });

  test("les entrées ont les champs rank, username, totalXp, completedSteps", async () => {
    await registerAndSync("alice", "alice@test.com", ["1-1"]);
    const res = await request(app).get("/api/leaderboard");
    const entry = res.body.leaderboard[0];
    expect(entry).toHaveProperty("rank");
    expect(entry).toHaveProperty("username");
    expect(entry).toHaveProperty("totalXp");
    expect(entry).toHaveProperty("completedSteps");
  });

  test("ordre décroissant par XP", async () => {
    const tokenA = await registerAndSync("alice", "alice@test.com", ["1-1"]);           // ~50 xp
    const tokenB = await registerAndSync("bob", "bob@test.com", ["1-1", "1-2", "1-3"]); // plus de xp

    const res = await request(app).get("/api/leaderboard");
    expect(res.body.leaderboard[0].username).toBe("bob");
    expect(res.body.leaderboard[1].username).toBe("alice");
    // bob doit avoir plus de XP
    expect(res.body.leaderboard[0].totalXp).toBeGreaterThan(res.body.leaderboard[1].totalXp);
  });

  test("currentUserRank est null si non authentifié", async () => {
    await registerAndSync("alice", "alice@test.com", ["1-1"]);
    const res = await request(app).get("/api/leaderboard");
    expect(res.body.currentUserRank).toBeNull();
  });

  test("currentUserRank retourne la position du user connecté", async () => {
    await registerAndSync("alice", "alice@test.com", ["1-1", "1-2", "1-3"]);
    const tokenBob = await registerAndSync("bob", "bob@test.com", ["1-1"]);

    const res = await request(app).get("/api/leaderboard").set("Authorization", `Bearer ${tokenBob}`);
    expect(res.body.currentUserRank).toBe(2);
  });

  test("ignore un token invalide sans renvoyer d'erreur (auth optionnelle)", async () => {
    const res = await request(app).get("/api/leaderboard").set("Authorization", "Bearer token-bidon");
    expect(res.status).toBe(200);
    expect(res.body.currentUserRank).toBeNull();
  });
});
