import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, X } from "lucide-react";
import { WaitlistForm } from "@/components/waitlist-form";

interface StickyMobileCTAProps {
  dropState: "pre" | "live" | "post";
  shopUrl?: string | null;
}

export function StickyMobileCTA({ dropState, shopUrl }: StickyMobileCTAProps) {
  const [expanded, setExpanded] = useState(false);

  if (dropState === "live") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background border-t border-border px-4 py-3 safe-area-bottom" data-testid="sticky-cta-live">
        <Button
          asChild
          className="w-full h-12 rounded-none tracking-[0.2em] text-sm font-medium"
        >
          <a href={shopUrl || "#"} target="_blank" rel="noopener noreferrer">
            SHOP DROP 001 <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background border-t border-border safe-area-bottom"
      data-testid="sticky-cta-waitlist"
    >
      {expanded ? (
        <div className="px-4 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs tracking-[0.2em] uppercase font-medium">
              {dropState === "post" ? "Join the next drop" : "Get early access"}
            </p>
            <Button size="icon" variant="ghost" onClick={() => setExpanded(false)} data-testid="button-close-sticky-form">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <WaitlistForm />
          <p className="text-[10px] text-muted-foreground/50 tracking-wide text-center">
            No spam. Drop alerts only.
          </p>
        </div>
      ) : (
        <div className="px-4 py-3">
          <Button
            className="w-full h-12 rounded-none tracking-[0.2em] text-sm font-medium"
            onClick={() => setExpanded(true)}
            data-testid="button-join-waitlist-sticky"
          >
            <span className="flex items-center gap-2">
              JOIN THE WAITLIST <ArrowRight className="w-4 h-4" />
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
