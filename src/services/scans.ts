import { apiFetch, buildQuery } from "@/lib/api";
import type { components } from "@/lib/api-types";
import type { PaginationParams } from "@/lib/api";

// Types
export type Scan = components["schemas"]["ScanSchema"];
export type ScanCreate = components["schemas"]["ScanCreateSchema"];
export type ScanUpdate = components["schemas"]["ScanUpdateSchema"];
export type PaginatedScans = components["schemas"]["PaginatedScans"];
export type ScanStatus = components["schemas"]["ScanStatusResponse"];
export type CRAReadiness = components["schemas"]["CRAReadinessResponse"];
export type AnalyseResponse = components["schemas"]["AnalyseResponse"];

// Params
export type ListScansParams = PaginationParams & {
  project_id?: string;
  status?: string;
};

// CRUD
export function listScans(params?: ListScansParams) {
  return apiFetch<PaginatedScans>(
    `/core/v1/scans/${buildQuery(params)}`
  );
}

export function getScan(scanId: string) {
  return apiFetch<Scan>(`/core/v1/scans/${scanId}/`);
}

export function createScan(data: ScanCreate) {
  return apiFetch<Scan>("/core/v1/scans/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateScan(scanId: string, data: ScanUpdate) {
  return apiFetch<Scan>(`/core/v1/scans/${scanId}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteScan(scanId: string) {
  return apiFetch<void>(`/core/v1/scans/${scanId}/`, {
    method: "DELETE",
  });
}

// Analysis
export function triggerAnalysis(
  scanId: string,
  carryForward = true
) {
  return apiFetch<AnalyseResponse>(
    `/scans/v1/${scanId}/analyse/${buildQuery({ carry_forward: carryForward })}`,
    { method: "POST" }
  );
}

export function getScanStatus(scanId: string) {
  return apiFetch<ScanStatus>(`/scans/v1/${scanId}/status/`);
}

export function getCraReadiness(scanId: string) {
  return apiFetch<CRAReadiness>(`/scans/v1/${scanId}/cra-readiness/`);
}
