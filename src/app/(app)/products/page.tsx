import { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const metadata: Metadata = {
  title: "Products | Sciath",
  description: "All products under CRA vulnerability management",
}

const products = [
  { id: "rpi4-gateway", name: "RPi4 Gateway", desc: "Raspberry Pi 4 IoT gateway, Yocto Kirkstone", cves: 142, assessed: 78, critical: 3, high: 12, lastScan: "01/04/2026", components: 347 },
  { id: "edge-sensor-hub", name: "Edge Sensor Hub", desc: "STM32MP1-based sensor node, Buildroot", cves: 89, assessed: 45, critical: 5, high: 8, lastScan: "28/03/2026", components: 156 },
  { id: "fleet-manager", name: "Fleet Manager Appliance", desc: "x86 fleet management, Debian Bookworm", cves: 214, assessed: 92, critical: 2, high: 15, lastScan: "25/03/2026", components: 892 },
  { id: "smart-meter", name: "Smart Meter Gateway", desc: "ARM Cortex-M7, FreeRTOS", cves: 34, assessed: 88, critical: 0, high: 2, lastScan: "30/03/2026", components: 67 },
  { id: "industrial-plc", name: "Industrial PLC", desc: "Custom Linux, Yocto Dunfell LTS", cves: 178, assessed: 62, critical: 4, high: 19, lastScan: "22/03/2026", components: 423 },
]

export default function ProductsPage() {
  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Products</h1>
        <Button size="sm" className="h-7 text-xs gap-1.5">
          <Plus className="h-3 w-3" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search products..." className="h-8 pl-8 text-sm" />
      </div>

      {/* Products table */}
      <div className="bg-card border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground bg-secondary/30">
              <th className="text-left font-medium px-3 py-2">Product</th>
              <th className="text-right font-medium px-3 py-2">Components</th>
              <th className="text-right font-medium px-3 py-2">CVEs</th>
              <th className="text-right font-medium px-3 py-2">Critical</th>
              <th className="text-right font-medium px-3 py-2">High</th>
              <th className="text-right font-medium px-3 py-2">Assessed</th>
              <th className="text-right font-medium px-3 py-2">Last Scan</th>
              <th className="w-6"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-secondary/50 group">
                <td className="px-3 py-2">
                  <Link href={`/products/${p.id}`} className="block">
                    <div className="font-medium group-hover:text-primary transition-colors">{p.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[280px]">{p.desc}</div>
                  </Link>
                </td>
                <td className="px-3 py-2 text-right text-muted-foreground">{p.components}</td>
                <td className="px-3 py-2 text-right font-medium">{p.cves}</td>
                <td className="px-3 py-2 text-right">
                  {p.critical > 0 ? <span className="text-red-600 font-medium">{p.critical}</span> : <span className="text-muted-foreground">-</span>}
                </td>
                <td className="px-3 py-2 text-right">
                  {p.high > 0 ? <span className="text-orange-600 font-medium">{p.high}</span> : <span className="text-muted-foreground">-</span>}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-14 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${p.assessed >= 80 ? "bg-emerald-500" : p.assessed >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${p.assessed}%` }}
                      />
                    </div>
                    <span className={`w-8 text-xs ${p.assessed >= 80 ? "text-emerald-600" : p.assessed >= 50 ? "text-amber-600" : "text-red-600"}`}>
                      {p.assessed}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right text-muted-foreground text-xs">{p.lastScan}</td>
                <td className="pr-2">
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground">
        {products.length} products · {products.reduce((a, p) => a + p.cves, 0)} total CVEs
      </div>
    </div>
  )
}
