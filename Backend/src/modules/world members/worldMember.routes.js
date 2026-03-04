import express from "express";

import { getWorldMembersController } from "./worldMember.controller.js";

import authenticate from "../../middlewares/authenticate.js";
import { isWorldMember } from "../../middlewares/isWorldMember.js";

const router = express.Router();

router.get("/:worldId/members", authenticate, isWorldMember, getWorldMembersController);

export default router;