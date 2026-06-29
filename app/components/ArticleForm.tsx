"use client";

import { useState } from "react";
import type { ArticleAction } from "@/lib/article-ai";

const ACTION_LABELS: Record<ArticleAction, string> = {
  summary: "О чём статья",
  theses: "Тезисы",
  "telegram-post": "Пост для Telegram",
};

export function ArticleForm() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [loadingType, setLoadingType] = useState<ArticleAction | null>(null);
  const [error, setError] = useState("");

  function validateUrl(): string | null {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError("Введите URL англоязычной статьи");
      setResult("");
      return null;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setError("Введите корректный URL");
      setResult("");
      return null;
    }

    setError("");
    return trimmedUrl;
  }

  async function handleAction(action: ArticleAction) {
    const trimmedUrl = validateUrl();
    if (!trimmedUrl) return;

    setLoadingType(action);
    setResult("");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl, action }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Ошибка при генерации ответа");
        setResult("");
        return;
      }

      setResult(data.result ?? "");
    } catch {
      setError("Не удалось выполнить запрос к серверу");
      setResult("");
    } finally {
      setLoadingType(null);
    }
  }

  const isLoading = loadingType !== null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Lexion
        </h1>
        <p className="mt-2 text-slate-600">
          Парсинг англоязычных статей и генерация ответа с помощью AI
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label htmlFor="article-url" className="mb-2 block text-sm font-medium text-slate-700">
          URL англоязычной статьи
        </label>
        <input
          id="article-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/article"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleAction("summary")}
            disabled={isLoading}
            className="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            О чём статья
          </button>
          <button
            type="button"
            onClick={() => handleAction("theses")}
            disabled={isLoading}
            className="rounded-lg bg-yellow-500 px-5 py-2.5 font-medium text-slate-900 transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Тезисы
          </button>
          <button
            type="button"
            onClick={() => handleAction("telegram-post")}
            disabled={isLoading}
            className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Пост для Telegram
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Результат</h2>
        <div className="min-h-40 rounded-lg bg-slate-50 p-4 text-slate-800">
          {isLoading ? (
            <p className="animate-pulse text-slate-500">
              {loadingType ? `Генерация «${ACTION_LABELS[loadingType]}»…` : ""}
            </p>
          ) : result ? (
            <p className="whitespace-pre-wrap">{result}</p>
          ) : (
            <p className="text-slate-400">Выберите действие AI</p>
          )}
        </div>
      </section>
    </div>
  );
}
