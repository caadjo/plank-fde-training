import type { Metadata } from "next";
import Link from "next/link";
import { Workflow } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 sm:px-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b py-6">
        <Link
          href="/"
          className="flex items-center gap-3 rounded focus-visible:outline-2 focus-visible:outline-offset-4"
          aria-label="WorkBot — início"
        >
          <Workflow aria-hidden="true" className="size-6" />
          <span className="text-xl font-semibold tracking-tight">WorkBot</span>
        </Link>
        <nav aria-label="Navegação principal">
          <Link
            href="/settings"
            className={buttonVariants({ variant: "ghost" })}
          >
            Configurações
          </Link>
        </nav>
      </header>
      <main className="flex flex-1 flex-col justify-center py-16 sm:py-24">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Um lugar para organizar o trabalho da sua equipe.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          WorkBot é um assistente para operações, finanças e suporte. Este
          projeto evolui ao longo do curso AI FDE da Plank, começando pela base
          do aplicativo e sua publicação.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/settings" className={buttonVariants()}>
            Ver configurações
          </Link>
          <Link
            href="/api/health"
            className={buttonVariants({ variant: "outline" })}
          >
            Consultar health check
          </Link>
        </div>
      </main>
    </div>
  );
}
