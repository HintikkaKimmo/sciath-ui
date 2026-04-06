"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/api";
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "@/services/projects";
import type {
  ListProjectsParams,
  ProjectCreate,
  ProjectUpdate,
} from "@/services/projects";

export function useProjects(params?: ListProjectsParams) {
  return useQuery({
    queryKey: queryKeys.projects.list(
      params as Record<string, string> | undefined
    ),
    queryFn: () => listProjects(params),
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectCreate) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectUpdate) => updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.all,
      });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}
