"use client";

import { useState } from "react";

type Action = "summary" | "theses" | "post";
type LoadingType = "parse" | "translate" | Action;

const ACTION_LABELS: Record<Action, string> = {
  summary: "О чём статья",
  theses: "Тезисы",
  post: "Пост",
};

export function ArticleForm() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [isJsonResult, setIsJsonResult] = useState(false);
  const [loadingType, setLoadingType] = useState<LoadingType | null>(null);
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

  async function handleParse() {
    const trimmedUrl = validateUrl();
    if (!trimmedUrl) return;

    setLoadingType("parse");
    setResult("");
    setIsJsonResult(false);

    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Ошибка при парсинге статьи");
        setResult("");
        return;
      }

      if (!data.content) {
        setError(
          "Текст статьи не найден. Попробуйте другой URL или сначала проверьте парсинг.",
        );
      }

      setResult(JSON.stringify(data, null, 2));
      setIsJsonResult(true);
    } catch {
      setError("Не удалось выполнить запрос к серверу");
      setResult("");
    } finally {
      setLoadingType(null);
    }
  }

  async function handleTranslate() {
    const trimmedUrl = validateUrl();
    if (!trimmedUrl) return;

    setLoadingType("translate");
    setResult("");
    setIsJsonResult(false);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Ошибка при переводе статьи");
        setResult("");
        return;
      }

      setResult(data.translation ?? "");
    } catch {
      setError("Не удалось выполнить запрос к серверу");
      setResult("");
    } finally {
      setLoadingType(null);
    }
  }

  async function handleAction(action: Action) {
    const trimmedUrl = validateUrl();
    if (!trimmedUrl) return;

    setLoadingType(action);
    setResult("");
    setIsJsonResult(false);

    // Заглушка до подключения AI
    await new Promise((resolve) => setTimeout(resolve, 500));

    setResult(
      `Здесь появится результат для действия «${ACTION_LABELS[action]}» по статье:\n${trimmedUrl}`,
    );
    setLoadingType(null);
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

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleParse}
            disabled={isLoading}
            className="rounded-lg bg-slate-800 px-5 py-2.5 font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Парсинг
          </button>
          <button
            type="button"
            onClick={handleTranslate}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Перевод
          </button>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-6">
          <p className="mb-3 text-sm font-medium text-slate-700">Действия AI</p>
          <div className="flex flex-wrap gap-3">
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
              onClick={() => handleAction("post")}
              disabled={isLoading}
              className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Пост
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Результат</h2>
        <div className="min-h-40 rounded-lg bg-slate-50 p-4 text-slate-800">
          {isLoading ? (
            <p className="animate-pulse text-slate-500">
              {loadingType === "parse"
                ? "Парсинг статьи…"
                : loadingType === "translate"
                  ? "Перевод статьи…"
                  : `Генерация «${ACTION_LABELS[loadingType as Action]}»…`}
            </p>
          ) : result ? (
            isJsonResult ? (
              <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm">
                {result}
              </pre>
            ) : (
              <p className="whitespace-pre-wrap">{result}</p>
            )
          ) : (
            <p className="text-slate-400">
              Нажмите «Парсинг», «Перевод» или выберите действие AI
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
