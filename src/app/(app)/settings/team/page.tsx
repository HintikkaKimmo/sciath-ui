import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Plus, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = { title: "Team | Sciath" }

const members = [
  { name: "Dev User", email: "dev@sciath.io", role: "Admin", status: "Active", joined: "Jan 2026" },
  { name: "Jane Doe", email: "jane@company.com", role: "Analyst", status: "Active", joined: "Feb 2026" },
  { name: "Bob Smith", email: "bob@company.com", role: "Viewer", status: "Active", joined: "Mar 2026" },
]

const pending = [
  { email: "alice@company.com", role: "Analyst", invited: "2 days ago" },
]

export default function TeamPage() {
  return (
    <div className="p-4 space-y-4">
      <Link href="/settings" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Settings
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Team Members</h1>
        <Button size="sm" className="h-7 text-xs gap-1.5">
          <Plus className="h-3 w-3" /> Invite
        </Button>
      </div>

      <div className="bg-card border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground bg-secondary/30">
              <th className="text-left font-medium px-3 py-2">Member</th>
              <th className="text-left font-medium px-3 py-2">Role</th>
              <th className="text-left font-medium px-3 py-2">Status</th>
              <th className="text-left font-medium px-3 py-2">Joined</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.email} className="border-b last:border-0 hover:bg-secondary/50">
                <td className="px-3 py-2">
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.email}</div>
                </td>
                <td className="px-3 py-2">
                  <Badge variant="outline" className="text-[10px]">{m.role}</Badge>
                </td>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {m.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{m.joined}</td>
                <td className="px-3 py-2">
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pending.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-muted-foreground">Pending Invitations</h2>
          <div className="bg-card border rounded-md">
            <table className="w-full text-sm">
              <tbody>
                {pending.map((p) => (
                  <tr key={p.email} className="border-b last:border-0 hover:bg-secondary/50">
                    <td className="px-3 py-2 text-muted-foreground">{p.email}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{p.role}</Badge></td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">Invited {p.invited}</td>
                    <td className="px-3 py-2 text-right">
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-red-600">Revoke</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
