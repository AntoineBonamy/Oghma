import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createCampaignApi } from "@/api/campaigns";
import Button from "@/components/Button";
import Field from "@/components/Field";

export default function CreateCampaignPage() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worldId) return;

    setError(null);
    setLoading(true);

    try {
      const campaign = await createCampaignApi(worldId, { name, description });
      navigate(`/worlds/${worldId}/campaigns/${campaign.id}`);
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
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
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
        Retour au monde
      </button>

      {/* Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h1 className="text-lg font-bold text-slate-100 mb-1">
          Nouvelle Campagne
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Donnez un nom et une description à votre campagne.
        </p>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field
            label="Nom"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="L'île aux Tempêtes"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="description"
              className="text-sm font-medium text-slate-300"
            >
              Description
              <span className="ml-1.5 text-slate-600 font-normal">
                (optionnelle)
              </span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Une courte description de la campagne…"
              rows={4}
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600 resize-none transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate(`worlds/${worldId}`)}
            >
              Annuler
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              Créer la campagne
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
