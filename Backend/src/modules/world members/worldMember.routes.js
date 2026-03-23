import express from "express";

import { getWorldMembersController, removeMemberController } from "./worldMember.controller.js";

import authenticate from "../../middlewares/authenticate.js";
import { isWorldMember } from "../../middlewares/isWorldMember.js";
import { isWorldOwner } from "../../middlewares/isWorldOwner.js";

const router = express.Router();

router.get("/:worldId/members", authenticate, isWorldMember, getWorldMembersController);
router.delete("/:worldId/members/:userId", authenticate, isWorldOwner, removeMemberController);

export default router;