"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useActivity } from "@/hooks/use-activity";
import { activityExportCsvUrl } from "@/services/activity";
import type { ActivityFilterParams } from "@/services/activity";

const PAGE_SIZE = 50;

function formatAction(action: string): string {
  return action
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function TruncatedJson({ data }: { data: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);
  const json = JSON.stringify(data);
  const isEmpty = json === "{}";

  if (isEmpty) {
    return <span className="text-muted-foreground">-</span>;
  }

  const truncated = json.length > 60 ? json.slice(0, 60) + "\u2026" : json;

  return (
    <button
      type="button"
      onClick={() => setExpanded(!expanded)}
      className="text-left font-mono text-xs break-all max-w-xs"
    >
      {expanded ? json : truncated}
    </button>
  );
}

export default function AuditPage() {
  const t = useTranslations("settings.audit");
  const tc = useTranslations("common");

  const [offset, setOffset] = useState(0);
  const [resourceType, setResourceType] = useState("");
  const [action, setAction] = useState("");
  const [userId, setUserId] = useState("");

  const params: ActivityFilterParams = {
    limit: PAGE_SIZE,
    offset,
    ...(resourceType && { resource_type: resourceType }),
    ...(action && { action }),
    ...(userId && { user_id: userId }),
  };

  const { data, isLoading } = useActivity(params);

  const handleExportCsv = () => {
    const csvParams: Omit<ActivityFilterParams, "limit" | "offset"> = {};
    if (resourceType) csvParams.resource_type = resourceType;
    if (action) csvParams.action = action;
    if (userId) csvParams.user_id = userId;
    window.open(activityExportCsvUrl(csvParams), "_blank");
  };

  const handleFilterChange = (
    setter: (val: string) => void,
    value: string
  ) => {
    setter(value);
    setOffset(0);
  };

  return (
    <div className="p-4 space-y-4">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> {tc("settings")}
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-serif">{t("title")}</h1>
          <p className="text-xs text-muted-foreground">{t("description")}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1.5"
          onClick={handleExportCsv}
        >
          <Download className="h-3 w-3" /> {t("exportCsv")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={userId}
          onChange={(e) => handleFilterChange(setUserId, e.target.value)}
          className="px-2 py-1 text-sm border rounded bg-background"
        >
          <option value="">{t("allUsers")}</option>
        </select>
        <select
          value={action}
          onChange={(e) => handleFilterChange(setAction, e.target.value)}
          className="px-2 py-1 text-sm border rounded bg-background"
        >
          <option value="">{t("allActions")}</option>
          <option value="PROJECT_CREATED">Project Created</option>
          <option value="SCAN_CREATED">Scan Created</option>
          <option value="SCAN_ANALYSIS_TRIGGERED">Scan Analysed</option>
          <option value="ASSESSMENT_REVIEWED">Assessment Reviewed</option>
          <option value="ASSESSMENT_APPROVED">Assessment Approved</option>
          <option value="REPORT_GENERATED">Report Generated</option>
          <option value="REPORT_DOWNLOADED">Report Downloaded</option>
          <option value="LOGIN">Login</option>
          <option value="API_KEY_CREATED">API Key Created</option>
          <option value="TEAM_MEMBER_INVITED">Member Invited</option>
        </select>
        <select
          value={resourceType}
          onChange={(e) => handleFilterChange(setResourceType, e.target.value)}
          className="px-2 py-1 text-sm border rounded bg-background"
        >
          <option value="">{t("allResources")}</option>
          <option value="project">project</option>
          <option value="scan">scan</option>
          <option value="assessment">assessment</option>
          <option value="report">report</option>
          <option value="filter_policy">filter_policy</option>
          <option value="api_key">api_key</option>
          <option value="team_member">team_member</option>
          <option value="incident">incident</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-md overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.items?.length ? (
          <EmptyState title={t("noActivity")} />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground bg-secondary/30">
                <th className="text-left font-medium px-3 py-2">
                  {t("timestamp")}
                </th>
                <th className="text-left font-medium px-3 py-2">
                  {t("user")}
                </th>
                <th className="text-left font-medium px-3 py-2">
                  {t("action")}
                </th>
                <th className="text-left font-medium px-3 py-2">
                  {t("resourceType")}
                </th>
                <th className="text-left font-medium px-3 py-2">
                  {t("resourceLabel")}
                </th>
                <th className="text-left font-medium px-3 py-2">
                  {t("details")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b last:border-0 hover:bg-secondary/50"
                >
                  <td
                    className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap"
                    title={item.created_at}
                  >
                    {relativeTime(item.created_at)}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {(item as Record<string, unknown>).user_email as string ?? item.user_id ?? "-"}
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-block rounded bg-secondary px-1.5 py-0.5 text-xs">
                      {formatAction(item.action)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{item.resource_type}</td>
                  <td className="px-3 py-2 text-xs">
                    {item.resource_label || item.resource_id || "-"}
                  </td>
                  <td className="px-3 py-2">
                    <TruncatedJson data={item.details} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {offset + 1}&ndash;{Math.min(offset + PAGE_SIZE, data.total)}{" "}
            / {data.total}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              {t("previous")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={!data.has_more}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
