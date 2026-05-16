"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth/AuthContext";
import { loginUser } from "@/lib/api/auth/auth";

export default function Login() {
  const { login }       = useAuth();
  const router          = useRouter();
  const searchParams    = useSearchParams();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = await loginUser({ email, password });
      await login(token.access_token);

      // Redirige vers la page demandée avant le login, sinon /projects par défaut
      const from = searchParams.get("from") ?? "/projects";
      router.push(from);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex font-sans">

      {/* ── GAUCHE ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#0f0f11] p-14 overflow-hidden relative select-none">

        <div
          className="absolute top-0 left-0 right-0 h-[1.5px]"
          style={{ background: "linear-gradient(90deg, #6366f1, #818cf8, #14b8a6)" }}
        />

        <div className="absolute top-[-120px] left-[-90px] w-[380px] h-[380px] rounded-full bg-[#6366f1]/10 blur-[100px]" />
        <div className="absolute bottom-[-100px] right-[-70px] w-[280px] h-[280px] rounded-full bg-[#14b8a6]/08 blur-[80px]" />

        {/* LOGO */}
        <div className="relative z-10 text-[16px] font-semibold text-[#3f3f46] tracking-tight">
          Orca<span className="text-[#71717a]">ML</span>
        </div>

        {/* CENTER */}
        <div className="relative z-10 flex flex-col gap-8">

          <div className="flex items-center gap-4">
            <div className="w-[72px] h-[72px] rounded-[18px] bg-[#18181b] border border-[#27272f] flex items-center justify-center">
              <Image
                src="/logo 1.png"
                alt="OrcaML Logo"
                width={54}
                height={54}
                className="object-contain"
                priority
              />
            </div>
            <div className="text-[26px] font-bold text-[#f4f4f5] tracking-tight">
              Orca<span className="text-[#818cf8]">ML</span>
            </div>
          </div>

          <div className="text-[36px] font-bold text-[#f4f4f5] leading-[1.15] tracking-tight">
            Vos modèles,<br />
            prêts pour<br />
            <span className="text-[#818cf8]">la production.</span>
          </div>

          <p className="text-[15px] text-[#52525b] leading-[1.9] max-w-[270px]">
            De la donnée brute à un modèle en production —{" "}
            <span className="text-[#71717a] font-medium">
              gérez l'intégralité de votre cycle ML
            </span>{" "}
            sur une seule plateforme.
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "Pipeline ML",      color: "#6366f1" },
              { label: "Dataset cleaning", color: "#14b8a6" },
              { label: "Entraînement",     color: "#818cf8" },
              { label: "Déploiement",      color: "#ec4899" },
            ].map((tag) => (
              <div
                key={tag.label}
                className="flex items-center gap-1.5 bg-[#18181b] border border-[#27272f] rounded-[8px] px-3 py-[6px]"
              >
                <span className="w-[6px] h-[6px] rounded-full" style={{ background: tag.color }} />
                <span className="text-[12px] text-[#52525b] font-medium">{tag.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 w-8 h-px bg-[#27272f]" />
      </div>

      {/* ── DROITE ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background px-6 py-12 sm:px-14 relative">

        <div className="w-full max-w-[400px]">

          {/* HEADER */}
          <div className="mb-10">
            <h1 className="text-[30px] font-semibold tracking-tight text-foreground mb-2">
              Bon retour
            </h1>
            <p className="text-[15px] text-[var(--text-3)] leading-7">
              Connectez-vous pour accéder à votre espace OrcaML et continuer vos projets.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* EMAIL */}
            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-3)] uppercase tracking-[0.8px] mb-2">
                Adresse email
              </label>
              <div className="flex items-center gap-2 bg-[var(--bg-2)] border border-[var(--border-2)] rounded-[10px] px-4 py-[14px] focus-within:border-[var(--primary)] transition-colors">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@entreprise.com"
                  className="flex-1 bg-transparent text-[15px] text-foreground placeholder-[var(--text-3)]/60 outline-none"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[12px] font-semibold text-[var(--text-3)] uppercase tracking-[0.8px]">
                  Mot de passe
                </label>
                <Link href="#" className="text-[13px] text-[var(--primary)] hover:opacity-80">
                  Oublié ?
                </Link>
              </div>
              <div className="flex items-center gap-2 bg-[var(--bg-2)] border border-[var(--border-2)] rounded-[10px] px-4 py-[14px] focus-within:border-[var(--primary)] transition-colors">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-[15px] text-foreground placeholder-[var(--text-3)]/60 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[var(--text-3)] hover:text-foreground text-[15px]"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="text-[14px] text-red-500 bg-red-50 border border-red-200 rounded-[10px] px-4 py-3">
                {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-[15px] bg-[var(--primary)] hover:bg-[var(--accent-3)] text-white rounded-[10px] text-[15px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-7 text-center text-[14px] text-[var(--text-3)]">
            Pas encore de compte ?{" "}
            <Link href="/auth/register" className="text-[var(--primary)] font-semibold">
              Créer un accès
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}