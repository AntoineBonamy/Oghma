import express from "express";
 
import * as DiceRollController from "./diceRoll.controller.js";
 
import authenticate from "../../middlewares/authenticate.js";
import { isWorldMember } from "../../middlewares/isWorldMember.js";
 
const router = express.Router();
 
router.post("/:worldId/dice-rolls", authenticate, isWorldMember, DiceRollController.rollDiceController);
router.get("/:worldId/dice-rolls", authenticate, isWorldMember, DiceRollController.getDiceRollHistoryController);
 
export default router;
 