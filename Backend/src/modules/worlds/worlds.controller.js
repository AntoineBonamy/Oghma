import {
  createWorld,
  findWorldsByUser,
  findWorldById,
  updateWorldById,
  deleteWorldById,
  
} from "./worlds.model.js";

/* CREATE */

export const createWorldController = async (req, res) => {
  try {
    const { name, description } = req.body;

    const world = await createWorld({
      name,
      description,
      ownerId: req.userId,
    });

    return res.status(201).json(world);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la création du monde",
    });
  }
};

/* GET ALL USER WORLDS */

export const getUserWorldsController = async (req, res) => {
  try {
    const worlds = await findWorldsByUser(req.userId);
    return res.json(worlds);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la récupération des mondes",
    });
  }
};

/* GET BY ID */

export const getWorldByIdController = async (req, res) => {
  try {
    const world = await findWorldById(req.params.id);

    if (!world) {
      return res.status(404).json({
        message: "Monde non trouvé",
      });
    }

    return res.json(world);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la récupération du monde",
    });
  }
};

/* UPDATE */

export const updateWorldController = async (req, res) => {
    try {
        const { name, description } = req.body;

        const world = await updateWorldById({
            worldId: req.params.id,
            data: {
                name,
                description,
            },
        });

        return res.json(world);
    } catch (error) {
        return res.status(500).json({
      message: "Erreur lors de la mise à jour du monde",
    });
    }
}

/* DELETE (soft delete) */

export const deleteWorldController = async (req, res) => {
  try {
    await deleteWorldById({
        worldId: req.params.id, 
        userId: req.userId
    });

    return res.json({
      message: "Monde supprimé avec succès",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la suppression du monde",
    });
  }
};