import { apiFetch, buildQuery } from "@/lib/api";

export type CompareAssessmentItem = {
  cve_id: string;
  status: string;
  cvss_score: number | null;
  component_name: string;
};

export type CompareStatusChange = {
  cve_id: string;
  from_status: string;
  to_status: string;
  cvss_score: number | null;
  component_name: string;
};

export type CompareComponentItem = {
  name: string;
  version: string;
};

export type CompareComponentUpgrade = {
  name: string;
  from_version: string;
  to_version: string;
};

export type CompareResponse = {
  from_scan_id: string;
  to_scan_id: string;
  new_cves: CompareAssessmentItem[];
  resolved_cves: CompareAssessmentItem[];
  status_changed: CompareStatusChange[];
  unchanged_count: number;
  added_components: CompareComponentItem[];
  removed_components: CompareComponentItem[];
  upgraded_components: CompareComponentUpgrade[];
  carried_count: number;
  format_mismatch: boolean;
};

export function compareBuilds(projectId: string, fromScanId: string, toScanId: string) {
  return apiFetch<CompareResponse>(
    `/scans/v1/${projectId}/compare/${buildQuery({ from_scan_id: fromScanId, to_scan_id: toScanId })}`
  );
}
