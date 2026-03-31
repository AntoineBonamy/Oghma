import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCampaignByIdApi, updateCampaignApi } from "@/api/campaigns";
import Button from "@/components/Button";
import Field from "@/components/Field";
 
export default function EditCampaignPage() {
  const { worldId, campaignId } = useParams<{ worldId: string; campaignId: string }>();
  const navigate = useNavigate();
 
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
 
  // Charger les données de la campagne
  useEffect(() => {
    if (!worldId || !campaignId) return;
 
    getCampaignByIdApi(worldId, campaignId)
      .then((c) => {
        setName(c.name);
        setDescription(c.description ?? "");
      })
      .catch(() => setError("Impossible de charger la campagne."))
      .finally(() => setLoadingData(false));
  }, [worldId, campaignId]);
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worldId || !campaignId) return;
 
    setError(null);
    setSaving(true);
 
    try {
      await updateCampaignApi(worldId, campaignId, { name, description });
      navigate(`/worlds/${worldId}/campaigns/${campaignId}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Une erreur est survenue.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };
 
  // ── LOADING ──
  if (loadingData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-4 bg-slate-800 rounded w-1/4" />
        <div className="h-48 bg-slate-800 rounded-xl" />
      </div>
    );
  }
 
  // ── ERROR FETCH ──
  if (error && !name) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-red-950/40 border border-red-900/50 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
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
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
 
      {/* Back */}
      <button
        onClick={() => navigate(`/worlds/${worldId}/campaigns/${campaignId}`)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Retour à la campagne
      </button>
 
      {/* Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h1 className="text-lg font-bold text-slate-100 mb-1">Modifier la campagne</h1>
        <p className="text-sm text-slate-500 mb-6">
          Mettez à jour le nom ou la description.
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
            placeholder="La Chute de l'Empire…"
            required
          />
 
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-slate-300">
              Description
              <span className="ml-1.5 text-slate-600 font-normal">(optionnelle)</span>
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
              onClick={() => navigate(`/worlds/${worldId}/campaigns/${campaignId}`)}
            >
              Annuler
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}