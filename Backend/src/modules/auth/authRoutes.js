import express from "express";
import * as authController from "./authController.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/all", authController.getAllUsers);

export default router;