import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { GlowBlobs } from "@/components/ambient";
import { usePersona } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Set up your AniMind" },
      { name: "description", content: "Tell AniMind a little about you to begin." },
    ],
  }),
  component: Setup,
});

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="mb-10 flex items-center justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: i === step ? 36 : 16,
            background: i <= step ? "var(--primary)" : "color-mix(in oklab, var(--primary) 25%, transparent)",
          }}
        />
      ))}
    </div>
  );
}

function Setup() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [existingPersona, setPersona] = usePersona();
  const [step, setStep] = useState(0);

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) navigate({ to: "/login" });
  }, [isLoggedIn, navigate]);

  // If persona already exists for this account, skip setup entirely
  useEffect(() => {
    if (existingPersona) navigate({ to: "/space" });
  }, [existingPersona, navigate]);

  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [customPronouns, setCustomPronouns] = useState("");
  const [d, setD] = useState("");
  const [m, setM] = useState("");
  const [y, setY] = useState("");
  const [bio, setBio] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const onAvatar = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setAvatar(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const finish = () => {
    setPersona({
      name: name || "friend",
      pronouns: pronouns === "custom" ? customPronouns : pronouns,
      dob: { d, m, y },
      bio,
      avatar,
    });
    navigate({ to: "/space" });
  };

  return (
    <main className="calm-page relative grid min-h-screen place-items-center overflow-hidden px-4 py-16">
      <GlowBlobs />

      <div className="relative w-full max-w-[500px]" style={{ animation: "fade-up 0.6s ease-out" }}>
        <ProgressDots step={step} />

        <div key={step} className="glass rounded-[24px] p-8 md:p-10" style={{ animation: "fade-up 0.5s ease-out" }}>
          {step === 0 && (
            <div className="space-y-8">
              <h1 className="font-display text-3xl font-semibold md:text-4xl">First, let's meet you.</h1>

              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="group relative grid h-32 w-32 place-items-center rounded-full border-2 border-dashed border-primary/60 transition-all duration-300 hover:border-primary hover:glow-primary"
                  style={{ background: avatar ? `url(${avatar}) center/cover` : "transparent" }}
                >
                  {!avatar && (
                    <span className="text-3xl text-primary">+</span>
                  )}
                  <span className="absolute inset-0 grid place-items-center rounded-full bg-background/70 text-xs text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    add a photo
                  </span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onAvatar(e.target.files[0])}
                />
              </div>

              <div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should we call you?"
                  className="w-full border-0 border-b border-border bg-transparent pb-3 text-center text-xl outline-none transition-all duration-300 focus:border-primary"
                  style={{ boxShadow: "none" }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px -8px var(--primary)")}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
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
            <div className="space-y-8">
              <h1 className="font-display text-3xl font-semibold md:text-4xl">Tell me a little more.</h1>

              <div>
                <label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">Pronouns</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { v: "She/Her" },
                    { v: "He/Him" },
                    { v: "They/Them" },
                  ].map((p) => (
                    <button
                      key={p.v}
                      onClick={() => setPronouns(p.v)}
                      className={`glass rounded-full px-5 py-2 text-sm transition-all duration-300 ${
                        pronouns === p.v ? "bg-primary text-primary-foreground" : "hover:bg-primary/15"
                      }`}
                      style={pronouns === p.v ? { background: "var(--primary)", color: "var(--primary-foreground)" } : {}}
                    >
                      {p.v}
                    </button>
                  ))}
                </div>
                <input
                  value={customPronouns}
                  onFocus={() => setPronouns("custom")}
                  onChange={(e) => setCustomPronouns(e.target.value)}
                  placeholder="or type your own (optional)"
                  className="mt-3 w-full border-0 border-b border-border bg-transparent pb-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">Date of birth</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { v: d, set: setD, p: "Day" },
                    { v: m, set: setM, p: "Month" },
                    { v: y, set: setY, p: "Year" },
                  ].map((f) => (
                    <input
                      key={f.p}
                      value={f.v}
                      onChange={(e) => f.set(e.target.value.replace(/\D/g, ""))}
                      placeholder={f.p}
                      maxLength={f.p === "Year" ? 4 : 2}
                      className="w-full border-0 border-b border-border bg-transparent pb-2 text-center outline-none focus:border-primary"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setStep(0)} className="grid h-11 w-11 place-items-center rounded-full border border-border transition-all duration-300 hover:bg-elevated">←</button>
                <button onClick={() => setStep(2)} className="flex-1 rounded-full bg-primary py-3.5 font-medium text-primary-foreground transition-all duration-300 hover:glow-primary">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <h1 className="font-display text-3xl font-semibold md:text-4xl">In your own words.</h1>
              <div className="relative">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 300))}
                  placeholder="Share a little about yourself — your interests, your life, what's on your mind lately…"
                  rows={6}
                  className="w-full resize-none rounded-2xl border border-border bg-elevated p-4 outline-none transition-all duration-300 focus:border-primary focus:glow-primary"
                />
                <span className="absolute bottom-3 right-4 text-xs text-muted-foreground">{bio.length}/300</span>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setStep(1)} className="grid h-11 w-11 place-items-center rounded-full border border-border transition-all duration-300 hover:bg-elevated">←</button>
                <button
                  onClick={finish}
                  className="flex-1 rounded-full bg-primary py-3.5 font-medium text-primary-foreground transition-all duration-300 hover:glow-primary"
                  style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
                >
                  Let's go →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
