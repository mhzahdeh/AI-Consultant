import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";

describe("api client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends credentials with session requests", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          authenticated: false,
          user: null,
          organizations: [],
          activeOrganizationId: null,
          activeRole: null,
          bootstrapReady: false,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    await api.session();

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/session",
      expect.objectContaining({
        credentials: "include",
      })
    );
  });

  it("surfaces backend error messages", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Invalid email or password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    );

    await expect(api.logIn({ email: "bad@example.com", password: "wrongpass" })).rejects.toThrow(
      "Invalid email or password"
    );
  });
});
