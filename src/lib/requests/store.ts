import { randomUUID } from "node:crypto";
import { io } from "next/cache";
import { requestInputSchema, type WorkRequest } from "./schema";

const requestGlobal = globalThis as typeof globalThis & {
  workbotRequests?: WorkRequest[];
};

function store() {
  return (requestGlobal.workbotRequests ??= []);
}

/** Temporary, process-local storage for the course. Replaced by a database later. */
export async function createRequest(input: unknown): Promise<WorkRequest> {
  const parsed = requestInputSchema.parse(input);
  await io();
  const request: WorkRequest = {
    ...parsed,
    id: randomUUID(),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  store().push(request);
  return { ...request };
}

export async function listRequests(): Promise<WorkRequest[]> {
  await io();
  return store()
    .toReversed()
    .map((request) => ({ ...request }));
}
