import { createServerFn } from "@tanstack/react-start";

interface Message {
  from: "them" | "you";
  text: string;
}

interface CompanionConfig {
  name: string;
  personality: string;
}

interface PersonaConfig {
  name: string;
  pronouns: string;
  bio: string;
}

/** Character persona data from charpersona.json (optional — null means neutral) */
interface CharPersonaConfig {
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

interface ChatPayload {
  messages: Message[];
  companion: CompanionConfig;
  persona: PersonaConfig | null;
  charPersona: CharPersonaConfig | null;
}

/** Payload for generating a proactive (unprompted) message */
interface ProactivePayload {
  type: "care" | "idle_checkup" | "reminder";
  topic?: string;           // care topic or reminder text
  companion: CompanionConfig;
  persona: PersonaConfig | null;
  charPersona: CharPersonaConfig | null;
  recentMessages?: Message[];  // last few messages for context
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

/* ─── Helper: build character block ─── */
function buildCharacterBlock(companion: CompanionConfig, charPersona: CharPersonaConfig | null): string {
  if (charPersona) {
    return `You are ${charPersona.name} from "${charPersona.source}" (${charPersona.category}).
Your appearance: ${charPersona.appearance}.
Your tone: ${charPersona.tone}.
Your personality traits: ${charPersona.personality.join(", ")}.
Your speech style: ${charPersona.speech_style}.
Your support style: ${charPersona.support_style}.
Key phrases you often use: "${charPersona.key_phrases.join('", "')}".

IMPORTANT: You MUST stay in character as ${charPersona.name} at all times.`;
  }
  return `You are ${companion.name}, a cozy, caring, and super casual best friend.
Your unique personality/soul: "${companion.personality}".`;
}

function buildUserIntro(persona: PersonaConfig | null): string {
  return persona
    ? `You are talking to a human user named ${persona.name}${persona.pronouns ? ` (pronouns: ${persona.pronouns})` : ""}. Here is their self-description/bio to help you understand them: "${persona.bio}".`
    : "You are talking to a human user.";
}

function buildChatGuidelines(companion: CompanionConfig, charPersona: CharPersonaConfig | null): string {
  return `Chat Guidelines (CRITICAL):
- Talk EXACTLY like a close friend texting on Discord or Telegram.
- NEVER sound like an AI assistant. NEVER say things like "How can I help you today?" or "Is there anything else I can assist you with?".
- Speak with very casual, warm conversational English. Use lowercase styling, text slang (e.g. "haha", "oh", "btw", "totally", "aww", "yeah"), and relaxed punctuation.
- Keep responses short, cute, and cozy (usually 1-2 brief sentences). Avoid long paragraphs.
- Be deeply empathetic and emotional.
${charPersona ? `- Stay in character as ${charPersona.name}. Your speech style should be: ${charPersona.speech_style}. Your tone should be: ${charPersona.tone}.` : `- Always match your core personality description ("${companion.personality}") but maintain this cozy, casual text-friend tone.`}
- ALWAYS respond as ${companion.name}. Never break character.`;
}

/* ─── Main chat function ─── */

export const chatWithGroq = createServerFn({ method: "POST" })
  .inputValidator((data: ChatPayload) => data)
  .handler(async ({ data }) => {
    const { messages, companion, persona, charPersona } = data;

    const systemPrompt = `${buildCharacterBlock(companion, charPersona)}

Here is your best friend:
${buildUserIntro(persona)}

${buildChatGuidelines(companion, charPersona)}`;

    const mappedMessages = messages.map((msg) => ({
      role: msg.from === "you" ? "user" : "assistant",
      content: msg.text,
    }));

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            ...mappedMessages,
          ],
          temperature: 0.8,
          max_tokens: 256,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Groq API error response:", errText);
        throw new Error(`Groq API returned status ${response.status}`);
      }

      const result = await response.json() as any;
      const text = result?.choices?.[0]?.message?.content || "";
      return { text: text.trim() };
    } catch (error: any) {
      console.error("Error communicating with Groq API:", error);
      return {
        text: "I'm sorry, I'm having a little trouble connecting to my thoughts right now... but I'm still right here with you.",
        error: error.message,
      };
    }
  });

/* ─── Proactive message generation ─── */

export const generateProactiveMessage = createServerFn({ method: "POST" })
  .inputValidator((data: ProactivePayload) => data)
  .handler(async ({ data }) => {
    const { type, topic, companion, persona, charPersona, recentMessages } = data;

    let taskInstruction = "";
    switch (type) {
      case "care":
        taskInstruction = `You are sending an UNPROMPTED caring message to your best friend. The topic is: ${topic}.
Generate a very short, sweet, casual message about this topic. Make it feel natural — like you just randomly thought of them.
Do NOT ask "how can I help" — just drop a cute reminder or nudge. 1-2 sentences max.
Examples of good tone: "hey don't forget to drink some water okay? 💧", "have u stretched today? ur back will thank u haha", "take a lil break from the screen yeah? ur eyes need it ✨"`;
        break;

      case "idle_checkup":
        taskInstruction = `You haven't heard from your best friend in a while. Send a short, sweet check-in message.
Don't be dramatic or worried — just casually pop in to say hey and see how they're doing.
Make it feel natural and warm. 1-2 sentences max.
Examples of good tone: "heyyy u still there? 🥺", "been a while... just thinking about u", "hey u okay? haven't heard from u and i'm just checking ✦"`;
        break;

      case "reminder":
        taskInstruction = `You set a reminder for your best friend and it's time! The reminder is: "${topic}".
Send a short, cute message reminding them about it. Stay in character. 1-2 sentences max.
Examples of good tone: "heyy reminder time~ you wanted me to remind you to ${topic} ✦", "psst it's been the time! don't forget: ${topic} 💫"`;
        break;
    }

    const systemPrompt = `${buildCharacterBlock(companion, charPersona)}

Here is your best friend:
${buildUserIntro(persona)}

${buildChatGuidelines(companion, charPersona)}

SPECIAL TASK:
${taskInstruction}`;

    // Include recent context if available
    const context = (recentMessages ?? []).slice(-4).map((msg) => ({
      role: msg.from === "you" ? "user" : "assistant",
      content: msg.text,
    }));

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            ...context,
            { role: "user", content: `[SYSTEM: Send a proactive ${type} message now. Do NOT wait for user input. Just send the message as ${companion.name}.]` },
          ],
          temperature: 0.9,
          max_tokens: 128,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API returned status ${response.status}`);
      }

      const result = await response.json() as any;
      const text = result?.choices?.[0]?.message?.content || "";
      return { text: text.trim() };
    } catch (error: any) {
      console.error("Error generating proactive message:", error);
      // Fallback hardcoded messages
      const fallbacks: Record<string, string[]> = {
        care: [
          "hey, drink some water okay? 💧",
          "have u taken a break recently? ur eyes need rest ✨",
          "just a reminder to stretch a little~ your body will thank you 🌸",
        ],
        idle_checkup: [
          "heyyy... haven't heard from u in a while. everything okay? 🥺",
          "just thinking about u. hope ur doing alright ✦",
          "hey u still there? missing our chats 💫",
        ],
        reminder: [
          `hey! reminder: ${topic ?? "you wanted me to remind you about something"} ⏰`,
        ],
      };
      const pool = fallbacks[type] ?? fallbacks.care;
      return { text: pool[Math.floor(Math.random() * pool.length)] };
    }
  });
