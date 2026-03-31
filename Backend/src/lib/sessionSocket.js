import { prisma } from "./prismaClient.js";

////////////////////
// HELPERS
////////////////////

const sessionRoom = (sessionId) => `session:${sessionId}`;

export const registerSessionHandlers = (io, socket) => {

  // ── session:join ───────────────────────────────────────────────
  socket.on("session:join", async ({ sessionId }) => {
    if (!sessionId) return;

    try {
      const session = await prisma.gameSession.findUnique({
        where: { id: sessionId },
      });

      // ✅ Champ renommé sessionStatus (était status, conflictait avec Prisma)
      if (!session || session.sessionStatus !== "OPEN") {
        socket.emit("session:error", { message: "Session introuvable ou fermée." });
        return;
      }

      await prisma.sessionParticipant.upsert({
        where: {
          sessionId_userId: { sessionId, userId: socket.userId },
        },
        update: { leftAt: null },
        create: { sessionId, userId: socket.userId },
      });

      socket.join(sessionRoom(sessionId));
      socket.currentSessionId = sessionId;

      const user = await prisma.user.findUnique({
        where: { id: socket.userId },
        select: { id: true, username: true },
      });

      io.to(sessionRoom(sessionId)).emit("session:user_joined", { user });

      // État courant envoyé au nouvel arrivant uniquement
      const participants = await prisma.sessionParticipant.findMany({
        where: { sessionId, leftAt: null },
        include: { user: { select: { id: true, username: true } } },
      });

      const recentEvents = await prisma.sessionEvent.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { id: true, username: true } } },
      });

      socket.emit("session:state", {
        sessionId,
        participants: participants.map((p) => p.user),
        events: recentEvents.reverse(),
      });

    } catch (err) {
      console.error("session:join error", err);
      socket.emit("session:error", { message: "Erreur lors de la connexion à la session." });
    }
  });

  // ── session:leave ──────────────────────────────────────────────
  socket.on("session:leave", async ({ sessionId }) => {
    await handleLeave(io, socket, sessionId);
  });

  // ── Déconnexion brutale ────────────────────────────────────────
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
      where: { sessionId, userId: socket.userId },
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

export { sessionRoom };