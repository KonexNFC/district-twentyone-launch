import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initPostHog } from "@/lib/posthog";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Drop from "@/pages/drop";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Product from "@/pages/product";
import AdminPage from "@/pages/admin";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-1 pt-14">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdmin = location === "/admin";

  if (isAdmin) {
    return <AdminPage />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/drop" component={Drop} />
        <Route path="/product/:id" component={Product} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  useEffect(() => {
    initPostHog();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
