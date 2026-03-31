import express from "express";
import * as GameSessionController from "./gameSession.controller.js";

import authenticate from "../../middlewares/authenticate.js";
import { isWorldMember } from "../../middlewares/isWorldMember.js";
import { isWorldMJ } from "../../middlewares/isWorldMJ.js";

const router = express.Router({ mergeParams: true });

// ── Routes imbriquées sous /worlds/:worldId/campaigns/:campaignId ──

// Ouvrir une session (MJ uniquement)
router.post(
  "/:worldId/campaigns/:campaignId/sessions",
  authenticate,
  isWorldMJ,
  GameSessionController.openSessionController
);

// Historique des sessions d'une campagne
router.get(
  "/:worldId/campaigns/:campaignId/sessions",
  authenticate,
  isWorldMember,
  GameSessionController.getSessionsByCampaignController
);

// Session ouverte en cours
router.get(
  "/:worldId/campaigns/:campaignId/sessions/open",
  authenticate,
  isWorldMember,
  GameSessionController.getOpenSessionController
);

// ── Routes directes sur la session (/sessions/:sessionId) ─────────

// Détail d'une session
router.get(
  "/sessions/:sessionId",
  authenticate,
  GameSessionController.getSessionController
);

// Fermer une session (MJ — vérification du monde via session → campaign → world faite dans le controller)
router.patch(
  "/sessions/:sessionId/close",
  authenticate,
  GameSessionController.closeSessionController
);

// Historique des événements d'une session
router.get(
  "/sessions/:sessionId/events",
  authenticate,
  GameSessionController.getSessionEventsController
);

export default router;