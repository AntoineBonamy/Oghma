import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getWorldByIdApi, updateWorldApi } from "@/api/worlds";
import Button from "@/components/Button";
import Field from "@/components/Field";
 
export default function EditWorldPage() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
 
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  useEffect(() => {
    if (!worldId) return;
    getWorldByIdApi(worldId)
      .then((world) => {
        setName(world.name);
        setDescription(world.description ?? "");
      })
      .catch(() => setError("Monde introuvable."))
      .finally(() => setFetching(false));
  }, [worldId]);
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
 
    if (!name.trim()) {
      setError("Le nom du monde est requis.");
      return;
    }
 
    setLoading(true);
    try {
      await updateWorldApi(worldId!, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      navigate(`/worlds/${worldId}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Une erreur est survenue.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };
 
  if (fetching) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-4 bg-slate-800 rounded w-1/3" />
        <div className="h-10 bg-slate-800 rounded" />
        <div className="h-24 bg-slate-800 rounded" />
      </div>
    );
  }
 
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
 
      {/* Back */}
      <button
        onClick={() => navigate(`/worlds/${worldId}`)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Retour au monde
      </button>
 
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-widest uppercase text-slate-100">
          Modifier le monde
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Mettez à jour les informations de votre monde.
        </p>
      </div>
 
      {/* Formulaire */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
 
          <Field
            label="Nom du monde"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
 
          <div className="space-y-1.5">
            <label className="block text-xs tracking-widest uppercase text-slate-500">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={[
                "w-full bg-slate-950/60 border border-slate-700 rounded px-3 py-2.5",
                "text-slate-200 placeholder-slate-600 text-sm resize-none",
                "focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600/30",
                "transition-colors",
              ].join(" ")}
            />
          </div>
 
          {error && (
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-900/50 rounded px-3 py-2">
              {error}
            </p>
          )}
 
          {/* Boutons empilés sur mobile, côte à côte sur desktop */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Button type="submit" loading={loading} size="lg" className="flex-1">
              Sauvegarder
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => navigate(`/worlds/${worldId}`)}
              className="flex-1 sm:flex-none"
            >
              Annuler
            </Button>
          </div>
 
        </form>
      </div>
 
    </div>
  );
}