import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getWorldByIdApi,
  getWorldMembersApi,
  getWorldCampaignsApi,
  deleteWorldApi,
  removeMemberApi,
} from "@/api/worlds";
import type { World, WorldMember, Campaign } from "@/api/worlds";
import { useAuth } from "@/contexts/Authcontext";
import InvitationsPanel from "@/components/invitations/InvitationsPanel";
 
////////////////////
// HELPERS
////////////////////
 
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Nombre de caractères au-delà duquel on tronque
const DESCRIPTION_THRESHOLD = 300;
 
////////////////////
// ICONS
////////////////////
 
function IconPencil() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
 
function IconTrash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

////////////////////
// ROLE BADGE
////////////////////
 
function RoleBadge({ role }: { role: "MJ" | "PLAYER" }) {
  return (
    <span
      className={[
        "text-[9px] tracking-widest uppercase font-bold px-2 py-0.5 rounded border",
        role === "MJ"
          ? "text-violet-400 bg-violet-950/60 border-violet-800/30"
          : "text-slate-400 bg-slate-800/60 border-slate-700/30",
      ].join(" ")}
    >
      {role}
    </span>
  );
}

////////////////////
// EXPANDABLE DESCRIPTION
////////////////////

function ExpandableDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > DESCRIPTION_THRESHOLD;
  const displayed = isLong && !expanded
    ? text.slice(0, DESCRIPTION_THRESHOLD).trimEnd() + "…"
    : text;
 
  return (
    <div className="mt-4 border-t border-slate-800 pt-4">
      <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
        {displayed}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
        >
          {expanded ? "Réduire ↑" : "Lire la suite ↓"}
        </button>
      )}
    </div>
  );
}
 
////////////////////
// SECTION HEADER
////////////////////
 
