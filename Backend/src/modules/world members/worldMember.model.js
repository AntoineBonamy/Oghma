import { prisma } from "../../lib/prismaClient.js";

export const getWorldMembers = async (worldId) => {
    return prisma.worldMember.findMany({
        where: { worldId },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
        orderBy: {
            joinedAt: "asc"
        }
    })
}

export const removeWorldMember = async (worldId, userId) => {
  return prisma.worldMember.delete({
    where: {
      worldId_userId: { worldId, userId },
    },
  });
};