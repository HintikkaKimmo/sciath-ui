import { apiFetch, buildQuery } from "@/lib/api";
import type { components } from "@/lib/api-types";
import type { PaginationParams } from "@/lib/api";

// Types
export type Assessment = components["schemas"]["AssessmentSchema"];
export type AssessmentListItem =
  components["schemas"]["AssessmentListItemSchema"];
export type AssessmentCreate =
  components["schemas"]["AssessmentCreateSchema"];
export type AssessmentUpdate =
  components["schemas"]["AssessmentUpdateSchema"];
export type PaginatedAssessments =
  components["schemas"]["PaginatedAssessments"];
export type BulkAssessmentRequest =
  components["schemas"]["BulkAssessmentRequest"];
export type BulkAssessmentResponse =
  components["schemas"]["BulkAssessmentResponse"];
export type AuditEntry =
  components["schemas"]["AssessmentAuditEntrySchema"];
export type PaginatedAuditEntries =
  components["schemas"]["PaginatedAuditEntries"];

// Params
export type ListAssessmentsParams = PaginationParams & {
  scan_id?: string;
  status?: string;
  review_status?: string;
  filter_layer?: string;
};

// CRUD
export function listAssessments(params?: ListAssessmentsParams) {
  return apiFetch<PaginatedAssessments>(
    `/assessments/v1/assessments/${buildQuery(params)}`
  );
}

export function getAssessment(assessmentId: string) {
  return apiFetch<Assessment>(
    `/assessments/v1/assessments/${assessmentId}/`
  );
}

export function createAssessment(data: AssessmentCreate) {
  return apiFetch<Assessment>("/assessments/v1/assessments/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAssessment(
  assessmentId: string,
  data: AssessmentUpdate
) {
  return apiFetch<Assessment>(
    `/assessments/v1/assessments/${assessmentId}/`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function deleteAssessment(assessmentId: string) {
  return apiFetch<void>(
    `/assessments/v1/assessments/${assessmentId}/`,
    { method: "DELETE" }
  );
}

// Bulk operations
export function bulkUpdateAssessments(data: BulkAssessmentRequest) {
  return apiFetch<BulkAssessmentResponse>(
    "/assessments/v1/assessments/bulk/",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

// Audit trail
export function listAuditEntries(params?: PaginationParams & {
  assessment_id?: string;
}) {
  return apiFetch<PaginatedAuditEntries>(
    `/assessments/v1/audit-entries/${buildQuery(params)}`
  );
}

export function getAuditEntry(entryId: string) {
  return apiFetch<AuditEntry>(
    `/assessments/v1/audit-entries/${entryId}/`
  );
}
