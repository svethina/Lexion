import * as cheerio from "cheerio";

export interface ParsedArticle {
  date: string | null;
  title: string | null;
  content: string | null;
}

const CONTENT_SELECTORS = [
  "article",
  '[role="article"]',
  "main article",
  "main .content",
  "main .post",
  ".post-content",
  ".article-content",
  ".entry-content",
  ".article-body",
  ".post-body",
  ".post",
  ".content",
  "main",
  "body",
];

const DATE_SELECTORS = [
  "time[datetime]",
  'meta[property="article:published_time"]',
  'meta[name="article:published_time"]',
  'meta[property="og:published_time"]',
  'meta[name="date"]',
  'meta[name="pubdate"]',
  'meta[itemprop="datePublished"]',
  ".date",
  ".published",
  ".post-date",
  ".entry-date",
];

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function extractTitle($: cheerio.CheerioAPI): string | null {
  const candidates = [
    $('meta[property="og:title"]').attr("content"),
    $('meta[name="twitter:title"]').attr("content"),
    $("article h1").first().text(),
    $("main h1").first().text(),
    $("h1").first().text(),
    $("title").text(),
  ];

  for (const candidate of candidates) {
    const value = normalizeWhitespace(candidate ?? "");
    if (value) return value;
  }

  return null;
}

function extractDate($: cheerio.CheerioAPI): string | null {
  for (const selector of DATE_SELECTORS) {
    const element = $(selector).first();
    if (!element.length) continue;

    const value =
      element.attr("datetime") ??
      element.attr("content") ??
      element.attr("value") ??
      element.text();

    const normalized = normalizeWhitespace(value ?? "");
    if (normalized) return normalized;
  }

  return null;
}

function extractContent($: cheerio.CheerioAPI): string | null {
  let bestContent = "";

  for (const selector of CONTENT_SELECTORS) {
    $(selector).each((_, node) => {
      const clone = $(node).clone();
      clone
        .find(
          "script, style, nav, footer, aside, header, .comments, .sidebar, .share, .related, .advertisement, .ad",
        )
        .remove();

      const text = normalizeWhitespace(clone.text());
      if (text.length > bestContent.length) {
        bestContent = text;
      }
    });
  }

  return bestContent.length >= 50 ? bestContent : null;
}

export async function parseArticle(url: string): Promise<ParsedArticle> {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка сети";
    throw new Error(`Не удалось загрузить страницу: ${message}`);
  }

  if (!response.ok) {
    throw new Error(`Не удалось загрузить страницу: HTTP ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  return {
    date: extractDate($),
    title: extractTitle($),
    content: extractContent($),
  };
}
