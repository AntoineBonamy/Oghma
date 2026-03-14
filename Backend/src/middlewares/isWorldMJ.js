import { prisma } from "../lib/prismaClient.js";
import { ForbiddenError } from "../lib/errors.js";

export const isWorldMJ = async (req, res, next) => {
  try {
    const { worldId } = req.params;

    const membership = await prisma.worldMember.findUnique({
      where: {
        worldId_userId: {
          worldId,
          userId: req.userId,
        },
      },
    });

    if (!membership || membership.role !== "MJ") throw new ForbiddenError("Réservé au Maître du Jeu.");

    req.membership = membership;
    next();
  } catch (error) {
    next();
  }
};
