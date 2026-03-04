import express from "express";
import {
  sendInvitationController,
  getMyInvitationsController,
  acceptInvitationController,
  getWorldInvitationsController,
} from "./invitations.controller.js";

import authenticate from "../../middlewares/authenticate.js";
import { isWorldOwner } from "../../middlewares/isWorldOwner.js";

const router = express.Router();

router.post("/worlds/:worldId/invitations", authenticate, isWorldOwner, sendInvitationController);
router.get("/invitations/me", authenticate, getMyInvitationsController);
router.post("/invitations/:code/accept", authenticate, acceptInvitationController);
router.get("/worlds/:worldId/invitations", authenticate, isWorldOwner, getWorldInvitationsController);

export default router;