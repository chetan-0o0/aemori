// Tiny in-memory app store for the "no backend" mock.
// Persisted to localStorage so refreshes feel real without a backend.
// ALL keys are scoped per logged-in account for full isolation.

import { useState } from "react";
import { getCurrentUser } from "./auth";

export type Persona = {
  name: string;
  pronouns: string;
  dob: { d: string; m: string; y: string };
  bio: string;
  avatar: string | null; // data URL
};

export type Companion = {
  name: string;
  color: string; // hex
  personality: string;
  avatar?: string | null;
};

export type ChatMessage = {
  from: "them" | "you";
  text: string;
  timestamp?: number;
};

/* ────────────────────────────────────────────────────────────────────────
 * Account-scoped key helpers
 * Every localStorage key is prefixed with the account username,
 * so each of the 10 accounts has completely isolated data.
 * ──────────────────────────────────────────────────────────────────────── */

function accountPrefix(): string {
  const user = getCurrentUser();
  return user ? `animind-${user.username}` : "animind-guest";
}

function personaKey(): string {
  return `${accountPrefix()}-persona`;
}

function companionKey(): string {
  return `${accountPrefix()}-companion`;
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

export function usePersona() {
  const key = personaKey();
  const [persona, setPersonaState] = useState<Persona | null>(() => read<Persona>(key));
  const setPersona = (p: Persona | null) => { write(key, p); setPersonaState(p); };
  return [persona, setPersona] as const;
}

export function useCompanion() {
  const key = companionKey();
  const [companion, setCompanionState] = useState<Companion | null>(() => read<Companion>(key));
  const setCompanion = (c: Companion | null) => { write(key, c); setCompanionState(c); };
  return [companion, setCompanion] as const;
}

export const getPersona = () => read<Persona>(personaKey());
export const getCompanion = () => read<Companion>(companionKey());

/* ────────────────────────────────────────────────────────────────────────
 * Per-user, per-companion session management
 * Storage key format: "{accountPrefix}-session-{companionName}"
 * This keeps chat history separate for each account×companion pair.
 * ──────────────────────────────────────────────────────────────────────── */

function sessionKey(companionName: string): string {
  const c = (companionName || "companion").toLowerCase().replace(/\s+/g, "_");
  return `${accountPrefix()}-session-${c}`;
}

/** Load saved chat history for the current account's companion */
export function loadChatHistory(companionName: string): ChatMessage[] {
  const key = sessionKey(companionName);
  return read<ChatMessage[]>(key) ?? [];
}

/** Save chat history for the current account's companion */
export function saveChatHistory(companionName: string, messages: ChatMessage[]): void {
  const key = sessionKey(companionName);
  write(key, messages);
}

/** Clear chat history for the current account's companion */
export function clearChatHistory(companionName: string): void {
  const key = sessionKey(companionName);
  write(key, null);
}

/** List all session keys for the current account */
export function listSessions(): string[] {
  if (typeof window === "undefined") return [];
  const prefix = accountPrefix();
  const sessions: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(`${prefix}-session-`)) sessions.push(k);
  }
  return sessions;
}
