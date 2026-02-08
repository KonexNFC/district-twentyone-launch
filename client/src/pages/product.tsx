import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { usePageTitle } from "@/hooks/use-page-title";
import { WaitlistForm } from "@/components/waitlist-form";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronLeft, Bell } from "lucide-react";
import { Link } from "wouter";
import { SILHOUETTES, TEE_VARIATIONS, HOODIE_SWEAT_VARIATIONS } from "@shared/schema";
import type { DropSettings } from "@shared/schema";

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const silhouette = SILHOUETTES.find(s => s.id === id);

  usePageTitle(
    silhouette ? `${silhouette.name} | DISTRICT21` : "Product | DISTRICT21",
    silhouette ? `DISTRICT21 ${silhouette.name} — ${silhouette.fit}. Limited edition.` : "DISTRICT21 product"
  );

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
  const variations = silhouette.type === "tee" ? TEE_VARIATIONS : HOODIE_SWEAT_VARIATIONS;

  const fallbackBlack = `/images/products/${id}-black.jpg`;
  const fallbackWhite = `/images/products/${id}-white.jpg`;
  const modelBlack = `/images/products/model-black.jpg`;
  const modelWhite = `/images/products/model-white.jpg`;

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
                src={fallbackBlack}
                alt={`DISTRICT21 ${silhouette.name} — ${silhouette.fit}`}
                className="w-full h-full object-contain p-4"
                loading="eager"
              />
            </div>

            <div className="grid grid-cols-4 gap-2" data-testid="pdp-image-gallery">
              <div className="aspect-[4/5] bg-card overflow-hidden cursor-pointer border border-transparent hover:border-foreground/20 transition-colors">
                <img src={fallbackBlack} alt={`${silhouette.name} Black — flat lay`} className="w-full h-full object-contain p-1" loading="lazy" data-testid="pdp-thumb-flatlay-black" />
              </div>
              <div className="aspect-[4/5] bg-card overflow-hidden cursor-pointer border border-transparent hover:border-foreground/20 transition-colors">
                <img src={fallbackWhite} alt={`${silhouette.name} White — flat lay`} className="w-full h-full object-contain p-1" loading="lazy" data-testid="pdp-thumb-flatlay-white" />
              </div>
              <div className="aspect-[4/5] bg-card overflow-hidden cursor-pointer border border-transparent hover:border-foreground/20 transition-colors">
                <img src={modelBlack} alt={`${silhouette.name} Black — on model`} className="w-full h-full object-cover" loading="lazy" data-testid="pdp-thumb-model-black" />
              </div>
              <div className="aspect-[4/5] bg-card overflow-hidden cursor-pointer border border-transparent hover:border-foreground/20 transition-colors">
                <img src={modelWhite} alt={`${silhouette.name} White — on model`} className="w-full h-full object-cover" loading="lazy" data-testid="pdp-thumb-model-white" />
              </div>
            </div>
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
              </ul>
            </div>

            <div className="w-full h-[1px] bg-border" />
            <div className="flex flex-col gap-3">
              <p className="text-xs tracking-[0.15em] text-muted-foreground uppercase">Available Variations</p>
              <div className="flex gap-2 flex-wrap">
                {variations.map((v) => (
                  <span key={v} className="text-xs tracking-[0.1em] border border-border px-3 py-1.5 uppercase" data-testid={`badge-variation-${v}`}>
                    {v === "bold" ? "Bold Chest" : v === "tagline" ? "Reduced + Tagline" : v === "wordmark" ? "Centre Wordmark" : "Left Chest Icon"}
                  </span>
                ))}
              </div>
            </div>

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
