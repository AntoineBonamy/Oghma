import { prisma } from "../../lib/prismaClient.js";
import { BadRequestError } from "../../lib/errors.js";

////////////////////
// CONSTANTES
////////////////////
 
const VALID_DICE_TYPES = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];
 
////////////////////
// HELPERS
////////////////////
 
const parseDiceFaces = (diceType) => {
  return parseInt(diceType.slice(1), 10);
};
 
const rollDice = (faces) => {
  return Math.floor(Math.random() * faces) + 1;
};

////////////////////
// CREATE
////////////////////

export const createDiceRoll = async ({ worldId, userId, diceType, characterId }) => {
  if (!VALID_DICE_TYPES.includes(diceType)) {
    throw new BadRequestError(
      `Type de dé invalide. Valeurs acceptées : ${VALID_DICE_TYPES.join(", ")}.`
    );
  }
 
  const faces = parseDiceFaces(diceType);
  const result = rollDice(faces);
 
  return prisma.diceRoll.create({
    data: {
      worldId,
      userId,
      diceType,
      result,
      ...(characterId ? { characterId } : {}),
    },
    include: {
      user: {
        select: { id: true, username: true },
      },
      character: {
        select: { id: true, name: true },
      },
    },
  });
};

////////////////////
// GET HISTORY
////////////////////

export const getDiceRollsByWorld = async ({ worldId }) => {
  return prisma.diceRoll.findMany({
    where: { worldId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, username: true },
      },
      character: {
        select: { id: true, name: true },
      },
    },
  });
};