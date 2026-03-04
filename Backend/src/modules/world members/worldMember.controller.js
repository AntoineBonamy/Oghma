import { getWorldMembers } from "./worldMember.model.js";

export const getWorldMembersController = async (req, res) => {
  try {
    const { worldId } = req.params;

    const members = await getWorldMembers(worldId);

    return res.json(members);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la récupération des membres",
    });
  }
};
