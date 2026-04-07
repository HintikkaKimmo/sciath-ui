"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useTeamMembers,
  useTeamInvites,
  useInviteMember,
  useRevokeInvite,
  useChangeRole,
  useDeactivateMember,
} from "@/hooks/use-team";

function roleBadgeClass(role: string) {
  if (role === "admin") return "bg-purple-50 text-purple-700 border-purple-200";
  if (role === "analyst") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-gray-50 text-gray-600 border-gray-200";
}

export default function TeamPage() {
  const { data: members, isLoading: membersLoading } = useTeamMembers();
  const { data: invites, isLoading: invitesLoading } = useTeamInvites();
  const inviteMember = useInviteMember();
  const revokeInvite = useRevokeInvite();
  const changeRole = useChangeRole();
  const deactivateMember = useDeactivateMember();

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("analyst");

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    inviteMember.mutate(
      { email: inviteEmail.trim(), role: inviteRole },
      {
        onSuccess: () => {
          setInviteEmail("");
          setShowInviteForm(false);
        },
      }
    );
  };

  return (
    <div className="p-4 space-y-4">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Settings
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Team Members</h1>
        <Button
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={() => setShowInviteForm(!showInviteForm)}
        >
          <Plus className="h-3 w-3" /> Invite
        </Button>
      </div>

      {showInviteForm && (
        <div className="bg-card border rounded-md p-3 flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Email</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full mt-0.5 px-2 py-1 text-sm border rounded bg-background"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="mt-0.5 px-2 py-1 text-sm border rounded bg-background"
            >
              <option value="admin">Admin</option>
              <option value="analyst">Analyst</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={handleInvite}
            disabled={inviteMember.isPending}
          >
            {inviteMember.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </div>
      )}

      {inviteMember.isError && (
        <p className="text-xs text-red-600">
          {(inviteMember.error as Error).message}
        </p>
      )}

      {/* Members table */}
      <div className="bg-card border rounded-md overflow-x-auto">
        {membersLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground bg-secondary/30">
                <th className="text-left font-medium px-3 py-2">Member</th>
                <th className="text-left font-medium px-3 py-2">Role</th>
                <th className="text-left font-medium px-3 py-2">Status</th>
                <th className="text-left font-medium px-3 py-2">Last login</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {members?.map((m) => (
                <tr
                  key={m.id}
                  className="border-b last:border-0 hover:bg-secondary/50"
                >
                  <td className="px-3 py-2">
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.email}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${roleBadgeClass(m.role)}`}
                    >
                      {m.role}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-1.5 text-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {m.last_login
                      ? new Date(m.last_login).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-3 py-2">
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pending invitations */}
      {!invitesLoading && invites && invites.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-muted-foreground">
            Pending Invitations
          </h2>
          <div className="bg-card border rounded-md">
            <table className="w-full text-sm">
              <tbody>
                {invites.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b last:border-0 hover:bg-secondary/50"
                  >
                    <td className="px-3 py-2 text-muted-foreground">
                      {inv.email}
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${roleBadgeClass(inv.role)}`}
                      >
                        {inv.role}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      Expires{" "}
                      {new Date(inv.expires_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] text-red-600"
                        onClick={() => revokeInvite.mutate(inv.id)}
                        disabled={revokeInvite.isPending}
                      >
                        Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
