"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/use-projects";
import { useScans, useCraReadiness } from "@/hooks/use-scans";
import { DetailSkeleton } from "@/components/ui/data-skeleton";
import { ErrorState } from "@/components/ui/error-state";

function getBarColor(v: number) {
  if (v >= 80) return "bg-emerald-500";
  if (v >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function getTextColor(v: number) {
  if (v >= 80) return "text-emerald-600";
  if (v >= 50) return "text-amber-600";
  return "text-red-600";
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
    refetch: refetchProject,
  } = useProject(id);
  const { data: scansData, isLoading: scansLoading } = useScans({
    project_id: id,
  });

  const scans = scansData?.items ?? [];
  const latestScan = scans[0];

  // CRA readiness from latest scan
  const { data: cra } = useCraReadiness(latestScan?.id ?? "");

  if (projectLoading) return <DetailSkeleton />;
  if (projectError)
    return (
      <ErrorState
        message="Failed to load product"
        onRetry={() => refetchProject()}
      />
    );
  if (!project) return null;

  return (
    <div className="p-4 space-y-4">
      {/* Breadcrumb */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Products
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">{project.name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {project.description}
            {project.build_system && ` · ${project.build_system}`}
            {project.architecture && ` · ${project.architecture}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
          >
            <Download className="h-3 w-3" />
            Export
          </Button>
          <Button size="sm" className="h-7 text-xs gap-1.5">
            <Play className="h-3 w-3" />
            New Scan
          </Button>
        </div>
      </div>

      {/* Stats row from latest scan */}
      {latestScan && (
        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Components:</span>
            <span className="font-semibold">
              {latestScan.total_components}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Total CVEs:</span>
            <span className="font-semibold">
              {latestScan.total_vulnerabilities}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Remaining:</span>
            <span className="font-semibold text-red-600">
              {latestScan.remaining_count}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Suppressed:</span>
            <span className="font-semibold text-emerald-600">
              {latestScan.suppressed_count}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CRA Readiness */}
        <div className="bg-card border rounded-md p-3">
          <div className="text-sm font-medium mb-3">CRA Readiness</div>
          {cra ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-32 flex-shrink-0">
                  Overall
                </span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getBarColor(cra.percentage)}`}
                    style={{ width: `${cra.percentage}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-medium w-12 text-right ${getTextColor(cra.percentage)}`}
                >
                  {cra.percentage}%
                </span>
              </div>
              {cra.checklist.map((item) => {
                const pct =
                  item.status === "pass"
                    ? 100
                    : item.status === "partial"
                      ? 50
                      : 0;
                return (
                  <div key={item.requirement} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-32 flex-shrink-0 truncate">
                      {item.requirement}
                    </span>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getBarColor(pct)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium w-12 text-right ${getTextColor(pct)}`}
                    >
                      {item.status}
                    </span>
                  </div>
                );
              })}
              {cra.blockers.length > 0 && (
                <div className="mt-2 text-xs text-red-600">
                  {cra.blockers.length} blocker
                  {cra.blockers.length > 1 ? "s" : ""}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {latestScan
                ? "Loading readiness data..."
                : "No scans yet. Run a scan to see CRA readiness."}
            </p>
          )}
        </div>

        {/* Scan History */}
        <div className="col-span-2 bg-card border rounded-md">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-sm font-medium">Scan History</span>
            <span className="text-xs text-muted-foreground">
              {scans.length} scan{scans.length !== 1 ? "s" : ""}
            </span>
          </div>
          {scansLoading ? (
            <div className="p-4 text-xs text-muted-foreground">Loading...</div>
          ) : scans.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground">
              No scans yet
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b bg-secondary/30">
                  <th className="text-left font-medium px-3 py-1.5">Date</th>
                  <th className="text-left font-medium px-3 py-1.5">
                    Version
                  </th>
                  <th className="text-right font-medium px-3 py-1.5">CVEs</th>
                  <th className="text-right font-medium px-3 py-1.5">
                    Remaining
                  </th>
                  <th className="text-right font-medium px-3 py-1.5">
                    Suppressed
                  </th>
                  <th className="w-6"></th>
                </tr>
              </thead>
              <tbody>
                {scans.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b last:border-0 hover:bg-secondary/50 group"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/products/${id}/scans/${s.id}`}
                        className="font-medium group-hover:text-primary"
                      >
                        {new Date(s.created_at).toLocaleDateString()}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {s.version_label || "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {s.total_vulnerabilities}
                    </td>
                    <td className="px-3 py-2 text-right text-red-600 tabular-nums">
                      {s.remaining_count}
                    </td>
                    <td className="px-3 py-2 text-right text-emerald-600 tabular-nums">
                      {s.suppressed_count}
                    </td>
                    <td className="pr-2">
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
