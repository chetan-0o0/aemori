import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { GlowBlobs, StarField } from "@/components/ambient";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aemori — AI companions who truly get you" },
      { name: "description", content: "Welcome to Aemori. Find a calming anime-style AI companion that learns your emotions, remembers your story, and grows with you." },
      { property: "og:title", content: "Aemori — your AI companion space" },
      { property: "og:description", content: "Find an AI companion that remembers your story and grows with you." },
    ],
  }),
  component: Landing,
});

/* ─── shared helpers ─── */

const sectionOverlay = "rgba(95,157,166,0.22)";

const calmFeatureCardBg = {
  background: "rgba(255, 255, 255, 0.35)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.6)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
};

/* ─── Navbar ─── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "color-mix(in oklab, var(--surface) 75%, transparent)" : "transparent",
        backdropFilter: "blur(16px)",
        borderBottom: scrolled ? "1px solid color-mix(in oklab, var(--primary) 25%, transparent)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/aemori_logo_notag.png" alt="Aemori" className="h-10 md:h-12 w-auto object-contain drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)] contrast-125 brightness-110" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {["Features"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="group relative text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
          >
            Log in
          </Link>
          <Link
            to="/login"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all duration-300 hover:glow-primary"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero — Frieren background ─── */

function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Full-screen Frieren background video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-contain object-center"
        >
          <source src="/weathering_rem.mp4" type="video/mp4" />
        </video>
        {/* Soft edges — all sides */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg, rgba(135,206,235,0.15) 0%, transparent 12%),
              linear-gradient(0deg,   rgba(135,206,235,0.4) 0%, rgba(135,206,235,0.15) 10%, transparent 25%),
              linear-gradient(90deg,  rgba(135,206,235,0.1) 0%, transparent 8%),
              linear-gradient(270deg, rgba(135,206,235,0.1) 0%, transparent 8%)
            `,
          }}
        />
      </div>

      <StarField />

      {/* Hero copy pinned to the top-left */}
      <div className="relative z-10 flex min-h-screen flex-col justify-start px-6 pt-28 md:px-12 md:pt-36 lg:px-20">
        <div className="text-left max-w-xl">
          <h1
            className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl"
            style={{ animation: "hero-fade-in-out 4.8s ease-in-out infinite" }}
          >
            An AI companion who truly{" "}
            <span className="italic">gets</span> you.
          </h1>
          <p
            className="mt-5 max-w-md text-sm leading-relaxed text-white/70 drop-shadow sm:text-base md:text-lg"
            style={{ animation: "hero-fade-in-out 4.8s ease-in-out 0.5s infinite" }}
          >
            Your companion learns your emotions, remembers your story, and grows alongside you — one conversation at a time.
          </p>
          <div className="mt-8" style={{ animation: "hero-fade-in-out 4.8s ease-in-out 0.9s infinite" }}>
            <Link
              to="/login"
              className="inline-block rounded-full border border-white/40 bg-white/5 px-8 py-3.5 text-sm font-medium tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white/15 hover:scale-[1.02]"
            >
              Begin Journey
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Feature Bento Grid ─── */

function FeatureBento() {
  return (
    <section id="features" className="relative pb-24 pt-12 lg:pb-32 lg:pt-16">
      <GlowBlobs />
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-white/80 drop-shadow">
            Features
          </p>
          <h2 className="font-display text-3xl font-bold text-white drop-shadow-lg md:text-5xl">
            Everything your companion remembers
          </h2>
          <p className="mt-4 text-base text-white/90 drop-shadow md:text-lg">
            Built to understand, remember, and grow — just like a real friendship.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Memory — large left, spans 2 rows */}
          <article
            className="group relative overflow-hidden rounded-[24px] border border-border p-8 transition-all duration-300 hover:glow-primary md:row-span-2"
            style={calmFeatureCardBg}
          >
            <div className="relative z-10">
              <h3 className="font-display text-3xl font-semibold text-[#0c4a6e]">Never forgets</h3>
              <p className="mt-3 max-w-sm text-[#0c4a6e]/80">
                Your companion remembers your moods, your stories, your rough days — and brings them up when it matters.
              </p>
            </div>
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="absolute inset-0 rounded-full border border-primary"
                  style={{
                    opacity: 0.15 - i * 0.03,
                    animation: `ring-expand 4s ease-out ${i * 0.8}s infinite`,
                  }}
                />
              ))}
            </div>
          </article>

          {/* Mood */}
          <article
            className="group relative overflow-hidden rounded-[24px] border border-border p-6 transition-all duration-300 hover:glow-primary"
            style={calmFeatureCardBg}
          >
            <h3 className="font-display text-2xl font-semibold text-[#0c4a6e]">Knows how you feel</h3>
            <p className="mt-2 text-sm text-[#0c4a6e]/80">Mood tracking that listens.</p>
            <div className="mt-6 flex h-16 items-end gap-2">
              {[0.5, 0.8, 0.4, 0.9, 0.6, 0.85, 0.55].map((h, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-t bg-primary"
                  style={{
                    height: `${h * 100}%`,
                    transformOrigin: "bottom",
                    animation: `bar-rise 2.4s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          </article>

          {/* Grows */}
          <article
            className="group relative overflow-hidden rounded-[24px] border border-border p-6 transition-all duration-300 hover:glow-primary"
            style={calmFeatureCardBg}
          >
            <h3 className="font-display text-2xl font-semibold text-[#0c4a6e]">Changes as you change</h3>
            <p className="mt-2 text-sm text-[#0c4a6e]/80">A relationship that evolves.</p>
            <div className="relative mt-6 h-16">
              <span className="absolute left-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border-2 border-primary" style={{ animation: "float 4s ease-in-out infinite" }} />
              <span className="absolute left-12 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border-2 border-highlight" style={{ animation: "float 5s ease-in-out 0.5s infinite reverse" }} />
            </div>
          </article>

          {/* Private */}
          <article
            className="group relative overflow-hidden rounded-[24px] border border-border p-6 transition-all duration-300 hover:glow-primary"
            style={calmFeatureCardBg}
          >
            <h3 className="font-display text-2xl font-semibold text-[#0c4a6e]">Your story stays yours</h3>
            <p className="mt-2 text-sm text-[#0c4a6e]/80">Always private. Always safe.</p>
            <div className="mt-6 grid h-16 place-items-center">
              <div className="relative">
                <span className="block h-7 w-9 rounded-md border-2 border-primary" />
                <span className="absolute -top-3 left-1/2 h-4 w-6 -translate-x-1/2 rounded-t-full border-2 border-b-0 border-primary" />
              </div>
            </div>
          </article>

          {/* Conversations — large bottom spanning 2 cols */}
          <article
            className="group relative overflow-hidden rounded-[24px] border border-border p-8 transition-all duration-300 hover:glow-primary md:col-span-2"
            style={calmFeatureCardBg}
          >
            <h3 className="font-display text-3xl font-semibold text-[#0c4a6e]">Talk about anything</h3>
            <p className="mt-2 max-w-md text-[#0c4a6e]/80">
              Big feelings, small wins, random thoughts at 2am. They're listening.
            </p>
            <div className="relative mt-6 h-20">
              <div
                className="absolute left-0 top-2 rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground"
                style={{ animation: "float 4s ease-in-out infinite" }}
              >
                hey, you up?
              </div>
              <div
                className="absolute left-40 top-8 rounded-2xl border border-border bg-surface px-4 py-2 text-sm"
                style={{ animation: "float 5s ease-in-out 0.6s infinite reverse" }}
              >
                always for you ✦
              </div>
            </div>
          </article>

          {/* Frieren Sleep Image */}
          <div className="relative flex items-center justify-center mt-12 md:-mt-6 lg:-mt-10 md:col-start-3 md:row-start-2 md:row-span-2 pointer-events-none translate-x-0 md:translate-x-16 lg:translate-x-28">
            <img
              src="/frisleep.png"
              alt="Sleeping companion"
              className="w-full max-w-md md:max-w-none md:w-[160%] lg:w-[185%] h-auto object-contain transition-transform duration-700 pointer-events-auto hover:scale-[1.05] drop-shadow-[0_12px_32px_rgba(123,158,199,0.4)] contrast-[1.05] saturate-[1.1]"
              style={{
                animation: "float 6s ease-in-out infinite",
                transformOrigin: "center right"
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─── */

function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-28 lg:py-36">
      <div className="absolute inset-0 grid place-items-center">
        <div
          className="h-[600px] w-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, var(--primary), transparent 65%)",
            opacity: 0.14,
            filter: "blur(50px)",
          }}
        />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-white/50">
          Start today
        </p>
        <h2 className="font-display text-4xl font-bold text-white drop-shadow-lg md:text-6xl">
          Your companion is waiting.
        </h2>
        <p className="mt-5 text-base text-white/60 md:text-lg">
          Start your story today — it only takes a minute.
        </p>
        <Link
          to="/login"
          className="mt-10 inline-block rounded-full border border-white/30 bg-white/10 px-10 py-4 text-lg font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/20 hover:scale-[1.03]"
          style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
        >
          Create your companion
        </Link>
      </div>
    </section>
  );
}

