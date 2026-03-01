import express from "express";
import {
  createWorldController,
  getUserWorldsController,
  getWorldByIdController,
  updateWorldController,
  deleteWorldController,
} from "./worlds.controller.js";

import authenticate from "../../middlewares/authenticate.js";
import { isWorldOwner } from "../../middlewares/isWorldOwner.js";

const router = express.Router();

router.post("/", authenticate, createWorldController);
router.get("/", authenticate, getUserWorldsController);
router.get("/:id", authenticate, getWorldByIdController);
router.patch("/:id", authenticate, isWorldOwner, updateWorldController);
router.delete("/:id", authenticate, isWorldOwner, deleteWorldController);

export default router;