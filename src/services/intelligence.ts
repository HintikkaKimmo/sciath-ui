import { apiFetch } from "@/lib/api";
import type { components } from "@/lib/api-types";

export type SyncStatus = components["schemas"]["SyncStatusOut"];
export type SyncStats = components["schemas"]["SyncStatsOut"];

export function getSyncStatus() {
  return apiFetch<SyncStatus[]>("/sync/v1/status/");
}

export function getSyncStats() {
  return apiFetch<SyncStats>("/sync/v1/stats/");
}
