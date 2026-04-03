import { FileText, FileCode, FileArchive, FileJson } from "lucide-react"

const complianceFormats = [
  {
    ext: ".pdf",
    name: "Article 13 PDF",
    description: "CRA Technical File",
    icon: FileText,
  },
  {
    ext: ".vex.json",
    name: "CycloneDX VEX",
    description: "Machine-readable vulnerability status",
    icon: FileJson,
  },
  {
    ext: ".csaf.json",
    name: "CSAF VEX",
    description: "Common Security Advisory Framework",
    icon: FileJson,
  },
  {
    ext: ".zip",
    name: "Evidence Pack",
    description: "Complete CRA filing package",
    icon: FileArchive,
  },
]

const integrationFormats = [
  {
    ext: ".sbom.json",
    name: "CycloneDX SBOM",
    description: "Component inventory with build config",
    icon: FileCode,
  },
  {
    ext: ".spdx.json",
    name: "SPDX 2.3",
    description: "Software Package Data Exchange",
    icon: FileCode,
  },
  {
    ext: ".sarif.json",
    name: "SARIF",
    description: "GitHub Code Scanning integration",
    icon: FileCode,
  },
  {
    ext: ".sbom-vex.json",
    name: "SBOM+VEX",
    description: "Components + CVE status combined",
    icon: FileCode,
  },
]

export function OutputFormats() {
  return (
    <section className="bg-secondary px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-primary">
            Output
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight text-foreground">
            Eight formats. One Evidence Pack.
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Compliance Documents */}
          <div>
            <h3 className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Compliance Documents
            </h3>
            <div className="space-y-3">
              {complianceFormats.map((format) => (
                <div
                  key={format.ext}
                  className="flex items-center gap-4 rounded-xl bg-card p-4 transition-all hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <format.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-primary">{format.ext}</span>
                      <span className="font-medium text-foreground">{format.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{format.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Formats */}
          <div>
            <h3 className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Integration Formats
            </h3>
            <div className="space-y-3">
              {integrationFormats.map((format) => (
                <div
                  key={format.ext}
                  className="flex items-center gap-4 rounded-xl bg-card p-4 transition-all hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <format.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-muted-foreground">{format.ext}</span>
                      <span className="font-medium text-foreground">{format.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{format.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
