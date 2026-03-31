import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCampaignByIdApi,
  activateCampaignApi,
  deleteCampaignApi,
} from "@/api/campaigns";
import type { Campaign } from "@/api/campaigns";
import { getWorldByIdApi } from "@/api/worlds";
import type { World } from "@/api/worlds";
import { useAuth } from "@/contexts/Authcontext";

////////////////////
// HELPERS
////////////////////

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const DESCRIPTION_THRESHOLD = 300;

////////////////////
// ICONS
////////////////////

function IconPencil() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

////////////////////
// EXPANDABLE DESCRIPTION
////////////////////

function ExpandableDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > DESCRIPTION_THRESHOLD;
  const displayed =
    isLong && !expanded
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
// RESPONSIVE ACTION BUTTON
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
          <span className="hidden sm:inline text-xs px-3 py-1.5 tracking-wider">
            {label}
          </span>
        </>
      )}
    </button>
  );
}

////////////////////
// CAMPAIGN DETAIL PAGE
////////////////////

export default function CampaignDetailPage() {
  const { worldId, campaignId } = useParams<{
    worldId: string;
    campaignId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [world, setWorld] = useState<World | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activating, setActivating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isMJ = world?.ownerId === user?.id;

  useEffect(() => {
    if (!worldId || !campaignId) return;

    Promise.all([
      getCampaignByIdApi(worldId, campaignId),
      getWorldByIdApi(worldId),
    ])
      .then(([c, w]) => {
        setCampaign(c);
        setWorld(w);
      })
      .catch(() => setError("Impossible de charger la campagne."))
      .finally(() => setLoading(false));
  }, [worldId, campaignId]);

  const handleActivate = async () => {
    if (!worldId || !campaignId) return;
    setActivating(true);
    try {
      await activateCampaignApi(worldId, campaignId);
      setCampaign((prev) => (prev ? { ...prev, isActive: true } : prev));
    } catch {
      // On pourra ajouter un toast ici plus tard
    } finally {
      setActivating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }
    if (!worldId || !campaignId) return;
    setDeleting(true);
    try {
      await deleteCampaignApi(worldId, campaignId);
      navigate(`/worlds/${worldId}`);
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
        <div className="h-32 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  // ── ERROR ──
  if (error || !campaign) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-950/40 border border-red-900/50 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error ?? "Campagne introuvable."}
        </div>
        <button
          onClick={() => navigate(`/worlds/${worldId}`)}
          className="mt-4 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Retour au monde
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(`/worlds/${worldId}`)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        {world?.name ?? "Retour au monde"}
      </button>

      {/* ── INFOS DE LA CAMPAGNE ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        {/* Ligne 1 : icône + nom + badge actif */}
        <div className="flex items-center gap-3">
          <div
            className={[
              "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0",
              campaign.isActive
                ? "bg-emerald-950/60 border border-emerald-800/40 text-emerald-400"
                : "bg-slate-800/60 border border-slate-700/40 text-slate-400",
            ].join(" ")}
          >
            {campaign.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h1 className="text-lg font-bold text-slate-100 truncate">
              {campaign.name}
            </h1>
            {campaign.isActive && (
              <span className="text-[9px] tracking-widest uppercase font-bold px-2 py-0.5 rounded border text-emerald-400 bg-emerald-950/60 border-emerald-800/30 shrink-0">
                Active
              </span>
            )}
          </div>
        </div>

        {/* Ligne 2 : date + actions MJ */}
        <div className="flex items-center justify-between gap-2 mt-3">
          <p className="text-xs text-slate-600 shrink-0">
            Créée le {formatDate(campaign.createdAt)}
          </p>

          {isMJ && (
            <div className="flex items-center gap-2">
              {/* Activer (masqué si déjà active) */}
              {!campaign.isActive && (
                <ResponsiveActionButton
                  variant="ghost"
                  icon={<IconPlay />}
                  label="Activer"
                  loading={activating}
                  onClick={handleActivate}
                />
              )}
              <ResponsiveActionButton
                variant="ghost"
                icon={<IconPencil />}
                label="Modifier"
                onClick={() =>
                  navigate(`/worlds/${worldId}/campaigns/${campaignId}/edit`)
                }
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

        {/* Description expandable */}
        {campaign.description ? (
          <ExpandableDescription text={campaign.description} />
        ) : (
          <div className="mt-4 border-t border-slate-800 pt-4">
            <p className="text-sm text-slate-600 italic">
              Aucune description pour cette campagne.
            </p>
          </div>
        )}
      </div>
      {/* ── SESSION EN COURS (si active) ── */}
      {campaign.isActive && (
        <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div>
              <p className="text-xs text-emerald-400 tracking-wider uppercase font-semibold">
                Campagne active
              </p>
              <p className="text-sm text-slate-400 mt-0.5">
                Cette campagne est actuellement en cours pour ce monde.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
