import { Upload, Search, ListChecks, Download } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload your build artifacts",
    description:
      "SBOM (CycloneDX, SPDX, or Yocto manifest). Optionally add your kernel.config, device tree, and BusyBox config for hardware-aware filtering.",
  },
  {
    number: "02",
    icon: Search,
    title: "Match and filter",
    description:
      "Cross-references NVD, EUVD, and CISA KEV. Applies up to 7 filter layers — Kconfig, DTB, BusyBox applet, PACKAGECONFIG, patch detection, custom rules, deployment context.",
  },
  {
    number: "03",
    icon: ListChecks,
    title: "Triage what remains",
    description:
      "Keyboard-driven triage interface. CVSS severity borders, confidence scoring, per-CVE justification. Carry-forward from previous scans saves repeat work.",
  },
  {
    number: "04",
    icon: Download,
    title: "Download your filing",
    description:
      "Evidence Pack ZIP with Article 13 PDF, CycloneDX VEX, CSAF VEX, SPDX SBOM, SARIF — 8 formats total. Every suppression justified, every assessment auditable.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight text-foreground">
            Four steps to an accurate filing
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              {/* Step number */}
              <span className="absolute -top-3 left-6 bg-card px-2 font-mono text-xs text-primary">
                {step.number}
              </span>

              {/* Icon */}
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-primary/10">
                <step.icon className="h-6 w-6 text-foreground" />
              </div>

              {/* Content */}
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
