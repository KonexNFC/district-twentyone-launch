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
    "Join the DISTRICT21 waitlist. Limited edition fashion drops."
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
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center" data-testid="hero-banner">
        <img
          src="/images/hero-editorial.png"
          alt="DISTRICT21 editorial — street culture lifestyle"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          data-testid="img-hero-editorial"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />

        <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-2xl px-4 py-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-[1px] bg-white/30" />
            <h1 data-testid="text-brand-h1" className="sr-only">DISTRICT21 — THE UNIFORM OF NOW</h1>
            <img
              src="/images/logo-hero.jpeg"
              alt="DISTRICT21 — THE UNIFORM OF NOW"
              className="w-[70vw] max-w-md h-auto invert brightness-200"
              loading="eager"
              data-testid="img-brand-logo"
            />
            <p className="text-xs tracking-[0.2em] text-white/60 uppercase" data-testid="text-tagline">
              Drop 001 — Limited quantities.
            </p>
            <div className="w-12 h-[1px] bg-white/30" />
          </div>

          <div className="w-full flex flex-col items-center gap-6">
            {dropState === "live" ? (
              <div className="flex flex-col items-center gap-4" data-testid="home-live-state">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-xs tracking-[0.3em] uppercase font-medium text-white">Drop is live</span>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-none tracking-[0.2em] text-sm font-medium border-white text-white bg-white/10 backdrop-blur-sm"
                  data-testid="button-shop-drop"
                >
                  <a href={settings?.shopifyUrl || "#"} target="_blank" rel="noopener noreferrer">
                    SHOP DROP 001 <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            ) : dropState === "post" ? (
              <div className="flex flex-col items-center gap-4 w-full" data-testid="home-post-state">
                <p className="text-xs tracking-[0.2em] text-white/50 uppercase">
                  Drop 001 has ended
                </p>
                <p className="text-xs tracking-[0.25em] text-white/70 uppercase">
                  Join the next drop
                </p>
                <WaitlistForm variant="hero" />
                <p className="text-[10px] text-white/40 tracking-wide">
                  No spam. Drop alerts only.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 w-full" data-testid="home-pre-state">
                <Countdown targetDate={settings?.dropDate ? String(settings.dropDate) : null} variant="hero" />
                <p className="text-xs tracking-[0.25em] text-white/70 uppercase">
                  Get early access
                </p>
                <WaitlistForm variant="hero" />
                <p className="text-[10px] text-white/40 tracking-wide">
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
