"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/api";
import {
  listReports,
  generateReport,
  downloadReport,
  exportEvidence,
} from "@/services/reports";
import type { PaginationParams } from "@/lib/api";

export function useReports(params?: PaginationParams & { scan_id?: string }) {
  return useQuery({
    queryKey: queryKeys.reports.list(params?.scan_id),
    queryFn: () => listReports(params),
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scanId, format }: { scanId: string; format: string }) =>
      generateReport(scanId, format),
    onSuccess: (_, { scanId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reports.list(scanId),
      });
    },
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: (reportId: string) => downloadReport(reportId),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "report";
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

export function useExportEvidence() {
  return useMutation({
    mutationFn: (scanId: string) => exportEvidence(scanId),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "evidence-pack.zip";
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}
