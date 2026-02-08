import { useQuery } from "@tanstack/react-query";
import { Countdown } from "@/components/countdown";
import { WaitlistForm } from "@/components/waitlist-form";
import { usePageTitle } from "@/hooks/use-page-title";
import type { DropSettings } from "@shared/schema";

export default function Home() {
  usePageTitle("DISTRICT21 - THE UNIFORM OF NOW", "Join the DISTRICT21 waitlist. Limited edition fashion drops.");
  const { data: settings } = useQuery<DropSettings>({
    queryKey: ["/api/drop-settings"],
  });

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-10 w-full max-w-xl py-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-[1px] bg-foreground/20" />
          <h1
            className="font-mono text-4xl sm:text-5xl md:text-6xl font-bold tracking-[0.15em] leading-none"
            data-testid="text-brand-name"
          >
            DISTRICT21
          </h1>
          <p
            className="text-xs sm:text-sm tracking-[0.4em] text-muted-foreground font-light uppercase"
            data-testid="text-tagline"
          >
            THE UNIFORM OF NOW
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
    </div>
  );
}
