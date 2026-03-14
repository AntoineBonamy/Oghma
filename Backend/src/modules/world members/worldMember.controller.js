import { getWorldMembers } from "./worldMember.model.js";

export const getWorldMembersController = async (req, res, next) => {
  try {
    const members = await getWorldMembers(req.params.worldId);

    return res.json(members);
  } catch (error) {
    next(error);
  }
};
