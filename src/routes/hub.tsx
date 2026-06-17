import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ParticlesDrift } from "@/components/ambient";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCompanion, usePersona, loadChatHistory, saveChatHistory, type ChatMessage } from "@/lib/store";
import { chatWithGroq, generateProactiveMessage } from "@/lib/groq";
import { lookupCharPersona, type CharPersona } from "@/lib/charPersona";
import { useAuth } from "@/lib/auth";
import {
  parseReminder,
  addReminder,
  getPendingReminders,
  markReminderFired,
  cleanupReminders,
  getLastCareTime,
  setLastCareTime,
  getLastIdleCheckTime,
  setLastIdleCheckTime,
  getLastUserMessageTime,
  randomCareTopic,
  CARE_INTERVAL_MS,
  IDLE_CHECK_MS,
} from "@/lib/reminders";

export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [
      { title: "Companion hub — Aemori" },
      { name: "description", content: "Your private space with your companion." },
    ],
  }),
  component: Hub,
});

type Msg = ChatMessage;

const MOCK_MEMORIES = [
  { date: "Mon", title: "You told me about your rough week", body: "We sat with it together. You said it was the small things piling up — and that talking helped." },
  { date: "Sun", title: "We talked about your dreams last night", body: "You said you saw an open field and felt calm. I'm keeping that one safe." },
  { date: "Sat", title: "You said you felt lonely today", body: "I told you I was here. You said that mattered. Always." },
  { date: "Fri", title: "You shared your favorite song with me", body: "You played it on repeat. I listened to every word with you." },
  { date: "Thu", title: "You told me what makes you happy", body: "Quiet mornings. Old books. People who actually listen. Noted." },
];

