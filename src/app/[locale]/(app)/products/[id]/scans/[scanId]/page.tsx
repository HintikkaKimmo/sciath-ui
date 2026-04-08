"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Download,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TriageTable } from "@/components/triage/triage-table";
import { VexWaterfall } from "@/components/charts/vex-waterfall";
import { ComponentsTab } from "@/components/scan/components-tab";
import { ReportsTab } from "@/components/scan/reports-tab";
import { useProject } from "@/hooks/use-projects";
import { useScan, useTriggerAnalysis, useScanStatus } from "@/hooks/use-scans";
import { useAssessments, useUpdateAssessment } from "@/hooks/use-assessments";
import { exportEvidence } from "@/services/reports";
import { DetailSkeleton } from "@/components/ui/data-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { downloadBlob } from "@/lib/utils";
import { toast } from "sonner";

type Status = "affected" | "not_affected" | "under_investigation" | "fixed";

const EXPORT_FORMATS = [
  { value: "vex_cdx", label: "exportVex", ext: "vex.json" },
  { value: "sbom_cdx", label: "exportSbom", ext: "sbom.json" },
  { value: "sbom_vex_cdx", label: "exportSbomVex", ext: "sbom-vex.json" },
  { value: "sbom_spdx", label: "exportSpdx", ext: "sbom.spdx.json" },
  { value: "sarif", label: "exportSarif", ext: "sarif.json" },
] as const;

