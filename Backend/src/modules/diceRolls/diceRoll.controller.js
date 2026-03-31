import * as DiceRollModel from "./diceRoll.model.js";
import { getIO } from "../../lib/socket.js";
import { sessionRoom } from "../../lib/sessionSocket.js";

////////////////////
// ROLL DICE
////////////////////

export const rollDiceController = async (req, res, next) => {
  try {
    const { worldId } = req.params;
    const { diceType, characterId, sessionId } = req.body;
 
    const diceRoll = await DiceRollModel.createDiceRoll({
      worldId,
      userId: req.userId,
      diceType,
      characterId,
      sessionId,
    });

    // Broadcast Socket.io uniquement si le lancer est lié à une session
    if (sessionId) {
      getIO()
        .to(sessionRoom(sessionId))
        .emit("session:dice_rolled", diceRoll);
    }
 
    return res.status(201).json(diceRoll);
  } catch (error) {
    next(error);
  }
};

////////////////////
// GET DICE ROLL HISTORY (par monde)
////////////////////
 
export const getDiceRollHistoryController = async (req, res, next) => {
  try {
    const { worldId } = req.params;
 
    const history = await DiceRollModel.getDiceRollsByWorld({ worldId });
 
    return res.json(history);
  } catch (error) {
    next(error);
  }
};