/**
 * Routes /api/progress
 */

const { Router } = require("express");
const progressController = require("../controllers/progress.controller");
const requireAuth = require("../middlewares/auth");

const router = Router();

router.get("/", requireAuth, progressController.getProgress);
router.post("/sync", requireAuth, progressController.syncProgress);

module.exports = router;
