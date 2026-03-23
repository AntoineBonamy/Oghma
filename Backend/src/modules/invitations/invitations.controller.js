import crypto from "crypto";
import { prisma } from "../../lib/prismaClient.js";

import {
  createInvitation,
  findPendingInvitationsByEmail,
  findInvitationByCode,
  updateInvitationStatus,
  findInvitationsByWorld,
} from "./invitations.model.js";

import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "../../lib/errors.js";

// SEND INVITATION

export const sendInvitationController = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const { worldId } = req.params;

    if (!email) throw new BadRequestError("Email requis.");

    // Vérifier que l'utilisateur existe
    const userToInvite = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!userToInvite)
      throw new NotFoundError("Aucun utilisateur avec cet email.");

    // Vérifier que l'utilisateur n'est pas déjà membre
    const existingMember = await prisma.worldMember.findUnique({
      where: {
        worldId_userId: {
          worldId,
          userId: userToInvite.id,
        },
      },
    });

    if (existingMember)
      throw new ConflictError("Cet utilisateur est déjà membre de ce monde.");

    // Vérifier qu'il n'a pas déjà une invitation en attente
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        worldId,
        email,
        status: "PENDING",
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation)
      throw new ConflictError(
        "Une invitation est déjà en attente pour cet utilisateur.",
      );

    // Générer un code unique
    const code = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours de validité

    const invitation = await createInvitation({
      worldId,
      email,
      role: "PLAYER",
      code,
      expiresAt,
    });

    return res.status(201).json(invitation);
  } catch (error) {
    next(error);
  }
};

// GET MY INVITATIONS

export const getMyInvitationsController = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    const invitations = await findPendingInvitationsByEmail(user.email);

    return res.json(invitations);
  } catch (error) {
    next(error);
  }
};

// ACCEPT INVITATION

export const acceptInvitationController = async (req, res, next) => {
  try {
    const { code } = req.params;

    const invitation = await findInvitationByCode(code);

    if (!invitation) throw new NotFoundError("Invitation introuvable.");

    if (invitation.status !== "PENDING")
      throw new BadRequestError("Invitation déjà traitée.");
    if (invitation.expiresAt < new Date())
      throw new BadRequestError("Invitation expirée.");

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (user.email !== invitation.email)
      throw new ForbiddenError("Cette invitation ne vous est pas destinée.");

    await prisma.$transaction(async (tx) => {
      await tx.worldMember.create({
        data: {
          worldId: invitation.worldId,
          userId: req.userId,
          role: invitation.role,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });
    });

    return res.json({ message: "Invitation acceptée" });
  } catch (error) {
    next(error);
  }
};

// DECLINE INVITATION

export const declineInvitationController = async (req, res, next) => {
  try {
    const { code } = req.params;

    const invitation = await findInvitationByCode(code);

    if (!invitation) throw new NotFoundError("Invitation introuvable.");
    if (invitation.status !== "PENDING")
      throw new BadRequestError("Invitation déjà traitée.");
    if (invitation.expiresAt < new Date())
      throw new BadRequestError("Invitation expirée.");

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (user.email !== invitation.email)
      throw new ForbiddenError("Cette invitation ne vous est pas destinée.");

    await updateInvitationStatus(invitation.id, "DECLINED");

    return res.json({ message: "Invitation refusée." });
  } catch (error) {
    next(error);
  }
};

// GET WORLD INVITATIONS

export const getWorldInvitationsController = async (req, res, next) => {
  try {
    const { worldId } = req.params;

    const invitations = await findInvitationsByWorld(worldId);

    return res.json(invitations);
  } catch (error) {
    next(error);
  }
};
