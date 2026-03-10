import { prisma } from "../lib/prismaClient.js";

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

    if (!membership || membership.role !== "MJ") {
      return res.status(403).json({
        message: "Permission MJ requise",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Erreur de permission",
    });
  }
};
