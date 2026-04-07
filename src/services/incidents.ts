import { apiFetch, buildQuery } from "@/lib/api";
import type { PaginationParams } from "@/lib/api";

// Types (manual — incidents API is new, not yet in generated api-types)

export type IncidentStage =
  | "early_warning_24h"
  | "detailed_72h"
  | "final_14d"
  | "closed"
  | "withdrawn"
  | "failed";

export type CVEAlert = {
  id: string;
  vulnerability_id: string;
  scan_id: string;
  severity: "critical" | "high" | "medium" | "low";
  cve_id: string;
  notified_at: string | null;
  seen_at: string | null;
  created_at: string;
  is_exploited: boolean;
  has_active_incident: boolean;
};

export type Incident = {
  id: string;
  cve_alert_id: string;
  scan_id: string;
  cve_id: string;
  product_name: string;
  stage: IncidentStage;
  stage_display: string;
  stage_deadline: string;
  is_overdue: boolean;
  is_active: boolean;
  time_remaining_seconds: number;
  approved_by_email: string | null;
  approved_at: string | null;
  filed_at: string | null;
  failure_reason: string;
  withdrawal_reason: string;
  created_at: string;
  updated_at: string;
};

export type IncidentDetail = Incident & {
  csaf_document: Record<string, unknown> | null;
  severity: string;
  scan_version: string;
};

export type IncidentStats = {
  active: number;
  approaching_deadline: number;
  awaiting_approval: number;
  closed_this_month: number;
  overdue: number;
};

export type PaginatedIncidents = {
  items: Incident[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
};

export type PaginatedAlerts = {
  items: CVEAlert[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
};

// Params
export type ListIncidentsParams = PaginationParams & {
  active_only?: boolean;
};

export type ListAlertsParams = PaginationParams;

// API calls
export function getIncidentStats() {
  return apiFetch<IncidentStats>("/incidents/v1/stats/");
}

export function listIncidents(params?: ListIncidentsParams) {
  return apiFetch<PaginatedIncidents>(
    `/incidents/v1/${buildQuery(params)}`
  );
}

export function getIncident(incidentId: string) {
  return apiFetch<IncidentDetail>(`/incidents/v1/${incidentId}/`);
}

export function advanceStage(incidentId: string, targetStage: IncidentStage) {
  return apiFetch<{ status: string; stage: string }>(
    `/incidents/v1/${incidentId}/advance/`,
    {
      method: "POST",
      body: JSON.stringify({ target_stage: targetStage }),
    }
  );
}

export function withdrawIncident(incidentId: string, reason: string) {
  return apiFetch<{ status: string; stage: string }>(
    `/incidents/v1/${incidentId}/withdraw/`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    }
  );
}

export function listAlerts(params?: ListAlertsParams) {
  return apiFetch<PaginatedAlerts>(
    `/incidents/v1/alerts/${buildQuery(params)}`
  );
}

export function markAlertSeen(alertId: string) {
  return apiFetch<{ status: string }>(
    `/incidents/v1/alerts/${alertId}/mark-seen/`,
    { method: "POST" }
  );
}

export function createIncidentFromAlert(alertId: string) {
  return apiFetch<{ status: string; incident_id: string }>(
    `/incidents/v1/alerts/${alertId}/create-incident/`,
    { method: "POST" }
  );
}
