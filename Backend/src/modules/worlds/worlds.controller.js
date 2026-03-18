import {
  createWorld,
  findWorldsByUser,
  findWorldById,
  updateWorldById,
  deleteWorldById,
} from "./worlds.model.js";

import { NotFoundError } from "../../lib/errors.js";

/* CREATE */

export const createWorldController = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const world = await createWorld({
      name,
      description,
      ownerId: req.userId,
    });

    return res.status(201).json(world);
  } catch (error) {
    next(error);
  }
};

/* GET ALL USER WORLDS */

export const getUserWorldsController = async (req, res, next) => {
  try {
    const worlds = await findWorldsByUser(req.userId);
    return res.json(worlds);
  } catch (error) {
    next(error);
  }
};

/* GET BY ID */

export const getWorldByIdController = async (req, res, next) => {
  try {
    const world = await findWorldById(req.params.worldId);

    if (!world) throw new NotFoundError("Monde non trouvé.");

    return res.json(world);
  } catch (error) {
    next(error);
  }
};

/* UPDATE */

export const updateWorldController = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const world = await updateWorldById({
      worldId: req.params.worldId,
      data: {
        name,
        description,
      },
    });

    return res.json(world);
  } catch (error) {
    next(error);
  }
};

/* DELETE (soft delete) */

export const deleteWorldController = async (req, res, next) => {
  try {
    await deleteWorldById({
      worldId: req.params.worldId,
      userId: req.userId,
    });

    return res.json({
      message: "Monde supprimé avec succès",
    });
  } catch (error) {
    next(error);
  }
};
