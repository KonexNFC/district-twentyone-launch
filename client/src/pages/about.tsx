import { usePageTitle } from "@/hooks/use-page-title";

export default function About() {
  usePageTitle("About | DISTRICT21", "DISTRICT21 - Born from the intersection of street culture and architectural precision.");
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-12 w-full max-w-lg py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-[10px] tracking-[0.5em] text-muted-foreground uppercase">
            The Movement
          </span>
          <h1
            className="font-mono text-3xl sm:text-4xl font-bold tracking-[0.1em]"
            data-testid="text-about-title"
          >
            ABOUT
          </h1>
          <div className="w-12 h-[1px] bg-foreground/20 mt-2" />
        </div>

        <div className="flex flex-col gap-8 text-center" data-testid="about-content">
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
            DISTRICT21 isn't a brand. It's a statement. Born from the intersection
            of street culture and architectural precision, every piece is designed
            to exist at the edge of convention.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
            We believe in the power of restraint. Black and white.
            No logos. No noise. Just the cut, the fabric, the form.
            Each collection drops once and never returns.
          </p>
          <div className="flex flex-col items-center gap-2 py-4">
            <img
              src="/images/logo-hero.jpeg"
              alt="DISTRICT21 — THE UNIFORM OF NOW"
              className="w-48 h-auto opacity-80"
              data-testid="img-about-logo"
            />
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
            Our mission: the uniform for the present moment. Fast fashion
            redefined through limited drops, premium materials, and zero
            compromise. Designed for men 18-35 who move between
            culture, code, and the street.
          </p>
          <p className="text-xs text-muted-foreground/60 leading-relaxed italic">
            We're committed to responsible production. Every piece is made
            in small batches to minimize waste. No overproduction. No excess.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 w-full pt-4">
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-bold" data-testid="text-stat-pieces">001</span>
            <span className="text-[10px] tracking-[0.3em] text-muted-foreground">COLLECTIONS</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-bold" data-testid="text-stat-drops">LTD</span>
            <span className="text-[10px] tracking-[0.3em] text-muted-foreground">EDITIONS</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-bold" data-testid="text-stat-year">2025</span>
            <span className="text-[10px] tracking-[0.3em] text-muted-foreground">FOUNDED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
