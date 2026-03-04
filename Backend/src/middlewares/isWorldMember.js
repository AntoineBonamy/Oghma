import { prisma } from "../lib/prismaClient.js";

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

    if (!membership) {
      return res.status(403).json({
        message: "Accès interdit",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Erreur de vérification des permissions",
    });
  }
};
