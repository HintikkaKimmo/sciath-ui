import { apiFetch, buildQuery } from "@/lib/api";
import type { components } from "@/lib/api-types";
import type { PaginationParams } from "@/lib/api";

// Types
export type FilterPolicy =
  components["schemas"]["CustomFilterPolicySchema"];
export type FilterPolicyCreate =
  components["schemas"]["CustomFilterPolicyCreateSchema"];
export type FilterPolicyUpdate =
  components["schemas"]["CustomFilterPolicyUpdateSchema"];
export type VEXImport = components["schemas"]["VEXImportSchema"];

// CRUD
export function listPolicies(params?: PaginationParams) {
  return apiFetch<{ items: FilterPolicy[]; total: number }>(
    `/policies/v1/filter-policies/${buildQuery(params)}`
  );
}

export function getPolicy(policyId: string) {
  return apiFetch<FilterPolicy>(
    `/policies/v1/filter-policies/${policyId}/`
  );
}

export function getPolicyHistory(policyId: string) {
  return apiFetch<FilterPolicy[]>(
    `/policies/v1/filter-policies/${policyId}/history/`
  );
}

export function createPolicy(data: FilterPolicyCreate) {
  return apiFetch<FilterPolicy>("/policies/v1/filter-policies/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updatePolicy(policyId: string, data: FilterPolicyUpdate) {
  return apiFetch<FilterPolicy>(
    `/policies/v1/filter-policies/${policyId}/`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function deletePolicy(policyId: string) {
  return apiFetch<void>(`/policies/v1/filter-policies/${policyId}/`, {
    method: "DELETE",
  });
}

export function importVexPolicy(data: VEXImport) {
  return apiFetch<FilterPolicy>(
    "/policies/v1/filter-policies/from-vex/",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}
