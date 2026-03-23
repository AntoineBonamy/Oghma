import { getWorldMembers, removeWorldMember } from "./worldMember.model.js";
import { prisma } from "../../lib/prismaClient.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";

export const getWorldMembersController = async (req, res, next) => {
  try {
    const members = await getWorldMembers(req.params.worldId);

    return res.json(members);
  } catch (error) {
    next(error);
  }
};


export const removeMemberController = async (req, res, next) => {
  try {
    const { worldId, userId } = req.params;

    // Empêcher le MJ de se supprimer lui-même
    if (userId === req.userId)
      throw new BadRequestError("Vous ne pouvez pas vous retirer vous-même.");

    // Vérifier que le membre existe
    const member = await prisma.worldMember.findUnique({
      where: { worldId_userId: { worldId, userId } },
    });

    if (!member) throw new NotFoundError("Membre introuvable.");

    await removeWorldMember(worldId, userId);

    return res.json({ message: "Membre retiré du monde." });
  } catch (error) {
    next(error);
  }
};