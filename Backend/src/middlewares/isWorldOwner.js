import { prisma } from "../lib/prismaClient.js";
import { NotFoundError } from "../lib/errors.js";

export const isWorldOwner = async (req, res, next) => {
  try {
    const { worldId } = req.params;

    const world = await prisma.world.findFirst({
      where: {
        id: worldId,
        ownerId: req.userId,
        deletedAt: null,
      },
    });

    if (!world)
      throw new NotFoundError("Monde non trouvé ou accès non autorisé.");

    req.world = world; // utile pour les controllers
    next();
  } catch (error) {
    next(error);
  }
};
