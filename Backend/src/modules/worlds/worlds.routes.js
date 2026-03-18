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
router.get("/:worldId", authenticate, getWorldByIdController);
router.patch("/:worldId", authenticate, isWorldOwner, updateWorldController);
router.delete("/:worldId", authenticate, isWorldOwner, deleteWorldController);

export default router;