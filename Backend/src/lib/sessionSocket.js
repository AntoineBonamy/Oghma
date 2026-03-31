import { prisma } from "./prismaClient.js";

////////////////////
// HELPERS
////////////////////

const sessionRoom = (sessionId) => `session:${sessionId}`;

/**
 * Enregistre tous les événements Socket.io liés à une session de jeu.
 * Appelé pour chaque socket connecté.
 */
export const registerSessionHandlers = (io, socket) => {

  // ── session:join ───────────────────────────────────────────────
  // Le client rejoint une session : socket entre dans la room,
  // SessionParticipant créé ou mis à jour en base,
  // les autres participants sont notifiés.
  socket.on("session:join", async ({ sessionId }) => {
    if (!sessionId) return;

    try {
      // Vérifier que la session existe et est ouverte
      const session = await prisma.gameSession.findUnique({
        where: { id: sessionId },
      });

      if (!session || session.status !== "OPEN") {
        socket.emit("session:error", { message: "Session introuvable ou fermée." });
        return;
      }

      // Créer ou réactiver la participation (leftAt → null)
      await prisma.sessionParticipant.upsert({
        where: {
          sessionId_userId: {
            sessionId,
            userId: socket.userId,
          },
        },
        update: { leftAt: null },
        create: {
          sessionId,
          userId: socket.userId,
        },
      });

      // Rejoindre la room Socket.io
      socket.join(sessionRoom(sessionId));

      // Stocker la sessionId courante sur le socket pour la déconnexion
      socket.currentSessionId = sessionId;

      // Récupérer l'utilisateur pour le broadcast
      const user = await prisma.user.findUnique({
        where: { id: socket.userId },
        select: { id: true, username: true },
      });

      // Notifier tout le monde dans la room (y compris le nouvel arrivant)
      io.to(sessionRoom(sessionId)).emit("session:user_joined", { user });

      // Envoyer l'état courant de la session au nouvel arrivant uniquement
      const participants = await prisma.sessionParticipant.findMany({
        where: { sessionId, leftAt: null },
        include: {
          user: { select: { id: true, username: true } },
        },
      });

      const recentEvents = await prisma.sessionEvent.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          user: { select: { id: true, username: true } },
        },
      });

      socket.emit("session:state", {
        sessionId,
        participants: participants.map((p) => p.user),
        events: recentEvents.reverse(), // ordre chronologique
      });

    } catch (err) {
      console.error("session:join error", err);
      socket.emit("session:error", { message: "Erreur lors de la connexion à la session." });
    }
  });

  // ── session:leave ──────────────────────────────────────────────
  // Le client quitte volontairement la session.
  socket.on("session:leave", async ({ sessionId }) => {
    await handleLeave(io, socket, sessionId);
  });

  // ── Déconnexion brutale (fermeture onglet, réseau coupé) ───────
  socket.on("disconnect", async () => {
    if (socket.currentSessionId) {
      await handleLeave(io, socket, socket.currentSessionId);
    }
  });
};

////////////////////
// HELPER : quitter une session
////////////////////

async function handleLeave(io, socket, sessionId) {
  if (!sessionId) return;

  try {
    await prisma.sessionParticipant.updateMany({
      where: {
        sessionId,
        userId: socket.userId,
      },
      data: { leftAt: new Date() },
    });

    socket.leave(sessionRoom(sessionId));

    const user = await prisma.user.findUnique({
      where: { id: socket.userId },
      select: { id: true, username: true },
    });

    io.to(sessionRoom(sessionId)).emit("session:user_left", { user });

    socket.currentSessionId = null;
  } catch (err) {
    console.error("session:leave error", err);
  }
}

////////////////////
// EXPORT utilitaire
// Permet aux controllers HTTP de broadcaster dans une room
////////////////////

export { sessionRoom };