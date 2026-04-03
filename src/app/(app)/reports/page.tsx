import { Metadata } from "next"
import { Download, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = { title: "Reports | Sciath" }

const reports = [
  { id: "1", name: "RPi4 Gateway — CRA Evidence Pack", product: "RPi4 Gateway", scan: "1 Apr 2026", format: "ZIP", size: "2.4 MB", status: "ready" },
  { id: "2", name: "RPi4 Gateway — Article 13 PDF", product: "RPi4 Gateway", scan: "1 Apr 2026", format: "PDF", size: "840 KB", status: "ready" },
  { id: "3", name: "Fleet Manager — CycloneDX VEX", product: "Fleet Manager", scan: "25 Mar 2026", format: "JSON", size: "156 KB", status: "ready" },
  { id: "4", name: "Edge Sensor Hub — Evidence Pack", product: "Edge Sensor Hub", scan: "28 Mar 2026", format: "ZIP", size: null, status: "generating" },
]

export default function ReportsPage() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Reports</h1>
        <Button size="sm" className="h-7 text-xs gap-1.5">
          <FileText className="h-3 w-3" /> Generate Report
        </Button>
      </div>

      <div className="bg-card border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground bg-secondary/30">
              <th className="text-left font-medium px-3 py-2">Report</th>
              <th className="text-left font-medium px-3 py-2">Product</th>
              <th className="text-left font-medium px-3 py-2">Scan Date</th>
              <th className="text-left font-medium px-3 py-2">Format</th>
              <th className="text-right font-medium px-3 py-2">Size</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-secondary/50">
                <td className="px-3 py-2 font-medium">{r.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.product}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{r.scan}</td>
                <td className="px-3 py-2">
                  <Badge variant="outline" className="text-[10px]">{r.format}</Badge>
                </td>
                <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                  {r.size ?? "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  {r.status === "ready" ? (
                    <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
                      <Download className="h-3 w-3" /> Download
                    </Button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> Generating
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
