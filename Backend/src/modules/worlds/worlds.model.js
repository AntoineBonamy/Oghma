import { prisma } from "../../lib/prismaClient.js";

/* CREATE WORLD */

export const createWorld = async ({ name, description, ownerId }) => {
  return prisma.world.create({
    data: {
      name,
      description,
      ownerId,
    },
  });
};

/* GET WORLDS BY USER */

export const findWorldsByUser = async (userId) => {
  return prisma.world.findMany({
    where: {
      deletedAt: null,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

/* GET BY ID */

export const findWorldById = async (id) => {
  return prisma.world.findFirst({
    where: { id, deletedAt: null },
  });
};

/* UPDATE */

export const updateWorldById = async ({worldId, data }) => {
    return prisma.world.update({
        where: {
            id: worldId,
        },
        data: {
            ...data,
        },
    });
};

/* DELETE */

export const deleteWorldById = async ({ worldId, userId }) => {
  const world = await prisma.world.findFirst({
    where: {
      id: worldId,
      ownerId: userId,
      deletedAt: null,
    },
  });

  if (!world) {
    throw new Error("World not found or forbidden");
  }

  return prisma.world.update({
    where: { id: worldId },
    data: {
      deletedAt: new Date(),
    },
  });
};
