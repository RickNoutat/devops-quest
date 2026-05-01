/**
 * Tests unitaires — stats.controller
 *
 * Couvre :
 *  - totalParts, totalSteps, totalXP corrects
 *  - byDifficulty compte les bonnes catégories
 *  - la somme des difficultés = totalSteps
 */

const statsController = require("../../src/controllers/stats.controller");
const tpParts = require("../../src/data");

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("getStats", () => {
  let payload;

  beforeAll(() => {
    const res = mockRes();
    statsController.getStats({}, res);
    payload = res.json.mock.calls[0][0];
  });

  test("totalParts correspond au nombre de parties dans les données", () => {
    expect(payload.totalParts).toBe(tpParts.length);
  });

  test("totalSteps correspond au nombre total d'étapes", () => {
    const expected = tpParts.flatMap((p) => p.steps).length;
    expect(payload.totalSteps).toBe(expected);
  });

  test("totalXP est la somme des XP de toutes les étapes", () => {
    const expected = tpParts.flatMap((p) => p.steps).reduce((acc, s) => acc + s.xp, 0);
    expect(payload.totalXP).toBe(expected);
  });

  test("byDifficulty contient les clés easy, medium, hard", () => {
    expect(payload.byDifficulty).toHaveProperty("easy");
    expect(payload.byDifficulty).toHaveProperty("medium");
    expect(payload.byDifficulty).toHaveProperty("hard");
  });

  test("la somme des difficultés est égale à totalSteps", () => {
    const { easy, medium, hard } = payload.byDifficulty;
    expect(easy + medium + hard).toBe(payload.totalSteps);
  });

  test("les comptes de difficulté sont des entiers non négatifs", () => {
    const { easy, medium, hard } = payload.byDifficulty;
    expect(easy).toBeGreaterThanOrEqual(0);
    expect(medium).toBeGreaterThanOrEqual(0);
    expect(hard).toBeGreaterThanOrEqual(0);
  });
});
