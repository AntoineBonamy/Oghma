import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/Authcontext";
import { loginApi } from "@/api/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginApi({ email, password });
      login(data.user, data.accessToken, data.refreshToken);
      navigate("/");
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-violet-700/50 bg-violet-950/50 mb-4">
            <span className="text-violet-400 text-xl leading-none">᛭</span>
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-slate-100 uppercase">
            Oghma
          </h1>
          <p className="text-slate-500 text-sm mt-1 italic">
            Le grimoire du Maître du Jeu
          </p>
        </div>
        {/* Carte */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs tracking-widest uppercase text-slate-500"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aventurier@royaume.com"
                className="w-full bg-slate-950/60 border border-slate-700 rounded px-3 py-2.5 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600/30 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs tracking-widest uppercase text-slate-500"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/60 border border-slate-700 rounded px-3 py-2.5 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600/30 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-950/40 border border-red-900/50 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-violet-700 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-100 text-xs tracking-widest uppercase font-semibold rounded py-3 transition-colors"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>

        {/* Lien inscription */}
        <p className="text-center text-slate-600 text-sm mt-5">
          Pas encore de compte ?{" "}
          <Link
            to="/register"
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