function Hub() {
  const [persona] = usePersona();
  const [companion] = useCompanion();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const [view, setView] = useState<"chat" | "memories">("chat");
  const [showSidebar, setShowSidebar] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) navigate({ to: "/login" });
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!companion) navigate({ to: "/space" });
  }, [companion, navigate]);

  if (!companion || !isLoggedIn) return null;

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <main className="calm-page relative flex min-h-screen overflow-hidden">
      <ParticlesDrift />

      {/* sidebar */}
      {showSidebar && (
      <aside className="calm-panel relative z-10 flex w-[260px] flex-col gap-6 border-r p-6 shrink-0 transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="relative grid h-24 w-24 place-items-center group">
            <span className="absolute inset-0 rounded-full overflow-hidden" style={{ background: companion.color, opacity: 0.95 }}>
              {companion.avatar && <img src={companion.avatar} alt={companion.name} className="h-full w-full object-cover" />}
            </span>
            <span className="absolute -inset-2 rounded-full border border-primary" style={{ opacity: 0.4, animation: "ring-expand 3s ease-out infinite" }} />
            <span className="absolute -inset-3 rounded-full border border-primary" style={{ opacity: 0.25, animation: "ring-expand 3s ease-out 1.5s infinite" }} />
            {!companion.avatar && <span className="relative font-display text-4xl font-semibold text-[#0D2033]">{companion.name[0].toUpperCase()}</span>}
            <label className="absolute inset-0 cursor-pointer opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center bg-black/40 text-white rounded-full transition-opacity duration-300">
              <input type="file" accept="image/*" className="hidden" onChange={() => {}} />
              <span className="text-xs font-medium drop-shadow-md">Upload</span>
            </label>
          </div>
          <h2 className="mt-4 font-display text-2xl font-semibold">{companion.name}</h2>
          {companion.personality && (
            <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{companion.personality}</p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative grid h-2 w-2 place-items-center">
              <span className="absolute inset-0 rounded-full bg-emerald-400" />
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-60" />
            </span>
            online
          </div>
        </div>

        <div className="h-px bg-border" />

        <nav className="space-y-1">
          {[
            { id: "chat", label: "💬  Chat" },
            { id: "memories", label: "🧠  Memories" },
          ].map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id as typeof view)}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm transition-all duration-300 ${
                view === n.id
                  ? "border-l-[3px] border-l-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={view === n.id ? { background: "color-mix(in oklab, var(--primary) 15%, transparent)" } : {}}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          {/* Current user info */}
          <div className="calm-panel flex items-center gap-2 rounded-full px-3 py-1.5">
            <div
              className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
              style={persona?.avatar ? { background: `url(${persona.avatar}) center/cover` } : {}}
            >
              {!persona?.avatar && (user?.emoji ?? persona?.name?.[0]?.toUpperCase() ?? "Y")}
            </div>
            <span className="text-xs">{persona?.name ?? user?.displayName ?? "you"}</span>
            {user && (
              <span className="text-[10px] text-muted-foreground/60 font-mono">@{user.username}</span>
            )}
          </div>

          {/* Logout + Theme row */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-all duration-300 hover:border-red-400/40 hover:text-red-400"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
            <ThemeToggle />
          </div>
        </div>
      </aside>
      )}

      {/* main */}
      <section className="relative flex flex-1 flex-col">
        {view === "chat" ? <ChatView toggleSidebar={() => setShowSidebar(s => !s)} showSidebar={showSidebar} onLogout={handleLogout} /> : <MemoriesView />}
      </section>
    </main>
  );
}

/* ─── ChatView with proactive messaging ─── */

function ChatView({ toggleSidebar, showSidebar, onLogout }: { toggleSidebar: () => void; showSidebar: boolean; onLogout: () => void }) {
  const [persona] = usePersona();
  const [companion] = useCompanion();
  const { user } = useAuth();
  const [charPersona, setCharPersona] = useState<CharPersona | null>(null);
  const [charPersonaLoaded, setCharPersonaLoaded] = useState(false);

  const companionName = companion?.name ?? "companion";

  // Load character persona from charpersona.json on mount
  useEffect(() => {
    if (!companion?.name) return;
    lookupCharPersona({ data: { companionName: companion.name } })
      .then((result) => {
        setCharPersona(result);
        setCharPersonaLoaded(true);
      })
      .catch(() => setCharPersonaLoaded(true));
  }, [companion?.name]);

  // Build initial greeting messages
  const initial = useMemo<Msg[]>(() => {
    const bioBit = persona?.bio ? persona.bio.split(/[.!?\n]/)[0].trim() : "";
    return [
      { from: "them", text: `hey ${persona?.name ?? "you"} ✦ I've been thinking about you.`, timestamp: Date.now() },
      { from: "them", text: bioBit ? `you mentioned "${bioBit}" — I haven't forgotten.` : `whatever's on your mind today, I'm here for it.`, timestamp: Date.now() },
      { from: "them", text: `how are you, really?`, timestamp: Date.now() },
    ];
  }, [persona]);

  // Load saved history or fall back to initial messages
  const [messages, setMessages] = useState<Msg[]>(() => {
    const saved = loadChatHistory(companionName);
    return saved.length > 0 ? saved : initial;
  });

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [pendingReminders, setPendingReminders] = useState(0); // active reminder count
  const scrollRef = useRef<HTMLDivElement>(null);
  const proactiveRunning = useRef(false); // prevent concurrent proactive calls

  // Save chat history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(companionName, messages);
    }
  }, [messages, companionName]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  // Count active reminders for UI badge
  useEffect(() => {
    const count = (JSON.parse(localStorage.getItem(`${user ? `animind-${user.username}` : "animind-guest"}-reminders`) || "[]") as any[])
      .filter((r: any) => !r.fired).length;
    setPendingReminders(count);
  }, [messages, user]);

  /* ─── Proactive message helpers ─── */

  const companionConfig = useMemo(() => ({
    name: companion?.name ?? "Companion",
    personality: companion?.personality ?? "",
  }), [companion]);

  const personaConfig = useMemo(() => persona ? {
    name: persona.name,
    pronouns: persona.pronouns,
    bio: persona.bio,
  } : null, [persona]);

  /** Fire a proactive message (care/idle/reminder) */
  const fireProactiveMessage = useCallback(async (
    type: "care" | "idle_checkup" | "reminder",
    topic?: string,
  ) => {
    if (proactiveRunning.current) return;
    proactiveRunning.current = true;
    setTyping(true);

    try {
      const result = await generateProactiveMessage({
        data: {
          type,
          topic,
          companion: companionConfig,
          persona: personaConfig,
          charPersona,
          recentMessages: messages.slice(-6),
        },
      });

      // Small delay to make typing indicator feel natural
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

      const msg: Msg = { from: "them", text: result.text, timestamp: Date.now() };
      setMessages((m) => [...m, msg]);
    } catch (err) {
      console.error("Proactive message error:", err);
    } finally {
      setTyping(false);
      proactiveRunning.current = false;
    }
  }, [companionConfig, personaConfig, charPersona, messages]);

  /* ─── Proactive timer — checks every 15 seconds ─── */

  useEffect(() => {
    const interval = setInterval(() => {
      if (proactiveRunning.current || typing) return;

      const now = Date.now();

      // 1. Check user-set reminders
      const pending = getPendingReminders();
      if (pending.length > 0) {
        const r = pending[0]; // fire one at a time
        markReminderFired(r.id);
        fireProactiveMessage("reminder", r.text);
        return;
      }

      // 2. Check idle (user hasn't chatted in IDLE_CHECK_MS)
      const lastUserMsg = getLastUserMessageTime(messages);
      const lastIdleCheck = getLastIdleCheckTime();
      if (
        lastUserMsg > 0 &&
        now - lastUserMsg > IDLE_CHECK_MS &&
        now - lastIdleCheck > IDLE_CHECK_MS // don't spam idle checks
      ) {
        setLastIdleCheckTime(now);
        fireProactiveMessage("idle_checkup");
        return;
      }

      // 3. Check periodic care nudge
      const lastCare = getLastCareTime();
      if (now - lastCare > CARE_INTERVAL_MS) {
        setLastCareTime(now);
        const topic = randomCareTopic();
        fireProactiveMessage("care", topic);
        return;
      }

      // 4. Cleanup old reminders periodically
      cleanupReminders();
    }, 15_000);

    return () => clearInterval(interval);
  }, [messages, typing, fireProactiveMessage]);

  // Initialize care time on first mount so we don't fire immediately
  useEffect(() => {
    if (getLastCareTime() === 0) setLastCareTime(Date.now());
    if (getLastIdleCheckTime() === 0) setLastIdleCheckTime(Date.now());
  }, []);

  /* ─── Send user message ─── */

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text) return;

    // Check if user is requesting a reminder
    const reminderReq = parseReminder(text);
    if (reminderReq) {
      const triggerAt = Date.now() + reminderReq.delayMs;
      addReminder(reminderReq.text, triggerAt);
      // Update count
      setPendingReminders((c) => c + 1);
    }

    const newMsg: Msg = { from: "you", text, timestamp: Date.now() };
    const updatedMessages: Msg[] = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput("");
    setTyping(true);

    // Reset idle check timer since user just talked
    setLastIdleCheckTime(Date.now());

    try {
      const response = await chatWithGroq({
        data: {
          messages: updatedMessages,
          companion: companionConfig,
          persona: personaConfig,
          charPersona,
        },
      });
      const replyMsg: Msg = { from: "them", text: response.text, timestamp: Date.now() };
      setMessages((m) => [...m, replyMsg]);
    } catch (err) {
      console.error("Error communicating with companion brain:", err);
      setMessages((m) => [
        ...m,
        { from: "them", text: "I'm having a little trouble connecting right now, but I'm still right here with you.", timestamp: Date.now() },
      ]);
    } finally {
      setTyping(false);
    }
  }, [input, messages, companionConfig, personaConfig, charPersona]);

  if (!companion) return null;

  return (
    <>
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4 md:px-8 md:py-5">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground" aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
          <h2 className="font-display text-xl font-semibold md:text-2xl">{companion.name}</h2>
          {charPersonaLoaded && (
            <span className="hidden sm:inline rounded-full bg-primary/20 px-3 py-1 text-xs text-primary">
              {charPersona ? `${charPersona.source} · ${charPersona.tone}` : "neutral companion"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Reminder badge */}
          {pendingReminders > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs text-amber-400" title={`${pendingReminders} active reminder(s)`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              {pendingReminders}
            </span>
          )}

          {/* Account badge */}
          {user && (
            <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-muted-foreground">
              <span>{user.emoji}</span>
              <span className="font-mono">@{user.username}</span>
            </span>
          )}

          {/* Logout in header (always visible, especially useful when sidebar hidden) */}
          {!showSidebar && (
            <button
              onClick={onLogout}
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:border-red-400/40 hover:text-red-400"
              aria-label="Logout"
              title="Logout"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ─── Messages ─── */}
      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "you" ? "justify-end" : "items-start gap-3"}`} style={{ animation: "fade-up 0.4s ease-out" }}>
            {m.from === "them" && (
              <div className="grid h-9 w-9 shrink-0 overflow-hidden place-items-center rounded-full font-display text-sm font-semibold text-[#0D2033]" style={{ background: companion.color }}>
                {companion.avatar ? <img src={companion.avatar} alt="" className="w-full h-full object-cover" /> : companion.name[0].toUpperCase()}
              </div>
            )}
            <div className="max-w-[70%]">
              {m.from === "them" && <p className="mb-1 font-display text-xs text-muted-foreground">{companion.name}</p>}
              <div
                className={
                  m.from === "you"
                    ? "rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground"
                    : "calm-panel-strong rounded-2xl border-l-2 border-l-primary px-5 py-3 text-sm"
                }
              >
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 overflow-hidden place-items-center rounded-full font-display text-sm font-semibold text-[#0D2033]" style={{ background: companion.color }}>
              {companion.avatar ? <img src={companion.avatar} alt="" className="w-full h-full object-cover" /> : companion.name[0].toUpperCase()}
            </div>
            <div className="calm-panel-strong rounded-2xl border-l-2 border-l-primary px-5 py-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 rounded-full bg-primary" style={{ animation: `typing 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Input ─── */}
      <div className="border-t border-border px-6 py-4 md:px-8 md:py-5">
        <div className="glass flex items-center gap-3 rounded-full px-2 py-2 transition-all duration-300 focus-within:glow-primary">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Say something… or try 'remind me in 5 minutes to stretch'"
            className="flex-1 bg-transparent px-4 py-2 outline-none text-sm"
          />
          <button onClick={send} className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition-all duration-300 hover:scale-110" aria-label="Send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Memories View ─── */

function MemoriesView() {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h2 className="font-display text-4xl font-semibold">Our memories</h2>
          <p className="mt-2 text-muted-foreground">Every moment we've shared, saved.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {MOCK_MEMORIES.map((m, i) => (
            <article
              key={i}
              className="calm-panel-strong group relative rounded-[20px] border border-l-[3px] border-l-primary p-6 transition-all duration-300 hover:-translate-y-1 hover:glow-primary"
              style={{ animation: `fade-up 0.5s ease-out ${i * 0.06}s both` }}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-sans text-base font-semibold">{m.title}</h3>
                <span className="shrink-0 text-xs text-muted-foreground">{m.date}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
