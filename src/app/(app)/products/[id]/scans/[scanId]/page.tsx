"use client"

import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TriageTable } from "@/components/triage/triage-table"
import { VexWaterfall } from "@/components/charts/vex-waterfall"

const cves = [
  { id: "CVE-2026-1234", pkg: "openssl", cvss: 9.8, status: "affected" as const, rationale: null, layer: null },
  { id: "CVE-2026-1111", pkg: "curl", cvss: 7.5, status: "not_affected" as const, rationale: "Feature not enabled via PACKAGECONFIG", layer: "PACKAGECONFIG" },
  { id: "CVE-2026-2222", pkg: "busybox", cvss: 6.1, status: "under_investigation" as const, rationale: null, layer: null },
  { id: "CVE-2026-3333", pkg: "dbus", cvss: 5.3, status: "not_affected" as const, rationale: "Kconfig: CONFIG_DBUS_BROKER=n", layer: "Kconfig" },
  { id: "CVE-2025-9999", pkg: "linux-kernel", cvss: 8.1, status: "fixed" as const, rationale: "Patched in BSP layer v2.1.3", layer: "Patch" },
  { id: "CVE-2026-4444", pkg: "systemd", cvss: 4.3, status: "not_affected" as const, rationale: "DTB: peripheral not present on target", layer: "DTB" },
  { id: "CVE-2026-5555", pkg: "gstreamer", cvss: 3.1, status: "not_affected" as const, rationale: "Plugin not included in PACKAGECONFIG", layer: "PACKAGECONFIG" },
  { id: "CVE-2026-6666", pkg: "openssl", cvss: 7.2, status: "under_investigation" as const, rationale: null, layer: null },
  { id: "CVE-2026-7777", pkg: "zlib", cvss: 5.5, status: "fixed" as const, rationale: "Upgraded to 1.3.1", layer: "Patch" },
  { id: "CVE-2026-8888", pkg: "sqlite", cvss: 4.0, status: "not_affected" as const, rationale: "SQL feature disabled", layer: "Kconfig" },
  { id: "CVE-2026-9999", pkg: "libpng", cvss: 6.8, status: "affected" as const, rationale: null, layer: null },
  { id: "CVE-2026-1010", pkg: "freetype", cvss: 5.9, status: "not_affected" as const, rationale: "Font rendering not used", layer: "Deploy" },
]

const waterfallStages = [
  { name: "Kconfig", example: "CONFIG_BT=n, CONFIG_WLAN=n, CONFIG_BPF_SYSCALL=n", suppressed: 105, remaining: 142 },
  { name: "Device Tree", example: "USB controller absent, SPI peripheral disabled", suppressed: 24, remaining: 118 },
  { name: "Patch Detection", example: "Yocto cve-check evidence, backport tracking", suppressed: 29, remaining: 89 },
  { name: "BusyBox", example: "wget, ftpd, telnetd not compiled in", suppressed: 7, remaining: 82 },
  { name: "PACKAGECONFIG", example: "curl -SOCKS5, openssl -ktls", suppressed: 3, remaining: 79 },
  { name: "Deployment", example: "Air-gapped, no local users, sealed enclosure", suppressed: 5, remaining: 74 },
]

export default function ScanDetailPage() {
  return (
    <div className="p-4 space-y-4">
      {/* Breadcrumb */}
      <Link href="/products/rpi4-gateway" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" />
        RPi4 Gateway
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">Scan — 1 Apr 2026</h1>
          <p className="text-xs text-muted-foreground mt-0.5">yocto · 247 input CVEs · 74 remaining after filters</p>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
          <Download className="h-3 w-3" />
          Export VEX
        </Button>
      </div>

      {/* VEX Waterfall */}
      <VexWaterfall startingCves={247} stages={waterfallStages} />

      {/* Triage Table */}
      <TriageTable cves={cves} />
    </div>
  )
}