function SectionHeader({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xs tracking-widest uppercase font-bold text-slate-400">
          {title}
        </h2>
        {count !== undefined && (
          <span className="text-xs text-slate-600 bg-slate-800 rounded-full px-2 py-0.5">
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

////////////////////
// ICON BUTTON (mobile) + TEXT BUTTON (desktop)
////////////////////
 
interface ResponsiveActionButtonProps {
  variant: "ghost" | "danger";
  icon: React.ReactNode;
  label: string;
  loading?: boolean;
  onClick: () => void;
}
 
function ResponsiveActionButton({
  variant,
  icon,
  label,
  loading = false,
  onClick,
}: ResponsiveActionButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded font-semibold uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
 
  const variantClass =
    variant === "danger"
      ? "border border-red-900/50 text-red-400 hover:bg-red-950/60 hover:text-red-300"
      : "border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100";
 
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={[base, variantClass].join(" ")}
    >
      {loading ? (
        /* Dots (même style que Button) */
        <span className="flex items-center gap-1 px-2.5 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
        </span>
      ) : (
        <>
          {/* Mobile : icône seule */}
          <span className="sm:hidden p-1.5">{icon}</span>
          {/* Desktop : texte */}
          <span className="hidden sm:inline text-xs px-3 py-1.5 tracking-wider">{label}</span>
        </>
      )}
    </button>
  );
}

////////////////////
// INVITATIONS MODAL
////////////////////
 
function InvitationsModal({
  worldId,
  onClose,
}: {
  worldId: string;
  onClose: () => void;
}) {
  // Fermeture sur Échap
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
 
      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100">
            Inviter des joueurs
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
 
        {/* Contenu */}
        <div className="p-5">
          <InvitationsPanel worldId={worldId} />
        </div>
      </div>
    </div>
  );
}

////////////////////
// MEMBER ROW
////////////////////

function MemberRow({
  member,
  isMe,
  isMJ,
  removing,
  onRemove,
}: {
  member: WorldMember;
  isMe: boolean;
  isMJ: boolean;
  removing: boolean;
  onRemove: (userId: string) => void;
}) {
  const [confirm, setConfirm] = useState(false);
 
  const handleClick = () => {
    if (!confirm) {
      setConfirm(true);
      setTimeout(() => setConfirm(false), 3000);
      return;
    }
    onRemove(member.userId);
  };
 
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800 group">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
          {member.user.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex gap-2 mb-1">
<p className="text-sm text-slate-300 truncate">
            {member.user.username} 
            {isMe && (
              <span className="ml-2 text-[9px] text-slate-600 tracking-wider uppercase">
                (vous)
              </span>
            )}
          </p>
          <RoleBadge role={member.role} />
          </div>
          
          <p className="text-xs text-slate-600">
            Depuis le {formatDate(member.joinedAt)}
          </p>
        </div>
      </div>
 
      <div className="flex items-center gap-2 shrink-0"> 
        {/* Bouton retrait — MJ uniquement, pas sur soi-même */}
        {isMJ && !isMe && (
          <button
            onClick={handleClick}
            disabled={removing}
            className={[
              "text-[10px] font-semibold px-2 py-0.5 rounded border transition-all duration-200",
              confirm
                ? "text-red-400 bg-red-950/60 border-red-900/50 opacity-100"
                : "text-slate-500 bg-slate-800/60 border-slate-700/30 hover:text-red-400 hover:bg-red-950/40 hover:border-red-900/30",
              removing ? "cursor-not-allowed opacity-40" : "",
            ].join(" ")}
          >
            {removing ? "…" : confirm ? "Confirmer ?" : "Retirer"}
          </button>
        )}
      </div>
    </div>
  );
}
 
////////////////////
// WORLD DETAIL PAGE
////////////////////
 
export default function WorldDetailPage() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
 
  const [world, setWorld] = useState<World | null>(null);
  const [members, setMembers] = useState<WorldMember[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
 
  const isMJ = world?.ownerId === user?.id;
 
  useEffect(() => {
    if (!worldId) return;
 
    Promise.all([
      getWorldByIdApi(worldId),
      getWorldMembersApi(worldId),
      getWorldCampaignsApi(worldId),
    ])
      .then(([w, m, c]) => {
        setWorld(w);
        setMembers(m);
        setCampaigns(c);
      })
      .catch(() => setError("Impossible de charger ce monde."))
      .finally(() => setLoading(false));
  }, [worldId]);
 
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }
    setDeleting(true);
    try {
      await deleteWorldApi(worldId!);
      navigate("/worlds");
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

    const handleRemoveMember = async (userId: string) => {
    if (!worldId) return;
    try {
      setRemovingMemberId(userId);
      await removeMemberApi(worldId, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch {
      // On pourra ajouter un toast ici plus tard
    } finally {
      setRemovingMemberId(null);
    }
  };
 
  // ── LOADING ──
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-4 bg-slate-800 rounded w-1/4" />
        <div className="h-20 bg-slate-800 rounded-xl" />
        <div className="h-40 bg-slate-800 rounded-xl" />
        <div className="h-40 bg-slate-800 rounded-xl" />
      </div>
    );
  }
 
  // ── ERROR ──
  if (error || !world) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-950/40 border border-red-900/50 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error ?? "Monde introuvable."}
        </div>
        <button
          onClick={() => navigate("/worlds")}
          className="mt-4 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Retour aux mondes
        </button>
      </div>
    );
  }
 
  const activeCampaign = campaigns.find((c) => c.isActive);
 
  return (
    <>
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
 
      {/* Back */}
      <button
        onClick={() => navigate("/worlds")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Mes mondes
      </button>
 
      {/* ── INFOS DU MONDE ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        {/* Ligne 1 : avatar + nom + badge — pas d'actions ici */}
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-950/60 border border-violet-800/40 flex items-center justify-center text-violet-400 font-bold text-lg shrink-0">
              {world.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* truncate sur le nom uniquement, le badge est shrink-0 */}

                <h1 className="text-lg font-bold text-slate-100 truncate">{world.name}</h1>
                {isMJ && <RoleBadge role="MJ" />}
          </div>
          </div>

          {/* Ligne 2 : date à gauche, actions à droite — chacun peut rétrécir */}
          <div className="flex items-center justify-between gap-2 mt-3">
<p className="text-xs text-slate-600 shrink-0">
            Créé le {formatDate(world.createdAt)}
          </p>
          
 
          {/* Actions MJ */}
          {isMJ && (
            <div className="flex items-center gap-2">
              <ResponsiveActionButton
                variant="ghost"
                icon={<IconPencil />}
                label="Modifier"
                onClick={() => navigate(`/worlds/${worldId}/edit`)}
              />
              <ResponsiveActionButton
                variant="danger"
                icon={<IconTrash />}
                label={confirmDelete ? "Confirmer ?" : "Supprimer"}
                loading={deleting}
                onClick={handleDelete}
              />
            </div>
          )}
        </div>
 
 {/* Description expansible */}
        {world.description && (
          <ExpandableDescription text={world.description} />
        )}
      </div>
 
      {/* ── CAMPAGNES ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <SectionHeader
          title="Campagnes"
          count={campaigns.length}
          action={
            isMJ ? (
              <Link
                to={`/worlds/${worldId}/campaigns/new`}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                + Nouvelle
              </Link>
            ) : undefined
          }
        />
 
        {campaigns.length === 0 ? (
          <p className="text-sm text-slate-600 italic">
            Aucune campagne pour l'instant.
          </p>
        ) : (
          <div className="space-y-2">
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                to={`/worlds/${worldId}/campaigns/${campaign.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-violet-700/40 hover:bg-slate-950/60 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={[
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    campaign.isActive ? "bg-emerald-400" : "bg-slate-700"
                  ].join(" ")} />
                  <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors truncate">
                    {campaign.name}
                  </span>
                  {campaign.isActive && (
                    <span className="text-[9px] tracking-widest uppercase text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.5 rounded shrink-0">
                      Active
                    </span>
                  )}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="text-slate-700 group-hover:text-slate-500 shrink-0 ml-2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        )}
 
        {/* Active campaign highlight */}
        {activeCampaign && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <Link
              to={`/worlds/${worldId}/campaigns/${activeCampaign.id}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 hover:bg-emerald-950/30 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div>
                <p className="text-xs text-emerald-400 tracking-wider uppercase font-semibold">
                  Session en cours
                </p>
                <p className="text-sm text-slate-300">{activeCampaign.name}</p>
              </div>
            </Link>
          </div>
        )}
      </div>
 
      {/* ── MEMBRES ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <SectionHeader
          title="Membres"
          count={members.length}
          action={
              isMJ ? (
                <button
                  onClick={() => setInviteModalOpen(true)}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  + Inviter
                </button>
              ) : undefined
            }
        />
 
        {members.length === 0 ? (
          <p className="text-sm text-slate-600 italic">Aucun membre.</p>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <MemberRow
                  key={member.id}
                  member={member}
                  isMe={member.userId === user?.id}
                  isMJ={isMJ}
                  removing={removingMemberId === member.userId}
                  onRemove={handleRemoveMember}
                />
            ))}
          </div>
        )}
      </div>
 
    </div>

          {/* ── MODAL INVITATIONS ── */}
      {inviteModalOpen && worldId && (
        <InvitationsModal
          worldId={worldId}
          onClose={() => setInviteModalOpen(false)}
        />
      )}
    </>
  );
}
 






