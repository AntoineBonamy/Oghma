import { prisma } from "../../lib/prismaClient.js";

// CREATE CAMPAIGN

export const createCampaign = async ({ name, description, worldId }) => {
  return await prisma.campaign.create({
    data: {
      name,
      description,
      worldId,
    },
  });
};

// GET CAMPAIGNS BY WORLD

export const getCampaignsByWorldId = async ({ worldId }) => {
  return await prisma.campaign.findMany({
    where: {
      worldId,
      deletedAt: null,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

// GET CAMPAIGN BY ID

export const getCampaignById = async ({ campaignId, worldId }) => {
  return await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      worldId,
      deletedAt: null,
    },
  });
};

// GET ACTIVE CAMPAIGN

export const getActiveCampaign = async ({ worldId }) => {
  return await prisma.campaign.findFirst({
    where: {
      worldId,
      isActive: true,
      deletedAt: null,
    },
  });
};

// UPDATE CAMPAIGN

export const updateCampaign = async ({ campaignId, worldId, data }) => {
  return await prisma.campaign.updateMany({
    where: {
      id: campaignId,
      worldId,
      deletedAt: null,
    },
    data: {
      ...data,
    },
  });
};

// ACTIVATE CAMPAIGN

export const activateCampaign = async ({ campaignId, worldId }) => {
  return await prisma.$transaction([
    prisma.campaign.updateMany({
      where: {
        worldId,
      },
      data: {
        isActive: false,
      },
    }),

    prisma.campaign.updateMany({
      where: {
        id: campaignId,
        worldId,
        deletedAt: null,
      },
      data: {
        isActive: true,
      },
    }),
  ]);
};

// DELETE CAMPAIGN

export const deleteCampaign = async ({ campaignId, worldId }) => {
  return await prisma.campaign.updateMany({
    where: {
      id: campaignId,
      worldId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  });
};
