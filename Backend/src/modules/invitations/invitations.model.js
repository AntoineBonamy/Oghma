import { prisma } from "../../lib/prismaClient.js";

/* CREATE */

export const createInvitation = async (data) => {
    return prisma.invitation.create({
        data,
    });
};

/* GET INVITATION BY EMAIL */

export const findPendingInvitationByEmail = async (email) => {
    return prisma.invitation.findMany({
        where: {
            email,
            status: 'PENDING',
            expiresAt: {
                gt: new Date(),
            },
        },
        include: {
            world: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

/* FIND INVITATION BY CODE */

export const findInvitationByCode = async (code) => {
  return prisma.invitation.findUnique({
    where: { code },
  });
};

/* UPDATE INVITATION STATUS */

export const updateInvitationStatus = async (id, status) => {
  return prisma.invitation.update({
    where: { id },
    data: { status },
  });
};

/* FIND INVITATION BY WORLD */

export const findInvitationsByWorld = async (worldId) => {
  return prisma.invitation.findMany({
    where: { worldId },
    orderBy: { createdAt: 'desc' },
  });
};