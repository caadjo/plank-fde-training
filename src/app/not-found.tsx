import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-6 px-6 py-12 sm:px-10">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Página não encontrada
      </h1>
      <p className="max-w-prose text-lg text-muted-foreground">
        O endereço pode ter mudado ou ter sido digitado incorretamente. Volte ao
        início para continuar.
      </p>
      <Link href="/" className={buttonVariants()}>
        Voltar ao início
      </Link>
    </main>
  );
}
