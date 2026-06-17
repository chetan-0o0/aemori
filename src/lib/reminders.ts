/**
 * Proactive messaging & reminder system.
 * Handles:
 *  1. User-requested reminders ("remind me in 30 min to drink water")
 *  2. Periodic care nudges (hydration, stretch, break reminders)
 *  3. Idle check-ups (if the user hasn't chatted in a while)
 *
 * All data is scoped per account via the store's accountPrefix.
 */

import { getCurrentUser } from "./auth";

/* ─── Types ─── */

export interface Reminder {
  id: string;
  text: string;          // what the user asked to be reminded about
  triggerAt: number;      // timestamp (ms) when this should fire
  createdAt: number;
  fired: boolean;
}

/* ─── Account-scoped storage helpers ─── */

function prefix(): string {
  const user = getCurrentUser();
  return user ? `animind-${user.username}` : "animind-guest";
}

function remindersKey(): string {
  return `${prefix()}-reminders`;
}

function lastCareKey(): string {
  return `${prefix()}-last-care`;
}

function lastIdleCheckKey(): string {
  return `${prefix()}-last-idle-check`;
}

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: T | null) {
  if (typeof window === "undefined") return;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/* ─── Reminder CRUD ─── */

export function getReminders(): Reminder[] {
  return read<Reminder[]>(remindersKey()) ?? [];
}

function saveReminders(reminders: Reminder[]): void {
  write(remindersKey(), reminders);
}

export function addReminder(text: string, triggerAt: number): Reminder {
  const r: Reminder = {
    id: `rem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text,
    triggerAt,
    createdAt: Date.now(),
    fired: false,
  };
  const all = getReminders();
  all.push(r);
  saveReminders(all);
  return r;
}

export function markReminderFired(id: string): void {
  const all = getReminders();
  const r = all.find((x) => x.id === id);
  if (r) {
    r.fired = true;
    saveReminders(all);
  }
}

/** Get all reminders that are due now and haven't been fired yet. */
export function getPendingReminders(): Reminder[] {
  const now = Date.now();
  return getReminders().filter((r) => !r.fired && r.triggerAt <= now);
}

/** Clean up old fired reminders (older than 24 hours) */
export function cleanupReminders(): void {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const all = getReminders().filter((r) => !r.fired || r.createdAt > cutoff);
  saveReminders(all);
}

/* ─── Parse reminder from user text ─── */

/**
 * Try to extract a reminder request from user text.
 * Supports patterns like:
 *   "remind me in 30 minutes to drink water"
 *   "remind me to call mom in 2 hours"
 *   "set a reminder for 1 hour to stretch"
 *   "reminder in 45 mins to take a break"
 *   "remind me in 10 seconds to test" (for demo)
 *
 * Returns { text, delayMs } or null if no reminder detected.
 */
export function parseReminder(
  input: string
): { text: string; delayMs: number; humanTime: string } | null {
  const lower = input.toLowerCase().trim();

  // Pattern 1: "remind me in X (unit) to Y"
  const p1 = lower.match(
    /(?:remind\s+me|set\s+(?:a\s+)?reminder|reminder)\s+(?:in|for)\s+(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)\s+(?:to\s+|about\s+|for\s+)?(.+)/i
  );
  if (p1) {
    return buildResult(parseInt(p1[1]), p1[2], p1[3]);
  }

  // Pattern 2: "remind me to Y in X (unit)"
  const p2 = lower.match(
    /(?:remind\s+me|set\s+(?:a\s+)?reminder)\s+(?:to\s+|about\s+)(.+?)\s+in\s+(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)/i
  );
  if (p2) {
    return buildResult(parseInt(p2[2]), p2[3], p2[1]);
  }

  // Pattern 3: "in X minutes remind me to Y"
  const p3 = lower.match(
    /in\s+(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)\s+(?:remind\s+me\s+(?:to\s+)?|reminder\s+(?:to\s+)?)(.+)/i
  );
  if (p3) {
    return buildResult(parseInt(p3[1]), p3[2], p3[3]);
  }

  return null;
}

function buildResult(
  amount: number,
  unit: string,
  text: string
): { text: string; delayMs: number; humanTime: string } {
  let multiplier = 1;
  let humanUnit = "";

  if (/^(sec|second)s?$/.test(unit)) {
    multiplier = 1000;
    humanUnit = amount === 1 ? "second" : "seconds";
  } else if (/^(min|minute)s?$/.test(unit)) {
    multiplier = 60 * 1000;
    humanUnit = amount === 1 ? "minute" : "minutes";
  } else if (/^(hr|hour)s?$/.test(unit)) {
    multiplier = 60 * 60 * 1000;
    humanUnit = amount === 1 ? "hour" : "hours";
  }

  return {
    text: text.trim().replace(/[.!?]+$/, ""),
    delayMs: amount * multiplier,
    humanTime: `${amount} ${humanUnit}`,
  };
}

/* ─── Periodic care nudge tracking ─── */

/** How often to send care nudges (in ms). Default: 45 minutes */
export const CARE_INTERVAL_MS = 45 * 60 * 1000;

/** How long of inactivity before an idle check-up (in ms). Default: 20 minutes */
export const IDLE_CHECK_MS = 20 * 60 * 1000;

/** Pool of care nudge topics the AI can riff on */
export const CARE_TOPICS = [
  "hydration — have they had water recently?",
  "posture — are they sitting up straight?",
  "stretching — have they moved around?",
  "screen break — have they rested their eyes?",
  "breathing — take a few deep breaths together",
  "snack time — maybe they should eat something",
  "mood check — just checking how they're feeling right now",
  "gratitude — ask them about one good thing today",
  "sunshine — have they been outside at all?",
  "self-care — remind them they're doing great",
];

export function getLastCareTime(): number {
  return read<number>(lastCareKey()) ?? 0;
}

export function setLastCareTime(t: number): void {
  write(lastCareKey(), t);
}

export function getLastIdleCheckTime(): number {
  return read<number>(lastIdleCheckKey()) ?? 0;
}

export function setLastIdleCheckTime(t: number): void {
  write(lastIdleCheckKey(), t);
}

/** Pick a random care topic */
export function randomCareTopic(): string {
  return CARE_TOPICS[Math.floor(Math.random() * CARE_TOPICS.length)];
}

/**
 * Get the timestamp of the last message from the user in a message list.
 * Returns 0 if no user messages exist.
 */
export function getLastUserMessageTime(
  messages: { from: string; timestamp?: number }[]
): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].from === "you" && messages[i].timestamp) {
      return messages[i].timestamp!;
    }
  }
  return 0;
}
