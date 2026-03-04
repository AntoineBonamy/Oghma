import crypto from "crypto";
import { prisma } from "../../lib/prismaClient.js";

import {
  createInvitation,
  findPendingInvitationsByEmail,
  findInvitationByCode,
  updateInvitationStatus,
  findInvitationsByWorld,
} from "./invitations.model.js";

// SEND INVITATION

export const sendInvitationController = async (req, res) => {
  try {
    const { email, role } = req.body;
    const { worldId } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    // Vérifier que l'utilisateur existe
    const userToinvite = await prisma.user.findUnique({
        where: {
            email
        },
    });

    if (!userToinvite) {
        return res.status(404).json({
            message: "Aucun utilisateur avec cet email",
        });
    }

    // Vérifier que l'utilisateur n'est pas déjà membre
    const existingUser = await prisma.worldMember.findUnique({
      where: {
        worldId_userId: {
          worldId,
          userId: userToinvite.id,
        },
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Cet utilisateur est déjà membre de ce monde",
      });
    }

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

    if (existingInvitation) {
        return res.status(400).json({
            message: "Une invitation est déjà en attente pour cet utilisateur",
        });
    }

    // Générer un code unique
    const code = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours de validité

    const invitation = await createInvitation({
      worldId,
      email,
      role: role || "PLAYER",
      code,
      expiresAt,
    });

    return res.status(201).json(invitation);
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de l'envoi de l'invitation",
    });
  }
};

// GET MY INVITATIONS

export const getMyInvitationsController = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    const invitations = await findPendingInvitationsByEmail(user.email);

    return res.json(invitations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la récupération des invitations",
    });
  }
};

// ACCEPT INVITATION

export const acceptInvitationController = async (req, res) => {
  try {
    const { code } = req.params;

    const invitation = await findInvitationByCode(code);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation introuvable" });
    }

    if (invitation.status !== "PENDING") {
      return res.status(400).json({ message: "Invitation déjà traitée" });
    }

    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invitation expirée" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (user.email !== invitation.email) {
      return res.status(403).json({
        message: "Cette invitation ne vous est pas destinée",
      });
    }

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
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de l'acceptation",
    });
  }
};

// GET WORLD INVITATIONS

export const getWorldInvitationsController = async (req, res) => {
  try {
    const { worldId } = req.params;

    const invitations = await findInvitationsByWorld(worldId);

    return res.json(invitations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la récupération des invitations du monde",
    });
  }
};
