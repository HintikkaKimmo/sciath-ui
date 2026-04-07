"use client";

import { Plus, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { usePolicies } from "@/hooks/use-policies";
import { TableSkeleton } from "@/components/ui/data-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

export default function FiltersSettingsPage() {
  const { data, isLoading, error, refetch } = usePolicies();
  const t = useTranslations("settings.filters");

  const policies = data?.items ?? [];

  if (isLoading) return <TableSkeleton rows={3} cols={4} />;
  if (error)
    return (
      <ErrorState
        message={t("failedToLoad")}
        onRetry={() => refetch()}
      />
    );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold font-serif">{t("title")}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
            <Upload className="h-3 w-3" /> {t("importVex")}
          </Button>
          <Button size="sm" className="h-7 text-xs gap-1.5">
            <Plus className="h-3 w-3" /> {t("newPolicy")}
          </Button>
        </div>
      </div>

      {policies.length === 0 ? (
        <EmptyState
          title={t("noFilters")}
          message={t("noFiltersMessage")}
        />
      ) : (
        <div className="bg-card border rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground bg-secondary/30">
                <th className="text-left font-medium px-3 py-2">{t("name")}</th>
                <th className="text-left font-medium px-3 py-2">
                  {t("descriptionColumn")}
                </th>
                <th className="text-right font-medium px-3 py-2">{t("rules")}</th>
                <th className="text-right font-medium px-3 py-2">{t("version")}</th>
                <th className="text-right font-medium px-3 py-2">{t("updated")}</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr
                  key={p.id}
                  className="border-b last:border-0 hover:bg-secondary/50"
                >
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs truncate max-w-[300px]">
                    {p.description || "—"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {p.rule_count}
                  </td>
                  <td className="px-3 py-2 text-right text-xs text-muted-foreground tabular-nums">
                    v{p.version}
                  </td>
                  <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                    {new Date(p.updated_at).toLocaleDateString()}
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
