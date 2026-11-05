import type { RequestInput } from "@/lib/requests/schema";

export type RequestFormState = {
  errors: Partial<Record<keyof RequestInput, string[]>>;
  values: Record<keyof RequestInput, string>;
  message?: string;
};

export const initialRequestFormState: RequestFormState = {
  errors: {},
  values: { title: "", details: "", team: "operations", priority: "medium" },
};
