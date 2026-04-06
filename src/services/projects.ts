import { apiFetch, buildQuery } from "@/lib/api";
import type { components } from "@/lib/api-types";
import type { PaginationParams } from "@/lib/api";

// Types
export type Project = components["schemas"]["ProjectSchema"];
export type ProjectCreate = components["schemas"]["ProjectCreateSchema"];
export type ProjectUpdate = components["schemas"]["ProjectUpdateSchema"];
export type PaginatedProjects = components["schemas"]["PaginatedProjects"];

// Params
export type ListProjectsParams = PaginationParams & {
  customer_id?: string;
  build_system?: string;
  soc_vendor?: string;
};

// API calls
export function listProjects(params?: ListProjectsParams) {
  return apiFetch<PaginatedProjects>(
    `/core/v1/projects/${buildQuery(params)}`
  );
}

export function getProject(projectId: string) {
  return apiFetch<Project>(`/core/v1/projects/${projectId}/`);
}

export function createProject(data: ProjectCreate) {
  return apiFetch<Project>("/core/v1/projects/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProject(projectId: string, data: ProjectUpdate) {
  return apiFetch<Project>(`/core/v1/projects/${projectId}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProject(projectId: string) {
  return apiFetch<void>(`/core/v1/projects/${projectId}/`, {
    method: "DELETE",
  });
}
