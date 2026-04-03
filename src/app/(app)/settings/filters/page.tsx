import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = { title: "Filter Policies | Sciath" }

const policies = [
  { id: "1", name: "Automotive Base", layers: 6, rules: 42, products: 2, updated: "30 Mar 2026" },
  { id: "2", name: "Industrial Minimal", layers: 4, rules: 18, products: 1, updated: "22 Mar 2026" },
]

export default function FiltersPage() {
  return (
    <div className="p-4 space-y-4">
      <Link href="/settings" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Settings
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Filter Policies</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Custom VEX filter rules applied during scan analysis.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
            <Upload className="h-3 w-3" /> Import VEX
          </Button>
          <Button size="sm" className="h-7 text-xs gap-1.5">
            <Plus className="h-3 w-3" /> New Policy
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground bg-secondary/30">
              <th className="text-left font-medium px-3 py-2">Policy</th>
              <th className="text-right font-medium px-3 py-2">Layers</th>
              <th className="text-right font-medium px-3 py-2">Rules</th>
              <th className="text-right font-medium px-3 py-2">Products</th>
              <th className="text-right font-medium px-3 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-secondary/50 cursor-pointer">
                <td className="px-3 py-2 font-medium">{p.name}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{p.layers}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{p.rules}</td>
                <td className="px-3 py-2 text-right">
                  <Badge variant="outline" className="text-[10px]">{p.products} linked</Badge>
                </td>
                <td className="px-3 py-2 text-right text-xs text-muted-foreground">{p.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
