"use client";

import { useQuery } from "@tanstack/react-query";
import { compareBuilds } from "@/services/compare";
import { queryKeys } from "@/lib/api";

export function useCompareBuilds(projectId: string, fromScanId?: string, toScanId?: string) {
  return useQuery({
    queryKey: queryKeys.compare.detail(projectId, fromScanId!, toScanId!),
    queryFn: () => compareBuilds(projectId, fromScanId!, toScanId!),
    enabled: !!fromScanId && !!toScanId,
  });
}
