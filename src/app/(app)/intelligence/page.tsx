import { Metadata } from "next"
import { Radio, RefreshCw, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = { title: "Intelligence | Sciath" }

const feeds = [
  { name: "NVD", status: "synced", lastSync: "2h ago", cves: "234,891", url: "https://nvd.nist.gov" },
  { name: "EUVD", status: "synced", lastSync: "3h ago", cves: "12,450", url: "https://www.enisa.europa.eu/topics/vulnerability-disclosure" },
  { name: "CISA KEV", status: "synced", lastSync: "1h ago", cves: "1,198", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" },
]

const recentAlerts = [
  { cve: "CVE-2026-1234", pkg: "openssl", severity: "Critical", source: "NVD", time: "2h ago", kev: true },
  { cve: "CVE-2026-5678", pkg: "linux-kernel", severity: "High", source: "NVD", time: "5h ago", kev: false },
  { cve: "CVE-2026-9012", pkg: "curl", severity: "High", source: "EUVD", time: "8h ago", kev: false },
  { cve: "CVE-2026-3456", pkg: "busybox", severity: "Medium", source: "NVD", time: "1d ago", kev: false },
  { cve: "CVE-2026-7890", pkg: "systemd", severity: "Medium", source: "NVD", time: "1d ago", kev: false },
]

function severityColor(s: string) {
  if (s === "Critical") return "text-red-600"
  if (s === "High") return "text-orange-600"
  if (s === "Medium") return "text-amber-600"
  return "text-blue-600"
}

export default function IntelligencePage() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Intelligence</h1>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
          <RefreshCw className="h-3 w-3" /> Sync Now
        </Button>
      </div>

      {/* Feed status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {feeds.map((f) => (
          <div key={f.name} className="bg-card border rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{f.name}</span>
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Synced
              </span>
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{f.cves} CVEs</span>
              <span>Updated {f.lastSync}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent alerts */}
      <div className="bg-card border rounded-md">
        <div className="px-3 py-2 border-b flex items-center justify-between">
          <span className="text-sm font-medium">Recent CVE Alerts</span>
          <span className="text-xs text-muted-foreground">Affecting your products</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground border-b bg-secondary/30">
              <th className="text-left font-medium px-3 py-1.5">CVE</th>
              <th className="text-left font-medium px-3 py-1.5">Package</th>
              <th className="text-left font-medium px-3 py-1.5">Severity</th>
              <th className="text-left font-medium px-3 py-1.5">Source</th>
              <th className="text-right font-medium px-3 py-1.5">Discovered</th>
            </tr>
          </thead>
          <tbody>
            {recentAlerts.map((a) => (
              <tr key={a.cve} className="border-b last:border-0 hover:bg-secondary/50">
                <td className="px-3 py-1.5">
                  <code className="text-xs font-mono font-medium">{a.cve}</code>
                  {a.kev && <Badge variant="outline" className="ml-1.5 text-[9px] px-1 py-0 bg-red-50 text-red-600 border-red-200">KEV</Badge>}
                </td>
                <td className="px-3 py-1.5 text-muted-foreground">{a.pkg}</td>
                <td className="px-3 py-1.5">
                  <span className={`text-xs font-medium ${severityColor(a.severity)}`}>{a.severity}</span>
                </td>
                <td className="px-3 py-1.5 text-xs text-muted-foreground">{a.source}</td>
                <td className="px-3 py-1.5 text-right text-xs text-muted-foreground">{a.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
