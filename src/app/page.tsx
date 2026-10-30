import { ArrowUpRight, Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 sm:px-10">
      <header className="flex items-center gap-3 border-b py-6">
        <Workflow aria-hidden="true" className="size-6" />
        <span className="text-xl font-semibold tracking-tight">WorkBot</span>
      </header>
      <main className="flex flex-1 flex-col justify-center py-16 sm:py-24">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Um ponto de partida para seus workflows.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          WorkBot é a plataforma de workflows empresariais que vamos construir
          durante o curso AI FDE da Plank, uma etapa de cada vez.
        </p>
        <Card className="mt-10 max-w-2xl">
          <CardHeader>
            <CardTitle>O projeto começa aqui</CardTitle>
            <CardDescription>
              Dia 1: estrutura inicial do aplicativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-muted-foreground">
              A base está pronta para as próximas aulas. Os workflows e as
              integrações serão adicionados ao longo do curso.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              render={<a href="https://joinplank.com/ai-fde-course" />}
              nativeButton={false}
            >
              Acessar o curso
              <ArrowUpRight aria-hidden="true" />
            </Button>
          </CardFooter>
        </Card>
      </main>
      <footer className="border-t py-6 text-sm text-muted-foreground">
        WorkBot · Projeto do curso AI FDE da Plank
      </footer>
    </div>
  );
}
