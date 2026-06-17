import { createServerFn } from "@tanstack/react-start";
import { readFileSync } from "fs";
import { resolve } from "path";

export interface CharPersona {
  name: string;
  source: string;
  category: string;
  appearance: string;
  tone: string;
  personality: string[];
  speech_style: string;
  support_style: string;
  key_phrases: string[];
}

/**
 * Server function that looks up a companion name in charpersona.json.
 * Returns the matching persona data or null (neutral) if not found.
 * Matching is case-insensitive.
 */
export const lookupCharPersona = createServerFn({ method: "POST" })
  .inputValidator((data: { companionName: string }) => data)
  .handler(async ({ data }): Promise<CharPersona | null> => {
    try {
      const filePath = resolve(process.cwd(), "charpersona.json");
      const raw = readFileSync(filePath, "utf-8");
      const personas: CharPersona[] = JSON.parse(raw);

      const target = data.companionName.trim().toLowerCase();

      // Try exact match first, then partial match
      const exactMatch = personas.find(
        (p) => p.name.toLowerCase() === target
      );
      if (exactMatch) return exactMatch;

      // Partial match — companion name contained within persona name or vice-versa
      const partialMatch = personas.find(
        (p) =>
          p.name.toLowerCase().includes(target) ||
          target.includes(p.name.toLowerCase())
      );
      return partialMatch ?? null;
    } catch (err) {
      console.error("Failed to lookup character persona:", err);
      return null;
    }
  });
