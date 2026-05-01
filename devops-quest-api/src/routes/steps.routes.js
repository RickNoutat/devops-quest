/**
 * Routes /api/steps
 */
const { Router } = require("express");
const stepsController = require("../controllers/steps.controller");
const router = Router();
router.get("/", stepsController.getAll);
module.exports = router;
