import { useQuery } from "@tanstack/react-query";
import { Countdown } from "@/components/countdown";
import { WaitlistForm } from "@/components/waitlist-form";
import { usePageTitle } from "@/hooks/use-page-title";
import type { DropSettings } from "@shared/schema";

const products = [
  { id: "freestyler", name: "Freestyler", type: "Heavyweight Tee", black: "/images/products/freestyler-black.jpg", white: "/images/products/freestyler-white.jpg" },
  { id: "hypster", name: "Hypster", type: "Boxy Tee", black: "/images/products/hypster-black.jpg", white: "/images/products/hypster-white.jpg" },
  { id: "blaker", name: "Blaker", type: "Classic Tee", black: "/images/products/blaker-black.jpg", white: "/images/products/blaker-white.jpg" },
  { id: "blaster2", name: "Blaster 2.0", type: "Oversized Tee", black: "/images/products/blaster2-black.jpg", white: "/images/products/blaster2-white.jpg" },
  { id: "gamechanger", name: "Gamechanger", type: "Heavyweight Hood", black: "/images/products/gamechanger-black.jpg", white: "/images/products/gamechanger-white.jpg" },
  { id: "voicer", name: "Voicer", type: "Relaxed Hood", black: "/images/products/voicer-black.jpg", white: "/images/products/voicer-white.jpg" },
  { id: "ryler", name: "Ryler", type: "Classic Sweatshirt", black: "/images/products/ryler-black.jpg", white: "/images/products/ryler-white.jpg" },
  { id: "thinker", name: "Thinker", type: "Premium Sweatshirt", black: "/images/products/thinker-black.jpg", white: "/images/products/thinker-white.jpg" },
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

      <section className="py-16 px-4 border-t border-border" data-testid="product-lineup">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] tracking-[0.5em] text-muted-foreground uppercase text-center mb-4">
            Drop 001 Preview
          </p>
          <p className="text-xs tracking-[0.2em] text-muted-foreground/60 uppercase text-center mb-12">
            Tees &middot; Hoodies &middot; Sweatshirts
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {products.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center gap-3 group"
                data-testid={`product-card-${item.id}`}
              >
                <div className="aspect-square w-full bg-card overflow-hidden relative">
                  <img
                    src={item.black}
                    alt={`${item.name} - Black`}
                    className="w-full h-full object-contain p-3 absolute inset-0 transition-opacity duration-300 group-hover:opacity-0"
                    loading="lazy"
                    data-testid={`img-product-${item.id}-black`}
                  />
                  <img
                    src={item.white}
                    alt={`${item.name} - White`}
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
