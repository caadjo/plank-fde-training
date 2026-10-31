import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Ambiente e versão da publicação do WorkBot.",
  alternates: { canonical: "/settings" },
  openGraph: {
    title: "Configurações | WorkBot",
    description: "Ambiente e versão da publicação do WorkBot.",
    url: "/settings",
  },
};

export default function Settings() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12 sm:px-10">
      <Link
        href="/"
        className={buttonVariants({ variant: "outline", className: "w-fit" })}
      >
        Voltar ao início
      </Link>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Configurações</h1>
        <p className="mt-3 text-muted-foreground">
          Confira o ambiente e a versão desta publicação.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Publicação</CardTitle>
          <CardDescription>
            Informações da versão do WorkBot em execução.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <div className="flex flex-wrap items-center justify-between gap-3 py-4">
              <dt>Ambiente</dt>
              <dd>
                <Badge variant="secondary">{config.environment}</Badge>
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 py-4">
              <dt>Commit</dt>
              <dd>
                <code className="rounded bg-muted px-2 py-1 text-sm">
                  {config.commit}
                </code>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      <Link
        href="/api/health"
        className="w-fit text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        Consultar health check
      </Link>
    </main>
  );
}
