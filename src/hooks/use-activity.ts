"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api";
import { listActivity } from "@/services/activity";
import type { PaginationParams } from "@/lib/api";

export function useActivity(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.activity.list(
      params as Record<string, string> | undefined
    ),
    queryFn: () => listActivity(params),
  });
}
