"use client";

import { useAuditEntries } from "@/hooks/use-assessments";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTranslations } from "next-intl";

const statusStyles: Record<string, string> = {
  affected: "bg-red-100 text-red-700 border-red-200",
  not_affected: "bg-emerald-100 text-emerald-700 border-emerald-200",
  fixed: "bg-blue-100 text-blue-700 border-blue-200",
  under_investigation: "bg-amber-100 text-amber-700 border-amber-200",
};

const statusLabels: Record<string, string> = {
  affected: "Affected",
  not_affected: "Not Affected",
  fixed: "Fixed",
  under_investigation: "Investigating",
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0 ${statusStyles[status] ?? ""}`}
    >
      {statusLabels[status] ?? status}
    </Badge>
  );
}

interface AssessmentAuditModalProps {
  assessmentId: string;
  cveId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssessmentAuditModal({
  assessmentId,
  cveId,
  open,
  onOpenChange,
}: AssessmentAuditModalProps) {
  const t = useTranslations("scan.audit");
  const { data, isLoading } = useAuditEntries(
    open && assessmentId ? { assessment_id: assessmentId } : undefined
  );

  const entries = data?.items ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>
            {t("title")} — <code className="font-mono text-sm">{cveId}</code>
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-4 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-12">
              {t("noEntries")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b">
                    <th className="text-left font-medium px-2 py-1.5">
                      {t("timestamp")}
                    </th>
                    <th className="text-left font-medium px-2 py-1.5">
                      {t("actor")}
                    </th>
                    <th className="text-left font-medium px-2 py-1.5">
                      {t("action")}
                    </th>
                    <th className="text-left font-medium px-2 py-1.5">
                      {t("statusChange")}
                    </th>
                    <th className="text-left font-medium px-2 py-1.5">
                      {t("notes")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-0">
                      <td
                        className="px-2 py-1.5 whitespace-nowrap"
                        title={entry.created_at}
                      >
                        {formatRelativeTime(entry.created_at)}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        {entry.actor || "—"}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <span className="capitalize">
                          {entry.action === "create"
                            ? t("created")
                            : entry.action === "update"
                              ? t("updated")
                              : entry.action}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        {entry.old_status && entry.new_status ? (
                          <span className="inline-flex items-center gap-1">
                            <StatusBadge status={entry.old_status} />
                            <span className="text-muted-foreground">→</span>
                            <StatusBadge status={entry.new_status} />
                          </span>
                        ) : entry.new_status ? (
                          <StatusBadge status={entry.new_status} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 max-w-[150px] truncate">
                        {entry.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
