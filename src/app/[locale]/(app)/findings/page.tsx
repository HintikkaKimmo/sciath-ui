"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Download, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/utils";
import { toast } from "sonner";
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
import { statusStyle, getCvssColor, getSeverityBar } from "@/lib/severity";

export default function FindingsPage() {
  const t = useTranslations("findings");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [exporting, setExporting] = useState(false);
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

  const totalCount = data?.total ?? filtered.length;
  const showLimitWarning = totalCount > filtered.length;

  function exportToCsv() {
    // D7: Confirmation when total exceeds loaded
    if (showLimitWarning) {
      const confirmed = window.confirm(
        t("exportCsvLimitWarning", { loaded: filtered.length })
      );
      if (!confirmed) return;
    }

    setExporting(true);
    try {
      const headers = ["CVE ID", "CVSS", "Component", "Status", "Filter Layer"];
      const rows = filtered.map((f) => [
        f.id,
        f.cvss?.toString() ?? "",
        f.pkg,
        f.status,
        f.layer ?? "",
      ]);
      const csv = [headers, ...rows]
        .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob(["\ufeff" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      downloadBlob(
        blob,
        `sciath-findings-${new Date().toISOString().split("T")[0]}.csv`
      );
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  }

  if (isLoading) return <TableSkeleton rows={8} cols={5} />;
  if (error)
    return (
      <ErrorState message={t("failedToLoad")} onRetry={() => refetch()} />
    );

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-serif">{t("title")}</h1>
          <p className="text-xs text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={exportToCsv}
          disabled={exporting || filtered.length === 0}
          title={filtered.length === 0 ? t("noFindingsToExport") : undefined}
        >
          {exporting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Download className="h-3 w-3" />
          )}
          {showLimitWarning
            ? t("exportCsvCount", {
                loaded: filtered.length,
                total: totalCount,
              })
            : t("exportCsv")}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="h-7 pl-8 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-[110px] h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatus")}</SelectItem>
            <SelectItem value="affected">{t("status.affected")}</SelectItem>
            <SelectItem value="not_affected">{t("status.not_affected")}</SelectItem>
            <SelectItem value="under_investigation">{t("status.under_investigation")}</SelectItem>
            <SelectItem value="fixed">{t("status.fixed")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={t("noFindings")}
          message={t("noFindingsMessage")}
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
                      {t(`status.${f.status}` as "status.affected" | "status.not_affected" | "status.fixed" | "status.under_investigation")}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        {filtered.length !== findings.length
          ? `${filtered.length} / ${findings.length} — `
          : ""}
        {t("count", { count: filtered.length })}
      </div>
    </div>
  );
}
