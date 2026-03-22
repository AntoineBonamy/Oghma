import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/Authcontext";
import { loginApi } from "@/api/auth";
import Button from "@/components/Button";
import Field from "@/components/Field";

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
      navigate("/worlds");
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
            <Field
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aventurier@royaume.com"
            />

            <Field
              label="Mot de passe"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {error && (
              <p className="text-red-400 text-sm bg-red-950/40 border border-red-900/50 rounded px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Se connecter
            </Button>
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
