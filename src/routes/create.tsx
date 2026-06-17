import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GlowBlobs } from "@/components/ambient";
import { useCompanion } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create your companion — AniMind" },
      { name: "description", content: "Name them, give them a face, define their soul." },
    ],
  }),
  component: Create,
});

const SUGGESTED = ["Haru", "Yuki", "Ren", "Sora"];



function Create() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [, setCompanion] = useCompanion();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [personality, setPersonality] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) navigate({ to: "/login" });
  }, [isLoggedIn, navigate]);

  const finish = () => {
    setCompanion({ name: name.trim() || "Haru", color: "#A8D8EA", personality: personality.trim(), avatar });
    navigate({ to: "/hub" });
  };

  return (
    <main className="calm-page relative min-h-screen overflow-hidden px-4 py-16">
      <GlowBlobs />

      <div className="relative mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-8 lg:grid-cols-[35fr_65fr]">
        {/* preview */}
        <aside className="lg:sticky lg:top-16 lg:self-start">
          <div
            className="calm-panel relative h-[480px] overflow-hidden rounded-[24px] p-8 transition-all duration-700"
            style={{
              background: color
                ? `linear-gradient(180deg, var(--elevated) 0%, ${color}55 100%)`
                : "var(--elevated)",
              boxShadow: color ? `0 0 60px ${color}55` : undefined,
            }}
          >
            {!name && !color && (
              <div className="grid h-full place-items-center">
                <div className="relative grid h-40 w-40 place-items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="absolute inset-0 rounded-full border border-primary"
                      style={{ opacity: 0.18, animation: `ring-expand 5s ease-out ${i * 1.5}s infinite` }}
                    />
                  ))}
                  <p className="font-display text-sm text-muted-foreground">your companion</p>
                </div>
              </div>
            )}

            {(name || color) && (
              <div className="flex h-full flex-col items-center justify-between text-center">
                <div
                  className="grid h-28 w-28 place-items-center rounded-full font-display text-5xl font-semibold transition-all duration-500 overflow-hidden"
                  style={{
                    background: "#A8D8EA",
                    color: "#0D2033",
                    boxShadow: `0 0 40px #A8D8EA`,
                  }}
                >
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    (name || "?")[0].toUpperCase()
                  )}
                </div>
                <h2 className="font-display text-4xl font-semibold">{name || "unnamed"}</h2>
                <p className="max-w-[16rem] text-xs text-muted-foreground">
                  {personality || "their soul will live here"}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* form */}
        <section className="space-y-8">
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 flex-1 rounded-full transition-all duration-500"
                style={{ background: i <= step ? "var(--primary)" : "color-mix(in oklab, var(--primary) 25%, transparent)" }}
              />
            ))}
          </div>

          <div key={step} style={{ animation: "fade-up 0.5s ease-out" }}>
            {step === 0 && (
              <div className="calm-panel rounded-[24px] p-6 md:p-8 space-y-6">
                <h1 className="font-display text-4xl font-semibold">What will you call them?</h1>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Give them a name…"
                  className="w-full border-0 border-b border-border bg-transparent pb-3 text-center text-2xl outline-none transition-all duration-300 focus:border-primary"
                />
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {SUGGESTED.map((s) => (
                    <button
                      key={s}
                      onClick={() => setName(s)}
                      className={`rounded-full border border-border px-4 py-2 text-sm transition-all duration-300 ${
                        name === s ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  disabled={!name.trim()}
                  onClick={() => setStep(1)}
                  className="w-full rounded-full bg-primary py-3.5 font-medium text-primary-foreground transition-all duration-300 hover:glow-primary disabled:opacity-40"
                >
                  Continue →
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="calm-panel rounded-[24px] p-6 md:p-8 space-y-6">
                <h1 className="font-display text-4xl font-semibold">Give them a face.</h1>
                <div className="flex justify-center">
                  <label className="relative aspect-square w-full max-w-[200px] rounded-full transition-all duration-300 border-2 border-dashed border-primary/50 cursor-pointer hover:border-primary flex flex-col items-center justify-center text-muted-foreground hover:text-foreground">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => setAvatar(e.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {avatar ? (
                      <span className="text-sm font-medium text-primary">Change Avatar</span>
                    ) : (
                      <span className="text-sm font-medium">Upload Avatar</span>
                    )}
                  </label>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="grid h-11 w-11 place-items-center rounded-full border border-border transition-all duration-300 hover:bg-elevated">←</button>
                  <button
                    disabled={!avatar}
                    onClick={() => setStep(2)}
                    className="flex-1 rounded-full bg-primary py-3.5 font-medium text-primary-foreground transition-all duration-300 hover:glow-primary disabled:opacity-40"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="calm-panel rounded-[24px] p-6 md:p-8 space-y-6">
                <h1 className="font-display text-4xl font-semibold">Describe their soul.</h1>
                <div className="relative">
                  <textarea
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value.slice(0, 300))}
                    placeholder="Their personality, their tone, how they make you feel…"
                    rows={6}
                    className="w-full resize-none rounded-2xl border border-border bg-elevated p-4 outline-none transition-all duration-300 focus:border-primary focus:glow-primary"
                  />
                  <span className="absolute bottom-3 right-4 text-xs text-muted-foreground">{personality.length}/300</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="grid h-11 w-11 place-items-center rounded-full border border-border transition-all duration-300 hover:bg-elevated">←</button>
                  <button
                    onClick={finish}
                    className="flex-1 rounded-full bg-primary py-3.5 font-medium text-primary-foreground transition-all duration-300"
                    style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
                  >
                    Bring them to life →
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
