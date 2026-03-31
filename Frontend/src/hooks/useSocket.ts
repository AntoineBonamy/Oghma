import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://localhost:3001";

/**
 * Crée et retourne une connexion Socket.io authentifiée.
 *
 * Le socket est créé dès que le token est disponible et sa référence
 * est stable (useRef) — les listeners enregistrés dans useGameSession
 * ne ratent donc aucun événement même si la connexion prend du temps.
 *
 * @param token - accessToken JWT de l'utilisateur connecté
 */
export const useSocket = (token: string | null): Socket | null => {
  const socketRef = useRef<Socket | null>(null);
  const [, forceRender] = useState(0); // force un re-render quand le socket est prêt

  useEffect(() => {
    if (!token) return;
    if (socketRef.current) return; // déjà créé

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      // Ne pas auto-connecter : on contrôle le cycle de vie
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Socket connecté :", socket.id);
      forceRender((n) => n + 1); // notifie les composants que le socket est opérationnel
    });

    socket.on("connect_error", (err) => {
      console.error("🔌 Erreur Socket.io :", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return socketRef.current;
};