/**
 * Middleware CORS — Autorise uniquement le frontend de Rick
 */

const cors = require("cors");

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:3000",
];

const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Bloqué par CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
});

module.exports = corsMiddleware;
