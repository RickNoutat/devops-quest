/**
 * Routes /api/leaderboard
 */

const { Router } = require("express");
const leaderboardController = require("../controllers/leaderboard.controller");
const jwt = require("jsonwebtoken");

const router = Router();

// Middleware optionnel : attache req.user si un token valide est présent
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    } catch {
      // token invalide → on ignore, pas d'erreur
    }
  }
  next();
}

router.get("/", optionalAuth, leaderboardController.getLeaderboard);

module.exports = router;
