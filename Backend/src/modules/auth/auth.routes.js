import express from "express";
import * as authController from "./auth.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = express.Router();

// PUBLIC
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);

// PROTECTED
router.get("/all", authMiddleware, authController.getAllUsers);
router.get("/me", authMiddleware, authController.me);
router.post("/logout", authMiddleware, authController.logout);

export default router;