"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api";
import { getSyncStatus, getSyncStats } from "@/services/intelligence";

export function useSyncStatus() {
  return useQuery({
    queryKey: queryKeys.intelligence.syncStatus(),
    queryFn: getSyncStatus,
  });
}

export function useSyncStats() {
  return useQuery({
    queryKey: queryKeys.intelligence.syncStats(),
    queryFn: getSyncStats,
  });
}
