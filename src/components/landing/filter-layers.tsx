"use client"

const pipeline = [
  {
    name: "Kconfig",
    example: "CONFIG_BT=n, CONFIG_WLAN=n, CONFIG_BPF_SYSCALL=n",
    description: "Suppresses CVEs requiring disabled kernel modules",
    suppressed: 105,
    remaining: 142,
  },
  {
    name: "Device Tree",
    example: "USB controller absent, SPI peripheral disabled",
    description: "Suppresses CVEs targeting missing hardware",
    suppressed: 24,
    remaining: 118,
  },
  {
    name: "Patch Detection",
    example: "Yocto cve-check evidence, backport tracking",
    description: "Already patched = already safe",
    suppressed: 29,
    remaining: 89,
  },
  {
    name: "BusyBox Applets",
    example: "wget, ftpd, telnetd not compiled in",
    description: "Applet-level suppression (Sciath-unique)",
    suppressed: 7,
    remaining: 82,
  },
  {
    name: "PACKAGECONFIG",
    example: "curl -SOCKS5, openssl -ktls",
    description: "Yocto recipe feature flags",
    suppressed: 3,
    remaining: 79,
  },
  {
    name: "Deployment",
    example: "Air-gapped, no local users, sealed enclosure",
    description: "CVSS adjusted for real-world context",
    suppressed: 5,
    remaining: 74,
  },
]

const startingCVEs = 247

export function FilterLayers() {
  return (
    <section className="bg-foreground px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-primary">
            SBOM Filtering Pipeline
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight text-background">
            Six filter layers.<br />
            <span className="text-primary">Zero false negatives.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-background/70">
            Each layer removes CVEs that demonstrably cannot affect your device. 
            When evidence is missing, the CVE stays. When in doubt, include.
          </p>
        </div>

        {/* Pipeline visualization */}
        <div className="relative">
          {/* Starting point */}
          <div className="mb-2 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
              <span className="font-mono text-lg font-bold text-primary">IN</span>
            </div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-semibold text-background">SBOM Input</span>
                <span className="font-mono text-2xl font-bold text-background">{startingCVEs}</span>
              </div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-background/10">
                <div 
                  className="h-full rounded-full bg-primary transition-all duration-1000"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Pipeline connector */}
          <div className="ml-7 h-6 w-px border-l-2 border-dashed border-background/30" />

          {/* Filter stages */}
          {pipeline.map((stage, index) => {
            const percentRemaining = Math.round((stage.remaining / startingCVEs) * 100)
            const prevRemaining = index === 0 ? startingCVEs : pipeline[index - 1].remaining
            
            return (
              <div key={stage.name}>
                <div className="flex gap-4">
                  {/* Stage indicator */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-background/30 bg-background/5 font-mono text-sm font-bold text-background/80">
                      {index + 1}
                    </div>
                  </div>

                  {/* Stage content */}
                  <div className="flex-1 pb-2">
                    <div className="rounded-xl bg-background/5 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-background">{stage.name}</h3>
                          <p className="mt-1 font-mono text-xs text-primary">{stage.example}</p>
                          <p className="mt-2 text-sm text-background/60">{stage.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm text-red-400">
                            -{stage.suppressed} suppressed
                          </div>
                          <div className="font-mono text-2xl font-bold text-background">
                            {stage.remaining}
                          </div>
                          <div className="font-mono text-xs text-background/50">
                            remaining
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-background/10">
                        <div 
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${percentRemaining}%` }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between font-mono text-xs text-background/40">
                        <span>{prevRemaining} in</span>
                        <span>{percentRemaining}% of original</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connector line */}
                {index < pipeline.length - 1 && (
                  <div className="ml-7 h-4 w-px border-l-2 border-dashed border-background/30" />
                )}
              </div>
            )
          })}

          {/* Final output */}
          <div className="ml-7 h-6 w-px border-l-2 border-dashed border-background/30" />
          
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary">
              <span className="font-mono text-lg font-bold text-primary-foreground">OUT</span>
            </div>
            <div className="flex-1 rounded-xl border-2 border-primary bg-primary/10 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-semibold text-background">Action Required</span>
                  <p className="mt-1 text-sm text-background/60">
                    Only CVEs that can actually affect your device
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-4xl font-bold text-primary">74</div>
                  <div className="font-mono text-xs text-background/50">
                    {Math.round((74 / startingCVEs) * 100)}% of original
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
