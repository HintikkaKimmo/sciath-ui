"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api";
import { listActivity } from "@/services/activity";
import type { ActivityFilterParams } from "@/services/activity";

export function useActivity(params?: ActivityFilterParams) {
  return useQuery({
    queryKey: queryKeys.activity.list(
      params as Record<string, string> | undefined
    ),
    queryFn: () => listActivity(params),
  });
}
