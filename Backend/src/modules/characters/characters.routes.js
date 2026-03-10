import express from "express";

import * as CharacterController from "./characters.controller.js";

import authenticate from "../../middlewares/authenticate.js";
import { isWorldMember } from "../../middlewares/isWorldMember.js";

const router = express.Router();

// TEMPLATE CHARACTER

router.post(
  "/characters",
  authenticate,
  CharacterController.createCharacterTemplateController,
);
router.get(
  "/characters",
  authenticate,
  CharacterController.getUserCharacterTemplatesController,
);
router.get(
  "/characters/:id",
  authenticate,
  CharacterController.getCharacterTemplateController,
);
router.patch(
  "/characters/:id",
  authenticate,
  CharacterController.updateCharacterTemplateController,
);
router.delete(
  "/characters/:id",
  authenticate,
  CharacterController.deleteCharacterTemplateController,
);

// WORLD CHARACTER

router.post(
  "/worlds/:worldId/characters",
  authenticate,
  isWorldMember,
  CharacterController.addCharacterToWorldController,
);
router.get(
  "/worlds/:worldId/characters",
  authenticate,
  isWorldMember,
  CharacterController.getWorldCharactersController,
);
router.get(
  "/worlds/:worldId/characters/:characterId",
  authenticate,
  isWorldMember,
  CharacterController.getWorldCharacterController,
);
router.patch(
  "/worlds/:worldId/characters/:characterId",
  authenticate,
  isWorldMember,
  CharacterController.updateWorldCharacterController,
);
router.delete(
  "/worlds/:worldId/characters/:characterId",
  authenticate,
  isWorldMember,
  CharacterController.deleteWorldCharacterController,
);

export default router;
