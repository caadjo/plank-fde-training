import { randomUUID } from "node:crypto";
import { io } from "next/cache";
import {
  requestInputSchema,
  workRequestSchema,
  type WorkRequest,
} from "./schema";

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

export async function getRequest(id: string): Promise<WorkRequest | undefined> {
  await io();
  const request = store().find((request) => request.id === id);
  return request ? { ...request } : undefined;
}

/** Validates before writing; a missing ID never inserts a request. */
export async function updateRequestStatus(
  id: unknown,
  status: unknown,
): Promise<WorkRequest | null> {
  const parsed = workRequestSchema.pick({ id: true, status: true }).parse({
    id,
    status,
  });
  await io();
  const request = store().find((entry) => entry.id === parsed.id);
  if (!request) return null;
  request.status = parsed.status;
  return { ...request };
}
