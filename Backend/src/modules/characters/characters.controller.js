import * as CharacterModel from "./characters.models.js";

//////////////////////////////////////////////////
// CHARACTER TEMPLATES (PERSONNAGES UTILISATEUR)
//////////////////////////////////////////////////

// CREATE TEMPLATE CHARACTER CONTROLLER

export const createCharacterTemplateController = async (req, res) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    const character = await CharacterModel.createCharacterTemplate({
      userId,
      name,
    });

    res.status(201).json(character);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création du personnage",
    });
  }
};

// GET USER CHARACTER TEMPLATE CONTROLLER

export const getUserCharacterTemplatesController = async (req, res) => {
  try {
    const userId = req.userId;

    const characters = await CharacterModel.getUserCharacterTemplates({
      userId,
    });

    res.json(characters);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des personnages",
    });
  }
};

// GET ONE TEMPLATE CHARACTER

export const getCharacterTemplateController = async (req, res) => {
  try {
    const userId = req.userId;
    const { characterId } = req.params;

    const character = await CharacterModel.getCharacterTemplateById({
      characterId,
      userId,
    });

    if (!character) {
      return res.status(404).json({
        message: "Personnage non trouvé",
      });
    }

    res.json(character);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du personnage",
    });
  }
};

// UPDATE TEMPLATE CHARACTER

export const updateCharacterTemplateController = async (req, res) => {
  try {
    const userId = req.userId;
    const { characterId } = req.params;

    const updated = await CharacterModel.updateCharacterTemplate({
      characterId,
      userId,
      data: req.body,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour du personnage",
    });
  }
};

// DELETE TEMPLATE CHARACTER 

export const deleteCharacterTemplateController = async (req, res) => {
  try {
    const userId = req.userId;
    const { characterId } = req.params;

    await CharacterModel.deleteCharacterTemplate({
      characterId,
      userId,
    });

    res.json({
      message: "Personnage supprimé",
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression du personnage",
    });
  }
};

//////////////////////////////////////////////////
// CHARACTERS IN WORLDS (COPIES)
//////////////////////////////////////////////////

// ADD CHARACTER TO WORLD

export const addCharacterToWorldController = async (req, res) => {
  try {
    const { worldId } = req.params;
    const userId = req.userId;

    const { templateId } = req.body;

    const character = await CharacterModel.addCharacterToWorld({
      templateId,
      worldId,
      userId,
    });

    res.status(201).json(character);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'ajout du personnage au monde",
    });
  }
};

// GET ALL WORLD CHARACTERS

export const getWorldCharactersController = async (req, res) => {
  try {
    const { worldId } = req.params;

    const characters = await CharacterModel.getWorldCharacters({
      worldId,
    });

    res.json(characters);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des personnages du monde",
    });
  }
};

// GET ONE WORLD CHARACTER

export const getWorldCharacterController = async (req, res) => {
  try {
    const { worldId, characterId } = req.params;

    const character = await CharacterModel.getWorldCharacterById({
      worldId,
      characterId,
    });

    if (!character) {
      return res.status(404).json({
        message: "Personnage non trouvé",
      });
    }

    res.json(character);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du personnage du monde",
    });
  }
};

// UPDATE WORLD CHARACTER

export const updateWorldCharacterController = async (req, res) => {
  try {
    const { worldId, characterId } = req.params;

    const updated = await CharacterModel.updateWorldCharacter({
      worldId,
      characterId,
      data: req.body,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour du personnage",
    });
  }
};

// DELETE WORLD CHARACTER

export const deleteWorldCharacterController = async (req, res) => {
  try {
    const { worldId, characterId } = req.params;

    await CharacterModel.deleteWorldCharacter({
      worldId,
      characterId,
    });

    res.json({
      message: "Personnage supprimé du monde",
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression du personnage",
    });
  }
};