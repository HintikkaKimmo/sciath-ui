import { Clock } from "lucide-react"

export function DeadlineBanner() {
  return (
    <section className="border-y border-border bg-secondary/50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">CRA Deadline</span>
          </div>
          
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Vulnerability reporting obligations begin September 2026.</span>{" "}
            Full Article 13 compliance required by December 2027. Filing requires a justified CVE assessment, not a raw scanner dump.
          </p>
        </div>
      </div>
    </section>
  )
}
