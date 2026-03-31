import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/Authcontext";
import { useSocket } from "@/hooks/useSocket";
import { useGameSession } from "@/hooks/useGameSession";
import { getSessionApi, closeSessionApi, rollDiceApi } from "@/api/sessions";
import type { GameSession } from "@/api/sessions";
import type { SessionEventFeed, SessionUser } from "@/hooks/useGameSession";

////////////////////
// CONSTANTES
////////////////////

const DICE_TYPES = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];

////////////////////
// ICONS
////////////////////

function IconDice() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="12" height="12" x="2" y="10" rx="2" ry="2" />
      <path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6" />
      <circle cx="6" cy="14" r="1" /><circle cx="6" cy="18" r="1" /><circle cx="10" cy="16" r="1" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconX() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

////////////////////
// SOUS-COMPOSANTS
////////////////////

// ── Bulle d'événement dans le feed ────────────────────────────────

function EventBubble({ event, currentUserId }: { event: SessionEventFeed; currentUserId: string }) {
  const isMe = event.user.id === currentUserId;

  if (event.type === "USER_JOINED") {
    return (
      <div className="flex justify-center py-1">
        <span className="text-xs text-slate-600 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800">
          <span className="text-slate-400">{event.user.username}</span> a rejoint la session
        </span>
      </div>
    );
  }

  if (event.type === "USER_LEFT") {
    return (
      <div className="flex justify-center py-1">
        <span className="text-xs text-slate-600 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800">
          <span className="text-slate-400">{event.user.username}</span> a quitté la session
        </span>
      </div>
    );
  }

  if (event.type === "SESSION_CLOSED") {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-red-400 bg-red-950/40 px-4 py-1.5 rounded-full border border-red-900/40">
          Le MJ a fermé la session
        </span>
      </div>
    );
  }

  if (event.type === "DICE_ROLL") {
    const roll = event.data as { diceType: string; result: number; character?: { name: string } };
    const isNat = roll.result === parseInt(roll.diceType.slice(1));
    const isFail = roll.result === 1;

    return (
      <div className={["flex gap-2.5", isMe ? "flex-row-reverse" : "flex-row"].join(" ")}>
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 mt-0.5">
          {event.user.username.slice(0, 2).toUpperCase()}
        </div>

        {/* Bulle */}
        <div className={["max-w-70", isMe ? "items-end" : "items-start", "flex flex-col gap-1"].join(" ")}>
          <span className="text-[10px] text-slate-600 px-1">
            {isMe ? "Vous" : event.user.username}
            {roll.character && <span className="text-slate-700"> · {roll.character.name}</span>}
          </span>

          <div className={[
            "flex items-center gap-3 px-4 py-3 rounded-2xl border",
            isMe
              ? "bg-violet-950/50 border-violet-800/40 rounded-tr-sm"
              : "bg-slate-900 border-slate-800 rounded-tl-sm",
          ].join(" ")}>
            {/* Dé */}
            <div className="text-xs text-slate-500 font-mono tracking-wider">
              {roll.diceType}
            </div>

            {/* Résultat */}
            <div className={[
              "text-2xl font-bold tabular-nums",
              isNat ? "text-emerald-400" : isFail ? "text-red-400" : "text-slate-100",
            ].join(" ")}>
              {roll.result}
            </div>

            {/* Badge critique/échec */}
            {(isNat || isFail) && (
              <span className={[
                "text-[9px] tracking-widest uppercase font-bold px-1.5 py-0.5 rounded border",
                isNat
                  ? "text-emerald-400 bg-emerald-950/60 border-emerald-800/30"
                  : "text-red-400 bg-red-950/60 border-red-900/30",
              ].join(" ")}>
                {isNat ? "Critique !" : "Échec"}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ── Lanceur de dés ────────────────────────────────────────────────

function DiceLauncher({
  worldId,
  sessionId,
  rolling,
  onRoll,
}: {
  worldId: string;
  sessionId: string;
  rolling: boolean;
  onRoll: (diceType: string) => Promise<void>;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {DICE_TYPES.map((dice) => (
        <button
          key={dice}
          disabled={rolling}
          onClick={() => onRoll(dice)}
          className={[
            "px-3 py-2 rounded-lg border text-sm font-bold font-mono tracking-wider transition-all",
            "border-slate-700 bg-slate-900 text-slate-300",
            "hover:border-violet-600 hover:bg-violet-950/40 hover:text-violet-300",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "active:scale-95",
          ].join(" ")}
        >
          {dice}
        </button>
      ))}
    </div>
  );
}

// ── Liste des participants ─────────────────────────────────────────

function ParticipantList({ participants }: { participants: SessionUser[] }) {
  return (
    <div className="space-y-2">
      {participants.length === 0 ? (
        <p className="text-xs text-slate-600 italic">Aucun joueur connecté</p>
      ) : (
        participants.map((p) => (
          <div key={p.id} className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
              {p.username.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm text-slate-300 truncate">{p.username}</span>
          </div>
        ))
      )}
    </div>
  );
}

////////////////////
// PAGE PRINCIPALE
////////////////////

export default function GameSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  // ── Données REST ───────────────────────────────────────────────
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── État local ────────────────────────────────────────────────
  const [rolling, setRolling] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [closing, setClosing] = useState(false);

  // ── Socket + session temps réel ───────────────────────────────
  const socket = useSocket(accessToken);
  const { connected, participants, events, sessionClosed } = useGameSession(socket, sessionId);

  // ── Ref pour auto-scroll du feed ──────────────────────────────
  const feedBottomRef = useRef<HTMLDivElement>(null);

  // ── Charger les données initiales ─────────────────────────────
  useEffect(() => {
    if (!sessionId) return;
    getSessionApi(sessionId)
      .then(setSession)
      .catch(() => setError("Session introuvable."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // ── Auto-scroll vers le bas à chaque nouvel événement ─────────
  useEffect(() => {
    feedBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  // ── Rôle ──────────────────────────────────────────────────────
  const isMJ = session?.campaign
    ? false // sera déterminé via world — on utilise le worldId de la campagne
    : false;

  // En attendant le chargement du monde, on dérive isMJ depuis
  // les participants : si l'utilisateur n'est pas dans la liste
  // des membres classiques… on laisse le backend gérer les droits.
  // Pour l'UI, on expose le bouton "Fermer" uniquement si on peut
  // faire la requête PATCH (le backend refusera si non-MJ).
  // Solution propre : on stocke le rôle dans le session state via Socket.
  const [userRole, setUserRole] = useState<"MJ" | "PLAYER" | null>(null);

  useEffect(() => {
    if (!session || !user) return;
    // On récupère le worldId depuis la campagne pour vérifier le rôle
    const worldId = session.campaign.worldId;
    import("@/api/worlds").then(({ getWorldByIdApi }) => {
      getWorldByIdApi(worldId).then((world) => {
        setUserRole(world.ownerId === user.id ? "MJ" : "PLAYER");
      });
    });
  }, [session, user]);

  const isMJRole = userRole === "MJ";

  // ── Lancer un dé ──────────────────────────────────────────────
  const handleRoll = useCallback(async (diceType: string) => {
    if (!session || !sessionId || rolling) return;
    setRolling(true);
    try {
      await rollDiceApi(session.campaign.worldId, diceType, sessionId);
      // Le résultat arrivera via Socket.io session:dice_rolled
    } catch {
      // toast plus tard
    } finally {
      setRolling(false);
    }
  }, [session, sessionId, rolling]);

  // ── Fermer la session ──────────────────────────────────────────
  const handleClose = async () => {
    if (!confirmClose) {
      setConfirmClose(true);
      setTimeout(() => setConfirmClose(false), 4000);
      return;
    }
    if (!sessionId) return;
    setClosing(true);
    try {
      await closeSessionApi(sessionId);
      // session:closed arrivera via Socket.io — on navigue après
      navigate(`/worlds/${session?.campaign.worldId}`);
    } catch {
      setClosing(false);
      setConfirmClose(false);
    }
  };

  ////////////////////
  // RENDUS CONDITIONNELS
  ////////////////////

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <span className="text-slate-600 text-xs tracking-widest uppercase">Connexion à la session…</span>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-sm">{error ?? "Session introuvable."}</p>
          <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  // Session fermée par le MJ (reçu via Socket)
  if (sessionClosed) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto">
            <IconX />
          </div>
          <div>
            <p className="text-slate-200 font-semibold">Session terminée</p>
            <p className="text-slate-500 text-sm mt-1">Le MJ a mis fin à la session.</p>
          </div>
          <button
            onClick={() => navigate(`/worlds/${session.campaign.worldId}`)}
            className="text-violet-400 hover:text-violet-300 text-sm transition-colors"
          >
            Retour au monde
          </button>
        </div>
      </div>
    );
  }

  ////////////////////
  // VUE PRINCIPALE
  ////////////////////

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">

      {/* ── HEADER ────────────────────────────────────────────── */}
      <header className="shrink-0 h-12 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4 gap-4">
        {/* Gauche : retour + nom de campagne */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(`/worlds/${session.campaign.worldId}/campaigns/${session.campaign.id}`)}
            className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
          >
            <IconArrowLeft />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-sm font-semibold text-slate-200 truncate">
              {session.campaign.name}
            </span>
          </div>
        </div>

        {/* Centre : compteur de joueurs */}
        <div className="flex items-center gap-1.5 text-slate-500 text-xs shrink-0">
          <IconUsers />
          <span>{participants.length}</span>
        </div>

        {/* Droite : fermer session (MJ) ou badge rôle */}
        <div className="shrink-0">
          {isMJRole ? (
            <button
              onClick={handleClose}
              disabled={closing}
              className={[
                "text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded border transition-all",
                confirmClose
                  ? "text-red-300 bg-red-950/60 border-red-800/50"
                  : "text-slate-500 border-slate-700 hover:text-red-400 hover:border-red-900/50 hover:bg-red-950/30",
              ].join(" ")}
            >
              {closing ? "…" : confirmClose ? "Confirmer ?" : "Terminer"}
            </button>
          ) : (
            <span className="text-[9px] tracking-widest uppercase font-bold px-2 py-1 rounded border text-slate-500 border-slate-700">
              Joueur
            </span>
          )}
        </div>
      </header>

      {/* ── BODY ──────────────────────────────────────────────── */}
      {/*
          Desktop MJ  : [Participants | Feed | (vide ou futur panneau)]
          Mobile/joueur: [ Feed seul ]
      */}
      <div className="flex-1 flex overflow-hidden">

        {/* Colonne gauche : participants (desktop MJ uniquement) */}
        {isMJRole && (
          <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-slate-800 bg-slate-900/40 p-4 gap-4">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-slate-600 font-semibold mb-3">
                Joueurs connectés
              </p>
              <ParticipantList participants={participants} />
            </div>
          </aside>
        )}

        {/* Feed principal */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Zone de scroll des événements */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-40">
                <div className="text-4xl">🎲</div>
                <p className="text-slate-500 text-sm">La session vient de commencer.</p>
                <p className="text-slate-600 text-xs">Les jets de dés apparaîtront ici.</p>
              </div>
            ) : (
              events.map((event) => (
                <EventBubble
                  key={event.id}
                  event={event}
                  currentUserId={user?.id ?? ""}
                />
              ))
            )}
            <div ref={feedBottomRef} />
          </div>

          {/* Lanceur de dés — épinglé en bas */}
          <div className="shrink-0 border-t border-slate-800 bg-slate-900/60 backdrop-blur px-4 py-4">
            {/* Sur mobile : participants en accordéon au-dessus du lanceur */}
            <details className="lg:hidden mb-3 group">
              <summary className="text-[10px] tracking-widest uppercase text-slate-600 cursor-pointer list-none flex items-center gap-1.5 hover:text-slate-400 transition-colors">
                <IconUsers />
                <span>{participants.length} connecté{participants.length > 1 ? "s" : ""}</span>
                <span className="ml-auto text-slate-700 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="mt-2 pt-2 border-t border-slate-800">
                <ParticipantList participants={participants} />
              </div>
            </details>

            <DiceLauncher
              worldId={session.campaign.worldId}
              sessionId={session.id}
              rolling={rolling}
              onRoll={handleRoll}
            />
          </div>
        </main>

      </div>
    </div>
  );
}