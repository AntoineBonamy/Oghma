import { prisma } from "../../lib/prismaClient.js";

////////////////////
// OPEN SESSION
////////////////////

/**
 * Ouvre une nouvelle session pour une campagne.
 * Une seule session OPEN par campagne est autorisée (vérification dans le controller).
 */
export const openSession = async ({ campaignId }) => {
  return prisma.gameSession.create({
    data: { campaignId },
    include: _sessionIncludes(),
  });
};

////////////////////
// GET SESSION BY ID
////////////////////

export const getSessionById = async ({ sessionId }) => {
  return prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: _sessionIncludes(),
  });
};

////////////////////
// GET SESSIONS BY CAMPAIGN
////////////////////

export const getSessionsByCampaign = async ({ campaignId }) => {
  return prisma.gameSession.findMany({
    where: { campaignId },
    orderBy: { openedAt: "desc" },
    include: _sessionIncludes(),
  });
};

////////////////////
// GET OPEN SESSION FOR CAMPAIGN
////////////////////

export const getOpenSession = async ({ campaignId }) => {
  return prisma.gameSession.findFirst({
    where: { campaignId, status: "OPEN" },
    include: _sessionIncludes(),
  });
};

////////////////////
// CLOSE SESSION
////////////////////

export const closeSession = async ({ sessionId }) => {
  return prisma.gameSession.update({
    where: { id: sessionId },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
    },
    include: _sessionIncludes(),
  });
};

////////////////////
// CREATE SESSION EVENT
////////////////////

export const createSessionEvent = async ({ sessionId, userId, type, payload }) => {
  return prisma.sessionEvent.create({
    data: {
      sessionId,
      userId,
      type,
      payload,
    },
    include: {
      user: { select: { id: true, username: true } },
    },
  });
};

////////////////////
// GET SESSION EVENTS
////////////////////

export const getSessionEvents = async ({ sessionId }) => {
  return prisma.sessionEvent.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, username: true } },
    },
  });
};

////////////////////
// HELPERS
////////////////////

const _sessionIncludes = () => ({
  campaign: {
    select: { id: true, name: true, worldId: true },
  },
  participants: {
    where: { leftAt: null }, // uniquement les connectés
    include: {
      user: { select: { id: true, username: true } },
    },
  },
});