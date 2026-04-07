"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/api";
import {
  listMembers,
  listInvites,
  createInvite,
  revokeInvite,
  changeRole,
  deactivateMember,
} from "@/services/team";

export function useTeamMembers() {
  return useQuery({
    queryKey: queryKeys.team.members(),
    queryFn: listMembers,
  });
}

export function useTeamInvites() {
  return useQuery({
    queryKey: queryKeys.team.invites(),
    queryFn: listInvites,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) =>
      createInvite(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.invites() });
    },
  });
}

export function useRevokeInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => revokeInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.invites() });
    },
  });
}

export function useChangeRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      changeRole(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.members() });
    },
  });
}

export function useDeactivateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => deactivateMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.members() });
    },
  });
}
