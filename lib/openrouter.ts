const OPENROUTER_MODEL = "deepseek/deepseek-chat";
const MAX_CONTENT_LENGTH = 12000;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

function getOpenRouterUrl(): string {
  const baseUrl =
    process.env.OPENAI_BASE_URL?.replace(/\/$/, "") ??
    "https://openrouter.ai/api/v1";

  return `${baseUrl}/chat/completions`;
}

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY не задан в .env.local");
  }

  const response = await fetch(getOpenRouterUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Lexion",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
    }),
    signal: AbortSignal.timeout(120000),
  });

  const data = (await response.json()) as OpenRouterResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? `OpenRouter: HTTP ${response.status}`);
  }

  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OpenRouter вернул пустой ответ");
  }

  return content;
}

export async function translateArticle(input: {
  title: string | null;
  date: string | null;
  content: string;
}): Promise<string> {
  const content =
    input.content.length > MAX_CONTENT_LENGTH
      ? `${input.content.slice(0, MAX_CONTENT_LENGTH)}…`
      : input.content;

  const articleParts = [
    input.title ? `Title: ${input.title}` : null,
    input.date ? `Date: ${input.date}` : null,
    `Content:\n${content}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return chatCompletion([
    {
      role: "system",
      content:
        "You are a professional translator. Translate English articles into Russian accurately and naturally. Preserve meaning, tone, and structure. Return only the translation without comments.",
    },
    {
      role: "user",
      content: `Translate the following English article to Russian:\n\n${articleParts}`,
    },
  ]);
}
