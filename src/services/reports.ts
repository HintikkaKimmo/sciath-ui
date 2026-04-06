import { apiFetch, buildQuery } from "@/lib/api";
import type { components } from "@/lib/api-types";
import type { PaginationParams } from "@/lib/api";

// Types
export type Report = components["schemas"]["ReportSchema"];
export type ReportResponse = components["schemas"]["ReportResponse"];
export type PaginatedReports = components["schemas"]["PaginatedReports"];
export type GenerateRequest = components["schemas"]["GenerateRequest"];

// List reports (from assessments router)
export function listReports(params?: PaginationParams & {
  scan_id?: string;
}) {
  return apiFetch<PaginatedReports>(
    `/assessments/v1/reports/${buildQuery(params)}`
  );
}

export function getReport(reportId: string) {
  return apiFetch<Report>(`/assessments/v1/reports/${reportId}/`);
}

// Generate report (from reports router)
export function generateReport(scanId: string, format: string) {
  return apiFetch<ReportResponse>(
    `/reports/v1/scans/${scanId}/generate/`,
    {
      method: "POST",
      body: JSON.stringify({ format }),
    }
  );
}

// Get generated report metadata
export function getGeneratedReport(reportId: string) {
  return apiFetch<ReportResponse>(`/reports/v1/${reportId}/`);
}

// Download report — returns the raw response for blob handling
export async function downloadReport(reportId: string): Promise<Blob> {
  const res = await fetch(`/api/proxy/reports/v1/${reportId}/download/`, {
    credentials: "same-origin",
  });
  if (!res.ok) {
    throw new Error(`Download failed: ${res.status}`);
  }
  return res.blob();
}

// Export all evidence as ZIP
export async function exportEvidence(scanId: string): Promise<Blob> {
  const res = await fetch(
    `/api/proxy/reports/v1/scans/${scanId}/export/`,
    { credentials: "same-origin" }
  );
  if (!res.ok) {
    throw new Error(`Export failed: ${res.status}`);
  }
  return res.blob();
}
