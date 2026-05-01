/**
 * Configuration Express — middlewares globaux et montage des routes
 */

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const corsMiddleware = require("./middlewares/cors");
const errorHandler = require("./middlewares/errorHandler");
const partsRouter = require("./routes/parts.routes");
const stepsRouter = require("./routes/steps.routes");
const statsRouter = require("./routes/stats.routes");
const healthRouter = require("./routes/health.routes");
const authRouter = require("./routes/auth.routes");
const progressRouter = require("./routes/progress.routes");
const leaderboardRouter = require("./routes/leaderboard.routes");

const app = express();

// ── Middlewares ──────────────────────────────
app.use(corsMiddleware);
app.use(express.json());

// ── Swagger UI ───────────────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (req, res) => res.json(swaggerSpec));

// ── Routes ──────────────────────────────────
app.use("/api/parts", partsRouter);
app.use("/api/steps", stepsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/progress", progressRouter);
app.use("/api/leaderboard", leaderboardRouter);

// ── Error handler (toujours en dernier) ─────
app.use(errorHandler);

module.exports = app;
