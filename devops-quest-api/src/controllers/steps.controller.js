/**
 * Controller Steps — Liste complète des étapes
 */

const tpParts = require("../data");

/** GET /api/steps — Toutes les étapes (flat) */
exports.getAll = (req, res) => {
  const allSteps = tpParts.flatMap((p) =>
    p.steps.map((s) => ({ ...s, partId: p.id, partTitle: p.title }))
  );
  res.json(allSteps);
};
