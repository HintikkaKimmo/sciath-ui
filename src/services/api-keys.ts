import { apiFetch } from "@/lib/api";
import type { components } from "@/lib/api-types";

export type ApiKey = components["schemas"]["APIKeyOut"];
export type ApiKeyCreate = components["schemas"]["APIKeyCreateOut"];

export function listApiKeys() {
  return apiFetch<ApiKey[]>("/core/v1/api-keys/");
}

export function generateApiKey(name: string, scopes: string[]) {
  return apiFetch<ApiKeyCreate>("/core/v1/api-keys/", {
    method: "POST",
    body: JSON.stringify({ name, scopes }),
  });
}

export function revokeApiKey(keyId: string) {
  return apiFetch("/core/v1/api-keys/" + keyId + "/", {
    method: "DELETE",
  });
}
