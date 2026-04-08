"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Download,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  listReports,
  generateReport,
  downloadReport,
} from "@/services/reports";
import { queryKeys } from "@/lib/api";
import { TableSkeleton } from "@/components/ui/data-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { downloadBlob } from "@/lib/utils";
import { reportStatusStyle } from "@/lib/severity";
import { toast } from "sonner";

const REPORT_FORMATS = [
  { value: "article13", label: "Article 13 (PDF)" },
  { value: "vex_cdx", label: "VEX (CycloneDX)" },
  { value: "vex_csaf", label: "VEX (CSAF)" },
  { value: "sbom_cdx", label: "SBOM (CycloneDX)" },
  { value: "sbom_spdx", label: "SBOM (SPDX)" },
  { value: "sarif", label: "SARIF" },
] as const;

const POLLING_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

interface ReportsTabProps {
  scanId: string;
}

export function ReportsTab({ scanId }: ReportsTabProps) {
  const t = useTranslations("scan.reports");
  const queryClient = useQueryClient();
  const [pollingTimedOut, setPollingTimedOut] = useState(false);
  const pollingStartRef = useRef<number | null>(null);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.reports.list(scanId),
    queryFn: () => listReports({ scan_id: scanId }),
  });

  const reports = data?.items ?? [];
  const hasGenerating = reports.some((r) => r.status === "generating");

  // E7: Polling with timeout
  useEffect(() => {
    if (!hasGenerating) {
      pollingStartRef.current = null;
      return;
    }
    if (pollingTimedOut) return;

    if (!pollingStartRef.current) {
      pollingStartRef.current = Date.now();
    }
    const startTime = pollingStartRef.current;
    const interval = setInterval(() => {
      if (Date.now() - startTime > POLLING_TIMEOUT_MS) {
        setPollingTimedOut(true);
        return;
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.reports.list(scanId),
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [hasGenerating, pollingTimedOut, scanId, queryClient]);

  // D8: Track which formats are currently generating
  const generatingFormats = new Set(
    reports
      .filter((r) => r.status === "generating")
      .map((r) => r.format)
  );

  const generate = useMutation({
    mutationFn: (format: string) => generateReport(scanId, format),
    onSuccess: () => {
      pollingStartRef.current = Date.now();
      setPollingTimedOut(false);
      queryClient.invalidateQueries({
        queryKey: queryKeys.reports.list(scanId),
      });
    },
  });

  async function handleDownload(reportId: string, filename: string) {
    try {
      const blob = await downloadReport(reportId);
      downloadBlob(blob, filename);
    } catch {
      toast.error(t("downloadFailed"));
    }
  }

  if (isLoading) return <TableSkeleton rows={4} cols={4} />;
  if (error)
    return <ErrorState message={t("failedToLoad")} onRetry={() => refetch()} />;

  if (reports.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          title={t("noReports")}
          message={t("noReportsMessage")}
        />
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium shadow-xs hover:bg-primary/90"
            >
              {t("generateReport")}
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {REPORT_FORMATS.map((f) => (
                <DropdownMenuItem
                  key={f.value}
                  onClick={() => generate.mutate(f.value)}
                  disabled={generate.isPending}
                >
                  {f.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Generate button */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 h-7 text-xs font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
          >
            {t("generateReport")}
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {REPORT_FORMATS.map((f) => (
              <DropdownMenuItem
                key={f.value}
                onClick={() => generate.mutate(f.value)}
                disabled={
                  generate.isPending || generatingFormats.has(f.value)
                }
              >
                {generatingFormats.has(f.value) && (
                  <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                )}
                {f.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* E7: Polling timeout warning */}
      {pollingTimedOut && (
        <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {t("pollingTimeout")}
        </div>
      )}

      {/* Reports table */}
      <div className="bg-card border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground border-b bg-secondary/30">
              <th className="text-left font-medium px-3 py-1.5">
                {t("format")}
              </th>
              <th className="text-left font-medium px-3 py-1.5">
                {t("status")}
              </th>
              <th className="text-left font-medium px-3 py-1.5">
                {t("generatedAt")}
              </th>
              <th className="text-right font-medium px-3 py-1.5 w-24">
                {t("download")}
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr
                key={r.id}
                className="border-b last:border-0 hover:bg-secondary/50"
              >
                <td className="px-3 py-1.5">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {r.format}
                  </Badge>
                </td>
                <td className="px-3 py-1.5">
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${reportStatusStyle[r.status] ?? ""}`}
                  >
                    {r.status === "generating" && (
                      <Loader2 className="h-2.5 w-2.5 animate-spin mr-0.5" />
                    )}
                    {r.status === "ready" && (
                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                    )}
                    {r.status === "failed" && (
                      <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                    )}
                    {t(r.status as "generating" | "ready" | "failed")}
                  </Badge>
                </td>
                <td className="px-3 py-1.5 text-xs text-muted-foreground tabular-nums">
                  {r.generated_at
                    ? new Date(r.generated_at).toLocaleString()
                    : "—"}
                </td>
                <td className="px-3 py-1.5 text-right">
                  {r.status === "ready" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs gap-1"
                      onClick={() =>
                        handleDownload(
                          r.id,
                          `sciath-report-${r.format}.${r.format.includes("pdf") ? "pdf" : "json"}`
                        )
                      }
                    >
                      <Download className="h-3 w-3" />
                      {t("download")}
                    </Button>
                  )}
                  {r.status === "failed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs gap-1 text-red-600"
                      onClick={() => generate.mutate(r.format)}
                      disabled={generate.isPending}
                    >
                      <RotateCcw className="h-3 w-3" />
                      {t("retry")}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
