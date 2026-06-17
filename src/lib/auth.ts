/**
 * Simple client-side auth with 10 pre-made accounts.
 * Each account is fully isolated — different persona, companion, and chat history.
 */

import { useState, useEffect } from "react";

export interface Account {
  username: string;
  password: string;
  displayName: string;
  emoji: string; // avatar emoji
}

/** 10 pre-made accounts */
export const ACCOUNTS: Account[] = [
  { username: "alice",   password: "alice123",   displayName: "Alice",   emoji: "🌸" },
  { username: "bob",     password: "bob123",     displayName: "Bob",     emoji: "🌊" },
  { username: "charlie", password: "charlie123", displayName: "Charlie", emoji: "⚡" },
  { username: "diana",   password: "diana123",   displayName: "Diana",   emoji: "🌙" },
  { username: "evan",    password: "evan123",    displayName: "Evan",    emoji: "🔥" },
  { username: "fiona",   password: "fiona123",   displayName: "Fiona",   emoji: "🍀" },
  { username: "grace",   password: "grace123",   displayName: "Grace",   emoji: "✨" },
  { username: "henry",   password: "henry123",   displayName: "Henry",   emoji: "🎯" },
  { username: "iris",    password: "iris123",    displayName: "Iris",    emoji: "🦋" },
  { username: "jake",    password: "jake123",    displayName: "Jake",    emoji: "🎮" },
];

const AUTH_KEY = "animind-auth-user";

/** Try to log in. Returns the account on success, null on failure. */
export function login(username: string, password: string): Account | null {
  const account = ACCOUNTS.find(
    (a) => a.username.toLowerCase() === username.toLowerCase() && a.password === password
  );
  if (account) {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, JSON.stringify(account));
    }
    return account;
  }
  return null;
}

/** Log out the current user */
export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}

/** Get the currently logged-in account (or null) */
export function getCurrentUser(): Account | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as Account) : null;
  } catch {
    return null;
  }
}

/** React hook for auth state */
export function useAuth() {
  const [user, setUser] = useState<Account | null>(() => getCurrentUser());

  // Listen for storage changes (e.g. logout in another tab)
  useEffect(() => {
    const onStorage = () => setUser(getCurrentUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const doLogin = (username: string, password: string): Account | null => {
    const account = login(username, password);
    setUser(account);
    return account;
  };

  const doLogout = () => {
    logout();
    setUser(null);
  };

  return { user, login: doLogin, logout: doLogout, isLoggedIn: !!user } as const;
}