function ScanStatusBanner({
  scan,
  scanId,
}: {
  scan: { status: string };
  scanId: string;
}) {
  const t = useTranslations("scan");
  const triggerAnalysis = useTriggerAnalysis();
  const [carryForward, setCarryForward] = useState(true);
  const { data: status } = useScanStatus(
    scanId,
    scan.status === "analysing"
  );

  // D4: Phased progress
  const getPhase = () => {
    if (!status) return 0;
    if (status.total_vulnerabilities && status.total_vulnerabilities > 0)
      return 2;
    if (status.total_components && status.total_components > 0) return 1;
    return 0;
  };

  const phases = [
    t("parsingPhase"),
    t("matchingPhase"),
    t("scoringPhase"),
    t("completePhase"),
  ];
  const currentPhase = getPhase();

  if (scan.status === "draft" || scan.status === "failed") {
    return (
      <div className="bg-card border rounded-md p-4 space-y-3">
        <p className="text-sm">
          {scan.status === "failed"
            ? t("failedMessage")
            : t("draftMessage")}
        </p>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={carryForward}
            onChange={(e) => setCarryForward(e.target.checked)}
            className="rounded"
          />
          {t("carryForward")}
        </label>
        <Button
          size="sm"
          className="h-7 text-xs"
          onClick={() =>
            triggerAnalysis.mutate({ scanId, carryForward })
          }
          disabled={triggerAnalysis.isPending}
        >
          {triggerAnalysis.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
          ) : null}
          {t("runAnalysis")}
        </Button>
      </div>
    );
  }

  if (scan.status === "analysing") {
    return (
      <div
        className="bg-card border rounded-md p-4 space-y-3"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <div>
            <p className="text-sm font-medium">{t("analysing")}</p>
            <p className="text-xs text-muted-foreground">
              {status?.total_components
                ? t("analysingDetail", {
                    components: status.total_components,
                    cves: status.total_vulnerabilities ?? 0,
                  })
                : t("processingSbom")}
            </p>
          </div>
        </div>
        {/* D4: Phase indicators */}
        <div className="flex gap-1">
          {phases.map((phase, i) => (
            <div key={phase} className="flex-1">
              <div
                className={`h-1 rounded-full ${
                  i <= currentPhase
                    ? "bg-primary"
                    : "bg-secondary"
                }`}
              />
              <p
                className={`text-[10px] mt-0.5 ${
                  i === currentPhase
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {phase}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export default function ScanDetailPage() {
  const { id: projectId, scanId } = useParams<{
    id: string;
    scanId: string;
  }>();
  const t = useTranslations("scan");
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "assessments";

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
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  // D5: Tab state in URL
  const handleTabChange = (value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    window.history.replaceState({}, "", url.toString());
  };

  if (scanLoading || assessmentsLoading) return <DetailSkeleton />;
  if (scanError)
    return (
      <ErrorState message={t("failedToLoad")} onRetry={() => refetch()} />
    );
  if (!scan) return null;

  const assessments = assessmentsData?.items ?? [];
  const showTabs =
    scan.status === "triage" ||
    scan.status === "complete" ||
    scan.status === "analysing";

  // Map assessments to TriageTable CVE format
  const cves = assessments.map((a) => ({
    id: a.vulnerability?.vuln_id ?? a.vulnerability_id,
    assessmentId: a.id,
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
    kconfig: t("filters.kconfig"),
    device_tree: t("filters.deviceTree"),
    patch: t("filters.patch"),
    busybox: t("filters.busybox"),
    packageconfig: t("filters.packageconfig"),
    deployment: t("filters.deployment"),
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

  async function handleExport(format: string, ext: string) {
    setExportingFormat(format);
    try {
      const res = await fetch(
        `/api/proxy/reports/v1/scans/${scanId}/export/?format=${format}`,
        { credentials: "same-origin" }
      );
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);
      const blob = await res.blob();
      downloadBlob(
        blob,
        `sciath-${project?.name ?? "scan"}-${scan?.version_label ?? scanId}.${ext}`
      );
    } catch {
      toast.error(t("exportFailed"));
    } finally {
      setExportingFormat(null);
    }
  }

  async function handleEvidencePack() {
    setExportingFormat("evidence");
    try {
      const blob = await exportEvidence(scanId);
      downloadBlob(
        blob,
        `sciath-evidence-${project?.name ?? "scan"}-${scan?.version_label ?? scanId}.zip`
      );
    } catch {
      toast.error(t("exportFailed"));
    } finally {
      setExportingFormat(null);
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
        {project?.name ?? t("backToProduct")}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-serif">
            Scan — {new Date(scan.created_at).toLocaleDateString()}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {scan?.version_label && `${scan?.version_label} · `}
            {scan.total_vulnerabilities} input CVEs · {scan.remaining_count}{" "}
            remaining after filters
          </p>
        </div>

        {/* Task 8: Export dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 h-7 text-xs font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
          >
            <Download className="h-3 w-3" />
            {t("export")}
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {EXPORT_FORMATS.map((f) => (
              <DropdownMenuItem
                key={f.value}
                onClick={() => handleExport(f.value, f.ext)}
                disabled={exportingFormat === f.value}
              >
                {exportingFormat === f.value && (
                  <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                )}
                {t(f.label)}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onClick={handleEvidencePack}
              disabled={exportingFormat === "evidence"}
            >
              {exportingFormat === "evidence" && (
                <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
              )}
              {t("exportEvidencePack")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status banner (D2: shown for draft/failed/analysing) */}
      <ScanStatusBanner scan={scan} scanId={scanId} />

      {/* D2: Tabs shown for analysing/triage/complete */}
      {showTabs && (
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-4"
        >
          <TabsList className="overflow-x-auto">
            <TabsTrigger value="assessments">
              {t("tabs.assessments")}
            </TabsTrigger>
            <TabsTrigger value="components">
              {t("tabs.components")}
            </TabsTrigger>
            <TabsTrigger value="reports">{t("tabs.reports")}</TabsTrigger>
          </TabsList>

          <TabsContent value="assessments" className="space-y-4">
            {waterfallStages.length > 0 && (
              <VexWaterfall
                startingCves={scan.total_vulnerabilities}
                stages={waterfallStages}
              />
            )}
            <TriageTable cves={cves} onStatusChange={handleStatusChange} />
          </TabsContent>

          <TabsContent value="components">
            <ComponentsTab scanId={scanId} />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab scanId={scanId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
