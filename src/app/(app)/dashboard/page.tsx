import { Metadata } from "next"
import { AlertTriangle, Clock, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Dashboard | Sciath",
  description: "CRA compliance posture overview",
}

const stats = [
  { label: "Total CVEs", value: "247", sub: "+12 this week" },
  { label: "Assessed", value: "68%", sub: "+8% from last month", positive: true },
  { label: "CRA Readiness", value: "42%", sub: "Target: 100%", warning: true },
  { label: "Mean Triage", value: "4.2h", sub: "-1.3h improvement", positive: true },
]

const severityData = [
  { label: "Critical", count: 18, color: "bg-red-500", pct: 7 },
  { label: "High", count: 45, color: "bg-orange-500", pct: 18 },
  { label: "Medium", count: 112, color: "bg-amber-400", pct: 45 },
  { label: "Low", count: 72, color: "bg-blue-500", pct: 30 },
]

const activity = [
  { text: "CVE-2026-1234 marked as Affected", time: "2h ago", type: "critical" },
  { text: "RPi4 Gateway scan completed", time: "5h ago", type: "info" },
  { text: "CVE-2026-1111 suppressed via PACKAGECONFIG", time: "1d ago", type: "success" },
  { text: "New product added: Fleet Manager", time: "2d ago", type: "info" },
  { text: "Edge Sensor Hub scan failed", time: "3d ago", type: "critical" },
]

const products = [
  { id: "rpi4-gateway", name: "RPi4 Gateway", cves: 142, assessed: 78, critical: 3, lastScan: "01/04" },
  { id: "edge-sensor-hub", name: "Edge Sensor Hub", cves: 89, assessed: 45, critical: 5, lastScan: "28/03" },
  { id: "fleet-manager", name: "Fleet Manager", cves: 214, assessed: 92, critical: 2, lastScan: "25/03" },
]

export default function DashboardPage() {
  return (
    <div className="p-4 space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1.5 text-xs bg-amber-50 border-amber-200 text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            12 new CVEs
          </Badge>
          <Badge variant="outline" className="gap-1.5 text-xs bg-red-50 border-red-200 text-red-700">
            <Clock className="h-3 w-3" />
            5 overdue
          </Badge>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border rounded-md p-3">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-xl font-semibold mt-0.5">{s.value}</div>
            <div className={`text-[11px] mt-0.5 ${s.positive ? "text-emerald-600" : s.warning ? "text-amber-600" : "text-muted-foreground"}`}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Severity + Activity column */}
        <div className="col-span-2 space-y-4">
          {/* Severity */}
          <div className="bg-card border rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Severity Distribution</span>
              <span className="text-xs text-muted-foreground">247 total</span>
            </div>
            <div className="h-5 w-full flex rounded overflow-hidden">
              {severityData.map((d) => (
                <div key={d.label} className={`${d.color}`} style={{ width: `${d.pct}%` }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4 mt-2">
              {severityData.map((d) => (
                <div key={d.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${d.color}`} />
                  {d.label} ({d.count})
                </div>
              ))}
            </div>
          </div>

          {/* Products table */}
          <div className="bg-card border rounded-md">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <span className="text-sm font-medium">Products</span>
              <Link href="/products" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left font-medium px-3 py-1.5">Name</th>
                  <th className="text-right font-medium px-3 py-1.5">CVEs</th>
                  <th className="text-right font-medium px-3 py-1.5">Assessed</th>
                  <th className="text-right font-medium px-3 py-1.5">Critical</th>
                  <th className="text-right font-medium px-3 py-1.5">Last Scan</th>
                  <th className="w-6"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-secondary/50 group">
                    <td className="px-3 py-2">
                      <Link href={`/products/${p.id}`} className="font-medium hover:text-primary">{p.name}</Link>
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{p.cves}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${p.assessed}%` }} />
                        </div>
                        <span className="text-muted-foreground w-8">{p.assessed}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {p.critical > 0 && <span className="text-red-600 font-medium">{p.critical}</span>}
                      {p.critical === 0 && <span className="text-muted-foreground">0</span>}
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{p.lastScan}</td>
                    <td className="pr-2">
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-card border rounded-md">
          <div className="px-3 py-2 border-b">
            <span className="text-sm font-medium">Recent Activity</span>
          </div>
          <div className="divide-y">
            {activity.map((a, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2">
                <div className={`w-1.5 h-1.5 mt-1.5 rounded-full flex-shrink-0 ${
                  a.type === "critical" ? "bg-red-500" : a.type === "success" ? "bg-emerald-500" : "bg-blue-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug">{a.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
