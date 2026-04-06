"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/api";
import {
  listAssessments,
  getAssessment,
  updateAssessment,
  bulkUpdateAssessments,
  listAuditEntries,
} from "@/services/assessments";
import type {
  ListAssessmentsParams,
  AssessmentUpdate,
  BulkAssessmentRequest,
} from "@/services/assessments";
import type { PaginationParams } from "@/lib/api";

export function useAssessments(params?: ListAssessmentsParams) {
  return useQuery({
    queryKey: queryKeys.assessments.list(
      params as Record<string, string> | undefined
    ),
    queryFn: () => listAssessments(params),
  });
}

export function useAssessment(assessmentId: string) {
  return useQuery({
    queryKey: queryKeys.assessments.detail(assessmentId),
    queryFn: () => getAssessment(assessmentId),
    enabled: !!assessmentId,
  });
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assessmentId,
      data,
    }: {
      assessmentId: string;
      data: AssessmentUpdate;
    }) => updateAssessment(assessmentId, data),
    onSuccess: (_, { assessmentId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.assessments.detail(assessmentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.assessments.all,
      });
    },
  });
}

export function useBulkUpdateAssessments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkAssessmentRequest) =>
      bulkUpdateAssessments(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.assessments.all,
      });
    },
  });
}

export function useAuditEntries(
  params?: PaginationParams & { assessment_id?: string }
) {
  return useQuery({
    queryKey: ["audit-entries", params],
    queryFn: () => listAuditEntries(params),
  });
}
