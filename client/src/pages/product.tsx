import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { usePageTitle } from "@/hooks/use-page-title";
import { WaitlistForm } from "@/components/waitlist-form";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronLeft, Bell } from "lucide-react";
import { Link } from "wouter";
import { SILHOUETTES } from "@shared/schema";
import type { Mockup, DropSettings } from "@shared/schema";

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const silhouette = SILHOUETTES.find(s => s.id === id);

  usePageTitle(
    silhouette ? `${silhouette.name} | DISTRICT21` : "Product | DISTRICT21",
    silhouette ? `DISTRICT21 ${silhouette.name} — ${silhouette.fit}. Limited edition.` : "DISTRICT21 product"
  );

  const { data: mockupList = [], isLoading } = useQuery<Mockup[]>({
    queryKey: ["/api/mockups", id],
  });

  const { data: settings } = useQuery<DropSettings>({
    queryKey: ["/api/drop-settings"],
  });

  if (!silhouette) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-muted-foreground">Product not found</p>
        <Link href="/drop">
          <Button variant="outline" className="rounded-none tracking-[0.15em] text-xs">
            <ChevronLeft className="w-3 h-3 mr-1" /> BACK TO DROP
          </Button>
        </Link>
      </div>
    );
  }

  const isLive = settings?.isLive;
  const hasMockups = mockupList.length > 0;

  const heroMockup = mockupList.find(m => m.color === "black" && (m.variation === "bold" || m.variation === "wordmark"));
  const allVariations = mockupList.reduce<Record<string, Mockup[]>>((acc, m) => {
    const key = `${m.variation}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const fallbackBlack = `/images/products/${id}-black.jpg`;
  const fallbackWhite = `/images/products/${id}-white.jpg`;

  return (
    <div className="flex flex-col">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        <Link href="/drop">
          <Button variant="ghost" size="sm" className="rounded-none tracking-[0.1em] text-xs mb-6" data-testid="button-back-drop">
            <ChevronLeft className="w-3 h-3 mr-1" /> BACK TO DROP
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="flex flex-col gap-4">
            <div className="aspect-[4/5] w-full bg-card overflow-hidden" data-testid="pdp-hero-image">
              <img
                src={heroMockup?.filePath1024 || heroMockup?.filePath640 || fallbackBlack}
                alt={heroMockup?.altText || `DISTRICT21 ${silhouette.name}`}
                className="w-full h-full object-contain p-4"
                loading="eager"
              />
            </div>

            {hasMockups && (
              <div className="grid grid-cols-4 gap-2" data-testid="pdp-image-gallery">
                {mockupList.slice(0, 8).map((m) => (
                  <div key={m.id} className="aspect-[4/5] bg-card overflow-hidden cursor-pointer border border-transparent hover:border-foreground/20 transition-colors">
                    <img
                      src={m.filePath640 || ""}
                      alt={m.altText || ""}
                      className="w-full h-full object-contain p-1"
                      loading="lazy"
                      data-testid={`pdp-thumb-${m.id}`}
                    />
                  </div>
                ))}
              </div>
            )}

            {!hasMockups && (
              <div className="grid grid-cols-2 gap-2">
                <div className="aspect-[4/5] bg-card overflow-hidden">
                  <img src={fallbackBlack} alt={`${silhouette.name} Black`} className="w-full h-full object-contain p-2" loading="lazy" />
                </div>
                <div className="aspect-[4/5] bg-card overflow-hidden">
                  <img src={fallbackWhite} alt={`${silhouette.name} White`} className="w-full h-full object-contain p-2" loading="lazy" />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] tracking-[0.5em] text-muted-foreground uppercase">DISTRICT21</span>
              <h1
                className="font-mono text-2xl sm:text-3xl font-bold tracking-[0.1em] uppercase"
                data-testid="text-product-name"
              >
                {silhouette.name}
              </h1>
              <p className="text-sm text-muted-foreground tracking-[0.1em] capitalize" data-testid="text-product-fit">
                {silhouette.fit}
              </p>
            </div>

            <div className="w-full h-[1px] bg-border" />

            <div className="flex flex-col gap-3">
              <p className="text-xs tracking-[0.15em] text-muted-foreground uppercase">Details</p>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-foreground/40 mt-2 shrink-0" />
                  <span>Premium organic cotton</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-foreground/40 mt-2 shrink-0" />
                  <span>DISTRICT21 branded — limited edition</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-foreground/40 mt-2 shrink-0" />
                  <span>Available in black &amp; white</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-foreground/40 mt-2 shrink-0" />
                  <span>Each piece individually numbered</span>
                </li>
                {silhouette.type === "tee" && (
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-foreground/40 mt-2 shrink-0" />
                    <span>{silhouette.fit === "oversized tee" ? "Oversized" : silhouette.fit === "boxy tee" ? "Boxy" : "Classic"} fit</span>
                  </li>
                )}
                {(silhouette.type === "hoodie" || silhouette.type === "sweatshirt") && (
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-foreground/40 mt-2 shrink-0" />
                    <span>Brushed fleece interior</span>
                  </li>
                )}
                {silhouette.type === "hat" && (
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-foreground/40 mt-2 shrink-0" />
                    <span>Structured six-panel cap</span>
                  </li>
                )}
              </ul>
            </div>

            {hasMockups && Object.keys(allVariations).length > 0 && (
              <>
                <div className="w-full h-[1px] bg-border" />
                <div className="flex flex-col gap-3">
                  <p className="text-xs tracking-[0.15em] text-muted-foreground uppercase">Available Variations</p>
                  <div className="flex gap-2 flex-wrap">
                    {Object.keys(allVariations).map((v) => (
                      <span key={v} className="text-xs tracking-[0.1em] border border-border px-3 py-1.5 uppercase" data-testid={`badge-variation-${v}`}>
                        {v === "bold" ? "Bold Chest" : v === "tagline" ? "Reduced + Tagline" : v === "wordmark" ? "Centre Wordmark" : "Left Chest Icon"}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="w-full h-[1px] bg-border" />

            {isLive ? (
              <Button
                asChild
                className="h-12 rounded-none tracking-[0.2em] text-sm font-medium w-full"
                data-testid="button-shop-product"
              >
                <a href={settings?.shopifyUrl || "#"} target="_blank" rel="noopener noreferrer">
                  SHOP NOW <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                    Get notified when available
                  </p>
                </div>
                <WaitlistForm />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
