"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TriageTable } from "@/components/triage/triage-table";
import { VexWaterfall } from "@/components/charts/vex-waterfall";
import { useProject } from "@/hooks/use-projects";
import { useScan } from "@/hooks/use-scans";
import { useAssessments, useUpdateAssessment } from "@/hooks/use-assessments";
import { DetailSkeleton } from "@/components/ui/data-skeleton";
import { ErrorState } from "@/components/ui/error-state";

type Status = "affected" | "not_affected" | "under_investigation" | "fixed";

export default function ScanDetailPage() {
  const { id: projectId, scanId } = useParams<{
    id: string;
    scanId: string;
  }>();
  const { data: project } = useProject(projectId);
  const {
    data: scan,
    isLoading: scanLoading,
    error: scanError,
    refetch,
  } = useScan(scanId);
  const { data: assessmentsData, isLoading: assessmentsLoading } =
    useAssessments({ scan_id: scanId, limit: 1000 });
  const updateAssessment = useUpdateAssessment();

  if (scanLoading || assessmentsLoading) return <DetailSkeleton />;
  if (scanError)
    return (
      <ErrorState message="Failed to load scan" onRetry={() => refetch()} />
    );
  if (!scan) return null;

  const assessments = assessmentsData?.items ?? [];

  // Map assessments to TriageTable CVE format
  const cves = assessments.map((a) => ({
    id: a.vulnerability?.vuln_id ?? a.vulnerability_id,
    pkg: a.vulnerability?.component?.name ?? "unknown",
    cvss: a.vulnerability?.cvss_score ?? 0,
    status: a.status as Status,
    rationale: a.suppression_rationale || a.justification_text || null,
    layer: a.filter_layer && a.filter_layer !== "none" ? a.filter_layer : null,
  }));

  // Build waterfall stages from assessment filter layers
  const layerOrder = [
    "kconfig",
    "device_tree",
    "patch",
    "busybox",
    "packageconfig",
    "deployment",
  ];
  const layerLabels: Record<string, string> = {
    kconfig: "Kconfig",
    device_tree: "Device Tree",
    patch: "Patch Detection",
    busybox: "BusyBox",
    packageconfig: "PACKAGECONFIG",
    deployment: "Deployment",
  };

  let remaining = scan.total_vulnerabilities;
  const waterfallStages = layerOrder
    .map((layer) => {
      const suppressed = assessments.filter(
        (a) =>
          a.filter_layer === layer &&
          (a.status === "not_affected" || a.status === "fixed")
      ).length;
      remaining -= suppressed;
      return {
        name: layerLabels[layer] ?? layer,
        example: "",
        suppressed,
        remaining,
      };
    })
    .filter((s) => s.suppressed > 0);

  function handleStatusChange(cveId: string, status: Status) {
    const assessment = assessments.find(
      (a) => (a.vulnerability?.vuln_id ?? a.vulnerability_id) === cveId
    );
    if (assessment) {
      updateAssessment.mutate({
        assessmentId: assessment.id,
        data: { status },
      });
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Breadcrumb */}
      <Link
        href={`/products/${projectId}`}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        {project?.name ?? "Product"}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-serif">
            Scan — {new Date(scan.created_at).toLocaleDateString()}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {scan.version_label && `${scan.version_label} · `}
            {scan.total_vulnerabilities} input CVEs · {scan.remaining_count}{" "}
            remaining after filters
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
          <Download className="h-3 w-3" />
          Export VEX
        </Button>
      </div>

      {/* VEX Waterfall */}
      {waterfallStages.length > 0 && (
        <VexWaterfall
          startingCves={scan.total_vulnerabilities}
          stages={waterfallStages}
        />
      )}

      {/* Triage Table */}
      <TriageTable cves={cves} onStatusChange={handleStatusChange} />
    </div>
  );
}
