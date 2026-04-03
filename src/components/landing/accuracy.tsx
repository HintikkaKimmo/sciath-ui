export function Accuracy() {
  const terminalLines = [
    { text: "$ python manage.py run_validation --verbose", type: "command" },
    { text: "Loading 10 fixtures...", type: "info" },
    { text: "Running pipeline: kconfig_bluetooth_01... 3 TP, 2 TN, 0 FP, 0 FN ✓", type: "success" },
    { text: "Running pipeline: dtb_usb_peripheral_02... 2 TP, 1 TN, 0 FP, 0 FN ✓", type: "success" },
    { text: "Running pipeline: patch_openssl_backport... 1 TP, 2 TN, 0 FP, 0 FN ✓", type: "success" },
    { text: "Running pipeline: version_boundary_glibc... 2 TP, 2 TN, 0 FP, 0 FN ✓", type: "success" },
    { text: "", type: "blank" },
    { text: "RESULTS: 18 TP  16 TN  0 FP  0 FN  2 CONSERVATIVE", type: "result" },
    { text: "PASS zero false negatives", type: "pass" },
  ]

  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Left - Copy */}
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-primary">
              Accuracy
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight text-foreground">
              Zero false negatives.
              <br />
              <span className="text-primary">Tested before every commit.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              A missed CVE invalidates a CRA filing. A false positive costs 10 minutes of review. Sciath is designed to never miss a real finding.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              10 synthetic fixtures. 36 ground truth labels. Full pipeline execution. Validated in CI before every deploy.
            </p>
          </div>

          {/* Right - Terminal */}
          <div className="flex items-center">
            <div className="w-full overflow-hidden rounded-2xl border border-border bg-foreground shadow-2xl">
              {/* Terminal header */}
              <div className="flex items-center gap-2 border-b border-background/10 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-background/20" />
                  <div className="h-3 w-3 rounded-full bg-background/20" />
                  <div className="h-3 w-3 rounded-full bg-background/20" />
                </div>
                <span className="text-xs text-background/50">terminal</span>
              </div>

              {/* Terminal content */}
              <div className="p-4 font-mono text-sm">
                {terminalLines.map((line, index) => (
                  <div key={index} className="leading-relaxed">
                    {line.type === "command" && (
                      <span className="text-background/90">{line.text}</span>
                    )}
                    {line.type === "info" && (
                      <span className="text-background/60">{line.text}</span>
                    )}
                    {line.type === "success" && (
                      <span className="text-emerald-400">{line.text}</span>
                    )}
                    {line.type === "result" && (
                      <span className="text-background">{line.text}</span>
                    )}
                    {line.type === "pass" && (
                      <span className="font-bold text-primary">{line.text}</span>
                    )}
                    {line.type === "blank" && <br />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
