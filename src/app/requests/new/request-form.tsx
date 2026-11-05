"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  priorityLabels,
  requestPriorities,
  requestTeams,
  teamLabels,
} from "@/lib/requests/schema";
import { submitRequest } from "./actions";
import { initialRequestFormState } from "./form-state";

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  return errors?.length ? (
    <p id={id} className="text-sm text-destructive">
      {errors.join(" ")}
    </p>
  ) : null;
}

export function RequestForm() {
  const [state, formAction, pending] = useActionState(
    submitRequest,
    initialRequestFormState,
    "/requests/new",
  );
  const fields = state.errors;
  return (
    <Card className="max-w-2xl">
      <CardContent>
        <form action={formAction} className="space-y-6" aria-busy={pending}>
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Título{" "}
              <span className="text-muted-foreground">(obrigatório)</span>
            </label>
            <Input
              id="title"
              name="title"
              required
              minLength={3}
              maxLength={120}
              defaultValue={state.values.title}
              placeholder="Ex.: acesso ao relatório mensal"
              aria-invalid={Boolean(fields.title?.length)}
              aria-describedby={
                fields.title?.length ? "title-help title-error" : "title-help"
              }
            />
            <p id="title-help" className="text-sm text-muted-foreground">
              Resuma o trabalho solicitado em até 120 caracteres.
            </p>
            <FieldError id="title-error" errors={fields.title} />
          </div>
          <div className="space-y-2">
            <label htmlFor="details" className="text-sm font-medium">
              Detalhes <span className="text-muted-foreground">(opcional)</span>
            </label>
            <Textarea
              id="details"
              name="details"
              rows={5}
              maxLength={5000}
              defaultValue={state.values.details}
              placeholder="Inclua o contexto e o resultado esperado."
              aria-invalid={Boolean(fields.details?.length)}
              aria-describedby={
                fields.details?.length
                  ? "details-help details-error"
                  : "details-help"
              }
            />
            <p id="details-help" className="text-sm text-muted-foreground">
              Até 5.000 caracteres.
            </p>
            <FieldError id="details-error" errors={fields.details} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="team" className="text-sm font-medium">
                Equipe
              </label>
              <NativeSelect
                key={state.values.team}
                id="team"
                name="team"
                defaultValue={state.values.team}
                className="w-full"
                aria-invalid={Boolean(fields.team?.length)}
                aria-describedby={
                  fields.team?.length ? "team-error" : undefined
                }
              >
                {requestTeams.map((team) => (
                  <NativeSelectOption key={team} value={team}>
                    {teamLabels[team]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError id="team-error" errors={fields.team} />
            </div>
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Prioridade
              </label>
              <NativeSelect
                key={state.values.priority}
                id="priority"
                name="priority"
                defaultValue={state.values.priority}
                className="w-full"
                aria-invalid={Boolean(fields.priority?.length)}
                aria-describedby={
                  fields.priority?.length ? "priority-error" : undefined
                }
              >
                {requestPriorities.map((priority) => (
                  <NativeSelectOption key={priority} value={priority}>
                    {priorityLabels[priority]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError id="priority-error" errors={fields.priority} />
            </div>
          </div>
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-destructive"
          >
            {state.message}
          </p>
          <Button type="submit" disabled={pending} size="lg">
            {pending ? "Enviando…" : "Enviar solicitação"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
