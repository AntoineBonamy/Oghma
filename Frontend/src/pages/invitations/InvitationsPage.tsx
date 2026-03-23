import { useEffect, useState } from "react";
import {
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
  type Invitation,
} from "@/api/invitations";

////////////////////
// SOUS-COMPOSANTS
////////////////////

const StatusBadge = ({ status }: { status: Invitation["status"] }) => {
  const styles = {
    PENDING: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    ACCEPTED: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    DECLINED: "bg-red-500/15 text-red-400 border border-red-500/30",
  };

  const labels = {
    PENDING: "En attente",
    ACCEPTED: "Acceptée",
    DECLINED: "Refusée",
  };

  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

const RoleBadge = ({ role }: { role: Invitation["role"] }) => (
  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
    {role === "MJ" ? "Maître de Jeu" : "Joueur"}
  </span>
);

////////////////////
// CARTE INVITATION
////////////////////

interface InvitationCardProps {
  invitation: Invitation;
  onAccept: (code: string) => Promise<void>;
  onDecline: (code: string) => Promise<void>;
  loading: string | null;
}

const InvitationCard = ({
  invitation,
  onAccept,
  onDecline,
  loading,
}: InvitationCardProps) => {
  const isLoading = loading === invitation.code;
  const expiresAt = new Date(invitation.expiresAt);
  const daysLeft = Math.ceil(
    (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="group relative bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all duration-300">
      {/* Accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-linear-to-b from-indigo-500 to-violet-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="pl-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-white text-base leading-tight">
              {invitation.world?.name ?? "Monde inconnu"}
            </h3>
            <p className="text-sm text-white/40 mt-0.5">
              Expire dans {daysLeft} jour{daysLeft > 1 ? "s" : ""}
            </p>
          </div>
          <StatusBadge status={invitation.status} />
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-4">
          <RoleBadge role={invitation.role} />
        </div>

        {/* Actions */}
        {invitation.status === "PENDING" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAccept(invitation.code)}
              disabled={isLoading}
              className="flex-1 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Chargement…
                </span>
              ) : (
                "Rejoindre"
              )}
            </button>
            <button
            onClick={() => onDecline(invitation.code)}
            disabled={isLoading}
            className="py-2 px-4 rounded-xl bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-white/60 hover:text-red-400 text-sm font-medium transition-all duration-200"
            >
                Refuser
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

////////////////////
// PAGE PRINCIPALE
////////////////////

const InvitationsPage = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
 
  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyInvitations();
      setInvitations(data);
    } catch {
      setError("Impossible de charger les invitations.");
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchInvitations();
  }, []);
 
  const handleAccept = async (code: string) => {
    try {
      setActionLoading(code);
      await acceptInvitation(code);
      // Met à jour localement plutôt que re-fetch
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.code === code ? { ...inv, status: "ACCEPTED" } : inv
        )
      );
    } catch {
      setError("Erreur lors de l'acceptation de l'invitation.");
    } finally {
      setActionLoading(null);
    }
  };
 
  const handleDecline = async (code: string) => {
    try {
      setActionLoading(code);
      await declineInvitation(code);
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.code === code ? { ...inv, status: "DECLINED" } : inv
        )
      );
    } catch {
      setError("Erreur lors du refus de l'invitation.");
    } finally {
      setActionLoading(null);
    }
  };
 
  const pending = invitations.filter((inv) => inv.status === "PENDING");
  const others = invitations.filter((inv) => inv.status !== "PENDING");
 
  return (
    <div className="min-h-screen bg-[#0d0d12] text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
 
        {/* Header */}
        <div className="mb-10">
          <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase mb-2">
            Mes invitations
          </p>
          <h1 className="text-3xl font-bold text-white">
            Invitations reçues
          </h1>
          <p className="text-white/40 mt-2 text-sm">
            Rejoignez les mondes auxquels vous avez été invité.
          </p>
        </div>
 
        {/* Erreur globale */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
 
        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : invitations.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white/30 text-sm">Aucune invitation pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Invitations en attente */}
            {pending.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
                  En attente · {pending.length}
                </h2>
                <div className="space-y-3">
                  {pending.map((inv) => (
                    <InvitationCard
                      key={inv.id}
                      invitation={inv}
                      onAccept={handleAccept}
                      onDecline={handleDecline}
                      loading={actionLoading}
                    />
                  ))}
                </div>
              </section>
            )}
 
            {/* Historique */}
            {others.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
                  Historique · {others.length}
                </h2>
                <div className="space-y-3 opacity-60">
                  {others.map((inv) => (
                    <InvitationCard
                      key={inv.id}
                      invitation={inv}
                      onAccept={handleAccept}
                      onDecline={handleDecline}
                      loading={actionLoading}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
 
export default InvitationsPage;