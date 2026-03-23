import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getWorldByIdApi,
  getWorldMembersApi,
  getWorldCampaignsApi,
  deleteWorldApi,
} from "@/api/worlds";
import type { World, WorldMember, Campaign } from "@/api/worlds";
import { useAuth } from "@/contexts/Authcontext";
import Button from "@/components/Button";
 
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
          <div className="flex items-center justify-between gap-3 mt-3">
<p className="text-xs text-slate-600 shrink-0">
            Créé le {formatDate(world.createdAt)}
          </p>
          
 
          {/* Actions MJ */}
          {isMJ && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/worlds/${worldId}/edit`)}
              >
                Modifier
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={deleting}
                onClick={handleDelete}
              >
                {confirmDelete ? "Confirmer ?" : "Supprimer"}
              </Button>
            </div>
          )}
        </div>
 
        {world.description && (
          <p className="mt-4 text-sm text-slate-400 leading-relaxed border-t border-slate-800 pt-4">
            {world.description}
          </p>
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
              <Link
                to={`/worlds/${worldId}/invitations`}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                + Inviter
              </Link>
            ) : undefined
          }
        />
 
        {members.length === 0 ? (
          <p className="text-sm text-slate-600 italic">Aucun membre.</p>
        ) : (
          <div className="space-y-2">
            {members.map((member) => {
              const isMe = member.userId === user?.id;
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                      {member.user.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-300 truncate">
                        {member.user.username}
                        {isMe && (
                          <span className="ml-2 text-[9px] text-slate-600 tracking-wider uppercase">
                            (vous)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-600">
                        Depuis le {formatDate(member.joinedAt)}
                      </p>
                    </div>
                  </div>
                  <RoleBadge role={member.role} />
                </div>
              );
            })}
          </div>
        )}
      </div>
 
    </div>
  );
}
 






