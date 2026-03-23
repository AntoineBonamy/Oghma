import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWorldApi } from "@/api/worlds";
import Button from "@/components/Button";
import Field from "@/components/Field";

export default function CreateWorldPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Le nom du monde est requis.");
      return;
    }

    setLoading(true);
    try {
      const world = await createWorldApi({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      navigate(`/worlds/${world.id}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Une erreur est survenue.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">

      {/* Back */}
      <button
        onClick={() => navigate("/worlds")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Retour aux mondes
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-violet-700/50 bg-violet-950/50 mb-4">
          <span className="text-violet-400 text-base leading-none">᛭</span>
        </div>
        <h1 className="text-xl font-bold tracking-widest uppercase text-slate-100">
          Nouveau monde
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Définissez le cadre de vos aventures.
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
            placeholder="Ex : Terres de Valdris"
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs tracking-widest uppercase text-slate-500">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre monde, son ambiance, ses règles…"
              rows={4}
              className={[
                "w-full bg-slate-950/60 border border-slate-700 rounded px-3 py-2.5",
                "text-slate-200 placeholder-slate-600 text-sm resize-none",
                "focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600/30",
                "transition-colors",
              ].join(" ")}
            />
            <p className="text-slate-600 text-xs">Optionnel — vous pourrez la modifier plus tard.</p>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-900/50 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" loading={loading} size="lg" className="flex-1">
              Créer le monde
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => navigate("/worlds")}
            >
              Annuler
            </Button>
          </div>

        </form>
      </div>

    </div>
  );
}
