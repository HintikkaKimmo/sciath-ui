"use client";

import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReports, useDownloadReport } from "@/hooks/use-reports";
import { TableSkeleton } from "@/components/ui/data-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

export default function ReportsPage() {
  const { data, isLoading, error, refetch } = useReports();
  const downloadReport = useDownloadReport();

  const reports = data?.items ?? [];

  if (isLoading) return <TableSkeleton rows={4} cols={5} />;
  if (error)
    return (
      <ErrorState message="Failed to load reports" onRetry={() => refetch()} />
    );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Reports</h1>
        <Button size="sm" className="h-7 text-xs gap-1.5">
          <FileText className="h-3 w-3" /> Generate Report
        </Button>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="No reports yet"
          message="Generate a report from a scan to see it here."
        />
      ) : (
        <div className="bg-card border rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground bg-secondary/30">
                <th className="text-left font-medium px-3 py-2">Format</th>
                <th className="text-left font-medium px-3 py-2">Status</th>
                <th className="text-right font-medium px-3 py-2">
                  Vulnerabilities
                </th>
                <th className="text-right font-medium px-3 py-2">
                  Suppressed
                </th>
                <th className="text-right font-medium px-3 py-2">Affected</th>
                <th className="text-left font-medium px-3 py-2">Generated</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.id}
                  className="border-b last:border-0 hover:bg-secondary/50"
                >
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="text-[10px]">
                      {r.format.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        r.status === "ready"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : r.status === "failed"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {r.total_vulnerabilities}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-emerald-600">
                    {r.suppressed_count}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-red-600">
                    {r.affected_count}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {r.generated_at
                      ? new Date(r.generated_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {r.status === "ready" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs gap-1"
                        onClick={() => downloadReport.mutate(r.id)}
                        disabled={downloadReport.isPending}
                      >
                        <Download className="h-3 w-3" /> Download
                      </Button>
                    ) : r.status === "generating" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" /> Generating
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
