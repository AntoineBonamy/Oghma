import express from "express";
import * as CampaignController from "./campaign.controller.js";

import authenticate from "../../middlewares/authenticate.js";

import { isWorldOwner } from "../../middlewares/isWorldOwner.js";
import { isWorldMJ } from "../../middlewares/isWorldMJ.js";
import { isWorldMember } from "../../middlewares/isWorldMember.js";

const router = express.Router();

router.post("/:worldId/campaigns", authenticate, isWorldOwner, CampaignController.createCampaignController);
router.get("/:worldId/campaigns", authenticate, isWorldMember, CampaignController.getCampaignsController);
router.get("/:worldId/campaign/:campaignId", authenticate, isWorldMember, CampaignController.getCampaignController);
router.get("/:worldId/campaigns/active", authenticate, isWorldMember, CampaignController.getActiveCampaignController);
router.patch("/:worldId/campaigns/:campaignId", authenticate, isWorldMJ, CampaignController.updateCampaignController);
router.patch("/:worldId/campaigns/:campaignId/activate", authenticate, isWorldMJ, CampaignController.activateCampaignController);
router.delete("/:worldId/campaigns/:campaignId", authenticate, isWorldOwner, CampaignController.deleteCampaignController);

export default router;