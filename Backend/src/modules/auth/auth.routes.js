import express from "express";
import * as authController from "./auth.controller.js";
import authenticate from "../../middlewares/authenticate.js";

const router = express.Router();

// PUBLIC
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);

// PROTECTED
router.get("/all", authenticate, authController.getAllUsers);
router.get("/me", authenticate, authController.me);
router.post("/logout", authenticate, authController.logout);
router.delete("/delete", authenticate, authController.deleteMe);

export default router;