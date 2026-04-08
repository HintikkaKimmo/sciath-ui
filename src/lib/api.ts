import type { components } from "./api-types";

const API_BASE = "/api/proxy";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "same-origin",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, `API error: ${res.status}`, data);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Re-export commonly used schema types for convenience
export type PaginationParams = {
  limit?: number;
  offset?: number;
};

export type ProjectSchema = components["schemas"]["ProjectSchema"];
export type ScanSchema = components["schemas"]["ScanSchema"];
export type AssessmentListItemSchema =
  components["schemas"]["AssessmentListItemSchema"];
export type VulnerabilitySchema =
  components["schemas"]["VulnerabilitySchema"];
export type ReportSchema = components["schemas"]["ReportSchema"];
export type ActivityLogSchema = components["schemas"]["ActivityLogSchema"];
export type CustomFilterPolicySchema =
  components["schemas"]["CustomFilterPolicySchema"];
export type ScanStatusResponse =
  components["schemas"]["ScanStatusResponse"];
export type CRAReadinessResponse =
  components["schemas"]["CRAReadinessResponse"];
export type ReportResponse = components["schemas"]["ReportResponse"];

// Build query string from params, omitting undefined values
export function buildQuery(
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined
  );
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(
    entries.map(([k, v]) => [k, String(v)])
  ).toString();
}

// Query key factory for consistent cache invalidation
export const queryKeys = {
  dashboard: {
    all: ["dashboard"] as const,
    stats: () => [...queryKeys.dashboard.all, "stats"] as const,
  },
  projects: {
    all: ["projects"] as const,
    list: (params?: Record<string, string>) =>
      [...queryKeys.projects.all, "list", params] as const,
    detail: (id: string) => [...queryKeys.projects.all, id] as const,
  },
  scans: {
    all: ["scans"] as const,
    list: (projectId?: string) =>
      [...queryKeys.scans.all, "list", projectId] as const,
    detail: (id: string) => [...queryKeys.scans.all, id] as const,
    status: (id: string) => [...queryKeys.scans.all, id, "status"] as const,
    assessments: (id: string) =>
      [...queryKeys.scans.all, id, "assessments"] as const,
    craReadiness: (id: string) =>
      [...queryKeys.scans.all, id, "cra-readiness"] as const,
  },
  assessments: {
    all: ["assessments"] as const,
    list: (params?: Record<string, string>) =>
      [...queryKeys.assessments.all, "list", params] as const,
    detail: (id: string) => [...queryKeys.assessments.all, id] as const,
  },
  findings: {
    all: ["findings"] as const,
    list: (params?: Record<string, string>) =>
      [...queryKeys.findings.all, "list", params] as const,
  },
  reports: {
    all: ["reports"] as const,
    list: (scanId?: string) =>
      [...queryKeys.reports.all, "list", scanId] as const,
  },
  activity: {
    all: ["activity"] as const,
    list: (params?: Record<string, string>) =>
      [...queryKeys.activity.all, "list", params] as const,
  },
  policies: {
    all: ["policies"] as const,
    list: () => [...queryKeys.policies.all, "list"] as const,
    detail: (id: string) => [...queryKeys.policies.all, id] as const,
  },
  intelligence: {
    all: ["intelligence"] as const,
    syncStatus: () => [...queryKeys.intelligence.all, "sync-status"] as const,
    syncStats: () => [...queryKeys.intelligence.all, "sync-stats"] as const,
  },
  incidents: {
    all: ["incidents"] as const,
    stats: () => [...queryKeys.incidents.all, "stats"] as const,
    list: (params?: Record<string, string>) =>
      [...queryKeys.incidents.all, "list", params] as const,
    detail: (id: string) => [...queryKeys.incidents.all, id] as const,
    alerts: (params?: Record<string, string>) =>
      [...queryKeys.incidents.all, "alerts", params] as const,
  },
  team: {
    all: ["team"] as const,
    members: () => [...queryKeys.team.all, "members"] as const,
    invites: () => [...queryKeys.team.all, "invites"] as const,
  },
  compare: {
    all: ["compare"] as const,
    detail: (projectId: string, fromId: string, toId: string) =>
      [...queryKeys.compare.all, projectId, fromId, toId] as const,
  },
  apiKeys: {
    all: ["apiKeys"] as const,
    list: () => [...queryKeys.apiKeys.all, "list"] as const,
  },
  me: {
    all: ["me"] as const,
    profile: () => [...queryKeys.me.all, "profile"] as const,
  },
  trustCenter: {
    all: ["trustCenter"] as const,
    detail: (slug: string) => [...queryKeys.trustCenter.all, slug] as const,
  },
} as const;
