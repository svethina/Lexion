import { parseArticle } from "@/lib/parse-article";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = typeof body.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json({ error: "URL не указан" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Некорректный URL" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "Поддерживаются только HTTP и HTTPS" },
        { status: 400 },
      );
    }

    const article = await parseArticle(parsedUrl.toString());

    return NextResponse.json(article);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка при парсинге статьи";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
