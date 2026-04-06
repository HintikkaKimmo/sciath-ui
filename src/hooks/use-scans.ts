"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/api";
import {
  listScans,
  getScan,
  createScan,
  triggerAnalysis,
  getScanStatus,
  getCraReadiness,
} from "@/services/scans";
import type { ListScansParams, ScanCreate } from "@/services/scans";

export function useScans(params?: ListScansParams) {
  return useQuery({
    queryKey: queryKeys.scans.list(params?.project_id),
    queryFn: () => listScans(params),
  });
}

export function useScan(scanId: string) {
  return useQuery({
    queryKey: queryKeys.scans.detail(scanId),
    queryFn: () => getScan(scanId),
    enabled: !!scanId,
  });
}

export function useScanStatus(scanId: string, polling = false) {
  return useQuery({
    queryKey: queryKeys.scans.status(scanId),
    queryFn: () => getScanStatus(scanId),
    enabled: !!scanId,
    // Poll every 3s while analysis is running
    refetchInterval: polling ? 3000 : false,
  });
}

export function useCraReadiness(scanId: string) {
  return useQuery({
    queryKey: queryKeys.scans.craReadiness(scanId),
    queryFn: () => getCraReadiness(scanId),
    enabled: !!scanId,
  });
}

export function useCreateScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ScanCreate) => createScan(data),
    onSuccess: (scan) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.scans.list(scan.project_id),
      });
    },
  });
}

export function useTriggerAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      scanId,
      carryForward = true,
    }: {
      scanId: string;
      carryForward?: boolean;
    }) => triggerAnalysis(scanId, carryForward),
    onSuccess: (_, { scanId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.scans.status(scanId),
      });
    },
  });
}
