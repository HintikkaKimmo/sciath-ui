"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssessments } from "@/hooks/use-assessments";
import { TableSkeleton } from "@/components/ui/data-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

const statusStyle: Record<string, string> = {
  affected: "bg-red-100 text-red-700 border-red-200",
  not_affected: "bg-emerald-100 text-emerald-700 border-emerald-200",
  fixed: "bg-blue-100 text-blue-700 border-blue-200",
  under_investigation: "bg-amber-100 text-amber-700 border-amber-200",
};

const statusLabel: Record<string, string> = {
  affected: "Affected",
  not_affected: "Not Affected",
  fixed: "Fixed",
  under_investigation: "Investigating",
};

function getCvssColor(cvss: number) {
  if (cvss >= 9) return "text-red-600";
  if (cvss >= 7) return "text-orange-600";
  if (cvss >= 4) return "text-amber-600";
  return "text-blue-600";
}

function getSeverityBar(cvss: number) {
  if (cvss >= 9) return "bg-red-500";
  if (cvss >= 7) return "bg-orange-500";
  if (cvss >= 4) return "bg-amber-400";
  return "bg-blue-500";
}

export default function FindingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useAssessments({ limit: 500 });

  const assessments = data?.items ?? [];

  const findings = assessments
    .map((a) => ({
      id: a.vulnerability?.vuln_id ?? a.vulnerability_id,
      pkg: a.vulnerability?.component?.name ?? "unknown",
      cvss: a.vulnerability?.cvss_score ?? 0,
      status: a.status,
      layer: a.filter_layer,
    }))
    .sort((a, b) => b.cvss - a.cvss);

  const filtered = findings.filter((f) => {
    if (
      search &&
      !f.id.toLowerCase().includes(search.toLowerCase()) &&
      !f.pkg.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (statusFilter !== "all" && f.status !== statusFilter) return false;
    return true;
  });

  if (isLoading) return <TableSkeleton rows={8} cols={5} />;
  if (error)
    return (
      <ErrorState message="Failed to load findings" onRetry={() => refetch()} />
    );

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-lg font-semibold">Findings</h1>
      <p className="text-xs text-muted-foreground">
        Cross-product vulnerability findings, sorted by CVSS.
      </p>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search CVEs, packages..."
            className="h-7 pl-8 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[110px] h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="affected">Affected</SelectItem>
            <SelectItem value="not_affected">Not Affected</SelectItem>
            <SelectItem value="under_investigation">Investigating</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No findings"
          message="No vulnerability findings match your filters."
        />
      ) : (
        <div className="bg-card border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b bg-secondary/30">
                <th className="w-1"></th>
                <th className="text-left font-medium px-3 py-1.5">CVE</th>
                <th className="text-left font-medium px-3 py-1.5">Package</th>
                <th className="text-center font-medium px-3 py-1.5 w-16">
                  CVSS
                </th>
                <th className="text-left font-medium px-3 py-1.5">Layer</th>
                <th className="text-left font-medium px-3 py-1.5 w-28">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => (
                <tr
                  key={`${f.id}-${i}`}
                  className="border-b last:border-0 hover:bg-secondary/50"
                >
                  <td className="p-0">
                    <div className={`w-1 h-8 ${getSeverityBar(f.cvss)}`} />
                  </td>
                  <td className="px-3 py-1.5">
                    <code className="text-xs font-mono font-medium text-primary">
                      {f.id}
                    </code>
                  </td>
                  <td className="px-3 py-1.5 text-muted-foreground">
                    {f.pkg}
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    <span
                      className={`font-semibold text-xs tabular-nums ${getCvssColor(f.cvss)}`}
                    >
                      {f.cvss?.toFixed(1) ?? "—"}
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    {f.layer && f.layer !== "none" ? (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {f.layer}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${statusStyle[f.status] ?? ""}`}
                    >
                      {statusLabel[f.status] ?? f.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        {filtered.length}
        {filtered.length !== findings.length
          ? ` of ${findings.length}`
          : ""}{" "}
        findings
      </div>
    </div>
  );
}
