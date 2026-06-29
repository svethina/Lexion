import {
  generateArticleAction,
  type ArticleAction,
} from "@/lib/article-ai";
import { parseArticle } from "@/lib/parse-article";
import { NextResponse } from "next/server";

const VALID_ACTIONS: ArticleAction[] = ["summary", "theses", "telegram-post"];

function parseRequestUrl(url: unknown): URL | NextResponse {
  const trimmedUrl = typeof url === "string" ? url.trim() : "";

  if (!trimmedUrl) {
    return NextResponse.json({ error: "URL не указан" }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(trimmedUrl);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "Поддерживаются только HTTP и HTTPS" },
        { status: 400 },
      );
    }

    return parsedUrl;
  } catch {
    return NextResponse.json({ error: "Некорректный URL" }, { status: 400 });
  }
}

function parseAction(action: unknown): ArticleAction | NextResponse {
  if (
    typeof action !== "string" ||
    !VALID_ACTIONS.includes(action as ArticleAction)
  ) {
    return NextResponse.json(
      { error: "Укажите действие: summary, theses или telegram-post" },
      { status: 400 },
    );
  }

  return action as ArticleAction;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedUrl = parseRequestUrl(body.url);
    if (parsedUrl instanceof NextResponse) return parsedUrl;

    const action = parseAction(body.action);
    if (action instanceof NextResponse) return action;

    const article = await parseArticle(parsedUrl.toString());

    if (!article.content) {
      return NextResponse.json(
        { error: "Не удалось извлечь текст статьи" },
        { status: 422 },
      );
    }

    const result = await generateArticleAction(action, article, {
      sourceUrl: parsedUrl.toString(),
    });

    return NextResponse.json({ result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка при генерации ответа";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
