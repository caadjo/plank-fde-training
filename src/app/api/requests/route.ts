import { createRequest, listRequests } from "@/lib/requests/store";
import { createRequestBodySchema } from "./types";

const headers = { "Cache-Control": "no-store" };

export async function GET() {
  return Response.json({ requests: await listRequests() }, { headers });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json(
        { error: "JSON malformado." },
        { status: 400, headers },
      );
    }
    throw error;
  }
  const parsed = createRequestBodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Dados inválidos.",
        issues: parsed.error.issues.map(({ code, path, message }) => ({
          code,
          path: path.map((part) =>
            typeof part === "number" ? part : String(part),
          ),
          message,
        })),
      },
      { status: 400, headers },
    );
  }
  const created = await createRequest(parsed.data);
  return Response.json({ request: created }, { status: 201, headers });
}
