"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api";
import {
  getIncidentStats,
  listIncidents,
  getIncident,
  advanceStage,
  withdrawIncident,
  listAlerts,
  markAlertSeen,
  createIncidentFromAlert,
} from "@/services/incidents";
import type {
  ListIncidentsParams,
  ListAlertsParams,
  IncidentStage,
} from "@/services/incidents";

export function useIncidentStats() {
  return useQuery({
    queryKey: queryKeys.incidents.stats(),
    queryFn: getIncidentStats,
    refetchInterval: 60_000, // refresh every minute for deadline tracking
  });
}

export function useIncidents(params?: ListIncidentsParams) {
  return useQuery({
    queryKey: queryKeys.incidents.list(
      params as Record<string, string> | undefined
    ),
    queryFn: () => listIncidents(params),
    refetchInterval: 30_000, // 30s for deadline countdown accuracy
  });
}

export function useIncident(incidentId: string) {
  return useQuery({
    queryKey: queryKeys.incidents.detail(incidentId),
    queryFn: () => getIncident(incidentId),
    enabled: !!incidentId,
  });
}

export function useAdvanceStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      incidentId,
      targetStage,
    }: {
      incidentId: string;
      targetStage: IncidentStage;
    }) => advanceStage(incidentId, targetStage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all });
    },
  });
}

export function useWithdrawIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      incidentId,
      reason,
    }: {
      incidentId: string;
      reason: string;
    }) => withdrawIncident(incidentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all });
    },
  });
}

export function useAlerts(params?: ListAlertsParams) {
  return useQuery({
    queryKey: queryKeys.incidents.alerts(
      params as Record<string, string> | undefined
    ),
    queryFn: () => listAlerts(params),
  });
}

export function useMarkAlertSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => markAlertSeen(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all });
    },
  });
}

export function useCreateIncidentFromAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => createIncidentFromAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all });
    },
  });
}
