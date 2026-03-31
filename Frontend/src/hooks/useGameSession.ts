import { useEffect, useState, useCallback, useRef } from "react";
import type { Socket } from "socket.io-client";
import type { DiceRoll } from "@/api/sessions";

////////////////////
// TYPES
////////////////////

export interface SessionUser {
  id: string;
  username: string;
}

export interface SessionEventFeed {
  id: string;
  type: "DICE_ROLL" | "USER_JOINED" | "USER_LEFT" | "SESSION_CLOSED";
  user: SessionUser;
  data: DiceRoll | SessionUser | { closedAt: string } | null;
  createdAt: string;
}

interface UseGameSessionReturn {
  connected: boolean;
  participants: SessionUser[];
  events: SessionEventFeed[];
  sessionClosed: boolean;
}

////////////////////
// HOOK
////////////////////

export const useGameSession = (
  socket: Socket | null,
  sessionId: string | undefined
): UseGameSessionReturn => {
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState<SessionUser[]>([]);
  const [events, setEvents] = useState<SessionEventFeed[]>([]);
  const [sessionClosed, setSessionClosed] = useState(false);

  // On garde une ref du sessionId pour pouvoir l'utiliser dans le cleanup
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const pushEvent = useCallback((event: SessionEventFeed) => {
    setEvents((prev) => [...prev, event]);
  }, []);

  useEffect(() => {
    if (!socket || !sessionId) return;

    // ── Fonction qui émet le join et attache tous les listeners ──
    const setup = () => {
      // Rejoindre la room
      socket.emit("session:join", { sessionId });
      setConnected(true);

      // État initial de la session
      socket.on("session:state", ({ participants: users, events: history }: {
        participants: SessionUser[];
        events: Array<{ id: string; type: string; user: SessionUser; payload: unknown; createdAt: string }>;
      }) => {
        setParticipants(users);

        const feed: SessionEventFeed[] = history.map((e) => ({
          id: e.id,
          type: e.type as SessionEventFeed["type"],
          user: e.user,
          data: e.payload as DiceRoll,
          createdAt: e.createdAt,
        }));
        setEvents(feed);
      });

      socket.on("session:user_joined", ({ user }: { user: SessionUser }) => {
        setParticipants((prev) => {
          if (prev.find((p) => p.id === user.id)) return prev;
          return [...prev, user];
        });
        pushEvent({
          id: `join-${user.id}-${Date.now()}`,
          type: "USER_JOINED",
          user,
          data: user,
          createdAt: new Date().toISOString(),
        });
      });

      socket.on("session:user_left", ({ user }: { user: SessionUser }) => {
        setParticipants((prev) => prev.filter((p) => p.id !== user.id));
        pushEvent({
          id: `left-${user.id}-${Date.now()}`,
          type: "USER_LEFT",
          user,
          data: user,
          createdAt: new Date().toISOString(),
        });
      });

      socket.on("session:dice_rolled", (diceRoll: DiceRoll) => {
        pushEvent({
          id: diceRoll.id,
          type: "DICE_ROLL",
          user: diceRoll.user,
          data: diceRoll,
          createdAt: diceRoll.createdAt,
        });
      });

      socket.on("session:closed", () => {
        setSessionClosed(true);
        pushEvent({
          id: `closed-${Date.now()}`,
          type: "SESSION_CLOSED",
          user: { id: "", username: "MJ" },
          data: { closedAt: new Date().toISOString() },
          createdAt: new Date().toISOString(),
        });
      });
    };

    socket.onAny((event, ...args) => {
  console.log("[SOCKET EVENT]", event, args);
});

    // ── Si le socket est déjà connecté, on setup immédiatement ──
    // ── Sinon, on attend l'événement "connect" ──────────────────
    if (socket.connected) {
      setup();
    } else {
      socket.once("connect", setup);
    }

    // ── Cleanup ─────────────────────────────────────────────────
    return () => {
      socket.emit("session:leave", { sessionId: sessionIdRef.current });
      socket.off("connect", setup);
      socket.off("session:state");
      socket.off("session:user_joined");
      socket.off("session:user_left");
      socket.off("session:dice_rolled");
      socket.off("session:closed");
      setConnected(false);
    };
  }, [socket, sessionId, pushEvent]);

  return { connected, participants, events, sessionClosed };
};