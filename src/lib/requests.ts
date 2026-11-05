import { randomUUID } from "node:crypto";
import { io } from "next/cache";
import { z } from "zod";
import { query, type Row } from "./db";
import {
  requestInputSchema,
  workRequestSchema,
  type WorkRequest,
} from "./request-model";
import { requestFiltersSchema, type RequestFilters } from "./requests/filters";

function parseRow(row: Row): WorkRequest {
  return workRequestSchema.parse({
    id: row.id,
    title: row.title,
    details: row.details,
    team: row.team,
    priority: row.priority,
    status: row.status,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
  });
}

export async function createRequest(input: unknown): Promise<WorkRequest> {
  const data = requestInputSchema.parse(input);
  await io();
  const rows = await query(
    `INSERT INTO requests (id, title, details, team, priority, status)
     VALUES ($1, $2, $3, $4, $5, 'new') RETURNING *`,
    [randomUUID(), data.title, data.details, data.team, data.priority],
  );
  return parseRow(rows[0]);
}

export async function listRequests(
  filters: RequestFilters = {},
): Promise<WorkRequest[]> {
  const { team, status } = requestFiltersSchema.parse(filters);
  await io();
  return (
    await query(
      `SELECT * FROM requests
     WHERE ($1::text IS NULL OR team = $1) AND ($2::text IS NULL OR status = $2)
     ORDER BY created_at DESC, sequence DESC`,
      [team ?? null, status ?? null],
    )
  ).map(parseRow);
}

export async function getRequest(id: string): Promise<WorkRequest | undefined> {
  if (!z.uuid().safeParse(id).success) return undefined;
  await io();
  const rows = await query("SELECT * FROM requests WHERE id = $1", [id]);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function updateRequestStatus(
  id: unknown,
  status: unknown,
): Promise<WorkRequest | null> {
  const data = workRequestSchema
    .pick({ id: true, status: true })
    .parse({ id, status });
  await io();
  const rows = await query(
    "UPDATE requests SET status = $2 WHERE id = $1 RETURNING *",
    [data.id, data.status],
  );
  return rows[0] ? parseRow(rows[0]) : null;
}

export const updateRequest = updateRequestStatus;
