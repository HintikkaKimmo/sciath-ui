export function NoiseProblem() {
  const integrations = [
    { name: "Yocto", type: "build" },
    { name: "Buildroot", type: "build" },
    { name: "CycloneDX", type: "sbom" },
    { name: "SPDX", type: "sbom" },
    { name: "EUVD", type: "database" },
    { name: "NVD", type: "database" },
    { name: "CISA KEV", type: "database" },
    { name: "SARIF", type: "output" },
  ]

  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Left - Problem statement */}
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-primary">
              The Noise Problem
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight text-foreground">
              <span className="text-balance">Generic scanners don&apos;t know your hardware.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              A typical Yocto Kirkstone build triggers hundreds of CVE matches. Most don&apos;t apply to your device. Sciath filters them out, layer by layer, using your actual build configuration.
            </p>
          </div>

          {/* Right - Integration logos */}
          <div className="flex flex-col justify-center">
            <p className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Works with your stack
            </p>
            <div className="flex flex-wrap gap-3">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  {integration.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
