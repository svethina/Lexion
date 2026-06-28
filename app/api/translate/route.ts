import { parseArticle } from "@/lib/parse-article";
import { translateArticle } from "@/lib/openrouter";
import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedUrl = parseRequestUrl(body.url);

    if (parsedUrl instanceof NextResponse) {
      return parsedUrl;
    }

    const article = await parseArticle(parsedUrl.toString());

    if (!article.content) {
      return NextResponse.json(
        { error: "Не удалось извлечь текст статьи для перевода" },
        { status: 422 },
      );
    }

    const translation = await translateArticle({
      title: article.title,
      date: article.date,
      content: article.content,
    });

    return NextResponse.json({ translation });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка при переводе статьи";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
