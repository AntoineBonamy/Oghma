import { prisma } from "../../lib/prismaClient.js";

//////////////////////////////////////////////////
// CHARACTER TEMPLATES (PERSONNAGES UTILISATEUR)
//////////////////////////////////////////////////

// CREATE TEMPLATE CHARACTER

export const createCharacterTemplate = async ({ userId, name }) => {
  return prisma.character.create({
    data: {
      userId,
      name,
      isTemplate: true,
      worldId: null,
    },
  });
};

// GET ALL TEMPLATE CHARACTERS

export const getUserCharacterTemplates = async ({ userId }) => {
  return prisma.character.findMany({
    where: {
      userId,
      isTemplate: true,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// GET A TEMPLATE CHARACTER BY ID

export const getCharacterTemplateById = async ({ characterId, userId }) => {
  return prisma.character.findFirst({
    where: {
      id: characterId,
      userId,
      isTemplate: true,
      deletedAt: null,
    },
  });
};

// UPDATE TEMPLATE CHARACTER

export const updateCharacterTemplate = async ({
  characterId,
  userId,
  data,
}) => {
  return prisma.character.updateMany({
    where: {
      id: characterId,
      userId,
      isTemplate: true,
    },
    data,
  });
};

// DELETE TEMPLATE CHARACTER

export const deleteCharacterTemplate = async ({ characterId, userId }) => {
  return prisma.character.updateMany({
    where: {
      id: characterId,
      userId,
      isTemplate: true,
    },
    data: {
      deletedAt: new Date(),
    },
  });
};

//////////////////////////////////////////////////
// CHARACTERS IN WORLDS (COPIES)
//////////////////////////////////////////////////

// ADD CHARACTER TO WORLD

export const addCharacterToWorld = async ({ templateId, worldId, userId }) => {
  return prisma.$transaction(async (tx) => {
    const template = await tx.character.findFirst({
      where: {
        id: templateId,
        userId,
        isTemplate: true,
        deletedAt: null
      },
    });

    if (template.deletedAt !== null) {
        throw new Error("Personnage Template supprimé");
    }

    if (!template) {
      throw new Error("Personnage Template non trouvé");
    }

    return tx.character.create({
      data: {
        name: template.name,
        userId,
        worldId,
        isTemplate: false,
        parentCharacterID: template.id,
      },
    });
  });
};

// GET WORLD CHARACTERS

export const getWorldCharacters = async ({ worldId }) => {
  return prisma.character.findMany({
    where: {
      worldId,
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// GET WORLD CHARACTER BY ID

export const getWorldCharacterById = async ({ worldId, characterId }) => {
  return prisma.character.findFirst({
    where: {
      id: characterId,
      worldId,
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
};

// UPDATE WORLD CHARACTER

export const updateWorldCharacter = async ({ worldId, characterId, data }) => {
  return prisma.character.updateMany({
    where: {
      id: characterId,
      worldId,
      isTemplate: false,
    },
    data,
  });
};

// DELETE WORLD CHARACTER

export const deleteWorldCharacter = async ({ worldId, characterId }) => {
  return prisma.character.updateMany({
    where: {
      id: characterId,
      worldId,
      isTemplate: false,
    },
    data: {
      deletedAt: new Date(),
    },
  });
};
