/**
 * Routes /api/auth
 */

const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const requireAuth = require("../middlewares/auth");

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", requireAuth, authController.me);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
