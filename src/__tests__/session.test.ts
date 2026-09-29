import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("getSessionSecret", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws in production if SESSION_SECRET is missing", async () => {
    process.env = { ...process.env, NODE_ENV: "production" };
    delete process.env.SESSION_SECRET;
    const { getSessionSecret, sessionOptions } = await import("@/lib/session");
    expect(() => getSessionSecret()).toThrow(
      "SESSION_SECRET environment variable is required"
    );
    expect(() => sessionOptions.password).toThrow(
      "SESSION_SECRET environment variable is required"
    );
  });

  it("uses SESSION_SECRET in production when set", async () => {
    process.env = {
      ...process.env,
      NODE_ENV: "production",
      SESSION_SECRET: "a".repeat(32),
    };
    const { getSessionSecret, sessionOptions } = await import("@/lib/session");
    expect(getSessionSecret()).toBe("a".repeat(32));
    expect(sessionOptions.password).toBe("a".repeat(32));
  });

  it("uses dev fallback when SESSION_SECRET is missing in development", async () => {
    process.env = { ...process.env, NODE_ENV: "development" };
    delete process.env.SESSION_SECRET;
    const { getSessionSecret } = await import("@/lib/session");
    expect(getSessionSecret()).toContain("DEVELOPMENT-ONLY");
  });
});
