/**
 * Controller Stats — Statistiques globales
 */

const tpParts = require("../data");

/** GET /api/stats */
exports.getStats = (req, res) => {
  const all = tpParts.flatMap((p) => p.steps);
  res.json({
    totalParts: tpParts.length,
    totalSteps: all.length,
    totalXP: all.reduce((a, s) => a + s.xp, 0),
    byDifficulty: {
      easy: all.filter((s) => s.difficulty === "easy").length,
      medium: all.filter((s) => s.difficulty === "medium").length,
      hard: all.filter((s) => s.difficulty === "hard").length,
    },
  });
};
