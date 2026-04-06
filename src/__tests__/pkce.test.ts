import { describe, it, expect } from "vitest";
import { generateCodeVerifier, generateCodeChallenge } from "@/lib/pkce";

describe("PKCE", () => {
  it("generates a code verifier of valid length", () => {
    const verifier = generateCodeVerifier();
    // base64url of 32 bytes = 43 chars
    expect(verifier.length).toBeGreaterThanOrEqual(43);
    expect(verifier.length).toBeLessThanOrEqual(128);
  });

  it("generates unique verifiers", () => {
    const a = generateCodeVerifier();
    const b = generateCodeVerifier();
    expect(a).not.toBe(b);
  });

  it("generates a valid S256 code challenge", () => {
    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);
    // base64url of SHA-256 = 43 chars
    expect(challenge.length).toBe(43);
    // base64url characters only
    expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("produces deterministic challenge for same verifier", () => {
    const verifier = "test-verifier-string";
    const a = generateCodeChallenge(verifier);
    const b = generateCodeChallenge(verifier);
    expect(a).toBe(b);
  });
});
