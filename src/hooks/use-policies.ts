"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/api";
import {
  listPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy,
  importVexPolicy,
} from "@/services/policies";
import type {
  FilterPolicyCreate,
  FilterPolicyUpdate,
  VEXImport,
} from "@/services/policies";
import type { PaginationParams } from "@/lib/api";

export function usePolicies(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.policies.list(),
    queryFn: () => listPolicies(params),
  });
}

export function usePolicy(policyId: string) {
  return useQuery({
    queryKey: queryKeys.policies.detail(policyId),
    queryFn: () => getPolicy(policyId),
    enabled: !!policyId,
  });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FilterPolicyCreate) => createPolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.policies.all });
    },
  });
}

export function useUpdatePolicy(policyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FilterPolicyUpdate) =>
      updatePolicy(policyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.policies.detail(policyId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.policies.all });
    },
  });
}

export function useDeletePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (policyId: string) => deletePolicy(policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.policies.all });
    },
  });
}

export function useImportVexPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VEXImport) => importVexPolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.policies.all });
    },
  });
}
