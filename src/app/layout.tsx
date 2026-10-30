import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkBot",
  description:
    "Plataforma de workflows empresariais — projeto do curso AI FDE da Plank.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
