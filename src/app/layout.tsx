import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";
import { config } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: { default: "WorkBot — operações em equipe", template: "%s | WorkBot" },
  description:
    "Projeto WorkBot: um assistente para operações, finanças e suporte, desenvolvido no curso AI FDE da Plank.",
  applicationName: "WorkBot",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "WorkBot",
    title: "WorkBot — operações em equipe",
    description:
      "Acompanhe o desenvolvimento do assistente WorkBot no curso AI FDE da Plank.",
  },
  robots: {
    index: config.environment === "production",
    follow: config.environment === "production",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col antialiased">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
