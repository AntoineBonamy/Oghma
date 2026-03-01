import { prisma } from "../lib/prismaClient.js";

export const isWorldOwner = async (req, res, next) => {
  try {
    const { id: worldId } = req.params;
    const userId = req.userId;

    const world = await prisma.world.findFirst({
      where: {
        id: worldId,
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (!world) {
      return res.status(404).json({
        message: "Monde non trouvé ou accès non autorisé",
      });
    }

    req.world = world; // utile pour les controllers
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
    });
  }
};
