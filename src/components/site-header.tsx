import Link from "next/link";
import { Workflow } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  return (
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
        <Link href="/settings" className={buttonVariants({ variant: "ghost" })}>
          Configurações
        </Link>
      </nav>
    </header>
  );
}
