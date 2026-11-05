import { z } from "zod";

export const requestTeams = ["operations", "finance", "support"] as const;
export const requestPriorities = ["low", "medium", "high"] as const;
export const requestStatuses = ["new", "in_progress", "completed"] as const;

export const teamLabels = {
  operations: "Operações",
  finance: "Finanças",
  support: "Suporte",
} as const;
export const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
} as const;
export const statusLabels = {
  new: "Nova",
  in_progress: "Em andamento",
  completed: "Concluída",
} as const;

export const requestInputSchema = z.strictObject({
  title: z
    .string()
    .trim()
    .min(3, "Use pelo menos 3 caracteres.")
    .max(120, "Use até 120 caracteres."),
  details: z.string().trim().max(5000, "Use até 5.000 caracteres.").default(""),
  team: z
    .enum(requestTeams, { error: "Escolha uma equipe válida." })
    .default("operations"),
  priority: z
    .enum(requestPriorities, { error: "Escolha uma prioridade válida." })
    .default("medium"),
});

export const workRequestSchema = requestInputSchema.extend({
  id: z.uuid(),
  status: z.enum(requestStatuses),
  createdAt: z.iso.datetime(),
});

export type RequestInput = z.infer<typeof requestInputSchema>;
export type WorkRequest = z.infer<typeof workRequestSchema>;
