"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth/AuthContext";
import { registerUser, loginUser } from "@/lib/api/auth/auth";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Must contain at least one uppercase letter";
  if (!/[0-9]/.test(password)) return "Must contain at least one digit";
  return null;
}

export default function Register() {
  const { login } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const pwError = validatePassword(password);
    if (pwError) return setError(pwError);

    setLoading(true);

    try {
      await registerUser({
        email,
        password,
        full_name: fullName || undefined,
      });

      const token = await loginUser({ email, password });
      await login(token.access_token);

      router.push("/");
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
          style={{
            background:
              "linear-gradient(90deg, #6366f1, #818cf8, #14b8a6)",
          }}
        />

        <div className="absolute top-[-120px] left-[-90px] w-[380px] h-[380px] rounded-full bg-[#6366f1]/10 blur-[100px]" />
        <div className="absolute bottom-[-100px] right-[-70px] w-[280px] h-[280px] rounded-full bg-[#14b8a6]/08 blur-[80px]" />

        <div className="relative z-10 text-[16px] font-semibold text-[#3f3f46] tracking-tight">
          Orca<span className="text-[#71717a]">ML</span>
        </div>

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
            Créez votre<br />
            compte et<br />
            démarrez avec<br />
            <span className="text-[#818cf8]">OrcaML</span>
          </div>

          <p className="text-[15px] text-[#52525b] leading-[1.9] max-w-[270px]">
            Rejoignez la plateforme pour gérer vos datasets,
            modèles et pipelines ML en un seul endroit.
          </p>
        </div>

        <div className="relative z-10 w-8 h-px bg-[#27272f]" />
      </div>

      {/* ── DROITE ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background px-6 py-12 sm:px-14">

        <div className="w-full max-w-[400px]">

          {/* HEADER */}
          <div className="mb-10">

            <h1 className="text-[30px] font-semibold tracking-tight text-foreground mb-2">
              Créer un compte
            </h1>

            <p className="text-[15px] text-[var(--text-3)] leading-7">
              Inscrivez-vous pour accéder à OrcaML.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* FULL NAME */}
            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-3)] uppercase tracking-[0.8px] mb-2">
                Nom complet
              </label>

              <div className="flex items-center bg-[var(--bg-2)] border border-[var(--border-2)] rounded-[10px] px-4 py-[14px] focus-within:border-[var(--primary)]">

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="flex-1 bg-transparent text-[15px] outline-none text-foreground"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-3)] uppercase tracking-[0.8px] mb-2">
                Adresse email
              </label>

              <div className="flex items-center bg-[var(--bg-2)] border border-[var(--border-2)] rounded-[10px] px-4 py-[14px] focus-within:border-[var(--primary)]">

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@entreprise.com"
                  className="flex-1 bg-transparent text-[15px] outline-none text-foreground"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-3)] uppercase tracking-[0.8px] mb-2">
                Mot de passe
              </label>

              <div className="flex items-center bg-[var(--bg-2)] border border-[var(--border-2)] rounded-[10px] px-4 py-[14px] focus-within:border-[var(--primary)]">

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-[15px] outline-none text-foreground"
                />
              </div>

              <p className="text-[12px] text-[var(--text-3)] mt-2">
                Min 8 caractères, 1 majuscule, 1 chiffre
              </p>
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
              className="w-full py-[15px] bg-[var(--primary)] hover:bg-[var(--accent-3)] text-white rounded-[10px] text-[15px] font-semibold disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer un compte"}
            </button>
          </form>

          {/* FOOTER */}
          <p className="mt-7 text-center text-[14px] text-[var(--text-3)]">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-[var(--primary)] font-semibold">
              Se connecter
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}