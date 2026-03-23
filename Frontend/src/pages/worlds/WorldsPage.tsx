import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWorldsApi, deleteWorldApi } from "@/api/worlds";
import type { World } from "@/api/worlds";
import { useAuth } from "@/contexts/Authcontext";
import Button from "@/components/Button";

////////////////////
// HELPERS
////////////////////

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 30) return `Il y a ${days} jours`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Il y a ${months} mois`;
  return `Il y a ${Math.floor(months / 12)} an(s)`;
}

////////////////////
// SKELETON CARD
////////////////////

function SkeletonCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
      <div className="h-4 bg-slate-800 rounded w-3/4 mb-3" />
      <div className="h-3 bg-slate-800 rounded w-full mb-2" />
      <div className="h-3 bg-slate-800 rounded w-2/3" />
      <div className="mt-6 flex justify-between items-center">
        <div className="h-3 bg-slate-800 rounded w-1/4" />
        <div className="h-3 bg-slate-800 rounded w-1/4" />
      </div>
    </div>
  );
}

////////////////////
// WORLD CARD
////////////////////

interface WorldCardProps {
  world: World;
  isMJ: boolean;
  onDelete: (id: string) => void;
}

function WorldCard({ world, isMJ, onDelete }: WorldCardProps) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      await deleteWorldApi(world.id);
      onDelete(world.id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/worlds/${world.id}`)}
      className="group relative bg-slate-900 border border-slate-800 hover:border-violet-700/50 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-violet-950/20"
    >
      {/* Accent top */}
      <div className="absolute top-0 left-5 right-5 h-px bg-linear-to-r from-transparent via-violet-700/30 to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-800/40 flex items-center justify-center text-violet-400 shrink-0 text-sm font-bold">
            {world.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="font-semibold text-slate-100 truncate">
            {world.name}
          </h3>
        </div>

        {isMJ && (
          <span className="text-[9px] tracking-widest uppercase font-bold text-violet-400 bg-violet-950/60 border border-violet-800/30 px-2 py-0.5 rounded shrink-0">
            MJ
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-slate-500 line-clamp-2 min-h-10">
        {world.description || (
          <span className="italic">Aucune description.</span>
        )}
      </p>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-600">
          {timeAgo(world.updatedAt)}
        </span>

        {isMJ && (
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/worlds/${world.id}/edit`);
              }}
              className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={[
                "text-xs px-2 py-1 rounded transition-colors",
                confirmDelete
                  ? "text-red-400 bg-red-950/40 border border-red-900/40"
                  : "text-slate-600 hover:text-red-400 hover:bg-slate-800",
              ].join(" ")}
            >
              {deleting ? "…" : confirmDelete ? "Confirmer ?" : "Supprimer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

////////////////////
// WORLDS PAGE
////////////////////

export default function WorldsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWorldsApi()
      .then(setWorlds)
      .catch(() => setError("Impossible de charger les mondes."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: string) => {
    setWorlds((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-widest uppercase text-slate-100">
            Mes Mondes
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {loading
              ? "Chargement…"
              : `${worlds.length} monde${worlds.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={() => navigate("/worlds/new")}>+ Nouveau monde</Button>
      </div>
      {/* Erreur */}
      {error && (
        <div className="bg-red-950/40 border border-red-900/50 rounded-lg px-4 py-3 text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && worlds.length === 0 && (
        <div className="text-center py-20 text-slate-600">
          <div className="text-4xl mb-4">᛭</div>
          <p className="text-sm tracking-wide">Aucun monde pour l'instant.</p>
          <p className="text-xs mt-1 mb-6">
            Créez votre premier monde pour commencer.
          </p>
          <Button onClick={() => navigate("/worlds/new")}>
            Créer un monde
          </Button>
        </div>
      )}

      {/* Grid */}
      {!loading && worlds.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {worlds.map((world) => (
            <WorldCard
              key={world.id}
              world={world}
              isMJ={world.ownerId === user?.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
