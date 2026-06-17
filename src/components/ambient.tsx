import { useEffect, useMemo } from "react";

export function StarField({ count = 36 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 1.5 + 1,
        delay: Math.random() * 4,
        dur: 2 + Math.random() * 4,
      })),
    [count]
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-primary"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: 0.4,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function GlowBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute rounded-full"
        style={{
          width: 600, height: 600, top: "-10%", left: "-10%",
          background: "radial-gradient(circle, var(--primary), transparent 70%)",
          opacity: 0.08, filter: "blur(40px)",
          animation: "drift 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 500, height: 500, top: "30%", right: "-10%",
          background: "radial-gradient(circle, var(--highlight), transparent 70%)",
          opacity: 0.07, filter: "blur(40px)",
          animation: "drift 28s ease-in-out 4s infinite reverse",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 700, height: 700, bottom: "-20%", left: "20%",
          background: "radial-gradient(circle, var(--secondary), transparent 70%)",
          opacity: 0.06, filter: "blur(50px)",
          animation: "drift 30s ease-in-out 8s infinite",
        }}
      />
    </div>
  );
}

export function ParticlesDrift() {
  const dots = useMemo(
    () =>
      Array.from({ length: 24 }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 6,
        dur: 8 + Math.random() * 10,
      })),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-primary"
          style={{
            top: `${d.top}%`, left: `${d.left}%`,
            width: 3, height: 3, opacity: 0.35,
            animation: `float ${d.dur}s ease-in-out ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
