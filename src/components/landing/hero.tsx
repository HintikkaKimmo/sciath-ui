import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pb-32 md:pt-28">
      {/* Subtle gradient accent */}
      <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column - Copy */}
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
              Firmware CVE Intelligence
            </p>
            
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] tracking-tight text-foreground">
              <span className="text-balance">Your scanner found</span>
              <br />
              <span className="text-primary">800 CVEs.</span>
            </h1>
            
            <p className="mt-4 sm:mt-6 font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-snug text-foreground/80">
              How many actually apply to your hardware?
            </p>
            
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Hardware-aware CVE intelligence for embedded Linux teams. Sciath reads your SBOM and kernel config to deliver an accurate CVE set and a ready-made Article 13 filing.
            </p>
            
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90">
                Request Beta Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-foreground/20">
                How it works
              </Button>
            </div>
          </div>

          {/* Right column - Visual element */}
          <div className="relative flex items-center justify-center">
            <div className="relative aspect-square w-full max-w-md">
              {/* Animated rings */}
              <div className="absolute inset-0 animate-pulse rounded-full border-2 border-primary/20" />
              <div className="absolute inset-8 animate-pulse rounded-full border-2 border-primary/30" style={{ animationDelay: "0.2s" }} />
              <div className="absolute inset-16 animate-pulse rounded-full border-2 border-primary/40" style={{ animationDelay: "0.4s" }} />
              <div className="absolute inset-24 animate-pulse rounded-full border-2 border-primary/50" style={{ animationDelay: "0.6s" }} />
              
              {/* Center stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-normal text-primary">74</span>
                <span className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">Action Required</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
