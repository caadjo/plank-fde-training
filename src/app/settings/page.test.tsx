import { describe, expect, it, vi } from "vitest";
import LegacySettingsPage from "./page";

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error("REDIRECT:" + url);
  },
}));

describe("legacy settings route", () => {
  it("redirects existing links to the admin settings page", () => {
    expect(() => LegacySettingsPage()).toThrow("REDIRECT:/admin/settings");
  });
});
