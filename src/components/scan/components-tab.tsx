"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch, buildQuery, queryKeys } from "@/lib/api";
import type { components } from "@/lib/api-types";
import { TableSkeleton } from "@/components/ui/data-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

type PaginatedComponents = components["schemas"]["PaginatedComponents"];

function listComponents(params?: Record<string, string | number | boolean | undefined>) {
  return apiFetch<PaginatedComponents>(
    `/core/v1/components/${buildQuery(params)}`
  );
}

interface ComponentsTabProps {
  scanId: string;
}

export function ComponentsTab({ scanId }: ComponentsTabProps) {
  const t = useTranslations("scan.components");
  const [typeFilter, setTypeFilter] = useState("all");
  const [needsReview, setNeedsReview] = useState(false);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.components.list({
      scan_id: scanId,
      ...(typeFilter !== "all" && { component_type: typeFilter }),
      ...(needsReview && { identity_needs_review: "true" }),
    }),
    queryFn: () =>
      listComponents({
        scan_id: scanId,
        limit: 500,
        ...(typeFilter !== "all" && { component_type: typeFilter }),
        ...(needsReview && { identity_needs_review: true }),
      }),
  });

  const items = data?.items ?? [];

  // Collect unique component types for filter dropdown
  const types = [...new Set(items.map((c) => c.component_type).filter(Boolean))];

  if (isLoading) return <TableSkeleton rows={8} cols={6} />;
  if (error)
    return <ErrorState message={t("failedToLoad")} onRetry={() => refetch()} />;
  if (items.length === 0)
    return (
      <EmptyState title={t("noComponents")} message={t("noComponentsMessage")} />
    );

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
          <SelectTrigger className="w-[140px] h-7 text-xs">
            <SelectValue placeholder={t("filterByType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allTypes")}</SelectItem>
            {types.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={needsReview}
            onChange={(e) => setNeedsReview(e.target.checked)}
            className="rounded"
          />
          {t("needsReview")}
        </label>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground border-b bg-secondary/30">
              <th className="text-left font-medium px-3 py-1.5">{t("name")}</th>
              <th className="text-left font-medium px-3 py-1.5">{t("version")}</th>
              <th className="text-left font-medium px-3 py-1.5">{t("type")}</th>
              <th className="text-left font-medium px-3 py-1.5">{t("cpe")}</th>
              <th className="text-left font-medium px-3 py-1.5">{t("license")}</th>
              <th className="text-center font-medium px-3 py-1.5 w-24">
                {t("identityReview")}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr
                key={c.id}
                className="border-b last:border-0 hover:bg-secondary/50"
              >
                <td className="px-3 py-1.5 font-medium">{c.name}</td>
                <td className="px-3 py-1.5 font-mono text-xs text-muted-foreground tabular-nums">
                  {c.version || "—"}
                </td>
                <td className="px-3 py-1.5 text-muted-foreground">
                  {c.component_type || "—"}
                </td>
                <td className="px-3 py-1.5 font-mono text-[10px] text-muted-foreground max-w-[200px] truncate">
                  {c.cpe || "—"}
                </td>
                <td className="px-3 py-1.5 text-muted-foreground text-xs">
                  {c.license_spdx || "—"}
                </td>
                <td className="px-3 py-1.5 text-center">
                  {c.identity_needs_review && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-amber-200"
                    >
                      <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                      Review
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        {items.length} component{items.length !== 1 ? "s" : ""}
        {data?.total && data.total > items.length
          ? ` of ${data.total}`
          : ""}
      </p>
    </div>
  );
}
