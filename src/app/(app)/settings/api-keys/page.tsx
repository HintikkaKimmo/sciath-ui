import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Plus, Copy, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "API Keys | Sciath" }

const keys = [
  { id: "1", name: "CI Pipeline", prefix: "sk-...7f2a", created: "15 Mar 2026", lastUsed: "2h ago", scopes: "scan:write" },
  { id: "2", name: "CLI Dev", prefix: "sk-...3e1b", created: "20 Feb 2026", lastUsed: "5d ago", scopes: "scan:read,scan:write" },
]

export default function ApiKeysPage() {
  return (
    <div className="p-4 space-y-4">
      <Link href="/settings" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Settings
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">API Keys</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Keys for CLI and CI/CD integrations. Keep them secret.</p>
        </div>
        <Button size="sm" className="h-7 text-xs gap-1.5">
          <Plus className="h-3 w-3" /> Generate Key
        </Button>
      </div>

      <div className="bg-card border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground bg-secondary/30">
              <th className="text-left font-medium px-3 py-2">Name</th>
              <th className="text-left font-medium px-3 py-2">Key</th>
              <th className="text-left font-medium px-3 py-2">Scopes</th>
              <th className="text-left font-medium px-3 py-2">Created</th>
              <th className="text-left font-medium px-3 py-2">Last Used</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-b last:border-0 hover:bg-secondary/50">
                <td className="px-3 py-2 font-medium">{k.name}</td>
                <td className="px-3 py-2">
                  <code className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{k.prefix}</code>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground font-mono">{k.scopes}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{k.created}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{k.lastUsed}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button className="p-1 text-muted-foreground hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
                    <button className="p-1 text-muted-foreground hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
