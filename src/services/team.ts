import { apiFetch } from "@/lib/api";
import type { components } from "@/lib/api-types";

export type TeamMember = components["schemas"]["TeamMemberOut"];
export type TeamInvite = components["schemas"]["TeamInviteOut"];

export function listMembers() {
  return apiFetch<TeamMember[]>("/core/v1/team/members/");
}

export function listInvites() {
  return apiFetch<TeamInvite[]>("/core/v1/team/invites/");
}

export function createInvite(email: string, role: string) {
  return apiFetch<TeamInvite>("/core/v1/team/invites/", {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}

export function revokeInvite(inviteId: string) {
  return apiFetch("/core/v1/team/invites/" + inviteId + "/", {
    method: "DELETE",
  });
}

export function changeRole(memberId: string, role: string) {
  return apiFetch("/core/v1/team/members/" + memberId + "/role/", {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}

export function deactivateMember(memberId: string) {
  return apiFetch("/core/v1/team/members/" + memberId + "/", {
    method: "DELETE",
  });
}
