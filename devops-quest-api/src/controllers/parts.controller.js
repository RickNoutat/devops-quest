/**
 * Controller Parts — Logique métier des parties du TP
 */

const tpParts = require("../data");

/** GET /api/parts — Sommaire des parties */
exports.getAll = (req, res) => {
  const summary = tpParts.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    icon: p.icon,
    color: p.color,
    totalXP: p.totalXP,
    stepsCount: p.steps.length,
  }));
  res.json(summary);
};

/** GET /api/parts/:partId — Détail d'une partie */
exports.getById = (req, res, next) => {
  const part = tpParts.find((p) => p.id === req.params.partId);
  if (!part) {
    const err = new Error("Partie non trouvée");
    err.status = 404;
    return next(err);
  }
  res.json(part);
};

/** GET /api/parts/:partId/steps/:stepId — Détail d'une étape */
exports.getStep = (req, res, next) => {
  const part = tpParts.find((p) => p.id === req.params.partId);
  if (!part) {
    const err = new Error("Partie non trouvée");
    err.status = 404;
    return next(err);
  }
  const step = part.steps.find((s) => s.id === req.params.stepId);
  if (!step) {
    const err = new Error("Étape non trouvée");
    err.status = 404;
    return next(err);
  }
  res.json(step);
};
