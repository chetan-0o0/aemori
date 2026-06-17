import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ParticlesDrift } from "@/components/ambient";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCompanion, usePersona } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/space")({
  head: () => ({
    meta: [
      { title: "Your space — AniMind" },
      { name: "description", content: "Your quiet corner. Your companion is one breath away." },
    ],
  }),
  component: Space,
});

function Space() {
  const [persona] = usePersona();
  const [companion] = useCompanion();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) navigate({ to: "/login" });
  }, [isLoggedIn, navigate]);

  // If companion exists, hub takes over.
  useEffect(() => {
    if (companion) navigate({ to: "/hub" });
  }, [companion, navigate]);

  return (
    <main className="calm-page relative min-h-screen overflow-hidden">
      <ParticlesDrift />

      {/* top bar */}
      <div className="relative flex items-center justify-between px-6 py-5">
        <div className="calm-panel flex items-center gap-3 rounded-full px-3 py-2">
          <div
            className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            style={persona?.avatar ? { background: `url(${persona.avatar}) center/cover` } : {}}
          >
            {!persona?.avatar && (persona?.name?.[0]?.toUpperCase() ?? "Y")}
          </div>
          <span className="text-sm">{persona?.name ?? "you"}</span>
          {persona?.pronouns && (
            <span className="text-xs text-muted-foreground">· {persona.pronouns}</span>
          )}
        </div>
        <ThemeToggle />
      </div>

      {/* center */}
      <div className="relative grid min-h-[calc(100vh-100px)] place-items-center px-6">
        <div className="relative flex flex-col items-center text-center">
          {/* concentric rings */}
          <div className="relative mb-12 grid h-72 w-72 place-items-center">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="absolute inset-0 rounded-full border border-primary"
                style={{
                  opacity: 0.15,
                  animation: `ring-expand 6s ease-out ${i * 2}s infinite`,
                }}
              />
            ))}
            <div className="relative z-10 max-w-xs">
              <h1 className="font-display text-3xl font-medium text-foreground">Your companion hasn't arrived yet.</h1>
            </div>
          </div>

          <p className="mb-8 text-muted-foreground">When you're ready, call them into being.</p>

          <Link
            to="/create"
            className="rounded-full bg-primary px-8 py-3.5 font-medium text-primary-foreground transition-all duration-300 hover:scale-[1.03]"
            style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
          >
            Create your buddy
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">You can only have one companion — choose thoughtfully.</p>
        </div>
      </div>
    </main>
  );
}
