import { apiFetch, buildQuery } from "@/lib/api";
import type { components } from "@/lib/api-types";
import type { PaginationParams } from "@/lib/api";

// Types
export type ActivityLog = components["schemas"]["ActivityLogSchema"];
export type PaginatedActivityLogs =
  components["schemas"]["PaginatedActivityLogs"];

export type ActivityFilterParams = PaginationParams & {
  resource_type?: string;
  action?: string;
  user_id?: string;
};

// API calls
export function listActivity(params?: ActivityFilterParams) {
  return apiFetch<PaginatedActivityLogs>(
    `/core/v1/activity/${buildQuery(params)}`
  );
}

export function activityExportCsvUrl(
  params?: Omit<ActivityFilterParams, "limit" | "offset">
) {
  return `/api/proxy/core/v1/activity/export/csv/${buildQuery(params)}`;
}
