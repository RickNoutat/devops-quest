/**
 * Controller Progress — Sauvegarde et récupération de la progression utilisateur
 */

const db = require("../database/db");
const tpParts = require("../data");

// Construit un map stepId → xp depuis les données statiques
const stepXpMap = {};
tpParts.forEach((part) => {
  part.steps.forEach((step) => {
    stepXpMap[step.id] = step.xp || 0;
  });
});

/** POST /api/progress/sync
 * Body: { completedSteps: ["step-id-1", "step-id-2", ...] }
 * Remplace la progression complète de l'utilisateur connecté.
 */
exports.syncProgress = (req, res) => {
  const { completedSteps } = req.body || {};

  if (!Array.isArray(completedSteps)) {
    return res.status(400).json({ error: "completedSteps doit être un tableau" });
  }

  const userId = req.user.id;

  // Transaction : supprimer l'ancienne progression, insérer la nouvelle
  const sync = db.transaction((steps) => {
    db.prepare("DELETE FROM progress WHERE user_id = ?").run(userId);

    const insert = db.prepare(
      "INSERT INTO progress (user_id, step_id, xp) VALUES (?, ?, ?)"
    );
    steps.forEach((stepId) => {
      const xp = stepXpMap[stepId] ?? 0;
      insert.run(userId, stepId, xp);
    });
  });

  sync(completedSteps);
  res.json({ ok: true, saved: completedSteps.length });
};

/** GET /api/progress
 * Retourne les step_ids complétés par l'utilisateur connecté.
 */
exports.getProgress = (req, res) => {
  const rows = db
    .prepare("SELECT step_id FROM progress WHERE user_id = ?")
    .all(req.user.id);

  res.json({ completedSteps: rows.map((r) => r.step_id) });
};
