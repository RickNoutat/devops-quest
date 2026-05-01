/**
 * Routes /api/stats
 */
const { Router } = require("express");
const statsController = require("../controllers/stats.controller");
const router = Router();
router.get("/", statsController.getStats);
module.exports = router;
