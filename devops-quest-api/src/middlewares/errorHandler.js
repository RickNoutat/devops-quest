/**
 * Middleware de gestion d'erreurs centralisé
 * Attrape toutes les erreurs passées via next(err)
 *
 */

function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = err.message || "Erreur interne du serveur";

  console.error(`[${status}] ${message}`);

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
