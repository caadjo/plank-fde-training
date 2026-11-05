import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config, proxy } from "./proxy";
import { visitorCookie } from "./lib/visitor";

describe("anonymous visitor proxy", () => {
  it("sets a secure HTTP-only UUID cookie and forwards it on the first request", () => {
    const request = new NextRequest("https://workbot.example/requests/new");
    const response = proxy(request);
    const cookie = response.cookies.get(visitorCookie)!;
    expect(cookie.value).toMatch(/^[0-9a-f-]{36}$/);
    expect(cookie).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
    expect(response.headers.get("x-middleware-request-cookie")).toContain(
      cookie.value,
    );
  });
  it("retains valid visitor IDs and replaces arbitrary text", () => {
    const request = new NextRequest("http://localhost/requests", {
      headers: {
        cookie: `${visitorCookie}=c0b91ad0-04c6-4e2a-8a78-fcda241411ac`,
      },
    });
    expect(proxy(request).cookies.get(visitorCookie)).toBeUndefined();
    const invalid = new NextRequest("http://localhost/requests", {
      headers: { cookie: `${visitorCookie}=person@example.com` },
    });
    expect(proxy(invalid).cookies.get(visitorCookie)?.value).not.toBe(
      "person@example.com",
    );
  });
  it("excludes API, Next.js assets and icons", () => {
    for (const url of [
      "/api/health",
      "/api/requests",
      "/_next/static/a.js",
      "/favicon.ico",
      "/icon.svg",
    ]) {
      expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false);
    }
    expect(unstable_doesMiddlewareMatch({ config, url: "/requests/new" })).toBe(
      true,
    );
  });
});
