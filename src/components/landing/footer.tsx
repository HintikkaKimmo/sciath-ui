import Link from "next/link"

const productLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Request Beta", href: "#contact" },
  { label: "Pricing", href: "#", soon: true },
  { label: "Docs", href: "#", soon: true },
]

const companyLinks = [
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "#", soon: true },
]

const resourceLinks = [
  { label: "CRA Guide", href: "#", soon: true },
  { label: "VEX Explainer", href: "#", soon: true },
  { label: "API Reference", href: "#", soon: true },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="font-serif text-2xl tracking-tight text-foreground">Sciath</span>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Hardware-aware CVE intelligence and CRA compliance for embedded Linux teams.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Product
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                    {link.soon && (
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        soon
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                    {link.soon && (
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        soon
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Resources
            </h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                    {link.soon && (
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        soon
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026 Sciath. Built for CRA compliance.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
