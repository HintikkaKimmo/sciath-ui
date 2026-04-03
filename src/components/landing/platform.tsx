import { Kbd } from "@/components/ui/kbd"

const mockCVEs = [
  {
    id: "CVE-2022-0847",
    component: "linux-kernel",
    version: "5.15.32",
    cvss: 7.8,
    status: "affected",
    confidence: 3,
    layer: null,
  },
  {
    id: "CVE-2022-3602",
    component: "openssl",
    version: "3.0.7",
    cvss: 7.5,
    status: "affected",
    confidence: 3,
    layer: null,
  },
  {
    id: "CVE-2021-4204",
    component: "linux-kernel",
    version: "5.15.32",
    cvss: 7.1,
    status: "not_affected",
    confidence: 2,
    layer: "Kconfig",
  },
  {
    id: "CVE-2022-3786",
    component: "openssl",
    version: "3.0.7",
    cvss: 7.5,
    status: "fixed",
    confidence: 3,
    layer: "Patched",
  },
  {
    id: "CVE-2022-27666",
    component: "linux-kernel",
    version: "5.15.32",
    cvss: 7.8,
    status: "under_investigation",
    confidence: 1,
    layer: null,
  },
  {
    id: "CVE-2022-28391",
    component: "busybox",
    version: "1.35.0",
    cvss: 3.7,
    status: "not_affected",
    confidence: 2,
    layer: "Deploy",
    kev: true,
  },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    affected: "bg-red-500/10 text-red-600 border-red-500/20",
    not_affected: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    fixed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    under_investigation: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  }

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status.replace("_", " ")}
    </span>
  )
}

function ConfidenceIndicator({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`h-3 w-1.5 rounded-sm ${i <= level ? "bg-primary" : "bg-border"}`}
        />
      ))}
    </div>
  )
}

function CvssScore({ score }: { score: number }) {
  const severity = score >= 9 ? "critical" : score >= 7 ? "high" : score >= 4 ? "medium" : "low"
  const colors: Record<string, string> = {
    critical: "border-red-500 bg-red-500/10 text-red-600",
    high: "border-orange-500 bg-orange-500/10 text-orange-600",
    medium: "border-amber-500 bg-amber-500/10 text-amber-600",
    low: "border-emerald-500 bg-emerald-500/10 text-emerald-600",
  }

  return (
    <span className={`rounded border-l-2 px-2 py-0.5 font-mono text-sm font-medium ${colors[severity]}`}>
      {score.toFixed(1)}
    </span>
  )
}

export function Platform() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-primary">
            The Platform
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight text-foreground">
            Triage at the speed of thought
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Keyboard-driven interface. CVSS severity borders. Inline editing. Every assessment justified and auditable.
          </p>
        </div>

        {/* Mock UI */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* URL bar */}
          <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-border" />
              <div className="h-3 w-3 rounded-full bg-border" />
              <div className="h-3 w-3 rounded-full bg-border" />
            </div>
            <div className="flex-1 rounded-lg bg-background px-4 py-1.5 font-mono text-xs text-muted-foreground">
              sciath.co/app/scans/kirkstone-5.15.32
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-secondary/30 px-4 py-3">
            <select className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
              <option>All statuses</option>
            </select>
            <select className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
              <option>All layers</option>
            </select>
            <select className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
              <option>{"CVSS ≥ 0"}</option>
            </select>
            <input
              type="text"
              placeholder="Search CVE-ID..."
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground"
            />
          </div>

          {/* CVE List */}
          <div className="divide-y divide-border">
            {mockCVEs.map((cve) => (
              <div
                key={cve.id}
                className="flex flex-wrap items-center gap-4 px-4 py-4 transition-colors hover:bg-secondary/30"
              >
                <div className="flex min-w-[200px] flex-1 items-center gap-3">
                  <span className="font-mono text-sm font-medium text-foreground">{cve.id}</span>
                  <span className="text-sm text-muted-foreground">{cve.component}</span>
                  <span className="font-mono text-xs text-muted-foreground">{cve.version}</span>
                  {cve.kev && (
                    <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs font-bold text-red-600">
                      KEV
                    </span>
                  )}
                </div>

                <CvssScore score={cve.cvss} />
                <ConfidenceIndicator level={cve.confidence} />

                {cve.layer && (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {cve.layer}
                  </span>
                )}

                <StatusBadge status={cve.status} />
              </div>
            ))}
          </div>

          {/* Footer with keyboard shortcuts */}
          <div className="flex items-center justify-end gap-4 border-t border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <Kbd>j</Kbd>/<Kbd>k</Kbd> navigate
            </span>
            <span className="flex items-center gap-2">
              <Kbd>t</Kbd> triage / filter
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
