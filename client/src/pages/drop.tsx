import { useQuery } from "@tanstack/react-query";
import { Countdown } from "@/components/countdown";
import { WaitlistForm } from "@/components/waitlist-form";
import { usePageTitle } from "@/hooks/use-page-title";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import type { DropSettings } from "@shared/schema";

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

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-10 w-full max-w-xl py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-[10px] tracking-[0.5em] text-muted-foreground uppercase">
            {isLive ? "Live Now" : "Upcoming"}
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
        ) : (
          <div className="flex flex-col items-center gap-10 w-full" data-testid="drop-pre-state">
            <Countdown targetDate={settings?.dropDate ? String(settings.dropDate) : null} />

            <div className="flex flex-col items-center gap-4 w-full">
              <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase text-center">
                Get notified when we drop
              </p>
              <WaitlistForm />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
