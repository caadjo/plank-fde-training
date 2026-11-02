import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Administração" };

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Administração</h1>
      <p className="max-w-prose text-muted-foreground">
        Acompanhe as solicitações da equipe e consulte as configurações do
        WorkBot.
      </p>
      <Link href="/requests" className={buttonVariants({ variant: "outline" })}>
        Ver solicitações
      </Link>
    </div>
  );
}
