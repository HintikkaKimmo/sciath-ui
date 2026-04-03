"use client"

import { useCallback, useRef, useEffect, useState } from "react"
import { useKeyboardTriage } from "@/hooks/use-keyboard-triage"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Status = "affected" | "not_affected" | "under_investigation" | "fixed"

interface CVE {
  id: string
  pkg: string
  cvss: number
  status: Status
  rationale: string | null
  layer: string | null
}

function getStatusStyle(status: Status) {
  const styles: Record<Status, string> = {
    affected: "bg-red-100 text-red-700 border-red-200",
    not_affected: "bg-emerald-100 text-emerald-700 border-emerald-200",
    fixed: "bg-blue-100 text-blue-700 border-blue-200",
    under_investigation: "bg-amber-100 text-amber-700 border-amber-200",
  }
  return styles[status]
}

function getStatusLabel(status: Status) {
  const labels: Record<Status, string> = {
    affected: "Affected",
    not_affected: "Not Affected",
    fixed: "Fixed",
    under_investigation: "Investigating",
  }
  return labels[status]
}

function getCvssColor(cvss: number) {
  if (cvss >= 9) return "text-red-600"
  if (cvss >= 7) return "text-orange-600"
  if (cvss >= 4) return "text-amber-600"
  return "text-blue-600"
}

function getSeverityBar(cvss: number) {
  if (cvss >= 9) return "bg-red-500"
  if (cvss >= 7) return "bg-orange-500"
  if (cvss >= 4) return "bg-amber-400"
  return "bg-blue-500"
}

interface TriageTableProps {
  cves: CVE[]
  onStatusChange?: (id: string, status: Status) => void
  onSelect?: (id: string) => void
}

export function TriageTable({ cves: initialCves, onStatusChange, onSelect }: TriageTableProps) {
  const [cves, setCves] = useState(initialCves)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([])

  const filtered = cves.filter((cve) => {
    if (search && !cve.id.toLowerCase().includes(search.toLowerCase()) && !cve.pkg.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    if (statusFilter !== "all" && cve.status !== statusFilter) return false
    if (severityFilter === "critical" && cve.cvss < 9) return false
    if (severityFilter === "high" && (cve.cvss < 7 || cve.cvss >= 9)) return false
    if (severityFilter === "medium" && (cve.cvss < 4 || cve.cvss >= 7)) return false
    if (severityFilter === "low" && cve.cvss >= 4) return false
    return true
  })

  const handleStatusChange = useCallback(
    (index: number, status: Status) => {
      const cve = filtered[index]
      if (!cve) return
      setCves((prev) =>
        prev.map((c) => (c.id === cve.id ? { ...c, status } : c))
      )
      onStatusChange?.(cve.id, status)
    },
    [filtered, onStatusChange]
  )

  const handleSelect = useCallback(
    (index: number) => {
      const cve = filtered[index]
      if (cve) onSelect?.(cve.id)
    },
    [filtered, onSelect]
  )

  const { activeIndex, setActiveIndex, selectedIndices } = useKeyboardTriage({
    itemCount: filtered.length,
    onStatusChange: handleStatusChange,
    onSelect: handleSelect,
  })

  // Scroll active row into view
  useEffect(() => {
    rowRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  const statusCounts = {
    affected: cves.filter((c) => c.status === "affected").length,
    under_investigation: cves.filter((c) => c.status === "under_investigation").length,
    not_affected: cves.filter((c) => c.status === "not_affected").length,
    fixed: cves.filter((c) => c.status === "fixed").length,
  }

  return (
    <div className="space-y-3">
      {/* Status summary */}
      <div className="flex gap-3 text-xs">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-50 text-red-700">
          <span className="font-medium">{statusCounts.affected}</span> Affected
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-50 text-amber-700">
          <span className="font-medium">{statusCounts.under_investigation}</span> Investigating
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 text-emerald-700">
          <span className="font-medium">{statusCounts.not_affected}</span> Not Affected
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-50 text-blue-700">
          <span className="font-medium">{statusCounts.fixed}</span> Fixed
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search CVEs, packages... ( / )"
            className="h-7 pl-8 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-[110px] h-7 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="affected">Affected</SelectItem>
            <SelectItem value="not_affected">Not Affected</SelectItem>
            <SelectItem value="under_investigation">Investigating</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v ?? "all")}>
          <SelectTrigger className="w-[110px] h-7 text-xs">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground border-b bg-secondary/30">
              <th className="w-1"></th>
              <th className="text-left font-medium px-3 py-1.5">CVE</th>
              <th className="text-left font-medium px-3 py-1.5">Package</th>
              <th className="text-center font-medium px-3 py-1.5 w-16">CVSS</th>
              <th className="text-left font-medium px-3 py-1.5">Layer</th>
              <th className="text-left font-medium px-3 py-1.5 w-28">Status</th>
              <th className="text-left font-medium px-3 py-1.5">Rationale</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cve, i) => (
              <tr
                key={cve.id}
                ref={(el) => { rowRefs.current[i] = el }}
                onClick={() => setActiveIndex(i)}
                className={`border-b last:border-0 cursor-pointer transition-colors ${
                  i === activeIndex
                    ? "bg-primary/5 outline outline-1 outline-primary/30"
                    : selectedIndices.has(i)
                      ? "bg-primary/3"
                      : "hover:bg-secondary/50"
                }`}
              >
                <td className="p-0">
                  <div className={`w-1 h-8 ${getSeverityBar(cve.cvss)}`} />
                </td>
                <td className="px-3 py-1.5">
                  <code className="text-xs font-mono font-medium text-primary">{cve.id}</code>
                </td>
                <td className="px-3 py-1.5 text-muted-foreground">{cve.pkg}</td>
                <td className="px-3 py-1.5 text-center">
                  <span className={`font-semibold text-xs ${getCvssColor(cve.cvss)}`}>
                    {cve.cvss}
                  </span>
                </td>
                <td className="px-3 py-1.5">
                  {cve.layer ? (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {cve.layer}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
                <td className="px-3 py-1.5">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getStatusStyle(cve.status)}`}>
                    {getStatusLabel(cve.status)}
                  </Badge>
                </td>
                <td className="px-3 py-1.5">
                  {cve.rationale ? (
                    <code className="text-[10px] text-muted-foreground font-mono bg-secondary px-1.5 py-0.5 rounded">
                      {cve.rationale}
                    </code>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-muted-foreground">
        <span>Showing {filtered.length} of {cves.length} CVEs</span>
        <div className="hidden sm:flex gap-4">
          <span><kbd className="px-1 py-0.5 rounded border bg-secondary font-mono text-[10px]">j</kbd>/<kbd className="px-1 py-0.5 rounded border bg-secondary font-mono text-[10px]">k</kbd> navigate</span>
          <span><kbd className="px-1 py-0.5 rounded border bg-secondary font-mono text-[10px]">a</kbd> affected</span>
          <span><kbd className="px-1 py-0.5 rounded border bg-secondary font-mono text-[10px]">n</kbd> not affected</span>
          <span><kbd className="px-1 py-0.5 rounded border bg-secondary font-mono text-[10px]">f</kbd> fixed</span>
          <span><kbd className="px-1 py-0.5 rounded border bg-secondary font-mono text-[10px]">u</kbd> investigating</span>
          <span><kbd className="px-1 py-0.5 rounded border bg-secondary font-mono text-[10px]">⏎</kbd> detail</span>
        </div>
      </div>
    </div>
  )
}
