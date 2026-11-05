import { NextRequest, NextResponse } from "next/server";
import { visitorCookie, isVisitorId } from "./lib/visitor";

export function proxy(request: NextRequest) {
  if (isVisitorId(request.cookies.get(visitorCookie)?.value))
    return NextResponse.next();
  const id = crypto.randomUUID();
  // Forward the new cookie so the very first page view and later actions share an ID.
  request.cookies.set(visitorCookie, id);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set(visitorCookie, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  return response;
}

export const config = {
  matcher: ["/((?!api(?:/|$)|_next(?:/|$)|favicon.ico|icon.svg|robots.txt).*)"],
};
