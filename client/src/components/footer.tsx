import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 px-4 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
          DISTRICT21
        </span>
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <Link href="/about" data-testid="link-footer-about">
            <span className="text-xs tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">
              ABOUT
            </span>
          </Link>
          <Link href="/contact" data-testid="link-footer-contact">
            <span className="text-xs tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">
              CONTACT
            </span>
          </Link>
          <Link href="/drop" data-testid="link-footer-drop">
            <span className="text-xs tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">
              DROP
            </span>
          </Link>
        </div>
        <span className="text-xs text-muted-foreground tracking-wide">
          &copy; {new Date().getFullYear()} DISTRICT21
        </span>
      </div>
    </footer>
  );
}
