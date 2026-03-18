import * as DiceRollModel from "./diceRoll.model.js";

/* ROLL DICE */

export const rollDiceController = async (req, res, next) => {
  try {
    const { worldId } = req.params;
    const { diceType, characterId } = req.body;
 
    const diceRoll = await DiceRollModel.createDiceRoll({
      worldId,
      userId: req.userId,
      diceType,
      characterId,
    });
 
    return res.status(201).json(diceRoll);
  } catch (error) {
    next(error);
  }
};

/* GET DICE ROLL HISTORY */
 
export const getDiceRollHistoryController = async (req, res, next) => {
  try {
    const { worldId } = req.params;
 
    const history = await DiceRollModel.getDiceRollsByWorld({ worldId });
 
    return res.json(history);
  } catch (error) {
    next(error);
  }
};