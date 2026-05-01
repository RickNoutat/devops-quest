/**
 * Controller Leaderboard — Classement des participants par XP
 */

const db = require("../database/db");

/** GET /api/leaderboard
 * Retourne le top 50 des utilisateurs triés par XP total décroissant.
 * Inclut la position du user connecté si un token valide est fourni (optionnel).
 */
exports.getLeaderboard = (req, res) => {
  const rows = db
    .prepare(`
      SELECT
        u.id,
        u.username,
        COALESCE(SUM(p.xp), 0)   AS total_xp,
        COALESCE(COUNT(p.step_id), 0) AS completed_steps
      FROM users u
      LEFT JOIN progress p ON p.user_id = u.id
      GROUP BY u.id
      ORDER BY total_xp DESC, completed_steps DESC, u.username ASC
      LIMIT 50
    `)
    .all();

  const leaderboard = rows.map((row, index) => ({
    rank: index + 1,
    id: row.id,
    username: row.username,
    totalXp: row.total_xp,
    completedSteps: row.completed_steps,
  }));

  // Position du user connecté (peut dépasser le top 50)
  let currentUserRank = null;
  if (req.user) {
    const rankRow = db
      .prepare(`
        SELECT rank FROM (
          SELECT
            u.id,
            ROW_NUMBER() OVER (
              ORDER BY COALESCE(SUM(p.xp), 0) DESC,
                       COALESCE(COUNT(p.step_id), 0) DESC,
                       u.username ASC
            ) AS rank
          FROM users u
          LEFT JOIN progress p ON p.user_id = u.id
          GROUP BY u.id
        )
        WHERE id = ?
      `)
      .get(req.user.id);

    currentUserRank = rankRow ? rankRow.rank : null;
  }

  res.json({ leaderboard, currentUserRank });
};
