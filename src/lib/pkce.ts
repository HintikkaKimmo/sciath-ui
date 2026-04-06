import { randomBytes, createHash } from "crypto";

/**
 * Generate a PKCE code verifier (43-128 characters, URL-safe).
 */
export function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Generate a PKCE code challenge from a verifier (S256 method).
 */
export function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}
