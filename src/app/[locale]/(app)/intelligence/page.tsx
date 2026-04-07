"use client";

import { Radio, RefreshCw, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSyncStatus, useSyncStats } from "@/hooks/use-intelligence";

const SOURCE_URLS: Record<string, string> = {
  nvd: "https://nvd.nist.gov",
  euvd: "https://www.enisa.europa.eu/topics/vulnerability-disclosure",
  kev: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
};

function statusColor(s: string) {
  if (s === "success") return "text-emerald-600";
  if (s === "error") return "text-red-600";
  if (s === "running") return "text-amber-600";
  return "text-muted-foreground";
}

function timeAgo(iso: string | null) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function IntelligencePage() {
  const { data: sources, isLoading: sourcesLoading } = useSyncStatus();
  const { data: stats, isLoading: statsLoading } = useSyncStats();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold font-serif">Intelligence</h1>
      </div>

      {/* Feed status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {sourcesLoading ? (
          <div className="col-span-3 flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          sources?.map((s) => (
            <div key={s.source} className="bg-card border rounded-md p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium uppercase">{s.source}</span>
                <span className={`flex items-center gap-1.5 text-[10px] ${statusColor(s.last_sync_status)}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    s.last_sync_status === "success" ? "bg-emerald-500"
                      : s.last_sync_status === "error" ? "bg-red-500"
                      : s.last_sync_status === "running" ? "bg-amber-500"
                      : "bg-gray-400"
                  }`} />
                  {s.last_sync_status === "success" ? "Synced" : s.last_sync_status}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>{s.last_sync_count.toLocaleString()} records</span>
                <span>Updated {timeAgo(s.last_sync_at)}</span>
              </div>
              {SOURCE_URLS[s.source] && (
                <a
                  href={SOURCE_URLS[s.source]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-2.5 w-2.5" /> Source
                </a>
              )}
            </div>
          ))
        )}
      </div>

      {/* Global stats */}
      {!statsLoading && stats && (
        <div className="bg-card border rounded-md p-3">
          <h2 className="text-sm font-medium mb-2">CVE Database</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <div className="text-2xl font-semibold tabular-nums">{stats.total.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total CVEs</div>
            </div>
            <div>
              <div className="text-2xl font-semibold tabular-nums text-red-600">{stats.exploited.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Exploited (KEV)</div>
            </div>
            <div>
              <div className="text-2xl font-semibold tabular-nums">{stats.with_cvss.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">With CVSS</div>
            </div>
            <div>
              <div className="text-2xl font-semibold tabular-nums">{stats.with_cpe.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">With CPE</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
