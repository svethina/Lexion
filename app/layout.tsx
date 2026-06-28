import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lexion",
  description: "Парсинг англоязычных статей и генерация ответа с помощью AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
