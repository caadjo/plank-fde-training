import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules:
      config.environment === "production"
        ? { userAgent: "*", allow: "/", disallow: "/api/" }
        : { userAgent: "*", disallow: "/" },
  };
}
