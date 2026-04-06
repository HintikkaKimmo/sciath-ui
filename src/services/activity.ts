import { apiFetch, buildQuery } from "@/lib/api";
import type { components } from "@/lib/api-types";
import type { PaginationParams } from "@/lib/api";

// Types
export type ActivityLog = components["schemas"]["ActivityLogSchema"];
export type PaginatedActivityLogs =
  components["schemas"]["PaginatedActivityLogs"];

// API calls
export function listActivity(params?: PaginationParams) {
  return apiFetch<PaginatedActivityLogs>(
    `/core/v1/activity/${buildQuery(params)}`
  );
}
