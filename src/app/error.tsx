"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center gap-6 px-6 py-12 sm:px-10">
      <h1 className="text-3xl font-semibold tracking-tight">
        Não foi possível carregar esta página
      </h1>
      <p className="text-muted-foreground">
        Tente novamente em instantes. Se você acabou de enviar uma solicitação,
        confira a lista antes de reenviar.
      </p>
      <Button onClick={retry}>Tentar novamente</Button>
      <Link href="/requests" className="underline underline-offset-4">
        Ver solicitações
      </Link>
    </main>
  );
}
