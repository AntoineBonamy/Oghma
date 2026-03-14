import * as CharacterModel from "./characters.models.js";
import { NotFoundError } from "../../lib/errors.js";

//////////////////////////////////////////////////
// CHARACTER TEMPLATES (PERSONNAGES UTILISATEUR)
//////////////////////////////////////////////////

// CREATE TEMPLATE CHARACTER CONTROLLER

export const createCharacterTemplateController = async (req, res, next) => {
  try {
    const character = await CharacterModel.createCharacterTemplate({
      userId: req.userId,
      name: req.body.name,
    });
    res.status(201).json(character);
  } catch (error) {
    next(error);
  }
};

// GET USER CHARACTER TEMPLATE CONTROLLER

export const getUserCharacterTemplatesController = async (req, res, next) => {
  try {
    const characters = await CharacterModel.getUserCharacterTemplates({
      userId: req.userId,
    });
    res.json(characters);
  } catch (error) {
    next(error);
  }
};

// GET ONE TEMPLATE CHARACTER

export const getCharacterTemplateController = async (req, res, next) => {
  try {
    const character = await CharacterModel.getCharacterTemplateById({
      characterId: req.params.characterId,
      userId: req.userId,
    });

    if (!character) throw new NotFoundError("Personnage non trouvé.");

    res.json(character);
  } catch (error) {
    next(error);
  }
};

// UPDATE TEMPLATE CHARACTER

export const updateCharacterTemplateController = async (req, res, next) => {
  try {
    const updated = await CharacterModel.updateCharacterTemplate({
      characterId: req.params.characterId,
      userId: req.userId,
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE TEMPLATE CHARACTER

export const deleteCharacterTemplateController = async (req, res, next) => {
  try {
    await CharacterModel.deleteCharacterTemplate({
      characterId: req.params.characterId,
      userId: req.userId,
    });
    res.json({ message: "Personnage supprimé." });
  } catch (error) {
    next(error);
  }
};

//////////////////////////////////////////////////
// CHARACTERS IN WORLDS (COPIES)
//////////////////////////////////////////////////

// ADD CHARACTER TO WORLD

export const addCharacterToWorldController = async (req, res, next) => {
  try {
    const character = await CharacterModel.addCharacterToWorld({
      templateId: req.body.templateId,
      worldId: req.params.worldId,
      userId: req.userId,
    });
    res.status(201).json(character);
  } catch (error) {
    next(error);
  }
};

// GET ALL WORLD CHARACTERS

export const getWorldCharactersController = async (req, res, next) => {
  try {
    const characters = await CharacterModel.getWorldCharacters({
      worldId: req.params.worldId,
    });
    res.json(characters);
  } catch (error) {
    next(error);
  }
};

// GET ONE WORLD CHARACTER

export const getWorldCharacterController = async (req, res, next) => {
  try {
    const character = await CharacterModel.getWorldCharacterById({
      worldId: req.params.worldId,
      characterId: req.params.characterId,
    });

    if (!character) throw new NotFoundError("Personnage non trouvé.");

    res.json(character);
  } catch (error) {
    next(error);
  }
};

// UPDATE WORLD CHARACTER

export const updateWorldCharacterController = async (req, res, next) => {
  try {
    const updated = await CharacterModel.updateWorldCharacter({
      worldId: req.params.worldId,
      characterId: req.params.characterId,
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE WORLD CHARACTER

export const deleteWorldCharacterController = async (req, res, next) => {
  try {
    await CharacterModel.deleteWorldCharacter({
      worldId: req.params.worldId,
      characterId: req.params.characterId,
    });
    res.json({ message: "Personnage supprimé du monde." });
  } catch (error) {
    next(error);
  }
};
