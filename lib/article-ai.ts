import type { ParsedArticle } from "@/lib/parse-article";
import { chatCompletion } from "@/lib/openrouter";
import {
  type ArticleAction,
  SYSTEM_PROMPTS,
  USER_PROMPT_TEMPLATES,
} from "@/lib/prompts";

export type { ArticleAction };

const MAX_CONTENT_LENGTH = 12000;
const TELEGRAM_POST_MAX_LENGTH = 1500;

function formatArticleText(article: ParsedArticle): string {
  const content =
    article.content && article.content.length > MAX_CONTENT_LENGTH
      ? `${article.content.slice(0, MAX_CONTENT_LENGTH)}…`
      : (article.content ?? "");

  return [
    article.title ? `Title: ${article.title}` : null,
    article.date ? `Date: ${article.date}` : null,
    `Content:\n${content}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildUserPrompt(
  action: ArticleAction,
  article: ParsedArticle,
  sourceUrl?: string,
): string {
  const template = USER_PROMPT_TEMPLATES[action];
  const articleText = formatArticleText(article);

  return template
    .replace("{article}", articleText)
    .replace("{sourceUrl}", sourceUrl ?? "не указан");
}

function trimTelegramPost(text: string): string {
  if (text.length <= TELEGRAM_POST_MAX_LENGTH) {
    return text;
  }

  return `${text.slice(0, TELEGRAM_POST_MAX_LENGTH - 1)}…`;
}

export async function generateArticleAction(
  action: ArticleAction,
  article: ParsedArticle,
  options?: { sourceUrl?: string },
): Promise<string> {
  if (!article.content) {
    throw new Error("Не удалось извлечь текст статьи для генерации");
  }

  const result = await chatCompletion([
    {
      role: "system",
      content: SYSTEM_PROMPTS[action],
    },
    {
      role: "user",
      content: buildUserPrompt(action, article, options?.sourceUrl),
    },
  ]);

  if (action === "telegram-post") {
    return trimTelegramPost(result);
  }

  return result;
}