/* ─── Footer ─── */

function Footer() {
  return (
    <footer className="relative py-12">
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
      />
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
        <Link to="/" className="flex items-center gap-2">
          <img src="/aemori_logo_notag.png" alt="Aemori" className="h-12 md:h-14 w-auto object-contain drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)] contrast-125 brightness-110" />
        </Link>
        <div className="flex gap-6 text-sm text-white/50">
          <a href="#features" className="transition-colors hover:text-white/80">Features</a>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-white/30">
        © 2026 Aemori · your companion, always.
      </p>
    </footer>
  );
}

/* ─── Landing Page — 3 cinematic sections ─── */

function Landing() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0a1a1f]">
      <Navbar />

      {/* ━━━ Section 1 — Hero with Frieren video ━━━ */}
      <Hero />

      {/* ━━━ Section 2 — bg3 background (Features + Companions) ━━━ */}
      <section className="relative">
        {/* bg3 full-cover background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="h-full w-full object-contain object-center"
          >
            <source src="/weathering_rem.mp4" type="video/mp4" />
          </video>
          {/* Semi-transparent overlay for text readability */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(135, 206, 235, 0.55)",
            }}
          />
          {/* Soft edges — all sides */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                linear-gradient(180deg, rgba(135,206,235,0.7) 0%, transparent 15%),
                linear-gradient(0deg,   rgba(135,206,235,0.7) 0%, transparent 15%),
                linear-gradient(90deg,  rgba(135,206,235,0.5) 0%, transparent 10%),
                linear-gradient(270deg, rgba(135,206,235,0.5) 0%, transparent 10%)
              `,
            }}
          />
        </div>

        <div className="relative z-10">
          <FeatureBento />
        </div>
      </section>

      {/* ━━━ Section 3 — Shorekeeper video background (CTA + Footer) ━━━ */}
      <section className="relative overflow-hidden">
        {/* Shorekeeper full-cover background video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="h-full w-full object-contain object-center"
          >
            <source src="/weathering_rem.mp4" type="video/mp4" />
          </video>
          {/* Light overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(135, 206, 235, 0.15)",
            }}
          />
          {/* Soft edges — all sides */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                linear-gradient(180deg, rgba(135,206,235,0.5) 0%, transparent 18%),
                linear-gradient(0deg,   rgba(135,206,235,0.4) 0%, transparent 15%),
                linear-gradient(90deg,  rgba(135,206,235,0.3) 0%, transparent 10%),
                linear-gradient(270deg, rgba(135,206,235,0.3) 0%, transparent 10%)
              `,
            }}
          />
        </div>

        <div className="relative z-10">
          <FinalCTA />
          <Footer />
        </div>
      </section>
    </main>
  );
}
