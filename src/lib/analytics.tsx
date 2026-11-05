import { after } from "next/server";
import { cookies, headers } from "next/headers";
import { io } from "next/cache";
import { z } from "zod";
import { serverConfig } from "./config";
import { requestTeams, requestStatuses } from "./request-model";
import { isVisitorId, visitorCookie } from "./visitor";

const recordProperties = z.strictObject({
  requestId: z.uuid(),
  team: z.enum(requestTeams),
});
const events = {
  request_form_viewed: z.strictObject({}),
  request_submitted: recordProperties,
  request_viewed: recordProperties,
  request_status_changed: recordProperties.extend({
    status: z.enum(requestStatuses),
  }),
};
export type FunnelEvent = keyof typeof events;

/** Analytics never receives titles, details, email addresses or submitted form text. */
export async function track<E extends FunnelEvent>(
  event: E,
  properties: z.input<(typeof events)[E]>,
) {
  if (!serverConfig.posthogKey) return;
  try {
    const safeProperties = events[event].parse(properties);
    const requestHeaders = await headers();
    if (
      requestHeaders.has("next-router-prefetch") ||
      requestHeaders.get("purpose") === "prefetch" ||
      requestHeaders.get("sec-purpose")?.includes("prefetch")
    )
      return;
    const visitor = (await cookies()).get(visitorCookie)?.value;
    if (!isVisitorId(visitor)) return;
    const key = serverConfig.posthogKey;
    const host = serverConfig.posthogHost;
    const timestamp = new Date().toISOString();
    after(async () => {
      try {
        const response = await fetch(new URL("/i/v0/e/", host), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: key,
            distinct_id: visitor,
            event,
            properties: { ...safeProperties, $process_person_profile: false },
            timestamp,
          }),
          signal: AbortSignal.timeout(5000),
          cache: "no-store",
          redirect: "error",
        });
        if (!response.ok) console.warn("Analytics capture failed.");
      } catch {
        console.warn("Analytics capture failed.");
      }
    });
  } catch {
    console.warn("Analytics event could not be scheduled.");
  }
}

export async function Track() {
  // Keep this leaf dynamic even when the build has no PostHog credentials.
  await io();
  await track("request_form_viewed", {});
  return null;
}
