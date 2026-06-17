import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GlowBlobs, StarField } from "@/components/ambient";
import { useAuth, ACCOUNTS, logout as doLogoutRaw } from "@/lib/auth";
import { getPersona, getCompanion } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Aemori" },
      { name: "description", content: "Log in to your Aemori companion space." },
    ],
  }),
  component: Login,
});

/**
 * After login, figure out where the user should go based on their saved data:
 *  - Has persona + companion → /hub (everything is set up)
 *  - Has persona only       → /space (needs to create companion)
 *  - Has nothing             → /setup (first time)
 */
function getPostLoginRoute(): "/hub" | "/space" | "/setup" {
  const persona = getPersona();
  const companion = getCompanion();
  if (persona && companion) return "/hub";
  if (persona) return "/space";
  return "/setup";
}

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showAccounts, setShowAccounts] = useState(false);

  // Always log out the previous session when visiting /login
  // so the form is always shown and the user can pick a different account.
  useState(() => {
    doLogoutRaw();
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = login(username, password);
    if (result) {
      // Smart redirect based on existing data for this account
      navigate({ to: getPostLoginRoute() });
    } else {
      setError("Invalid username or password");
    }
  };

  const quickLogin = (acc: typeof ACCOUNTS[number]) => {
    setUsername(acc.username);
    setPassword(acc.password);
    const result = login(acc.username, acc.password);
    if (result) {
      navigate({ to: getPostLoginRoute() });
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a1a1f]">
      <StarField />
      <GlowBlobs />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        {/* Logo */}
        <div className="mb-8" style={{ animation: "fade-up 0.6s ease-out" }}>
          <img
            src="/aemori_logo_notag.png"
            alt="Aemori"
            className="h-14 md:h-16 w-auto object-contain drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)] contrast-125 brightness-110"
          />
        </div>

        {/* Login Card */}
        <div
          className="w-full max-w-[420px] rounded-[28px] p-8 md:p-10"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.3), 0 0 60px rgba(95, 157, 166, 0.1)",
            animation: "fade-up 0.6s ease-out 0.15s both",
          }}
        >
          <h1 className="font-display text-3xl font-bold text-white text-center mb-2">
            Welcome back
          </h1>
          <p className="text-center text-sm text-white/50 mb-8">
            Sign in to your companion space
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40">
                Username
              </label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder="Enter your username"
                autoComplete="username"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-white/30 focus:bg-white/8 focus:shadow-[0_0_20px_rgba(95,157,166,0.15)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-white/30 focus:bg-white/8 focus:shadow-[0_0_20px_rgba(95,157,166,0.15)]"
              />
            </div>

            {error && (
              <div
                className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300 text-center"
                style={{ animation: "fade-up 0.3s ease-out" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!username.trim() || !password.trim()}
              className="w-full rounded-full bg-primary py-3.5 font-medium text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(95,157,166,0.3)] disabled:opacity-40 disabled:hover:scale-100"
            >
              Sign in
            </button>
          </form>

          {/* Quick access toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowAccounts(!showAccounts)}
              className="text-xs text-white/40 transition-colors hover:text-white/70"
            >
              {showAccounts ? "Hide accounts ↑" : "Show available accounts ↓"}
            </button>
          </div>
        </div>

        {/* Quick Access Account Grid */}
        {showAccounts && (
          <div
            className="mt-6 w-full max-w-[520px]"
            style={{ animation: "fade-up 0.4s ease-out" }}
          >
            <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-white/30">
              Quick login — tap any account
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  onClick={() => quickLogin(acc)}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-white/8 bg-white/5 px-3 py-4 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:scale-[1.05] hover:shadow-[0_8px_30px_rgba(95,157,166,0.15)]"
                >
                  <span className="text-2xl transition-transform duration-300 group-hover:scale-125">
                    {acc.emoji}
                  </span>
                  <span className="text-xs font-medium text-white/70 group-hover:text-white">
                    {acc.displayName}
                  </span>
                  <span className="text-[10px] text-white/30 font-mono">
                    {acc.username}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] text-white/25">
              Password format: <span className="font-mono text-white/40">username123</span>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
