import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { WaitlistForm } from "@/components/waitlist-form";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronLeft, Bell, Check } from "lucide-react";
import { Link } from "wouter";
import type { CatalogDesign, DropSettings } from "@shared/schema";

export default function Product() {
  const { handle } = useParams<{ handle: string }>();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const { data: design, isLoading } = useQuery<CatalogDesign>({
    queryKey: ["/api/catalog", handle],
  });

  const { data: settings } = useQuery<DropSettings>({
    queryKey: ["/api/drop-settings"],
  });

  usePageTitle(
    design ? `District21 ${design.title} | DISTRICT21` : "Product | DISTRICT21",
    design ? `District21 ${design.title} — ${design.fit}. Limited edition.` : "DISTRICT21 product"
  );

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-6 h-6 border border-foreground/30 border-t-foreground animate-spin rounded-full" />
      </div>
    );
  }

  if (!design) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-muted-foreground">Product not found</p>
        <Link href="/drop">
          <Button variant="outline" className="rounded-none tracking-[0.15em] text-xs" data-testid="button-back-drop">
            <ChevronLeft className="w-3 h-3 mr-1" /> BACK TO DROP
          </Button>
        </Link>
      </div>
    );
  }

  const isLive = settings?.isLive;
  const activeColor = design.colors[selectedColorIndex] || design.colors[0];
  const activeImages = activeColor?.images || [];
  const heroImage = activeImages[selectedImageIndex] || activeImages[0];

  const colorSwatchMap: Record<string, string> = {
    black: "bg-black",
    white: "bg-white border border-border",
    gray: "bg-gray-400",
    grey: "bg-gray-400",
  };

  function handleColorChange(index: number) {
    setSelectedColorIndex(index);
    setSelectedImageIndex(0);
    setSelectedSize(null);
  }

  const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
  const sortedSizes = activeColor?.sizes
    ? [...activeColor.sizes].sort((a, b) => {
        const cleanA = a.size.replace(/^.*\/\s*/, "").replace(/^.*\/\s*/, "").trim();
        const cleanB = b.size.replace(/^.*\/\s*/, "").replace(/^.*\/\s*/, "").trim();
        const ai = sizeOrder.indexOf(cleanA);
        const bi = sizeOrder.indexOf(cleanB);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      })
    : [];

  function extractSize(sizeStr: string): string {
    const parts = sizeStr.split("/").map(s => s.trim());
    const sizePart = parts.find(p => sizeOrder.includes(p));
    return sizePart || parts[parts.length - 1] || sizeStr;
  }

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
              {heroImage && (
                <img
                  src={heroImage.src}
                  alt={heroImage.alt}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              )}
            </div>

            {activeImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2" data-testid="pdp-image-gallery">
                {activeImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`aspect-[4/5] bg-card overflow-hidden cursor-pointer border transition-colors ${
                      i === selectedImageIndex ? "border-foreground" : "border-transparent hover:border-foreground/20"
                    }`}
                    data-testid={`pdp-thumb-${i}`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
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
                {design.title}
              </h1>
              <p className="text-sm text-muted-foreground tracking-[0.1em] capitalize" data-testid="text-product-fit">
                {design.fit}
              </p>
              <p className="text-lg font-medium tracking-[0.05em] mt-1" data-testid="text-product-price">
                £{activeColor?.price}
              </p>
            </div>

            <div className="w-full h-[1px] bg-border" />

            {design.colors.length > 1 && (
              <div className="flex flex-col gap-3">
                <p className="text-xs tracking-[0.15em] text-muted-foreground uppercase">
                  Colour — <span className="capitalize">{activeColor?.color}</span>
                </p>
                <div className="flex gap-3" data-testid="pdp-color-selector">
                  {design.colors.map((colorVariant, i) => (
                    <button
                      key={colorVariant.color}
                      onClick={() => handleColorChange(i)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        colorSwatchMap[colorVariant.color] || "bg-gray-300"
                      } ${
                        i === selectedColorIndex
                          ? "ring-2 ring-offset-2 ring-foreground"
                          : "hover:ring-1 hover:ring-offset-1 hover:ring-foreground/50"
                      }`}
                      data-testid={`pdp-color-${colorVariant.color}`}
                      title={colorVariant.color}
                    >
                      {i === selectedColorIndex && (
                        <Check className={`w-4 h-4 ${colorVariant.color === "black" ? "text-white" : "text-black"}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <p className="text-xs tracking-[0.15em] text-muted-foreground uppercase">Select Size</p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2" data-testid="pdp-size-selector">
                {sortedSizes.map((sizeVariant) => {
                  const displaySize = extractSize(sizeVariant.size);
                  const isSelected = selectedSize === sizeVariant.size;
                  return (
                    <button
                      key={sizeVariant.variantId}
                      onClick={() => sizeVariant.available ? setSelectedSize(sizeVariant.size) : null}
                      disabled={!sizeVariant.available}
                      className={`py-2.5 px-2 text-xs tracking-[0.1em] uppercase border transition-colors ${
                        isSelected
                          ? "border-foreground bg-foreground text-background"
                          : sizeVariant.available
                            ? "border-border hover:border-foreground"
                            : "border-border/30 text-muted-foreground/30 cursor-not-allowed line-through"
                      }`}
                      data-testid={`pdp-size-${displaySize}`}
                    >
                      {displaySize}
                    </button>
                  );
                })}
              </div>
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
                  <span>Available in {design.colors.map(c => c.color).join(" & ")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-foreground/40 mt-2 shrink-0" />
                  <span>Each piece individually numbered</span>
                </li>
                {design.type === "tee" && (
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-foreground/40 mt-2 shrink-0" />
                    <span>{design.fit === "oversized tee" ? "Oversized" : design.fit === "boxy tee" ? "Boxy" : "Classic"} fit</span>
                  </li>
                )}
                {(design.type === "hoodie" || design.type === "sweatshirt") && (
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-foreground/40 mt-2 shrink-0" />
                    <span>Brushed fleece interior</span>
                  </li>
                )}
                {design.type === "hat" && (
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-foreground/40 mt-2 shrink-0" />
                    <span>Structured six-panel cap</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="w-full h-[1px] bg-border" />

            {isLive ? (
              (() => {
                const selectedSizeVariant = selectedSize
                  ? activeColor?.sizes.find(s => s.size === selectedSize)
                  : null;
                const shopUrl = selectedSizeVariant
                  ? `${activeColor?.shopifyUrl}?variant=${selectedSizeVariant.variantId}`
                  : activeColor?.shopifyUrl || settings?.shopifyUrl || "#";
                return (
                  <div className="flex flex-col gap-2">
                    {!selectedSize && (
                      <p className="text-xs text-muted-foreground/60 tracking-[0.1em]">Please select a size</p>
                    )}
                    <Button
                      asChild
                      className={`h-12 rounded-none tracking-[0.2em] text-sm font-medium w-full ${!selectedSize ? "opacity-60" : ""}`}
                      data-testid="button-add-to-bag"
                    >
                      <a href={shopUrl} target="_blank" rel="noopener noreferrer">
                        ADD TO BAG <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                );
              })()
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
