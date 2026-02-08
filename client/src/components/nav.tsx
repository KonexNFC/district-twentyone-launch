import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "HOME", href: "/" },
  { label: "DROP", href: "/drop" },
  { label: "ABOUT", href: "/about" },
  { label: "CONTACT", href: "/contact" },
];

export function Nav() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" data-testid="link-home-logo">
          <span className="font-mono text-lg font-bold tracking-[0.3em]">DISTRICT21</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} data-testid={`link-nav-${item.label.toLowerCase()}`}>
              <span
                className={`text-xs tracking-[0.2em] font-medium transition-opacity ${
                  location === item.href ? "opacity-100" : "opacity-50 hover:opacity-80"
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="md:hidden"
          onClick={() => setOpen(!open)}
          data-testid="button-mobile-menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="flex flex-col py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                data-testid={`link-mobile-nav-${item.label.toLowerCase()}`}
              >
                <span
                  className={`block px-6 py-3 text-sm tracking-[0.2em] font-medium transition-opacity ${
                    location === item.href ? "opacity-100" : "opacity-50"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
