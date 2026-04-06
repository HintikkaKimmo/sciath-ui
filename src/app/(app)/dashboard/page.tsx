"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useProjects } from "@/hooks/use-projects";
import { useActivity } from "@/hooks/use-activity";
import { TableSkeleton } from "@/components/ui/data-skeleton";
import { ErrorState } from "@/components/ui/error-state";

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getActionDotColor(action: string) {
  if (action.includes("fail") || action.includes("delete"))
    return "bg-red-500";
  if (action.includes("suppress") || action.includes("complete"))
    return "bg-emerald-500";
  return "bg-blue-500";
}

export default function DashboardPage() {
  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useProjects();
  const { data: activityData, isLoading: activityLoading } = useActivity({
    limit: 10,
  });

  const projects = projectsData?.items ?? [];
  const activities = activityData?.items ?? [];

  if (projectsLoading) return <TableSkeleton rows={4} cols={4} />;
  if (projectsError)
    return (
      <ErrorState
        message="Failed to load dashboard"
        onRetry={() => refetchProjects()}
      />
    );

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-card border rounded-md p-3">
          <div className="text-xs text-muted-foreground">Products</div>
          <div className="text-xl font-semibold mt-0.5">{projects.length}</div>
        </div>
        <div className="bg-card border rounded-md p-3">
          <div className="text-xs text-muted-foreground">Recent Activity</div>
          <div className="text-xl font-semibold mt-0.5">
            {activityData?.total ?? 0}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            total events
          </div>
        </div>
        <div className="bg-card border rounded-md p-3">
          <div className="text-xs text-muted-foreground">
            Build Systems
          </div>
          <div className="text-xl font-semibold mt-0.5">
            {new Set(projects.map((p) => p.build_system).filter(Boolean)).size}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Products table */}
        <div className="col-span-2 bg-card border rounded-md">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-sm font-medium">Products</span>
            <Link
              href="/products"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground">
              No products yet. Add your first product to get started.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left font-medium px-3 py-1.5">Name</th>
                  <th className="text-left font-medium px-3 py-1.5">
                    Build System
                  </th>
                  <th className="text-left font-medium px-3 py-1.5">Arch</th>
                  <th className="text-right font-medium px-3 py-1.5">
                    Created
                  </th>
                  <th className="w-6"></th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 5).map((p) => (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 hover:bg-secondary/50 group"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/products/${p.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground capitalize">
                      {p.build_system || "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground font-mono text-xs">
                      {p.architecture || "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground text-xs">
                      {new Date(p.created_at).toLocaleDateString()}
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

        {/* Activity feed */}
        <div className="bg-card border rounded-md">
          <div className="px-3 py-2 border-b">
            <span className="text-sm font-medium">Recent Activity</span>
          </div>
          {activityLoading ? (
            <div className="p-4 text-xs text-muted-foreground">Loading...</div>
          ) : activities.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground">
              No activity yet
            </div>
          ) : (
            <div className="divide-y">
              {activities.map((a) => (
                <div key={a.id} className="flex items-start gap-2 px-3 py-2">
                  <div
                    className={`w-1.5 h-1.5 mt-1.5 rounded-full flex-shrink-0 ${getActionDotColor(a.action)}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug">
                      {a.resource_label
                        ? `${a.resource_label}: ${a.action}`
                        : a.action}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatTimeAgo(a.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
