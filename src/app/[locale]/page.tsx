import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { DeadlineBanner } from "@/components/landing/deadline-banner";
import { NoiseProblem } from "@/components/landing/noise-problem";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FilterLayers } from "@/components/landing/filter-layers";
import { Platform } from "@/components/landing/platform";
import { OutputFormats } from "@/components/landing/output-formats";
import { Accuracy } from "@/components/landing/accuracy";
import { ContactForm } from "@/components/landing/contact-form";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <DeadlineBanner />
        <NoiseProblem />
        <HowItWorks />
        <FilterLayers />
        <Platform />
        <OutputFormats />
        <Accuracy />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
