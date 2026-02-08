import { useQuery } from "@tanstack/react-query";
import { Countdown } from "@/components/countdown";
import { WaitlistForm } from "@/components/waitlist-form";
import { usePageTitle } from "@/hooks/use-page-title";
import { Button } from "@/components/ui/button";
import { ExternalLink, Bell } from "lucide-react";
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

export default function Drop() {
  usePageTitle("The Drop | DISTRICT21", "Exclusive limited edition drops from DISTRICT21. Get notified before they sell out.");
  const { data: settings, isLoading } = useQuery<DropSettings>({
    queryKey: ["/api/drop-settings"],
  });

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-6 h-6 border border-foreground/30 border-t-foreground animate-spin rounded-full" />
      </div>
    );
  }

  const isLive = settings?.isLive;
  const dropDate = settings?.dropDate ? new Date(settings.dropDate) : null;
  const isExpired = dropDate && dropDate.getTime() < Date.now() && !isLive;

  return (
    <div className="flex flex-col">
      <section className="flex flex-col items-center justify-center px-4 pt-16">
        <div className="flex flex-col items-center gap-10 w-full max-w-xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-[10px] tracking-[0.5em] text-muted-foreground uppercase">
              {isLive ? "Live Now" : isExpired ? "Drop Ended" : "Drop 001"}
            </span>
            <h1
              className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold tracking-[0.1em]"
              data-testid="text-drop-title"
            >
              THE DROP
            </h1>
            <div className="w-12 h-[1px] bg-foreground/20 mt-2" />
          </div>

          {isLive ? (
            <div className="flex flex-col items-center gap-8 w-full" data-testid="drop-live-state">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
                <span className="text-xs tracking-[0.3em] uppercase font-medium">Drop is live</span>
              </div>

              <p className="text-sm text-muted-foreground text-center max-w-sm leading-relaxed">
                The collection is available now. Limited quantities.
                Every piece is numbered. Once gone, gone forever.
              </p>

              <Button
                asChild
                className="h-12 px-10 rounded-none tracking-[0.2em] text-sm font-medium"
                data-testid="button-shop-now"
              >
                <a
                  href={settings?.shopifyUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  SHOP NOW <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          ) : isExpired ? (
            <div className="flex flex-col items-center gap-8 w-full" data-testid="drop-sold-out-state">
              <p className="text-sm text-muted-foreground text-center max-w-sm leading-relaxed">
                Drop 001 has ended. All pieces have been claimed.
                Sign up below to be notified for the next drop.
              </p>
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                    Join the next drop
                  </p>
                </div>
                <WaitlistForm />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8 w-full" data-testid="drop-pre-state">
              <Countdown targetDate={settings?.dropDate ? String(settings.dropDate) : null} />

              <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                    Get notified when we drop
                  </p>
                </div>
                <WaitlistForm />
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 border-t border-border mt-12" data-testid="drop-products">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] tracking-[0.5em] text-muted-foreground uppercase text-center mb-4">
            The Collection
          </p>
          <p className="text-xs tracking-[0.2em] text-muted-foreground/60 uppercase text-center mb-12">
            8 Pieces &middot; Black &amp; White &middot; Limited Edition
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {products.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center gap-3 group"
                data-testid={`drop-product-${item.id}`}
              >
                <div className="aspect-square w-full bg-card overflow-hidden relative">
                  <img
                    src={item.black}
                    alt={`${item.name} - Black`}
                    className="w-full h-full object-contain p-3 absolute inset-0 transition-opacity duration-300 group-hover:opacity-0"
                    loading="lazy"
                  />
                  <img
                    src={item.white}
                    alt={`${item.name} - White`}
                    className="w-full h-full object-contain p-3 absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    loading="lazy"
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
    </div>
  );
}
