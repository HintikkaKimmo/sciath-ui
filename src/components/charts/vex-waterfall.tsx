"use client"

interface FilterStage {
  name: string
  example: string
  suppressed: number
  remaining: number
}

interface VexWaterfallProps {
  startingCves: number
  stages: FilterStage[]
}

function getBarColor(remaining: number, total: number) {
  const pct = (remaining / total) * 100
  if (pct > 60) return "bg-primary"
  if (pct > 30) return "bg-amber-500"
  return "bg-emerald-500"
}

export function VexWaterfall({ startingCves, stages }: VexWaterfallProps) {
  const finalRemaining = stages[stages.length - 1]?.remaining ?? startingCves
  const suppressedTotal = startingCves - finalRemaining
  const suppressedPct = Math.round((suppressedTotal / startingCves) * 100)

  return (
    <div className="bg-card border rounded-md p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">VEX Filter Pipeline</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {suppressedPct}% of CVEs automatically resolved
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-semibold text-primary">{finalRemaining}</span>
          <span className="text-xs text-muted-foreground ml-1">/ {startingCves}</span>
        </div>
      </div>

      {/* Waterfall bars */}
      <div className="space-y-1.5">
        {/* Input bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground w-24 text-right">INPUT</span>
          <div className="flex-1 h-5 bg-secondary rounded overflow-hidden">
            <div className="h-full bg-primary rounded" style={{ width: "100%" }} />
          </div>
          <span className="text-xs font-mono w-8 text-right">{startingCves}</span>
        </div>

        {/* Filter stages */}
        {stages.map((stage, i) => {
          const pctOfOriginal = Math.round((stage.remaining / startingCves) * 100)
          const prevRemaining = i === 0 ? startingCves : stages[i - 1].remaining
          return (
            <div key={stage.name} className="group">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground w-24 text-right truncate" title={stage.name}>
                  {stage.name}
                </span>
                <div className="flex-1 h-5 bg-secondary rounded overflow-hidden relative">
                  <div
                    className={`h-full rounded transition-all duration-500 ${getBarColor(stage.remaining, startingCves)}`}
                    style={{ width: `${pctOfOriginal}%` }}
                  />
                  {/* Suppressed segment */}
                  <div
                    className="absolute top-0 h-full bg-red-400/20 rounded-r"
                    style={{
                      left: `${pctOfOriginal}%`,
                      width: `${Math.round((stage.suppressed / startingCves) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex items-center gap-1.5 w-20 justify-end">
                  <span className="text-[10px] text-red-500 font-mono">-{stage.suppressed}</span>
                  <span className="text-xs font-mono font-medium w-8 text-right">{stage.remaining}</span>
                </div>
              </div>
              {/* Detail on hover */}
              <div className="hidden group-hover:block ml-26 pl-[104px] mt-0.5">
                <span className="text-[10px] font-mono text-muted-foreground">{stage.example}</span>
              </div>
            </div>
          )
        })}

        {/* Output bar */}
        <div className="flex items-center gap-2 pt-1 border-t border-border">
          <span className="text-[10px] font-mono text-primary font-bold w-24 text-right">OUTPUT</span>
          <div className="flex-1 h-5 bg-secondary rounded overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded"
              style={{ width: `${Math.round((finalRemaining / startingCves) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-primary w-8 text-right">{finalRemaining}</span>
        </div>
      </div>
    </div>
  )
}
