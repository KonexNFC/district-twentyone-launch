import { useQuery } from "@tanstack/react-query";
import { Countdown } from "@/components/countdown";
import { WaitlistForm } from "@/components/waitlist-form";
import { usePageTitle } from "@/hooks/use-page-title";
import type { DropSettings } from "@shared/schema";

const teasers = [
  { src: "/images/teaser-tee.png", label: "ESSENTIAL TEE" },
  { src: "/images/teaser-pants.png", label: "CARGO PANT" },
  { src: "/images/teaser-hoodie.png", label: "CORE HOODIE" },
];

const socialProof = ["HYPEBEAST", "HIGHSNOBIETY", "COMPLEX", "GQ", "SSENSE"];

export default function Home() {
  usePageTitle("DISTRICT21 - THE UNIFORM OF NOW", "Join the DISTRICT21 waitlist. Limited edition fashion drops.");
  const { data: settings } = useQuery<DropSettings>({
    queryKey: ["/api/drop-settings"],
  });

  return (
    <div className="flex flex-col">
      <section className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-8 w-full max-w-xl py-12">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-[1px] bg-foreground/20" />
            <img
              src="/images/logo-hero.jpeg"
              alt="DISTRICT21"
              className="w-64 sm:w-80 md:w-96 h-auto"
              data-testid="img-logo-hero"
              loading="eager"
            />
            <p
              className="text-xs sm:text-sm tracking-[0.4em] text-muted-foreground font-light uppercase"
              data-testid="text-tagline"
            >
              THE UNIFORM OF NOW
            </p>
            <p className="text-xs tracking-[0.2em] text-muted-foreground/70 uppercase">
              Limited drops. No restocks.
            </p>
            <div className="w-16 h-[1px] bg-foreground/20" />
          </div>

          <div className="w-full">
            <Countdown targetDate={settings?.dropDate ? String(settings.dropDate) : null} />
          </div>

          <div className="w-full flex flex-col items-center gap-4">
            <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
              Be first to know
            </p>
            <WaitlistForm />
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] tracking-[0.5em] text-muted-foreground uppercase text-center mb-10">
            Drop 001 Preview
          </p>
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {teasers.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-3">
                <div className="aspect-[3/4] w-full bg-card overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.label}
                    className="w-full h-full object-cover grayscale"
                    loading="lazy"
                    data-testid={`img-teaser-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                  />
                </div>
                <span className="text-[10px] sm:text-xs tracking-[0.2em] text-muted-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 border-t border-border" data-testid="social-proof-strip">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] tracking-[0.4em] text-muted-foreground/50 uppercase text-center mb-6">
            As seen on
          </p>
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
            {socialProof.map((name) => (
              <span
                key={name}
                className="text-xs sm:text-sm tracking-[0.15em] text-muted-foreground/40 font-medium"
                data-testid={`text-social-${name.toLowerCase()}`}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
