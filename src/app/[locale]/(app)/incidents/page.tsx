"use client";

import { useState } from "react";
import { ShieldCheck, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useIncidentStats, useIncidents, useAdvanceStage, useWithdrawIncident } from "@/hooks/use-incidents";
import { TableSkeleton } from "@/components/ui/data-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Incident, IncidentStage } from "@/services/incidents";

function formatRemaining(seconds: number): string {
  if (seconds <= 0) return "OVERDUE";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  }
  return `${h}h ${m}m`;
}

function deadlineColor(seconds: number, isOverdue: boolean): string {
  if (isOverdue) return "text-red-500";
  if (seconds < 3600) return "text-red-500 animate-pulse";
  if (seconds < 14400) return "text-amber-500";
  return "text-muted-foreground";
}

function severityColor(severity: string): "default" | "secondary" | "destructive" | "outline" {
  if (severity === "critical") return "destructive";
  if (severity === "high") return "destructive";
  return "secondary";
}

function stageColor(stage: IncidentStage): string {
  switch (stage) {
    case "early_warning_24h": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "detailed_72h": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "final_14d": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "closed": return "bg-muted text-muted-foreground";
    case "withdrawn": return "bg-muted text-muted-foreground";
    case "failed": return "bg-red-500/10 text-red-500 border-red-500/20";
    default: return "bg-muted text-muted-foreground";
  }
}

const NEXT_STAGE: Partial<Record<IncidentStage, IncidentStage>> = {
  early_warning_24h: "detailed_72h",
  detailed_72h: "final_14d",
  final_14d: "closed",
};

