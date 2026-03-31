import * as GameSessionModel from "./gameSession.model.js";
import { getIO, } from "../../lib/socket.js";
import { sessionRoom } from "../../lib/sessionSocket.js";
import { NotFoundError, ConflictError, ForbiddenError } from "../../lib/errors.js";

////////////////////
// OPEN SESSION
////////////////////

/**
 * POST /worlds/:worldId/campaigns/:campaignId/sessions
 * Réservé au MJ. Ouvre une session sur la campagne active.
 * Refuse s'il existe déjà une session OPEN pour cette campagne.
 */
export const openSessionController = async (req, res, next) => {
  try {
    const { campaignId } = req.params;

    // Vérifier qu'il n'y a pas déjà une session ouverte
    const existing = await GameSessionModel.getOpenSession({ campaignId });
    if (existing) {
      throw new ConflictError("Une session est déjà en cours pour cette campagne.");
    }

    const session = await GameSessionModel.openSession({ campaignId });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

////////////////////
// GET SESSION BY ID
////////////////////

/**
 * GET /sessions/:sessionId
 * Accessible à tous les membres du monde (vérifié via isWorldMember sur la route parente).
 */
export const getSessionController = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await GameSessionModel.getSessionById({ sessionId });
    if (!session) throw new NotFoundError("Session introuvable.");

    res.json(session);
  } catch (error) {
    next(error);
  }
};

////////////////////
// GET SESSIONS BY CAMPAIGN
////////////////////

/**
 * GET /worlds/:worldId/campaigns/:campaignId/sessions
 * Historique des sessions d'une campagne.
 */
export const getSessionsByCampaignController = async (req, res, next) => {
  try {
    const { campaignId } = req.params;

    const sessions = await GameSessionModel.getSessionsByCampaign({ campaignId });

    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

////////////////////
// GET OPEN SESSION
////////////////////

/**
 * GET /worlds/:worldId/campaigns/:campaignId/sessions/open
 * Retourne la session ouverte, si elle existe.
 */
export const getOpenSessionController = async (req, res, next) => {
  try {
    const { campaignId } = req.params;

    const session = await GameSessionModel.getOpenSession({ campaignId });
    if (!session) throw new NotFoundError("Aucune session ouverte pour cette campagne.");

    res.json(session);
  } catch (error) {
    next(error);
  }
};

////////////////////
// CLOSE SESSION
////////////////////

/**
 * PATCH /sessions/:sessionId/close
 * Réservé au MJ. Ferme la session et notifie tous les participants via Socket.io.
 */
export const closeSessionController = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await GameSessionModel.getSessionById({ sessionId });
    if (!session) throw new NotFoundError("Session introuvable.");
    if (session.status === "CLOSED") {
      throw new ConflictError("Cette session est déjà fermée.");
    }

    const closed = await GameSessionModel.closeSession({ sessionId });

    // Notifier tous les participants que la session est terminée
    getIO().to(sessionRoom(sessionId)).emit("session:closed", {
      sessionId,
      closedAt: closed.closedAt,
    });

    res.json(closed);
  } catch (error) {
    next(error);
  }
};

////////////////////
// GET SESSION EVENTS
////////////////////

/**
 * GET /sessions/:sessionId/events
 * Historique complet des événements d'une session.
 */
export const getSessionEventsController = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const events = await GameSessionModel.getSessionEvents({ sessionId });

    res.json(events);
  } catch (error) {
    next(error);
  }
};