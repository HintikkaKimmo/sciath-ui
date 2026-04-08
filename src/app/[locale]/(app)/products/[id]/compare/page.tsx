"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, AlertTriangle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/use-projects";
import { useScans } from "@/hooks/use-scans";
import { useCompareBuilds } from "@/hooks/use-compare";
import { DetailSkeleton } from "@/components/ui/data-skeleton";
import { EmptyState } from "@/components/ui/empty-state";

function statusBadgeClass(status: string) {
  switch (status) {
    case "affected":
      return "bg-red-100 text-red-700 border-red-200";
    case "not_affected":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "fixed":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "under_investigation":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-secondary text-secondary-foreground border-border";
  }
}

function cvssColor(score: number | null) {
  if (score === null) return "text-muted-foreground";
  if (score >= 9) return "text-red-600";
  if (score >= 7) return "text-orange-600";
  if (score >= 4) return "text-amber-600";
  return "text-blue-600";
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ComparePage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations("compare");

  const { data: project } = useProject(id);
  const { data: scansData, isLoading: scansLoading } = useScans({
    project_id: id,
  });

  const [fromScanId, setFromScanId] = useState<string>("");
  const [toScanId, setToScanId] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const {
    data: comparison,
    isLoading: compareLoading,
    error: compareError,
  } = useCompareBuilds(
    id,
    submitted ? fromScanId : undefined,
    submitted ? toScanId : undefined
  );

  const scans = scansData?.items ?? [];

  const handleCompare = () => {
    if (fromScanId && toScanId) {
      setSubmitted(true);
    }
  };

  const hasDifferences =
    comparison &&
    (comparison.new_cves.length > 0 ||
      comparison.resolved_cves.length > 0 ||
      comparison.status_changed.length > 0 ||
      comparison.added_components.length > 0 ||
      comparison.removed_components.length > 0 ||
      comparison.upgraded_components.length > 0);

  return (
    <div className="p-4 space-y-4">
      {/* Breadcrumb */}
      <Link
        href={`/products/${id}`}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        {project?.name ?? "Product"}
      </Link>

      {/* Title */}
      <h1 className="text-2xl font-semibold font-serif">{t("title")}</h1>

      {/* Scan selectors */}
      <div className="bg-card border rounded-md p-4">
        <p className="text-sm text-muted-foreground mb-3">
          {t("selectScans")}
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">{t("fromBuild")}</label>
            <select
              className="block w-56 rounded-md border bg-background px-2.5 py-1.5 text-sm"
              value={fromScanId}
              onChange={(e) => {
                setFromScanId(e.target.value);
                setSubmitted(false);
              }}
              disabled={scansLoading}
            >
              <option value="">--</option>
              {scans.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.version_label || "Scan"} —{" "}
                  {new Date(s.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">{t("toBuild")}</label>
            <select
              className="block w-56 rounded-md border bg-background px-2.5 py-1.5 text-sm"
              value={toScanId}
              onChange={(e) => {
                setToScanId(e.target.value);
                setSubmitted(false);
              }}
              disabled={scansLoading}
            >
              <option value="">--</option>
              {scans.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.version_label || "Scan"} —{" "}
                  {new Date(s.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={handleCompare}
            disabled={!fromScanId || !toScanId || fromScanId === toScanId}
          >
            {t("compare")}
          </Button>
        </div>
      </div>

      {/* Loading */}
      {compareLoading && <DetailSkeleton />}

      {/* Error */}
      {compareError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          {compareError.message}
        </div>
      )}

      {/* Results */}
      {comparison && (
        <div className="space-y-4">
          {/* Format mismatch warning */}
          {comparison.format_mismatch && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {t("formatMismatch")}
            </div>
          )}

          {/* Carry-forward badge */}
          {comparison.carried_count > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
              <Package className="h-3 w-3" />
              {t("carriedForward")}: {comparison.carried_count}
            </div>
          )}

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card border rounded-md p-3 text-center">
              <div className="text-2xl font-semibold tabular-nums text-red-600">
                {comparison.new_cves.length}
              </div>
              <div className="text-xs text-muted-foreground">{t("newCves")}</div>
            </div>
            <div className="bg-card border rounded-md p-3 text-center">
              <div className="text-2xl font-semibold tabular-nums text-emerald-600">
                {comparison.resolved_cves.length}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("resolvedCves")}
              </div>
            </div>
            <div className="bg-card border rounded-md p-3 text-center">
              <div className="text-2xl font-semibold tabular-nums text-amber-600">
                {comparison.status_changed.length}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("statusChanged")}
              </div>
            </div>
            <div className="bg-card border rounded-md p-3 text-center">
              <div className="text-2xl font-semibold tabular-nums">
                {comparison.unchanged_count}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("unchanged")}
              </div>
            </div>
          </div>

          {/* No differences */}
          {!hasDifferences && (
            <EmptyState
              title={t("noDifferences")}
              message=""
            />
          )}

          {/* New CVEs */}
          {comparison.new_cves.length > 0 && (
            <details open>
              <summary className="cursor-pointer text-sm font-medium py-1">
                {t("newCves")} ({comparison.new_cves.length})
              </summary>
              <div className="bg-card border rounded-md overflow-x-auto mt-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b bg-secondary/30">
                      <th className="text-left font-medium px-3 py-1.5">
                        {t("cveId")}
                      </th>
                      <th className="text-right font-medium px-3 py-1.5">
                        {t("cvss")}
                      </th>
                      <th className="text-left font-medium px-3 py-1.5">
                        {t("component")}
                      </th>
                      <th className="text-left font-medium px-3 py-1.5">
                        {t("status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.new_cves.map((cve) => (
                      <tr
                        key={cve.cve_id}
                        className="border-b last:border-0"
                      >
                        <td className="px-3 py-2">
                          <code className="text-xs font-mono font-medium text-primary">
                            {cve.cve_id}
                          </code>
                        </td>
                        <td
                          className={`px-3 py-2 text-right tabular-nums ${cvssColor(cve.cvss_score)}`}
                        >
                          {cve.cvss_score?.toFixed(1) ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {cve.component_name}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(cve.status)}`}
                          >
                            {formatStatus(cve.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}

          {/* Resolved CVEs */}
          {comparison.resolved_cves.length > 0 && (
            <details open>
              <summary className="cursor-pointer text-sm font-medium py-1">
                {t("resolvedCves")} ({comparison.resolved_cves.length})
              </summary>
              <div className="bg-card border rounded-md overflow-x-auto mt-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b bg-secondary/30">
                      <th className="text-left font-medium px-3 py-1.5">
                        {t("cveId")}
                      </th>
                      <th className="text-right font-medium px-3 py-1.5">
                        {t("cvss")}
                      </th>
                      <th className="text-left font-medium px-3 py-1.5">
                        {t("component")}
                      </th>
                      <th className="text-left font-medium px-3 py-1.5">
                        {t("status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.resolved_cves.map((cve) => (
                      <tr
                        key={cve.cve_id}
                        className="border-b last:border-0"
                      >
                        <td className="px-3 py-2">
                          <code className="text-xs font-mono font-medium text-primary">
                            {cve.cve_id}
                          </code>
                        </td>
                        <td
                          className={`px-3 py-2 text-right tabular-nums ${cvssColor(cve.cvss_score)}`}
                        >
                          {cve.cvss_score?.toFixed(1) ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {cve.component_name}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(cve.status)}`}
                          >
                            {formatStatus(cve.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}

          {/* Status Changed */}
          {comparison.status_changed.length > 0 && (
            <details open>
              <summary className="cursor-pointer text-sm font-medium py-1">
                {t("statusChanged")} ({comparison.status_changed.length})
              </summary>
              <div className="bg-card border rounded-md overflow-x-auto mt-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b bg-secondary/30">
                      <th className="text-left font-medium px-3 py-1.5">
                        {t("cveId")}
                      </th>
                      <th className="text-left font-medium px-3 py-1.5">
                        {t("fromStatus")}
                      </th>
                      <th className="text-left font-medium px-3 py-1.5"></th>
                      <th className="text-left font-medium px-3 py-1.5">
                        {t("toStatus")}
                      </th>
                      <th className="text-right font-medium px-3 py-1.5">
                        {t("cvss")}
                      </th>
                      <th className="text-left font-medium px-3 py-1.5">
                        {t("component")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.status_changed.map((cve) => (
                      <tr
                        key={cve.cve_id}
                        className="border-b last:border-0"
                      >
                        <td className="px-3 py-2">
                          <code className="text-xs font-mono font-medium text-primary">
                            {cve.cve_id}
                          </code>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(cve.from_status)}`}
                          >
                            {formatStatus(cve.from_status)}
                          </span>
                        </td>
                        <td className="px-1 py-2">
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(cve.to_status)}`}
                          >
                            {formatStatus(cve.to_status)}
                          </span>
                        </td>
                        <td
                          className={`px-3 py-2 text-right tabular-nums ${cvssColor(cve.cvss_score)}`}
                        >
                          {cve.cvss_score?.toFixed(1) ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {cve.component_name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}

          {/* Added Components */}
          {comparison.added_components.length > 0 && (
            <details open>
              <summary className="cursor-pointer text-sm font-medium py-1">
                {t("addedComponents")} ({comparison.added_components.length})
              </summary>
              <div className="bg-card border rounded-md overflow-x-auto mt-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b bg-secondary/30">
                      <th className="text-left font-medium px-3 py-1.5">
                        {t("name")}
                      </th>
                      <th className="text-left font-medium px-3 py-1.5">
                        {t("version")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.added_components.map((comp) => (
                      <tr
                        key={`${comp.name}-${comp.version}`}
                        className="border-b last:border-0"
                      >
                        <td className="px-3 py-2 font-medium">{comp.name}</td>
                        <td className="px-3 py-2 text-muted-foreground font-mono text-xs">
                          {comp.version}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}

          {/* Removed Components */}
          {comparison.removed_components.length > 0 && (
            <details open>
              <summary className="cursor-pointer text-sm font-medium py-1">
                {t("removedComponents")} ({comparison.removed_components.length})
              </summary>
              <div className="bg-card border rounded-md overflow-x-auto mt-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b bg-secondary/30">
                      <th className="text-left font-medium px-3 py-1.5">
                        {t("name")}
                      </th>
                      <th className="text-left font-medium px-3 py-1.5">
                        {t("version")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.removed_components.map((comp) => (
                      <tr
                        key={`${comp.name}-${comp.version}`}
                        className="border-b last:border-0"
                      >
                        <td className="px-3 py-2 font-medium">{comp.name}</td>
                        <td className="px-3 py-2 text-muted-foreground font-mono text-xs">
                          {comp.version}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}

          {/* Upgraded Components */}
          {comparison.upgraded_components.length > 0 && (
            <details open>
              <summary className="cursor-pointer text-sm font-medium py-1">
                {t("upgradedComponents")} (
                {comparison.upgraded_components.length})
              </summary>
              <div className="bg-card border rounded-md overflow-x-auto mt-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b bg-secondary/30">
                      <th className="text-left font-medium px-3 py-1.5">
                        {t("name")}
                      </th>
                      <th className="text-left font-medium px-3 py-1.5">
                        {t("fromVersion")}
                      </th>
                      <th className="text-left font-medium px-3 py-1.5"></th>
                      <th className="text-left font-medium px-3 py-1.5">
                        {t("toVersion")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.upgraded_components.map((comp) => (
                      <tr
                        key={comp.name}
                        className="border-b last:border-0"
                      >
                        <td className="px-3 py-2 font-medium">{comp.name}</td>
                        <td className="px-3 py-2 text-muted-foreground font-mono text-xs">
                          {comp.from_version}
                        </td>
                        <td className="px-1 py-2">
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {comp.to_version}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
