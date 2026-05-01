/**
 * Routes /api/parts
 */

const { Router } = require("express");
const partsController = require("../controllers/parts.controller");

const router = Router();

router.get("/", partsController.getAll);
router.get("/:partId", partsController.getById);
router.get("/:partId/steps/:stepId", partsController.getStep);

module.exports = router;
