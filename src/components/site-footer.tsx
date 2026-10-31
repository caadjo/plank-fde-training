import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p className="text-muted-foreground">WorkBot · Curso AI FDE da Plank</p>
        <nav
          aria-label="Links do rodapé"
          className="flex flex-wrap gap-x-6 gap-y-3"
        >
          <Link
            href="/"
            className="rounded underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Início
          </Link>
          <Link
            href="/settings"
            className="rounded underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Configurações
          </Link>
          <a
            href="https://joinplank.com/ai-fde-course"
            className="rounded underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Ver curso
          </a>
        </nav>
      </div>
    </footer>
  );
}
