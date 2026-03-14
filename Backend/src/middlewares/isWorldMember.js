import { prisma } from "../lib/prismaClient.js";
import { ForbiddenError } from "../lib/errors.js";

export const isWorldMember = async (req, res, next) => {
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

    if (!membership) throw new ForbiddenError("Accès interdit.");
    req.membership = membership;

    next();
  } catch (error) {
    next();
  }
};