export default function IncidentsPage() {
  const t = useTranslations("incidents");
  const tc = useTranslations("common");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [withdrawId, setWithdrawId] = useState<string | null>(null);
  const [withdrawReason, setWithdrawReason] = useState("");

  const { data: stats, isLoading: statsLoading } = useIncidentStats();
  const { data: incidentsData, isLoading, error, refetch } = useIncidents();
  const advanceMutation = useAdvanceStage();
  const withdrawMutation = useWithdrawIncident();

  const incidents = incidentsData?.items ?? [];

  if (isLoading) return <TableSkeleton rows={4} cols={5} />;
  if (error) return <ErrorState message={t("failedToLoad")} onRetry={() => refetch()} />;

  const hasUrgent = stats && (stats.overdue > 0 || stats.approaching_deadline > 0);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold font-serif">{t("title")}</h1>
      </div>

      {/* Urgency band */}
      {hasUrgent && (
        <div className={`border rounded-md px-4 py-3 flex items-center gap-3 ${
          stats.overdue > 0
            ? "border-red-500/30 bg-red-500/5"
            : "border-amber-500/30 bg-amber-500/5"
        }`}>
          <AlertTriangle className={`h-4 w-4 ${stats.overdue > 0 ? "text-red-500" : "text-amber-500"}`} />
          <span className="text-sm">
            {stats.overdue > 0 && (
              <span className="text-red-500 font-medium">{stats.overdue} overdue</span>
            )}
            {stats.overdue > 0 && stats.approaching_deadline > 0 && " · "}
            {stats.approaching_deadline > 0 && (
              <span className="text-amber-500">{stats.approaching_deadline} approaching deadline</span>
            )}
          </span>
        </div>
      )}

      {/* Stat tiles */}
      {stats && !statsLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-card border rounded-md p-3">
            <div className="text-xs text-muted-foreground">{t("active")}</div>
            <div className="text-xl font-semibold mt-0.5">{stats.active}</div>
          </div>
          <div className="bg-card border rounded-md p-3">
            <div className="text-xs text-muted-foreground">{t("approachingDeadline")}</div>
            <div className={`text-xl font-semibold mt-0.5 ${stats.approaching_deadline > 0 ? "text-amber-500" : ""}`}>
              {stats.approaching_deadline}
            </div>
          </div>
          <div className="bg-card border rounded-md p-3">
            <div className="text-xs text-muted-foreground">{t("awaitingApproval")}</div>
            <div className="text-xl font-semibold mt-0.5">{stats.awaiting_approval}</div>
          </div>
          <div className="bg-card border rounded-md p-3">
            <div className="text-xs text-muted-foreground">{t("overdue")}</div>
            <div className={`text-xl font-semibold mt-0.5 ${stats.overdue > 0 ? "text-red-500" : ""}`}>
              {stats.overdue}
            </div>
          </div>
          <div className="bg-card border rounded-md p-3">
            <div className="text-xs text-muted-foreground">{t("closedThisMonth")}</div>
            <div className="text-xl font-semibold mt-0.5">{stats.closed_this_month}</div>
          </div>
        </div>
      )}

      {/* Incident table or empty state */}
      {incidents.length === 0 ? (
        <div className="bg-card border rounded-md py-16 text-center">
          <ShieldCheck className="h-10 w-10 mx-auto text-emerald-500/60 mb-3" />
          <p className="text-sm font-medium">{t("noIncidents")}</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {t("monitoringActive")}
          </p>
        </div>
      ) : (
        <div className="bg-card border rounded-md">
          <div className="px-3 py-2 border-b">
            <span className="text-sm font-medium">{t("active")} ({incidentsData?.total ?? 0})</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="text-left font-medium px-3 py-1.5">CVE</th>
                <th className="text-left font-medium px-3 py-1.5">{t("product")}</th>
                <th className="text-left font-medium px-3 py-1.5">{t("stage")}</th>
                <th className="text-right font-medium px-3 py-1.5">{t("deadline")}</th>
                <th className="w-28"></th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <IncidentRow
                  key={incident.id}
                  incident={incident}
                  t={t}
                  isExpanded={expandedId === incident.id}
                  onToggle={() => setExpandedId(expandedId === incident.id ? null : incident.id)}
                  onAdvance={(targetStage) => {
                    advanceMutation.mutate({ incidentId: incident.id, targetStage });
                  }}
                  isAdvancing={advanceMutation.isPending}
                  onWithdraw={() => setWithdrawId(incident.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Withdraw modal */}
      {withdrawId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="font-semibold mb-2">{t("withdraw")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("confirmWithdraw")}</p>
            <textarea
              className="w-full bg-background border rounded-md p-2 text-sm min-h-[80px] mb-4"
              placeholder={t("withdrawReason")}
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setWithdrawId(null); setWithdrawReason(""); }}
              >
                {tc("cancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={!withdrawReason.trim() || withdrawMutation.isPending}
                onClick={() => {
                  withdrawMutation.mutate(
                    { incidentId: withdrawId, reason: withdrawReason },
                    {
                      onSuccess: () => {
                        setWithdrawId(null);
                        setWithdrawReason("");
                      },
                    }
                  );
                }}
              >
                {t("withdraw")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IncidentRow({
  incident,
  t,
  isExpanded,
  onToggle,
  onAdvance,
  isAdvancing,
  onWithdraw,
}: {
  incident: Incident;
  t: ReturnType<typeof useTranslations>;
  isExpanded: boolean;
  onToggle: () => void;
  onAdvance: (stage: IncidentStage) => void;
  isAdvancing: boolean;
  onWithdraw: () => void;
}) {
  const nextStage = NEXT_STAGE[incident.stage];

  return (
    <>
      <tr
        className="border-b last:border-0 hover:bg-secondary/50 cursor-pointer"
        onClick={onToggle}
      >
        <td className="px-3 py-2 font-mono text-xs font-medium">
          {incident.cve_id}
        </td>
        <td className="px-3 py-2 text-muted-foreground">
          {incident.product_name}
        </td>
        <td className="px-3 py-2">
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${stageColor(incident.stage)}`}>
            {t(`stages.${incident.stage}`)}
          </span>
        </td>
        <td className={`px-3 py-2 text-right font-mono text-xs ${deadlineColor(incident.time_remaining_seconds, incident.is_overdue)}`}>
          {formatRemaining(incident.time_remaining_seconds)}
        </td>
        <td className="px-3 py-2 text-right">
          {nextStage && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs px-2"
              disabled={isAdvancing}
              onClick={(e) => {
                e.stopPropagation();
                onAdvance(nextStage);
              }}
            >
              {t("approve")}
            </Button>
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b bg-secondary/20">
          <td colSpan={5} className="px-4 py-3">
            <div className="space-y-3">
              {/* Stage timeline */}
              <div className="flex items-center gap-2 text-xs">
                {(["early_warning_24h", "detailed_72h", "final_14d"] as const).map((stage, i) => {
                  const isDone =
                    stage === "early_warning_24h"
                      ? incident.stage !== "early_warning_24h"
                      : stage === "detailed_72h"
                        ? ["final_14d", "closed"].includes(incident.stage)
                        : incident.stage === "closed";
                  const isCurrent = incident.stage === stage;

                  return (
                    <div key={stage} className="flex items-center gap-2">
                      {i > 0 && <div className={`h-px w-6 ${isDone || isCurrent ? "bg-emerald-500" : "bg-border"}`} />}
                      <div className="flex items-center gap-1.5">
                        {isDone ? (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        ) : isCurrent ? (
                          <Clock className={`h-3.5 w-3.5 ${incident.is_overdue ? "text-red-500" : "text-amber-500"}`} />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-border" />
                        )}
                        <span className={isCurrent ? "font-medium" : "text-muted-foreground"}>
                          {t(`stages.${stage}`)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
                <div>
                  <span className="text-muted-foreground">Created:</span>{" "}
                  {new Date(incident.created_at).toLocaleString()}
                </div>
                <div>
                  <span className="text-muted-foreground">Deadline:</span>{" "}
                  {new Date(incident.stage_deadline).toLocaleString()}
                </div>
                {incident.approved_by_email && (
                  <div>
                    <span className="text-muted-foreground">Approved by:</span>{" "}
                    {incident.approved_by_email}
                  </div>
                )}
                {incident.filed_at && (
                  <div>
                    <span className="text-muted-foreground">Filed:</span>{" "}
                    {new Date(incident.filed_at).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {nextStage && (
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    disabled={isAdvancing}
                    onClick={() => onAdvance(nextStage)}
                  >
                    {t("approve")} → {t(`stages.${nextStage}`)}
                  </Button>
                )}
                {incident.is_active && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs text-red-500 hover:text-red-400"
                    onClick={onWithdraw}
                  >
                    {t("withdraw")}
                  </Button>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
