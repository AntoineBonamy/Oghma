import { useEffect, useState } from "react";
import {
  sendInvitation,
  getWorldInvitations,
  type Invitation,
} from "@/api/invitations";
 
////////////////////
// PROPS
////////////////////
 
interface InvitationsPanelProps {
  worldId: string;
}
 
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
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};
 
////////////////////
// FORMULAIRE ENVOI
////////////////////
 
interface SendFormProps {
  worldId: string;
  onSent: (invitation: Invitation) => void;
}
 
const SendInvitationForm = ({ worldId, onSent }: SendFormProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
 
  const handleSubmit = async () => {
    if (!email.trim()) return;
 
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      const invitation = await sendInvitation(worldId, { email: email.trim() });
      onSent(invitation);
      setEmail("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Erreur lors de l'envoi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
      <h3 className="text-sm font-semibold text-white mb-4">
        Inviter un joueur
      </h3>
 
      <div className="space-y-3">
        {/* Email */}
        <div>
          <label className="block text-xs text-white/40 mb-1.5">
            Adresse email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="joueur@exemple.com"
            className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-colors"
          />
        </div>
 
        {/* Feedback */}
        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            Invitation envoyée avec succès !
          </p>
        )}
 
        {/* Bouton */}
        <button
          onClick={handleSubmit}
          disabled={loading || !email.trim()}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors duration-200"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Envoi…
            </span>
          ) : (
            "Envoyer l'invitation"
          )}
        </button>
      </div>
    </div>
  );
};
 
////////////////////
// LISTE INVITATIONS
////////////////////
 
const InvitationRow = ({ invitation }: { invitation: Invitation }) => {
  const expiresAt = new Date(invitation.expiresAt);
  const isExpired = expiresAt < new Date();
 
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-white truncate">{invitation.email}</p>
        <p className="text-xs text-white/30 mt-0.5">
          {invitation.role === "MJ" ? "Maître de Jeu" : "Joueur"}
          {isExpired && invitation.status === "PENDING" && (
            <span className="ml-2 text-red-400/70">· Expirée</span>
          )}
        </p>
      </div>
      <StatusBadge status={invitation.status} />
    </div>
  );
};
 
////////////////////
// PANEL PRINCIPAL
////////////////////
 
const InvitationsPanel = ({ worldId }: InvitationsPanelProps) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getWorldInvitations(worldId);
        setInvitations(data);
      } catch {
        setError("Impossible de charger les invitations.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [worldId]);
 
  const handleSent = (newInvitation: Invitation) => {
    setInvitations((prev) => [newInvitation, ...prev]);
  };
 
  return (
    <div>
      {/* Formulaire d'envoi */}
      <SendInvitationForm worldId={worldId} onSent={handleSent} />
 
      {/* Liste */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">
            Invitations envoyées
          </h3>
          {!loading && (
            <span className="text-xs text-white/30">{invitations.length}</span>
          )}
        </div>
 
        {error && (
          <p className="text-xs text-red-400 mb-4">{error}</p>
        )}
 
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : invitations.length === 0 ? (
          <p className="text-sm text-white/20 text-center py-8">
            Aucune invitation envoyée.
          </p>
        ) : (
          <div>
            {invitations.map((inv) => (
              <InvitationRow key={inv.id} invitation={inv} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
 
export default InvitationsPanel;