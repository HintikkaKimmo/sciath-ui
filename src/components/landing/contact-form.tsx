"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight } from "lucide-react"

export function ContactForm() {
  return (
    <section className="bg-foreground px-6 py-24 text-background md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Left - Copy */}
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight text-background">
              Start with an accurate assessment
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-background/70">
              We onboard manually. Enter your details and we&apos;ll schedule a call.
            </p>
          </div>

          {/* Right - Form */}
          <div className="rounded-2xl bg-background p-8">
            <form className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground">First name</Label>
                  <Input id="firstName" placeholder="Jane" className="border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground">
                    Last name <span className="text-primary">*</span>
                  </Label>
                  <Input id="lastName" placeholder="Doe" required className="border-border" />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Work email <span className="text-primary">*</span>
                  </Label>
                  <Input id="email" type="email" placeholder="jane@company.com" required className="border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-foreground">
                    Company <span className="text-primary">*</span>
                  </Label>
                  <Input id="company" placeholder="Acme Corp" required className="border-border" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-foreground">
                  Role <span className="text-primary">*</span>
                </Label>
                <select
                  id="role"
                  required
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select role</option>
                  <option value="engineer">Firmware/Embedded Engineer</option>
                  <option value="lead">Engineering Lead</option>
                  <option value="security">Security Engineer</option>
                  <option value="compliance">Compliance/Regulatory</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="device" className="text-foreground">What device/product do you ship?</Label>
                <Input
                  id="device"
                  placeholder="e.g. Industrial gateway, medical device, automotive ECU"
                  className="border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compliance" className="text-foreground">
                  How do you handle CRA compliance today? <span className="text-primary">*</span>
                </Label>
                <Textarea
                  id="compliance"
                  required
                  placeholder="Tell us about your current process..."
                  className="min-h-[100px] border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Team size</Label>
                <div className="flex flex-wrap gap-2">
                  {["Solo", "2-5", "6-20", "20+"].map((size) => (
                    <label
                      key={size}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                    >
                      <input type="radio" name="teamSize" value={size} className="sr-only" />
                      <span className="text-foreground">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full bg-foreground text-background hover:bg-foreground/90">
                Request Beta Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
