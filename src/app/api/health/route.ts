import { connection } from "next/server";
import { config } from "@/lib/config";
import { query } from "@/lib/db";

export async function GET() {
  await connection();
  try {
    await query("SELECT 1 AS healthy");
    return Response.json(
      { status: "ok", database: "ok", commit: config.commit },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "error", database: "unavailable", commit: config.commit },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
