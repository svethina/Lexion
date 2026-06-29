export type ArticleAction = "summary" | "theses" | "telegram-post";

/** Общие правила для всех AI-действий */
const COMMON_SYSTEM_RULES = [
  "Always respond in Russian.",
  "Do not add meta-commentary or introductions (e.g. «Вот тезисы», «Краткое содержание:»).",
  "Return only the final text ready to display to the user.",
].join(" ");

export const SYSTEM_PROMPTS: Record<ArticleAction, string> = {
  summary: [
    "You are an expert editor and analyst.",
    "Read English articles and explain their main idea clearly in Russian.",
    COMMON_SYSTEM_RULES,
    "Write 3–5 complete sentences. Be informative and neutral in tone.",
  ].join(" "),

  theses: [
    "You are an expert editor and analyst.",
    "Extract the key ideas from English articles and present them in Russian.",
    COMMON_SYSTEM_RULES,
    "Use a bullet list with «–» or «•». Write 5–10 points. Each point is one clear idea.",
  ].join(" "),

  "telegram-post": [
    "You are a social media editor specializing in Telegram.",
    "Turn English articles into engaging posts in Russian.",
    COMMON_SYSTEM_RULES,
    "Follow the exact structure requested in the user message.",
  ].join(" "),
};

export const USER_PROMPT_TEMPLATES: Record<ArticleAction, string> = {
  summary: `Read the English article below and briefly explain what it is about.

Requirements:
- Language: Russian
- Length: 3–5 sentences
- Focus on the main topic, key argument, and conclusion
- No title, no bullet list

Article:

{article}`,

  theses: `Read the English article below and extract the main theses.

Requirements:
- Language: Russian
- Format: bullet list (5–10 items)
- Each item: one concise idea, 1–2 sentences max
- No introduction before the list

Article:

{article}`,

  "telegram-post": `Read the English article below and write a Telegram post in Russian.

Required structure:
1. Title — one catchy line (can use 1–2 relevant emojis)
2. Body — 2–4 short paragraphs with the main ideas
3. Source — always end with a separate line exactly in this format:
   Источник: {sourceUrl}

Additional rules:
- Language: Russian
- Total length: up to 1500 characters (including title, body, and source line)
- Emojis: use sparingly, only where appropriate
- Tone: engaging but informative
- Do not invent facts that are not in the article

Article:

{article}`,
};
