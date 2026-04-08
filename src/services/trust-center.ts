import { apiFetch } from "@/lib/api";

export type TrustCenterProduct = {
  project_id: string;
  project_name: string;
  latest_scan_version: string;
  total_cves: number;
  suppressed: number;
  grade: string;
  score: number;
};

export type TrustCenterResponse = {
  customer_name: string;
  customer_slug: string;
  products: TrustCenterProduct[];
};

export function getTrustCenter(slug: string) {
  return apiFetch<TrustCenterResponse>(`/trust-center/v1/${slug}/`);
}

export function trustCenterDownloadUrl(
  slug: string,
  projectId: string,
  format: "vex_cdx" | "sbom_cdx"
) {
  return `/api/proxy/trust-center/v1/${slug}/${projectId}/download/?format=${format}`;
}
