import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Countdown } from "@/components/countdown";
import { WaitlistForm } from "@/components/waitlist-form";
import { StickyMobileCTA } from "@/components/sticky-mobile-cta";
import { usePageTitle } from "@/hooks/use-page-title";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DropSettings, Mockup } from "@shared/schema";
import { SILHOUETTES } from "@shared/schema";

const products = SILHOUETTES.map(s => ({
  id: s.id,
  name: s.name,
  type: s.fit,
  black: `/images/products/${s.id}-black.jpg`,
  white: `/images/products/${s.id}-white.jpg`,
}));

const socialProof = ["HYPEBEAST", "HIGHSNOBIETY", "COMPLEX", "GQ", "SSENSE"];

function getDropState(settings?: DropSettings | null): "pre" | "live" | "post" {
  if (!settings) return "pre";
  if (settings.isLive) return "live";
  const dropDate = settings.dropDate ? new Date(settings.dropDate) : null;
  if (dropDate && dropDate.getTime() < Date.now()) return "post";
  return "pre";
}

export default function Home() {
  usePageTitle(
    "DISTRICT21 — THE UNIFORM OF NOW | Drop 001",
    "Join the DISTRICT21 waitlist. Limited edition fashion drops. No restocks."
  );

  const { data: settings } = useQuery<DropSettings>({
    queryKey: ["/api/drop-settings"],
  });

  const { data: allMockups = [] } = useQuery<Mockup[]>({
    queryKey: ["/api/mockups"],
  });

  const dropState = getDropState(settings);
  const heroMockup = allMockups.find(m => m.silhouette === "freestyler" && m.color === "black" && (m.variation === "bold" || m.variation === "wordmark"));

  return (
    <div className="flex flex-col">
      <section className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl py-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-[1px] bg-foreground/20" />
            <h1 data-testid="text-brand-h1" className="sr-only">DISTRICT21 — THE UNIFORM OF NOW</h1>
            <img
              src="/images/logo-hero.jpeg"
              alt="DISTRICT21 — THE UNIFORM OF NOW"
              className="w-[70vw] max-w-md h-auto"
              loading="eager"
              data-testid="img-brand-logo"
            />
            <p className="text-xs tracking-[0.2em] text-muted-foreground/70 uppercase" data-testid="text-tagline">
              Drop 001 — Limited quantities. No restocks.
            </p>
            <div className="w-12 h-[1px] bg-foreground/20" />
          </div>

          {heroMockup && (
            <Link href="/product/freestyler">
              <div
                className="w-[65vw] max-w-lg aspect-[3/4] bg-card overflow-hidden cursor-pointer mx-auto"
                data-testid="hero-mockup"
              >
                <img
                  src={heroMockup.filePath1024 || heroMockup.filePath640 || ""}
                  alt={heroMockup.altText || "DISTRICT21 Freestyler — Drop 001"}
                  className="w-full h-full object-contain p-4"
                  loading="eager"
                  data-testid="img-hero-mockup"
                />
              </div>
            </Link>
          )}

          {!heroMockup && (
            <div className="w-[65vw] max-w-lg aspect-[3/4] bg-card overflow-hidden mx-auto">
              <img
                src="/images/products/freestyler-black.jpg"
                alt="DISTRICT21 Freestyler — Drop 001"
                className="w-full h-full object-contain p-4"
                loading="eager"
                data-testid="img-hero-fallback"
              />
            </div>
          )}

          <div className="w-full flex flex-col items-center gap-6">
            {dropState === "live" ? (
              <div className="flex flex-col items-center gap-4" data-testid="home-live-state">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
                  <span className="text-xs tracking-[0.3em] uppercase font-medium">Drop is live</span>
                </div>
                <Button
                  asChild
                  className="h-12 px-10 rounded-none tracking-[0.2em] text-sm font-medium"
                  data-testid="button-shop-drop"
                >
                  <a href={settings?.shopifyUrl || "#"} target="_blank" rel="noopener noreferrer">
                    SHOP DROP 001 <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            ) : dropState === "post" ? (
              <div className="flex flex-col items-center gap-4 w-full" data-testid="home-post-state">
                <p className="text-xs tracking-[0.2em] text-muted-foreground/70 uppercase">
                  Drop 001 has ended
                </p>
                <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                  Join the next drop
                </p>
                <WaitlistForm />
                <p className="text-[10px] text-muted-foreground/50 tracking-wide">
                  No spam. Drop alerts only.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 w-full" data-testid="home-pre-state">
                <Countdown targetDate={settings?.dropDate ? String(settings.dropDate) : null} />
                <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                  Get early access
                </p>
                <WaitlistForm />
                <p className="text-[10px] text-muted-foreground/50 tracking-wide">
                  No spam. Drop alerts only.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-t border-border" data-testid="product-lineup">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] tracking-[0.5em] text-muted-foreground uppercase text-center mb-4">
            Drop 001 Preview
          </p>
          <p className="text-xs tracking-[0.2em] text-muted-foreground/60 uppercase text-center mb-12">
            Tees &middot; Hoodies &middot; Sweatshirts
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {products.map((item) => {
              const mockup = allMockups.find(m => m.silhouette === item.id && m.color === "black" && (m.variation === "bold" || m.variation === "wordmark"));
              const mockupWhite = allMockups.find(m => m.silhouette === item.id && m.color === "white" && (m.variation === "bold" || m.variation === "wordmark"));

              return (
                <Link key={item.id} href={`/product/${item.id}`}>
                  <div
                    className="flex flex-col items-center gap-3 group cursor-pointer"
                    data-testid={`product-card-${item.id}`}
                  >
                    <div className="aspect-square w-full bg-card overflow-hidden relative">
                      <img
                        src={mockup?.filePath640 || item.black}
                        alt={mockup?.altText || `${item.name} - Black`}
                        className="w-full h-full object-contain p-3 absolute inset-0 transition-opacity duration-300 group-hover:opacity-0"
                        loading="lazy"
                        data-testid={`img-product-${item.id}-black`}
                      />
                      <img
                        src={mockupWhite?.filePath640 || item.white}
                        alt={mockupWhite?.altText || `${item.name} - White`}
                        className="w-full h-full object-contain p-3 absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        loading="lazy"
                        data-testid={`img-product-${item.id}-white`}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs sm:text-sm tracking-[0.15em] font-medium uppercase">
                        {item.name}
                      </span>
                      <span className="text-[10px] tracking-[0.2em] text-muted-foreground/60 uppercase">
                        {item.type}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
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

      <StickyMobileCTA dropState={dropState} shopUrl={settings?.shopifyUrl} />
    </div>
  );
}
