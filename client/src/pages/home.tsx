import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Countdown } from "@/components/countdown";
import { WaitlistForm } from "@/components/waitlist-form";
import { usePageTitle } from "@/hooks/use-page-title";
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

export default function Home() {
  usePageTitle("DISTRICT21 - THE UNIFORM OF NOW", "Join the DISTRICT21 waitlist. Limited edition fashion drops.");
  const { data: settings } = useQuery<DropSettings>({
    queryKey: ["/api/drop-settings"],
  });

  const { data: allMockups = [] } = useQuery<Mockup[]>({
    queryKey: ["/api/mockups"],
  });

  const heroMockup = allMockups.find(m => m.silhouette === "freestyler" && m.color === "black" && (m.variation === "bold" || m.variation === "wordmark"));

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

      {heroMockup && (
        <section className="py-16 px-4 border-t border-border" data-testid="hero-mockup">
          <div className="max-w-3xl mx-auto">
            <Link href="/product/freestyler">
              <div className="aspect-[4/5] sm:aspect-[3/4] md:aspect-[16/10] max-h-[600px] w-full bg-card overflow-hidden cursor-pointer">
                <img
                  src={heroMockup.filePath1024 || heroMockup.filePath640 || ""}
                  alt={heroMockup.altText || "DISTRICT21 Freestyler"}
                  className="w-full h-full object-contain p-6"
                  loading="lazy"
                  data-testid="img-hero-mockup"
                />
              </div>
            </Link>
            <p className="text-center text-xs tracking-[0.2em] text-muted-foreground mt-3 uppercase">
              Freestyler — Drop 001
            </p>
          </div>
        </section>
      )}

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
    </div>
  );
}
