import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ChevronRight, Download, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "RPi4 Gateway | Sciath",
  description: "Product details and CRA readiness",
}

const craMetrics = [
  { label: "Assessed", value: 78 },
  { label: "Critical resolved", value: 90 },
  { label: "Report freshness", value: 70, display: "27 days" },
  { label: "Justification coverage", value: 65 },
  { label: "Support period", value: 100, display: "Defined" },
]

const scans = [
  { id: "scan-1", date: "1 Apr 2026", tool: "yocto", cves: 142, affected: 18, suppressed: 89 },
  { id: "scan-2", date: "25 Mar 2026", tool: "yocto", cves: 156, affected: 21, suppressed: 92 },
  { id: "scan-3", date: "18 Mar 2026", tool: "yocto", cves: 163, affected: 24, suppressed: 95 },
  { id: "scan-4", date: "11 Mar 2026", tool: "yocto", cves: 158, affected: 22, suppressed: 91 },
  { id: "scan-5", date: "4 Mar 2026", tool: "yocto", cves: 151, affected: 19, suppressed: 88 },
]

function getBarColor(v: number) {
  if (v >= 80) return "bg-emerald-500"
  if (v >= 50) return "bg-amber-500"
  return "bg-red-500"
}

function getTextColor(v: number) {
  if (v >= 80) return "text-emerald-600"
  if (v >= 50) return "text-amber-600"
  return "text-red-600"
}

export default function ProductDetailPage() {
  return (
    <div className="p-4 space-y-4">
      {/* Breadcrumb */}
      <Link href="/products" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" />
        Products
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">RPi4 Gateway</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Raspberry Pi 4 IoT gateway running Yocto Kirkstone · 347 components</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
            <Download className="h-3 w-3" />
            Export
          </Button>
          <Button size="sm" className="h-7 text-xs gap-1.5">
            <Play className="h-3 w-3" />
            New Scan
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Open CVEs:</span>
          <span className="font-semibold">142</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Critical:</span>
          <span className="font-semibold text-red-600">3</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">High:</span>
          <span className="font-semibold text-orange-600">12</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Suppressed:</span>
          <span className="font-semibold text-emerald-600">105</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CRA Readiness */}
        <div className="bg-card border rounded-md p-3">
          <div className="text-sm font-medium mb-3">CRA Readiness</div>
          <div className="space-y-2.5">
            {craMetrics.map((m) => (
              <div key={m.label} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-32 flex-shrink-0">{m.label}</span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${getBarColor(m.value)}`} style={{ width: `${m.value}%` }} />
                </div>
                <span className={`text-xs font-medium w-12 text-right ${getTextColor(m.value)}`}>
                  {m.display || `${m.value}%`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scan History */}
        <div className="col-span-2 bg-card border rounded-md">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-sm font-medium">Scan History</span>
            <span className="text-xs text-muted-foreground">{scans.length} scans</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b bg-secondary/30">
                <th className="text-left font-medium px-3 py-1.5">Date</th>
                <th className="text-left font-medium px-3 py-1.5">Scanner</th>
                <th className="text-right font-medium px-3 py-1.5">CVEs</th>
                <th className="text-right font-medium px-3 py-1.5">Affected</th>
                <th className="text-right font-medium px-3 py-1.5">Suppressed</th>
                <th className="w-6"></th>
              </tr>
            </thead>
            <tbody>
              {scans.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-secondary/50 group">
                  <td className="px-3 py-2">
                    <Link href={`/products/rpi4-gateway/scans/${s.id}`} className="font-medium group-hover:text-primary">
                      {s.date}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{s.tool}</td>
                  <td className="px-3 py-2 text-right">{s.cves}</td>
                  <td className="px-3 py-2 text-right text-red-600">{s.affected}</td>
                  <td className="px-3 py-2 text-right text-emerald-600">{s.suppressed}</td>
                  <td className="pr-2">
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
