import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { registerSessionHandlers } from "./sessionSocket.js";

////////////////////
// SINGLETON
////////////////////

let io = null;

/**
 * Initialise Socket.io sur le serveur HTTP.
 * À appeler une seule fois dans server.js.
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  // ── Middleware d'authentification JWT ──────────────────────────
  // Chaque connexion Socket.io doit présenter un accessToken valide.
  // Le client l'envoie via : socket = io(url, { auth: { token } })
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Token manquant."));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      // On attache l'userId au socket, comme le middleware HTTP authenticate
      socket.userId = payload.sub;
      next();
    } catch {
      return next(new Error("Token invalide ou expiré."));
    }
  });

  // ── Enregistrement des handlers par connexion ──────────────────
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connecté : ${socket.id} (user: ${socket.userId})`);

    registerSessionHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log(`🔌 Socket déconnecté : ${socket.id}`);
    });
  });

  return io;
};

/**
 * Retourne l'instance Socket.io initialisée.
 * À utiliser dans les controllers HTTP (ex: diceRoll) pour broadcaster.
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io n'est pas encore initialisé.");
  }
  return io;
};
